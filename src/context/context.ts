/**
 *
 * Example demonstrating how to use Runtime Context in LangChain tools and agents.

 * Runtime Context is part of the Runtime Configuration you can pass to the invoke method.
 *
 * In this example we explore the context part. A set of key value pairs that are made available in tools and middleware
 *
 * We'll show you how to access that runtime in a tool and in middleware.
 *
 * For a tool
 *
 * - `state`: The current graph state
 * - `toolCallId`: The ID of the current tool call
 * - `config`: `RunnableConfig` for the current execution ( = basically the same runtime configuration where this prop is on)
 * - `context`: Runtime context
 * - `store`: `BaseStore` instance for persistent storage
 * - `writer`: Stream writer for streaming output
 *
 *
 * For middleware you can access the following via the runtime
 *
 * context = Runtime context
 * writer = Stream writer for streaming output
 * signal = AbortSignal
 *
 * !! you do need to provide the contextSchema when creating the middleware !
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

const fetchUserData = tool(
    async ({ query }, runtime: ToolRuntime<any, typeof contextSchema>) => {

        const { userId, apiKey, dbConnection } = runtime.context;
        console.log(`Received ${query} : Fetching data for user ${userId} using API key ${apiKey} and DB connection ${dbConnection}`);
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
    beforeModel: (state,runtime    ) => {
        console.log(`About to call model with ${state.messages.length} messages and runtime.context.userId = ${runtime.context.userId}`);
        return;
    },
    afterModel: (state, runtime ) => {
        const lastMessage = state.messages[state.messages.length - 1];
        console.log(`Model returned: ${lastMessage.content} and runtime.context.userId = ${runtime.context.userId}`);
        return;
    },
    wrapModelCall: async (request, handler) => {
        // Modify request before calling
        console.log(`wrapModelCall with runtime.context.userId = ${request.runtime.context.userId}`);

        const modifiedRequest = { ...request, systemPrompt: "You are helpful" };

        try {
            return await handler(modifiedRequest);
        } catch (error) {
            const fallbackRequest = { ...request, model: await initChatModel("gpt-5-mini") };
            return await handler(fallbackRequest);
        }
    },
    wrapToolCall: async (request, handler) => {
        console.log(`wrapToolCall with runtime.context.userId = ${request.runtime.context.userId}`);

        const toolName = request.tool.name as string
        // Check if user is authorized for this tool
        if (!request.runtime.context.isAuthorized(toolName)) {
            return new ToolMessage({
                content: "Unauthorized to call this tool",
                tool_call_id: request.toolCall.id!,
            });
        }
        return handler(request);
    },
    contextSchema
});


export async function executeAgentWithContext() {

    const agent = createAgent({
        model: "gpt-4o-mini",
        tools: [fetchUserData],
        middleware: [loggingMiddleware],
        // contextSchema, // not really needed if you put it on the middleware ?
    });


    const res = await agent.invoke({
            messages: [
                new HumanMessage({
                    content: [
                        {type: 'text', text: "Find info on user ID 1",},
                    ],
                }),
            ],
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