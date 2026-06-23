const { Resend } = require('resend');

let resendClient = null;

const getResend = () => {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

const sendVerificationCode = async (email, name, code) => {
  const client = getResend();

  // If no Resend client is configured, throw a clear error
  if (!client) {
    const errorMsg =
      'Email service not configured. Please set the RESEND_API_KEY environment variable. ' +
      'Get a free API key at https://resend.com/api-keys';
    console.error(`\n⚠️  ${errorMsg}`);
    console.error(`   Code was NOT sent to ${email} (code: ${code})`);
    console.error(`   Set RESEND_API_KEY in your .env or Render env vars to enable email delivery.\n`);
    throw new Error(errorMsg);
  }

  try {
    // Use the configured FROM_EMAIL or fall back to Resend's default verified sender
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

    const { data, error } = await client.emails.send({
      from: `Mwiti Bakers <${fromEmail}>`,
      to: email,
      subject: 'Verify your Mwiti Bakers account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <div style="text-align: center; padding: 30px 0;">
            <div style="font-size: 48px;">🧁</div>
            <h1 style="color: #0b356d; margin: 10px 0 5px;">Mwiti Bakers</h1>
            <p style="color: #c89b5a; font-size: 14px; margin: 0;">Home of Sweetness</p>
          </div>
          <div style="background: #f7f5f0; border-radius: 16px; padding: 30px;">
            <h2 style="color: #0b356d; margin-top: 0;">Verify Your Email</h2>
            <p style="color: #666; line-height: 1.6;">Hi ${name},</p>
            <p style="color: #666; line-height: 1.6;">
              Welcome to Mwiti Bakers! Please use the verification code below to activate your account.
            </p>
            <div style="background: white; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
              <div style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #0b356d;">
                ${code}
              </div>
            </div>
            <p style="color: #999; font-size: 12px; line-height: 1.4;">
              This code expires in 30 minutes. If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            &copy; ${new Date().getFullYear()} Mwiti Bakers. All rights reserved.
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend email error:', error);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to send verification email:', err);
    throw new Error(
      `Failed to send verification email to ${email}. Please check your RESEND_API_KEY.`
    );
  }
};

module.exports = { sendVerificationCode };
