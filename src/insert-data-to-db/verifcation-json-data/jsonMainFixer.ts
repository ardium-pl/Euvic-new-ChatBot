import { logger } from "../utils/logger.ts";
import { verifyJson } from "./botFixerer/jsonVerifier.ts";
import { generateVerificationInstructions } from "./botFixerer/descriptionGenerator.ts";
import { CustomersDataType } from "../zod-json/dataJsonSchema.ts";
import { correctTechnologies } from "./manualFixerer/technologiesRepairer.ts";
import { correctBusinessCases } from "./manualFixerer/BusinessCasesRepairer.ts";

export async function jsonFixes(
  parsedData: CustomersDataType,
  ocrText: string
): Promise<CustomersDataType> {
  const fieldsToVerify: Array<keyof CustomersDataType['customers'][number]> = [
    "technologies",
    "clientName",
    "projectName",
    "description",
    "businessCase",
    'dateDescription',
    "scaleOfImplementation",
  ];

  for (const field of fieldsToVerify) {
    logger.info(`🔍 Weryfikacja pola: ${field}...`);
    const verificationInstructions = await generateVerificationInstructions(
      field
    );

    parsedData = await verifyJson(
      ocrText,
      parsedData,
      verificationInstructions
    );

    logger.info(`✅ Weryfikacja zakończona dla: ${field}`);
  }

  logger.info("✅ Wszystkie pola zostały zweryfikowane i poprawione!");

  parsedData = await correctTechnologies(parsedData);
  logger.info("✅ Technologie zostały poprawione!");

  parsedData = await correctBusinessCases(parsedData);
  logger.info("✅ Business Case'y zostały poprawione!");

  logger.info("✅ JSON został w pełni zweryfikowany i poprawiony!");

  return parsedData;
}
