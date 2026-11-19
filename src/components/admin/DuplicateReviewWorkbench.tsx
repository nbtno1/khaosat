"use client";

import React, { useState, useEffect } from "react";
import {
  DuplicateGroupItem,
} from "@/services/duplicate-detection.service";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  User,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  FileText,
} from "lucide-react";

export const DuplicateReviewWorkbench: React.FC = () => {
  const [groups, setGroups] = useState<DuplicateGroupItem[]>([]);
  const [stats, setStats] = useState<{
    totalSuspected: number;
    pendingReview: number;
    resolvedValid: number;
    resolvedExcluded: number;
  }>({
    totalSuspected: 0,
    pendingReview: 0,
    resolvedValid: 0,
    resolvedExcluded: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  // Modal State for Reject Reason
  const [rejectingResponseId, setRejectingResponseId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Fetch Duplicate Groups
  const fetchDuplicates = async () => {
    setIsLoading(true);
    try {
      const url = `/api/admin/reviews/duplicates${
        selectedStatus !== "ALL" ? `?status=${selectedStatus}` : ""
      }`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        setGroups(json.data.groups || []);
        if (json.data.stats) setStats(json.data.stats);
      }
    } catch (err) {
      console.error("Error loading duplicate groups:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDuplicates();
  }, [selectedStatus]);

  // Handle Approve (Set VALID)
  const handleApprove = async (responseId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/reviews/duplicates/${responseId}/decision`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: "VALID",
          reason: "Xác nhận cán bộ khác nhau / biên chế thực tế xã có nhiều người đảm nhiệm",
        }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchDuplicates();
      }
    } catch (err) {
      console.error("Error approving response:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Reject (Set EXCLUDED)
  const handleConfirmReject = async () => {
    if (!rejectingResponseId || !rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      const res = await fetch(
        `/api/admin/reviews/duplicates/${rejectingResponseId}/decision`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            decision: "EXCLUDED",
            reason: rejectReason,
          }),
        }
      );
      const json = await res.json();
      if (json.success) {
        setRejectingResponseId(null);
        setRejectReason("");
        await fetchDuplicates();
      }
    } catch (err) {
      console.error("Error rejecting response:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle 1-Click Batch Resolve (Keep the latest response, exclude earlier ones)
  const handleQuickResolveGroup = async (group: DuplicateGroupItem) => {
    if (group.responses.length < 2) return;
    // Sorted by submittedAt ascending, so last is the latest
    const latestResponse = group.responses[group.responses.length - 1];

    setIsProcessing(true);
    try {
      const res = await fetch("/api/admin/reviews/duplicates/resolve-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessHash: group.businessHash,
          keepResponseId: latestResponse._id,
          reason: "Giữ phiếu nộp sau cùng của cán bộ, loại trừ các phiếu nộp trước bị trùng",
        }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchDuplicates();
      }
    } catch (err) {
      console.error("Error quick-resolving group:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtered groups by search
  const filteredGroups = groups.filter((g) => {
    const s = searchTerm.toLowerCase();
    return (
      g.communeName.toLowerCase().includes(s) ||
      g.provinceName.toLowerCase().includes(s) ||
      g.agencyName.toLowerCase().includes(s) ||
      g.positionTitle.toLowerCase().includes(s)
    );
  });

  return (
    <div className="h-full flex flex-col overflow-hidden gap-3.5">
      {/* Header & Tiêu đề Phân hệ */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[24px] sm:text-[28px] font-bold text-[#0e1c2e] tracking-[-0.03em] leading-snug">
            Rà soát Phiếu Nghi trùng
          </h1>
          <p className="text-[15px] text-slate-500">
            Thẩm tra các cặp/nhóm phiếu trùng khớp 4 điểm nghiệp vụ (cùng xã, cơ quan, vị trí và 16 lựa chọn ở Câu 6).
          </p>
        </div>

        <button
          type="button"
          onClick={fetchDuplicates}
          disabled={isLoading || isProcessing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-[15px] font-bold shadow-2xs transition-all cursor-pointer self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-sky-600" : ""}`} />
          <span>Làm mới danh sách</span>
        </button>
      </div>

      {/* Thẻ Thống kê 4 Chỉ số cốt lõi */}
      <div className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-0.5">
          <div className="text-[13.5px] font-semibold text-slate-500 uppercase tracking-wider">
            Tổng phiếu nghi trùng
          </div>
          <div className="text-[28px] sm:text-[32px] font-bold tabular-nums tracking-[-0.025em] text-slate-900">{stats.totalSuspected}</div>
          <div className="text-[13.5px] text-slate-400">Khớp 4 tiêu chí nghiệp vụ</div>
        </div>

        <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 shadow-2xs space-y-0.5">
          <div className="text-[13.5px] font-semibold text-amber-800 uppercase flex items-center gap-1 tracking-wider">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Chờ thẩm tra</span>
          </div>
          <div className="text-[28px] sm:text-[32px] font-bold tabular-nums tracking-[-0.025em] text-amber-900">{stats.pendingReview}</div>
          <div className="text-[13.5px] text-amber-700">Cần chuyên viên xử lý</div>
        </div>

        <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 shadow-2xs space-y-0.5">
          <div className="text-[13.5px] font-semibold text-emerald-800 uppercase flex items-center gap-1 tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Đã chấp nhận (Tính)</span>
          </div>
          <div className="text-[28px] sm:text-[32px] font-bold tabular-nums tracking-[-0.025em] text-emerald-900">{stats.resolvedValid}</div>
          <div className="text-[13.5px] text-emerald-700">Đưa vào tổng hợp B2-B6</div>
        </div>

        <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 shadow-2xs space-y-0.5">
          <div className="text-[13.5px] font-semibold text-rose-800 uppercase flex items-center gap-1 tracking-wider">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Đã loại trừ</span>
          </div>
          <div className="text-[28px] sm:text-[32px] font-bold tabular-nums tracking-[-0.025em] text-rose-900">{stats.resolvedExcluded}</div>
          <div className="text-[13.5px] text-rose-700">Thống kê lý do tại Bảng B1</div>
        </div>
      </div>

      {/* Thanh Lọc & Tìm kiếm */}
      <div className="shrink-0 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[15px] font-semibold text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Lọc trạng thái:
          </span>
          {[
            { id: "ALL", label: "Tất cả" },
            { id: "PENDING_REVIEW", label: "Chờ thẩm tra" },
            { id: "VALID", label: "Đã duyệt hợp lệ" },
            { id: "EXCLUDED", label: "Đã loại trừ" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-2.5 py-1 rounded-lg text-[15px] font-semibold transition-all cursor-pointer ${
                selectedStatus === tab.id
                  ? "bg-sky-700 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo xã, tỉnh, đơn vị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-1 text-[15px] text-slate-800 focus:bg-white focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
          />
        </div>
      </div>

      {/* Danh sách các nhóm nghi trùng - CUỘN ĐỘC LẬP NỘI BỘ */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-500 text-[16px]">
            Đang tải danh sách các nhóm phiếu nghi trùng...
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
            <div className="text-base font-bold text-slate-800">
              Không có phiếu nào cần rà soát trong danh mục này
            </div>
            <p className="text-[15px] text-slate-500">
              Tất cả các phiếu khảo sát đều đảm bảo tính duy nhất hoặc đã được thẩm tra hoàn tất.
            </p>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
          {filteredGroups.map((group) => {
            const isExpanded = expandedGroupId === group.duplicateGroupId;
            const hasPending = group.responses.some(
              (r) => r.reviewStatus === "PENDING_REVIEW"
            );

            return (
              <div
                key={group.duplicateGroupId}
                className={`bg-white rounded-xl border transition-all shadow-sm overflow-hidden ${
                  hasPending ? "border-amber-300 ring-1 ring-amber-200" : "border-slate-200"
                }`}
              >
                {/* Header Nhóm nghi trùng */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[15px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-700" />
                        Nhóm nghi trùng ({group.count} phiếu)
                      </span>
                      <span className="text-[15px] font-semibold text-slate-600">
                        {group.communeName}, {group.provinceName}
                      </span>
                    </div>

                    <h3 className="text-[16px] sm:text-base font-bold text-slate-900">
                      {group.agencyName} —{" "}
                      <span className="text-sky-800">{group.positionTitle}</span>
                    </h3>

                    <div className="text-[15px] text-slate-500 font-mono">
                      Hash: {group.businessHash.substring(0, 20)}...
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center">
                    {hasPending && group.responses.length >= 2 && (
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleQuickResolveGroup(group)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[15px] font-semibold shadow-sm transition-all flex items-center gap-1 disabled:opacity-50"
                        title="Tự động giữ phiếu nộp sau cùng và loại các phiếu nộp trước"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Xử lý nhanh (Giữ phiếu nộp sau)</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedGroupId((prev) =>
                          prev === group.duplicateGroupId ? null : group.duplicateGroupId
                        )
                      }
                      className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 text-[15px] font-semibold flex items-center gap-1"
                    >
                      <span>{isExpanded ? "Thu gọn so sánh" : "So sánh chi tiết"}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Side-by-side Diff View khi bung chi tiết */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 space-y-4">
                    <div className="text-[15px] font-semibold text-slate-700 uppercase tracking-wide">
                      So sánh song song các phiếu trong nhóm ({group.responses.length} phiếu):
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {group.responses.map((res, rIdx) => {
                        const isPending = res.reviewStatus === "PENDING_REVIEW";
                        const isValid = res.reviewStatus === "VALID";
                        const isExcluded = res.reviewStatus === "EXCLUDED";

                        return (
                          <div
                            key={res._id}
                            className={`rounded-xl border p-4 space-y-4 transition-all ${
                              isValid
                                ? "bg-emerald-50/40 border-emerald-300"
                                : isExcluded
                                ? "bg-rose-50/40 border-rose-300 opacity-75"
                                : "bg-white border-slate-300"
                            }`}
                          >
                            {/* Header Phiếu */}
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                              <div className="space-y-0.5">
                                <div className="text-[15px] font-bold text-slate-800">
                                  Phiếu #{rIdx + 1} (ID: {res._id.substring(0, 8)}...)
                                </div>
                                <div className="text-[15px] text-slate-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {new Date(res.submittedAt).toLocaleString("vi-VN")}
                                  </span>
                                </div>
                              </div>

                              <span
                                className={`px-2 py-0.5 rounded text-[15px] font-bold ${
                                  isValid
                                    ? "bg-emerald-100 text-emerald-800"
                                    : isExcluded
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-amber-100 text-amber-900"
                                }`}
                              >
                                {isValid
                                  ? "HỢP LỆ"
                                  : isExcluded
                                  ? "ĐÃ LOẠI"
                                  : "CHỜ THẨM TRA"}
                              </span>
                            </div>

                            {/* Chi tiết nội dung khai báo */}
                            <div className="space-y-2 text-[15px] text-slate-700">
                              <div>
                                <span className="font-semibold text-slate-600">
                                  Tư cách làm việc:{" "}
                                </span>
                                <span>{res.part1?.capacities?.join(", ") || "—"}</span>
                              </div>

                              <div>
                                <span className="font-semibold text-slate-600">
                                  Kinh nghiệm tài chính:{" "}
                                </span>
                                <span>{res.part1?.experienceYears || "—"}</span>
                              </div>

                              {/* Đánh giá Phần III */}
                              <div className="border-t border-slate-200 pt-2 space-y-1">
                                <div className="font-semibold text-slate-800">
                                  Phần III: Chi tiết đánh giá ({res.part3?.length || 0} nhóm việc):
                                </div>
                                <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                                  {res.part3?.map((p3: any) => (
                                    <div
                                      key={p3.workgroupId}
                                      className="bg-white p-2 rounded border border-slate-100 space-y-0.5"
                                    >
                                      <div className="font-bold text-sky-800">
                                        {p3.workgroupId} ({p3.status})
                                      </div>
                                      <div className="text-slate-600">
                                        Vai trò: {p3.roles?.join(", ")}
                                      </div>
                                      <div className="text-slate-600">
                                        Mức tự đánh giá:{" "}
                                        {p3.evaluations
                                          ?.map(
                                            (e: any) =>
                                              `${e.roleId}: Mức ${e.selfAssessedLevel}`
                                          )
                                          .join(" | ")}
                                      </div>
                                      {p3.difficulties?.length > 0 && (
                                        <div className="text-amber-800">
                                          Khó khăn: {p3.difficulties.join(", ")}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Phần IV */}
                              <div className="border-t border-slate-200 pt-2 space-y-1">
                                <div>
                                  <span className="font-semibold text-slate-600">
                                    Hình thức học đã chọn:{" "}
                                  </span>
                                  <span>{res.part4?.preferredFormats?.join(", ") || "—"}</span>
                                </div>
                                {res.part4?.otherOpinions && (
                                  <div>
                                    <span className="font-semibold text-slate-600">
                                      Ý kiến khác:{" "}
                                    </span>
                                    <span className="italic">"{res.part4.otherOpinions}"</span>
                                  </div>
                                )}
                              </div>

                              {res.exclusionReason && (
                                <div className="text-[15px] text-rose-700 bg-rose-50 p-2 rounded border border-rose-200">
                                  <strong>Lý do loại trừ: </strong>
                                  {res.exclusionReason}
                                </div>
                              )}
                            </div>

                            {/* Hộp Hành động thẩm tra cho phiếu này */}
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                              <button
                                type="button"
                                disabled={isProcessing || isValid}
                                onClick={() => handleApprove(res._id)}
                                className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[15px] font-semibold shadow-sm transition-all disabled:opacity-40"
                              >
                                {isValid ? "Đã duyệt hợp lệ" : "Chấp nhận (Tính)"}
                              </button>

                              <button
                                type="button"
                                disabled={isProcessing || isExcluded}
                                onClick={() => {
                                  setRejectingResponseId(res._id);
                                  setRejectReason(
                                    "Cùng một cán bộ gửi lại phiếu do nhầm lẫn / gửi đúp"
                                  );
                                }}
                                className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-semibold shadow-sm transition-all disabled:opacity-40"
                              >
                                {isExcluded ? "Đã loại trừ" : "Loại trừ phiếu"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Modal Nhập lý do loại trừ */}
      {rejectingResponseId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
              <XCircle className="w-5 h-5" />
              <span>Xác nhận loại trừ phiếu khảo sát</span>
            </div>

            <p className="text-[15px] text-slate-600 leading-relaxed">
              Phiếu này sẽ bị loại khỏi các bảng tổng hợp nhu cầu đào tạo (B2 đến B6), nhưng vẫn được thống kê số lượng và lý do loại tại Bảng B1.
            </p>

            <div className="space-y-1">
              <label className="block text-[15px] font-semibold text-slate-700">
                Lý do loại trừ <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do thẩm tra chi tiết..."
                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-[15px] text-slate-800 focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setRejectingResponseId(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-[15px] font-semibold hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isProcessing || !rejectReason.trim()}
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[15px] font-semibold shadow disabled:opacity-50"
              >
                {isProcessing ? "Đang xử lý..." : "Xác nhận loại trừ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
