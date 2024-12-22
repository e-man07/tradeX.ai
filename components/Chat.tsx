"use client";

import { useWallet } from "@/hooks/useWallet";
import React, { useState } from "react";
import { useBalance } from "@/hooks/useBalance";
import { useSolanaAgent } from "@/hooks/useSolanaAgent";

interface Message {
  id: number;
  sender: "user" | "system";
  content: string;
}

const Chat = () => {
  const { pubKey, secKey, showKey, toggleKeyVisibility, logout } = useWallet();
  const { balance, tokens, listenForChanges, totalBalance } = useBalance();
  const { processTransfer, processSwap,processPumpFunToken } = useSolanaAgent();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user's message to the chat
    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      content: inputValue,
    };
    setMessages((prev) => [...prev, userMessage]);

    // Clear the input field
    setInputValue("");

    try {
      
      const data = {
        from: "SOL",
        to: "USDC",
        amount: "0.0001",
      };
      const signature = await processSwap(data);

      const systemMessage: Message = {
        id: Date.now(),
        sender: "system",
        content: `Swap successful! Transaction signature: ${signature}`,
      };
      setMessages((prev) => [...prev, systemMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: Date.now(),
        sender: "system",
        content: `Error: ${error.message}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      {/* Wallet Section */}
      <div className="w-1/3 bg-gray-800 p-6 border-r border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-center">Your Wallet</h1>
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Public Key:</p>
          <p className="text-base font-mono break-all mb-4">{pubKey}</p>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-400">SOL Balance:</p>
          <p className="text-lg font-semibold mb-4">{balance} SOL</p>
          <p className="text-sm text-gray-400">Total Balance:</p>
          <p className="text-lg font-semibold mb-6">${totalBalance.toFixed(2)}</p>
        </div>
        <button
          onClick={listenForChanges}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mb-4"
        >
          Refresh Tokens
        </button>
        <div className="space-y-4">
          {tokens.map((token) => (
            <div
              key={token.address}
              className="p-4 bg-gray-700 rounded-lg shadow-sm"
            >
              <p className="text-base font-semibold">{token.name}</p>
              <p className="text-sm text-gray-400">
                {new Intl.NumberFormat("en-US").format(Number(token.amount))}{" "}
                {token.symbol}
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-6">
          <button
            onClick={toggleKeyVisibility}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            {showKey ? "Hide Private Key" : "Show Private Key"}
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Chat Section */}
      <div className="w-2/3 p-6">
        <h1 className="text-4xl font-bold mb-6">Chat Section</h1>
        <div className="h-3/4 bg-gray-800 rounded-lg p-4 text-gray-300 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-4 ${
                msg.sender === "user" ? "text-right" : "text-left"
              }`}
            >
              <p
                className={`inline-block px-4 py-2 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-200"
                }`}
              >
                {msg.content}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex">
          <input
            type="text"
            className="flex-1 px-4 py-2 rounded-l-lg bg-gray-700 text-white"
            placeholder="Enter your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button
            onClick={handleSendMessage}
            className="px-6 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
