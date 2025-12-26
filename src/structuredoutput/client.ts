import {AIMessage, HumanMessage} from "@langchain/core/messages";
import {ChatOpenAI} from "@langchain/openai";
import {createAgent, createMiddleware} from "langchain";
import {z, ZodTypeAny} from 'zod';

const model = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,

});

export const WorkOrderAssumptionsSchema = z.object({
    assumptions: z.array(
        z.string().describe("A single item that has to do with preparatory works of the client.")
    ).describe("Assumptions that define what the client must provide or conditions assumed during execution."),
});


//
// const createResponseFormatMiddleware = () => {
//     return createMiddleware({
//         name: "responseFormatMiddleware",
//         stateSchema: z.object({ structuredResponse: z.object({}) }),
//         afterAgent: async (state) => {
//             const lastMessage = state.messages[state.messages.length - 1];
//             const result = await parseTextToSchema(lastMessage.text, WorkOrderAssumptionsSchema);
//             return {
//                 structuredResponse: result,
//             };
//         },
//     });
// };
//
//

//
export async function parseTextToSchema(text: string, schema: ZodTypeAny) {
    let messages = [new AIMessage(text)];
    const myModel = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
    })
    const formatterModel = myModel.withStructuredOutput(schema);
    const res = await formatterModel.invoke(messages);
    console.log("Result = ",res)
    return res;
}

// const createMessageLimitMiddleware = (maxMessages: number = 50) => {
//     return createMiddleware({
//         name: "MessageLimitMiddleware",
//         beforeModel: (state) => {
//             if (state.messages.length === maxMessages) {
//                 return {
//                     messages: [new AIMessage("Conversation limit reached.")],
//                     jumpTo: "end",
//                 };
//             }
//             return;
//         },
//         afterModel: (state) => {
//             const lastMessage = state.messages[state.messages.length - 1];
//             console.log(`Model returned: ${lastMessage.content}`);
//             return;
//         },
//     });
// };
//
//
//
// const agent = createAgent({
//     model,
//     middleware: [createMessageLimitMiddleware],
//     systemPrompt: "You are a helpfull assistant",
// });
//
// const res = await agent.invoke({
//     messages: [
//         new HumanMessage({
//             content: [
//                 {type: 'text', text: '"convert this into the desired format : Hello World"',},
//             ],
//         }),
//     ]
// });
//
// console.log(res);



const callCounterMiddleware = createMiddleware({
    name: "CallCounterMiddleware",
    stateSchema: z.object({
        modelCallCount: z.number().default(0),
        userId: z.string().optional(),
    }),
    beforeModel: (state) => {
        if (state.modelCallCount > 10) {
            return { jumpTo: "end" };
        }
        return;
    },
    afterModel: async (state) => {

        const lastMessage = state.messages[state.messages.length - 1];
            const result = await parseTextToSchema(lastMessage.text, WorkOrderAssumptionsSchema);
            return {
                structuredResponse: result,
            };


        return { modelCallCount: state.modelCallCount + 1 };
    },
});

const agent = createAgent({
    model: "gpt-4o",
    tools: [],
    middleware: [callCounterMiddleware],
});

const result = await agent.invoke({
    messages: [new HumanMessage("The client will wash the car, setup a ladder and go on with his day")],
    modelCallCount: 0,
    userId: "user-123",
});

console.log(result);