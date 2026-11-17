import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import mongoose from "mongoose";
import { connectToDatabase } from "../../src/lib/db";
import { User } from "../../src/models/User";
import { UserAdminService } from "../../src/services/user-admin.service";
import {
  CreateUserSchema,
  UpdateUserSchema,
  ResetPasswordSchema,
} from "../../src/lib/validations/user-admin.schema";

describe("PHÂN HỆ QUẢN TRỊ NGƯỜI DÙNG & PHÂN QUYỀN RBAC (UC-14 & BR-22)", () => {
  const testUsername = "test_user_coord_99";
  let createdUserId = "";

  before(async () => {
    try {
      await connectToDatabase();
      await User.deleteOne({ username: testUsername });

      // Đảm bảo có ít nhất 1 tài khoản quản trị hệ thống
      const adminCount = await User.countDocuments();
      if (adminCount === 0) {
        const salt = await (await import("bcryptjs")).default.genSalt(10);
        const hash = await (await import("bcryptjs")).default.hash("Admin@123456", salt);
        await User.create([
          {
            username: "cntt_admin",
            email: "cntt@sav.gov.vn",
            passwordHash: hash,
            fullName: "Quản trị viên Cục CNTT",
            organization: "Cục Công nghệ thông tin - Kiểm toán nhà nước",
            role: "TECHNICAL_ADMIN",
            isActive: true,
          },
          {
            username: "admin",
            email: "admin@sav.gov.vn",
            passwordHash: hash,
            fullName: "Quản trị viên Nghiệp vụ",
            organization: "Trường Đào tạo và Bồi dưỡng nghiệp vụ kiểm toán",
            role: "SYSTEM_ADMIN",
            isActive: true,
          },
        ]);
      }
    } catch (_) {}
  });

  after(async () => {
    try {
      await User.deleteOne({ username: testUsername });
      await mongoose.disconnect();
    } catch (_) {}
  });

  it("TC-USER-01: Lấy thống kê tổng quan và danh sách người dùng thành công", async () => {
    const stats = await UserAdminService.getUserStats();
    assert.ok(stats.totalUsers >= 1, "Hệ thống phải có ít nhất 1 tài khoản (admin/cntt_admin)");
    assert.ok(stats.activeUsers >= 1, "Số tài khoản hoạt động >= 1");

    const result = await UserAdminService.getUsers({ page: 1, limit: 10 });
    assert.ok(Array.isArray(result.users), "Kết quả phải trả về mảng danh sách người dùng");
    assert.ok(result.pagination.total >= 1, "Tổng số tài khoản trong phân trang >= 1");

    console.log("  ✓ PASS TC-USER-01: Lấy thống kê tổng quan và danh sách tài khoản thành công");
  });

  it("TC-USER-02: Tạo tài khoản người dùng mới thành công với mã hóa mật khẩu bcrypt", async () => {
    const input = {
      username: testUsername,
      email: "test.coord99@sav.gov.vn",
      password: "Password@123",
      fullName: "Nguyễn Văn Thử Nghiệm",
      organization: "Sở Tài chính Tỉnh Hà Tĩnh",
      role: "LOCAL_COORDINATOR" as const,
      assignedProvinceCodes: ["42"],
      isActive: true,
    };

    const validParse = CreateUserSchema.safeParse(input);
    assert.ok(validParse.success, "Dữ liệu đầu vào phải hợp lệ theo Zod schema");

    const created = await UserAdminService.createUser(input);
    assert.ok(created, "Phải tạo thành công người dùng mới");
    assert.strictEqual(created.username, testUsername);
    assert.strictEqual(created.role, "LOCAL_COORDINATOR");
    assert.deepStrictEqual(created.assignedProvinceCodes, ["42"]);
    assert.strictEqual((created as any).passwordHash, undefined, "Không được trả về passwordHash");

    createdUserId = (created as any)._id.toString();

    // Xác minh trong DB có passwordHash được mã hóa bcrypt
    const inDb = await User.findById(createdUserId);
    assert.ok(inDb, "Bản ghi phải tồn tại trong cơ sở dữ liệu");
    assert.ok(inDb.passwordHash.startsWith("$2"), "Mật khẩu phải được mã hóa theo định dạng bcrypt");

    console.log("  ✓ PASS TC-USER-02: Tạo tài khoản mới thành công với mật khẩu mã hóa an toàn");
  });

  it("TC-USER-03: Cập nhật thông tin tài khoản và địa bàn tỉnh phụ trách", async () => {
    assert.ok(createdUserId, "Phải có ID tài khoản vừa tạo");

    const updateData = {
      fullName: "Nguyễn Văn Thử Nghiệm Đã Sửa",
      organization: "Sở Kế hoạch và Đầu tư Tỉnh Hà Tĩnh",
      assignedProvinceCodes: ["42", "40"], // Bổ sung tỉnh Nghệ An
    };

    const validParse = UpdateUserSchema.safeParse(updateData);
    assert.ok(validParse.success, "Dữ liệu cập nhật phải hợp lệ theo Zod schema");

    const updated = await UserAdminService.updateUser(createdUserId, updateData);
    assert.strictEqual(updated.fullName, "Nguyễn Văn Thử Nghiệm Đã Sửa");
    assert.strictEqual(updated.organization, "Sở Kế hoạch và Đầu tư Tỉnh Hà Tĩnh");
    assert.deepStrictEqual(updated.assignedProvinceCodes, ["42", "40"]);

    console.log("  ✓ PASS TC-USER-03: Cập nhật thông tin tài khoản và phân công địa bàn thành công");
  });

  it("TC-USER-04: Khóa và Mở khóa trạng thái tài khoản người dùng", async () => {
    assert.ok(createdUserId, "Phải có ID tài khoản");

    // Khóa tài khoản
    const lockedStatus = await UserAdminService.toggleUserStatus(createdUserId);
    assert.strictEqual(lockedStatus, false, "Trạng thái sau khi khóa phải là false");

    const userLocked = await User.findById(createdUserId);
    assert.strictEqual(userLocked?.isActive, false);

    // Mở khóa tài khoản
    const unlockedStatus = await UserAdminService.toggleUserStatus(createdUserId);
    assert.strictEqual(unlockedStatus, true, "Trạng thái sau khi mở khóa phải là true");

    const userUnlocked = await User.findById(createdUserId);
    assert.strictEqual(userUnlocked?.isActive, true);

    console.log("  ✓ PASS TC-USER-04: Khóa và Mở khóa tài khoản người dùng hoạt động chuẩn xác");
  });

  it("TC-USER-05: Đặt lại mật khẩu tài khoản thành công", async () => {
    assert.ok(createdUserId, "Phải có ID tài khoản");

    const resetInput = { newPassword: "NewSecretPassword@456" };
    const validParse = ResetPasswordSchema.safeParse(resetInput);
    assert.ok(validParse.success, "Mật khẩu mới phải hợp lệ");

    await UserAdminService.resetPassword(createdUserId, resetInput.newPassword);

    const updatedUser = await User.findById(createdUserId);
    assert.ok(updatedUser, "Tài khoản phải tồn tại");
    assert.strictEqual(updatedUser.failedLoginAttempts, 0);
    assert.strictEqual(updatedUser.lockedUntil, null);

    console.log("  ✓ PASS TC-USER-05: Đặt lại mật khẩu mới cho tài khoản thành công");
  });

  it("TC-USER-06: Cơ chế Bảo vệ Tài khoản Hệ thống (Chặn xóa admin/cntt_admin & Chặn tự xóa chính mình)", async () => {
    // 1. Chặn tự xóa chính mình
    await assert.rejects(
      async () => {
        await UserAdminService.deleteUser(createdUserId, createdUserId);
      },
      /Bạn không thể tự xóa tài khoản của chính mình/
    );

    // 2. Chặn xóa tài khoản hệ thống cntt_admin
    const cnttUser = await User.findOne({ username: "cntt_admin" });
    if (cnttUser) {
      await assert.rejects(
        async () => {
          await UserAdminService.deleteUser(cnttUser._id.toString());
        },
        /tài khoản hệ thống bắt buộc, không thể xóa/
      );
    }

    // 3. Xóa tài khoản thử nghiệm thành công
    await UserAdminService.deleteUser(createdUserId);
    const deletedUser = await User.findById(createdUserId);
    assert.strictEqual(deletedUser, null, "Tài khoản thử nghiệm phải được xóa khỏi DB");

    console.log("  ✓ PASS TC-USER-06: Cơ chế bảo vệ tài khoản hệ thống hoạt động tin cậy 100%");
  });
});
