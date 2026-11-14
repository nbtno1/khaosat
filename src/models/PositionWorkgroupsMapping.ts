import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPositionWorkgroupsMapping extends Document {
  schemaVersion: string;
  agencyCode: string;
  agencyName: string;
  positionCode: string;
  positionTitle: string;
  suggestedWorkgroupIds: string[];
  commonRoleId: "DIRECT" | "ADVISORY" | "SUPERVISORY" | "APPROVAL";
  estimatedMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}

const PositionWorkgroupsMappingSchema = new Schema<IPositionWorkgroupsMapping>(
  {
    schemaVersion: { type: String, required: true, trim: true },
    agencyCode: { type: String, required: true, trim: true },
    agencyName: { type: String, required: true },
    positionCode: { type: String, required: true, trim: true },
    positionTitle: { type: String, required: true },
    suggestedWorkgroupIds: { type: [String], required: true },
    commonRoleId: {
      type: String,
      enum: ["DIRECT", "ADVISORY", "SUPERVISORY", "APPROVAL"],
      required: true,
    },
    estimatedMinutes: { type: Number, required: true, default: 15 },
  },
  {
    timestamps: true,
  }
);

PositionWorkgroupsMappingSchema.index(
  { schemaVersion: 1, agencyCode: 1, positionCode: 1 },
  { unique: true }
);

export const PositionWorkgroupsMapping: Model<IPositionWorkgroupsMapping> =
  mongoose.models.PositionWorkgroupsMapping ||
  mongoose.model<IPositionWorkgroupsMapping>(
    "PositionWorkgroupsMapping",
    PositionWorkgroupsMappingSchema
  );

export default PositionWorkgroupsMapping;
