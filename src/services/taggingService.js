import nlp from 'compromise'

export class TaggingService {
  constructor() {
    this.categoryKeywords = {
      politics: [
        'election', 'government', 'congress', 'senate', 'parliament', 'president',
        'minister', 'politics', 'political', 'vote', 'voting', 'campaign',
        'democracy', 'republican', 'democrat', 'conservative', 'liberal',
        'policy', 'legislation', 'law', 'bill', 'amendment', 'constitution'
      ],
      sports: [
        'football', 'soccer', 'basketball', 'baseball', 'tennis', 'golf',
        'olympics', 'championship', 'tournament', 'game', 'match', 'team',
        'player', 'coach', 'stadium', 'league', 'nfl', 'nba', 'nhl', 'mlb',
        'fifa', 'score', 'win', 'loss', 'season', 'playoffs'
      ],
      entertainment: [
        'movie', 'film', 'actor', 'actress', 'director', 'hollywood',
        'celebrity', 'music', 'album', 'song', 'concert', 'artist',
        'tv', 'television', 'show', 'series', 'netflix', 'streaming',
        'award', 'oscar', 'grammy', 'emmy', 'festival', 'premiere'
      ],
      technology: [
        'tech', 'technology', 'software', 'app', 'apple', 'google',
        'microsoft', 'amazon', 'facebook', 'twitter', 'ai', 'artificial',
        'intelligence', 'robot', 'automation', 'startup', 'innovation',
        'digital', 'internet', 'cyber', 'data', 'privacy', 'security'
      ],
      business: [
        'business', 'economy', 'economic', 'market', 'stock', 'trade',
        'company', 'corporation', 'startup', 'investment', 'finance',
        'financial', 'bank', 'revenue', 'profit', 'merger', 'acquisition'
      ],
      health: [
        'health', 'medical', 'medicine', 'doctor', 'hospital', 'disease',
        'virus', 'vaccine', 'covid', 'pandemic', 'treatment', 'drug',
        'study', 'research', 'patient', 'healthcare', 'mental health'
      ],
      science: [
        'science', 'scientific', 'research', 'study', 'discovery',
        'space', 'nasa', 'climate', 'environment', 'energy', 'renewable',
        'carbon', 'experiment', 'university', 'professor', 'laboratory'
      ]
    }

    this.majorCities = [
      'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
      'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
      'London', 'Paris', 'Berlin', 'Madrid', 'Rome', 'Amsterdam',
      'Tokyo', 'Beijing', 'Shanghai', 'Mumbai', 'Delhi', 'Seoul',
      'Sydney', 'Melbourne', 'Toronto', 'Vancouver', 'Montreal',
      'Moscow', 'St. Petersburg', 'Kiev', 'Warsaw', 'Prague',
      'Stockholm', 'Copenhagen', 'Oslo', 'Helsinki', 'Dublin',
      'Brussels', 'Vienna', 'Zurich', 'Geneva', 'Barcelona',
      'Dubai', 'Singapore', 'Hong Kong', 'Bangkok', 'Jakarta'
    ]
  }

  categorizeArticle(article) {
    const text = `${article.title} ${article.description}`.toLowerCase()
    const scores = {}

    // Calculate scores for each category
    Object.entries(this.categoryKeywords).forEach(([category, keywords]) => {
      scores[category] = keywords.reduce((score, keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
        const matches = text.match(regex)
        return score + (matches ? matches.length : 0)
      }, 0)
    })

    // Find the category with the highest score
    const bestCategory = Object.entries(scores).reduce((best, current) => 
      current[1] > best[1] ? current : best
    )

    return bestCategory[1] > 0 ? bestCategory[0] : 'general'
  }

  extractLocations(article) {
    const text = `${article.title} ${article.description}`
    const locations = []

    // Use compromise NLP to find places
    const doc = nlp(text)
    const places = doc.places().out('array')
    
    // Add detected places
    places.forEach(place => {
      if (place.length > 2) { // Filter out very short matches
        locations.push(place)
      }
    })

    // Check for major cities specifically
    this.majorCities.forEach(city => {
      const regex = new RegExp(`\\b${city}\\b`, 'gi')
      if (regex.test(text) && !locations.includes(city)) {
        locations.push(city)
      }
    })

    return locations.slice(0, 3) // Return max 3 locations
  }

  tagArticle(article) {
    const category = this.categorizeArticle(article)
    const locations = this.extractLocations(article)

    return {
      ...article,
      category,
      locations,
      tags: {
        category,
        locations
      }
    }
  }

  tagArticles(articles) {
    return articles.map(article => this.tagArticle(article))
  }
} 