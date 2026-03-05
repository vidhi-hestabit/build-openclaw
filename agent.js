import OpenAI from "openai";
import dotenv from "dotenv";
import { execSync } from "node:child_process";
import { z } from "zod";

dotenv.config();

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

function executeCommand(cmd = "") {
    try {
      const result = execSync(cmd);
      return result.toString();
    } catch (err) {
      return err.message;
    }
  }

const SYSTEM_PROMPT = `
You are an expert AI assistant that can control a user's machine.

Analyse the user's query and decide what to do.

Available Tools:
executeCommand(command: string)

You MUST respond in JSON only.

JSON format:
{
  "type": "tool_call" | "text",
  "text_content": string | null,
  "tool_call": {
    "tool_name": string,
    "params": string[]
  } | null
}

Return ONLY JSON.
`;

const outputSchema = z.object({
  type: z.enum(["tool_call", "text"]),
  text_content: z.string().optional().nullable(),
  tool_call: z
    .object({
      tool_name: z.string(),
      params: z.array(z.string()),
    })
    .optional()
    .nullable(),
});

export async function run(query = "") {
  const result = await client.chat.completions.create({
    model: "openai/gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: query },
    ],
    response_format: { type: "json_object" },
  });

  const raw = result.choices[0].message.content;
  const parsed = outputSchema.parse(JSON.parse(raw));

  console.log("Agent decision:", parsed);

  if (parsed.type === "tool_call") {
    const command = parsed.tool_call.params[0];

    const output = executeCommand(command);

    return {
      type: "tool_result",
      command,
      output,
    };
  }

  return {
    type: "text",
    message: parsed.text_content,
  };
}