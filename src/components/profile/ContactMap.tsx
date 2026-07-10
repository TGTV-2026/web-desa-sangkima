"use client";

// Peta interaktif Leaflet untuk seksi #kontak.
// Vanilla Leaflet (bukan react-leaflet) agar bebas masalah SSR/peer-dep di Next 16 + React 19.
// Marker + tooltip hover (gambar, nama, deskripsi). Edit daftar titik di ContactSection.
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import "./contact-map.css";
import type { Map as LeafletMap } from "leaflet";
import { KATEGORI_WARNA, WARNA_DEFAULT, type TitikPeta } from "./peta-data";

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
    let detachWheel: (() => void) | null = null;

    (async () => {
      // Import dinamis: Leaflet menyentuh window, jadi hanya dimuat di browser.
      const L = (await import("leaflet")).default;
      if (cancelled || !elRef.current || mapRef.current) return;
      const el = elRef.current;

      const map = L.map(el, {
        center,
        zoom,
        scrollWheelZoom: false, // jangan rebut scroll halaman — pakai tombol +/- atau pinch
        zoomControl: false,
        zoomSnap: 0, // izinkan zoom pecahan agar pinch touchpad terasa halus
      });
      mapRef.current = map;

      // Pinch touchpad dikirim browser sebagai wheel + ctrlKey (aksi default-nya
      // zoom browser). Cegat khusus gesture itu untuk zoom peta ke arah kursor;
      // scroll dua-jari biasa (tanpa ctrlKey) dibiarkan agar halaman tetap bisa
      // di-scroll — persis niat awal scrollWheelZoom: false.
      const onWheel = (e: WheelEvent) => {
        if (!e.ctrlKey) return;
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        const point = L.point(e.clientX - rect.left, e.clientY - rect.top);
        map.setZoomAround(point, map.getZoom() - e.deltaY * 0.01);
      };
      el.addEventListener("wheel", onWheel, { passive: false });
      detachWheel = () => el.removeEventListener("wheel", onWheel);

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

      // --- Lokasi pengguna (Geolocation browser via map.locate) ---
      // Di balik tombol, bukan otomatis: prompt izin hanya muncul saat pengguna
      // menekannya. Butuh HTTPS/localhost; kalau ditolak/gagal → pesan singkat.
      let userMarker: import("leaflet").Marker | null = null;
      let accuracyCircle: import("leaflet").Circle | null = null;
      let msgTimer: ReturnType<typeof setTimeout> | undefined;

      const clearLoading = () =>
        el.querySelector(".peta-locate a")?.classList.remove("is-loading");

      const showMsg = (text: string) => {
        let box = el.querySelector<HTMLDivElement>(".peta-locate-msg");
        if (!box) {
          box = document.createElement("div");
          box.className = "peta-locate-msg";
          el.appendChild(box);
        }
        box.textContent = text;
        box.classList.add("is-visible");
        clearTimeout(msgTimer);
        msgTimer = setTimeout(() => box?.classList.remove("is-visible"), 4000);
      };

      const userIcon = L.divIcon({
        className: "peta-user",
        html: `<span class="peta-user-dot"></span>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      map.on("locationfound", (e) => {
        clearLoading();
        const radius = Math.max(e.accuracy / 2, 8);
        if (!userMarker) {
          userMarker = L.marker(e.latlng, {
            icon: userIcon,
            title: "Lokasi Anda",
          }).addTo(map);
          accuracyCircle = L.circle(e.latlng, {
            radius,
            color: "#2563eb",
            weight: 1,
            fillColor: "#3b82f6",
            fillOpacity: 0.15,
          }).addTo(map);
        } else {
          userMarker.setLatLng(e.latlng);
          accuracyCircle?.setLatLng(e.latlng).setRadius(radius);
        }
      });

      map.on("locationerror", (err) => {
        clearLoading();
        showMsg(
          err.code === 1
            ? "Izin lokasi ditolak — aktifkan izin lokasi di browser."
            : "Tidak bisa mendapatkan lokasi Anda saat ini.",
        );
      });

      // Tombol kontrol "lokasi saya" (ikon crosshair).
      const LocateControl = L.Control.extend({
        options: { position: "topright" as const },
        onAdd() {
          const container = L.DomUtil.create("div", "leaflet-bar peta-locate");
          const btn = L.DomUtil.create("a", "", container) as HTMLAnchorElement;
          btn.href = "#";
          btn.title = "Tampilkan lokasi saya";
          btn.setAttribute("role", "button");
          btn.setAttribute("aria-label", "Tampilkan lokasi saya");
          btn.innerHTML =
            '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>';
          L.DomEvent.on(btn, "click", (ev: Event) => {
            L.DomEvent.stop(ev);
            btn.classList.add("is-loading");
            map.locate({
              setView: true,
              maxZoom: 16,
              enableHighAccuracy: true,
              timeout: 10000,
            });
          });
          return container;
        },
      });
      map.addControl(new LocateControl());

      // Perbaiki ukuran setelah panel selesai layout (hindari tile abu-abu).
      setTimeout(() => map.invalidateSize(), 0);
    })();

    return () => {
      cancelled = true;
      detachWheel?.();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [titik, center, zoom]);

  return <div ref={elRef} className="absolute inset-0 h-full w-full" />;
}
