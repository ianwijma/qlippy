import path from 'path';
import fs from 'fs/promises';
import YAML from 'yaml'
import {app} from "electron";
import {Buffer} from "node:buffer";
import {Stream} from "node:stream";
import {Stats} from "node:fs";

const ROOT_DIR = path.resolve(app.getPath('userData'), '.files');

const normalizeFilePath = (relativePath: string): string => {
    const resolvedPath = path.resolve(ROOT_DIR, relativePath);

    const normalizedPath = path.normalize(resolvedPath);

    ensureSafeFilePath(normalizedPath);

    return normalizedPath;
}

export const ensureSafeFilePath = (absolutePath: string): void => {
    if (!absolutePath.startsWith(ROOT_DIR)) {
        throw new Error(`Path "${absolutePath}" tried to get outside our own directory, this is NOT allowed.`);
    }
}

export const ensureDirExists = async (relativeFilePath: string): Promise<string> => {
    const normalizePath = normalizeFilePath(relativeFilePath);

    const dir = path.dirname(normalizePath);

    await fs.mkdir(dir, {recursive: true});

    return normalizePath;
}

export const readStringFile = async (relativeFilePath: string): Promise<string> => {
    const normalizePath = normalizeFilePath(relativeFilePath);

    return await fs.readFile(normalizePath, 'utf8');
}

export const ensureFileExists = async (relativeFilePath: string, defaultContent: string): Promise<string> => {
    const normalizePath = normalizeFilePath(relativeFilePath);

    const foundFile = await fileExists(normalizePath);
    if (!foundFile) {
        await writeStringToFile(normalizePath, defaultContent);
    }

    return normalizePath;
}

export const writeStringToFile = async (relativeFilePath: string, content: string): Promise<string> => {
    const normalizePath = normalizeFilePath(relativeFilePath);

    await ensureDirExists(normalizePath);

    await fs.writeFile(normalizePath, content, 'utf8');

    return normalizePath;
}

export const fileExists = async (relativeFilePath: string): Promise<string | false> => {
    const normalizePath = normalizeFilePath(relativeFilePath);

    try {
        await fs.access(normalizePath, fs.constants.F_OK)
    } catch (e) {
        return false;
    }

    return normalizePath;
}

export const removeFile = async (relativeFilePath: string): Promise<void> => {
    const normalizePath = normalizeFilePath(relativeFilePath);

    await fs.unlink(normalizePath);
}

/**
 * Unsafe because it allows checking of file outside the syste,
 */
export const UNSAFE_fileExists = async (absolutePath: string): Promise<boolean> => {
    const stats: Stats | false = await fs.stat(absolutePath).catch(() => false);

    return !!stats;
}

export const UNSAFE_fileStats = async (absolutePath: string): Promise<Stats | false> => {
    return await fs.stat(absolutePath).catch(() => false);
}

export const fileStats = async (relativeFilePath: string): Promise<Stats | false> => {
    const normalizePath = normalizeFilePath(relativeFilePath);

    return await fs.stat(normalizePath).catch(() => false);
}

export const readYamlFile = async <T>(relativeFilePath: string): Promise<T> => {
    const fileContent = await readStringFile(relativeFilePath);

    return YAML.parse(fileContent) as T;
}

export const writeYamlFile = async <T>(relativeFilePath: string, content: T): Promise<void> => {
    const fileContent = YAML.stringify(content);

    await writeStringToFile(relativeFilePath, fileContent);
}

export const ensureYamlFileExists = async <T>(relativeFilePath: string, defaultContent: T): Promise<string> => {
    const fileContent = YAML.stringify(defaultContent);

    return await ensureFileExists(relativeFilePath, fileContent);
}

export const readJsonFile = async <T>(relativeFilePath: string): Promise<T> => {
    const fileContent = await readStringFile(relativeFilePath);

    return JSON.parse(fileContent) as T;
}

export const writeJsonFile = async <T>(relativeFilePath: string, context: T): Promise<void> => {
    const fileContent = JSON.stringify(context);

    await writeStringToFile(relativeFilePath, fileContent);
}

export const ensureJsonFileExists = async <T>(relativeFilePath: string, defaultContent: T): Promise<string> => {
    const fileContent = JSON.stringify(defaultContent);

    return await ensureFileExists(relativeFilePath, fileContent);
}

export const readFile = async (relativeFilePath: string): Promise<Buffer> => {
    const normalizePath = normalizeFilePath(relativeFilePath);

    return await fs.readFile(normalizePath);
}

export const writeFile = async (
    relativeFilePath: string,
    content: | string
        | NodeJS.ArrayBufferView
        | Iterable<string | NodeJS.ArrayBufferView>
        | AsyncIterable<string | NodeJS.ArrayBufferView>
        | Stream
): Promise<string> => {
    const normalizePath = normalizeFilePath(relativeFilePath);

    await ensureDirExists(normalizePath);

    await fs.writeFile(normalizePath, content);

    return normalizePath;
}