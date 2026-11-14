import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { SurveySchemaConfig } from "@/models/SurveySchemaConfig";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ version: string }> }
) {
  try {
    const { version } = await params;
    const reqVersion = version || "3.3";

    try {
      await connectToDatabase();
      const dbConfig = await SurveySchemaConfig.findOne({ version: reqVersion });
      if (dbConfig) {
        return NextResponse.json({
          success: true,
          data: dbConfig,
        });
      }
    } catch (_) {
      // Offline fallback
    }

    // Fallback to local JSON seed file if database does not contain it yet
    const localSeedPath = path.join(
      process.cwd(),
      `src/data/seed-schema-${reqVersion}.json`
    );

    if (fs.existsSync(localSeedPath)) {
      const rawData = fs.readFileSync(localSeedPath, "utf-8");
      const localConfig = JSON.parse(rawData);
      return NextResponse.json({
        success: true,
        data: localConfig,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SCHEMA_NOT_FOUND",
          message: `Không tìm thấy cấu hình bộ phiếu phiên bản ${reqVersion}`,
        },
      },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error in schema route:", error);
    // If DB fails, try fallback to JSON file directly
    try {
      const fallbackPath = path.join(process.cwd(), "src/data/seed-schema-3.3.json");
      if (fs.existsSync(fallbackPath)) {
        const localConfig = JSON.parse(fs.readFileSync(fallbackPath, "utf-8"));
        return NextResponse.json({
          success: true,
          data: localConfig,
        });
      }
    } catch (_) {}

    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Lỗi tải cấu hình bộ câu hỏi" },
      },
      { status: 500 }
    );
  }
}
