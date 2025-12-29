/**
 *  Example of a beforeModel middleware that adds a system message to allow for translation based on user state.
 *  Uses a stateSchema to define the schema of the middleware. (the language it should translate to).
 *
 *  Uses the concepts :
 *
 *  - Middleware
 *  - StateSchema
 *
 */
import * as z from "zod";
import {createAgent, createMiddleware, SystemMessage} from "langchain";
import {HumanMessage} from "@langchain/core/messages";
import {loadActions} from "../../menu-runner/loader";
import {showMenu} from "../../menu-runner/menu";


export async function agentMiddlewareTranslate() {

    const UserState = z.object({
        userLanguage: z.string(),
    });

    const translateMiddleware = createMiddleware({
        name: "TranslateMiddleware",
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

}


if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}