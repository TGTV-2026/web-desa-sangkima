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
      <p className={`overline-doc text-[14px] lg:text-[16px] ${riseIn}`}>{overline}</p>
      
      <h2
        className={`font-serif text-[32px] lg:text-[40px] font-medium tracking-tight mt-1 lg:mt-2 leading-tight ${riseIn}`}
        style={animated ? { animationDelay: "60ms" } : undefined}
      >
        {title}
      </h2>
      <p
        className={`text-[15px] lg:text-[18px] text-inkmut ${
          compact ? "mt-1 mb-3 lg:mb-4" : "mt-2 lg:mt-3 mb-5 lg:mb-10"
        } ${riseIn}`}
        style={animated ? { animationDelay: "120ms" } : undefined}
      >
        {description}
      </p>
    </>
  );
}