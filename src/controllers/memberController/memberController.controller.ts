// controllers/memberController.ts
import { Request, Response } from "express";
import Member from "../../models/Member";
import Group from "../../models/Group";
import { uploadBufferToS3 } from "../../services/s3Upload";


// Helper: upload a single file buffer to S3

/** Create Member */
export const createMember = async (req: Request, res: Response) => {
  try {
    const member = await Member.create(req.body);

    // update group totals
    const group = await Group.findById(member.group);
    // if (group) await group.calculateTotals();

    res.status(201).json({ message: "Member created", member });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/** Get Members with Filters + Pagination */
export const getMembers = async (req: Request, res: Response) => {
  try {
    const { organizationId, groupId, page = 1, limit = 10 } = req.query;

    const filter: any = {};
    if (organizationId) filter.organization = organizationId;
    if (groupId) filter.group = groupId;

    const members = await Member.find(filter)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ createdAt: -1 });

    const total = await Member.countDocuments(filter);

    res.json({
      data: members,
      pagination: {
        total,
        page: +page,
        limit: +limit,
        totalPages: Math.ceil(total / +limit),
      },
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

/** Get Member by ID */
export const getMemberById = async (req: Request, res: Response):Promise<any>=> {
  try {
    const member = await Member.findById(req.params.id).
    populate("group").
    populate("createdBy",'fullName email phoneNumber staffLevel');
    if (!member) return res.status(404).json({ error: "Member not found" });
    return res.status(201).json({success:true,payload:member,message:'success'});
  } catch (err: any) {
   return  res.status(400).json({ error: err.message });
  }
};

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
export const updateMember = async (req: Request, res: Response): Promise<any> => {
  try {
    const { memberId } = req.params;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Safe uploader - only if actual file exists
    const uploadFile = async (field: string) => {
      if (files?.[field] && files[field].length > 0) {
        const file = files[field][0];
        const result = await uploadBufferToS3(file);
        return result.url;
      }
      return undefined; // <-- very important
    };

    // Upload only if provided
    const passportPhoto = await uploadFile("passportPhoto");
    const utilityBillPhoto = await uploadFile("utilityBillPhoto");
    const idCardPhoto = await uploadFile("idCardPhoto");
    const attestationDocumentFile = await uploadFile("attestationDocumentFile");

    // Body fields
    const {
      title,
      fullName,
      alias,
      maritalStatus,
      dob,
      homeAddress,
      noOfKids,
      stateOfOrigin,
      lgaOfOrigin,
      occupation,
      residentialAddress,
      nearestBusStop,
      durationOfStay,
      language,
      officeAddress,
      selectedModeOfIdentification,
      idIdentificationNumber,
      noOfChildren,
    } = req.body;

    // Build updateData dynamically
    const updateData: any = {};
    if (title) {
      updateData.title = title;
      updateData.gender =
        title.toLowerCase() === "mr"
          ? "male"
          : ["mrs", "miss"].includes(title.toLowerCase())
          ? "female"
          : undefined;
    }
    if (fullName) updateData.fullName = fullName;
    if (alias) updateData.alias = alias;
    if (maritalStatus) updateData.maritalStatus = maritalStatus;
    if (dob) updateData.dob = dob;
    if (homeAddress) updateData.homeAddress = homeAddress;
    if (noOfKids) updateData.noOfKids = noOfKids;
    if (stateOfOrigin) updateData.state = stateOfOrigin;
    if (lgaOfOrigin) updateData.lga = lgaOfOrigin;
    if (occupation) updateData.occupation = occupation;
    if (residentialAddress) updateData.residentialAddress = residentialAddress;
    if (nearestBusStop) updateData.nearestBusStop = nearestBusStop;
    if (durationOfStay) updateData.durationOfStay = durationOfStay;
    if (language) updateData.language = language;
    if (officeAddress) updateData.officeAddress = officeAddress;
    if (noOfChildren) updateData.noOfChildren = noOfChildren;

    // KYC updates (only add if present)
    const kycUpdate: any = {};
    if (selectedModeOfIdentification) kycUpdate.selectedModeOfIdentification = selectedModeOfIdentification;
    if (idIdentificationNumber) kycUpdate.idIdentificationNumber = idIdentificationNumber;
    if (passportPhoto) kycUpdate.passportPhoto = passportPhoto;
    if (utilityBillPhoto) kycUpdate.utilityBillPhoto = utilityBillPhoto;
    if (idCardPhoto) kycUpdate.idCardPhoto = idCardPhoto;
    if (attestationDocumentFile) kycUpdate.attestationDocumentFile = attestationDocumentFile;

    if (Object.keys(kycUpdate).length > 0) {
      updateData.kyc = kycUpdate;
    }

    const member = await Member.findByIdAndUpdate(memberId, updateData, { new: true });

    if (!member) {
      return res.status(404).json({ success: false, error: "Member not found" });
    }

    return res.json({
      success: true,
      message: "Member updated successfully",
      payload: member,
    });
  } catch (err: any) {
    console.error("updateMember error:", err);
    return res.status(400).json({ success: false, error: err.message });
  }
};

export const startLoanApplication = async (req: Request, res: Response): Promise<any> => {
  try {
    const memberId = req.params.memberId;

    // Files (multer.memoryStorage) come in as { [fieldname]: Express.Multer.File[] }
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    // Helper to upload safely
    const uploadFile = async (field: string) => {
      const file = files?.[field]?.[0];
      return file ? (await uploadBufferToS3(file)).url : null;
    };

    // Upload each file to S3
    const passportPhoto = await uploadFile("passportPhoto");
    const memberIdDocumentFile = await uploadFile("memberIdDocumentFile");

    const g1Passport = await uploadFile("g1Passport");
    const g1AttestationDocument = await uploadFile("g1AttestationDocument");

    const g2Passport = await uploadFile("g2Passport");
    const g2AttestationDocument = await uploadFile("g2AttestationDocument");

    const nokPassport = await uploadFile("nokPassport");
    const nokAttestationDocument = await uploadFile("nokAttestationDocument");

    const refPassport = await uploadFile("refPassport");
    const refAttestationDocument = await uploadFile("refAttestationDocument");

    // Form fields
    const {
      title,
      dailyLatePercentage,
      dob,
      g1FullName,
      g1ID,
      g1PhoneNumber,
      g1Title,
      g2FullName,
      g2ID,
      g2PhoneNumber,
      g2Title,
      interestRate,
      lgaOfOrigin,
      loanPurpose,
      loanTenure,
      maritalStatus,
      modeOfIdentification,
      nearestBusStop,
      noOfChildren,
      nokFullName,
      nokID,
      nokPhoneNumber,
      nokTitle,
      occupation,
      officeAddress,
      penaltyFee,
      refFullName,
      refID,
      refPhoneNumber,
      refTitle,
      relationshipWithNok,
      requestedLoanAmount,
      residentLengthOfStay,
      residentialAddress,
      stateOfNok,
      stateOfOrigin,
      stateOfg1,
      stateOfg2,
      stateOfref,
    } = req.body;

    // Update member
    const member = await Member.findByIdAndUpdate(
      memberId,
      {
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
      },
      { new: true }
    );

    if (!member) return res.status(404).json({ error: "Member not found" });

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
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
};

/** Delete Member */
export const deleteMember = async (req: Request, res: Response) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.memberId);
    if (!member) return res.status(404).json({ error: "Member not found" });

    const group = await Group.findById(member.group);
    // if (group) await group.calculateTotals();

    res.json({ message: "Member deleted" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
