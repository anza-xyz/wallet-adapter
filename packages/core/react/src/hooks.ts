import type {
    AccountBalancePair,
    AccountInfo,
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

const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

export type HookOptions = {
    refetchInterval?: number | null;
};

export type HookReturnType<T> = {
    data: T | null;
    refetch: () => void;
    isLoading: boolean;
    error: any;
};

export function useBalance(
    publicKey: PublicKey | null,
    { refetchInterval = null }: HookOptions = {}
): HookReturnType<number> {
    const [balance, setBalance] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const { connection } = useConnection();

    const fetchBalance = async () => {
        if (!publicKey) return;
        try {
            setError(null);
            setIsLoading(true);
            const res = await connection.getBalance(publicKey);
            setBalance(res);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setBalance(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBalance();
        if (refetchInterval) {
            const interval = setInterval(fetchBalance, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publicKey, refetchInterval]);

    return { data: balance, refetch: fetchBalance, isLoading, error };
}

export function useTransaction(
    signature: string,
    config: GetVersionedTransactionConfig = {},
    { refetchInterval = null }: HookOptions = {}
): HookReturnType<VersionedTransactionResponse> {
    const [transaction, setTransaction] = useState<VersionedTransactionResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const { connection } = useConnection();

    const fetchTransaction = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const params: GetVersionedTransactionConfig = {
                ...config,
                maxSupportedTransactionVersion: 2,
            };
            const res = await connection.getTransaction(signature, params);
            setTransaction(res);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setTransaction(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransaction();
        if (refetchInterval) {
            const interval = setInterval(fetchTransaction, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [signature, refetchInterval]);

    return { data: transaction, refetch: fetchTransaction, isLoading, error };
}

export function useTransactions(
    signatures: string[],
    config: GetVersionedTransactionConfig = {},
    { refetchInterval = null }: HookOptions = {}
): HookReturnType<(TransactionResponse | null)[]> {
    const [transactions, setTransactions] = useState<(TransactionResponse | null)[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const { connection } = useConnection();

    const fetchTransactions = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const params: GetVersionedTransactionConfig = {
                ...config,
                maxSupportedTransactionVersion: 2,
            } as const;
            const res = await connection.getTransactions(signatures, params);
            setTransactions(res);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setTransactions(null);
            setIsLoading(false);
        }
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
        error,
    };
}

export function useVersion({ refetchInterval = null }: HookOptions = {}): HookReturnType<Version> {
    const [version, setVersion] = useState<Version | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const { connection } = useConnection();

    const fetchVersion = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const res = await connection.getVersion();
            setVersion(res);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setVersion(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVersion();
        if (refetchInterval) {
            const interval = setInterval(fetchVersion, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetchInterval]);

    return { data: version, isLoading, refetch: fetchVersion, error };
}

export function useBlockTime(
    slot: number | null,
    { refetchInterval = null }: HookOptions = {}
): HookReturnType<number> {
    const [blockTime, setBlockTime] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const { connection } = useConnection();

    const fetchBlockTime = async () => {
        if (slot === null) return;
        try {
            setError(null);
            setIsLoading(true);
            const res = await connection.getBlockTime(slot);
            setBlockTime(res);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setBlockTime(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBlockTime();
        if (refetchInterval) {
            const interval = setInterval(fetchBlockTime, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slot, refetchInterval]);

    return { data: blockTime, refetch: fetchBlockTime, isLoading, error };
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
    const [error, setError] = useState<any>(null);
    const { connection } = useConnection();

    const fetchRecentBlockhash = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const res = await connection.getLatestBlockhash();
            setBlockhash(res);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setBlockhash(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRecentBlockhash();
        if (refetchInterval) {
            const interval = setInterval(fetchRecentBlockhash, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetchInterval]);

    return { data: blockhash, refetch: fetchRecentBlockhash, isLoading, error };
}

export function useConfirmedSignatures(
    address: PublicKey | null,
    limit = 10,
    { refetchInterval = null }: HookOptions = {}
): HookReturnType<ConfirmedSignatureInfo[]> {
    const [signatures, setSignatures] = useState<ConfirmedSignatureInfo[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const { connection } = useConnection();

    const fetchSignatures = async () => {
        if (!address) return;
        try {
            setError(null);
            setIsLoading(true);
            const res = await connection.getSignaturesForAddress(address, { limit });
            setSignatures(res);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setSignatures(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSignatures();
        if (refetchInterval) {
            const interval = setInterval(fetchSignatures, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address, limit, refetchInterval]);

    return { data: signatures, refetch: fetchSignatures, isLoading, error };
}

export function useEpochInfo({ refetchInterval = null }: HookOptions = {}): HookReturnType<EpochInfo> {
    const [epochInfo, setEpochInfo] = useState<EpochInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const { connection } = useConnection();

    const fetchEpochInfo = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const res = await connection.getEpochInfo();
            setEpochInfo(res);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setEpochInfo(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEpochInfo();
        if (refetchInterval) {
            const interval = setInterval(fetchEpochInfo, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetchInterval]);

    return { data: epochInfo, refetch: fetchEpochInfo, isLoading, error };
}

export function useEpochSchedule({ refetchInterval = null }: HookOptions = {}): HookReturnType<EpochSchedule> {
    const [epochSchedule, setEpochSchedule] = useState<EpochSchedule | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const { connection } = useConnection();

    const fetchEpochSchedule = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const res = await connection.getEpochSchedule();
            setEpochSchedule(res);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setEpochSchedule(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEpochSchedule();
        if (refetchInterval) {
            const interval = setInterval(fetchEpochSchedule, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetchInterval]);

    return { data: epochSchedule, refetch: fetchEpochSchedule, isLoading, error };
}

export function useInflationGovernor({ refetchInterval = null }: HookOptions = {}): HookReturnType<InflationGovernor> {
    const [inflationGovernor, setInflationGovernor] = useState<InflationGovernor | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const { connection } = useConnection();

    const fetchInflationGovernor = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const res = await connection.getInflationGovernor();
            setInflationGovernor(res);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setInflationGovernor(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInflationGovernor();
        if (refetchInterval) {
            const interval = setInterval(fetchInflationGovernor, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetchInterval]);

    return { data: inflationGovernor, refetch: fetchInflationGovernor, isLoading, error };
}

export function useInflationReward(
    publicKey: PublicKey | null,
    epoch: number | null,
    { refetchInterval = null }: HookOptions = {}
): HookReturnType<(InflationReward | null)[]> {
    const [inflationReward, setInflationReward] = useState<(InflationReward | null)[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const { connection } = useConnection();

    const fetchInflationReward = async () => {
        if (!publicKey || epoch === null) return;
        try {
            setError(null);
            setIsLoading(true);
            const res = await connection.getInflationReward([publicKey], epoch);
            setInflationReward(res);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setInflationReward(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInflationReward();
        if (refetchInterval) {
            const interval = setInterval(fetchInflationReward, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publicKey, epoch, refetchInterval]);

    return { data: inflationReward, refetch: fetchInflationReward, isLoading, error };
}

export function useInflationRate({ refetchInterval = null }: HookOptions = {}): HookReturnType<InflationRate> {
    const [inflationRate, setInflationRate] = useState<InflationRate | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const { connection } = useConnection();

    const fetchInflationRate = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const res = await connection.getInflationRate();
            setInflationRate(res);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setInflationRate(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInflationRate();
        if (refetchInterval) {
            const interval = setInterval(fetchInflationRate, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refetchInterval]);

    return { data: inflationRate, refetch: fetchInflationRate, isLoading, error };
}

export function useTokenSupply(
    tokenMintAddress: PublicKey,
    commitment?: Commitment,
    { refetchInterval = null }: HookOptions = {}
): HookReturnType<TokenAmount> {
    const [tokenSupply, setTokenSupply] = useState<TokenAmount | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const { connection } = useConnection();

    const fetchTokenSupply = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const res = await connection.getTokenSupply(tokenMintAddress, commitment);
            setTokenSupply(res.value);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setTokenSupply(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTokenSupply();
        if (refetchInterval) {
            const interval = setInterval(fetchTokenSupply, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenMintAddress, commitment, refetchInterval]);

    return { data: tokenSupply, refetch: fetchTokenSupply, isLoading, error };
}

export function useLargestAccounts(
    config?: GetLargestAccountsConfig,
    { refetchInterval = null }: HookOptions = {}
): HookReturnType<RpcResponseAndContext<AccountBalancePair[]>> {
    const [largestAccounts, setLargestAccounts] = useState<RpcResponseAndContext<AccountBalancePair[]> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const { connection } = useConnection();

    const fetchLargestAccounts = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const res = await connection.getLargestAccounts(config);
            setLargestAccounts(res);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setLargestAccounts(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLargestAccounts();
        if (refetchInterval) {
            const interval = setInterval(fetchLargestAccounts, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(config), refetchInterval]);

    return { data: largestAccounts, refetch: fetchLargestAccounts, isLoading, error };
}

export function useTokenLargestAccounts(
    mintAddress: PublicKey,
    commitment?: Commitment,
    { refetchInterval = null }: HookOptions = {}
): HookReturnType<TokenAccountBalancePair[]> {
    const [tokenLargestAccounts, setTokenLargestAccounts] = useState<TokenAccountBalancePair[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const { connection } = useConnection();

    const fetchTokenLargestAccounts = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const res = await connection.getTokenLargestAccounts(mintAddress, commitment);
            setTokenLargestAccounts(res.value);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setTokenLargestAccounts(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTokenLargestAccounts();
        if (refetchInterval) {
            const interval = setInterval(fetchTokenLargestAccounts, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mintAddress, commitment, refetchInterval]);

    return { data: tokenLargestAccounts, refetch: fetchTokenLargestAccounts, isLoading, error };
}

export function useVoteAccounts(
    commitment?: Commitment,
    { refetchInterval = null }: HookOptions = {}
): HookReturnType<VoteAccountStatus> {
    const [voteAccounts, setVoteAccounts] = useState<VoteAccountStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const { connection } = useConnection();

    const fetchVoteAccounts = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const res = await connection.getVoteAccounts(commitment);
            setVoteAccounts(res);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setVoteAccounts(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchVoteAccounts();
        if (refetchInterval) {
            const interval = setInterval(fetchVoteAccounts, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [commitment, refetchInterval]);

    return { data: voteAccounts, refetch: fetchVoteAccounts, isLoading, error };
}

export function useSlotLeader(
    commitment?: Commitment,
    { refetchInterval = null }: HookOptions = {}
): HookReturnType<string> {
    const [slotLeader, setSlotLeader] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const { connection } = useConnection();

    const fetchSlotLeader = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const res = await connection.getSlotLeader(commitment);
            setSlotLeader(res);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setSlotLeader(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSlotLeader();
        if (refetchInterval) {
            const interval = setInterval(fetchSlotLeader, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [commitment, refetchInterval]);

    return { data: slotLeader, refetch: fetchSlotLeader, isLoading, error };
}

export function useSlotLeaders(
    startSlot: number,
    limit: number,
    { refetchInterval = null }: HookOptions = {}
): HookReturnType<Array<PublicKey>> {
    const [slotLeaders, setSlotLeaders] = useState<Array<PublicKey> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const { connection } = useConnection();

    const fetchSlotLeaders = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const res = await connection.getSlotLeaders(startSlot, limit);
            setSlotLeaders(res);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setSlotLeaders(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSlotLeaders();
        if (refetchInterval) {
            const interval = setInterval(fetchSlotLeaders, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [startSlot, limit, refetchInterval]);

    return { data: slotLeaders, refetch: fetchSlotLeaders, isLoading, error };
}

export function useStakeActivation(
    publicKey: PublicKey,
    commitment?: Commitment,
    epoch?: number,
    { refetchInterval = null }: HookOptions = {}
): HookReturnType<StakeActivationData> {
    const [stakeActivation, setStakeActivation] = useState<StakeActivationData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const { connection } = useConnection();

    const fetchStakeActivation = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const res = await connection.getStakeActivation(publicKey, commitment, epoch);
            setStakeActivation(res);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setStakeActivation(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStakeActivation();
        if (refetchInterval) {
            const interval = setInterval(fetchStakeActivation, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publicKey, commitment, epoch, refetchInterval]);

    return { data: stakeActivation, refetch: fetchStakeActivation, isLoading, error };
}

export function useGetProgramAccounts(
    programId: PublicKey,
    config?: GetProgramAccountsConfig,
    { refetchInterval = null }: HookOptions = {}
): HookReturnType<GetProgramAccountsResponse> {
    const [programAccounts, setProgramAccounts] = useState<GetProgramAccountsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const { connection } = useConnection();

    const fetchProgramAccounts = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const res = await connection.getProgramAccounts(programId, config);
            setProgramAccounts(res);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setProgramAccounts(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProgramAccounts();
        if (refetchInterval) {
            const interval = setInterval(fetchProgramAccounts, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [programId, JSON.stringify(config), refetchInterval]);

    return { data: programAccounts, refetch: fetchProgramAccounts, isLoading, error };
}

export function useGetParsedProgramAccounts(
    programId: PublicKey,
    config?: GetParsedProgramAccountsConfig,
    { refetchInterval = null }: HookOptions = {}
): HookReturnType<
    {
        pubkey: PublicKey;
        account: AccountInfo<ParsedAccountData | Buffer>;
    }[]
> {
    const [parsedProgramAccounts, setParsedProgramAccounts] = useState<
        | {
              pubkey: PublicKey;
              account: AccountInfo<ParsedAccountData | Buffer>;
          }[]
        | null
    >(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const { connection } = useConnection();

    const fetchParsedProgramAccounts = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const res = await connection.getParsedProgramAccounts(programId, config);
            setParsedProgramAccounts(res);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setParsedProgramAccounts(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchParsedProgramAccounts();
        if (refetchInterval) {
            const interval = setInterval(fetchParsedProgramAccounts, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [programId, JSON.stringify(config), refetchInterval]);

    return { data: parsedProgramAccounts, refetch: fetchParsedProgramAccounts, isLoading, error };
}

export function useGetBlockProduction(config?: GetBlockProductionConfig, { refetchInterval = null }: HookOptions = {}) {
    const [blockProduction, setBlockProduction] = useState<RpcResponseAndContext<
        Readonly<{
            byIdentity: Readonly<Record<string, readonly number[]>>;
            range: Readonly<{
                firstSlot: number;
                lastSlot: number;
            }>;
        }>
    > | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const { connection } = useConnection();

    const fetchBlockProduction = async () => {
        try {
            setError(null);
            setIsLoading(true);
            const res = await connection.getBlockProduction(config);
            setBlockProduction(res);
            setIsLoading(false);
        } catch (error) {
            setError(error);
            setBlockProduction(null);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBlockProduction();
        if (refetchInterval) {
            const interval = setInterval(fetchBlockProduction, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(config), refetchInterval]);

    return { data: blockProduction, refetch: fetchBlockProduction, isLoading, error };
}

export function useTokenBalance(
    walletAddress: PublicKey | null,
    tokenMintAddress: PublicKey | null,
    { refetchInterval = null }: HookOptions = {}
): HookReturnType<TokenAmount> {
    const [tokenBalance, setTokenBalance] = useState<TokenAmount | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const { connection } = useConnection();

    const fetchTokenBalance = async () => {
        if (!walletAddress || !tokenMintAddress) {
            setError(null);
            setTokenBalance(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const associatedTokenAddress = findAssociatedTokenAddress(walletAddress, tokenMintAddress);
            const balance = await connection.getTokenAccountBalance(associatedTokenAddress);
            setTokenBalance(balance.value);
        } catch (error) {
            setError(error);
            setTokenBalance(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTokenBalance();
        if (refetchInterval) {
            const interval = setInterval(fetchTokenBalance, refetchInterval);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletAddress?.toBase58(), tokenMintAddress?.toBase58(), refetchInterval]);

    return { data: tokenBalance, refetch: fetchTokenBalance, isLoading, error };
}

function findAssociatedTokenAddress(walletAddress: PublicKey, tokenMintAddress: PublicKey): PublicKey {
    return PublicKey.findProgramAddressSync(
        [walletAddress.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), tokenMintAddress.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
    )[0];
}
