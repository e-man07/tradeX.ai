"use client";

import { useWallet } from "@/hooks/useWallet";
import React, { useState } from "react";
import { useBalance } from "@/hooks/useBalance";
import { useSolanaAgent } from "@/hooks/useSolanaAgent";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList, 
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ChatArea } from "./chat-area";
import { ArrowUp, ArrowUpRight, Sparkles } from "lucide-react";
import { ChatProvider } from "@/hooks/ChatContext";
import { Message, Chat as ChatType } from '@prisma/client';

interface ChatWithMessages extends ChatType {
  messages?: Message[];
}

export default function Chat() {
  const { processTransfer, processSwap, processPumpFunToken } = useSolanaAgent();
  const [currentChat, setCurrentChat] = useState<ChatWithMessages | null>(null);

  return (
    <ChatProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-800 px-4 transition-[width,height] ease-linear">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#" className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-yellow-400" />
                      TradeX AI Assistant
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Chat Session</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          {/* Main Content */}
          <section className="flex flex-col items-center justify-between min-h-[calc(100vh-4rem)] p-4 md:p-6">
            {/* Chat Area */}
            <div className="w-full max-w-4xl mx-auto">
              <ChatArea 
                currentChat={currentChat}
                setCurrentChat={setCurrentChat}
              />
            </div>

            {/* Quick Actions */}
            <div className="w-full max-w-4xl mx-auto mt-6 space-y-3">
              <div className="flex flex-wrap justify-center gap-2">
                <QuickAction text="Create a new token" />
                <QuickAction text="Swap tokens" />
                <QuickAction text="Transfer SOL" />
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <QuickAction text="Check balance" />
                <QuickAction text="View transaction history" />
              </div>
            </div>
          </section>
        </SidebarInset>
      </SidebarProvider>
    </ChatProvider>
  );
}

function QuickAction({ text }: { text: string }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 bg-gray-800/50 rounded-full border border-gray-700 hover:bg-gray-700/50 hover:border-gray-600 transition-all duration-200">
      {text}
      <ArrowUpRight className="w-3 h-3" />
    </button>
  );
}
