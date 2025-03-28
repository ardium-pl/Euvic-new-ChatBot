import "dotenv/config";
import ansis from "ansis";
import cors from "cors";
import express from "express";
import { sqlTranslatorRouter } from "./src/sql-translator/sqlTranslatorRouter";
import webhookRouter from "./src/meta-handling/whatsapp/webhook";
import { PORT } from "./src/core/config";
import cron from "node-cron";
import { processAllFiles } from "./src/insert-data-to-db/processFilesToJson";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(sqlTranslatorRouter);
app.use(webhookRouter);

// Startup
console.log(`Starting server...`);
app.listen(PORT, async () => {
  console.log(`Running on port ${ansis.greenBright.underline(String(PORT))}!`);
  try {
    console.log(`Connected to database!`);
  } catch (err) {
    throw err;
  }
});

cron.schedule("0 */2 * * *", async () => {
  console.log("Running processAllFiles cron job");
  try {
    await processAllFiles();
  } catch (error) {
    console.error("Error running processAllFiles:", error);
  }
});
