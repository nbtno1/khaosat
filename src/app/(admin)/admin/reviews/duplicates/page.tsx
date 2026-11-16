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
    <div className="h-full flex flex-col p-4 sm:p-5 max-w-7xl w-full mx-auto overflow-hidden">
      <DuplicateReviewWorkbench />
    </div>
  );
}
