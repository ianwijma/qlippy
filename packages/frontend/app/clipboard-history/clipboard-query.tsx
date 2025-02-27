import {KeyboardEventHandler, memo, useCallback, useEffect, useRef} from "react";

export type ClipboardQueryParams = {
    query: string;
    updateQuery: (query: string) => void;
    typeFilter: string;
    updateTypeFilter: (query: string) => void;
    selectNext: () => void,
    selectPrevious: () => void,
    confirmSelected: () => void,
    deleteSelected: () => void,
    close: () => void,
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
                                        close
                                    }: ClipboardQueryParams) => {
    const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback((event) => {
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
            case 'Delete':
                event.preventDefault();
                deleteSelected();
                break;
        }
    }, [selectNext, selectPrevious, confirmSelected, close, deleteSelected]);

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
                className='not-draggable bg-opacity-70 bg-white text-gray-500 w-4/5 h-full px-2 rounded-tl-lg'
                placeholder='Type to filter through entries...'
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