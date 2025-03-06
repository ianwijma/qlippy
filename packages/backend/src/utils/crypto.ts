import {createHash} from "node:crypto";

export const sha1 = (input: string | Buffer): string => {
    const hash = createHash('SHA1');

    hash.update(input);

    return hash.digest('hex');
}