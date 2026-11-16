import mongoose, { Schema, Document, Model } from "mongoose";

export type AuditLogStatus = "SUCCESS" | "FAILED" | "WARNING";

export interface IAuditLog extends Document {
  userId?: string;
  username: string;
  userFullName?: string;
  userRole?: string;
  organization?: string;
  action: string;
  module: string;
  description: string;
  targetResource?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  status: AuditLogStatus;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: String, required: false, default: null },
    username: { type: String, required: true, index: true },
    userFullName: { type: String, default: "" },
    userRole: { type: String, default: "" },
    organization: { type: String, default: "" },
    action: { type: String, required: true, index: true },
    module: { type: String, required: true, index: true },
    description: { type: String, required: true },
    targetResource: { type: String, default: null },
    targetId: { type: String, default: null },
    details: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: "127.0.0.1" },
    userAgent: { type: String, default: "" },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "WARNING"],
      default: "SUCCESS",
      index: true,
    },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ module: 1, action: 1 });
AuditLogSchema.index({ username: 1, createdAt: -1 });

// Xóa model cũ nếu đang chạy dev hot-reload để tránh schema caching
if (process.env.NODE_ENV !== "production" && mongoose.models?.AuditLog) {
  delete (mongoose.models as any).AuditLog;
}

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);

export default AuditLog;
