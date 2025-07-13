
import nodemailer from 'nodemailer';

export const sendMail = async (userEmail: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST, // Brevo SMTP host
    port: parseInt('587'), // Use 587 for TLS
    
    auth: {
      user: process.env.BREVO_USERNAME, // Your Brevo SMTP username (API key)
      pass: process.env.BREVO_PASSWORD // Your Brevo API key (same as username)
    },
    secure: false, // Use TLS
  });

  const mailerOptions = {
    from: '"BCKash" <hello@floatsolutionhub.com>', // Sender address
    to: userEmail, // Recipient's email address
    subject: subject,
    html: html,
  };

  return transporter.sendMail(mailerOptions);
};