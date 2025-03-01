import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import { processFile } from "../../src/insert-data-to-db/processFilesToJson";
import { JSON_DATA_FOLDER, PDF_DATA_FOLDER } from "../../src/insert-data-to-db/utils/credentials";
import { FileData } from "../../src/insert-data-to-db/zod-json/dataJsonSchema";

const TEST_PDF_FOLDER = path.join(__dirname, "test_pdfs");
const REFERENCE_JSON_FOLDER = path.join(__dirname, "reference_json");

beforeEach(async () => {
  await fs.ensureDir(JSON_DATA_FOLDER);
  await fs.ensureDir(PDF_DATA_FOLDER);
});

afterEach(async () => {
  await fs.emptyDir(JSON_DATA_FOLDER);
});

describe("processFile function", () => {
  it("should correctly process a PDF and generate a valid JSON file", async () => {
    const testFileName = "sample.pdf";
    const testPdfPath = path.join(TEST_PDF_FOLDER, testFileName);
    const expectedJsonPath = path.join(REFERENCE_JSON_FOLDER, "sample.json");
    const generatedJsonPath = path.join(JSON_DATA_FOLDER, "sample.json");

    await fs.copy(testPdfPath, path.join(PDF_DATA_FOLDER, testFileName));

    await processFile(testFileName);

    expect(await fs.pathExists(generatedJsonPath)).toBe(true);

    // Odczyt wygenerowanego i oczekiwanego JSON-a
    const generatedJson: FileData = await fs.readJson(generatedJsonPath);
    const expectedJson: FileData = await fs.readJson(expectedJsonPath);

    // Porównanie JSON-ów
    expect(generatedJson).toEqual(expectedJson);
  });

  it("should handle non-existent PDF gracefully", async () => {
    const nonExistentFile = "missing.pdf";

    await expect(processFile(nonExistentFile)).rejects.toThrow();
  });
});
