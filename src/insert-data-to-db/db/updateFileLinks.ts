import { db } from "./config/database";

const fileLinks: string[] = [];

async function updateFileLinks(fileLinks: string[]) {
  const connection = await db.getConnection();
  try {
    // Begin a transaction
    await connection.beginTransaction();

    for (let i = 0; i < fileLinks.length; i++) {
      const link = fileLinks[i];
        console.log("file link" + link);
        
      await connection.execute(
        `UPDATE pliki 
                 SET link_do_pliku = ? 
                 WHERE id = ?`,
        [link, i + 1]
      );
    }
    await connection.commit();
    console.log("File links updated successfully.");
  } catch (error: any) {
    await connection.release();
    console.log("Error updating fileLinks: " + error.message);
  } finally {
    connection.release();
  }
}

await updateFileLinks(fileLinks);
