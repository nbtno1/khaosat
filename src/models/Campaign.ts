import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type CampaignStatus = "DRAFT" | "OPEN" | "CLOSED" | "ARCHIVED";

export interface IParticipatingProvince {
  provinceCode: string;
  provinceName: string;
  targetRespondents: number;
}

export interface ICampaign extends Document {
  code: string;
  title: string;
  schemaVersion: string;
  startDate: Date;
  endDate: Date;
  status: CampaignStatus;
  participatingProvinces: IParticipatingProvince[];
  description?: string;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipatingProvinceSchema = new Schema<IParticipatingProvince>(
  {
    provinceCode: { type: String, required: true },
    provinceName: { type: String, required: true },
    targetRespondents: { type: Number, default: 0 },
  },
  { _id: false }
);

const CampaignSchema = new Schema<ICampaign>(
  {
    code: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true },
    schemaVersion: { type: String, required: true, default: "3.3" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["DRAFT", "OPEN", "CLOSED", "ARCHIVED"],
      default: "DRAFT",
    },
    participatingProvinces: { type: [ParticipatingProvinceSchema], default: [] },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

// Index on code is created via unique: true
CampaignSchema.index({ status: 1 });

export const Campaign: Model<ICampaign> =
  mongoose.models.Campaign || mongoose.model<ICampaign>("Campaign", CampaignSchema);

export default Campaign;
