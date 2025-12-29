/**
 * Example demonstrating how to use middleware using beforeModel hook.
 *
 * We also use a stateSchema to define the schema of the middleware.
 * This allows the middlwware to retrieve the `state` parameter in the hook.
 *
 * In this example we create an AuthMiddleware that checks if the user is authenticated before allowing the model to be called.
 *
 * We also use a jumpTo to end the flow if the user is not authenticated.
 *
 * Uses the concepts :
 *
 * - Middleware
 * - StateSchema
 * - Jumps
 *
 */
import * as z from "zod";
import {createAgent, createMiddleware} from "langchain";
import {AIMessage} from "@langchain/core/messages";
import {loadActions} from "../../menu-runner/loader";
import {showMenu} from "../../menu-runner/menu";


export async function agentMiddlewareBeforeModel() {


    const authMiddleware = createMiddleware({
        name: "AuthMiddleware",
        stateSchema: z.object({
            isAuthenticated: z.boolean().default(false),
        }),
        beforeModel: {
            canJumpTo: ["end"],
            hook: async (state) => {
                if (!state.isAuthenticated) {
                    return {
                        messages: [new AIMessage("Not authenticated.")],
                        jumpTo: "end",
                    };
                }
                return;
            }
        },
    });

    const agent = createAgent({
        model: "gpt-4o-mini",
        tools: [],
        systemPrompt: "You are a helpful assistant.",
        middleware: [authMiddleware],
    });

    const res = await agent.invoke({
        messages: [{ role: "user", content: "Hi, how will AI effect the world?" }],
        isAuthenticated: true
    });

    console.log(res);

}



if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}