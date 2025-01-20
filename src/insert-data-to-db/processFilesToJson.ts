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

async function processFile(fileName: string) {
  try {
    logger.info(`🧾 Reading file: ${fileName}`);
    [PDF_DATA_FOLDER, JSON_DATA_FOLDER].map((folder) => fs.ensureDir(folder));
    let pdfFilePath = path.join(PDF_DATA_FOLDER, fileName);

    const ocrDataText = await pdfOcr(pdfFilePath);
    logger.info(`📄 OCR Data Text: ${ocrDataText}`);
    if (!getDataPrompt) return null;
    const parsedData = await parseOcrText(ocrDataText, getDataPrompt);
    logger.info("JSON Schema: ", parsedData);

    const fileJsonData: FileData = {
      fileName: fileName,
      ocrText: ocrDataText,
      customers: parsedData.customers,
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
      files.map((fileName) => {
        const fileExtension = path.extname(fileName).toLowerCase();

        if (fileExtension === ".pdf") { //TODO: tutaj dodac elif na pliki które są wordem
          return processFile(fileName);

        } else if (fileExtension === ".pptx") {

          logger.info(`🔄 Converting PPTX to PDF: ${fileName}`);
          let pdfFilePath = path.join(PDF_DATA_FOLDER, fileName);
          const pdfFileName = `${path.basename(fileName, ".pptx")}.pdf`;
          pdfFilePath = path.join(PDF_DATA_FOLDER, pdfFileName);
          convertPptxToPdf(path.join(PDF_DATA_FOLDER, fileName), pdfFilePath);
          logger.info(`✅ Conversion complete: ${pdfFilePath}`);

          return processFile(fileName)

        } else if (fileExtension === ".doc") {

          // logger.info(`🔄 Converting DOC to PDF: ${fileName}`);
          // let pdfFilePath = path.join(PDF_DATA_FOLDER, fileName);
          // const pdfFileName = `${path.basename(fileName, ".doc")}.pdf`;
          // pdfFilePath = path.join(PDF_DATA_FOLDER, pdfFileName);
          // convertDocToPdf(path.join(PDF_DATA_FOLDER, fileName), pdfFilePath);
          // logger.info(`✅ Conversion complete: ${pdfFilePath}`);

          // return processFile(fileName)
          logger.info(`Skipping .doc file format: ${fileName} (Module not implemented yet)`);
          return Promise.resolve();

        } else {
          logger.info(`Skipping unsupported file format: ${fileName}`);
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
