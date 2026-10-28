import nodemailer from 'nodemailer';
import { Resend } from 'resend';

// Real email for password resets, in order of preference:
//
//   1. Resend (RESEND_API_KEY) — sent over HTTPS, not SMTP. Preferred: this
//      environment's outbound SMTP (port 587/465) gets silently killed by a
//      network-level block, which Resend's HTTP API sidesteps entirely. Most
//      hosting platforms (Vercel, some Heroku/Render tiers, Lambda) block raw
//      SMTP the same way, so this is also the safer choice in production.
//   2. SMTP (SMTP_HOST/SMTP_USER/SMTP_PASS) — kept as a fallback for hosts
//      that don't block it, or other providers you'd rather use over SMTP.
//   3. Ethereal — a throwaway test inbox Nodemailer creates automatically.
//      Mail genuinely sends over SMTP, just to nobody; the console prints a
//      link to preview it. Dev-only — see the production guard below.
const { RESEND_API_KEY, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE, NODE_ENV } = process.env;

if (!RESEND_API_KEY && !SMTP_HOST && NODE_ENV === 'production') {
  // Falling back to Ethereal in production would mean password resets look
  // like they worked but silently go nowhere, with no error anywhere. Fail
  // loudly instead, so a missing/misconfigured .env is caught immediately.
  throw new Error(
    'Neither RESEND_API_KEY nor SMTP_HOST/SMTP_USER/SMTP_PASS are set in production. Real customers cannot receive password reset emails.'
  );
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

let transporterPromise;
function getSmtpTransporter() {
  if (transporterPromise) return transporterPromise;

  transporterPromise =
    SMTP_HOST && SMTP_USER && SMTP_PASS
      ? Promise.resolve(
          nodemailer.createTransport({
            host: SMTP_HOST,
            port: Number(SMTP_PORT) || 587,
            secure: SMTP_SECURE === 'true', // true for port 465, false for 587/25
            auth: { user: SMTP_USER, pass: SMTP_PASS },
          })
        )
      : nodemailer.createTestAccount().then((testAccount) =>
          nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass },
          })
        );

  return transporterPromise;
}

// Resend's shared sandbox sender — works immediately on any account, with no
// domain setup. Once you verify your own domain with Resend, set EMAIL_FROM
// to an address on it (e.g. "Elora <no-reply@yourdomain.com>") and use that
// instead; Resend rejects unverified custom domains.
const FROM = process.env.EMAIL_FROM || 'Elora <onboarding@resend.dev>';

// Escapes customer-typed text before it goes into email HTML, so a name or
// message can't inject links or markup into mail we send.
export const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Every email goes through here. `to` may be one address or a list.
export async function sendEmail({ to, subject, text, html, replyTo }) {
  if (resend) {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, text, html, replyTo });
    if (error) throw new Error(`Resend failed to send: ${error.message || JSON.stringify(error)}`);
    console.log(`Email "${subject}" sent via Resend to ${to} (id: ${data?.id})`);
    return;
  }

  const transporter = await getSmtpTransporter();
  const info = await transporter.sendMail({ from: FROM, to, subject, text, html, replyTo });

  // Only set when sent through the Ethereal fallback — there's no real inbox
  // to check, so this link is the only way to see what was sent.
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log('\n--- Email sent via Ethereal (no real inbox — preview it here) ---');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Preview: ${previewUrl}`);
    console.log('------------------------------------------------------------------\n');
  }
}

// Checks the SMTP login works without sending anything (Resend has no
// equivalent; it's checked on first send).
export async function verifyEmailTransport() {
  if (resend) return 'resend';
  const transporter = await getSmtpTransporter();
  await transporter.verify();
  return SMTP_HOST ? 'smtp' : 'ethereal';
}

export async function sendPasswordResetEmail({ to, resetUrl }) {
  await sendEmail({
    to,
    subject: 'Reset your Elora password',
    text: `We received a request to reset your Elora password.\n\nReset it here: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.`,
    html: `
      <p>We received a request to reset your Elora password.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p style="color:#666;font-size:13px">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
    `,
  });
}
