import ExcelJS from "exceljs";
import { StatisticalDisclosureService, SUPPRESSED_LABEL } from "./statistical-disclosure.service";

export interface ExportOptions {
  mode: "INTERNAL" | "LOCAL_CONFIDENTIAL";
  provinceName?: string;
  campaignTitle?: string;
}

const NAVY_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1E3A8A" }, // Dark Navy
};

const SUBHEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF2563EB" }, // Royal Blue
};

const SECTION_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFF1F5F9" }, // Slate 100
};

const WHITE_BOLD_FONT: Partial<ExcelJS.Font> = {
  name: "Calibri",
  size: 11,
  bold: true,
  color: { argb: "FFFFFFFF" },
};

const THIN_BORDER: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFE2E8F0" } },
  left: { style: "thin", color: { argb: "FFE2E8F0" } },
  bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
  right: { style: "thin", color: { argb: "FFE2E8F0" } },
};

export class ExcelExportService {
  /**
   * Tạo workbook ExcelJS đầy đủ 6 sheet tổng hợp theo chuẩn kiểm toán
   */
  static async generateWorkbookBuffer(
    tablesData: any,
    options: ExportOptions = { mode: "INTERNAL" }
  ): Promise<Buffer> {
    // Nếu là chế độ địa phương, tự động áp dụng Statistical Disclosure Suppression
    const tables =
      options.mode === "LOCAL_CONFIDENTIAL"
        ? StatisticalDisclosureService.suppressAll(tablesData)
        : tablesData;

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Hệ thống Khảo sát Năng lực Quản lý Tài chính - Kiểm toán nhà nước";
    workbook.created = new Date();

    // 1. Sheet B1: Người trả lời
    this.buildSheetB1(workbook, tables.b1, options);

    // 2. Sheet B2: Nhóm công việc
    this.buildSheetB2(workbook, tables.b2, options);

    // 3. Sheet B3: Khoảng thiếu hụt
    this.buildSheetB3(workbook, tables.b3, options);

    // 4. Sheet B4: Nội dung cần học
    this.buildSheetB4(workbook, tables.b4, options);

    // 5. Sheet B5: Khó khăn
    this.buildSheetB5(workbook, tables.b5, options);

    // 6. Sheet B6: Hình thức học
    this.buildSheetB6(workbook, tables.b6, options);

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Helper chèn tiêu đề chuẩn cấp Bộ / Ngành
   */
  private static addHeaderBanner(
    worksheet: ExcelJS.Worksheet,
    tableTitle: string,
    options: ExportOptions,
    subtitle?: string
  ): number {
    worksheet.addRow(["TRƯỜNG ĐÀO TẠO VÀ BỒI DƯỠNG NGHIỆP VỤ KIỂM TOÁN - KIỂM TOÁN NHÀ NƯỚC"]);
    worksheet.getRow(1).font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF475569" } };

    worksheet.addRow(["HỆ THỐNG ĐÁNH GIÁ NĂNG LỰC QUẢN LÝ TÀI CHÍNH, TÀI SẢN CÔNG CẤP XÃ"]);
    worksheet.getRow(2).font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF1E3A8A" } };

    worksheet.addRow([tableTitle.toUpperCase()]);
    worksheet.getRow(3).font = { name: "Calibri", size: 13, bold: true, color: { argb: "FF0F172A" } };

    const modeLabel =
      options.mode === "LOCAL_CONFIDENTIAL"
        ? "BẢN ĐỊA PHƯƠNG (Áp dụng ngưỡng bảo vệ ẩn danh số liệu nhỏ < 5 người)"
        : "BẢN NỘI BỘ KIỂM TOÁN NHÀ NƯỚC (Toàn bộ số liệu thực tế)";

    const metaLine = `Phạm vi: ${options.provinceName || "Toàn quốc (34 Tỉnh)"} | Bộ đặc tả: Phiên bản 3.3 | Chế độ: ${modeLabel} | Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`;
    worksheet.addRow([metaLine]);
    worksheet.getRow(4).font = { name: "Calibri", size: 9, italic: true, color: { argb: "FF64748B" } };

    let nextRow = 5;
    if (subtitle) {
      worksheet.addRow([subtitle]);
      worksheet.getRow(5).font = { name: "Calibri", size: 9, italic: true, bold: true, color: { argb: "FFB45309" } };
      nextRow = 6;
    }

    worksheet.addRow([]); // Blank spacer
    return nextRow + 1;
  }

  /**
   * Helper định dạng giá trị đếm hoặc chuỗi bị ẩn
   */
  private static formatCell(display: any, raw: number) {
    if (display === SUPPRESSED_LABEL || display === "dưới 5 - không công bố") {
      return SUPPRESSED_LABEL;
    }
    return raw;
  }

  /**
   * Helper định dạng hàng tiêu đề (Headers)
   */
  private static formatHeaderRow(row: ExcelJS.Row, fill: ExcelJS.Fill = NAVY_FILL) {
    row.eachCell((cell) => {
      cell.fill = fill;
      cell.font = WHITE_BOLD_FONT;
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.border = THIN_BORDER;
    });
    row.height = 28;
  }

  /**
   * Helper auto-fit column width
   */
  private static autoFitColumns(worksheet: ExcelJS.Worksheet) {
    worksheet.columns.forEach((column) => {
      let maxLen = 12;
      column.eachCell?.({ includeEmpty: false }, (cell) => {
        const val = cell.value ? cell.value.toString() : "";
        if (val.length > maxLen && val.length < 60) {
          maxLen = val.length;
        }
      });
      column.width = maxLen + 3;
    });
  }

  // ==========================================
  // SHEET B1: NGƯỜI TRẢ LỜI
  // ==========================================
  private static buildSheetB1(workbook: ExcelJS.Workbook, b1: any, options: ExportOptions) {
    const ws = workbook.addWorksheet("B1_NguoiTraLoi", { views: [{ showGridLines: true }] });
    const startRow = this.addHeaderBanner(ws, "Bảng B1. Thống kê thông tin người trả lời", options);

    // Chỉ số tổng quan
    ws.addRow(["CHỈ SỐ TỔNG QUAN", "GIÁ TRỊ"]);
    this.formatHeaderRow(ws.lastRow!, SECTION_FILL);
    ws.lastRow!.font = { bold: true, color: { argb: "FF0F172A" } };

    ws.addRow(["Tổng số phiếu khảo sát hợp lệ", b1?.totalValid || 0]);
    ws.addRow(["Tổng số phiếu bị loại trừ (thẩm tra/đúp)", b1?.totalExcluded || 0]);
    ws.addRow(["Số xã/phường có người trả lời", b1?.totalCommunesSurveyed || 0]);
    ws.addRow([]);

    // Phần 1: Phân bố theo Cơ quan
    ws.addRow(["STT", "Mã cơ quan", "Tên cơ quan / Đơn vị", "Số phiếu hợp lệ", "Tỷ lệ (%)", "Phiếu ngoài phạm vi"]);
    this.formatHeaderRow(ws.lastRow!);

    b1?.agencyRows?.forEach((r: any, idx: number) => {
      const validVal = this.formatCell(r.validCountDisplay, r.validCount);
      const row = ws.addRow([
        idx + 1,
        r.agencyCode,
        r.agencyName,
        validVal,
        typeof validVal === "number" ? r.validPercentage / 100 : validVal,
        this.formatCell(r.outOfScopeDisplay, r.outOfScopeCount),
      ]);
      row.eachCell((cell, colNum) => {
        cell.border = THIN_BORDER;
        if (colNum === 5 && typeof cell.value === "number") cell.numFmt = "0.0%";
        if (colNum === 4 && typeof cell.value === "number") cell.numFmt = "#,##0";
      });
    });

    ws.addRow([]);

    // Phần 2: Phân bố theo Vị trí công tác
    ws.addRow(["STT", "Cơ quan", "Vị trí việc làm", "Số người trả lời", "Tỷ lệ (%)"]);
    this.formatHeaderRow(ws.lastRow!, SUBHEADER_FILL);

    b1?.positionRows?.forEach((r: any, idx: number) => {
      const validVal = this.formatCell(r.validCountDisplay, r.validCount);
      const row = ws.addRow([
        idx + 1,
        r.agencyCode,
        r.positionTitle,
        validVal,
        typeof validVal === "number" ? r.validPercentage / 100 : validVal,
      ]);
      row.eachCell((cell, colNum) => {
        cell.border = THIN_BORDER;
        if (colNum === 5 && typeof cell.value === "number") cell.numFmt = "0.0%";
        if (colNum === 4 && typeof cell.value === "number") cell.numFmt = "#,##0";
      });
    });

    this.autoFitColumns(ws);
  }

  // ==========================================
  // SHEET B2: NHÓM CÔNG VIỆC
  // ==========================================
  private static buildSheetB2(workbook: ExcelJS.Workbook, b2: any, options: ExportOptions) {
    const ws = workbook.addWorksheet("B2_NhomCongViec", { views: [{ showGridLines: true }] });
    this.addHeaderBanner(ws, "Bảng B2. Tình hình thực hiện 16 nhóm công việc cấp xã", options);

    ws.addRow([
      "Mã nhóm",
      "Tên nhóm công việc",
      "Mẫu số (N)",
      "Hiện đang trực tiếp thực hiện (SL)",
      "Hiện đang trực tiếp thực hiện (%)",
      "Được giao nhưng chưa phát sinh (SL)",
      "Được giao nhưng chưa phát sinh (%)",
      "Chỉ phối hợp thực hiện (SL)",
      "Chỉ phối hợp thực hiện (%)",
      "Không được phân công (SL)",
      "Không được phân công (%)",
    ]);
    this.formatHeaderRow(ws.lastRow!);

    b2?.rows?.forEach((r: any) => {
      if (r.isRowSuppressed) {
        const row = ws.addRow([
          r.workgroupId,
          r.workgroupName,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
        ]);
        row.eachCell((c) => {
          c.border = THIN_BORDER;
          c.font = { italic: true, color: { argb: "FF6B7280" } };
        });
        return;
      }

      const cDisplay = this.formatCell(r.currentlyDoing?.display, r.currentlyDoing?.count);
      const aDisplay = this.formatCell(r.assignedNotYet?.display, r.assignedNotYet?.count);
      const coDisplay = this.formatCell(r.coordinatingOnly?.display, r.coordinatingOnly?.count);
      const nDisplay = this.formatCell(r.notAssigned?.display, r.notAssigned?.count);

      const row = ws.addRow([
        r.workgroupId,
        r.workgroupName,
        r.denominator,
        cDisplay,
        typeof cDisplay === "number" ? r.currentlyDoing?.percentage / 100 : cDisplay,
        aDisplay,
        typeof aDisplay === "number" ? r.assignedNotYet?.percentage / 100 : aDisplay,
        coDisplay,
        typeof coDisplay === "number" ? r.coordinatingOnly?.percentage / 100 : coDisplay,
        nDisplay,
        typeof nDisplay === "number" ? r.notAssigned?.percentage / 100 : nDisplay,
      ]);

      row.eachCell((cell, colNum) => {
        cell.border = THIN_BORDER;
        if ([5, 7, 9, 11].includes(colNum) && typeof cell.value === "number") {
          cell.numFmt = "0.0%";
        }
        if ([3, 4, 6, 8, 10].includes(colNum) && typeof cell.value === "number") {
          cell.numFmt = "#,##0";
        }
      });
    });

    this.autoFitColumns(ws);
  }

  // ==========================================
  // SHEET B3: KHOẢNG THIẾU HỤT NĂNG LỰC
  // ==========================================
  private static buildSheetB3(workbook: ExcelJS.Workbook, b3: any, options: ExportOptions) {
    const ws = workbook.addWorksheet("B3_KhoangThieuHut", { views: [{ showGridLines: true }] });
    const note =
      "Ghi chú: Việc đánh giá khoảng thiếu hụt năng lực căn cứ theo Ma trận chuẩn năng lực phiên bản 3.3 ban hành kèm theo Quyết định của cấp có thẩm quyền. Tỷ lệ % tính trên tổng số người có thực hiện hoặc được phân công nhóm việc tương ứng.";
    this.addHeaderBanner(ws, "Bảng B3. Khoảng thiếu hụt năng lực theo nhóm việc và vai trò", options, note);

    ws.addRow([
      "Mã nhóm",
      "Tên nhóm công việc",
      "Mã vai trò",
      "Tên vai trò",
      "Chuẩn yêu cầu",
      "Mẫu số (N)",
      "Mức 1 (SL)",
      "Mức 1 (%)",
      "Mức 2 (SL)",
      "Mức 2 (%)",
      "Mức 3 (SL)",
      "Mức 3 (%)",
      "Mức 4 (SL)",
      "Mức 4 (%)",
      "Dưới chuẩn (SL)",
      "Dưới chuẩn (%)",
      "Thiếu 1 mức (SL)",
      "Thiếu 1 mức (%)",
      "Thiếu 2 mức (SL)",
      "Thiếu 2 mức (%)",
      "Thiếu 3 mức (SL)",
      "Thiếu 3 mức (%)",
      "Chưa có dịp (SL)",
      "Chưa có dịp (%)",
    ]);
    this.formatHeaderRow(ws.lastRow!);

    b3?.rows?.forEach((r: any) => {
      if (r.isRowSuppressed) {
        const row = ws.addRow([
          r.workgroupId,
          r.workgroupName,
          r.roleId,
          r.roleName,
          r.benchmarkLevel,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
          SUPPRESSED_LABEL,
        ]);
        row.eachCell((c) => {
          c.border = THIN_BORDER;
          c.font = { italic: true, color: { argb: "FF6B7280" } };
        });
        return;
      }

      const l1 = this.formatCell(r.level1?.display, r.level1?.count);
      const l2 = this.formatCell(r.level2?.display, r.level2?.count);
      const l3 = this.formatCell(r.level3?.display, r.level3?.count);
      const l4 = this.formatCell(r.level4?.display, r.level4?.count);
      const def = this.formatCell(r.deficient?.display, r.deficient?.count);
      const g1 = this.formatCell(r.gap1?.display, r.gap1?.count);
      const g2 = this.formatCell(r.gap2?.display, r.gap2?.count);
      const g3 = this.formatCell(r.gap3?.display, r.gap3?.count);
      const noOcc = this.formatCell(r.noOccasion?.display, r.noOccasion?.count);

      const row = ws.addRow([
        r.workgroupId,
        r.workgroupName,
        r.roleId,
        r.roleName,
        r.benchmarkLevel,
        r.denominator,
        l1,
        typeof l1 === "number" ? r.level1?.percentage / 100 : l1,
        l2,
        typeof l2 === "number" ? r.level2?.percentage / 100 : l2,
        l3,
        typeof l3 === "number" ? r.level3?.percentage / 100 : l3,
        l4,
        typeof l4 === "number" ? r.level4?.percentage / 100 : l4,
        def,
        typeof def === "number" ? r.deficient?.percentage / 100 : def,
        g1,
        typeof g1 === "number" ? r.gap1?.percentage / 100 : g1,
        g2,
        typeof g2 === "number" ? r.gap2?.percentage / 100 : g2,
        g3,
        typeof g3 === "number" ? r.gap3?.percentage / 100 : g3,
        noOcc,
        typeof noOcc === "number" ? r.noOccasion?.percentage / 100 : noOcc,
      ]);

      row.eachCell((cell, colNum) => {
        cell.border = THIN_BORDER;
        if ([8, 10, 12, 14, 16, 18, 20, 22, 24].includes(colNum) && typeof cell.value === "number") {
          cell.numFmt = "0.0%";
        }
        if ([6, 7, 9, 11, 13, 15, 17, 19, 21, 23].includes(colNum) && typeof cell.value === "number") {
          cell.numFmt = "#,##0";
        }
      });
    });

    this.autoFitColumns(ws);
  }

  // ==========================================
  // SHEET B4: NỘI DUNG CẦN HỌC
  // ==========================================
  private static buildSheetB4(workbook: ExcelJS.Workbook, b4: any, options: ExportOptions) {
    const ws = workbook.addWorksheet("B4_NoiDungCanHoc", { views: [{ showGridLines: true }] });
    this.addHeaderBanner(ws, "Bảng B4. Nhu cầu đào tạo theo chuyên đề và mức độ cấp thiết", options);

    ws.addRow([
      "Mã nhóm việc",
      "Tên nhóm công việc",
      "Mã chuyên đề",
      "Tên nội dung cần học",
      "Tổng số người chọn",
      "Trong 6 tháng tới (SL)",
      "Trong 6 tháng tới (%)",
      "Trong 6-12 tháng tới (SL)",
      "Trong 6-12 tháng tới (%)",
      "Khi có điều kiện (SL)",
      "Khi có điều kiện (%)",
    ]);
    this.formatHeaderRow(ws.lastRow!);

    b4?.rows?.forEach((r: any) => {
      const tot = this.formatCell(r.totalSelectedDisplay, r.totalSelected);
      const u6 = this.formatCell(r.urgent6mDisplay, r.urgent6mCount);

      const row = ws.addRow([
        r.workgroupId,
        r.workgroupName,
        r.topicId,
        r.topicTitle,
        tot,
        u6,
        typeof u6 === "number" ? r.urgent6mPercentage / 100 : u6,
        r.urgent12mCount,
        r.urgent12mPercentage / 100,
        r.whenPossibleCount,
        r.whenPossiblePercentage / 100,
      ]);

      row.eachCell((cell, colNum) => {
        cell.border = THIN_BORDER;
        if ([7, 9, 11].includes(colNum) && typeof cell.value === "number") cell.numFmt = "0.0%";
        if ([5, 6, 8, 10].includes(colNum) && typeof cell.value === "number") cell.numFmt = "#,##0";
      });
    });

    this.autoFitColumns(ws);
  }

  // ==========================================
  // SHEET B5: KHÓ KHĂN
  // ==========================================
  private static buildSheetB5(workbook: ExcelJS.Workbook, b5: any, options: ExportOptions) {
    const ws = workbook.addWorksheet("B5_KhoKho", { views: [{ showGridLines: true }] });
    this.addHeaderBanner(ws, "Bảng B5. Khó khăn, vướng mắc trong thực thi công vụ cấp xã", options);

    ws.addRow(["STT", "Nội dung khó khăn, vướng mắc", "Phân loại", "Số người lựa chọn", "Tỷ lệ (%)"]);
    this.formatHeaderRow(ws.lastRow!);

    b5?.rows?.forEach((r: any, idx: number) => {
      const c = this.formatCell(r.countDisplay, r.count);
      const row = ws.addRow([
        idx + 1,
        r.label,
        r.isTrainingRelated ? "Khó khăn thuộc đào tạo" : "Khó khăn ngoài đào tạo (thể chế, quy trình)",
        c,
        typeof c === "number" ? r.percentage / 100 : c,
      ]);
      row.eachCell((cell, colNum) => {
        cell.border = THIN_BORDER;
        if (colNum === 5 && typeof cell.value === "number") cell.numFmt = "0.0%";
        if (colNum === 4 && typeof cell.value === "number") cell.numFmt = "#,##0";
      });
    });

    this.autoFitColumns(ws);
  }

  // ==========================================
  // SHEET B6: HÌNH THỨC HỌC TẬP & GIỚI HẠN
  // ==========================================
  private static buildSheetB6(workbook: ExcelJS.Workbook, b6: any, options: ExportOptions) {
    const ws = workbook.addWorksheet("B6_HinhThucHoc", { views: [{ showGridLines: true }] });
    this.addHeaderBanner(ws, "Bảng B6. Đề xuất hình thức tổ chức bồi dưỡng và Giới hạn dữ liệu", options);

    ws.addRow(["STT", "Đề xuất hình thức học tập", "Số người lựa chọn", "Tỷ lệ (%)"]);
    this.formatHeaderRow(ws.lastRow!);

    b6?.rows?.forEach((r: any, idx: number) => {
      const c = this.formatCell(r.countDisplay, r.count);
      const row = ws.addRow([idx + 1, r.label, c, typeof c === "number" ? r.percentage / 100 : c]);
      row.eachCell((cell, colNum) => {
        cell.border = THIN_BORDER;
        if (colNum === 4 && typeof cell.value === "number") cell.numFmt = "0.0%";
        if (colNum === 3 && typeof cell.value === "number") cell.numFmt = "#,##0";
      });
    });

    ws.addRow([]);
    ws.addRow(["GIỚI HẠN DỮ LIỆU CẦN LƯU Ý KHI SỬ DỤNG KẾT QUẢ"]);
    this.formatHeaderRow(ws.lastRow!, SECTION_FILL);
    ws.lastRow!.font = { bold: true, color: { argb: "FF0F172A" } };

    b6?.limitations?.forEach((lim: string, idx: number) => {
      const r = ws.addRow([`${idx + 1}. ${lim}`]);
      r.font = { italic: true, color: { argb: "FF475569" } };
    });

    this.autoFitColumns(ws);
  }

  /**
   * Tạo workbook chứa toàn bộ Dữ liệu thô (Raw Data) của từng phiếu khảo sát
   * Tuân thủ Zero-PII tuyệt đối, phục vụ lưu trữ và kiểm toán độc lập
   */
  static async generateRawDataWorkbookBuffer(
    responses: any[],
    options: { campaignTitle?: string; provinceName?: string } = {}
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Kiểm toán nhà nước - Hệ thống Khảo sát Nhu cầu Đào tạo Cấp Xã";
    workbook.created = new Date();

    const ws = workbook.addWorksheet("DuLieuGoc_RawData", { views: [{ showGridLines: true }] });

    // Tiêu đề báo cáo
    ws.mergeCells("A1:Q1");
    const titleCell = ws.getCell("A1");
    titleCell.value = "TỆP DỮ LIỆU GỐC KHẢO SÁT NHU CẦU ĐÀO TẠO NĂNG LỰC CẤP XÃ/PHƯỜNG (RAW DATASET)";
    titleCell.font = { name: "Calibri", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.fill = NAVY_FILL;
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    ws.getRow(1).height = 36;

    // Subtitle & Ghi chú
    ws.mergeCells("A2:Q2");
    const subCell = ws.getCell("A2");
    subCell.value = `Đơn vị: ${options.provinceName || "Toàn quốc"} | Đợt: ${options.campaignTitle || "Đợt 1 năm 2026"} | Ngày xuất: ${new Date().toLocaleDateString("vi-VN")} | Tiêu chuẩn: Zero-PII (Không lưu thông tin định danh cá nhân)`;
    subCell.font = { italic: true, size: 10, color: { argb: "FF475569" } };
    subCell.alignment = { vertical: "middle", horizontal: "center" };
    ws.getRow(2).height = 22;

    ws.addRow([]);

    // Cột tiêu đề dữ liệu thô
    const headerRow = ws.addRow([
      "STT",
      "Mã Phiếu (ID)",
      "Thời Gian Nộp",
      "Tỉnh / Thành phố",
      "Xã / Phường / Đặc khu",
      "Cơ quan / Đơn vị",
      "Vị trí việc làm",
      "Tư cách tham gia",
      "Thâm niên (Năm)",
      "Trạng thái 16 nhóm việc (Số nhóm đang làm)",
      "Đối tượng ngoài phạm vi (Early Exit)",
      "Chuyên đề đào tạo đã chọn",
      "Mức độ cần học (Cấp thiết)",
      "Hình thức bồi dưỡng ưu tiên",
      "Ý kiến / Kiến nghị tự do",
      "Cờ nghi trùng 4 điểm",
      "Trạng thái thẩm tra",
    ]);
    this.formatHeaderRow(headerRow);
    headerRow.height = 28;

    responses.forEach((resp, idx) => {
      const part1 = resp.part1 || {};
      const part2 = resp.part2 || {};
      const part3 = resp.part3 || [];
      const part4 = resp.part4 || {};

      // Đếm số nhóm việc đang làm
      let doingCount = 0;
      if (part2.workgroupStatuses) {
        doingCount = Object.values(part2.workgroupStatuses).filter(
          (st) => st === "DOING"
        ).length;
      }

      // Tổng hợp chuyên đề đã chọn
      const selectedTopics: string[] = [];
      const urgencyLevels: string[] = [];
      if (Array.isArray(part3)) {
        part3.forEach((p: any) => {
          if (p.selectedTopicIds && p.selectedTopicIds.length > 0) {
            selectedTopics.push(...p.selectedTopicIds);
          }
          if (p.urgencyLevel) {
            urgencyLevels.push(`N${p.workgroupId}: ${p.urgencyLevel}`);
          }
        });
      }

      const row = ws.addRow([
        idx + 1,
        resp._id ? resp._id.toString() : `RESP_${idx + 1}`,
        resp.createdAt ? new Date(resp.createdAt).toLocaleString("vi-VN") : "",
        part1.provinceName || part1.provinceCode || "",
        part1.communeName || part1.communeCode || "",
        part1.agencyName || part1.agencyCode || "",
        part1.positionName || part1.positionCode || "",
        Array.isArray(part1.capacityCodes) ? part1.capacityCodes.join(", ") : "",
        part1.yearsOfExperience !== undefined ? part1.yearsOfExperience : "",
        `${doingCount} nhóm đang làm`,
        resp.isOutOfScope ? "Ngoài phạm vi" : "Hợp lệ",
        selectedTopics.join("; ") || "Không chọn",
        urgencyLevels.join("; ") || "Không có",
        Array.isArray(part4.selectedLearningFormatIds) ? part4.selectedLearningFormatIds.join(", ") : "",
        part4.suggestions || "",
        resp.isSuspectedDuplicate ? "Nghi trùng" : "Bình thường",
        resp.reviewStatus || "VALID",
      ]);

      row.eachCell((cell) => {
        cell.border = THIN_BORDER;
        cell.alignment = { vertical: "middle" };
      });
    });

    this.autoFitColumns(ws);

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
