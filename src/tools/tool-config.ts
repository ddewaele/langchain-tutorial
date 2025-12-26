import * as z from "zod"
import {ChatOpenAI} from "@langchain/openai"
import {createAgent, tool} from "langchain"
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";

const getUserName = tool(
    (_, config) => {
        return config.context.user_name
    },
    {
        name: "get_user_name",
        description: "Get the user's name.",
        schema: z.object({}),
    }
);

const contextSchema = z.object({
    user_name: z.string(),
});



export async function runAgentWithToolConfig() {

    const agent = createAgent({
        model: new ChatOpenAI({ model: "gpt-4o" }),
        tools: [getUserName],
        contextSchema,
    });

    const result = await agent.invoke(
        {
            messages: [{ role: "user", content: "What is my name?" }]
        },
        {
            context: { user_name: "John Smith" }
        }
    );

    console.log(result);

}


if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}
