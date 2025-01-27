"use client";

import { useSolanaAgent } from "@/hooks/useSolanaAgent";
import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useChatContext } from "@/hooks/ChatContext";
import axios from "axios";
import { Message } from "@/hooks/ChatContext";

export default function ChatArea() {
  const [inputValue, setInputValue] = useState<string>("");
  const { clearMessages, setClearMessages, messages, setMessages } =
    useChatContext();
  const { processSwap, processTransfer, processPumpFunToken } =
    useSolanaAgent();

  useEffect(() => {
    if (clearMessages) {
      setMessages([]);
      setClearMessages(false);
      console.log("Messages cleared!");
    }
    console.log(messages);
  }, [clearMessages]);

  //function
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user's message to the chat
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "User",
      content: inputValue,
    };
    setMessages((prev) => [...prev, userMessage]);
    // Clear the input field
    setInputValue("");

    try {
      const result = await axios.post("/api/generate", {
        prompt: userMessage.content,
      });

      console.log("LLM Response:", result.data.response);

      let signature;

      //   Determine action based on the API response
      switch (result.data.response.interface) {
        case "regularPrompt":
          setMessages((prev) => [...prev, result.data.response.message]);
          break;
        case "SwapData":
          signature = await processSwap(result.data.response);
          break;
        case "TransferData":
          signature = await processTransfer(result.data.response);
          break;
        case "pumpFunTokenData":
          signature = await processPumpFunToken(result.data.response);
          break;
        default:
          throw new Error("Please refine your prompt!!");
      }

      if (signature) {
        // Add system response to the chat
        const systemMessage: Message = {
          id: Date.now().toString(),
          sender: "System",
          content: `Action successful! Transaction signature: ${signature}`,
        };
        setMessages((prev) => [...prev, systemMessage]);
      }
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        sender: "System",
        content: `Error: ${error.message || "An unknown error occurred."}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex w-[50vw] border flex-col rounded-lg p-4">
      <h1 className="font-semibold tracking-tight text-2xl md:text-3xl text-white text-center mb-4">
        Ask Kira to perform actions
      </h1>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto rounded-lg p-4 shadow-inner">
        {messages.map((message: Message) => (
          <div
            key={message.id}
            className={`flex mb-2 ${
              message.sender === "User" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg text-sm shadow-lg max-w-[80%] ${
                message.sender === "User"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-white"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 w-full flex items-center gap-2">
        <input
          type="text"
          placeholder="Ask Kira to perform Solana actions..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSendMessage();
            }
          }}
          className="flex-1 bg-[#1a1a1a] text-white text-sm px-4 py-2 rounded-lg outline-none"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
