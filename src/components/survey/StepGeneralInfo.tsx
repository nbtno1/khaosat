"use client";

import React, { useState } from "react";
import { Part1Data } from "@/lib/validations/survey.schema";
import { SurveyLinkMeta } from "@/hooks/useSurveyFormState";
import { Select } from "@/components/common/Select";
import { ArrowRight, AlertCircle, Lock } from "lucide-react";

interface StepGeneralInfoProps {
  part1: Partial<Part1Data>;
  setPart1: React.Dispatch<React.SetStateAction<Partial<Part1Data>>>;
  linkMeta: SurveyLinkMeta;
  onNext: () => void;
}

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

const CAPACITIES = [
  { id: "CAN_BO", title: "Cán bộ" },
  { id: "CONG_CHUC", title: "Công chức" },
  { id: "VIEN_CHUC", title: "Viên chức" },
  { id: "DAI_BIEU_HDND", title: "Đại biểu Hội đồng nhân dân" },
  { id: "KHONG_CHUYEN_TRACH", title: "Người hoạt động không chuyên trách" },
  { id: "NGUOI_LAO_DONG", title: "Người lao động" },
  { id: "KHAC", title: "Khác (ghi rõ)" },
] as const;

export const StepGeneralInfo: React.FC<StepGeneralInfoProps> = ({
  part1,
  setPart1,
  linkMeta,
  onNext,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  const toggleCapacity = (capId: Part1Data["capacities"][number]) => {
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
      setErrorMsg("Vui lòng chọn Xã, phường, thị trấn nơi công tác.");
      return;
    }
    if (!part1.agencyCode) {
      setErrorMsg("Vui lòng chọn Cơ quan, đơn vị công tác.");
      return;
    }
    if (!part1.positionCode) {
      setErrorMsg("Vui lòng chọn Vị trí việc làm hiện tại.");
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
    <div className="divide-y divide-slate-100">
      {errorMsg && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center gap-3 text-[15.5px] font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Câu 1: Địa bàn công tác */}
      <section className="pb-7">
        <h3 className="text-[20px] sm:text-[21px] font-bold text-[#0e1c2e] leading-snug mb-4">
          Câu 1. Địa bàn công tác hiện tại <span className="text-rose-600">*</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[15.5px] font-semibold text-slate-600 mb-2">
              Tỉnh, thành phố
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                readOnly
                value={linkMeta.provinceName}
                className="w-full min-h-[54px] bg-[#f4f6f9] border-[1.5px] border-slate-200 text-slate-600 rounded-[11px] px-4 pr-11 text-[18px] font-medium cursor-not-allowed"
              />
              <Lock className="w-[18px] h-[18px] text-slate-400 absolute right-4 pointer-events-none" />
            </div>
          </div>

          <Select
            label="Xã, phường, thị trấn"
            required
            sizeVariant="lg"
            value={part1.communeCode || ""}
            onChange={handleCommuneChange}
          >
            <option value="">Chọn xã, phường, thị trấn...</option>
            {linkMeta.communes.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name} {c.districtName ? `(${c.districtName})` : ""}
              </option>
            ))}
          </Select>
        </div>
      </section>

      {/* Câu 2 & 3: Cơ quan và Vị trí việc làm */}
      <section className="py-7">
        <h3 className="text-[20px] sm:text-[21px] font-bold text-[#0e1c2e] leading-snug mb-4">
          Câu 2–3. Cơ quan và vị trí việc làm hiện tại <span className="text-rose-600">*</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Select
            label="Câu 2. Cơ quan, đơn vị công tác"
            required
            sizeVariant="lg"
            value={part1.agencyCode || ""}
            onChange={handleAgencyChange}
          >
            <option value="">Chọn cơ quan, đơn vị...</option>
            {AGENCIES.map((a) => (
              <option key={a.code} value={a.code}>
                {a.name}
              </option>
            ))}
          </Select>

          <Select
            label="Câu 3. Vị trí việc làm hiện tại"
            required
            sizeVariant="lg"
            disabled={!part1.agencyCode}
            value={part1.positionCode || ""}
            onChange={handlePositionChange}
          >
            <option value="">
              {part1.agencyCode ? "Chọn vị trí việc làm..." : "Chọn cơ quan, đơn vị trước"}
            </option>
            {currentPositions.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>

        {part1.positionCode?.includes("KHAC") && (
          <div className="mt-4">
            <label className="block text-[15.5px] font-semibold text-slate-700 mb-2">
              Ghi rõ chức danh vị trí khác <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={part1.positionOtherText || ""}
              onChange={(e) =>
                setPart1((prev) => ({ ...prev, positionOtherText: e.target.value }))
              }
              placeholder="Ví dụ: Cán bộ giao thông - thủy lợi..."
              className="w-full min-h-[54px] bg-[#f8fafc] hover:bg-white focus:bg-white border-[1.5px] border-slate-300 text-[#0e1c2e] rounded-[11px] px-4 text-[18px] focus:outline-none focus:border-[#12457a] focus:ring-4 focus:ring-[#12457a]/12 transition-all"
            />
          </div>
        )}
      </section>

      {/* Câu 4: Tư cách làm việc */}
      <section className="py-7">
        <h3 className="text-[20px] sm:text-[21px] font-bold text-[#0e1c2e] leading-snug mb-1.5">
          Câu 4. Tư cách làm việc của đồng chí <span className="text-rose-600">*</span>
        </h3>
        <p className="text-[15.5px] text-slate-500 mb-4">
          Có thể chọn nhiều mục nếu kiêm nhiệm.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {CAPACITIES.map((cap) => {
            const checked = part1.capacities?.includes(cap.id);
            return (
              <label
                key={cap.id}
                className={`flex items-center gap-3.5 min-h-[54px] px-4 py-3 rounded-[11px] text-[18px] cursor-pointer transition-all duration-150 select-none ${checked
                    ? "bg-[#e0edfc] border-2 border-[#0f3d6e] text-[#0a2747] font-semibold shadow-xs"
                    : "bg-white border-[1.5px] border-slate-300/90 text-[#111b27] hover:border-[#12457a]/60 hover:bg-[#f8fbfe]"
                  }`}
              >
                <input
                  type="checkbox"
                  checked={!!checked}
                  onChange={() => toggleCapacity(cap.id)}
                  className="w-[21px] h-[21px] accent-[#0f3d6e] rounded shrink-0 cursor-pointer"
                />
                <span>{cap.title}</span>
              </label>
            );
          })}
        </div>

        {part1.capacities?.includes("KHAC") && (
          <div className="mt-4">
            <input
              type="text"
              value={part1.capacityOtherText || ""}
              onChange={(e) =>
                setPart1((prev) => ({ ...prev, capacityOtherText: e.target.value }))
              }
              placeholder="Ghi rõ tư cách khác..."
              className="w-full min-h-[54px] bg-white border-[1.5px] border-slate-300 focus:border-[#12457a] focus:ring-4 focus:ring-[#12457a]/12 rounded-[11px] px-4 text-[18px] text-[#0e1c2e] outline-none"
            />
          </div>
        )}
      </section>

      {/* Câu 5: Số năm kinh nghiệm */}
      <section className="py-7">
        <h3 className="text-[20px] sm:text-[21px] font-bold text-[#0e1c2e] leading-snug mb-4">
          Câu 5. Số năm làm công việc quản lý tài chính, tài sản công <span className="text-rose-600">*</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {(
            [
              { id: "UNDER_1", title: "Dưới 1 năm" },
              { id: "FROM_1_TO_3", title: "Từ 1 đến 3 năm" },
              { id: "OVER_3", title: "Trên 3 năm" },
            ] as const
          ).map((exp) => {
            const selected = part1.experienceYears === exp.id;
            return (
              <label
                key={exp.id}
                className={`flex items-center justify-center min-h-[54px] px-4 py-3 rounded-[11px] text-[18px] cursor-pointer transition-all duration-150 select-none ${selected
                    ? "bg-[#0f3d6e] border-2 border-[#0f3d6e] text-white font-semibold shadow-sm"
                    : "bg-white border-[1.5px] border-slate-300/90 text-[#111b27] hover:border-[#12457a]/60 hover:bg-[#f8fbfe]"
                  }`}
              >
                <input
                  type="radio"
                  name="experienceYears"
                  checked={selected}
                  onChange={() =>
                    setPart1((prev) => ({ ...prev, experienceYears: exp.id }))
                  }
                  className="sr-only"
                />
                <span>{exp.title}</span>
              </label>
            );
          })}
        </div>
      </section>

      {/* Footer Action */}
      <div className="pt-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <span className="text-[15.5px] text-slate-500">
          Phiếu không yêu cầu họ tên, số điện thoại hay CCCD.
        </span>
        <button
          type="button"
          onClick={validateAndProceed}
          className="h-[52px] px-7 rounded-[11px] civic-btn-primary text-[18px] font-semibold inline-flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <span>Tiếp tục</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
