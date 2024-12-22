"use client";

import { SolanaAgentKit } from "solana-agent-kit";
import { useWallet } from "./useWallet";
import {
  launchPumpFunToken,
  trade,
  transfer,
} from "solana-agent-kit/dist/tools";
import { useBalance } from "./useBalance";
import { createContext, useContext } from "react";
import { PublicKey } from "@solana/web3.js";
import { TokenListProvider } from "@solana/spl-token-registry";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

interface SwapData {
  from: string;
  to: string;
  amount: string;
}

interface TransferData {
  recipient: string;
  amount: string;
  token: string;
}
interface pumpFunTokenData {
  tokenName: string;
  tokenTicker: string;
  tokenDescription: string;
  tokenImage: string;
}

interface AgentContextProps {
  processSwap: (data: SwapData) => Promise<string>;
  processTransfer: (data: TransferData) => Promise<string>;
  processPumpFunToken: (
    data: pumpFunTokenData
  ) => Promise<{ signature: string; tokenAddress: string; metadataURI: any }>;
}

const AgentContext = createContext<AgentContextProps | null>(null);

export const AgentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { keyPair, secKey, isAuthenticated } = useWallet();
  const { tokens } = useBalance();

  // Do not initialize if the user is not authenticated
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Get token mint details from wallet
  const getTokenMintDetails = (
    symbol: string,
    amount: string
  ): {
    mint: string;
    decimal: string;
  } | null => {
    const token = tokens.find((t) => t.symbol === symbol);
    if (!token) return null;

    const availableAmount = token.amount;

    const amountToSend =
      parseFloat(amount) * Math.pow(10, parseInt(token.decimal));
    const availableInNativeUnits =
      availableAmount * Math.pow(10, parseInt(token.decimal));

    if (amountToSend > availableInNativeUnits) {
      throw new Error(
        `Insufficient ${symbol} balance. You have ${availableAmount.toFixed(
          2
        )} ${symbol}.`
      );
    }

    return {
      mint: token.mint,
      decimal: token.decimal,
    };
  };

  // Find mint address from symbol
  async function findMintAddress(symbol: string) {
    const tokenListProvider = new TokenListProvider();
    const tokenList = await tokenListProvider.resolve();
    console.log("tokenlist", tokenList);
    const tokens = tokenList.filterByChainId(101).getList(); // Mainnet chainId is 101
    const token = tokens.find((t) => t.symbol === symbol);
    return token ? token.address : null;
  }

  //Initialize agent
  const agent = new SolanaAgentKit(
    `${secKey}`,
    "https://mainnet.helius-rpc.com/?api-key=ddb0234e-0765-42fa-88e8-41825d43dbdd",
    "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"
  );

  //send transaction
  const processTransfer = async (data: TransferData): Promise<string> => {
    if (!keyPair) {
      throw new Error("Keypair is not initialized.");
    }

    const { recipient, amount, token } = data;

    try {
      if (token === "SOL") {
        const transferSignature = await transfer(
          agent,
          new PublicKey(recipient),
          Number(amount)
        );
        return transferSignature;
      } else {
        const mintDetails = getTokenMintDetails(token, amount);
        if (!mintDetails) {
          throw new Error("You don't have enough balance.");
        }
        const mintAddress = new PublicKey(mintDetails.mint);
        const reciever = new PublicKey(recipient);
        const Amount = Number(amount);

        // Ensure recipient has an associated token account
        const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
          agent.connection,
          keyPair,
          mintAddress,
          new PublicKey(recipient)
        );

        // Transfer SPL tokens
        const transferSignature = await transfer(
          agent,
          reciever,
          Amount,
          mintAddress
        );

        return transferSignature;
      }
    } catch (error: any) {
      if (error.logs) {
        console.error("Transaction logs:", error.logs);
      }
      throw new Error(`Token transfer failed: ${error.message}`);
    }
  };

  //swap transacion
  const processSwap = async (data: SwapData): Promise<string> => {
    if (!keyPair) {
      throw new Error("Keypair is not initialized.");
    }

    const { from, to, amount } = data;

    // Handle SOL directly by providing the wrapped SOL mint address
    const fromMint =
      from === "SOL"
        ? { mint: "So11111111111111111111111111111111111111112", decimal: "9" }
        : getTokenMintDetails(from, amount);
    const toMint =
      to === "SOL"
        ? "So11111111111111111111111111111111111111112"
        : await findMintAddress(to);

    console.log(fromMint, toMint);

    if (!fromMint?.mint || !toMint) {
      throw new Error("You don't have enough balance.");
    }

    try {
      // Convert amount to smallest units using the decimals of the source token
      const amountInSmallestUnits = Math.round(
        parseFloat(amount) * Math.pow(10, parseInt(fromMint.decimal))
      );

      console.log("From Mint:", fromMint);
      console.log("To Mint:", toMint);
      console.log("Amount in Smallest Units:", amountInSmallestUnits);

      // Perform the trade
      const swapSignature = await trade(
        agent,
        new PublicKey(toMint),
        amountInSmallestUnits, // Pass adjusted amount here
        new PublicKey(fromMint.mint)
      );

      return swapSignature;
    } catch (error: any) {
      throw new Error(`Token swap failed: ${error.message}`);
    }
  };

  //create token
  const processPumpFunToken = async (
    data: pumpFunTokenData
  ): Promise<{ signature: string; tokenAddress: string; metadataURI: any }> => {
    if (!keyPair) {
      throw new Error("Keypair is not initialized.");
    }

    const { tokenName, tokenTicker, tokenDescription, tokenImage } = data;

    try {
      const mintSignature = await launchPumpFunToken(
        agent,
        tokenName,
        tokenTicker,
        tokenDescription,
        tokenImage
      );
      return {
        signature: mintSignature.signature,
        tokenAddress: mintSignature.mint,
        metadataURI: mintSignature.metadataUri,
      };
    } catch (error: any) {
      throw new Error(`Token creation failed: ${error.message}`);
    }
  };

  return (
    <AgentContext.Provider
      value={{ processSwap, processTransfer, processPumpFunToken }}
    >
      {children}
    </AgentContext.Provider>
  );
};

export const useSolanaAgent = () => {
  const context = useContext(AgentContext);
  if (!context)
    throw new Error("useSolanaAgent must be used within AgentProvider");
  return context;
};
