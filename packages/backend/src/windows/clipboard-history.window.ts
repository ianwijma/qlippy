import {createWindow} from "./createWindow";
import {isDev} from "../utils/isDev";

export const clipboardHistoryWindow = createWindow({
    title: 'Clipboard history',
    route: 'clipboard-history',
    width: 1080,
    height: 900,
    minWidth: 1080,
    minHeight: 900,
    resizable: false,
    alwaysOnTop: true,
    movable: false,
    posY: 150,
    hasShadow: false,
    transparent: true,
    onBlur: ({close}) => isDev() || close(),
});
