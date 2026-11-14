import { NextRequest, NextResponse } from "next/server";
import AdmZip from "adm-zip";
import QRCode from "qrcode";
import { ProgressMonitoringService } from "@/services/progress-monitoring.service";

export async function GET(request: NextRequest) {
  try {
    const provinces = ProgressMonitoringService.getProvincesList();
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;

    const zip = new AdmZip();

    // Sinh mã QR PNG độ nét cao cho từng tỉnh
    for (const prov of provinces) {
      const token = `pilot_dot-1-2026_p${prov.code}`;
      const surveyUrl = `${baseUrl}/khao-sat/${token}`;

      // Sinh buffer ảnh PNG
      const qrBuffer = await QRCode.toBuffer(surveyUrl, {
        type: "png",
        width: 512,
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
          dark: "#0F172A",
          light: "#FFFFFF",
        },
      });

      // Đặt tên file tiếng Việt không dấu hoặc gạch dưới chuẩn
      const safeProvName = prov.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[đĐ]/g, "d")
        .replace(/[^a-zA-Z0-9]/g, "_");

      const filename = `QR_KhaoSat_${prov.code}_${safeProvName}.png`;
      zip.addFile(filename, qrBuffer);
    }

    // Thêm file README.txt giải thích cách sử dụng
    const readmeContent = `TRƯỜNG ĐÀO TẠO VÀ BỒI DƯỠNG NGHIỆP VỤ KIỂM TOÁN - KIỂM TOÁN NHÀ NƯỚC
BỘ 34 MÃ QR KHẢO SÁT NĂNG LỰC QUẢN LÝ TÀI CHÍNH CẤP XÃ NĂM 2026
-------------------------------------------------------------------------------
Bộ tệp này gồm 34 mã QR định dạng hình ảnh PNG độ phân giải cao (512x512)
tương ứng với 34 tỉnh, thành phố trực thuộc Trung ương trong đợt khảo sát.

Hướng dẫn sử dụng:
1. Mỗi tỉnh/thành phố sử dụng duy nhất một mã QR được gán theo mã tỉnh của mình.
2. Mã QR có thể in vào công văn hướng dẫn gửi Ủy ban nhân dân cấp xã,
   hoặc trình chiếu tại các hội nghị triển khai để cán bộ quét bằng điện thoại.
3. Không gửi chéo mã QR của tỉnh này cho tỉnh khác để tránh sai lệch địa bàn.
-------------------------------------------------------------------------------
Ngày tạo: ${new Date().toLocaleDateString("vi-VN")}
Phiên bản bộ phiếu: 3.3 (Quyết định số 14-KTNN)
`;
    zip.addFile("HUONG_DAN_SU_DUNG.txt", Buffer.from(readmeContent, "utf-8"));

    const zipBuffer = zip.toBuffer();

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="34_Ma_QR_KhaoSat_KiemToan_2026.zip"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("[QR_ZIP_EXPORT_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Không thể tạo bộ nén ZIP mã QR", details: error?.message },
      { status: 500 }
    );
  }
}
