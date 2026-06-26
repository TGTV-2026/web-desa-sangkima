// Verifikasi Cloudflare Turnstile.
// Dev (NODE_ENV != production) memakai test secret resmi Cloudflare yang selalu lolos,
// jadi tak perlu key sungguhan saat lokal. Produksi wajib set TURNSTILE_SECRET_KEY.
const SECRET =
  process.env.NODE_ENV === "production"
    ? process.env.TURNSTILE_SECRET_KEY
    : "1x0000000000000000000000000000000AA"; // ponytail: test secret Cloudflare (selalu lolos)

export async function verifyTurnstile(token: unknown): Promise<boolean> {
  if (typeof token !== "string" || !token) return false;
  if (!SECRET) return false; // env produksi belum diset → tolak, jangan diam-diam lolos

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: SECRET, response: token }),
    },
  );
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}
