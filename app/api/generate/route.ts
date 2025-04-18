import {
  FunctionCallingMode,
  FunctionDeclarationSchema,
  FunctionDeclarationsTool,
  GoogleGenerativeAI,
} from "@google/generative-ai";
import { Tool } from "@google/generative-ai";

// Define interfaces for our return types
interface SwapData {
  interface: "SwapData";
  from: string;
  to: string;
  amount: string;
}

interface TransferData {
  interface: "TransferData";
  recipient: string;
  amount: string;
  token: string;
}

interface PumpFunTokenData {
  interface: "pumpFunTokenData";
  tokenName: string;
  tokenTicker: string;
  tokenDescription: string;
  tokenImage: string;
}

interface NFTMintData {
  interface: "mintNFT";
  type: "mintNFT";
  data: {
    name: string;
    description: string;
    image: string;
    collectionMint: string;
  };
}

interface CreateCollectionData {
  interface: "createCollection";
  type: "createCollection";
  data: {
    name: string;
    symbol: string;
    description: string;
    image: string;
    royaltyBasisPoints?: number;
    creators?: Array<{
      address: string;
      percentage: number;
    }>;
  };
}

type ActionResponse =
  | SwapData
  | TransferData
  | PumpFunTokenData
  | NFTMintData
  | CreateCollectionData
  | {
      error: string;
      message: string;
    };

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(`${process.env.GEMINI_API_KEY}`);

// Define available functions
const swapTokenFunctionDeclaration = {
  name: "swapTokens",
  parameters: {
    type: "OBJECT",
    description: "Swap one token for another.",
    properties: {
      from: {
        type: "STRING",
        description: "The token to swap from.",
      },
      to: {
        type: "STRING",
        description: "The token to swap to.",
      },
      amount: {
        type: "NUMBER",
        description: "The amount of the token to swap.",
      },
    },
    required: ["from", "to", "amount"],
  },
};

const transferTokenFunctionDeclaration = {
  name: "transferTokens",
  parameters: {
    type: "OBJECT",
    description: "Transfer tokens to a recipient.",
    properties: {
      recipient: {
        type: "STRING",
        description: "The address of the recipient.",
      },
      amount: {
        type: "STRING",
        description: "The amount of tokens to transfer.",
      },
      token: {
        type: "STRING",
        description: "The token to transfer.",
      },
    },
    required: ["recipient", "amount", "token"],
  },
};

const createTokenFunctionDeclaration = {
  name: "createToken",
  parameters: {
    type: "OBJECT",
    description: "Create a new token.",
    properties: {
      tokenName: {
        type: "STRING",
        description: "The name of the token.",
      },
      tokenTicker: {
        type: "STRING",
        description: "The ticker symbol for the token.",
      },
      tokenDescription: {
        type: "STRING",
        description: "A description of the token.",
      },
      tokenImage: {
        type: "STRING",
        description: "The URL or path to the token image.",
      },
    },
    required: ["tokenName", "tokenTicker", "tokenDescription", "tokenImage"],
  },
};

const mintNFTFunctionDeclaration = {
  name: "mintNFT",
  parameters: {
    type: "OBJECT",
    description: "Mint a new NFT in an existing collection.",
    properties: {
      name: {
        type: "STRING",
        description: "The name of the NFT.",
      },
      description: {
        type: "STRING",
        description: "A description of the NFT.",
      },
      image: {
        type: "STRING",
        description: "The URL or path to the NFT image.",
      },
      collectionMint: {
        type: "STRING",
        description: "The Solana address of the collection's master NFT.",
      },
    },
    required: ["name", "description", "collectionMint"],
  },
};

const createCollectionFunctionDeclaration = {
  name: "createCollection",
  description: "Create a new NFT collection on Solana",
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "Name of the collection (max 32 chars)",
      },
      symbol: {
        type: "string",
        description: "Symbol for the collection (3-5 characters)",
      },
      description: {
        type: "string",
        description: "Description of the collection",
      },
      image: {
        type: "string",
        description: "URL or uploaded image for the collection",
      },
      royaltyBasisPoints: {
        type: "number",
        description: "Royalty percentage (e.g., 500 = 5%)",
      },
      creators: {
        type: "array",
        description: "List of creators with percentages",
        items: {
          type: "object",
          properties: {
            address: {
              type: "string",
              description: "Valid Solana address",
            },
            percentage: {
              type: "number",
              description: "Percentage share (0-100)",
            },
          },
        },
      },
    },
    required: ["name", "symbol", "description", "image"],
  },
};

// Solana address validation helper
const isSolanaAddress = (address: string): boolean => {
  // Base58 check and length validation for Solana addresses
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address);
};

// Process the function call result
function processResult(functionName: string, args: any): ActionResponse {
  switch (functionName) {
    case "swapTokens":
      return {
        interface: "SwapData",
        from: args.from,
        to: args.to,
        amount: args.amount,
      };
    case "transferTokens":
      return {
        interface: "TransferData",
        recipient: args.recipient,
        amount: args.amount,
        token: args.token,
      };
    case "createToken":
      return {
        interface: "pumpFunTokenData",
        tokenName: args.tokenName,
        tokenTicker: args.tokenTicker,
        tokenDescription: args.tokenDescription,
        tokenImage: args.tokenImage,
      };
    case "mintNFT":
      if (!isSolanaAddress(args.collectionMint)) {
        throw new Error("Invalid collection mint address");
      }
      return {
        interface: "mintNFT",
        type: "mintNFT",
        data: {
          name: args.name,
          description: args.description,
          image: args.image,
          collectionMint: args.collectionMint,
        },
      };
    case "createCollection":
        if (!args.name || !args.symbol || !args.description || !args.image) {
          throw new Error("Missing required collection parameters");
        }
        if (args.symbol.length > 5) {
          throw new Error("Collection symbol must be 3-5 characters");
        }
        
        const response = {
          interface: "createCollection",
          type: "createCollection",
          data: {
            name: args.name,
            symbol: args.symbol,
            description: args.description,
            image: args.image,
            royaltyBasisPoints: args.royaltyBasisPoints,
            creators: args.creators,
          },
        };
        
        console.log('create collection function hit', response);
        //TODO: to remove return from here
        return {
          interface: "createCollection",
          type: "createCollection",
          data: {
            name: args.name,
            symbol: args.symbol,
            description: args.description,
            image: args.image,
            royaltyBasisPoints: args.royaltyBasisPoints || undefined,
            creators: args.creators || undefined
          }
        };
    default:
        throw new Error(`Unknown function: ${functionName}`);
  }
}

//TODO: unused
const functions: Record<string, Function> = {
  swapTokens: async ({ from, to, amount }: any) => {
    return processResult("swap_tokens", { from, to, amount });
  },

  transferTokens: async ({ recipient, amount, token }: any) => {
    return processResult("transfer_tokens", { recipient, amount, token });
  },

  createToken: async ({
    tokenName,
    tokenTicker,
    tokenDescription,
    tokenImage,
  }: any) => {
    return processResult("create_token", {
      tokenName,
      tokenTicker,
      tokenDescription,
      tokenImage,
    });
  },
  mintNFT: async ({ type, data }: any) => {
    return processResult("mint_nft", { type, data });
  },
  
  createCollection: async ({ name, symbol, description, image, royaltyBasisPoints, creators }: any) => {
    return processResult("create_collection", { name, symbol, description, image, royaltyBasisPoints, creators });
  },
};

export const POST = async (req: Request): Promise<Response> => {
  let formattedResponse: ActionResponse = {
    error: "No action detected",
    message:
      "Please use keywords like 'swap', 'send', 'create', or 'mint' with appropriate details.\n" +
      "Please specify what you'd like to do on Solana blockchain. You can:\n" +
      "1. Swap tokens (e.g., 'swap 1 SOL to USDC' or 'exchange 100 USDC for RAY')\n" +
      "2. Transfer tokens (e.g., 'send 0.5 SOL to <solana-address>' or 'transfer 100 USDC to <solana-address>')\n" +
      "3. Create a new SPL token (e.g., 'create token named MyToken with symbol MTK')\n" +
      "4. Mint an NFT (e.g., 'mint NFT named MyNFT with description \"My awesome NFT\" in collection <collection-address>')",
  };

  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return new Response(
        JSON.stringify({
          error: "Prompt is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const generativeModel = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      tools: [
        {
          functionDeclarations: [
            swapTokenFunctionDeclaration,
            transferTokenFunctionDeclaration,
            createTokenFunctionDeclaration,
            mintNFTFunctionDeclaration,
            createCollectionFunctionDeclaration,
          ],
        } as FunctionDeclarationsTool,
      ],
    });

    const chat = generativeModel.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: `You are a Solana blockchain assistant that helps users with token operations. Please interpret user requests and execute the appropriate action:

          For COLLECTIONS:
          - "create a collection named Art Collection with symbol ART, imageUrl: "https://example.com/image.png", description: "A collection of digital art"
          - "create NFT collection Gaming Items with symbol GAME, imageUrl: "https://example.com/gaming.png", description: "A collection of gaming items"

          For NFT MINTING:
          - "mint NFT named CryptoArt #1 in collection <collection-address>"
          - "create NFT Pixel Warrior in collection <collection-address>"

          For SWAPS on Solana:
          - Handle common Solana tokens: SOL, USDC, RAY, SRM, etc.
          - Support both token symbols and SPL token addresses
          - Understand Solana DEX terminology (like Raydium, Orca)
          - Amounts should be in decimal format (1 SOL = 1.0)

          For TRANSFERS on Solana:
          - Validate Solana wallet addresses (Base58 format)
          - Handle SOL and SPL token transfers
          - Support formats like "send X SOL to address"
          - Ensure proper decimal places for different tokens

          For SPL TOKEN CREATION:
          - Guide users through SPL token creation process
          - Collect required metadata for token
          - Support Metaplex metadata standards
          - Handle token image storage on Arweave

          For NFT MINTING:
          - Guide users through NFT minting process
          - Collect required metadata for NFT
          - Support Metaplex metadata standards
          - Handle NFT image storage on Arweave

          Always validate:
          - Solana wallet addresses
          - Token existence on Solana
          - Proper amount formats for SOL/SPL tokens`,
            },
          ],
        },
      ],
    });

    try {
      console.log("trying to do normal conversations before!");
      //send the message to the chat for normal conversations
      const result = await chat.sendMessage(prompt);

      console.log("This is the result 1 => ", result.response.text());
      // console.log("trying to do normal conversations after!");

      const responseText = result.response.text();
      const functionCalls = result.response.functionCalls();

      //response for normal prompt 
      if (responseText) {
        return new Response(
          JSON.stringify({
            prompt: prompt,
            response: {
              interface: "regularPrompt",
              message: {
                id: Date.now(),
                sender: "system",
                content: responseText,
              },
            },
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (functionCalls) {
        const functionCall = functionCalls[0];
        formattedResponse = processResult(functionCall.name, functionCall.args);

        console.log("This is the formatted response ->", formattedResponse);

        try {
          const response2 = await chat.sendMessage([
            {
              functionResponse: {
                name: functionCalls[0].name,
                response: formattedResponse,
              },
            },
          ]);
          console.log(
            "This is the response that we are talking about ->",
            response2.response.functionCalls
          );
        } catch (err: any) {
          formattedResponse = {
            error: "No action detected",
            message:
              "Please use keywords like 'swap', 'send', 'create', or 'mint' with appropriate details.",
          };
        }
      }
    } catch (err: any) {
      console.error("Error occurred while sending message to chat:", err);
      formattedResponse = {
        error: "Internal server error",
        message:
          "An error occurred while processing your request. Please try again later.",
      };
    }

    return new Response(
      JSON.stringify({
        prompt,
        response: formattedResponse,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("Error occurred:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";

    console.log("------------------ This is hitting -------------->");
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
