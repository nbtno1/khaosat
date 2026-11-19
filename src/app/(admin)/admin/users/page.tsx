"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Shield,
  ShieldCheck,
  Building,
  Key,
  Lock,
  Unlock,
  Edit,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  MapPin,
  Clock,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

interface UserItem {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  organization: string;
  role: string;
  assignedProvinceCodes: string[];
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  technicalAdmins: number;
  systemAdmins: number;
  localCoordinators: number;
  reviewers: number;
}

const ROLE_INFO: Record<string, { label: string; color: string; badge: string }> = {
  TECHNICAL_ADMIN: {
    label: "Cục Công nghệ thông tin",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    badge: "bg-purple-600 text-white",
  },
  SYSTEM_ADMIN: {
    label: "Quản trị viên Hệ thống",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    badge: "bg-blue-600 text-white",
  },
  CONTENT_ADMIN: {
    label: "Quản trị Nội dung",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    badge: "bg-indigo-600 text-white",
  },
  REVIEWER: {
    label: "Thẩm tra viên",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    badge: "bg-amber-600 text-white",
  },
  PROGRESS_MONITOR: {
    label: "Giám sát Tiến độ",
    color: "bg-cyan-50 text-cyan-700 border-cyan-200",
    badge: "bg-cyan-600 text-white",
  },
  LOCAL_COORDINATOR: {
    label: "Đầu mối Địa phương",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    badge: "bg-emerald-600 text-white",
  },
};

const PROVINCE_OPTIONS = [
  { code: "01", name: "Hà Nội" },
  { code: "02", name: "Hà Giang" },
  { code: "04", name: "Cao Bằng" },
  { code: "06", name: "Bắc Kạn" },
  { code: "08", name: "Tuyên Quang" },
  { code: "10", name: "Lào Cai" },
  { code: "11", name: "Điện Biên" },
  { code: "12", name: "Lai Châu" },
  { code: "14", name: "Sơn La" },
  { code: "15", name: "Yên Bái" },
  { code: "17", name: "Hoà Bình" },
  { code: "19", name: "Thái Nguyên" },
  { code: "20", name: "Lạng Sơn" },
  { code: "22", name: "Quảng Ninh" },
  { code: "24", name: "Bắc Giang" },
  { code: "25", name: "Phú Thọ" },
  { code: "26", name: "Vĩnh Phúc" },
  { code: "27", name: "Bắc Ninh" },
  { code: "30", name: "Hải Phòng" },
  { code: "31", name: "Hải Dương" },
  { code: "33", name: "Hưng Yên" },
  { code: "34", name: "Thái Bình" },
  { code: "35", name: "Hà Nam" },
  { code: "36", name: "Nam Định" },
  { code: "37", name: "Ninh Bình" },
  { code: "38", name: "Thanh Hóa" },
  { code: "40", name: "Nghệ An" },
  { code: "42", name: "Hà Tĩnh" },
  { code: "44", name: "Quảng Bình" },
  { code: "45", name: "Quảng Trị" },
  { code: "46", name: "Thừa Thiên Huế" },
  { code: "48", name: "Đà Nẵng" },
  { code: "49", name: "Quảng Nam" },
  { code: "51", name: "Quảng Ngãi" },
];

export default function UsersAdminPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    lockedUsers: 0,
    technicalAdmins: 0,
    systemAdmins: 0,
    localCoordinators: 0,
    reviewers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [, startTransition] = useTransition();

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [resettingUser, setResettingUser] = useState<UserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    organization: "",
    role: "LOCAL_COORDINATOR",
    assignedProvinceCodes: [] as string[],
    isActive: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.set("query", searchQuery);
      if (selectedRole !== "ALL") params.set("role", selectedRole);
      if (selectedStatus === "ACTIVE") params.set("isActive", "true");
      if (selectedStatus === "LOCKED") params.set("isActive", "false");

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
        if (data.stats) setStats(data.stats);
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedRole, selectedStatus]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || "Có lỗi xảy ra khi tạo tài khoản.");
        return;
      }
      setIsAddModalOpen(false);
      setActionSuccess(`Tạo tài khoản "${formData.username}" thành công.`);
      fetchUsers();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err: any) {
      setFormError(err.message || "Lỗi kết nối máy chủ.");
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormError("");
    try {
      const res = await fetch(`/api/admin/users/${editingUser._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          organization: formData.organization,
          email: formData.email,
          role: formData.role,
          assignedProvinceCodes: formData.assignedProvinceCodes,
          isActive: formData.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || "Có lỗi xảy ra khi cập nhật.");
        return;
      }
      setEditingUser(null);
      setActionSuccess(`Cập nhật tài khoản "${editingUser.username}" thành công.`);
      fetchUsers();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err: any) {
      setFormError(err.message || "Lỗi kết nối máy chủ.");
    }
  };

  const handleToggleStatus = async (user: UserItem) => {
    try {
      const res = await fetch(`/api/admin/users/${user._id}/status`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Không thể đổi trạng thái tài khoản.");
        return;
      }
      fetchUsers();
    } catch {
      alert("Lỗi kết nối máy chủ.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    setFormError("");
    try {
      const res = await fetch(`/api/admin/users/${resettingUser._id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setFormError(data.error || "Không thể đặt lại mật khẩu.");
        return;
      }
      setResettingUser(null);
      setNewPassword("");
      setActionSuccess(`Đã đặt lại mật khẩu cho "${resettingUser.username}".`);
      setTimeout(() => setActionSuccess(""), 4000);
    } catch (err: any) {
      setFormError(err.message || "Lỗi kết nối máy chủ.");
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      const res = await fetch(`/api/admin/users/${deletingUser._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || "Không thể xóa tài khoản.");
        return;
      }
      setDeletingUser(null);
      setActionSuccess(`Đã xóa tài khoản "${deletingUser.username}".`);
      fetchUsers();
      setTimeout(() => setActionSuccess(""), 4000);
    } catch {
      alert("Lỗi kết nối máy chủ.");
    }
  };

  const openEditModal = (user: UserItem) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      fullName: user.fullName,
      organization: user.organization,
      role: user.role,
      assignedProvinceCodes: user.assignedProvinceCodes || [],
      isActive: user.isActive,
    });
    setFormError("");
  };

  const openAddModal = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      fullName: "",
      organization: "",
      role: "LOCAL_COORDINATOR",
      assignedProvinceCodes: [],
      isActive: true,
    });
    setFormError("");
    setIsAddModalOpen(true);
  };

  const toggleProvinceSelection = (code: string) => {
    setFormData((prev) => {
      const current = prev.assignedProvinceCodes || [];
      if (current.includes(code)) {
        return { ...prev, assignedProvinceCodes: current.filter((c) => c !== code) };
      } else {
        return { ...prev, assignedProvinceCodes: [...current, code] };
      }
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">
      {/* 1. HEADER (FIXED, NO SCROLL) */}
      <div className="shrink-0 bg-white border-b border-slate-200/80 px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Quản trị Tài khoản & Phân quyền Người dùng
            </h1>
            <p className="text-[15px] text-slate-500 mt-1">
              Quản lý danh sách tài khoản quản trị, phân công địa bàn và kiểm soát truy cập (RBAC)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchUsers()}
              className="inline-flex items-center gap-2 px-3 py-2 text-[15px] font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
              Làm mới
            </button>

            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-[15px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Thêm tài khoản
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {actionSuccess && (
          <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-[15px] text-emerald-800 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* 2. STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-lg p-3">
            <div className="text-[15px] text-slate-500 font-medium">Tổng số tài khoản</div>
            <div className="text-xl font-bold text-slate-800 mt-1">{stats.totalUsers}</div>
          </div>
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-lg p-3">
            <div className="text-[15px] text-emerald-700 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Đang hoạt động
            </div>
            <div className="text-xl font-bold text-emerald-800 mt-1">{stats.activeUsers}</div>
          </div>
          <div className="bg-rose-50/60 border border-rose-200/80 rounded-lg p-3">
            <div className="text-[15px] text-rose-700 font-medium flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-rose-600" />
              Đã tạm khóa
            </div>
            <div className="text-xl font-bold text-rose-800 mt-1">{stats.lockedUsers}</div>
          </div>
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-lg p-3">
            <div className="text-[15px] text-blue-700 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              Đầu mối địa phương
            </div>
            <div className="text-xl font-bold text-blue-800 mt-1">{stats.localCoordinators}</div>
          </div>
        </div>

        {/* 3. TOOLBAR & FILTERS */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4">
          <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên đăng nhập, họ tên, email, cơ quan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-[15px] bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </form>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[15px] text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Vai trò:</span>
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="text-[15px] bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="TECHNICAL_ADMIN">Cục CNTT</option>
              <option value="SYSTEM_ADMIN">Quản trị viên HT</option>
              <option value="CONTENT_ADMIN">Quản trị Nội dung</option>
              <option value="REVIEWER">Thẩm tra viên</option>
              <option value="PROGRESS_MONITOR">Giám sát Tiến độ</option>
              <option value="LOCAL_COORDINATOR">Đầu mối Địa phương</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-[15px] bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="LOCKED">Đã khóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. MAIN DATA TABLE (SCROLLS INTERNALLY) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6">
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-2xs overflow-hidden">
          <table className="w-full text-left border-collapse text-[15px]">
            <thead className="bg-slate-50/90 border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 font-semibold text-slate-600">Tài khoản & Người dùng</th>
                <th className="py-3 px-4 font-semibold text-slate-600">Vai trò RBAC</th>
                <th className="py-3 px-4 font-semibold text-slate-600">Cơ quan / Đơn vị</th>
                <th className="py-3 px-4 font-semibold text-slate-600">Địa bàn phụ trách</th>
                <th className="py-3 px-4 font-semibold text-slate-600 text-center">Trạng thái</th>
                <th className="py-3 px-4 font-semibold text-slate-600">Đăng nhập cuối</th>
                <th className="py-3 px-4 font-semibold text-slate-600 text-right">Tác vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-600 mb-2" />
                    Đang nạp danh sách tài khoản...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy tài khoản nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const roleMeta = ROLE_INFO[u.role] || {
                    label: u.role,
                    color: "bg-slate-100 text-slate-700 border-slate-200",
                    badge: "bg-slate-600 text-white",
                  };

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0">
                            {u.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              {u.fullName}
                              {u.username === "cntt_admin" && (
                                <span title="Cục CNTT KTNN">
                                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                                </span>
                              )}
                            </div>
                            <div className="text-[14px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                              <span>@{u.username}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {u.email}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[14px] font-medium border ${roleMeta.color}`}
                        >
                          <Shield className="w-3 h-3" />
                          {roleMeta.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{u.organization}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {u.assignedProvinceCodes && u.assignedProvinceCodes.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {u.assignedProvinceCodes.slice(0, 3).map((code) => {
                              const p = PROVINCE_OPTIONS.find((opt) => opt.code === code);
                              return (
                                <span
                                  key={code}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[13.5px] bg-slate-100 text-slate-700 border border-slate-200"
                                >
                                  {p ? p.name : code}
                                </span>
                              );
                            })}
                            {u.assignedProvinceCodes.length > 3 && (
                              <span className="text-[13.5px] text-slate-500">
                                +{u.assignedProvinceCodes.length - 3} tỉnh
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[14px] italic">Toàn quốc</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          disabled={u.username === "cntt_admin"}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[14px] font-medium transition-colors cursor-pointer ${
                            u.isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                          } ${u.username === "cntt_admin" ? "opacity-60 cursor-not-allowed" : ""}`}
                          title={u.isActive ? "Bấm để khóa tài khoản" : "Bấm để mở khóa tài khoản"}
                        >
                          {u.isActive ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Hoạt động
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              Đã khóa
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-slate-500 text-[14px]">
                        {u.lastLoginAt ? (
                          <div className="flex items-center gap-1 text-slate-600">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            {new Date(u.lastLoginAt).toLocaleString("vi-VN")}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Chưa đăng nhập</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setResettingUser(u);
                              setNewPassword("");
                              setFormError("");
                            }}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                            title="Đặt lại mật khẩu"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          {u.username !== "cntt_admin" && u.username !== "admin" && (
                            <button
                              onClick={() => setDeletingUser(u)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: THÊM TÀI KHOẢN MỚI */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-[16px] flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600" />
                Thêm Tài khoản Người dùng Mới
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-5 space-y-3.5 text-[15px]">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Tên đăng nhập <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ví dụ: hanoi_coord"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Mật khẩu khởi tạo <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Ít nhất 6 ký tự"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-1.5 pr-8 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Địa chỉ Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="example@sav.gov.vn"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Cơ quan / Đơn vị <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Sở Tài chính Hà Nội"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Vai trò phân quyền <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="LOCAL_COORDINATOR">Đầu mối Địa phương</option>
                    <option value="REVIEWER">Thẩm tra viên (Rà soát)</option>
                    <option value="PROGRESS_MONITOR">Giám sát Tiến độ</option>
                    <option value="CONTENT_ADMIN">Quản trị Nội dung</option>
                    <option value="SYSTEM_ADMIN">Quản trị viên Hệ thống (Admin)</option>
                    <option value="TECHNICAL_ADMIN">Cục Công nghệ thông tin</option>
                  </select>
                </div>
              </div>

              {/* Tỉnh phụ trách (chỉ hiện khi là LOCAL_COORDINATOR hoặc muốn gán tỉnh) */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Địa bàn phụ trách ({formData.assignedProvinceCodes.length} tỉnh được chọn)
                </label>
                <div className="max-h-28 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 gap-1 text-[14px]">
                  {PROVINCE_OPTIONS.map((p) => {
                    const isChecked = formData.assignedProvinceCodes.includes(p.code);
                    return (
                      <label
                        key={p.code}
                        className="flex items-center gap-1.5 p-1 rounded hover:bg-slate-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleProvinceSelection(p.code)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>
                          {p.code} - {p.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700 font-medium">Kích hoạt tài khoản ngay</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
                  >
                    Tạo tài khoản
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CHỈNH SỬA TÀI KHOẢN */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-[16px] flex items-center gap-2">
                <Edit className="w-4 h-4 text-blue-600" />
                Chỉnh sửa Tài khoản: @{editingUser.username}
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="p-5 space-y-3.5 text-[15px]">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Địa chỉ Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Cơ quan / Đơn vị</label>
                  <input
                    type="text"
                    required
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Vai trò phân quyền</label>
                  <select
                    value={formData.role}
                    disabled={editingUser.username === "cntt_admin"}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer disabled:bg-slate-100"
                  >
                    <option value="LOCAL_COORDINATOR">Đầu mối Địa phương</option>
                    <option value="REVIEWER">Thẩm tra viên (Rà soát)</option>
                    <option value="PROGRESS_MONITOR">Giám sát Tiến độ</option>
                    <option value="CONTENT_ADMIN">Quản trị Nội dung</option>
                    <option value="SYSTEM_ADMIN">Quản trị viên Hệ thống (Admin)</option>
                    <option value="TECHNICAL_ADMIN">Cục Công nghệ thông tin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Địa bàn phụ trách ({formData.assignedProvinceCodes.length} tỉnh được chọn)
                </label>
                <div className="max-h-28 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-2 gap-1 text-[14px]">
                  {PROVINCE_OPTIONS.map((p) => {
                    const isChecked = formData.assignedProvinceCodes.includes(p.code);
                    return (
                      <label
                        key={p.code}
                        className="flex items-center gap-1.5 p-1 rounded hover:bg-slate-100 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleProvinceSelection(p.code)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>
                          {p.code} - {p.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    disabled={editingUser.username === "cntt_admin"}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-700 font-medium">Trạng thái Hoạt động</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ĐẶT LẠI MẬT KHẨU */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-[16px] flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-600" />
                Đặt lại Mật khẩu
              </h3>
              <button
                onClick={() => setResettingUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-5 space-y-3.5 text-[15px]">
              <p className="text-slate-600">
                Đặt lại mật khẩu cho tài khoản <strong className="text-slate-900">@{resettingUser.username}</strong> ({resettingUser.fullName}):
              </p>

              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-700 mb-1">Mật khẩu mới (ít nhất 6 ký tự)</label>
                <input
                  type="password"
                  required
                  placeholder="Nhập mật khẩu mới..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-2xs cursor-pointer"
                >
                  Cập nhật mật khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: XÁC NHẬN XÓA TÀI KHOẢN */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200">
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-[16px]">Xác nhận xóa tài khoản</h3>
              <p className="text-[15px] text-slate-600">
                Bạn có chắc chắn muốn xóa tài khoản <strong className="text-slate-900">@{deletingUser.username}</strong> ({deletingUser.fullName})? Hành động này không thể hoàn tác.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
                  className="px-3.5 py-1.5 text-[15px] text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  className="px-4 py-1.5 text-[15px] font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs cursor-pointer"
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
