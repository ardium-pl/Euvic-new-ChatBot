import { db } from "../config/database";
import chalk from "chalk";
import { BusinessCasesProject, ExistingRow } from "../models/dataDBMoldes";

export async function addBusinessCaseProjectsToDB(
  businessCaseProjects: BusinessCasesProject[]
) {
  for (const businessCaseProject of businessCaseProjects) {
    try {
      const [projectRows] = await db.execute(
        "SELECT id FROM projekty WHERE nazwa = ?",
        [businessCaseProject.projectName]
      );

      if ((projectRows as ExistingRow[]).length === 0) {
        console.log(
          chalk.yellow(
            `⚠️ Project "${businessCaseProject.projectName}" not found in the database.`
          )
        );
        continue;
      }

      const projectId = (projectRows as ExistingRow[])[0].id;

      for (const businessCaseName of businessCaseProject.businessCases) {
        const [businessCaseRows] = await db.execute(
          "SELECT id FROM biznes_casy WHERE opis = ?",
          [businessCaseName]
        );

        if ((businessCaseRows as ExistingRow[]).length === 0) {
          console.log(
            chalk.yellow(
              `⚠️ Business Case "${businessCaseName}" not found in the database.`
            )
          );
          continue;
        }

        const businessCaseId = (businessCaseRows as ExistingRow[])[0].id;

        const [existingRows] = await db.execute(
          "SELECT * FROM biznes_casy_projekty WHERE id_proj = ? AND id_biznes_case = ?",
          [projectId, businessCaseId]
        );

        if ((existingRows as ExistingRow[]).length === 0) {
          await db.execute(
            "INSERT INTO biznes_casy_projekty (id_proj, id_biznes_case) VALUES (?, ?)",
            [projectId, businessCaseId]
          );
          console.log(
            chalk.green(
              `✅ Added relationship: Business Case "${businessCaseName}" to Project "${businessCaseProject.projectName}".`
            )
          );
        } else {
          console.log(
            chalk.cyan(
              `ℹ️ Relationship between Business Case "${businessCaseName}" and Project "${businessCaseProject.projectName}" already exists.`
            )
          );
        }
      }
    } catch (error) {
      console.error(
        chalk.red(
          `❌ Error adding relationship for Project "${businessCaseProject.projectName}":`,
          error
        )
      );
    }
  }
}
