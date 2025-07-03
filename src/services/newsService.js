import axios from 'axios'

// CORS proxy for RSS feeds with fallbacks
const CORS_PROXIES = [
  'https://api.allorigins.win/get?url=',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url='
]

export class NewsService {
  constructor() {
    this.sources = this.loadSources()
  }

  loadSources() {
    const stored = localStorage.getItem('newsSources')
    if (stored) {
      return JSON.parse(stored)
    }
    
    // Default sources - using more reliable RSS feeds
    return [
      {
        id: 'bbc-world',
        name: 'BBC World News',
        url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
        type: 'rss',
        enabled: true
      },
      {
        id: 'guardian-world',
        name: 'The Guardian World News',
        url: 'https://www.theguardian.com/world/rss',
        type: 'rss',
        enabled: true
      },
      {
        id: 'guardian-us',
        name: 'The Guardian US News',
        url: 'https://www.theguardian.com/us-news/rss',
        type: 'rss',
        enabled: true
      },
      {
        id: 'npr-news',
        name: 'NPR News',
        url: 'https://feeds.npr.org/1001/rss.xml',
        type: 'rss',
        enabled: true
      },
      {
        id: 'hackernews',
        name: 'Hacker News',
        url: 'https://hnrss.org/frontpage',
        type: 'rss',
        enabled: true
      },
      {
        id: 'reuters-world',
        name: 'Reuters World News',
        url: 'https://feeds.reuters.com/reuters/worldNews',
        type: 'rss',
        enabled: true
      },
      {
        id: 'thehindu-news',
        name: 'The Hindu News',
        url: 'https://www.thehindu.com/feeder/default.rss',
        type: 'rss',
        enabled: true
      },
      {
        id: 'toi-topstories',
        name: 'Times of India Top Stories',
        url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',
        type: 'rss',
        enabled: true
      },
      {
        id: 'ndtv-india',
        name: 'NDTV India News',
        url: 'https://feeds.feedburner.com/ndtvnews-india-news',
        type: 'rss',
        enabled: true
      }
    ]
  }

  saveSources(sources) {
    localStorage.setItem('newsSources', JSON.stringify(sources))
    this.sources = sources
  }

  getSources() {
    return this.sources
  }

  async fetchFromRSS(url) {
    console.log(`Fetching RSS from: ${url}`)
    
    // Try multiple CORS proxies
    for (let i = 0; i < CORS_PROXIES.length; i++) {
      const proxy = CORS_PROXIES[i]
      try {
        console.log(`Trying proxy ${i + 1}/${CORS_PROXIES.length}: ${proxy}`)
        
        const proxyUrl = proxy + encodeURIComponent(url)
        const response = await axios.get(proxyUrl, {
          timeout: 10000, // 10 second timeout
          headers: {
            'Accept': 'application/rss+xml, application/xml, text/xml'
          }
        })
        
        // Handle different proxy response formats
        let xmlText = response.data
        if (typeof response.data === 'object' && response.data.contents) {
          xmlText = response.data.contents
        } else if (typeof response.data === 'object' && response.data.data) {
          xmlText = response.data.data
        }
        
        if (!xmlText || typeof xmlText !== 'string') {
          throw new Error('Invalid response format')
        }
        
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
        
        // Check for parsing errors
        const parseError = xmlDoc.querySelector('parsererror')
        if (parseError) {
          throw new Error('Failed to parse RSS XML: ' + parseError.textContent)
        }
        
        // Try RSS 2.0 format first
        let items = xmlDoc.querySelectorAll('item')
        let channelTitle = xmlDoc.querySelector('channel > title')?.textContent
        
        // If no items found, try Atom format
        if (items.length === 0) {
          items = xmlDoc.querySelectorAll('entry')
          channelTitle = xmlDoc.querySelector('feed > title')?.textContent
        }
        
        if (items.length === 0) {
          throw new Error('No items found in feed')
        }
        
        const articles = Array.from(items).map(item => {
          // Handle both RSS and Atom formats
          const title = item.querySelector('title')?.textContent || ''
          const link = item.querySelector('link')?.textContent || 
                      item.querySelector('link')?.getAttribute('href') || ''
          const description = item.querySelector('description')?.textContent || 
                            item.querySelector('summary')?.textContent || 
                            item.querySelector('content')?.textContent || ''
          const pubDate = item.querySelector('pubDate')?.textContent || 
                         item.querySelector('published')?.textContent || 
                         item.querySelector('updated')?.textContent || ''
          const guid = item.querySelector('guid')?.textContent || 
                      item.querySelector('id')?.textContent || ''
          
          // Extract image from various sources
          const imageUrl = this.extractImageUrl(item, description)
          
          return {
            id: guid || link || title || Date.now() + Math.random(),
            title: title.trim(),
            link: link.trim(),
            description: this.extractDescription({ description, content: description }),
            pubDate: pubDate ? new Date(pubDate) : new Date(),
            source: channelTitle || 'Unknown Source',
            category: null, // Will be set by tagging service
            location: null, // Will be set by tagging service
            content: description,
            imageUrl: imageUrl
          }
        }).filter(article => article.title && article.link) // Filter out invalid articles
        
        console.log(`Successfully fetched ${articles.length} articles from ${url}`)
        return articles
        
      } catch (error) {
        console.warn(`Proxy ${i + 1} failed for ${url}:`, error.message)
        
        // If this is the last proxy, log the error and return empty array
        if (i === CORS_PROXIES.length - 1) {
          console.error(`All proxies failed for ${url}. Final error:`, error.message)
          return []
        }
        
        // Continue to next proxy
        continue
      }
    }
    
    return []
  }

  extractDescription(item) {
    const content = item.description || item.content || item.summary || ''
    if (!content) return ''
    
    // Strip HTML tags and get first 150 characters
    const text = content.replace(/<[^>]*>/g, '').trim()
    return text.length > 150 ? text.substring(0, 150) + '...' : text
  }

  extractImageUrl(item, description) {
    // Try different RSS image sources
    let imageUrl = null
    
    // 1. Media RSS namespace (media:content, media:thumbnail)
    const mediaContent = item.querySelector('content[medium="image"]') || 
                        item.querySelector('media\\:content[medium="image"]') ||
                        item.querySelector('media\\:thumbnail') ||
                        item.querySelector('thumbnail')
    if (mediaContent) {
      imageUrl = mediaContent.getAttribute('url')
    }
    
    // 2. Enclosure with image type
    if (!imageUrl) {
      const enclosure = item.querySelector('enclosure')
      if (enclosure) {
        const type = enclosure.getAttribute('type')
        if (type && type.startsWith('image/')) {
          imageUrl = enclosure.getAttribute('url')
        }
      }
    }
    
    // 3. Extract from description/content HTML
    if (!imageUrl && description) {
      const imgMatch = description.match(/<img[^>]+src="([^"]+)"/i)
      if (imgMatch) {
        imageUrl = imgMatch[1]
      }
    }
    
    // 4. Look for image element
    if (!imageUrl) {
      const image = item.querySelector('image')
      if (image) {
        imageUrl = image.textContent || image.getAttribute('href')
      }
    }
    
    // Clean up and validate URL
    if (imageUrl) {
      imageUrl = imageUrl.trim()
      // Basic validation - check if it looks like a URL
      if (imageUrl.startsWith('http') || imageUrl.startsWith('//')) {
        // Make sure protocol-relative URLs have https
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl
        }
        return imageUrl
      }
    }
    
    return null
  }

  async fetchFromJSON(url) {
    console.log(`Fetching JSON from: ${url}`)
    
    try {
      const response = await axios.get(url, {
        timeout: 15000, // 15 second timeout
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Top20-News-Aggregator/1.0'
        }
      })
      
      const data = response.data
      
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid JSON response format')
      }
      
      // Adapt JSON structure to our format
      const articles = data.articles?.map(article => ({
        id: article.id || article.url || article.title || Date.now() + Math.random(),
        title: article.title || '',
        link: article.url || article.link || '',
        description: article.description || article.summary || '',
        pubDate: new Date(article.publishedAt || article.date || article.pubDate),
        source: article.source?.name || article.source || 'Unknown Source',
        category: null,
        location: null,
        content: article.content || article.description || '',
        imageUrl: article.urlToImage || article.image || article.thumbnail || null
      })).filter(article => article.title && article.link) || []
      
      console.log(`Successfully fetched ${articles.length} articles from JSON API`)
      return articles
      
    } catch (error) {
      console.error(`Error fetching JSON from ${url}:`, error.message)
      return []
    }
  }

  async aggregateNews() {
    const enabledSources = this.sources.filter(source => source.enabled)
    console.log(`Aggregating news from ${enabledSources.length} sources`)
    
    if (enabledSources.length === 0) {
      console.warn('No enabled sources found')
      return []
    }

    const allPromises = enabledSources.map(async (source) => {
      try {
        console.log(`Fetching from ${source.name} (${source.type})`)
        
        if (source.type === 'rss') {
          const articles = await this.fetchFromRSS(source.url)
          return { source: source.name, articles, success: true }
        } else if (source.type === 'json') {
          const articles = await this.fetchFromJSON(source.url)
          return { source: source.name, articles, success: true }
        }
        
        return { source: source.name, articles: [], success: false, error: 'Unsupported source type' }
      } catch (error) {
        console.error(`Error fetching from ${source.name}:`, error)
        return { source: source.name, articles: [], success: false, error: error.message }
      }
    })

    try {
      const results = await Promise.allSettled(allPromises)
      const allArticles = []
      let successCount = 0
      let totalAttempts = 0

      results.forEach((result, index) => {
        const sourceName = enabledSources[index].name
        totalAttempts++
        
        if (result.status === 'fulfilled') {
          const { articles, success, error } = result.value
          
          if (success && articles.length > 0) {
            allArticles.push(...articles)
            successCount++
            console.log(`✓ ${sourceName}: ${articles.length} articles`)
          } else {
            console.warn(`✗ ${sourceName}: ${error || 'No articles found'}`)
          }
        } else {
          console.error(`✗ ${sourceName}: Promise rejected -`, result.reason)
        }
      })

      console.log(`Aggregation complete: ${successCount}/${totalAttempts} sources succeeded`)
      console.log(`Total articles before filtering: ${allArticles.length}`)

      // Remove duplicates based on title similarity
      const uniqueArticles = this.removeDuplicates(allArticles)
      
      // Sort by publication date and limit to top 20
      const sortedArticles = uniqueArticles
        .sort((a, b) => b.pubDate - a.pubDate)
        .slice(0, 20)

      console.log(`Final article count: ${sortedArticles.length}`)
      return sortedArticles
      
    } catch (error) {
      console.error('Error in aggregateNews:', error)
      return []
    }
  }

  // Helper method to remove duplicate articles
  removeDuplicates(articles) {
    const seen = new Set()
    const unique = []
    
    for (const article of articles) {
      // Create a simple hash based on title (first 50 chars, lowercased)
      const hash = article.title.toLowerCase().substring(0, 50)
      
      if (!seen.has(hash)) {
        seen.add(hash)
        unique.push(article)
      }
    }
    
    return unique
  }
} 