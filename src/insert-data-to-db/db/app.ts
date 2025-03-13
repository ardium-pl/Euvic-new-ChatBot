import { db } from "./config/database";
import { processData } from "./utils/processData";
import chalk from "chalk";

export async function addDataToDB() {
  console.log(chalk.blue("🚀 Starting the data processing application..."));

  try {
    console.log(chalk.blue("🔄 Testing database connection..."));
    const [rows] = await db.query("SELECT 1");
    if (rows) {
      console.log(chalk.green("✅ Database connection successful!"));
    }

    console.log(chalk.blue("🔄 Starting data processing..."));
    await processData();
    console.log(chalk.green("✅ Data processing completed successfully."));
  } catch (error) {
    console.error(
      chalk.red("❌ An error occurred during the application execution:"),
      error
    );
  } finally {
    try {
      await db.end();
      console.log(chalk.yellow("🔒 Database connection closed."));
    } catch (err) {
      console.error(
        chalk.red("❌ Failed to close the database connection:"),
        err
      );
    }
  }
}
