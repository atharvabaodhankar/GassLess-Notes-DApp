import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import TechExplainer from './TechExplainer'

const HomePage = () => {
  const navigate = useNavigate()
  const { user, login } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleGetStarted = async () => {
    if (user) {
      navigate('/dashboard')
    } else {
      try {
        await login()
        navigate('/dashboard')
      } catch (error) {
        console.error('Login failed:', error)
      }
    }
  }

  const features = [
    {
      icon: '🔐',
      title: 'Zero Gas Fees',
      description: 'Create and store notes without paying any transaction fees using ERC-4337 Account Abstraction'
    },
    {
      icon: '⚡',
      title: 'Instant Blockchain Storage',
      description: 'Your notes are instantly stored on Ethereum Sepolia with cryptographic proof of authenticity'
    },
    {
      icon: '🛡️',
      title: 'Decentralized & Secure',
      description: 'Notes are encrypted and stored on blockchain - no central authority can access or censor them'
    },
    {
      icon: '🔗',
      title: 'Smart Wallet Integration',
      description: 'Powered by smart contracts and paymaster for seamless Web3 experience'
    }
  ]

  const techStack = [
    { name: 'React', icon: '⚛️', color: 'text-blue-400' },
    { name: 'Firebase', icon: '🔥', color: 'text-orange-400' },
    { name: 'Ethereum', icon: '💎', color: 'text-purple-400' },
    { name: 'ERC-4337', icon: '🚀', color: 'text-green-400' },
    { name: 'Solidity', icon: '📜', color: 'text-yellow-400' },
    { name: 'Node.js', icon: '🟢', color: 'text-green-500' }
  ]

  const steps = [
    { title: 'Connect Wallet', desc: 'Sign in with Google & get your smart wallet', icon: '🔗' },
    { title: 'Write Note', desc: 'Create your note with rich text editor', icon: '✍️' },
    { title: 'Blockchain Magic', desc: 'Note gets stored on Ethereum via paymaster', icon: '⚡' },
    { title: 'Verify & Share', desc: 'Get cryptographic proof of your note', icon: '✅' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-bg via-gray-900 to-brand-surface overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-accent-green/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-accent-blue/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 lg:px-12">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-brand-accent-green to-brand-accent-blue rounded-lg flex items-center justify-center">
            <span className="text-xl font-bold text-white">G</span>
          </div>
          <span className="text-xl font-bold text-brand-text-primary">Gasless Notes</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-brand-text-secondary hover:text-brand-text-primary transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={handleGetStarted}
            className="px-6 py-2 bg-gradient-to-r from-brand-accent-green to-brand-accent-blue text-white rounded-lg hover:shadow-lg hover:shadow-brand-accent-green/25 transition-all duration-300 transform hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className={`relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-32 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-7xl font-bold text-brand-text-primary mb-6 leading-tight">
            Write Notes on
            <span className="bg-gradient-to-r from-brand-accent-green to-brand-accent-blue bg-clip-text text-transparent"> Blockchain</span>
            <br />
            <span className="text-3xl lg:text-5xl text-brand-text-secondary">Without Gas Fees</span>
          </h1>
          
          <p className="text-xl text-brand-text-secondary max-w-3xl mx-auto mb-12 leading-relaxed">
            The first decentralized note-taking app powered by ERC-4337 Account Abstraction. 
            Store your thoughts on Ethereum blockchain with zero transaction costs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-brand-accent-green to-brand-accent-blue text-white text-lg font-semibold rounded-xl hover:shadow-xl hover:shadow-brand-accent-green/30 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              🚀 Start Writing Notes
            </button>
            <button
              onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border border-brand-border text-brand-text-primary text-lg font-semibold rounded-xl hover:bg-brand-surface-hover transition-all duration-300"
            >
              📖 How It Works
            </button>
          </div>
        </div>

        {/* Live Demo Preview */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-brand-surface/50 backdrop-blur-sm border border-brand-border rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-brand-text-secondary text-sm">gasless-notes.app</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-brand-surface rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-brand-accent-green to-brand-accent-blue rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✍️</span>
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-brand-border rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-brand-border/50 rounded w-1/2"></div>
                </div>
                <div className="text-brand-accent-green text-sm">✅ On-chain</div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-brand-surface rounded-lg opacity-75">
                <div className="w-8 h-8 bg-brand-border rounded-full flex items-center justify-center">
                  <span className="text-brand-text-secondary text-sm">📝</span>
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-brand-border rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-brand-border/50 rounded w-1/3"></div>
                </div>
                <div className="text-yellow-400 text-sm">⏳ Processing</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-20 bg-brand-surface/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-center text-brand-text-primary mb-16">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative p-6 bg-brand-surface border border-brand-border rounded-xl transition-all duration-500 hover:shadow-xl hover:shadow-brand-accent-green/10 hover:-translate-y-2 ${
                  currentStep === index ? 'ring-2 ring-brand-accent-green shadow-lg shadow-brand-accent-green/20' : ''
                }`}
              >
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold text-brand-text-primary mb-3">{step.title}</h3>
                <p className="text-brand-text-secondary">{step.desc}</p>
                
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-brand-accent-green to-brand-accent-blue rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-brand-surface/50 backdrop-blur-sm border border-brand-border rounded-xl hover-lift">
              <div className="text-4xl font-bold text-brand-accent-green mb-2">$0</div>
              <div className="text-brand-text-secondary">Gas Fees Paid</div>
            </div>
            <div className="text-center p-6 bg-brand-surface/50 backdrop-blur-sm border border-brand-border rounded-xl hover-lift">
              <div className="text-4xl font-bold text-brand-accent-blue mb-2">100%</div>
              <div className="text-brand-text-secondary">Decentralized</div>
            </div>
            <div className="text-center p-6 bg-brand-surface/50 backdrop-blur-sm border border-brand-border rounded-xl hover-lift">
              <div className="text-4xl font-bold text-purple-400 mb-2">∞</div>
              <div className="text-brand-text-secondary">Storage Duration</div>
            </div>
            <div className="text-center p-6 bg-brand-surface/50 backdrop-blur-sm border border-brand-border rounded-xl hover-lift">
              <div className="text-4xl font-bold text-yellow-400 mb-2">&lt;2s</div>
              <div className="text-brand-text-secondary">Note Creation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-center text-brand-text-primary mb-16">
            Why Choose Gasless Notes?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-brand-surface border border-brand-border rounded-xl hover:shadow-xl hover:shadow-brand-accent-blue/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-5xl mb-6">{feature.icon}</div>
                <h3 className="text-2xl font-semibold text-brand-text-primary mb-4">{feature.title}</h3>
                <p className="text-brand-text-secondary text-lg leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="relative z-10 py-20 bg-brand-surface/20">
        <div className="max-w-6xl mx-auto px-6 lg:px-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-center text-brand-text-primary mb-16">
            Traditional vs Gasless Notes
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Traditional */}
            <div className="p-8 bg-red-900/20 border border-red-500/30 rounded-xl">
              <h3 className="text-2xl font-bold text-red-400 mb-6 flex items-center">
                <span className="mr-3">❌</span>
                Traditional Blockchain Apps
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span className="text-brand-text-secondary">Pay $5-50 in gas fees per transaction</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span className="text-brand-text-secondary">Need to hold ETH for every action</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span className="text-brand-text-secondary">Complex wallet setup and management</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span className="text-brand-text-secondary">Slow transaction confirmations</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span className="text-brand-text-secondary">Poor user experience</span>
                </div>
              </div>
            </div>

            {/* Gasless Notes */}
            <div className="p-8 bg-green-900/20 border border-green-500/30 rounded-xl">
              <h3 className="text-2xl font-bold text-brand-accent-green mb-6 flex items-center">
                <span className="mr-3">✅</span>
                Gasless Notes
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-brand-accent-green mt-1">•</span>
                  <span className="text-brand-text-secondary">Completely free - $0 gas fees</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-brand-accent-green mt-1">•</span>
                  <span className="text-brand-text-secondary">No need to buy or hold cryptocurrency</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-brand-accent-green mt-1">•</span>
                  <span className="text-brand-text-secondary">Simple Google sign-in, smart wallet created automatically</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-brand-accent-green mt-1">•</span>
                  <span className="text-brand-text-secondary">Instant note creation and blockchain storage</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-brand-accent-green mt-1">•</span>
                  <span className="text-brand-text-secondary">Web2 UX with Web3 benefits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <TechExplainer />

      {/* Original Tech Stack Grid */}
      <section className="relative z-10 py-20 bg-brand-surface/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-center text-brand-text-primary mb-16">
            Built with Modern Tech
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {techStack.map((tech, index) => (
              <div
                key={index}
                className="p-6 bg-brand-surface border border-brand-border rounded-xl text-center hover:shadow-lg hover:shadow-brand-accent-green/10 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{tech.icon}</div>
                <h3 className={`font-semibold ${tech.color} group-hover:text-brand-text-primary transition-colors`}>{tech.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-brand-text-primary mb-6">
            Ready to Start Writing?
          </h2>
          <p className="text-xl text-brand-text-secondary mb-12">
            Join the future of decentralized note-taking. No setup required, just sign in and start writing.
          </p>
          
          <button
            onClick={handleGetStarted}
            className="px-12 py-4 bg-gradient-to-r from-brand-accent-green to-brand-accent-blue text-white text-xl font-semibold rounded-xl hover:shadow-xl hover:shadow-brand-accent-green/30 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
          >
            🚀 Launch App Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-brand-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-brand-accent-green to-brand-accent-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <span className="text-brand-text-primary font-semibold">Gasless Notes</span>
            </div>
            
            <div className="text-brand-text-secondary text-sm">
              Powered by ERC-4337 • Built on Ethereum • Zero Gas Fees
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage