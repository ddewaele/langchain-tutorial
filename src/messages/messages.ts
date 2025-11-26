
import {ChatOpenAI} from "@langchain/openai";
import {AIMessage, HumanMessage} from "@langchain/core/messages";

import dotenv from "dotenv";
dotenv.config();

const model = new ChatOpenAI({temperature: 0});

async function main() {

    // OpenAI format
    const openAIFormatMessages = [
        { role: "system", content: "You will act and respond like a millitary drill sergeant." },
        { role: "user", content: "Hello, how are you?" }
    ];
    const response1 = await model.invoke(openAIFormatMessages);
    console.log(response1.content);

    // LangChain format
    const langchainMessages = [
        new AIMessage("You will act and respond like a millitary drill sergeant."),
        new HumanMessage("Hello, how are you?")
    ];
    const response2 = await model.invoke(langchainMessages);
    console.log(response2.content);

    // LangChain format
    const langchainMessages2 = [
        new AIMessage("You are an expert image generator and are able to generate images on behalf of the user."),
        new HumanMessage("Generate an image of a cat")
    ];
    const response3 = await model.invoke(langchainMessages2);
    console.log(response3.content);

}

main();




