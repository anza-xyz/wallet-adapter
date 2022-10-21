declare module 'Document' {
  global {
    interface Window {
      nitrogen: {
        isNitrogen: boolean;
        solana: {
          connect: () => Promise<{ publicKey: string }>;
          isConnected: boolean;
          publicKey: string;
        };
      };
    }
  }
}
