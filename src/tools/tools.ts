import {createAgent, ToolMessage} from "langchain";
import {ChatOpenAI} from "@langchain/openai";
import * as z from "zod";
import {tool, type ToolRuntime} from "@langchain/core/tools";
import {HumanMessage} from "@langchain/core/messages";
import {Annotation, Command, MessagesAnnotation} from "@langchain/langgraph";

const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,

});

const upperCaseString = tool(
    async ({input}, runtime: ToolRuntime) => {
        // throw new Error("This tool should never be called directly.");
        const tool_call_id = runtime.toolCallId;

        const upper = input.toUpperCase();

        // Store into state so the next tool can read it
        return new Command({
            update: {
                uppercased: upper,
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
    async ({input, uppercased}, runtime: ToolRuntime) => {
        const tool_call_id = runtime.toolCallId;

        console.log("upperCaseString output: " + uppercased);

        const reversed = input.split("").reverse().join("");
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
        schema: z.object({
            input: z.string(),
            uppercased: z.string().optional(),
        }),
    }
);

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const echo = tool(
    async ({input}, runtime: ToolRuntime) => {
        console.log("calling echo with input: " + input);
        await sleep(5000); // sleep 3 seconds
        console.log("echo called with input: " + input);
        return "echo called with input: " + input
    },
    {
        name: "echo",
        description: "echo the input",
        schema: z.object({
            input: z.string(),
        }),
    }
);

const stateSchema = Annotation.Root({
    ...MessagesAnnotation.spec,
    uppercased: Annotation<string>(),
})

export const agent = createAgent({
    model,
    stateSchema,
    // systemPrompt: "You are an echo-box. You can only call the echo tool 20 times in parallel with the user input and a random string appended as input. Do not call the other tools",

    // systemPrompt: "You are a string manipulation assistant. Given a user input you need to call upperCaseString tool and use that output to pass it on to the reverseString tool.",

    systemPrompt: "You are a string manipulation assistant.. Given a user input you need to call upperCaseString tool. You then needs to use that output and give that output to the reverseString tool.",

//     systemPrompt: `
//     You MUST follow this exact procedure:
//
// 1. ALWAYS call the "upperCaseString" tool first.
// 2. Wait for its result (state.uppercased will contain the output)
// 3. THEN call the "reverseString" tool with the uppercase value.
// 4. Only AFTER both tools have executed, produce the final response.
//
// NEVER answer directly. NEVER skip a tool call.
//     `,
    tools: [echo, upperCaseString, reverseString],
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
        uppercased: "testValue"
    });

    console.log(res);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}