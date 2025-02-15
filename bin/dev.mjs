import 'zx/globals';
import concurrently from "concurrently";
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const PROJECT_ROOT = path.resolve(__dirname, '..');

const {result} = concurrently(
    [
        {
            command: 'npm run dev',
            name: 'frontend',
            cwd: path.resolve(PROJECT_ROOT, 'packages', 'frontend')
        },
        {
            command: 'npm run dev',
            name: 'backend',
            cwd: path.resolve(PROJECT_ROOT, 'packages', 'backend')
        },
    ],
    {
        prefix: 'name',
        killOthers: ['failure'],
    },
);
result.then(console.log, console.error);