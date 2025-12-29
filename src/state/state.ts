import {createAgent, createMiddleware, ToolMessage} from "langchain";
import {ChatOpenAI} from "@langchain/openai";
import * as z from "zod";
import {tool, type ToolRuntime} from "@langchain/core/tools";
import {HumanMessage} from "@langchain/core/messages";
import {Command} from "@langchain/langgraph";

const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,

});

const upperCaseString = tool(
    async (_, runtime: ToolRuntime) => {
        // throw new Error("This tool should never be called directly.");
        const tool_call_id = runtime.toolCallId;

        const upper = _.input.toUpperCase();

        // Store into state so the next tool can read it
        return new Command({
            update: {
                preferences: { theme: "light" },
                messages: [
                    new ToolMessage({
                        tool_call_id,
                        content: upper
                    })
                ]
            },
        });
    },
    {
        name: "upperCaseString",
        description: "conver the input to uppercase.",
        schema: z.object({
            input: z.string(),
        }),
    }
);

const reverseString = tool(
    async (_, runtime: ToolRuntime) => {
        const tool_call_id = runtime.toolCallId;

        console.log("upperCaseString output: " + _.uppercased);

        const reversed = _.input.split("").reverse().join("");
        ;

        return new Command({
            update: {
                reversed, messages: [
                    new ToolMessage({
                        tool_call_id,
                        content: reversed
                    })
                ]
            },

        });

    },
    {
        name: "reverseString",
        description: "convert the input to a reversed string.",
        schema: z.object({}),
    }
);



const customStateSchema = z.object({
    userId: z.string(),
    preferences: z.record(z.string(), z.any()),
});

const stateExtensionMiddleware = createMiddleware({
    name: "StateExtension",
    stateSchema: customStateSchema,
});


export const agent = createAgent({
    model,
    // middleware: [stateExtensionMiddleware],
    stateSchema: customStateSchema,
    systemPrompt: "You are a string manipulation assistant.. Given a user input you need to call upperCaseString tool. You then needs to use that output and give that output to the reverseString tool.",
    tools: [upperCaseString, reverseString],
});

export async function main() {
    const res = await agent.invoke({
        messages: [
            new HumanMessage({
                content: [
                    {
                        type: 'text',
                        text:
                            '"Hello World"',
                    },
                ],
            }),
        ],
        userId: "user_123",
        preferences: { theme: "dark" },
    });

    console.log(res);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}