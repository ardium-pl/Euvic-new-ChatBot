import "dotenv/config";
import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";
import { getAccessToken } from "../utils/auth";

const WEBHOOK_URL =
  "https://demo-final-development.up.railway.app/webhook/sharepoint"; // Adres webhooka
const SUBSCRIPTION_EXPIRY = new Date(Date.now() + 86400000).toISOString(); // 24h ważn
const DOCUMENT_LIBRARY_ID = process.env.DOCUMENT_LIBRARY_ID;

export async function registerWebhook() {
  try {
    const ACCESS_TOKEN = await getAccessToken();
    const client = Client.init({
      authProvider: (done) => {
        done(null, ACCESS_TOKEN);
      },
    });

    const response = await client.api("/subscriptions").post({
      resource: `/drives/${DOCUMENT_LIBRARY_ID}/root`,
      changeType: "updated",
      notificationUrl: WEBHOOK_URL,
      expirationDateTime: SUBSCRIPTION_EXPIRY,
      clientState: "secretClientState",
    });

    console.log("✅ Webhook zarejestrowany:", response);
  } catch (error) {
    console.error("❌ Błąd rejestracji webhooka:", error);
  }
}
