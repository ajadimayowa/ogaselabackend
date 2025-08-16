"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GLOBAL_PERMISSIONS = void 0;
exports.GLOBAL_PERMISSIONS = [
    // Master Access
    {
        name: "all.access",
        label: "All Access",
        description: "Can perform all basic operations and has unrestricted access."
    },
    // Organisation Management
    {
        name: "organization.view",
        label: "View Organization",
        description: "Can view organization details"
    },
    {
        name: "organization.update",
        label: "Update Organization",
        description: "Can update organization information"
    },
    // Department Management
    {
        name: "department.create",
        label: "Create Department",
        description: "Can create new departments"
    },
    {
        name: "department.view",
        label: "View Departments",
        description: "Can view departments"
    },
    {
        name: "department.update",
        label: "Update Department",
        description: "Can update departments"
    },
    {
        name: "department.delete",
        label: "Delete Department",
        description: "Can delete departments"
    },
    // Role Management
    {
        name: "role.create",
        label: "Create Role",
        description: "Can create new roles"
    },
    {
        name: "role.view",
        label: "View Roles",
        description: "Can view roles"
    },
    {
        name: "role.update",
        label: "Update Role",
        description: "Can update roles"
    },
    {
        name: "role.delete",
        label: "Delete Role",
        description: "Can delete roles"
    },
    // Permission Assignment
    {
        name: "permission.assign",
        label: "Assign Permissions",
        description: "Can assign permissions to roles"
    },
    {
        name: "permission.revoke",
        label: "Revoke Permissions",
        description: "Can revoke permissions from roles"
    },
    // Staff Management
    {
        name: "staff.create",
        label: "Create Staff",
        description: "Can create staff accounts"
    },
    {
        name: "staff.view",
        label: "View Staff",
        description: "Can view staff details"
    },
    {
        name: "staff.update",
        label: "Update Staff",
        description: "Can update staff details"
    },
    {
        name: "staff.delete",
        label: "Delete Staff",
        description: "Can delete staff accounts"
    },
    // Branch Management
    {
        name: "branch.create",
        label: "Create Branch",
        description: "Can create branches"
    },
    {
        name: "branch.view",
        label: "View Branch",
        description: "Can view branch details"
    },
    {
        name: "branch.update",
        label: "Update Branch",
        description: "Can update branch details"
    },
    {
        name: "branch.delete",
        label: "Delete Branch",
        description: "Can delete branches"
    },
    // Reporting
    {
        name: "report.view",
        label: "View Reports",
        description: "Can view reports and analytics"
    },
    {
        name: "report.export",
        label: "Export Reports",
        description: "Can export reports"
    }
];
