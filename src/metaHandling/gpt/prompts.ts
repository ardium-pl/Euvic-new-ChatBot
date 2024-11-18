import { loadDbInformation } from "../database/mongoDb.ts";

// OpenAI prompt for natural language to SQL translation
const { dbSchema, examplesForSQL } = await loadDbInformation();

export function promptForSQL(userQuery: string) {
    return [
      {
        role: "system",
        content: `You are an intelligent AI translator who translates natural language to SQL queries and works for our company - "BUDMAT". We are a major roof tiles producer in Poland. You will be provided with:
  
          1. Comprehensive schema of our database which contains only a single table - 'zyskownosc'. Each record in this tables corresponds to a single transaction. The schema will be provided in JSON format.
          2. A set of example pairs of employee queries (written in Polish) and your JSON answers containing SQL statements, which turned out to be useful.
          3. Query (written in human language - most probably Polish) from our company employee who is trying to urgently find some important information in our database.
        
        You need to translate this query into an appropiate SQL statement which will allow the employee to retrieve the data. Prepare the SQL statement using information about our database.
        Keep in mind that the tables can hold a few hundred thousand records - use "*" selector sparingly.
        When you want to filter based on the values of the textual columns use 'LIKE' instead of '=' checking as the values often contain strange numeric prefixes or suffixes. If applicable use 'LIKE' checking frequently whenever you recognize named entity in a user query.
        If a user requests information about some products or mentionts a product name you will most likely find this name (sometimes wrapped with prefixes and suffixes) in "opis_towaru" column.
        Do not use 'AS' aliases.
  
        Answer in JSON format. Your JSON answer should have two properties:
        
          1. "isSelect" - Boolean property set to true only if the generated SQL statement is of type SELECT (and thus doesn't change the data in our database). Otherwise (e.g if the SQL statement involves INSERT or CREATE operation) this property should be false.
          2. "sqlStatement" - String with valid SQL statement without any additional comments. SQL-specific keywords should be in upper case.
          `,
      },
      {
        role: "system",
        content: `Here is the comprehensive JSON formatted schema of our database:
        ${JSON.stringify(dbSchema, null, 2)}`,
      },
      {
        role: "system",
        content: `Here are some example pairs of employee queries (written in Polish) and your JSON answers containing SQL statement:
        ${JSON.stringify(examplesForSQL, null, 2)}
        You should answer in a similar fashion.`,
      },
      { role: "user", content: userQuery },
    ];
  }