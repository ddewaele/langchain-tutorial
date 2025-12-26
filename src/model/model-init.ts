import {initChatModel} from "langchain";
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";
import {ChatAnthropic} from "@langchain/anthropic";
import {ChatOpenAI} from "@langchain/openai";


export async function initOpenAIModel() {
    const model = await initChatModel("gpt-4.1");
    const response = await model.invoke("Hello");
    console.log(response);
}

export async function initAntropicModel() {
    const model = await initChatModel("claude-sonnet-4-5");
    const response = await model.invoke("Hello");
    console.log(response);
}

export async function chatAnthropic() {
    const model = new ChatAnthropic({
        model: "claude-sonnet-4-5-20250929",
    });
    const response = await model.invoke("Hello world!");
    console.log(response)
}

export async function chatOpenAI() {
    const model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0
    });

    const response = await model.invoke("Hello world!");
    console.log(response)
}


if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}