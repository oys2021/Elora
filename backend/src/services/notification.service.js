import { Op, UniqueConstraintError } from 'sequelize';
import { Notification, User, Order, OrderItem, ProductVariant, Product, DeliveryZone } from '../models/index.js';
import logger from '../utils/logger.js';
import { sendEmail, escapeHtml } from './email.service.js';

// Bell notifications + emails for things customers and the store should hear
// about. Everything here is best-effort: a failed email must never fail an
// order or a payment, so callers fire and forget (errors are logged).

const frontendUrl = () => (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
const money = (n) => `GHS ${Number(n).toFixed(2)}`;
const shortId = (id) => id.slice(0, 8).toUpperCase();

const PAYMENT_LABELS = { CASH: 'Cash', MOBILE_MONEY: 'Mobile Money', CARD: 'Card', MTN: 'MTN MoMo', TELECEL: 'Telecel Cash', AIRTELTIGO: 'AirtelTigo Money' };

// Where store alerts go: STORE_EMAIL if set (comma-separated is fine),
// otherwise every admin account's email.
async function storeRecipients() {
  if (process.env.STORE_EMAIL) {
    return process.env.STORE_EMAIL.split(',').map((e) => e.trim()).filter(Boolean);
  }
  const admins = await User.findAll({ where: { isAdmin: true, email: { [Op.ne]: null } }, attributes: ['email'] });
  return admins.map((a) => a.email);
}

// Creates a notification unless one with this dedupeKey already exists.
// Returns true only for the call that actually created it.
async function createOnce(fields) {
  try {
    await Notification.create(fields);
    return true;
  } catch (err) {
    if (err instanceof UniqueConstraintError) return false;
    throw err;
  }
}

const loadOrder = (orderId) =>
  Order.findByPk(orderId, {
    include: [{ model: OrderItem, include: [{ model: ProductVariant, include: [Product] }] }, { model: DeliveryZone }],
  });

function itemsTable(order) {
  const rows = order.OrderItems.map((item) => {
    const v = item.ProductVariant;
    const options = [v?.lengthOption, v?.densityOption, v?.colorOption].filter(Boolean).join(' / ');
    return `<tr>
      <td style="padding:6px 0">${escapeHtml(v?.Product?.name ?? 'Item')}${options ? `<br><span style="color:#888;font-size:12px">${escapeHtml(options)}</span>` : ''}</td>
      <td style="padding:6px 8px;text-align:center">× ${item.quantity}</td>
      <td style="padding:6px 0;text-align:right">${money(item.unitPrice * item.quantity)}</td>
    </tr>`;
  }).join('');
  const delivery =
    order.fulfillmentMethod === 'DELIVERY'
      ? `Delivery${order.DeliveryZone ? ` (${escapeHtml(order.DeliveryZone.location)})` : ''}`
      : 'Pick up at our store';
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">${rows}
    <tr><td style="padding:6px 0;color:#666">${delivery}</td><td></td><td style="text-align:right;color:#666">${order.fulfillmentMethod === 'DELIVERY' ? money(order.deliveryFee) : 'Free'}</td></tr>
    <tr><td style="padding:8px 0;font-weight:bold;border-top:1px solid #eee">Total</td><td style="border-top:1px solid #eee"></td><td style="padding:8px 0;text-align:right;font-weight:bold;border-top:1px solid #eee">${money(order.totalAmount)}</td></tr>
  </table>`;
}

const textItems = (order) =>
  order.OrderItems.map((i) => `- ${i.ProductVariant?.Product?.name ?? 'Item'} x${i.quantity}: ${money(i.unitPrice * i.quantity)}`).join('\n') +
  `\nTotal: ${money(order.totalAmount)}`;

const layout = (inner) => `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#222">
  <h2 style="font-family:Georgia,serif;font-weight:normal;margin-bottom:4px">Elora</h2>${inner}
  <p style="color:#999;font-size:12px;margin-top:24px">Elora Hair &amp; Skin · 14 Street, Dome Pillar 2, Accra</p></div>`;

// event: 'PLACED' (a cash order was placed) or 'PAID' (an online payment was confirmed).
// Safe to call more than once for the same order+event: only the first call
// notifies anyone.
export async function notifyOrderEvent(orderId, event) {
  const order = await loadOrder(orderId);
  if (!order) return;

  const ref = shortId(order.id);
  const paid = event === 'PAID';
  const howToPay =
    paid ? `Paid via ${PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}`
      : order.fulfillmentMethod === 'DELIVERY' ? 'Pay on delivery' : 'Pay when you pick it up';

  // The store's notification doubles as the "has this event been handled?" lock.
  const first = await createOnce({
    audience: 'ADMIN',
    type: paid ? 'ORDER_PAID' : 'ORDER_PLACED',
    title: paid ? `Order #${ref} paid — ${money(order.totalAmount)}` : `New order #${ref} — ${money(order.totalAmount)}`,
    body: `${order.customerName} · ${order.fulfillmentMethod === 'DELIVERY' ? 'Delivery' : 'Pick up'} · ${howToPay}`,
    link: '/admin/orders',
    dedupeKey: `order:${order.id}:${event}:admin`,
  });
  if (!first) return;

  if (order.userId) {
    await createOnce({
      audience: 'CUSTOMER',
      userId: order.userId,
      type: paid ? 'ORDER_PAID' : 'ORDER_PLACED',
      title: paid ? `Payment received for order #${ref}` : `Order #${ref} received`,
      body: paid ? `Thanks! We're preparing your order.` : `${howToPay}. We'll let you know when it's ready.`,
      link: '/orders',
      dedupeKey: `order:${order.id}:${event}:customer`,
    });
  }

  const customerSubject = paid ? `Payment received — Elora order #${ref}` : `We've received your Elora order #${ref}`;
  const sends = [
    sendEmail({
      to: order.customerEmail,
      subject: customerSubject,
      text: `Hi ${order.customerName},\n\n${paid ? 'Thanks for your payment' : 'Thanks for your order'} (#${ref}).\n${howToPay}.\n\n${textItems(order)}\n\nTrack it at ${frontendUrl()}/orders`,
      html: layout(`
        <p>Hi ${escapeHtml(order.customerName)},</p>
        <p>${paid ? 'Thanks for your payment' : 'Thanks for your order'} <strong>#${ref}</strong>. ${escapeHtml(howToPay)}.</p>
        ${itemsTable(order)}
        <p>We'll contact you on ${escapeHtml(order.customerPhone)} once it's ready.</p>
        <p><a href="${frontendUrl()}/orders" style="color:#b56b82">View your orders</a></p>`),
    }),
  ];

  const store = await storeRecipients();
  if (store.length) {
    sends.push(
      sendEmail({
        to: store,
        replyTo: order.customerEmail,
        subject: paid ? `💰 Order #${ref} paid — ${money(order.totalAmount)}` : `🛍️ New order #${ref} — ${money(order.totalAmount)}`,
        text: `${order.customerName} (${order.customerEmail}, ${order.customerPhone})\n${howToPay}\n\n${textItems(order)}\n\n${frontendUrl()}/admin/orders`,
        html: layout(`
          <p><strong>${escapeHtml(order.customerName)}</strong><br>${escapeHtml(order.customerEmail)} · ${escapeHtml(order.customerPhone)}</p>
          <p>${escapeHtml(howToPay)}${order.fulfillmentMethod === 'DELIVERY' && order.deliveryAddress ? `<br>Deliver to: ${escapeHtml(order.deliveryAddress)}` : ''}</p>
          ${itemsTable(order)}
          <p><a href="${frontendUrl()}/admin/orders" style="color:#b56b82">Open in admin</a></p>`),
      })
    );
  }

  const results = await Promise.allSettled(sends);
  for (const r of results) {
    if (r.status === 'rejected') logger.error({ err: r.reason, orderId: order.id, event }, 'Order email failed to send');
  }
}

// Fire-and-forget wrapper for callers that must not wait on (or fail because of) email.
export function notifyOrderEventInBackground(orderId, event) {
  notifyOrderEvent(orderId, event).catch((err) => logger.error({ err, orderId, event }, 'Order notification failed'));
}

export async function notifyContactMessage(contact) {
  await createOnce({
    audience: 'ADMIN',
    type: 'CONTACT_MESSAGE',
    title: `New message: ${contact.subject}`,
    body: `${contact.name} (${contact.email})`,
    link: null,
    dedupeKey: `contact:${contact.id}`,
  });

  const store = await storeRecipients();
  const sends = [
    sendEmail({
      to: contact.email,
      subject: `We got your message — Elora`,
      text: `Hi ${contact.name},\n\nThanks for getting in touch. We've received your message about "${contact.subject}" and will reply within 1–2 working days.\n\nElora`,
      html: layout(`
        <p>Hi ${escapeHtml(contact.name)},</p>
        <p>Thanks for getting in touch. We've received your message about <strong>${escapeHtml(contact.subject)}</strong> and will reply within 1–2 working days.</p>`),
    }),
  ];
  if (store.length) {
    sends.push(
      sendEmail({
        to: store,
        replyTo: contact.email, // just hit Reply to answer the customer
        subject: `✉️ Contact form: ${contact.subject}`,
        text: `From: ${contact.name} <${contact.email}>\n\n${contact.message}`,
        html: layout(`
          <p><strong>${escapeHtml(contact.name)}</strong> &lt;${escapeHtml(contact.email)}&gt;</p>
          <p><strong>${escapeHtml(contact.subject)}</strong></p>
          <p style="white-space:pre-wrap">${escapeHtml(contact.message)}</p>
          <p style="color:#888;font-size:12px">Reply to this email to answer them directly.</p>`),
      })
    );
  }
  const results = await Promise.allSettled(sends);
  for (const r of results) {
    if (r.status === 'rejected') logger.error({ err: r.reason, contactId: contact.id }, 'Contact email failed to send');
  }
}

// ---- Bell API helpers ----

const scopeFor = ({ audience, userId }) =>
  audience === 'ADMIN' ? { audience: 'ADMIN' } : { audience: 'CUSTOMER', userId };

export const listNotifications = (scope, limit = 20) =>
  Notification.findAll({ where: scopeFor(scope), order: [['createdAt', 'DESC']], limit });

export const countUnread = (scope) => Notification.count({ where: { ...scopeFor(scope), readAt: null } });

export const markRead = (scope, id) =>
  Notification.update({ readAt: new Date() }, { where: { ...scopeFor(scope), id, readAt: null } });

export const markAllRead = (scope) =>
  Notification.update({ readAt: new Date() }, { where: { ...scopeFor(scope), readAt: null } });
