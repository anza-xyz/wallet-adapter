import React from 'react';

export interface ButtonProps {
    className?: string;
    color?: string;
    disabled?: boolean;
    endIcon?: React.ReactElement;
    onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    startIcon?: React.ReactElement;
    style?: React.CSSProperties;
    tabIndex?: number;
}

export const Button: React.FC<ButtonProps> = (props) => {
    const backgroundColor = props.color && !props.disabled ? props.color : undefined;
    const justifyContent = props.endIcon || props.startIcon ? 'space-between' : 'center';

    return (
        <button
            className={`wallet-adapter-button ${props.className || ''}`}
            disabled={props.disabled}
            onClick={props.onClick}
            style={{ backgroundColor, justifyContent, ...props.style }}
            tabIndex={props.tabIndex || 0}
        >
            {props.startIcon && <i className="wallet-adapter-button-start-icon">{props.startIcon}</i>}
            {props.children}
            {props.endIcon && <i className="wallet-adapter-button-end-icon">{props.endIcon}</i>}
        </button>
    );
};
