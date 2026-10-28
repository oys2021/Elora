import { z } from 'zod';
import { sendData } from '../utils/ApiResponse.js';
import AppError from '../utils/AppError.js';
import { createAttemptLimiter } from '../utils/attemptLimiter.js';
import { ContactMessage } from '../models/index.js';
import { notifyContactMessage } from '../services/notification.service.js';

const contactSchema = z.object({
  name: z.string({ error: 'Name is required' }).trim().min(1, 'Name is required').max(120),
  email: z.string({ error: 'Email is required' }).trim().pipe(z.email('Enter a valid email address')),
  subject: z.string({ error: 'Subject is required' }).trim().min(1, 'Subject is required').max(150),
  message: z.string({ error: 'Message is required' }).trim().min(5, 'Message is too short').max(5000),
});

// Every message also emails the customer, so cap how often one IP can send
// (stops the form being used to spam inboxes).
const perIp = createAttemptLimiter({ max: 5, windowMs: 60 * 60 * 1000 });

// POST /contact
export const sendContactMessage = async (req, res, next) => {
  try {
    if (perIp.isBlocked(req.ip)) {
      throw new AppError('You have sent several messages already. Please try again a little later.', 429, 'TOO_MANY_MESSAGES');
    }
    const parsed = contactSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      const details = {};
      for (const issue of parsed.error.issues) details[String(issue.path[0] ?? 'form')] ??= issue.message;
      throw new AppError('Please check the highlighted fields', 400, 'VALIDATION_ERROR', details);
    }

    perIp.fail(req.ip); // counts sends, not failures
    // Saved first: even if email has a bad day, the message isn't lost.
    const contact = await ContactMessage.create({ ...parsed.data, userId: req.user?.id ?? null });
    notifyContactMessage(contact).catch((err) => req.log.error({ err, contactId: contact.id }, 'Contact notification failed'));

    sendData(res, { received: true }, 201);
  } catch (err) {
    next(err);
  }
};
