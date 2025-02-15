'use client';

import {useSearchParams} from "next/navigation";
import {DefaultWindowContainer} from "../../../components/windowContainer/DefaultWindowContainer";
import {DialogContent} from "./DialogContent";


export default function DialogPage() {
    const searchParams = useSearchParams();
    const title = searchParams.get('title');

    return <DefaultWindowContainer title={title} showMinimize={false} showClose={false}>
        <DialogContent/>
    </DefaultWindowContainer>
}