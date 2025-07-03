import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { useNews } from '../contexts/NewsContext'
import NewsCard from './NewsCard'
import LoadingCard from './LoadingCard'

export default function NewsGrid() {
  const { articles, loading, error, refreshNews } = useNews()

  if (error) {
    return (
      <div className="min-h-96 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading News
          </h3>
          <p className="text-gray-600 mb-4">
            {error}
          </p>
          <button
            onClick={() => refreshNews()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Top 20 News Stories</h2>
          <p className="text-gray-600">
            {loading ? 'Loading latest news...' : `${articles.length} stories aggregated`}
          </p>
        </div>
        
        {/* Stats */}
        <div className="hidden md:flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-100 rounded-full"></div>
            <span>Clicked articles</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-primary-200 rounded-full"></div>
            <span>Top position</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          // Show loading cards in 4x5 grid
          Array.from({ length: 20 }).map((_, index) => (
            <LoadingCard key={index} />
          ))
        ) : (
          articles.map((article, index) => (
            <NewsCard 
              key={article.id} 
              article={article} 
              index={index}
            />
          ))
        )}
      </div>

      {/* Empty State */}
      {!loading && articles.length === 0 && (
        <div className="text-center py-12">
          <RefreshCw size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No News Available
          </h3>
          <p className="text-gray-600 mb-4">
            Unable to load news from configured sources.
          </p>
          <button
            onClick={() => refreshNews()}
            className="btn-primary"
          >
            Refresh News
          </button>
        </div>
      )}

      {/* Instructions */}
      {!loading && articles.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">How it works:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click on any article to open it and move it to the top-left position</li>
            <li>• Articles are automatically tagged by category and location</li>
            <li>• Your reading preferences are saved locally</li>
            <li>• News refreshes automatically every 30 minutes</li>
            <li>• Check browser console for detailed feed status</li>
          </ul>
        </div>
      )}

      {/* Status Messages */}
      {!loading && articles.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700">
            ✓ News aggregation successful! Articles loaded from multiple sources. 
            {articles.length < 10 && (
              <span className="block mt-1 text-green-600">
                Note: Some sources may be temporarily unavailable. Check console for details.
              </span>
            )}
          </p>
        </div>
      )}

      {/* Partial Failure Warning */}
      {!loading && articles.length > 0 && articles.length < 5 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-700">
            ⚠️ Limited articles available. Some news sources may be experiencing issues.
            <button 
              onClick={() => refreshNews()} 
              className="ml-2 text-yellow-800 underline hover:no-underline"
            >
              Try refreshing
            </button>
          </p>
        </div>
      )}
    </div>
  )
} 