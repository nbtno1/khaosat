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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    // Lấy thông tin user hiện tại
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          // Chưa đăng nhập -> Cho phép xem ở chế độ Demo Admin hoặc chuyển hướng nếu cần
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
      roles: ["TECHNICAL_ADMIN", "CONTENT_ADMIN", "REVIEWER", "PROGRESS_MONITOR", "LOCAL_COORDINATOR"],
    },
    {
      label: "Đợt khảo sát & Mã QR",
      href: "/admin/campaigns",
      icon: QrCode,
      roles: ["TECHNICAL_ADMIN", "CONTENT_ADMIN", "REVIEWER", "PROGRESS_MONITOR", "LOCAL_COORDINATOR"],
    },
    {
      label: "Rà soát Nghi trùng",
      href: "/admin/reviews/duplicates",
      icon: FileCheck2,
      roles: ["TECHNICAL_ADMIN", "CONTENT_ADMIN", "REVIEWER"],
    },
    {
      label: "Phân tích 6 Bảng & Xuất Excel",
      href: "/admin/analytics",
      icon: Layers,
      roles: ["TECHNICAL_ADMIN", "CONTENT_ADMIN", "REVIEWER", "PROGRESS_MONITOR", "LOCAL_COORDINATOR"],
    },
    {
      label: "Hướng dẫn sử dụng",
      href: "/admin/guide",
      icon: BookOpen,
      roles: ["TECHNICAL_ADMIN", "CONTENT_ADMIN", "REVIEWER", "PROGRESS_MONITOR", "LOCAL_COORDINATOR"],
    },
  ];

  const userRole = currentUser?.role || "TECHNICAL_ADMIN";
  const visibleNavItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand / Title */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <Link href="/admin/dashboard" className="flex items-center gap-3 group">
                {/* VỊ TRÍ ĐẶT LOGO (LOGO SLOT) - Thay logo tại public/logo.png hoặc public/logo.svg */}
                <AppLogo size="md" />
                <div>
                  <div className="text-[10px] uppercase font-extrabold text-sky-700 tracking-wider">
                    KIỂM TOÁN NHÀ NƯỚC
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Hệ thống Quản lý Khảo sát</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-sky-50 text-sky-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-sky-700" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: User Menu & Public Link */}
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="/khao-sat/pilot_dot-1-2026_p20"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-sky-700 hover:bg-sky-50 transition-colors border border-slate-200"
                title="Mở biểu mẫu khảo sát thử nghiệm của Tỉnh Thái Nguyên"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Xem form khảo sát</span>
              </a>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl text-left border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs font-bold text-slate-800 line-clamp-1">
                      {currentUser?.fullName || "Quản trị viên"}
                    </div>
                    <div className="text-[10px] text-sky-600 font-semibold line-clamp-1">
                      {currentUser?.roleLabel || "Quản trị Kỹ thuật"}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="text-xs font-bold text-slate-900">{currentUser?.fullName}</div>
                      <div className="text-[11px] text-slate-500">{currentUser?.organization}</div>
                      <div className="mt-1 inline-block px-2 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-bold rounded">
                        {currentUser?.roleLabel}
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất phiên làm việc</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold ${
                    isActive ? "bg-sky-50 text-sky-700" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Hệ thống Khảo sát Năng lực Quản lý Tài chính, Tài sản công cấp xã — Trường Đào tạo và Bồi dưỡng nghiệp vụ kiểm toán (Kiểm toán nhà nước)
      </footer>
    </div>
  );
}
