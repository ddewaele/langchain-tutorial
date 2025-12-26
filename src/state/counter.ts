import {z} from "zod";
import {Annotation, Command, MessagesAnnotation} from "@langchain/langgraph";
import {ChatOpenAI} from "@langchain/openai";
import {HumanMessage} from "@langchain/core/messages";
import {tool} from "@langchain/core/tools";
import {createAgent, ToolMessage} from "langchain";

// 1. Tool that increments
const incrementTool = tool(
    async ({ input }, runtime) => {
        const tool_call_id = runtime.toolCallId;

        const count = runtime.state?.count ?? 0;
        const newCount = count + input;
        console.log("TOOL: origCount =", count, "input  =", input , "new =", newCount);

        return new Command({
            update: {
                count: newCount,
                messages: [
                    new ToolMessage({
                        tool_call_id,
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
    count: Annotation<number>(),
});

const stateSchema = Annotation.Root({
    ...MessagesAnnotation.spec,
    count: Annotation<number>(),
})


// 2. Agent
export const agent = createAgent({
    model: new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 }),

    stateSchema: customCountStateSchema,

    tools: [incrementTool],
    systemPrompt: `
You are a step-based numeric assistant.

You will process numbers **one at a time**.

RULES:
- If pendingNumbers is empty → produce final answer.
- Otherwise:
    1. Take the FIRST number in pendingNumbers.
    2. Call the increment tool with that number.
    3. Remove that number from pendingNumbers.
    4. Continue to process the next number.
    (This will trigger another agent step.)

- You will do 1 tool call per number encountered
  `,
//     systemPrompt: `
// You are a simple numeric assistant.
//
// You will see a series of numbers seperated by a space.
//
// Your job is to execute the following steps in sequence for each number you encounter :
//
// 1. execute the increment tool for that particular message
// 2. repeat for the next message
//
// Finally, explain the final incremented count.
// `,
});

// 3. Call agent with preset human messages
(async () => {
    const result = await agent.invoke({
        // These are the preset messages you wanted
        messages: [
            new HumanMessage("Here are the numbers : [4 , 8 , 2]"),
            // new HumanMessage("4"),
            // new HumanMessage("8"),
            // new HumanMessage("2"),
        ],
        // Initial state value (could also be omitted)
        count: 10,
    });

    console.log("\n=== FINAL OUTPUT ===");
    console.dir(result, { depth: null });
})();