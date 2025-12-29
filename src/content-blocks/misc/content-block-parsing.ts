/**
 * Experiments ... ignore for now.
 */
import {convertToProviderContentBlock, HumanMessage} from "@langchain/core/messages";

// const message = new AIMessage({
//     content: [
//         {
//             type: "thinking",
//             thinking: "...",
//             signature: "WaUjzkyp...",
//         },
//         {
//             type: "text",
//             text: "...",
//             id: "msg_abc123",
//         },
//
//         { type: "image", source_type: "url", url: "publicImageUrl" },
//
//         {
//             type: "image",
//             source_type: "base64",      // when this is not provided you get an error "Invalid value: 'image'. Supported values are: 'text', 'image_url', 'input_audio', 'refusal', 'audio', and 'file'.",
//             mime_type: "image/jpeg",
//             data: "xxx",
//         },
//         {type: "file", source_type: "url", url: "https://example.com/path/to/document.pdf"},
//
//     ],
//
//     response_metadata: {model_provider: "anthropic"},
// });

const message = new HumanMessage({
    content: [
        { type: "text", text: "Describe the content of this document." },
        { type: "image", source_type: "url", url: "publicImageUrl", },
    ],
});

// console.log(message.contentBlocks);


// const block = { type: "image", data: "iVBORw0KGgo...", mimeType: "image/png" };
// const part = convertStandardContentBlockToCompletionsContentPart(block);
// console.log(part);

const block = {
        type: "file",
        source_type: "base64",
        mime_type: "application/pdf",
        data: "base64String",
        metadata: { filename: "file.pdf" },
    }



const part = convertToProviderContentBlock(block);
console.log(part);


//
// const message2 = new HumanMessage({
//     contentBlocks: [
//         {type: "text", text: "Describe this image."},
//         {type: "image", url: "publicImageUrl"},
//     ],
// });
//
// console.log(message2.content);
