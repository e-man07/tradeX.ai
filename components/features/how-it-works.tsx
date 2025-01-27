'use client'
import { Card, CardContent } from '@/components/ui/card'
import { RocketIcon, Share2Icon, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'

const steps = [
  {
    title: 'Set up your giveaway',
    description: 'Define rules and prizes with our AI assistant',
    icon: RocketIcon,
  },
  {
    title: 'Share the Blink link',
    description: 'Post on Twitter for maximum reach',
    icon: Share2Icon,
  },
  {
    title: 'AI selects winners',
    description: 'Fair selection with blockchain verification',
    icon: Trophy,
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 relative bg-gradient-to-b from-gray-900 to-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">How It Works</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Three simple steps to create and manage your blockchain-verified giveaways
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 overflow-hidden h-full transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="mb-4 inline-block p-3 bg-purple-500/20 rounded-full">
                      <step.icon className="w-8 h-8 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-2 text-gray-100">{step.title}</h3>
                    <p className="text-gray-400">{step.description}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

