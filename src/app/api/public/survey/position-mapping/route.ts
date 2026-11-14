import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { PositionWorkgroupsMapping } from "@/models/PositionWorkgroupsMapping";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const agencyCode = searchParams.get("agencyCode");
    const positionCode = searchParams.get("positionCode");
    const schemaVersion = searchParams.get("version") || "3.3";

    let mappings: any[] = [];
    try {
      await connectToDatabase();
      const query: Record<string, string> = { schemaVersion };
      if (agencyCode) query.agencyCode = agencyCode;
      if (positionCode) query.positionCode = positionCode;
      mappings = await PositionWorkgroupsMapping.find(query);
    } catch (_) {
      // Offline fallback
    }

    if (mappings && mappings.length > 0) {
      if (agencyCode && positionCode && mappings.length === 1) {
        return NextResponse.json({
          success: true,
          data: mappings[0],
        });
      }
      return NextResponse.json({
        success: true,
        data: mappings,
      });
    }

    // Fallback to local JSON seed file
    const localSeedPath = path.join(
      process.cwd(),
      "src/data/seed-position-mappings.json"
    );
    if (fs.existsSync(localSeedPath)) {
      const allMappings: any[] = JSON.parse(
        fs.readFileSync(localSeedPath, "utf-8")
      );
      let filtered = allMappings.filter(
        (m) => m.schemaVersion === schemaVersion
      );
      if (agencyCode) {
        filtered = filtered.filter((m) => m.agencyCode === agencyCode);
      }
      if (positionCode) {
        filtered = filtered.filter((m) => m.positionCode === positionCode);
      }

      if (agencyCode && positionCode && filtered.length > 0) {
        return NextResponse.json({
          success: true,
          data: filtered[0],
        });
      }

      return NextResponse.json({
        success: true,
        data: filtered,
      });
    }

    return NextResponse.json({
      success: true,
      data: [],
    });
  } catch (error) {
    console.error("Error in position-mapping route:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Lỗi tải cấu hình vị trí" },
      },
      { status: 500 }
    );
  }
}
