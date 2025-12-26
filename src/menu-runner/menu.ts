import readline from "readline";
import {CliAction} from "./types";

export async function showMenu(actions: CliAction[]) {
    console.clear();
    console.log("Select an action:\n");

    actions.forEach((a, i) => {
        console.log(`  ${i + 1}. ${a.label}`);
    });

    console.log("\n  q. Quit\n");

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const answer: string = await new Promise(resolve =>
        rl.question("> ", resolve)
    );

    rl.close();

    if (answer === "q") process.exit(0);

    const index = Number(answer) - 1;
    const action = actions[index];

    if (!action) {
        console.log("Invalid choice");
        return showMenu(actions);
    }

    console.clear();
    console.log("--------------------------------------------------------")
    console.log(`Running action: ${action.label}`);
    console.log("--------------------------------------------------------")
    await action.run();
    console.log("\nPress Enter to continue…");

    await new Promise(resolve => {
        const rl2 = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        rl2.question("", () => {
            rl2.close();
            resolve(null);
        });
    });

    return showMenu(actions);
}