import { connectToDatabase } from "@/lib/db";
import { SurveyLink, ISurveyLink, SurveyLinkStatus } from "@/models/SurveyLink";
import { Campaign } from "@/models/Campaign";
import { SurveyResponse } from "@/models/SurveyResponse";
import QRCode from "qrcode";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export interface ProvinceLinkItem {
  _id: string;
  provinceCode: string;
  provinceName: string;
  token: string;
  status: SurveyLinkStatus;
  qrCodeDataUrl?: string;
  surveyUrl: string;
  totalSubmissions: number;
  lastSubmissionAt?: string | null;
  updatedAt: string;
}

export interface CampaignLinksStats {
  totalLinks: number;
  activeLinks: number;
  pausedLinks: number;
  expiredLinks: number;
  totalSubmissions: number;
}

export class CampaignLinkService {
  /**
   * Lấy danh mục 34 tỉnh chuẩn
   */
  static getProvincesList(): Array<{ code: string; name: string }> {
    try {
      const realPath = path.join(process.cwd(), "src/data/real-provinces.json");
      if (fs.existsSync(realPath)) {
        const raw = JSON.parse(fs.readFileSync(realPath, "utf-8"));
        const list = raw.dong || raw;
        if (Array.isArray(list) && list.length > 0) {
          return list.map((p: any) => ({
            code: p.ma_tinh,
            name: p.ten_day_du || p.ten,
          }));
        }
      }

      const filePath = path.join(process.cwd(), "src/data/seed-provinces-pilot.json");
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw).provinces || [];
    } catch {
      return [
        { code: "01", name: "Thành phố Hà Nội" },
        { code: "02", name: "Tỉnh Hà Giang" },
        { code: "04", name: "Tỉnh Cao Bằng" },
        { code: "06", name: "Tỉnh Bắc Kạn" },
        { code: "08", name: "Tỉnh Tuyên Quang" },
        { code: "10", name: "Tỉnh Lào Cai" },
        { code: "11", name: "Tỉnh Điện Biên" },
        { code: "12", name: "Tỉnh Lai Châu" },
        { code: "14", name: "Tỉnh Sơn La" },
        { code: "15", name: "Tỉnh Yên Bái" },
        { code: "17", name: "Tỉnh Hoà Bình" },
        { code: "19", name: "Tỉnh Thái Nguyên" },
        { code: "20", name: "Tỉnh Lạng Sơn" },
        { code: "22", name: "Tỉnh Quảng Ninh" },
        { code: "24", name: "Tỉnh Bắc Giang" },
        { code: "25", name: "Tỉnh Phú Thọ" },
        { code: "26", name: "Tỉnh Vĩnh Phúc" },
        { code: "27", name: "Tỉnh Bắc Ninh" },
        { code: "30", name: "Thành phố Hải Phòng" },
        { code: "31", name: "Tỉnh Hải Dương" },
        { code: "33", name: "Tỉnh Hưng Yên" },
        { code: "34", name: "Tỉnh Thái Bình" },
        { code: "35", name: "Tỉnh Hà Nam" },
        { code: "36", name: "Tỉnh Nam Định" },
        { code: "37", name: "Tỉnh Ninh Bình" },
        { code: "38", name: "Tỉnh Thanh Hóa" },
        { code: "40", name: "Tỉnh Nghệ An" },
        { code: "42", name: "Tỉnh Hà Tĩnh" },
        { code: "44", name: "Tỉnh Quảng Bình" },
        { code: "45", name: "Tỉnh Quảng Trị" },
        { code: "46", name: "Tỉnh Thừa Thiên Huế" },
        { code: "48", name: "Thành phố Đà Nẵng" },
        { code: "49", name: "Tỉnh Quảng Nam" },
        { code: "51", name: "Tỉnh Quảng Ngãi" },
      ];
    }
  }

  /**
   * Đảm bảo các liên kết của 34 tỉnh đã được khởi tạo trong DB
   */
  static async ensureCampaignLinks(baseUrl: string): Promise<void> {
    await connectToDatabase();

    let campaign = await Campaign.findOne({ code: "DOT-1-2026" });
    if (!campaign) {
      campaign = await Campaign.create({
        code: "DOT-1-2026",
        title: "Đợt khảo sát năng lực quản lý tài chính, tài sản công cấp xã năm 2026",
        schemaVersion: "3.3",
        startDate: new Date("2026-03-01"),
        endDate: new Date("2026-04-30"),
        status: "OPEN",
        targetCommunes: 3321,
        targetProvinces: 34,
        allowPilotLinks: true,
      });
    }

    const provinces = this.getProvincesList();

    for (const p of provinces) {
      const existing = await SurveyLink.findOne({
        campaignId: campaign._id,
        provinceCode: p.code,
      });

      if (!existing) {
        const token = `pilot_dot-1-2026_p${p.code}`;
        const surveyUrl = `${baseUrl}/khao-sat/${token}`;
        let qrDataUrl = "";
        try {
          qrDataUrl = await QRCode.toDataURL(surveyUrl, {
            width: 300,
            margin: 2,
            color: { dark: "#0f172a", light: "#ffffff" },
          });
        } catch (_) {}

        await SurveyLink.create({
          campaignId: campaign._id,
          provinceCode: p.code,
          provinceName: p.name,
          token,
          qrCodeDataUrl: qrDataUrl,
          status: "ACTIVE",
          isPilot: true,
          totalSubmissions: 0,
        });
      }
    }
  }

  /**
   * Lấy danh sách liên kết và thống kê vòng đời
   */
  static async getLinksOverview(baseUrl: string) {
    await this.ensureCampaignLinks(baseUrl);

    const [links, submissionStats] = await Promise.all([
      SurveyLink.find().sort({ provinceCode: 1 }).lean(),
      SurveyResponse.aggregate([
        {
          $group: {
            _id: "$part1.provinceCode",
            total: { $sum: 1 },
            lastSubmission: { $max: "$createdAt" },
          },
        },
      ]),
    ]);

    const statMap = new Map<string, { total: number; lastSubmission?: Date }>();
    for (const s of submissionStats) {
      statMap.set(s._id, { total: s.total, lastSubmission: s.lastSubmission });
    }

    let activeLinks = 0;
    let pausedLinks = 0;
    let expiredLinks = 0;
    let totalSubmissions = 0;

    const items: ProvinceLinkItem[] = links.map((l: any) => {
      const liveStat = statMap.get(l.provinceCode);
      const count = liveStat?.total !== undefined ? liveStat.total : l.totalSubmissions || 0;
      const lastAt = liveStat?.lastSubmission || l.lastSubmissionAt;

      totalSubmissions += count;
      if (l.status === "ACTIVE") activeLinks++;
      else if (l.status === "PAUSED") pausedLinks++;
      else if (l.status === "EXPIRED") expiredLinks++;

      return {
        _id: l._id.toString(),
        provinceCode: l.provinceCode,
        provinceName: l.provinceName,
        token: l.token,
        status: l.status,
        qrCodeDataUrl: l.qrCodeDataUrl,
        surveyUrl: `${baseUrl}/khao-sat/${l.token}`,
        totalSubmissions: count,
        lastSubmissionAt: lastAt ? new Date(lastAt).toISOString() : null,
        updatedAt: l.updatedAt ? new Date(l.updatedAt).toISOString() : new Date().toISOString(),
      };
    });

    const stats: CampaignLinksStats = {
      totalLinks: items.length,
      activeLinks,
      pausedLinks,
      expiredLinks,
      totalSubmissions,
    };

    return { items, stats };
  }

  /**
   * Cập nhật trạng thái liên kết (ACTIVE, PAUSED, EXPIRED)
   */
  static async updateLinkStatus(token: string, newStatus: SurveyLinkStatus): Promise<ISurveyLink> {
    await connectToDatabase();

    const link = await SurveyLink.findOne({ token });
    if (!link) {
      throw new Error(`Không tìm thấy liên kết với token: ${token}`);
    }

    link.status = newStatus;
    await link.save();
    return link;
  }

  /**
   * Đổi mã Token bảo mật (Rotate Token) khi liên kết bị lộ
   * Tự động sinh mã QR mới và bảo toàn toàn bộ phiếu đã nộp
   */
  static async rotateToken(oldToken: string, baseUrl: string): Promise<ProvinceLinkItem> {
    await connectToDatabase();

    const link = await SurveyLink.findOne({ token: oldToken });
    if (!link) {
      throw new Error(`Không tìm thấy liên kết với token: ${oldToken}`);
    }

    const randomSuffix = crypto.randomBytes(4).toString("hex");
    const newToken = `dot-1-2026_p${link.provinceCode}_${randomSuffix}`;
    const newSurveyUrl = `${baseUrl}/khao-sat/${newToken}`;

    const newQrCode = await QRCode.toDataURL(newSurveyUrl, {
      width: 300,
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
    });

    link.token = newToken;
    link.qrCodeDataUrl = newQrCode;
    await link.save();

    // Cập nhật các phiếu đã nộp trước đó để thống nhất token
    await SurveyResponse.updateMany(
      { surveyToken: oldToken },
      { $set: { surveyToken: newToken } }
    );

    return {
      _id: link._id.toString(),
      provinceCode: link.provinceCode,
      provinceName: link.provinceName,
      token: link.token,
      status: link.status,
      qrCodeDataUrl: link.qrCodeDataUrl,
      surveyUrl: newSurveyUrl,
      totalSubmissions: link.totalSubmissions || 0,
      lastSubmissionAt: link.lastSubmissionAt ? new Date(link.lastSubmissionAt).toISOString() : null,
      updatedAt: new Date().toISOString(),
    };
  }
}
