import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole =
  | "TECHNICAL_ADMIN"
  | "CONTENT_ADMIN"
  | "REVIEWER"
  | "PROGRESS_MONITOR"
  | "LOCAL_COORDINATOR";

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  fullName: string;
  organization: string;
  role: UserRole;
  assignedProvinceCodes: string[];
  isActive: boolean;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true },
    organization: { type: String, required: true },
    role: {
      type: String,
      enum: ["TECHNICAL_ADMIN", "CONTENT_ADMIN", "REVIEWER", "PROGRESS_MONITOR", "LOCAL_COORDINATOR"],
      required: true,
    },
    assignedProvinceCodes: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Indexes on username and email are created via unique: true
UserSchema.index({ role: 1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
