import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam",
  display: "swap",
});

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
    <html lang="vi" className={`h-full overflow-hidden ${beVietnamPro.variable}`}>
      <body className="h-full max-h-screen overflow-hidden font-sans text-[#111b27] antialiased civic-ambient-bg">
        {children}
      </body>
    </html>
  );
}
