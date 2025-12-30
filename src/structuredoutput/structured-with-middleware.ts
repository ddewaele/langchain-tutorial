/**
 *
 * Example demonstrating
 *
 *  - how to use middleware to change the system prompt based on the state.
 *  - return a structured response.
 *
 */
import * as z from "zod";
import {createAgent, dynamicSystemPromptMiddleware, providerStrategy} from "langchain";
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";

const ContactInfo = z.object({
    name: z.string().describe("The name of the person"),
    email: z.string().describe("The email address of the person").optional(),
    phone: z.string().describe("The phone number of the person").optional(),
});

const contextSchema = z.object({
    detail: z.enum(["minimum", "full"]).default("full"),
});



const userRolePrompt = dynamicSystemPromptMiddleware<z.infer<typeof contextSchema>>(
    (_state, runtime) => {
        const detail = runtime.context.detail;
        const basePrompt = "You are a helpful assistant.";

        if (detail === "minimum") {
            return `${basePrompt}  When asked to extract contact info, only provide the name.`;
        } else if (detail === "full") {
            return `${basePrompt} When asked to extract contact info, provide all the information.`;
        }
        return basePrompt;
    }
);

const agent = createAgent({
    model: "gpt-5-mini",
    tools: [],
    middleware: [userRolePrompt],

    responseFormat: providerStrategy(ContactInfo)
});

export async function extractContactInfo() {
    const resultMinimum = await agent.invoke({
        messages: [{"role": "user", "content": "Extract contact info from: John Doe, john@example.com, (555) 123-4567"}]
    },{
        context: {
            detail: "minimum",
        }
    });

    // { name: "John Doe", email: "john@example.com", phone: "(555) 123-4567" }
    console.log(resultMinimum);

    const resultFull = await agent.invoke({
        messages: [{"role": "user", "content": "Extract contact info from: John Doe, john@example.com, (555) 123-4567"}]
    },{
        context: {
            detail: "full",
        }
    });

    // { name: "John Doe", email: "john@example.com", phone: "(555) 123-4567" }
    console.log(resultFull);



}

if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}
