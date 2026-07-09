"use client";

import { useEffect, useRef, useState } from "react";
import type { VideoDTO } from "@/server/types/gallery";

// Tipe minimal untuk global yang disuntik oleh script embed.js Instagram.
declare global {
  interface Window {
    instgrm?: {
      Embeds: { process: () => void };
    };
  }
}

const SCRIPT_SRC = "https://www.instagram.com/embed.js";

// Muat embed.js sekali saja walau ada banyak video Instagram di satu halaman.
function ensureInstagramScript(onReady: () => void) {
  if (window.instgrm) {
    onReady();
    return;
  }
  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${SCRIPT_SRC}"]`,
  );
  if (existing) {
    existing.addEventListener("load", onReady, { once: true });
    return;
  }
  const script = document.createElement("script");
  script.src = SCRIPT_SRC;
  script.async = true;
  script.addEventListener("load", onReady, { once: true });
  document.body.appendChild(script);
}

export default function InstagramEmbed({ video }: { video: VideoDTO }) {
  const ref = useRef<HTMLQuoteElement>(null);
  // "loading" → coba render embed; "failed" → tampilkan card fallback.
  const [status, setStatus] = useState<"loading" | "ready" | "failed">(
    "loading",
  );

  useEffect(() => {
    let done = false;

    const process = () => {
      if (done) return;
      if (window.instgrm) {
        window.instgrm.Embeds.process();
        setStatus("ready");
        done = true;
      }
    };

    ensureInstagramScript(process);
    // Jalankan lagi tiap mount (mis. navigasi client-side Next.js) kalau script
    // sudah ada tapi blockquote baru ter-mount.
    process();

    // Fallback: kalau setelah beberapa detik script belum ada (kemungkinan
    // besar diblok ad-blocker), tampilkan card link ke Instagram.
    const timeout = window.setTimeout(() => {
      if (!window.instgrm) setStatus("failed");
    }, 4000);

    return () => {
      done = true;
      window.clearTimeout(timeout);
    };
  }, [video.externalId]);

  if (status === "failed") {
    return (
      <a
        href={video.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex aspect-video flex-col items-center justify-center gap-3 rounded-sm border border-line bg-paper2/40 p-6 text-center transition-colors hover:border-brass"
      >
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-brass">
          Instagram
        </span>
        {video.caption && (
          <p className="line-clamp-2 text-sm text-inkmut">{video.caption}</p>
        )}
        <span className="text-[13px] font-semibold text-pine-900">
          Tonton di Instagram ↗
        </span>
      </a>
    );
  }

  return (
    <blockquote
      ref={ref}
      className="instagram-media"
      data-instgrm-permalink={video.url}
      data-instgrm-version="14"
      style={{ margin: 0, width: "100%" }}
    >
      {/* Placeholder saat embed belum diproses — link asli tetap bisa diklik. */}
      <a href={video.url} target="_blank" rel="noopener noreferrer">
        {video.caption ?? "Lihat di Instagram"}
      </a>
    </blockquote>
  );
}
