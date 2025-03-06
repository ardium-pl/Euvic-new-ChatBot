import ansis from "ansis";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { sqlTranslatorRouter } from "./src/sql-translator/sqlTranslatorRouter";
import sharepointRouter from "./src/insert-data-to-db/sharepoint/sharepointlistener";
import webhookRouter from "./src/meta-handling/whatsapp/webhook";
import { PORT } from "./src/config";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

app.use(sqlTranslatorRouter);
app.use(webhookRouter);
app.use(sharepointRouter);

// Startup
console.log(`Starting server...`);
app.listen(PORT, () => {
  console.log(`Running on port ${ansis.greenBright.underline(String(PORT))}!`);

  try {
    console.log(`Connected to database!`);
  } catch (err) {
    throw err;
  }
});
