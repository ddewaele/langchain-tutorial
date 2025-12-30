import {createAgent, createMiddleware, ToolMessage} from "langchain";
import {ChatOpenAI} from "@langchain/openai";
import * as z from "zod";
import {tool, type ToolRuntime} from "@langchain/core/tools";
import {HumanMessage} from "@langchain/core/messages";
import {Annotation, Command, MessagesAnnotation} from "@langchain/langgraph";
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";

const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,

});



const tool1 = tool(
    async ({input}, runtime: ToolRuntime) => {
        // throw new Error("This tool should never be called directly.");
        const tool_call_id = runtime.toolCallId;

        console.log("tool1 called with input: " + input)

        const upper = input.toUpperCase();

        console.log("tool1 output: " + upper);



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

        // return {
        //     uppercased: upper,
        //     messages: [
        //         new ToolMessage({
        //             tool_call_id,
        //             content: upper
        //         })
        //     ]
        // }
    },
    {
        name: "tool_1",
        description: "First tool",
        schema: z.object({
            input: z.string(),
        }),
    }
);

const tool2 = tool(
    async ({input}, runtime: ToolRuntime) => {
        const tool_call_id = runtime.toolCallId;

        console.log("tool2 called with input : " + input);

        const reversed = input.split("").reverse().join("");
        ;

        console.log("tool2 output: " + reversed);
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
        name: "tool_2",
        description: "Second tool",
        schema: z.object({
            input: z.string(),
        }),
    }
);



// const stateSchema = Annotation.Root({
//     ...MessagesAnnotation.spec,
//     uppercased: Annotation<string>(),
// })

const stateSchema = Annotation.Root({
    messages: MessagesAnnotation,
    uppercased: Annotation<string | undefined>(),
    reversed: Annotation<string | undefined>(),
});

const ToolState = z.object({
    uppercased: z.string(),
});

const toolState = createMiddleware({
    name: "ToolState",
    stateSchema: ToolState,
});

export const agent = createAgent({
    model,
    // middleware: [toolState],
    stateSchema: ToolState,
    systemPrompt: `
    You MUST follow this exact procedure:

1. call tool_1
2. Wait for its result
3. call tool_2
4. Wait for its result
5. Only AFTER both tools have executed, produce the final response.

NEVER answer directly. NEVER skip a tool call.
    `,
    tools: [tool1, tool2],
});

export async function runToolsInSeuquence() {
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
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}