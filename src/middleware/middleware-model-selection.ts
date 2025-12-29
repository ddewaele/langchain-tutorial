/**
 *
 * Example of dynamic model selection based on user state.
 *
 * Concepts used :
 *
 * - Middleware
 * - Hooks
 * - State
 *
 */
import * as z from "zod";
import {createAgent, createMiddleware, initChatModel} from "langchain";
import {HumanMessage} from "@langchain/core/messages";
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";


const stateSchema = z.object({
    level: z.enum(["easy", "medium", "hard"]),
});

const modelSelectionMiddleware = createMiddleware({
    name: "ModelSelectionMiddleware",
    wrapModelCall: async (request, handler) => {

        if (request.state.level==="easy") {
            const model = await initChatModel("gpt-5-nano")
            return handler({...request, model});

        } else if (request.state.level === "medium") {
            const model = await initChatModel("gpt-5-mini")
            return handler({...request, model});

        } else if (request.state.level === "hard") {
            const model = await initChatModel("gpt-5")
            return handler({...request, model});

        } else {
            return handler(request);
        }




    },
    stateSchema,
});


export async function executeAgentWithDynamicModel() {

    const agent = createAgent({
        model: "gpt-4o-mini",
        middleware: [modelSelectionMiddleware],
    });


    const resEasy = await agent.invoke({
            messages: [
                new HumanMessage({content: [{type: 'text', text: "Hello",}]}),
            ],
            level: "easy",
        }
    );

    const resMedium = await agent.invoke({
            messages: [
                new HumanMessage({content: [{type: 'text', text: "Hello",}]}),
            ],
            level: "medium",
        }
    );

    const resHard = await agent.invoke({
            messages: [
                new HumanMessage({content: [{type: 'text', text: "Hello",}]}),
            ],
            level: "hard",
        }
    );

    console.log(resEasy.messages[resEasy.messages.length - 1].content);
    console.log(resMedium.messages[resEasy.messages.length - 1].content);
    console.log(resHard.messages[resEasy.messages.length - 1].content);


}


if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}