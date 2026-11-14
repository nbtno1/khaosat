"use client";

import React, { forwardRef } from "react";
import { ChevronDown, LucideIcon } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  required?: boolean;
  icon?: LucideIcon;
  error?: string;
  helperText?: string;
  sizeVariant?: "sm" | "md" | "lg";
  containerClassName?: string;
  options?: SelectOption[];
  placeholder?: string;
}

/**
 * Component Select — Dropdown chuẩn hóa, giao diện hiện đại
 * Tích hợp Icon bên trái, Chevron tùy biến bên phải, hiệu ứng Focus Ring & Hover mềm mại.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      required,
      icon: Icon,
      error,
      helperText,
      sizeVariant = "md",
      containerClassName = "",
      className = "",
      children,
      options,
      placeholder,
      disabled,
      ...props
    },
    ref
  ) => {
    // Kích thước theo variant
    const sizeClasses = {
      sm: {
        select: "py-1.5 pl-8 pr-8 text-xs rounded-xl",
        iconLeft: "left-2.5 w-3.5 h-3.5",
        iconRight: "right-2.5 w-3.5 h-3.5",
        badge: "w-5 h-5",
      },
      md: {
        select: "py-2.5 pl-10 pr-10 text-xs sm:text-sm rounded-xl sm:rounded-2xl",
        iconLeft: "left-3.5 w-4 h-4",
        iconRight: "right-3.5 w-4 h-4",
        badge: "w-6 h-6",
      },
      lg: {
        select: "py-3 sm:py-3.5 pl-11 pr-11 text-sm font-semibold rounded-2xl",
        iconLeft: "left-3.5 w-5 h-5",
        iconRight: "right-3.5 w-5 h-5",
        badge: "w-7 h-7",
      },
    }[sizeVariant];

    return (
      <div className={`space-y-1.5 w-full ${containerClassName}`}>
        {/* Label */}
        {label && (
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <span>{label}</span>
            {required && <span className="text-rose-500 font-black">*</span>}
          </label>
        )}

        {/* Input Wrapper */}
        <div className="relative group flex items-center">
          {/* Left Icon (nếu có) */}
          {Icon && (
            <div
              className={`pointer-events-none absolute ${sizeClasses.iconLeft} text-slate-400 group-hover:text-sky-600 transition-colors z-10`}
            >
              <Icon className="w-full h-full" />
            </div>
          )}

          {/* Native Select with custom appearance */}
          <select
            ref={ref}
            disabled={disabled}
            className={`
              w-full appearance-none bg-slate-50/60 hover:bg-white focus:bg-white
              border border-slate-300/80 hover:border-slate-400
              text-slate-900 font-medium
              shadow-2xs hover:shadow-xs
              transition-all duration-200 cursor-pointer
              focus:outline-none focus:border-sky-600 focus:ring-4 focus:ring-sky-500/10
              disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-100
              ${error ? "border-rose-400 focus:border-rose-600 focus:ring-rose-500/10" : ""}
              ${!Icon ? (sizeVariant === "sm" ? "pl-3" : "pl-4") : ""}
              ${sizeClasses.select}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-slate-400">
                {placeholder}
              </option>
            )}

            {options
              ? options.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="py-1.5 text-slate-800"
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          {/* Right Chevron Indicator */}
          <div
            className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg text-slate-400 group-hover:text-sky-700 transition-colors z-10`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* Helper text / Error message */}
        {error ? (
          <p className="text-[11px] font-medium text-rose-600 animate-in fade-in">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-slate-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
