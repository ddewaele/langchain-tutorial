import {createAgent, createMiddleware} from "langchain";


const redactMiddleware = createMiddleware({
    name: "RedactMiddleware",
    beforeModel: (state) => {
        console.log("Before model called with state: ", state);
        state.messages.forEach(m => {
            m.content = m.content.replace(/\b[A-Z0-9._%+-]+@gmail\.com\b/gi, "[REDACTED]");
        });
    }
});

const agent = createAgent({
    model: "gpt-4o-mini",
    tools: [],
    systemPrompt: "You are a helpful assistant. You will echo the users name and email in your response",
    middleware: [redactMiddleware],
});

const res = await agent.invoke({
    messages: [{ role: "user", content: "Hi, I am Davy (ddewaele@gmail.com), how will AI effect the world?" }]
});

console.log(res);
