const { Resend } = require('resend');

let resendClient = null;

const getResend = () => {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

const sendVerificationCode = async (email, name, code, purpose = 'verify') => {
  let client;
  try {
    client = getResend();
  } catch {
    // Resend client creation failed (e.g. invalid API key format)
    console.log(`\n📧 ${purpose === 'reset' ? 'Password reset' : 'Verification'} code for ${email}: ${code} (failed to create Resend client)`);
    return { sent: false };
  }

  // If no Resend client is configured, log the code to console and flag as unsent
  if (!client) {
    console.log(`\n📧 ${purpose === 'reset' ? 'Password reset' : 'Verification'} code for ${email}: ${code} (not sent - RESEND_API_KEY not set)`);
    console.log(`   Set RESEND_API_KEY in Render env vars to enable real email delivery.\n`);
    return { sent: false };
  }

  // Try to send the email
  try {
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

    const isReset = purpose === 'reset';
    const subject = isReset
      ? 'Reset your Mwiti Bakers password'
      : 'Verify your Mwiti Bakers account';

    const heading = isReset ? 'Reset Your Password' : 'Verify Your Email';
    const intro = isReset
      ? 'We received a request to reset your password. Use the code below to set a new password.'
      : 'Welcome to Mwiti Bakers! Please use the verification code below to activate your account.';
    const footerNote = isReset
      ? 'If you didn\'t request a password reset, you can safely ignore this email.'
      : 'If you didn\'t create an account, you can safely ignore this email.';

    const { data, error } = await client.emails.send({
      from: `Mwiti Bakers <${fromEmail}>`,
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

    if (error) {
      console.error('Resend email error:', error);
      console.log(`\n📧 ${isReset ? 'Password reset' : 'Verification'} code for ${email}: ${code} (Resend API error)`);
      return { sent: false };
    }

    console.log(`Email sent to ${email}`);
    return { sent: true };
  } catch (err) {
    console.error('Failed to send verification email:', err);
    console.log(`\n📧 ${purpose === 'reset' ? 'Password reset' : 'Verification'} code for ${email}: ${code} (exception)`);
    return { sent: false };
  }
};

module.exports = { sendVerificationCode };
