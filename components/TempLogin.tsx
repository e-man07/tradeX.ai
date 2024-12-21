'use client'

import { Apple, Mail, Lock } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CircuitPattern from './Circuit'
import { useState } from 'react'

export default function TempLogin() {
  const [sign, setSign] = useState(true)

  const toggleMode = () => setSign(!sign)

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden px-4">
      {/* <CircuitPattern/> */}

      {
        !sign ? <div className="w-full max-w-md p-8 rounded-lg bg-[#131313] backdrop-blur-sm shadow-inner shadow-white/10 border-zinc-800">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center shadow-lg">
              <div className="w-8 h-8 rounded-full border-2 border-white shadow-[0_0_6px_1px_rgba(255,255,255,0.6)]" />
            </div>
          </div>

          {/* Welcome Text */}
          <h1 className="text-2xl font-semibold text-white text-center mb-2 text-shadow">Get Started</h1>
          <p className="text-zinc-400 text-sm md:text-base text-center mb-6">
            Enter your details to sign up and <br className='block md:hidden' /> get your wallet.
          </p>

          {/* Form */}
          <form className="space-y-4">
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                type="email"
                placeholder="email address"
                className="pl-10 text-sm border-none text-white placeholder:text-zinc-500 shadow-sm shadow-zinc-900/95"
              />
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                type="password"
                placeholder="Password"
                className="pl-10 text-sm border-none text-white placeholder:text-zinc-500 shadow-sm shadow-zinc-900/95"
              />
            </div>
            <Button className="w-full shadow-inner shadow-black/30 transition-all duration-300">
              Create Wallet
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-zinc-700" />
            <span className="px-4 text-sm text-zinc-500">OR</span>
            <div className="flex-1 border-t border-zinc-700" />
          </div>
          <Button onClick={toggleMode} className="w-full shadow-inner shadow-white/10 hover:shadow-none" variant={"outline"}>
            Sign in
          </Button>
          <div>

          </div>
        </div> : <div className="w-full max-w-md p-8 rounded-lg bg-[#131313] backdrop-blur-sm shadow-inner shadow-white/10 border-zinc-800">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center shadow-lg">
              <div className="w-8 h-8 rounded-full border-2 border-white shadow-[0_0_6px_1px_rgba(255,255,255,0.6)]" />
            </div>
          </div>

          {/* Welcome Text */}
          <h1 className="text-2xl font-semibold text-white text-center mb-2 text-shadow">Welcome Back</h1>
          <p className="text-zinc-400 text-sm md:text-base text-center mb-6">
            Enter your details to sign up and <br className='block md:hidden' /> get your wallet.
          </p>

          {/* Form */}
          <form className="space-y-4">
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                type="email"
                placeholder="email address"
                className="pl-10 text-sm border-none text-white placeholder:text-zinc-500 shadow-sm shadow-zinc-900/95"
              />
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <Input
                type="password"
                placeholder="Password"
                className="pl-10 text-sm border-none text-white placeholder:text-zinc-500 shadow-sm shadow-zinc-900/95"
              />
            </div>
            <Button className="w-full shadow-inner shadow-black/30 transition-all duration-300">
              Sign in
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-zinc-700" />
            <span className="px-4 text-sm text-zinc-500">OR</span>
            <div className="flex-1 border-t border-zinc-700" />
          </div>
          <Button onClick={toggleMode} className="w-full shadow-inner shadow-white/10 hover:shadow-none" variant={"outline"}>
            Create new wallet
          </Button>
          <div>

          </div>
        </div>
      }

    </div>
  )
}

function BackgroundPattern() {
  return (
    <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0H160L0 160V0Z" fill="#1a1a1a" />
      <circle cx="200" cy="20" r="4" fill="#333" />
      <circle cx="240" cy="20" r="4" fill="#333" />
      <circle cx="280" cy="20" r="4" fill="#333" />
      <circle cx="320" cy="20" r="4" fill="#333" />
      <circle cx="360" cy="20" r="4" fill="#333" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
      <path fill="currentColor" d="M12 22q-2.075 0-3.9-.788t-3.175-2.137q-1.35-1.35-2.137-3.175T2 12q0-2.075.788-3.9t2.137-3.175q1.35-1.35 3.175-2.137T12 2q2.075 0 3.9.788t3.175 2.137q1.35 1.35 2.138 3.175T22 12q0 2.075-.788 3.9t-2.137 3.175q-1.35 1.35-3.175 2.138T12 22" />
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
      <path fill="currentColor" d="M18.205 2.25h3.308l-7.227 8.26l8.502 11.24H16.13l-5.214-6.817L4.95 21.75H1.64l7.73-8.835L1.215 2.25H8.04l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z" />
    </svg>
  )
}

