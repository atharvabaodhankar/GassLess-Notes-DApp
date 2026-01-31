import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { notesAPI, walletAPI } from '../services/api'
import { 
  Plus, 
  FileText, 
  Wallet, 
  LogOut, 
  CheckCircle, 
  Clock, 
  XCircle,
  Edit3,
  Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'

const Dashboard = () => {
  const { user, userProfile, logout } = useAuth()
  const [notes, setNotes] = useState([])
  const [walletInfo, setWalletInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingNote, setEditingNote] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [notesResponse, walletResponse] = await Promise.all([
        notesAPI.getAll(),
        walletAPI.getInfo()
      ])
      
      setNotes(notesResponse.data.notes)
      setWalletInfo(walletResponse.data.wallet)
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
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Verified on blockchain'
      case 'pending':
        return 'Blockchain verification pending'
      case 'failed':
        return 'Blockchain verification failed'
      default:
        return 'Unknown status'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Gasless Notes</h1>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                ERC-4337
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Wallet className="w-4 h-4" />
                <span className="font-mono">
                  {walletInfo?.address?.slice(0, 6)}...{walletInfo?.address?.slice(-4)}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {user?.email?.split('@')[0]}!
          </h2>
          <p className="text-blue-100 mb-4">
            Create notes instantly with blockchain integrity verification
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="font-semibold">Total Notes</div>
              <div className="text-2xl font-bold">{notes.length}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="font-semibold">Verified</div>
              <div className="text-2xl font-bold">
                {notes.filter(n => n.onChainStatus === 'confirmed').length}
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="font-semibold">Gas Fees Paid</div>
              <div className="text-2xl font-bold">$0.00</div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Your Notes</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Note</span>
          </button>
        </div>

        {/* Notes Grid */}
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
            <p className="text-gray-500 mb-4">Create your first note to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Note
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <div key={note.id} className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-gray-900 truncate flex-1">
                    {note.title}
                  </h4>
                  <div className="flex items-center space-x-2 ml-2">
                    <button
                      onClick={() => setEditingNote(note)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {note.content}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center space-x-1" title={getStatusText(note.onChainStatus)}>
                    {getStatusIcon(note.onChainStatus)}
                    <span className="capitalize">{note.onChainStatus}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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

  async function handleSaveNote(noteData) {
    try {
      if (editingNote) {
        await notesAPI.update(editingNote.id, noteData)
        toast.success('Note updated successfully!')
      } else {
        await notesAPI.create(noteData)
        toast.success('Note created successfully!')
      }
      
      setShowCreateModal(false)
      setEditingNote(null)
      loadDashboardData()
    } catch (error) {
      console.error('Failed to save note:', error)
      toast.error('Failed to save note')
    }
  }

  async function handleDeleteNote(noteId) {
    if (!confirm('Are you sure you want to delete this note?')) return
    
    try {
      await notesAPI.delete(noteId)
      toast.success('Note deleted successfully!')
      loadDashboardData()
    } catch (error) {
      console.error('Failed to delete note:', error)
      toast.error('Failed to delete note')
    }
  }
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">
            {note ? 'Edit Note' : 'Create New Note'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter note title..."
              maxLength={200}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={10}
              placeholder="Write your note content..."
              maxLength={10000}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim() || !content.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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