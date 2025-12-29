/**
 *
 * In this example I'm going to show you how to create a simple counter agent.
 * The agent is responsible for taking in a number and incrementing that to an existing counter (stored in state)
 *
 */
import {z} from "zod";
import {Command} from "@langchain/langgraph";
import {ChatOpenAI} from "@langchain/openai";
import {HumanMessage} from "@langchain/core/messages";
import {tool, type ToolRuntime} from "@langchain/core/tools";
import {createAgent, createMiddleware, ToolMessage} from "langchain";


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
                        content: `Incremented to ${newCount}`,
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


// const CountState = z.object({
//     ≈
// });
//
const countState = createMiddleware({
    name: "CountState",
    stateSchema: customCountStateSchema,
});

// const stateSchema = Annotation.Root({
//     ...MessagesAnnotation.spec,
//     count: Annotation<number>(),
// })



const SYSTEM_PROMPT = `

You are a numeric assistant capable of adding numbers.
You will be given a series of numbers that you need to increment

You will process numbers **one at a time**.

RULES (these are needed to ensure correct state updates by running the tools in sequence and not in parallel) :

- You will do 1 tool call per number encountered
- You will wait for the increment tool to finish before processing the next number.


`

// This prompt does not work
const SYSTEM_PROMPT_2 = `
You are a simple numeric assistant.

You will see a series of numbers seperated by a space.

Your job is to execute the following steps in sequence for each number you encounter :

1. execute the increment tool for that particular message
2. repeat for the next message

Finally, explain the final incremented count.
`

// 2. Agent
export const agent = createAgent({
    model: new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 }),

    middleware: [countState],
    tools: [incrementTool],
    systemPrompt: SYSTEM_PROMPT,

});

// 3. Call agent with preset human messages
(async () => {
    const result = await agent.invoke({
        // These are the preset messages you wanted
        messages: [
            new HumanMessage("Here are the numbers : [4 , 8 , 2]"),

            // Providing individual messages throws an error : InvalidUpdateError: Invalid update for channel "count" with values [14,18,12]: LastValue can only receive one value per step.
            new HumanMessage("4"),
            new HumanMessage("8"),
            new HumanMessage("2"),
        ],
        // Initial state value (could also be omitted)
        count: 0,
    });

    console.log("\n=== FINAL OUTPUT ===");
    console.dir(result, { depth: null });
})();