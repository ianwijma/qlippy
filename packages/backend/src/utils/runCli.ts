import {spawn, SpawnOptionsWithoutStdio} from 'child_process';

export type RunCliReturn = { exitCode: number, out: string, error: string };

export const runCli = async (base: string, args: string | string[], options: SpawnOptionsWithoutStdio = {}): Promise<RunCliReturn> => {
    args = typeof args === 'string' ? [args] : args;

    return new Promise<RunCliReturn>((resolve) => {
        let exitCode: number;
        let standardOut: string[] = [];
        let standardError: string[] = [];

        const child = spawn(base, args, options);

        child.stdout.on('data', (data) => standardOut.push(String(data)));
        child.stderr.on('data', (data) => standardError.push(String(data)));
        child.on('exit', (code) => {
            exitCode = code;
            resolve({
                exitCode,
                out: standardOut.join('').trim(),
                error: standardError.join('').trim()
            });
        });
    });
}

export const runCliPromise = async (base: string, args: string | string[], options: SpawnOptionsWithoutStdio = {}): Promise<string> => {
    const {exitCode, out, error} = await runCli(base, args, options);

    if (exitCode === 0) {
        return out;
    } else {
        throw new Error(error);
    }
}
