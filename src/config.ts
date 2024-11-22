import mysql, { createPool, Pool } from "mysql2/promise";
import OpenAI from "openai";

export const openAiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Meta config
export const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;
export const META_ENDPOINT = process.env.META_ENDPOINT;
export const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
export const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

// Express config
export const ENDPOINT_URL = process.env.ENDPOINT || "http://localhost:";
export const PORT = process.env.PORT || 8080;

// MySql config
export const dbConfig: mysql.ConnectionOptions = {
  host: process.env.MYSQL_HOST as string,
  user: process.env.MYSQL_USER as string,
  password: process.env.MYSQL_PASSWORD as string,
  database: process.env.MYSQL_DATABASE as string,
  port: parseInt(process.env.MYSQL_PORT as string, 10),
};

// Chat history connection
export const pool: Pool = createPool({
    host: process.env.CHAT_MYSQL_HOST,
    port: parseInt(process.env.CHAT_MYSQL_PORT as string),
    user: process.env.CHAT_MYSQL_USER,
    password: process.env.CHAT_MYSQL_PASSWORD,
    database: process.env.CHAT_MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.POOL_MAX_SIZE as string),
    queueLimit: 0,
});


// MongoDb config
export const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING as string;
export const MONGO_DATABASE = process.env.MONGO_DATABASE as string;
export const MONGO_COLLECTION_EXAMPLES = process.env.MONGO_COLLECTION_EXAMPLES as string;
export const MONGO_COLLECTION_SCHEMAS = process.env.MONGO_COLLECTION_SCHEMAS as string;

// Prompts
export const PROMPT_FOR_ANSWER = process.env.PROMPT_FOR_ANSWER;
export const PROMPT_FOR_SQL = process.env.PROMPT_FOR_SQL;
