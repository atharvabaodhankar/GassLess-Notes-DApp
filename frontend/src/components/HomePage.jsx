import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import TechExplainer from './TechExplainer'

const HomePage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  const handleLaunchApp = () => {
    navigate('/login')
  }

  const features = [
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Zero Gas Fees',
      description: 'Create and store notes without paying any transaction fees using ERC-4337 Account Abstraction'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'Instant Blockchain Storage',
      description: 'Your notes are instantly stored on Ethereum Sepolia with cryptographic proof of authenticity'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Decentralized & Secure',
      description: 'Notes are encrypted and stored on blockchain - no central authority can access or censor them'
    },
    {
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      title: 'Smart Wallet Integration',
      description: 'Powered by smart contracts and paymaster for seamless Web3 experience'
    }
  ]

  const techStack = [
    { 
      name: 'React', 
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.36-.034-.47 0-.92.014-1.36.034.44-.572.895-1.096 1.36-1.564zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.36.034.47 0 .92-.014 1.36-.034-.44.572-.895 1.095-1.36 1.56-.465-.467-.92-.992-1.36-1.56z"/>
        </svg>
      ), 
      color: 'text-brand-accent-green' 
    },
    { 
      name: 'Firebase', 
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5.229 4.382l3.821 3.848-.888-1.618c-.894-1.618-2.259-1.618-2.933 0l-3.821 7.305L5.229 4.382zm8.112 3.32l-1.334-2.429c-.448-.894-1.342-.894-1.79 0L5.229 4.382l6.777 12.476L18.783 7.702l-5.442-1.0zm7.305 1.618L18.783 7.702 12.006 16.858l6.777-12.476c.448-.894 1.342-.894 1.79 0l1.334 2.429-1.261 2.509z"/>
        </svg>
      ), 
      color: 'text-brand-text-secondary' 
    },
    { 
      name: 'Ethereum', 
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
        </svg>
      ), 
      color: 'text-brand-text-secondary' 
    },
    { 
      name: 'ERC-4337', 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ), 
      color: 'text-brand-accent-green' 
    },
    { 
      name: 'Solidity', 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ), 
      color: 'text-brand-text-secondary' 
    },
    { 
      name: 'Node.js', 
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.08-0.383 c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076 c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0 L3.075,6.68C2.99,6.729,2.936,6.825,2.936,6.921v10.15c0,0.097,0.054,0.189,0.139,0.235l2.409,1.392 c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v10.021 c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L2.28,18.675c-0.57-0.329-0.922-0.945-0.922-1.604V6.921 c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082c0.570,0.329,0.924,0.944,0.924,1.603 v10.15c0,0.659-0.354,1.273-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z M19.099,13.993 c0-1.9-1.284-2.406-3.987-2.763c-2.731-0.361-3.009-0.548-3.009-1.187c0-0.528,0.235-1.233,2.258-1.233 c1.807,0,2.473,0.389,2.747,1.607c0.024,0.115,0.129,0.199,0.247,0.199h1.141c0.071,0,0.138-0.031,0.186-0.081 c0.048-0.054,0.074-0.123,0.067-0.196c-0.177-2.098-1.571-3.076-4.388-3.076c-2.508,0-4.004,1.058-4.004,2.833 c0,1.925,1.488,2.457,3.895,2.695c2.88,0.282,3.103,0.703,3.103,1.269c0,0.983-0.789,1.402-2.642,1.402 c-2.327,0-2.839-0.584-3.011-1.742c-0.02-0.124-0.126-0.215-0.253-0.215h-1.137c-0.141,0-0.254,0.112-0.254,0.253 c0,1.482,0.806,3.248,4.655,3.248C17.501,17.007,19.099,15.91,19.099,13.993z"/>
        </svg>
      ), 
      color: 'text-brand-accent-green' 
    }
  ]

  const steps = [
    { 
      title: 'Connect Wallet', 
      desc: 'Sign in with Google & get your smart wallet', 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    },
    { 
      title: 'Write Note', 
      desc: 'Create your note with rich text editor', 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      )
    },
    { 
      title: 'Blockchain Magic', 
      desc: 'Note gets stored on Ethereum via paymaster', 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    { 
      title: 'Verify & Share', 
      desc: 'Get cryptographic proof of your note', 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
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
      <nav className="relative z-10 flex justify-between items-center p-4 sm:p-6 lg:px-12">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <img 
            src="/logo.png" 
            alt="Gasless Notes" 
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
          />
          <span className="text-lg sm:text-xl font-bold text-brand-text-primary">Gasless Notes</span>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base text-brand-text-secondary hover:text-brand-text-primary transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={handleGetStarted}
            className="px-4 py-2 sm:px-6 sm:py-2 text-sm sm:text-base bg-brand-text-primary hover:bg-white text-brand-bg rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-8 sm:pt-12 lg:pt-20 pb-16 sm:pb-24 lg:pb-32 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-brand-text-primary mb-4 sm:mb-6 leading-tight">
            Write Notes on
            <span className="text-brand-accent-green"> Blockchain</span>
            <br className="hidden sm:block" />
            <span className="block sm:inline text-xl sm:text-2xl md:text-3xl lg:text-5xl text-brand-text-secondary mt-2 sm:mt-0">Without Gas Fees</span>
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-brand-text-secondary max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4">
            The first decentralized note-taking app powered by ERC-4337 Account Abstraction. 
            Store your thoughts on Ethereum blockchain with zero transaction costs.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-brand-text-primary hover:bg-white text-brand-bg text-base sm:text-lg font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Start Writing Notes</span>
            </button>
            <button
              onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border border-brand-border text-brand-text-primary text-base sm:text-lg font-semibold rounded-xl hover:bg-brand-surface-hover transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>How It Works</span>
            </button>
          </div>
        </div>

        {/* Live Demo Preview */}
        <div className="relative max-w-4xl mx-auto px-4">
          <div className="bg-brand-surface/50 backdrop-blur-sm border border-brand-border rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <div className="flex space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-brand-text-secondary text-xs sm:text-sm truncate">gasless-notes.app</span>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-3 p-3 sm:p-4 bg-brand-surface rounded-lg">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-brand-surface border border-brand-border rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-brand-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-3 sm:h-4 bg-brand-border rounded w-3/4 mb-1 sm:mb-2"></div>
                  <div className="h-2 sm:h-3 bg-brand-border/50 rounded w-1/2"></div>
                </div>
                <div className="text-brand-accent-green text-xs sm:text-sm flex items-center space-x-1 flex-shrink-0">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden xs:inline sm:inline">On-chain</span>
                  <span className="xs:hidden sm:hidden">✓</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 sm:p-4 bg-brand-surface rounded-lg opacity-75">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-brand-border rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-brand-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-3 sm:h-4 bg-brand-border rounded w-2/3 mb-1 sm:mb-2"></div>
                  <div className="h-2 sm:h-3 bg-brand-border/50 rounded w-1/3"></div>
                </div>
                <div className="text-yellow-400 text-xs sm:text-sm flex items-center space-x-1 flex-shrink-0">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden xs:inline sm:inline">Processing</span>
                  <span className="xs:hidden sm:hidden">⏳</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative z-10 py-12 sm:py-16 lg:py-20 bg-brand-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-brand-text-primary mb-8 sm:mb-12 lg:mb-16">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`relative p-4 sm:p-6 bg-brand-surface border border-brand-border rounded-xl transition-all duration-500 hover:shadow-xl hover:shadow-brand-accent-green/10 hover:-translate-y-2 ${
                  currentStep === index ? 'ring-2 ring-brand-accent-green shadow-lg shadow-brand-accent-green/20' : ''
                }`}
              >
                <div className="text-brand-accent-green mb-3 sm:mb-4">{step.icon}</div>
                <h3 className="text-lg sm:text-xl font-semibold text-brand-text-primary mb-2 sm:mb-3">{step.title}</h3>
                <p className="text-sm sm:text-base text-brand-text-secondary">{step.desc}</p>
                
                {/* Step Number */}
                <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-6 h-6 sm:w-8 sm:h-8 bg-brand-text-primary text-brand-bg rounded-full flex items-center justify-center font-bold text-xs sm:text-sm">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div className="text-center p-4 sm:p-6 bg-brand-surface/50 backdrop-blur-sm border border-brand-border rounded-xl hover-lift">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-accent-green mb-1 sm:mb-2">$0</div>
              <div className="text-xs sm:text-sm text-brand-text-secondary">Gas Fees Paid</div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-brand-surface/50 backdrop-blur-sm border border-brand-border rounded-xl hover-lift">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-accent-green mb-1 sm:mb-2">100%</div>
              <div className="text-xs sm:text-sm text-brand-text-secondary">Decentralized</div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-brand-surface/50 backdrop-blur-sm border border-brand-border rounded-xl hover-lift">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-accent-green mb-1 sm:mb-2">∞</div>
              <div className="text-xs sm:text-sm text-brand-text-secondary">Storage Duration</div>
            </div>
            <div className="text-center p-4 sm:p-6 bg-brand-surface/50 backdrop-blur-sm border border-brand-border rounded-xl hover-lift">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-accent-green mb-1 sm:mb-2">&lt;2s</div>
              <div className="text-xs sm:text-sm text-brand-text-secondary">Note Creation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-brand-text-primary mb-8 sm:mb-12 lg:mb-16">
            Why Choose Gasless Notes?
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 sm:p-8 bg-brand-surface border border-brand-border rounded-xl hover:shadow-xl hover:shadow-brand-accent-green/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-brand-accent-green mb-4 sm:mb-6">{feature.icon}</div>
                <h3 className="text-xl sm:text-2xl font-semibold text-brand-text-primary mb-3 sm:mb-4">{feature.title}</h3>
                <p className="text-brand-text-secondary text-base sm:text-lg leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="relative z-10 py-12 sm:py-16 lg:py-20 bg-brand-surface/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-brand-text-primary mb-8 sm:mb-12 lg:mb-16">
            Traditional vs Gasless Notes
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Traditional */}
            <div className="p-6 sm:p-8 bg-red-900/20 border border-red-500/30 rounded-xl">
              <h3 className="text-xl sm:text-2xl font-bold text-red-400 mb-4 sm:mb-6 flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Traditional Blockchain Apps
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span className="text-brand-text-secondary text-sm sm:text-base">Pay $5-50 in gas fees per transaction</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span className="text-brand-text-secondary text-sm sm:text-base">Need to hold ETH for every action</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span className="text-brand-text-secondary text-sm sm:text-base">Complex wallet setup and management</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span className="text-brand-text-secondary text-sm sm:text-base">Slow transaction confirmations</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-red-400 mt-1">•</span>
                  <span className="text-brand-text-secondary text-sm sm:text-base">Poor user experience</span>
                </div>
              </div>
            </div>

            {/* Gasless Notes */}
            <div className="p-6 sm:p-8 bg-green-900/20 border border-green-500/30 rounded-xl">
              <h3 className="text-xl sm:text-2xl font-bold text-brand-accent-green mb-4 sm:mb-6 flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Gasless Notes
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-brand-accent-green mt-1">•</span>
                  <span className="text-brand-text-secondary text-sm sm:text-base">Completely free - $0 gas fees</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-brand-accent-green mt-1">•</span>
                  <span className="text-brand-text-secondary text-sm sm:text-base">No need to buy or hold cryptocurrency</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-brand-accent-green mt-1">•</span>
                  <span className="text-brand-text-secondary text-sm sm:text-base">Simple Google sign-in, smart wallet created automatically</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-brand-accent-green mt-1">•</span>
                  <span className="text-brand-text-secondary text-sm sm:text-base">Instant note creation and blockchain storage</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-brand-accent-green mt-1">•</span>
                  <span className="text-brand-text-secondary text-sm sm:text-base">Web2 UX with Web3 benefits</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <TechExplainer />

      {/* Tech Stack Section */}
      <section className="relative z-10 py-12 sm:py-16 lg:py-20 bg-brand-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-brand-text-primary mb-8 sm:mb-12 lg:mb-16">
            Built with Modern Tech
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {techStack.map((tech, index) => (
              <div
                key={index}
                className="p-4 sm:p-6 bg-brand-surface border border-brand-border rounded-xl text-center hover:shadow-lg hover:shadow-brand-accent-green/10 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className={`${tech.color} mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300 flex justify-center`}>{tech.icon}</div>
                <h3 className={`font-semibold text-sm sm:text-base ${tech.color} group-hover:text-brand-text-primary transition-colors`}>{tech.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-text-primary mb-4 sm:mb-6">
            Ready to Start Writing?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-brand-text-secondary mb-8 sm:mb-12 px-4 max-w-2xl mx-auto">
            Join the future of decentralized note-taking. No setup required, just sign in and start writing.
          </p>
          
          <button
            onClick={handleLaunchApp}
            className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-brand-text-primary hover:bg-white text-brand-bg text-lg sm:text-xl font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center space-x-2 mx-auto max-w-sm sm:max-w-none"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Launch App Now</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 sm:py-12 border-t border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img 
                src="/logo.png" 
                alt="Gasless Notes" 
                className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
              />
              <span className="text-brand-text-primary font-semibold text-sm sm:text-base">Gasless Notes</span>
            </div>
            
            <div className="text-brand-text-secondary text-xs sm:text-sm text-center sm:text-right">
              Powered by ERC-4337 • Built on Ethereum • Zero Gas Fees
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage