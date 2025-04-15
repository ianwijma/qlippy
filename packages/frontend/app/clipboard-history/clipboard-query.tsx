import {KeyboardEventHandler, memo, useCallback, useEffect, useRef, useState} from "react";
import { OpenClipboardHistoryAction } from '@qlippy/common/src/events/openClipboardHistory.event'

export type ClipboardQueryParams = {
    query: string;
    updateQuery: (query: string) => void;
    typeFilter: string;
    updateTypeFilter: (query: string) => void;
    selectNext: () => void,
    selectPrevious: () => void,
    confirmSelected: () => void,
    deleteSelected: () => void,
    openSelected: (action: OpenClipboardHistoryAction) => void,
    pinSelected: () => void,
    restoreSelectedImage: () => void,
    close: () => void,
    isMenuShown: boolean,
    showMenu: () => void,
    hideMenu: () => void,
}

const tips = [
    'Type to filter through entries...',
    'You can switch between the input field and the type filter using tab...',
    'You can change the type filter using the up and down arrows when it\'s highlighted...',
    'Holding CTRL shows you the actions for the current highlighted item...',
    'Each item has it\'s own actions...',
];

const getRandomTip = () => {
    const randomIndex = Math.floor(Math.random() * tips.length);
    return tips[randomIndex];
}

export const ClipboardQuery = memo(({
                                        query,
                                        updateQuery,
                                        typeFilter,
                                        updateTypeFilter,
                                        selectNext,
                                        selectPrevious,
                                        confirmSelected,
                                        deleteSelected,
                                        openSelected,
                                        pinSelected,
                                        restoreSelectedImage,
                                        close,
                                        isMenuShown,
                                        showMenu,
                                        hideMenu,
                                    }: ClipboardQueryParams) => {
    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback((event) => {
        if (event.ctrlKey) {
            event.preventDefault();
            showMenu();

            switch (event.code) {
                case 'Delete':
                    event.preventDefault();
                    deleteSelected();
                    break;
                case 'Backspace':
                    event.preventDefault();
                    query.length > 0 && updateQuery('');
                    break;
                case 'KeyF':
                case 'KeyI':
                    event.preventDefault();
                    openSelected('file');
                    hideMenu(); // useful during development, in production focus loss closes the window
                    break;
                case 'KeyU':
                    event.preventDefault();
                    openSelected('url');
                    hideMenu(); // useful during development, in production focus loss closes the window
                    break;
                case 'KeyP':
                    event.preventDefault();
                    pinSelected();
                    break;
                case 'KeyC':
                    event.preventDefault();
                    restoreSelectedImage();
                    break;
            }
        } else {
            switch (event.code) {
                case 'ArrowDown':
                    event.preventDefault();
                    selectNext();
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    selectPrevious();
                    break;
                case 'Enter':
                    event.preventDefault();
                    confirmSelected();
                    break;
                case 'Escape':
                    event.preventDefault();
                    close();
                    break;
            }
        }
    }, [selectNext, selectPrevious, confirmSelected, close, deleteSelected, showMenu, hideMenu, openSelected, updateQuery]);
    const [currentTip] = useState(getRandomTip());

    const handleKeyUp: KeyboardEventHandler<HTMLInputElement> = useCallback((event) => {
        if (isMenuShown && !event.ctrlKey) {
            event.preventDefault();
            hideMenu();
        }
    }, [hideMenu, isMenuShown])


    const inputRef = useRef<HTMLInputElement>(null);
    const selectRef = useRef<HTMLSelectElement>(null);

    // Handle blur of the input element, where select is allowed to also have focus
    useEffect(() => {
        const inputEl = inputRef.current;
        const selectEl = selectRef.current;

        if (!inputRef || !selectRef) return;

        type Focus = 'input' | 'select' | null;
        let currentFocus: Focus = null;
        const handleFocus = (name: Focus) => () => setTimeout(() => currentFocus = name, 10);
        const handleBlur = () => {
            currentFocus = null;

            setTimeout(() => {
                if (currentFocus === null) {
                    inputEl.focus();
                }
            }, 20);
        };

        inputEl.addEventListener('focus', handleFocus('input'));
        selectEl.addEventListener('focus', handleFocus('select'));
        inputEl.addEventListener('blur', handleBlur);
        selectEl.addEventListener('blur', handleBlur);

        setTimeout(() => {
            inputEl.focus()
        }, 50);

        return () => {
            inputEl.removeEventListener('focus', handleFocus('input'));
            selectEl.removeEventListener('focus', handleFocus('select'));
            inputEl.removeEventListener('blur', handleBlur);
            selectEl.removeEventListener('blur', handleBlur);
        }
    }, [inputRef, selectRef]);

    return (
        <div className="h-full flex gap-1 justify-between items-center">
            <input
                ref={inputRef}
                value={query}
                onChange={(e) => updateQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyUp}
                className='not-draggable bg-opacity-70 bg-white text-gray-500 w-4/5 h-full px-2 rounded-tl-lg'
                placeholder={currentTip}
                suppressHydrationWarning // Because the placeholder is random, we're getting hydration warnings.
            />
            <select
                ref={selectRef}
                className='not-draggable bg-opacity-70 bg-white text-gray-500 w-1/5 h-full rounded-tr-lg'
                value={typeFilter}
                onChange={(e) => updateTypeFilter(e.target.value)}
            >
                <option value=''>All Types</option>
                <option value='image'>Images</option>
                <option value='html'>HTML</option>
                <option value='url'>URLs</option>
                <option value='path'>Files</option>
                <option value='colour'>Colours</option>
                <option value='text'>Text</option>
            </select>
        </div>
    )
})