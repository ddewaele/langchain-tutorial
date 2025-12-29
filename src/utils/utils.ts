import path, {dirname} from "path";
import fs from "fs";
import {AIMessage, HumanMessage, ReactAgent} from "langchain";
import {fileURLToPath} from "url";
import readline from "readline";
import {v4 as uuidv4} from 'uuid';

export function processImage(response: AIMessage) {
    const base64Data = response.additional_kwargs.tool_outputs[0].result;
    // Strip the data URI prefix if it exists
    const cleanedBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

    // Convert base64 to binary buffer
    const imageBuffer = Buffer.from(cleanedBase64, 'base64');

    return imageBuffer;

}

export function writeToFile(data: Buffer<ArrayBuffer>, fileName: string) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const outputPath = path.join(__dirname, fileName);
    fs.writeFileSync(outputPath, data);
    console.log(`Image saved to ${outputPath}`);
}

export function runCli(agent: ReactAgent) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "You: ",
    });

    const thread_id = uuidv4();

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
            },
            {
                // generate a thread_id uuid
                configurable: {thread_id},
                streamMode: "messages"
            }
        );


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
}


export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}