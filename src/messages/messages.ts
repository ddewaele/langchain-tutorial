/**
 *
 * There are several ways to pass messages to a model.
 *
 * We'll cover
 *
 * - String array input
 * - Chat Completions format / Dictionary format (OpenAI format)
 * - LangChain format
 *
 * We will not cover content or contentBlocks here.
 *
 */
import {ChatOpenAI} from "@langchain/openai";
import {AIMessage, HumanMessage} from "@langchain/core/messages";
import {SystemMessage} from "langchain";
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";

const model = new ChatOpenAI({model:"dall-e-3", temperature: 0});

export async function stringInput() {

    const basicResponse = await model.invoke("Tell me a joke.");
    console.log(basicResponse.content);

}

export async function stringArrayInput() {

    const basicResponse = await model.invoke(["Hello, how are you?", "Tell me a joke."]);
    console.log(basicResponse.content);

}

export async function chatCompletionsFormat() {

    const openAIFormatMessages = [
        {role: "system", content: "You will act and respond like a millitary drill sergeant."},
        {role: "user", content: "Hello, how are you?"}
    ];
    const response1 = await model.invoke(openAIFormatMessages);
    console.log(response1.content);

}

export async function langChainFormat() {

    const langchainMessages = [
        new SystemMessage("You are a millitary expert"),
        new AIMessage("You will act and respond like a millitary drill sergeant."),
        new HumanMessage("Hello, how are you?")
    ];

    const response = await model.invoke(langchainMessages);
    console.log(response.content);
}

export async function langChainFormat2() {
    // LangChain format
    const langchainMessages2 = [
        new AIMessage("You are an expert image generator and are able to generate images on behalf of the user."),
        new HumanMessage("Generate an image of a cat")
    ];
    const response3 = await model.invoke(langchainMessages2);
    console.log(response3.content);
}


if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}




