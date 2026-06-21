"use client";

// Peta interaktif Leaflet untuk seksi #kontak.
// Vanilla Leaflet (bukan react-leaflet) agar bebas masalah SSR/peer-dep di Next 16 + React 19.
// Marker + tooltip hover (gambar, nama, deskripsi). Edit daftar titik di ContactSection.
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import "./contact-map.css";
import type { Map as LeafletMap } from "leaflet";
import { KATEGORI_WARNA, type TitikPeta } from "./peta-data";

const WARNA_DEFAULT = "#275138";

export default function ContactMap({
  titik,
  center,
  zoom = 13,
}: {
  titik: TitikPeta[];
  center: [number, number];
  zoom?: number;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Import dinamis: Leaflet menyentuh window, jadi hanya dimuat di browser.
      const L = (await import("leaflet")).default;
      if (cancelled || !elRef.current || mapRef.current) return;

      const map = L.map(elRef.current, {
        center,
        zoom,
        scrollWheelZoom: false, // jangan rebut scroll halaman — pakai tombol +/- atau drag
        zoomControl: false,
      });
      mapRef.current = map;

      // Tombol zoom dipindah ke kanan agar tak menimpa label kiri-atas.
      L.control.zoom({ position: "topright" }).addTo(map);

      // Tile terang/muted (CartoDB Positron) — senada estetika kertas arsip.
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19,
          subdomains: "abcd",
        },
      ).addTo(map);

      const bounds: [number, number][] = [];

      titik.forEach((t) => {
        const warna = KATEGORI_WARNA[t.kategori] ?? WARNA_DEFAULT;

        const icon = L.divIcon({
          className: "peta-pin",
          html: `<span class="peta-pin-dot" style="background:${warna}"></span>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
          tooltipAnchor: [0, -8],
        });

        // Kartu tooltip dibangun sebagai DOM node (textContent — aman dari injeksi).
        const card = document.createElement("div");
        card.className = "peta-card";

        const img = document.createElement("img");
        img.className = "peta-card-img";
        img.src = t.gambar;
        img.alt = t.nama;
        img.loading = "lazy";

        const body = document.createElement("div");
        body.className = "peta-card-body";

        const tag = document.createElement("span");
        tag.className = "peta-card-tag";
        tag.style.color = warna;
        tag.textContent = t.kategori;

        const title = document.createElement("h4");
        title.className = "peta-card-title";
        title.textContent = t.nama;

        const desc = document.createElement("p");
        desc.className = "peta-card-desc";
        desc.textContent = t.deskripsi;

        body.append(tag, title, desc);
        card.append(img, body);

        L.marker([t.lat, t.lng], { icon, title: t.nama })
          .addTo(map)
          .bindTooltip(card, {
            direction: "top",
            opacity: 1,
            className: "peta-tip",
            offset: [0, 0],
          });

        bounds.push([t.lat, t.lng]);
      });

      // Pas-kan tampilan agar semua titik terlihat.
      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
      }

      // Perbaiki ukuran setelah panel selesai layout (hindari tile abu-abu).
      setTimeout(() => map.invalidateSize(), 0);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [titik, center, zoom]);

  return <div ref={elRef} className="absolute inset-0 h-full w-full" />;
}
