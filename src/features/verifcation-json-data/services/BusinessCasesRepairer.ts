import { RowDataPacket } from "mysql2";
import FuzzySet from "fuzzyset.js";
import { CustomersDataType } from "../../../core/models/dataTypes";
import { queryDb } from "../../../core/database/mySql/mysqlQueries";

export async function correctBusinessCases(
  parsedData: CustomersDataType
): Promise<CustomersDataType> {
  const rows = await queryDb<RowDataPacket[]>("SELECT opis FROM biznes_casy");
  const dbBusinessCases: string[] = rows.result.map((row) => row.opis);

  const fuzzySet = FuzzySet(dbBusinessCases);

  parsedData.customers.forEach((customer) => {
    customer.businessCase?.name.forEach((businessCase, index, array) => {
      if (businessCase) {
        const match = fuzzySet.get(businessCase, null, 0.5);
        if (match && match.length > 0) {
          const [score, suggested] = match[0];
          if (score > 0.6 && suggested !== businessCase) {
            console.log(`Zmieniono "${businessCase}" na "${suggested}"`);
            array[index] = suggested;
          }
        }
      }
    });
  });

  return parsedData;
}
