import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBenchmarkMatrix extends Document {
  schemaVersion: string;
  workgroupId: string;
  roleId: "DIRECT" | "ADVISORY" | "SUPERVISORY" | "APPROVAL";
  requiredLevel: number;
  rationale?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BenchmarkMatrixSchema = new Schema<IBenchmarkMatrix>(
  {
    schemaVersion: { type: String, required: true, trim: true },
    workgroupId: { type: String, required: true, trim: true },
    roleId: {
      type: String,
      enum: ["DIRECT", "ADVISORY", "SUPERVISORY", "APPROVAL"],
      required: true,
    },
    requiredLevel: { type: Number, required: true, min: 1, max: 4 },
    rationale: { type: String },
  },
  {
    timestamps: true,
  }
);

BenchmarkMatrixSchema.index(
  { schemaVersion: 1, workgroupId: 1, roleId: 1 },
  { unique: true }
);

export const BenchmarkMatrix: Model<IBenchmarkMatrix> =
  mongoose.models.BenchmarkMatrix ||
  mongoose.model<IBenchmarkMatrix>("BenchmarkMatrix", BenchmarkMatrixSchema);

export default BenchmarkMatrix;
