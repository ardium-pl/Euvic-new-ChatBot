import { LanguageToSQLErrorResponse } from "../../../core/models/languageToSql.types";

const errorMessagesMap: Record<
  LanguageToSQLErrorResponse["errorCode"],
  string
> = {
  NO_QUERY_ERR: "Nie podano zapytania. Proszę spróbować ponownie.",
  PROCESSING_ERR:
    "Wystąpił błąd podczas przetwarzania zapytania. Spróbuj ponownie później.",
  UNSUPPORTED_QUERY_ERR:
    "Zapytanie jest nieobsługiwane. Proszę upewnić się, że jest to zapytanie SELECT.",
  DATABASE_ERR: "Wystąpił problem z bazą danych. Spróbuj ponownie później.",
  AI_PROCESSING_ERROR:
    "Wystąpił błąd podczas przetwarzania AI. Spróbuj ponownie później.",
};

export function getUserFriendlyMessage(
  errorCode: LanguageToSQLErrorResponse["errorCode"]
): string {
  return (
    errorMessagesMap[errorCode] ||
    "Wystąpił nieoczekiwany błąd. Proszę spróbować ponownie."
  );
}
