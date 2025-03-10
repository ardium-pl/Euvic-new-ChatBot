import { Client } from "@microsoft/microsoft-graph-client";
import { DriveItem, ListItem } from "@microsoft/microsoft-graph-types"; // for type safety
import fs from "fs-extra";
import "isomorphic-fetch";
import path from "path";
import { LIST_ID, SITE_ID } from "../../config";
import { getAccessToken } from "../utils/auth"; // Pobieramy token dynamicznie
import { PDF_DATA_FOLDER } from "../utils/credentials";


const FILE_EXSTENSIONS = [
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
    siteId: string,
    listName: string,
    itemId: string
  ): Promise<string | null> {
    try {
      const client = await this.getClient();

      const listItemResponse = await client
        .api(`/sites/${siteId}/lists/${listName}/items/${itemId}?expand=driveItem`)
        .get();

      const driveItem = listItemResponse.driveItem as ExtendedDriveItem | undefined;
      if (!driveItem) {
        console.error("No drive item found for this list item.");
        return null;
      }

      const fileName = driveItem.name;
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
      return filePath;
    } catch (error) {
      console.error("Błąd pobierania pliku z listy:", error);
      return null;
    }
  }

  async getAllFilesFromList(
    siteId: string,
    listName: string
  ): Promise<ListItem[]> {
    try {
      const client = await this.getClient();
      const response = await client
        .api(`/sites/${siteId}/lists/${listName}/items?expand=driveItem`)
        .get();

      // Cast the returned items as ListItem[]
      return response.value as ListItem[];
    } catch (error) {
      console.error("Błąd pobierania plików z listy:", error);
      return [];
    }
  }
}

(async () => {
  const sharePointService = new SharePointService();

  // Get all files (list items with driveItem details) from the list
  const items = await sharePointService.getAllFilesFromList(SITE_ID!, LIST_ID!);

  // Iterate through each item and attempt to download it
  for (const item of items) {
    if (item.driveItem && item.id) {
      const downloadedFilePath = await sharePointService.downloadFileFromList(
        SITE_ID!,
        LIST_ID!,
        item.id
      );
      if (downloadedFilePath) {
        console.log(`Downloaded file to: ${downloadedFilePath}`);
      } else {
        console.error(`Failed to download file for item with id: ${item.id}`);
      }
    } else {
      console.warn(`Item with id ${item.id} does not have an associated file.`);
    }
  }
})();
