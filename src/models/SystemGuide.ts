import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISystemGuideSection extends Document {
  sectionKey: string; // e.g., "OVERVIEW", "SURVEY_STEPS", "RBAC_ROLES", "DUPLICATE_WORKBENCH", "ANALYTICS_TABLES", "SUPPRESSION_EXCEL"
  title: string;
  category: "SURVEY_RESPONDENT" | "ADMIN_OPERATOR" | "TECHNICAL";
  contentMarkdown: string;
  adminNotes?: string;
  order: number;
  isPublished: boolean;
  lastUpdatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SystemGuideSectionSchema = new Schema<ISystemGuideSection>(
  {
    sectionKey: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ["SURVEY_RESPONDENT", "ADMIN_OPERATOR", "TECHNICAL"],
      required: true,
    },
    contentMarkdown: { type: String, required: true },
    adminNotes: { type: String },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    lastUpdatedBy: { type: String, default: "Hệ thống Kiểm toán nhà nước" },
  },
  {
    timestamps: true,
  }
);

// Indexes
SystemGuideSectionSchema.index({ category: 1, order: 1 });

export const SystemGuide: Model<ISystemGuideSection> =
  mongoose.models.SystemGuide ||
  mongoose.model<ISystemGuideSection>("SystemGuide", SystemGuideSectionSchema);

export default SystemGuide;
