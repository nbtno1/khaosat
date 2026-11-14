import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type WorkgroupStatus =
  | "CURRENTLY_DOING"
  | "ASSIGNED_NOT_YET"
  | "COORDINATING_ONLY"
  | "NOT_ASSIGNED";

export type RoleType = "DIRECT" | "ADVISORY" | "SUPERVISORY" | "APPROVAL";
export type UrgencyLevel = "IMMEDIATE_6M" | "WITHIN_YEAR" | "AFTER_1Y";
export type ReviewStatus = "VALID" | "EXCLUDED" | "PENDING_REVIEW";

export interface IPart1Info {
  provinceCode: string;
  provinceName: string;
  communeCode: string;
  communeName: string;
  agencyCode: string;
  agencyName: string;
  positionCode: string;
  positionTitle: string;
  positionOtherText?: string | null;
  capacities: string[];
  capacitiesOtherText?: string | null;
  experienceYears: "LT_1" | "1_TO_3" | "GT_3";
}

export interface IWorkgroupStatusItem {
  workgroupId: string;
  status: WorkgroupStatus;
}

export interface IPart2Info {
  workgroupStatuses: IWorkgroupStatusItem[];
  otherWorkText?: string | null;
}

export interface IRoleEvaluation {
  roleId: RoleType;
  selfAssessedLevel: number;
}

export interface IPart3GroupEvaluation {
  workgroupId: string;
  status: "CURRENTLY_DOING" | "ASSIGNED_NOT_YET";
  roles: RoleType[];
  evaluations: IRoleEvaluation[];
  difficulties: string[];
  selectedTopics: string[];
  selectedTopicsOtherText?: string | null;
  urgencyLevel?: UrgencyLevel | null;
}

export interface IPart4Info {
  preferredFormats: string[];
  otherOpinions?: string | null;
}

export interface ISurveyResponse extends Document {
  campaignId: Types.ObjectId;
  linkId: Types.ObjectId;
  schemaVersion: string;
  part1: IPart1Info;
  part2: IPart2Info;
  part3: IPart3GroupEvaluation[];
  part4: IPart4Info;
  isOutOfScope: boolean;
  businessHash: string;
  isSuspectedDuplicate: boolean;
  duplicateGroupId?: string | null;
  reviewStatus: ReviewStatus;
  exclusionReason?: string | null;
  reviewedBy?: Types.ObjectId | null;
  reviewedAt?: Date | null;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const Part1InfoSchema = new Schema<IPart1Info>(
  {
    provinceCode: { type: String, required: true },
    provinceName: { type: String, required: true },
    communeCode: { type: String, required: true },
    communeName: { type: String, required: true },
    agencyCode: { type: String, required: true },
    agencyName: { type: String, required: true },
    positionCode: { type: String, required: true },
    positionTitle: { type: String, required: true },
    positionOtherText: { type: String, default: null },
    capacities: { type: [String], required: true },
    capacitiesOtherText: { type: String, default: null },
    experienceYears: {
      type: String,
      enum: ["LT_1", "1_TO_3", "GT_3"],
      required: true,
    },
  },
  { _id: false }
);

const WorkgroupStatusItemSchema = new Schema<IWorkgroupStatusItem>(
  {
    workgroupId: { type: String, required: true },
    status: {
      type: String,
      enum: ["CURRENTLY_DOING", "ASSIGNED_NOT_YET", "COORDINATING_ONLY", "NOT_ASSIGNED"],
      required: true,
    },
  },
  { _id: false }
);

const Part2InfoSchema = new Schema<IPart2Info>(
  {
    workgroupStatuses: { type: [WorkgroupStatusItemSchema], required: true },
    otherWorkText: { type: String, default: null },
  },
  { _id: false }
);

const RoleEvaluationSchema = new Schema<IRoleEvaluation>(
  {
    roleId: {
      type: String,
      enum: ["DIRECT", "ADVISORY", "SUPERVISORY", "APPROVAL"],
      required: true,
    },
    selfAssessedLevel: { type: Number, required: true, min: 1, max: 4 },
  },
  { _id: false }
);

const Part3GroupEvaluationSchema = new Schema<IPart3GroupEvaluation>(
  {
    workgroupId: { type: String, required: true },
    status: {
      type: String,
      enum: ["CURRENTLY_DOING", "ASSIGNED_NOT_YET"],
      required: true,
    },
    roles: {
      type: [String],
      enum: ["DIRECT", "ADVISORY", "SUPERVISORY", "APPROVAL"],
      required: true,
    },
    evaluations: { type: [RoleEvaluationSchema], required: true },
    difficulties: { type: [String], default: [] },
    selectedTopics: { type: [String], default: [] },
    selectedTopicsOtherText: { type: String, default: null },
    urgencyLevel: {
      type: String,
      enum: ["IMMEDIATE_6M", "WITHIN_YEAR", "AFTER_1Y", null],
      default: null,
    },
  },
  { _id: false }
);

const Part4InfoSchema = new Schema<IPart4Info>(
  {
    preferredFormats: { type: [String], required: true },
    otherOpinions: { type: String, default: null },
  },
  { _id: false }
);

const SurveyResponseSchema = new Schema<ISurveyResponse>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: "Campaign", required: true },
    linkId: { type: Schema.Types.ObjectId, ref: "SurveyLink", required: true },
    schemaVersion: { type: String, required: true, default: "3.3" },
    part1: { type: Part1InfoSchema, required: true },
    part2: { type: Part2InfoSchema, required: true },
    part3: { type: [Part3GroupEvaluationSchema], default: [] },
    part4: { type: Part4InfoSchema, required: true },
    isOutOfScope: { type: Boolean, default: false },
    businessHash: { type: String, required: true },
    isSuspectedDuplicate: { type: Boolean, default: false },
    duplicateGroupId: { type: String, default: null },
    reviewStatus: {
      type: String,
      enum: ["VALID", "EXCLUDED", "PENDING_REVIEW"],
      default: "VALID",
    },
    exclusionReason: { type: String, default: null },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    submittedAt: { type: Date, default: Date.now, required: true },
  },
  {
    timestamps: true,
  }
);

SurveyResponseSchema.index({ campaignId: 1, "part1.provinceCode": 1, reviewStatus: 1 });
SurveyResponseSchema.index({ campaignId: 1, schemaVersion: 1, reviewStatus: 1 });
SurveyResponseSchema.index({ businessHash: 1, campaignId: 1 });
SurveyResponseSchema.index({ linkId: 1 });
SurveyResponseSchema.index({ submittedAt: 1 });

export const SurveyResponse: Model<ISurveyResponse> =
  mongoose.models.SurveyResponse ||
  mongoose.model<ISurveyResponse>("SurveyResponse", SurveyResponseSchema);

export default SurveyResponse;
