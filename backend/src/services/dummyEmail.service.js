// Stand-in for a real email provider (SendGrid, Resend, Mailgun, SMTP, ...).
// No email actually sends — the "message" is just logged to the server
// console. Mirrors dummyPayment.service.js: swap this one file out once a
// real provider is wired up, nothing else needs to change.
//
// In development this means the password-reset link is only visible to
// whoever can read the backend's terminal output (i.e. you), which keeps the
// same "only the account holder can reset the password" property a real
// inbox would give you. Never expose the token/link in an API response.
export async function sendPasswordResetEmail({ to, resetUrl }) {
  console.log('\n--- Password reset email (dummy — no real email was sent) ---');
  console.log(`To:      ${to}`);
  console.log(`Subject: Reset your Elora password`);
  console.log(`Link:    ${resetUrl}`);
  console.log('This link expires in 1 hour.');
  console.log('---------------------------------------------------------\n');
}
