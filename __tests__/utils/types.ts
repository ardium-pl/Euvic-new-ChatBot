import { z } from "zod";

export type SqlNaturalType = {
  sql: string;
  natural: string;
};

export type ProcessedQueriesType = SqlNaturalType & {
  response: string;
};

export type ComparedQueriesType = ProcessedQueriesType & {
  isSame: boolean;
};

const TestQuestion = z.object({
  question: z.string(),
  answerRef: z.string(),
});

export const TestPackage = z.object({
  projectDescription: TestQuestion,
  dateDescription: TestQuestion,
  scaleDescription: TestQuestion,
  biznesCaseDescription: TestQuestion,
});

export type TestPackageType = z.infer<typeof TestPackage>;

export const Result = z.object({
  question: z.string(),
  answerRef: z.string(),
  sqlQuery: z.string(),
  formattedAnswer: z.string(),
});

export const Results = z.object({
  projectDescription: z.array(Result),
  dateDescription: z.array(Result),
  scaleDescription: z.array(Result),
  biznesCaseDescription: z.array(Result),
});

export type ResultType = z.infer<typeof Result>;
export type ResultsType = z.infer<typeof Results>;

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
