"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, HeartHandshake } from "lucide-react";

interface SurveySuccessModalProps {
  provinceName?: string;
  communeName?: string;
}

export const SurveySuccessModal: React.FC<SurveySuccessModalProps> = ({
  provinceName,
  communeName,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 sm:p-12 text-center space-y-6 max-w-xl mx-auto my-8">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          ĐÃ GỬI PHIẾU THÀNH CÔNG!
        </h2>
        <p className="text-sm text-slate-600 font-medium">
          Hệ thống khảo sát nhu cầu đào tạo, bồi dưỡng năng lực quản lý tài chính, tài sản công cấp xã (Phiên bản 3.3)
        </p>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed text-left space-y-2">
        <div className="flex items-center gap-2 text-sky-800 font-semibold">
          <HeartHandshake className="w-4 h-4 text-sky-600" />
          <span>Lời cảm ơn từ Trường Đào tạo & Bồi dưỡng nghiệp vụ kiểm toán</span>
        </div>
        <p>
          Trân trọng cảm ơn đồng chí tại{" "}
          <strong className="text-slate-900">{communeName || "địa phương"}</strong> (
          <strong className="text-slate-900">{provinceName || "tỉnh/thành phố"}</strong>) đã dành thời gian quý báu tham gia khảo sát nghiêm túc và trách nhiệm.
        </p>
        <p>
          Ý kiến và đánh giá thực tế của đồng chí là căn cứ quan trọng hàng đầu để Kiểm toán nhà nước thiết kế các chương trình, tài liệu tập huấn thiết thực, sát đúng với nhu cầu cơ sở trong năm 2026.
        </p>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>Phiếu đã được bảo mật ẩn danh và khóa tự động để tránh gửi lặp.</span>
      </div>
    </div>
  );
};
