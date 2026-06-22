export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Tampilkan medali "S" — varian lebih kaya dipakai di ringkasan beranda dashboard. */
  icon?: boolean;
}

/** Pesan kosong dipakai di daftar/tabel dashboard E-Surat saat belum ada data. */
export default function EmptyState({ title, description, icon }: EmptyStateProps) {
  if (icon) {
    return (
      <div className="px-4 sm:px-6 py-12 sm:py-16 text-center flex flex-col items-center justify-center flex-1 min-h-[280px]">
        <div className="w-11 h-11 rounded-full border border-line/80 grid place-items-center mb-3 text-inkmut/40 bg-paper2/20 text-xs font-serif italic">
          S
        </div>
        <h3 className="font-serif text-[15px] md:text-[16px] font-medium text-ink">{title}</h3>
        {description && (
          <p className="text-[14px] md:text-[15px] text-inkmut mt-1.5 max-w-xs leading-relaxed px-4">
            {description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="px-6 py-16 text-center">
      <p className="font-serif text-lg">{title}</p>
      {description && <p className="text-[14px] text-inkmut mt-1">{description}</p>}
    </div>
  );
}
