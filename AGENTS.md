# @AGENTS.md

## Prinsip Pengembangan — BACA DULU SEBELUM MENGUBAH APA PUN

Proyek ini **sudah berjalan di produksi** (staging: https://desasangkima.cloud, deploy via Coolify) dan ditujukan untuk layanan warga desa sungguhan. Tugas di sini adalah **melanjutkan & mengembangkan sistem yang sudah ada, bukan menulis ulang.**

- **Pahami dulu, ubah kemudian.** Sebelum menambah/mengubah apa pun, telusuri file & pola yang sudah ada di domain terkait (alur `schema → repository → service → route/action → komponen`). Ikuti pola itu; jangan bikin gaya baru yang bersaing dengannya.
- **Perluas, jangan gantikan.** Tambah fitur sebagai *pendamping* dari yang sudah ada — contoh nyata: `galleryVideos` dibuat sebagai tabel terpisah di samping `galleryPhotos`, BUKAN merombak `galleryPhotos` jadi media polymorphic. Hindari refactor besar sistem yang sudah bekerja hanya demi "lebih rapi".
- **Jangan hapus/ubah perilaku yang sudah jalan** tanpa alasan kuat dan konfirmasi. Kalau sesuatu terlihat "aneh", cari tahu **kenapa** dulu — sering kali itu keputusan sengaja (biasanya ada komentar Indonesia yang menjelaskan invariannya).
- **Konsistensi > preferensi pribadi.** Pakai konvensi, styling (`globals.css`), util, dan struktur yang ditetapkan di dokumen ini, walau kamu terbiasa cara lain.
- **Verifikasi sebelum menyebut selesai.** `npx tsc --noEmit` dan `npm run lint` wajib bersih. Tidak ada test runner otomatis — untuk perubahan berdampak runtime, uji manual (`npm run dev`).

## Tentang Proyek

Web desa terpadu untuk **Desa Sangkima**, satu aplikasi Next.js berisi **tiga bagian** yang berbagi satu database, satu design system, dan pola layering yang sama:

1. **Web Profil publik** (route group `(profile)` di root `/`) — beranda, berita, galeri album (foto **dan** video), PPID/informasi publik, produk koperasi, profil/struktur/statistik desa. Awalnya dari desain Stitch.
2. **E-Surat** (`/esurat/*`) — layanan permohonan surat digital warga: login/register/OTP, ajukan surat, alur approval 2 tingkat staff→admin, terbit PDF + verifikasi QR.
3. **CMS Admin** (`/admin/*`) — panel kelola konten Web Profil. Akun CMS (`cms_users`, peran `super_admin`/`editor`) **terpisah** dari akun warga E-Surat.

## Tech Stack

- **Framework**: Next.js 16.2 (App Router, Turbopack) + React 19 — lihat `@AGENTS.md`, versi ini punya breaking changes dari training data, cek `node_modules/next/dist/docs/` sebelum mengasumsikan API lama.
- **Bahasa**: TypeScript, `strict: true` di `tsconfig.json`. Alias `@/*` → `src/*`.
- **Database**: MySQL via `drizzle-orm` (mysql2 driver, connection pool global di `src/server/db/index.ts`). Schema di `src/server/db/schema/*`.
- **Auth**: JWT (`jose`) disimpan di cookie httpOnly `access_token`; password di-hash dengan `bcrypt`.
- **Validasi**: Zod — schema & DTO type digabung dalam satu file per domain di `src/server/types/*.ts` (bukan folder `validations/` terpisah, walau README menyebutkannya).
- **Email**: Nodemailer, dual mode lewat env `EMAIL_MODE` (`console` untuk dev — OTP tampil di terminal, `smtp` untuk kirim sungguhan).
- **PDF & QR**: `pdf-lib` (terbit surat) dan `qrcode` (kode verifikasi).
- **API Docs**: Swagger UI di `/esurat/api-docs`, di-generate dari blok JSDoc `@swagger` di atas tiap `route.ts`.
- **Styling**: Tailwind CSS v4. Design system "arsip resmi desa" custom di `src/app/globals.css` — token warna (`paper`, `ink`, `inkmut`, `pine-*`, `brass`, `oxide`) dan utility class (`card-doc`, `label-doc`, `input-doc`, `btn-primary`/`btn-outline`/`btn-danger`, `overline-doc`, animasi `rise-in`). **Selalu pakai class ini, jangan bikin styling baru yang meniru ulang.**
- **Notifikasi UI**: `ToastProvider`/`useToast` custom (bukan library pihak ketiga) di `src/components/`.
- **ID**: `@paralleldrive/cuid2` untuk primary key string.

## Perintah Pengembangan

```bash
npm run dev      # dev server (Turbopack)
npm run build    # production build (juga menjalankan typecheck Next.js)
npm run start    # jalankan hasil build
npm run lint     # eslint (flat config: eslint-config-next core-web-vitals + typescript)
npx tsc --noEmit # typecheck manual cepat (tidak ada script npm khusus untuk ini)
```

Database (tidak ada wrapper npm script — pakai `drizzle-kit` langsung, config di `drizzle.config.ts`):

```bash
npx drizzle-kit generate   # generate migration dari perubahan schema
npx drizzle-kit migrate    # jalankan migration
npx drizzle-kit push       # push schema langsung (dev cepat, tanpa file migration)
npx drizzle-kit studio     # GUI database
```

Tidak ada test runner terpasang di proyek ini (tidak ada Jest/Vitest, tidak ada file `*.test.*`) — jangan asumsikan ada `npm test`.

## Arsitektur

### Layering backend (API routes)

```
route.ts (Next.js API route + JSDoc @swagger)
   ↓ requireRole(req, [...roles])      ← src/server/middlewares/acl.middleware.ts
   ↓ service.*(...)                     ← src/server/services/*.service.ts (business logic, validasi Zod, aturan transisi status)
   ↓ repository.*(...)                  ← src/server/repositories/*.repository.ts (query Drizzle, return row mentah/joined)
   ↓ db                                 ← src/server/db (Drizzle + mysql2 pool)
```

Setiap `route.ts` membungkus handler dengan `try/catch`: `ACLError` (dari `requireRole`) → `handleACLError()` (401/403), `z.ZodError` → 400 dengan `error.flatten().fieldErrors`, lainnya → 400/404/500 generik. Response selalu `{ success, message, data? }`.

### Dua jalur pembaca sesi — jangan disatukan

- `getAuthUser(req)` (`src/server/middlewares/role.middleware.ts`) — untuk **API routes**. Baca token dari header `Authorization: Bearer` lebih dulu, fallback ke cookie.
- `getSessionUser()` (`src/server/utils/session.ts`) — untuk **Server Component** (page/layout dashboard). Baca cookie `access_token` langsung lewat `next/headers`, tanpa HTTP round-trip.

Keduanya **selalu** mengambil ulang `role` dari database (bukan dari payload JWT) karena JWT hanya menyimpan id/email/nik — role bisa berubah setelah token diterbitkan, dan akun yang di-*soft-delete* (`deletedAt`) harus langsung tertolak meski token masih berlaku.

### Repository vs Service

Repository mengembalikan baris Drizzle mentah (kadang hasil `innerJoin`, lihat pola `joinedQuery()` di `letterRequest.repository.ts`). Service yang membentuk DTO publik (`LetterRequestDTO`, dst. di `src/server/types/letter.ts`) dan menegakkan aturan bisnis (mis. alur status `DIAJUKAN→DIPROSES→DISETUJUI→SELESAI`/`DITOLAK`, siapa boleh approve). **Jangan taruh aturan bisnis di repository atau di route handler.**

### Frontend: Server vs Client Component

Halaman dashboard (`src/app/esurat/dashboard/**/page.tsx`) adalah Server Component yang `await getSessionUser()` lalu fetch data lewat service **langsung** (bukan lewat `fetch()` ke API sendiri) — hanya komponen yang benar-benar butuh interaktivitas (state, `useEffect`, event handler) yang diberi `"use client"`. Lihat `src/app/esurat/dashboard/permohonan/[id]/page.tsx` dan `PermohonanActions.tsx` sebagai contoh pasangan Server shell + Client island.

Penempatan komponen frontend mengikuti dua kategori:
- **`src/components/esurat/*`** — komponen presentasional yang dipakai lintas halaman (mis. `StatusBadge`, `FormField`, `PageHeader`, `LetterDetailCard`). Server Component kecuali memang mengandung hook/handler sendiri (mis. `FormField`, `FileDropzone`).
- **Co-located di sebelah `page.tsx`** — controller spesifik satu route yang terikat ke satu alur bisnis (mis. `ToggleActiveButton.tsx`, `PermohonanActions.tsx`, `RejectionPanel.tsx`, `DynamicLetterFields.tsx`). Jangan dipindah ke `src/components` hanya karena "terlihat reusable" — pindahkan hanya kalau benar-benar dipakai lebih dari satu halaman.

Hook bersama di `src/hooks/`: `useToast` (notifikasi) dan `useSubmitAction` (konsolidasi pola `busy state → fetch → toast sukses/gagal`, dipakai komponen client yang melakukan mutasi). Jangan paksakan `useSubmitAction` pada alur yang punya percabangan non-generik (mis. redirect khusus berdasarkan kode error tertentu) — biarkan komponen itu pakai fetch manual agar perilakunya tetap eksplisit.

### Web Profil & CMS (pola layering sama, hanya sesi & mutasi beda)

Bagian Web Profil publik dan CMS Admin memakai layering identik dengan E-Surat (`schema → repository → service → …`). Perbedaannya:

- **Sesi CMS terpisah dari sesi warga.** `getCmsUser()` / `requireCmsUser()` / `requireSuperAdmin()` di `src/server/utils/cmsSession.ts` (cookie `cms_session`, tabel `cms_users`). Jangan campur dengan `getSessionUser()`/`getAuthUser()` milik E-Surat.
- **Mutasi CMS lewat Server Action, bukan API route.** Tiap modul CMS punya `actions.ts` co-located (mis. `src/app/admin/(panel)/album/actions.ts`), pakai `requireCmsUser()`, return bentuk `{ success, message }` (tipe `AlbumResult` dst.), lalu `revalidatePath(...)` + `router.refresh()` di klien.
- **Domain**: `news` (berita), galeri = `galleryAlbums`/`galleryPhotos`/`galleryVideos`, `ppidDocuments`, `products`, plus konten teks generik lewat registry `siteContent`. Semua mengikuti pola yang sama — cari domain terdekat sebagai contoh sebelum menambah yang baru.
- **Upload berkas**: gambar via `saveProfileImage()` (`imageUpload.ts`), dokumen via `saveDocument()` (`documentUpload.ts`). Berkas disimpan **DI LUAR `public/`** (folder `uploads/` di root) dan disajikan lewat route handler `src/app/uploads/**/route.ts`, **bukan** static file Next.js (alasan: lihat "Realitas Deployment"). Saat menghapus konten, **hapus juga file fisiknya** (`deleteProfileImage`/`deleteDocument`) — jangan hanya hapus baris DB.
- **Video galeri** = referensi eksternal YouTube/Instagram (tabel `galleryVideos`), tidak diunggah ke server — URL di-parse via `parseVideoUrl()`, playback via embed.

## Realitas Deployment & Operasional (jangan diabaikan — sudah menyebabkan bug nyata)

Deploy ke **Coolify** (VPS Hostinger Debian, build Nixpacks, MySQL & app dalam container terpisah). Push ke branch `staging` memicu auto-redeploy. Hal-hal yang WAJIB dijaga:

- **Kode ≠ data.** `git push`/redeploy hanya mengirim **kode**. Isi database dan file di `uploads/` **tidak** ikut. Konten CMS diisi di produksi atau dimigrasi terpisah (mysqldump + copy file).
- **Folder `uploads/` HARUS berupa persistent volume** (`/app/uploads` di Coolify). Tanpa itu, setiap redeploy menghapus semua foto/dokumen yang diunggah. Inilah alasan berkas disimpan di `uploads/` (bukan `public/` yang di-snapshot saat build) dan disajikan lewat route handler.
- **Schema DB produksi di-update manual** saat ada tabel/kolom baru — jalankan `npx drizzle-kit push` ke DB produksi **sebelum** fitur dipakai, kalau tidak halaman terkait crash (pernah terjadi pada `gallery_videos`).
- **`EMAIL_MODE=smtp`** wajib di produksi, kalau `console` warga tak menerima OTP dan tak bisa daftar.
- **Base URL / QR** harus domain produksi (bukan `localhost`), kalau tidak verifikasi surat rusak.
- **Super admin CMS pertama** tidak dibuat oleh seed biasa — pakai `src/server/db/seedCms.ts` atau endpoint setup sekali-pakai.
- **Tailwind v4 membungkus semua varian `hover:`/`group-hover:` di `@media (hover: hover)`** → efek hover mati di perangkat sentuh (`hover: none`). Untuk reveal-on-hover yang tetap jalan di layar sentuh, pakai CSS eksplisit (lihat `.thumb-actions` di `globals.css`), bukan utility `group-hover:` Tailwind.

Checklist lengkap sebelum go-live ada di `docs/TESTING-DEPLOYMENT.md`.

## Struktur Folder

```
src/
├── app/
│   ├── (profile)/               # Web Profil publik (root /): beranda, berita, galeri, ppid, produk, dll
│   ├── admin/                   # CMS: login/ + (panel)/<modul>/ (page.tsx + actions.ts + form co-located) + api/upload*
│   ├── esurat/                  # E-Surat: auth, dashboard, api/ (route + JSDoc @swagger)
│   │   ├── api/                 # API routes (auth, letter-requests, letter-types, users, position)
│   │   ├── dashboard/           # halaman ber-sesi: ajukan, jenis-surat, permohonan, surat
│   │   ├── register/, verify-otp/, verifikasi/[code]/, api-docs/
│   │   ├── LoginForm.tsx, page.tsx
│   ├── uploads/                 # route handler penyaji berkas upload (bukan static public/)
│   ├── layout.tsx, page.tsx, globals.css
├── components/
│   ├── Toast.tsx, ToastProvider.tsx     # sistem notifikasi global
│   ├── esurat/                          # komponen domain E-Surat lintas-halaman
│   │   └── auth/                        # shell layout halaman auth (AuthSplitLayout, AuthFormHeader)
│   └── profile/                         # komponen Web Profil (AlbumLightbox, YoutubeEmbed, InstagramEmbed, dll)
├── hooks/                        # useToast, useSubmitAction
├── lib/                          # format.ts (formatTanggal/formatTanggalWaktu), swagger.ts, uploadLimits.ts
└── server/
    ├── db/                       # koneksi Drizzle + schema/ + seed.ts (E-Surat) + seedCms.ts (super admin CMS)
    ├── middlewares/              # role.middleware.ts (getAuthUser), acl.middleware.ts (requireRole)
    ├── repositories/             # akses data per domain (E-Surat + web profil/CMS)
    ├── services/                 # logika bisnis + DTO shaping per domain
    ├── types/                    # Zod schema + TypeScript type per domain (gabung, bukan terpisah)
    └── utils/                    # session.ts, cmsSession.ts, jwt.ts, hash.ts, otp.ts, letter-number.ts, upload.ts, imageUpload.ts, documentUpload.ts, serveUpload.ts
```

Folder `uploads/` (root proyek, di-gitignore) = tempat berkas terunggah disimpan di runtime; **wajib** dipetakan ke persistent volume di produksi (lihat "Realitas Deployment").

`src/controllers/` ada tapi kosong — sisa struktur lama, jangan dipakai untuk kode baru.

## Aturan Penulisan Kode

- **TypeScript strict, hindari `any`.** ESLint (`@typescript-eslint/no-explicit-any`) menandainya sebagai error. Untuk `catch`, pakai `catch (err)` lalu narrow dengan `err instanceof Error`, atau definisikan tipe response API (lihat pola `ApiResponseJson` di `useSubmitAction.ts`) daripada `any`.
- **Reuse dulu sebelum bikin baru.** Sebelum menambah style/komponen, cek `globals.css` (class `.card-doc`/`.input-doc`/dll), `src/components/esurat/`, dan `src/lib/format.ts` — jangan duplikasi pola yang sudah ada (label+input+error → `FormField`, fetch+toast+busy → `useSubmitAction`, tabel/list surat → komponen yang sudah ada di `components/esurat`).
- **`"use client"` hanya saat benar-benar perlu** (state, efek, browser API, event handler langsung). Komponen presentasional murni dibiarkan Server Component agar tidak menambah bundle JS tanpa alasan.
- **Validasi input selalu lewat Zod**, schema didefinisikan di `src/server/types/<domain>.ts` dan dipakai ulang baik di service maupun (kalau perlu) di form client — jangan menulis validasi manual ber-regex di tempat lain kecuali memang validasi client-side ringan yang meniru aturan Zod (lihat `validateField()` di `RegisterForm.tsx` untuk contoh yang sudah ada).
- **Komentar berbahasa Indonesia, singkat, dan hanya untuk hal yang tidak jelas dari kode** (alasan non-obvious, workaround, invariant tersembunyi) — gaya ini sudah konsisten di seluruh codebase, ikuti, jangan tulis komentar yang menjelaskan ulang nama variabel/fungsi yang sudah jelas.
- **Response API konsisten**: selalu `{ success: boolean, message: string, data?, errors? }`. Status code: 400 untuk Zod/validasi, 401 untuk token invalid, 403 untuk role salah, 404 untuk resource tidak ditemukan/tidak berhak.
- **Soft delete**: cek `deletedAt` di tempat user/akun diambil ulang (jangan asumsikan baris yang ditemukan otomatis aktif).
- **Penamaan file komponen PascalCase** (`LetterDetailCard.tsx`), file non-komponen (service/repository/util) camelCase dengan akhiran peran (`*.service.ts`, `*.repository.ts`, `*.middleware.ts`).

## Panduan Komponen & Data Fetching

1. **Di halaman dashboard (Server Component)**: ambil sesi dengan `getSessionUser()`, redirect kalau `null`/role salah, lalu panggil service **langsung** (`letterRequestService.listAll()`, dst.) — jangan `fetch()` ke API sendiri dari Server Component, itu cuma menambah latency tanpa manfaat.
2. **Komponen interaktif (form, tombol aksi)**: `"use client"`, mutasi lewat `fetch()` ke `/esurat/api/...`, pakai `useSubmitAction` untuk pola busy/toast standar, lalu `router.refresh()` (bukan reload manual) supaya Server Component di atasnya re-fetch data terbaru.
3. **Form field baru**: pakai `<FormField>` (`src/components/esurat/FormField.tsx`) — sudah mendukung `text/email/password/number/date/textarea/select`, error styling, dan slot `labelAction`/`labelClassName`/`inputClassName` untuk kasus custom. Jangan menulis ulang markup `label-doc`+`input-doc`+pesan error secara manual.
4. **Komponen baru yang menampilkan data domain (surat/letter type/user)**: terima DTO dari `src/server/types/*.ts` lewat props, jangan import service/repository di komponen client.
5. **Slot aksi di halaman detail**: gunakan pola `children` (lihat `LetterDetailCard`) untuk menyisipkan tombol aksi yang berbeda per halaman, bukan prop konfigurasi object yang membesar.
6. **Sebelum menambah komponen baru**, tentukan dulu: dipakai lebih dari satu halaman? → `src/components/esurat/`. Spesifik satu alur/route? → co-locate di sebelah `page.tsx`-nya.
