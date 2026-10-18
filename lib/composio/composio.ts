import { Composio } from "@composio/core"

// Groq uses the OpenAI-compatible chat completions format. Tool schemas and
// execution are handled by the Groq agent adapter.
export const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
})
