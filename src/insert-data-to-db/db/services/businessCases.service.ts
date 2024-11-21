import { db } from "../config/database";

export async function addBusinessCasesToDB(businessCases: Set<string>) {
  for (const businessCase of businessCases) {
    try {
      const [rows] = await db.execute(
        "SELECT id FROM biznes_casy WHERE opis = ?",
        [businessCase]
      );

      if ((rows as any[]).length === 0) {
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
