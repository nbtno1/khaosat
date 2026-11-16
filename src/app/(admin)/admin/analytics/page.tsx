import React from "react";
import { Metadata } from "next";
import { AnalyticsTablesViewer } from "@/components/admin/AnalyticsTablesViewer";

export const metadata: Metadata = {
  title: "Báo cáo Tổng hợp 6 Bảng — Phân hệ Quản trị Kiểm toán nhà nước",
  description:
    "Tổng hợp số liệu khảo sát, tính toán khoảng thiếu hụt năng lực theo ma trận chuẩn và áp dụng quy tắc ẩn danh bảo vệ số liệu.",
};

export default function AnalyticsPage() {
  return (
    <div className="h-full flex flex-col p-4 sm:p-5 max-w-7xl w-full mx-auto overflow-hidden">
      <AnalyticsTablesViewer />
    </div>
  );
}
