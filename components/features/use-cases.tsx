import { Card, CardContent } from '@/components/ui/card'
import { Users2Icon, BuildingIcon, PaletteIcon } from 'lucide-react'

const useCases = [
  {
    title: 'Influencers',
    description: 'Manage your giveaways easily and build trust with your audience',
    icon: Users2Icon,
  },
  {
    title: 'Brands',
    description: 'Boost engagement with automated and verifiable campaigns',
    icon: BuildingIcon,
  },
  {
    title: 'Creators',
    description: 'Run fair giveaways that increase participation and trust',
    icon: PaletteIcon,
  },
]

export default function UseCases() {
  return (
    <section id="use-cases" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Who Can Benefit?</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Perfect for anyone looking to engage their community with transparent giveaways
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {useCases.map((useCase, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-800">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="mb-4 inline-block p-3 bg-purple-500/20 rounded-xl">
                    <useCase.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                  <p className="text-gray-400">{useCase.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

