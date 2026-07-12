import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, pool } from "./index";
import { cmsUsers } from "./schema";
import { hashPassword } from "../utils/hash";

// Membuat akun Super Admin CMS pertama. Wajib dijalankan sekali di server
// produksi setelah deploy — super_admin TIDAK bisa dibuat lewat UI dan TIDAK
// dibuat oleh seed.ts (yang khusus E-Surat), jadi tanpa ini tak ada yang bisa
// login ke /admin.
//
// Kredensial diambil dari environment variable (jangan hardcode password di
// repo). Jalankan dengan:
//   CMS_ADMIN_EMAIL=admin@desasangkima.cloud CMS_ADMIN_PASSWORD='rahasiaKuat123' npx tsx src/server/db/seedCms.ts
//
// Idempotent: kalau email sudah ada, tidak dibuat ulang.
async function seedCmsAdmin() {
  const name = process.env.CMS_ADMIN_NAME || "Administrator";
  const email = process.env.CMS_ADMIN_EMAIL;
  const password = process.env.CMS_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "❌ CMS_ADMIN_EMAIL dan CMS_ADMIN_PASSWORD wajib di-set.\n" +
        "Contoh: CMS_ADMIN_EMAIL=admin@desasangkima.cloud CMS_ADMIN_PASSWORD='rahasiaKuat123' npx tsx src/server/db/seedCms.ts",
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("❌ Password minimal 8 karakter.");
    process.exit(1);
  }

  const existing = await db
    .select()
    .from(cmsUsers)
    .where(eq(cmsUsers.email, email))
    .limit(1);

  if (existing[0]) {
    console.log(`⏭️  ${email} sudah ada (role: ${existing[0].role}). Tidak diubah.`);
    return;
  }

  await db.insert(cmsUsers).values({
    name,
    email,
    role: "super_admin",
    password: await hashPassword(password),
  });
  console.log(`✅ Super Admin CMS dibuat — ${email}`);
  console.log("   Login di /admin/login, lalu buat akun editor lewat menu Pengguna.");
}

seedCmsAdmin()
  .then(() => pool.end())
  .catch(async (err) => {
    console.error("❌ Gagal seed CMS:", err);
    await pool.end();
    process.exit(1);
  });
