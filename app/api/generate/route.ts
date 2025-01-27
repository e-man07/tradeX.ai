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

type ActionResponse =
  | SwapData
  | TransferData
  | PumpFunTokenData
  | {
      error: string;
      message: string;
    };

// Initialize OpenAI client
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

    default:
      return {
        error: "Unknown function",
        message: "The function called is not recognized",
      };
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
};

export const POST = async (req: Request): Promise<Response> => {
  let formattedResponse: ActionResponse = {
    error: "No action detected",
    message:
      "Please use keywords like 'swap', 'send', or 'create' with appropriate details."+
      "Please specify what you'd like to do on Solana blockchain. You can:\n" +
      "1. Swap tokens (e.g., 'swap 1 SOL to USDC' or 'exchange 100 USDC for RAY')\n" +
      "2. Transfer tokens (e.g., 'send 0.5 SOL to <solana-address>' or 'transfer 100 USDC to <solana-address>')\n" +
      "3. Create a new SPL token (e.g., 'create token named MyToken with symbol MTK')"
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
              "Please use keywords like 'swap', 'send', or 'create' with appropriate details.",
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
