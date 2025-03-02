import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { processFile } from "../../src/insert-data-to-db/processFilesToJson";
import {
  JSON_DATA_FOLDER,
  PDF_DATA_FOLDER,
} from "../../src/insert-data-to-db/utils/credentials";
import { ReferenceProjectDataType, FileDataType, ReferenceFileDataType, ProjectDataType } from "../../src/insert-data-to-db/zod-json/dataJsonSchema";

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

const mapCustomers = (customersArray: ReferenceProjectDataType[]): ProjectDataType[] => {
  return customersArray.map((customer) => ({
    clientName: customer.name,
    projectName: "",
    description: customer.projects.description,
    technologies: customer.projects.technologies,
    businessCase: customer.projects.businessCase ? { name: [customer.projects.businessCase] } : undefined,
    referenceDate: customer.projects.referenceDate,
    scaleOfImplementationValue: customer.projects.scaleOfImplementationValue,
    scaleOfImplementationDescription: customer.projects.scaleOfImplementationDescription,
    industry: customer.projects.industry

  }))
};

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

      const generatedJson: FileDataType = await fs.readJson(generatedJsonPath);
      const referenceJson: ReferenceFileDataType = await fs.readJson(referenceJsonPath);

      const genCustomers: ProjectDataType[] = generatedJson.customers
      const refCustomers: ProjectDataType[] = mapCustomers(referenceJson.customers);

      expect(generatedJson.fileName).toEqual(referenceJson.fileName);
      expect(genCustomers).toEqual(refCustomers);

    }
  );
});
