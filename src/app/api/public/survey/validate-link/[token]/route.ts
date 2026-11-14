import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { SurveyLink } from "@/models/SurveyLink";
import { Campaign } from "@/models/Campaign";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_TOKEN", message: "Mã liên kết không hợp lệ" },
        },
        { status: 400 }
      );
    }

    let link: any = null;
    let campaign: any = null;

    try {
      await connectToDatabase();
      link = await SurveyLink.findOne({ token });
      if (link) {
        campaign = await Campaign.findById(link.campaignId);
      }
    } catch (_) {
      // Offline fallback
    }

    // Pilot link fallback if DB is offline or in test environment
    if (!link && token.startsWith("pilot_")) {
      const pilotMatch = token.match(/_p([0-9]+)$/);
      const provCode = pilotMatch ? pilotMatch[1] : "01";
      link = {
        _id: "pilot_link_id",
        provinceCode: provCode,
        provinceName: provCode === "01" ? "Thành phố Hà Nội" : `Tỉnh/Thành phố mã ${provCode}`,
        status: "ACTIVE",
        isPilot: true,
      };
      campaign = {
        _id: "pilot_campaign_id",
        code: "DOT-1-2026",
        title: "Đợt khảo sát năng lực quản lý tài chính, tài sản công cấp xã năm 2026",
        schemaVersion: "3.3",
        status: "OPEN",
      };
    }

    if (!link || link.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "LINK_NOT_FOUND",
            message: "Đường dẫn khảo sát không tồn tại hoặc đã tạm dừng.",
          },
        },
        { status: 404 }
      );
    }

    if (!campaign || campaign.status !== "OPEN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CAMPAIGN_NOT_OPEN",
            message: "Đợt khảo sát chưa mở hoặc đã kết thúc.",
          },
        },
        { status: 403 }
      );
    }

    // Load communes for this province
    // Check pilot file fallback
    const pilotPath = path.join(process.cwd(), "src/data/seed-provinces-pilot.json");
    let communes: Array<{ code: string; name: string; districtName?: string }> = [];

    if (fs.existsSync(pilotPath)) {
      const pilotData = JSON.parse(fs.readFileSync(pilotPath, "utf-8"));
      communes = pilotData.pilotCommunes
        .filter((c: any) => c.provinceCode === link.provinceCode)
        .map((c: any) => ({
          code: c.communeCode,
          name: c.communeName,
          districtName: c.districtName,
        }));
    }

    return NextResponse.json({
      success: true,
      data: {
        isValid: true,
        linkId: link._id,
        campaignId: campaign._id,
        campaignCode: campaign.code,
        campaignTitle: campaign.title,
        schemaVersion: campaign.schemaVersion || "3.3",
        provinceCode: link.provinceCode,
        provinceName: link.provinceName,
        communes,
        isPilot: link.isPilot,
        status: link.status,
      },
    });
  } catch (error) {
    console.error("Error in validate-link route:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Lỗi máy chủ khi xác thực liên kết" },
      },
      { status: 500 }
    );
  }
}
