import {useWindowControls} from "../../hooks/useWindowControls";
import {PropsWithChildren} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faWindowMinimize, faXmark} from "@fortawesome/free-solid-svg-icons";
import {defaultLogo} from '@qlippy/common/src/logos'

type TitleBarButtonProps = PropsWithChildren & {
    onClick?: () => void;
}

const TitleBarButton = ({children, onClick}: TitleBarButtonProps) => {
    return <button
        onClick={onClick}
        className='not-draggable text-gray-500 bg-gray-300 w-6 h-6 rounded-full flex justify-center items-center'>
        {children}
    </button>
}

type TitleBarProps = PropsWithChildren & {
    showMinimize?: boolean;
    showClose?: boolean;
    onMinimizeClicked?: () => void;
    onCloseClicked?: () => void;
}

export const TitleBar = ({
                             children,
                             showMinimize = true,
                             showClose = true,
                             onMinimizeClicked,
                             onCloseClicked
                         }: TitleBarProps) => {
    const {minimize, close} = useWindowControls();

    onMinimizeClicked ??= minimize;
    onCloseClicked ??= close;

    return <div className='draggable flex justify-between bg-opacity-85 bg-white text-gray-500 px-1 py-1'>
        <div className='flex items-center gap-1'>
            <img src={defaultLogo} alt='logo' className='w-5 h-5' draggable={false}/>
            <span className='max-w-1/2 flex overflow-ellipsis overflow-hidden whitespace-nowrap'>
                {children}
            </span>
        </div>
        <div className='flex gap-2'>
            {
                showMinimize && (
                    <TitleBarButton onClick={onMinimizeClicked}>
                        <FontAwesomeIcon icon={faWindowMinimize} size='xs'/>
                    </TitleBarButton>
                )
            }
            {
                showClose && (
                    <TitleBarButton onClick={onCloseClicked}>
                        <FontAwesomeIcon icon={faXmark} size='sm'/>
                    </TitleBarButton>
                )
            }
        </div>
    </div>
}