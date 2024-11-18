import express from 'express';
import { logger } from '../insert-data-to-db/utils/logger';

export const router = express.Router();

router.post("/language-to-sql", async (req, res) => {
    logger.info("📩 Received a new POST request.");
  
    const userQuery = req.body?.query;
  
    if (!userQuery) {
      res.status(400).json({ status: "error", errorCode: "NO_QUERY_ERR" });
      return
    }


    res.status(200).json({
        status: "success",
        question: userQuery,
      });

});