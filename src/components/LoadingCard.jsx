import React from 'react'

export default function LoadingCard() {
  return (
    <div className="card animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="w-8 h-4 bg-gray-200 rounded"></div>
        <div className="w-4 h-4 bg-gray-200 rounded"></div>
      </div>

      {/* Title */}
      <div className="space-y-2 mb-3">
        <div className="w-full h-4 bg-gray-200 rounded"></div>
        <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
      </div>

      {/* Description */}
      <div className="space-y-1 mb-3">
        <div className="w-full h-3 bg-gray-200 rounded"></div>
        <div className="w-full h-3 bg-gray-200 rounded"></div>
        <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
      </div>

      {/* Tags */}
      <div className="flex space-x-1 mb-3">
        <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
        <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="w-20 h-3 bg-gray-200 rounded"></div>
        <div className="w-16 h-3 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
} 