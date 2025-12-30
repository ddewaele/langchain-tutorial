# Some important concepts to know about


## Core concepts

- Understand core concepts such as messages / agents / models / context / middleware / state / .... 

## Migration guide

- Read the migration guide if you are coming from older versions of LangChain / LangGraph :  https://docs.langchain.com/oss/javascript/migrate/langchain-v1#custom-state
- Understand that a lot of LangGraph concepts are now available in LangChain agents + middleware

## Invoking Agents

- Invoking vs Streaming ( + streaming modes)
- Agent != Model
- Passing config
- Passing context
- Passing state (?)

## Middleware

- custom and built-in middleware can be used
- allows for custom hooks to control flow
- can have a custom state schema object associated
- that state can be used and updated.
- Understand the different use-cases for the middleware

## Context

Define a ContextSchema object on the agent


## CustomState

- Defined in middleware using the stateSchema property
- Define it on your middleware and hook up your middleware on the agent
- Pass along state alongside your message when invoking the agent (think of it as extending the base state)
- Access the state in your middleware via the `state` argument or the `request.state` argument
- 