import fs from "fs-extra";
import path from "path";
import { pdfOcr } from "./ocr/ocr.ts";
import { convertPptxToPdf } from "./utils/convertPptxToPdf.ts";
import {
  getDataPrompt,
  JSON_DATA_FOLDER,
  PDF_DATA_FOLDER,
} from "./utils/credentials.ts";
import { logger } from "./utils/logger.ts";
import { FileData } from "./zod-json/dataJsonSchema.ts";
import { parseOcrText } from "./zod-json/dataProcessor.ts";
import { jsonFixes } from "./verifcation-json-data/jsonMainFixer.ts";

async function processFile(fileName: string) {
  try {
    logger.info(`🧾 Reading file: ${fileName}`);
    [PDF_DATA_FOLDER, JSON_DATA_FOLDER].map((folder) => fs.ensureDir(folder));
    let pdfFilePath = path.join(PDF_DATA_FOLDER, fileName);

    // Convert PPTX to PDF if necessary // TODO: wywalić stąd funkcje konwersi z pptx na pdf(konieczne) i zrobić to przed tą funckcją
    if (path.extname(fileName).toLowerCase() === ".pptx") {
      logger.info(`🔄 Converting PPTX to PDF: ${fileName}`);
      const pdfFileName = `${path.basename(fileName, ".pptx")}.pdf`;
      pdfFilePath = path.join(PDF_DATA_FOLDER, pdfFileName);
      await convertPptxToPdf(path.join(PDF_DATA_FOLDER, fileName), pdfFilePath);
      logger.info(`✅ Conversion complete: ${pdfFilePath}`);
    }

    const ocrDataText = await pdfOcr(pdfFilePath);
    logger.info(`📄 OCR Data Text: ${ocrDataText}`);
    if (!getDataPrompt) return null;
    const parsedData = await parseOcrText(ocrDataText, getDataPrompt);
    logger.info("JSON was made!!!");

    // Weryfikacja JSON
    const finalData = await jsonFixes(parsedData, ocrDataText);

    const fileJsonData: FileData = {
      fileName: fileName,
      ocrText: ocrDataText,
      customers: finalData.customers,
    };

    const jsonFileName = `${path.basename(
      fileName,
      path.extname(fileName)
    )}.json`;
    const jsonFilePath = path.join(JSON_DATA_FOLDER, jsonFileName);
    await fs.writeJson(jsonFilePath, fileJsonData, { spaces: 2 });
    logger.info(`💾 JSON data saved to: ${jsonFilePath}`);
  } catch (err: any) {
    logger.error(`Error processing file ${fileName}: ${err.message}`);
  }
}

async function main() {
  try {
    const files = await fs.readdir(PDF_DATA_FOLDER);

    if (files.length === 0) {
      logger.info("No files found to process.");
      return;
    }

    await Promise.all(
      files.map((file) => {
        const fileExtension = path.extname(file).toLowerCase();
        if (fileExtension === ".pdf" || fileExtension === ".pptx") {
          //TODO: tutaj dodac elif na pliki które są wordem
          return processFile(file);
        } else {
          logger.info(`Skipping unsupported file format: ${file}`);
          return Promise.resolve();
        }
      })
    );

    logger.info("All files processed successfully.");
  } catch (err: any) {
    logger.error(`An error occurred during file processing: ${err.message}`);
  }
}

await main();
