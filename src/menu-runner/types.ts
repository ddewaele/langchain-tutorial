export interface CliAction {
    label: string;
    description?: string;
    run: () => void | Promise<void>;
}

export type CliModule = Record<string, CliAction>;

export function cliAction(action: CliAction): CliAction {
    return action;
}