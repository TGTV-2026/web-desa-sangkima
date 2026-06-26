"use client";

import Script from "next/script";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

// Tipe minimal API global yang disuntik script Cloudflare.
interface TurnstileApi {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    },
  ) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
}
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export interface TurnstileHandle {
  reset: () => void;
}

// Dev pakai test site key resmi Cloudflare (widget selalu lolos otomatis).
// Produksi pakai key sungguhan dari NEXT_PUBLIC_TURNSTILE_SITE_KEY.
const SITE_KEY =
  process.env.NODE_ENV === "production"
    ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!
    : "1x00000000000000000000AA"; // ponytail: test key Cloudflare (selalu lolos)

const Turnstile = forwardRef<TurnstileHandle, { onVerify: (token: string) => void }>(
  function Turnstile({ onVerify }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);

    // Token Turnstile sekali pakai: setelah submit gagal, widget perlu di-reset
    // agar Cloudflare menerbitkan token baru (kalau tidak → error duplicate).
    useImperativeHandle(
      ref,
      () => ({
        reset() {
          if (widgetId.current && window.turnstile) {
            window.turnstile.reset(widgetId.current);
          }
        },
      }),
      [],
    );

    // onVerify dari pemanggil adalah setter useState (stabil), jadi effect cukup sekali.
    useEffect(() => {
      let interval: ReturnType<typeof setInterval> | null = null;

      function tryRender() {
        if (widgetId.current || !containerRef.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: onVerify,
          "expired-callback": () => onVerify(""),
          "error-callback": () => onVerify(""),
        });
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      }

      // Script mungkin belum siap saat mount (atau sudah, kalau navigasi SPA) — coba berkala.
      tryRender();
      if (!widgetId.current) interval = setInterval(tryRender, 200);

      return () => {
        if (interval) clearInterval(interval);
        if (widgetId.current && window.turnstile) {
          window.turnstile.remove(widgetId.current);
          widgetId.current = null;
        }
      };
    }, []);

    return (
      <>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
        <div ref={containerRef} />
      </>
    );
  },
);

export default Turnstile;
