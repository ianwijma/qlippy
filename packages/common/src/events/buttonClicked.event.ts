import {SimpleEventBusData} from "../eventbus.types";

export const buttonClickedEventName = 'buttonClicked';

export type ButtonClickedEventData = {
    buttonId: string;
    windowId: string;
    buttonData: SimpleEventBusData;
};