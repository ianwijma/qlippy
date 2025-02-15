import {createWindow} from "./createWindow";
import {AnyObject, stringifyObject} from '@qlippy/common/src/object'
import {
    type ButtonClickedEventData,
    buttonClickedEventName,
} from '@qlippy/common/src/events/buttonClicked.event'
import {responseHandler} from "../utils/responseHandler";
import {dialogRequestName, DialogRequestRes, DialogRequestReq} from '@qlippy/common/src/requests/dialog.request';
import {OpenDialogOptions} from '@qlippy/common/src/dialog'
import {SimpleEventBusData} from "@qlippy/common/src/eventbus.types";
import {eventHandler} from "../utils/eventHandler";

type CreateDialogParams = {
    title: string;
    route: string;
    resizable?: boolean,
    width?: number,
    height?: number,
    minWidth?: number,
    minHeight?: number,
}

type OpenParams = AnyObject<string, string>;
type CreateDialogReturn<OP extends OpenParams, OR extends AnyObject> = {
    open: (params: OP) => Promise<OR>;
}

const createDialog = <OP extends OpenParams, OR extends AnyObject>({
                                                                       title,
                                                                       route,
                                                                       resizable = false,
                                                                       width = 512,
                                                                       height = 256,
                                                                       minWidth = 512,
                                                                       minHeight = 256,
                                                                   }: CreateDialogParams): CreateDialogReturn<OP, OR> => {
    return {
        open: (options: OP): Promise<OR> => {
            return new Promise<OR>(async (resolve, reject) => {
                const {open, destroy, initialize, getUniqueWindowId} = createWindow({
                    title,
                    route,
                    resizable,
                    width,
                    height,
                    minWidth,
                    minHeight,
                });

                await initialize();

                const currentWindowId = getUniqueWindowId();

                const stopListening = eventHandler.listen<ButtonClickedEventData>(buttonClickedEventName, (data) => {
                    const {buttonId, windowId, buttonData} = data;

                    if (parseInt(windowId, 10) === currentWindowId) {
                        switch (buttonId) {
                            case 'confirm': {
                                resolve(buttonData as OR);
                                stopListening();
                                destroy();
                            }
                                break;
                            case 'cancel': {
                                reject();
                                stopListening();
                                destroy();
                            }
                                break;
                        }
                    }


                });

                await open({urlParams: stringifyObject(options)});
            })
        },
    }
}

type SimpleInputParams = {
    title: string;
    message: string;
    placeholder?: string
    value?: string
};
type SimpleInputReturn = {
    input: string
};

export const inputDialog = createDialog<SimpleInputParams, SimpleInputReturn>({
    title: 'Input Dialog',
    route: 'dialog/input',
});

type ConfirmParams = {
    title: string;
    message: string;
};
type ConfirmReturn = {
    confirmed: boolean;
};

export const confirmDialog = createDialog<ConfirmParams, ConfirmReturn>({
    title: 'Confirm Dialog',
    route: 'dialog/confirm',
});

type MessageParams = {
    title?: string;
    message: string;
};
type MessageReturn = {};

export const messageDialog = createDialog<MessageParams, MessageReturn>({
    title: 'Message Dialog',
    route: 'dialog/message',
});

const dialogMap = {
    input: inputDialog,
    'confirm': confirmDialog,
    'message': messageDialog,
}

responseHandler.handleResponse<DialogRequestReq<OpenDialogOptions>, DialogRequestRes<SimpleEventBusData>>(dialogRequestName, () => true, async (data) => {
    const {dialog} = data;
    const {type, ...rest} = dialog;

    if (type in dialogMap) {
        const dialogHandler = dialogMap[type];

        // @ts-expect-error - Unable to understand what the rest it, probably should be fixed at some points.
        return dialogHandler.open(rest)
    }

    return null
})
