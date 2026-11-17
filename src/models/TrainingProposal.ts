import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProposedTopic {
  workgroupId: number;
  workgroupTitle: string;
  topicId: string;
  topicTitle: string;
  targetAudience: string;
  reason: string;
  gapSummary: string;
  suggestedDuration: string;
}

export interface ITrainingProposal extends Document {
  provinceCode: string;
  provinceName: string;
  campaignCode: string;
  schemaVersion: string;
  title: string;
  proposalDate: Date;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "PUBLISHED";
  
  // 12 Mục tiêu chí chuẩn theo Thuyết minh Phần V Mục 3
  item1_meta: {
    provinceName: string;
    proposalDate: string;
    schemaVersion: string;
  };
  item2_dataBasis: {
    totalRespondents: number;
    totalCommunes: number;
    validCount: number;
    excludedCount: number;
    outOfScopeCount: number;
  };
  item3_proposedTopics: IProposedTopic[];
  item4_selectionReasons: string;
  item5_capacityGapAnalysis: string;
  item6_suggestedFormats: string[];
  item7_timingAndDuration: string;
  item8_noChanceModule: string;
  item9_smallGroupStrategy: string;
  item10_institutionalRecommendations: string;
  item11_legalDisclaimer: string;
  item12_approval: {
    createdByName: string;
    createdByTitle: string;
    approvedByName?: string;
    approvedByTitle?: string;
    approvedAt?: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

const ProposedTopicSchema = new Schema<IProposedTopic>(
  {
    workgroupId: { type: Number, required: true },
    workgroupTitle: { type: String, required: true },
    topicId: { type: String, required: true },
    topicTitle: { type: String, required: true },
    targetAudience: { type: String, required: true },
    reason: { type: String, required: true },
    gapSummary: { type: String, required: true },
    suggestedDuration: { type: String, default: "2 - 3 ngày" },
  },
  { _id: false }
);

const TrainingProposalSchema = new Schema<ITrainingProposal>(
  {
    provinceCode: { type: String, required: true },
    provinceName: { type: String, required: true },
    campaignCode: { type: String, default: "DOT-1-2026" },
    schemaVersion: { type: String, default: "3.3" },
    title: { type: String, required: true },
    proposalDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["DRAFT", "SUBMITTED", "APPROVED", "PUBLISHED"],
      default: "DRAFT",
    },

    item1_meta: {
      provinceName: { type: String, required: true },
      proposalDate: { type: String, required: true },
      schemaVersion: { type: String, default: "3.3" },
    },
    item2_dataBasis: {
      totalRespondents: { type: Number, default: 0 },
      totalCommunes: { type: Number, default: 0 },
      validCount: { type: Number, default: 0 },
      excludedCount: { type: Number, default: 0 },
      outOfScopeCount: { type: Number, default: 0 },
    },
    item3_proposedTopics: [ProposedTopicSchema],
    item4_selectionReasons: { type: String, default: "" },
    item5_capacityGapAnalysis: { type: String, default: "" },
    item6_suggestedFormats: { type: [String], default: [] },
    item7_timingAndDuration: { type: String, default: "" },
    item8_noChanceModule: { type: String, default: "" },
    item9_smallGroupStrategy: { type: String, default: "" },
    item10_institutionalRecommendations: { type: String, default: "" },
    item11_legalDisclaimer: {
      type: String,
      default:
        "Kết quả khảo sát phản ánh tự đánh giá của cán bộ tại thời điểm khảo sát, chưa qua kiểm chứng bằng trắc nghiệm hoặc sát hạch năng lực độc lập. Không sử dụng kết quả này để xếp loại, đánh giá thi đua cá nhân hoặc xếp hạng các địa phương.",
    },
    item12_approval: {
      createdByName: { type: String, required: true },
      createdByTitle: { type: String, default: "Đại diện Khoa Chuyên môn" },
      approvedByName: { type: String },
      approvedByTitle: { type: String, default: "Lãnh đạo Trường ĐT&BD nghiệp vụ kiểm toán" },
      approvedAt: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

TrainingProposalSchema.index({ provinceCode: 1, campaignCode: 1 });
TrainingProposalSchema.index({ status: 1 });

export const TrainingProposal: Model<ITrainingProposal> =
  mongoose.models.TrainingProposal ||
  mongoose.model<ITrainingProposal>("TrainingProposal", TrainingProposalSchema);

export default TrainingProposal;
