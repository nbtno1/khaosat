import { connectToDatabase } from "@/lib/db";
import { User, IUser, UserRole } from "@/models/User";
import bcrypt from "bcryptjs";
import { CreateUserInput, UpdateUserInput } from "@/lib/validations/user-admin.schema";

export interface UserFilterOptions {
  query?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  lockedUsers: number;
  technicalAdmins: number;
  systemAdmins: number;
  localCoordinators: number;
  reviewers: number;
}

export class UserAdminService {
  /**
   * Thống kê tổng quan người dùng
   */
  static async getUserStats(): Promise<UserStats> {
    await connectToDatabase();

    const [totalUsers, activeUsers, lockedUsers, roleCounts] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const roleMap: Record<string, number> = {};
    for (const r of roleCounts) {
      roleMap[r._id] = r.count;
    }

    return {
      totalUsers,
      activeUsers,
      lockedUsers,
      technicalAdmins: roleMap["TECHNICAL_ADMIN"] || 0,
      systemAdmins: roleMap["SYSTEM_ADMIN"] || 0,
      localCoordinators: roleMap["LOCAL_COORDINATOR"] || 0,
      reviewers: (roleMap["REVIEWER"] || 0) + (roleMap["CONTENT_ADMIN"] || 0) + (roleMap["PROGRESS_MONITOR"] || 0),
    };
  }

  /**
   * Truy vấn danh sách người dùng có phân trang và bộ lọc
   */
  static async getUsers(options: UserFilterOptions = {}) {
    await connectToDatabase();

    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (options.role && options.role !== "ALL") {
      filter.role = options.role;
    }

    if (typeof options.isActive === "boolean") {
      filter.isActive = options.isActive;
    }

    if (options.query && options.query.trim()) {
      const q = options.query.trim();
      filter.$or = [
        { username: { $regex: q, $options: "i" } },
        { fullName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { organization: { $regex: q, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Tạo tài khoản người dùng mới
   */
  static async createUser(data: CreateUserInput): Promise<Omit<IUser, "passwordHash">> {
    await connectToDatabase();

    // Kiểm tra trùng username
    const existingUsername = await User.findOne({ username: data.username.toLowerCase() });
    if (existingUsername) {
      throw new Error(`Tên đăng nhập "${data.username}" đã tồn tại trên hệ thống.`);
    }

    // Kiểm tra trùng email
    const existingEmail = await User.findOne({ email: data.email.toLowerCase() });
    if (existingEmail) {
      throw new Error(`Địa chỉ email "${data.email}" đã được đăng ký cho tài khoản khác.`);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const newUser = await User.create({
      username: data.username.toLowerCase(),
      email: data.email.toLowerCase(),
      passwordHash,
      fullName: data.fullName.trim(),
      organization: data.organization.trim(),
      role: data.role,
      assignedProvinceCodes: data.assignedProvinceCodes || [],
      isActive: data.isActive !== undefined ? data.isActive : true,
    });

    const userObj = newUser.toObject();
    delete (userObj as any).passwordHash;
    return userObj;
  }

  /**
   * Cập nhật thông tin tài khoản
   */
  static async updateUser(id: string, data: UpdateUserInput): Promise<Omit<IUser, "passwordHash">> {
    await connectToDatabase();

    const user = await User.findById(id);
    if (!user) {
      throw new Error("Không tìm thấy người dùng.");
    }

    if (data.email && data.email.toLowerCase() !== user.email) {
      const existingEmail = await User.findOne({
        email: data.email.toLowerCase(),
        _id: { $ne: id },
      });
      if (existingEmail) {
        throw new Error(`Địa chỉ email "${data.email}" đã được sử dụng bởi tài khoản khác.`);
      }
      user.email = data.email.toLowerCase();
    }

    if (data.fullName) user.fullName = data.fullName.trim();
    if (data.organization) user.organization = data.organization.trim();
    if (data.role) user.role = data.role as UserRole;
    if (data.assignedProvinceCodes) user.assignedProvinceCodes = data.assignedProvinceCodes;
    if (typeof data.isActive === "boolean") user.isActive = data.isActive;

    await user.save();

    const userObj = user.toObject();
    delete (userObj as any).passwordHash;
    return userObj;
  }

  /**
   * Khóa hoặc Mở khóa tài khoản
   */
  static async toggleUserStatus(id: string, requesterUserId?: string): Promise<boolean> {
    await connectToDatabase();

    if (requesterUserId && id === requesterUserId) {
      throw new Error("Bạn không thể tự khóa tài khoản của chính mình.");
    }

    const user = await User.findById(id);
    if (!user) {
      throw new Error("Không tìm thấy người dùng.");
    }

    // Không cho phép khóa tài khoản super admin cntt_admin
    if (user.username === "cntt_admin") {
      throw new Error("Không được phép khóa tài khoản Cục Công nghệ thông tin mặc định.");
    }

    user.isActive = !user.isActive;
    if (user.isActive) {
      user.failedLoginAttempts = 0;
      user.lockedUntil = null;
    }
    await user.save();

    return user.isActive;
  }

  /**
   * Đặt lại mật khẩu tài khoản
   */
  static async resetPassword(id: string, newPassword: string): Promise<void> {
    await connectToDatabase();

    if (!newPassword || newPassword.length < 6) {
      throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự.");
    }

    const user = await User.findById(id);
    if (!user) {
      throw new Error("Không tìm thấy người dùng.");
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;
    await user.save();
  }

  /**
   * Xóa tài khoản
   */
  static async deleteUser(id: string, requesterUserId?: string): Promise<void> {
    await connectToDatabase();

    if (requesterUserId && id === requesterUserId) {
      throw new Error("Bạn không thể tự xóa tài khoản của chính mình.");
    }

    const user = await User.findById(id);
    if (!user) {
      throw new Error("Không tìm thấy người dùng.");
    }

    // Bảo vệ 2 tài khoản cốt lõi
    if (user.username === "cntt_admin" || user.username === "admin") {
      throw new Error(`Tài khoản "${user.username}" là tài khoản hệ thống bắt buộc, không thể xóa.`);
    }

    await User.findByIdAndDelete(id);
  }
}
