import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { processFile } from "../../src/insert-data-to-db/processFilesToJson";
import {
  JSON_DATA_FOLDER,
  PDF_DATA_FOLDER,
} from "../../src/insert-data-to-db/utils/credentials";
import { FileData } from "../../src/insert-data-to-db/zod-json/dataJsonSchema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.resolve(__dirname, "../config.json");
const TEST_PDF_FOLDER = path.resolve(__dirname, "../test-pdfs");
const REFERENCE_JSON_FOLDER = path.resolve(__dirname, "../reference-json");

type TestFile = { pdf: string; json: string; test: boolean };

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));

const testFiles: TestFile[] = config.files.filter(
  ({ test }: { test: boolean }) => test
);

beforeEach(async () => {
  await fs.ensureDir(JSON_DATA_FOLDER);
  await fs.ensureDir(PDF_DATA_FOLDER);
});

afterEach(async () => {
  await fs.emptyDir(JSON_DATA_FOLDER);
});

describe("processFile function", () => {
  it.each(testFiles)(
    "should correctly process %s and generate a valid JSON file",
    async (testFile) => {
      const testPdfPath = path.join(TEST_PDF_FOLDER, testFile.pdf);
      const referenceJsonPath = path.join(REFERENCE_JSON_FOLDER, testFile.json);
      const generatedJsonPath = path.join(JSON_DATA_FOLDER, testFile.json);

      console.log(`✅ Testuję plik: ${testFile.pdf}`);

      await fs.copy(testPdfPath, path.join(PDF_DATA_FOLDER, testFile.pdf));

      await processFile(testFile.pdf);

      expect(await fs.pathExists(generatedJsonPath)).toBe(true);

      // Odczyt wygenerowanego i oczekiwanego JSON-a
      const generatedJson: FileData = await fs.readJson(generatedJsonPath);
      const referenceJson: FileData = await fs.readJson(referenceJsonPath);

    }
  );
});
