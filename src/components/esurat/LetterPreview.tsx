"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { UserDTO } from "@/server/types/user";

interface LetterPreviewProps {
  requestId: string;
  // true jika surat sudah DISETUJUI/SELESAI (tampilkan tombol unduh PDF resmi).
  issued: boolean;
  // true jika surat sudah DIPROSES/DISETUJUI/SELESAI (tampilkan tombol cetak basah).
  canDownloadNoSig?: boolean;
  // Berubah saat data surat berubah → paksa iframe muat ulang (mis. staff edit isian).
  refreshKey: string;
}

export default function LetterPreview({
  requestId,
  issued,
  canDownloadNoSig,
  refreshKey,
}: LetterPreviewProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // State untuk modal pemilihan penandatangan
  const [showSignatoryModal, setShowSignatoryModal] = useState(false);
  const [staffList, setStaffList] = useState<UserDTO[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [selectedSignatoryId, setSelectedSignatoryId] = useState("");

  const previewUrl = `/esurat/api/letter-requests/${requestId}/preview`;
  const pdfUrl = `/esurat/api/letter-requests/${requestId}/pdf`;

  useEffect(() => setMounted(true), []);

  // Kunci scroll latar saat modal terbuka + tutup dengan Esc.
  useEffect(() => {
    if (!open && !showSignatoryModal) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && (showSignatoryModal ? setShowSignatoryModal(false) : setOpen(false));
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, showSignatoryModal]);

  const handleOpenSignatoryModal = async () => {
    setShowSignatoryModal(true);
    if (staffList.length === 0) {
      setLoadingStaff(true);
      try {
        const res = await fetch("/esurat/api/users?role=staff&limit=100");
        const json = await res.json();
        if (json.success) {
          const approvers = json.data.filter((u: UserDTO) => {
            const pos = (u.positionName || "").toLowerCase();
            return pos.includes("kepala desa") || pos.includes("sekretaris desa") || pos.includes("sekdes");
          });
          setStaffList(approvers);
          if (approvers.length > 0) setSelectedSignatoryId(approvers[0].id);
        }
      } catch (err) {
        console.error("Gagal mengambil daftar staff", err);
      } finally {
        setLoadingStaff(false);
      }
    }
  };

  const renderNoSigButton = (className: string, title?: string) => {
    if (!canDownloadNoSig) return null;
    
    if (issued) {
      return (
        <a
          href={`${pdfUrl}?nosig=1`}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
          title={title}
        >
          {title || "Cetak Tanpa Tanda Tangan"}
        </a>
      );
    }
    
    return (
      <button
        type="button"
        onClick={handleOpenSignatoryModal}
        className={className}
        title={title}
      >
        {title || "Cetak Tanpa Tanda Tangan"}
      </button>
    );
  };

  return (
    <div>
      <p className="label-doc">{issued ? "Surat Terbit" : "Pratinjau Surat"}</p>

      {/* Thumbnail */}
      <div className="relative mt-3 group">
        <iframe
          key={refreshKey}
          src={previewUrl}
          title="Pratinjau surat"
          className="w-full aspect-[210/297] border border-line rounded-sm bg-paper2/20 pointer-events-none"
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Perbesar pratinjau surat"
          className="absolute inset-0 flex items-end justify-center rounded-sm transition-colors hover:bg-ink/5"
        >
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-pine-900 px-4 py-2 text-xs font-semibold text-paper opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            Perbesar
          </span>
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-outline w-full text-center"
        >
          Lihat Surat
        </button>
        {(issued || canDownloadNoSig) && (
          <div className="flex flex-col gap-2 mt-2">
            {issued && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full text-center"
              >
                Unduh Surat (PDF)
              </a>
            )}
            {renderNoSigButton("btn-outline w-full text-center text-xs text-ink/70")}
          </div>
        )}
      </div>

      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[9990] flex items-center justify-center bg-black/60 p-3 antialiased sm:p-6"
            onClick={() => setOpen(false)}
          >
            <div
              className="flex h-full max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-inkmut">
                    {issued ? "Surat Resmi" : "Pratinjau — belum resmi"}
                  </p>
                  <h3 className="font-serif text-lg text-ink">Pratinjau Surat</h3>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline hidden text-xs sm:inline-flex"
                  >
                    Buka di tab baru
                  </a>
                  {(issued || canDownloadNoSig) && (
                    <>
                      {renderNoSigButton("btn-outline hidden text-xs sm:inline-flex text-ink/70", "Cetak Basah")}
                      {issued && (
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-xs"
                        >
                          Unduh
                        </a>
                      )}
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="p-2 text-2xl leading-none text-inkmut transition-colors hover:text-ink"
                    title="Tutup"
                    aria-label="Tutup"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-paper2/30">
                <iframe
                  key={refreshKey}
                  src={previewUrl}
                  title="Pratinjau surat layar penuh"
                  className="h-full w-full"
                />
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Modal Pemilihan Penandatangan */}
      {mounted && showSignatoryModal && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 antialiased"
          onClick={() => setShowSignatoryModal(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-xl bg-paper shadow-2xl rise-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-line bg-paper2/30">
              <h3 className="font-serif text-xl font-medium tracking-tight text-ink">
                Pilih Penandatangan
              </h3>
              <p className="text-[13px] leading-relaxed text-inkmut mt-1.5">
                Nama dan NIP akan dicetak di lembar pengesahan agar bisa langsung ditandatangani basah.
              </p>
            </div>

            <div className="p-6">
              {loadingStaff ? (
                <div className="flex flex-col items-center justify-center py-6 gap-3">
                  <div className="w-6 h-6 border-2 border-pine-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-inkmut font-medium">Memuat data staf...</p>
                </div>
              ) : staffList.length === 0 ? (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-100 flex items-start gap-3">
                  <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p>Tidak ada staf dengan jabatan Kepala Desa atau Sekdes. Harap tambahkan di halaman Kelola Pengguna.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {staffList.map((u) => {
                    const isSelected = selectedSignatoryId === u.id;
                    return (
                      <label
                        key={u.id}
                        className={`group relative flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-all ${
                          isSelected
                            ? "border-pine-500 bg-pine-50/50 shadow-sm"
                            : "border-line bg-paper hover:bg-paper2/50 hover:border-ink/20"
                        }`}
                      >
                        <div className="flex h-5 items-center mt-0.5">
                          <input
                            type="radio"
                            name="signatory"
                            value={u.id}
                            checked={isSelected}
                            onChange={() => setSelectedSignatoryId(u.id)}
                            className="h-4 w-4 border-gray-300 text-pine-600 focus:ring-pine-500"
                          />
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className={`block text-sm font-semibold truncate ${isSelected ? "text-pine-900" : "text-ink"}`}>
                            {u.name}
                          </span>
                          <span className={`block text-[13px] truncate ${isSelected ? "text-pine-700" : "text-inkmut"}`}>
                            {u.positionName}
                          </span>
                          {u.nip && (
                            <span className="block mt-1 text-[11px] font-mono tracking-wider text-ink/50 bg-ink/5 w-fit px-1.5 py-0.5 rounded">
                              NIP. {u.nip}
                            </span>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-line bg-paper2/30">
              <button
                type="button"
                className="btn-outline px-6"
                onClick={() => setShowSignatoryModal(false)}
              >
                Batal
              </button>
              <a
                href={selectedSignatoryId ? `${pdfUrl}?nosig=1&signatoryId=${selectedSignatoryId}` : "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowSignatoryModal(false)}
                className={`btn-primary px-6 flex items-center gap-2 ${!selectedSignatoryId ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Cetak
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
