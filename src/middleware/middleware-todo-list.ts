/**
 *
 * Example of all the hooks in the middleware system.
 *
 * Shows how to access both the state and the context info
 * Shows how to do state updates
 * Shows how to pass context and state to the model
 *
 * Concepts used :
 *
 * - Middleware
 * - Hooks
 * - State
 * - Context
 *
 */
import * as z from "zod";
import {tool} from "@langchain/core/tools";
import {createAgent, todoListMiddleware} from "langchain";
import {HumanMessage} from "@langchain/core/messages";
import {loadActions} from "../menu-runner/loader";
import {showMenu} from "../menu-runner/menu";
import fs from "fs";


export async function executeTodoList() {

    const readFile = tool(
        async ({ filename }) => {
            console.log("Reading file: " + filename);

            const badCode = fs.readFileSync(`../${filename}`, "utf8");
            return badCode;

        },
        {
            name: "read_file",
            description: "Reads the content of a file",
            schema: z.object({
                filename: z.string(),
            }),
        }
    );

    const writeFile = tool(
        async ({ filename,content }) => {
            console.log(`Writing ${content} to file ${filename}`);
            fs.writeFileSync(`../${filename}`, content, "utf8");
        },
        {
            name: "write_file",
            description: "Writes to a file",
            schema: z.object({
                filename: z.string(),
                content: z.string(),
            }),
        }
    );


    const agent = createAgent({
        model: "gpt-5-mini",
        tools: [readFile, writeFile],
        middleware: [todoListMiddleware()],

    });



    const res = await agent.invoke({
            messages: [
                new HumanMessage({
                    content: [
                        // {type: 'text', text: "Read the specs in the specs.txt document, generate some tests for it, save them and then run the tests",},
                        {type: 'text', text: `
    
    Help me refactor my codebase located in badcode.txt.
    Make sure that tests are also written to ensure that the code still works as expected after the refactoring.
    You will also provide functional documentation of what the code does
    You will also provide technical documentation of what the code does
    You will also provide manual test scenarios that a QA team can perform on the code.
    Based on the code and your refactoring proposals use your "write_todos" tool to come up with some todos.
    You will use the "write_todos" tool to both read and update the todo statuses.
    
    For each todo make sure to execute it and 
    
    1. show me the output before continuing to the next one.
    2. write that output (your tought process, code snippets, ....) in a markdown file named "todo-{todo-nr}.md" using the write_file tool.
    3. update the source code in a file called code-{todo-nr}.txt using the write_file tool.
    4. mark the todo as done and continue to the next todo.
      
    Make sure to execute all todos.
    If all todos have status completed you can summarize your conclusions and end the workflow`,
                        },
                    ],
                }),
            ],

        },{recursionLimit: 50 },

    );

    console.log(res.messages);
    console.log(res.todos);


}


if (import.meta.url === `file://${process.argv[1]}`) {
    loadActions(import.meta.url)
        .then(showMenu)
        .catch(console.error);
}