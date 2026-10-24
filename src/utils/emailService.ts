import nodemailer from 'nodemailer';

const emailUser = process.env.EMAIL_USER;
const emailAppPassword = process.env.EMAIL_APP_PASSWORD;

if (!emailUser || !emailAppPassword) {
  throw new Error('EMAIL_USER and EMAIL_APP_PASSWORD must be configured');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailAppPassword,
  },
});

export async function sendVerificationEmail(
  to: string,
  verificationUrl: string
): Promise<void> {
  await transporter.sendMail({
    from: `"User Registration System" <${emailUser}>`,
    to,
    subject: 'Verify your email address',
    text: `Open this link to verify your email: ${verificationUrl}`,
    html: `
      <h2>Email verification</h2>
      <p>Click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify email</a>
      <p>This link expires in 15 minutes.</p>
    `,
  });
}
