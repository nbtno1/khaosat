"use client";

import React, { forwardRef, useId } from "react";
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
 * Component Select — Dropdown chuẩn hóa theo hệ thiết kế công vụ hiện đại.
 * Cỡ chữ lớn dễ đọc (sm: 15px, md: 16px, lg: 18px), vùng bấm rộng (42–54px) và focus mượt.
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
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const fieldId = providedId ?? generatedId;
    const messageId = `${fieldId}-message`;
    const describedBy = [props["aria-describedby"], error || helperText ? messageId : null]
      .filter(Boolean)
      .join(" ") || undefined;
    const sizeClasses = {
      sm: {
        select: "min-h-[42px] py-2 pl-9 pr-9 text-[15px] rounded-[10px]",
        iconLeft: "left-3 w-4 h-4",
      },
      md: {
        select: "min-h-[48px] py-2.5 pl-11 pr-10 text-[16px] rounded-[11px]",
        iconLeft: "left-3.5 w-[18px] h-[18px]",
      },
      lg: {
        select: "min-h-[54px] py-3 pl-11 pr-11 text-[18px] font-medium rounded-[11px]",
        iconLeft: "left-3.5 w-5 h-5",
      },
    }[sizeVariant];

    return (
      <div className={`space-y-1.5 w-full min-w-0 ${containerClassName}`}>
        {label && (
          <label htmlFor={fieldId} className="flex items-center gap-1.5 text-[15.5px] font-semibold text-slate-700">
            <span>{label}</span>
            {required && <span className="text-rose-600 font-bold">*</span>}
          </label>
        )}

        <div className="relative group flex items-center">
          {Icon && (
            <div
              className={`pointer-events-none absolute ${sizeClasses.iconLeft} text-slate-400 group-hover:text-[#12457a] transition-colors z-10`}
            >
              <Icon className="w-full h-full" />
            </div>
          )}

          <select
            ref={ref}
            disabled={disabled}
            className={`
              w-full min-w-0 max-w-full appearance-none bg-[#f8fafc] hover:bg-white focus:bg-white
              border-[1.5px] border-slate-300 hover:border-slate-400
              text-[#0e1c2e] font-medium
              shadow-xs
              transition-all duration-200 cursor-pointer
              focus:outline-none focus:border-[#12457a] focus:ring-4 focus:ring-[#12457a]/12
              disabled:opacity-70 disabled:cursor-not-allowed disabled:bg-[#f4f6f9] disabled:text-slate-600
              ${error ? "border-rose-500 focus:border-rose-600 focus:ring-rose-500/15" : ""}
              ${!Icon ? (sizeVariant === "sm" ? "pl-3.5" : "pl-4") : ""}
              ${sizeClasses.select}
              ${className}
            `}
            {...props}
            id={fieldId}
            required={required}
            aria-invalid={error ? true : props["aria-invalid"]}
            aria-describedby={describedBy}
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
                    className="py-2 text-slate-900"
                  >
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-500 group-hover:text-[#12457a] transition-colors z-10">
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>

        {error ? (
          <p id={messageId} role="alert" className="text-[14px] font-medium text-rose-600">{error}</p>
        ) : helperText ? (
          <p id={messageId} className="text-[14px] text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
