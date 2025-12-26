import {ChatOpenAI} from "@langchain/openai";
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";

const model = new ChatOpenAI({ model: "gpt-4o-mini" });

export async function invokeAssistant() {

    const res = await model.invoke(
        [
            { role: "assistant", content: "Hello! I am your onboarding assistant. How can I help?" }
        ]);

    console.log(res.content);


}

export async function invokeAssistantWithArray() {

    const reply = await model.invoke([
        ["assistant", "Hello! I am your onboarding assistant. How can I help?"],
        ["user", "Tell me more about what you can do."]
    ]);

    console.log(reply.content);
}


export async function invokeAssistantWithArrayAndSystem() {

    const system = await model.invoke([
        ["system", "Start the conversation by introducing yourself and asking a question."],
    ]);

    console.log(system.content);

}

export async function invokeAssistantWithArrayAndSystemAndUser() {

    const chatbot = await model.invoke([
        ["system", "You are a chatbot assistant."],
    ]);

    console.log(chatbot.content);

}

if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}
