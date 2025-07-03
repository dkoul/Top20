export class StorageService {
  static KEYS = {
    ARTICLE_CLICKS: 'top20_article_clicks',
    ARTICLE_ORDER: 'top20_article_order',
    NEWS_SOURCES: 'top20_news_sources',
    LAST_REFRESH: 'top20_last_refresh',
    BOOKMARKS: 'top20_bookmarks',
    APP_NAME: 'top20_app_name'
  }

  // Article click tracking
  static recordClick(articleId) {
    const clicks = this.getClicks()
    clicks[articleId] = {
      count: (clicks[articleId]?.count || 0) + 1,
      lastClicked: new Date().toISOString()
    }
    localStorage.setItem(this.KEYS.ARTICLE_CLICKS, JSON.stringify(clicks))
    
    // Update article order
    this.updateArticleOrder(articleId)
  }

  static getClicks() {
    const stored = localStorage.getItem(this.KEYS.ARTICLE_CLICKS)
    return stored ? JSON.parse(stored) : {}
  }

  static getClickCount(articleId) {
    const clicks = this.getClicks()
    return clicks[articleId]?.count || 0
  }

  // Article ordering
  static updateArticleOrder(clickedArticleId) {
    const currentOrder = this.getArticleOrder()
    
    // Remove the article from its current position
    const filteredOrder = currentOrder.filter(id => id !== clickedArticleId)
    
    // Add it to the front
    const newOrder = [clickedArticleId, ...filteredOrder]
    
    localStorage.setItem(this.KEYS.ARTICLE_ORDER, JSON.stringify(newOrder))
  }

  static getArticleOrder() {
    const stored = localStorage.getItem(this.KEYS.ARTICLE_ORDER)
    return stored ? JSON.parse(stored) : []
  }

  static reorderArticles(articles) {
    const savedOrder = this.getArticleOrder()
    const clicks = this.getClicks()
    
    // Separate articles that have been clicked from those that haven't
    const clickedArticles = []
    const unclickedArticles = []
    
    articles.forEach(article => {
      if (clicks[article.id]) {
        clickedArticles.push(article)
      } else {
        unclickedArticles.push(article)
      }
    })
    
    // Sort clicked articles by their order in savedOrder, then by click count
    clickedArticles.sort((a, b) => {
      const aIndex = savedOrder.indexOf(a.id)
      const bIndex = savedOrder.indexOf(b.id)
      
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex
      } else if (aIndex !== -1) {
        return -1
      } else if (bIndex !== -1) {
        return 1
      } else {
        return clicks[b.id].count - clicks[a.id].count
      }
    })
    
    // Sort unclicked articles by publication date
    unclickedArticles.sort((a, b) => b.pubDate - a.pubDate)
    
    return [...clickedArticles, ...unclickedArticles]
  }

  // News sources management
  static saveSources(sources) {
    localStorage.setItem(this.KEYS.NEWS_SOURCES, JSON.stringify(sources))
  }

  static getSources() {
    const stored = localStorage.getItem(this.KEYS.NEWS_SOURCES)
    return stored ? JSON.parse(stored) : null
  }

  // Refresh tracking
  static setLastRefresh(timestamp = new Date().toISOString()) {
    localStorage.setItem(this.KEYS.LAST_REFRESH, timestamp)
  }

  static getLastRefresh() {
    return localStorage.getItem(this.KEYS.LAST_REFRESH)
  }

  static shouldRefresh(intervalMinutes = 30) {
    const lastRefresh = this.getLastRefresh()
    if (!lastRefresh) return true
    
    const lastRefreshTime = new Date(lastRefresh)
    const now = new Date()
    const diffMinutes = (now - lastRefreshTime) / (1000 * 60)
    
    return diffMinutes >= intervalMinutes
  }

  // Clear all data
  static clearAll() {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }

  // Export data
  static exportData() {
    const data = {}
    Object.entries(this.KEYS).forEach(([name, key]) => {
      const value = localStorage.getItem(key)
      if (value) {
        data[name] = JSON.parse(value)
      }
    })
    return data
  }

  // Import data
  static importData(data) {
    Object.entries(data).forEach(([name, value]) => {
      const key = this.KEYS[name]
      if (key) {
        localStorage.setItem(key, JSON.stringify(value))
      }
    })
  }

  // Bookmark management
  static toggleBookmark(articleId) {
    const bookmarks = this.getBookmarks()
    if (bookmarks.includes(articleId)) {
      // Remove bookmark
      const updated = bookmarks.filter(id => id !== articleId)
      localStorage.setItem(this.KEYS.BOOKMARKS, JSON.stringify(updated))
      return false
    } else {
      // Add bookmark
      const updated = [...bookmarks, articleId]
      localStorage.setItem(this.KEYS.BOOKMARKS, JSON.stringify(updated))
      return true
    }
  }

  static getBookmarks() {
    const stored = localStorage.getItem(this.KEYS.BOOKMARKS)
    return stored ? JSON.parse(stored) : []
  }

  static isBookmarked(articleId) {
    const bookmarks = this.getBookmarks()
    return bookmarks.includes(articleId)
  }

  // App name management
  static setAppName(name) {
    localStorage.setItem(this.KEYS.APP_NAME, name)
  }

  static getAppName() {
    return localStorage.getItem(this.KEYS.APP_NAME) || 'You'
  }
} 