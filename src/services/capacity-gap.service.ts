import fs from "fs";
import path from "path";
import { connectToDatabase } from "@/lib/db";
import { BenchmarkMatrix, IBenchmarkMatrix } from "@/models/BenchmarkMatrix";
import { RoleId } from "@/lib/validations/survey.schema";

export interface BenchmarkLookupItem {
  schemaVersion: string;
  workgroupId: string;
  roleId: RoleId;
  requiredLevel: number;
  rationale?: string;
}

export interface CapacityGapResult {
  hasBenchmark: boolean;
  requiredLevel?: number;
  rationale?: string;
  selfLevel: number;
  gap: number; // requiredLevel - selfLevel
  isDeficient: boolean;
  gapLevel: 0 | 1 | 2 | 3; // 0 if met/exceeded, 1 if thiếu 1 mức, 2 if thiếu 2 mức, 3 if thiếu 3 mức
}

export class CapacityGapService {
  private static benchmarkCache: Map<string, BenchmarkLookupItem> = new Map();

  /**
   * Tải toàn bộ ma trận benchmark vào bộ nhớ đệm
   */
  static async loadBenchmarkMatrix(schemaVersion: string = "3.3"): Promise<void> {
    if (this.benchmarkCache.size > 0) return;

    try {
      await connectToDatabase();
      const records = await BenchmarkMatrix.find({ schemaVersion }).lean();
      if (records && records.length > 0) {
        for (const r of records) {
          const key = `${r.schemaVersion}_${r.workgroupId}_${r.roleId}`;
          this.benchmarkCache.set(key, {
            schemaVersion: r.schemaVersion,
            workgroupId: r.workgroupId,
            roleId: r.roleId as RoleId,
            requiredLevel: r.requiredLevel,
            rationale: r.rationale,
          });
        }
        return;
      }
    } catch (_) {
      // Offline fallback
    }

    // Fallback: đọc trực tiếp file JSON hạt giống
    try {
      const filePath = path.join(process.cwd(), "src/data/seed-benchmark-matrix.json");
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const list: BenchmarkLookupItem[] = JSON.parse(raw);
        for (const item of list) {
          const key = `${item.schemaVersion}_${item.workgroupId}_${item.roleId}`;
          this.benchmarkCache.set(key, item);
        }
      }
    } catch (err) {
      console.error("Error loading benchmark matrix JSON fallback:", err);
    }
  }

  /**
   * Lấy mức yêu cầu chuẩn cho một nhóm công việc và vai trò
   */
  static getRequiredLevel(
    workgroupId: string,
    roleId: RoleId,
    schemaVersion: string = "3.3"
  ): BenchmarkLookupItem | undefined {
    const key = `${schemaVersion}_${workgroupId}_${roleId}`;
    return this.benchmarkCache.get(key);
  }

  /**
   * Tính toán khoảng thiếu hụt (Gap) giữa điểm tự đánh giá và mức chuẩn
   * Theo công thức chuẩn tại Phần IV Tài liệu số 2 và Spec 12
   */
  static evaluateGap(
    workgroupId: string,
    roleId: RoleId,
    selfLevel: number,
    schemaVersion: string = "3.3"
  ): CapacityGapResult {
    const benchmark = this.getRequiredLevel(workgroupId, roleId, schemaVersion);

    if (!benchmark) {
      return {
        hasBenchmark: false,
        selfLevel,
        gap: 0,
        isDeficient: false,
        gapLevel: 0,
      };
    }

    const gap = benchmark.requiredLevel - selfLevel;
    const isDeficient = gap > 0;
    const gapLevel = gap > 0 ? (Math.min(gap, 3) as 1 | 2 | 3) : 0;

    return {
      hasBenchmark: true,
      requiredLevel: benchmark.requiredLevel,
      rationale: benchmark.rationale,
      selfLevel,
      gap,
      isDeficient,
      gapLevel,
    };
  }

  /**
   * Tổng hợp thống kê khoảng thiếu hụt cho một dòng [Nhóm công việc x Vai trò] (Bảng B3)
   */
  static aggregateRowGapStats(
    workgroupId: string,
    roleId: RoleId,
    selfLevels: number[],
    schemaVersion: string = "3.3"
  ) {
    const benchmark = this.getRequiredLevel(workgroupId, roleId, schemaVersion);
    const denominator = selfLevels.length;

    // Phân bố mức 1, 2, 3, 4
    let countLevel1 = 0;
    let countLevel2 = 0;
    let countLevel3 = 0;
    let countLevel4 = 0;

    let countDeficient = 0;
    let gap1Count = 0;
    let gap2Count = 0;
    let gap3Count = 0;

    for (const lvl of selfLevels) {
      if (lvl === 1) countLevel1++;
      else if (lvl === 2) countLevel2++;
      else if (lvl === 3) countLevel3++;
      else if (lvl === 4) countLevel4++;

      if (benchmark) {
        const gap = benchmark.requiredLevel - lvl;
        if (gap > 0) {
          countDeficient++;
          if (gap === 1) gap1Count++;
          else if (gap === 2) gap2Count++;
          else if (gap >= 3) gap3Count++;
        }
      }
    }

    const pct = (cnt: number) =>
      denominator > 0 ? Math.round((cnt / denominator) * 1000) / 10 : 0;

    return {
      workgroupId,
      roleId,
      denominator,
      hasBenchmark: !!benchmark,
      requiredLevel: benchmark?.requiredLevel ?? null,
      rationale: benchmark?.rationale ?? null,
      level1: { count: countLevel1, percentage: pct(countLevel1) },
      level2: { count: countLevel2, percentage: pct(countLevel2) },
      level3: { count: countLevel3, percentage: pct(countLevel3) },
      level4: { count: countLevel4, percentage: pct(countLevel4) },
      deficient: {
        count: countDeficient,
        percentage: pct(countDeficient),
      },
      gap1: { count: gap1Count, percentage: pct(gap1Count) },
      gap2: { count: gap2Count, percentage: pct(gap2Count) },
      gap3: { count: gap3Count, percentage: pct(gap3Count) },
    };
  }
}
