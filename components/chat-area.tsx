"use client";

import { useSolanaAgent } from "@/hooks/useSolanaAgent";
import { Bot, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Message, Chat } from '@prisma/client';
import { useWallet } from "@/hooks/useWallet";
import { cn } from "@/lib/utils";
import axios from "axios";

interface ChatWithMessages extends Chat {
  messages?: Message[];
}

interface ChatAreaProps {
  currentChat: ChatWithMessages | null;
  setCurrentChat: React.Dispatch<React.SetStateAction<ChatWithMessages | null>>;
}

export function ChatArea({ currentChat, setCurrentChat }: ChatAreaProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const { pubKey } = useWallet();
  const { processSwap, processTransfer, processPumpFunToken } = useSolanaAgent();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [currentChat?.messages]);

  const createNewMessage = (content: string, sender: 'User' | 'System', metadata?: any): Message => {
    return {
      id: Math.random().toString(36).substr(2, 9), // Simple ID generation
      content,
      sender,
      chatId: currentChat?.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...metadata
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    setInputValue("");
    setIsTyping(true);

    try {
      // Create new chat if none exists
      if (!currentChat) {
        const newChat: ChatWithMessages = {
          id: Math.random().toString(36).substr(2, 9),
          title: null,
          userId: pubKey || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          isArchived: false,
          messages: []
        };
        setCurrentChat(newChat);
      }

      // Add user message
      const userMessage = createNewMessage(inputValue, 'User');
      setCurrentChat((prev: ChatWithMessages | null) => {
        if (!prev) return { messages: [userMessage], createdAt: new Date(), updatedAt: new Date(), isArchived: false } as ChatWithMessages;
        return { 
          ...prev, 
          messages: [...(prev.messages || []), userMessage]
        } as ChatWithMessages;
      });

      // Get AI response
      const result = await axios.post("/api/generate", {
        prompt: inputValue,
      });

      let signature;
      switch (result.data.response.interface) {
        case "regularPrompt":
          const systemMessage = createNewMessage(result.data.response.message.content, 'System');
          setCurrentChat((prev: ChatWithMessages | null) => {
            if (!prev) return { messages: [systemMessage], createdAt: new Date(), updatedAt: new Date(), isArchived: false } as ChatWithMessages;
            return { 
              ...prev, 
              messages: [...(prev.messages || []), systemMessage]
            } as ChatWithMessages;
          });
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
          console.error("Unexpected interface:", result.data.response.interface);
          throw new Error("Please refine your prompt!");
      }

      if (signature) {
        const signatureMessage = createNewMessage(
          `Transaction successful! Signature: ${signature}`,
          'System',
          { signature }
        );
        setCurrentChat((prev: ChatWithMessages | null) => {
          if (!prev) return { messages: [signatureMessage], createdAt: new Date(), updatedAt: new Date(), isArchived: false } as ChatWithMessages;
          return { 
            ...prev, 
            messages: [...(prev.messages || []), signatureMessage]
          } as ChatWithMessages;
        });
      }
    } catch (error: any) {
      const errorMessage = createNewMessage(`Error: ${error.message}`, 'System');
      setCurrentChat((prev: ChatWithMessages | null) => {
        if (!prev) return { messages: [errorMessage], createdAt: new Date(), updatedAt: new Date(), isArchived: false } as ChatWithMessages;
        return { 
          ...prev, 
          messages: [...(prev.messages || []), errorMessage]
        } as ChatWithMessages;
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-[70vh] bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 shadow-xl">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-800">
        <h1 className="font-semibold tracking-tight text-xl text-white text-center">
          TradeX AI Assistant
        </h1>
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatWindowRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
      >
        {currentChat?.messages?.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-2 items-start",
              message.sender === "User" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
              message.sender === "User" ? "bg-blue-500" : "bg-gray-700"
            )}>
              {message.sender === "User" ? (
                <User className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>

            {/* Message */}
            <div
              className={cn(
                "px-4 py-2 rounded-lg text-sm max-w-[80%] shadow-lg animate-slide-in break-words",
                message.sender === "User" 
                  ? "bg-blue-500 text-white rounded-tr-none ml-auto" 
                  : "bg-gray-800 text-white rounded-tl-none"
              )}
              style={{ overflowWrap: 'break-word' }}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="px-4 py-2 rounded-lg text-sm bg-gray-800 text-white">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask anything about Solana tokens..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 bg-gray-800 text-white text-sm px-4 py-3 rounded-lg outline-none border border-gray-700 focus:border-blue-500 transition-colors"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
