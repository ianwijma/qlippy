// EventBusData allows only parse-able objects to be passed
export type SimpleEventBusData = {
    [key: string]: string | number | boolean | string[] | number[] | boolean[] | SimpleEventBusData[] | SimpleEventBusData
};

type StopListening = () => void;

export type SimpleEventBus = {
    emit: <T extends SimpleEventBusData>(data: T) => void,
    listen: <T extends SimpleEventBusData>(callback: (data: T) => void) => StopListening,
    listenOnce: <T extends SimpleEventBusData>(callback: (data: T) => void) => void,
}