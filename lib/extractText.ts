import fs from "fs";
import mammoth from "mammoth";

const pdf = require("pdf-parse");

export async function extractTextFromPDF(filePath: string): Promise<string> {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}

export async function extractTextFromDocx(filePath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value; // extracted text
}
