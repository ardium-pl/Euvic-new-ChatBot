import { describe, it, expect } from "vitest";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { JSON_DATA_FOLDER as JSON_GEN } from "../../src/insert-data-to-db/utils/credentials";
import {
  FileDataType,
  ReferenceFileDataType,
  ProjectDataType,
} from "../../src/insert-data-to-db/zod-json/dataJsonSchema";
import { TestFile } from "../utils/types";
import { mapCustomers } from "../utils/types";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_FILES_INFO_PATH = path.resolve(__dirname, "../config.json");
const JSON_REF = path.resolve(__dirname, "../data/reference-json");

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


describe("processFile function", () => {
  testFiles.forEach((testFile) => {
    console.log(`✅ Testuję plik: ${testFile.pdf}`);

    // ścieżki do jsonów
    const referenceJsonPath = path.join(JSON_REF, testFile.json); // jsony referencyjne
    const generatedJsonPath = path.join(JSON_GEN, testFile.json); // jsony wygenerowane przez program

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

    it.each(customerKeys)(
      `comparisson of field '%s' in file ${testFile.json} `,
      (key) => {
        const clientNameGen = customersGen.map((customer) => customer[key]);
        const clientNameRef = customersRef.map((customer) => customer[key]);

        expect(clientNameGen).toEqual(clientNameRef);
      }
    );
  });
});
