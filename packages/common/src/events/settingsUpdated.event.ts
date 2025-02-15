import type {BaseSettings} from "../settings.types";

export const settingsUpdatedEventName = 'settingsUpdated';

export type SettingsUpdatedEventData<T extends BaseSettings> = {
    settingName: string;
    updatedSettings: T;
    type: 'reset' | 'update';
}