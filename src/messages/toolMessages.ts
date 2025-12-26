import {AIMessage, ToolMessage} from "langchain";
import {HumanMessage} from "@langchain/core/messages";
import {ChatOpenAI} from "@langchain/openai";

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

// By providing the tool message as a response to the AI message, the model will see the tooll call result and incorporate it into its response.
const messages = [
    new HumanMessage("What's the weather in San Francisco?"),
    aiMessage,  // Model's tool call
    toolMessage,  // Tool execution result
];

const response = await model.invoke(messages);  // Model processes the result
console.log(response);