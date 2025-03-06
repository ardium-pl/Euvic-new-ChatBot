import "dotenv/config";
import express, { Router } from "express";
import { SharePointService } from "./sharepointService";
import { processFile } from "../processFilesToJson";
import { logger } from "../utils/logger";
import { registerWebhook } from "./registerWebhook";

const SITE_ID = process.env.SITE_ID;
const DOCUMENT_LIBRARY = "Dokumenty";
const sharepointRouter: Router = express.Router();
await registerWebhook();

sharepointRouter.post("/webhook/sharepoint", async (req, res) => {

  try {
    const sharePointService = new SharePointService();

    const { value } = req.body;
    for (const event of value) {
      if (event.resourceData && event.changeType === "created") {
        const fileId = event.resourceData.id;
        logger.info(`📂 Nowy plik dodany do SharePoint: ${fileId}`);

        if (!SITE_ID) throw new Error("nie ma SITE_ID");
        const filePath = await sharePointService.downloadFile(
          SITE_ID,
          DOCUMENT_LIBRARY,
          fileId
        );

        if (filePath) {
          await processFile(filePath);
        }
      }
    }
    res.status(200).send("OK");
  } catch (error) {
    logger.error(`❌ Błąd w webhooku`);
    res.status(500).send("Błąd serwera");
  }
});
export default sharepointRouter;
