import mongoose, { Schema, Document } from "mongoose";


export interface IInterestRate {
  duration: number; // in days
  rate: number;     // percentage, e.g. 5 means 5%
}

export interface IBusinessRule extends Document {
  companyId: mongoose.Types.ObjectId;
  interestRates: IInterestRate[];              // e.g. 5% annual or monthly
  loanDurations: number[];             // e.g. [30, 60, 90] days
  penaltyFee: number;                  // fixed penalty amount
  dailyLatePercentage: number;         // e.g. 0.5% per day late

  changeHistory: {
    changedBy: mongoose.Types.ObjectId;
    oldValue: any;
    newValue: any;
    changedAt: Date;
    field: string;
  }[];

  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InterestRateSchema: Schema = new Schema({
  duration: { type: Number, required: true },
  rate: { type: Number, required: true },
});

const BusinessRuleSchema: Schema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Organization", required: true, unique: true }, 
    // unique enforces only ONE rule per company

    interestRates: { type: [InterestRateSchema], required: true },
    loanDurations: { type: [Number], required: true },
    penaltyFee: { type: Number, required: true },
    dailyLatePercentage: { type: Number, required: true },

    changeHistory: [
      {
        changedBy: { type: Schema.Types.ObjectId, ref: "Staff" },
        oldValue: Schema.Types.Mixed,
        newValue: Schema.Types.Mixed,
        changedAt: { type: Date, default: Date.now },
        field: String,
      },
    ],

    createdBy: { type: Schema.Types.ObjectId, ref: "Staff", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Staff" },
  },
  { timestamps: true }
);

export default mongoose.model<IBusinessRule>("BusinessRule", BusinessRuleSchema);
