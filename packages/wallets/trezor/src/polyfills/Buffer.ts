import { Buffer } from 'buffer';

if (typeof window !== 'undefined' && window.Buffer === undefined) {
    (window as any).Buffer = Buffer;
}

export {};
