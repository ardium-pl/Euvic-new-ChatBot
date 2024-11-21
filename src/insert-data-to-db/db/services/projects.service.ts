import { db } from "../config/database";
import { Project } from "../models";

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
        (industryRows as any[]).length === 0 ||
        (clientRows as any[]).length === 0 ||
        (businessCaseRows as any[]).length === 0
      ) {
        console.error(`One foreign key of the project was not found.`);
        await connection.rollback();
        continue;
      }

      const clientId = (clientRows as any[])[0].id;
      const industryId = (industryRows as any[])[0].id;
      const businessCaseId = (businessCaseRows as any[])[0].id;

      const referenceDate = /^\d{4}$/.test(project.referenceDate)
        ? `${project.referenceDate}-01-01`
        : project.referenceDate;

      const [existingProjectRows] = await connection.execute(
        "SELECT id FROM projekty WHERE id_klienta = ? AND id_branzy = ? AND id_bizn_case = ? AND opis = ?",
        [clientId, industryId, businessCaseId, project.description]
      );

      if ((existingProjectRows as any[]).length === 0) {
        await connection.execute(
          `INSERT INTO projekty 
          (id_klienta, id_branzy, id_bizn_case, opis, data_referencji, skala_wdrozenia_wartosc, skala_wdrozenia_opis)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            clientId,
            industryId,
            businessCaseId,
            project.description,
            referenceDate,
            project.implementationScaleValue,
            project.implementationScaleDescription,
          ]
        );
        console.log(`Project "${project.description}" added to the database.`);
      } else {
        console.log(
          `Project "${project.description}" already exists in the database.`
        );
      }

      await connection.commit();
    } catch (error) {
      console.error(`Error adding project "${project.description}":`, error);
      await connection.rollback();
    } finally {
      connection.release();
    }
  }
}
