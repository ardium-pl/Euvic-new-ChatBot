import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import { executeSQL } from "../../src/sql-translator/database/mySql";
import { RowDataPacket } from "mysql2";
import fs from "fs-extra";
import { DB_DATA_FILENAME, SQL_FOR_DATA } from "../utils/utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DATA_PATH = path.resolve(__dirname, DB_DATA_FILENAME);

async function fetchDbData() {
  console.log("Proszenie bazy danych o dane...");

  const rawData = await executeSQL<RowDataPacket[]>(SQL_FOR_DATA);

  if (!rawData) {
    console.log("Nie dostano odpowiedzi od bazy...");
    return;
  }
  console.log("Otrzymano dane od bazy danych!");

  const data = JSON.stringify(rawData, null, 2);
  console.log(`Zapisywanie do pliku: ${DB_DATA_PATH}`);
  fs.writeJsonSync(DB_DATA_PATH, rawData, { spaces: 2 });
  console.log("Zapisywanie do pliku udane!");
}

if (process.argv[1] === __filename) {
  await fetchDbData();
  process.exit(0);
}
