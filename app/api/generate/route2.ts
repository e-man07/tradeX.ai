//TODO: Refine this code and replace it with route.ts
import {
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
  name: "swap_tokens",
  parameters: {
    type: "OBJECT",
    description: "Swap one token for another",
    properties: {
      from: {
        type: "STRING",
        description: "Token to swap from",
      },
      to: {
        type: "STRING",
        description: "Token to swap to",
      },
      amount: {
        type: "STRING",
        description: "Amount to swap",
      },
    },
    required: ["from", "to", "amount"],
  },
};

const transferTokenFunctionDeclaration = {
  name: "transfer_tokens",
  parameters: {
    type: "OBJECT",
    description: "Transfer tokens to a recipient",
    properties: {
      recipient: {
        type: "STRING",
        description: "Address of the recipient",
      },
      amount: {
        type: "STRING",
        description: "Amount to transfer",
      },
      token: {
        type: "STRING",
        description: "Token to transfer",
      },
    },
    required: ["recipient", "amount", "token"],
  },
};

const createTokenFunctionDeclaration = {
  name: "create_token",
  parameters: {
    type: "OBJECT",
    description: "Create a new token",
    properties: {
      tokenName: {
        type: "STRING",
        description: "Name of the token",
      },
      tokenTicker: {
        type: "STRING",
        description: "Ticker symbol for the token",
      },
      tokenDescription: {
        type: "STRING",
        description: "Description of the token",
      },
      tokenImage: {
        type: "STRING",
        description: "URL or path to token image",
      },
    },
    required: ["tokenName", "tokenTicker", "tokenDescription", "tokenImage"],
  },
};

// Process the function call result
function processResult(functionName: string, args: any): ActionResponse {
  switch (functionName) {
    case "swap_tokens":
      return {
        interface: "SwapData",
        from: args.from,
        to: args.to,
        amount: args.amount,
      };
    case "transfer_tokens":
      return {
        interface: "TransferData",
        recipient: args.recipient,
        amount: args.amount,
        token: args.token,
      };
    case "create_token":
      return {
        interface: "pumpFunTokenData",
        tokenName: args.tokenName,
        tokenTicker: args.tokenTicker,
        tokenDescription: args.tokenDescription,
        tokenImage: args.tokenImage,
      };
    default:
      return {
        error: "Unknown function",
        message: "The function called is not recognized",
      };
  }
}

//Executable function code
const functions: Record<string, Function> = {
  swap_tokens: async ({ from, to, amount }: any) => {
    return processResult("swap_tokens", { from, to, amount });
  },

  transfer_tokens: async ({ recipient, amount, token }: any) => {
    return processResult("transfer_tokens", { recipient, amount, token });
  },

  create_token: async ({
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
  let formattedResponse: ActionResponse;

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

    const chat = generativeModel.startChat();

    //send the message to the chat for normal conversations
    const result = await chat.sendMessage(prompt);

    const functionCall = result.response.functionCalls;

    if (functionCall) {
      const functionObject = functions.find(
        (func: any) => func.name === functionCall.name
      );
      if (!functionObject) {
        throw new Error(`Function ${functionCall.name} not found`);
      }
    }

    formattedResponse = processResult(
      functionCall.name,
      functionCall.arguments
    );

    // formattedResponse = processResult(functionCall.name, apiResponse);

    try {
      const response2 = await chat.sendMessage([
        {
          functionResponse: {
            name: "",
            response: formattedResponse,
          },
        },
      ]);

      console.log("This is the response that we are talking about ->", response2.response.text())
    } catch (err: any) {
      formattedResponse = {
        error: "No action detected",
        message:
          "Please use keywords like 'swap', 'send', or 'create' with appropriate details.",
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
