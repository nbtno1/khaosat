# REQUIREMENTS TRACEABILITY MATRIX (RTM) — MA TRẬN TRUY VẾT YÊU CẦU

Bảng ma trận này liên kết chặt chẽ toàn bộ chuỗi phát triển: **Tài liệu nguồn → Yêu cầu nghiệp vụ (BR) → Yêu cầu chức năng (FR) → Thiết kế DB & API → File mã nguồn dự kiến → Test Cases (TC)**.

| Tài liệu Nguồn | Mã Yêu cầu Nghiệp vụ | Mã Yêu cầu Chức năng | Mô hình DB & API liên quan | File Mã nguồn dự kiến (src/) | Ca kiểm thử xác minh (TC) | Trạng thái |
|:---|:---|:---|:---|:---|:---|:---:|
| `Bộ phiếu...` Phần I | BR-01 (Thông tin chung) | FR-009, FR-013 | `SurveyResponse.part1`<br>`POST /api/public/survey/submit` | `src/components/survey/StepGeneralInfo.tsx`<br>`src/lib/validations/part1.ts` | TC-01, TC-02 | Spec Defined |
| `Bộ phiếu...` Phụ lục 2 | BR-02 (Gợi ý theo vị trí) | FR-005, FR-009 | `PositionWorkgroupsMapping`<br>`GET /api/public/survey/position-mapping` | `src/services/survey-engine.service.ts`<br>`src/components/survey/StepWorkgroups.tsx` | TC-13 | Spec Defined |
| `Bộ phiếu...` Phần II | BR-03 (16 nhóm & Early exit) | FR-010 | `SurveyResponse.part2`<br>`SurveyResponse.isOutOfScope` | `src/components/survey/StepWorkgroups.tsx`<br>`src/services/survey-engine.service.ts` | TC-01, TC-02, TC-05 | Spec Defined |
| `Bộ phiếu...` Phần III | BR-04 (Vòng lặp Part III) | FR-011 | `SurveyResponse.part3`<br>`SurveySchemaConfig.roles` | `src/components/survey/StepDynamicEvaluation.tsx`<br>`src/components/survey/RoleEvaluationCard.tsx` | TC-03, TC-04 | Spec Defined |
| `Bộ phiếu...` Câu 9 & Thuyết minh II.A | BR-05 (Thang 4 mức theo vai trò) | FR-011 | `SurveySchemaConfig.roles`<br>`SurveyResponse.part3.evaluations` | `src/components/survey/RoleLevelSelector.tsx` | TC-03 | Spec Defined |
| `Bộ phiếu...` Câu 10 | BR-06 (Khó khăn & mục độc quyền) | FR-011 | `SurveyResponse.part3.difficulties`<br>`SurveySchemaConfig.difficulties` | `src/components/survey/DifficultySelector.tsx` | TC-04, TC-10, TC-11 | Spec Defined |
| `Bộ phiếu...` Câu 11 & 12 | BR-07 (Nội dung & Mức độ cần học) | FR-011 | `SurveyResponse.part3.selectedTopics`<br>`SurveyResponse.part3.urgencyLevel` | `src/components/survey/TopicChecklist.tsx` | TC-12 | Spec Defined |
| `Bộ phiếu...` Phần IV | BR-08 (Hình thức học & Góp ý) | FR-013 | `SurveyResponse.part4` | `src/components/survey/StepLearningPreferences.tsx` | TC-14 | Spec Defined |
| `Thuyết minh...` III.1 [600] | BR-09 (Dọn dẹp state khi quay lại) | FR-012 | Client State & Server Validation | `src/hooks/useSurveyFormState.ts`<br>`src/services/survey-engine.service.ts` | TC-06, TC-07, TC-08, TC-09 | Spec Defined |
| `Phương án...` V.5 | BR-10 (Kiểm soát phiếu nghi trùng) | FR-014, FR-015 | `SurveyResponse.businessHash`<br>`SurveyResponse.isSuspectedDuplicate`<br>`GET /api/admin/reviews/duplicates` | `src/services/duplicate-detection.service.ts`<br>`src/app/(admin)/admin/reviews/page.tsx` | TC-15, TC-16 | Spec Defined |
| `Thuyết minh...` III.5 | BR-11 (Tổng hợp 6 Bảng B1-B6) | FR-016 -> FR-021 | MongoDB Aggregation Pipelines<br>`GET /api/admin/analytics/tables` | `src/services/analytics-aggregation.service.ts`<br>`src/components/admin/analytics/TablesView.tsx` | TC-17, TC-18 | Spec Defined |
| `Thuyết minh...` IV [676-685] | BR-12 (Tính khoảng thiếu hụt) | FR-018 | `BenchmarkMatrix`<br>`B3 Aggregator` | `src/services/capacity-gap.service.ts` | TC-17, TC-18 | Spec Defined |
| `Thuyết minh...` III.6 [632] | BR-13 (Thuật toán ẩn danh <5) | FR-022 | `StatisticalDisclosureService` | `src/services/statistical-disclosure.service.ts`<br>`src/lib/suppression-engine.ts` | TC-19, TC-20, TC-21 | Spec Defined |
| `Phương án...` V.6 | BR-14 (Phân quyền 5 nhóm tài khoản) | FR-001, FR-002 | `User.role`<br>`Next.js Middleware RBAC` | `src/middleware.ts`<br>`src/lib/auth.ts` | TC-22 | Spec Defined |
| `Phương án...` V.7 & VII | BR-15 (Xuất báo cáo Excel đa sheet) | FR-023 | `ExcelReportExportService`<br>`GET /api/admin/export/excel` | `src/services/excel-export.service.ts` | TC-23 | Spec Defined |
| `Phương án...` V.4 | BR-16 (Quản lý Link & Mã QR) | FR-007, FR-008 | `SurveyLink`<br>`Campaign` | `src/services/campaign-link.service.ts`<br>`src/app/(admin)/admin/campaigns/page.tsx` | TC-13 | Spec Defined |
| Quyết định Kiến trúc ADR-010 | BR-17 (Cẩm nang Hướng dẫn Động) | FR-024 (Dynamic System Guide) | `SystemGuide`<br>`GET /api/public/guide`<br>`PATCH /api/admin/guide/sections/[key]` | `src/services/system-guide.service.ts`<br>`src/app/(admin)/admin/guide/page.tsx`<br>`src/components/survey/SurveyGuideModal.tsx` | Task 17 Guide Tests (5/5 PASS) | Hoàn thành (COMPLETED) |
