import { db } from "./config/database";

const fileLinks: string[] = [
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/ERK5Z_rxGBdPhTRWtSu3yfIB_PHE6Oj0LpijpBOPLjcU3Q?e=Apzi9s",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/EaOj63hs4x1CjvU_D9CGfG8B846w-dq80RPDxSmdWqIwVA?e=QaDt1Z",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/EfzFtQ61eYxKm1ncuZh95eEBC8d5B_-cqCbqyCXjiJdktg?e=lfcq0B",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/EbdCuZ5lGhtPmWDOepXiDnoB5F__CwLYe14sEbp6xf890w?e=hqkzqF",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/ESNnF0IRwCNHn04zfsoNaRcBRe5jS6ZdcPFcONQN8h0cGQ?e=S89kED",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/Ebcf0lzRJttDs8DNFIaDX3wBPiABYYCyVDFseISZ7N5xzQ?e=Riux6F",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/EYzDodtij8dNkQvIcKr09ggB4ovJyakWvo1nGnNNbI2dVQ?e=KZK0BV",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/Eag1lrY7wXJCsR9q3Z6jq6wBliW0tVibWxkXY_XXldCncQ?e=SaDDaF",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/EVhycLjr6eRBm5CQUZW4Xb4BnYbI48whAtQQjrTq1Qzt-g?e=wyTi43",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/ETKzVB25lERNlXAls0ntljgBcijI6PGZaEf-FGgtxYcj9Q?e=OGZkxE",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/ERIZC62AOmhKumbiHB_OfggBblLJaWyCgP75dn1slKXn_Q?e=R4xs1G",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/EeYHaV8QSJ5CiZqT9TCdaeIBQGkvdnYTsTr44As8T4ZQjw?e=vjBzF2",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/Ec939Qs-afJNl1a7HJAY1yUBClvUsHmx2scE5sSzgI4gNg?e=OGAtch",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/ESYvGDv7DWtOo43Sj0NFxWMBHPtX9A0Q9NiZnfoVHBAa0A?e=MyLfIz",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/EatS1BrzcqNHp1XZl9OzaPkBl6SuD0I04NxxoEQc5j4R2A?e=EQuPaY",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/EWVUwWDZ7INNuSe30W2jA7oBpM-KZLLWW6zxv7RSIBeeQw?e=xyLHaP",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/ERrNZ6DrFohKvgfJyUoK_W0BqWkbdo4G2F_TicCSoEL1dQ?e=rYtlyG",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/ETi0UfP3KUlPsvM1kobXs0YBTPrpF3RsQ4ZU6JlSzNkbbw?e=f11bG8",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/Eb-2XoWGrTBItelrTcq6EdIB01g_CQM5yXK3hS5brkc7fQ?e=sgM6dX",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/EclcohFCToBApF5MYB_BwbcBKoiLxKx0Nuiq3iBMZPuKBQ?e=51elt3",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/EfwU2tSUI_5NqCHCAlnLnTUBC7a_GA4WkWg9sibaxLCr6w?e=mftxrg",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/EYkPogH9m0lOgGc_RVROMF8BF-ole5EcY0lpPox_6Tu4Hw?e=BjKLYt",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/EUIG0svECuFGgjDak2fFRIEBMdhkyp4gI6b03S3aJnD4Hg?e=mu2GVq",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/EbKX2oH0TaFJj90j95A0puIBrcJxnE8JeK6z-f1DA8ZTBQ?e=M4DL8E",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/EUVJANa1gtREvFWjCqwzsfkBVH1LydwS-8whmf2RSEIrzQ?e=BBqE4w",
  "https://ardium-my.sharepoint.com/:b:/g/personal/jakub_brodka_ardium_pl/EXdZjowUcvtNihXxMWi_JjYBxion4QgDfZ5GjfuYekeVIg?e=CBOq79",
];

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
