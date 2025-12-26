import * as z from "zod";
import {createAgent, createMiddleware, SystemMessage} from "langchain";
import {HumanMessage} from "@langchain/core/messages";


const UserState = z.object({
    userLanguage: z.string(),
});

const translateMiddleware = createMiddleware({
    name: "RedactMiddleware",
    stateSchema: UserState,
    beforeModel: (state) => {
        state.messages.push(new SystemMessage(`Always respond in ${state.userLanguage}`))
    }
});

const agent = createAgent({
    model: "gpt-4o-mini",
    tools: [],
    systemPrompt: "You are a helpful assistant. You will respond with a one-sentence",
    middleware: [translateMiddleware],
});

const res = await agent.invoke({
    messages: [
        new HumanMessage("Hi, how will AI effect the world?")
    ],
    userLanguage: "fr"
});

console.log(res);
