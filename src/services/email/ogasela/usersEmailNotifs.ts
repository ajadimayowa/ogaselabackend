import { sendMail } from '../emailService';
import handlebars from 'handlebars';
import path from 'path';
import fs from 'fs';

interface CreatorEmailData {
  firstName: string;
  email: string;
  emailVerificationCode: string;
  logoUrl?: string; // Optional, if you want to include a logo
  footerUrl?: string; // Optional, if you want to include a footer
  orgPrimaryColor?: string; // Optional, to customize the primary color of the email
}

interface CreatorNotificationEmailData {
  firstName: string;
  email: string;
  emailVerificationCode:string;
  logoUrl?: string; // Optional, if you want to include a logo
  footerUrl?: string; // Optional, if you want to include a footer
  orgPrimaryColor?: string; // Optional, to customize the primary color of the email
}

const sendUserRegistrationNotificationEmail = async (creatorData: CreatorEmailData) => {
  const { firstName, email, emailVerificationCode, logoUrl, footerUrl } = creatorData;
  const templatePath = path.join(
    process.cwd(),
    'src',
    'services',
    'email',
    'emailTemps',
    'ogasela',
    'RegistrationEmailTemplate.hbs'
  );

  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  // Compile the Handlebars templates
  const template = handlebars.compile(templateSource);
  const html = template({ firstName, email, emailVerificationCode, orgPrimaryColor: '#ffffffff' });
  const subject = 'Account Creation';
  const remoteImages = [
    {
      url: logoUrl || 'https://ogasela-bucket.s3.eu-north-1.amazonaws.com/images/website-pictures/ogasela-icon.png',
      cid: 'logo',
    },
    {
      url: footerUrl || 'https://ogasela-bucket.s3.eu-north-1.amazonaws.com/images/website-pictures/ogasela-footer.png',
      cid: 'footer',
    },
  ];
  try {
    await sendMail(email, subject, html, remoteImages);
    console.log('email sent successfully!');
  } catch (error) {
    console.error('Error email:', error);
  }

}

const sendRegistrationNotificationEmail2 = async (creatorData: CreatorNotificationEmailData) => {
  const { firstName, email, logoUrl, footerUrl } = creatorData;
  const loginTime = new Date().toLocaleString(); // Get the current date and time
  const templatePath = path.join(
    process.cwd(),
    'src',
    'services',
    'email',
    'emailTemps',
    'creator',
    'CreatorLoginEmailTemplate.hbs'
  );

  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  // Compile the Handlebars templates
  const template = handlebars.compile(templateSource);
  const html = template({ firstName, email, orgPrimaryColor: '#ffffffff', loginTime });
  const subject = 'Root Admin Login.';
  const remoteImages = [
    {
      url: logoUrl || 'https://bckash.s3.eu-north-1.amazonaws.com/images/bc-kash-logo-full.png',
      cid: 'logo',
    },
    {
      url: footerUrl || 'https://bckash.s3.eu-north-1.amazonaws.com/images/bckash-footer.png',
      cid: 'footer',
    },
  ];
  try {
    await sendMail(email, subject, html, remoteImages);
    console.log('email sent successfully!');
  } catch (error) {
    console.error('Error email:', error);
  }

}

export { sendUserRegistrationNotificationEmail }
