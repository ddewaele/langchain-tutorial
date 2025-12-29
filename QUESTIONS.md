# Some questions

## State

From : https://docs.langchain.com/oss/javascript/migrate/langchain-v1#custom-state

It is no longer ok to put the stateSchema in the createAgent call ?
```
const customCountStateSchema = z.object({
    count : z.number()
});

export const agent = createAgent({
model: new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0 }),

    stateSchema: customCountStateSchema,

    tools: [incrementTool],
    systemPrompt: SYSTEM_PROMPT,

});
```

## Annotation.Root usage ? 

Do we still use this as schema ?

```
const stateSchema = Annotation.Root({
    ...MessagesAnnotation.spec,
    uppercased: Annotation<string>(),
})
```