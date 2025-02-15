const hasWindow = typeof window !== 'undefined';

export const isFrontendBuild = typeof process !== 'undefined' && process.env.IS_NEXT_SERVER === 'true';
export const isFrontend = !isFrontendBuild && hasWindow && process.env.NEXT_PUBLIC_IS_NEXT === 'true';
export const isPreload = hasWindow && process.env.NEXT_PUBLIC_IS_NEXT === undefined;
export const isBackend = !isFrontendBuild && !hasWindow;

let contextName: 'frontend-build' | 'frontend' | 'preload' | 'backend' | 'unknown';
switch (true) {
    case isFrontendBuild:
        contextName = 'frontend-build';
        break;
    case isFrontend:
        contextName = 'frontend';
        break;
    case isPreload:
        contextName = 'preload';
        break;
    case isBackend:
        contextName = 'backend';
        break;
    default:
        contextName = 'unknown';
}

export const environmentName = contextName;
