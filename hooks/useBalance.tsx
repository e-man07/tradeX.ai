"use client";

import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { createContext, useContext, useEffect, useState } from "react";
import { useWallet } from "./useWallet";
import {
  AccountLayout,
  getTokenMetadata,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";

interface BalanceContextProps {
  balance: number;
  tokens: {
    address: string;
    amount: string;
    symbol: string;
    name: string;
    uri: string | null;
  }[];
  tokenFetchError: string;
}

const BalanceContext = createContext<BalanceContextProps | null>(null);

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );
  const { pubKey, isAuthenticated, walletExists } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [tokenFetchError, setTokenFetchError] = useState<string>("");
  const [tokens, setTokens] = useState<
    {
      address: string;
      amount: string;
      symbol: string;
      name: string;
      uri: string | null;
    }[]
  >([]);

  //Get Balance in Sol
  const getBalance = async () => {
    try {
      const publicKey = new PublicKey(pubKey);
      const bal = await connection.getBalance(publicKey);
      setBalance(bal / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error("Error fetching balance:", error);
      return null;
    }
  };

  //fetch mint addresses
  const fetchAllToken = async () => {
    try {
      const tokenAccounts = await connection.getTokenAccountsByOwner(
        new PublicKey(pubKey),
        {
          programId: TOKEN_2022_PROGRAM_ID,
        }
      );

      const tokensList = await Promise.all(
        tokenAccounts.value.map(async ({ pubkey, account }) => {
          try {
            console.log("hello")
            const accountInfo = AccountLayout.decode(account.data);
            const mintAddress = new PublicKey(accountInfo.mint);
            const metadata = await getTokenMetadata(connection, mintAddress);
            const mintInfo = (await connection.getParsedAccountInfo(
              mintAddress
            )) as any;

            const decimals = mintInfo.value?.data?.parsed?.info?.decimals || 0;

            const formattedAmount = (
              BigInt(accountInfo.amount) / BigInt(10 ** decimals)
            ).toString();

            const tokenPrice = await fetch(
                `https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112`
            );

            console.log("sol price",tokenPrice)
            
              

            return {
              address: pubkey.toString(),
              amount: formattedAmount,
              symbol: metadata?.symbol,
              name: metadata?.name || "Unknown Token",
              uri: metadata?.uri || null,
            };
          } catch (metadataError) {
            console.error(
              `Error fetching metadata for account ${pubkey}:`,
              metadataError
            );
            return null;
          }
        })
      );

      const validTokens = tokensList.filter(
        (
          token
        ): token is {
          address: string;
          amount: string;
          symbol: string;
          name: string;
          uri: string | null;
        } => token !== null
      );

      setTokens(validTokens);
    } catch (err) {
      console.error("Error fetching token accounts:", err);
      setTokenFetchError("Failed to load tokens. Please try again.");
    }
  };

  useEffect(() => {
    if (isAuthenticated && pubKey && walletExists) {
      getBalance();
      fetchAllToken();
    }
  }, [isAuthenticated, walletExists]);

  return (
    <BalanceContext.Provider value={{ balance, tokens, tokenFetchError }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context)
    throw new Error("useWallet must be used within a WalletProvider");
  return context;
};
