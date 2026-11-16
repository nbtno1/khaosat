import Link from "next/link";
import { AppLogo } from "@/components/common/AppLogo";

export default function Home() {
  return (
    <div className="h-screen max-h-screen w-screen overflow-y-auto flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      <div className="max-w-2xl text-center flex flex-col items-center space-y-6">
        {/* VỊ TRÍ ĐẶT LOGO (LOGO SLOT) - Thay logo tại public/logo.png hoặc public/logo.svg */}
        <AppLogo size="xl" />

        <div className="inline-block px-3.5 py-1 bg-sky-500/20 border border-sky-400/30 rounded-full text-sky-300 text-xs font-bold uppercase tracking-wider">
          Kiểm toán nhà nước Việt Nam
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Hệ thống Quản lý Khảo sát Năng lực Quản lý Tài chính, Tài sản công
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Nền tảng khảo sát trực tuyến theo vị trí việc làm cấp xã, phường; tổng hợp nhu cầu bồi dưỡng và đo lường khoảng thiếu hụt năng lực phục vụ đào tạo bồi dưỡng.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/admin/dashboard"
            className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition shadow-md"
          >
            Cổng Quản trị Hệ thống
          </Link>
          <a
            href="/spec-overview.html"
            target="_blank"
            className="px-6 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition border border-slate-700"
          >
            Xem Đặc tả Kỹ thuật (Spec HTML)
          </a>
        </div>
      </div>
    </div>
  );
}
