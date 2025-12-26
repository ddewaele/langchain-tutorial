import {createAgent, createMiddleware, initChatModel, tool} from "langchain";
import {HumanMessage} from "@langchain/core/messages";
import {z} from "zod";
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";

const model = await initChatModel("gpt-4o-mini");

const contextSchema = z.object({
    userId: z.string(),
    apiKey: z.string(),
    dbConnection: z.string(),
});

const context = { userId: "USER_001", apiKey: "key_12345", dbConnection: "jdbc:mysql://localhost:3306/mydb?user=root&password=&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true" }

const loggingMiddleware = createMiddleware({
    name: "LoggingMiddleware",
    beforeModel: (state) => {
        console.log(`About to call model with ${state.messages.length} messages`);
        return;
    },
    afterModel: (state) => {
        const lastMessage = state.messages[state.messages.length - 1];
        console.log(`Model returned: ${lastMessage.content}`);
        return;
    },
});


const jokeAgent = createAgent({
    model,
    systemPrompt: `You are a joke generator. 
    Your task is to generate funny jokes based on the given topic. 
    Make sure the jokes are appropriate and suitable for all ages.
    `,
    contextSchema,
    middleware: [loggingMiddleware]
});

const callJokeAgent = tool(
    async ({ query }) => {
        const result = await jokeAgent.invoke({
            messages: [{ role: "user", content: query }]
        },
            {context});
        return result.messages.at(-1)?.content;
    },
    {
        name: "joke_generator",
        description: "Generate a joke based on the given topic.",
        schema: z.object({ query: z.string() })
    }
);

const supervisorAgent = createAgent({
    model,
    systemPrompt: `You are a supervisor. 
    
    You should not do anything except delegate tasks to your agents. 
    Your agents are specialized in different areas. 
    Make sure to assign the right tasks to the right agents and ensure they collaborate effectively to achieve the overall goal.
    `,
    tools: [callJokeAgent],
    contextSchema,
    middleware: [loggingMiddleware]
});



export async function executeMultiAgent() {

    const res = await supervisorAgent.invoke({
            messages: [
                new HumanMessage({
                    content: [
                        {type: 'text', text: "Write a joke about a cat",},
                    ],
                }),
            ],
        },
        {
            context
        }
    );

    console.log(res);


}


if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}
