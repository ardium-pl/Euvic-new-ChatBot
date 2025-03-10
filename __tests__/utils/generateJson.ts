import fs from "fs-extra";
import {
  JSON_DATA_FOLDER as JSON_DEST,
  PDF_DATA_FOLDER as PDF_DEST,
} from "../../src/insert-data-to-db/utils/credentials";
import { TestFile } from "./types";
import path from "path";
import { fileURLToPath } from "url";
import { processFile } from "../../src/insert-data-to-db/processFilesToJson";
import 'dotenv/config';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_FILES_INFO_PATH = path.resolve(__dirname, "../config.json");
const PDF_SOURCE = path.resolve(__dirname, "../data/test-pdfs");
const JSON_STORAGE = path.resolve(__dirname, "../data/generated-json");
const OUTPUT_TEXT = path.resolve(__dirname, "../../output-text")
const JSON_SERIE = "gen-1";


const testFilesInfo = JSON.parse(
  fs.readFileSync(TEST_FILES_INFO_PATH, "utf-8")
);

const testFiles: TestFile[] = testFilesInfo.files.filter(
  ({ test }: { test: boolean }) => test
);

 async function generateJson() {
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

  const generatedFiles = await fs.readdir(JSON_DEST);
  
  await Promise.all(
    generatedFiles.map(async (file) => {
      const sourcePath = path.join(JSON_DEST, file);
      const destinationPath = path.join(JSON_STORAGE, JSON_SERIE, file);
      console.log(`📂 Przenoszę: ${sourcePath} -> ${destinationPath}`);
      await fs.move(sourcePath, destinationPath, { overwrite: true });
    })
  );
  await Promise.all([fs.emptyDir(JSON_DEST), fs.emptyDir(PDF_DEST), fs.emptyDir(OUTPUT_TEXT)]);

}

await generateJson()