import * as z from "zod";
import {tool, type ToolRuntime} from "@langchain/core/tools";
import {createAgent} from "langchain";
import {HumanMessage} from "@langchain/core/messages";
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";

const contextSchema = z.object({
    userId: z.string(),
    apiKey: z.string(),
    dbConnection: z.string(),
});

const fetchUserData = tool(
    async ({ query }, runtime: ToolRuntime<any, typeof contextSchema>) => {
        // Read from Runtime Context: get API key and DB connection
        const { userId, apiKey, dbConnection } = runtime.context;

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



export async function executeAgentWithContext() {

    const agent = createAgent({
        model: "gpt-4o-mini",
        tools: [fetchUserData],
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
        },
        {
            context: { userId: "USER_001", apiKey: "key_12345", dbConnection: "jdbc:mysql://localhost:3306/mydb?user=root&password=&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true" }
        }
    );

    console.log(res);


}


if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}