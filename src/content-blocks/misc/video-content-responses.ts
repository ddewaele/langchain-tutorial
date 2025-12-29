/**
 * Experiments ... ignore for now.
 */
import type {ContentBlock} from "langchain";
import {ChatOpenAI} from "@langchain/openai";
import {type AIMessage, HumanMessage} from "@langchain/core/messages";
import * as fs from "fs";

const model = new ChatOpenAI({model:"gpt-4o-mini", temperature: 0, useResponsesApi: false});

const filename = "sample.mpg";
const fileData = fs.readFileSync(filename);
const base64String = fileData.toString("base64");
const dataUrl = `data:application/mpg;base64,${base64String}`;

let message: HumanMessage;
let res : AIMessage;


const textBlock: ContentBlock.Text = {
    type: "text",
    text: "Can you describe this PDF file ?",
}

// you will get BadRequestError: 400 Missing required parameter: 'messages[0].content[1].file'.
// const fileBlock: ContentBlock.Multimodal.File = {
//     type: "file",
//     mimeType: "application/pdf",
//     filename: "sample.pdf",
//     data: base64String,
// }

// this is how it works. no mention of the metadata property in the docs.
// https://github.com/langchain-ai/langchainjs/issues/7607
const fileBlock: ContentBlock.Multimodal.File = {
    type: "file",
    mimeType: "application/pdf",
    data: base64String,
    metadata: { filename: "sample.pdf" },
};

// this is the way it needs to be sent
const alternativeFileBlock = {
    type: "file",
    file: {
        filename: "sample.pdf",
        file_data: dataUrl
    },
}
//
// // message: 'Invalid chat format. Content blocks are expected to be either text or image_url type.',
// let messageChatCompletions = new HumanMessage({
//     content: [
//         {
//             type: "file",
//             file: {
//                 filename: "sample.pdf",
//                 file_data: dataUrl
//             },
//         },
//         {
//             type: "text",
//             text: "Can you describe this PDF file?",
//         },
//     ],
// });
//
//



// from https://docs.langchain.com/oss/javascript/langchain/messages#standard-content-blocks
// message: "Invalid value: 'file'. Supported values are: 'input_text', 'input_image', 'output_text', 'refusal', 'input_file', 'computer_screenshot', and 'summary_text'.",
// !!!!!! this is because you need to use contentBlocks instead of content if you want to use type:file !!!!!!!
const messageResponsesApi2 = new HumanMessage({
    content: [
        { type: "text", text: "Describe the content of this document." },
        {
            type: "file",
            mimeType: "application/pdf",
            data: `data:application/pdf;base64,${base64String}`,
            metadata: {
                "filename": "2020-Scrum-Guide-US.pdf"
            }
        },
    ],
});

// message = new HumanMessage({
//     contentBlocks: [
//         {
//             type: "file",
//             mimeType: "application/pdf",
//             data: base64String,
//         },
//         {
//             type: "text",
//             text: "Can you describe this PDF file?",
//         },
//     ],
// });

// messageResponsesApi = new HumanMessage({contentBlocks: [textBlock,fileBlock]});

// no error but no image sent
// const messages = new HumanMessage({
//     "content": [
//         {
//             "type": "text",
//             "text": "You are a helpful assistant ..."
//         },
//         {
//             "type": "file",
//             "base64": base64String,
//             "mimeType": "application/pdf"
//         }
//     ]
// });

// this works ?
// let messages = new HumanMessage({
//     content: [
//         {
//             type: "file",
//             base64: base64String,
//             mimeType: "application/pdf",
//         },
//         {
//             type: "text",
//             text: "Can you describe this PDF file?",
//         },
//     ],
// });


let messages = new HumanMessage({
    contentBlocks: [
        {
            type: "video",
            mimeType: "video/mpg",
            data: base64String,
        },
        {
            type: "text",
            text: "Can you describe this video?",
        },
    ],
});




// // this works
// let messages = new HumanMessage({
//     content: [
//         {
//             type: "input_file",
//             filename: "sample.pdf",
//             file_data: `data:application/pdf;base64,${base64String}`,
//         },
//         {
//             type: "text",
//             text: "Can you describe this PDF file?",
//         },
//     ],
// });

res = await model.invoke([messages])
console.log(res.content);

