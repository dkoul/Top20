import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { RefreshCw, Settings, Home, Bookmark } from 'lucide-react'
import { useNews } from '../contexts/NewsContext'
import { formatDistanceToNow } from 'date-fns'
import { StorageService } from '../services/storageService'

export default function Header() {
  const location = useLocation()
  const { loading, refreshNews, lastRefresh } = useNews()
  const [appName, setAppName] = useState('You')

  useEffect(() => {
    setAppName(StorageService.getAppName())
    
    // Listen for storage changes to update app name
    const handleStorageChange = (e) => {
      if (e.key === 'top20_app_name') {
        setAppName(StorageService.getAppName())
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for direct updates (within same tab)
    const checkAppName = () => {
      const currentName = StorageService.getAppName()
      if (currentName !== appName) {
        setAppName(currentName)
      }
    }
    
    const interval = setInterval(checkAppName, 1000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [appName])

  const handleRefresh = () => {
    refreshNews()
  }

  const formatLastRefresh = () => {
    if (!lastRefresh) return 'Never'
    return formatDistanceToNow(new Date(lastRefresh), { addSuffix: true })
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">20</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Times of {appName} - Top 20</h1>
            </Link>
            <span className="text-sm text-gray-500 hidden sm:inline">
              Ad-free news aggregator
            </span>
          </div>

          {/* Navigation and Actions */}
          <div className="flex items-center space-x-4">
            {/* Last Refresh Info */}
            <div className="hidden md:flex items-center text-sm text-gray-500">
              <span>Last updated: {formatLastRefresh()}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 rounded-md bg-primary-50 text-primary-700 hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Refresh news"
            >
              <RefreshCw 
                size={16} 
                className={loading ? 'animate-spin' : ''} 
              />
              <span className="hidden sm:inline">
                {loading ? 'Loading...' : 'Refresh'}
              </span>
            </button>

            {/* Bookmarks Button */}
            <button
              onClick={() => {
                const bookmarks = StorageService.getBookmarks()
                if (bookmarks.length > 0) {
                  alert(`You have ${bookmarks.length} bookmarked article${bookmarks.length > 1 ? 's' : ''}`)
                } else {
                  alert('No bookmarks yet. Click the bookmark icon on articles to save them!')
                }
              }}
              className="flex items-center space-x-2 px-3 py-2 rounded-md bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-colors"
              title="View bookmarks"
            >
              <Bookmark size={16} />
              <span className="hidden sm:inline">Bookmarks</span>
              <span className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full text-xs">
                {StorageService.getBookmarks().length}
              </span>
            </button>

            {/* Navigation */}
            <nav className="flex items-center space-x-2">
              <Link
                to="/"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === '/'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Home size={16} />
                <span className="hidden sm:inline">Home</span>
              </Link>
              
              <Link
                to="/admin"
                className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-colors ${
                  location.pathname === '/admin'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Settings size={16} />
                <span className="hidden sm:inline">Customize</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
} 