# Web Desa Sangkima

Aplikasi web terpadu untuk Desa Sangkima yang berisi Web Profil publik, layanan E-Surat, dan CMS Admin dalam satu codebase Next.js.

## 📋 Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Tech Stack](#tech-stack)
- [Fitur Utama](#fitur-utama)
- [Setup Lokal](#setup-lokal)
- [Environment Variables](#environment-variables)
- [Database & Drizzle](#database--drizzle)
- [Seed & Bootstrap](#seed--bootstrap)
- [Project Structure](#project-structure)
- [Development Commands](#development-commands)
- [Dokumentasi API](#dokumentasi-api)
- [Troubleshooting](#troubleshooting)

## 🏡 Tentang Proyek

Repo ini memuat tiga bagian utama yang berbagi database dan design system yang sama:

1. **Web Profil publik** di route group `(profile)` untuk beranda, berita, galeri, PPID, produk, profil, statistik, struktur, kontak, dan layanan desa.
2. **E-Surat** di `/esurat/*` untuk login/register/OTP, pengajuan surat, approval staff → admin, PDF surat, dan verifikasi QR.
3. **CMS Admin** di `/admin/*` untuk mengelola konten web profil, pengguna CMS, galeri, layanan, produk, dan data terkait desa.

## 🛠 Tech Stack

- **Framework**: [Next.js 16.2](https://nextjs.org) dengan App Router
- **UI**: [React 19](https://react.dev) + Tailwind CSS v4
- **Bahasa**: [TypeScript](https://www.typescriptlang.org)
- **Database**: MySQL dengan [Drizzle ORM](https://orm.drizzle.team) + `mysql2`
- **Authentication**: JWT (`jose`) + cookie httpOnly
- **Password Hashing**: `bcrypt`
- **Validasi**: `zod`
- **Email**: `resend` dengan mode console untuk development
- **PDF & QR**: `pdf-lib` dan `qrcode`
- **API Docs**: Swagger/OpenAPI via `swagger-jsdoc` + `swagger-ui-react`
- **ID Generator**: `@paralleldrive/cuid2`

## ✨ Fitur Utama

- Web profil desa dengan berita, galeri foto/video, PPID, produk, profil, dan statistik.
- E-Surat dengan form pengajuan surat dinamis sesuai jenis surat.
- Alur approval surat dua tingkat untuk staf dan admin.
- Cetak surat PDF dan verifikasi melalui QR.
- CMS Admin untuk CRUD konten publik dan manajemen akun CMS.
- Upload file dokumen dan gambar dengan penyimpanan runtime di folder `uploads/`.
- Dokumentasi API interaktif untuk endpoint E-Surat.

## 🚀 Setup Lokal

### 1. Clone Repository

```bash
git clone <repository-url>
cd web-desa-sangkima
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Siapkan Database MySQL

Buat database baru, misalnya:

```sql
CREATE DATABASE db_websangkima;
```

### 4. Siapkan File Environment

Salin file environment lalu sesuaikan nilainya:

```bash
cp .env.example .env.local
```

Kalau belum ada `.env.example`, buat `.env.local` manual mengikuti bagian [Environment Variables](#environment-variables).

### 5. Jalankan Migration

```bash
npx drizzle-kit migrate
```

Kalau butuh sinkron cepat saat development, bisa pakai:

```bash
npx drizzle-kit push
```

### 6. Jalankan Server Development

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`.

## 🔧 Environment Variables

Berikut env yang dipakai oleh codebase saat ini.

### Database Runtime

Dipakai oleh koneksi aplikasi di `src/server/db/index.ts`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=db_websangkima
```

### Database Drizzle

Dipakai oleh `drizzle.config.ts` saat generate/migrate:

```env
DATABASE_URL=mysql://root:password@localhost:3306/db_websangkima
```

Kalau `DATABASE_URL` tidak diisi, Drizzle akan memakai fallback lokal bawaan config.

### Auth & App

```env
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_EXPIRES_IN=1h
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Email / OTP

Project ini memakai Resend, dengan mode console saat development.

```env
# mode development: email tidak benar-benar terkirim
EMAIL_MODE=console

# mode production / email sungguhan
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@desasangkima.com
```

Catatan:

- Kalau `EMAIL_MODE=console`, OTP dan reset link akan dicetak ke terminal.
- Kalau `RESEND_API_KEY` tidak diisi, aplikasi otomatis jatuh ke mode console.
- `RESEND_FROM_EMAIL` opsional, default-nya `onboarding@resend.dev`.

### Turnstile

Dipakai untuk proteksi form tertentu:

```env
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
```

### CMS Bootstrap & Maintenance

Dipakai untuk setup awal super admin dan endpoint migrasi manual:

```env
CMS_SETUP_TOKEN=some-secret-token
CMS_ADMIN_NAME=Administrator
CMS_ADMIN_EMAIL=admin@desasangkima.cloud
CMS_ADMIN_PASSWORD=StrongPassword123
MIGRATE_TOKEN=some-other-secret-token
```

### Contoh `.env.local`

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password123
DB_NAME=db_websangkima

DATABASE_URL=mysql://root:password123@localhost:3306/db_websangkima

JWT_SECRET=my_super_secret_jwt_key_min_32_chars_long
JWT_EXPIRES_IN=1h
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000

EMAIL_MODE=console
# RESEND_API_KEY=...
# RESEND_FROM_EMAIL=noreply@desasangkima.com

NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
# TURNSTILE_SECRET_KEY=...

# CMS bootstrap
# CMS_SETUP_TOKEN=...
# CMS_ADMIN_NAME=Administrator
# CMS_ADMIN_EMAIL=admin@desasangkima.cloud
# CMS_ADMIN_PASSWORD=StrongPassword123

# Manual migration endpoint
# MIGRATE_TOKEN=...
```

## 💾 Database & Drizzle

Schema database ada di `src/server/db/schema/` dan diekspor melalui `src/server/db/schema/index.ts`.

Tabel utama yang tersedia saat ini mencakup:

- `users`, `positions`, `user_tokens`
- `letter_types`, `letter_requests`, `letter_request_logs`
- `news`, `ppid`, `products`, `site_content`
- `cms_users`, `cms_user_tokens`
- `gallery` untuk album foto/video
- `rt_reports`

### Command Drizzle

```bash
# Generate migration dari perubahan schema
npx drizzle-kit generate

# Jalankan migration
npx drizzle-kit migrate

# Push schema langsung ke database
npx drizzle-kit push

# Buka Drizzle Studio
npx drizzle-kit studio
```

### Catatan Penting

- Aplikasi runtime membaca koneksi MySQL dari `DB_HOST`, `DB_USER`, `DB_PASSWORD`, dan `DB_NAME`.
- `drizzle-kit` membaca `DATABASE_URL` dari `drizzle.config.ts`.
- Karena itu, lokal development biasanya butuh dua set env tersebut sama-sama tersedia.

## 🌱 Seed & Bootstrap

### Seed jenis surat E-Surat

File `src/server/db/seed.ts` mengisi data awal jenis surat sesuai skema yang dipakai aplikasi.

Jalankan dengan:

```bash
npx tsx src/server/db/seed.ts
```

### Bootstrap Super Admin CMS

File `src/server/db/seedCms.ts` dipakai untuk membuat akun `super_admin` CMS pertama.

Contoh:

```bash
CMS_ADMIN_EMAIL=admin@desasangkima.cloud CMS_ADMIN_PASSWORD='rahasiaKuat123' npx tsx src/server/db/seedCms.ts
```

Kalau diperlukan, ada juga endpoint bootstrap sekali pakai di `/admin/api/setup` yang diamankan dengan `CMS_SETUP_TOKEN`.

## 📁 Project Structure

```text
src/
├── app/
│   ├── (profile)/              # Web profil publik
│   │   ├── berita/
│   │   ├── galeri/
│   │   ├── ppid/
│   │   ├── produk/
│   │   └── profil/
│   ├── admin/                  # CMS admin + setup API
│   │   ├── (panel)/
│   │   ├── api/
│   │   ├── login/
│   │   └── lupa-sandi/
│   ├── esurat/                 # E-Surat + API docs
│   │   ├── api/
│   │   ├── api-docs/
│   │   ├── dashboard/
│   │   ├── register/
│   │   ├── reset-password/
│   │   └── verify-otp/
│   ├── uploads/                # Route handler penyaji file upload
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── Toast.tsx
│   ├── ToastProvider.tsx
│   ├── esurat/
│   └── profile/
├── hooks/
├── lib/
└── server/
    ├── db/
    │   ├── index.ts
    │   ├── schema/
    │   ├── seed.ts
    │   └── seedCms.ts
    ├── middlewares/
    ├── repositories/
    ├── services/
    ├── types/
    └── utils/
```

## 🔨 Development Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npx tsc --noEmit
```

## 📖 Dokumentasi API

Swagger UI tersedia di:

```bash
http://localhost:3000/esurat/api-docs
```

API docs ini di-generate dari blok JSDoc `@swagger` di route E-Surat.

## 🐛 Troubleshooting

### Error database tidak tersambung

- Pastikan MySQL berjalan.
- Cek `DB_HOST`, `DB_USER`, `DB_PASSWORD`, dan `DB_NAME`.
- Jika pakai `drizzle-kit`, pastikan `DATABASE_URL` juga benar.

### OTP tidak terkirim

- Cek `EMAIL_MODE=console`; kalau mode ini aktif, OTP memang hanya muncul di terminal.
- Jika ingin email sungguhan, set `RESEND_API_KEY` dan `RESEND_FROM_EMAIL`.
- Pastikan `RESEND_API_KEY` valid dan akun Resend aktif.

### Reset password tidak sesuai domain

- Pastikan `NEXT_PUBLIC_APP_URL` diisi dengan domain yang benar.
- Kalau lokal, gunakan `http://localhost:3000`.

### JWT bermasalah

- Pastikan `JWT_SECRET` terisi dan cukup panjang.
- Cek `JWT_EXPIRES_IN`.
- Login ulang jika token sudah expired.

### Swagger tidak muncul

- Jalankan `npm run dev`.
- Buka `/esurat/api-docs`.
- Pastikan route API punya JSDoc `@swagger`.

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Zod](https://zod.dev)
- [Resend](https://resend.com/docs)
- [Swagger](https://swagger.io)

## 📄 License

Private project untuk Desa Sangkima.

## 👥 Support

Untuk pertanyaan atau issues, silakan hubungi tim development.
