// @ts-expect-error - filesApi does exists,
export const getPathForFile = (file: File) => window?.filesApi?.getPathForFile(file);