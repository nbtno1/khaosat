"use client";

import React, { useState } from "react";
import { Part1Data } from "@/lib/validations/survey.schema";
import { SurveyLinkMeta } from "@/hooks/useSurveyFormState";
import { Select } from "@/components/common/Select";
import {
  Building2,
  User,
  Clock,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  MapPin,
  Landmark,
  Briefcase,
} from "lucide-react";

interface StepGeneralInfoProps {
  part1: Partial<Part1Data>;
  setPart1: React.Dispatch<React.SetStateAction<Partial<Part1Data>>>;
  linkMeta: SurveyLinkMeta;
  onNext: () => void;
}

// 11 Agencies
const AGENCIES = [
  { code: "UBND", name: "Lãnh đạo Ủy ban nhân dân xã/phường" },
  { code: "HDND", name: "Hội đồng nhân dân xã/phường" },
  { code: "VP_HDND_UBND", name: "Văn phòng Hội đồng nhân dân và Ủy ban nhân dân" },
  { code: "PHONG_KINH_TE", name: "Phòng Kinh tế (xã) / Phòng Kinh tế, Hạ tầng và Đô thị (phường)" },
  { code: "PHONG_VAN_HOA_XA_HOI", name: "Phòng Văn hóa-Xã hội" },
  { code: "TT_HANH_CHINH_CONG", name: "Trung tâm phục vụ hành chính công" },
  { code: "DON_VI_SU_NGHIEP", name: "Đơn vị sự nghiệp công lập trực thuộc (trường học, trạm y tế, trung tâm…)" },
  { code: "BAN_QLDA", name: "Ban quản lý dự án, tổ hoặc người được giao quản lý dự án" },
  { code: "VP_DANG_UY", name: "Văn phòng Đảng ủy xã/phường" },
  { code: "CO_QUAN_MTTQ_DOAN_THE", name: "Cơ quan Ủy ban Mặt trận Tổ quốc Việt Nam và các tổ chức chính trị-xã hội cấp xã" },
  { code: "DON_VI_KHAC", name: "Đơn vị khác được giao dự toán từ ngân sách cấp xã" },
];

// Positions by Agency
const POSITIONS_BY_AGENCY: Record<string, Array<{ code: string; name: string }>> = {
  UBND: [
    { code: "CHU_TICH_UBND", name: "Chủ tịch Ủy ban nhân dân" },
    { code: "PHO_CHU_TICH_UBND", name: "Phó Chủ tịch Ủy ban nhân dân" },
    { code: "UBND_VI_TRI_KHAC", name: "Vị trí khác" },
  ],
  HDND: [
    { code: "LANH_DAO_HDND", name: "Chủ tịch, Phó Chủ tịch Hội đồng nhân dân" },
    { code: "BAN_KT_NS_HDND", name: "Trưởng, Phó Trưởng Ban Kinh tế-Ngân sách Hội đồng nhân dân" },
    { code: "DAI_BIEU_HDND_KHAC", name: "Đại biểu Hội đồng nhân dân khác" },
    { code: "HDND_VI_TRI_KHAC", name: "Vị trí khác" },
  ],
  VP_HDND_UBND: [
    { code: "LANH_DAO_VP", name: "Chánh, Phó Chánh Văn phòng" },
    { code: "VP_CC_TAI_CHINH_KT", name: "Công chức phụ trách tài chính, kế toán của cơ quan" },
    { code: "VP_CC_QUAN_TRI_TAI_SAN", name: "Công chức phụ trách quản trị, tài sản, mua sắm của cơ quan" },
    { code: "VP_THU_QUY", name: "Thủ quỹ" },
    { code: "VP_VI_TRI_KHAC", name: "Vị trí khác" },
  ],
  PHONG_KINH_TE: [
    { code: "LANH_DAO_PHONG_KT", name: "Trưởng phòng, Phó Trưởng phòng" },
    { code: "KT_CC_TAI_CHINH_NS", name: "Công chức tài chính-ngân sách" },
    { code: "KT_CC_KE_TOAN_NS", name: "Công chức kế toán ngân sách, kế toán Ủy ban nhân dân" },
    { code: "KT_CC_TAI_SAN_MUA_SAM", name: "Công chức phụ trách tài sản công, mua sắm" },
    { code: "KT_CC_DAU_TU_XAY_DUNG", name: "Công chức phụ trách đầu tư công, xây dựng, hạ tầng" },
    { code: "KT_CC_DAT_DAI_TAI_NGUYEN", name: "Công chức phụ trách đất đai, tài nguyên" },
    { code: "KT_VI_TRI_KHAC", name: "Vị trí khác" },
  ],
  PHONG_VAN_HOA_XA_HOI: [
    { code: "VHXH_QL_CHI_TRA_KINH_PHI", name: "Vị trí có quản lý, chi trả kinh phí (chính sách xã hội, giáo dục, y tế, văn hóa)" },
    { code: "VHXH_VI_TRI_KHAC", name: "Vị trí khác" },
  ],
  TT_HANH_CHINH_CONG: [
    { code: "LANH_DAO_TTHCC", name: "Giám đốc, Phó Giám đốc Trung tâm" },
    { code: "TTHCC_THU_PHI_LE_PHI", name: "Người thu phí, lệ phí, quản lý tài chính của Trung tâm" },
    { code: "TTHCC_VI_TRI_KHAC", name: "Vị trí khác" },
  ],
  DON_VI_SU_NGHIEP: [
    { code: "DVSN_THU_TRUONG", name: "Thủ trưởng, Phó thủ trưởng đơn vị" },
    { code: "DVSN_KE_TOAN", name: "Kế toán đơn vị" },
    { code: "DVSN_QL_TAI_SAN", name: "Người quản lý tài sản, thiết bị, mua sắm của đơn vị" },
    { code: "DVSN_VI_TRI_KHAC", name: "Vị trí khác" },
  ],
  BAN_QLDA: [
    { code: "BQLDA_TRUONG_BAN", name: "Trưởng ban, Phó Trưởng ban hoặc người được giao quản lý dự án" },
    { code: "BQLDA_CAN_BO_KT", name: "Cán bộ kỹ thuật, giám sát, kế toán dự án" },
    { code: "BQLDA_VI_TRI_KHAC", name: "Vị trí khác" },
  ],
  VP_DANG_UY: [
    { code: "VPDU_LANH_DAO", name: "Chánh, Phó Chánh Văn phòng phụ trách tài chính" },
    { code: "VPDU_KE_TOAN", name: "Kế toán, người phụ trách tài chính, tài sản" },
    { code: "VPDU_VI_TRI_KHAC", name: "Vị trí khác" },
  ],
  CO_QUAN_MTTQ_DOAN_THE: [
    { code: "MTTQ_NGUOI_DUNG_DAU", name: "Người đứng đầu, cấp phó phụ trách tài chính" },
    { code: "MTTQ_KE_TOAN", name: "Kế toán, người phụ trách tài chính, tài sản" },
    { code: "MTTQ_VI_TRI_KHAC", name: "Vị trí khác" },
  ],
  DON_VI_KHAC: [
    { code: "DVKHAC_NGUOI_DUNG_DAU", name: "Người đứng đầu, cấp phó phụ trách tài chính" },
    { code: "DVKHAC_KE_TOAN", name: "Kế toán, người phụ trách tài chính, tài sản" },
    { code: "DVKHAC_VI_TRI_KHAC", name: "Vị trí khác" },
  ],
};

// Capacities (Question 4)
const CAPACITIES = [
  { id: "CAN_BO", title: "Cán bộ" },
  { id: "CONG_CHUC", title: "Công chức" },
  { id: "VIEN_CHUC", title: "Viên chức" },
  { id: "DAI_BIEU_HDND", title: "Đại biểu Hội đồng nhân dân" },
  { id: "KHONG_CHUYEN_TRACH", title: "Người hoạt động không chuyên trách" },
  { id: "NGUOI_LAO_DONG", title: "Người lao động" },
  { id: "KHAC", title: "Khác (ghi rõ)" },
];

export const StepGeneralInfo: React.FC<StepGeneralInfoProps> = ({
  part1,
  setPart1,
  linkMeta,
  onNext,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [communeSearch, setCommuneSearch] = useState("");

  const filteredCommunes = linkMeta.communes.filter((c) =>
    c.name.toLowerCase().includes(communeSearch.toLowerCase())
  );

  const handleAgencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const agency = AGENCIES.find((a) => a.code === code);
    setPart1((prev) => ({
      ...prev,
      agencyCode: code,
      agencyName: agency?.name || "",
      positionCode: "",
      positionName: "",
      positionOtherText: "",
    }));
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const posList = POSITIONS_BY_AGENCY[part1.agencyCode || ""] || [];
    const pos = posList.find((p) => p.code === code);
    setPart1((prev) => ({
      ...prev,
      positionCode: code,
      positionName: pos?.name || "",
      positionOtherText: code.includes("KHAC") ? prev.positionOtherText : "",
    }));
  };

  const handleCommuneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const commune = linkMeta.communes.find((c) => c.code === code);
    setPart1((prev) => ({
      ...prev,
      communeCode: code,
      communeName: commune?.name || "",
      districtName: commune?.districtName || "Quận/Huyện",
    }));
  };

  const toggleCapacity = (capId: any) => {
    setPart1((prev) => {
      const existing = prev.capacities || [];
      const updated = existing.includes(capId)
        ? existing.filter((c) => c !== capId)
        : [...existing, capId];
      return {
        ...prev,
        capacities: updated,
        capacityOtherText: updated.includes("KHAC") ? prev.capacityOtherText : "",
      };
    });
  };

  const validateAndProceed = () => {
    if (!part1.communeCode) {
      setErrorMsg("Vui lòng chọn Xã/Phường/Thị trấn.");
      return;
    }
    if (!part1.agencyCode) {
      setErrorMsg("Vui lòng chọn Cơ quan, đơn vị công tác.");
      return;
    }
    if (!part1.positionCode) {
      setErrorMsg("Vui lòng chọn Vị trí việc làm.");
      return;
    }
    if (part1.positionCode.includes("KHAC") && !part1.positionOtherText?.trim()) {
      setErrorMsg("Vui lòng ghi rõ chức danh vị trí việc làm khác của đồng chí.");
      return;
    }
    if (!part1.capacities || part1.capacities.length === 0) {
      setErrorMsg("Vui lòng tích chọn ít nhất một tư cách làm việc.");
      return;
    }
    if (part1.capacities.includes("KHAC") && !part1.capacityOtherText?.trim()) {
      setErrorMsg("Vui lòng ghi rõ tư cách làm việc khác.");
      return;
    }
    if (!part1.experienceYears) {
      setErrorMsg("Vui lòng chọn số năm làm công việc tài chính, tài sản công.");
      return;
    }

    setErrorMsg(null);
    onNext();
  };

  const currentPositions = POSITIONS_BY_AGENCY[part1.agencyCode || ""] || [];

  return (
    <div className="space-y-6">
      {/* Banner giới thiệu */}
      <div className="bg-sky-50 border-l-4 border-sky-600 p-4 rounded-r-lg">
        <h3 className="text-sm font-semibold text-sky-900 uppercase tracking-wide">
          Phần I — Thông tin chung của người trả lời
        </h3>
        <p className="text-xs text-sky-700 mt-1">
          Khảo sát phục vụ xây dựng kế hoạch bồi dưỡng năng lực của Kiểm toán nhà nước. Toàn bộ thông tin được bảo mật ẩn danh hoàn toàn (Zero-PII).
        </p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. Tỉnh / Thành phố (Cố định theo Link) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-medium">
          <Building2 className="w-5 h-5 text-sky-700" />
          <span>Địa bàn hành chính</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              <span>Tỉnh / Thành phố</span>
            </label>
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute left-3.5 w-4 h-4 text-sky-700 z-10">
                <MapPin className="w-full h-full" />
              </div>
              <input
                type="text"
                readOnly
                value={linkMeta.provinceName}
                className="w-full bg-slate-100 border border-slate-200/90 text-slate-800 rounded-xl sm:rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-bold cursor-not-allowed shadow-2xs"
              />
            </div>
          </div>

          <Select
            label="Xã / Phường / Thị trấn"
            required
            icon={MapPin}
            sizeVariant="md"
            value={part1.communeCode || ""}
            onChange={handleCommuneChange}
          >
            <option value="">-- Bấm để chọn Xã/Phường --</option>
            {filteredCommunes.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} {c.districtName ? `(${c.districtName})` : ""}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* 2. Cơ quan & Vị trí việc làm */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-medium">
          <User className="w-5 h-5 text-sky-700" />
          <span>Cơ quan và Vị trí việc làm</span>
        </div>

        <div className="space-y-4">
          <Select
            label="Câu 2: Cơ quan, đơn vị công tác"
            required
            icon={Landmark}
            sizeVariant="md"
            value={part1.agencyCode || ""}
            onChange={handleAgencyChange}
          >
            <option value="">-- Bấm để chọn Cơ quan, đơn vị --</option>
            {AGENCIES.map((a) => (
              <option key={a.code} value={a.code}>
                {a.name}
              </option>
            ))}
          </Select>

          {part1.agencyCode && (
            <Select
              label="Câu 3: Vị trí việc làm của đồng chí"
              required
              icon={Briefcase}
              sizeVariant="md"
              value={part1.positionCode || ""}
              onChange={handlePositionChange}
            >
              <option value="">-- Bấm để chọn Vị trí việc làm --</option>
              {currentPositions.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </Select>
          )}

          {part1.positionCode?.includes("KHAC") && (
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                <span>Ghi rõ chức danh vị trí khác</span>
                <span className="text-rose-500 font-black">*</span>
              </label>
              <input
                type="text"
                value={part1.positionOtherText || ""}
                onChange={(e) =>
                  setPart1((prev) => ({ ...prev, positionOtherText: e.target.value }))
                }
                placeholder="Ví dụ: Cán bộ giao thông - thủy lợi..."
                className="w-full bg-slate-50/60 hover:bg-white focus:bg-white border border-slate-300/80 hover:border-slate-400 text-slate-900 rounded-xl sm:rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium shadow-2xs focus:outline-none focus:border-sky-600 focus:ring-4 focus:ring-sky-500/10 transition-all"
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. Tư cách làm việc (Câu 4 - Chọn nhiều) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
            Câu 4: Tư cách làm việc của đồng chí (chọn các mục phù hợp) <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-slate-500 mb-3">
            Đồng chí có thể tích chọn nhiều mục nếu kiêm nhiệm hoặc có nhiều tư cách.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CAPACITIES.map((cap) => {
              const checked = part1.capacities?.includes(cap.id as any);
              return (
                <label
                  key={cap.id}
                  onClick={() => toggleCapacity(cap.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-sm cursor-pointer transition-colors ${
                    checked
                      ? "bg-sky-50 border-sky-600 text-sky-950 font-medium"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!checked}
                    onChange={() => {}}
                    className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                  />
                  <span>{cap.title}</span>
                </label>
              );
            })}
          </div>

          {part1.capacities?.includes("KHAC" as any) && (
            <div className="mt-3">
              <input
                type="text"
                value={part1.capacityOtherText || ""}
                onChange={(e) =>
                  setPart1((prev) => ({ ...prev, capacityOtherText: e.target.value }))
                }
                placeholder="Ghi rõ tư cách khác..."
                className="w-full bg-white border border-slate-300 focus:border-sky-600 focus:ring-1 focus:ring-sky-600 rounded-lg px-3 py-2 text-sm text-slate-800"
              />
            </div>
          )}
        </div>
      </div>

      {/* 4. Số năm làm công việc (Câu 5 - Chọn 1) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-medium">
          <Clock className="w-5 h-5 text-sky-700" />
          <span>Kinh nghiệm công tác</span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-3">
            Câu 5: Số năm đồng chí làm công việc quản lý tài chính, tài sản công <span className="text-red-500">*</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "UNDER_1", title: "Dưới 1 năm" },
              { id: "FROM_1_TO_3", title: "Từ 1 đến 3 năm" },
              { id: "OVER_3", title: "Trên 3 năm" },
            ].map((exp) => {
              const selected = part1.experienceYears === exp.id;
              return (
                <label
                  key={exp.id}
                  onClick={() =>
                    setPart1((prev) => ({ ...prev, experienceYears: exp.id as any }))
                  }
                  className={`flex items-center justify-center p-3 rounded-lg border text-sm cursor-pointer transition-all ${
                    selected
                      ? "bg-sky-700 text-white border-sky-700 font-medium shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <input
                    type="radio"
                    name="experienceYears"
                    checked={selected}
                    onChange={() => {}}
                    className="sr-only"
                  />
                  <span>{exp.title}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Nút Tiếp tục */}
      <div className="pt-2">
        <button
          type="button"
          onClick={validateAndProceed}
          className="w-full bg-sky-700 hover:bg-sky-800 text-white font-medium py-3.5 px-6 rounded-xl shadow flex items-center justify-center gap-2 transition-colors text-base"
        >
          <span>Tiếp tục sang Phần II: Nhóm công việc</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
