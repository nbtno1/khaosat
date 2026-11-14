"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react";
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
        setErrorMessage(data.error || "Đăng nhập thất bại. Vui lòng thử lại.");
        return;
      }

      // Đăng nhập thành công -> Điều hướng sang Admin Dashboard
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 flex flex-col justify-center items-center px-4 py-12">
      {/* Decorative Brand Header */}
      <div className="text-center mb-8 max-w-lg flex flex-col items-center">
        {/* VỊ TRÍ ĐẶT LOGO (LOGO SLOT) - Thay logo tại public/logo.png hoặc public/logo.svg */}
        <AppLogo size="xl" className="mb-4" />
        <div className="text-xs uppercase tracking-widest text-sky-400 font-extrabold mb-1">
          TRƯỜNG ĐÀO TẠO VÀ BỒI DƯỠNG NGHIỆP VỤ KIỂM TOÁN
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Hệ thống Quản lý Khảo sát
        </h1>
        <p className="text-sm text-slate-300 mt-2">
          Đánh giá năng lực quản lý tài chính, tài sản công cấp xã năm 2026
        </p>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 sm:p-10">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">Đăng nhập Quản trị</h2>
          <p className="text-xs text-slate-500 mt-1">
            Dành riêng cho cán bộ Kiểm toán nhà nước và Đầu mối được cấp quyền
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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
                placeholder="Ví dụ: admin hoặc reviewer"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent text-sm text-slate-900 bg-slate-50/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-transparent text-sm text-slate-900 bg-slate-50/50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-sm shadow-lg shadow-sky-700/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Đăng nhập hệ thống</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Testing Presets */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
            Chọn nhanh vai trò kiểm thử (Mật khẩu: Admin@123456)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPresetUser("admin", "Admin@123456")}
              className="px-2.5 py-2 text-left rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
            >
              <div className="text-sky-700 font-bold">Admin</div>
              <div className="text-[10px] text-slate-400">Toàn quyền kỹ thuật</div>
            </button>
            <button
              type="button"
              onClick={() => setPresetUser("reviewer", "Admin@123456")}
              className="px-2.5 py-2 text-left rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
            >
              <div className="text-emerald-700 font-bold">Reviewer</div>
              <div className="text-[10px] text-slate-400">Rà soát nghi trùng</div>
            </button>
            <button
              type="button"
              onClick={() => setPresetUser("monitor", "Admin@123456")}
              className="px-2.5 py-2 text-left rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
            >
              <div className="text-violet-700 font-bold">Monitor</div>
              <div className="text-[10px] text-slate-400">Theo dõi tiến độ</div>
            </button>
            <button
              type="button"
              onClick={() => setPresetUser("coordinator_tn", "Admin@123456")}
              className="px-2.5 py-2 text-left rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
            >
              <div className="text-amber-700 font-bold">Đầu mối tỉnh</div>
              <div className="text-[10px] text-slate-400">Thái Nguyên (ẩn &lt;5)</div>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        © 2026 Trường Đào tạo và Bồi dưỡng nghiệp vụ kiểm toán — Kiểm toán nhà nước
      </div>
    </div>
  );
}
