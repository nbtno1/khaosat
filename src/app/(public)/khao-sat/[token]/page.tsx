import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SurveyContainer } from "@/components/survey/SurveyContainer";
import { SurveyLinkMeta, SchemaConfigData } from "@/hooks/useSurveyFormState";
import fs from "fs";
import path from "path";
import { AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Khảo sát Nhu cầu Đào tạo Cấp Xã — Kiểm toán nhà nước",
  description:
    "Cổng khảo sát trực tuyến đánh giá năng lực và xác định nhu cầu đào tạo, bồi dưỡng quản lý tài chính, tài sản công cấp xã năm 2026.",
};

async function getSurveyData(token: string): Promise<{
  linkMeta: SurveyLinkMeta | null;
  schemaData: SchemaConfigData | null;
  errorMessage?: string;
}> {
  try {
    // 1. Try fetching schema 3.3 data from local seed file
    const schemaPath = path.join(process.cwd(), "src/data/seed-schema-3.3.json");
    let schemaData: SchemaConfigData | null = null;
    if (fs.existsSync(schemaPath)) {
      schemaData = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
    }

    // 2. Load pilot provinces data for fallback
    const pilotPath = path.join(process.cwd(), "src/data/seed-provinces-pilot.json");
    let pilotData: any = { provinces: [], pilotCommunes: [] };
    if (fs.existsSync(pilotPath)) {
      pilotData = JSON.parse(fs.readFileSync(pilotPath, "utf-8"));
    }

    // Check if token matches pilot pattern or database
    let provCode = "01";
    let provName = "Thành phố Hà Nội";

    if (token.startsWith("pilot_")) {
      const match = token.match(/_p([0-9]+)$/);
      if (match) {
        provCode = match[1];
        const pObj = pilotData.provinces.find((p: any) => p.code === provCode);
        if (pObj) provName = pObj.name;
      }
    }

    const communes = pilotData.pilotCommunes
      .filter((c: any) => c.provinceCode === provCode)
      .map((c: any) => ({
        code: c.communeCode,
        name: c.communeName,
        districtName: c.districtName,
      }));

    const linkMeta: SurveyLinkMeta = {
      linkId: `link_${token}`,
      campaignId: "campaign_dot_1_2026",
      campaignCode: "DOT-1-2026",
      campaignTitle: "Đợt khảo sát năng lực quản lý tài chính, tài sản công cấp xã năm 2026",
      schemaVersion: "3.3",
      provinceCode: provCode,
      provinceName: provName,
      communes: communes.length > 0 ? communes : [
        { code: `${provCode}001`, name: `Phường 1 (${provName})`, districtName: "Trung tâm" },
        { code: `${provCode}002`, name: `Xã 2 (${provName})`, districtName: "Ngoại thành" },
      ],
      isPilot: true,
      status: "ACTIVE",
    };

    return { linkMeta, schemaData };
  } catch (err: any) {
    return {
      linkMeta: null,
      schemaData: null,
      errorMessage: err.message || "Lỗi tải thông tin liên kết",
    };
  }
}

export default async function SurveyPublicPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const { linkMeta, schemaData, errorMessage } = await getSurveyData(token);

  if (errorMessage || !linkMeta || !schemaData) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg text-center max-w-md space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Đường dẫn không khả dụng
          </h2>
          <p className="text-sm text-slate-600">
            {errorMessage ||
              "Đường dẫn khảo sát này không tồn tại hoặc đợt khảo sát đã kết thúc. Vui lòng liên hệ Đầu mối địa phương để được hỗ trợ."}
          </p>
        </div>
      </div>
    );
  }

  // Pass token into linkMeta
  (linkMeta as any).token = token;

  return (
    <div className="min-h-screen bg-slate-50 py-4">
      <SurveyContainer linkMeta={linkMeta} schemaData={schemaData} />
    </div>
  );
}
