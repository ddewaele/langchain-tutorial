# Context

Some code samples showing you the use of context in LangChainJS

Consider context as an immutable data structure that you inject in a conversation.
It is available throughout the lifespan of the conversation.
It is typically not altered by the user / agent / flow.

The context is something you pass in when invoking the agent.


```
    const res = await agent.invoke({
            messages: [
                new HumanMessage({
                    content: [
                        {type: 'text', text: "Find info on user ID 1",},
                    ],
                }),
            ],
        },
        {
            context: { userId: "USER_001", apiKey: "key_12345", dbConnection: "jdbc:mysql://localhost:3306/mydb?user=root&password=&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true" }
        }
    );

```


the second argument to the `invoke` function is the optional runtime configuration that can includie

- context : The context for the agent execution.
- configurable : LangGraph configuration options like `thread_id`, `run_id`, etc.
- store : The store for the agent execution for persisting state, see more in {@link https://docs.langchain.com/oss/javascript/langgraph/memory#memory-storage | Memory storage}.
- signal : An optional {@link https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal | `AbortSignal`} for the agent execution.
- recursionLimit : The recursion limit for the agent execution.