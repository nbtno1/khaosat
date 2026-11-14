import fs from "fs";
import path from "path";
import { connectToDatabase } from "@/lib/db";
import { Province, IProvince } from "@/models/Province";
import { Commune, ICommune } from "@/models/Commune";
import {
  ProvinceInput,
  CommuneInput,
  ProvinceInputSchema,
  CommuneInputSchema,
} from "@/lib/validations/administrative-units.schema";

export interface AdministrativeOverviewStats {
  totalProvinces: number;
  totalCommunes: number;
  communesByType: {
    phuong: number;
    xa: number;
    dacKhu: number;
    thiTran: number;
  };
  activeProvinces: number;
  activeCommunes: number;
  dataEffectiveYear: number;
  lastUpdated: string;
  sourceAuthority: string;
}

export interface ProvinceListItem {
  provinceCode: string;
  name: string;
  fullName: string;
  type: string;
  communeCount: number;
  targetRespondents: number;
  region?: string;
  isActive: boolean;
  updatedAt?: string;
}

export interface CommuneListItem {
  communeCode: string;
  name: string;
  type: string;
  provinceCode: string;
  provinceName: string;
  districtName?: string;
  postalCode?: string;
  areaKm2?: number;
  population?: number;
  resolution?: string;
  isActive: boolean;
  updatedAt?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// In-memory delta stores for offline/dev operations when MongoDB is unreachable
let localProvincesDelta: Map<string, ProvinceListItem> | null = null;
let localCommunesDelta: Map<string, CommuneListItem> | null = null;

export class AdministrativeUnitsService {
  private static realProvincesPath = path.join(process.cwd(), "src/data/real-provinces.json");
  private static realCommunesPath = path.join(process.cwd(), "src/data/real-communes.json");

  /**
   * Đọc danh sách tỉnh gốc từ tệp JSON
   */
  private static getSourceProvinces(): ProvinceListItem[] {
    try {
      if (fs.existsSync(this.realProvincesPath)) {
        const raw = JSON.parse(fs.readFileSync(this.realProvincesPath, "utf-8"));
        const list = raw.dong || raw || [];
        return list.map((p: any) => ({
          provinceCode: p.ma_tinh,
          name: p.ten,
          fullName: p.ten_day_du || `Tỉnh ${p.ten}`,
          type: p.loai || (p.ten.includes("Hà Nội") || p.ten.includes("TP.") ? "Thành phố" : "Tỉnh"),
          communeCount: p.so_don_vi_cap_xa || 0,
          targetRespondents: 100,
          isActive: true,
          updatedAt: new Date().toISOString(),
        }));
      }
    } catch {
      // Ignored
    }
    return [];
  }

  /**
   * Đọc danh sách xã gốc từ tệp JSON
   */
  private static getSourceCommunes(): CommuneListItem[] {
    try {
      if (fs.existsSync(this.realCommunesPath)) {
        const raw = JSON.parse(fs.readFileSync(this.realCommunesPath, "utf-8"));
        const list = raw.dong || raw || [];
        return list.map((c: any) => ({
          communeCode: c.ma_xa,
          name: c.ten,
          type: c.loai || "Xã",
          provinceCode: c.ma_tinh,
          provinceName: c.ten_tinh || `Tỉnh ${c.ma_tinh}`,
          districtName: c.quan_huyen || undefined,
          postalCode: c.ma_buu_chinh || undefined,
          areaKm2: c.dien_tich_km2 ? Number(c.dien_tich_km2) : undefined,
          population: c.dan_so ? Number(c.dan_so) : undefined,
          resolution: c.nghi_quyet || undefined,
          isActive: true,
          updatedAt: new Date().toISOString(),
        }));
      }
    } catch {
      // Ignored
    }
    return [];
  }

  /**
   * Khởi tạo bộ nhớ đệm offline
   */
  private static initLocalDeltas() {
    if (!localProvincesDelta) {
      localProvincesDelta = new Map();
      this.getSourceProvinces().forEach((p) => localProvincesDelta!.set(p.provinceCode, p));
    }
    if (!localCommunesDelta) {
      localCommunesDelta = new Map();
      this.getSourceCommunes().forEach((c) => localCommunesDelta!.set(c.communeCode, c));
    }
  }

  /**
   * Lấy thống kê tổng quan danh mục ĐVHC
   */
  static async getOverviewStats(): Promise<AdministrativeOverviewStats> {
    try {
      await connectToDatabase();
      const [totalProvinces, totalCommunes, activeProvinces, activeCommunes] = await Promise.all([
        Province.countDocuments(),
        Commune.countDocuments(),
        Province.countDocuments({ isActive: { $ne: false } }),
        Commune.countDocuments({ isActive: { $ne: false } }),
      ]);

      if (totalProvinces > 0 && totalCommunes > 0) {
        const typeAgg = await Commune.aggregate([
          { $group: { _id: "$type", count: { $sum: 1 } } },
        ]);

        const counts: Record<string, number> = {};
        typeAgg.forEach((t) => {
          counts[t._id] = t.count;
        });

        return {
          totalProvinces,
          totalCommunes,
          communesByType: {
            phuong: counts["Phường"] || 0,
            xa: counts["Xã"] || 0,
            dacKhu: counts["Đặc khu"] || 0,
            thiTran: counts["Thị trấn"] || 0,
          },
          activeProvinces,
          activeCommunes,
          dataEffectiveYear: 2026,
          lastUpdated: new Date().toISOString(),
          sourceAuthority: "Cục Thống kê & Nghị quyết Ủy ban Thường vụ Quốc hội 2026",
        };
      }
    } catch {
      // Fallback local below
    }

    // Local JSON Fallback
    this.initLocalDeltas();
    const provinces = Array.from(localProvincesDelta!.values());
    const communes = Array.from(localCommunesDelta!.values());

    const phuongCount = communes.filter((c) => c.type === "Phường").length;
    const xaCount = communes.filter((c) => c.type === "Xã").length;
    const dacKhuCount = communes.filter((c) => c.type === "Đặc khu").length;
    const thiTranCount = communes.filter((c) => c.type === "Thị trấn").length;

    return {
      totalProvinces: provinces.length,
      totalCommunes: communes.length,
      communesByType: {
        phuong: phuongCount,
        xa: xaCount,
        dacKhu: dacKhuCount,
        thiTran: thiTranCount,
      },
      activeProvinces: provinces.filter((p) => p.isActive).length,
      activeCommunes: communes.filter((c) => c.isActive).length,
      dataEffectiveYear: 2026,
      lastUpdated: new Date().toISOString(),
      sourceAuthority: "Cục Thống kê & Nghị quyết Ủy ban Thường vụ Quốc hội 2026",
    };
  }

  /**
   * Danh sách Tỉnh / Thành phố
   */
  static async getProvinces(options?: {
    search?: string;
    type?: string;
    status?: string;
    sort?: string;
  }): Promise<ProvinceListItem[]> {
    const { search = "", type, status = "ALL", sort = "code" } = options || {};

    try {
      await connectToDatabase();
      const filter: any = {};

      if (search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        filter.$or = [{ provinceCode: regex }, { name: regex }, { fullName: regex }];
      }
      if (type && type !== "ALL") {
        filter.type = type;
      }
      if (status === "ACTIVE") {
        filter.isActive = { $ne: false };
      } else if (status === "INACTIVE") {
        filter.isActive = false;
      }

      const sortOption: any = {};
      if (sort === "name") sortOption.name = 1;
      else if (sort === "communeCount") sortOption.communeCount = -1;
      else sortOption.provinceCode = 1;

      const docs = await Province.find(filter).sort(sortOption).lean();

      if (docs && docs.length > 0) {
        return docs.map((d: any) => ({
          provinceCode: d.provinceCode,
          name: d.name,
          fullName: d.fullName,
          type: d.type || "Tỉnh",
          communeCount: d.communeCount || 0,
          targetRespondents: d.targetRespondents || 100,
          region: d.region,
          isActive: d.isActive !== false,
          updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : undefined,
        }));
      }
    } catch {
      // Fallback
    }

    // Local Fallback
    this.initLocalDeltas();
    let list = Array.from(localProvincesDelta!.values());

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.provinceCode.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.fullName.toLowerCase().includes(q)
      );
    }
    if (type && type !== "ALL") {
      list = list.filter((p) => p.type === type);
    }
    if (status === "ACTIVE") {
      list = list.filter((p) => p.isActive);
    } else if (status === "INACTIVE") {
      list = list.filter((p) => !p.isActive);
    }

    if (sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name, "vi"));
    } else if (sort === "communeCount") {
      list.sort((a, b) => b.communeCount - a.communeCount);
    } else {
      list.sort((a, b) => a.provinceCode.localeCompare(b.provinceCode));
    }

    return list;
  }

  /**
   * Lấy chi tiết 1 tỉnh theo mã
   */
  static async getProvinceByCode(code: string): Promise<ProvinceListItem | null> {
    try {
      await connectToDatabase();
      const doc: any = await Province.findOne({ provinceCode: code }).lean();
      if (doc) {
        return {
          provinceCode: doc.provinceCode,
          name: doc.name,
          fullName: doc.fullName,
          type: doc.type,
          communeCount: doc.communeCount,
          targetRespondents: doc.targetRespondents,
          region: doc.region,
          isActive: doc.isActive !== false,
          updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : undefined,
        };
      }
    } catch {
      // Local fallback
    }

    this.initLocalDeltas();
    return localProvincesDelta!.get(code) || null;
  }

  /**
   * Lưu hoặc cập nhật Tỉnh/Thành phố
   */
  static async saveProvince(input: ProvinceInput): Promise<ProvinceListItem> {
    const validated = ProvinceInputSchema.parse(input);

    const item: ProvinceListItem = {
      provinceCode: validated.provinceCode,
      name: validated.name,
      fullName: validated.fullName,
      type: validated.type,
      communeCount: validated.communeCount ?? 0,
      targetRespondents: validated.targetRespondents,
      region: validated.region,
      isActive: validated.isActive,
      updatedAt: new Date().toISOString(),
    };

    try {
      await connectToDatabase();
      const updated = await Province.findOneAndUpdate(
        { provinceCode: validated.provinceCode },
        { $set: item },
        { upsert: true, new: true }
      ).lean();

      if (updated) {
        return {
          provinceCode: (updated as any).provinceCode,
          name: (updated as any).name,
          fullName: (updated as any).fullName,
          type: (updated as any).type,
          communeCount: (updated as any).communeCount,
          targetRespondents: (updated as any).targetRespondents,
          region: (updated as any).region,
          isActive: (updated as any).isActive !== false,
          updatedAt: (updated as any).updatedAt?.toISOString(),
        };
      }
    } catch {
      // Local fallback
    }

    this.initLocalDeltas();
    localProvincesDelta!.set(item.provinceCode, item);
    return item;
  }

  /**
   * Kích hoạt hoặc vô hiệu hóa tỉnh
   */
  static async toggleProvinceStatus(code: string, isActive: boolean): Promise<boolean> {
    try {
      await connectToDatabase();
      await Province.updateOne({ provinceCode: code }, { $set: { isActive } });
    } catch {
      // Local fallback
    }

    this.initLocalDeltas();
    const existing = localProvincesDelta!.get(code);
    if (existing) {
      existing.isActive = isActive;
      localProvincesDelta!.set(code, existing);
    }
    return true;
  }

  /**
   * Danh sách Xã / Phường (Có phân trang, lọc theo tỉnh, từ khóa, loại)
   */
  static async getCommunes(options?: {
    provinceCode?: string;
    search?: string;
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<CommuneListItem>> {
    const {
      provinceCode,
      search = "",
      type,
      status = "ALL",
      page = 1,
      limit = 25,
    } = options || {};

    const skip = (page - 1) * limit;

    try {
      await connectToDatabase();
      const filter: any = {};

      if (provinceCode && provinceCode !== "ALL") {
        filter.provinceCode = provinceCode;
      }
      if (search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        filter.$or = [{ communeCode: regex }, { name: regex }];
      }
      if (type && type !== "ALL") {
        filter.type = type;
      }
      if (status === "ACTIVE") {
        filter.isActive = { $ne: false };
      } else if (status === "INACTIVE") {
        filter.isActive = false;
      }

      const total = await Commune.countDocuments(filter);
      if (total > 0) {
        const docs = await Commune.find(filter)
          .sort({ provinceCode: 1, communeCode: 1 })
          .skip(skip)
          .limit(limit)
          .lean();

        const items: CommuneListItem[] = docs.map((d: any) => ({
          communeCode: d.communeCode,
          name: d.name,
          type: d.type || "Xã",
          provinceCode: d.provinceCode,
          provinceName: d.provinceName,
          districtName: d.districtName,
          postalCode: d.postalCode,
          areaKm2: d.areaKm2,
          population: d.population,
          resolution: d.resolution,
          isActive: d.isActive !== false,
          updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : undefined,
        }));

        return {
          items,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }
    } catch {
      // Local fallback
    }

    // Local Fallback
    this.initLocalDeltas();
    let list = Array.from(localCommunesDelta!.values());

    if (provinceCode && provinceCode !== "ALL") {
      list = list.filter((c) => c.provinceCode === provinceCode);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) => c.communeCode.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
      );
    }
    if (type && type !== "ALL") {
      list = list.filter((c) => c.type === type);
    }
    if (status === "ACTIVE") {
      list = list.filter((c) => c.isActive);
    } else if (status === "INACTIVE") {
      list = list.filter((c) => !c.isActive);
    }

    list.sort((a, b) => {
      if (a.provinceCode === b.provinceCode) {
        return a.communeCode.localeCompare(b.communeCode);
      }
      return a.provinceCode.localeCompare(b.provinceCode);
    });

    const total = list.length;
    const paginated = list.slice(skip, skip + limit);

    return {
      items: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lưu hoặc cập nhật Xã / Phường
   */
  static async saveCommune(input: CommuneInput): Promise<CommuneListItem> {
    const validated = CommuneInputSchema.parse(input);

    const item: CommuneListItem = {
      communeCode: validated.communeCode,
      name: validated.name,
      type: validated.type,
      provinceCode: validated.provinceCode,
      provinceName: validated.provinceName,
      districtName: validated.districtName,
      postalCode: validated.postalCode,
      areaKm2: validated.areaKm2,
      population: validated.population,
      resolution: validated.resolution,
      isActive: validated.isActive,
      updatedAt: new Date().toISOString(),
    };

    try {
      await connectToDatabase();
      const updated = await Commune.findOneAndUpdate(
        { communeCode: validated.communeCode },
        { $set: item },
        { upsert: true, new: true }
      ).lean();

      // Recalculate communeCount for this province
      const newCount = await Commune.countDocuments({ provinceCode: validated.provinceCode });
      await Province.updateOne(
        { provinceCode: validated.provinceCode },
        { $set: { communeCount: newCount } }
      );

      if (updated) {
        return {
          communeCode: (updated as any).communeCode,
          name: (updated as any).name,
          type: (updated as any).type,
          provinceCode: (updated as any).provinceCode,
          provinceName: (updated as any).provinceName,
          districtName: (updated as any).districtName,
          postalCode: (updated as any).postalCode,
          areaKm2: (updated as any).areaKm2,
          population: (updated as any).population,
          resolution: (updated as any).resolution,
          isActive: (updated as any).isActive !== false,
          updatedAt: (updated as any).updatedAt?.toISOString(),
        };
      }
    } catch {
      // Local fallback
    }

    this.initLocalDeltas();
    localCommunesDelta!.set(item.communeCode, item);

    // Update local province commune count
    const prov = localProvincesDelta?.get(item.provinceCode);
    if (prov) {
      const pCount = Array.from(localCommunesDelta!.values()).filter(
        (c) => c.provinceCode === item.provinceCode
      ).length;
      prov.communeCount = pCount;
    }

    return item;
  }

  /**
   * Xóa hoặc vô hiệu hóa xã/phường
   */
  static async deleteCommune(code: string): Promise<boolean> {
    let provinceCode: string | undefined;

    try {
      await connectToDatabase();
      const existing = await Commune.findOne({ communeCode: code });
      if (existing) {
        provinceCode = existing.provinceCode;
        await Commune.deleteOne({ communeCode: code });
        if (provinceCode) {
          const count = await Commune.countDocuments({ provinceCode });
          await Province.updateOne({ provinceCode }, { $set: { communeCount: count } });
        }
        return true;
      }
    } catch {
      // Fallback
    }

    this.initLocalDeltas();
    const local = localCommunesDelta!.get(code);
    if (local) {
      provinceCode = local.provinceCode;
      localCommunesDelta!.delete(code);
      if (provinceCode && localProvincesDelta?.has(provinceCode)) {
        const prov = localProvincesDelta.get(provinceCode)!;
        prov.communeCount = Math.max(0, prov.communeCount - 1);
      }
      return true;
    }
    return false;
  }

  /**
   * Kích hoạt hoặc vô hiệu hóa xã
   */
  static async toggleCommuneStatus(code: string, isActive: boolean): Promise<boolean> {
    try {
      await connectToDatabase();
      await Commune.updateOne({ communeCode: code }, { $set: { isActive } });
    } catch {
      // Fallback
    }

    this.initLocalDeltas();
    const existing = localCommunesDelta!.get(code);
    if (existing) {
      existing.isActive = isActive;
      localCommunesDelta!.set(code, existing);
    }
    return true;
  }

  /**
   * Đồng bộ lại danh mục gốc từ các tệp JSON vào Cơ sở dữ liệu
   */
  static async syncFromSource(): Promise<{
    syncedProvinces: number;
    syncedCommunes: number;
    timestamp: string;
  }> {
    const sourceProvinces = this.getSourceProvinces();
    const sourceCommunes = this.getSourceCommunes();

    try {
      await connectToDatabase();

      if (sourceProvinces.length > 0) {
        const provOps = sourceProvinces.map((p) => ({
          updateOne: {
            filter: { provinceCode: p.provinceCode },
            update: { $set: p },
            upsert: true,
          },
        }));
        await Province.bulkWrite(provOps as any, { ordered: false });
      }

      if (sourceCommunes.length > 0) {
        const comOps = sourceCommunes.map((c) => ({
          updateOne: {
            filter: { communeCode: c.communeCode },
            update: { $set: c },
            upsert: true,
          },
        }));
        await Commune.bulkWrite(comOps as any, { ordered: false });
      }
    } catch {
      // If DB offline, refresh local memory
    }

    // Refresh memory cache
    localProvincesDelta = new Map();
    sourceProvinces.forEach((p) => localProvincesDelta!.set(p.provinceCode, p));

    localCommunesDelta = new Map();
    sourceCommunes.forEach((c) => localCommunesDelta!.set(c.communeCode, c));

    return {
      syncedProvinces: sourceProvinces.length,
      syncedCommunes: sourceCommunes.length,
      timestamp: new Date().toISOString(),
    };
  }
}
