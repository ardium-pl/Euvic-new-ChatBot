import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  afterAll,
  beforeAll,
} from "vitest";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { processFile } from "../../src/insert-data-to-db/processFilesToJson";
import {
  JSON_DATA_FOLDER as JSON_DEST,
  PDF_DATA_FOLDER as PDF_DEST,
} from "../../src/insert-data-to-db/utils/credentials";
import {
  ReferenceProjectDataType,
  FileDataType,
  ReferenceFileDataType,
  ProjectDataType,
} from "../../src/insert-data-to-db/zod-json/dataJsonSchema";
import { before } from "lodash";

type TestFile = { pdf: string; json: string; test: boolean };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_FILES_INFO_PATH = path.resolve(__dirname, "../config.json");
const PDF_SOURCE = path.resolve(__dirname, "../test-pdfs");
const JSON_SOURCE = path.resolve(__dirname, "../reference-json");
const JSON_GEN = path.resolve(__dirname, "../generated-json");
const JSON_SERIE = "gen-1";

const testFilesInfo = JSON.parse(
  fs.readFileSync(TEST_FILES_INFO_PATH, "utf-8")
);

const testFiles: TestFile[] = testFilesInfo.files.filter(
  ({ test }: { test: boolean }) => test
);

const customerKeys: Array<keyof ProjectDataType> = [
  // "description",
  "clientName",
  "projectName",
  "technologies",
  "businessCase",
  "referenceDate",
  // "scaleOfImplementationValue",
  // "scaleOfImplementationDescription",
  // "industry",
];

function mapCustomers(
  customersArray: ReferenceProjectDataType[]
): ProjectDataType[] {
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
}

function getFieldArray(array: ProjectDataType[], field: keyof ProjectDataType) {
  return array.map((customer) => customer[field]);
}

const beforeAllCallback = async () => {
  console.log("🔥 beforeAll START");
  // upewnienie się że katalogi istnieją
  await fs.ensureDir(JSON_DEST);
  await fs.ensureDir(PDF_DEST);

  // kopiowanie testowych pdf do katalogu
  for (const testFile of testFiles) {
    const testPdfPath = path.join(PDF_SOURCE, testFile.pdf);
    console.log(
      `📂 Kopiowanie: ${testPdfPath} -> ${path.join(PDF_DEST, testFile.pdf)}`
    );
    fs.copySync(testPdfPath, path.join(PDF_DEST, testFile.pdf));
  }

  // procesowanie plików testowych
  await Promise.all(
    testFiles.map(async (testFile) => {
      console.log(`🔄 Procesowanie: ${testFile.pdf}`);
      await processFile(testFile.pdf);
    })
  );
  console.log("✅ beforeAll ZAKOŃCZONE");
};

await beforeAllCallback()

afterAll(async () => {
  const generatedFiles = await fs.readdir(JSON_DEST);

  await Promise.all(
    generatedFiles.map(async (file) => {
      const sourcePath = path.join(JSON_DEST, file);
      const destinationPath = path.join(JSON_GEN, JSON_SERIE, file);
      console.log(`📂 Przenoszę: ${sourcePath} -> ${destinationPath}`);
      await fs.move(sourcePath, destinationPath, { overwrite: true });
    })
  );

  await Promise.all([fs.emptyDir(JSON_DEST), fs.emptyDir(PDF_DEST)]);
});

describe("processFile function", () => {
  testFiles.forEach((testFile) => {
    console.log(`✅ Testuję plik: ${testFile.pdf}`);

    // ścieżki do jsonów
    const referenceJsonPath = path.join(JSON_SOURCE, testFile.json); // jsony referencyjne
    const generatedJsonPath = path.join(JSON_DEST, testFile.json); // jsony wygenerowane przez program

    // sprawdza czy dobrze wygenerowane jsony
    it("generated json should exist", async () => {
      expect(fs.pathExistsSync(generatedJsonPath)).toBe(true);
    });

    // czytanie jsonów
    const generatedJson: FileDataType = fs.readJsonSync(generatedJsonPath);
    const referenceJson: ReferenceFileDataType =
      fs.readJsonSync(referenceJsonPath);

    //mapowanie danych na ten sam typ
    const customersGen: ProjectDataType[] = generatedJson.customers;
    const customersRef: ProjectDataType[] = mapCustomers(
      referenceJson.customers
    );

    it("should compare fileName field", () => {
      expect(generatedJson.fileName).toEqual(referenceJson.fileName);
    });

    it.each(customerKeys)("should compare different fields", (key) => {
      const clientNameGen = getFieldArray(customersGen, key);
      const clientNameRef = getFieldArray(customersRef, key);

      expect(clientNameGen).toEqual(clientNameRef);
    });
  });
});

// describe("jacie", () => {
//   expect(true).toBe(true);
// });
