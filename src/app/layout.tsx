import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hệ thống Khảo sát Nhu cầu Đào tạo Cấp Xã/Phường",
  description: "Trường Đào tạo và Bồi dưỡng nghiệp vụ kiểm toán — Kiểm toán nhà nước",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full overflow-hidden">
      <body className="h-full max-h-screen overflow-hidden bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
