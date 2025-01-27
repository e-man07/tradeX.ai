import React, { createContext, useContext, useState } from "react";

interface ChatContextType {
  clearMessages: boolean;
  setClearMessages: React.Dispatch<React.SetStateAction<boolean>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}
export interface Message {
  id: string;
  sender: "User" | "System";
  content: string;
  chatId?: string;
}
const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  //if messages === null chatId  :
  const [clearMessages, setClearMessages] = useState<boolean>(false);

  return (
    <ChatContext.Provider
      value={{ clearMessages, setClearMessages, messages, setMessages }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
