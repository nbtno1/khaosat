"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  QrCode,
  Layers,
  FileCheck2,
  LogOut,
  User,
  ShieldCheck,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { AppLogo } from "@/components/common/AppLogo";

interface CurrentUser {
  id: string;
  username: string;
  fullName: string;
  role: string;
  roleLabel: string;
  organization: string;
  assignedProvinceCodes: string[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Lấy thông tin user hiện tại
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          // Chưa đăng nhập -> Cho phép xem ở chế độ Demo Admin
          return {
            success: true,
            user: {
              id: "demo",
              username: "admin",
              fullName: "Quản trị viên Hệ thống",
              role: "TECHNICAL_ADMIN",
              roleLabel: "Quản trị Kỹ thuật",
              organization: "Kiểm toán nhà nước",
              assignedProvinceCodes: [],
            },
          };
        }
        return res.json();
      })
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignored
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  const navItems = [
    {
      label: "Tổng quan & Tiến độ",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
      description: "KPIs, biểu đồ tiến độ & 34 tỉnh",
      roles: ["TECHNICAL_ADMIN", "CONTENT_ADMIN", "REVIEWER", "PROGRESS_MONITOR", "LOCAL_COORDINATOR"],
    },
    {
      label: "Đợt khảo sát & Mã QR",
      href: "/admin/campaigns",
      icon: QrCode,
      description: "Quản lý đợt & Tải 34 QR ZIP",
      roles: ["TECHNICAL_ADMIN", "CONTENT_ADMIN", "REVIEWER", "PROGRESS_MONITOR", "LOCAL_COORDINATOR"],
    },
    {
      label: "Rà soát Nghi trùng",
      href: "/admin/reviews/duplicates",
      icon: FileCheck2,
      description: "Thẩm tra phiếu nghi trùng 4 điểm",
      roles: ["TECHNICAL_ADMIN", "CONTENT_ADMIN", "REVIEWER"],
    },
    {
      label: "Phân tích 6 Bảng & Xuất Excel",
      href: "/admin/analytics",
      icon: Layers,
      description: "Bảng B1-B6, Khoảng thiếu hụt & Excel",
      roles: ["TECHNICAL_ADMIN", "CONTENT_ADMIN", "REVIEWER", "PROGRESS_MONITOR", "LOCAL_COORDINATOR"],
    },
    {
      label: "Hướng dẫn sử dụng",
      href: "/admin/guide",
      icon: BookOpen,
      description: "Cẩm nang vận hành cập nhật động",
      roles: ["TECHNICAL_ADMIN", "CONTENT_ADMIN", "REVIEWER", "PROGRESS_MONITOR", "LOCAL_COORDINATOR"],
    },
  ];

  const userRole = currentUser?.role || "TECHNICAL_ADMIN";
  const visibleNavItems = navItems.filter((item) => item.roles.includes(userRole));

  // Sidebar content markup reused in both Desktop and Mobile drawer
  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between bg-white">
      {/* Brand & Logo Header */}
      <div>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link
            href="/admin/dashboard"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 group"
          >
            <AppLogo size="md" />
            <div>
              <div className="text-[10px] uppercase font-black text-sky-700 tracking-wider">
                KIỂM TOÁN NHÀ NƯỚC
              </div>
              <div className="text-sm font-extrabold text-slate-900 tracking-tight leading-snug">
                Hệ thống Quản lý Khảo sát
              </div>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="px-3.5 py-4 space-y-6">
          <div>
            <div className="px-3 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-2">
              DANH MỤC QUẢN TRỊ
            </div>
            <nav className="space-y-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-sky-50 text-sky-800 font-extrabold shadow-xs border-l-4 border-sky-700"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-sky-700" : "text-slate-400"}`} />
                    <div className="flex-1 truncate">
                      <div className="truncate">{item.label}</div>
                      <div className="text-[10px] text-slate-400 font-normal truncate">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick link to public survey */}
          <div className="px-1 pt-2">
            <a
              href="/khao-sat/pilot_dot-1-2026_p20"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200/80 text-xs text-slate-700 hover:text-sky-800 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-sky-600" />
                <span className="font-bold text-[11px]">Mở form khảo sát di động</span>
              </div>
              <span className="text-[10px] text-slate-400 group-hover:text-sky-600">Thái Nguyên</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer User Info & Logout Button */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs shrink-0 shadow-xs border border-sky-200/60">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-900 truncate">
              {currentUser?.fullName || "Quản trị viên"}
            </div>
            <div className="text-[10px] font-semibold text-sky-700 truncate">
              {currentUser?.roleLabel || "Quản trị Kỹ thuật"}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {currentUser?.organization || "Kiểm toán nhà nước"}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200/70 hover:border-rose-300 transition-colors shadow-2xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất phiên làm việc</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* 1. DESKTOP VERTICAL SIDEBAR (CỐ ĐỊNH BÊN TRÁI) */}
      <aside className="hidden lg:flex w-64 xl:w-72 shrink-0 border-r border-slate-200/80 bg-white h-screen sticky top-0 z-30 shadow-xs">
        <SidebarContent />
      </aside>

      {/* 2. MOBILE TOPBAR & DRAWER (MÀN HÌNH NHỎ) */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/admin/dashboard" className="flex items-center gap-2.5">
              <AppLogo size="sm" />
              <div>
                <div className="text-[9px] uppercase font-black text-sky-700">KIỂM TOÁN NHÀ NƯỚC</div>
                <div className="text-xs font-extrabold text-slate-900 truncate max-w-[170px]">
                  Quản lý Khảo sát
                </div>
              </div>
            </Link>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Slide-in Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer Body */}
            <div className="relative w-72 max-w-[85%] bg-white h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-200">
              <SidebarContent />
            </div>
          </div>
        )}
      </div>

      {/* 3. MAIN CONTENT WORKSPACE (BÊN PHẢI) */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>

        {/* Global Admin Footer */}
        <footer className="bg-white border-t border-slate-200/80 py-4 px-6 text-center text-xs text-slate-500">
          Hệ thống Khảo sát Năng lực Quản lý Tài chính, Tài sản công cấp xã — Trường Đào tạo và Bồi dưỡng nghiệp vụ kiểm toán (Kiểm toán nhà nước)
        </footer>
      </div>
    </div>
  );
}
