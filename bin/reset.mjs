import 'zx/globals'

echo`~~~ Cleaning up build files...`
await Promise.allSettled([
    $`rm -r packages/backend/.vite`,
    $`rm -r packages/backend/out`,
    $`rm -r packages/frontend/.next`,
    $`rm -r packages/frontend/out`,
])

echo`~~~ Cleaning up node_modules...`
await Promise.allSettled([
    $`rm -r node_modules`,
    $`rm -r packages/backend/node_modules`,
    $`rm -r packages/common/node_modules`,
    $`rm -r packages/frontend/node_modules`,
])

echo`~~~ Running NPM Install `
await $`npm install`;