"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useProgressiveItems } from "@/hooks/useProgressiveItems";
import {
  HelpCircle,
  FolderTree,
  BookOpen,
  Award,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  Save,
  Copy,
  CheckCircle2,
  Check,
  ChevronDown,
  ArrowUpDown,
  Search,
  ExternalLink,
  Layers,
  Settings,
  Sparkles,
  Info,
  X,
} from "lucide-react";

interface QuestionConfig {
  id: string;
  order: number;
  section: "PART_I" | "PART_II" | "PART_III" | "PART_IV";
  title: string;
  description?: string;
  instruction?: string;
  isRequired: boolean;
  maxSelect?: number;
  isExclusiveSupported?: boolean;
}

interface LearningTopic {
  topicId: string;
  topicTitle: string;
}

interface WorkgroupConfig {
  id: string;
  order: number;
  title: string;
  description: string;
  learningTopics: LearningTopic[];
}

interface RoleConfig {
  roleId: "DIRECT" | "ADVISORY" | "SUPERVISORY" | "APPROVAL";
  title: string;
  description: string;
  levelDescriptions: {
    "1": string;
    "2": string;
    "3": string;
    "4": string;
  };
}

interface DifficultyConfig {
  id: string;
  title: string;
  isExclusive?: boolean;
  category?: string;
}

interface LearningFormatConfig {
  id: string;
  title: string;
}

interface VersionOverview {
  version: string;
  title: string;
  description?: string;
  isApproved: boolean;
  approvedAt?: string;
  approvedBy?: string;
  totalWorkgroups: number;
  totalTopics: number;
  totalQuestions: number;
}

export default function QuestionsAdminPage() {
  const [versions, setVersions] = useState<VersionOverview[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>("3.3");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"questions" | "workgroups" | "topics" | "roles" | "other">("questions");

  // Schema state
  const [schemaTitle, setSchemaTitle] = useState<string>("");
  const [schemaDesc, setSchemaDesc] = useState<string>("");
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [approvedBy, setApprovedBy] = useState<string>("");
  const [questions, setQuestions] = useState<QuestionConfig[]>([]);
  const [workgroups, setWorkgroups] = useState<WorkgroupConfig[]>([]);
  const [roles, setRoles] = useState<RoleConfig[]>([]);
  const [difficulties, setDifficulties] = useState<DifficultyConfig[]>([]);
  const [learningFormats, setLearningFormats] = useState<LearningFormatConfig[]>([]);

  // Modals state
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [cloneNewVersion, setCloneNewVersion] = useState("");
  const [cloneTitle, setCloneTitle] = useState("");

  const [isWgModalOpen, setIsWgModalOpen] = useState(false);
  const [editingWg, setEditingWg] = useState<WorkgroupConfig | null>(null);
  const [wgIdInput, setWgIdInput] = useState("");
  const [wgTitleInput, setWgTitleInput] = useState("");
  const [wgDescInput, setWgDescInput] = useState("");

  // Topics tab state
  const [selectedWgForTopics, setSelectedWgForTopics] = useState<string>("N01");
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<LearningTopic | null>(null);
  const [topicIdInput, setTopicIdInput] = useState("");
  const [topicTitleInput, setTopicTitleInput] = useState("");

  // Search filters
  const [wgSearch, setWgSearch] = useState("");

  // 1. Fetch versions overview
  const fetchVersions = async () => {
    try {
      const res = await fetch("/api/admin/questions/versions");
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setVersions(data.data);
        if (data.data.length > 0 && !selectedVersion) {
          setSelectedVersion(data.data[0].version);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 2. Fetch full schema for selected version
  const fetchSchema = async (version: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/questions/schema/${version}`);
      const data = await res.json();
      if (data.success && data.data) {
        const s = data.data;
        setSchemaTitle(s.title || `Bộ phiếu khảo sát chuẩn phiên bản ${s.version}`);
        setSchemaDesc(s.description || "");
        setIsApproved(!!s.isApproved);
        setApprovedBy(s.approvedBy || "");
        setQuestions(s.questions || []);
        setWorkgroups(s.workgroups || []);
        setRoles(s.roles || []);
        setDifficulties(s.difficulties || []);
        setLearningFormats(s.learningFormats || []);
        if (s.workgroups?.length > 0) {
          setSelectedWgForTopics(s.workgroups[0].id);
        }
      } else {
        setMessage({ type: "error", text: data.error || "Không thể tải cấu hình bộ câu hỏi" });
      }
    } catch (e: any) {
      setMessage({ type: "error", text: e.message || "Lỗi mạng khi tải bộ câu hỏi" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  useEffect(() => {
    if (selectedVersion) {
      fetchSchema(selectedVersion);
    }
  }, [selectedVersion]);

  // Flash message helper
  const showToast = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // 3. Save all changes
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const payload = {
        title: schemaTitle,
        description: schemaDesc,
        isApproved,
        approvedBy,
        questions,
        workgroups,
        roles,
        difficulties,
        learningFormats,
      };

      const res = await fetch(`/api/admin/questions/schema/${selectedVersion}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        showToast("success", data.message || "Đã lưu toàn bộ thay đổi thành công!");
        fetchVersions();
      } else {
        showToast("error", data.error || "Lỗi khi lưu thay đổi");
      }
    } catch (e: any) {
      showToast("error", e.message || "Lỗi kết nối");
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Clone / Create Version
  const handleCloneVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneNewVersion.trim()) return;

    try {
      const res = await fetch("/api/admin/questions/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newVersion: cloneNewVersion.trim(),
          sourceVersion: selectedVersion,
          title: cloneTitle.trim() || `Bộ phiếu khảo sát chuẩn phiên bản ${cloneNewVersion.trim()}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", data.message);
        setIsCloneModalOpen(false);
        setCloneNewVersion("");
        setCloneTitle("");
        await fetchVersions();
        setSelectedVersion(data.data.version);
      } else {
        showToast("error", data.error || "Không thể tạo phiên bản mới");
      }
    } catch (e: any) {
      showToast("error", e.message || "Lỗi mạng");
    }
  };

  // 5. Workgroup Handlers
  const handleOpenAddWg = () => {
    setEditingWg(null);
    setWgIdInput(`N${String(workgroups.length + 1).padStart(2, "0")}`);
    setWgTitleInput("");
    setWgDescInput("");
    setIsWgModalOpen(true);
  };

  const handleOpenEditWg = (wg: WorkgroupConfig) => {
    setEditingWg(wg);
    setWgIdInput(wg.id);
    setWgTitleInput(wg.title);
    setWgDescInput(wg.description);
    setIsWgModalOpen(true);
  };

  const handleSaveWg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wgTitleInput.trim()) return;

    if (editingWg) {
      // Edit
      setWorkgroups((prev) =>
        prev.map((w) =>
          w.id === editingWg.id
            ? { ...w, title: wgTitleInput.trim(), description: wgDescInput.trim() }
            : w
        )
      );
      showToast("success", `Đã cập nhật nhóm việc ${editingWg.id}`);
    } else {
      // Add
      const newId = wgIdInput.trim().toUpperCase();
      if (workgroups.some((w) => w.id === newId)) {
        showToast("error", `Mã nhóm ${newId} đã tồn tại!`);
        return;
      }
      const newWg: WorkgroupConfig = {
        id: newId,
        order: workgroups.length + 1,
        title: wgTitleInput.trim(),
        description: wgDescInput.trim(),
        learningTopics: [],
      };
      setWorkgroups((prev) => [...prev, newWg]);
      showToast("success", `Đã thêm nhóm việc mới ${newId}`);
    }
    setIsWgModalOpen(false);
  };

  const handleDeleteWg = (wgId: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa nhóm công việc '${wgId}'? Mọi chuyên đề thuộc nhóm này cũng sẽ bị xóa.`)) {
      return;
    }
    setWorkgroups((prev) => {
      const filtered = prev.filter((w) => w.id !== wgId);
      return filtered.map((w, idx) => ({ ...w, order: idx + 1 }));
    });
    showToast("success", `Đã xóa nhóm việc ${wgId}`);
  };

  const handleMoveWg = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= workgroups.length) return;

    setWorkgroups((prev) => {
      const cloned = [...prev];
      const temp = cloned[index];
      cloned[index] = cloned[targetIdx];
      cloned[targetIdx] = temp;
      return cloned.map((w, idx) => ({ ...w, order: idx + 1 }));
    });
  };

  // 6. Topics Handlers
  const currentWgForTopics = useMemo(() => {
    return workgroups.find((w) => w.id === selectedWgForTopics);
  }, [workgroups, selectedWgForTopics]);

  const handleOpenAddTopic = () => {
    setEditingTopic(null);
    const count = currentWgForTopics?.learningTopics?.length || 0;
    setTopicIdInput(`${selectedWgForTopics}_${String(count + 1).padStart(2, "0")}`);
    setTopicTitleInput("");
    setIsTopicModalOpen(true);
  };

  const handleOpenEditTopic = (t: LearningTopic) => {
    setEditingTopic(t);
    setTopicIdInput(t.topicId);
    setTopicTitleInput(t.topicTitle);
    setIsTopicModalOpen(true);
  };

  const handleSaveTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitleInput.trim()) return;

    setWorkgroups((prev) =>
      prev.map((w) => {
        if (w.id !== selectedWgForTopics) return w;
        let topics = [...(w.learningTopics || [])];

        if (editingTopic) {
          topics = topics.map((t) =>
            t.topicId === editingTopic.topicId ? { ...t, topicTitle: topicTitleInput.trim() } : t
          );
        } else {
          const newTId = topicIdInput.trim();
          if (topics.some((t) => t.topicId === newTId)) {
            showToast("error", `Mã chuyên đề ${newTId} đã tồn tại!`);
            return w;
          }
          topics.push({ topicId: newTId, topicTitle: topicTitleInput.trim() });
        }
        return { ...w, learningTopics: topics };
      })
    );

    setIsTopicModalOpen(false);
    showToast("success", editingTopic ? "Cập nhật chuyên đề thành công" : "Thêm chuyên đề mới thành công");
  };

  const handleDeleteTopic = (tId: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa chuyên đề '${tId}'?`)) return;
    setWorkgroups((prev) =>
      prev.map((w) => {
        if (w.id !== selectedWgForTopics) return w;
        return {
          ...w,
          learningTopics: (w.learningTopics || []).filter((t) => t.topicId !== tId),
        };
      })
    );
    showToast("success", `Đã xóa chuyên đề ${tId}`);
  };

  // 7. Update Question Field
  const handleUpdateQuestion = (qId: string, field: keyof QuestionConfig, value: any) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, [field]: value } : q))
    );
  };

  // Filtered workgroups
  const filteredWorkgroups = useMemo(() => {
    if (!wgSearch.trim()) return workgroups;
    const s = wgSearch.toLowerCase();
    return workgroups.filter(
      (w) => w.id.toLowerCase().includes(s) || w.title.toLowerCase().includes(s)
    );
  }, [workgroups, wgSearch]);

  const currentVersionMeta = versions.find((v) => v.version === selectedVersion);

  // Progressive rendering hooks: Tối ưu chuyển Tab mượt mà tức thì (<16ms) và render tăng dần
  const {
    visibleItems: visibleQuestions,
    renderedCount: renderedQCount,
    totalCount: totalQCount,
  } = useProgressiveItems(questions, {
    initialCount: 3,
    step: 4,
    interval: 16,
    resetKey: activeTab,
  });

  const {
    visibleItems: visibleWorkgroups,
    renderedCount: renderedWgCount,
    totalCount: totalWgCount,
  } = useProgressiveItems(filteredWorkgroups, {
    initialCount: 4,
    step: 4,
    interval: 16,
    resetKey: `${activeTab}-${wgSearch}`,
  });

  const currentTopicsList = useMemo(() => {
    return currentWgForTopics?.learningTopics || [];
  }, [currentWgForTopics]);

  const {
    visibleItems: visibleTopics,
    renderedCount: renderedTopicCount,
    totalCount: totalTopicCount,
  } = useProgressiveItems(currentTopicsList, {
    initialCount: 6,
    step: 6,
    interval: 16,
    resetKey: `${activeTab}-${selectedWgForTopics}`,
  });

  const {
    visibleItems: visibleRoles,
    renderedCount: renderedRoleCount,
    totalCount: totalRoleCount,
  } = useProgressiveItems(roles, {
    initialCount: 1,
    step: 1,
    interval: 20,
    resetKey: activeTab,
  });

  const {
    visibleItems: visibleDifficulties,
    renderedCount: renderedDiffCount,
    totalCount: totalDiffCount,
  } = useProgressiveItems(difficulties, {
    initialCount: 4,
    step: 4,
    interval: 16,
    resetKey: activeTab,
  });

  const {
    visibleItems: visibleFormats,
    renderedCount: renderedFmtCount,
    totalCount: totalFmtCount,
  } = useProgressiveItems(learningFormats, {
    initialCount: 4,
    step: 4,
    interval: 16,
    resetKey: activeTab,
  });

  return (
    <div className="h-full flex flex-col p-4 sm:p-5 max-w-7xl w-full mx-auto overflow-hidden gap-3">
      {/* Toast Notification */}
      {message && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-3 transition-all ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
          <button onClick={() => setMessage(null)} className="ml-2 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP BAR: HEADER & VERSION SELECTOR */}
      <div className="shrink-0 bg-white rounded-xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                Quản trị Bộ Câu hỏi & Ngân hàng Chuyên đề
              </h1>
              <p className="text-xs text-slate-500">
                Toàn quyền tùy biến nội dung, số lượng và cấu trúc 14 câu hỏi, nhóm việc & chuyên đề đào tạo
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Version Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 px-2.5 py-1 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Phiên bản:</span>
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className="bg-transparent text-xs font-bold text-blue-900 focus:outline-hidden cursor-pointer"
            >
              {versions.map((v) => (
                <option key={v.version} value={v.version}>
                  v{v.version} {v.isApproved ? "(Đã duyệt)" : "(Bản nháp)"}
                </option>
              ))}
            </select>
          </div>

          {/* Action: Clone Version */}
          <button
            onClick={() => {
              setCloneNewVersion(`3.${versions.length + 3}`);
              setCloneTitle(`Bộ phiếu khảo sát chuẩn phiên bản 3.${versions.length + 3}`);
              setIsCloneModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            Tạo bản mới (Clone)
          </button>

          {/* Action: Save Changes */}
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-2xs transition-colors disabled:opacity-60 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
          </button>

          {/* Action: Live Survey Preview */}
          <a
            href="/khao-sat/pilot_dot-1-2026_p20"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 rounded-xl transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Xem trước
          </a>
        </div>
      </div>

      {/* VERSION STATUS BANNER */}
      <div className="shrink-0 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl p-3 sm:p-3.5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/30">
                Phiên bản v{selectedVersion}
              </span>
              {isApproved ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Đã phê duyệt chính thức
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Bản nháp / Đang cấu hình
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-white leading-tight">{schemaTitle}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs bg-white/10 p-2 rounded-xl backdrop-blur-xs border border-white/15">
            <div>
              <p className="text-blue-200 text-[10px]">Nhóm công việc:</p>
              <p className="text-sm font-extrabold text-white">{workgroups.length} nhóm</p>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div>
              <p className="text-blue-200 text-[10px]">Chuyên đề đào tạo:</p>
              <p className="text-sm font-extrabold text-white">
                {workgroups.reduce((acc, w) => acc + (w.learningTopics?.length || 0), 0)} chuyên đề
              </p>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div>
              <p className="text-blue-200 text-[10px]">Tổng số câu hỏi:</p>
              <p className="text-sm font-extrabold text-white">{questions.length} câu</p>
            </div>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="shrink-0 flex border-b border-slate-200 overflow-x-auto no-scrollbar gap-1">
        <button
          onClick={() => setActiveTab("questions")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "questions"
              ? "border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          14 Câu hỏi & Hướng dẫn
        </button>

        <button
          onClick={() => setActiveTab("workgroups")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "workgroups"
              ? "border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          <FolderTree className="w-4 h-4" />
          Danh mục Nhóm Công việc ({workgroups.length})
        </button>

        <button
          onClick={() => setActiveTab("topics")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "topics"
              ? "border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Ngân hàng Chuyên đề ({workgroups.reduce((acc, w) => acc + (w.learningTopics?.length || 0), 0)})
        </button>

        <button
          onClick={() => setActiveTab("roles")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "roles"
              ? "border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          <Award className="w-4 h-4" />
          4 Vai trò & Thang Năng lực
        </button>

        <button
          onClick={() => setActiveTab("other")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "other"
              ? "border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl"
              : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
          }`}
        >
          <Settings className="w-4 h-4" />
          Khó khăn & Hình thức học
        </button>
      </div>

      {/* TAB CONTENTS - CUỘN ĐỘC LẬP NỘI BỘ TRONG CONTAINER */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {/* TAB CONTENT 1: 14 QUESTIONS */}
        {activeTab === "questions" && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Quy chuẩn cấu trúc 14 Câu hỏi theo Bộ phiếu 3.3:</p>
              <p className="text-amber-800 mt-0.5">
                Bạn có thể sửa tiêu đề câu hỏi, hướng dẫn thao tác và số lượng lựa chọn tối đa. Các thay đổi này sẽ hiển thị trực tiếp cho người làm bài trên Cổng Khảo sát di động.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {visibleQuestions.map((q) => (
              <div
                key={q.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:border-blue-200 transition-colors space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-blue-100 text-blue-800">
                      Câu {q.order} ({q.id})
                    </span>
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      {q.section === "PART_I"
                        ? "Phần I: Thông tin chung"
                        : q.section === "PART_II"
                        ? "Phần II: Nhóm công việc"
                        : q.section === "PART_III"
                        ? "Phần III: Đánh giá chi tiết"
                        : "Phần IV: Hình thức học & Ý kiến"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={q.isRequired}
                        onChange={(e) => handleUpdateQuestion(q.id, "isRequired", e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      Bắt buộc trả lời
                    </label>

                    {q.maxSelect !== undefined && (
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <span>Chọn tối đa:</span>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={q.maxSelect}
                          onChange={(e) =>
                            handleUpdateQuestion(q.id, "maxSelect", parseInt(e.target.value) || 1)
                          }
                          className="w-14 px-2 py-1 text-xs border border-slate-300 rounded-md text-center font-bold"
                        />
                        <span>mục</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tiêu đề hiển thị câu hỏi:
                    </label>
                    <input
                      type="text"
                      value={q.title}
                      onChange={(e) => handleUpdateQuestion(q.id, "title", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-hidden font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Hướng dẫn trả lời (dưới tiêu đề):
                    </label>
                    <input
                      type="text"
                      value={q.instruction || ""}
                      onChange={(e) => handleUpdateQuestion(q.id, "instruction", e.target.value)}
                      placeholder="Ví dụ: Chọn tối đa 2 hình thức..."
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-hidden text-slate-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mô tả / Diễn giải nghiệp vụ chi tiết:
                    </label>
                    <textarea
                      rows={2}
                      value={q.description || ""}
                      onChange={(e) => handleUpdateQuestion(q.id, "description", e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-hidden text-slate-600"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {renderedQCount < totalQCount && (
            <div className="py-2.5 text-center text-xs font-semibold text-slate-400 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 animate-pulse">
              Đang hiển thị {renderedQCount} / {totalQCount} câu hỏi...
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: WORKGROUPS */}
      {activeTab === "workgroups" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm kiếm nhóm theo mã (N01...) hoặc tên..."
                value={wgSearch}
                onChange={(e) => setWgSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <button
              onClick={handleOpenAddWg}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Thêm Nhóm Công Việc Mới
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {visibleWorkgroups.map((wg, idx) => {
              const realIdx = workgroups.findIndex((w) => w.id === wg.id);
              return (
              <div
                key={wg.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex flex-col items-center">
                    <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-sm flex items-center justify-center border border-blue-100">
                      {wg.id}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold mt-1">#{wg.order}</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {wg.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 max-w-3xl">
                      {wg.description || "Chưa có mô tả chi tiết."}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                        <BookOpen className="w-3 h-3" />
                        {wg.learningTopics?.length || 0} chuyên đề đào tạo
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center border-t md:border-t-0 pt-2 md:pt-0 w-full md:w-auto justify-end">
                  <button
                    onClick={() => handleMoveWg(realIdx, "up")}
                    disabled={realIdx <= 0}
                    title="Di chuyển lên"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-30 cursor-pointer"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => handleMoveWg(realIdx, "down")}
                    disabled={realIdx < 0 || realIdx >= workgroups.length - 1}
                    title="Di chuyển xuống"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg disabled:opacity-30 cursor-pointer"
                  >
                    ▼
                  </button>

                  <button
                    onClick={() => handleOpenEditWg(wg)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Sửa
                  </button>

                  <button
                    onClick={() => handleDeleteWg(wg.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Xóa
                  </button>
                </div>
              </div>
            );
          })}
          </div>
          {renderedWgCount < totalWgCount && (
            <div className="py-2.5 text-center text-xs font-semibold text-slate-400 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 animate-pulse">
              Đang hiển thị {renderedWgCount} / {totalWgCount} nhóm công việc...
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: TOPICS */}
      {activeTab === "topics" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Chọn Nhóm Công Việc để Quản trị Chuyên đề Đào tạo:
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200/60">
              {workgroups.map((wg) => (
                <button
                  key={wg.id}
                  onClick={() => setSelectedWgForTopics(wg.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedWgForTopics === wg.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {wg.id} ({wg.learningTopics?.length || 0})
                </button>
              ))}
            </div>
          </div>

          {currentWgForTopics && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Chuyên đề đào tạo thuộc nhóm [{currentWgForTopics.id}] {currentWgForTopics.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hiện có {currentWgForTopics.learningTopics?.length || 0} chuyên đề được cấu hình cho nhóm này.
                  </p>
                </div>

                <button
                  onClick={handleOpenAddTopic}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Thêm Chuyên Đề Mới
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {visibleTopics.map((t, idx) => (
                  <div
                    key={t.topicId}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                        {t.topicId}
                      </span>
                      <p className="text-sm font-semibold text-slate-900 leading-snug pt-1">
                        {t.topicTitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditTopic(t)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-md cursor-pointer"
                        title="Sửa tên chuyên đề"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(t.topicId)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md cursor-pointer"
                        title="Xóa chuyên đề"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {renderedTopicCount < totalTopicCount && (
                <div className="py-2 text-center text-xs font-semibold text-slate-400 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 animate-pulse">
                  Đang hiển thị {renderedTopicCount} / {totalTopicCount} chuyên đề...
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 4: ROLES & LEVEL DESCRIPTIONS */}
      {activeTab === "roles" && (
        <div className="space-y-4">
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 text-xs text-blue-900">
            <p className="font-semibold">Mô hình 4 Vai trò & Thang Điểm Năng lực 4 Mức (Câu 8 & Câu 9):</p>
            <p className="text-blue-800 mt-0.5">
              Người trả lời sẽ đọc kỹ diễn giải của 4 mức này tương ứng với vai trò mình đã chọn để tự đánh giá mức năng lực thực tế.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {visibleRoles.map((r, rIdx) => (
              <div
                key={r.roleId}
                className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4"
              >
                <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-100">
                      V{rIdx + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{r.title}</h3>
                      <p className="text-xs text-slate-500">Mã vai trò: {r.roleId}</p>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={r.title}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRoles((prev) =>
                        prev.map((item) => (item.roleId === r.roleId ? { ...item, title: val } : item))
                      );
                    }}
                    className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg text-slate-800 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(["1", "2", "3", "4"] as const).map((lvl) => (
                    <div key={lvl} className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          {lvl === "1"
                            ? "Mức 1: Chưa đáp ứng"
                            : lvl === "2"
                            ? "Mức 2: Đáp ứng một phần"
                            : lvl === "3"
                            ? "Mức 3: Cơ bản đáp ứng"
                            : "Mức 4: Đáp ứng tốt"}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-slate-200 text-slate-700">
                          Level {lvl}
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={r.levelDescriptions[lvl]}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRoles((prev) =>
                            prev.map((item) =>
                              item.roleId === r.roleId
                                ? {
                                    ...item,
                                    levelDescriptions: { ...item.levelDescriptions, [lvl]: val },
                                  }
                                : item
                            )
                          );
                        }}
                        className="w-full p-2 text-xs border border-slate-300 rounded-lg focus:border-blue-500 focus:outline-hidden text-slate-700"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {renderedRoleCount < totalRoleCount && (
            <div className="py-2.5 text-center text-xs font-semibold text-slate-400 bg-slate-50/70 rounded-xl border border-dashed border-slate-200 animate-pulse">
              Đang hiển thị {renderedRoleCount} / {totalRoleCount} vai trò & mức năng lực...
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 5: DIFFICULTIES & LEARNING FORMATS */}
      {activeTab === "other" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* DIFFICULTIES */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Danh mục Khó khăn (Câu 10)</h3>
                <p className="text-xs text-slate-500">Tối đa 2 mục hoặc mục độc quyền</p>
              </div>

              <button
                onClick={() => {
                  const newId = `D${difficulties.length + 1}`;
                  setDifficulties((prev) => [
                    ...prev,
                    { id: newId, title: "Nội dung khó khăn mới", isExclusive: false },
                  ]);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm
              </button>
            </div>

            <div className="space-y-2">
              {visibleDifficulties.map((d, dIdx) => (
                <div
                  key={d.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-mono font-bold text-slate-500 w-8">{d.id}</span>
                    <input
                      type="text"
                      value={d.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDifficulties((prev) =>
                          prev.map((item) => (item.id === d.id ? { ...item, title: val } : item))
                        );
                      }}
                      className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!d.isExclusive}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setDifficulties((prev) =>
                            prev.map((item) => (item.id === d.id ? { ...item, isExclusive: val } : item))
                          );
                        }}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      Độc quyền
                    </label>

                    <button
                      onClick={() => setDifficulties((prev) => prev.filter((item) => item.id !== d.id))}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {renderedDiffCount < totalDiffCount && (
              <div className="py-1.5 text-center text-[11px] font-semibold text-slate-400 animate-pulse">
                Đang nạp {renderedDiffCount} / {totalDiffCount} khó khăn...
              </div>
            )}
          </div>

          {/* LEARNING FORMATS */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Danh mục Hình thức học (Câu 13)</h3>
                <p className="text-xs text-slate-500">Các phương thức bồi dưỡng ưu tiên</p>
              </div>

              <button
                onClick={() => {
                  const newId = `F${learningFormats.length + 1}`;
                  setLearningFormats((prev) => [
                    ...prev,
                    { id: newId, title: "Hình thức học mới" },
                  ]);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm
              </button>
            </div>

            <div className="space-y-2">
              {visibleFormats.map((f) => (
                <div
                  key={f.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs font-mono font-bold text-slate-500 w-8">{f.id}</span>
                    <input
                      type="text"
                      value={f.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setLearningFormats((prev) =>
                          prev.map((item) => (item.id === f.id ? { ...item, title: val } : item))
                        );
                      }}
                      className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded-lg text-slate-800"
                    />
                  </div>

                  <button
                    onClick={() => setLearningFormats((prev) => prev.filter((item) => item.id !== f.id))}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            {renderedFmtCount < totalFmtCount && (
              <div className="py-1.5 text-center text-[11px] font-semibold text-slate-400 animate-pulse">
                Đang nạp {renderedFmtCount} / {totalFmtCount} hình thức học...
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* MODAL 1: CLONE VERSION */}
      {isCloneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Tạo Phiên Bản Bộ Phiếu Mới</h3>
              <button onClick={() => setIsCloneModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCloneVersion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số hiệu phiên bản mới (ví dụ: 3.4, 4.0):
                </label>
                <input
                  type="text"
                  required
                  placeholder="3.4"
                  value={cloneNewVersion}
                  onChange={(e) => setCloneNewVersion(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-hidden font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiêu đề bộ phiếu:
                </label>
                <input
                  type="text"
                  required
                  value={cloneTitle}
                  onChange={(e) => setCloneTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-800">
                Toàn bộ 14 câu hỏi, nhóm việc, chuyên đề đào tạo của phiên bản hiện tại (v{selectedVersion}) sẽ được nhân bản sang phiên bản mới.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCloneModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Tạo Phiên Bản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT WORKGROUP */}
      {isWgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingWg ? `Chỉnh sửa Nhóm Việc [${editingWg.id}]` : "Thêm Nhóm Công Việc Mới"}
              </h3>
              <button onClick={() => setIsWgModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWg} className="space-y-4">
              {!editingWg && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã nhóm công việc (ví dụ: N17):
                  </label>
                  <input
                    type="text"
                    required
                    value={wgIdInput}
                    onChange={(e) => setWgIdInput(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-hidden font-mono font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên nhóm công việc:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên nhóm công việc..."
                  value={wgTitleInput}
                  onChange={(e) => setWgTitleInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mô tả / Diễn giải phạm vi công việc:
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả các phần việc, hồ sơ, nhiệm vụ liên quan..."
                  value={wgDescInput}
                  onChange={(e) => setWgDescInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWgModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingWg ? "Lưu Thay Đổi" : "Thêm Nhóm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD / EDIT TOPIC */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                {editingTopic ? `Sửa Chuyên Đề [${editingTopic.topicId}]` : "Thêm Chuyên Đề Đào Tạo Mới"}
              </h3>
              <button onClick={() => setIsTopicModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTopic} className="space-y-4">
              {!editingTopic && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã chuyên đề (ví dụ: {selectedWgForTopics}_08):
                  </label>
                  <input
                    type="text"
                    required
                    value={topicIdInput}
                    onChange={(e) => setTopicIdInput(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-hidden font-mono font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên nội dung / chuyên đề đào tạo:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên chuyên đề tập huấn..."
                  value={topicTitleInput}
                  onChange={(e) => setTopicTitleInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingTopic ? "Lưu Chuyên Đề" : "Thêm Chuyên Đề"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
