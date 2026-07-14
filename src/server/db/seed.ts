import "dotenv/config";
import { eq } from "drizzle-orm";
import { db, pool } from "./index";
import { letterTypes, positions, users } from "./schema";
import { SUPPORTING_DOCS, type TCreateLetterTypeInput } from "../types/letter";
import { hashPassword } from "../utils/hash";

// 8 jenis surat Desa Sangkima sesuai skemaSurat.md.
// requiredFields = field tambahan per jenis surat (jawaban disimpan di letter_requests.data).
// Field identitas pemohon (nama/nik/alamat) auto-fill dari profil, tidak didefinisikan di sini.
// supportingDocs diinjeksi dari konstanta SUPPORTING_DOCS saat seed (satu sumber, tanpa duplikasi).
// Jalankan dengan: npx tsx src/server/db/seed.ts
const SEED_LETTER_TYPES: Omit<TCreateLetterTypeInput, "supportingDocs">[] = [
  {
    code: "SKU",
    name: "Surat Keterangan Usaha",
    description: "Keterangan kepemilikan usaha milik warga.",
    template:
      "Menerangkan bahwa {{name}} (NIK {{nik}}) memiliki usaha {{nama_usaha}} ({{jenis_usaha}}) yang beralamat di {{alamat_usaha}}, untuk keperluan {{tujuan_surat}}.",
    requiredFields: [
      { name: "nama_usaha", label: "Nama Usaha", type: "text", required: true },
      {
        name: "jenis_usaha",
        label: "Jenis Usaha",
        type: "select",
        required: true,
        options: ["Perdagangan", "Jasa", "Pertanian", "Peternakan", "Kerajinan", "Lainnya"],
      },
      {
        name: "alamat_usaha",
        label: "Alamat Usaha",
        type: "textarea",
        required: true,
        placeholder: "Isi jika berbeda dari alamat KTP",
      },
      {
        name: "tujuan_surat",
        label: "Tujuan Surat",
        type: "select",
        required: true,
        options: ["Pengajuan kredit/KUR", "Perizinan usaha", "BPJS Ketenagakerjaan", "Lainnya"],
      },
    ],
    requireManualNumber: true,
      active: true,
  },
  {
    code: "SKD",
    name: "Surat Keterangan Domisili",
    description: "Keterangan bahwa warga berdomisili di Desa Sangkima.",
    template:
      "Menerangkan bahwa {{name}} (NIK {{nik}}) benar berdomisili di {{alamat_domisili}} sejak {{tanggal_domisili}}, untuk keperluan {{tujuan_surat}}.",
    requiredFields: [
      {
        name: "alamat_domisili",
        label: "Alamat Domisili",
        type: "textarea",
        required: true,
        placeholder: "Isi jika berbeda dari alamat di KTP",
      },
      {
        name: "tanggal_domisili",
        label: "Berdomisili Sejak",
        type: "date",
        required: true,
        placeholder: "Bulan / Tahun",
      },
      {
        name: "tujuan_surat",
        label: "Tujuan Surat",
        type: "select",
        required: true,
        options: ["Pindah sekolah", "Keperluan bank", "Daftar kuliah", "Instansi pemerintah", "Lainnya"],
      },
    ],
    requireManualNumber: true,
      active: true,
  },
  {
    code: "SKBM",
    name: "Surat Keterangan Belum Menikah",
    description: "Keterangan status belum menikah.",
    template:
      "Menerangkan bahwa {{name}} (NIK {{nik}}) sampai saat ini berstatus belum menikah, untuk keperluan {{tujuan_surat}}.{{#catatan_tambahan}} Catatan: {{catatan_tambahan}}.{{/catatan_tambahan}}",
    requiredFields: [
      {
        name: "tujuan_surat",
        label: "Tujuan Surat",
        type: "select",
        required: true,
        options: ["Melamar pekerjaan", "Mengurus pernikahan", "Melanjutkan studi", "Lainnya"],
      },
      {
        name: "catatan_tambahan",
        label: "Catatan Tambahan",
        type: "textarea",
        required: false,
        placeholder: "Isi jika ada keterangan khusus yang perlu dicantumkan",
      },
    ],
    requireManualNumber: true,
      active: true,
  },
  {
    code: "SKTM",
    name: "Surat Keterangan Tidak Mampu",
    description: "Keterangan tidak mampu untuk syarat bantuan/keringanan biaya.",
    template:
      "Menerangkan bahwa {{name}} (NIK {{nik}}) tergolong keluarga tidak mampu dengan penghasilan rata-rata Rp {{penghasilan}} per bulan dan {{jumlah_tanggungan}} tanggungan, untuk keperluan {{tujuan_surat}}.",
    requiredFields: [
      {
        name: "penghasilan",
        label: "Penghasilan per Bulan (Rp)",
        type: "number",
        required: true,
        placeholder: "Estimasi per bulan (dalam Rupiah)",
      },
      {
        name: "jumlah_tanggungan",
        label: "Jumlah Tanggungan",
        type: "number",
        required: true,
        placeholder: "Jumlah tanggungan keluarga",
      },
      {
        name: "kondisi_rumah",
        label: "Kondisi Rumah",
        type: "select",
        required: true,
        options: ["Permanen", "Semi permanen", "Tidak permanen"],
      },
      {
        name: "tujuan_surat",
        label: "Tujuan Surat",
        type: "select",
        required: true,
        options: ["Beasiswa", "BPJS gratis", "Bantuan sosial", "Keringanan biaya RS", "Lainnya"],
      },
    ],
    requireManualNumber: true,
      active: true,
  },
  {
    code: "SPN",
    name: "Surat Pengantar Nikah",
    description: "Surat pengantar nikah (Model N1-N4) ke KUA.",
    template:
      "Menerangkan bahwa {{name}} (NIK {{nik}}) akan melangsungkan pernikahan ke-{{urutan_pernikahan}} dengan {{nama_pasangan}} (NIK {{nik_pasangan}}) pada {{rencana_tgl_nikah}} di {{tempat_nikah}}, dicatatkan di {{kua_tujuan}}.",
    requiredFields: [
      { name: "nama_pasangan", label: "Nama Pasangan", type: "text", required: true },
      { name: "nik_pasangan", label: "NIK Pasangan", type: "text", required: true },
      { name: "tempat_lahir_psg", label: "Tempat Lahir Pasangan", type: "text", required: true },
      { name: "tgl_lahir_psg", label: "Tanggal Lahir Pasangan", type: "date", required: true },
      { name: "pekerjaan_psg", label: "Pekerjaan Pasangan", type: "text", required: true },
      { name: "alamat_pasangan", label: "Alamat Pasangan", type: "textarea", required: true },
      {
        name: "status_perkawinan",
        label: "Status Perkawinan",
        type: "select",
        required: true,
        options: ["Belum pernah menikah", "Duda/Janda cerai hidup", "Duda/Janda cerai mati"],
      },
      { name: "rencana_tgl_nikah", label: "Rencana Tanggal Nikah", type: "date", required: true },
      { name: "tempat_nikah", label: "Tempat Nikah", type: "text", required: true },
      { name: "kua_tujuan", label: "KUA Tujuan", type: "text", required: true },
      {
        name: "urutan_pernikahan",
        label: "Pernikahan Ke-",
        type: "number",
        required: true,
        placeholder: "Pernikahan ke-",
      },
    ],
    requireManualNumber: true,
      active: true,
  },
  {
    code: "SKH",
    name: "Surat Kehilangan",
    description: "Keterangan kehilangan dokumen/barang untuk laporan/penggantian.",
    template:
      "Menerangkan bahwa {{name}} (NIK {{nik}}) telah kehilangan {{jenis_barang}}{{#nomor_dokumen}} (No. {{nomor_dokumen}}){{/nomor_dokumen}} pada {{tanggal_hilang}} di {{lokasi_kejadian}}. Kronologi: {{kronologi}}. Surat ini dibuat untuk keperluan {{tujuan_surat}}.",
    requiredFields: [
      {
        name: "jenis_barang",
        label: "Jenis Barang yang Hilang",
        type: "select",
        required: true,
        options: ["KTP", "SIM", "STNK", "Buku tabungan", "Ijazah", "BPJS", "HP", "Lainnya"],
      },
      {
        name: "nomor_dokumen",
        label: "Nomor Dokumen",
        type: "text",
        required: false,
        placeholder: "Isi jika bernomor (NIK, No. SIM, dll)",
      },
      {
        name: "tanggal_hilang",
        label: "Tanggal Kehilangan",
        type: "date",
        required: true,
        placeholder: "Perkiraan tanggal kehilangan",
      },
      { name: "lokasi_kejadian", label: "Lokasi Kejadian", type: "text", required: true },
      {
        name: "kronologi",
        label: "Kronologi Kejadian",
        type: "textarea",
        required: true,
        placeholder: "Singkat dan jelas mengenai kejadian kehilangan",
      },
      {
        name: "tujuan_surat",
        label: "Tujuan Surat",
        type: "select",
        required: true,
        options: ["Laporan polisi", "Penggantian dokumen", "Lainnya"],
      },
    ],
    requireManualNumber: true,
      active: true,
  },
  {
    code: "SKM",
    name: "Surat Kematian",
    description: "Keterangan kematian warga untuk keperluan administrasi.",
    template:
      "Menerangkan bahwa {{nama_almarhum}} (NIK {{nik_almarhum}}) telah meninggal dunia pada {{tanggal_meninggal}}{{#waktu_meninggal}} pukul {{waktu_meninggal}}{{/waktu_meninggal}} di {{tempat_meninggal}}{{#nama_rs}} ({{nama_rs}}){{/nama_rs}}. Dilaporkan oleh {{name}} selaku {{hubungan_pelapor}}, untuk keperluan {{tujuan_surat}}.",
    requiredFields: [
      { name: "nama_almarhum", label: "Nama Almarhum/Almarhumah", type: "text", required: true },
      { name: "nik_almarhum", label: "NIK Almarhum/Almarhumah", type: "text", required: true },
      {
        name: "hubungan_pelapor",
        label: "Hubungan Pelapor dengan Almarhum",
        type: "select",
        required: true,
        options: ["Suami/Istri", "Anak", "Orang tua", "Saudara", "Lainnya"],
      },
      { name: "tanggal_meninggal", label: "Tanggal Meninggal", type: "date", required: true },
      {
        name: "waktu_meninggal",
        label: "Waktu Meninggal",
        type: "time",
        required: false,
        placeholder: "Format Jam (HH:MM)",
      },
      {
        name: "tempat_meninggal",
        label: "Tempat Meninggal",
        type: "select",
        required: true,
        options: ["Di rumah", "Di rumah sakit / klinik", "Di tempat lain"],
      },
      {
        name: "nama_rs",
        label: "Nama RS/Klinik",
        type: "text",
        required: false,
        placeholder: "Isi jika tempat meninggal di RS/Klinik",
      },
      { name: "penyebab_kematian", label: "Penyebab Kematian", type: "text", required: false },
      {
        name: "tujuan_surat",
        label: "Tujuan Surat",
        type: "select",
        required: true,
        options: ["Pengurusan warisan", "Klaim asuransi", "Administrasi bank", "Pensiun", "Lainnya"],
      },
    ],
    requireManualNumber: true,
      active: true,
  },
  {
    code: "SKL",
    name: "Surat Kelahiran",
    description: "Keterangan kelahiran untuk pengurusan akta/administrasi.",
    template:
      "Menerangkan bahwa telah lahir seorang anak {{jenis_kelamin}} bernama {{nama_bayi}}, anak ke-{{anak_ke}}, pada {{tanggal_lahir}} pukul {{waktu_lahir}} di {{tempat_lahir}}{{#nama_faskes}} ({{nama_faskes}}){{/nama_faskes}}, dari ibu {{nama_ibu}} (NIK {{nik_ibu}}).",
    requiredFields: [
      { name: "nama_bayi", label: "Nama Bayi", type: "text", required: true },
      {
        name: "jenis_kelamin",
        label: "Jenis Kelamin",
        type: "select",
        required: true,
        options: ["Laki-laki", "Perempuan"],
      },
      { name: "tanggal_lahir", label: "Tanggal Lahir", type: "date", required: true },
      {
        name: "waktu_lahir",
        label: "Waktu Lahir",
        type: "time",
        required: true,
        placeholder: "Format Jam (HH:MM)",
      },
      {
        name: "tempat_lahir",
        label: "Tempat Lahir",
        type: "select",
        required: true,
        options: ["Rumah", "RS / Klinik / Puskesmas", "Lainnya"],
      },
      {
        name: "nama_faskes",
        label: "Nama Faskes",
        type: "text",
        required: false,
        placeholder: "Isi jika tempat lahir di RS/Klinik",
      },
      {
        name: "anak_ke",
        label: "Anak Ke-",
        type: "number",
        required: true,
        placeholder: "Urutan kelahiran dalam keluarga",
      },
      {
        name: "berat_badan",
        label: "Berat Badan",
        type: "number",
        required: false,
        placeholder: "Dalam satuan gram",
      },
      {
        name: "penolong_lahir",
        label: "Penolong Kelahiran",
        type: "text",
        required: false,
        placeholder: "Nama dokter / bidan penolong",
      },
      { name: "nama_ibu", label: "Nama Ibu", type: "text", required: true },
      { name: "nik_ibu", label: "NIK Ibu", type: "text", required: true },
    ],
    requireManualNumber: true,
      active: true,
  },
];

// Daftar jabatan perangkat desa. category dipetakan ke positionCategories
// (Kaur = Kepala Urusan, Kasi = Kepala Seksi).
const SEED_POSITIONS: { name: string; category: string }[] = [
  { name: "Kepala Desa", category: "Kepala Desa" },
  { name: "Sekretaris Desa", category: "Sekretaris Desa" },
  { name: "Kaur Umum", category: "Kepala Urusan" },
  // { name: "Kaur Keuangan", category: "Kepala Urusan" },
  // { name: "Kaur Perencanaan", category: "Kepala Urusan" },
  // { name: "Kasi Pemerintahan", category: "Kepala Seksi" },
  // { name: "Kasi Kesejahteraan", category: "Kepala Seksi" },
  { name: "Kasi Pelayanan", category: "Kepala Seksi" },
  // { name: "Staff Umum", category: "Staff" },
  // { name: "Staf Kesejahteraan", category: "Staff" },
  // { name: "Staf Pemerintahan", category: "Staff" },
  { name: "Staf Pelayanan", category: "Staff" },
  // { name: "Staf Perencanaan", category: "Staff" },
  // { name: "Staf Keuangan", category: "Staff" },
];

// email slug dari nama jabatan, mis. "Kaur Keuangan" -> "kaur-keuangan@example.com"
const slugEmail = (name: string) =>
  `${name.toLowerCase().replace(/\s+/g, "-")}@example.com`;

async function seedLetterTypes() {
  console.log("🌱 Menyemai jenis surat...");
  for (const item of SEED_LETTER_TYPES) {
    const supportingDocs = SUPPORTING_DOCS[item.code] ?? [];
    const existing = await db
      .select()
      .from(letterTypes)
      .where(eq(letterTypes.code, item.code))
      .limit(1);

    // upsert: perbarui requiredFields/template bila kode sudah ada (skema bisa berubah).
    // templateDocx sengaja TIDAK di-set — re-seed tak boleh melepas template terunggah.
    if (existing[0]) {
      await db
        .update(letterTypes)
        .set({
          name: item.name,
          description: item.description,
          template: item.template,
          requiredFields: item.requiredFields,
          supportingDocs,
          active: item.active,
        })
        .where(eq(letterTypes.code, item.code));
      console.log(`🔄 ${item.code} — ${item.name} (diperbarui)`);
      continue;
    }

    await db.insert(letterTypes).values({ ...item, supportingDocs });
    console.log(`✅ ${item.code} — ${item.name}`);
  }
}

// Seed jabatan (idempotent by name) → kembalikan map name→id untuk relasi user.
async function seedPositions(): Promise<Map<string, string>> {
  console.log("🌱 Menyemai jabatan...");
  const byName = new Map<string, string>();
  for (const p of SEED_POSITIONS) {
    const existing = await db
      .select()
      .from(positions)
      .where(eq(positions.name, p.name))
      .limit(1);

    if (existing[0]) {
      byName.set(p.name, existing[0].id);
      console.log(`⏭️  ${p.name} sudah ada`);
      continue;
    }
    const [inserted] = await db
      .insert(positions)
      .values(p)
      .$returningId();
    byName.set(p.name, inserted.id);
    console.log(`✅ ${p.category} — ${p.name}`);
  }
  return byName;
}

// Seed akun contoh (idempotent by email). 1 admin (Kepala Desa), 1 user biasa,
// dan 1 staff per jabatan lainnya. Semua password: "password".
async function seedUsers(positionByName: Map<string, string>) {
  console.log("🌱 Menyemai akun contoh (password semua: 'password')...");
  const passwordHash = await hashPassword("password");
  const now = new Date();

  // profil lengkap default supaya akun langsung bisa dipakai (lolos isProfileComplete)
  const baseProfile = {
    password: passwordHash,
    religion: "islam" as const,
    address: "Desa Sangkima, Kec. Sangatta Selatan, Kutai Timur",
    birthday: new Date("1990-01-01"),
    placeOfBirth: "Sangkima",
    job: "Perangkat Desa",
    gender: "L" as const,
    telp: "081200000000",
    citizenship: "wni" as const,
    status: "Menikah" as const,
    education: "S1/Setara D4" as const,
    emailVerifiedAt: now,
  };

  type SeedUser = {
    name: string;
    email: string;
    role: "user" | "staff" | "admin";
    positionName: string | null;
  };

  const seedList: SeedUser[] = [
    { name: "Admin Desa", email: "admin@example.com", role: "admin", positionName: null },
    { name: "Warga Contoh", email: "user@example.com", role: "user", positionName: null },
    // 1 staff per jabatan selain Kepala Desa (dipakai akun admin)
    ...SEED_POSITIONS.filter((p) => p.name ).map<SeedUser>((p) => ({
      name: p.name,
      email: slugEmail(p.name),
      role: "staff",
      positionName: p.name,
    })),
  ];

  // NIK dummy 16 digit; base < Number.MAX_SAFE_INTEGER jadi penjumlahan tetap presisi
  let nik = 6408010101010000;
  for (const u of seedList) {
    nik += 1;
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, u.email))
      .limit(1);
    if (existing[0]) {
      console.log(`⏭️  ${u.email} sudah ada`);
      continue;
    }
    await db.insert(users).values({
      ...baseProfile,
      name: u.name,
      email: u.email,
      nik: String(nik),
      role: u.role,
      // warga biasa tidak terikat jabatan
      job: u.role === "user" ? "Wiraswasta" : baseProfile.job,
      positionId: u.positionName ? positionByName.get(u.positionName) : undefined,
      nip: u.role === "staff" ? `198001012010011${String(nik).slice(-3)}` : undefined,
    });
    console.log(`✅ ${u.role.padEnd(5)} — ${u.email}`);
  }
}

async function seed() {
  // await seedLetterTypes();
  const positionByName = await seedPositions();
  await seedUsers(positionByName);
  console.log("Selesai.");
  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Gagal seed:", err);
  process.exit(1);
});

