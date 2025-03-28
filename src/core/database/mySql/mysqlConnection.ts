import { dbConfig } from "../../config";
import { logger } from "../../logs/logger";
import mysql from "mysql2";

export const createConnection = () => {
  try {
    const connection = mysql.createConnection(dbConfig);
    return connection;
  } catch (error) {
    logger.error("❌ Error creating a connection.");
    logger.error(error);
    throw new Error("can't create conection");
  }
};
