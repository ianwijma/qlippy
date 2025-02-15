'use client'

import {useSearchParams} from "next/navigation";
import {useButtonClick} from "../../../hooks/useButtonClick";

export const DialogContent = () => {
    const {emitButtonClick} = useButtonClick();
    const searchParams = useSearchParams();
    const message = searchParams.get('message');

    const handleCancel = () => emitButtonClick('cancel');
    const handleConfirm = () => emitButtonClick(`confirm`, {confirmed: true});

    return (
        <>
            <span>
                {message}
            </span>
            <button onClick={handleCancel}>Cancel</button>
            <button onClick={handleConfirm}>Confirm</button>
        </>
    )
}