'use client';

import {ClipboardQuery} from "./clipboard-query";
import {ClipboardList} from "./clipboard-list";
import {ClipboardDetails} from "./clipboard-details";

export default function ClipboardHistoryPage() {
    return (
        <div className="bg-slate-500 h-screen p-2 draggable overflow-hidden">
            <div className="flex flex-col gap-1 h-full">
                <div className="bg-red-500 h-20 not-draggable">
                    <ClipboardQuery/>
                </div>
                <div className="flex gap-1 h-[inherit]">
                    <div className="bg-green-500 w-2/5 not-draggable">
                        <ClipboardList/>
                    </div>
                    <div className="bg-pink-500 w-3/5 not-draggable">
                        <ClipboardDetails/>
                    </div>
                </div>
            </div>
        </div>
    )
}