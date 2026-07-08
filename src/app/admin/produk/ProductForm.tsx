"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/hooks/useToast";
import FormField from "@/components/esurat/FormField";
import type { ProductDTO } from "@/server/types/product";
import ImageUploadField from "../ImageUploadField";
import { createProduct, updateProduct } from "./actions";

export default function ProductForm({ initial }: { initial?: ProductDTO }) {
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(
    initial?.price ? String(initial.price) : "",
  );
  const [unit, setUnit] = useState(initial?.unit ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [published, setPublished] = useState(initial?.published ?? true);

  function save() {
    startTransition(async () => {
      const payload = {
        name,
        description,
        price: price === "" ? 0 : Number(price),
        unit,
        category,
        image,
        published,
      };
      // Aksi me-redirect ke /admin/produk saat sukses; hanya error yang kembali.
      const res = initial
        ? await updateProduct(initial.id, payload)
        : await createProduct(payload);
      if (res && !res.success) toast(res.message, "Gagal", "error");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="card-doc flex flex-col gap-4 p-6">
        <FormField
          id="name"
          label="Nama produk"
          value={name}
          onChange={setName}
          placeholder="mis. Beras Organik Sangkima"
        />
        <FormField
          id="description"
          label="Deskripsi"
          type="textarea"
          rows={2}
          value={description}
          onChange={setDescription}
          optionalHint
          placeholder="Keterangan singkat produk…"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            id="price"
            label="Harga (Rp)"
            type="number"
            value={price}
            onChange={setPrice}
            optionalHint
            placeholder="0 = hubungi penjual"
          />
          <FormField
            id="unit"
            label="Satuan"
            value={unit}
            onChange={setUnit}
            optionalHint
            placeholder="mis. kg, botol, pcs"
          />
        </div>
        <FormField
          id="category"
          label="Kategori"
          value={category}
          onChange={setCategory}
          optionalHint
          placeholder="mis. Sembako, Kerajinan"
        />
        <ImageUploadField
          label="Foto produk"
          value={image}
          onChange={setImage}
        />
      </section>

      <label className="flex items-center gap-3 text-sm text-ink">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4"
        />
        Tampilkan di katalog publik (/produk). Hilangkan centang untuk
        menyembunyikan.
      </label>

      <div className="sticky bottom-0 flex justify-end gap-3 border-t border-line bg-paper/95 py-4 backdrop-blur">
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="btn-primary disabled:opacity-50"
        >
          {pending
            ? "Menyimpan…"
            : initial
              ? "Simpan Perubahan"
              : "Tambah Produk"}
        </button>
      </div>
    </div>
  );
}
