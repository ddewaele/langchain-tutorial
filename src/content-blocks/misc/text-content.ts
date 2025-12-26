import type {ContentBlock} from "langchain";
import {ChatOpenAI} from "@langchain/openai";

const model = new ChatOpenAI({model:"gpt-4o-mini", temperature: 0, useResponsesApi: true});

// Text block
const textBlock: ContentBlock.Text = {
    type: "text",
    text: "Hello, how are you?",
}


const res = await model.invoke([{ role: "user", content: "Hello, how are you?" }]);
console.log(res.content);


// const humanMessage = new HumanMessage({contentBlocks: [textBlock]})
// const textResponse = await model.invoke([humanMessage]);
// console.log(textResponse.content);

// const textResponse = await model.invoke([{ role: "user", content: "Hello, how are you?" }]);
// console.log(textResponse.content);
