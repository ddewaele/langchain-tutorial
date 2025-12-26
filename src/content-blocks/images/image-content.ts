import type {ContentBlock} from "langchain";
import {ChatOpenAI} from "@langchain/openai";
import {HumanMessage} from "@langchain/core/messages";
import * as fs from "fs";
import {loadActions} from "../../menu-runner/loader";
import {showMenu} from "../../menu-runner/menu";

const model = new ChatOpenAI({model:"gpt-4o-mini", temperature: 0, useResponsesApi: true});

const filename = "computer.jpg";
const pdfData = fs.readFileSync(filename);
const base64String = pdfData.toString("base64");
const base64DataUrl = `data:image/jpeg;base64,${base64String}`;
const imageUrl = "https://images.all-free-download.com/images/graphiclarge/laptop_183544.jpg";

/**
 *
 * Simple content blocks for type="image" allow us to provide
 *
 * source_type="url"       image public url       https://images.all-free-download.com/images/graphiclarge/laptop_183544.jpg
 * source_type="url"       image data url         data:image/jpeg;base64,${base64String}
 * source_type="base64"    image base64 data      ${base64String}
 *
 * Langchain also allows passing native content blocks for images, like the `image_url` type
 *
 */
export async function publicImageUrl() {

    // works with image but doesn't work with file.'
    // when using type file : error : URL file blocks with source_type url must be formatted as a data URL for ChatOpenAI
    // when using type file and url `data:image/jpg;base64,${base64String}` : BadRequestError: 400 Missing required parameter: 'messages[0].content[1].file.file_id'.
    // with responses api  message: "Invalid value: 'image_url'. Supported values are: 'input_text', 'input_image', 'output_text', 'refusal', 'input_file', 'computer_screenshot', and 'summary_text'.",
    const message = new HumanMessage({
        content: [
            {type: "text", text: "Describe this image."},
            {type: "image", source_type: "url", url: imageUrl},
        ],
    });

    const res = await model.invoke([message]);
    console.log(res.content);
}

// with responses api : BadRequestError: 400 Invalid value: 'image_url'. Supported values are: 'input_text', 'input_image', 'output_text', 'refusal', 'input_file', 'computer_screenshot', and 'summary_text'.
export async function dataUrl() {
    // works with image but not with file:  ...file_id required.
    const message = new HumanMessage({
        content: [
            {type: "text", text: "Describe this image."},
            {type: "image", source_type: "url", url: base64DataUrl},
        ],
    });

    const res = await model.invoke([message]);
    console.log(res.content);
}

export async function base64ImageData() {

    // From base64 data
    // does not work with openai without providing a mime type.
    // without mimetype : Error: mime_type key is required for base64 data.
    // with wrong mimetype : BadRequestError: 400 Invalid MIME type. Only image types are supported.
    // extras field also doesn't work (as per documentation)
    // https://github.com/langchain-ai/docs/issues/1672
    // with responses api : BadRequestError: 400 Invalid value: 'image_url'. Supported values are: 'input_text', 'input_image', 'output_text', 'refusal', 'input_file', 'computer_screenshot', and 'summary_text'.
    const message = new HumanMessage({
        content: [
            {type: "text", text: "Describe this image."},
            {type: "image", source_type: "base64", mime_type: "image/jpeg", data: base64String},
        ],
    });

    const res = await model.invoke([message]);
    console.log(res.content);

}

export async function openAiNative() {


    // openai native format. Passthrough ... no conversion is happening
    const message1 = new HumanMessage({
        content: [
            { type: "text", text: "Describe this image." },
            { type: "image_url",  image_url: { url: imageUrl }},
        ],
    });

    const message2 = new HumanMessage({
        content: [
            { type: "text", text: "Describe this image." },
            { type: "image_url",  image_url: { url: base64DataUrl }},
        ],
    });

    const res1 = await model.invoke([message1]);
    console.log(res1.content);

    const res2 = await model.invoke([message2]);
    console.log(res2.content);

}

/**
 *
 * These typed content blocks are similar as the ones above, but they are typed as ContentBlock objects.
 * The also use type="image" but depending on the type support different properties.
 *
 */
export async function contentBlockImagePublicUrl() {

    const textBlock: ContentBlock.Text = {
        type: "text",
        text: "Describe the  image you are seeing.",
    }

    const imageUrlBlock: ContentBlock.Multimodal.Image = {
        type: "image",
        url: imageUrl
    }

    const message = new HumanMessage({
        contentBlocks: [
            textBlock,
            imageUrlBlock,
        ]
    })

    const res = await model.invoke([message]);
    console.log(res.content);

}

export async function contentBlockDataUrl() {

    const textBlock: ContentBlock.Text = {
        type: "text",
        text: "Describe the  image you are seeing.",
    }

    const imageUrlDataBlock: ContentBlock.Multimodal.Image = {
        type: "image",
        url: base64DataUrl
    }

    const message = new HumanMessage({
        contentBlocks: [
            textBlock,
            imageUrlDataBlock,
        ]
    })

    const res = await model.invoke([message]);
    console.log(res.content);

}

export async function contentBlockBase64ImageData() {

    const textBlock: ContentBlock.Text = {
        type: "text",
        text: "Describe the  image you are seeing.",
    }


    const imageDataBlock :  ContentBlock.Multimodal.Image = {
        type: "image",
        data: base64String,
        mimeType: "image/png",
    }

    const message = new HumanMessage({
        contentBlocks: [
            textBlock,
            imageDataBlock,
        ]
    })

    const res = await model.invoke([message]);
    console.log(res.content);

}


if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}