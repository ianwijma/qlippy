export type AnyObjectKey = string | number | symbol
export type AnyObject<K extends AnyObjectKey = AnyObjectKey, V extends any = any> = Record<K, V>

export const sortByKey = <T extends AnyObject>(object: T): T => {
    return Object.keys(object).sort().reduce(
        (obj, key: keyof T) => {
            obj[key] = object[key];
            return obj;
        },
        {} as T
    );
}

export const stringifyObject = <T extends AnyObject>(object: T): AnyObject<string, string> => {
    return Object.keys(object).reduce(
        (obj: any, key: keyof T) => {
            obj[String(key)] = String(object[key]);
            return obj;
        },
        {}
    )
}

export function isObject(variable: any) {
    return (variable && typeof variable === 'object' && !Array.isArray(variable));
}

export function recursiveMerge<T extends AnyObject>(target: T, ...sources: Partial<T>[]): T {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, {[key]: {}});
                recursiveMerge(target[key], source[key]);
            } else {
                Object.assign(target, {[key]: source[key]});
            }
        }
    }

    return recursiveMerge(target, ...sources);
}