import fs from "fs";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const txtFilePath = path.join(__dirname, "clients.txt");

export async function loadClientsFromTxt(
  filePath: string
): Promise<Set<string>> {
  try {
    const data = await fs.promises.readFile(filePath, "utf-8");
    const clients = new Set(
      data
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
    );
    return clients;
  } catch (error) {
    console.error(chalk.red(`❌ Error reading clients file:`, error));
    return new Set();
  }
}
