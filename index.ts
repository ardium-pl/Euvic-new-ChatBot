import "dotenv/config";
import ansis from "ansis";
import cors from "cors";
import express from "express";
import { sqlTranslatorRouter } from "./src/features/sql-translator/sqlTranslatorRouter";
import webhookRouter from "./src/features/meta-handling/serives/webhook";
import { PORT } from "./src/core/config";
import cron from "node-cron";
import { processAllFiles } from "./src/features/data-generator/main";

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
    await processAllFiles();
  } catch (err) {
    throw err;
  }
});

// cron.schedule("0 */2 * * *", async () => {
//   console.log("Running processAllFiles cron job");
//   try {
//     await processAllFiles();
//   } catch (error) {
//     console.error("Error running processAllFiles:", error);
//   }
// });
