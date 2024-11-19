import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { DataFile } from "./models";

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
