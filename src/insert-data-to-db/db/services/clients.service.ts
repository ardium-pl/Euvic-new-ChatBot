import { DataClient } from "../models/dataDBMoldes";
import { db } from "../config/database";
import chalk from "chalk";

export async function addClientsToDB(clientsData: DataClient[]) {
  for (const client of clientsData) {
    try {
      // Pobieranie ID branży na podstawie nazwy branży
      const [industryRows] = await db.execute(
        "SELECT id FROM branze WHERE nazwa = ?",
        [client.industry]
      );

      if ((industryRows as any[]).length === 0) {
        console.log(
          chalk.red(
            `❌ Industry "${client.industry}" not found in the database.`
          )
        );
        continue;
      }

      const industryId = (industryRows as any[])[0].id;

      // Sprawdzanie, czy klient już istnieje
      const [clientRows] = await db.execute(
        "SELECT id FROM klienci WHERE nazwa = ? AND id_branzy = ?",
        [client.name, industryId]
      );

      if ((clientRows as any[]).length === 0) {
        // Dodanie nowego klienta
        await db.execute(
          "INSERT INTO klienci (nazwa, id_branzy) VALUES (?, ?)",
          [client.name, industryId]
        );
        console.log(
          chalk.green(`✅ Client "${client.name}" added to the database.`)
        );
      } else {
        console.log(
          chalk.yellow(
            `⚠️ Client "${client.name}" already exists in the database.`
          )
        );
      }
    } catch (error) {
      console.error(
        chalk.red(`❌ Error adding client "${client.name}":`, error)
      );
    }
  }
}
