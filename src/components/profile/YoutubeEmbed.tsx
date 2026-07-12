import type { VideoDTO } from "@/server/types/gallery";

// Embed YouTube via domain -nocookie (lebih ramah privasi, tak butuh consent
// banner). Server Component murni — hanya iframe statis.
export default function YoutubeEmbed({
  video,
  autoPlay = false,
}: {
  video: VideoDTO;
  autoPlay?: boolean;
}) {
  // Autoplay hanya diizinkan browser kalau video di-mute; playsinline agar di
  // HP tidak dipaksa fullscreen. Tanpa autoplay: pemutaran menunggu klik user.
  const query = autoPlay ? "?autoplay=1&mute=1&playsinline=1" : "";
  return (
    <figure className="flex flex-col gap-2">
      <div className="aspect-video overflow-hidden rounded-sm border border-line bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.externalId}${query}`}
          title={video.caption ?? "Video YouTube"}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
      {video.caption && (
        <figcaption className="text-sm leading-6 text-inkmut">
          {video.caption}
        </figcaption>
      )}
    </figure>
  );
}
