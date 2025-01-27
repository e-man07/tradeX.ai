import Button from './Button'

export default function CallToAction() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-500 to-green-500 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Simplify Your Giveaways?</h2>
        <p className="text-xl mb-8">Join now and experience the power of AI-driven giveaway management.</p>
        <Button href="#start-for-free" variant="white">Start for Free</Button>
      </div>
    </section>
  )
}

