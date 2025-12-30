/**
 *
 * Example demonstrating the use of ToolMessage in LangChain
 *
 * Here we are demonstrating how to use ToolMessage to execute a tool call and incorporate the result into the model's response.
 * Normally the orchestrator (LangChain) would handle this for you when using agents and tools.
 * This is just to demonstrate how ToolMessage works and what these models expect when working with tools.
 *
 * It always goes like this
 *
 * 1. The model receives a user input ("What is the weather in San Francisco?")
 * 2. The model is aware of the tools it can access (get_weather)
 * 3. The model decides to call the get_weather tool with the argument location: "San Francisco". An AIMesssage is created with tool_calls.
 * 4. Somebody has to execute the tool call and return a ToolMessage
 * 5. The model sees the content of the ToolMessage (the return value of the tool). In this case "Sunny, 72°F"
 * 5. The model will incorporate the results of the ToolMessage in its response
 *
 * the tool call and the tool execution result and incorporate them into the model's response.
 *
 */
import {AIMessage, ToolMessage} from "langchain";
import {HumanMessage} from "@langchain/core/messages";
import {ChatOpenAI} from "@langchain/openai";
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";

const model = new ChatOpenAI({temperature: 0});

// The AI responds with an AI Message containing a tool call to get the weather
// The AI simply provides the name of the tool, its arguments, and an ID
// It is up to the orchestrator (LangChain) to actually execute the call.
const aiMessage = new AIMessage({
    content: [],
    tool_calls: [{
        name: "get_weather",
        args: { location: "San Francisco" },
        id: "call_123"
    }]
});

// Executing a call will always return a ToolMessage
// Here we will see the actual result of the tool call and a reference to the original ID.
const toolMessage = new ToolMessage({
    content: "Sunny, 72°F",
    tool_call_id: "call_123"
});


const invalidToolMessage = new ToolMessage({
    content: "Sunny, 72°F",
    tool_call_id: "invalid_call_123"
});

const humanMessage = new HumanMessage({content: "What is the weather in San Francisco?"});

export async function invokeModelWithToolMessages() {

    // By providing the tool message as a response to the AI message, the model will see the tool call result and incorporate it into its response.
        const response = await model.invoke([
        humanMessage,
        aiMessage,
        toolMessage,
    ]);
    console.log(response);

}


export async function invokeModelWithToolInvalidToolMessage() {

    // This will return BadRequestError: 400 Invalid parameter: 'tool_call_id' of 'invalid_call_123' not found in 'tool_calls' of previous message.
    const response = await model.invoke([
        humanMessage,
        aiMessage,
        invalidToolMessage,
    ]);
    console.log(response);

}

if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}


