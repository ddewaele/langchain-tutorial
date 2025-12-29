/**
 * This is a simple example of how to use state in langchain.
 * The state can be accessed in the middleware and in tools
 * The state is stored in the agent object and can be accessed in the tools and middleware.
 */
import * as z from "zod";
import {createAgent, createMiddleware, tool, type ToolRuntime} from "langchain";

const UserState = z.object({
    userName: z.string(),
});

const userStateMiddleWare = createMiddleware({
    name: "UserState",
    stateSchema: UserState,
    beforeModel: (state) => {
        const name = state.userName;
        console.log(`Before model : Hello ${name}!`);
        return;
    },
});

const greet = tool(
    async (_, runtime: ToolRuntime) => {

        const currentState = runtime.state as z.infer<typeof UserState>;

        console.log(`Greet called with input ${currentState.userName}`);

        return `Good morning ${currentState.userName}!`;
    },
    {
        name: "greet",
        description: "Return a greeting for a given username.",
        schema: z.object({}),
    }
);

const agent = createAgent({
    model: "gpt-4o-mini",
    tools: [greet],
    systemPrompt: "You are a helpful assistant and should always use the greet tool to get the users name and incorporate the users name in the response. Answer with a short 1 sentence",
    middleware: [userStateMiddleWare],
});

const res = await agent.invoke({
    messages: [{ role: "user", content: "Hi, how will AI effect the world?" }],
    userName: "Ada",
});

console.log(res);
