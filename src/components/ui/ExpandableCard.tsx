import React, { ReactNode } from 'react'

interface ExpandableCardProps {
  title: string
  icon: ReactNode
  iconColor: string
  isExpanded: boolean
  onToggle: () => void
  children: ReactNode
  className?: string
}

export const ExpandableCard: React.FC<ExpandableCardProps> = ({
  title,
  icon,
  iconColor,
  isExpanded,
  onToggle,
  children,
  className = ''
}) => {
  return (
    <div className={`bg-slate-800 rounded-2xl shadow-xl border border-slate-700 ${className}`}>
      {/* Header - Always Visible */}
      <button
        onClick={onToggle}
        className="w-full p-4 sm:p-6 flex justify-between items-center hover:bg-slate-700 transition-colors rounded-2xl"
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 ${iconColor} rounded-lg`}>
            {icon}
          </div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>
        <svg 
          className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          {children}
        </div>
      )}
    </div>
  )
}