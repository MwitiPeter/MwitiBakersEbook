const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;

  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
  });

  return transporter;
};

/**
 * Send an email with a verification link.
 * @param {string} email - Recipient email
 * @param {string} name - Recipient name
 * @param {string} link - Full verification link (e.g. https://site.com/verify-email?token=xxx)
 * @param {'verify'|'reset'} purpose - Email purpose
 */
const sendAuthLink = async (email, name, link, purpose = 'verify') => {
  const transport = getTransporter();
  const isReset = purpose === 'reset';

  // If no Gmail credentials are configured, log the token to console
  if (!transport) {
    const token = new URL(link).searchParams.get('token');
    console.log(`\n📧 ${isReset ? 'Password reset' : 'Verification'} link for ${email}: ${link}`);
    console.log(`   Raw token: ${token}`);
    console.log(`   Set GMAIL_USER and GMAIL_APP_PASSWORD in your env to enable email delivery.`);
    console.log(`   To get a Gmail App Password: https://myaccount.google.com/apppasswords\n`);
    return { sent: false };
  }

  const subject = isReset
    ? 'Reset your Mwiti Bakers password'
    : 'Verify your Mwiti Bakers account';

  const heading = isReset ? 'Reset Your Password' : 'Verify Your Email';
  const intro = isReset
    ? 'We received a request to reset your password. Click the button below to set a new password.'
    : 'Welcome to Mwiti Bakers! Please click the button below to activate your account.';
  const buttonText = isReset ? 'Reset Password' : 'Verify Email';
  const footerNote = isReset
    ? "If you didn't request a password reset, you can safely ignore this email."
    : "If you didn't create an account, you can safely ignore this email.";

  try {
    const info = await transport.sendMail({
      from: `"Mwiti Bakers" <${process.env.GMAIL_USER}>`,
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <div style="text-align: center; padding: 30px 0;">
            <div style="font-size: 48px;">🧁</div>
            <h1 style="color: #0b356d; margin: 10px 0 5px;">Mwiti Bakers</h1>
            <p style="color: #c89b5a; font-size: 14px; margin: 0;">Home of Sweetness</p>
          </div>
          <div style="background: #f7f5f0; border-radius: 16px; padding: 30px;">
            <h2 style="color: #0b356d; margin-top: 0;">${heading}</h2>
            <p style="color: #666; line-height: 1.6;">Hi ${name},</p>
            <p style="color: #666; line-height: 1.6;">${intro}</p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${link}"
                 style="display: inline-block; background: #0b356d; color: white; padding: 14px 36px;
                        border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold;">
                ${buttonText}
              </a>
            </div>
            <p style="color: #999; font-size: 12px; line-height: 1.4;">
              This link expires in ${isReset ? '1 hour' : '24 hours'}. ${footerNote}
            </p>
            <p style="color: #999; font-size: 12px; line-height: 1.4;">
              If the button doesn't work, copy and paste this URL into your browser:<br />
              <span style="color: #0b356d; word-break: break-all;">${link}</span>
            </p>
            <div style="background: #fef3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 12px; margin-top: 16px; font-size: 12px; color: #856404;">
              <strong>📌 Didn't receive the email?</strong> Please check your <strong>Spam</strong> or <strong>Promotions</strong> folder
              and mark us as "Not Spam" to ensure future emails reach your inbox.
            </div>
          </div>
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            &copy; ${new Date().getFullYear()} Mwiti Bakers. All rights reserved.
          </div>
        </div>
      `,
    });

    console.log(`Email sent to ${email} (messageId: ${info.messageId})`);
    return { sent: true };
  } catch (err) {
    console.error('Failed to send email:', err);
    console.log(`\n📧 ${isReset ? 'Password reset' : 'Verification'} link for ${email}: ${link} (sending failed)`);
    return { sent: false };
  }
};

module.exports = { sendAuthLink };
