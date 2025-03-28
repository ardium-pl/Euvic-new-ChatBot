import { FileDataType } from "../zod-json/dataJsonSchema";
import { processData } from "./utils/processData";
import chalk from "chalk";

export async function addDataToDB(jsonData: FileDataType[]) {
  console.log(chalk.blue("🚀 Starting the data processing application..."));

  try {
    console.log(chalk.blue("🔄 Starting data processing..."));
    await processData(jsonData);
    console.log(chalk.green("✅ Data processing completed successfully."));
  } catch (error) {
    console.error(
      chalk.red("❌ An error occurred during the application execution:"),
      error
    );
  }
}
