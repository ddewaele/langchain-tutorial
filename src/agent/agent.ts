import {HumanMessage} from "@langchain/core/messages";
import {ChatOpenAI} from "@langchain/openai";
import {createAgent, tool} from "langchain";
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";
import z from "zod";

const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
});

const agent = createAgent({
    model,
    systemPrompt: "You are a helpfull assistant",
});

export async function invokeAgent() {

    const res = await agent.invoke({
        messages: [
            new HumanMessage({
                content: [
                    {type: 'text', text: '"Hello World"',},
                ],
            }),
        ]
    });

    // get the last message from the response from the agent
    const lastMessage = res.messages[res.messages.length - 1];
    console.log(lastMessage.content);

}

export async function streamAgentWithUsingMessagesMode() {

    const stream = await agent.stream({
            messages: [
                new HumanMessage({
                    content: [
                        {type: 'text', text: '"Write me a game of snake"',},
                    ],
                }),
            ]
        },
        { streamMode: "messages"}
    );

    for await (const chunk of stream) {
        const [msg, metadata] = chunk;
        process.stdout.write(msg.content || "");
    }
}

export async function streamAgentWithToolsUsingUpdates() {

    const getWeather = tool(
        async ({ city }) => {
            return `The weather in ${city} is always sunny!`;
        },
        {
            name: "get_weather",
            description: "Get weather for a given city.",
            schema: z.object({
                city: z.string(),
            }),
        }
    );

    const agent = createAgent({
        model: "gpt-5-nano",
        tools: [getWeather],
    });

    for await (const chunk of await agent.stream(
        { messages: [{ role: "user", content: "what is the weather in sf" }] },
        { streamMode: "updates" }
    )) {
        const [step, content] = Object.entries(chunk)[0];
        console.log(`step: ${step}`);
        console.log(`content: ${JSON.stringify(content, null, 2)}`);
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}