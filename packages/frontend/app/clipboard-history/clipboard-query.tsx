export const ClipboardQuery = () => {
    return (
        <div className="h-full flex gap-1 justify-between items-center px-2">
            <input className='text-gray-500 w-4/5 h-12 px-2' placeholder='Type to filter through entries...'/>
            <select className='text-gray-500 w-1/5 h-12'>
                <option>All Types</option>
                <option>Images</option>
                <option>HTML</option>
                <option>URLs</option>
                <option>Files</option>
                <option>Text</option>
            </select>
        </div>
    )
}