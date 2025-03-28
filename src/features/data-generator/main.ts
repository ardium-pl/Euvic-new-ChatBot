import fs from "fs-extra";
import path from "path";
import { pdfOcr } from "./services/ocr.ts";
import { convertPptxToPdf } from "./services/convertPptxToPdf.ts";
import {
  getDataPrompt,
  JSON_DATA_FOLDER,
  PDF_DATA_FOLDER,
} from "../../core/credentials.ts";
import { logger } from "../../core/logs/logger.ts";
import { parseOcrText } from "./services/ocrAiParser.ts";
import { FileDataType } from "../../core/models/dataTypes.ts";
import { jsonFixes } from "../verifcation-json-data/main.ts";
import { checkIfFileExists } from "../sharepoint/services/sharepointSql.ts";
import { SharePointService } from "../sharepoint/services/sharepointService.ts";
import { addDataToDB } from "../insert-data-to-db/main.ts";

export async function processFile(
  fileName: string,
  fileItemId: string,
  fileLink: string,
  jsonData: FileDataType[]
) {
  // TODO: Dorbić logikę z dodawaniem fileItemId oraz fileLink do naszej bazki
  try {
    logger.info(`🧾 Reading file: ${fileName}`);
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
    if (!getDataPrompt) return null;
    const parsedData = await parseOcrText(ocrDataText, getDataPrompt);
    logger.info("JSON was made !");

    // Weryfikacja JSON
    const finalData = await jsonFixes(parsedData, ocrDataText);

    const fileJsonData: FileDataType = {
      fileName,
      ocrText: ocrDataText,
      fileItemId,
      fileLink,
      customers: finalData.customers,
    };

    jsonData.push(fileJsonData);
  } catch (err: any) {
    logger.error(`Error processing file ${fileName}: ${err.message}`);
  }
}

export async function processAllFiles() {
  const sharePointService = new SharePointService();
  const jsonData: FileDataType[] = [];
  [PDF_DATA_FOLDER, JSON_DATA_FOLDER].map((folder) => fs.ensureDir(folder));
  try {
    const items = await sharePointService.getAllFilesFromList();

    await Promise.all(
      items.map(async (item) => {
        if (!item.driveItem || !item.id || !item.driveItem.id) return;

        const fileItemId = item.driveItem.id;
        const exists = await checkIfFileExists(fileItemId);
        if (exists) return;

        try {
          // In your main processing function
          const fileDetails = await sharePointService.getFileDetailsFromList(
            item.id
          );
          if (!fileDetails) return;

          const { fileName, downloadUrl } = fileDetails;
          const fileLink = item.webUrl;

          if (!fileLink) return logger.error("FileLink doesnt exist");

          const downloadSuccess = await sharePointService.downloadFile(
            downloadUrl,
            fileName
          );
          if (!downloadSuccess)
            return logger.error("File wasnt downloaded properly");

          logger.info(`Processing file: ${fileName}`);
          await processFile(fileName, fileItemId, fileLink, jsonData);
        } catch (error) {
          console.error(
            `Error downloading file for item with id: ${item.id}`,
            error
          );
        }
      })
    );

    if (jsonData.length > 0) {
      logger.info("WANTED TO ADD DATA TO DB");
      await addDataToDB(jsonData);
    }
  } catch (error) {
    logger.error("Error processing all files:", error);
  }
}
