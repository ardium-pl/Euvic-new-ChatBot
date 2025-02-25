import { CustomersDataType } from "../zod-json/dataJsonSchema";
import { db } from "../db/config/database";
import stringSimilarity from "string-similarity";

export async function generateVerificationInstructions(
  parsedData: CustomersDataType
): Promise<string> {
  // 1️⃣ Pobieranie technologii z bazy danych
  const [rows] = await db.query("SELECT name FROM technologie");
  const dbTechnologies = rows.map((row: any) => row.name);

  // 2️⃣ Zbieranie technologii z parsedData
  const extractedTechnologies: string[] = [];

  parsedData.customers.forEach((customer) => {
    customer.details?.forEach((detail) => {
      if (detail.product && !extractedTechnologies.includes(detail.product)) {
        extractedTechnologies.push(detail.product);
      }
    });
  });

  // 3️⃣ Porównanie technologii z bazy z technologiami z JSON
  const similarTechnologies: { original: string; suggested: string }[] = [];

  extractedTechnologies.forEach((tech) => {
    const { bestMatch } = stringSimilarity.findBestMatch(tech, dbTechnologies);
    if (bestMatch.rating > 0.6 && bestMatch.target !== tech) {
      // 60% podobieństwa
      similarTechnologies.push({ original: tech, suggested: bestMatch.target });
    }
  });

  // 4️⃣ Generowanie instrukcji
  let instructions =
    "Popraw wszystkie błędy zgodnie z tekstem OCR. Upewnij się, że technologie w JSON są poprawne.\n";

  if (similarTechnologies.length > 0) {
    instructions += "Zaktualizuj następujące technologie:\n";
    similarTechnologies.forEach(({ original, suggested }) => {
      instructions += `- Zamień "${original}" na "${suggested}"\n`;
    });
  } else {
    instructions += "Nie znaleziono technologii wymagających poprawy.\n";
  }

  instructions += "\nDodaj do nazwy klienta 3 litery 'a' na koniec.";

  return instructions;
}
