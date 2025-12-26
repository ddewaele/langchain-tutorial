import {ChatOpenAI} from "@langchain/openai";

const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
    useResponsesApi: true
});

const response = await llm.invoke("Hello World")
console.log(response)