import { RowDataPacket, ResultSetHeader } from "mysql2";
import { loadDbInformation } from "../database/mongoDb.ts";
import { ChatCompletionMessageParam } from "openai/resources";
import { PROMPT_FOR_ANSWER, PROMPT_FOR_SQL } from "../../config.ts";
import { ChatHistory } from "../../types.ts";

// OpenAI prompt for natural language to SQL translation
const { dbSchema, examplesForSQL } = await loadDbInformation();

export function promptForSQL(userQuery: string): ChatCompletionMessageParam[] {
  if (!PROMPT_FOR_SQL || typeof PROMPT_FOR_SQL !== "string") {
    throw new Error(
      "PROMPT_FOR_SQL is not defined or is not a string in the configuration."
    );
  }

  return [
    {
      role: "system",
      content: PROMPT_FOR_SQL,
    },
    {
      role: "system",
      content: `Here is the comprehensive JSON formatted schema of our database:
        ${JSON.stringify(dbSchema, null, 2)}`,
    },
    {
      role: "system",
      content: `Here are some example pairs of employee queries (written in Polish) and your JSON answers containing SQL statements:
        ${JSON.stringify(examplesForSQL, null, 2)}
        You should answer in a similar fashion.`,
    },
    { role: "user", content: userQuery },
  ];
}

export function promptForAnswer(
  userQuery: string,
  sqlStatement: string,
  rowData: RowDataPacket[] | ResultSetHeader,
  chatHistory: ChatHistory[]
): ChatCompletionMessageParam[] {
  if (!PROMPT_FOR_ANSWER || typeof PROMPT_FOR_ANSWER !== "string") {
    throw new Error(
      "PROMPT_FOR_ANSWER is not defined or is not a string in the configuration."
    );
  }
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: PROMPT_FOR_ANSWER,
    },
    {
      role: "system",
      content: `
      The comprehensive JSON formatted schema of our database:
      ${JSON.stringify(dbSchema, null, 2)}

      SQL statement which corresponds to the employee query:
      ${sqlStatement}
      
      Raw data retrieved from our database:
      ${JSON.stringify(rowData, null, 2)}
      `,
    },
    { role: "user", content: userQuery },
  ];
  if (chatHistory && chatHistory.length > 0) {
    messages.push({
      role: "system",
      content: `You also have access to the recent chat history. Use this history to maintain context and provide more relevant 
        answers. The order of the chat is from the oldest to the newest, so the most recent chat is at the bottom.
        If the current question is related to previous questions, refer to the chat history for continuity.`,
    });

    // Reverse chat history to show the oldest entries first
    const reversedChatHistory = [...chatHistory].reverse();

    // Add reversed chat history messages
    for (const entry of reversedChatHistory) {
      messages.push({ role: "user", content: entry.query });
      messages.push({ role: "assistant", content: entry.answer });
    }

    messages.push({
      role: "system",
      content: "End of chat history. Now answer the following question:",
    });
  }
  return messages;
}
