// welcomeEmail.ts
import { sendMail } from './emailService';
import handlebars from 'handlebars';
import path from 'path';
import fs from 'fs';
import moment from 'moment';
import { IOrganisationCreationEmail, IStaffCreationEmail, ISuperAdminCreationEmail } from '../../interfaces/email';
import { IOrganization } from '../../models/Organization';


interface IRoleCreationEmail {
  nameOfOrg: string;
  orgEmail: string;
  nameOfRole: string;
  currentTime: string;
}


export const sendOrgWelcomeEmail = async ({nameOfOrg,orgRegNumber,orgEmail,orgPhoneNumber,orgSubscriptionPlan,currentTime,createdByName}:IOrganisationCreationEmail) => {
  const templatePath = path.join(
  process.cwd(),
  'src',
  'services',
  'email',
  'emailTemps',
  'orgRegEmail.hbs'
);
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  // Compile the Handlebars templates
  
  const template = handlebars.compile(templateSource);
  const html = template({
    nameOfOrg,
    orgRegNumber,
    orgEmail,
    orgPhoneNumber,
    orgSubscriptionPlan,
    currentTime,
    createdByName,
  });
  const subject = 'Succesfull Registration.'

  try {
  await sendMail({
    userEmail: orgEmail,
    subject,
    html,        // optional, can be omitted if empty
    retries: 3,            // number of retry attempts
    retryDelayMs: 2000     // delay between retries in ms
  });
  console.log(`✅ Email sent successfully to ${orgEmail}`);
} catch (error) {
  console.error(`❌ Failed to send email to ${orgEmail}:`, error);
}
};

export const sendBranchCreationEmail = async (nameOfOrg: string, orgEmail: string, nameOfDept: string, currentTime: string,createdByName:string) => {
  const templatePath = path.join(
  process.cwd(),
  'src',
  'services',
  'email',
  'emailTemps',
  'branchCreationEmail.hbs'
);
  
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  // Compile the Handlebars templates
  const template = handlebars.compile(templateSource);
  const html = template({ nameOfOrg, currentTime, nameOfDept,createdByName});
  const subject = 'New Branch Created.'

  try {
  await sendMail({
    userEmail: orgEmail,
    subject,
    html,        // optional, can be omitted if empty
    retries: 3,            // number of retry attempts
    retryDelayMs: 2000     // delay between retries in ms
  });
  console.log(`✅ Email sent successfully to ${orgEmail}`);
} catch (error) {
  console.error(`❌ Failed to send email to ${orgEmail}:`, error);
}
};

export const sendDeptCreationEmail = async (nameOfOrg: string, orgEmail: string, nameOfDept: string, currentTime: string,createdByName:string) => {
  const templatePath = path.join(
  process.cwd(),
  'src',
  'services',
  'email',
  'emailTemps',
  'departmentCreationEmail.hbs'
);
  
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  // Compile the Handlebars templates
  const template = handlebars.compile(templateSource);
  const html = template({ nameOfOrg, currentTime, nameOfDept,createdByName});
  const subject = 'New Department Created.'

 try {
  await sendMail({
    userEmail: orgEmail,
    subject,
    html,        // optional, can be omitted if empty
    retries: 3,            // number of retry attempts
    retryDelayMs: 2000     // delay between retries in ms
  });
  console.log(`✅ Email sent successfully to ${orgEmail}`);
} catch (error) {
  console.error(`❌ Failed to send email to ${orgEmail}:`, error);
}
};


export const sendRoleCreationEmail = async ({ nameOfOrg, currentTime, nameOfRole, orgEmail }: IRoleCreationEmail) => {
  const templatePath = path.join(
  process.cwd(),
  'src',
  'services',
  'email',
  'emailTemps',
  'roleCreationEmail.hbs'
);
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  // Compile the Handlebars templates
  const template = handlebars.compile(templateSource);
  const html = template({ nameOfOrg, currentTime, nameOfRole });
  const subject = 'New Role Created.'

  try {
  await sendMail({
    userEmail: orgEmail,
    subject,
    html,        // optional, can be omitted if empty
    retries: 3,            // number of retry attempts
    retryDelayMs: 2000     // delay between retries in ms
  });
  console.log(`✅ Email sent successfully to ${orgEmail}`);
} catch (error) {
  console.error(`❌ Failed to send email to ${orgEmail}:`, error);
}
};

export const sendSuperAdminWelcomeEmail =
  async ({ firstName, loginEmail, tempPass, userClass, currentTime, createdByName,nameOfOrg,staffLevel }: ISuperAdminCreationEmail) => {
    const templatePath = path.join(
  process.cwd(),
  'src',
  'services',
  'email',
  'emailTemps',
  'superAdminRegEmail.hbs'
);
   
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    // Compile the Handlebars templates
    const template = handlebars.compile(templateSource);
    const html = template({ firstName, loginEmail, tempPass, userClass, createdByName, currentTime,nameOfOrg,staffLevel });
    const subject = 'Super Admin Registration.'

    try {
  await sendMail({
    userEmail: loginEmail,
    subject,
    html,        // optional, can be omitted if empty
    retries: 3,            // number of retry attempts
    retryDelayMs: 2000     // delay between retries in ms
  });
  console.log(`✅ Email sent successfully to ${loginEmail}`);
} catch (error) {
  console.error(`❌ Failed to send email to ${loginEmail}:`, error);
}
  };

  export const sendStaffWelcomeEmail =
  async ({ firstName, loginEmail, tempPass, userClass, currentTime,nameOfOrg,staffLevel }: IStaffCreationEmail) => {
    const templatePath = path.join(
  process.cwd(),
  'src',
  'services',
  'email',
  'emailTemps',
  'superAdminRegEmail.hbs'
);
   
    const templateSource = fs.readFileSync(templatePath, 'utf-8');
    // Compile the Handlebars templates
    const template = handlebars.compile(templateSource);
    const html = template({ firstName, loginEmail, tempPass, userClass,currentTime,nameOfOrg,staffLevel });
    const subject = 'Super Admin Registration.'

   try {
  await sendMail({
    userEmail: loginEmail,
    subject,
    html,        // optional, can be omitted if empty
    retries: 3,            // number of retry attempts
    retryDelayMs: 2000     // delay between retries in ms
  });
  console.log(`✅ Email sent successfully to ${loginEmail}`);
} catch (error) {
  console.error(`❌ Failed to send email to ${loginEmail}:`, error);
}
  };

  


export const sendWelcomeEmail = async (firstName: string, userEmail: string, verifyEMailOtpCode: string) => {
   const templatePath = path.join(
  process.cwd(),
  'src',
  'services',
  'email',
  'emailTemps',
  'registration.hbs'
);
 
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  // Compile the Handlebars templates
  const template = handlebars.compile(templateSource);
  const html = template({ firstName, verifyEMailOtpCode });
  const subject = 'Email Verification Code'

  try {
  await sendMail({
    userEmail: userEmail,
    subject,
    html,        // optional, can be omitted if empty
    retries: 3,            // number of retry attempts
    retryDelayMs: 2000     // delay between retries in ms
  });
  console.log(`✅ Email sent successfully to ${userEmail}`);
} catch (error) {
  console.error(`❌ Failed to send email to ${userEmail}:`, error);
}
};

export const sendProfileUpdateEmail = async (fullName: string, userEmail: string, verificationCode: string) => {
  const templatePath = path.join(__dirname, 'emailTemps', 'verification.hbs');
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  // Compile the Handlebars templates
  const template = handlebars.compile(templateSource);
  const html = template({ fullName, verificationCode });
  const subject = 'Profile updated!'

  try {
  await sendMail({
    userEmail: userEmail,
    subject,
    html,        // optional, can be omitted if empty
    retries: 3,            // number of retry attempts
    retryDelayMs: 2000     // delay between retries in ms
  });
  console.log(`✅ Email sent successfully to ${userEmail}`);
} catch (error) {
  console.error(`❌ Failed to send email to ${userEmail}:`, error);
}
};

export const sendPasswordResetEmail = async (fullName: string, userEmail: string, verificationCode: string) => {
  const templatePath = path.join(__dirname, 'emailTemps', 'passwordResetRequest.hbs');
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  // Compile the Handlebars templates
  const template = handlebars.compile(templateSource);
  const html = template({ fullName, verificationCode });
  const subject = 'Request to change password!'

 try {
  await sendMail({
    userEmail: userEmail,
    subject,
    html,        // optional, can be omitted if empty
    retries: 3,            // number of retry attempts
    retryDelayMs: 2000     // delay between retries in ms
  });
  console.log(`✅ Email sent successfully to ${userEmail}`);
} catch (error) {
  console.error(`❌ Failed to send email to ${userEmail}:`, error);
}
};

export const sendPasswordChangedEmail = async (fullName: string, userEmail: string, verificationCode: string) => {
  const templatePath = path.join(__dirname, 'emailTemps', 'passwordResetSuccess.hbs');
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  // Compile the Handlebars templates
  const template = handlebars.compile(templateSource);
  const html = template({ fullName, verificationCode });
  const subject = 'Password Changed!'

 try {
  await sendMail({
    userEmail: userEmail,
    subject,
    html,        // optional, can be omitted if empty
    retries: 3,            // number of retry attempts
    retryDelayMs: 2000     // delay between retries in ms
  });
  console.log(`✅ Email sent successfully to ${userEmail}`);
} catch (error) {
  console.error(`❌ Failed to send email to ${userEmail}:`, error);
}
};

export const sendLoginOtpEmail = async (firstName: string, userEmail: string, loginOtp: string) => {
  const templatePath = path.join(
  process.cwd(),
  'src',
  'services',
  'email',
  'emailTemps',
  'loginOtp.hbs'
);
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  // Compile the Handlebars templates
  const template = handlebars.compile(templateSource);
  const html = template({ firstName, loginOtp});
  const subject = 'Login Otp!'

  try {
  await sendMail({
    userEmail: userEmail,
    subject,
    html,        // optional, can be omitted if empty
    retries: 3,            // number of retry attempts
    retryDelayMs: 2000     // delay between retries in ms
  });
  console.log(`✅ Email sent successfully to ${userEmail}`);
} catch (error) {
  console.error(`❌ Failed to send email to ${userEmail}:`, error);
}
};

export const sendResetPasswordOtpEmail = async (firstName: string, userEmail: string, passwordResetOtp: string) => {
  const templatePath = path.join(
  process.cwd(),
  'src',
  'services',
  'email',
  'emailTemps',
  'passwordResetOtpN.hbs'
);
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  // Compile the Handlebars templates
  const template = handlebars.compile(templateSource);
  const html = template({ firstName, passwordResetOtp});
  const subject = 'Password Reset Otp!'

  try {
  await sendMail({
    userEmail: userEmail,
    subject,
    html,        // optional, can be omitted if empty
    retries: 3,            // number of retry attempts
    retryDelayMs: 2000     // delay between retries in ms
  });
  console.log(`✅ Email sent successfully to ${userEmail}`);
} catch (error) {
  console.error(`❌ Failed to send email to ${userEmail}:`, error);
}
};

export const sendLoginNotificationEmail = async (firstName: string, userEmail: string) => {
  const templatePath = path.join(__dirname, 'emailTemps', 'login.hbs');
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  // Compile the Handlebars templates
  const template = handlebars.compile(templateSource);
  const html = template({ firstName });
  const subject = 'Login notification!'

  try {
  await sendMail({
    userEmail: userEmail,
    subject,
    html,        // optional, can be omitted if empty
    retries: 3,            // number of retry attempts
    retryDelayMs: 2000     // delay between retries in ms
  });
  console.log(`✅ Email sent successfully to ${userEmail}`);
} catch (error) {
  console.error(`❌ Failed to send email to ${userEmail}:`, error);
}
};

export const sendUserVerifiedEmail = async (fullName: string, userEmail: string, verificationCode: string) => {
  const templatePath = path.join(__dirname, 'emailTemps', 'verification.hbs');
  const templateSource = fs.readFileSync(templatePath, 'utf-8');
  // Compile the Handlebars templates
  const template = handlebars.compile(templateSource);
  const html = template({ fullName, verificationCode });
  const subject = 'You have been verified!'

  try {
  await sendMail({
    userEmail: userEmail,
    subject,
    html,        // optional, can be omitted if empty
    retries: 3,            // number of retry attempts
    retryDelayMs: 2000     // delay between retries in ms
  });
  console.log(`✅ Email sent successfully to ${userEmail}`);
} catch (error) {
  console.error(`❌ Failed to send email to ${userEmail}:`, error);
}
};




// Example usage

