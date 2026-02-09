import { useState } from 'react'

const TechExplainer = () => {
  const [activeTab, setActiveTab] = useState(0)

  const techDetails = [
    {
      title: 'ERC-4337 Account Abstraction',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
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
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
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
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
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
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
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
    <section className="relative z-10 py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-brand-surface/20 to-brand-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text-primary mb-4 sm:mb-6 px-4">
            The Technology Behind
            <span className="text-brand-accent-green block mt-1 sm:mt-2">Gasless Notes</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-brand-text-secondary max-w-3xl mx-auto px-4">
            Built on cutting-edge Web3 infrastructure to deliver a seamless, gasless experience
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 px-4 max-w-2xl mx-auto sm:max-w-none">
          {techDetails.map((tech, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`w-full sm:w-auto px-4 sm:px-4 lg:px-6 py-4 sm:py-3 rounded-xl font-semibold transition-all duration-300 flex items-center sm:flex-col sm:items-center justify-start sm:justify-center space-x-3 sm:space-x-0 sm:space-y-1 text-sm sm:text-sm lg:text-base min-h-[56px] sm:min-h-[44px] ${
                activeTab === index
                  ? 'bg-brand-text-primary text-brand-bg'
                  : 'bg-brand-surface border border-brand-border text-brand-text-secondary hover:text-brand-text-primary hover:border-brand-accent-green/50'
              }`}
            >
              <span className="text-current w-5 h-5 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0">{tech.icon}</span>
              <span className="text-left sm:text-center leading-tight font-medium">
                {tech.title}
              </span>
            </button>
          ))}
        </div>

        {/* Active Tab Content */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-brand-surface border border-brand-border rounded-xl sm:rounded-2xl p-6 sm:p-6 lg:p-8 hover-lift">
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
              <div className={`w-12 h-12 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-brand-surface border border-brand-border rounded-xl flex items-center justify-center text-brand-accent-green flex-shrink-0 mx-auto sm:mx-0`}>
                <span className="w-6 h-6 sm:w-6 sm:h-6 lg:w-8 lg:h-8">{techDetails[activeTab].icon}</span>
              </div>
              
              <div className="flex-1 w-full text-center sm:text-left">
                <h3 className="text-xl sm:text-xl lg:text-2xl font-bold text-brand-text-primary mb-3 sm:mb-3">
                  {techDetails[activeTab].title}
                </h3>
                <p className="text-base sm:text-base lg:text-lg text-brand-text-secondary mb-6 sm:mb-6">
                  {techDetails[activeTab].description}
                </p>
                
                <div className="grid grid-cols-1 gap-4 sm:gap-4">
                  {techDetails[activeTab].details.map((detail, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-4 sm:p-4 bg-brand-bg/50 rounded-lg animate-slide-in-up text-left"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="w-1.5 h-1.5 bg-brand-accent-green rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-brand-text-secondary text-sm sm:text-sm lg:text-base">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture Diagram */}
        <div className="mt-12 sm:mt-16">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-brand-text-primary mb-8 sm:mb-12 px-4">
            System Architecture
          </h3>
          
          <div className="relative max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Frontend */}
              <div className="bg-brand-surface border border-brand-border rounded-xl p-6 sm:p-6 hover-lift">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 sm:w-12 sm:h-12 bg-brand-surface border border-brand-border rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 sm:w-6 sm:h-6 text-brand-accent-green" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5.016 20.5l.858-15.068L13.5 1.5l2.484 3.932 3.016 14.068-7 4z"/>
                      <path d="M13.5 1.5L8.558 9.316l-1.558-2.816L13.5 1.5z" opacity="0.6"/>
                      <path d="M13.5 1.5l7.5 18-7 4-7.5-18L13.5 1.5z" opacity="0.2"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-lg sm:text-xl font-semibold text-brand-text-primary">Frontend</h4>
                    <p className="text-brand-text-secondary text-sm sm:text-sm">React + Firebase + Tailwind</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm sm:text-sm text-brand-text-secondary">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-brand-accent-green rounded-full flex-shrink-0"></div>
                    <span>Firebase Authentication</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-brand-accent-green rounded-full flex-shrink-0"></div>
                    <span>Real-time UI Updates</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-brand-accent-green rounded-full flex-shrink-0"></div>
                    <span>Responsive Design</span>
                  </div>
                </div>
              </div>

              {/* Backend */}
              <div className="bg-brand-surface border border-brand-border rounded-xl p-6 sm:p-6 hover-lift">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 sm:w-12 sm:h-12 bg-brand-surface border border-brand-border rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 sm:w-6 sm:h-6 text-brand-accent-green" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.08-0.383 c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076 c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0 L3.075,6.68C2.99,6.729,2.936,6.825,2.936,6.921v10.15c0,0.097,0.054,0.189,0.139,0.235l2.409,1.392 c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v10.021 c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L2.28,18.675c-0.57-0.329-0.922-0.945-0.922-1.604V6.921 c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082c0.570,0.329,0.924,0.944,0.924,1.603 v10.15c0,0.659-0.354,1.273-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z M19.099,13.993 c0-1.9-1.284-2.406-3.987-2.763c-2.731-0.361-3.009-0.548-3.009-1.187c0-0.528,0.235-1.233,2.258-1.233 c1.807,0,2.473,0.389,2.747,1.607c0.024,0.115,0.129,0.199,0.247,0.199h1.141c0.071,0,0.138-0.031,0.186-0.081 c0.048-0.054,0.074-0.123,0.067-0.196c-0.177-2.098-1.571-3.076-4.388-3.076c-2.508,0-4.004,1.058-4.004,2.833 c0,1.925,1.488,2.457,3.895,2.695c2.88,0.282,3.103,0.703,3.103,1.269c0,0.983-0.789,1.402-2.642,1.402 c-2.327,0-2.839-0.584-3.011-1.742c-0.02-0.124-0.126-0.215-0.253-0.215h-1.137c-0.141,0-0.254,0.112-0.254,0.253 c0,1.482,0.806,3.248,4.655,3.248C17.501,17.007,19.099,15.91,19.099,13.993z"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-lg sm:text-xl font-semibold text-brand-text-primary">Backend</h4>
                    <p className="text-brand-text-secondary text-sm sm:text-sm">Node.js + Express + ERC-4337</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm sm:text-sm text-brand-text-secondary">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-brand-accent-green rounded-full flex-shrink-0"></div>
                    <span>Paymaster Integration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-brand-accent-green rounded-full flex-shrink-0"></div>
                    <span>UserOperation Bundling</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-brand-accent-green rounded-full flex-shrink-0"></div>
                    <span>Smart Contract Calls</span>
                  </div>
                </div>
              </div>

              {/* Blockchain */}
              <div className="bg-brand-surface border border-brand-border rounded-xl p-6 sm:p-6 hover-lift sm:col-span-2 lg:col-span-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 sm:w-12 sm:h-12 bg-brand-surface border border-brand-border rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 sm:w-6 sm:h-6 text-brand-accent-green" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-lg sm:text-xl font-semibold text-brand-text-primary">Blockchain</h4>
                    <p className="text-brand-text-secondary text-sm sm:text-sm">Ethereum Sepolia + Smart Contracts</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm sm:text-sm text-brand-text-secondary">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-brand-accent-green rounded-full flex-shrink-0"></div>
                    <span>NotesRegistry Contract</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-brand-accent-green rounded-full flex-shrink-0"></div>
                    <span>EntryPoint (ERC-4337)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-brand-accent-green rounded-full flex-shrink-0"></div>
                    <span>Paymaster Contract</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Lines */}
            <div className="hidden md:flex justify-center items-center mt-6 sm:mt-8 space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-brand-accent-green rounded-full"></div>
                <div className="w-16 h-0.5 bg-brand-border"></div>
                <div className="w-3 h-3 bg-brand-accent-green rounded-full"></div>
                <div className="w-16 h-0.5 bg-brand-border"></div>
                <div className="w-3 h-3 bg-brand-accent-green rounded-full"></div>
              </div>
            </div>
            
            <div className="text-center mt-4 sm:mt-6">
              <p className="text-brand-text-secondary text-xs sm:text-sm px-4">
                Seamless integration between Web2 and Web3 technologies
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TechExplainer