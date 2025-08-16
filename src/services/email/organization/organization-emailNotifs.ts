import { sendMail } from '../emailService';
import handlebars from 'handlebars';
import path from 'path';
import fs from 'fs';

interface OrganizationEmailData {
  name: string;
  regNumber: string;
  email: string;
  address: string;
  lga: string;
  state: string;
  phoneNumber: number | string;
  createdByName: string;
  createdByEmail: string;
  logoUrl?: string; // Optional, if you want to include a logo
  footerUrl?: string; // Optional, if you want to include a footer
  orgPrimaryColor?: string; // Optional, to customize the primary color of the email
}

interface OrganizationDeptEmailData {
  nameOfDept : string;
  nameOfOrg: string;
  orgEmail: string;
  createdByName: string;
  createdByEmail: string;
  logoUrl?: string; // Optional, if you want to include a logo
  footerUrl?: string; // Optional, if you want to include a footer
  orgPrimaryColor?: string; // Optional, to customize the primary color of the email
}


const sendOrganizationCreatedEmail = async (creatorData: OrganizationEmailData) => {
  const { name, regNumber, address, state, lga, orgPrimaryColor,createdByName, email, phoneNumber, logoUrl, footerUrl } = creatorData;
  const templatePath = path.join(
    process.cwd(),
    'src',
    'services',
    'email',
    'emailTemps',
    'organization',
    'OrganizationCreationEmailTemplate.hbs'
  );

  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  // Compile the Handlebars templates
  const template = handlebars.compile(templateSource);
  const html = template({ name, email, phoneNumber,regNumber,createdByName, state, lga, address, orgPrimaryColor: '#ffffffff' });
  const subject = 'Welcome onboard!';
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

const sendOrgDeptCreationEmail = async (creatorData: OrganizationDeptEmailData) => {
  const {nameOfDept,nameOfOrg,orgEmail,createdByName,logoUrl, footerUrl } = creatorData;
  const templatePath = path.join(
    process.cwd(),
    'src',
    'services',
    'email',
    'emailTemps',
    'DepartmentCreationEmailTemplate.hbs'
  );

  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  // Compile the Handlebars templates
  const template = handlebars.compile(templateSource);
  const html = template({ nameOfDept,nameOfOrg,orgEmail,createdByName,orgPrimaryColor: '#ffffffff' });
  const subject = 'New Department Created!';
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
    await sendMail(orgEmail, subject, html, remoteImages);
    console.log('email sent successfully!');
  } catch (error) {
    console.error('Error email:', error);
  }

}

export { sendOrganizationCreatedEmail,sendOrgDeptCreationEmail }
