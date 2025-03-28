import { verifyJson } from "./services/jsonVerifier.ts";
import { generateVerificationInstructions } from "./services/descriptionGenerator.ts";
import { correctTechnologies } from "./services/technologiesRepairer.ts";
import { correctBusinessCases } from "./services/BusinessCasesRepairer.ts";
import { logger } from "../../core/logs/logger.ts";
import { CustomersDataType } from "../../core/models/dataTypes.ts";

export async function jsonFixes(
  parsedData: CustomersDataType,
  ocrText: string
): Promise<CustomersDataType> {
  const fieldsToVerify: Array<keyof CustomersDataType["customers"][number]> = [
    "technologies",
    "clientName",
    "projectName",
    "description",
    "businessCase",
    "dateDescription",
    "scaleOfImplementation",
    "industry",
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
