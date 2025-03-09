import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from "vitest";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { processFile } from "../../src/insert-data-to-db/processFilesToJson";
import {
  JSON_DATA_FOLDER,
  PDF_DATA_FOLDER,
} from "../../src/insert-data-to-db/utils/credentials";
import {
  ReferenceProjectDataType,
  FileDataType,
  ReferenceFileDataType,
  ProjectDataType,
} from "../../src/insert-data-to-db/zod-json/dataJsonSchema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.resolve(__dirname, "../config.json");
const TEST_PDF_FOLDER = path.resolve(__dirname, "../test-pdfs");
const REFERENCE_JSON_FOLDER = path.resolve(__dirname, "../reference-json");
const GENERATED_JSON_FOLDER = path.resolve(__dirname, "../generated-json");

const GENERATION_FOLDER_NAME = "gen-1";

type TestFile = { pdf: string; json: string; test: boolean };

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));

const testFiles: TestFile[] = config.files.filter(
  ({ test }: { test: boolean }) => test
);

beforeAll(async () => {
  // upewnienie się że katalogi istnieją
  await fs.ensureDir(JSON_DATA_FOLDER);
  await fs.ensureDir(PDF_DATA_FOLDER);

  // kopiowanie testowych pdf do katalogu
  await Promise.all(
    testFiles.map(async (testFile) => {
      const testPdfPath = path.join(TEST_PDF_FOLDER, testFile.pdf);
      await fs.copy(testPdfPath, path.join(PDF_DATA_FOLDER, testFile.pdf));
    })
  );

  // procesowanie plików testowych
  await Promise.all(
    testFiles.map(async (testFile) => {
      await processFile(testFile.pdf);
    })
  );
});

afterAll(async () => {
  const generatedFiles = await fs.readdir(JSON_DATA_FOLDER);

  await Promise.all(
    generatedFiles.map(async (file) => {
      const sourcePath = path.join(JSON_DATA_FOLDER, file);
      const destinationPath = path.join(
        GENERATED_JSON_FOLDER,
        GENERATION_FOLDER_NAME,
        file
      );
      console.log(`📂 Przenoszę: ${sourcePath} -> ${destinationPath}`);
      await fs.move(sourcePath, destinationPath, { overwrite: true });
    })
  );

  await Promise.all([
    fs.emptyDir(JSON_DATA_FOLDER),
    fs.emptyDir(PDF_DATA_FOLDER),
  ]);
});

const mapCustomers = (
  customersArray: ReferenceProjectDataType[]
): ProjectDataType[] => {
  return customersArray.map((customer) => ({
    clientName: customer.name,
    projectName: "",
    description: customer.projects.description,
    technologies: customer.projects.technologies,
    businessCase: customer.projects.businessCase
      ? { name: [customer.projects.businessCase] }
      : undefined,
    referenceDate: customer.projects.referenceDate,
    scaleOfImplementationValue: customer.projects.scaleOfImplementationValue,
    scaleOfImplementationDescription:
      customer.projects.scaleOfImplementationDescription,
    industry: customer.projects.industry,
  }));
};

describe("processFile function", () => {
  it.each(testFiles)(
    "should correctly process %s and generate a valid JSON file",
    async (testFile) => {
      console.log(`✅ Testuję plik: ${testFile.pdf}`);

      // ścieżki do jsonów
      const referenceJsonPath = path.join(REFERENCE_JSON_FOLDER, testFile.json); // jsony referencyjne
      const generatedJsonPath = path.join(JSON_DATA_FOLDER, testFile.json); // jsony wygenerowane przez program

      // sprawdza czy dobrze wygenerowane jsony
      expect(await fs.pathExists(generatedJsonPath)).toBe(true);

      // czytanie jsonów
      const generatedJson: FileDataType = await fs.readJson(generatedJsonPath);
      const referenceJson: ReferenceFileDataType = await fs.readJson(
        referenceJsonPath
      );

      //mapowanie danych na ten sam typ
      const genCustomers: ProjectDataType[] = generatedJson.customers;
      const refCustomers: ProjectDataType[] = mapCustomers(
        referenceJson.customers
      );

      // porównywanie jsonów
      expect(generatedJson.fileName).toEqual(referenceJson.fileName);
      expect(genCustomers).toEqual(refCustomers);
    }
  );
});
