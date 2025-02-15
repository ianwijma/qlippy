import {SimpleEventBus} from "@qlippy/common/src/eventbus.types";
import {createEventHandler} from '@qlippy/common/src/createEventHandler'
import {isClient} from "./isClient";

let eventBus: SimpleEventBus = {} as SimpleEventBus;

if (isClient) {
    // @ts-expect-error - The eventBusApi is created in the preload.ts file & is not typed yet.
    eventBus = window?.eventBusApi;
}

/**
 * Do no use listen and listenOnce directly, use the useEventHandler versions instead.
 */
export const eventHandler = createEventHandler(eventBus);
