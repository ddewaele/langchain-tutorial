import {initChatModel} from "langchain";
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";
import {processImage, writeToFile} from "../utils/utils";


export async function webSearchTools() {
    const model = await initChatModel("gpt-4.1");
    model.bindTools([{ type: "web_search_preview" }])
    const modelWithTools = model.bindTools([{ type: "web_search_preview" }])

    const res = await modelWithTools.invoke("What was a positive news story from today?");
    console.log(res.content);

}

export async function imageGenerationTools() {
    const model = await initChatModel("gpt-4.1");

    const modelWithTools = model.bindTools([
        {
            type: "image_generation",
            quality: "low",
        }
    ]);

    const response = await modelWithTools.invoke(
        "Draw a random short word in green font."
    )

    const data = processImage(response);
    console.log(data)

    writeToFile(data, 'output-image.png')


}




if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}