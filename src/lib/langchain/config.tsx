// src/lib/langchain/config.ts
// import { ChatVertexAI } from "langchain/chat_models/googlevertexai";
// import { VertexAIEmbeddings } from "langchain/embeddings/googlevertexai";
import { VertexAI } from "@langchain/google-vertexai";
import { PromptTemplate } from "@langchain/core/prompts";
// import { GoogleGenerativeAI } from "@google/generative-ai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// Base model configuration
export const createGeminiTextModel = (temperature = 1.0, maxOutputTokens = 8192) => {
  return new ChatGoogleGenerativeAI({
    model: "gemini-2.0-pro-exp-02-05",
    temperature: temperature,
    maxOutputTokens: maxOutputTokens,
  });
};

// Prompt Templates
export const PROMPT_TEMPLATES = {
  taskExtraction: new PromptTemplate({
    template: `
    << System Instructions >>
    You are an AI assistant helping extract customer's technical questions from a conversation between a Google Cloud Customer Engineer (CE) and a customer.
    Analyze the transcript and identify the core technical questions, needs, or pain points the customer expresses or implies. Focus on questions that highlight the customer's technical understanding and requirements regarding Google Cloud.

    ** Always include topics that the CE promised to send a follow up on.
    ** Always focus on the specific technical questions that can be answered based on the GCP documentation.
    ** Only focus on questions that have NOT YET been answered in the meeting.
    ** DO NOT include high level business and use case questions.

    << Output Formatting >>
    Format the output as a JSON array of tasks, where each task has:

    description: The customer's technical question, phrased as a concise question from the customer's perspective.

    timestamp: Timestamp of the transcript block that this question was covered in, please use the last timestamp from the transcript before the question is formulated

    << Meeting Transcript to analyze >>
    
    {transcript}
    
    << End of Meeting Transcript to analyze >>
    
    << Tasks (JSON array) >>
    `,
    inputVariables: ["transcript"],
  }),

  research: new PromptTemplate({
    template: `
    Research the following technical task using the provided Google Cloud documentation context.
    
    Task: {task}

    Documentation Context: {context}
    
    Provide a response that:
    1. Clearly answers the technical question
    2. Includes specific steps or configurations where relevant
    3. Notes any important caveats or best practices
    4. References specific sections of the documentation
    
    {format_instructions}
    
    Technical Response:`,
    inputVariables: ["task", "context", "format_instructions"],
  }),

  emailGeneration: new PromptTemplate({
    template: `Generate a professional follow-up email to the customer based on the technical research results.
    
    Original Tasks:
    {tasks}
    
    Research Findings:
    {research}
    
    Documentation References:
    {docLinks}
    
    Requirements for the email:
    1. Start with a brief meeting reference and summary
    2. Address each technical question comprehensively
    3. Include relevant code snippets or commands where helpful
    4. Link to specific documentation sections for each answer
    5. Maintain a professional but friendly tone
    6. End with next steps or an offer for further clarification
    
    Generated Email:`,
    inputVariables: ["tasks", "research", "docLinks"],
  }),
};

// Output parsers for structured responses
export const outputParserPrompts = {
  tasks: `The output should be a valid JSON array following this structure:
  [
    {
      "description": "string",
    }
  ]`,
  research: `The output should be a valid JSON object following this structure:
  {
    "answer": "string",
    "steps": string[],
    "caveats": string[],
    "docReferences": { "title": "string", "url": "string" }[]
  }`,
};