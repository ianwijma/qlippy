import IpcRendererEvent = Electron.IpcRendererEvent;

// Needs to be required for some reason?
const {contextBridge, ipcRenderer, webUtils} = require('electron/renderer');

import {SimpleEventBusData, SimpleEventBus} from "@qlippy/common/src/eventbus.types";

/**
 * This file provides generic functionality to all the windows.
 */

const ENABLE_LOG = false;
const log = (...args: any[]) => ENABLE_LOG && console.log(...args);

contextBridge.exposeInMainWorld('eventBusApi', {
    emit: <T extends SimpleEventBusData>(data: T) => {
        log('eventBusApi - emit', data);

        ipcRenderer.send('eventbus-to-main', data)
    },
    listen: <T extends SimpleEventBusData>(callback: (data: T) => void) => {
        log('eventBusApi - listen', callback);

        const handle = (_: IpcRendererEvent, data: T) => {
            log('eventBusApi - listen - handle', data);

            callback(data)
        };

        ipcRenderer.on('eventbus-from-main', handle);

        return () => ipcRenderer.off('eventbus-from-main', handle);
    },
    listenOnce: <T extends SimpleEventBusData>(callback: (data: T) => void) => {
        log('eventBusApi - listenOnce', callback);

        const handle = (_: IpcRendererEvent, data: T) => {
            log('eventBusApi - listenOnce - handle', data);

            callback(data)
        };

        ipcRenderer.once('eventbus-from-main', handle);
    },
} as SimpleEventBus)

contextBridge.exposeInMainWorld('filesApi', {
    getPathForFile: (file: File) => webUtils.getPathForFile(file)
})