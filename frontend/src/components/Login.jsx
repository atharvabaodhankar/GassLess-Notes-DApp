import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signIn, signUp, signInWithGoogle } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
    } catch (error) {
      console.error('Auth error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Google sign in error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/logo.png" 
              alt="Gasless Notes Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-brand-text-primary mb-2">
            Gasless Notes
          </h1>
          <p className="text-brand-text-secondary">
            Web2-like experience with blockchain integrity
          </p>
        </div>

        {/* Features Card */}
        <div className="bg-brand-surface p-6 rounded-lg border border-brand-border">
          <h3 className="font-semibold text-brand-text-primary mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-brand-accent-green">rocket_launch</span>
            What makes this special:
          </h3>
          <ul className="text-sm text-brand-text-secondary space-y-2">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-accent-green rounded-full"></span>
              No MetaMask required
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-accent-green rounded-full"></span>
              No gas fees for users
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-accent-green rounded-full"></span>
              Instant note creation
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-accent-green rounded-full"></span>
              Blockchain verification
            </li>
          </ul>
        </div>

        {/* Auth Form */}
        <div className="bg-brand-surface p-6 rounded-lg border border-brand-border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-brand-text-primary mb-2">
                Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-text-secondary text-[20px]">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-brand-bg border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-accent-blue focus:border-transparent text-brand-text-primary placeholder-brand-text-secondary"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-text-secondary text-[20px]">
                  lock
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-brand-bg border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-accent-blue focus:border-transparent text-brand-text-primary placeholder-brand-text-secondary"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-text-primary text-brand-bg py-3 px-4 rounded-lg hover:bg-white focus:ring-2 focus:ring-brand-accent-blue focus:ring-offset-2 focus:ring-offset-brand-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-brand-surface text-brand-text-secondary">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-brand-border rounded-lg hover:bg-brand-surface-hover focus:ring-2 focus:ring-brand-accent-blue focus:ring-offset-2 focus:ring-offset-brand-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-brand-text-primary"
          >
            <span className="material-symbols-outlined mr-2 text-[20px]">
              account_circle
            </span>
            Sign in with Google
          </button>

          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-brand-accent-blue hover:text-blue-400 text-sm transition-colors"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 text-xs text-brand-text-secondary">
            <span className="px-2 py-1 bg-brand-surface border border-brand-border rounded">
              ERC-4337
            </span>
            <span className="px-2 py-1 bg-brand-surface border border-brand-border rounded">
              Firebase
            </span>
            <span className="px-2 py-1 bg-brand-surface border border-brand-border rounded">
              Gasless
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login