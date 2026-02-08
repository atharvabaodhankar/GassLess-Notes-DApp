import { useState } from 'react'

const TechExplainer = () => {
  const [activeTab, setActiveTab] = useState(0)

  const techDetails = [
    {
      title: 'ERC-4337 Account Abstraction',
      icon: '🚀',
      description: 'Revolutionary Ethereum standard that enables gasless transactions',
      details: [
        'Smart contract wallets instead of traditional EOAs',
        'Paymaster contracts sponsor your transaction fees',
        'Bundler services batch and execute operations',
        'No need to hold ETH for gas fees'
      ],
      color: 'from-green-400 to-blue-500'
    },
    {
      title: 'Smart Contract Architecture',
      icon: '📜',
      description: 'Decentralized storage with cryptographic verification',
      details: [
        'NotesRegistry contract stores note hashes on-chain',
        'Immutable proof of note creation and ownership',
        'Content verification through cryptographic hashing',
        'Deployed on Ethereum Sepolia testnet'
      ],
      color: 'from-purple-400 to-pink-500'
    },
    {
      title: 'Hybrid Storage System',
      icon: '🔄',
      description: 'Best of both worlds: speed and decentralization',
      details: [
        'Firebase for fast note content and user management',
        'Blockchain for immutable proof and verification',
        'Encrypted content with client-side hashing',
        'Real-time sync across all devices'
      ],
      color: 'from-orange-400 to-red-500'
    },
    {
      title: 'Zero-Knowledge Privacy',
      icon: '🛡️',
      description: 'Your notes are private by design',
      details: [
        'Only content hashes stored on blockchain',
        'Full note content encrypted in Firebase',
        'You control your data with Web3 authentication',
        'No central authority can read your notes'
      ],
      color: 'from-cyan-400 to-blue-600'
    }
  ]

  return (
    <section className="relative z-10 py-20 bg-gradient-to-b from-brand-surface/20 to-brand-bg">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-brand-text-primary mb-6">
            The Technology Behind
            <span className="animate-gradient block mt-2">Gasless Notes</span>
          </h2>
          <p className="text-xl text-brand-text-secondary max-w-3xl mx-auto">
            Built on cutting-edge Web3 infrastructure to deliver a seamless, gasless experience
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {techDetails.map((tech, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === index
                  ? 'bg-gradient-to-r from-brand-accent-green to-brand-accent-blue text-white shadow-lg'
                  : 'bg-brand-surface border border-brand-border text-brand-text-secondary hover:text-brand-text-primary hover:border-brand-accent-green/50'
              }`}
            >
              <span className="mr-2">{tech.icon}</span>
              {tech.title}
            </button>
          ))}
        </div>

        {/* Active Tab Content */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-8 hover-lift">
            <div className="flex items-start space-x-6">
              <div className={`w-16 h-16 bg-gradient-to-r ${techDetails[activeTab].color} rounded-xl flex items-center justify-center text-2xl animate-glow`}>
                {techDetails[activeTab].icon}
              </div>
              
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-brand-text-primary mb-3">
                  {techDetails[activeTab].title}
                </h3>
                <p className="text-lg text-brand-text-secondary mb-6">
                  {techDetails[activeTab].description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {techDetails[activeTab].details.map((detail, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-4 bg-brand-bg/50 rounded-lg animate-slide-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="w-2 h-2 bg-brand-accent-green rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-brand-text-secondary">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture Diagram */}
        <div className="mt-16">
          <h3 className="text-3xl font-bold text-center text-brand-text-primary mb-12">
            System Architecture
          </h3>
          
          <div className="relative max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Frontend */}
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl animate-float">
                  ⚛️
                </div>
                <h4 className="text-xl font-semibold text-brand-text-primary mb-2">Frontend</h4>
                <p className="text-brand-text-secondary text-sm">React + Vite + Tailwind CSS</p>
                <div className="mt-4 space-y-2 text-xs text-brand-text-secondary">
                  <div>• Firebase Authentication</div>
                  <div>• Real-time UI Updates</div>
                  <div>• Responsive Design</div>
                </div>
              </div>

              {/* Backend */}
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl animate-float" style={{ animationDelay: '1s' }}>
                  🟢
                </div>
                <h4 className="text-xl font-semibold text-brand-text-primary mb-2">Backend</h4>
                <p className="text-brand-text-secondary text-sm">Node.js + Express + ERC-4337</p>
                <div className="mt-4 space-y-2 text-xs text-brand-text-secondary">
                  <div>• Paymaster Integration</div>
                  <div>• UserOperation Bundling</div>
                  <div>• Smart Contract Calls</div>
                </div>
              </div>

              {/* Blockchain */}
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl animate-float" style={{ animationDelay: '2s' }}>
                  💎
                </div>
                <h4 className="text-xl font-semibold text-brand-text-primary mb-2">Blockchain</h4>
                <p className="text-brand-text-secondary text-sm">Ethereum Sepolia + Smart Contracts</p>
                <div className="mt-4 space-y-2 text-xs text-brand-text-secondary">
                  <div>• NotesRegistry Contract</div>
                  <div>• EntryPoint (ERC-4337)</div>
                  <div>• Paymaster Contract</div>
                </div>
              </div>
            </div>

            {/* Connection Lines */}
            <div className="hidden md:block absolute top-1/2 left-1/3 w-1/3 h-0.5 bg-gradient-to-r from-brand-accent-green to-brand-accent-blue transform -translate-y-1/2"></div>
            <div className="hidden md:block absolute top-1/2 right-1/3 w-1/3 h-0.5 bg-gradient-to-r from-brand-accent-green to-brand-accent-blue transform -translate-y-1/2"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TechExplainer