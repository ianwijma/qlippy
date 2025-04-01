"use client";

import {PropsWithChildren} from "react";
import {TitleBar} from "../window/TitleBar";
import Head from "next/head";

type DefaultWindowContainerProps = PropsWithChildren & {
    title: string;
    className?: string;
    showMinimize?: boolean;
    showClose?: boolean;
    hideTitleBar?: boolean;
    onMinimizeClicked?: () => void;
    onCloseClicked?: () => void;
};

export const DefaultWindowContainer = ({
                                           children,
                                           title,
                                           className = '',
                                           showMinimize,
                                           showClose,
                                           hideTitleBar = false,
                                           onMinimizeClicked,
                                           onCloseClicked,
                                       }: DefaultWindowContainerProps) => {
    return <div className='w-screen h-screen flex flex-col overflow-hidden rounded-xl'>
        <Head>
            <title>{title}</title>
        </Head>
        {
            hideTitleBar ? '' : <TitleBar {...{showMinimize, showClose, onMinimizeClicked, onCloseClicked}}>{title}</TitleBar>
        }
        <div className={className}>
            {children}
        </div>
    </div>
}