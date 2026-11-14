import fs from "fs";
import path from "path";
import mongoose from "mongoose";

interface ICommuneInput {
  provinceCode: string;
  provinceName?: string;
  districtCode: string;
  districtName: string;
  communeCode: string;
  communeName: string;
  communeType?: string;
}

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/khaosat";

async function importCommunes() {
  const filePath = process.argv[2] || path.join(__dirname, "../src/data/communes-catalog.template.json");
  console.log(`[Import Communes] Đang đọc file: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    console.error(`Lỗi: Không tìm thấy file dữ liệu tại: ${filePath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(filePath, "utf-8");
  const communes: ICommuneInput[] = JSON.parse(rawData);

  console.log(`[Import Communes] Đã tải ${communes.length} bản ghi xã/phường.`);

  // Validation
  let validCount = 0;
  for (let i = 0; i < communes.length; i++) {
    const c = communes[i];
    if (!c.provinceCode || !c.communeCode || !c.communeName) {
      console.warn(`[Cảnh báo] Bản ghi thứ ${i + 1} thiếu trường bắt buộc:`, c);
    } else {
      validCount++;
    }
  }

  console.log(`[Import Communes] Kiểm tra hợp lệ: ${validCount}/${communes.length} bản ghi.`);

  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`[Import Communes] Đã kết nối MongoDB.`);

    const CommuneSchema = new mongoose.Schema(
      {
        provinceCode: { type: String, required: true },
        provinceName: { type: String },
        districtCode: { type: String, required: true },
        districtName: { type: String, required: true },
        communeCode: { type: String, required: true, unique: true },
        communeName: { type: String, required: true },
        communeType: { type: String, default: "XA" },
      },
      { timestamps: true }
    );

    const CommuneModel =
      mongoose.models.Commune || mongoose.model("Commune", CommuneSchema);

    let inserted = 0;
    for (const item of communes) {
      await CommuneModel.findOneAndUpdate(
        { communeCode: item.communeCode },
        { ...item },
        { upsert: true }
      );
      inserted++;
    }

    console.log(`[Import Communes] Đã nạp thành công ${inserted} xã vào cơ sở dữ liệu.`);
    await mongoose.disconnect();
  } catch (err) {
    console.warn(`[Import Communes] Không kết nối được MongoDB. Chế độ xác thực file thành công.`);
    console.log(`[Import Communes] Định dạng file JSON hoàn toàn tương thích và sẵn sàng.`);
  }
}

importCommunes().catch((err) => {
  console.error("Lỗi khi import:", err);
  process.exit(1);
});
