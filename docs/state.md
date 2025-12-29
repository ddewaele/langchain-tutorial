# State

State allows you to define custom key value pairs that will be passed along your flow

These are defined on the middleware

To use custom state , you do the following steps

## 1. Define the state

```
const UserState = z.object({
  userName: z.string(),
});
```

## 2. Apply the state to the middleware

```
const userStateMiddleware = createMiddleware({
  name: "UserState",
  stateSchema: UserState,
  beforeModel: (state) => {
    const name = state.userName;
    return;
  },
});
```

## 3. Invoke the agent with the state

```
await agent.invoke({
  messages: [{ role: "user", content: "Hi" }],
  userName: "Ada",
});
```

## Full code


```
import * as z from "zod";
import { createAgent, createMiddleware, tool } from "langchain";

const UserState = z.object({
  userName: z.string(),
});

const userState = createMiddleware({
  name: "UserState",
  stateSchema: UserState,
  beforeModel: (state) => {
    // Access custom state properties
    const name = state.userName;
    // Optionally modify messages/system prompt based on state
    return;
  },
});

const greet = tool(
  async () => {
    return "Hello!";
  },
  {
    name: "greet",
    description: "Greet the user",
    schema: z.object({}),
  }
);

const agent = createAgent({
  model: "claude-sonnet-4-5-20250929",
  tools: [greet],
  middleware: [userState],
});

await agent.invoke({
  messages: [{ role: "user", content: "Hi" }],
  userName: "Ada",
});
```
