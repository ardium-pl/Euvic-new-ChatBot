import { FieldPacket, QueryError, QueryResult } from "mysql2";
import { createConnection } from "./mysqlConnection";

export const queryDb = async <T extends QueryResult = QueryResult>(
  queryString: string,
  args?: any[]
): Promise<{ err: QueryError | null; result: T; fields: FieldPacket[] }> => {
  return new Promise((resolve) => {
    const connection = createConnection();
    if (!connection) throw new Error("don't have connection db");
    try {
      if (args) {
        connection.query<T>(queryString, args, (err, result, fields) => {
          resolve({ err, result, fields });
        });
        return;
      }
      connection.query<T>(queryString, (err, result, fields) => {
        resolve({ err, result, fields });
      });
    } finally {
      connection.end();
    }
  });
};
