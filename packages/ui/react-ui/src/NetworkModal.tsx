import React, { FC, MouseEvent, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useConnection } from '@solana/wallet-adapter-react';
import { useNetworkModal } from './useNetworkModal';
import { Select } from './Select';

export interface NetworkModalProps {
  className?: string;
  container?: string;
}

export const WalletAdapterNetworks = [
  { label: "Mainnet", value: "mainnet-beta" },
  { label: "Testnet", value: "testnet" },
  { label: "Devnet", value: "devnet" },
]

export const NetworkModal: FC<NetworkModalProps> = ({ className = '', container = 'body'}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { setModalVisible } = useNetworkModal();
  const { endpoint, updateConnection } = useConnection();
  const [fadeIn, setFadeIn] = useState(false);
  const [portal, setPortal] = useState<Element | null>(null);
  const [network, setNetwork] = useState<{label: string, value: string}>(WalletAdapterNetworks[0]);
  const [customEndpoint, setCustomEndpoint] = useState<string>("");

  const hideModal = useCallback(() => {
    setFadeIn(false);
    setTimeout(() => setModalVisible(false), 150);
  }, []);

  const handleClose = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      hideModal();
    },
    [hideModal]
  );

  const saveNetwork = () => {
    if(network.label === "Custom" && validateCustomEndpoint()) {
      updateConnection(customEndpoint, true);
      setModalVisible(false);
    } else {
      updateConnection(network.value, false);
      setModalVisible(false);
    }
  }

  const validateCustomEndpoint = () => {
    let url;
    try {
      url = new URL(customEndpoint);
    } catch (_) {
      return false
    }
    return url.protocol === 'http:' || url.protocol === 'https:';
  } 

  const handleTabKey = useCallback(
    (event: KeyboardEvent) => {
        const node = ref.current;
        if (!node) return;

        // here we query all focusable elements
        const focusableElements = node.querySelectorAll('button');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
            // if going backward by pressing tab and firstElement is active, shift focus to last focusable element
            if (document.activeElement === firstElement) {
                lastElement.focus();
                event.preventDefault();
            }
        } else {
            // if going forward by pressing tab and lastElement is active, shift focus to first focusable element
            if (document.activeElement === lastElement) {
                firstElement.focus();
                event.preventDefault();
            }
        }
    },
    [ref]
  );

   const determineCluster = () => {
     if(endpoint === 'https://api.devnet.solana.com' || endpoint === 'http://api.devnet.solana.com') {
        setNetwork(WalletAdapterNetworks[2])
     } else if(endpoint === 'https://api.testnet.solana.com' || endpoint === 'http://testnet.solana.com') {
       setNetwork(WalletAdapterNetworks[1])
     } else if(endpoint === 'https://api.mainnet-beta.solana.com/' || endpoint === 'http://api.mainnet-beta.solana.com/') {
       setNetwork(WalletAdapterNetworks[0])
     } else {
       setNetwork({ label: "Custom", value: "Custom" });
       setCustomEndpoint(endpoint);
     }
   }

  useLayoutEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            hideModal();
        } else if (event.key === 'Tab') {
            handleTabKey(event);
        }
    };

    // Get original overflow
    const { overflow } = window.getComputedStyle(document.body);
    // Hack to enable fade in animation after mount
    setTimeout(() => setFadeIn(true), 0);
    // Prevent scrolling on mount
    document.body.style.overflow = 'hidden';
    // Listen for keydown events
    window.addEventListener('keydown', handleKeyDown, false);

    return () => {
        // Re-enable scrolling when component unmounts
        document.body.style.overflow = overflow;
        window.removeEventListener('keydown', handleKeyDown, false);
    };
  }, [hideModal, handleTabKey]);

  useLayoutEffect(() => setPortal(document.querySelector(container)), [container]);

  useEffect(() => {
    determineCluster();
  }, [])

  return (
    portal && 
    createPortal(
      <div
        aria-labelledby="network-adapter-modal-title"
        aria-modal="true"
        className={`wallet-adapter-modal ${fadeIn && 'wallet-adapter-modal-fade-in'} ${className}`}
        ref={ref}
        role="dialog"
      >
        <div className="wallet-adapter-modal-container">
          <div className="wallet-adapter-modal-wrapper network-modal-wrapper">
            <button onClick={handleClose} className="wallet-adapter-modal-button-close">
              <svg width="14" height="14">
                <path d="M14 12.461 8.3 6.772l5.234-5.233L12.006 0 6.772 5.234 1.54 0 0 1.539l5.234 5.233L0 12.006l1.539 1.528L6.772 8.3l5.69 5.7L14 12.461z" />
              </svg>
            </button>
            <h1 className="wallet-adapter-modal-title">Change network</h1>
            <Select 
              value={network.label}
              onChange={setNetwork}
              options={[...WalletAdapterNetworks, { label: "Custom", value: "Custom" }]}
            />
            {network.label === "Custom" && (
              <div className="wallet-adapter-input-container">
                <label className="wallet-adapter-input-label">
                  RPC Node URL
                </label>
                <input 
                  className="wallet-adapter-custom-network-input"
                  value={customEndpoint}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomEndpoint(e.target.value)}
                />
              </div>
            )}
            <button
              className="wallet-adapter-button wallet-adapter-modal-save-button"
              onClick={saveNetwork}
            >
              Save
            </button>
          </div>
        </div>
      </div>,
      portal
    )
  );
};
