import "dotenv/config";
import { Client } from "@microsoft/microsoft-graph-client";
import { DriveItem, ListItem } from "@microsoft/microsoft-graph-types";
import fs from "fs-extra";
import "isomorphic-fetch";
import path from "path";
import { LIST_ID, SITE_ID } from "../../config";
import { getAccessTokenInteractive } from "../utils/auth";
import { PDF_DATA_FOLDER } from "../utils/credentials";
import { logger } from "../utils/logger";

export const FILE_EXSTENSIONS = ["pdf", "pptx"] as const;

interface ExtendedDriveItem extends DriveItem {
  "@microsoft.graph.downloadUrl"?: string;
}

export class SharePointService {
  private async getClient(): Promise<Client> {
    const accessToken = await getAccessTokenInteractive();
    if (!accessToken) {
      throw new Error("Unable to acquire access token");
    }
    logger.info(
      "access token ",
      accessToken.slice(0, 10) + "*".repeat(accessToken.length - 70)
    );
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  async getFileDetailsFromList(
    itemId: string
  ): Promise<{ fileName: string; downloadUrl: string } | null> {
    try {
      const client = await this.getClient();

      const listItemResponse = await client
        .api(
          `/sites/${SITE_ID}/lists/${LIST_ID}/items/${itemId}?expand=driveItem`
        )
        .get();

      const driveItem = listItemResponse.driveItem as
        | ExtendedDriveItem
        | undefined;
      if (!driveItem) {
        logger.error("No drive item found for this list item.");
        return null;
      }

      const fileName = driveItem.name;
      if (!fileName) {
        logger.error("File name is missing in the driveItem.");
        return null;
      }

      const fileExtension = driveItem.file?.mimeType?.split("/")[1];
      if (!FILE_EXSTENSIONS.includes(fileExtension as any)) {
        logger.warn("Plik nie jest w formacie pdf lub pptx");
        return null;
      }

      const downloadUrl = driveItem["@microsoft.graph.downloadUrl"];
      if (!downloadUrl) {
        logger.error("Download URL is missing in the driveItem.");
        return null;
      }

      return { fileName, downloadUrl };
    } catch (error) {
      logger.error("Błąd pobierania szczegółów pliku z listy:", error);
      return null;
    }
  }

  async downloadFile(downloadUrl: string, fileName: string): Promise<boolean> {
    try {
      const filePath = path.join(PDF_DATA_FOLDER, fileName);

      const response = await fetch(downloadUrl);
      if (!response.ok) {
        console.error("Failed to fetch file content:", response.statusText);
        return false;
      }

      const arrayBuffer = await response.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      await fs.writeFile(filePath, fileBuffer);
      return true;
    } catch (error) {
      console.error("Błąd pobierania pliku:", error);
      return false;
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

  async getSiteIdByName(siteName: string): Promise<string | null> {
    try {
      const client = await this.getClient();

      if (siteName.startsWith("https://")) {
        const site = await client.api(`/sites/${siteName}`).get();
        return site.id;
      }

      const rootSite = await client.api("/sites/root").get();

      const hostname = new URL(rootSite.webUrl).hostname;

      // Try to get the site by name using hostname and siteName
      try {
        const site = await client
          .api(`/sites/${hostname}:/sites/${siteName}`)
          .get();
        return site.id;
      } catch (siteError) {
        try {
          const site = await client
            .api(`/sites/${hostname}:/${siteName}`)
            .get();
          return site.id;
        } catch (finalError) {
          logger.warn(`Unable to find site with name '${siteName}'`);
          return null;
        }
      }
    } catch (error) {
      logger.error(`Error retrieving site ID for '${siteName}':`, error);
      return null;
    }
  }
}
