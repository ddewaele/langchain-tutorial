/**
 *
 * Example demonstrating how  LangChain can remember its own history.
 * The agent in and of itself without a checkpointer is stateless, meaning it does not magically remember past messages.
 * With every invoke you need to pass along the entire conversation.
 * Typically this is done via a checkpointer.
 *
 * This examples shows the process of providing the previous messages in the conversation allows him to retain memory.
 *
 */
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

    const lastMessage = res.messages[res.messages.length - 1];
    console.log(lastMessage.content);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}