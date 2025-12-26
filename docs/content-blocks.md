Content blocks provide a unified way to work with other types of content

if you want to work with 

- multimodal content (image, video, audio)
- file based content (pdf, docx)

then using Content Blocks can be an interesting route.

You've probably seen basic message looks like this

```
{ role: "user", content: "Hello, how are you?" }
```

## New ContentBlock types

The text (string) content can be represented as a text block

```
const textBlock: ContentBlock.Text = {
    type: "text",
    text: "Hello, how are you?",
}
```

An image block looks like this 

```
const imageBlock: ContentBlock.Multimodal.Image = {
    type: "image",
    url: "https://cdn.britannica.com/77/170477-050-1C747EE3/Laptop-computer.jpg",
}
```

And a file block looks like this
(For openAI you need to provide the metadata.filename property)

```
const fileBlock: ContentBlock.Multimodal.File = {
    type: "file",
    mimeType: "application/pdf",
    data: base64String,
    metadata: { filename: "sample.pdf" },
};
```

Alternative ways to define an image content block are  

```
{type: "image", url: "https://someImage.com/image.jpg"}
{type: "image", url: "data:image/jpeg;base64,${base64String}"}
{type: "image", data: base64String, mimeType: "image/jpeg"},
```

and files

```
```

You can add 1 or more content blocks by embedding them in a HumanMessage 

```
res = await model.invoke([new HumanMessage({
    contentBlocks: [
        textBlock,
        imageBlock,
    ],
})]);
```

## Original content blocks 

You can also provide a content property

The first version uses the OpenAI “vision-style” content blocks (type: "image" with base64 data).
The second version uses the Chat Completions “image_url” schema, which LangChain also supports.

```
message = new HumanMessage({
    content: [
        { type: "text", text: "Describe the content of this image." },
        { type: "image", source_type: "base64", data: dataUrl,},
    ],
});
```

```
message = new HumanMessage({
    content: [
        { type: "text", text: "Describe this image." },
        { type: "image_url", image_url: {url: dataUrl}}
    ]
});
```



## Standard langchain content format

### Images

```
{ type: "image", source_type: "url", url: publicImageUrl },
{ type: "image", source_type: "url", url: dataUrl },
{ type: "image", source_type: "base64", mime_type: "image/jpeg", data: base64String},
{ type: "image_url",  image_url: { url: publicImageUrl }},
```

### File 

```
{ type: "file", source_type: "url", url: dataUrl, metadata: { filename: "file.pdf" } },
{ type: "file", source_type: "base64", data: base64String, mime_type: "application/pdf", metadata: { filename: "file.pdf" }, },
{ type: "file", file: { filename: "sample.pdf", file_data: dataUrl },},
```


## OpenAI image format 

### Completions

url will be an actual url or a base64 data url

```
{
  "model" : "gpt-4o-mini",
  "temperature" : 0,
  "stream" : false,
  "messages" : [ {
    "role" : "user",
    "content" : [ {
      "type" : "text",
      "text" : "Describe this image."
    }, {
      "type" : "image_url",
      "image_url" : {
        "url" : "https://cdn.britannica.com/77/170477-050-1C747EE3/Laptop-computer.jpg"
      }
    } ]
  } ]
}
```