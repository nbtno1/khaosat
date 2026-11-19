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
    <div className="h-screen max-h-screen w-screen overflow-hidden civic-ambient-bg flex flex-col justify-between items-center py-8 px-4">
      <div className="hidden sm:block" />

      <div className="w-full max-w-[440px] civic-panel civic-top-accent rounded-2xl p-8 sm:p-10 flex flex-col my-auto overflow-hidden">
        <div className="flex flex-col items-center text-center mb-7">
          <AppLogo size="lg" className="mb-3.5" />
          <span className="text-[13.5px] font-bold uppercase tracking-[0.06em] text-[#12457a]">
            Kiểm toán nhà nước
          </span>
          <h1 className="text-[24px] font-bold text-[#0e1c2e] tracking-[-0.025em] mt-1">
            Hệ thống Quản lý Khảo sát
          </h1>
          <p className="text-[15px] text-slate-500 mt-1.5">
            Đánh giá năng lực tài chính, tài sản công cấp xã
          </p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 text-[14.5px]">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-snug font-medium">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[15px] font-semibold text-slate-700 mb-2">
              Tên đăng nhập
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập"
                className="w-full h-[48px] pl-11 pr-4 rounded-[11px] border-[1.5px] border-slate-300 bg-[#f8fafc] hover:bg-white focus:bg-white focus:outline-none focus:border-[#12457a] focus:ring-4 focus:ring-[#12457a]/12 text-[16px] text-[#0e1c2e] transition-all"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-[15px] font-semibold text-slate-700 mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full h-[48px] pl-11 pr-12 rounded-[11px] border-[1.5px] border-slate-300 bg-[#f8fafc] hover:bg-white focus:bg-white focus:outline-none focus:border-[#12457a] focus:ring-4 focus:ring-[#12457a]/12 text-[16px] text-[#0e1c2e] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#12457a] transition-colors cursor-pointer"
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[50px] mt-2 px-5 rounded-[11px] civic-btn-primary font-semibold text-[16.5px] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Đăng nhập hệ thống</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-3 text-[14px] text-slate-500">
          <span>Đăng nhập nhanh:</span>
          <button
            type="button"
            onClick={() => setPresetUser("cntt_admin", "Admin@123456")}
            className="text-[#12457a] hover:underline font-semibold cursor-pointer"
            title="Đăng nhập tài khoản Cục CNTT (Xem Log)"
          >
            Cục CNTT
          </button>
          <span className="text-slate-300">•</span>
          <button
            type="button"
            onClick={() => setPresetUser("admin", "Admin@123456")}
            className="text-[#12457a] hover:underline font-semibold cursor-pointer"
            title="Đăng nhập tài khoản Admin Quản trị"
          >
            Admin
          </button>
        </div>
      </div>

      <div className="text-center text-[14px] text-slate-500 py-2">
        © 2026 Trường Đào tạo & Bồi dưỡng nghiệp vụ kiểm toán — Kiểm toán nhà nước
      </div>
    </div>
  );
}
