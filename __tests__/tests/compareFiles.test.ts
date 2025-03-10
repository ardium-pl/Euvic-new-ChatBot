import { describe, it, expect } from "vitest";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import {
  FileDataType,
  ReferenceFileDataType,
  ProjectDataType,
} from "../../src/insert-data-to-db/zod-json/dataJsonSchema";
import { TestFile } from "../utils/types";
import { mapCustomers } from "../utils/types";
import { boolean } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_FILES_INFO_PATH = path.resolve(__dirname, "../testFilesInfo.json");
const KEYS_TO_TEST_PATH = path.resolve(__dirname, "../keysToTest.json");
const JSON_REF = path.resolve(__dirname, "../data/reference-json");
const JSON_GEN = path.resolve(__dirname, "../data/generated-json");
const JSON_SERIE = "ref-2";

const testFilesInfo = JSON.parse(
  fs.readFileSync(TEST_FILES_INFO_PATH, "utf-8")
);

const keysToTest = JSON.parse(fs.readFileSync(KEYS_TO_TEST_PATH, "utf-8"));

const testFiles: TestFile[] = testFilesInfo.files.filter(
  ({ test }: { test: boolean }) => test
);

const customerKeys: Array<keyof ProjectDataType> = keysToTest.keys
  .filter((item: { key: string; test: boolean }) => item.key)
  .map((item: { key: string }) => item.key);

// [
//   // "description",
//   "clientName",
//   "projectName",
//   "technologies",
//   "businessCase",
//   "referenceDate",
//   // "scaleOfImplementationValue",
//   // "scaleOfImplementationDescription",
//   // "industry",
// ];

describe("processFile function", () => {
  testFiles.forEach((testFile) => {
    console.log(`✅ Testuję plik: ${testFile.pdf}`);

    // ścieżki do jsonów
    const referenceJsonPath = path.join(JSON_REF, testFile.json); // jsony referencyjne
    const generatedJsonPath = path.join(JSON_GEN, JSON_SERIE, testFile.json); // jsony wygenerowane przez program

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

    // porównanie nazw plików
    it("should compare fileName field", () => {
      expect(generatedJson.fileName).toEqual(referenceJson.fileName);
    });

    // porównanie poszczególnych pól
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
