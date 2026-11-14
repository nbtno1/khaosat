import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICommune extends Document {
  communeCode: string; // e.g. "00004", unique
  name: string; // e.g. "Phường Ba Đình"
  type: string; // "Phường" | "Xã" | "Thị trấn"
  provinceCode: string; // e.g. "01"
  provinceName: string; // e.g. "Thành phố Hà Nội"
  postalCode?: string; // e.g. "11120"
  areaKm2?: number; // e.g. 2.97
  population?: number; // e.g. 65023
  resolution?: string; // e.g. "Nghị quyết số 1656/NQ-UBTVQH15"
  url?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommuneSchema = new Schema<ICommune>(
  {
    communeCode: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, default: "Xã" },
    provinceCode: { type: String, required: true, trim: true },
    provinceName: { type: String, required: true, trim: true },
    postalCode: { type: String },
    areaKm2: { type: Number },
    population: { type: Number },
    resolution: { type: String },
    url: { type: String },
  },
  {
    timestamps: true,
  }
);

CommuneSchema.index({ provinceCode: 1, communeCode: 1 });
CommuneSchema.index({ name: "text" });

export const Commune: Model<ICommune> =
  mongoose.models.Commune || mongoose.model<ICommune>("Commune", CommuneSchema);

export default Commune;
