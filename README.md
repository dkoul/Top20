# Top20 News Aggregator

A modern, ad-free news aggregation SPA that displays the top 20 news stories from configurable sources in a clean 4×5 grid layout. Features smart auto-tagging, click-based article promotion, and a clean minimal interface.

## ✨ Features

- **Ad-free Experience**: Clean, distraction-free news reading
- **Smart Aggregation**: Combines news from multiple RSS/JSON sources
- **Auto-tagging**: Automatically categorizes articles by topic and location
- **Click-based Reordering**: Clicked articles move to the top-left position
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Admin Panel**: Easy source management and configuration
- **Local Storage**: All preferences saved locally, no backend required
- **Export/Import**: Backup and restore your configuration

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Modern web browser

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd Top20
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

3. **Open your browser:**
Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder, ready for static hosting.

## 🛠 Tech Stack

- **Frontend**: React 18 with hooks
- **Styling**: TailwindCSS with custom components
- **Routing**: React Router
- **News Parsing**: Browser-native DOMParser for RSS feeds, axios for JSON APIs
- **NLP**: compromise.js for smart categorization and location extraction
- **Icons**: Lucide React
- **Build Tool**: Vite for fast development and optimized builds

## 📋 How It Works

### News Aggregation
- Fetches from configured RSS feeds and JSON APIs
- Processes and normalizes article data
- Limits to top 20 most recent articles
- Handles errors gracefully with fallbacks

### Smart Tagging
- **Category Detection**: Uses keyword matching to categorize articles into:
  - Politics, Sports, Entertainment, Technology, Business, Health, Science, General
- **Location Extraction**: Uses NLP to identify cities and locations mentioned in articles
- **Real-time Processing**: Tags are applied as articles are loaded

### Click-based Promotion
- When you click an article, it moves to the top-left position (position #1)
- Other clicked articles maintain their relative order
- Click counts are tracked and displayed
- All interactions are saved locally

### Admin Configuration
- Add/edit/remove news sources
- Enable/disable sources without deleting
- Import/export configuration as JSON
- Reset all data with confirmation

## 🔧 Configuration

### Default News Sources
The app comes with 5 pre-configured sources:
- BBC World News
- Reuters Top News
- Associated Press
- The Guardian World News
- CNN Top Stories

### Adding Custom Sources
1. Go to the Admin panel (`/admin`)
2. Click "Add Source"
3. Provide:
   - **Name**: Display name for the source
   - **URL**: RSS feed or JSON API endpoint
   - **Type**: RSS or JSON
   - **Enabled**: Whether to include in aggregation

### CORS Considerations
RSS feeds from external domains require CORS proxy for browser access. The app uses `api.allorigins.win` by default. For production, consider:
- Using your own CORS proxy
- Server-side RSS fetching
- News APIs that support CORS

## 📱 Usage

### Main Interface
- **4×5 Grid**: Articles displayed in a responsive grid
- **Visual Indicators**: 
  - Blue highlight for clicked articles
  - Ring highlight for top position
  - Click count badges
- **Smart Tags**: Category and location tags on each article
- **Responsive**: Adapts to different screen sizes

### Navigation
- **Home**: Main news grid
- **Admin**: Source management and configuration
- **Refresh**: Manual refresh button (auto-refreshes every 30 minutes)

### Article Interaction
- **Click**: Opens article in new tab and promotes to top position
- **Hover**: Shows preview effects
- **Tags**: Visual categorization and location information

## 🔐 Privacy

- **No Backend**: All data stored locally in browser
- **No Tracking**: No analytics or tracking scripts
- **No Cookies**: Uses localStorage only
- **No Registration**: No user accounts required

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub repository
2. Connect to Vercel
3. Deploy automatically

### Netlify
1. Build the project: `npm run build`
2. Upload `dist` folder to Netlify

### GitHub Pages
1. Build the project: `npm run build`
2. Push `dist` folder to `gh-pages` branch

### Self-hosting
1. Build the project: `npm run build`
2. Serve `dist` folder with any static file server

## 🎨 Customization

### Styling
- Modify `tailwind.config.js` for theme customization
- Edit `src/index.css` for custom styles
- Components use TailwindCSS classes for easy theming

### Adding Categories
Edit `src/services/taggingService.js` to add new categories:
```javascript
this.categoryKeywords = {
  // existing categories...
  newCategory: ['keyword1', 'keyword2', 'keyword3']
}
```

### Adding Locations
Add cities to the `majorCities` array in `taggingService.js`

## 📊 Local Storage Data

The app stores:
- `top20_article_clicks`: Click tracking data
- `top20_article_order`: Article ordering preferences
- `top20_news_sources`: Configured news sources
- `top20_last_refresh`: Last refresh timestamp

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🐛 Troubleshooting

### Articles Not Loading
- Check browser console for CORS errors
- Verify RSS feed URLs are accessible
- Try refreshing or clearing localStorage

### Performance Issues
- Reduce number of enabled sources
- Check browser dev tools for network issues
- Clear browser cache and localStorage

### Styling Issues
- Ensure TailwindCSS is properly configured
- Check for conflicting CSS rules
- Verify responsive breakpoints

## 🔮 Future Enhancements

- [ ] PWA support for offline reading
- [ ] Dark mode theme
- [ ] Article bookmarking
- [ ] Search and filtering
- [ ] Custom RSS feed creation
- [ ] Social sharing
- [ ] Keyboard shortcuts
- [ ] Article read status tracking

---

Built with ❤️ for clean, ad-free news consumption. 