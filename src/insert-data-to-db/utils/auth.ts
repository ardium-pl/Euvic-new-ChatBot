import "isomorphic-fetch";
import { PublicClientApplication, Configuration } from "@azure/msal-node";
import fs from "fs";

const TENANT_ID = process.env.TENANT_ID;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const AUTHORITY = process.env.AUTHORITY;

if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !AUTHORITY) {
  throw new Error(
    `Some of auth credentials are not set. TENANT_ID: ${TENANT_ID}, CLIENT_ID: ${CLIENT_ID}, CLIENT_SECRET: ${CLIENT_SECRET}, AUTHORITY: ${AUTHORITY}`
  );
}

const cacheFilePath = "./tokenCache.json";

const cachePlugin = {
  beforeCacheAccess: async (cacheContext: any) => {
    if (fs.existsSync(cacheFilePath)) {
      const cacheData = fs.readFileSync(cacheFilePath, "utf-8");
      cacheContext.tokenCache.deserialize(cacheData);
    }
  },
  afterCacheAccess: async (cacheContext: any) => {
    if (cacheContext.cacheHasChanged) {
      fs.writeFileSync(cacheFilePath, cacheContext.tokenCache.serialize());
    }
  },
};

const msalConfig: Configuration = {
  auth: {
    clientId: process.env.CLIENT_ID!, // Your client ID
    authority: process.env.AUTHORITY!, // e.g., https://login.microsoftonline.com/your-tenant-id
  },
  cache: {
    cachePlugin, // Enable persistent token cache
  },
};
const pca = new PublicClientApplication(msalConfig);

export async function getAccessTokenInteractive(): Promise<string | null> {
  const deviceCodeRequest = {
    scopes: ["https://graph.microsoft.com/.default"],
    deviceCodeCallback: (response: any) => {
      console.log(response.message);
    },
  };

  const accounts = await pca.getTokenCache().getAllAccounts();
  if (accounts.length > 0) {
    const silentRequest = {
      account: accounts[0],
      scopes: deviceCodeRequest.scopes,
    };

    try {
      const silentResponse = await pca.acquireTokenSilent(silentRequest);
      return silentResponse.accessToken;
    } catch (silentError) {
      console.log(
        "Silent token acquisition failed, falling back to device code flow.",
        silentError
      );
    }
  }

  // If silent acquisition fails, use device code flow

  try {
    const response = await pca.acquireTokenByDeviceCode(deviceCodeRequest);

    if (!response) {
      return null;
    }

    return response.accessToken;
  } catch (error) {
    console.error("Error acquiring token via device code flow:", error);
    return null;
  }
}

export async function getAccessToken(): Promise<string> {
  const url = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;

  if (!CLIENT_ID || !CLIENT_SECRET) throw new Error();
  const params = new URLSearchParams();
  params.append("grant_type", "client_credentials");
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("scope", "https://graph.microsoft.com/.default");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`Błąd pobierania tokena: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("❌ Błąd pobierania tokena:", error);
    throw error;
  }
}
