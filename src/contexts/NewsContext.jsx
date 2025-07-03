import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { NewsService } from '../services/newsService'
import { TaggingService } from '../services/taggingService'
import { StorageService } from '../services/storageService'

const NewsContext = createContext()

// Action types
const NEWS_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ARTICLES: 'SET_ARTICLES',
  SET_ERROR: 'SET_ERROR',
  RECORD_CLICK: 'RECORD_CLICK',
  UPDATE_SOURCES: 'UPDATE_SOURCES',
  SET_LAST_REFRESH: 'SET_LAST_REFRESH'
}

// Initial state
const initialState = {
  articles: [],
  loading: false,
  error: null,
  lastRefresh: null,
  sources: []
}

// Reducer
function newsReducer(state, action) {
  switch (action.type) {
    case NEWS_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload }
    
    case NEWS_ACTIONS.SET_ARTICLES:
      return { 
        ...state, 
        articles: action.payload,
        loading: false,
        error: null
      }
    
    case NEWS_ACTIONS.SET_ERROR:
      return { 
        ...state, 
        error: action.payload,
        loading: false
      }
    
    case NEWS_ACTIONS.RECORD_CLICK:
      // Reorder articles when one is clicked
      const reorderedArticles = StorageService.reorderArticles(state.articles)
      return { 
        ...state, 
        articles: reorderedArticles
      }
    
    case NEWS_ACTIONS.UPDATE_SOURCES:
      return { 
        ...state, 
        sources: action.payload
      }
    
    case NEWS_ACTIONS.SET_LAST_REFRESH:
      return { 
        ...state, 
        lastRefresh: action.payload
      }
    
    default:
      return state
  }
}

export function NewsProvider({ children }) {
  const [state, dispatch] = useReducer(newsReducer, initialState)
  
  const newsService = new NewsService()
  const taggingService = new TaggingService()

  // Load articles
  const loadArticles = async (forceRefresh = false) => {
    if (!forceRefresh && !StorageService.shouldRefresh()) {
      return
    }

    dispatch({ type: NEWS_ACTIONS.SET_LOADING, payload: true })
    
    try {
      // Fetch raw articles
      const rawArticles = await newsService.aggregateNews()
      
      // Apply tagging
      const taggedArticles = taggingService.tagArticles(rawArticles)
      
      // Apply user-based reordering
      const orderedArticles = StorageService.reorderArticles(taggedArticles)
      
      dispatch({ type: NEWS_ACTIONS.SET_ARTICLES, payload: orderedArticles })
      
      // Update last refresh timestamp
      const now = new Date().toISOString()
      StorageService.setLastRefresh(now)
      dispatch({ type: NEWS_ACTIONS.SET_LAST_REFRESH, payload: now })
      
    } catch (error) {
      console.error('Error loading articles:', error)
      dispatch({ type: NEWS_ACTIONS.SET_ERROR, payload: error.message })
    }
  }

  // Handle article click
  const handleArticleClick = (articleId) => {
    StorageService.recordClick(articleId)
    dispatch({ type: NEWS_ACTIONS.RECORD_CLICK, payload: articleId })
  }

  // Update news sources
  const updateSources = (sources) => {
    newsService.saveSources(sources)
    dispatch({ type: NEWS_ACTIONS.UPDATE_SOURCES, payload: sources })
  }

  // Get news sources
  const getSources = () => {
    return newsService.getSources()
  }

  // Initialize on mount
  useEffect(() => {
    const sources = newsService.getSources()
    dispatch({ type: NEWS_ACTIONS.UPDATE_SOURCES, payload: sources })
    
    const lastRefresh = StorageService.getLastRefresh()
    dispatch({ type: NEWS_ACTIONS.SET_LAST_REFRESH, payload: lastRefresh })
    
    // Load articles on mount
    loadArticles()
  }, [])

  const value = {
    ...state,
    loadArticles,
    handleArticleClick,
    updateSources,
    getSources,
    refreshNews: () => loadArticles(true)
  }

  return (
    <NewsContext.Provider value={value}>
      {children}
    </NewsContext.Provider>
  )
}

export function useNews() {
  const context = useContext(NewsContext)
  if (!context) {
    throw new Error('useNews must be used within a NewsProvider')
  }
  return context
} 