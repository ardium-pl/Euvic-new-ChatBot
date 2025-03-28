import { CustomersDataType } from "../../zod-json/dataJsonSchema";
import { db } from "../../db/config/database";
import { RowDataPacket } from "mysql2";
// @ts-ignore
import FuzzySet from "fuzzyset.js";

export async function correctTechnologies(
  parsedData: CustomersDataType
): Promise<CustomersDataType> {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT nazwa FROM technologie"
  );
  const dbTechnologies: string[] = rows.map((row) => row.nazwa);

  const fuzzySet = FuzzySet(dbTechnologies);

  parsedData.customers.forEach((customer) => {
    customer.technologies?.name.forEach((tech, index, array) => {
      if (tech) {
        const match = fuzzySet.get(tech, null, 0.5); // współczynnik podobieństwa
        if (match && match.length > 0) {
          const [score, suggested] = match[0];
          if (score > 0.6 && suggested !== tech) {
            console.log(`Zmieniono "${tech}" na "${suggested}"`);
            array[index] = suggested;
          }
        }
      }
    });
  });

  return parsedData;
}
