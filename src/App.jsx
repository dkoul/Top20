import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { NewsProvider } from './contexts/NewsContext'
import Header from './components/Header'
import NewsGrid from './components/NewsGrid'
import AdminPanel from './components/AdminPanel'

function App() {
  return (
    <NewsProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<NewsGrid />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
      </div>
    </NewsProvider>
  )
}

export default App 