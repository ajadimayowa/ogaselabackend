"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMember = exports.startLoanApplication = exports.updateMember = exports.getMemberById = exports.getMembers = exports.createMember = void 0;
const Member_1 = __importDefault(require("../../models/Member"));
const Group_1 = __importDefault(require("../../models/Group"));
const s3Upload_1 = require("../../services/s3Upload");
// Helper: upload a single file buffer to S3
/** Create Member */
const createMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const member = yield Member_1.default.create(req.body);
        // update group totals
        const group = yield Group_1.default.findById(member.group);
        // if (group) await group.calculateTotals();
        res.status(201).json({ message: "Member created", member });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.createMember = createMember;
/** Get Members with Filters + Pagination */
const getMembers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { organizationId, groupId, page = 1, limit = 10 } = req.query;
        const filter = {};
        if (organizationId)
            filter.organization = organizationId;
        if (groupId)
            filter.group = groupId;
        const members = yield Member_1.default.find(filter)
            .skip((+page - 1) * +limit)
            .limit(+limit)
            .sort({ createdAt: -1 });
        const total = yield Member_1.default.countDocuments(filter);
        res.json({
            data: members,
            pagination: {
                total,
                page: +page,
                limit: +limit,
                totalPages: Math.ceil(total / +limit),
            },
        });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.getMembers = getMembers;
/** Get Member by ID */
const getMemberById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const member = yield Member_1.default.findById(req.params.id).
            populate("group").
            populate("createdBy", 'fullName email phoneNumber staffLevel');
        if (!member)
            return res.status(404).json({ error: "Member not found" });
        return res.status(201).json({ success: true, payload: member, message: 'success' });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
exports.getMemberById = getMemberById;
/** Update Member */
// export const updateMember = async (req: Request, res: Response):Promise<any> => {
//   try {
//     const member = await Member.findByIdAndUpdate(req.params.memberId, req.body, { new: true });
//     if (!member) return res.status(404).json({ error: "Member not found" });
//     const group = await Group.findById(member.group);
//     // if (group) await group.calculateTotals();
//    return  res.json({ message: "Member updated", member });
//   } catch (err: any) {
//    return  res.status(400).json({ error: err.message });
//   }
// };
/** Update Member */
const updateMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { memberId } = req.params;
        // Multer provides files in this shape: { [fieldname]: Express.Multer.File[] }
        const files = req.files;
        // Safe uploader
        const uploadFile = (field) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const file = (_a = files === null || files === void 0 ? void 0 : files[field]) === null || _a === void 0 ? void 0 : _a[0];
            return file ? (yield (0, s3Upload_1.uploadBufferToS3)(file)).url : null;
        });
        // Upload new files (if provided)
        const passportPhoto = yield uploadFile("passportPhoto");
        const utilityBillPhoto = yield uploadFile("utilityBillPhoto");
        const idCardPhoto = yield uploadFile("idCardPhoto");
        const attestationDocumentFile = yield uploadFile("attestationDocumentFile");
        // Body fields
        const { title, fullName, alias, maritalStatus, dob, homeAddress, noOfKids, stateOfOrigin, lgaOfOrigin, occupation, residentialAddress, nearestBusStop, durationOfStay, language, officeAddress, selectedModeOfIdentification, idIdentificationNumber, noOfChildren, } = req.body;
        // Gender logic
        let gender;
        if ((title === null || title === void 0 ? void 0 : title.toLowerCase()) === "mr")
            gender = "male";
        if (["mrs", "miss"].includes(title === null || title === void 0 ? void 0 : title.toLowerCase()))
            gender = "female";
        // Build KYC update only with files that were uploaded
        const kycUpdate = {
            selectedModeOfIdentification,
            idIdentificationNumber,
        };
        if (passportPhoto)
            kycUpdate.passportPhoto = passportPhoto;
        if (utilityBillPhoto)
            kycUpdate.utilityBillPhoto = utilityBillPhoto;
        if (idCardPhoto)
            kycUpdate.idCardPhoto = idCardPhoto;
        if (attestationDocumentFile)
            kycUpdate.attestationDocumentFile = attestationDocumentFile;
        // Update member document
        const member = yield Member_1.default.findByIdAndUpdate(memberId, Object.assign({ title,
            fullName,
            gender,
            alias,
            maritalStatus,
            homeAddress,
            noOfKids,
            dob, state: stateOfOrigin, lga: lgaOfOrigin, occupation,
            residentialAddress,
            nearestBusStop,
            durationOfStay,
            language,
            officeAddress,
            noOfChildren }, (Object.keys(kycUpdate).length > 0 && { kyc: kycUpdate })), { new: true });
        if (!member) {
            return res.status(404).json({
                success: false,
                error: "Member not found",
                payload: {},
            });
        }
        return res.json({
            success: true,
            message: "Loan application submitted successfully",
            payload: member,
        });
    }
    catch (err) {
        console.error("updateMember error:", err);
        return res.status(400).json({
            success: false,
            error: err.message,
            payload: {},
        });
    }
});
exports.updateMember = updateMember;
const startLoanApplication = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const memberId = req.params.memberId;
        // Files (multer.memoryStorage) come in as { [fieldname]: Express.Multer.File[] }
        const files = req.files;
        // Helper to upload safely
        const uploadFile = (field) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const file = (_a = files === null || files === void 0 ? void 0 : files[field]) === null || _a === void 0 ? void 0 : _a[0];
            return file ? (yield (0, s3Upload_1.uploadBufferToS3)(file)).url : null;
        });
        // Upload each file to S3
        const passportPhoto = yield uploadFile("passportPhoto");
        const memberIdDocumentFile = yield uploadFile("memberIdDocumentFile");
        const g1Passport = yield uploadFile("g1Passport");
        const g1AttestationDocument = yield uploadFile("g1AttestationDocument");
        const g2Passport = yield uploadFile("g2Passport");
        const g2AttestationDocument = yield uploadFile("g2AttestationDocument");
        const nokPassport = yield uploadFile("nokPassport");
        const nokAttestationDocument = yield uploadFile("nokAttestationDocument");
        const refPassport = yield uploadFile("refPassport");
        const refAttestationDocument = yield uploadFile("refAttestationDocument");
        // Form fields
        const { title, dailyLatePercentage, dob, g1FullName, g1ID, g1PhoneNumber, g1Title, g2FullName, g2ID, g2PhoneNumber, g2Title, interestRate, lgaOfOrigin, loanPurpose, loanTenure, maritalStatus, modeOfIdentification, nearestBusStop, noOfChildren, nokFullName, nokID, nokPhoneNumber, nokTitle, occupation, officeAddress, penaltyFee, refFullName, refID, refPhoneNumber, refTitle, relationshipWithNok, requestedLoanAmount, residentLengthOfStay, residentialAddress, stateOfNok, stateOfOrigin, stateOfg1, stateOfg2, stateOfref, } = req.body;
        // Update member
        const member = yield Member_1.default.findByIdAndUpdate(memberId, {
            title,
            dob,
            occupation,
            officeAddress,
            residentialAddress,
            nearestBusStop,
            noOfChildren,
            maritalStatus,
            lgaOfOrigin,
            stateOfOrigin,
            residentLengthOfStay,
            passportPhoto,
            memberIdDocumentFile,
            loanRecord: {
                loanVerificationId: "BCK-" + memberId.slice(5, 12).toUpperCase(),
                loanStartDate: new Date(),
                interestRate,
                requestedLoanAmount,
                calculatedAmountToBePaid: requestedLoanAmount * (1 + (+interestRate / 100)),
                loanPurpose,
                loanTenure: loanTenure * 7,
                repaymentDuration: loanTenure,
                dailyLatePercentage,
                penaltyFee,
                status: "Pending",
                applicationDate: new Date(),
            },
            guarantor1: {
                fullName: g1FullName,
                id: g1ID,
                phoneNumber: g1PhoneNumber,
                title: g1Title,
                passport: g1Passport,
                attestationDocument: g1AttestationDocument,
                state: stateOfg1,
            },
            guarantor2: {
                fullName: g2FullName,
                id: g2ID,
                phoneNumber: g2PhoneNumber,
                title: g2Title,
                passport: g2Passport,
                attestationDocument: g2AttestationDocument,
                state: stateOfg2,
            },
            nok: {
                fullName: nokFullName,
                id: nokID,
                phoneNumber: nokPhoneNumber,
                title: nokTitle,
                passport: nokPassport,
                attestationDocument: nokAttestationDocument,
                state: stateOfNok,
                relationship: relationshipWithNok,
            },
            referee: {
                fullName: refFullName,
                id: refID,
                phoneNumber: refPhoneNumber,
                title: refTitle,
                passport: refPassport,
                attestationDocument: refAttestationDocument,
                state: stateOfref,
            },
        }, { new: true });
        if (!member)
            return res.status(404).json({ error: "Member not found" });
        // Update group totals
        // const group = await Group.findById(member.group);
        // if (group) {
        //   group.totalAmountBorrowed = await Member.aggregate([
        //     { $match: { group: group._id } },
        //     { $group: { _id: null, total: { $sum: "$loanRecord.requestedLoanAmount" } } },
        //   ]).then((r) => (r[0] ? r[0].total : 0));
        //   await group.save();
        // }
        return res.json({ message: "Loan application submitted successfully", member });
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
exports.startLoanApplication = startLoanApplication;
/** Delete Member */
const deleteMember = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const member = yield Member_1.default.findByIdAndDelete(req.params.memberId);
        if (!member)
            return res.status(404).json({ error: "Member not found" });
        const group = yield Group_1.default.findById(member.group);
        // if (group) await group.calculateTotals();
        res.json({ message: "Member deleted" });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.deleteMember = deleteMember;
