/**
 *
 * Example of creating a middleware for an agent that limits the number of messages in a conversation.
 * If you exceed the limit the agent will end the conversation.
 *
 * Example from https://docs.langchain.com/oss/javascript/langchain/middleware/custom
 *
 */
import {createAgent, createMiddleware} from "langchain";
import {AIMessage} from "@langchain/core/messages";
import {runCli} from "../utils/utils";
import {MemorySaver} from "@langchain/langgraph";
import dotenv from "dotenv";

dotenv.config({path: "../.env"});
export async function agentMiddlewareTest() {

    const createMessageLimitMiddleware = (maxMessages: number = 50) => {
        return createMiddleware({
            name: "MessageLimitMiddleware",
            beforeModel: {
                canJumpTo: ["end"],
                hook: (state) => {
                    if (state.messages.length >= maxMessages) {
                        return {
                            messages: [new AIMessage("Conversation limit reached.")],
                            jumpTo: "end",
                        };
                    }
                    return;
                },
            },
            afterModel: (state) => {
                const lastMessage = state.messages[state.messages.length - 1];
                console.log(`Model returned: ${lastMessage.content}`);
                return;
            },
        });
    };

    const checkpointer = new MemorySaver();

    const agent = createAgent({
        model: "gpt-4o-mini",
        tools: [],
        systemPrompt: "You are a helpful assistant.",
        middleware: [createMessageLimitMiddleware(3)],
        checkpointer
    });

    // const res = await agent.invoke({
    //     messages: [
    //         { role: "user", content: "Hi, how will AI effect the world?" },
    //         { role: "ai", content: "Profoundly" },
    //         { role: "user", content: "How so ?" }
    //     ],
    //
    // });
    //
    // console.log(res);

    runCli(agent);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    agentMiddlewareTest()
}