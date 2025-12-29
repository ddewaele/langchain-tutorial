import type {ContentBlock} from "langchain";
import {ChatOpenAI} from "@langchain/openai";
import {HumanMessage} from "@langchain/core/messages";
import * as fs from "fs";
import {loadActions} from "../../menu-runner/loader";
import {showMenu} from "../../menu-runner/menu";

// const model = new ChatAnthropic({model: "claude-sonnet-4-5-20250929"});
const model = new ChatOpenAI({model:"gpt-4o-mini", temperature: 0, useResponsesApi: false
});

const filename = "../data/sample.pdf";
const pdfData = fs.readFileSync(filename);
const base64String = pdfData.toString("base64");
const dataUrl = `data:application/pdf;base64,${base64String}`;
const publicUrl = "https://www.buds.com.ua/images/Lorem_ipsum.pdf"

/**
 *
 * Simple content blocks for type="file" allow us to provide
 *
 * source_type="url"       file data url         data:application/pdf;base64,${base64String}
 * source_type="base64"    image base64 data      ${base64String}
 *
 * no public urls are supported
 * these only work with the completions api.
 *
 *
 * Langchain also allows passing native content blocks for files,
 *
 * type="input_file"
 * or type="file" but without specifying a source_type but by providing file: {filename: "sample.pdf", file_data: "dataUrl"}}
 */
export async function fileTypeWithBase64String() {

    // from docs : https://docs.langchain.com/oss/javascript/langchain/messages#standard-content-blocks
    // Error: mime_type key is required for base64 data. when no mime type is provided
    // Error: "Missing required parameter: 'messages[0].content[1].file.file_id'.", when no metadata.filename is provided.
    // you need to mention in the docs that you need to provide metadata.filename ?
    const message = new HumanMessage({
        content: [
            {type: "text", text: "Describe the content of this document."},
            {
                type: "file",
                // source_type: "base64",
                data: base64String,
                mime_type: "application/pdf",
                metadata: { filename: "file.pdf" },
            },

        ],
    });

    const res = await model.invoke([message])
    console.log(res.content);

}

export async function fileTypeWithDataUrl() {

    const message = new HumanMessage({
        content: [
            { type: "text", text: "Describe the content of this document." },
            { type: "file", source_type: "url", url: dataUrl,  metadata: { filename: "file.pdf" }},
        ],
    });

    const res = await model.invoke([message])
    console.log(res.content);

}

export async function fileTypeWithPublicUrl() {
    const message = new HumanMessage({
        content: [
            {type: "text", text: "Describe the content of this document."},
            {type: "file", source_type: "url", url: publicUrl},
        ],
    });

    const res = await model.invoke([message])
    console.log(res.content);

}

/*
 *
 * when using ResponseApi and type:file you will get error :  I'm unable to view documents or images directly. However, if you provide text or a summary of the document, I can help you analyze or summarize it!
 *
 */
export async function fileTypeOpenAiNativeCompletionsApi() {
    // openai native format, not langchain generic
    const message = new HumanMessage({
        content: [
            {type: "text", text: "Describe the content of this document."},
            {type: "file", file: {filename: "sample.pdf", file_data: dataUrl}},
        ],
    });


    const res = await model.invoke([message])
    console.log(res.content);

}

export async function inputFileTypeOpenAiNativeResponsesApi() {

        // chat completions : https://platform.openai.com/docs/guides/pdf-files?api-mode=chat  (uses type file)
        // responses api : https://platform.openai.com/docs/guides/pdf-files?api-mode=responses (uses type input_file)
        // with completions api this fails with "Invalid value: 'input_file'. Supported values are: 'text', 'image_url', 'input_audio', 'refusal', 'audio', and 'file'.",
        let message = new HumanMessage({
            content: [
                {type: "text", text: "Can you describe this PDF file?",},
                {type: "input_file", filename: "sample.pdf", file_data: `data:application/pdf;base64,${base64String}`,},
            ],
        });

        const res = await model.invoke([message])
        console.log(res.content);
}

export async function multiModal1ContentBlocks() {
    // !!! ContentBlocks should be passed to the messages via the contextBlock property, not via context
    const textBlock: ContentBlock.Text = {
        type: "text",
        text: "Can you describe this PDF file ?",
    }

    // with completions you you will get :  BadRequestError: 400 Missing required parameter: 'messages[0].content[1].file'.
    // with responses you will get : "I can't view or analyze PDF files directly. However, if you can provide text or details from the PDF, I'd be happy to help you understand or summarize it!",
    // it works if you provide metadata, but only with the responses api. no mention of the metadata property in the docs.
    // this doesn't work with the completions api : BadRequestError: 400 Missing required parameter: 'messages[0].content[1].file.file_id'.
    // https://github.com/langchain-ai/langchainjs/issues/8227
    // https://github.com/langchain-ai/docs/issues/1672
    // this is how it works. no mention of the metadata property in the docs.
// https://github.com/langchain-ai/langchainjs/issues/7607

    const fileBlock: ContentBlock.Multimodal.File = {
        type: "file",
        mimeType: "application/pdf",
        data: base64String,
        metadata: { filename: "sample.pdf" },
    };

    const message = new HumanMessage({contentBlocks: [textBlock, fileBlock]});
    const res = await model.invoke([message])
    console.log(res.content);

}


if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}

