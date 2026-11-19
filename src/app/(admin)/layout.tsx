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
  ShieldCheck,
  Menu,
  X,
  BookOpen,
  MapPin,
  HelpCircle,
  Users,
  GraduationCap,
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
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
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
      roles: ["TECHNICAL_ADMIN", "SYSTEM_ADMIN", "CONTENT_ADMIN", "REVIEWER", "PROGRESS_MONITOR", "LOCAL_COORDINATOR"],
    },
    {
      label: "Đợt khảo sát & Mã QR",
      href: "/admin/campaigns",
      icon: QrCode,
      roles: ["TECHNICAL_ADMIN", "SYSTEM_ADMIN", "CONTENT_ADMIN", "REVIEWER", "PROGRESS_MONITOR", "LOCAL_COORDINATOR"],
    },
    {
      label: "Rà soát nghi trùng",
      href: "/admin/reviews/duplicates",
      icon: FileCheck2,
      roles: ["TECHNICAL_ADMIN", "SYSTEM_ADMIN", "CONTENT_ADMIN", "REVIEWER"],
    },
    {
      label: "Phân tích 6 Bảng",
      href: "/admin/analytics",
      icon: Layers,
      roles: ["TECHNICAL_ADMIN", "SYSTEM_ADMIN", "CONTENT_ADMIN", "REVIEWER", "PROGRESS_MONITOR", "LOCAL_COORDINATOR"],
    },
    {
      label: "Đề xuất đào tạo",
      href: "/admin/training-proposals",
      icon: GraduationCap,
      roles: ["TECHNICAL_ADMIN", "SYSTEM_ADMIN", "CONTENT_ADMIN", "REVIEWER"],
    },
    {
      label: "Danh mục Tỉnh, Xã",
      href: "/admin/administrative-units",
      icon: MapPin,
      roles: ["TECHNICAL_ADMIN", "SYSTEM_ADMIN", "CONTENT_ADMIN", "REVIEWER", "PROGRESS_MONITOR"],
    },
    {
      label: "Quản trị Bộ câu hỏi",
      href: "/admin/questions",
      icon: HelpCircle,
      roles: ["TECHNICAL_ADMIN", "SYSTEM_ADMIN", "CONTENT_ADMIN", "REVIEWER"],
    },
    {
      label: "Tài khoản người dùng",
      href: "/admin/users",
      icon: Users,
      roles: ["TECHNICAL_ADMIN", "SYSTEM_ADMIN"],
    },
    {
      label: "Hướng dẫn sử dụng",
      href: "/admin/guide",
      icon: BookOpen,
      roles: ["TECHNICAL_ADMIN", "SYSTEM_ADMIN", "CONTENT_ADMIN", "REVIEWER", "PROGRESS_MONITOR", "LOCAL_COORDINATOR"],
    },
    {
      label: "Nhật ký hệ thống",
      href: "/admin/audit-logs",
      icon: ShieldCheck,
      roles: ["TECHNICAL_ADMIN"],
    },
  ];

  const userRole = currentUser?.role || "TECHNICAL_ADMIN";
  const visibleNavItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden civic-ambient-bg flex flex-col lg:flex-row">
      {/* 1. DESKTOP VERTICAL SIDEBAR */}
      <aside className="hidden lg:flex w-[268px] shrink-0 border-r border-slate-200/80 bg-white/95 backdrop-blur-md h-full flex-col z-30 shadow-[4px_0_24px_-12px_rgba(15,38,68,0.08)]">
        <AdminSidebar
          pathname={pathname}
          visibleNavItems={visibleNavItems}
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      </aside>

      {/* 2. MOBILE TOPBAR & DRAWER */}
      <div className="lg:hidden shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200/90 z-40 civic-top-accent">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-colors"
              aria-label="Mở menu điều hướng"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/admin/dashboard" className="flex items-center gap-2.5">
              <AppLogo size="sm" />
              <div>
                <div className="text-[12px] font-bold text-[#12457a] leading-tight">Kiểm toán nhà nước</div>
                <div className="text-[15px] font-bold text-[#0e1c2e] truncate max-w-[190px] leading-tight">
                  Khảo sát cấp xã
                </div>
              </div>
            </Link>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2.5 rounded-xl text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Đăng xuất"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-slate-900/45 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-[280px] max-w-[85%] bg-white h-full shadow-2xl z-10 flex flex-col">
              <AdminSidebar
                pathname={pathname}
                visibleNavItems={visibleNavItems}
                currentUser={currentUser}
                onLogout={handleLogout}
                onCloseMobile={() => setIsMobileMenuOpen(false)}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. MAIN CONTENT WORKSPACE - FULL HEIGHT, ZERO-PAGE-SCROLL */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <main className="flex-1 min-h-0 h-full w-full overflow-hidden flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}

interface AdminSidebarProps {
  pathname: string;
  visibleNavItems: Array<{
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: string[];
  }>;
  currentUser: CurrentUser | null;
  onLogout: () => void;
  onCloseMobile?: () => void;
}

function AdminSidebar({
  pathname,
  visibleNavItems,
  currentUser,
  onLogout,
  onCloseMobile,
}: AdminSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-white/95 overflow-hidden civic-top-accent">
      {/* Brand & Logo Header */}
      <div className="shrink-0 px-5 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
        <Link
          href="/admin/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-3.5 group"
        >
          <AppLogo size="md" />
          <div>
            <div className="text-[16px] font-bold text-[#0f2e54] tracking-[-0.015em] leading-snug">
              Kiểm toán nhà nước
            </div>
            <div className="text-[13.5px] font-medium text-slate-500 mt-0.5">
              Khảo sát cấp xã
            </div>
          </div>
        </Link>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Section - CLEAN, UNCLUTTERED 15.5PX ITEMS */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-4">
        <nav className="space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`relative flex items-center gap-3 h-[44px] px-3.5 rounded-[10px] text-[15.5px] transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-[#eaf2fc] to-[#f3f8ff] text-[#0f3d6e] font-semibold shadow-[inset_0_0_0_1px_rgba(18,69,122,0.14)]"
                    : "text-slate-700 font-medium hover:text-[#0f3d6e] hover:bg-slate-100/75"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-[3.5px] rounded-r-full bg-[#12457a]" />
                )}
                <Icon
                  className={`w-[19px] h-[19px] shrink-0 transition-colors ${
                    isActive ? "text-[#12457a]" : "text-slate-400"
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Clean Minimal Footer User Info & Logout */}
      <div className="shrink-0 px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[14.5px] font-semibold text-[#111b27] truncate">
            {currentUser?.fullName || "Quản trị viên"}
          </div>
          <div className="text-[13px] text-slate-500 truncate">
            {currentUser?.roleLabel || "Quản trị Kỹ thuật"}
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="shrink-0 text-[14px] font-semibold text-rose-700 hover:text-rose-800 hover:underline px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
