import React, { FC, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useWalletModal } from './useWalletModal';

interface ModalProps {
    className?: string;
    size?: string;
}

const modalRoot = document.getElementById('root');

export const WalletModal: FC<ModalProps> = (props) => {
    // static defaultProps = {
    //     id: '',
    //     modalClass: '',
    //     modalSize: 'md',
    // };

    const [fadeType, setFadeType] = React.useState<null | 'in' | 'out'>(null);

    // useEffect(() => {
    //     window.addEventListener('keydown', onEscKeyDown, false);
    //     setTimeout(() => setFadeType('in'), 0);
    //     return () => window.removeEventListener('keydown', onEscKeyDown, false);
    // }, []);
    // componentDidUpdate(prevProps, prevState) {
    //     if (!this.props.isOpen && prevProps.isOpen) {
    //         setFadeType('out');
    //     }
    // }

    const transitionEnd = (e: any) => {
        if (e.propertyName !== 'opacity' || fadeType === 'in') return;
        if (fadeType === 'out') {
            // this.props.onClose();
        }
    };
    const onEscKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Escape') return;
        setFadeType('out');
    };
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setFadeType('out');
    };

    return createPortal(
        <div
            id={props.id}
            className={`wrapper ${props.className}`}
            role="dialog"
            // modalSize={props.size}
            onTransitionEnd={transitionEnd}
            // fadeType={fadeType}
        >
            <div className="box-dialog">
                <div className="box-header">
                    <h4 className="box-title">Title Of Modal</h4>
                    <button onClick={handleClick} className="close">
                        ×
                    </button>
                </div>
                <div className="box-content">{props.children}</div>
                <div className="box-footer">
                    <button onClick={handleClick} className="close">
                        Close
                    </button>
                </div>
            </div>
            <div className={`background`} onMouseDown={handleClick} />
        </div>,
        // @ts-ignore
        modalRoot
    );
};

// const StyledModal = styled.div`
//     position: absolute;
//     top: 0;
//     left: 0;
//     right: 0;
//     bottom: 0;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     opacity: 0;
//     transition: opacity linear 0.15s;
//     z-index: 2000;
//     width: ${(props) => {
//         switch (props.modalSize) {
//             case 'lg':
//                 return '800';
//             default:
//                 return '480';
//         }
//     }}px;
//     margin: 40px auto;
//     &.fade-in {
//         opacity: 1;
//         transition: opacity linear 0.15s;
//     }
//     &.fade-out {
//         opacity: 0;
//         transition: opacity linear 0.15s;
//     }
//     .background {
//         background: rgba(0, 0, 0, 0.5);
//         position: fixed;
//         z-index: 1040;
//         display: block;
//         top: 0;
//         left: 0;
//         bottom: 0;
//         right: 0;
//         outline: 0;
//     }
//     .box-dialog {
//         z-index: 1050;
//         width: 100%;
//         background-color: #fefefe;
//         box-shadow: 0 3px 9px rgba(0, 0, 0, 0.5);
//         .box-content {
//             padding: 24px;
//             width: 100%;
//         }
//         .box-header {
//             height: 48px;
//             padding: 8px 24px;
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//             border-bottom: 1px solid #c7c7c7;
//             .box-title {
//                 font-size: 24px;
//                 font-weight: 400;
//                 margin: 0 0 0 0;
//             }
//             .x-close {
//                 font-size: 35px;
//                 line-height: 35px;
//                 font-weight: 400;
//                 text-shadow: none;
//                 color: black;
//                 cursor: pointer;
//                 &:hover {
//                     opacity: 0.5;
//                 }
//             }
//         }
//         .box-body {
//             font-size: 14px;
//             padding: 0px;
//             width: auto;
//             height: auto;
//         }
//         .box-footer {
//             height: 48px;
//             padding: 0px 24px;
//             display: flex;
//             align-items: center;
//             justify-content: flex-end;
//             border-top: 1px solid #c7c7c7;
//         }
//     }
// `;
