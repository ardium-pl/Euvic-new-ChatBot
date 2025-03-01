import fs from 'fs';
import path from 'path';
import libre from 'libreoffice-convert';
import { logger } from './logger';

/**
 * Converts a PPTX file to PDF format.
 * @param filePath - The path to the input PPTX file.
 * @param outputPath - Optional path for the output PDF file.
 * @returns A promise that resolves when the conversion is complete.
 */
export async function convertPptxToPdf(filePath: string, outputPath: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const extend = '.pdf';

        // Determine the output path
        if (!outputPath) {
            const dirname = path.dirname(filePath);
            const basename = path.basename(filePath, path.extname(filePath));
            outputPath = path.join(dirname, `${basename}${extend}`);
            logger.info(`Determined output path: ${outputPath}`);
        }

        try {
            // Read the PPTX file
            logger.info(`Reading file from path: ${filePath}`);
            const file = fs.readFileSync(filePath);

            // Start the conversion process
            logger.info(`Starting conversion from PPTX to PDF for file: ${filePath}`);
            libre.convert(file, extend, undefined, (err, done) => {
                if (err) {
                    logger.error(`Error converting file: ${err}`);
                    reject(`Error converting file: ${err}`);
                    return;
                }

                // Write the PDF file
                logger.info(`Writing converted PDF to path: ${outputPath}`);
                fs.writeFileSync(outputPath, done);
                
                // Delete the original PPTX file after successful conversion
                logger.info(`Attempting to delete original PPTX file: ${filePath}`);
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) {
                        logger.error(`Error deleting original file: ${unlinkErr}`);
                        reject(`Error deleting original file: ${unlinkErr}`);
                    } else {
                        logger.info(`Successfully deleted original PPTX file: ${filePath}`);
                        resolve();
                    }
                });
            });
        } catch (readErr) {
            logger.error(`Error reading file: ${readErr}`);
            reject(`Error reading file: ${readErr}`);
        }
    });
}
