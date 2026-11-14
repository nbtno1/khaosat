import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProvince extends Document {
  provinceCode: string; // e.g. "01", "19", "79"
  name: string; // e.g. "Hà Nội"
  fullName: string; // e.g. "Thành phố Hà Nội"
  type: string; // "Thành phố" | "Tỉnh"
  communeCount: number; // e.g. 126
  url?: string;
  targetRespondents: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProvinceSchema = new Schema<IProvince>(
  {
    provinceCode: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    type: { type: String, default: "Tỉnh" },
    communeCount: { type: Number, default: 0 },
    url: { type: String },
    targetRespondents: { type: Number, default: 100 },
  },
  {
    timestamps: true,
  }
);

export const Province: Model<IProvince> =
  mongoose.models.Province || mongoose.model<IProvince>("Province", ProvinceSchema);

export default Province;
