"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [10, 25, 50, 100];

/** Dropdown jumlah data per halaman, navigasi via query param "limit" (reset ke halaman 1). */
export default function LimitSelect({ value }: { value: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("limit", e.target.value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      className="input-doc !w-auto py-1.5 sm:py-1 text-xs sm:text-sm"
    >
      {OPTIONS.map((o) => (
        <option key={o} value={o}>
          {o} / halaman
        </option>
      ))}
    </select>
  );
}
