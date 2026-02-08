import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { notesService, walletService, recoverStuckTransactions, checkNoteTransactionStatus } from '../services/firebaseService'
import { buildApiUrl, API_ENDPOINTS } from '../utils/apiConfig'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user, userProfile, logout } = useAuth()
  const [notes, setNotes] = useState([])
  const [walletInfo, setWalletInfo] = useState(null)
  const [paymasterStatus, setPaymasterStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [checkingStatus, setCheckingStatus] = useState(false)

  useEffect(() => {
    loadDashboardData()
    
    // Recover any stuck transactions on load
    recoverStuckTransactions()
    
    // Set up real-time listener for notes
    const unsubscribe = notesService.subscribeToNotes((updatedNotes) => {
      setNotes(updatedNotes)
      // Check for pending notes that might need status updates
      checkPendingNotesStatus(updatedNotes)
    })

    return () => unsubscribe()
  }, [])

  // Function to check and update pending notes status
  const checkPendingNotesStatus = async (notesList) => {
    const pendingNotes = notesList.filter(note => 
      note.onChainStatus === 'pending' && 
      note.createdAt && 
      // Only check notes that are older than 1 minute (likely completed)
      (Date.now() - note.createdAt.toDate().getTime()) > 60000
    )

    if (pendingNotes.length > 0) {
      console.log(`🔍 Checking status for ${pendingNotes.length} pending notes...`)
      
      for (const note of pendingNotes) {
        try {
          // Check if the note was actually registered on blockchain
          const url = buildApiUrl(API_ENDPOINTS.NOTES_VERIFY);
          if (!url) {
            console.warn('Backend not configured - skipping verification');
            continue;
          }
          
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              noteId: note.id,
              expectedHash: note.contentHash
            })
          })
          
          const verificationResult = await response.json()
          
          if (verificationResult.verified) {
            // Note is actually confirmed on blockchain, update Firestore
            console.log(`✅ Found confirmed note ${note.id}, updating status...`)
            
            await notesService.updateNoteStatus(note.docId, {
              onChainStatus: 'confirmed',
              // We don't have the exact transaction hash, but we know it's confirmed
              verifiedAt: new Date()
            })
          }
        } catch (error) {
          console.error(`Error checking note ${note.id}:`, error)
        }
      }
    }
  }

  // Function to manually check all pending notes
  const handleRefreshStatus = async () => {
    setCheckingStatus(true)
    try {
      const pendingNotes = notes.filter(note => ['pending', 'processing'].includes(note.onChainStatus))
      
      if (pendingNotes.length === 0) {
        toast.success('No pending notes to check')
        return
      }

      toast.loading(`Checking ${pendingNotes.length} pending notes...`)
      
      let updatedCount = 0
      for (const note of pendingNotes) {
        try {
          const url = buildApiUrl(API_ENDPOINTS.NOTES_VERIFY);
          if (!url) {
            console.warn('Backend not configured - skipping verification');
            continue;
          }
          
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              noteId: note.id,
              expectedHash: note.contentHash
            })
          })
          
          const verificationResult = await response.json()
          
          if (verificationResult.verified) {
            await notesService.updateNoteStatus(note.docId, {
              onChainStatus: 'confirmed',
              verifiedAt: new Date()
            })
            updatedCount++
          }
        } catch (error) {
          console.error(`Error checking note ${note.id}:`, error)
        }
      }
      
      toast.dismiss()
      if (updatedCount > 0) {
        toast.success(`Updated ${updatedCount} notes to confirmed status!`)
      } else {
        toast('All pending notes are still processing on blockchain', {
          icon: 'ℹ️'
        })
      }
      
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to check note status')
      console.error('Error refreshing status:', error)
    } finally {
      setCheckingStatus(false)
    }
  }

  const handleRefreshSingleNote = async (noteId) => {
    try {
      toast.loading('Checking blockchain status...')
      
      const result = await checkNoteTransactionStatus(noteId)
      
      toast.dismiss()
      if (result === 'confirmed') {
        toast.success('✅ Transaction confirmed! Note verified on blockchain.')
      } else if (result === 'retrying') {
        toast('🔄 Retrying blockchain registration...', {
          icon: '🔄'
        })
      } else if (result === 'failed') {
        toast('❌ Transaction could not be verified on blockchain.', {
          icon: '❌'
        })
      } else {
        toast('Transaction is still processing. Please try again later.', {
          icon: 'ℹ️'
        })
      }
      
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to check transaction status')
      console.error('Error checking single note:', error)
    }
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Get blockchain status URL
      const blockchainUrl = buildApiUrl(API_ENDPOINTS.BLOCKCHAIN_STATUS);
      
      const [notesData, walletData, blockchainStatus] = await Promise.all([
        notesService.getNotes(),
        walletService.getWalletInfo(),
        blockchainUrl ? 
          fetch(blockchainUrl).then(res => res.json()).catch(() => null) : 
          Promise.resolve({ status: 'mock', network: 'disabled' })
      ])
      
      setNotes(notesData)
      setWalletInfo(walletData)
      setPaymasterStatus(blockchainStatus?.paymaster || null)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return 'check_circle'
      case 'pending':
        return 'schedule'
      case 'processing':
        return 'sync'
      case 'failed':
        return 'error'
      default:
        return 'schedule'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-brand-accent-green bg-brand-accent-green/10'
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10'
      case 'processing':
        return 'text-blue-400 bg-blue-400/10'
      case 'failed':
        return 'text-red-400 bg-red-400/10'
      default:
        return 'text-brand-text-secondary bg-brand-surface'
    }
  }

  const handleSaveNote = async (noteData) => {
    try {
      if (editingNote) {
        await notesService.updateNote(editingNote.docId, noteData)
        toast.success('Note updated successfully!')
      } else {
        await notesService.createNote(noteData)
        toast.success('Note created! Blockchain verification in progress...')
      }
      
      setShowCreateModal(false)
      setEditingNote(null)
    } catch (error) {
      console.error('Failed to save note:', error)
      toast.error('Failed to save note')
    }
  }

  const handleDeleteNote = async (docId, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return
    
    try {
      await notesService.deleteNote(docId)
      toast.success('Note deleted successfully!')
    } catch (error) {
      console.error('Failed to delete note:', error)
      toast.error('Failed to delete note')
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-accent-blue"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Navigation */}
      <nav className="border-b border-brand-border bg-brand-bg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <img 
                  src="/logo.png" 
                  alt="Gasless Notes Logo" 
                  className="w-8 h-8 object-contain"
                />
                <span className="text-lg font-semibold tracking-tight text-brand-text-primary">
                  Gasless Notes
                </span>
              </div>
              <div className="hidden sm:flex items-center space-x-3">
                <span className="px-2.5 py-0.5 bg-brand-surface text-brand-text-secondary text-[10px] font-medium rounded border border-brand-border uppercase tracking-widest">
                  ERC-4337
                </span>
                <span className="px-2.5 py-0.5 bg-brand-surface text-brand-accent-green text-[10px] font-medium rounded border border-brand-border flex items-center gap-1.5 uppercase tracking-widest">
                  <span className="w-1 h-1 rounded-full bg-brand-accent-green"></span>
                  Firebase Live
                </span>
                {paymasterStatus && (
                  <span className={`px-2.5 py-0.5 bg-brand-surface text-[10px] font-medium rounded border border-brand-border flex items-center gap-1.5 uppercase tracking-widest ${
                    paymasterStatus.status === 'low' ? 'text-red-400' : 'text-brand-accent-green'
                  }`}>
                    <span className={`w-1 h-1 rounded-full ${
                      paymasterStatus.status === 'low' ? 'bg-red-400' : 'bg-brand-accent-green'
                    }`}></span>
                    Paymaster {paymasterStatus.balance?.toFixed(3)}Ξ
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-mono text-brand-text-secondary bg-brand-surface px-2 py-0.5 rounded">
                  {walletInfo?.address?.slice(0, 6)}...{walletInfo?.address?.slice(-4)}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center text-brand-text-secondary hover:text-brand-text-primary transition-colors text-sm font-medium gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-medium mb-1.5 text-brand-text-primary">
            Dashboard Overview
          </h1>
          <p className="text-brand-text-secondary text-sm">
            Blockchain-verified notes with gasless execution via account abstraction.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <div className="bg-brand-surface p-6 rounded-lg border border-transparent">
            <div className="text-[11px] font-medium text-brand-text-secondary uppercase tracking-widest mb-2">
              Total Notes
            </div>
            <div className="text-2xl font-medium">{notes.length}</div>
          </div>
          
          <div className="bg-brand-surface p-6 rounded-lg border border-transparent">
            <div className="text-[11px] font-medium text-brand-text-secondary uppercase tracking-widest mb-2">
              Verified
            </div>
            <div className="text-2xl font-medium text-brand-accent-green">
              {notes.filter(n => n.onChainStatus === 'confirmed').length}
            </div>
          </div>
          
          <div className="bg-brand-surface p-6 rounded-lg border border-transparent">
            <div className="text-[11px] font-medium text-brand-text-secondary uppercase tracking-widest mb-2">
              Processing
            </div>
            <div className="text-2xl font-medium text-blue-400">
              {notes.filter(n => n.onChainStatus === 'processing').length}
            </div>
          </div>
          
          <div className="bg-brand-surface p-6 rounded-lg border border-transparent">
            <div className="text-[11px] font-medium text-brand-text-secondary uppercase tracking-widest mb-2">
              Pending
            </div>
            <div className="text-2xl font-medium">
              {notes.filter(n => n.onChainStatus === 'pending').length}
            </div>
          </div>
          
          {paymasterStatus && (
            <div className="bg-brand-surface p-6 rounded-lg border border-transparent">
              <div className="text-[11px] font-medium text-brand-text-secondary uppercase tracking-widest mb-2">
                Paymaster Balance
              </div>
              <div className={`text-2xl font-medium ${
                paymasterStatus.status === 'low' ? 'text-red-400' : 'text-brand-accent-green'
              }`}>
                {paymasterStatus.balance?.toFixed(3)}Ξ
              </div>
              <div className="text-[10px] text-brand-text-secondary mt-1">
                ~{paymasterStatus.estimatedTransactions} transactions
              </div>
            </div>
          )}
        </div>

        {/* Notes Section Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-base font-medium flex items-center gap-3">
            Your Notes
            <span className="px-2 py-0.5 bg-brand-surface text-brand-text-secondary text-[11px] rounded font-mono">
              {notes.length}
            </span>
            {(notes.filter(n => n.onChainStatus === 'pending').length > 0 || notes.filter(n => n.onChainStatus === 'processing').length > 0) && (
              <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-[11px] rounded font-mono">
                {notes.filter(n => ['pending', 'processing'].includes(n.onChainStatus)).length} processing
              </span>
            )}
          </h2>
          
          <div className="flex items-center gap-3">
            {(notes.filter(n => ['pending', 'processing'].includes(n.onChainStatus)).length > 0) && (
              <button
                onClick={handleRefreshStatus}
                disabled={checkingStatus}
                className="bg-brand-surface hover:bg-brand-surface-hover text-brand-text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 border border-brand-border"
              >
                <span className={`material-symbols-outlined text-[18px] ${checkingStatus ? 'animate-spin' : ''}`}>
                  {checkingStatus ? 'sync' : 'refresh'}
                </span>
                {checkingStatus ? 'Checking...' : 'Refresh Status'}
              </button>
            )}
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-brand-text-primary hover:bg-white text-brand-bg px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Create Note
            </button>
          </div>
        </div>

        {/* Notes Grid */}
        {notes.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-dashed border-brand-border rounded-lg flex items-center justify-center p-8 bg-transparent group hover:bg-brand-surface/50 transition-colors cursor-pointer"
                 onClick={() => setShowCreateModal(true)}>
              <div className="text-center">
                <span className="material-symbols-outlined text-3xl text-brand-border mb-3 group-hover:text-brand-text-secondary transition-colors">
                  post_add
                </span>
                <p className="text-sm font-medium text-brand-text-secondary">
                  Ready for your first insight
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {notes.map((note) => (
              <div key={note.docId} className="bg-brand-surface rounded-lg overflow-hidden group border border-transparent hover:border-brand-border transition-all">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium text-brand-text-primary">
                      {note.title}
                    </h3>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingNote(note)}
                        className="p-1.5 text-brand-text-secondary hover:text-brand-text-primary rounded transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.docId, note.title)}
                        className="p-1.5 text-brand-text-secondary hover:text-red-400 rounded transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-brand-text-secondary text-sm mb-8 leading-relaxed line-clamp-3">
                    {note.content}
                  </p>
                  
                  <div className="pt-6 border-t border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center text-[11px] text-brand-text-secondary font-medium uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[14px] mr-1.5">calendar_today</span>
                      {note.createdAt?.toDate ? 
                        note.createdAt.toDate().toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        }).toUpperCase() : 
                        'JUST NOW'
                      }
                    </div>
                    
                    <div className={`flex items-center gap-2 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${getStatusColor(note.onChainStatus)}`}>
                      <span className={`material-symbols-outlined text-[14px] ${note.onChainStatus === 'processing' ? 'animate-spin' : ''}`}>
                        {getStatusIcon(note.onChainStatus)}
                      </span>
                      {note.onChainStatus}
                      {(note.onChainStatus === 'failed' || note.onChainStatus === 'processing') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRefreshSingleNote(note.id);
                          }}
                          className="ml-1 p-0.5 hover:bg-white/10 rounded transition-colors"
                          title="Check transaction status"
                        >
                          <span className="material-symbols-outlined text-[12px]">refresh</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                {note.transactionHash && (
                  <div className="px-6 py-3 bg-black/20 border-t border-brand-border flex items-center gap-3">
                    <span className="text-[10px] font-mono uppercase text-brand-text-secondary font-bold shrink-0">
                      TX ID
                    </span>
                    <span className="text-[11px] font-mono text-brand-text-secondary truncate">
                      {note.transactionHash}
                    </span>
                    <button
                      onClick={() => copyToClipboard(note.transactionHash)}
                      className="material-symbols-outlined text-[16px] text-brand-text-secondary hover:text-brand-text-primary ml-auto transition-colors"
                    >
                      content_copy
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {/* Add Note Card */}
            <div className="border border-dashed border-brand-border rounded-lg flex items-center justify-center p-8 bg-transparent group hover:bg-brand-surface/50 transition-colors cursor-pointer"
                 onClick={() => setShowCreateModal(true)}>
              <div className="text-center">
                <span className="material-symbols-outlined text-3xl text-brand-border mb-3 group-hover:text-brand-text-secondary transition-colors">
                  post_add
                </span>
                <p className="text-sm font-medium text-brand-text-secondary">
                  Ready for your next insight
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Settings Button */}
      <button className="fixed bottom-6 right-6 p-3 bg-brand-surface border border-brand-border rounded-full hover:bg-brand-surface-hover transition-colors z-50">
        <span className="material-symbols-outlined text-brand-text-primary">settings</span>
      </button>

      {/* Create/Edit Note Modal */}
      {(showCreateModal || editingNote) && (
        <NoteModal
          note={editingNote}
          onClose={() => {
            setShowCreateModal(false)
            setEditingNote(null)
          }}
          onSave={handleSaveNote}
        />
      )}
    </div>
  )
}

// Note Modal Component
const NoteModal = ({ note, onClose, onSave }) => {
  const [title, setTitle] = useState(note?.title || '')
  const [content, setContent] = useState(note?.content || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setSaving(true)
    try {
      await onSave({ title: title.trim(), content: content.trim() })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-brand-surface rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-brand-border">
        <div className="p-6 border-b border-brand-border">
          <h3 className="text-lg font-semibold text-brand-text-primary">
            {note ? 'Edit Note' : 'Create New Note'}
          </h3>
          <p className="text-sm text-brand-text-secondary mt-1">
            Your note will be saved instantly and verified on blockchain automatically
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-text-primary mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-accent-blue focus:border-transparent text-brand-text-primary placeholder-brand-text-secondary"
              placeholder="Enter note title..."
              maxLength={200}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-brand-text-primary mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 bg-brand-bg border border-brand-border rounded-lg focus:ring-2 focus:ring-brand-accent-blue focus:border-transparent text-brand-text-primary placeholder-brand-text-secondary"
              rows={10}
              placeholder="Write your note content..."
              maxLength={10000}
              required
            />
          </div>
          
          <div className="bg-brand-accent-green/10 p-3 rounded-lg border border-brand-accent-green/20">
            <div className="flex items-center space-x-2 text-sm text-brand-accent-green">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span className="font-medium">Gasless & Instant</span>
            </div>
            <p className="text-xs text-brand-accent-green/80 mt-1">
              No gas fees • Instant save • Blockchain verification in background
            </p>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-brand-text-secondary hover:text-brand-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim() || !content.trim()}
              className="bg-brand-text-primary text-brand-bg px-6 py-2 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : (note ? 'Update Note' : 'Create Note')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Dashboard