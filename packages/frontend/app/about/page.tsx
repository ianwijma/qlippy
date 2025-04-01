'use client';

import {DefaultWindowContainer} from "../../components/windowContainer/DefaultWindowContainer";
import {version} from 'qlippy/package.json'


export default function AboutPage() {

    return <DefaultWindowContainer title='About Qlippy' className='flex flex-col bg-opacity-70 bg-white text-gray-500 h-full py-1 px-1 overflow-x-auto whitespace-nowrap'>
        <div className='w-full h-screen flex justify-center items-center'>
            Version: {version}
        </div>
    </DefaultWindowContainer>
}