import React from "react";
import { Metadata } from "next";
import { DuplicateReviewWorkbench } from "@/components/admin/DuplicateReviewWorkbench";

export const metadata: Metadata = {
  title: "Rà soát Phiếu Nghi trùng — Phân hệ Quản trị Kiểm toán nhà nước",
  description:
    "Trung tâm rà soát, thẩm tra và xử lý các phiếu khảo sát nghi trùng khớp theo 4 điểm nghiệp vụ.",
};

export default function DuplicateReviewPage() {
  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <DuplicateReviewWorkbench />
      </div>
    </div>
  );
}
