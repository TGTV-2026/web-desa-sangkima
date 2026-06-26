import { siteContentService } from "@/server/services/siteContent.service";
import FooterEditor from "./FooterEditor";

export default async function AdminFooterPage() {
  const footer = await siteContentService.get("footer");
  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="overline-doc text-brass">Global</span>
        <h1 className="mt-1 font-serif text-[28px] font-medium text-pine-900">
          Footer Situs
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-inkmut">
          Bagian paling bawah di semua halaman publik.
        </p>
      </div>
      <FooterEditor initial={footer} />
    </div>
  );
}
