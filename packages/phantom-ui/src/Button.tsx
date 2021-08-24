import React from 'react';
import './styles/button.css';

export interface ButtonProps {
    color?: string;
    disabled?: boolean;
    icon?: React.ReactElement;
    onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    style?: React.CSSProperties;
}

const buttonStyle = {
    // border: 'none',
    // borderRadius: '6px',
    // color: 'white',
    // cursor: 'pointer',
    // display: 'flex',
    // alignItems: 'center',
    // justifyContent: 'space-between',
    // fontWeight: 600,
    // outlineColor: 'transparent',
    // outlineStyle: 'none',
    // width: '100%',
};

export const Button: React.FC<ButtonProps> = (props) => {
    return (
        <button
            className="phantom-wallet-button"
            disabled={props.disabled}
            onClick={props.onClick}
            style={{ ...buttonStyle, ...props.style }}
        >
            {props.children}
            {props.icon && <i>{props.icon}</i>}
        </button>
    );
};
