import vision from "@google-cloud/vision";
import fs from "fs-extra";
import path from "path";
import { convertPdfToImages } from "../utils/convertPdfToImages";
import { deleteFile } from "../utils/deleteFile";
import { logger } from "../utils/logger";
import { IMAGES_FOLDER, OUTPUT_TEXT_FOLDER } from "../utils/credentials";

const VISION_AUTH = {
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL as string,
    private_key: (process.env.GOOGLE_PRIVATE_KEY as string).replace(
      /\\n/g,
      "\n"
    ), // Handling the private key newline issue
  },
  fallback: true,
};

export async function pdfOcr(pdfFilePath: string): Promise<string> {
  const fileNameWithoutExt = path.basename(pdfFilePath, ".pdf");

  await Promise.all([IMAGES_FOLDER, OUTPUT_TEXT_FOLDER].map(fs.ensureDir));

  try {
    const imageFilePaths: string[] = await convertPdfToImages(
      pdfFilePath,
      IMAGES_FOLDER
    );

    if (imageFilePaths.length === 0) {
      logger.error("No images were generated from the PDF");
      return "";
    }

    const ocrResults = await Promise.all(
      imageFilePaths.map(async (imageFilePath): Promise<string> => {
        const ocrResult = await fileOcr(imageFilePath);
        if (ocrResult) {
          return ocrResult;
        } else {
          logger.warn(`No text found in image: ${imageFilePath}`);
          return "";
        }
      })
    );

    const concatenatedResults = ocrResults.join("");

    await _saveDataToTxt(
      OUTPUT_TEXT_FOLDER,
      fileNameWithoutExt,
      concatenatedResults
    );

    logger.info(
      ` 💚 Successfully processed and saved the OCR results for ${pdfFilePath}`
    );

    for (const imageFilePath of imageFilePaths) {
      logger.warn(`Deleting temporary image: ${imageFilePath}`);
      deleteFile(imageFilePath);
    }
    deleteFile(pdfFilePath);
    return concatenatedResults;
  } catch (err: any) {
    logger.error(`Error processing ${pdfFilePath}:`, err);
    return "";
  }
}

async function _saveDataToTxt(
  folder: string,
  fileNameWithoutExt: string,
  text: string
): Promise<void> {
  const textPath = path.join(folder, `${fileNameWithoutExt}.txt`);

  try {
    await fs.writeFile(textPath, text, "utf8");
    logger.info(` 💚 Successfully saved the text file at: ${textPath}`);
  } catch (err: any) {
    logger.error(`Error saving the text file: ${err.message}`);
  }
}

export async function fileOcr(imageFilePath: string): Promise<string | null> {
  const client = new vision.ImageAnnotatorClient(VISION_AUTH);

  logger.info(` 🕶️ Processing image with Google Vision: ${imageFilePath}`);
  try {
    const [result] = await client.documentTextDetection(imageFilePath);

    const googleVisionText = result.fullTextAnnotation?.text;

    if (!googleVisionText) {
      logger.warn(`No text found in image: ${imageFilePath}`);
      return null;
    }

    logger.info(` 💚 Successfully processed image ${imageFilePath}`);
    return googleVisionText;
  } catch (err: any) {
    logger.error(`Error during Google Vision OCR processing: ${err.message}`);
    return null;
  }
}
