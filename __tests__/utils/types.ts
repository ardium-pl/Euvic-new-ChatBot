import { string, z } from "zod";

const DbRow = z.object({
  projekty_id: z.number() || null,
  projekty_nazwa: z.string() || null,
  projekty_opis: z.string() || null,
  projekty_data_opis: z.string() || null,
  projekty_skala_wdrozenia_opis: z.string() || null,
  klienci_id: z.number() || null,
  klienci_nazwa: z.string() || null,
  branze_id: z.number() || null,
  branze_nazwa: z.string() || null,
  biznes_casy_id: z.number() || null,
  biznes_casy_opis: z.string() || null,
  pliki_id: z.number() || null,
  pliki_nazwa: z.string() || null,
  pliki_zawartosc_ocr: z.string() || null,
  pliki_link_do_pliku: z.string() || null,
  technologie_id: z.number() || null,
  technologie_nazwa: z.string() || null,
});

export const DbData = z.array(DbRow);

export type DbRowType = z.infer<typeof DbRow>;
