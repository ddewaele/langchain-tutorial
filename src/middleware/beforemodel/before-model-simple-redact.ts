/**
 *
 * This example demonstrates how to use middleware to redact sensitive information from the response.
 * Before the model is called we will replace the message content (an email) with a "[REDACTED]" version.
 * That will get sent to the model
 *
 * Use the concepts :
 *
 * - Middleware
 *
 */
import {createAgent, createMiddleware} from "langchain";
import {loadActions} from "../../menu-runner/loader";
import {showMenu} from "../../menu-runner/menu";


export async function agentMiddlewareRedact() {

    const redactMiddleware = createMiddleware({
        name: "RedactMiddleware",
        beforeModel: (state) => {
            console.log("Before model called with state: ", state);
            state.messages.forEach(m => {
                const originalMsg = m.content as string;
                m.content = originalMsg.replace(/\b[A-Z0-9._%+-]+@gmail\.com\b/gi, "[REDACTED]");
            });
        }
    });

    const agent = createAgent({
        model: "gpt-4o-mini",
        tools: [],
        systemPrompt: "You are a helpful assistant. You will echo the users name and email in your response",
        middleware: [redactMiddleware],
    });

    const res = await agent.invoke({
        messages: [{ role: "user", content: "Hi, I am Davy (ddewaele@gmail.com), how will AI effect the world?" }]
    });

    console.log(res);


}


if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}
