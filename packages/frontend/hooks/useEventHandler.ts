import {eventHandler} from "../utils/eventHandler";
import {SimpleEventBusData} from "@qlippy/common/src/eventbus.types";
import {useEffect} from "react";

const {listen, listenOnce} = eventHandler;

export const useListen = <T extends SimpleEventBusData>(eventName: string, callback: (data: T) => void) => {
    useEffect(() => listen(eventName, callback), []);
}

export const useListenOnce = <T extends SimpleEventBusData>(eventName: string, callback: (data: T) => void) => {
    useEffect(() => listenOnce(eventName, callback), []);
}
