import dotenv from "dotenv";
dotenv.config();

export async function generateVerificationInstructions(
  type: string
): Promise<string> {
  const prompts = new Map([
    ["technologies", process.env.PROMPT_TECHNOLOGIES],
    ["clientName", process.env.PROMPT_CLIENT_NAME],
    ["projectName", process.env.PROMPT_PROJECT_NAME],
    ["description", process.env.PROMPT_DESCRIPTION],
    ["businessCase", process.env.PROMPT_BUSINESS_CASE],
    ["dateDescription", process.env.PROMPT_DATE_DESCRIPTION],
    ["scaleOfImplementation", process.env.PROMPT_SCALE_OF_IMPLEMENTATION],
    ["industry", process.env.PROMPT_INDUSTRY],
  ]);

  const prompt = prompts.get(type);

  if (!prompt) {
    console.log(`Nie znaleziono opisu dla typu: ${type}`);
    return "";
  }

  return prompt;
}
