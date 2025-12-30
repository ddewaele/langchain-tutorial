/**
 * In this example we'll demonstrate how prompts can effect the way multiple tools are called. and what the impact is to how these tools "see" the state.
 *
 * For example we can use prompts to guide the agent to use a specific tool first, and then use another tool to update the state.
 *
 * This can lead to the following :
 *
 * LLM call
 * Tool 1 (updateUser) --> modifies the state
 * Tool 2 (getUser) --> does not see the updates state because the 2 tool calls are happening in the same "step",
 * LLM call
 *
 * or
 *
 * LLM call
 * Tool 1 (updateUser) --> modifies the state
 * LLM call
 * Tool 2 (getUser) --> sees the updates state
 * LLM call
 *
 * there is a big difference between the two.
 *
 */
import * as z from "zod"
import {ChatOpenAI} from "@langchain/openai"
import {AIMessage, createAgent, createMiddleware, tool, ToolMessage, type ToolRuntime} from "langchain"
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";
import {Command} from "@langchain/langgraph";

const getUserName = tool(
    (_, runtime: ToolRuntime) => {
        const currentState = runtime.state as z.infer<typeof UserNameState>;
        console.log("getUserName : Found username = ",currentState.userName)
        return currentState.userName
    },
    {
        name: "get_user_name",
        description: "Get the user's name.",
        schema: z.object({}),
    }
);

const updateUser = tool(
    ({userName,userJob}, runtime: ToolRuntime) => {
        const currentState = runtime.state as z.infer<typeof UserNameState>;

        console.log("updateUser : Found username = ", currentState.userName)
        console.log(`updateUser : Updating userName ${userName} and job to ${userJob}`)

        return new Command({
            update: {
                userName: userName,
                userJob: userJob,
                messages: [
                    new ToolMessage({
                        content: JSON.stringify({
                                 userName: userName,
                                 userJob: userJob
                            }),
                        tool_call_id: runtime.toolCallId ?? runtime.toolCall?.id!, // depending on your runtime shape
                    }),
                    new AIMessage({
                        content: [],
                        tool_calls: [{
                            name: "verify_user",
                            args: { userName: userName, userJob: userJob },
                            id: "call_123"
                        }]
                    }),
                ],
            },
        });

        // return {
        //     userName: userName,
        //     userJob: userJob
        // }
    },
    {
        name: "update_user",
        description: "Update the user's name and job.",
        schema: z.object({userName: z.string(), userJob: z.string()}),
    }
);

const UserNameState = z.object({
    userName: z.string(),
});

const userNameState = createMiddleware({
    name: "UserNameState",
    stateSchema: UserNameState,
});

const UserJobState = z.object({
    userJob: z.string(),
});

const userJobState = createMiddleware({
    name: "UserJobState",
    stateSchema: UserJobState,
});


export async function runAgentWithToolConfig() {

    const agent = createAgent({
        model: new ChatOpenAI({ model: "gpt-4o" }),
        tools: [getUserName, updateUser],
        middleware: [userNameState,userJobState],
        // stateSchema: UserState <- not needed when using middleware
    });

    // This prompt does not work : The user's name has been updated to 'Mr Bob' and the job to 'Plumber'.  BUT ... getUsername is not called after updateuser
    // const userPrompt = `
    //         update the userName to 'Mr Bob' and the job to 'Plumber' and tell me his name.`

     const userPrompt = `
             update the userName to 'Mr Bob' and the job to 'Plumber' and then fetch me his name.`



    // This prompt works : "The user's name is now Mr Bob."
    // const userPrompt = `
    //         You will perform the following steps :
    //          1. Use the getUsername tool to fetch the userName
    //          2. Use the updateUser tool to update the userName to 'Mr Bob' and the job to 'Plumber'.
    //          3. Call the getUserName again to tell me his name
    // `

    // This prompt works : "The user's name is now Mr Bob."
    // const userPrompt = `
    //         Use the updateUser tool to update the userName to 'Mr Bob' and the job to 'Plumber'.
    //         Look at the results of the tool. (<--- this ensures the update has been made)
    //         Then call the getUserName again to tell me his name`

    // This prompt also doesn't work : "The user's name is John Smith. However, the update was made to change the name to \"Mr Bob\" and the job to \"Plumber.\""
    // const userPrompt = `
    //     Can will first use the updateUser tool to update the userName to 'Mr Bob' and the job to 'Plumber'.
    //     After that is done can you use the getUserName to tell me his name
    // `


    // This prompt doens't work : I've updated the user name to \"Mr Bob\" and the user job to \"Plumber.\" However, when I retrieved the user name, it still came back as \"John Smith.\" It seems there might be an issue with the update not reflecting immediately.",
    // const userPrompt = `
    //     Update the userName to 'Mr Bob' and the userJob to 'Plumber'.
    //     Then call the getUserName to tell me his name
    //`
    const result = await agent.invoke(
        {
            messages: [{ role: "user", content: userPrompt}],
            userName: "John Smith",
            userJob: "Software Engineer",
        }
    );

    console.log(result.messages[result.messages.length - 1].content);

}


if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}
