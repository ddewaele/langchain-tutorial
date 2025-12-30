# Improvements

https://docs.langchain.com/oss/javascript/migrate/langchain-v1

use context instead of configurable

await agent.invoke(
{
messages: [new HumanMessage("Explain async programming")]
},
{
configurable: {
userRole: "expert",
}
}
);