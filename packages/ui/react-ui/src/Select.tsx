import React, { FC, createRef, useState, useEffect } from 'react';

export interface SelectProps {
  options: {label: string, value: string}[];
  value: string;
  onChange: (option: {label: string, value: string}) => void;
}

export const Select: FC<SelectProps> = (props) => {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const optionsRef = createRef<HTMLDivElement>();
  const containerRef = createRef<HTMLUListElement>();

  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if(!event.currentTarget.contains(event.relatedTarget as Node))
      setShowOptions(false);
    else if(!optionsRef.current?.contains(event.relatedTarget as Node))
      setShowOptions(false);
  }

  const handleOptionSelect = (option: {label: string, value: string}) => {
    props.onChange(option);
    setShowOptions(false);
  }

  return (
    <ul
      ref={containerRef}  
      className="wallet-adapter-select-container"
    >
      <div 
        className="wallet-adapter-select"
        onClick={() => setShowOptions(!showOptions)}
        onBlur={handleBlur}
      >
        {props.value}
        <svg
          width="13"
          height="7"
          viewBox="0 0 13 7"
          xmlns="http://www.w3.org/2000/svg"
          className={`${
            showOptions ? 'wallet-adapter-modal-list-more-icon-rotate' : ''
          }`}
        >
          <path d="M0.71418 1.626L5.83323 6.26188C5.91574 6.33657 6.0181 6.39652 6.13327 6.43762C6.24844 6.47872 6.37371 6.5 6.50048 6.5C6.62725 6.5 6.75252 6.47872 6.8677 6.43762C6.98287 6.39652 7.08523 6.33657 7.16774 6.26188L12.2868 1.626C12.7753 1.1835 12.3703 0.5 11.6195 0.5H1.37997C0.629216 0.5 0.224175 1.1835 0.71418 1.626Z" />
        </svg>
      </div>
      {showOptions && (
        <div 
          ref={optionsRef} 
          className="wallet-adapter-select-options"
          onBlur={handleBlur}
        >
          {props.options.map((option, index) => (
            <li>
              <button
                key={index}
                className="wallet-adapter-select-option"
                onClick={() => handleOptionSelect(option)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </div>
      )}
    </ul>
  )
}
