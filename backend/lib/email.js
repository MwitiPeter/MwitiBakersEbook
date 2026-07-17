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
    // Timeout settings to avoid hanging for too long
    connectionTimeout: 5000,  // 5 seconds to establish connection
    greetingTimeout: 5000,    // 5 seconds for SMTP greeting
    socketTimeout: 10000,     // 10 seconds for socket operations
  });

  return transporter;
};

const sendVerificationCode = async (email, name, code, purpose = 'verify') => {
  const transport = getTransporter();

  // If no Gmail credentials are configured, log the code to console
  if (!transport) {
    console.log(`\n📧 ${purpose === 'reset' ? 'Password reset' : 'Verification'} code for ${email}: ${code} (not sent — GMAIL_USER / GMAIL_APP_PASSWORD not set)`);
    console.log(`   Set GMAIL_USER and GMAIL_APP_PASSWORD in your env to enable email delivery.`);
    console.log(`   To get a Gmail App Password: https://myaccount.google.com/apppasswords\n`);
    return { sent: false };
  }

  const isReset = purpose === 'reset';
  const subject = isReset
    ? 'Reset your Mwiti Bakers password'
    : 'Verify your Mwiti Bakers account';

  const heading = isReset ? 'Reset Your Password' : 'Verify Your Email';
  const intro = isReset
    ? 'We received a request to reset your password. Use the code below to set a new password.'
    : 'Welcome to Mwiti Bakers! Please use the verification code below to activate your account.';
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
            <p style="color: #666; line-height: 1.6;">
              ${intro}
            </p>
            <div style="background: white; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
              <div style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #0b356d;">
                ${code}
              </div>
            </div>
            <p style="color: #999; font-size: 12px; line-height: 1.4;">
              This code expires in 30 minutes. ${footerNote}
            </p>
            <div style="background: #fef3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 12px; margin-top: 16px; font-size: 12px; color: #856404;">
              <strong>📌 Didn't receive the code?</strong> Please check your <strong>Spam</strong> or <strong>Promotions</strong> folder
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
    console.log(`\n📧 ${isReset ? 'Password reset' : 'Verification'} code for ${email}: ${code} (sending failed)`);
    return { sent: false };
  }
};

module.exports = { sendVerificationCode };
