import "dotenv/config";
import path from "path";
import fs from "fs-extra";
import {
  JSON_DATA_FOLDER as JSON_DEST,
  PDF_DATA_FOLDER as PDF_DEST,
} from "../../src/insert-data-to-db/utils/credentials";

import {
  TEST_FILES_INFO_PATH,
  PDF_SOURCE,
  JSON_STORAGE,
  OUTPUT_TEXT,
  JSON_SERIE,
} from "../utils/utils";

// wczytanie info które PDFy testować
const testFilesInfo = JSON.parse(
  fs.readFileSync(TEST_FILES_INFO_PATH, "utf-8")
);
const testFiles: any = testFilesInfo.files.filter(
  ({ test }: { test: boolean }) => test
);

console.log(testFiles);

// generuje json na podstawie określonych pdfów
async function generateJson() {
  // upewnienie się że katalogi istnieją
  await Promise.all([JSON_DEST, PDF_DEST].map(fs.ensureDir));

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
    testFiles.map(async (testFile: any) => {
      console.log(`🔄 Procesowanie: ${testFile.pdf}`);
      // await processFile(testFile.pdf);
    })
  );

  // przenoszenie wygenerowanych jsonów
  const generatedFiles = await fs.readdir(JSON_DEST);
  await Promise.all(
    generatedFiles.map(async (file) => {
      const sourcePath = path.join(JSON_DEST, file);
      const destinationPath = path.join(JSON_STORAGE, JSON_SERIE, file);
      console.log(`📂 Przenoszę: ${sourcePath} -> ${destinationPath}`);
      await fs.move(sourcePath, destinationPath, { overwrite: true });
    })
  );

  // opróżnianie katalogów
  await Promise.all([JSON_DEST, PDF_DEST, OUTPUT_TEXT].map(fs.emptyDir));
}

if (process.argv[1] === __filename) {
  await generateJson();
  process.exit(0);
}
