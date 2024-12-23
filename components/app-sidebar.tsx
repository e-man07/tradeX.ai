"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { useBalance } from "@/hooks/useBalance";
import { RefreshCcw } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {
    balance,
    tokens,
    totalBalance,
    tokenFetchError,
    listenForChanges,
    isFetching,
  } = useBalance();
  const { pubKey } = useWallet();
  const publick = pubKey.slice(0, 5) + "..." + pubKey.slice(-5);

  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await listenForChanges();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={[{ name: "xkira" }]} />
      </SidebarHeader>

      <SidebarContent>
        <div className=" h-full max-w-md p-4 border">
          <h2 className="text-lg font-bold text-white">Chat History</h2>
        </div>
      </SidebarContent>

      <SidebarContent className="mt-[-170px]">
        <div className="w-full h-full max-w-md p-8 bg-[#131313] backdrop-blur-sm shadow-inner shadow-white/10 border-zinc-800">
          <div className="flex items-center justify-between mt-[-15px] mb-10">

            <h2 className="text-sm font-bold text-white">Wallet : {publick}</h2>
            <button
              onClick={handleRefresh}
              className=""
              disabled={isRefreshing}
            >
              <RefreshCcw
                size={16}
                className={`transition-transform duration-1000 ease-in-out ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
          <div className="p-1 rounded-lg">
            <h1 className="text-3xl text-center font-bold text-white">
              ${totalBalance.toFixed(2)}
            </h1>
            <h3 className="text-center font-bold text-gray-400">{balance}</h3>
          </div>
          <div className="pt-8 rounded-lg">
            <h2 className="text-lg font-bold text-white mb-2">Your Holdings</h2>
            {tokenFetchError ? (
              <p className="text-red-500 text-sm">{tokenFetchError}</p>
            ) : isFetching ? (
              <p className="text-gray-400 text-sm">Loading tokens...</p>
            ) : tokens.length > 0 ? (
              <ul className="space-y-4">
                {tokens.map((token, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-4 backdrop-blur-sm shadow-inner bg-[#262626] shadow-white/10 border-zinc-800 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-medium">{token.name}</p>
                      <p className="text-gray-400 text-sm">
                        {token.amount} {token.symbol}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">
                        $ {token.price.toFixed(3)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm">No tokens found.</p>
            )}
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
