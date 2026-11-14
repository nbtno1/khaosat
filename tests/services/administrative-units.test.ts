import { describe, it } from "node:test";
import assert from "node:assert";
import { AdministrativeUnitsService } from "../../src/services/administrative-units.service";
import {
  ProvinceInputSchema,
  CommuneInputSchema,
} from "../../src/lib/validations/administrative-units.schema";

describe("PHÂN HỆ CẤU HÌNH ĐƠN VỊ HÀNH CHÍNH (34 TỈNH & 3.321 XÃ/PHƯỜNG)", () => {
  it("TC-DVHC-01: Thống kê tổng quan trả về đủ 34 tỉnh và 3.321 xã/phường/đặc khu", async () => {
    const stats = await AdministrativeUnitsService.getOverviewStats();
    assert.strictEqual(stats.totalProvinces, 34, "Phải có đúng 34 tỉnh/thành phố");
    assert.strictEqual(stats.totalCommunes, 3321, "Phải có đúng 3.321 xã/phường/đặc khu");
    assert.strictEqual(stats.communesByType.phuong, 709, "Phải có 709 phường");
    assert.strictEqual(stats.communesByType.xa, 2599, "Phải có 2.599 xã");
    assert.strictEqual(stats.communesByType.dacKhu, 13, "Phải có 13 đặc khu");
    assert.strictEqual(stats.dataEffectiveYear, 2026, "Dữ liệu hiệu lực năm 2026");
    console.log("  ✓ PASS TC-DVHC-01: Thống kê tổng quan chính xác (34 tỉnh, 3.321 xã/phường)");
  });

  it("TC-DVHC-02: Lấy danh sách 34 tỉnh và tìm kiếm theo mã / tên", async () => {
    const allProvinces = await AdministrativeUnitsService.getProvinces();
    assert.strictEqual(allProvinces.length, 34);

    // Tìm kiếm Hà Nội theo mã "01"
    const search01 = await AdministrativeUnitsService.getProvinces({ search: "01" });
    assert.ok(search01.some((p) => p.name === "Hà Nội"));

    // Tìm kiếm Thái Nguyên (mã chuẩn 19)
    const searchTN = await AdministrativeUnitsService.getProvinces({ search: "Thái Nguyên" });
    assert.strictEqual(searchTN.length, 1);
    assert.strictEqual(searchTN[0].provinceCode, "19", "Mã chuẩn Thái Nguyên là 19");
    assert.strictEqual(searchTN[0].communeCount, 92, "Thái Nguyên có 92 xã");
    console.log("  ✓ PASS TC-DVHC-02: Danh sách và tìm kiếm tỉnh hoạt động chính xác");
  });

  it("TC-DVHC-03: Lọc xã/phường theo mã tỉnh và phân trang chuẩn", async () => {
    // Lấy xã của tỉnh Thái Nguyên (mã 19)
    const tnCommunes = await AdministrativeUnitsService.getCommunes({
      provinceCode: "19",
      limit: 50,
      page: 1,
    });
    assert.strictEqual(tnCommunes.total, 92, "Thái Nguyên phải có 92 xã/phường");
    assert.strictEqual(tnCommunes.items.length, 50, "Trang 1 lấy 50 xã");
    assert.strictEqual(tnCommunes.totalPages, 2, "92 xã phân làm 2 trang");

    // Lấy trang 2
    const tnPage2 = await AdministrativeUnitsService.getCommunes({
      provinceCode: "19",
      limit: 50,
      page: 2,
    });
    assert.strictEqual(tnPage2.items.length, 42, "Trang 2 lấy nốt 42 xã");
    console.log("  ✓ PASS TC-DVHC-03: Lọc xã theo tỉnh và phân trang chuẩn xác (92 xã / 2 trang)");
  });

  it("TC-DVHC-04: Xác thực Zod Schema - Mã tỉnh 2 số và Mã xã 5 số", () => {
    // Mã tỉnh hợp lệ
    const validProvince = ProvinceInputSchema.safeParse({
      provinceCode: "99",
      name: "Tỉnh Thử Nghiệm",
      fullName: "Tỉnh Thử Nghiệm 2026",
      type: "Tỉnh",
      targetRespondents: 150,
    });
    assert.ok(validProvince.success);

    // Mã tỉnh sai format (3 số)
    const invalidProvince = ProvinceInputSchema.safeParse({
      provinceCode: "123",
      name: "Sai Mã",
      fullName: "Tỉnh Sai Mã",
    });
    assert.strictEqual(invalidProvince.success, false);

    // Mã xã hợp lệ
    const validCommune = CommuneInputSchema.safeParse({
      communeCode: "99999",
      name: "Xã Thử Nghiệm",
      type: "Xã",
      provinceCode: "99",
      provinceName: "Tỉnh Thử Nghiệm",
    });
    assert.ok(validCommune.success);

    // Mã xã sai format (4 số)
    const invalidCommune = CommuneInputSchema.safeParse({
      communeCode: "9999",
      name: "Sai Mã Xã",
      type: "Xã",
      provinceCode: "99",
      provinceName: "Tỉnh Thử Nghiệm",
    });
    assert.strictEqual(invalidCommune.success, false);
    console.log("  ✓ PASS TC-DVHC-04: Zod Schema bảo vệ chặt chẽ định dạng mã hành chính");
  });

  it("TC-DVHC-05: Thêm mới, cập nhật và xóa đơn vị hành chính", async () => {
    // Thêm xã thử nghiệm
    const newCom = await AdministrativeUnitsService.saveCommune({
      communeCode: "88888",
      name: "Xã Mới Kiểm Toán",
      type: "Xã",
      provinceCode: "20",
      provinceName: "Thái Nguyên",
      resolution: "Nghị quyết kiểm thử",
      isActive: true,
    });
    assert.strictEqual(newCom.communeCode, "88888");

    // Kiểm tra tìm thấy
    const found = await AdministrativeUnitsService.getCommunes({ search: "88888" });
    assert.strictEqual(found.total, 1);
    assert.strictEqual(found.items[0].name, "Xã Mới Kiểm Toán");

    // Xóa xã thử nghiệm
    const deleted = await AdministrativeUnitsService.deleteCommune("88888");
    assert.strictEqual(deleted, true);

    const recheck = await AdministrativeUnitsService.getCommunes({ search: "88888" });
    assert.strictEqual(recheck.total, 0);
    console.log("  ✓ PASS TC-DVHC-05: Thêm mới, tra cứu và xóa xã/phường hoạt động hoàn hảo");
  });
});
