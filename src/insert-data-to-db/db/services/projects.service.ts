import { db } from "../config/database";
import { Project } from "../models/dataDBMoldes";
import chalk from "chalk";

export async function addProjectsToDB(projectsData: Project[]) {
  for (const project of projectsData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const referenceDate = (() => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(project.referenceDate))
          return project.referenceDate;
        if (/^\d{4}-\d{2}$/.test(project.referenceDate))
          return `${project.referenceDate}-01`;
        if (/^\d{4}$/.test(project.referenceDate))
          return `${project.referenceDate}-01-01`;
        console.warn(
          `💡 Invalid date format "${project.referenceDate}". Setting to NULL.`
        );
        return null;
      })();
      const scaleValue = Math.min(project.implementationScaleValue, 2147483647);
      try {
        await connection.execute(
          `INSERT INTO projekty 
          (nazwa, opis, id_klienta, id_branzy, data_referencji, skala_wdrozenia_wartosc, skala_wdrozenia_opis)
          VALUES (?, ?, 
            (SELECT id FROM klienci WHERE nazwa = ?), 
            (SELECT id FROM branze WHERE nazwa = ?), 
            ?, ?, ?)`,
          [
            project.projectName,
            project.description,
            project.clientName,
            project.industryName,
            referenceDate,
            scaleValue,
            project.implementationScaleDescription,
          ]
        );
        console.log(
          chalk.green(
            `✅ Project "${project.projectName}" added to the database.`
          )
        );
      } catch (insertError: any) {
        if (insertError.code === "ER_DUP_ENTRY") {
          console.log(
            chalk.yellow(
              `⚠️ Project "${project.projectName}" already exists in the database.`
            )
          );
        } else if (insertError.code === "ER_NO_REFERENCED_ROW") {
          console.error(
            chalk.red(
              `❌ Missing foreign key for project "${project.projectName}". Check client or industry.`
            )
          );
        } else {
          throw insertError;
        }
      }

      await connection.commit();
    } catch (error) {
      console.error(
        chalk.red(`❌ Error adding project "${project.projectName}":`, error)
      );
      await connection.rollback();
    } finally {
      connection.release();
    }
  }
}
