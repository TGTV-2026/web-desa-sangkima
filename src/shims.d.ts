// Shim tipe untuk paket yang dipakai runtime tapi tanpa deklarasi di jalur import-nya.

// d.ts resmi ada di docxtemplater/inspect-module.d.ts, tapi file runtime-nya
// hanya ada di js/inspect-module.js (paket tanpa exports map) — jembatani di sini.
declare module "docxtemplater/js/inspect-module.js" {
  import InspectModule from "docxtemplater/inspect-module";
  export default InspectModule;
}

// pizzip tidak menyertakan types; deklarasi minimal sesuai API yang dipakai.
declare module "pizzip" {
  class ZipObject {
    name: string;
    asNodeBuffer(): Buffer;
    asUint8Array(): Uint8Array;
    asText(): string;
  }
  class PizZip {
    constructor(data?: Buffer | Uint8Array | ArrayBuffer | string);
    files: Record<string, ZipObject>;
    file(name: string): ZipObject | null;
    file(name: string, data: Buffer | Uint8Array | string): this;
    generate(options: {
      type: "nodebuffer";
      compression?: "STORE" | "DEFLATE";
    }): Buffer;
  }
  export default PizZip;
}
