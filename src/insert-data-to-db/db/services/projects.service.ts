import { db } from "../config/database";
import { Project } from "../models/dataMoldes";
import chalk from "chalk";

export async function addProjectsToDB(projectsData: Project[]) {
  for (const project of projectsData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Pobranie kluczy obcych
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

      // Sprawdzenie istnienia kluczy obcych
      if (
        (industryRows as any[]).length === 0 ||
        (clientRows as any[]).length === 0 ||
        (businessCaseRows as any[]).length === 0
      ) {
        console.error(
          chalk.red(
            `❌ One or more foreign keys for project "${project.description}" not found in the database.`
          )
        );
        await connection.rollback();
        continue;
      }

      const clientId = (clientRows as any[])[0].id;
      const industryId = (industryRows as any[])[0].id;
      const businessCaseId = (businessCaseRows as any[])[0].id;

      // Formatowanie daty
      const referenceDate = /^\d{4}$/.test(project.referenceDate)
        ? `${project.referenceDate}-01-01` // Rok -> dodajemy "01-01"
        : /^\d{4}-\d{2}$/.test(project.referenceDate)
        ? `${project.referenceDate}-01` // Rok i miesiąc -> dodajemy "-01" jako dzień
        : project.referenceDate; // Jeśli już pełna data, pozostawiamy bez zmian

      // Sprawdzenie istnienia projektu
      const [existingProjectRows] = await connection.execute(
        "SELECT id FROM projekty WHERE id_klienta = ? AND id_branzy = ? AND id_bizn_case = ? AND opis = ?",
        [clientId, industryId, businessCaseId, project.description]
      );

      if ((existingProjectRows as any[]).length === 0) {
        // Dodanie projektu
        await connection.execute(
          `INSERT INTO projekty 
          (nazwa, opis, id_klienta, id_branzy, id_bizn_case, data_referencji, skala_wdrozenia_wartosc, skala_wdrozenia_opis)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, // Dodano brakującą wartość
          [
            project.projectName, // Pierwszy parametr: nazwa projektu
            project.description, // Drugi parametr: opis projektu
            clientId, // Trzeci parametr: ID klienta
            industryId, // Czwarty parametr: ID branży
            businessCaseId, // Piąty parametr: ID biznes case
            referenceDate, // Szósty parametr: data referencji
            project.implementationScaleValue, // Siódmy parametr: wartość skali wdrożenia
            project.implementationScaleDescription, // Ósmy parametr: opis skali wdrożenia
          ]
        );
        console.log(
          chalk.green(
            `✅ Project "${project.description}" added to the database.`
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
