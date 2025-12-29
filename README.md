# LangChainJS Tutorial

Collection of LangChainJS Tutorials and Examples.

## Getting started

Make sure you have a `.env` in the root of the project.

An `env-loader.ts` is included to load up the `.env` file. You can use this to load up environment variables.
In WebStorm you can setup the run configuration to use this file before launching your main file.

![img.png](docs/images/launch-config.png)

## Tutorials

(trying to find a good structure)

- [Getting started](./docs/getting-started.md)
  - Introduction to LangChainJS
  - End-to-end example
- [Messages](./docs/messages.md)
  - Concept of messages
  - Type of messages
  - Message structure
  - Streaming messages (chunks)
  - Creating messages 
- [Models](./docs/model.md)
  - Concept of models
  - Instantiating models
  - Different Providers
    - OpenAI
    - Claude
  - Invoking vs Streaming
  - Provider specific tools
  - MultiModal
- Structuted output 
  - Different strategies
- Runtime config
  - Context for the agent execution.
  - LangGraph configuration options
  - Store for the agent execution for persisting state
  - AbortSignal for the agent execution.
  - The recursion limit for the agent execution.
- State Management
  - Custom State
- Middleware
  - Hooks
    - Post model hooks
    - Pre model hooks
  - Built-in Middleware
  - Custom Middleware
  - Middleware Custom State
  - 
- Agents
  - Simple Agent
  - Streaming
  - Supervisor
    - Tool calling
    - Handoff
  - Passing state between agents
  - Passing config between agents
- ???