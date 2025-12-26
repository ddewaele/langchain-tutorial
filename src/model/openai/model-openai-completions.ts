import {ChatOpenAI} from "@langchain/openai";

const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0
});

const response = await llm.invoke("Hello World")
console.log(response)

const stream = await llm.stream("Hello World");
for await (const chunk of stream) {
    process.stdout.write(String(chunk.content || ""));
}
