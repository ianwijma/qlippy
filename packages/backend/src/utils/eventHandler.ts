import {createEventHandler} from '@qlippy/common/src/createEventHandler';
import {eventBus} from "./eventBus";

export const eventHandler = createEventHandler(eventBus);

