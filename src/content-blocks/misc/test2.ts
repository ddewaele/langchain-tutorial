import {createAgent, createMiddleware, tool, ToolMessage} from "langchain";
import {ChatOpenAI} from "@langchain/openai";
import {AIMessage, HumanMessage} from "@langchain/core/messages";
import * as z from "zod";
import dotenv from "dotenv";
import {Command} from "@langchain/langgraph";

dotenv.config({ path: "../.env" });
const getWeather = tool(({ location }) => `Weather in ${location}: Sunny, 72°F`, {
    name: "get_weather",
    description: "Get weather information for a location",
    schema: z.object({
        location: z.string().describe("The location to get weather for"),
    }),
});

const agent = createAgent({
    model: new ChatOpenAI({
        model: "gpt-5-nano",
        apiKey: process.env.OPENAI_API_KEY ?? "",
        reasoning: {
            effort: "low",
        },
        verbosity: "low",
    }),
    tools: [getWeather],
    middleware: [
        createMiddleware({
            name: "afterModelJumpToEndMiddleware",
            afterModel: {
                canJumpTo: ["end"],
                hook: async (state, runtime) => {
                    const lastMessage = state.messages.at(-1);
                    if (AIMessage.isInstance(lastMessage)) {
                        const { tool_calls } = lastMessage;
                        if (tool_calls) {
                            return {
                                messages: [new AIMessage("Ending.")],
                                jumpTo: "end",
                            };

                            // return new Command({
                            //     update: {
                            //         jumpTo: "end",
                            //         messages: [
                            //             new ToolMessage({
                            //                 tool_call_id: runtime.toolCallId,
                            //                 content: `End`,
                            //             }),
                            //         ],
                            //     },
                            // });

                        }

                    }
                    return;
                },
            },
        }),
    ],
});

const response = await agent.invoke({
    messages: [new HumanMessage("What's the weather in SF?")],
});

console.log(response)