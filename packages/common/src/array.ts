import {AnyObject, AnyObjectKey} from "./object";

export const arrayToObjectBy = <T extends AnyObject>(array: T[], target: keyof T): AnyObject<AnyObjectKey, T> => {
    return array.reduce((acc, curr) => {
        const key = curr[target];

        acc[key] = curr;

        return acc
    }, {} as AnyObject<AnyObjectKey, T>)
}