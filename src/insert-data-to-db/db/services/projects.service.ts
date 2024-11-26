import { db } from "../config/database";
import { ExistingRow, Project } from "../models/dataDBMoldes";
import chalk from "chalk";

export async function addProjectsToDB(projectsData: Project[]) {
  for (const project of projectsData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const [clientRows] = await connection.execute(
        "SELECT id FROM klienci WHERE nazwa = ?",
        [project.clientName]
      );
      const [industryRows] = await connection.execute(
        "SELECT id FROM branze WHERE nazwa = ?",
        [project.industryName]
      );
      const [businessCaseRows] = await connection.execute(
        "SELECT id FROM biznes_casy WHERE opis = ?",
        [project.businessCase]
      );

      if (
        (industryRows as ExistingRow[]).length === 0 ||
        (clientRows as ExistingRow[]).length === 0 ||
        (businessCaseRows as ExistingRow[]).length === 0
      ) {
        console.error(
          chalk.red(
            `❌ One or more foreign keys for project "${project.description}" not found in the database.`
          )
        );
        await connection.rollback();
        continue;
      }

      const clientId = (clientRows as ExistingRow[])[0].id;
      const industryId = (industryRows as ExistingRow[])[0].id;
      const businessCaseId = (businessCaseRows as ExistingRow[])[0].id;

      const referenceDate = (() => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(project.referenceDate)) {
          return project.referenceDate; // Pełna data w formacie YYYY-MM-DD
        }

        if (/^\d{4}-\d{2}$/.test(project.referenceDate)) {
          return `${project.referenceDate}-01`; // Rok i miesiąc w formacie YYYY-MM → YYYY-MM-01
        }

        if (/^\d{4}$/.test(project.referenceDate)) {
          return `${project.referenceDate}-01-01`; // Tylko rok w formacie YYYY → YYYY-01-01
        }

        console.warn(
          `💡 Invalid date format "${project.referenceDate}". Setting to NULL.`
        );
        return null;
      })();

      const [existingProjectRows] = await connection.execute(
        "SELECT id FROM projekty WHERE id_klienta = ? AND id_branzy = ? AND id_bizn_case = ? AND opis = ?",
        [clientId, industryId, businessCaseId, project.description]
      );

      if ((existingProjectRows as ExistingRow[]).length === 0) {
        await connection.execute(
          `INSERT INTO projekty 
          (nazwa, opis, id_klienta, id_branzy, id_bizn_case, data_referencji, skala_wdrozenia_wartosc, skala_wdrozenia_opis)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            project.projectName,
            project.description,
            clientId,
            industryId,
            businessCaseId,
            referenceDate,
            project.implementationScaleValue,
            project.implementationScaleDescription,
          ]
        );
        console.log(
          chalk.green(
            `✅ Project "${project.projectName}" added to the database.`
          )
        );
      } else {
        console.log(
          chalk.yellow(
            `⚠️ Project "${project.description}" already exists in the database.`
          )
        );
      }

      await connection.commit();
    } catch (error) {
      console.error(
        chalk.red(`❌ Error adding project "${project.description}":`, error)
      );
      await connection.rollback();
    } finally {
      connection.release();
    }
  }
}
