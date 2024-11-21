import mysql from "mysql2/promise";
import dotenv from "dotenv";
import {
  DataClient,
  DataFile,
  DataFileProject,
  Project,
  TechnologyProject,
} from "./models";
import { Client } from "@microsoft/microsoft-graph-client";

dotenv.config();

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306", 10),
  waitForConnections: true,
  connectionLimit: 10,
});

export async function addBusinessCasesToDB(businessCases: Set<string>) {
  for (const businessCase of businessCases) {
    try {
      // Sprawdzamy, czy businessCase już istnieje w bazie danych
      const [rows] = await db.execute(
        "SELECT id FROM biznes_casy WHERE opis = ?",
        [businessCase]
      );

      if ((rows as any[]).length === 0) {
        // Dodanie do tabeli business_cases, jeśli nie ma takiego opisu
        await db.execute("INSERT INTO biznes_casy (opis) VALUES (?)", [
          businessCase,
        ]);
        console.log(`Business case "${businessCase}" added to database.`);
      } else {
        console.log(
          `Business case "${businessCase}" already exists in the database.`
        );
      }
    } catch (error) {
      console.error("Error adding business case:", error);
    }
  }
}

export async function addTechnologiesToDB(technologies: Set<string>) {
  for (const technology of technologies) {
    try {
      // Sprawdzamy, czy technologia już istnieje w bazie danych
      const [rows] = await db.execute(
        "SELECT id FROM technologie WHERE nazwa = ?",
        [technology]
      );

      if ((rows as any[]).length === 0) {
        // Dodanie do tabeli technologie, jeśli nie ma takiej technologii
        await db.execute("INSERT INTO technologie (nazwa) VALUES (?)", [
          technology,
        ]);
        console.log(`Technology "${technology}" added to database.`);
      } else {
        console.log(
          `Technology "${technology}" already exists in the database.`
        );
      }
    } catch (error) {
      console.error("Error adding technology:", error);
    }
  }
}

export async function addIndustriesToDB(industries: Set<string>) {
  for (const industry of industries) {
    try {
      // Sprawdzamy, czy branża już istnieje w bazie danych
      const [rows] = await db.execute("SELECT id FROM branze WHERE nazwa = ?", [
        industry,
      ]);

      if ((rows as any[]).length === 0) {
        // Dodanie do tabeli branze, jeśli nie ma takiej branży
        await db.execute("INSERT INTO branze (nazwa) VALUES (?)", [industry]);
        console.log(`Industry "${industry}" added to database.`);
      } else {
        console.log(`Industry "${industry}" already exists in the database.`);
      }
    } catch (error) {
      console.error("Error adding industry:", error);
    }
  }
}

export async function addFilesToDB(dataFiles: DataFile[]) {
  for (const file of dataFiles) {
    try {
      // Sprawdzamy, czy plik już istnieje w bazie danych
      const [rows] = await db.execute("SELECT id FROM pliki WHERE nazwa = ?", [
        file.nazwa,
      ]);

      if ((rows as any[]).length === 0) {
        // Dodanie do tabeli pliki, jeśli nie ma pliku o tej nazwie
        await db.execute(
          "INSERT INTO pliki (nazwa, zawartosc_ocr) VALUES (?, ?)",
          [file.nazwa, file.zawartosc_ocr]
        );
        console.log(`File "${file.nazwa}" added to database.`);
      } else {
        console.log(`File "${file.nazwa}" already exists in the database.`);
      }
    } catch (error) {
      console.error(`Error adding file "${file.nazwa}":`, error);
    }
  }
}

export async function addClientsToDB(clientsData: DataClient[]) {
  for (const client of clientsData) {
    try {
      // Retrieve the industry ID from the `branze` table
      const [industryRows] = await db.execute(
        "SELECT id FROM branze WHERE nazwa = ?",
        [client.industry]
      );

      if ((industryRows as any[]).length === 0) {
        console.error(
          `Industry "${client.industry}" not found in the database.`
        );
        continue; // Skip this client if the industry is not found
      }

      const industryId = (industryRows as any[])[0].id;

      // Check if the client already exists in the `klienci` table
      const [clientRows] = await db.execute(
        "SELECT id FROM klienci WHERE nazwa = ? AND id_branzy = ?",
        [client.name, industryId]
      );

      if ((clientRows as any[]).length === 0) {
        // Insert the client into the `klienci` table
        await db.execute(
          "INSERT INTO klienci (nazwa, id_branzy) VALUES (?, ?)",
          [client.name, industryId]
        );
        console.log(`Client "${client.name}" added to the database.`);
      } else {
        console.log(`Client "${client.name}" already exists in the database.`);
      }
    } catch (error) {
      console.error(`Error adding client "${client.name}":`, error);
    }
  }
}

export async function addProjectsToDB(projectsData: Project[]) {
  for (const project of projectsData) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Pobieramy id_klienta, id_branzy, id_bizn_case
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

export async function addTechnologyProjectsToDB(
  technologyProjects: TechnologyProject[]
) {
  for (const techProject of technologyProjects) {
    try {
      // Pobierz ID projektu na podstawie nazwy projektu
      const [projectRows] = await db.execute(
        "SELECT id FROM projekty WHERE opis = ?",
        [techProject.projectName]
      );

      if ((projectRows as any[]).length === 0) {
        console.error(
          `Project "${techProject.projectName}" not found in the database.`
        );
        continue; // Pomijamy, jeśli projekt nie istnieje
      }

      const projectId = (projectRows as any[])[0].id;

      for (const technologyName of techProject.technologies) {
        // Pobierz ID technologii na podstawie nazwy technologii
        const [technologyRows] = await db.execute(
          "SELECT id FROM technologie WHERE nazwa = ?",
          [technologyName]
        );

        if ((technologyRows as any[]).length === 0) {
          console.error(
            `Technology "${technologyName}" not found in the database.`
          );
          continue; // Pomijamy, jeśli technologia nie istnieje
        }

        const technologyId = (technologyRows as any[])[0].id;

        // Sprawdź, czy relacja już istnieje
        const [existingRows] = await db.execute(
          "SELECT * FROM technologie_projekty WHERE id_tech = ? AND id_proj = ?",
          [technologyId, projectId]
        );

        if ((existingRows as any[]).length === 0) {
          // Dodaj relację do tabeli `technologie_projekty`
          await db.execute(
            "INSERT INTO technologie_projekty (id_tech, id_proj) VALUES (?, ?)",
            [technologyId, projectId]
          );
          console.log(
            `Added relationship: Technology "${technologyName}" to Project "${techProject.projectName}".`
          );
        } else {
          console.log(
            `Relationship between Technology "${technologyName}" and Project "${techProject.projectName}" already exists.`
          );
        }
      }
    } catch (error) {
      console.error(
        `Error adding relationship for Project "${techProject.projectName}":`,
        error
      );
    }
  }
}

export async function addFileProjectsToDB(fileProjects: DataFileProject[]) {
  for (const fileProject of fileProjects) {
    try {
      // Pobieramy `id_projektu` na podstawie nazwy projektu
      const [projectRows] = await db.execute(
        "SELECT id FROM projekty WHERE opis = ?",
        [fileProject.projectName]
      );

      // Pobieramy `id_pliku` na podstawie nazwy pliku
      const [fileRows] = await db.execute(
        "SELECT id FROM pliki WHERE nazwa = ?",
        [fileProject.fileName]
      );

      if (
        (projectRows as any[]).length === 0 ||
        (fileRows as any[]).length === 0
      ) {
        console.error(
          `File "${fileProject.fileName}" or project "${fileProject.projectName}" not found in the database.`
        );
        continue; // Pomijamy, jeśli projekt lub plik nie istnieje
      }

      const projectId = (projectRows as any[])[0].id;
      const fileId = (fileRows as any[])[0].id;

      // Sprawdzamy, czy relacja już istnieje w tabeli `pliki_projekty`
      const [existingRelationRows] = await db.execute(
        "SELECT id_pliku, id_proj FROM pliki_projekty WHERE id_pliku = ? AND id_proj = ?",
        [fileId, projectId]
      );

      if ((existingRelationRows as any[]).length === 0) {
        // Wstawiamy nową relację do tabeli `pliki_projekty`
        await db.execute(
          "INSERT INTO pliki_projekty (id_pliku, id_proj) VALUES (?, ?)",
          [fileId, projectId]
        );
        console.log(
          `File-project relationship added: File "${fileProject.fileName}" -> Project "${fileProject.projectName}".`
        );
      } else {
        console.log(
          `File-project relationship already exists: File "${fileProject.fileName}" -> Project "${fileProject.projectName}".`
        );
      }
    } catch (error) {
      console.error(
        `Error adding file-project relationship: File "${fileProject.fileName}" -> Project "${fileProject.projectName}".`,
        error
      );
    }
  }
}
