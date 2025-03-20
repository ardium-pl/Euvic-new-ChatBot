import { string, z } from "zod";

const DbRow = z.object({
  projekty_id: z.number(),
  projekty_nazwa: z.string(),
  projekty_opis: z.string(),
  projekty_data_opis: z.string(),
  projekty_skala_wdrozenia_opis: z.string(),
  klienci_id: z.number(),
  klienci_nazwa: z.string(),
  branze_id: z.number(),
  branze_nazwa: z.string(),
  biznes_casy_id: z.number(),
  biznes_casy_opis: z.string(),
  pliki_id: z.number(),
  pliki_nazwa: z.string(),
  pliki_zawartosc_ocr: z.string(),
  pliki_link_do_pliku: z.string(),
  technologie_id: z.number(),
  technologie_nazwa: z.string(),
});

export const DbData = z.array(DbRow)

export type DbRowType = z.infer<typeof DbRow>;
