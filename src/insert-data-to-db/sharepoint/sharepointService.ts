import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";
import fs from "fs-extra";
import path from "path";
import { PDF_DATA_FOLDER } from "../utils/credentials";
import { getAccessToken } from "../utils/auth"; // Pobieramy token dynamicznie

export class SharePointService {
  private async getClient(): Promise<Client> {
    const accessToken = await getAccessToken();
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  /**
   * Pobiera plik z SharePointa i zapisuje go lokalnie.
   * @param siteId - ID witryny SharePoint
   * @param documentLibrary - Nazwa biblioteki dokumentów
   * @param fileId - ID pliku
   * @returns Ścieżka do pobranego pliku
   */
  async downloadFile(
    siteId: string,
    documentLibrary: string,
    fileId: string
  ): Promise<string | null> {
    try {
      const client = await this.getClient();

      const fileMetadata = await client
        .api(`/sites/${siteId}/drives/${documentLibrary}/items/${fileId}`)
        .get();

      const fileName = fileMetadata.name;
      const filePath = path.join(PDF_DATA_FOLDER, fileName);

      const fileContent = await client
        .api(
          `/sites/${siteId}/drives/${documentLibrary}/items/${fileId}/content`
        )
        .get();

      await fs.writeFile(filePath, Buffer.from(fileContent));
      return filePath;
    } catch (error) {
      console.error("Błąd pobierania pliku:", error);
      return null;
    }
  }
}
