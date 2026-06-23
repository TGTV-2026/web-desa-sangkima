# Dokumentasi Skema Input & Persyaratan E-Surat Desa

Field "keperluan / tujuan surat" wajib ada di semua surat

---
Step 1 — Data pemohon: NIK diinput → sistem auto-fill nama, alamat, dll. dari database

Step 2 — Field spesifik surat: hanya tampilkan field tambahan sesuai jenis surat yang dipilih


## 1. Surat Keterangan Usaha (SKU)

### Form Input
| Nama Field | Tipe Data | Status | Pilihan / Catatan |
| :--- | :--- | :--- | :--- |
| `nama_usaha` | Teks | **Wajib** | - |
| `jenis_usaha` | Pilihan | **Wajib** | Perdagangan, Jasa, Pertanian, Peternakan, Kerajinan, Lainnya |
| `alamat_usaha` | Teks Panjang | **Wajib** | Isi jika berbeda dari alamat KTP |
| `tujuan_surat` | Pilihan | **Wajib** | Pengajuan kredit/KUR, Perizinan usaha, BPJS Ketenagakerjaan, Lainnya |

### Dokumen Pendukung (Upload)
* Fotokopi KTP pemohon
* Fotokopi Kartu Keluarga (KK)
* Surat Pengantar RT/RW
* Surat Permohonan
* Foto / bukti lokasi usaha

---

## 2. SK Domisili

### Form Input
| Nama Field | Tipe Data | Status | Pilihan / Catatan |
| :--- | :--- | :--- | :--- |
| `alamat_domisili` | Teks Panjang | **Wajib** | Isi jika berbeda dari alamat di KTP |
| `tanggal_domisili` | Tanggal | **Wajib** | Berdomisili sejak (Bulan/Tahun) |
| `tujuan_surat` | Pilihan | **Wajib** | Pindah sekolah, Keperluan bank, Daftar kuliah, Instansi pemerintah, Lainnya |

### Dokumen Pendukung (Upload)
* Fotokopi KTP pemohon
* Fotokopi Kartu Keluarga (KK)
* Surat Pengantar RT/RW
* Surat Permohonan

---

## 3. SK Belum Menikah

### Form Input
| Nama Field | Tipe Data | Status | Pilihan / Catatan |
| :--- | :--- | :--- | :--- |
| `tujuan_surat` | Pilihan | **Wajib** | Melamar pekerjaan, Mengurus pernikahan, Melanjutkan studi, Lainnya |
| `catatan_tambahan`| Teks Panjang | Opsional | Isi jika ada keterangan khusus yang perlu dicantumkan |

### Dokumen Pendukung (Upload)
* Fotokopi KTP pemohon
* Fotokopi Kartu Keluarga (KK)
* Surat Pengantar RT/RW
* Surat Permohonan
* Akta Kelahiran (jika ada)

---

## 4. SK Tidak Mampu (SKTM)

### Form Input
| Nama Field | Tipe Data | Status | Pilihan / Catatan |
| :--- | :--- | :--- | :--- |
| `penghasilan` | Angka | **Wajib** | Estimasi per bulan (dalam Rupiah) |
| `jumlah_tanggungan`| Angka | **Wajib** | Jumlah tanggungan keluarga |
| `kondisi_rumah` | Pilihan | **Wajib** | Permanen, Semi permanen, Tidak permanen |
| `tujuan_surat` | Pilihan | **Wajib** | Beasiswa, BPJS gratis, Bantuan sosial, Keringanan biaya RS, Lainnya |

### Dokumen Pendukung (Upload)
* Fotokopi KTP pemohon
* Fotokopi Kartu Keluarga (KK)
* Surat Pengantar RT/RW
* Surat Permohonan
* Foto kondisi rumah (Opsional)

---

## 5. Surat Pengantar Nikah (Model N1-N4)

### Form Input
| Nama Field | Tipe Data | Status | Pilihan / Catatan |
| :--- | :--- | :--- | :--- |
| **Data Pasangan:** | | | |
| `nama_pasangan` | Teks | **Wajib** | - |
| `nik_pasangan` | Teks | **Wajib** | - |
| `tempat_lahir_psg` | Teks | **Wajib** | - |
| `tgl_lahir_psg` | Tanggal | **Wajib** | - |
| `pekerjaan_psg` | Teks | **Wajib** | - |
| `alamat_pasangan` | Teks Panjang | **Wajib** | - |
| `status_perkawinan`| Pilihan | **Wajib** | Belum pernah menikah, Duda/Janda cerai hidup, Duda/Janda cerai mati |
| **Data Pernikahan:** | | | |
| `rencana_tgl_nikah`| Tanggal | **Wajib** | - |
| `tempat_nikah` | Teks | **Wajib** | - |
| `kua_tujuan` | Teks | **Wajib** | - |
| `urutan_pernikahan`| Angka | **Wajib** | Pernikahan ke- |

### Dokumen Pendukung (Upload)
* Fotokopi KTP pemohon & calon pasangan
* Fotokopi Kartu Keluarga (KK)
* Akta Kelahiran pemohon
* Surat Pengantar RT/RW
* Surat Permohonan
* Pas Foto 2x3 dan 3x4
* Akta Cerai / Surat Kematian (Wajib jika status Duda/Janda)

---

## 6. Surat Kehilangan

### Form Input
| Nama Field | Tipe Data | Status | Pilihan / Catatan |
| :--- | :--- | :--- | :--- |
| `jenis_barang` | Pilihan | **Wajib** | KTP, SIM, STNK, Buku tabungan, Ijazah, BPJS, HP, Lainnya |
| `nomor_dokumen` | Teks | Opsional | Isi jika bernomor (NIK, No. SIM, dll) |
| `tanggal_hilang` | Tanggal | **Wajib** | Perkiraan tanggal kehilangan |
| `lokasi_kejadian` | Teks | **Wajib** | - |
| `kronologi` | Teks Panjang | **Wajib** | Singkat dan jelas mengenai kejadian kehilangan |
| `tujuan_surat` | Pilihan | **Wajib** | Laporan polisi, Penggantian dokumen, Lainnya |

### Dokumen Pendukung (Upload)
* Fotokopi KTP pemohon
* Fotokopi Kartu Keluarga (KK)
* Surat Pengantar RT/RW
* Surat Permohonan
* Deskripsi / Bukti pendukung terkait barang yang hilang

---

## 7. Surat Kematian

### Form Input
| Nama Field | Tipe Data | Status | Pilihan / Catatan |
| :--- | :--- | :--- | :--- |
| **Data Almarhum:** | | | |
| `nama_almarhum` | Teks | **Wajib** | - |
| `nik_almarhum` | Teks | **Wajib** | - |
| `hubungan_pelapor` | Pilihan | **Wajib** | Suami/Istri, Anak, Orang tua, Saudara, Lainnya |
| `tanggal_meninggal`| Tanggal | **Wajib** | - |
| `waktu_meninggal` | Waktu | Opsional | Format Jam (HH:MM) |
| `tempat_meninggal` | Pilihan | **Wajib** | Di rumah, Di rumah sakit / klinik, Di tempat lain |
| `nama_rs` | Teks | Opsional | Isi jika tempat meninggal di RS/Klinik |
| `penyebab_kematian`| Teks | Opsional | - |
| **Keperluan:** | | | |
| `tujuan_surat` | Pilihan | **Wajib** | Pengurusan warisan, Klaim asuransi, Administrasi bank, Pensiun, Lainnya |

### Dokumen Pendukung (Upload)
* Fotokopi KTP almarhum/almarhumah
* Fotokopi Kartu Keluarga (KK)
* Surat Pengantar RT/RW
* Surat Permohonan dari keluarga
* Surat Keterangan Kematian dari instansi medis (Dokter/Bidan/Puskesmas)

---

## 8. Surat Kelahiran

### Form Input
| Nama Field | Tipe Data | Status | Pilihan / Catatan |
| :--- | :--- | :--- | :--- |
| **Data Bayi:** | | | |
| `nama_bayi` | Teks | **Wajib** | - |
| `jenis_kelamin` | Pilihan | **Wajib** | Laki-laki, Perempuan |
| `tanggal_lahir` | Tanggal | **Wajib** | - |
| `waktu_lahir` | Waktu | **Wajib** | Format Jam (HH:MM) |
| `tempat_lahir` | Pilihan | **Wajib** | Rumah, RS / Klinik / Puskesmas, Lainnya |
| `nama_faskes` | Teks | Opsional | Isi jika tempat lahir di RS/Klinik |
| `anak_ke` | Angka | **Wajib** | Urutan kelahiran dalam keluarga |
| `berat_badan` | Angka | Opsional | Dalam satuan gram |
| `penolong_lahir` | Teks | Opsional | Nama dokter / bidan penolong |
| **Data Orang Tua:** | | | |
| `nama_ibu` | Teks | **Wajib** | - |
| `nik_ibu` | Teks | **Wajib** | - |

### Dokumen Pendukung (Upload)
* Fotokopi KTP orang tua
* Fotokopi Kartu Keluarga (KK)
* Surat Pengantar RT/RW
* Surat Keterangan Lahir dari penolong (Bidan/RS/Puskesmas)
* Surat Permohonan
* Buku Nikah / Surat Nikah orang tua