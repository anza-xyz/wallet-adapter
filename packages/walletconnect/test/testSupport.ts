import * as nacl from 'tweetnacl';
import { derivePath } from 'ed25519-hd-key';
import { Account } from '@solana/web3.js';

export const getTestSolanaAccount = (seed: string) => {
  const path44Change = "m/44'/501'/0'/0'";
  const derivedSeed = derivePath(
    path44Change,
    Buffer.from(seed).toString('hex'),
  ).key;
  return new Account(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);
};

export const seed1 =
  'crush course bread avocado possible wire defy token public audit dolphin music fade maple fiction adapt friend van jacket flip man coyote boss amount';
export const seed2 =
  'trigger theme obvious vague visual bundle clever napkin unveil winner globe tower silver wink borrow latin bullet gallery still embrace merry slab bar ordinary';

export const testSignerMetaData = {
  name: 'Test Wallet',
  description: 'Test Wallet',
  url: 'https://www.civic.com',
  icons: [
    'https://play-lh.googleusercontent.com/EKygllRSvy-uLK-W_IXOeeJvHWSdLUkch1Q21InVwDweqfF0LwWErjb4T7-lpFVZHKg=s180',
  ],
};

export const testMetaData = {
  name: 'test_name',
  description: 'test_description',
  url: 'https://test_url',
  icons: ['test_icon_url'],
};
