import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { AdministrativeUnitsService } from "@/services/administrative-units.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "excel";
    const provinceCode = searchParams.get("provinceCode") || undefined;

    const provinces = await AdministrativeUnitsService.getProvinces();
    const communesRes = await AdministrativeUnitsService.getCommunes({
      provinceCode,
      limit: 10000,
    });
    const communes = communesRes.items;

    if (format === "json") {
      return NextResponse.json({
        success: true,
        data: {
          provinces,
          communes,
          exportedAt: new Date().toISOString(),
        },
      });
    }

    // Xuất file Excel (.xlsx) chuẩn
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Hệ thống Khảo sát Kiểm toán nhà nước";
    workbook.created = new Date();

    // Sheet 1: Danh mục Tỉnh / Thành phố
    const provSheet = workbook.addWorksheet("34 Tỉnh - Thành phố", {
      views: [{ showGridLines: true }],
    });

    provSheet.columns = [
      { header: "STT", key: "stt", width: 8 },
      { header: "Mã Tỉnh", key: "code", width: 12 },
      { header: "Tên Tỉnh/Thành", key: "name", width: 25 },
      { header: "Tên Đầy Đủ", key: "fullName", width: 35 },
      { header: "Phân Loại", key: "type", width: 18 },
      { header: "Số Xã/Phường", key: "communeCount", width: 16 },
      { header: "Chỉ Tiêu Khảo Sát", key: "target", width: 18 },
      { header: "Trạng Thái", key: "status", width: 16 },
    ];

    // Style Header
    const provHeaderRow = provSheet.getRow(1);
    provHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    provHeaderRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0369A1" }, // Sky-700
    };
    provHeaderRow.alignment = { vertical: "middle", horizontal: "center" };

    provinces.forEach((p, idx) => {
      provSheet.addRow({
        stt: idx + 1,
        code: p.provinceCode,
        name: p.name,
        fullName: p.fullName,
        type: p.type,
        communeCount: p.communeCount,
        target: p.targetRespondents,
        status: p.isActive ? "Đang hoạt động" : "Tạm dừng",
      });
    });

    // Sheet 2: Danh mục Xã / Phường / Thị trấn / Đặc khu
    const sheetTitle = provinceCode
      ? `Xã - Phường (${provinceCode})`
      : "Toàn bộ Xã - Phường (3321)";
    const comSheet = workbook.addWorksheet(sheetTitle.substring(0, 31), {
      views: [{ showGridLines: true }],
    });

    comSheet.columns = [
      { header: "STT", key: "stt", width: 8 },
      { header: "Mã Xã", key: "code", width: 14 },
      { header: "Tên Xã/Phường", key: "name", width: 30 },
      { header: "Phân Loại", key: "type", width: 16 },
      { header: "Mã Tỉnh", key: "provCode", width: 12 },
      { header: "Tỉnh / Thành phố", key: "provName", width: 28 },
      { header: "Quận/Huyện cũ", key: "district", width: 22 },
      { header: "Mã Bưu chính", key: "postal", width: 15 },
      { header: "Diện tích (km²)", key: "area", width: 16 },
      { header: "Dân số (người)", key: "population", width: 18 },
      { header: "Căn cứ pháp lý / Nghị quyết", key: "resolution", width: 35 },
      { header: "Trạng Thái", key: "status", width: 16 },
    ];

    const comHeaderRow = comSheet.getRow(1);
    comHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    comHeaderRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F766E" }, // Teal-700
    };
    comHeaderRow.alignment = { vertical: "middle", horizontal: "center" };

    communes.forEach((c, idx) => {
      comSheet.addRow({
        stt: idx + 1,
        code: c.communeCode,
        name: c.name,
        type: c.type,
        provCode: c.provinceCode,
        provName: c.provinceName,
        district: c.districtName || "",
        postal: c.postalCode || "",
        area: c.areaKm2 ?? "",
        population: c.population ?? "",
        resolution: c.resolution || "",
        status: c.isActive ? "Đang hoạt động" : "Tạm dừng",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `Danh_muc_DVHC_2026_${new Date().toISOString().split("T")[0]}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("[DVHC_EXPORT_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Không thể xuất danh mục ĐVHC", details: error?.message },
      { status: 500 }
    );
  }
}
