import { NextResponse } from "next/server";
import { pool } from "@/server/db";

// Endpoint sekali pakai untuk menjalankan migrasi SQL yang tertinggal di
// produksi (mis. tabel gallery_videos belum ada) tanpa perlu buka terminal
// server. Nonaktif kecuali MIGRATE_TOKEN di-set. Idempotent lewat
// "CREATE TABLE IF NOT EXISTS" — aman dipanggil berkali-kali.
export async function GET(req: Request) {
  const migrateToken = process.env.MIGRATE_TOKEN;
  if (!migrateToken) {
    return NextResponse.json(
      { success: false, message: "Migrasi tidak diaktifkan." },
      { status: 404 },
    );
  }

  const { searchParams } = new URL(req.url);
  if (searchParams.get("token") !== migrateToken) {
    return NextResponse.json(
      { success: false, message: "Token tidak valid." },
      { status: 401 },
    );
  }

  try {
    // Sama persis dengan drizzle/0011_loving_plazm.sql.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`gallery_videos\` (
        \`id\` varchar(128) NOT NULL,
        \`album_id\` varchar(128) NOT NULL,
        \`platform\` enum('youtube','instagram') NOT NULL,
        \`external_id\` varchar(128) NOT NULL,
        \`url\` varchar(500) NOT NULL,
        \`caption\` varchar(300),
        \`thumbnail_url\` varchar(500),
        \`sort_order\` int NOT NULL DEFAULT 0,
        \`created_at\` timestamp DEFAULT (now()),
        CONSTRAINT \`gallery_videos_id\` PRIMARY KEY(\`id\`)
      )
    `);
    return NextResponse.json({
      success: true,
      message: "Tabel gallery_videos siap. Halaman album seharusnya normal kembali.",
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: err instanceof Error ? err.message : "Gagal menjalankan migrasi.",
      },
      { status: 500 },
    );
  }
}
