import { NextRequest, NextResponse } from "next/server";
import { AnalyticsAggregationService } from "@/services/analytics-aggregation.service";
import { ExcelExportService } from "@/services/excel-export.service";
import { logActionFromRequest } from "@/lib/audit-logger";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId") || undefined;
    const provinceCode = searchParams.get("provinceCode") || undefined;
    const agencyCode = searchParams.get("agencyCode") || undefined;
    const mode = (searchParams.get("mode") as "INTERNAL" | "LOCAL_CONFIDENTIAL") || "INTERNAL";

    // Truy vấn dữ liệu tổng hợp 6 bảng
    const allTables = await AnalyticsAggregationService.generateAllTables({
      campaignId,
      provinceCode,
      agencyCode,
    });

    const provinceName = provinceCode ? `Tỉnh ${provinceCode}` : "Toàn quốc";
    const buffer = await ExcelExportService.generateWorkbookBuffer(allTables, {
      mode,
      provinceName,
    });

    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const modeSuffix = mode === "LOCAL_CONFIDENTIAL" ? "DiaPhuong_AnDanh" : "NoiBo_KiemToan";
    const filename = `BaoCao_KhaoSat_KiemToan_${modeSuffix}_${timestamp}.xlsx`;

    // Ghi log xuất file Excel
    await logActionFromRequest(request, {
      action: "EXPORT_EXCEL",
      module: "ANALYTICS",
      description: `Xuất file Báo cáo tổng hợp Excel 6 Bảng (${mode === "INTERNAL" ? "Nội bộ KTNN" : "Ẩn danh Địa phương"}) cho ${provinceName}`,
      targetResource: "Excel Report",
      details: {
        mode,
        provinceCode: provinceCode || "ALL",
        agencyCode: agencyCode || "ALL",
        filesizeBytes: buffer.length,
      },
      status: "SUCCESS",
    });

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("[API_EXPORT_EXCEL_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: "Không thể tạo file báo cáo Excel",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
