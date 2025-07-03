import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  RotateCcw, 
  Save,
  X,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { useNews } from '../contexts/NewsContext'
import { StorageService } from '../services/storageService'

export default function AdminPanel() {
  const { getSources, updateSources } = useNews()
  const [sources, setSources] = useState([])
  const [editingSource, setEditingSource] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showImportExport, setShowImportExport] = useState(false)
  const [notification, setNotification] = useState(null)
  const [appName, setAppName] = useState('')

  useEffect(() => {
    setSources(getSources())
    setAppName(StorageService.getAppName())
  }, [])

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleSaveSources = () => {
    updateSources(sources)
    showNotification('Sources saved successfully!')
  }

  const handleSaveAppName = () => {
    StorageService.setAppName(appName)
    showNotification('App name saved successfully!')
  }

  const handleAddSource = (source) => {
    const newSource = {
      id: Date.now().toString(),
      enabled: true,
      ...source
    }
    setSources([...sources, newSource])
    setShowAddForm(false)
    showNotification('Source added successfully!')
  }

  const handleUpdateSource = (updatedSource) => {
    setSources(sources.map(source => 
      source.id === updatedSource.id ? updatedSource : source
    ))
    setEditingSource(null)
    showNotification('Source updated successfully!')
  }

  const handleDeleteSource = (sourceId) => {
    if (window.confirm('Are you sure you want to delete this source?')) {
      setSources(sources.filter(source => source.id !== sourceId))
      showNotification('Source deleted successfully!')
    }
  }

  const handleToggleSource = (sourceId) => {
    setSources(sources.map(source => 
      source.id === sourceId ? { ...source, enabled: !source.enabled } : source
    ))
  }

  const handleExport = () => {
    const data = {
      sources,
      storageData: StorageService.exportData(),
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `top20-config-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    showNotification('Configuration exported successfully!')
  }

  const handleImport = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (data.sources) {
          setSources(data.sources)
        }
        if (data.storageData) {
          StorageService.importData(data.storageData)
        }
        showNotification('Configuration imported successfully!')
      } catch (error) {
        showNotification('Error importing configuration', 'error')
      }
    }
    reader.readAsText(file)
  }

  const handleResetAll = () => {
    if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      StorageService.clearAll()
      setSources(getSources())
      showNotification('All data reset successfully!')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customize</h2>
          <p className="text-gray-600">Personalize your news experience</p>
        </div>
        <button
          onClick={handleSaveSources}
          className="btn-primary flex items-center space-x-2"
        >
          <Save size={16} />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`flex items-center space-x-2 p-3 rounded-lg ${
          notification.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle size={16} />
          ) : (
            <AlertTriangle size={16} />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Personalization */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Personalization</h3>
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your app will be called "Times of {appName || 'You'} - Top 20"
            </p>
          </div>
          <button
            onClick={handleSaveAppName}
            className="btn-primary"
          >
            Save Name
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Add Source</span>
        </button>
        
        <button
          onClick={() => setShowImportExport(!showImportExport)}
          className="btn-secondary flex items-center space-x-2"
        >
          <Download size={16} />
          <span>Import/Export</span>
        </button>
        
        <button
          onClick={handleResetAll}
          className="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200 transition-colors flex items-center space-x-2"
        >
          <RotateCcw size={16} />
          <span>Reset All</span>
        </button>
      </div>

      {/* Import/Export Panel */}
      {showImportExport && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Import/Export Configuration</h3>
          <div className="flex space-x-3">
            <button
              onClick={handleExport}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download size={16} />
              <span>Export Config</span>
            </button>
            
            <label className="btn-secondary flex items-center space-x-2 cursor-pointer">
              <Upload size={16} />
              <span>Import Config</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* Sources List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">News Sources</h3>
          <p className="text-sm text-gray-600">{sources.length} sources configured</p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {sources.map((source) => (
            <div key={source.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={source.enabled}
                  onChange={() => handleToggleSource(source.id)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{source.name}</h4>
                  <p className="text-sm text-gray-500">{source.url}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    source.type === 'rss' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {source.type.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingSource(source)}
                  className="text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDeleteSource(source.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Source Form */}
      {showAddForm && (
        <SourceForm
          onSubmit={handleAddSource}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Edit Source Form */}
      {editingSource && (
        <SourceForm
          source={editingSource}
          onSubmit={handleUpdateSource}
          onCancel={() => setEditingSource(null)}
        />
      )}
    </div>
  )
}

function SourceForm({ source, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: source?.name || '',
    url: source?.url || '',
    type: source?.type || 'rss',
    enabled: source?.enabled ?? true
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.url.trim()) return
    
    onSubmit({
      ...source,
      ...formData
    })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">
          {source ? 'Edit Source' : 'Add New Source'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={16} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="e.g., BBC World News"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL
          </label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="https://feeds.bbci.co.uk/news/world/rss.xml"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="rss">RSS Feed</option>
            <option value="json">JSON API</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enabled"
            checked={formData.enabled}
            onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="enabled" className="text-sm text-gray-700">
            Enable this source
          </label>
        </div>
        
        <div className="flex space-x-3">
          <button
            type="submit"
            className="btn-primary"
          >
            {source ? 'Update' : 'Add'} Source
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
} 