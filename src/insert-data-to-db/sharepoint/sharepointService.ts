import "dotenv/config";
import { Client } from "@microsoft/microsoft-graph-client";
import { DriveItem, ListItem } from "@microsoft/microsoft-graph-types"; // for type safety
import fs from "fs-extra";
import "isomorphic-fetch";
import path from "path";
import { LIST_ID, SITE_ID } from "../../config";
import { getAccessToken } from "../utils/auth"; // Pobieramy token dynamicznie
import { PDF_DATA_FOLDER } from "../utils/credentials";

export const FILE_EXSTENSIONS = [
  "pdf",
  "pptx"
] as const;

interface ExtendedDriveItem extends DriveItem {
  "@microsoft.graph.downloadUrl"?: string;
}


export class SharePointService {

  private async getClient(): Promise<Client> {
    const accessToken = await getAccessToken();
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  async downloadFileFromList(
    itemId: string
  ): Promise<string | null> {
    try {
      const client = await this.getClient();

      const listItemResponse = await client
        .api(`/sites/${SITE_ID}/lists/${LIST_ID}/items/${itemId}?expand=driveItem`)
        .get();

      const driveItem = listItemResponse.driveItem as ExtendedDriveItem | undefined;
      if (!driveItem) {
        console.error("No drive item found for this list item.");
        return null;
      }

      const fileName = driveItem.name;

      if (!fileName) return null;

      const fileExtension = driveItem.file?.mimeType?.split("/")[1];

      if (!FILE_EXSTENSIONS.includes(fileExtension as any)) {
        console.log("Plik nie jest w formacie pdf lub pptx");
        return null;
      }
      
      

      const filePath = path.join(PDF_DATA_FOLDER, fileName!);

      const downloadUrl = driveItem["@microsoft.graph.downloadUrl"];
      if (!downloadUrl) {
        console.error("Download URL is missing in the driveItem.");
        return null;
      }

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        console.error("Failed to fetch file content:", response.statusText);
        return null;
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      await fs.writeFile(filePath, fileBuffer);
      return fileName;
    } catch (error) {
      console.error("Błąd pobierania pliku z listy:", error);
      return null;
    }
  }

  async getAllFilesFromList(): Promise<ListItem[]> {
    try {
      const client = await this.getClient();
      const response = await client
        .api(`/sites/${SITE_ID}/lists/${LIST_ID}/items?expand=driveItem`)
        .get();

      return response.value as ListItem[];
    } catch (error) {
      console.error("Błąd pobierania plików z listy:", error);
      return [];
    }
  }
}