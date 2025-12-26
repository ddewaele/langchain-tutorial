# Technical

When you pass content to a model, LangChain will do the following

- chat_models.ts
  - invoke is called on the model
- chat_models.ts
  - generatePrompt is called on the model
   here we will already go to @langchain/openai for the _generate function
- index.ts (@langchain/openai)
  - _generate is called
  - here convertMessagesToCompletionsMessageParams is called
  - here we also do a check for output_version v1
- data.ts
  - check if we are dealing with a data content block (source_type = text / url / base64 )
  - if so convertToProviderContentBlock is called
  - convertToProviderContentBlock uses a provider specific converter
  - looks at the block type (text / image / audio / file / id)
- completions.s
  - base64 content is parsed (looks for a pattern `/^data:(\w+\/\w+);base64,([A-Za-z0-9+/]+=*)$/`)
  - if it doesn't find it throws an error :  URL file blocks with source_type url must be formatted as a data URL for ChatOpenAI
  - uses some logic that all of a suddent expects a metadata.filename property to be present (not mentioned anywhere)
```
            return {
              type: "file",
              file: {
                file_data: block.url, // formatted as base64 data URL
                ...(block.metadata?.filename || block.metadata?.name
                  ? {
                      filename: (block.metadata?.filename ||
                        block.metadata?.name) as string,
                    }
                  : {}),
              },
            };
          }
```


source_type can be 

- url
- base64
- text
- id

type can be 

- text
- image
- audio
- file
- id


a block can also contain a "data" field ?

```
const KNOWN_BLOCK_TYPES = [
    "image",
    "video",
    "audio",
    "text-plain",
    "file"
];
```



In data.ts the literal values used for the type property are:

- image
- audio
- file
- text
- image_url (used by message/image types)

Notes:

- Data.DataContentBlockType is image | audio | file | text.
- MessageContentText uses text; MessageContentImageUrl uses image_url.
- MessageContentComplex allows arbitrary strings as well (it includes string).

what do all these mean ? 
That we want to force the return of the ContentBlock.MultiModel typed objects ?

```
/**
* @deprecated Don't use data content blocks. Use {@link ContentBlock.Multimodal.Data} instead.
  */
  export function isDataContentBlock(
  content_block: object
  ): content_block is Data.DataContentBlock {
  return (
  typeof content_block === "object" &&
  content_block !== null &&
  "type" in content_block &&
  typeof content_block.type === "string" &&
  "source_type" in content_block &&
  (content_block.source_type === "url" ||
  content_block.source_type === "base64" ||
  content_block.source_type === "text" ||
  content_block.source_type === "id")
  );
  }

```

something is considered a DataContentBlock if 

- the value is an object and not null
- it has a type property and typeof content_block.type === "string"
- it has a source_type property whose value is one of: url, base64, text, or id
