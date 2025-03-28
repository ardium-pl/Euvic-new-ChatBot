import { Collection, Db, MongoClient } from "mongodb";
import { logger } from "../../insert-data-to-db/utils/logger";
import {
  MONGO_CONNECTION_STRING,
  MONGO_DATABASE,
  MONGO_COLLECTION_SCHEMAS,
  MONGO_COLLECTION_EXAMPLES,
} from "../config";
import { DbSchema, Example } from "../types";

async function mongoRetrieveOne(
  database: string,
  collection: string,
  client: MongoClient
): Promise<DbSchema | null> {
  try {
    const db: Db = client.db(database);
    const coll: Collection<DbSchema> = db.collection(collection);

    const filter = {
      schemaVersion: "withExampleDistinctValues",
    };
    const options = {
      projection: { _id: 0, schemaVersion: 0 }, // Exclude _id and schemaVersion
    };

    const document = await coll.findOne(filter, options);

    if (!document) {
      logger.info(`📄 No schema found matching the filter.`);
      return null;
    }

    logger.info(`📄 Retrieved a db schema.`);
    return document;
  } catch (error) {
    logger.error("❌ An error occurred during mongoRetrieveOne call.");
    throw error;
  }
}

async function mongoRetrieveMany(
  database: string,
  collection: string,
  client: MongoClient
): Promise<Example[]> {
  try {
    const db: Db = client.db(database);
    const coll: Collection<Example> = db.collection(collection);

    const options = {
      projection: { _id: 0 }, // Exclude _id field
    };

    const documents: Example[] = await coll.find({}, options).toArray();
    logger.info(`📄 Retrieved a total of ${documents.length} examples.`);

    return documents;
  } catch (error) {
    logger.error("❌ An error occurred during mongoRetrieveMany call.");
    throw error;
  }
}

export async function loadDbInformation(): Promise<{
  dbSchema: DbSchema | null;
  examplesForSQL: Example[];
}> {
  let client: MongoClient | null = null;

  try {
    client = new MongoClient(MONGO_CONNECTION_STRING);
    await client.connect(); // Ensure the connection is established

    const dbSchema: DbSchema | null = await mongoRetrieveOne(
      MONGO_DATABASE,
      MONGO_COLLECTION_SCHEMAS,
      client
    );
    const examplesForSQL: Example[] = await mongoRetrieveMany(
      MONGO_DATABASE,
      MONGO_COLLECTION_EXAMPLES,
      client
    );

    logger.info("Successfully loaded database information! ✅");
    return {
      dbSchema,
      examplesForSQL,
    };
  } catch (error) {
    logger.error("❌ An error occurred while loading database information.");
    logger.error(error);

    return {
      dbSchema: null,
      examplesForSQL: [],
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
}
