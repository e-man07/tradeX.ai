import OpenAi from "openai";

const openai = new OpenAi({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log("OpenAI initialized", openai);

export const POST = async (req: Request): Promise<Response> => {
  try {
    const body = await req.json();
    console.log("body -> ", body);
    const { prompt } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let formattedResponse;

    // Process prompt to determine action
    if (prompt.toLowerCase().includes("swap")) {
      const [_, from, to, amount] =
        prompt.match(/Swap (\S+) to (\S+) (\S+)/i) || [];
      if (from && to && amount) {
        formattedResponse = {
          interface: "SwapData",
          from,
          to,
          amount,
        };
      }
    } else if (prompt.toLowerCase().includes("send")) {
      const [_, amount, token, recipient] =
        prompt.match(/Send (\d+) (\S+) to (\S+)/i) || [];
      if (amount && token && recipient) {
        formattedResponse = {
          interface: "TransferData",
          recipient,
          amount,
          token,
        };
      }
    } else if (prompt.toLowerCase().includes("create")) {
      const [_, tokenName, tokenTicker, tokenDescription, tokenImage] =
        prompt.match(/Create (\S+) (\S+) "(.*?)" "(.*?)"/i) || [];
      if (tokenName && tokenTicker && tokenDescription && tokenImage) {
        formattedResponse = {
          interface: "pumpFunTokenData",
          tokenName,
          tokenTicker,
          tokenDescription,
          tokenImage,
        };
      }
    }

    if (!formattedResponse) {
      formattedResponse = {
        error: "Prompt did not match any known actions",
        message:
          "Please use keywords like 'swap', 'send', or 'create' with appropriate details.",
      };
    }

    return new Response(
      JSON.stringify({ prompt, response: formattedResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.log("Error occurred:", err);
    let errorMessage = "Unknown error";
    if (err instanceof Error) {
      errorMessage = err.message;
    }
    return new Response(
      JSON.stringify({ error: "Internal server error", message: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};