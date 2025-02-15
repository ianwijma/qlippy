import 'zx/globals'

const {quick} = argv;

const {stdout} = await $`git rev-parse HEAD`;
const commitHash = stdout.trim();

const backendPackage = await fs.readJSON('packages/backend/package.json');
const currentVersion = backendPackage.version;

backendPackage.version = `${currentVersion}.${commitHash}`;

fs.writeJson('packages/backend/package.json', backendPackage, {spaces: 2});

try {

    echo`~~~ Cleaning up previous build files...`
    await Promise.allSettled([
        $`rm -r packages/backend/.webpack`,
        $`rm -r packages/backend/out`,
        $`rm -r packages/frontend/.next`,
        $`rm -r packages/frontend/out`,
    ])

    if (quick) {
        echo`~~~ Build frontend quickly...`
        await $`npm run build-quick --workspace=packages/frontend`
    } else {
        echo`~~~ Build frontend...`
        await $`npm run build --workspace=packages/frontend`
    }

    // Ensure the frontend build ends up in the backend build output folder.
    const feInterval = setInterval(async () => {
        const frontendIsPresent = await fs.pathExists('packages/backend/.webpack/renderer/')
        if (!frontendIsPresent) {
            echo`~~~ Copy compiled frontend packages into the backend renderer build folder...`
            await $`mkdir -p packages/backend/.webpack/renderer/`
            await $`cp -r packages/frontend/out/* packages/backend/.webpack/renderer/`;
        }
    }, 100)

    echo`~~~ Build backend...`
    await $`npm run make --workspace=packages/backend`;

    clearInterval(feInterval);
} catch {
    // Don't really care
} finally {
    // Restore the package.json
    backendPackage.version = currentVersion;
    fs.writeJson('packages/backend/package.json', backendPackage, {spaces: 2});
}
