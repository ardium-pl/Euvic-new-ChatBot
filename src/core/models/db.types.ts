type Table = {
  name: string;
  columns: Column[];
};

type Column = {
  name: string;
  type: string;
  exampleDistinctValues: (string | number)[];
};

export type DbSchema = {
  schemaVersion: string;
  tables: Table[];
};

export type Example = {
  userQuery: string;
  aiAnswer: {
    isSelect: boolean;
    sqlStatement: string;
  };
};

export type ChatHistory = {
  query: string;
  answer: string;
  created_at: string;
  sql_query: string;
};
