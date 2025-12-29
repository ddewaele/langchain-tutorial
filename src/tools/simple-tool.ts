import {createAgent} from "langchain";
import {ChatOpenAI} from "@langchain/openai";
import * as z from "zod";
import {tool} from "@langchain/core/tools";
import {HumanMessage} from "@langchain/core/messages";
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";

const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
    useResponsesApi: true,

});
const getWeather = tool(
    ({ city }) => {

        console.log("getWeather called with input: " + city);
        return 30;
        // return {}
    },
    {
        name: "get_weather",
        description: "Get weather for a given city.",
        schema: z.object({
            city: z.string(),
        }),
    }
);

export const agent = createAgent({
    model,
    tools: [getWeather],
});

export async function invokeSimpleTool() {
    const res = await agent.invoke({
        messages: [
            new HumanMessage({
                content: [
                    {
                        type: 'text',
                        text:
                            '"what temperature is it in Florida ?"',
                    },
                ],
            }),
        ],
    });

    console.log(res);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}
