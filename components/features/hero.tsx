import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="container mx-auto px-4 pt-20 pb-32 text-center">
      <div className="max-w-3xl mx-auto space-y-6">
        <p className="text-emerald-400 text-sm md:text-base">
          AI-Powered Solana Token Management
        </p>
        
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
        The Ultimate Tool<br />
        for Token Management
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl">
        Effortlessly manage your Solana tokens with the power of AI. Transfer, swap, and create SPL tokens with a seamless and transparent experience.


        </p>

        <div className="pt-4 space-x-4">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-6 text-lg"
          >
            <Link href="/agent"> Get Started →</Link>
           
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-800 px-8 py-6 text-lg"
          >
            Learn More
          </Button>
        </div>
      </div>
    </section>
  )
}

