import {createWindow} from "./createWindow";
import {isDev} from "../utils/isDev";

export const clipboardHistoryWindow = createWindow({
    title: 'Clipboard history',
    route: 'clipboard-history',
    width: 1080,
    height: 640,
    minWidth: 1080,
    minHeight: 640,
    resizable: false,
    alwaysOnTop: true,
    posY: 150,
    onBlur: ({close}) => isDev() || close(),
});
