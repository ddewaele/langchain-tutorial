# Models

## What is a model?

The reasoning engine behind LangChain agents.
They represent the LLMs that you are used to interacting with.


## Initializing a model

There are 2 ways to initialize a model

- using the initChatModel method
- using the Chat Model classes directly (`ChatAnthropic`, `ChatOpenAI`)

### initChatModel

This is the easiest way to initialize a model.

```
const model = await initChatModel("gpt-4.1");
const response = await model.invoke("Hello");
console.log(response);
```
### Chat Model Classes

You can also instantiate a model class directly and invoke it with messages.
This is less dynamic. In your code you need to import the model class directly.
In the previous example it is all resolved at runtime. 

```
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
model: "gpt-4o-mini",
temperature: 0
});

const response = await llm.invoke("Hello World")
console.log(response)
```

## Model Responses

You will always get back a single response when invoking a model, never a list of messages

```
AIMessage {
  "id": "chatcmpl-CpA7oEovnfzvBNJoayMH15ZheT4UR",
  "content": "Hello! How can I assist you today?",
  "additional_kwargs": {},
  "response_metadata": {
    "tokenUsage": {
      "promptTokens": 10,
      "completionTokens": 9,
      "totalTokens": 19
    },
    "finish_reason": "stop",
    "model_provider": "openai",
    "model_name": "gpt-4o-mini-2024-07-18",
    "usage": {
      "prompt_tokens": 10,
      "completion_tokens": 9,
      "total_tokens": 19,
      "prompt_tokens_details": {
        "cached_tokens": 0,
        "audio_tokens": 0
      },
      "completion_tokens_details": {
        "reasoning_tokens": 0,
        "audio_tokens": 0,
        "accepted_prediction_tokens": 0,
        "rejected_prediction_tokens": 0
      }
    },
    "system_fingerprint": "fp_644f11dd4d"
  },
  "tool_calls": [],

```

## Model Streaming

You can also stream responses from the model. This will give you the chunks of the response as they come in.

```
AIMessageChunk {
    "id": "chatcmpl-Cp0mjqHhS0Qp15J4QZbyq1JCdRFGW",
    "content": "",
    "additional_kwargs": {
      "tool_calls": [
        {
          "index": 0,
          "id": "call_p6bgV9YiGgapSTJ3QvDgx6g6",
          "type": "function",
          "function": "[Object]"
        }
      ]
    },
    "response_metadata": {
      "model_provider": "openai",
      "usage": {}
    },
    "tool_calls": [
      {
        "name": "get_weather",
        "args": {},
        "id": "call_p6bgV9YiGgapSTJ3QvDgx6g6",
        "type": "tool_call"
      }
    ],
    "tool_call_chunks": [
      {
        "name": "get_weather",
        "args": "",
        "id": "call_p6bgV9YiGgapSTJ3QvDgx6g6",
        "index": 0,
        "type": "tool_call_chunk"
      }
    ],
    "invalid_tool_calls": []
  },
```

Note that 

- streaming needs to be enabled on the model when it is created.
- an agent also has a `stream` method that works similarly to the model stream method but not exactly the same. the output of an agent stream method depends on the stream mode.
