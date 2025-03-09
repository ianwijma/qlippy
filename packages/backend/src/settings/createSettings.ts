import {fileExists, readYamlFile, writeYamlFile} from "../utils/files";
import {BaseSettings} from "@qlippy/common/src/settings.types";
import {responseHandler} from "../utils/responseHandler";
import {eventHandler} from "../utils/eventHandler";
import {settingsUpdatedEventName, type SettingsUpdatedEventData} from '@qlippy/common/src/events/settingsUpdated.event'
import {updateSettingsEventName, type UpdateSettingsEventData} from '@qlippy/common/src/events/updateSettings.event'
import {
    settingsRequestName,
    type SettingsRequestReq,
    type SettingsRequestRes
} from '@qlippy/common/src/requests/settings.request'
import diff from 'git-diff'
import {isDebug} from "../utils/isDebug";

export type SettingsName = string;

type CreateSettingParams<T> = {
    name: SettingsName;
    defaultSettings: Omit<T, "name">;
    preSaveFn?: (data: T) => Promise<T> | T;
    postLoadFn?: (data: T) => Promise<T> | T;
}

export type CreateSettingReturn<T> = {
    name: SettingsName;
    initialize: () => Promise<void>;
    getSettings: () => T;
    syncSettings: () => Promise<void>;
    updateSettings: (updatedSettings: T) => Promise<T>;
    resetSettings: () => Promise<T>;
}

export const createSettings = <T extends BaseSettings>({
                                                           name,
                                                           defaultSettings,
                                                           preSaveFn = (data) => data,
                                                           postLoadFn = (data) => data,
                                                       }: CreateSettingParams<T>): CreateSettingReturn<T> => {
    const actuallyDefaultSettings: T = {name, ...defaultSettings} as T;
    const settingsFilePath = `settings/${name}.yaml`;
    let settingsCache: T;

    const isInitialized = () => {
        if (!settingsCache) throw new Error(`Setting ${name} was not initialized`);
    }

    const initialize = async () => {
        console.info(`Initializing ${name} settings`);

        await syncSettings();
    }

    const getSettings = () => {
        isInitialized();

        return JSON.parse(JSON.stringify(settingsCache));
    };

    const syncSettings = async () => {
        const settingsFileExists = await fileExists(settingsFilePath);
        if (!settingsFileExists) {
            await writeYamlFile<T>(settingsFilePath, actuallyDefaultSettings);
        }

        const settings = await readYamlFile<T>(settingsFilePath);

        settingsCache = await postLoadFn(settings);
    }

    const updateSettings = async (settingToUpdate: T): Promise<T> => {
        let preUpdate = '';
        if (isDebug()) {
            preUpdate = JSON.stringify(getSettings(), null, 2);
        }

        const formattedSettings = await preSaveFn(settingToUpdate);

        await writeYamlFile<T>(settingsFilePath, formattedSettings);

        await syncSettings();

        const updatedSettings = getSettings();

        let postUpdate = '';
        if (isDebug()) {
            postUpdate = JSON.stringify(updatedSettings, null, 2);
        }

        if (isDebug() && postUpdate.length < 5000) {
            const updateDiff = diff(preUpdate, postUpdate, {
                color: true,
            });
            console.log(updateDiff);
        }

        eventHandler.emit<SettingsUpdatedEventData<T>>(settingsUpdatedEventName, {
            settingName: name,
            updatedSettings,
            type: 'update',
        });

        return updatedSettings;
    }

    const resetSettings = async () => {
        await writeYamlFile<T>(settingsFilePath, actuallyDefaultSettings);

        await syncSettings();

        const resettedSettings = getSettings();

        console.log('Settings reset', {name, settings: JSON.stringify(resettedSettings)});

        eventHandler.emit<SettingsUpdatedEventData<T>>(settingsUpdatedEventName, {
            settingName: name,
            updatedSettings: resettedSettings,
            type: 'reset'
        });

        return resettedSettings;
    }

    responseHandler.handleResponse<SettingsRequestReq, SettingsRequestRes<T>>(settingsRequestName, (request) => {
        const {settingsName: currentSettingsName} = request;

        return currentSettingsName === name;
    }, () => {
        return getSettings();
    });

    eventHandler.listen<UpdateSettingsEventData<T>>(updateSettingsEventName, (event) => {
        const {settingsName, settingsToUpdate} = event;

        if (settingsName !== name) return;

        updateSettings(settingsToUpdate);
    })

    return {
        name,
        initialize,
        getSettings,
        syncSettings,
        updateSettings,
        resetSettings
    }
}