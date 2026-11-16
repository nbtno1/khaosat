"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, AlertCircle, Eye, EyeOff } from "lucide-react";
import { AppLogo } from "@/components/common/AppLogo";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage("Vui lòng điền đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
        return;
      }

      // Đăng nhập thành công -> Điều hướng sang Bàn làm việc Quản trị
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("Không thể kết nối đến máy chủ xác thực.");
    } finally {
      setIsLoading(false);
    }
  };

  const setPresetUser = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage("");
  };

  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden bg-slate-900 flex flex-col justify-between items-center py-6 px-4">
      {/* Vùng đệm trên */}
      <div className="hidden sm:block" />

      {/* Card Đăng nhập tối giản & trang trọng */}
      <div className="w-full max-w-[390px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-8 flex flex-col my-auto">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <AppLogo size="lg" className="mb-3" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-800">
            KIỂM TOÁN NHÀ NƯỚC
          </span>
          <h1 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
            Hệ thống Quản lý Khảo sát
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Đánh giá năng lực tài chính, tài sản công cấp xã
          </p>
        </div>

        {/* Thông báo lỗi */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* Form đăng nhập */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tên đăng nhập
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent text-xs text-slate-900 bg-slate-50/50 transition-all"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent text-xs text-slate-900 bg-slate-50/50 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-sky-800 hover:bg-sky-900 active:bg-sky-950 text-white font-bold text-xs shadow-md shadow-sky-800/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Đăng nhập hệ thống</span>
            )}
          </button>
        </form>

        {/* Gợi ý đăng nhập nhanh (tối giản, kín đáo) */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <span>Gợi ý:</span>
          <button
            type="button"
            onClick={() => setPresetUser("cntt_admin", "Admin@123456")}
            className="text-sky-700 hover:text-sky-900 font-semibold hover:underline cursor-pointer transition-colors"
            title="Đăng nhập tài khoản Cục CNTT (Xem Log)"
          >
            Cục CNTT
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setPresetUser("admin", "Admin@123456")}
            className="text-sky-700 hover:text-sky-900 font-semibold hover:underline cursor-pointer transition-colors"
            title="Đăng nhập tài khoản Admin Quản trị"
          >
            Admin
          </button>
        </div>
      </div>

      {/* Footer nhỏ gọn */}
      <div className="text-center text-[11px] text-slate-500 py-2">
        © 2026 Trường Đào tạo & Bồi dưỡng nghiệp vụ kiểm toán — Kiểm toán nhà nước
      </div>
    </div>
  );
}
