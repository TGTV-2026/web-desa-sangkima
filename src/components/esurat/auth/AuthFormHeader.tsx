export interface AuthFormHeaderProps {
  overline: string;
  title: string;
  description: React.ReactNode;
  animated?: boolean;
  compact?: boolean;
}

/** Blok overline + judul + deskripsi di atas form auth (Login/Register/VerifyOTP). */
export default function AuthFormHeader({
  overline,
  title,
  description,
  animated = false,
  compact = false,
}: AuthFormHeaderProps) {
  const riseIn = animated ? "rise-in" : "";

  return (
    <>
      <p className={`overline-doc ${riseIn}`}>{overline}</p>
      <h2
        className={`font-serif text-4xl font-medium tracking-tight mt-2 ${riseIn}`}
        style={animated ? { animationDelay: "60ms" } : undefined}
      >
        {title}
      </h2>
      <p
        className={`text-sm text-inkmut ${compact ? "mt-1 mb-4" : "mt-3 mb-10"} ${riseIn}`}
        style={animated ? { animationDelay: "120ms" } : undefined}
      >
        {description}
      </p>
    </>
  );
}
