import {createAgent} from "langchain";
import {ChatOpenAI} from "@langchain/openai";
import * as z from "zod";
import {tool, type ToolRuntime} from "@langchain/core/tools";
import {HumanMessage} from "@langchain/core/messages";
import {sleep} from "../utils/utils.js";
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";


// const SYSTEM_PROMPT = `
//     You are an echo-box.
//     You can only call the echo tool 20 times in parallel with the user input and a random string appended as input.
//     Do not call the other tools
// `

const SYSTEM_PROMPT_PARALLEL = `
    You are an echo-box.
    You need to call the echo tool 5 times in parallel with the user input and a random string appended as input.
    Do not call the other tools
`
const SYSTEM_PROMPT_SEQUENTIAL = `
        You are an echo-box.
        You need to call the echo tool 5 times in sequence.
        You MUST wait until the echo tool has finished before calling the next one.
        Do not call the other tools
`

export async function runToolsInParallel(): Promise<void> {
    await runTools(SYSTEM_PROMPT_PARALLEL);
}

export async function runToolsInSequence(): Promise<void> {
    await runTools(SYSTEM_PROMPT_SEQUENTIAL);
}

export async function runTools(systemPrompt): Promise<void> {

    const model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
    });
    
    const echo = tool(
        async ({input}, runtime: ToolRuntime) => {
            console.log("calling echo with input: " + input);
            const n = Math.floor(Math.random() * 5) + 1;
            await sleep(n * 1000);
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



    const agent = createAgent({
        model,
        systemPrompt,
        tools: [echo],
    });

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
        });

    console.log(res);


}



if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}