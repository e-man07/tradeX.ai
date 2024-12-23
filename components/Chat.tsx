"use client";

import { useWallet } from "@/hooks/useWallet";
import React, { useState } from "react";
import { useBalance } from "@/hooks/useBalance";
import { useSolanaAgent } from "@/hooks/useSolanaAgent";
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import ChatArea from "./chat-area"
import { ArrowUp, ArrowUpRight } from "lucide-react"


interface Message {
  id: number;
  sender: "user" | "system";
  content: string;
}

export default function Chat() {
    
  const { processTransfer, processSwap,processPumpFunToken } = useSolanaAgent();
  
    
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Have fun with kira
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Chat Season</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <section className="flex flex-col items-center justify-center h-[80vh]">
          <div className="">
            <ChatArea/>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4 px-4 ">
              <div className="flex gap-1 items-center border px-3 rounded-full text-xs">Make an onboarding form <ArrowUpRight className="w-3"/></div>
              <div className="flex gap-1 items-center border px-3 rounded-full text-xs">Build now solana <ArrowUpRight className="w-3"/></div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2 w-[400px]">
              <div className="flex gap-1 items-center border px-3 rounded-full text-xs">Swap my token to USDC <ArrowUpRight className="w-3"/></div>
              {/* <div className="flex gap-1 items-center border px-3 rounded-full text-xs">Build now solana <ArrowUpRight className="w-3"/></div> */}
          </div>
        </section>
      </SidebarInset>
    </SidebarProvider>
  )
}