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
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <AnalyticsTablesViewer />
      </div>
    </div>
  );
}
