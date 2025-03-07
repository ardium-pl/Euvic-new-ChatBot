import "dotenv/config";
import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";
import { getAccessToken } from "../utils/auth";
import { LIST_ID, WEBHOOK_URL, SUBSCRIPTION_EXPIRY, SITE_ID } from "../../config";

export async function registerWebhook() {
  try {
    const ACCESS_TOKEN = await getAccessToken();
    const client = Client.init({
      authProvider: (done) => {
        done(null, ACCESS_TOKEN);
      },
    });

    const response = await client.api("/subscriptions").post({
      resource: `/sites/${SITE_ID}/lists/${LIST_ID}`,
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
