import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
  const startTime = Date.now();
  let dbStatus = "DISCONNECTED";

  try {
    await connectToDatabase();
    if (mongoose.connection.readyState === 1) {
      dbStatus = "CONNECTED";
    } else if (mongoose.connection.readyState === 2) {
      dbStatus = "CONNECTING";
    }
  } catch (err: any) {
    dbStatus = "ERROR: " + err?.message;
  }

  const responseTimeMs = Date.now() - startTime;

  return NextResponse.json({
    status: dbStatus === "CONNECTED" ? "HEALTHY" : "DEGRADED",
    appName: "khaosat",
    version: "1.0.0",
    schemaVersion: "3.3",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      readyState: mongoose.connection.readyState,
    },
    system: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      responseTimeMs,
    },
  });
}
