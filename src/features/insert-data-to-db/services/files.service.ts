import { queryDb } from "../../../core/database/mySql/mysqlQueries";
import { DataFile } from "../models/dataDBMoldes";
import chalk from "chalk";

export async function addFilesToDB(dataFiles: DataFile[]) {
  if (dataFiles.length === 0) {
    console.log(chalk.yellow(`⚠️ No files to add.`));
    return;
  }

  const values = dataFiles.map(() => "(?, ?,?,?)").join(", ");
  const params = dataFiles.flatMap((file) => [
    file.nazwa,
    file.zawartosc_ocr,
    file.link_do_pliku,
    file.sharepoint_id,
  ]);

  try {
    const result: any = await queryDb(
      `INSERT INTO pliki (nazwa, zawartosc_ocr,link_do_pliku,sharepoint_id ) VALUES ${values}
       ON DUPLICATE KEY UPDATE nazwa = nazwa`,
      params
    );

    const affectedRows = result[0]?.affectedRows || 0;
    const insertedRows = affectedRows - dataFiles.length;

    if (insertedRows > 0) {
      console.log(
        chalk.green(`✅ Added ${insertedRows} new files to the database.`)
      );
    }
    if (affectedRows > insertedRows) {
      console.log(
        chalk.yellow(
          `⚠️ ${
            affectedRows - insertedRows
          } files were already in the database.`
        )
      );
    }
  } catch (error: any) {
    console.error(chalk.red(`❌ Error adding files to the database:`, error));
  }
}
