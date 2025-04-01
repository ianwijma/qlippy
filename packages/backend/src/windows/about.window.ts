import {createWindow} from "./createWindow";

export const aboutWindow = createWindow({
    title: 'About Qlippy',
    route: 'about',
    width: 690,
    height: 180,
    minWidth: 690,
    minHeight: 180,
    resizable: false,
    transparent: true,
});
