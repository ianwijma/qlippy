import {SimpleEventBusData} from "./eventbus.types";
import {nanoid} from "nanoid";
import {EventHandler} from "./createEventHandler";

export type RequestResponseOptions = {
    timeout?: number;
}

export type ResponseHandler = {
    requestResponse: <RES extends SimpleEventBusData, REQ extends SimpleEventBusData = SimpleEventBusData>(requestName: string, data: REQ, options?: RequestResponseOptions) => Promise<RES>;
    handleResponse: <REQ extends SimpleEventBusData, RES extends SimpleEventBusData = SimpleEventBusData>(requestName: string, shouldHandleCallback: (data: REQ) => boolean | Promise<boolean>, callback: (data: REQ) => RES | Promise<RES>) => void;
}

type RequestObject<T extends SimpleEventBusData = SimpleEventBusData> = {
    requestId: string;
    data?: T;
}

type ResponseObject<T extends SimpleEventBusData = SimpleEventBusData> = {
    requestId: string;
    success?: boolean;
    data?: T;
}

const ENABLE_LOG = false;
const log = (...args: any[]) => ENABLE_LOG && console.log(...args);

export const createResponseHandler = (eventHandler: EventHandler): ResponseHandler => {
    return {
        requestResponse: <RES extends SimpleEventBusData, REQ extends SimpleEventBusData = SimpleEventBusData>(requestName: string, requestData: REQ, options: RequestResponseOptions = {}) => {
            const requestId = nanoid();

            const REQUEST_NAME = `${requestName}-request`;
            const RESPONSE_NAME = `${requestName}-response`;

            return new Promise((resolve, reject) => {

                let done = false;

                const stopListening = eventHandler.listen<ResponseObject<RES>>(RESPONSE_NAME, (response) => {
                    log('responseHandler - requestResponse - listen', requestName, response);

                    const {requestId: currentRequestId, data: responseData, success} = response;

                    if (currentRequestId === requestId) {
                        stopListening();

                        if (success) {
                            // @ts-expect-error - IDK why TS is sad, the data is of correct type...
                            resolve(responseData);
                        } else {
                            reject('ResponseHandler - fetch failure');
                        }

                        done = true;
                    }
                });

                log('responseHandler - requestResponse - emit', requestName, requestId);
                eventHandler.emit<RequestObject<REQ>>(REQUEST_NAME, {
                    requestId,
                    data: requestData
                })

                if ('timeout' in options && options.timeout > 0) {
                    setTimeout(() => {
                        if (!done) reject('ResponseHandler - Timed out')
                    }, options.timeout);
                }
            })
        },
        handleResponse: <REQ extends SimpleEventBusData, RES extends SimpleEventBusData = SimpleEventBusData>(requestName: string, shouldHandleCallback: (data: REQ) => boolean | Promise<boolean>, callback: (data: REQ) => RES | Promise<RES>) => {
            log('responseHandler - handleResponse - listen', requestName, shouldHandleCallback, callback);

            const REQUEST_NAME = `${requestName}-request`;
            const RESPONSE_NAME = `${requestName}-response`;

            eventHandler.listen<RequestObject<REQ>>(REQUEST_NAME, async (request) => {
                log('responseHandler - listen - handle', requestName, request);

                const {requestId, data} = request;

                const shouldHandleRequest = await shouldHandleCallback(data);
                if (shouldHandleRequest) {
                    try {
                        const responseData = await callback(data);

                        eventHandler.emit<ResponseObject<RES>>(RESPONSE_NAME, {
                            requestId,
                            success: true,
                            data: responseData,
                        });
                    } catch (error) {
                        eventHandler.emit<ResponseObject<RES>>(RESPONSE_NAME, {
                            requestId,
                            success: false,
                        });
                    }
                }

            });
        }
    }
}