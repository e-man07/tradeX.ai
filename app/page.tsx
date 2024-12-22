// page.js
import Link from 'next/link'

export default function Home() {
  return (
    <div className="md:min-h-screen relative px-4 md:p-12 lg:p-16">
      <div className="hidden md:block absolute md:top-12 lg:top-16 left-0 right-0 h-[1px] bg-zinc-800/20 dark:bg-zinc-800" />
      <div className="hidden md:block absolute md:bottom-12 lg:bottom-16 left-0 right-0 h-[1px] bg-zinc-800/20 dark:bg-zinc-800" />
      <div className="hidden md:block absolute md:left-12 lg:left-48 top-0 bottom-0 w-[1px] bg-zinc-800/20 dark:bg-zinc-800" />
      <div className="hidden md:block absolute md:right-12 lg:right-48 top-0 bottom-0 w-[1px] bg-zinc-800/20 dark:bg-zinc-800" />
      <div className="min-h-[calc(100vh-2rem)] md:min-h-[calc(100vh-6rem)] lg:min-h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="max-w-md text-left px-4">
          <div className="mb-6">
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center shadow-lg">
          <div className="w-8 h-8 rounded-full border-2 border-white shadow-[0_0_6px_1px_rgba(255,255,255,0.6)]" />
          </div>
          </div>
          
          <h1 className="text-2xl font-medium tracking-tight mb-1">
          Simplify Solana with your <br className='md:hidden' /> all-in-one AI assistant for every action.
          </h1>
          
          <p className="text-zinc-500 mb-6">
          AI made simple for all your Solana actions
          </p>
          
          <Link 
            href="/agent"
            className="rounded-full border border-solid border-transparent transition-colors bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm px-6 py-3 font-medium"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  )
}