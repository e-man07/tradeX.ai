import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/hooks/useWallet";
import { ThemeProvider } from "@/components/theme-provider";
import { BalanceProvider } from "@/hooks/useBalance";
import { AgentProvider } from "@/hooks/useSolanaAgent";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "tradeX",
  description: "AI-Powered On-Chain Actions for Solana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WalletProvider>
          <BalanceProvider>
            <AgentProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                enableSystem
                disableTransitionOnChange
              >
                {children}
              </ThemeProvider>
            </AgentProvider>
          </BalanceProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
