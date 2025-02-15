import {responseHandler} from "../utils/responseHandler";
import {useState} from "react";
import {SimpleEventBusData} from "@qlippy/common/src/eventbus.types";
import {RequestResponseOptions} from "@qlippy/common/src/createResponseHandler";

export const useRequestResponse = <REQ extends SimpleEventBusData, RES extends SimpleEventBusData = SimpleEventBusData>(requestName: string, requestData: REQ, options?: RequestResponseOptions) => {
    const [response, setResponse] = useState<RES>(null);
    const sendRequest = async () => {
        setResponse(null);

        const response = await responseHandler.requestResponse<RES, REQ>(
            requestName,
            requestData,
            options
        );

        setResponse(response);
    }

    return {
        isLoading: response === null,
        sendRequest,
        response
    }
}
