import "dotenv/config";
import express, { Router } from "express";
import { SharePointService } from "./sharepointService";
import { processFile } from "../processFilesToJson";
import { logger } from "../utils/logger";
import { SITE_ID, DOCUMENT_LIBRARY } from "../../config";

const sharepointRouter: Router = express.Router();

sharepointRouter.post("/webhook/sharepoint", async (req, res) => {
  logger.info(`🔔 Otrzymano webhook z SharePointa`, req.body);
  try {
    if(req.body){
      res.status(200).send(req.body.validationToken);
      return
    } 
    
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
  } catch (error) {
    logger.error(`❌ Błąd w webhooku`);
    res.status(500).send("Błąd serwera");
  }
});
export default sharepointRouter;
