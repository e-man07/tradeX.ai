// TODO: To implicate these functionalities
// Devnet chainId 103 
// Mainnet chainId 101 
// Testnet chainId 102 
"use client";

import { SolanaAgentKit } from "solana-agent-kit";
import { useWallet } from "./useWallet";
import {
  launchPumpFunToken,
  trade,
  transfer,
  mintCollectionNFT,
  deploy_collection,
} from "solana-agent-kit/dist/tools";
import { useBalance } from "./useBalance";
import { createContext, useContext } from "react";
import { PublicKey } from "@solana/web3.js";
import { TokenListProvider } from "@solana/spl-token-registry";
import bs58 from 'bs58';
import { SwapData, TransferData, pumpFunTokenData, NFTMintData, CollectionData } from "@/app/types/AgenticInterface";
interface AgentContextProps {
  processSwap: (data: SwapData) => Promise<string>;
  processTransfer: (data: TransferData) => Promise<string>;
  processPumpFunToken: (
    data: pumpFunTokenData
  ) => Promise<{ signature: string; tokenAddress: string; metadataURI: any }>;
  processNFTMint: (data: NFTMintData) => Promise<{mint: PublicKey; metadata: PublicKey}>;
  processcreateCollection: (data: CollectionData) => Promise<{ collectionAddress: PublicKey; signature: string }>;

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

  /**
   * This function for getting the minting details
   * @param symbol 
   * @param amount 
   * @returns 
   */
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
    // console.log("tokenlist", tokenList);
    const tokens = tokenList.filterByChainId(103).getList(); // Devnet chainId is 103
    const token = tokens.find((t) => t.symbol === symbol);
    return token ? token.address : null;
  };

  //Initialize agent
  const agent = new SolanaAgentKit(
    `${secKey}`,
    `https://devnet.helius-rpc.com?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`,
    `${process.env.GEMINI_API_KEY}`,
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

  //TODO: to test this functionality 
  //swap transacion
  const processSwap = async (data: SwapData): Promise<string> => {
    if (!keyPair) {
      throw new Error("Keypair is not initialized.");
    }

    const { from, to, amount } = data;

    // Handle SOL directly by providing the wrapped SOL mint address
    //from 
    const fromMint =
      from === "SOL"
        ? { mint: "So11111111111111111111111111111111111111112", decimal: "9" }
        : getTokenMintDetails(from, amount);
    // to 
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

      // right now just testnet or devnet which has this chain id 102 
      //when we make it in prod we do it in mainnet which has this chain id 101 
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
      // If tokenImage is a URL, fetch the image and convert it to a File object
      let imageFile: File;
      if (typeof tokenImage === "string") {
        const imageResponse = await fetch(tokenImage);
        const imageBlob = await imageResponse.blob();
        imageFile = new File([imageBlob], "token_image.png", { type: "image/png" });
      } else if (tokenImage instanceof File) {
        // If tokenImage is already a File object, use it directly
        imageFile = tokenImage;
      } else {
        throw new Error("Invalid image file.");
      }
  
      // Create form data with both metadata and file
      const formData = new FormData();
      formData.append("name", tokenName);
      formData.append("symbol", tokenTicker);
      formData.append("description", tokenDescription);
      formData.append("showName", "true");
      formData.append("file", imageFile);
  
      // Upload to IPFS through our API route
      const response = await fetch("/api/ipfs", {
        method: "POST",
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Token creation failed:", errorData);
        throw new Error(`Token creation failed: ${errorData.error || response.statusText}`);
      }
  
      const ipfsData = await response.json();
  
      // Now launch the token with the IPFS response
      const mintSignature = await launchPumpFunToken(
        agent,
        tokenName,
        tokenTicker,
        tokenDescription,
        ipfsData.metadata.image // Use the image URL from the metadata
      );
  
      return {
        signature: mintSignature.signature,
        tokenAddress: mintSignature.mint,
        metadataURI: ipfsData.metadataUri
      };
    } catch (error: any) {
      console.error("Error in processPumpFunToken:", error);
      throw new Error(error.message || "Failed to create token");
    }

    
  };

  //TODO: to test this functionality 
  const processNFTMint = async (
    data: NFTMintData
  ): Promise<{ mint: PublicKey; metadata: PublicKey }> => {
    if (!keyPair) {
      throw new Error("Keypair is not initialized.");
    }
  
    const { name, description, image, collectionMint, symbol, attributes } = data;
  
    try {
      // Handle image upload
      let imageFile: File;
      if (typeof image === "string") {
        const imageResponse = await fetch(image);
        const imageBlob = await imageResponse.blob();
        imageFile = new File([imageBlob], "nft_image.png", { type: "image/png" });
      } else if (image instanceof File) {
        imageFile = image;
      } else {
        throw new Error("Invalid image file.");
      }
  
      // Create form data for IPFS upload
      const formData = new FormData();
      
      // Prepare metadata in Solana's NFT standard format
      const metadata = {
        name,
        symbol: symbol || "TRD", // Adding required symbol property
        description,
        image: "", // Will be updated with IPFS URL
        attributes: attributes || [],
        properties: {
          files: [{ type: "image/png", uri: "" }],
          category: "image",
          creators: [{ address: keyPair.publicKey.toString(), share: 100 }]
        }
      };
  
      formData.append("file", imageFile);
      formData.append("name", name);
      formData.append("description", description);
  
      // Upload image to IPFS first
      const imageResponse = await fetch("/api/ipfs", {
        method: "POST",
        body: formData,
      });
  
      if (!imageResponse.ok) {
        throw new Error("Failed to upload image to IPFS");
      }
  
      const imageData = await imageResponse.json();
      
      // Update metadata with IPFS image URL
      metadata.image = imageData.uri;
      metadata.properties.files[0].uri = imageData.uri;
  
      // Upload complete metadata to IPFS
      const metadataResponse = await fetch("/api/ipfs", {
        method: "POST",
        body: JSON.stringify(metadata),
        headers: {
          "Content-Type": "application/json"
        }
      });
  
      if (!metadataResponse.ok) {
        throw new Error("Failed to upload metadata to IPFS");
      }
  
      const metadataResult = await metadataResponse.json();
  
      // Now mint the NFT using the metadata URI
      const result = await mintCollectionNFT(
        agent,
        new PublicKey(collectionMint),
        {
          name,
          symbol: "TRD", // Adding required symbol property
          uri: metadataResult.uri
        },
        keyPair.publicKey
      );
  
      return result;
    } catch (error: any) {
      console.error("Error in processNFTMint:", error);
      throw new Error(error.message || "Failed to mint NFT");
    }
  };

  //TODO: to test this functionality 
  const processcreateCollection = async (
    data: CollectionData
  ): Promise<{ collectionAddress: PublicKey; signature: string }> => {
    if (!keyPair) {
      throw new Error("Keypair is not initialized.");
    }
    // console.log("data got in solana agent", data)
    try {
      // Handle image upload
      let imageFile: File;
      // Use the actual content type from the response
      if (typeof data.image === "string") {
        try {
          const imageResponse = await fetch(data.image);
          
          if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
          }
          
          const contentType = imageResponse.headers.get('content-type');
          const imageBlob = await imageResponse.blob();
          
          // Use the actual content type instead of hardcoding "image/png"
          const fileExtension = contentType?.includes('jpeg') ? 'jpg' : 
                                contentType?.includes('png') ? 'png' : 'img';
                                
          // Use a more unique filename to avoid conflicts
          const filename = `collection_image_${Date.now()}.${fileExtension}`;
          
          imageFile = new File([imageBlob], filename, { 
            type: contentType || "image/png" 
          });
        } catch (error) {
          console.error("Error processing image URL:", error);
          throw error;
        }
      } else if (data.image instanceof File) {
        imageFile = data.image;
        // console.log("Using provided File object:", imageFile.name, imageFile.type, imageFile.size);
      } else if (data.image instanceof Uint8Array) {
        imageFile = new File([data.image], "collection_image.png", {
          type: "image/png",
        });
        // console.log("Created File from Uint8Array:", imageFile.size);
      } else {
        console.error("Invalid image format:", typeof data.image);
        throw new Error("Invalid image format");
      }
  
      // Log before IPFS upload attempt
      // console.log("Image file prepared for upload:", {
      //   name: imageFile.name,
      //   type: imageFile.type,
      //   size: imageFile.size
      // });
      
      // When creating the form data
      const imageFormData = new FormData();
      imageFormData.append("file", imageFile);
      // console.log("Form data created with file");
      
      // Log the response headers and status
      const imageResponse = await fetch("/api/ipfs", {
        method: "POST",
        body: imageFormData,
      });
      // console.log("IPFS API response status:", imageResponse.status);
      // console.log("IPFS API response headers:", Object.fromEntries(imageResponse.headers.entries()));
      
      // Try to read the raw response if JSON parsing fails
      if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        console.error("IPFS API error response:", errorText);
        throw new Error(`IPFS upload failed: ${imageResponse.status} ${imageResponse.statusText}`);
      }
      
      const imageData = await imageResponse.json();
      // console.log("IPFS API response data:", imageData);
  
      // Create collection metadata
      const metadata = {
        name: data.name,
        symbol: data.symbol,
        description: data.description,
        image: imageData.uri,
        properties: {
          files: [{ type: "image/png", uri: imageData.uri }],
          category: "image",
        },
      };
  
      //TODO: to debug this function 
      const metadataResponse = await fetch("/api/ipfs", {
        method: "POST",
        body: JSON.stringify(metadata),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const metadataResult = await metadataResponse.json();
  
      // Deploy collection with metadata URI
      const result = await deploy_collection(agent, {
        name: data.name,
        uri: metadataResult.uri,
        royaltyBasisPoints: data.royaltyBasisPoints || 500,
        creators: data.creators || [
          { address: keyPair.publicKey.toString(), percentage: 100 }
        ]
      });
      console.log("----->")
      console.log("this is the result ---> ", result);
      console.log("----->")
      return {
        collectionAddress: result.collectionAddress,
        signature: bs58.encode(result.signature)
      }; 
    } catch (error: any) {
      console.error("Error in createCollection:", error);
      throw new Error(error.message || "Failed to create collection");
    }

  };
  
  return (
    <AgentContext.Provider
      value={{ processSwap, processTransfer, processPumpFunToken, processNFTMint, processcreateCollection }}
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

