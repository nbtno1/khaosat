import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { SurveyResponse } from "@/models/SurveyResponse";
import { ExcelExportService } from "@/services/excel-export.service";
import { logActionFromRequest } from "@/lib/audit-logger";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Yêu cầu đăng nhập." },
        { status: 401 }
      );
    }

    // Kiểm tra phân quyền: Đầu mối địa phương tuyệt đối cấm truy cập dữ liệu gốc (Spec 05 UC-15 & BR-16)
    if (
      session.role !== "TECHNICAL_ADMIN" &&
      session.role !== "SYSTEM_ADMIN" &&
      session.role !== "CONTENT_ADMIN" &&
      session.role !== "REVIEWER"
    ) {
      // Ghi log cảnh báo an ninh truy cập trái phép
      await logActionFromRequest(req, {
        action: "UNAUTHORIZED_RAW_DATA_ACCESS",
        module: "ANALYTICS",
        description: `Tài khoản ${session.username} cố ý truy cập tệp dữ liệu gốc (Raw Data) không có thẩm quyền.`,
        status: "WARNING",
      });

      return NextResponse.json(
        {
          success: false,
          error: "Bạn không có quyền truy cập hoặc trích xuất tệp Dữ liệu gốc (Raw Data).",
        },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const provinceCode = searchParams.get("provinceCode");

    const query: Record<string, any> = {};
    if (provinceCode && provinceCode !== "ALL") {
      query["part1.provinceCode"] = provinceCode;
    }

    const responses = await SurveyResponse.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const buffer = await ExcelExportService.generateRawDataWorkbookBuffer(responses, {
      provinceName: provinceCode && provinceCode !== "ALL" ? `Tỉnh mã ${provinceCode}` : "Toàn quốc",
      campaignTitle: "Đợt 1 năm 2026",
    });

    // Ghi log kiểm toán thao tác xuất dữ liệu thô
    await logActionFromRequest(req, {
      action: "EXPORT_RAW_DATA",
      module: "ANALYTICS",
      description: `Xuất tệp dữ liệu gốc (Raw Data) gồm ${responses.length} phiếu (${provinceCode || "Toàn quốc"})`,
      targetResource: "SurveyResponse",
      details: {
        totalRecords: responses.length,
        provinceCode: provinceCode || "ALL",
      },
    });

    const filename = `Du_Lieu_Goc_Khao_Sat_${provinceCode || "ToanQuoc"}_${new Date().toISOString().split("T")[0]}.xlsx`;

    return new NextResponse(buffer as any, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi khi xuất tệp dữ liệu gốc." },
      { status: 500 }
    );
  }
}
