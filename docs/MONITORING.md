# Monitoring Infrastruktur & Uptime — Web Desa Sangkima

> Bagian **(B)** dari PRD AuditLog v0.2. **Ini konfigurasi, BUKAN koding.** Tak ada
> kode/aplikasi yang di-deploy dari repo ini untuk monitoring uptime — semuanya
> diatur lewat dashboard layanan pihak ketiga + Coolify.

Audit log aplikasi (bagian A) ada di dalam app ini (`/admin/audit`, tabel
`activity_logs`). Dokumen ini hanya soal **deteksi server down / resource kritis**.

## Prinsip: pengecek harus DI LUAR VPS

PRD (US-8, bagian 11) mewajibkan kanal alert **tidak bergantung pada VPS yang
sama**. Kalau Uptime Kuma di-deploy di VPS yang sama dengan web desa, saat VPS itu
mati total pengeceknya ikut mati → alert tak pernah terkirim. Karena itu:

- **Rekomendasi utama: pakai SaaS uptime eksternal** (mis. **UptimeRobot** free
  tier) sebagai pengecek "apakah seluruh server hidup". Sudah di luar infra kita
  by design.
- Uptime Kuma self-hosted **hanya** dipakai bila di-host di mesin/VPS terpisah,
  atau untuk cek internal (mis. port MySQL) yang tak perlu independen.

## 1. Pengecek eksternal (UptimeRobot / setara)

Buat akun di uptimerobot.com (gratis, cukup untuk skala ini), tambah monitor:

| Monitor | Tipe | Cek |
| --- | --- | --- |
| `https://desasangkima.cloud/` | HTTP(s) | Beranda publik 200, interval 5 mnt |
| `https://desasangkima.cloud/esurat` | HTTP(s) | Layanan surat hidup |
| `https://desasangkima.cloud/admin/login` | HTTP(s) | CMS hidup |
| SSL `desasangkima.cloud` | SSL/cert | Peringatan bila < 14 hari kedaluwarsa |

**Ambang alert:** down > 1 menit → kirim.

## 2. Kanal notifikasi: Telegram (bukan email)

Email tak dipakai karena bila VPS/email yang down, alert lewat email tak sampai.

1. Chat **@BotFather** di Telegram → `/newbot` → simpan **bot token**.
2. Buat grup (mis. "Alert Desa Sangkima"), masukkan bot, ambil **chat id**
   (lewat `@getidsbot` atau API `getUpdates`).
3. Di UptimeRobot: **My Settings → Add Alert Contact → Telegram**, isi token +
   chat id. Pasang alert contact ini ke semua monitor di atas.

> WhatsApp sengaja tidak dipakai di awal — butuh Business API/Twilio (berbayar &
> ribet). Telegram sudah memenuhi syarat "kanal di luar VPS".

## 3. Coolify bawaan (di dalam VPS, untuk resource internal)

Aktifkan notifikasi bawaan Coolify → arahkan ke **kanal Telegram yang sama**:

- **Disk usage > 85%** → kirim.
- **Container unhealthy** → kirim.
- **Status backup terjadwal** (gagal/sukses) → kirim.

Ini melengkapi pengecek eksternal: eksternal tahu "server hidup/mati dari luar",
Coolify tahu "resource internal & backup".

## 4. Backup & restore (NFR PRD bagian 10)

- Tabel `activity_logs` tinggal di DB yang sama → **ikut** backup Coolify.
- **Uji restore sekali** (bukan sekadar lihat status hijau) untuk memastikan log
  benar-benar bisa dipulihkan — ini yang memberi nilai "bukti objektif".

## 5. (Opsional, Fase 2) Error tracking

**Sentry** (SaaS, free tier) nyambung dengan `console.error` / konvensi `AppError`
yang sudah ada. Dipertimbangkan setelah MVP.

---

### Checklist go-live monitoring
- [ ] 3 monitor HTTP + 1 SSL di UptimeRobot aktif
- [ ] Bot Telegram + chat id tersambung sebagai alert contact
- [ ] Notifikasi Coolify (disk/container/backup) → Telegram
- [ ] Uji: matikan container sebentar → alert Telegram masuk ≤ 5 menit
- [ ] Uji restore backup DB sekali
- [ ] **Serah-terima:** tentukan penerima alert & peninjau log setelah masa
      maintenance 1 tahun (PRD bagian 13 — pertanyaan terbuka)
