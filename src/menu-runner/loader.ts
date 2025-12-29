import dotenv from "dotenv";

dotenv.config({ path: [".env", "./../.env", "./../../.env"] });

export interface CliAction {
    name: string;
    label: string;
    run: () => void | Promise<void>;
}

function humanize(name: string) {
    return name
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/_/g, " ")
        .replace(/^./, c => c.toUpperCase());
}

export async function loadActions(moduleUrl: string): Promise<CliAction[]> {
    const mod = await import(moduleUrl);

    return Object.entries(mod)
        .filter(([key, value]) =>
            typeof value === "function" &&
            key !== "default" &&
            key !== "main"
        )
        .map(([name, fn]) => ({
            name,
            label: humanize(name),
            run: fn as () => void | Promise<void>,
        }));
}