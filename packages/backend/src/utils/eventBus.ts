import {SimpleEventBusData, SimpleEventBus} from "@qlippy/common/src/eventbus.types";
import EventEmitter from 'node:events'

const bus = new EventEmitter();
bus.setMaxListeners(0);

const EVENT_NAME = 'event-bus';

const ENABLE_LOG = false;
const log = (...args: any[]) => ENABLE_LOG && console.log(...args);

export const eventBus: SimpleEventBus = {
    emit: <T extends SimpleEventBusData>(data: T) => {
        log('eventBus - emit', data);

        bus.emit(EVENT_NAME, data);
    },
    listen: <T extends SimpleEventBusData>(callback: (data: T) => void) => {
        log('eventBus - listen', callback);

        const handle = (data: T) => {
            log('eventBus - listen - handle', data);

            callback(data)
        };

        bus.on(EVENT_NAME, handle)

        return () => bus.off(EVENT_NAME, handle);
    },
    listenOnce: <T extends SimpleEventBusData>(callback: (data: T) => void) => {
        log('eventBus - listenOnce', callback);

        const handle = (data: T) => {
            log('eventBus - listenOnce - handle', data);

            callback(data)
        };

        bus.once(EVENT_NAME, handle)
    },
}