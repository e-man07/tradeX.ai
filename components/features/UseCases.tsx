import Image from 'next/image'

const useCases = [
  {
    title: 'Influencers',
    description: 'Manage your giveaways easily',
    icon: '/icons/influencer.svg',
  },
  {
    title: 'Brands',
    description: 'Boost engagement with automated fairness',
    icon: '/icons/brand.svg',
  },
  {
    title: 'Creators',
    description: 'Build trust and increase participation',
    icon: '/icons/creator.svg',
  },
]

export default function UseCases() {
  return (
    <section id="use-cases" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Who Can Benefit?</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {useCases.map((useCase, index) => (
            <div key={index} className="text-center w-full sm:w-1/3 md:w-1/4">
              <Image
                src={useCase.icon || "/placeholder.svg"}
                alt={useCase.title}
                width={80}
                height={80}
                className="mx-auto mb-4 rounded-full border-2 border-gray-200 p-2"
              />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{useCase.title}</h3>
              <p className="text-gray-600">{useCase.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

