const express = require('express');
const { body, validationResult } = require('express-validator');
const { Resend } = require('resend');

const router = express.Router();

// Contact form submission
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, message } = req.body;

      // Send email to mwitibakers@gmail.com using Resend
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

        const { error } = await resend.emails.send({
          from: `Mwiti Bakers Website <${fromEmail}>`,
          to: 'mwitibakers@gmail.com',
          replyTo: email,
          subject: `New Contact Form Message from ${name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px;">
              <div style="background: #0b356d; border-radius: 12px 12px 0 0; padding: 20px; text-align: center;">
                <h1 style="color: #c89b5a; margin: 0; font-size: 20px;">📬 New Contact Message</h1>
              </div>
              <div style="background: #f7f5f0; border-radius: 0 0 12px 12px; padding: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #0b356d; width: 100px;">Name:</td>
                    <td style="padding: 8px 0; color: #333;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #0b356d;">Email:</td>
                    <td style="padding: 8px 0; color: #333;"><a href="mailto:${email}" style="color: #c89b5a;">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #0b356d; vertical-align: top;">Message:</td>
                    <td style="padding: 8px 0; color: #333;">${message}</td>
                  </tr>
                </table>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
                <p style="color: #999; font-size: 12px; margin: 0;">
                  Sent from the Mwiti Bakers website contact form.
                  Reply to this email to respond to <a href="mailto:${email}" style="color: #c89b5a;">${name}</a> directly.
                </p>
              </div>
            </div>
          `,
        });

        if (error) {
          console.error('Contact form email error:', error);
          return res.status(500).json({ message: 'Failed to send message. Please try again later.' });
        }
      } else {
        // If Resend is not configured, log to console
        console.log(`\n📧 Contact form submission:\n   From: ${name} <${email}>\n   Message: ${message}\n`);
        console.log('   (RESEND_API_KEY not set - email not delivered to mwitibakers@gmail.com)\n');
      }

      res.json({ message: 'Message sent successfully! We will get back to you soon.' });
    } catch (error) {
      console.error('Contact form error:', error);
      res.status(500).json({ message: 'Failed to send message. Please try again later.' });
    }
  }
);

module.exports = router;
