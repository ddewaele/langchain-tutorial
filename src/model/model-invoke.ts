import {initChatModel} from "langchain";
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";

/**
 * You can invoke the model and get a response (AIMessage)
 *
 * The AIMessage response looks like this
 *
 * AIMessage {
 *   "id": "chatcmpl-Clt09NadyhiwsxfPlYXyZqXCx0V27",
 *   "content": "Hello! How can I assist you today?",
 *   "additional_kwargs": {},
 *   "response_metadata": {
 *     "tokenUsage": {
 *       "promptTokens": 9,
 *       "completionTokens": 9,
 *       "totalTokens": 18
 *     },
 *     "finish_reason": "stop",
 *     "model_provider": "openai",
 *     "model_name": "gpt-4o-mini-2024-07-18",
 *     "usage": {
 *       "prompt_tokens": 9,
 *       "completion_tokens": 9,
 *       "total_tokens": 18,
 *       "prompt_tokens_details": {
 *         "cached_tokens": 0,
 *         "audio_tokens": 0
 *       },
 *       "completion_tokens_details": {
 *         "reasoning_tokens": 0,
 *         "audio_tokens": 0,
 *         "accepted_prediction_tokens": 0,
 *         "rejected_prediction_tokens": 0
 *       }
 *     },
 *     "system_fingerprint": "fp_11f3029f6b"
 *   },
 *   "tool_calls": [],
 *   "invalid_tool_calls": [],
 *   "usage_metadata": {
 *     "output_tokens": 9,
 *     "input_tokens": 9,
 *     "total_tokens": 18,
 *     "input_token_details": {
 *       "audio": 0,
 *       "cache_read": 0
 *     },
 *     "output_token_details": {
 *       "audio": 0,
 *       "reasoning": 0
 *     }
 *   }
 * }
 *
 */
export async function invokeOpenAIModelCompletionsApi() {
    const model = await initChatModel("gpt-4.1");
    const response = await model.invoke("Hello");
    console.log(response);
}

export async function invokeOpenAIModelResponsesApi() {
    const model = await initChatModel("gpt-4.1", {
        use_chat_completion_api: false,
    });
    const response = await model.invoke("Hello");
    console.log(response);
}

/**
 * You can also stream the response.
 *
 * The stream contains a list of AIMessageChunk objects.
 *
 * AIMessageChunk {
 *   "id": "chatcmpl-Clsz0b5w9YgjZutaaPzI3oO23aRBJ",
 *   "content": " can",
 *   "additional_kwargs": {},
 *   "response_metadata": {
 *     "prompt": 0,
 *     "completion": 0,
 *     "model_provider": "openai",
 *     "usage": {}
 *   },
 *   "tool_calls": [],
 *   "tool_call_chunks": [],
 *   "invalid_tool_calls": []
 * }
 */
export async function streamOpenAIModel() {

    const model = await initChatModel("gpt-4.1");
    const stream = await model.stream("Hello World");
    for await (const chunk of stream) {
        console.log(chunk);
        //process.stdout.write(String(chunk.content || ""));
    }
}

if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}