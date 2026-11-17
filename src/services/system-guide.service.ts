import fs from "fs";
import path from "path";
import { connectToDatabase } from "@/lib/db";
import { SurveySchemaConfig } from "@/models/SurveySchemaConfig";
import { Campaign } from "@/models/Campaign";
import { PositionWorkgroupsMapping } from "@/models/PositionWorkgroupsMapping";
import { SystemGuide } from "@/models/SystemGuide";
import { ROLE_LABELS } from "@/lib/auth";

export interface SoftwareModuleGuide {
  id: string;
  name: string;
  route: string;
  icon: string;
  description: string;
  allowedRoles: string[];
  keyCapabilities: string[];
  operationalRules: string[];
  apiEndpoints: string[];
}

export interface DynamicGuideData {
  schemaMeta: {
    version: string;
    isApproved: boolean;
    approvedBy: string;
    totalWorkgroups: number;
    workgroups: Array<{
      id: string;
      order: number;
      title: string;
      topicsCount: number;
      topics: string[];
    }>;
    totalRoles: number;
    roles: Array<{
      id: string;
      title: string;
      description: string;
      level1: string;
      level2: string;
      level3: string;
      level4: string;
    }>;
    difficulties: Array<{
      id: string;
      title: string;
      isExclusive: boolean;
    }>;
    learningFormats: Array<{
      id: string;
      title: string;
    }>;
  };
  campaignMeta: {
    code: string;
    title: string;
    status: string;
    startDate: string;
    endDate: string;
    participatingProvincesCount: number;
    targetPerProvince: number;
    totalNationalTarget: number;
  };
  positionMappingsSample: Array<{
    agencyCode: string;
    agencyName: string;
    positionCode: string;
    positionTitle: string;
    suggestedCount: number;
    suggestedWorkgroups: string[];
  }>;
  modules: SoftwareModuleGuide[];
  adminCustomNotes: Record<string, string>;
  lastGeneratedAt: string;
}

export class SystemGuideService {
  /**
   * Truy xuất toàn bộ cấu hình thực tế của hệ thống để sinh cẩm nang hướng dẫn động
   */
  static async getDynamicGuideData(): Promise<DynamicGuideData> {
    const [schemaConfig, campaign, positionMappings, customGuides] = await Promise.all([
      this.getSchemaConfig(),
      this.getActiveCampaign(),
      this.getPositionMappings(),
      this.getCustomGuides(),
    ]);

    // Danh mục các module chức năng hiện có trên phần mềm
    const modules: SoftwareModuleGuide[] = [
      {
        id: "public_survey",
        name: "Cổng Khảo sát Trực tuyến Di động (Mobile-First)",
        route: "/khao-sat/[token]",
        icon: "Smartphone",
        description:
          "Cho phép cán bộ cấp xã truy cập qua mã QR hoặc link công khai, tự đánh giá năng lực theo 4 bước trực quan, tự động điều chỉnh câu hỏi theo chức danh.",
        allowedRoles: ["SURVEY_RESPONDENT (Cán bộ cấp xã)", "Mọi người dùng có đường dẫn"],
        keyCapabilities: [
          "Tự động gợi ý và ưu tiên các nhóm công việc theo vị trí việc làm (Rule 1)",
          "Xử lý luồng kết thúc sớm (Early Exit) khi cán bộ ngoài phạm vi phụ trách (Rule 8)",
          "Đánh giá năng lực theo vai trò với 4 mức cụ thể, chọn tối đa 2 khó khăn (Rule 5 & 6)",
          "Chọn chuyên đề bồi dưỡng riêng biệt và xác định mức độ cấp thiết (Rule 7)",
          "Khóa form chống nộp đúp liên tiếp và dọn dẹp state tự động khi bấm Quay lại (Rule 9)",
        ],
        operationalRules: [
          "Bắt buộc chọn Tỉnh, Xã, Cơ quan, Vị trí và Tư cách tại Phần I.",
          "Nếu cả 16 nhóm đều là 'Chỉ phối hợp' hoặc 'Không được giao', bài khảo sát kết thúc sau Câu 7.",
          "Mục 'Không gặp khó khăn đáng kể' có tính độc quyền, không được chọn kèm khó khăn khác.",
        ],
        apiEndpoints: [
          "GET /api/public/survey/validate-link/[token]",
          "GET /api/public/survey/schema/3.3",
          "GET /api/public/survey/position-mapping",
          "POST /api/public/survey/submit",
        ],
      },
      {
        id: "progress_dashboard",
        name: "Dashboard Tổng quan & Theo dõi Tiến độ Thời gian thực",
        route: "/admin/dashboard",
        icon: "LayoutDashboard",
        description:
          "Giám sát số lượng phiếu tiếp nhận trên toàn quốc và 34 tỉnh/thành phố, so sánh với chỉ tiêu và hiển thị biểu đồ phân tích.",
        allowedRoles: [
          ROLE_LABELS.TECHNICAL_ADMIN,
          ROLE_LABELS.CONTENT_ADMIN,
          ROLE_LABELS.REVIEWER,
          ROLE_LABELS.PROGRESS_MONITOR,
          `${ROLE_LABELS.LOCAL_COORDINATOR} (chỉ xem tỉnh mình)`,
        ],
        keyCapabilities: [
          "4 thẻ chỉ số thời gian thực: Tổng phiếu, Phiếu hợp lệ, Phiếu nghi trùng, Số xã tham gia",
          "Biểu đồ diện tích số phiếu nộp theo ngày (Daily Timeline AreaChart)",
          "Biểu đồ cột xếp hạng Top địa phương có tiến độ nộp tích cực nhất",
          "Bảng tiến độ chi tiết 34 tỉnh: tìm kiếm, lọc trạng thái, thanh tiến độ % trực quan",
          "Nút liên kết nhanh để xem 6 bảng tổng hợp hoặc mở form khảo sát của từng tỉnh",
        ],
        operationalRules: [
          "Dữ liệu được làm mới tự động hoặc qua nút Refresh trên thanh công cụ.",
          "Đầu mối địa phương chỉ nhìn thấy dữ liệu và danh sách xã thuộc tỉnh được phân công.",
        ],
        apiEndpoints: ["GET /api/admin/progress"],
      },
      {
        id: "campaign_qr",
        name: "Quản lý Đợt Khảo sát & Bộ 34 Mã QR Cấp Tỉnh (ADR-008)",
        route: "/admin/campaigns",
        icon: "QrCode",
        description:
          "Quản lý thông tin chiến dịch khảo sát, cung cấp mã QR và link công khai chuẩn hóa cho từng tỉnh/thành phố.",
        allowedRoles: [
          ROLE_LABELS.TECHNICAL_ADMIN,
          ROLE_LABELS.CONTENT_ADMIN,
          ROLE_LABELS.REVIEWER,
          ROLE_LABELS.PROGRESS_MONITOR,
          ROLE_LABELS.LOCAL_COORDINATOR,
        ],
        keyCapabilities: [
          "Xem thông tin đợt khảo sát: mã đợt, ngày bắt đầu, ngày kết thúc, số tỉnh tham gia",
          "Thẻ hiển thị trực quan mã QR của từng tỉnh kèm nút sao chép link công khai",
          "Nút tải ảnh PNG đơn lẻ từng mã QR (512x512) để in vào công văn",
          "Nút 'Tải trọn bộ 34 Mã QR (ZIP)' xuất gói nén toàn bộ 34 tỉnh kèm file hướng dẫn sử dụng",
        ],
        operationalRules: [
          "Mỗi tỉnh sử dụng duy nhất một mã QR cố định trong suốt đợt khảo sát.",
          "Không gửi chéo mã QR của tỉnh này cho cán bộ tỉnh khác để tránh lệch địa bàn.",
        ],
        apiEndpoints: ["GET /api/admin/campaigns/qr-zip"],
      },
      {
        id: "duplicate_workbench",
        name: "Trung tâm Rà soát & Thẩm tra Phiếu Nghi trùng (ADR-005)",
        route: "/admin/reviews/duplicates",
        icon: "FileCheck2",
        description:
          "Công cụ chuyên dụng cho Thẩm tra viên Khoa Cơ sở đối soát các phiếu có cùng mã băm 4 điểm nghiệp vụ, bảo đảm dữ liệu đầu vào chuẩn xác.",
        allowedRoles: [
          ROLE_LABELS.TECHNICAL_ADMIN,
          ROLE_LABELS.CONTENT_ADMIN,
          ROLE_LABELS.REVIEWER,
        ],
        keyCapabilities: [
          "Tự động phát hiện phiếu nghi trùng dựa trên mã băm SHA-256 (xã + cơ quan + vị trí + 16 lựa chọn)",
          "Bộ lọc trạng thái (Đang chờ duyệt, Đã chấp nhận, Đã loại trừ) và tìm kiếm địa bàn",
          "Giao diện Accordion gom nhóm và Side-by-side Diff View so sánh chi tiết thời điểm nộp, Phần III và IV",
          "Nút 'Xử lý nhanh' (giữ phiếu nộp sau, loại phiếu nộp trước) và modal nhập lý do thẩm tra",
          "Lưu vết toàn bộ thao tác thẩm tra vào nhật ký hệ thống (AuditLog)",
        ],
        operationalRules: [
          "Tuyệt đối không xóa cứng bản ghi khỏi database để bảo đảm toàn vẹn dữ liệu.",
          "Mọi quyết định loại trừ (EXCLUDED) đều bắt buộc phải nhập lý do thẩm tra rõ ràng.",
          "Chỉ phiếu có trạng thái VALID mới được đưa vào tính toán 6 bảng tổng hợp.",
        ],
        apiEndpoints: [
          "GET /api/admin/reviews/duplicates",
          "PATCH /api/admin/reviews/duplicates/[id]/decision",
          "POST /api/admin/reviews/duplicates/resolve-group",
        ],
      },
      {
        id: "analytics_tables",
        name: "Phân tích & 6 Bảng Tổng hợp Kết quả (Phần IV Tài liệu số 2)",
        route: "/admin/analytics",
        icon: "Layers",
        description:
          "Công cụ tính toán tự động 6 bảng tổng hợp B1 - B6, đo lường khoảng thiếu hụt năng lực theo ma trận chuẩn và hỗ trợ quy tắc ẩn danh số liệu nhỏ.",
        allowedRoles: [
          ROLE_LABELS.TECHNICAL_ADMIN,
          ROLE_LABELS.CONTENT_ADMIN,
          ROLE_LABELS.REVIEWER,
          ROLE_LABELS.PROGRESS_MONITOR,
          `${ROLE_LABELS.LOCAL_COORDINATOR} (bắt buộc chế độ ẩn danh <5)`,
        ],
        keyCapabilities: [
          "Bảng B1: Thống kê người trả lời theo cơ quan, vị trí, tư cách và lý do loại trừ",
          "Bảng B2: Tình hình thực hiện 16 nhóm việc (Tổng tỷ lệ 4 cột luôn bằng 100%)",
          "Bảng B3: Khoảng thiếu hụt năng lực (Δ = Req - Self), phân bố thiếu 1, 2, 3 mức kèm câu ghi chú chuẩn",
          "Bảng B4: Nhu cầu đào tạo theo chuyên đề và 3 mức độ cấp thiết (6 tháng, 12 tháng, khi có điều kiện)",
          "Bảng B5: Khó khăn trong thực thi công vụ (tách rõ khó khăn đào tạo và ngoài đào tạo)",
          "Bảng B6: Đề xuất 5 hình thức tổ chức bồi dưỡng và giới hạn dữ liệu",
          "Công tắc bật/tắt chế độ bảo vệ dữ liệu nhỏ (Statistical Disclosure Suppression <5)",
        ],
        operationalRules: [
          "Người thuộc trạng thái 'Chưa có dịp thực hiện' được thống kê ở dòng riêng, không tính vào khoảng thiếu hụt.",
          "Bảng B3 bắt buộc hiển thị câu ghi chú bản quyền và căn cứ pháp lý dưới tiêu đề bảng.",
        ],
        apiEndpoints: ["GET /api/admin/analytics/tables"],
      },
      {
        id: "excel_export",
        name: "Pipeline Xuất Báo cáo Excel Đa sheet Chuẩn Kiểm toán (ADR-006)",
        route: "/api/admin/export/excel",
        icon: "FileSpreadsheet",
        description:
          "Xuất file Excel gồm trọn bộ 6 sheet tương ứng B1 đến B6 với định dạng bảng biểu, font tiếng Việt và công thức kiểm toán.",
        allowedRoles: [
          `${ROLE_LABELS.TECHNICAL_ADMIN} (Bản Nội bộ & Địa phương)`,
          `${ROLE_LABELS.CONTENT_ADMIN} (Bản Nội bộ & Địa phương)`,
          `${ROLE_LABELS.REVIEWER} (Bản Nội bộ & Địa phương)`,
          `${ROLE_LABELS.LOCAL_COORDINATOR} (chỉ được xuất Bản Địa phương đã ẩn danh <5)`,
        ],
        keyCapabilities: [
          "Sinh file .xlsx gồm 6 sheet: B1_NguoiTraLoi, B2_NhomCongViec, B3_KhoangThieuHut, B4_NoiDungCanHoc, B5_KhoKho, B6_HinhThucHoc",
          "Header tiêu đề trang trọng màu xanh navy (#1E3A8A), border xám mỏng, auto-fit cột",
          "Định dạng số nguyên #,##0 cho số lượng và 0.0% cho các cột tỷ lệ phần trăm",
          "Chế độ INTERNAL: Giữ nguyên 100% số liệu thực phục vụ nội bộ Kiểm toán nhà nước",
          "Chế độ LOCAL_CONFIDENTIAL: Tự động áp dụng Primary, Row và Secondary Suppression cho số liệu <5",
        ],
        operationalRules: [
          "Đầu mối địa phương bị cấm tải bản INTERNAL qua middleware phân quyền.",
          "Tên file xuất ra được gán nhãn thời gian và chế độ xuất cụ thể.",
        ],
        apiEndpoints: ["GET /api/admin/export/excel?mode=INTERNAL", "GET /api/admin/export/excel?mode=LOCAL_CONFIDENTIAL"],
      },
      {
        id: "administrative_units",
        name: "Cấu hình Danh mục Đơn vị Hành chính (34 Tỉnh & 3.321 Xã/Phường)",
        route: "/admin/administrative-units",
        icon: "MapPin",
        description:
          "Quản lý, tìm kiếm, hiệu chỉnh và đồng bộ danh mục 34 tỉnh/thành phố và 3.321 xã/phường/đặc khu trên toàn quốc theo dữ liệu chuẩn hiệu lực 2026.",
        allowedRoles: [
          ROLE_LABELS.TECHNICAL_ADMIN,
          ROLE_LABELS.CONTENT_ADMIN,
          ROLE_LABELS.REVIEWER,
          ROLE_LABELS.PROGRESS_MONITOR,
        ],
        keyCapabilities: [
          "Xem và tìm kiếm danh mục 34 Tỉnh / Thành phố với số lượng xã/phường và chỉ tiêu khảo sát thực tế",
          "Duyệt danh sách 3.321 Xã / Phường / Đặc khu theo từng tỉnh, phân loại Phường (709), Xã (2.599), Đặc khu (13)",
          "Thêm mới hoặc hiệu chỉnh Tỉnh / Xã khi có sắp xếp địa giới hành chính theo Nghị quyết mới",
          "Kích hoạt hoặc tạm dừng (bật/tắt) đơn vị hành chính trong chiến dịch khảo sát",
          "Đồng bộ hóa 1-click từ dữ liệu nguồn chuẩn CC BY 4.0 (diachiviet.com / Cục Thống kê)",
          "Xuất dữ liệu danh mục ra file Excel (.xlsx) 2 sheet phục vụ kiểm toán và lưu trữ",
        ],
        operationalRules: [
          "Mã tỉnh gồm đúng 2 chữ số (giữ nguyên số 0 đầu, ví dụ '01', '04', '79').",
          "Mã xã gồm đúng 5 chữ số duy nhất trên toàn quốc (ví dụ '00004', '05977').",
          "Khi thêm hoặc xóa xã, số lượng xã của tỉnh liên quan sẽ được tự động cập nhật.",
          "Chỉ Quản trị viên Kỹ thuật và Quản trị Nội dung mới có quyền thêm, sửa, xóa hoặc kích hoạt đồng bộ.",
        ],
        apiEndpoints: [
          "GET /api/admin/administrative-units/stats",
          "GET /api/admin/administrative-units/provinces",
          "POST /api/admin/administrative-units/provinces",
          "PATCH /api/admin/administrative-units/provinces/[code]/status",
          "GET /api/admin/administrative-units/communes",
          "POST /api/admin/administrative-units/communes",
          "DELETE /api/admin/administrative-units/communes/[code]",
          "POST /api/admin/administrative-units/sync",
          "GET /api/admin/administrative-units/export",
        ],
      },
      {
        id: "survey_questions_admin",
        name: "Quản trị Bộ Câu hỏi & Ngân hàng Chuyên đề Đào tạo (ADR-012)",
        route: "/admin/questions",
        icon: "HelpCircle",
        description:
          "Toàn quyền quản trị nội dung, số lượng và cấu trúc của 14 câu hỏi chuẩn, danh mục nhóm công việc, ngân hàng chuyên đề đào tạo, thang điểm 4 vai trò và tạo phiên bản khảo sát mới.",
        allowedRoles: [
          ROLE_LABELS.TECHNICAL_ADMIN,
          ROLE_LABELS.CONTENT_ADMIN,
          ROLE_LABELS.REVIEWER,
        ],
        keyCapabilities: [
          "Quản lý phiên bản bộ phiếu (Versioning): Xem, nhân bản (clone) phiên bản mới (v3.4, v4.0) bảo vệ tính toàn vẹn dữ liệu cũ",
          "Quản trị 14 câu hỏi khảo sát: Tùy biến tiêu đề, hướng dẫn trả lời, ràng buộc bắt buộc và số lượng chọn tối đa",
          "Quản trị Danh mục Nhóm Công việc: Thêm mới, sửa tên, mô tả, sắp xếp thứ tự ưu tiên và xóa nhóm việc",
          "Quản trị Ngân hàng Chuyên đề: Thêm mới, chỉnh sửa, phân loại chuyên đề đào tạo theo từng nhóm công việc",
          "Quản trị 4 Vai trò & Thang Điểm: Điều chỉnh định nghĩa vai trò và mô tả chi tiết của 4 mức tự đánh giá năng lực",
          "Quản trị Danh mục Khó khăn & Hình thức học: Tùy biến danh mục nguyên nhân (Câu 10) và phương thức đào tạo (Câu 13)",
          "Xem trước trực tiếp (Live Preview) biểu mẫu khảo sát di động theo thời gian thực",
        ],
        operationalRules: [
          "Khi thay đổi lớn về cấu trúc câu hỏi, khuyến nghị nhân bản phiên bản mới để các đợt khảo sát cũ giữ nguyên giá trị so sánh.",
          "Chỉ Quản trị viên Kỹ thuật và Quản trị Nội dung mới có quyền lưu thay đổi hoặc tạo phiên bản mới.",
        ],
        apiEndpoints: [
          "GET /api/admin/questions/versions",
          "POST /api/admin/questions/versions",
          "GET /api/admin/questions/schema/[version]",
          "PUT /api/admin/questions/schema/[version]",
          "POST /api/admin/questions/schema/[version]/workgroups",
          "PUT /api/admin/questions/schema/[version]/workgroups",
          "DELETE /api/admin/questions/schema/[version]/workgroups",
          "POST /api/admin/questions/schema/[version]/workgroups/[id]/topics",
          "PUT /api/admin/questions/schema/[version]/workgroups/[id]/topics",
          "DELETE /api/admin/questions/schema/[version]/workgroups/[id]/topics",
          "PUT /api/admin/questions/schema/[version]/roles",
          "PUT /api/admin/questions/schema/[version]/difficulties",
          "PUT /api/admin/questions/schema/[version]/learning-formats",
          "PUT /api/admin/questions/schema/[version]/sections",
        ],
      },
      {
        id: "user_admin",
        name: "Quản trị Tài khoản Người dùng & Phân quyền RBAC (UC-14)",
        route: "/admin/users",
        icon: "Users",
        description:
          "Quản lý danh sách tài khoản quản trị, tạo mới chuyên viên theo khoa, phân công địa bàn phụ trách cho đầu mối địa phương, đặt lại mật khẩu và khóa/thu hồi tài khoản theo biên bản làm việc.",
        allowedRoles: [
          ROLE_LABELS.TECHNICAL_ADMIN,
          ROLE_LABELS.SYSTEM_ADMIN,
        ],
        keyCapabilities: [
          "Quản lý toàn bộ tài khoản với 6 vai trò: Cục CNTT, Quản trị viên HT, Quản trị nội dung, Thẩm tra viên, Giám sát tiến độ, Đầu mối địa phương",
          "Tạo tài khoản mới, mã hóa mật khẩu an toàn bcrypt (salt 10 rounds)",
          "Phân công địa bàn (gán tỉnh phụ trách) cho từng đầu mối địa phương",
          "Khóa hoặc mở khóa tài khoản tức thời khi kết thúc đợt khảo sát hoặc thay đổi nhân sự",
          "Đặt lại mật khẩu (Reset password) an toàn",
          "Tự động ghi vết vào Nhật ký Hệ thống (Audit Log) đối với mọi thao tác thêm, sửa, đổi trạng thái",
        ],
        operationalRules: [
          "Tài khoản quản trị được cấp theo danh sách trong biên bản làm việc và phải thu hồi khi kết thúc đợt hoặc thay đổi nhân sự.",
          "Chỉ Cục Công nghệ thông tin và Quản trị viên Hệ thống mới có quyền truy cập phân hệ này.",
          "Tuyệt đối không được xóa hoặc khóa tài khoản Cục CNTT mặc định (cntt_admin).",
        ],
        apiEndpoints: [
          "GET /api/admin/users",
          "POST /api/admin/users",
          "PUT /api/admin/users/[id]",
          "DELETE /api/admin/users/[id]",
          "PATCH /api/admin/users/[id]/status",
          "POST /api/admin/users/[id]/reset-password",
        ],
      },
      {
        id: "audit_logs",
        name: "Nhật ký Hệ thống & Lưu vết Kiểm toán (ADR-013)",
        route: "/admin/audit-logs",
        icon: "ShieldCheck",
        description:
          "Lưu vết toàn bộ lịch sử đăng nhập, đăng xuất, cảnh báo an ninh truy cập trái quyền và mọi thao tác chỉnh sửa dữ liệu nhạy cảm của các tài khoản quản trị.",
        allowedRoles: [
          ROLE_LABELS.TECHNICAL_ADMIN,
        ],
        keyCapabilities: [
          "Ghi nhận tự động, non-blocking toàn bộ các hành động nghiệp vụ quan trọng",
          "Bảo mật đa tầng: Chỉ duy nhất tài khoản Cục Công nghệ thông tin (cntt_admin) có quyền xem log",
          "Tự động phát hiện và ghi nhận cảnh báo an ninh khi tài khoản khác cố ý truy cập log trái phép",
          "Tra cứu, tìm kiếm đa chiều theo Phân hệ, Trạng thái (SUCCESS, FAILED, WARNING), Từ khóa",
          "Xem chi tiết payload JSON metadata và xuất báo cáo CSV chuẩn UTF-8",
        ],
        operationalRules: [
          "Đặc quyền duy nhất thuộc về Cục Công nghệ thông tin - Kiểm toán nhà nước.",
          "Mọi nỗ lực truy cập từ các vai trò khác đều bị từ chối 403 Forbidden và lập tức ghi nhận cảnh báo an ninh.",
        ],
        apiEndpoints: [
          "GET /api/admin/audit-logs",
          "POST /api/admin/audit-logs",
        ],
      },
    ];

    return {
      schemaMeta: schemaConfig,
      campaignMeta: campaign,
      positionMappingsSample: positionMappings,
      modules,
      adminCustomNotes: customGuides,
      lastGeneratedAt: new Date().toISOString(),
    };
  }

  /**
   * Cập nhật ghi chú hướng dẫn của Admin cho một mục cụ thể
   */
  static async updateSectionNote(
    sectionKey: string,
    notes: string,
    actorName: string = "Quản trị viên"
  ): Promise<boolean> {
    try {
      await connectToDatabase();
      await SystemGuide.findOneAndUpdate(
        { sectionKey },
        {
          sectionKey,
          title: `Ghi chú cho mục ${sectionKey}`,
          category: "ADMIN_OPERATOR",
          contentMarkdown: notes,
          adminNotes: notes,
          lastUpdatedBy: actorName,
        },
        { upsert: true, new: true }
      );
      return true;
    } catch {
      return false;
    }
  }

  // --- PRIVATE HELPERS ---

  private static async getSchemaConfig() {
    let schema: any = null;
    try {
      await connectToDatabase();
      schema = await SurveySchemaConfig.findOne({ version: "3.3" }).lean();
    } catch {
      // Offline fallback
    }

    if (!schema) {
      const fallbackPath = path.join(process.cwd(), "src/data/seed-schema-3.3.json");
      if (fs.existsSync(fallbackPath)) {
        schema = JSON.parse(fs.readFileSync(fallbackPath, "utf-8"));
      }
    }

    const workgroups = (schema?.workgroups || []).map((w: any) => ({
      id: w.id,
      order: w.order || 1,
      title: w.title,
      topicsCount: w.learningTopics?.length || 0,
      topics: (w.learningTopics || []).map((t: any) => t.topicTitle),
    }));

    const roles = (schema?.roles || []).map((r: any) => ({
      id: r.roleId,
      title: r.title,
      description: r.description || "",
      level1: r.levelDescriptions?.["1"] || "Chưa nắm vững, cần kèm cặp",
      level2: r.levelDescriptions?.["2"] || "Thực hiện được công việc cơ bản",
      level3: r.levelDescriptions?.["3"] || "Thành thạo, độc lập giải quyết việc khó",
      level4: r.levelDescriptions?.["4"] || "Chuyên gia, có thể hướng dẫn người khác",
    }));

    const difficulties = (schema?.difficulties || []).map((d: any) => ({
      id: d.id,
      title: d.title,
      isExclusive: !!d.isExclusive,
    }));

    const learningFormats = (schema?.learningFormats || []).map((f: any) => ({
      id: f.id,
      title: f.title,
    }));

    return {
      version: schema?.version || "3.3",
      isApproved: schema?.isApproved ?? true,
      approvedBy: schema?.approvedBy || "Trường Đào tạo và Bồi dưỡng nghiệp vụ kiểm toán",
      totalWorkgroups: workgroups.length,
      workgroups,
      totalRoles: roles.length,
      roles,
      difficulties,
      learningFormats,
    };
  }

  private static async getActiveCampaign() {
    let camp: any = null;
    try {
      await connectToDatabase();
      camp = await Campaign.findOne({ status: "OPEN" }).lean();
    } catch {
      // Offline fallback
    }

    const provCount = camp?.participatingProvinces?.length || 34;
    const target = 100;

    return {
      code: camp?.code || "DOT-1-2026",
      title:
        camp?.title ||
        "Đợt khảo sát năng lực quản lý tài chính, tài sản công cấp xã năm 2026",
      status: camp?.status || "OPEN",
      startDate: camp?.startDate
        ? new Date(camp.startDate).toLocaleDateString("vi-VN")
        : "01/01/2026",
      endDate: camp?.endDate
        ? new Date(camp.endDate).toLocaleDateString("vi-VN")
        : "31/12/2026",
      participatingProvincesCount: provCount,
      targetPerProvince: target,
      totalNationalTarget: provCount * target,
    };
  }

  private static async getPositionMappings() {
    let mappings: any[] = [];
    try {
      await connectToDatabase();
      mappings = await PositionWorkgroupsMapping.find({}).limit(10).lean();
    } catch {
      // Offline fallback
    }

    if (mappings.length === 0) {
      const fallbackPath = path.join(process.cwd(), "src/data/seed-position-mappings.json");
      if (fs.existsSync(fallbackPath)) {
        mappings = JSON.parse(fs.readFileSync(fallbackPath, "utf-8")).slice(0, 10);
      }
    }

    return mappings.map((m: any) => ({
      agencyCode: m.agencyCode,
      agencyName: m.agencyName || m.agencyCode,
      positionCode: m.positionCode,
      positionTitle: m.positionTitle,
      suggestedCount: m.suggestedWorkgroupIds?.length || 0,
      suggestedWorkgroups: m.suggestedWorkgroupIds || [],
    }));
  }

  private static async getCustomGuides(): Promise<Record<string, string>> {
    try {
      await connectToDatabase();
      const records = await SystemGuide.find({ isPublished: true }).lean();
      const map: Record<string, string> = {};
      for (const r of records) {
        map[r.sectionKey] = r.contentMarkdown || r.adminNotes || "";
      }
      return map;
    } catch {
      return {};
    }
  }
}
