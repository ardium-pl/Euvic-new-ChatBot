import { db } from "../config/database";
import { TechnologyProject } from "../models/dataDBMoldes";
import chalk from "chalk";

export async function addTechnologyProjectsToDB(
  technologyProjects: TechnologyProject[]
) {
  for (const techProject of technologyProjects) {
    try {
      const [projectRows] = await db.execute(
        "SELECT id FROM projekty WHERE nazwa = ?",
        [techProject.projectName]
      );

      if ((projectRows as any[]).length === 0) {
        console.log(
          chalk.yellow(
            `⚠️ Project "${techProject.projectName}" not found in the database.`
          )
        );
        continue;
      }

      const projectId = (projectRows as any[])[0].id;

      for (const technologyName of techProject.technologies) {
        const [technologyRows] = await db.execute(
          "SELECT id FROM technologie WHERE nazwa = ?",
          [technologyName]
        );

        if ((technologyRows as any[]).length === 0) {
          console.log(
            chalk.yellow(
              `⚠️ Technology "${technologyName}" not found in the database.`
            )
          );
          continue;
        }

        const technologyId = (technologyRows as any[])[0].id;

        const [existingRows] = await db.execute(
          "SELECT * FROM technologie_projekty WHERE id_tech = ? AND id_proj = ?",
          [technologyId, projectId]
        );

        if ((existingRows as any[]).length === 0) {
          await db.execute(
            "INSERT INTO technologie_projekty (id_tech, id_proj) VALUES (?, ?)",
            [technologyId, projectId]
          );
          console.log(
            chalk.green(
              `✅ Added relationship: Technology "${technologyName}" to Project "${techProject.projectName}".`
            )
          );
        } else {
          console.log(
            chalk.cyan(
              `ℹ️ Relationship between Technology "${technologyName}" and Project "${techProject.projectName}" already exists.`
            )
          );
        }
      }
    } catch (error) {
      console.error(
        chalk.red(
          `❌ Error adding relationship for Project "${techProject.projectName}":`,
          error
        )
      );
    }
  }
}
