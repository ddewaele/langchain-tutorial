/**
 *
 * There are several ways to pass messages to a model.
 *
 * We'll cover
 *
 * - String
 * - String array
 * - 2 Dimensional array format
 * - Chat Completions format / Dictionary format (OpenAI format)
 * - LangChain format
 *
 * We will not cover content or contentBlocks here.
 *
 */
import {ChatOpenAI} from "@langchain/openai";
import {AIMessage, type BaseMessageLike, HumanMessage} from "@langchain/core/messages";
import {SystemMessage} from "langchain";
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";

const model = new ChatOpenAI({model:"gpt-5-mini"});

export async function stringInput() {

    const basicResponse = await model.invoke("Tell me a joke.");
    console.log(basicResponse.content);

}

export async function stringArrayInput() {

    const basicResponse = await model.invoke(["Hello, how are you?", "Tell me a joke."]);
    console.log(basicResponse.content);

}

export async function nestedArraysFormat() {

    const nestedArrayMessages: BaseMessageLike[] = [
        ["system", "You are a chatbot assistant."],
        ["user","Hello, how are you?"]
    ]
    const response1 = await model.invoke(nestedArrayMessages);
    console.log(response1.content);

}

export async function langChainMessageTypeFormat() {

    const nestedArrayMessages: BaseMessageLike[] = [
        new SystemMessage("You are a chatbot assistant."),
        new HumanMessage("Hello, how are you?")
    ]
    const response = await model.invoke(nestedArrayMessages);
    console.log(response.content);

}

export async function chatCompletionsFormat() {

    // what roles does it support ? assistant / ai = AI system = SYSTEM ?
    const openAIFormatMessages = [
        {role: "system", content: "You are a chatbot assistant."},
        {role: "user", content: "Hello, how are you?"}
    ];
    const response1 = await model.invoke(openAIFormatMessages);
    console.log(response1.content);

}

export async function langChainFormat() {

    const langchainMessages = [
        new SystemMessage("You are a chatbot assistant"),
        new AIMessage("You will act and respond like a millitary drill sergeant."),
        new HumanMessage("Hello, how are you?")
    ];

    const response = await model.invoke(langchainMessages);
    console.log(response.content);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}




