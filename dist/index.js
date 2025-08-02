"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const morgan_1 = __importDefault(require("morgan"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const org_routes_1 = __importDefault(require("./routes/org.routes"));
const role_routes_1 = __importDefault(require("./routes/role.routes"));
const userRole_routes_1 = __importDefault(require("./routes/userRole.routes"));
const department_routes_1 = __importDefault(require("./routes/department.routes"));
const staff_routes_1 = __importDefault(require("./routes/staff.routes"));
const stateRoutes_1 = __importDefault(require("./routes/stateRoutes"));
const branch_routes_1 = __importDefault(require("./routes/branch-routes/branch.routes"));
dotenv_1.default.config();
// Connect to DB
(0, db_1.default)().catch((err) => {
    console.error('Failed to connect to DB:', err.message);
    process.exit(1);
});
const app = (0, express_1.default)();
// Middlewares
if (process.env.NODE_ENV === 'development')
    app.use((0, morgan_1.default)('dev'));
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
}));
app.use(express_1.default.json());
const apiPrefix = '/api/v1/';
// Routes
app.use(apiPrefix, org_routes_1.default);
app.use(apiPrefix, branch_routes_1.default);
app.use(apiPrefix, department_routes_1.default);
app.use(apiPrefix, role_routes_1.default);
app.use(apiPrefix, staff_routes_1.default);
app.use(apiPrefix, auth_routes_1.default);
app.use(apiPrefix, userRole_routes_1.default);
app.use(apiPrefix, stateRoutes_1.default); // updated
// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
