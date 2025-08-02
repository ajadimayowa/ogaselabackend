export interface IOrganisationCreationEmail {
  nameOfOrg: string;
  orgEmail: string;
  orgAddress?: string;
  orgPhoneNumber?: number | string;
  orgSubscriptionPlan?: 'basic' | 'standard' | 'pro';
  orgRegNumber: string;
  organisationLogo?: string;
  organisationPrimaryColor?: string;
  organisationSecondaryColor?: string;
  currentTime: string;
  createdByName: string;
}

export interface IDepartmentCreationEmail {
  nameOfOrg: string;
  orgEmail: string;
  nameOfDept: string;
  createdByName: string;
  createdByEmail: string;
  approvedByName: string;
  approvedByEmail: string;
  currentTime: string;
}

export interface IRoleCreationEmail {
  nameOfOrg: string;
  orgEmail: string;
  nameOfRole: string;
  createdByName: string;
  createdByEmail: string;
  approvedByName: string;
  approvedByEmail: string;
  currentTime: string;
}

export interface ISuperAdminCreationEmail {
  firstName: string,
  loginEmail: string,
  tempPass: string,
  createdByName: string;
  createdByEmail: string;
  approvedByName: string;
  approvedByEmail: string;
  userClass: string,
  staffLevel: string,
  currentTime: string,
  nameOfOrg: string
}

export interface IStaffCreationEmail {
  firstName: string,
  loginEmail: string,
  tempPass: string,
  userClass: string,
  staffLevel: string,
  currentTime: string,
  nameOfOrg: string
}