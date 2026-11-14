"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

interface AppLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
}

const SIZE_MAP = {
  sm: { width: 32, height: 32, iconSize: "w-5 h-5", container: "w-8 h-8" },
  md: { width: 44, height: 44, iconSize: "w-6 h-6", container: "w-11 h-11" },
  lg: { width: 56, height: 56, iconSize: "w-8 h-8", container: "w-14 h-14" },
  xl: { width: 72, height: 72, iconSize: "w-10 h-10", container: "w-18 h-18" },
};

/**
 * Component AppLogo — VỊ TRÍ BỎ LOGO CỦA HỆ THỐNG
 * 
 * Hướng dẫn chèn Logo:
 * - Để thay thế Logo, bạn chỉ cần đặt file ảnh vào:
 *     + public/logo.png  (ảnh trong suốt PNG)
 *     hoặc
 *     + public/logo.svg  (ảnh vector SVG)
 * - Nếu không có file ảnh, component tự động hiển thị biểu trưng kiểm toán mặc định.
 */
export const AppLogo: React.FC<AppLogoProps> = ({
  size = "md",
  className = "",
  showText = false,
}) => {
  const [imgSrc, setImgSrc] = useState<string>("/logo.png");
  const [hasError, setHasError] = useState<boolean>(false);
  const dimensions = SIZE_MAP[size];

  const handleImageError = () => {
    if (imgSrc === "/logo.png") {
      // Nếu /logo.png không tồn tại, thử /logo.svg
      setImgSrc("/logo.svg");
    } else {
      // Cả 2 đều không tồn tại -> hiện icon fallback
      setHasError(true);
    }
  };

  return (
    <div className={`relative flex items-center gap-3 shrink-0 ${className}`}>
      {/* VÙNG CHỨA LOGO (LOGO SLOT) */}
      <div
        className={`relative ${dimensions.container} rounded-2xl overflow-hidden flex items-center justify-center bg-white/10 backdrop-blur-xs text-white shadow-md border border-slate-200/40 transition-transform duration-200 hover:scale-105`}
        title="Logo Kiểm toán nhà nước"
      >
        {!hasError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imgSrc}
            alt="Logo Kiểm toán nhà nước"
            className="w-full h-full object-contain p-0.5"
            onError={handleImageError}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-sky-800 text-amber-300">
            <ShieldCheck className={dimensions.iconSize} />
          </div>
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold uppercase text-sky-700 tracking-wider">
            KIỂM TOÁN NHÀ NƯỚC
          </span>
          <span className="text-sm font-extrabold text-slate-900 tracking-tight leading-tight">
            Hệ thống Quản lý Khảo sát
          </span>
        </div>
      )}
    </div>
  );
};

export default AppLogo;
