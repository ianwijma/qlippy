import 'zx/globals';
import concurrently from "concurrently";
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory
const PROJECT_ROOT = path.resolve(__dirname, '..');

const backendPackage = await fs.readJSON('packages/backend/package.json');
const currentProductName = backendPackage.productName;

backendPackage.productName = `${currentProductName}-dev`;

fs.writeJson('packages/backend/package.json', backendPackage, {spaces: 2});

const restore = () => {
    backendPackage.productName = currentProductName;
    fs.writeJson('packages/backend/package.json', backendPackage, {spaces: 2});
}

process.on("SIGINT", () => {
    restore();
});

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