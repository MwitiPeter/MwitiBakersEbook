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

  // If no Resend client is configured, log the code to console (dev mode)
  if (!client) {
    console.log(`\n========================================`);
    console.log(`🔐 VERIFICATION CODE for ${email}`);
    console.log(`   Code: ${code}`);
    console.log(`   Name: ${name}`);
    console.log(`========================================\n`);
    return { success: true, devMode: true, code };
  }

  try {
    const { data, error } = await client.emails.send({
      from: 'Mwiti Bakers <noreply@mwitibakers.com>',
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
      // Fall back to console logging
      console.log(`\n========================================`);
      console.log(`🔐 VERIFICATION CODE for ${email}`);
      console.log(`   Code: ${code}`);
      console.log(`========================================\n`);
      return { success: true, devMode: true, code };
    }

    return { success: true };
  } catch (err) {
    console.error('Failed to send verification email:', err);
    console.log(`\n========================================`);
    console.log(`🔐 VERIFICATION CODE for ${email}`);
    console.log(`   Code: ${code}`);
    console.log(`========================================\n`);
    return { success: true, devMode: true, code };
  }
};

module.exports = { sendVerificationCode };
