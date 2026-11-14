import { importDVHC } from "./import-dvhc";

// Tương thích ngược với npm run db:import-communes
async function main() {
  const tinhArg = process.argv[2];
  const xaArg = process.argv[3];
  await importDVHC(tinhArg, xaArg);
}

main().catch((err) => {
  console.error("Lỗi khi import:", err);
  process.exit(1);
});
