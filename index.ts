import fs from "fs-extra";
import path from "path";
import { pdfOcr } from "./src/ocr/ocr.ts";
import { logger } from "./src/utils/logger.ts";
import { parseOcrText } from "./src/zod-json/dataProcessor";
import { PDF_DATA_FOLDER, JSON_DATA_FOLDER } from "./src/utils/credentials.ts";
import { convertPptxToPdf } from "./src/utils/convertPptxToPdf.ts";
import { getDataPrompt } from "./src/utils/credentials.ts";

async function processFile(fileName: string) {
  try {
    logger.info(`🧾 Reading file: ${fileName}`);
    [PDF_DATA_FOLDER, JSON_DATA_FOLDER].map((folder) => fs.ensureDir(folder));
    let pdfFilePath = path.join(PDF_DATA_FOLDER, fileName);

    // Convert PPTX to PDF if necessary
    if (path.extname(fileName).toLowerCase() === ".pptx") {
      logger.info(`🔄 Converting PPTX to PDF: ${fileName}`);
      const pdfFileName = `${path.basename(fileName, ".pptx")}.pdf`;
      pdfFilePath = path.join(PDF_DATA_FOLDER, pdfFileName);
      await convertPptxToPdf(path.join(PDF_DATA_FOLDER, fileName), pdfFilePath);
      logger.info(`✅ Conversion complete: ${pdfFilePath}`);
    }

    const ocrDataText = await pdfOcr(pdfFilePath);
    logger.info(`📄 OCR Data Text: ${ocrDataText}`);

    const parsedData = await parseOcrText(ocrDataText, getDataPrompt);
    logger.info("JSON Schema: ", parsedData);

    const jsonFileName = `${path.basename(
      fileName,
      path.extname(fileName)
    )}.json`;
    const jsonFilePath = path.join(JSON_DATA_FOLDER, jsonFileName);
    await fs.writeJson(jsonFilePath, parsedData, { spaces: 2 });
    logger.info(`💾 JSON data saved to: ${jsonFilePath}`);
  } catch (err) {
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
          return processFile(file);
        } else {
          logger.info(`Skipping unsupported file format: ${file}`);
          return Promise.resolve();
        }
      })
    );

    logger.info("All files processed successfully.");
  } catch (err) {
    logger.error(`An error occurred during file processing: ${err.message}`);
  }
}

await main();
