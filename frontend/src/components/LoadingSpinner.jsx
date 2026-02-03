const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent-blue"></div>
        <p className="text-brand-text-secondary">Loading...</p>
      </div>
    </div>
  )
}

export default LoadingSpinner