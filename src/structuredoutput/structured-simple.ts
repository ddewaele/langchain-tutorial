import * as z from "zod";
import {createAgent, providerStrategy} from "langchain";
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";

const ContactInfo = z.object({
    name: z.string().describe("The name of the person"),
    email: z.string().describe("The email address of the person"),
    phone: z.string().describe("The phone number of the person"),
});

const agent = createAgent({
    model: "gpt-5-mini",
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
