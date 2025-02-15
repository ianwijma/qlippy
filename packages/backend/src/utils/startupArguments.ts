import YargsParser, {Arguments} from 'yargs-parser'

type StartupArguments = Arguments & {
    dev: boolean,
    reset: boolean,
}

export const startupArguments: StartupArguments = YargsParser(process.argv.slice(1)) as StartupArguments
