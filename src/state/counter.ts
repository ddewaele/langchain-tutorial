/**
 *
 * In this example I'm going to show you how to create a simple counter agent.
 * The agent for managing a counter state (initially set to 0)
 * An increment tool is invoked that will increment the counter state
 * The result is again stored in the state of the agent.
 *
 *
 */
import {z} from "zod";
import {Command, type Messages} from "@langchain/langgraph";
import {ChatOpenAI} from "@langchain/openai";
import {HumanMessage} from "@langchain/core/messages";
import {tool, type ToolRuntime} from "@langchain/core/tools";
import {type AgentMiddleware, createAgent, createMiddleware, ToolMessage} from "langchain";
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";


const incrementTool = tool(
    async ({ input }, runtime: ToolRuntime) => {

        const currentState = runtime.state as z.infer<typeof customCountStateSchema>;

        const count = currentState.count ?? 0;
        const newCount = count + input;

        console.log("TOOL: origCount =", count, "input  =", input , "new =", newCount);

        return new Command({
            update: {
                count: newCount,
                messages: [
                    new ToolMessage({
                        tool_call_id: runtime.toolCallId,
                        content: `${newCount}`,
                    }),
                ],
            },
        });
    },
    {
        name: "increment",
        description: "Increment the number and update the count",
        schema: z.object({
            input: z.number(),
        }),
    }
);

const customCountStateSchema = z.object({
    // count: Annotation<number>(),
    count : z.number()
});

const countState = createMiddleware({
    name: "CountState",
    stateSchema: customCountStateSchema,
});

// This prompt always seems to work, with the single message but also with multiple messages
const SYSTEM_PROMPT_1 = `

You are a numeric assistant capable of adding numbers.
You will be given a series of numbers that you need to increment

You will process numbers **one at a time**.

RULES (these are needed to ensure correct state updates by running the tools in sequence and not in parallel) :

- You will do 1 tool call per number encountered
- You will wait for the increment tool to finish before processing the next number.

Your final message will be the final incremented count and you it came to be.`

// This prompt always works with multiple message but always fails with a single message
const SYSTEM_PROMPT_2 = `
You are a simple numeric assistant.

You will be given a series of numbers that you need to increment
1 message can contain multiple numbers.

Your job is to execute the following steps in sequence for each number you encounter :

You will process numbers **one at a time**.

1. execute the increment tool for that particular number
2. wait for the result 
3. repeat for the next message

Finally, explain the final incremented count.`

// Sometimes works but sometimes fails with multiple messages.
// The explanation is also completely wrong.
// Always fail with a single message.
const SYSTEM_PROMPT_3 = `
You are a simple numeric assistant.

For each number you encounter you need to execute the increment tool 
Before continuing to the next number you make sure the previous increment tool has finished and you looked at the result.

Finally, explain the final incremented count.`

const noParallelToolCalls = createMiddleware({
    name: "NoParallelToolCalls",
    wrapModelCall: (request, handler) => {
        return handler({
            ...request,
            modelSettings: {
                ...(request.modelSettings ?? {}),
                parallel_tool_calls: false,
            },
        });
    },
});

async function createAgentWithPrompt(systemPrompt: string, messages: Messages, extraMiddleware?: AgentMiddleware) {

    const agent = createAgent({
        model: new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 }),

        middleware: [
            countState,
            ...(extraMiddleware ? [extraMiddleware] : []),
        ],
        tools: [incrementTool],
        systemPrompt
    });

    try {
        const result = await agent.invoke({
            messages,
            // Initial state value (could also be omitted)
            count: 0,
        });

        console.log(`Result = ${result.count}`);

    } catch (e) {
        console.error(e.message);
    }
}

export async function agentPrompt1Test() {

    for(let i = 0; i < 10; i++) {
        await agentPrompt1SingleMessage()
    }
    for(let i = 0; i < 10; i++) {
        await agentPrompt1MultipleMessage()
    }
}


export async function agentPrompt1SingleMessage() {
    await createAgentWithPrompt(
        SYSTEM_PROMPT_1, [
            new HumanMessage("Here are the numbers : [4 , 8 , 2]")
        ]
    )
}

export async function agentPrompt1MultipleMessage() {
    await createAgentWithPrompt(
        SYSTEM_PROMPT_1, [
            new HumanMessage("4"),
            new HumanMessage("8"),
            new HumanMessage("2")
        ]
    )
}


export async function agentPrompt2Test() {

    // for(let i = 0; i < 10; i++) {
    //     await agentPrompt2SingleMessage()
    // }
    for(let i = 0; i < 10; i++) {
        await agentPrompt2MultipleMessage()
    }
}

export async function agentPrompt2SingleMessage() {
    await createAgentWithPrompt(
        SYSTEM_PROMPT_2, [
            new HumanMessage("Here are the numbers : [4 , 8 , 2]")
        ],

    )
}

export async function agentPrompt2MultipleMessage() {
    await createAgentWithPrompt(
        SYSTEM_PROMPT_2, [
            new HumanMessage("4"),
            new HumanMessage("8"),
            new HumanMessage("2")
        ],

    )
}

export async function agentPrompt3Test() {

    for(let i = 0; i < 10; i++) {
        await agentPrompt3SingleMessage()
    }
    // for(let i = 0; i < 10; i++) {
    //     await agentPrompt3MultipleMessage()
    // }
}

export async function agentPrompt3SingleMessage() {
    await createAgentWithPrompt(
        SYSTEM_PROMPT_3, [
            new HumanMessage("Here are the numbers : [4 , 8 , 2]")
        ]
    )
}

export async function agentPrompt3MultipleMessage() {
    await createAgentWithPrompt(
        SYSTEM_PROMPT_3, [
            new HumanMessage("4"),
            new HumanMessage("8"),
            new HumanMessage("2")
        ]
    )
}

if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}

