import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert AI assistant that can control a user's machine.
Analyse the user's query and plan steps needed to perform the task.
Generate commands that can be executed on the machine when required.`;

export async function run(query = "") {
  const result = await client.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: query }
    ],
  });

  console.log("Agent says:", result.choices[0].message.content);
}


run("make a new folder test");