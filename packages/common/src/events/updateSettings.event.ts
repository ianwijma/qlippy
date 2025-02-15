import type {BaseSettings} from "../settings.types";

export const updateSettingsEventName = 'updateSettings';

export type UpdateSettingsEventData<T extends BaseSettings> = {
    settingsName: string;
    settingsToUpdate: T
}