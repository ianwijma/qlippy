import {createHash} from "node:crypto";

export const sha1 = (input: any): string => {
    const hash = createHash('SHA1');

    hash.write(input);

    return hash.digest('hex');
}