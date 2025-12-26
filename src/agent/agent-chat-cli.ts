import {ChatOpenAI} from "@langchain/openai";
import readline from "readline";
import {createAgent} from "langchain";
import {HumanMessage} from "@langchain/core/messages";
import {MemorySaver} from "@langchain/langgraph";

const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
    streaming: true
});

const checkpointer = new MemorySaver();


const agent = createAgent({
    model,
    systemPrompt: "You are a helpfull assistant",
    checkpointer
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "You: ",
});

console.log("LangChain CLI Chat. Type 'exit' to quit.");
rl.prompt();

rl.on("line", async (input) => {
    if (input.trim().toLowerCase() === "exit") {
        rl.close();
        return;
    }

    const stream = await agent.stream({
        messages: [
            new HumanMessage({
                content: [
                    {type: 'text', text: input,},
                ],
            }),
        ],

    },{streamMode: "messages" });


    process.stdout.write("AI: ");

    for await (const chunk of stream) {
        // this only works when using { streamMode: "messages"}, giving you streaming tokens (something you want for a chatbot)
        // { streamMode: "updates"} returns another structure. (const [step, content] = Object.entries(chunk)[0];)
        const [msg, metadata] = chunk;
        process.stdout.write(String(msg.content || ""));
    }


    process.stdout.write("\n");
    rl.prompt();
});

rl.on("close", () => {
    console.log("\nChat session ended.");
    process.exit(0);
});