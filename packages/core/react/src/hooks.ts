import type {
    AccountBalancePair,
    AccountInfo,
    BlockProduction,
    Commitment,
    ConfirmedSignatureInfo,
    EpochInfo,
    EpochSchedule,
    GetBlockProductionConfig,
    GetLargestAccountsConfig,
    GetParsedProgramAccountsConfig,
    GetProgramAccountsConfig,
    GetProgramAccountsResponse,
    GetVersionedTransactionConfig,
    InflationGovernor,
    InflationRate,
    InflationReward,
    ParsedAccountData,
    RpcResponseAndContext,
    StakeActivationData,
    TokenAccountBalancePair,
    TokenAmount,
    TransactionResponse,
    Version,
    VersionedTransactionResponse,
    VoteAccountStatus,
} from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { useConnection } from './useConnection.js';

export type HookOptions = {
    refetchInterval?: number | null;
};

export type HookReturnType<T> = {
    data: T | null;
    refetch: () => void;
    isLoading: boolean;
};

export function useBalance(
    publicKey: PublicKey | null,
    { refetchInterval = null }: HookOptions = {}
): HookReturnType<number> {
    const [balance, setBalance] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { connection } = useConnection();

    const fetchBalance = () => {
        if (!publicKey) return;
        setIsLoading(true);
        connection.getBalance(publicKey).then((res) => {
            setBalance(res);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchBalance();
        if (refetchInterval) {
            const interval = setInterval(fetchBalance, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publicKey, refetchInterval]);

    return { data: balance, refetch: fetchBalance, isLoading };
}

export function useTokenBalance(
    publicKey: PublicKey | null,
    mint: PublicKey | null,
    { refetchInterval = null }: HookOptions = {}
): HookReturnType<TokenAmount> {
    const [balance, setBalance] = useState<TokenAmount | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { connection } = useConnection();

    const fetchTokenBalance = () => {
        if (!publicKey || !mint) return;
        setIsLoading(true);
        connection.getTokenAccountBalance(publicKey).then((res) => {
            setBalance(res.value);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchTokenBalance();
        if (refetchInterval) {
            const interval = setInterval(fetchTokenBalance, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publicKey, mint, refetchInterval]);

    return { data: balance, refetch: fetchTokenBalance, isLoading };
}

export function useTransaction(
    signature: string,
    config: GetVersionedTransactionConfig = {},
    { refetchInterval = null }: HookOptions = {}
): HookReturnType<VersionedTransactionResponse> {
    const [transaction, setTransaction] = useState<VersionedTransactionResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { connection } = useConnection();

    const fetchTransaction = () => {
        setIsLoading(true);
        const params: GetVersionedTransactionConfig = {
            ...config,
            maxSupportedTransactionVersion: 2,
        };
        connection.getTransaction(signature, params).then((res) => {
            setTransaction(res);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchTransaction();
        if (refetchInterval) {
            const interval = setInterval(fetchTransaction, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signature, refetchInterval]);

    return { data: transaction, refetch: fetchTransaction, isLoading };
}

export function useTransactions(
    signatures: string[],
    config: GetVersionedTransactionConfig = {},
    { refetchInterval = null }: HookOptions = {}
): HookReturnType<(TransactionResponse | null)[]> {
    const [transactions, setTransactions] = useState<(TransactionResponse | null)[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { connection } = useConnection();

    const fetchTransactions = () => {
        setIsLoading(true);
        const params: GetVersionedTransactionConfig = {
            ...config,
            maxSupportedTransactionVersion: 2,
        } as const;
        connection.getTransactions(signatures, params).then((res) => {
            setTransactions(res);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchTransactions();
        if (refetchInterval) {
            const interval = setInterval(fetchTransactions, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signatures, refetchInterval]);

    return {
        data: transactions,
        refetch: fetchTransactions,
        isLoading,
    };
}

export function useVersion({ refetchInterval = null }: HookOptions = {}): HookReturnType<Version> {
    const [version, setVersion] = useState<Version | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { connection } = useConnection();

    const fetchVersion = () => {
        setIsLoading(true);
        connection.getVersion().then((res) => {
            setVersion(res);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchVersion();
        if (refetchInterval) {
            const interval = setInterval(fetchVersion, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetchInterval]);

    return { data: version, isLoading, refetch: fetchVersion };
}

export function useBlockTime(
    slot: number | null,
    { refetchInterval = null }: HookOptions = {}
): HookReturnType<number> {
    const [blockTime, setBlockTime] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { connection } = useConnection();

    const fetchBlockTime = () => {
        if (slot === null) return;
        setIsLoading(true);
        connection.getBlockTime(slot).then((res) => {
            setBlockTime(res);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchBlockTime();
        if (refetchInterval) {
            const interval = setInterval(fetchBlockTime, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slot, refetchInterval]);

    return { data: blockTime, refetch: fetchBlockTime, isLoading };
}

export function useRecentBlockhash({ refetchInterval = null }: HookOptions = {}): HookReturnType<
    Readonly<{
        blockhash: string;
        lastValidBlockHeight: number;
    }>
> {
    const [blockhash, setBlockhash] = useState<Readonly<{
        blockhash: string;
        lastValidBlockHeight: number;
    }> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { connection } = useConnection();

    const fetchRecentBlockhash = () => {
        setIsLoading(true);
        connection.getLatestBlockhash().then((res) => {
            setBlockhash(res);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchRecentBlockhash();
        if (refetchInterval) {
            const interval = setInterval(fetchRecentBlockhash, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetchInterval]);

    return { data: blockhash, refetch: fetchRecentBlockhash, isLoading };
}

export function useConfirmedSignatures(
    address: PublicKey | null,
    limit = 10,
    { refetchInterval = null }: HookOptions = {}
): HookReturnType<ConfirmedSignatureInfo[]> {
    const [signatures, setSignatures] = useState<ConfirmedSignatureInfo[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { connection } = useConnection();

    const fetchSignatures = () => {
        if (!address) return;
        setIsLoading(true);
        connection.getSignaturesForAddress(address, { limit }).then((res) => {
            setSignatures(res);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchSignatures();
        if (refetchInterval) {
            const interval = setInterval(fetchSignatures, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address, limit, refetchInterval]);

    return { data: signatures, refetch: fetchSignatures, isLoading };
}

export function useEpochInfo({ refetchInterval = null }: HookOptions = {}): HookReturnType<EpochInfo> {
    const [epochInfo, setEpochInfo] = useState<EpochInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { connection } = useConnection();

    const fetchEpochInfo = () => {
        setIsLoading(true);
        connection.getEpochInfo().then((res) => {
            setEpochInfo(res);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchEpochInfo();
        if (refetchInterval) {
            const interval = setInterval(fetchEpochInfo, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetchInterval]);

    return { data: epochInfo, refetch: fetchEpochInfo, isLoading };
}

export function useEpochSchedule({ refetchInterval = null }: HookOptions = {}): HookReturnType<EpochSchedule> {
    const [epochSchedule, setEpochSchedule] = useState<EpochSchedule | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { connection } = useConnection();

    const fetchEpochSchedule = () => {
        setIsLoading(true);
        connection.getEpochSchedule().then((res) => {
            setEpochSchedule(res);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchEpochSchedule();
        if (refetchInterval) {
            const interval = setInterval(fetchEpochSchedule, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetchInterval]);

    return { data: epochSchedule, refetch: fetchEpochSchedule, isLoading };
}

export function useInflationGovernor({ refetchInterval = null }: HookOptions = {}): HookReturnType<InflationGovernor> {
    const [inflationGovernor, setInflationGovernor] = useState<InflationGovernor | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { connection } = useConnection();

    const fetchInflationGovernor = () => {
        setIsLoading(true);
        connection.getInflationGovernor().then((res) => {
            setInflationGovernor(res);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchInflationGovernor();
        if (refetchInterval) {
            const interval = setInterval(fetchInflationGovernor, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetchInterval]);

    return { data: inflationGovernor, refetch: fetchInflationGovernor, isLoading };
}

export function useInflationReward(
    publicKey: PublicKey | null,
    epoch: number | null,
    { refetchInterval = null }: HookOptions = {}
): HookReturnType<(InflationReward | null)[]> {
    const [inflationReward, setInflationReward] = useState<(InflationReward | null)[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { connection } = useConnection();

    const fetchInflationReward = () => {
        if (!publicKey || epoch === null) return;
        setIsLoading(true);
        connection.getInflationReward([publicKey], epoch).then((res) => {
            setInflationReward(res);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchInflationReward();
        if (refetchInterval) {
            const interval = setInterval(fetchInflationReward, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publicKey, epoch, refetchInterval]);

    return { data: inflationReward, refetch: fetchInflationReward, isLoading };
}

export function useInflationRate({ refetchInterval = null }: HookOptions = {}): HookReturnType<InflationRate> {
    const [inflationRate, setInflationRate] = useState<InflationRate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { connection } = useConnection();

    const fetchInflationRate = () => {
        setIsLoading(true);

        connection.getInflationRate().then((res) => {
            setInflationRate(res);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchInflationRate();
        if (refetchInterval) {
            const interval = setInterval(fetchInflationRate, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetchInterval]);

    return { data: inflationRate, refetch: fetchInflationRate, isLoading };
}

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

export function useTokenSupply(
    tokenMintAddress: PublicKey,
    commitment?: Commitment,
    { refetchInterval = null }: HookOptions = {}
) {
    const [tokenSupply, setTokenSupply] = useState<TokenAmount | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { connection } = useConnection();

    const fetchTokenSupply = () => {
        setIsLoading(true);
        connection.getTokenSupply(tokenMintAddress, commitment).then((res) => {
            setTokenSupply(res.value);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchTokenSupply();
        if (refetchInterval) {
            const interval = setInterval(fetchTokenSupply, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenMintAddress, commitment, refetchInterval]);

    return { data: tokenSupply, refetch: fetchTokenSupply, isLoading };
}

export function useLargestAccounts(config?: GetLargestAccountsConfig, { refetchInterval = null }: HookOptions = {}) {
    const [largestAccounts, setLargestAccounts] = useState<RpcResponseAndContext<AccountBalancePair[]> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { connection } = useConnection();

    const fetchLargestAccounts = () => {
        setIsLoading(true);
        connection.getLargestAccounts(config).then((res) => {
            setLargestAccounts(res);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchLargestAccounts();
        if (refetchInterval) {
            const interval = setInterval(fetchLargestAccounts, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(config), refetchInterval]);

    return { data: largestAccounts, refetch: fetchLargestAccounts, isLoading };
}

export function useTokenLargestAccounts(
    mintAddress: PublicKey,
    commitment?: Commitment,
    { refetchInterval = null }: HookOptions = {}
) {
    const [tokenLargestAccounts, setTokenLargestAccounts] = useState<TokenAccountBalancePair[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { connection } = useConnection();

    const fetchTokenLargestAccounts = () => {
        setIsLoading(true);
        connection.getTokenLargestAccounts(mintAddress, commitment).then((res) => {
            setTokenLargestAccounts(res.value);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchTokenLargestAccounts();
        if (refetchInterval) {
            const interval = setInterval(fetchTokenLargestAccounts, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mintAddress, commitment, refetchInterval]);

    return { data: tokenLargestAccounts, refetch: fetchTokenLargestAccounts, isLoading };
}

export function useVoteAccounts(commitment?: Commitment, { refetchInterval = null }: HookOptions = {}) {
    const [voteAccounts, setVoteAccounts] = useState<VoteAccountStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { connection } = useConnection();

    const fetchVoteAccounts = () => {
        setIsLoading(true);
        connection.getVoteAccounts(commitment).then((res) => {
            setVoteAccounts(res);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchVoteAccounts();
        if (refetchInterval) {
            const interval = setInterval(fetchVoteAccounts, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [commitment, refetchInterval]);

    return { data: voteAccounts, refetch: fetchVoteAccounts, isLoading };
}

export function useSlotLeader(commitment?: Commitment, { refetchInterval = null }: HookOptions = {}) {
    const [slotLeader, setSlotLeader] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { connection } = useConnection();

    const fetchSlotLeader = () => {
        setIsLoading(true);
        connection.getSlotLeader(commitment).then((res) => {
            setSlotLeader(res);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchSlotLeader();
        if (refetchInterval) {
            const interval = setInterval(fetchSlotLeader, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [commitment, refetchInterval]);

    return { data: slotLeader, refetch: fetchSlotLeader, isLoading };
}

export function useSlotLeaders(startSlot: number, limit: number, { refetchInterval = null }: HookOptions = {}) {
    const [slotLeaders, setSlotLeaders] = useState<Array<PublicKey> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { connection } = useConnection();

    const fetchSlotLeaders = () => {
        setIsLoading(true);
        connection.getSlotLeaders(startSlot, limit).then((res) => {
            setSlotLeaders(res);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchSlotLeaders();
        if (refetchInterval) {
            const interval = setInterval(fetchSlotLeaders, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startSlot, limit, refetchInterval]);

    return { data: slotLeaders, refetch: fetchSlotLeaders, isLoading };
}

export function useStakeActivation(
    publicKey: PublicKey,
    commitment?: Commitment,
    epoch?: number,
    { refetchInterval = null }: HookOptions = {}
) {
    const [stakeActivation, setStakeActivation] = useState<StakeActivationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { connection } = useConnection();

    const fetchStakeActivation = () => {
        setIsLoading(true);
        connection.getStakeActivation(publicKey, commitment, epoch).then((res) => {
            setStakeActivation(res);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchStakeActivation();
        if (refetchInterval) {
            const interval = setInterval(fetchStakeActivation, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publicKey, commitment, epoch, refetchInterval]);

    return { data: stakeActivation, refetch: fetchStakeActivation, isLoading };
}

export function useGetProgramAccounts(
    programId: PublicKey,
    config?: GetProgramAccountsConfig,
    { refetchInterval = null }: HookOptions = {}
) {
    const [programAccounts, setProgramAccounts] = useState<GetProgramAccountsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { connection } = useConnection();

    const fetchProgramAccounts = () => {
        setIsLoading(true);
        connection.getProgramAccounts(programId, config).then((res) => {
            setProgramAccounts(res);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchProgramAccounts();
        if (refetchInterval) {
            const interval = setInterval(fetchProgramAccounts, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [programId, JSON.stringify(config), refetchInterval]);

    return { data: programAccounts, refetch: fetchProgramAccounts, isLoading };
}

export function useGetParsedProgramAccounts(
    programId: PublicKey,
    config?: GetParsedProgramAccountsConfig,
    { refetchInterval = null }: HookOptions = {}
) {
    const [parsedProgramAccounts, setParsedProgramAccounts] = useState<
        | {
              pubkey: PublicKey;
              account: AccountInfo<ParsedAccountData | Buffer>;
          }[]
        | null
    >(null);
    const [isLoading, setIsLoading] = useState(true);
    const { connection } = useConnection();

    const fetchParsedProgramAccounts = () => {
        setIsLoading(true);
        connection.getParsedProgramAccounts(programId, config).then((res) => {
            setParsedProgramAccounts(res);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchParsedProgramAccounts();
        if (refetchInterval) {
            const interval = setInterval(fetchParsedProgramAccounts, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [programId, JSON.stringify(config), refetchInterval]);

    return { data: parsedProgramAccounts, refetch: fetchParsedProgramAccounts, isLoading };
}

export function useGetBlockProduction(config?: GetBlockProductionConfig, { refetchInterval = null }: HookOptions = {}) {
    const [blockProduction, setBlockProduction] = useState<BlockProduction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { connection } = useConnection();

    const fetchBlockProduction = () => {
        setIsLoading(true);
        connection.getBlockProduction(config).then((res) => {
            setBlockProduction(res.value);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchBlockProduction();
        if (refetchInterval) {
            const interval = setInterval(fetchBlockProduction, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(config), refetchInterval]);

    return { data: blockProduction, refetch: fetchBlockProduction, isLoading };
}

function findAssociatedTokenAddress(walletAddress: PublicKey, tokenMintAddress: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
        [walletAddress.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), tokenMintAddress.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
    )[0];
}
