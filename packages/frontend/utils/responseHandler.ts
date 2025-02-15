import {eventHandler} from "./eventHandler";
import {createResponseHandler, ResponseHandler} from '@qlippy/common/src/createResponseHandler'

/**
 * Omitted handleResponse for now as I don't see a use for it, any data should be sent & stored on the main thread.
 */
export const responseHandler: Omit<ResponseHandler, 'handleResponse'> = createResponseHandler(eventHandler)