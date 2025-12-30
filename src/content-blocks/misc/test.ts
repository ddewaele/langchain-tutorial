import { createAgent, createMiddleware, providerStrategy } from "langchain";
import { AIMessage } from "@langchain/core/messages";
import { z } from "zod";

import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const analysisSchema = z.object({
    summary: z.string(),
    score: z.number(),
});

const errorCatchMiddleware = createMiddleware({
    name: "ErrorCatchMiddleware",
    wrapModelCall: async (request, handler) => {
        const response = await handler(request);

        // Verify model response quality
        const { finish_reason } = response?.response_metadata || {};
        if (finish_reason && !["end_turn", "stop"].includes(finish_reason)) {
            throw new Error(`Unexpected finish_reason: ${finish_reason}`);
        }

        return response;
    },
});

const agent = createAgent({
    model: "gpt-5-mini",
    tools: [],
    responseFormat: providerStrategy(analysisSchema),
    middleware: [errorCatchMiddleware],
});

// This will throw: "Invalid response from wrapModelCall in middleware: expected AIMessage, got object"
const res = await agent.invoke({
    messages: [{ role: "user", content: "Analyze this text" }],
});

console.log(res)