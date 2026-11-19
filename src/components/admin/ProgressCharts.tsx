"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ProgressChartsProps {
  dailyTimeline: Array<{ date: string; submissions: number; cumulative: number }>;
  topProvinces: Array<{ name: string; submissions: number }>;
}

export const ProgressCharts: React.FC<ProgressChartsProps> = ({
  dailyTimeline,
  topProvinces,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 bg-slate-100 rounded-2xl animate-pulse" />
        <div className="h-72 bg-slate-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Daily Submissions Timeline Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between mb-5 gap-3">
          <div>
            <h3 className="text-[18px] font-bold text-[#0e1c2e]">
              Phiếu tiếp nhận theo ngày
            </h3>
            <p className="text-[14.5px] text-slate-500 mt-0.5">
              Số lượng phiếu mới tiếp nhận theo từng ngày trên toàn quốc
            </p>
          </div>
          <span className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#12457a] shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1d5ca3] inline-block" />
            Theo ngày
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyTimeline} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1d5ca3" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#1d5ca3" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 13.5, fill: "#475569" }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 13.5, fill: "#475569" }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0e1c2e",
                  borderRadius: "10px",
                  border: "none",
                  color: "#fff",
                  fontSize: "14px",
                  boxShadow: "0 10px 20px -5px rgba(15, 23, 42, 0.25)",
                }}
                labelStyle={{ fontWeight: "bold", color: "#93c5fd" }}
                formatter={(val: number) => [`${val} phiếu`, "Số phiếu"]}
              />
              <Area
                type="monotone"
                dataKey="submissions"
                stroke="#12457a"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorSubmissions)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Top Provinces Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between mb-5 gap-3">
          <div>
            <h3 className="text-[18px] font-bold text-[#0e1c2e]">
              Địa phương có tiến độ cao nhất
            </h3>
            <p className="text-[14.5px] text-slate-500 mt-0.5">
              Số lượng phiếu thu thập phân bổ theo tỉnh, thành phố
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-[13.5px] font-semibold bg-emerald-50 text-emerald-800 shrink-0">
            Tiến độ tích cực
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topProvinces} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="civicBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#0f3d6e" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f6" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 13.5, fill: "#475569" }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 13.5, fill: "#475569" }}
                axisLine={{ stroke: "#cbd5e1" }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0e1c2e",
                  borderRadius: "10px",
                  border: "none",
                  color: "#fff",
                  fontSize: "14px",
                }}
                labelStyle={{ fontWeight: "bold", color: "#93c5fd" }}
                formatter={(val: number) => [`${val} phiếu`, "Thu thập"]}
              />
              <Bar dataKey="submissions" fill="url(#civicBarGrad)" radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
