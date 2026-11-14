/**
 * STATISTICAL DISCLOSURE SERVICE — THUẬT TOÁN BẢO VỆ ẨN DANH SỐ LIỆU NHÓM NHỎ
 * Tuân thủ quy định tại Phần IV Tài liệu số 2 và Mục 3 Spec 12
 */

export const SUPPRESSION_THRESHOLD = 5;
export const SUPPRESSED_LABEL = "dưới 5 - không công bố";

export interface CellValue {
  count: number;
  percentage?: number;
  isSuppressed?: boolean;
  displayValue?: string | number;
}

export class StatisticalDisclosureService {
  /**
   * Kiểm tra và áp dụng Primary Suppression cho một giá trị đếm
   * Quy tắc: Nếu giá trị nằm trong khoảng [1, 4] thì ẩn; Giá trị 0 hoặc >= 5 được giữ nguyên.
   */
  static maskCell(count: number): { isSuppressed: boolean; display: string | number } {
    if (count >= 1 && count < SUPPRESSION_THRESHOLD) {
      return { isSuppressed: true, display: SUPPRESSED_LABEL };
    }
    return { isSuppressed: false, display: count };
  }

  /**
   * Áp dụng Secondary Suppression (Ẩn bổ sung)
   * Trong một hàng/cột có Tổng, nếu chỉ có duy nhất 1 ô bị ẩn theo ngưỡng 5,
   * phải tự động ẩn thêm ô có giá trị nhỏ nhất kế tiếp (khác 0) để triệt tiêu
   * khả năng người xem lấy Tổng trừ các ô còn lại để suy luận ra ô ẩn.
   */
  static applySecondarySuppression(
    cells: Array<{ key: string; count: number; isSuppressed: boolean }>
  ): Set<string> {
    const suppressedKeys = new Set<string>();

    const primarySuppressed = cells.filter((c) => c.isSuppressed);
    primarySuppressed.forEach((c) => suppressedKeys.add(c.key));

    // Nếu chỉ có đúng 1 ô bị ẩn và tổng số ô >= 2 -> tìm ô nhỏ nhất khác 0 kế tiếp để ẩn bổ sung
    if (primarySuppressed.length === 1 && cells.length >= 2) {
      const remaining = cells
        .filter((c) => !c.isSuppressed && c.count > 0)
        .sort((a, b) => a.count - b.count);

      if (remaining.length > 0) {
        suppressedKeys.add(remaining[0].key);
      }
    }

    return suppressedKeys;
  }

  /**
   * Áp dụng thuật toán cho Bảng B1
   */
  static suppressTableB1(b1: any): any {
    if (!b1) return b1;

    const maskedAgencyRows = b1.agencyRows?.map((row: any) => {
      const vMask = this.maskCell(row.validCount);
      const oMask = this.maskCell(row.outOfScopeCount);
      return {
        ...row,
        validCountDisplay: vMask.display,
        isValidSuppressed: vMask.isSuppressed,
        outOfScopeDisplay: oMask.display,
        isOutOfScopeSuppressed: oMask.isSuppressed,
      };
    });

    const maskedPositionRows = b1.positionRows?.map((row: any) => {
      const vMask = this.maskCell(row.validCount);
      return {
        ...row,
        validCountDisplay: vMask.display,
        isValidSuppressed: vMask.isSuppressed,
      };
    });

    const maskedCapacityRows = b1.capacityRows?.map((row: any) => {
      const cMask = this.maskCell(row.count);
      return {
        ...row,
        countDisplay: cMask.display,
        isSuppressed: cMask.isSuppressed,
      };
    });

    return {
      ...b1,
      isSuppressedApplied: true,
      agencyRows: maskedAgencyRows,
      positionRows: maskedPositionRows,
      capacityRows: maskedCapacityRows,
    };
  }

  /**
   * Áp dụng thuật toán cho Bảng B2 (Hàng 16 nhóm việc x 4 trạng thái)
   */
  static suppressTableB2(b2: any): any {
    if (!b2) return b2;

    const maskedRows = b2.rows?.map((row: any) => {
      // Row Suppression: nếu mẫu số của dòng < 5 -> ẩn toàn bộ dòng
      if (row.denominator >= 1 && row.denominator < SUPPRESSION_THRESHOLD) {
        return {
          ...row,
          isRowSuppressed: true,
          currentlyDoing: { ...row.currentlyDoing, display: SUPPRESSED_LABEL, isSuppressed: true },
          assignedNotYet: { ...row.assignedNotYet, display: SUPPRESSED_LABEL, isSuppressed: true },
          coordinatingOnly: { ...row.coordinatingOnly, display: SUPPRESSED_LABEL, isSuppressed: true },
          notAssigned: { ...row.notAssigned, display: SUPPRESSED_LABEL, isSuppressed: true },
        };
      }

      // Primary Suppression
      const cMask = this.maskCell(row.currentlyDoing.count);
      const aMask = this.maskCell(row.assignedNotYet.count);
      const coMask = this.maskCell(row.coordinatingOnly.count);
      const nMask = this.maskCell(row.notAssigned.count);

      // Secondary Suppression check across the 4 columns
      const cells = [
        { key: "currentlyDoing", count: row.currentlyDoing.count, isSuppressed: cMask.isSuppressed },
        { key: "assignedNotYet", count: row.assignedNotYet.count, isSuppressed: aMask.isSuppressed },
        { key: "coordinatingOnly", count: row.coordinatingOnly.count, isSuppressed: coMask.isSuppressed },
        { key: "notAssigned", count: row.notAssigned.count, isSuppressed: nMask.isSuppressed },
      ];

      const secondaryKeys = this.applySecondarySuppression(cells);

      return {
        ...row,
        isRowSuppressed: false,
        currentlyDoing: {
          ...row.currentlyDoing,
          display: secondaryKeys.has("currentlyDoing") ? SUPPRESSED_LABEL : row.currentlyDoing.count,
          isSuppressed: secondaryKeys.has("currentlyDoing"),
        },
        assignedNotYet: {
          ...row.assignedNotYet,
          display: secondaryKeys.has("assignedNotYet") ? SUPPRESSED_LABEL : row.assignedNotYet.count,
          isSuppressed: secondaryKeys.has("assignedNotYet"),
        },
        coordinatingOnly: {
          ...row.coordinatingOnly,
          display: secondaryKeys.has("coordinatingOnly") ? SUPPRESSED_LABEL : row.coordinatingOnly.count,
          isSuppressed: secondaryKeys.has("coordinatingOnly"),
        },
        notAssigned: {
          ...row.notAssigned,
          display: secondaryKeys.has("notAssigned") ? SUPPRESSED_LABEL : row.notAssigned.count,
          isSuppressed: secondaryKeys.has("notAssigned"),
        },
      };
    });

    return {
      ...b2,
      isSuppressedApplied: true,
      rows: maskedRows,
    };
  }

  /**
   * Áp dụng thuật toán cho Bảng B3 (Khoảng thiếu hụt năng lực)
   * Row Suppression: Mẫu số < 5 -> ẩn toàn bộ dòng (kể cả tỷ lệ và phân bố thiếu)
   */
  static suppressTableB3(b3: any): any {
    if (!b3) return b3;

    const maskedRows = b3.rows?.map((row: any) => {
      const denom = row.denominator || 0;
      // Row Suppression
      if (denom >= 1 && denom < SUPPRESSION_THRESHOLD) {
        return {
          ...row,
          isRowSuppressed: true,
          denominatorDisplay: SUPPRESSED_LABEL,
          level1: { ...row.level1, display: SUPPRESSED_LABEL, isSuppressed: true },
          level2: { ...row.level2, display: SUPPRESSED_LABEL, isSuppressed: true },
          level3: { ...row.level3, display: SUPPRESSED_LABEL, isSuppressed: true },
          level4: { ...row.level4, display: SUPPRESSED_LABEL, isSuppressed: true },
          deficient: { count: 0, percentage: 0, display: SUPPRESSED_LABEL, isSuppressed: true },
          gap1: { count: 0, percentage: 0, display: SUPPRESSED_LABEL, isSuppressed: true },
          gap2: { count: 0, percentage: 0, display: SUPPRESSED_LABEL, isSuppressed: true },
          gap3: { count: 0, percentage: 0, display: SUPPRESSED_LABEL, isSuppressed: true },
        };
      }

      // Normal rows: mask individual cells
      const l1 = this.maskCell(row.level1?.count || 0);
      const l2 = this.maskCell(row.level2?.count || 0);
      const l3 = this.maskCell(row.level3?.count || 0);
      const l4 = this.maskCell(row.level4?.count || 0);
      const def = this.maskCell(row.deficient?.count || 0);

      return {
        ...row,
        isRowSuppressed: false,
        denominatorDisplay: denom,
        level1: { ...row.level1, display: l1.display, isSuppressed: l1.isSuppressed },
        level2: { ...row.level2, display: l2.display, isSuppressed: l2.isSuppressed },
        level3: { ...row.level3, display: l3.display, isSuppressed: l3.isSuppressed },
        level4: { ...row.level4, display: l4.display, isSuppressed: l4.isSuppressed },
        deficient: { ...row.deficient, display: def.display, isSuppressed: def.isSuppressed },
      };
    });

    return {
      ...b3,
      isSuppressedApplied: true,
      rows: maskedRows,
    };
  }

  /**
   * Áp dụng thuật toán cho Bảng B4, B5, B6
   */
  static suppressTableB4(b4: any): any {
    if (!b4) return b4;
    const maskedRows = b4.rows?.map((row: any) => {
      const tot = this.maskCell(row.totalSelected || 0);
      const urg = this.maskCell(row.urgent6mCount || 0);
      return {
        ...row,
        totalSelectedDisplay: tot.display,
        urgent6mDisplay: urg.display,
      };
    });
    return { ...b4, isSuppressedApplied: true, rows: maskedRows };
  }

  static suppressTableB5(b5: any): any {
    if (!b5) return b5;
    const maskedRows = b5.rows?.map((row: any) => {
      const m = this.maskCell(row.count || 0);
      return {
        ...row,
        countDisplay: m.display,
        isSuppressed: m.isSuppressed,
      };
    });
    return { ...b5, isSuppressedApplied: true, rows: maskedRows };
  }

  static suppressTableB6(b6: any): any {
    if (!b6) return b6;
    const maskedRows = b6.rows?.map((row: any) => {
      const m = this.maskCell(row.count || 0);
      return {
        ...row,
        countDisplay: m.display,
        isSuppressed: m.isSuppressed,
      };
    });
    return { ...b6, isSuppressedApplied: true, rows: maskedRows };
  }

  /**
   * Áp dụng thuật toán kiểm soát tiết lộ thống kê cho trọn bộ 6 bảng
   */
  static suppressAll(allTables: any): any {
    return {
      ...allTables,
      isSuppressedApplied: true,
      b1: this.suppressTableB1(allTables.b1),
      b2: this.suppressTableB2(allTables.b2),
      b3: this.suppressTableB3(allTables.b3),
      b4: this.suppressTableB4(allTables.b4),
      b5: this.suppressTableB5(allTables.b5),
      b6: this.suppressTableB6(allTables.b6),
    };
  }
}
