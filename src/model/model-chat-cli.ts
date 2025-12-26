import {ChatOpenAI} from "@langchain/openai";
import readline from "readline";

export function runChatCli() {
    // Step 1: Create our LLM
    const llm = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0
    });

    // Terminal I/O setup
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "You: ",
    });

    console.log("LangChain CLI Chat. Type 'exit' to quit.");
    rl.prompt();

    // Handle input line-by-line
    rl.on("line", async (input) => {
        if (input.trim().toLowerCase() === "exit") {
            rl.close();
            return;
        }

        const stream = await llm.stream(input);
        process.stdout.write("AI: ");

        for await (const chunk of stream) {
            process.stdout.write(String(chunk.content || ""));
        }

        process.stdout.write("\n");
        rl.prompt();
    });

    rl.on("close", () => {
        console.log("\nChat session ended.");
        process.exit(0);
    });

}

if (import.meta.url === `file://${process.argv[1]}`) {
    runChatCli();
}