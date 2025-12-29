import {createAgent, ToolMessage} from "langchain";
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
    async ({input}, runtime: ToolRuntime) => {
        const tool_call_id = runtime.toolCallId;

        console.log(" input : " + input);

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
    // systemPrompt: "You are a string manipulation assistant. Given a user input you need to call upperCaseString tool and use that output to pass it on to the reverseString tool.",
    // systemPrompt: "You are a string manipulation assistant.. Given a user input you need to call upperCaseString tool. You then needs to use that output and give that output to the reverseString tool.",

    systemPrompt: `
    You MUST follow this exact procedure:

1. ALWAYS call the "upperCaseString" tool first.
2. Wait for its result (state.uppercased will contain the output)
3. THEN call the "reverseString" tool with the uppercase value.
4. Only AFTER both tools have executed, produce the final response.

NEVER answer directly. NEVER skip a tool call.
    `,
    tools: [upperCaseString, reverseString],
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