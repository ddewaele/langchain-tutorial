/**
 *
 * Example of all the hooks in the middleware system.
 *
 * Shows how to access both the state and the context info
 * Shows how to do state updates
 * Shows how to pass context and state to the model
 *
 * Concepts used :
 *
 * - Middleware
 * - Hooks
 * - State
 * - Context
 *
 */
import * as z from "zod";
import {tool, type ToolRuntime} from "@langchain/core/tools";
import {createAgent, createMiddleware, initChatModel, ToolMessage} from "langchain";
import {HumanMessage} from "@langchain/core/messages";
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";

const contextSchema = z.object({
    userId: z.string(),
    apiKey: z.string(),
    dbConnection: z.string(),
    isAuthorized: z
        .function()
        .input(z.tuple([z.string()]))   // <-- tuple of args
        .output(z.boolean()),

});

const stateSchema = z.object({
    counter: z.number(),
    foo: z.string()
});

const fetchUserData = tool(
    async ({ query }, runtime: ToolRuntime<any, typeof contextSchema>) => {
        // Read from Runtime Context: get API key and DB connection
        const { userId, apiKey, dbConnection } = runtime.context;

        console.log(`Executing fetchUserData with query ${query}`)
        console.log(`Fetching data for user ${userId} using API key ${apiKey} and DB connection ${dbConnection}`);

        return `Found 1 result for user ${userId}`;
    },
    {
        name: "fetch_user_data",
        description: "Fetch data using Runtime Context configuration",
        schema: z.object({
            query: z.string(),
        }),
    }
);


const loggingMiddleware = createMiddleware({
    name: "LoggingMiddleware",
    beforeModel: (state, runtime    ) => {

        console.log("---------------------")
        console.log("BEFORE MODEL MIDDLEWARE")
        console.log("---------------------")
        console.log(`runtime.context.userId = ${runtime.context.userId}`)
        console.log(`state.messages.length = ${state.messages.length}`)
        console.log(`state.counter ${state.counter}`);
        console.log(`state.foo = ${state.foo}` )
        console.log("\n")

        return {counter:++state.counter , foo: "bar2"}

    },
    afterModel: (state, runtime ) => {
        const lastMessage = state.messages[state.messages.length - 1];

        console.log("---------------------")
        console.log("AFTER MODEL MODEL MIDDLEWARE")
        console.log("---------------------")
        console.log(`lastMessage.content: ${lastMessage.content}`)
        console.log(`runtime.context.userId = ${runtime.context.userId}`)
        console.log(`state.messages.length = ${state.messages.length}`)
        console.log(`state.counter ${state.counter}`);
        console.log(`state.foo = ${state.foo}` )
        console.log("\n")


        return {counter: ++state.counter, foo: "bar3"}
    },
    wrapModelCall: async (request, handler) => {
        // Modify request before calling
        const modifiedRequest = { ...request, systemPrompt: "You are helpful" };

        const lastMessage = request.state.messages[request.state.messages.length - 1];


        console.log("---------------------")
        console.log("WRAP MODEL CALL MIDDLEWARE")
        console.log("---------------------")
        console.log(`lastMessage.content: ${lastMessage.content}`)
        console.log(`runtime.context.userId = ${request.runtime.context.userId}`)
        console.log(`state.messages.length = ${request.state.messages.length}`)
        console.log(`state.counter ${request.state.counter}`);
        console.log(`state.foo = ${request.state.foo}` )
        console.log("\n")

        try {
            return await handler(modifiedRequest);
        } catch (error) {
            const model = await initChatModel("gpt-5-mini")
            const fallbackRequest = { ...request, model };
            return await handler(fallbackRequest);
        }
    },
    wrapToolCall: async (request, handler) => {
        // Check if user is authorized for this tool

        const lastMessage = request.state.messages[request.state.messages.length - 1];

        console.log("---------------------")
        console.log("WRAP TOOL CALL MIDDLEWARE")
        console.log("---------------------")
        console.log(`lastMessage.content: ${lastMessage.content}`)
        console.log(`runtime.context.userId = ${request.runtime.context.userId}`)
        console.log(`state.messages.length = ${request.state.messages.length}`)
        console.log(`state.counter ${request.state.counter}`);
        console.log(`state.foo = ${request.state.foo}` )
        console.log("\n")

        console.log(`(wrapToolCall) Found counter ${request.state.counter} before tool call ${request.tool.name}`);

        const toolName = String(request.tool.name);               // handles unknown

        if (!request.runtime.context.isAuthorized(toolName)) {
            return new ToolMessage({
                content: "Unauthorized to call this tool",
                tool_call_id: request.toolCall.id!,
            });
        }
        return handler(request);
    },
    contextSchema,
    stateSchema,
});


export async function executeAgentWithContext() {

    const agent = createAgent({
        model: "gpt-4o-mini",
        tools: [fetchUserData],
        middleware: [loggingMiddleware],
        contextSchema,
    });


    const res = await agent.invoke({
            messages: [
                new HumanMessage({
                    content: [
                        {type: 'text', text: "Find info on user ID 1",},
                    ],
                }),
            ],
            counter: 10,
            foo: "bar"
        },
        {
            context: {
                userId: "USER_001",
                apiKey: "key_12345",
                dbConnection: "jdbc:mysql://localhost:3306/mydb?user=root&password=&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true",
                isAuthorized: (toolName) => toolName === "fetch_user_data",
            }
        }
    );

    console.log(res);


}


if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}