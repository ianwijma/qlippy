import {eventHandler} from "./eventHandler";
import {createResponseHandler} from '@qlippy/common/src/createResponseHandler'

export const responseHandler = createResponseHandler(eventHandler)