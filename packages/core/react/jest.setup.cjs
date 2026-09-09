// jsdom does not provide the TextEncoder/TextDecoder globals that @solana/web3.js
// reaches for at import time when it initializes its ed25519 dependency.
const { TextDecoder, TextEncoder } = require('util');

globalThis.TextEncoder ??= TextEncoder;
globalThis.TextDecoder ??= TextDecoder;
