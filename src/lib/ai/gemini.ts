import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Create a configured instance of the google provider
export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
});

// Helper for getting the default text model
export const getChatModel = () => google("gemini-2.5-flash");

// Helper for generating embeddings
export const getEmbeddingModel = () =>
  google.textEmbeddingModel("gemini-embedding-001");
