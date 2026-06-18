"use client";

import { useState } from "react";
import { useToast } from "@/hooks/useToast";

type ApiResponseJson = Record<string, unknown> & {
  message?: string;
  errors?: Record<string, string[]>;
};

interface SubmitActionOptions {
  successMessage: string;
  successTitle?: string;
  successDuration?: number;
  errorTitle?: string;
  errorFallback?: string;
  /** Override prioritas pesan error, mis. ambil error per-field sebelum `json.message`. */
  extractErrorMessage?: (json: ApiResponseJson) => string | undefined;
  onSuccess?: (json: ApiResponseJson) => void;
}

export interface SubmitActionError extends Error {
  json?: ApiResponseJson;
}

/** Konsolidasi pola busy-state + fetch + toast sukses/gagal yang berulang di komponen aksi E-Surat. */
export function useSubmitAction() {
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  const submit = async (
    fetcher: () => Promise<Response>,
    opts: SubmitActionOptions,
  ) => {
    setBusy(true);
    try {
      const res = await fetcher();
      const json: ApiResponseJson = await res.json();
      if (!res.ok) {
        const message =
          opts.extractErrorMessage?.(json) ||
          json.message ||
          opts.errorFallback ||
          "Aksi gagal";
        const err: SubmitActionError = new Error(message);
        err.json = json;
        throw err;
      }
      toast(opts.successMessage, opts.successTitle ?? "Berhasil", "success", opts.successDuration ?? 4000);
      opts.onSuccess?.(json);
      return json;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal terhubung ke server";
      toast(message, opts.errorTitle ?? "Gagal", "error", 5000);
      throw err;
    } finally {
      setBusy(false);
    }
  };

  return { busy, submit };
}
