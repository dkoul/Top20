import React, { useState } from 'react'
import { ExternalLink, Clock, Eye, Bookmark } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useNews } from '../contexts/NewsContext'
import { StorageService } from '../services/storageService'

export default function NewsCard({ article, index }) {
  const { handleArticleClick } = useNews()
  const [imageError, setImageError] = useState(false)
  
  const clickCount = StorageService.getClickCount(article.id)
  const isTopPosition = index === 0
  const isBookmarked = StorageService.isBookmarked(article.id)
  
  const handleClick = (e) => {
    e.preventDefault()
    handleArticleClick(article.id)
    // Open link in new tab
    window.open(article.link, '_blank', 'noopener,noreferrer')
  }

  const handleBookmark = (e) => {
    e.preventDefault()
    e.stopPropagation()
    StorageService.toggleBookmark(article.id)
    // Force re-render by updating state
    setImageError(!imageError)
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const getCategoryColor = (category) => {
    const colors = {
      politics: 'bg-red-100 text-red-700',
      sports: 'bg-blue-100 text-blue-700',
      entertainment: 'bg-purple-100 text-purple-700',
      technology: 'bg-green-100 text-green-700',
      business: 'bg-yellow-100 text-yellow-700',
      health: 'bg-pink-100 text-pink-700',
      science: 'bg-indigo-100 text-indigo-700',
      general: 'bg-gray-100 text-gray-700'
    }
    return colors[category] || colors.general
  }

  return (
    <article 
      className={`card cursor-pointer group transform transition-all duration-200 hover:scale-105 ${
        isTopPosition ? 'ring-2 ring-primary-200 shadow-lg' : ''
      } ${clickCount > 0 ? 'bg-blue-50' : ''} ${isBookmarked ? 'border-l-4 border-l-yellow-400' : ''}`}
      onClick={handleClick}
    >
      {/* Header with position indicator and click count */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {isTopPosition && (
            <div className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
              #1
            </div>
          )}
          {clickCount > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Eye size={12} />
              <span>{clickCount}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleBookmark}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            <Bookmark 
              size={14} 
              className={isBookmarked ? 'text-yellow-600 fill-yellow-600' : 'text-gray-400 hover:text-yellow-600'} 
              fill={isBookmarked ? 'currentColor' : 'none'}
            />
          </button>
          <ExternalLink 
            size={14} 
            className="text-gray-400 group-hover:text-primary-600 transition-colors" 
          />
        </div>
      </div>

      {/* Article Image */}
      {article.imageUrl && !imageError && (
        <div className="mb-3 rounded-lg overflow-hidden">
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className="w-full h-32 object-cover"
            onError={handleImageError}
            loading="lazy"
          />
        </div>
      )}

      {/* Title */}
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-700 transition-colors">
        {article.title}
      </h3>

      {/* Description */}
      {article.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {article.description}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {article.category && (
          <span className={`tag tag-category ${getCategoryColor(article.category)}`}>
            {article.category}
          </span>
        )}
        {article.locations && article.locations.slice(0, 2).map((location, idx) => (
          <span key={idx} className="tag tag-location">
            {location}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
        <div className="font-medium truncate mb-1">{article.source}</div>
        <div className="flex items-center space-x-1">
          <Clock size={12} />
          <span>{formatDistanceToNow(article.pubDate, { addSuffix: true })}</span>
        </div>
      </div>
    </article>
  )
} 