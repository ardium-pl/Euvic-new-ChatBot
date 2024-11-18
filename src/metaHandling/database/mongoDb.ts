import { Collection, Db, MongoClient } from "mongodb";
import { logger } from "../../insert-data-to-db/utils/logger";

const MONGO_CONNECTION_STRING = process.env.MONGO_CONNECTION_STRING as string;
const MONGO_DATABASE = process.env.MONGO_DATABASE as string;
const MONGO_COLLECTION_EXAMPLES = process.env.MONGO_COLLECTION_EXAMPLES as string;
const MONGO_COLLECTION_SCHEMAS = process.env.MONGO_COLLECTION_SCHEMAS as string;

interface DbSchema {
  [key: string]: any; // Define a more specific type if the schema has a fixed structure
}

interface Example {
  [key: string]: any; // Define the structure of the examples if known
}

async function mongoRetrieveOne(
  database: string,
  collection: string,
  client: MongoClient
): Promise<DbSchema | null> {
  try {
    const db: Db = client.db(database);
    const coll: Collection = db.collection(collection);

    const filter = {
      schemaVersion: "withExampleDistinctValuesProperColumnDescriptions",
    };
    const options = {
      projection: { _id: 0, schemaVersion: 0 }, // Exclude _id and schemaVersion
    };

    const document: DbSchema | null = await coll.findOne(filter, options);
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
    const coll: Collection = db.collection(collection);

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
