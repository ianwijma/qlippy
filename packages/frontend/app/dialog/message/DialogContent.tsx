'use client'

import {useSearchParams} from "next/navigation";
import {useButtonClick} from "../../../hooks/useButtonClick";

export const DialogContent = () => {
    const {emitButtonClick} = useButtonClick();
    const searchParams = useSearchParams();
    const message = searchParams.get('message');

    const handleConfirm = () => emitButtonClick(`confirm`);

    return (
        <>
            <span>
                {message}
            </span>
            <button onClick={handleConfirm}>Ok</button>
        </>
    )
}