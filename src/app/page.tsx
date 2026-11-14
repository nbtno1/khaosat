import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <div className="max-w-2xl text-center space-y-6">
        <div className="inline-block px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-semibold uppercase tracking-wider">
          Kiểm toán nhà nước · Phiên bản 3.3
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Hệ thống Quản lý Khảo sát Năng lực Quản lý Tài chính, Tài sản công
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
          Nền tảng khảo sát trực tuyến theo vị trí việc làm cấp xã, phường; tổng hợp nhu cầu bồi dưỡng và đo lường khoảng thiếu hụt năng lực phục vụ đào tạo bồi dưỡng.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/admin"
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
