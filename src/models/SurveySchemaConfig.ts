import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILearningTopic {
  topicId: string;
  topicTitle: string;
}

export interface IWorkgroupConfig {
  id: string; // e.g., "N01"
  order: number; // 1 - 16
  title: string;
  description: string;
  learningTopics: ILearningTopic[];
}

export interface IRoleConfig {
  roleId: "DIRECT" | "ADVISORY" | "SUPERVISORY" | "APPROVAL";
  title: string;
  description: string;
  levelDescriptions: {
    "1": string;
    "2": string;
    "3": string;
    "4": string;
  };
}

export interface IDifficultyConfig {
  id: string;
  title: string;
  isExclusive?: boolean;
}

export interface ILearningFormatConfig {
  id: string;
  title: string;
}

export interface IQuestionConfig {
  id: string; // e.g. "Q01", "Q02", ..., "Q14"
  order: number;
  section: "PART_I" | "PART_II" | "PART_III" | "PART_IV";
  title: string;
  description?: string;
  instruction?: string;
  isRequired: boolean;
  maxSelect?: number;
  isExclusiveSupported?: boolean;
}

export interface ISurveySchemaConfig extends Document {
  version: string; // e.g., "3.3"
  isApproved: boolean;
  approvedAt?: Date;
  approvedBy?: string;
  title?: string;
  description?: string;
  workgroups: IWorkgroupConfig[];
  roles: IRoleConfig[];
  difficulties: IDifficultyConfig[];
  learningFormats: ILearningFormatConfig[];
  questions?: IQuestionConfig[];
  createdAt: Date;
  updatedAt: Date;
}

const LearningTopicSchema = new Schema<ILearningTopic>(
  {
    topicId: { type: String, required: true },
    topicTitle: { type: String, required: true },
  },
  { _id: false }
);

const WorkgroupConfigSchema = new Schema<IWorkgroupConfig>(
  {
    id: { type: String, required: true },
    order: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    learningTopics: { type: [LearningTopicSchema], default: [] },
  },
  { _id: false }
);

const RoleConfigSchema = new Schema<IRoleConfig>(
  {
    roleId: {
      type: String,
      enum: ["DIRECT", "ADVISORY", "SUPERVISORY", "APPROVAL"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    levelDescriptions: {
      "1": { type: String, required: true },
      "2": { type: String, required: true },
      "3": { type: String, required: true },
      "4": { type: String, required: true },
    },
  },
  { _id: false }
);

const DifficultyConfigSchema = new Schema<IDifficultyConfig>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    isExclusive: { type: Boolean, default: false },
  },
  { _id: false }
);

const LearningFormatConfigSchema = new Schema<ILearningFormatConfig>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
  },
  { _id: false }
);

const QuestionConfigSchema = new Schema<IQuestionConfig>(
  {
    id: { type: String, required: true },
    order: { type: Number, required: true },
    section: {
      type: String,
      enum: ["PART_I", "PART_II", "PART_III", "PART_IV"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    instruction: { type: String },
    isRequired: { type: Boolean, default: true },
    maxSelect: { type: Number },
    isExclusiveSupported: { type: Boolean, default: false },
  },
  { _id: false }
);

const SurveySchemaConfigSchema = new Schema<ISurveySchemaConfig>(
  {
    version: { type: String, required: true, unique: true, trim: true },
    title: { type: String },
    description: { type: String },
    isApproved: { type: Boolean, default: false },
    approvedAt: { type: Date },
    approvedBy: { type: String },
    workgroups: { type: [WorkgroupConfigSchema], required: true },
    roles: { type: [RoleConfigSchema], required: true },
    difficulties: { type: [DifficultyConfigSchema], required: true },
    learningFormats: { type: [LearningFormatConfigSchema], required: true },
    questions: { type: [QuestionConfigSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

// Index on version is already created via unique: true
export const SurveySchemaConfig: Model<ISurveySchemaConfig> =
  mongoose.models.SurveySchemaConfig ||
  mongoose.model<ISurveySchemaConfig>("SurveySchemaConfig", SurveySchemaConfigSchema);

export default SurveySchemaConfig;
