"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { ProductDTO } from "@/server/types/product";
import { formatRupiah } from "@/lib/format";
import { ShoppingCart, WhatsApp } from "./icons";

const STORAGE_KEY = "koperasi-cart";

// Normalkan nomor WA ke format internasional tanpa tanda: 08.. -> 628.., 62.. tetap.
function normalizeWa(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

export default function ProductCatalog({
  products,
  waNumber,
  koperasiName,
}: {
  products: ProductDTO[];
  waNumber: string;
  koperasiName: string;
}) {
  // cart: id produk -> jumlah
  const [cart, setCart] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeCat, setActiveCat] = useState<string>("Semua");

  // Muat keranjang dari localStorage sekali di awal.
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch {
      /* abaikan */
    }
  }, []);

  // Simpan tiap kali berubah.
  useEffect(() => {
    if (mounted) localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart, mounted]);

  // Kunci scroll saat drawer terbuka.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const productById = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p])),
    [products],
  );

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return ["Semua", ...Array.from(set)];
  }, [products]);

  const shown =
    activeCat === "Semua"
      ? products
      : products.filter((p) => p.category === activeCat);

  const setQty = (id: string, qty: number) =>
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = qty;
      return next;
    });

  const cartItems = Object.entries(cart)
    .map(([id, qty]) => ({ product: productById[id], qty }))
    .filter((it) => it.product); // buang id yang produknya sudah tidak ada
  const totalItems = cartItems.reduce((s, it) => s + it.qty, 0);
  const totalPrice = cartItems.reduce(
    (s, it) => s + (it.product.price || 0) * it.qty,
    0,
  );

  const wa = normalizeWa(waNumber);

  function buildWaLink() {
    const lines = cartItems.map((it, i) => {
      const p = it.product;
      const priceStr = p.price
        ? ` — ${it.qty} × ${formatRupiah(p.price)} = ${formatRupiah(p.price * it.qty)}`
        : ` — ${it.qty} ${p.unit || "pcs"}`;
      return `${i + 1}. ${p.name}${priceStr}`;
    });
    const total = totalPrice ? `\n\n*Total: ${formatRupiah(totalPrice)}*` : "";
    const msg =
      `Halo ${koperasiName || "Koperasi Desa"}, saya ingin memesan produk berikut:\n\n` +
      `${lines.join("\n")}${total}\n\nTerima kasih.`;
    return `https://wa.me/${wa}?text=${encodeURIComponent(msg)}`;
  }

  return (
    <>
      {/* Filter kategori */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveCat(c)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                activeCat === c
                  ? "border-pine-900 bg-pine-900 text-paper"
                  : "border-line bg-card text-inkmut hover:border-pine-900/40"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Grid produk */}
      {shown.length === 0 ? (
        <p className="mt-8 rounded-sm border border-dashed border-line bg-paper2/30 px-5 py-12 text-center text-sm text-inkmut">
          Belum ada produk pada kategori ini.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => {
            const qty = cart[p.id] ?? 0;
            return (
              <div
                key={p.id}
                className="flex flex-col overflow-hidden rounded-sm border border-line bg-card transition-shadow hover:shadow-md"
              >
                <div className="aspect-[4/3] overflow-hidden bg-paper2/40">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-inkmut/30">
                      <span className="font-serif">Produk Desa</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  {p.category && (
                    <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-brass">
                      {p.category}
                    </span>
                  )}
                  <h3 className="font-serif text-lg leading-snug text-pine-900">
                    {p.name}
                  </h3>
                  {p.description && (
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-inkmut">
                      {p.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-baseline gap-1">
                    {p.price ? (
                      <>
                        <span className="font-semibold text-ink">
                          {formatRupiah(p.price)}
                        </span>
                        {p.unit && (
                          <span className="text-xs text-inkmut">/ {p.unit}</span>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-inkmut">Hubungi penjual</span>
                    )}
                  </div>

                  {/* Aksi keranjang */}
                  <div className="mt-4">
                    {qty === 0 ? (
                      <button
                        type="button"
                        onClick={() => setQty(p.id, 1)}
                        className="btn-outline w-full gap-1.5 text-xs"
                      >
                        <ShoppingCart className="h-4 w-4" /> Tambah
                      </button>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <Stepper
                          qty={qty}
                          onDec={() => setQty(p.id, qty - 1)}
                          onInc={() => setQty(p.id, qty + 1)}
                        />
                        <button
                          type="button"
                          onClick={() => setQty(p.id, 0)}
                          className="text-[11px] font-bold uppercase tracking-wide text-oxide hover:underline"
                        >
                          Hapus
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tombol keranjang mengambang */}
      {mounted && totalItems > 0 && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-pine-900 px-5 py-3 text-sm font-semibold text-paper shadow-xl transition-transform hover:scale-105"
        >
          <ShoppingCart className="h-5 w-5" />
          Keranjang
          <span className="ml-1 grid h-6 min-w-6 place-items-center rounded-full bg-brass px-1.5 text-xs font-bold text-pine-950">
            {totalItems}
          </span>
        </button>
      )}

      {/* Drawer keranjang */}
      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex justify-end bg-black/50"
            onClick={() => setOpen(false)}
          >
            <div
              className="flex h-full w-full max-w-md flex-col bg-paper shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
                <h2 className="font-serif text-xl text-pine-900">
                  Keranjang Pesanan
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 text-2xl leading-none text-inkmut hover:text-ink"
                  aria-label="Tutup"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                {cartItems.length === 0 ? (
                  <p className="py-16 text-center text-sm text-inkmut">
                    Keranjang masih kosong.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-4">
                    {cartItems.map(({ product: p, qty }) => (
                      <li key={p.id} className="flex gap-3">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-sm border border-line bg-paper2/40">
                          {p.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink">
                            {p.name}
                          </p>
                          {p.price ? (
                            <p className="text-xs text-inkmut">
                              {formatRupiah(p.price)}
                              {p.unit ? ` / ${p.unit}` : ""}
                            </p>
                          ) : (
                            <p className="text-xs text-inkmut">Hubungi penjual</p>
                          )}
                          <div className="mt-2">
                            <Stepper
                              qty={qty}
                              onDec={() => setQty(p.id, qty - 1)}
                              onInc={() => setQty(p.id, qty + 1)}
                            />
                          </div>
                        </div>
                        {p.price > 0 && (
                          <span className="shrink-0 text-sm font-semibold text-ink">
                            {formatRupiah(p.price * qty)}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="shrink-0 border-t border-line px-5 py-4">
                {totalPrice > 0 && (
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm text-inkmut">Perkiraan total</span>
                    <span className="font-serif text-lg text-pine-900">
                      {formatRupiah(totalPrice)}
                    </span>
                  </div>
                )}
                {wa ? (
                  <a
                    href={cartItems.length ? buildWaLink() : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-disabled={cartItems.length === 0}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-[4px] px-5 py-3 text-sm font-semibold text-white transition-colors ${
                      cartItems.length === 0
                        ? "pointer-events-none bg-inkmut/40"
                        : "bg-[#25D366] hover:bg-[#1eb257]"
                    }`}
                  >
                    <WhatsApp className="h-5 w-5" />
                    Pesan via WhatsApp
                  </a>
                ) : (
                  <p className="rounded-sm border border-dashed border-line bg-paper2/40 px-4 py-3 text-center text-xs text-inkmut">
                    Nomor WhatsApp koperasi belum diatur. Hubungi admin desa.
                  </p>
                )}
                <p className="mt-2 text-center text-[11px] text-inkmut">
                  Pesanan diteruskan ke WhatsApp koperasi untuk dikonfirmasi.
                </p>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function Stepper({
  qty,
  onDec,
  onInc,
}: {
  qty: number;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div className="inline-flex items-center rounded-sm border border-line">
      <button
        type="button"
        onClick={onDec}
        className="grid h-8 w-8 place-items-center text-lg text-ink hover:bg-paper2/60"
        aria-label="Kurangi"
      >
        −
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums">
        {qty}
      </span>
      <button
        type="button"
        onClick={onInc}
        className="grid h-8 w-8 place-items-center text-lg text-ink hover:bg-paper2/60"
        aria-label="Tambah"
      >
        +
      </button>
    </div>
  );
}
