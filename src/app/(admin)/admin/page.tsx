import { redirect } from "next/navigation";

/**
 * Trang gốc /admin — Tự động chuyển hướng đến Dashboard Tổng quan & Tiến độ
 */
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
