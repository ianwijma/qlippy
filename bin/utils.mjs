import 'zx/globals';

/**
 * @param key
 * @returns {Promise<string|undefined>}
 */
export const readBackendPackageJsonKey = async (key) => {
    const packageJson = await fs.readJSON('packages/backend/package.json');

    return packageJson?.[key];
}

/**
 * @param key {string}
 * @param value {string|undefined}
 * @returns {Promise<void>}
 */
export const writeBackendPackageJson = async (key, value) => {
    const packageJson = await fs.readJSON('packages/backend/package.json');

    if (!!value) {
        packageJson[key] = value;
    } else {
        delete packageJson[key];
    }

    fs.writeJson('packages/backend/package.json', packageJson, {spaces: 2});
}