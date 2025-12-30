import * as z from "zod"
import {ChatOpenAI} from "@langchain/openai"
import {createAgent, createMiddleware, tool, type ToolRuntime} from "langchain"
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";

const getUserName = tool(
    (_, runtime: ToolRuntime) => {
        const currentState = runtime.state as z.infer<typeof UserState>;
        console.log("Found username = ",currentState.userName)
        return currentState.userName
    },
    {
        name: "get_user_name",
        description: "Get the user's name.",
        schema: z.object({}),
    }
);

const UserState = z.object({
    userName: z.string(),
});

const userState = createMiddleware({
    name: "UserState",
    stateSchema: UserState,
});


export async function runAgentWithToolConfig() {

    const agent = createAgent({
        model: new ChatOpenAI({ model: "gpt-4o" }),
        tools: [getUserName],
        middleware: [userState],
        // stateSchema: UserState <- not needed when using middleware
    });

    const result = await agent.invoke(
        {
            messages: [{ role: "user", content: "What is my name?" }],
            userName: "John Smith",
        }
    );

    console.log(result);

}


if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}
