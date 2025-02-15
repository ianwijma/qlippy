"use client";

import {PropsWithChildren} from "react";
import {TitleBar} from "../window/TitleBar";
import Head from "next/head";

type DefaultWindowContainerProps = PropsWithChildren & {
    title: string;
    showMinimize?: boolean;
    showClose?: boolean;
    onMinimizeClicked?: () => void;
    onCloseClicked?: () => void;
};

export const DefaultWindowContainer = ({
                                           children,
                                           title,
                                           showMinimize,
                                           showClose,
                                           onMinimizeClicked,
                                           onCloseClicked
                                       }: DefaultWindowContainerProps) => {
    return <div className='w-screen h-screen flex flex-col overflow-hidden'>
        <Head>
            <title>{title}</title>
        </Head>
        <TitleBar {...{showMinimize, showClose, onMinimizeClicked, onCloseClicked}}>{title}</TitleBar>
        <div className='flex flex-col bg-slate-700 h-full py-1 px-1 overflow-x-auto whitespace-nowrap'>
            {children}
        </div>
    </div>
}