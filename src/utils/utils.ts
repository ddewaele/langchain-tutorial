import path, {dirname} from "path";
import fs from "fs";
import {AIMessage} from "langchain";
import {fileURLToPath} from "url";

export function processImage(response: AIMessage) {
    const base64Data = response.additional_kwargs.tool_outputs[0].result;
    // Strip the data URI prefix if it exists
    const cleanedBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

    // Convert base64 to binary buffer
    const imageBuffer = Buffer.from(cleanedBase64, 'base64');

    return imageBuffer;

}

export function writeToFile(data: Buffer<ArrayBuffer>, fileName: string) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const outputPath = path.join(__dirname, fileName);
    fs.writeFileSync(outputPath, data);
    console.log(`Image saved to ${outputPath}`);
}