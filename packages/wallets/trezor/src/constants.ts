// redeclared from TrezorConnect to allow async import
export const DEVICE_EVENT = 'DEVICE_EVENT';
export const DEVICE = {
    CONNECT: 'device-connect',
    CONNECT_UNACQUIRED: 'device-connect_unacquired',
    DISCONNECT: 'device-disconnect',
    CHANGED: 'device-changed',
    ACQUIRE: 'device-acquire',
    RELEASE: 'device-release',
    ACQUIRED: 'device-acquired',
    RELEASED: 'device-released',
    USED_ELSEWHERE: 'device-used_elsewhere',
    LOADING: 'device-loading',
    BUTTON: 'button',
    PIN: 'pin',
    PASSPHRASE: 'passphrase',
    PASSPHRASE_ON_DEVICE: 'passphrase_on_device',
    WORD: 'word',
};
