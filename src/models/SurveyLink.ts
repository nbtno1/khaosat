import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type SurveyLinkStatus = "ACTIVE" | "PAUSED" | "EXPIRED";

export interface ISurveyLink extends Document {
  campaignId: Types.ObjectId;
  provinceCode: string;
  provinceName: string;
  token: string;
  qrCodeDataUrl?: string;
  status: SurveyLinkStatus;
  isPilot: boolean;
  totalSubmissions: number;
  lastSubmissionAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SurveyLinkSchema = new Schema<ISurveyLink>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
    provinceCode: { type: String, required: true },
    provinceName: { type: String, required: true },
    token: { type: String, required: true, unique: true, trim: true },
    qrCodeDataUrl: { type: String },
    status: {
      type: String,
      enum: ["ACTIVE", "PAUSED", "EXPIRED"],
      default: "ACTIVE",
    },
    isPilot: { type: Boolean, default: false },
    totalSubmissions: { type: Number, default: 0 },
    lastSubmissionAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Index on token is created via unique: true
SurveyLinkSchema.index({ campaignId: 1, provinceCode: 1 }, { unique: true });
SurveyLinkSchema.index({ status: 1 });

export const SurveyLink: Model<ISurveyLink> =
  mongoose.models.SurveyLink || mongoose.model<ISurveyLink>("SurveyLink", SurveyLinkSchema);

export default SurveyLink;
