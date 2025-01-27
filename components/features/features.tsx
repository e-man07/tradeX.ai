'use client'

import { Card, CardContent } from '@/components/ui/card'
import { BrainCircuitIcon, ShieldCheckIcon, UsersIcon, SparklesIcon } from 'lucide-react'
import { motion } from 'framer-motion'

const features = [
  {
    title: 'AI-Powered Automation',
    description: 'Smart tools that handle participant verification and winner selection',
    icon: BrainCircuitIcon,
  },
  {
    title: 'Blockchain Transparency',
    description: 'Every giveaway is verified and recorded on the blockchain',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Community Engagement',
    description: 'Build and grow your community with engaging giveaways',
    icon: UsersIcon,
  },
  {
    title: 'Smart Analytics',
    description: 'Track performance and optimize your giveaway strategy',
    icon: SparklesIcon,
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 relative bg-gradient-to-b from-black to-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">Why Choose Us?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Powerful features to make your giveaways successful and trustworthy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 overflow-hidden h-full transform transition-all duration-300 hover:scale-105 hover:shadow-xl group">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="mb-4 inline-block p-3 bg-blue-500/20 rounded-full transition-all duration-300 group-hover:bg-blue-500/30">
                      <feature.icon className="w-8 h-8 text-blue-400 transition-all duration-300 group-hover:text-blue-300" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-2 text-gray-100">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
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

