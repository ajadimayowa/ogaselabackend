import { sendMail } from '../emailService';
import handlebars from 'handlebars';
import path from 'path';
import fs from 'fs';

interface CreatorEmailData {
    firstName: string;
    email: string;
    password: string;
    logoUrl?: string; // Optional, if you want to include a logo
    footerUrl?: string; // Optional, if you want to include a footer
    orgPrimaryColor?: string; // Optional, to customize the primary color of the email
}

interface CreatorNotificationEmailData {
    firstName: string;
    email: string;
    logoUrl?: string; // Optional, if you want to include a logo
    footerUrl?: string; // Optional, if you want to include a footer
    orgPrimaryColor?: string; // Optional, to customize the primary color of the email
}

const sendCreatorCreatedEmail = async (creatorData: CreatorEmailData) => {
    const { firstName, email, password, logoUrl,footerUrl } = creatorData;
    const templatePath = path.join(
        process.cwd(),
        'src',
        'services',
        'email',
        'emailTemps',
        'creator',
        'CreatorCreationEmailTemplate.hbs'
    );

    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    // Compile the Handlebars templates
    const template = handlebars.compile(templateSource);
    const html = template({ firstName,email,password,orgPrimaryColor: '#ffffffff'});
    const subject = 'Creator Profiling.';
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
        await sendMail(email, subject, html,remoteImages);
        console.log('email sent successfully!');
    } catch (error) {
        console.error('Error email:', error);
    }

}

const sendCreatorLoginNotificationEmail = async (creatorData: CreatorNotificationEmailData) => {
    const { firstName, email, logoUrl,footerUrl } = creatorData;
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
    const html = template({ firstName,email,orgPrimaryColor: '#ffffffff',loginTime});
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
        await sendMail(email, subject, html,remoteImages);
        console.log('email sent successfully!');
    } catch (error) {
        console.error('Error email:', error);
    }

}

export { sendCreatorCreatedEmail,sendCreatorLoginNotificationEmail }
