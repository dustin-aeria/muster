/**
 * QCards.jsx
 * Flashcard Study Component for L1C RPAS Training
 *
 * Features:
 * - Tap to reveal answers
 * - Shuffle cards
 * - Filter by category
 * - Mark as known (persisted to localStorage)
 * - Progress tracking
 * - AI-powered study assistance (Claude)
 *
 * @location src/components/training/QCards.jsx
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Shuffle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  Filter,
  Eye,
  EyeOff,
  RefreshCw,
  BookOpen,
  Award,
  Target,
  MessageCircle,
  Send,
  Loader2,
  Lightbulb,
  HelpCircle,
  Sparkles
} from 'lucide-react'

import { L1C_FLASHCARDS, FLASHCARD_CATEGORIES } from '../../data/l1cFlashcards'
import { askQCardQuestion } from '../../lib/claudeService'

const STORAGE_KEY = 'muster_qcards_known'

export default function QCards() {
  // State
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [knownCards, setKnownCards] = useState(new Set())
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showKnown, setShowKnown] = useState(true)
  const [shuffledCards, setShuffledCards] = useState([])
  const [isShuffled, setIsShuffled] = useState(false)

  // AI Assistant state
  const [showAiPanel, setShowAiPanel] = useState(false)
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  // Load known cards from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setKnownCards(new Set(parsed))
      } catch (e) {
        console.error('Failed to load known cards:', e)
      }
    }
  }, [])

  // Save known cards to localStorage when they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...knownCards]))
  }, [knownCards])

  // Clear AI response when card changes
  useEffect(() => {
    setAiResponse('')
    setAiQuestion('')
    setAiError('')
  }, [currentIndex])

  // Filter and optionally shuffle cards
  const filteredCards = useMemo(() => {
    let cards = L1C_FLASHCARDS

    // Filter by category
    if (categoryFilter) {
      cards = cards.filter(card => card.category === categoryFilter)
    }

    // Filter out known cards if hiding them
    if (!showKnown) {
      cards = cards.filter(card => !knownCards.has(card.id))
    }

    return cards
  }, [categoryFilter, showKnown, knownCards])

  // Apply shuffle if active
  const displayCards = useMemo(() => {
    if (isShuffled && shuffledCards.length > 0) {
      // Filter shuffled cards based on current filters
      return shuffledCards.filter(card => {
        const matchesCategory = !categoryFilter || card.category === categoryFilter
        const matchesKnown = showKnown || !knownCards.has(card.id)
        return matchesCategory && matchesKnown
      })
    }
    return filteredCards
  }, [isShuffled, shuffledCards, filteredCards, categoryFilter, showKnown, knownCards])

  // Current card
  const currentCard = displayCards[currentIndex] || null

  // Reset index when filters change
  useEffect(() => {
    setCurrentIndex(0)
    setIsFlipped(false)
  }, [categoryFilter, showKnown])

  // Shuffle function
  const handleShuffle = useCallback(() => {
    const shuffled = [...L1C_FLASHCARDS].sort(() => Math.random() - 0.5)
    setShuffledCards(shuffled)
    setIsShuffled(true)
    setCurrentIndex(0)
    setIsFlipped(false)
  }, [])

  // Reset to original order
  const handleResetOrder = useCallback(() => {
    setShuffledCards([])
    setIsShuffled(false)
    setCurrentIndex(0)
    setIsFlipped(false)
  }, [])

  // Navigation
  const goToNext = useCallback(() => {
    if (currentIndex < displayCards.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setIsFlipped(false)
    }
  }, [currentIndex, displayCards.length])

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
      setIsFlipped(false)
    }
  }, [currentIndex])

  // Mark as known/unknown
  const toggleKnown = useCallback((cardId) => {
    setKnownCards(prev => {
      const next = new Set(prev)
      if (next.has(cardId)) {
        next.delete(cardId)
      } else {
        next.add(cardId)
      }
      return next
    })
  }, [])

  // Mark current and go to next
  const markKnownAndNext = useCallback(() => {
    if (currentCard) {
      setKnownCards(prev => new Set([...prev, currentCard.id]))
      // Only advance if not at the end
      if (currentIndex < displayCards.length - 1) {
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1)
          setIsFlipped(false)
        }, 200)
      }
    }
  }, [currentCard, currentIndex, displayCards.length])

  // Reset all progress
  const resetProgress = useCallback(() => {
    if (window.confirm('Reset all progress? This will mark all cards as unknown.')) {
      setKnownCards(new Set())
      setCurrentIndex(0)
      setIsFlipped(false)
    }
  }, [])

  // AI Assistant functions
  const handleAskClaude = async (questionText = aiQuestion) => {
    if (!questionText.trim() || !currentCard) return

    setAiLoading(true)
    setAiError('')
    setAiResponse('')

    try {
      const response = await askQCardQuestion(currentCard, questionText)
      setAiResponse(response)
    } catch (error) {
      setAiError(error.message)
    } finally {
      setAiLoading(false)
    }
  }

  const quickPrompts = [
    { label: 'Explain', icon: Lightbulb, prompt: 'Can you explain this concept in simpler terms?' },
    { label: 'Example', icon: Sparkles, prompt: 'Can you give me a real-world example of this?' },
    { label: 'Why?', icon: HelpCircle, prompt: 'Why is this important for RPAS operations?' }
  ]

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't handle if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious()
          break
        case 'ArrowRight':
          goToNext()
          break
        case ' ':
        case 'Enter':
          e.preventDefault()
          setIsFlipped(prev => !prev)
          break
        case 'k':
        case 'K':
          if (currentCard) {
            markKnownAndNext()
          }
          break
        case 'a':
        case 'A':
          setShowAiPanel(prev => !prev)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNext, goToPrevious, currentCard, markKnownAndNext])

  // Stats
  const totalCards = L1C_FLASHCARDS.length
  const knownCount = knownCards.size
  const progressPercent = Math.round((knownCount / totalCards) * 100)

  // Get category info
  const getCategoryInfo = (categoryId) => {
    return FLASHCARD_CATEGORIES[categoryId] || { name: categoryId, color: 'bg-gray-100 text-gray-700' }
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Cards</p>
              <p className="text-2xl font-bold text-gray-900">{totalCards}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Known</p>
              <p className="text-2xl font-bold text-green-600">{knownCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <p className="text-2xl font-bold text-aeria-blue">{progressPercent}%</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent text-sm"
            >
              <option value="">All Categories ({totalCards})</option>
              {Object.entries(FLASHCARD_CATEGORIES).map(([key, cat]) => {
                const count = L1C_FLASHCARDS.filter(c => c.category === key).length
                return (
                  <option key={key} value={key}>{cat.name} ({count})</option>
                )
              })}
            </select>
          </div>

          {/* Shuffle Toggle */}
          <button
            onClick={isShuffled ? handleResetOrder : handleShuffle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isShuffled
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isShuffled ? (
              <>
                <RotateCcw className="w-4 h-4" />
                Reset Order
              </>
            ) : (
              <>
                <Shuffle className="w-4 h-4" />
                Shuffle
              </>
            )}
          </button>

          {/* Show/Hide Known */}
          <button
            onClick={() => setShowKnown(!showKnown)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showKnown
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {showKnown ? (
              <>
                <Eye className="w-4 h-4" />
                Showing All
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                Hiding Known
              </>
            )}
          </button>

          {/* AI Assistant Toggle */}
          <button
            onClick={() => setShowAiPanel(!showAiPanel)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showAiPanel
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Ask Claude
          </button>

          {/* Reset Progress */}
          <button
            onClick={resetProgress}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Progress
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`grid gap-6 ${showAiPanel ? 'lg:grid-cols-2' : ''}`}>
        {/* Flashcard Display */}
        <div>
          {displayCards.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Award className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {!showKnown ? 'All cards marked as known!' : 'No cards in this category'}
              </h3>
              <p className="text-gray-600 mb-4">
                {!showKnown
                  ? 'Great job! Toggle "Hiding Known" to review all cards again.'
                  : 'Try selecting a different category.'}
              </p>
              {!showKnown && (
                <button
                  onClick={() => setShowKnown(true)}
                  className="px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors"
                >
                  Show All Cards
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {/* Card Counter */}
              <div className="text-sm text-gray-500 mb-4">
                Card {currentIndex + 1} of {displayCards.length}
                {isShuffled && <span className="ml-2 text-amber-600">(Shuffled)</span>}
              </div>

              {/* The Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full max-w-2xl cursor-pointer perspective-1000"
              >
                <div
                  className={`relative w-full min-h-[320px] transition-transform duration-500 transform-style-3d ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  {/* Front (Question) */}
                  <div
                    className={`absolute inset-0 bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 flex flex-col backface-hidden ${
                      isFlipped ? 'invisible' : ''
                    }`}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    {/* Category Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 text-sm rounded-full ${getCategoryInfo(currentCard.category).color}`}>
                        {getCategoryInfo(currentCard.category).name}
                      </span>
                      {knownCards.has(currentCard.id) && (
                        <span className="flex items-center gap-1 text-green-600 text-sm">
                          <Check className="w-4 h-4" />
                          Known
                        </span>
                      )}
                    </div>

                    {/* Question */}
                    <div className="flex-1 flex items-center justify-center">
                      <h3 className="text-xl md:text-2xl font-semibold text-gray-900 text-center">
                        {currentCard.question}
                      </h3>
                    </div>

                    {/* Tap hint */}
                    <p className="text-center text-gray-400 text-sm mt-4">
                      Tap to reveal answer
                    </p>
                  </div>

                  {/* Back (Answer) */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br from-aeria-blue to-aeria-navy rounded-2xl shadow-lg p-8 flex flex-col text-white backface-hidden ${
                      !isFlipped ? 'invisible' : ''
                    }`}
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    {/* Category Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 text-sm rounded-full bg-white/20">
                        {getCategoryInfo(currentCard.category).name}
                      </span>
                      {knownCards.has(currentCard.id) && (
                        <span className="flex items-center gap-1 text-green-300 text-sm">
                          <Check className="w-4 h-4" />
                          Known
                        </span>
                      )}
                    </div>

                    {/* Answer */}
                    <div className="flex-1 flex items-center justify-center overflow-auto">
                      <p className="text-lg md:text-xl text-white/95 whitespace-pre-line text-center">
                        {currentCard.answer}
                      </p>
                    </div>

                    {/* Tap hint */}
                    <p className="text-center text-white/50 text-sm mt-4">
                      Tap to see question
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation & Actions */}
              <div className="flex items-center justify-center gap-4 mt-6 w-full max-w-2xl">
                {/* Previous */}
                <button
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                  className="p-3 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Mark Unknown */}
                <button
                  onClick={() => {
                    if (currentCard && knownCards.has(currentCard.id)) {
                      toggleKnown(currentCard.id)
                    }
                  }}
                  disabled={!currentCard || !knownCards.has(currentCard.id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <X className="w-5 h-5" />
                  Don't Know
                </button>

                {/* Mark Known */}
                <button
                  onClick={markKnownAndNext}
                  disabled={!currentCard}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Check className="w-5 h-5" />
                  Know It
                </button>

                {/* Next */}
                <button
                  onClick={goToNext}
                  disabled={currentIndex >= displayCards.length - 1}
                  className="p-3 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Keyboard Hints */}
              <div className="mt-6 text-center text-sm text-gray-400">
                <p>Keyboard: <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">Space</kbd> flip | <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">&larr;</kbd> <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">&rarr;</kbd> navigate | <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">K</kbd> known | <kbd className="px-2 py-1 bg-gray-100 rounded text-gray-600">A</kbd> AI</p>
              </div>
            </div>
          )}
        </div>

        {/* AI Assistant Panel */}
        {showAiPanel && currentCard && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Ask Claude</h3>
                  <p className="text-xs text-gray-500">AI-powered study assistant</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiPanel(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Prompts */}
                <div className="flex gap-2 mb-4">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setAiQuestion(prompt.prompt)
                        handleAskClaude(prompt.prompt)
                      }}
                      disabled={aiLoading}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 disabled:opacity-50 transition-colors"
                    >
                      <prompt.icon className="w-3.5 h-3.5" />
                      {prompt.label}
                    </button>
                  ))}
                </div>

                {/* Response Area */}
                <div className="flex-1 overflow-auto mb-4 p-4 bg-gray-50 rounded-lg">
                  {aiLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                      <span className="ml-2 text-gray-600">Thinking...</span>
                    </div>
                  ) : aiError ? (
                    <div className="text-red-600 text-sm">
                      <p className="font-medium mb-1">Error</p>
                      <p>{aiError}</p>
                    </div>
                  ) : aiResponse ? (
                    <div className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                      {aiResponse}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                      <Sparkles className="w-8 h-8 mb-2" />
                      <p>Ask a question about this card</p>
                      <p className="text-xs mt-1">Try the quick prompts above or type your own</p>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleAskClaude()
                      }
                    }}
                    placeholder="Ask about this card..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    disabled={aiLoading}
                  />
                  <button
                    onClick={() => handleAskClaude()}
                    disabled={aiLoading || !aiQuestion.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
          </div>
        )}
      </div>
    </div>
  )
}
