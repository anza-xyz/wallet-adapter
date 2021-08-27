import React from 'react';

export interface ButtonProps {
    buttonStyle?: React.CSSProperties;
    className?: string;
    color?: string;
    disabled?: boolean;
    endIcon?: React.ReactElement;
    startIcon?: React.ReactElement;
    onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const Button: React.FC<ButtonProps> = (props) => {
    return (
        <button
            className={`wallet-adapter-button ${props.className}`}
            disabled={props.disabled}
            onClick={props.onClick}
            style={{
                backgroundColor: props.color && !props.disabled ? props.color : undefined,
                justifyContent: props.endIcon || props.startIcon ? 'space-between' : 'center',
                ...props.buttonStyle,
            }}
        >
            {props.startIcon && <i className="wallet-adapter-button-start-icon">{props.startIcon}</i>}
            {props.children}
            {props.endIcon && <i className="wallet-adapter-button-end-icon">{props.endIcon}</i>}
        </button>
    );
};
