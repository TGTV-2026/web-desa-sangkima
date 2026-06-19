"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { isProfileComplete } from "@/server/types/user";
import type { UserDTO } from "@/server/types/user";

export type PickedUser = UserDTO;

interface UserPickerProps {
  value: PickedUser | null;
  onChange: (user: PickedUser | null) => void;
}

/** Cari & pilih warga terdaftar sebagai pemohon — auto-isi identitas dari profilnya. */
export default function UserPicker({ value, onChange }: UserPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PickedUser[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/esurat/api/users?q=${encodeURIComponent(query)}&limit=8`,
        );
        const json = await res.json();
        setResults(res.ok ? (json.data ?? []) : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (value) {
    const complete = isProfileComplete(value);
    return (
      <div>
        <div className="flex items-center justify-between gap-3 input-doc !flex bg-paper2/30">
          <div className="min-w-0">
            <p className="font-semibold truncate">{value.name}</p>
            <p className="font-mono text-xs text-inkmut truncate">
              {value.nik} · {value.email}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs font-semibold text-brass hover:underline underline-offset-2 shrink-0"
          >
            Ganti
          </button>
        </div>

        {!complete && (
          <div className="bg-oxide/[0.05] border border-oxide/30 rounded-[4px] px-4 py-3 mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-oxide">
              Data profil warga ini belum lengkap. Pengajuan tidak bisa dibuat
              sampai dilengkapi.
            </p>
            <Link
              href={`/esurat/dashboard/pengguna/${value.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-oxide hover:underline underline-offset-2 shrink-0"
            >
              Lengkapi →
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={boxRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (e.target.value.trim()) setLoading(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Cari nama, email, atau NIK warga terdaftar..."
        className="input-doc"
      />

      {open && query.trim() && (
        <div className="absolute z-20 mt-1.5 w-full card-doc bg-paper border border-line shadow-lg overflow-hidden max-h-64 overflow-y-auto">
          {loading ? (
            <p className="px-4 py-3 text-xs text-inkmut">Mencari...</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-xs text-inkmut">
              Tidak ditemukan. Pastikan warga sudah terdaftar di Kelola Pengguna.
            </p>
          ) : (
            results.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  onChange(u);
                  setQuery("");
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-paper2/50 transition-colors border-b border-line/50 last:border-0"
              >
                <p className="text-sm font-semibold">{u.name}</p>
                <p className="font-mono text-xs text-inkmut">{u.nik} · {u.email}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
