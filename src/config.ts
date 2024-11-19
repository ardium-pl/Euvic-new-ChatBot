import OpenAI from "openai";

export const openAiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;
export const META_ENDPOINT = process.env.META_ENDPOINT;
export const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
export const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

export const ENDPOINT_URL = process.env.ENDPOINT || "http://localhost:";
export const PORT = process.env.PORT || 8080;
