import * as z from "zod";
import {createAgent, createMiddleware} from "langchain";
import {AIMessage} from "@langchain/core/messages";


const authMiddleware = createMiddleware({
    name: "AuthMiddleware",
    stateSchema: z.object({
        isAuthenticated: z.boolean().default(false),
    }),
    beforeModel: {
        canJumpTo: ["end"],
        hook: async (state) => {
            if (!state.isAuthenticated) {
                return {
                    messages: [new AIMessage("Not authenticated.")],
                    jumpTo: "end",
                };
            }
            return;
        }
    },
});

const agent = createAgent({
    model: "gpt-4o-mini",
    tools: [],
    systemPrompt: "You are a helpful assistant.",
    middleware: [authMiddleware],
});

const res = await agent.invoke({
    messages: [{ role: "user", content: "Hi, how will AI effect the world?" }],
    isAuthenticated: false
});

console.log(res);
