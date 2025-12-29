import * as z from "zod";
import {createAgent, dynamicSystemPromptMiddleware, providerStrategy} from "langchain";
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";

const ContactInfo = z.object({
    name: z.string().describe("The name of the person"),
    email: z.string().describe("The email address of the person"),
    phone: z.string().describe("The phone number of the person"),
});

const contextSchema = z.object({
    userRole: z.enum(["expert", "beginner"]).default("beginner"),
});



const userRolePrompt = dynamicSystemPromptMiddleware<z.infer<typeof contextSchema>>(
    (_state, runtime) => {
        const userRole = runtime.context.userRole;
        const basePrompt = "You are a helpful assistant.";

        if (userRole === "expert") {
            return `${basePrompt} Provide detailed technical responses.`;
        } else if (userRole === "beginner") {
            return `${basePrompt} Explain concepts simply and avoid jargon.`;
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
    const result = await agent.invoke({
        messages: [{"role": "user", "content": "Extract contact info from: John Doe, john@example.com, (555) 123-4567"}]
    },{
        context: {
            userRole: "expert",
        }
    });

    console.log(result);
    // { name: "John Doe", email: "john@example.com", phone: "(555) 123-4567" }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}
