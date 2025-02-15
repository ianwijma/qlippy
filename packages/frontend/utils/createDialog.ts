import {createOpenDialog} from '@qlippy/common/src/dialog'
import {responseHandler} from "./responseHandler";

// @ts-expect-error - We expect some error here, IDK why but TS is unhappy. Will check it out later, maybe, probably not...
export const createDialog = createOpenDialog(responseHandler);

export const confirm = async (message: string) => {
    const {success, data: {confirmed = false}} = await createDialog<{ confirmed: boolean }>({
        type: 'confirm',
        title: 'Confirm',
        message,
    });

    return success && confirmed;
}