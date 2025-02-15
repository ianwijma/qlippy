import path from 'path';
import fs from 'fs/promises';
import YAML from 'yaml'
import {isDev} from "./isDev";
import {app} from "electron";

const FILES_DIR = isDev() ? '.files-dev' : '.files';
const ROOT_DIR = path.resolve(app.getPath('userData'), FILES_DIR);

const normalizeFilePath = (relativePath: string): string => {
    const resolvedPath = path.resolve(ROOT_DIR, relativePath);

    const normalizePath = path.normalize(resolvedPath);

    if (!normalizePath.startsWith(ROOT_DIR)) {
        throw new Error(`Path "${relativePath}" tried to get outside our own directory, this is NOT allowed.`);
    }

    return normalizePath;
}

export const ensureDirExists = async (relativeFilePath: string): Promise<string> => {
    const normalizePath = normalizeFilePath(relativeFilePath);

    const dir = path.dirname(normalizePath);

    await fs.mkdir(dir, {recursive: true});

    return normalizePath;
}

export const readFile = async (relativeFilePath: string): Promise<string> => {
    const normalizePath = normalizeFilePath(relativeFilePath);

    return await fs.readFile(normalizePath, 'utf8');
}

export const ensureFileExists = async (relativeFilePath: string, defaultContent: string): Promise<string> => {
    const normalizePath = normalizeFilePath(relativeFilePath);

    const foundFile = await fileExists(normalizePath);
    if (!foundFile) {
        await writeFile(normalizePath, defaultContent);
    }

    return normalizePath;
}

export const writeFile = async (relativeFilePath: string, content: string): Promise<void> => {
    const normalizePath = normalizeFilePath(relativeFilePath);

    await ensureDirExists(normalizePath);

    await fs.writeFile(normalizePath, content, 'utf8');
}

export const fileExists = async (relativeFilePath: string): Promise<boolean> => {
    const normalizePath = normalizeFilePath(relativeFilePath);

    try {
        await fs.access(normalizePath, fs.constants.F_OK)
    } catch (e) {
        return false;
    }

    return true;
}

export const readYamlFile = async <T>(relativeFilePath: string): Promise<T> => {
    const fileContent = await readFile(relativeFilePath);

    return YAML.parse(fileContent) as T;
}

export const writeYamlFile = async <T>(relativeFilePath: string, content: T): Promise<void> => {
    const fileContent = YAML.stringify(content);

    await writeFile(relativeFilePath, fileContent);
}

export const ensureYamlFileExists = async <T>(relativeFilePath: string, defaultContent: T): Promise<string> => {
    const fileContent = YAML.stringify(defaultContent);

    return await ensureFileExists(relativeFilePath, fileContent);
}

export const readJsonFile = async <T>(relativeFilePath: string): Promise<T> => {
    const fileContent = await readFile(relativeFilePath);

    return JSON.parse(fileContent) as T;
}

export const writeJsonFile = async <T>(relativeFilePath: string, context: T): Promise<void> => {
    const fileContent = JSON.stringify(context);

    await writeFile(relativeFilePath, fileContent);
}

export const ensureJsonFileExists = async <T>(relativeFilePath: string, defaultContent: T): Promise<string> => {
    const fileContent = JSON.stringify(defaultContent);

    return await ensureFileExists(relativeFilePath, fileContent);
}