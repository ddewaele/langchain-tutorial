import {AIMessage, HumanMessage} from "@langchain/core/messages";
import {ChatOpenAI} from "@langchain/openai";
import {createAgent} from "langchain";
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";

export async function runAgent() {
    const model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,

    });

    const agent = createAgent({
        model,
        systemPrompt: "You are a helpfull assistant",
    });

    const res = await agent.invoke({
        messages: [
            new HumanMessage({content: [{type: 'text', text: 'Hello my name is Davy'}]}),
            new AIMessage({content: [{type: 'text', text: 'Nice to mee you Davy'}]}),
            new HumanMessage({content: [{type: 'text', text: 'Who am I'}]}),
        ]
    });

    // get the last message from the response from the agent
    const lastMessage = res.messages[res.messages.length - 1];
    console.log(lastMessage.content);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}