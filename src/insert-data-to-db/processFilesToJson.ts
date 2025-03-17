import fs from "fs-extra";
import path from "path";
import { addDataToDB } from "./db/app.ts";
import { pdfOcr } from "./ocr/ocr.ts";
import { SharePointService } from "./sharepoint/sharepointService.ts";
import { checkIfFileExists } from "./sharepoint/sharepointSql.ts";
import { convertPptxToPdf } from "./utils/convertPptxToPdf.ts";
import {
  getDataPrompt,
  JSON_DATA_FOLDER,
  PDF_DATA_FOLDER,
} from "./utils/credentials.ts";
import { logger } from "./utils/logger.ts";
import { jsonFixes } from "./verifcation-json-data/jsonMainFixer.ts";
import { FileData } from "./zod-json/dataJsonSchema.ts";
import { parseOcrText } from "./zod-json/dataProcessor.ts";

export async function processFile(
  fileName: string,
  fileItemId: string,
  fileLink: string,
  jsonData: FileData[]
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
    logger.info(`📄 OCR Data Text: ${ocrDataText}`);
    if (!getDataPrompt) return null;
    const parsedData = await parseOcrText(ocrDataText, getDataPrompt);
    logger.info("JSON was made !");

    // Weryfikacja JSON
    const finalData = await jsonFixes(parsedData, ocrDataText);

    const fileJsonData: FileData = {
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
  const jsonData: FileData[] = [];
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

    if(jsonData.length > 0){

      logger.info("WANTED TO ADD DATA TO DB");
      // await addDataToDB();
    }

  } catch (error) {
    logger.error("Error processing all files:", error);
  }
}
