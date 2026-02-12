/**
 * Claude API Service
 * Handles communication with Claude via Firebase Cloud Functions
 *
 * @location src/lib/claudeService.js
 */

import { getFunctions, httpsCallable } from 'firebase/functions'

/**
 * Ask Claude a question about a flashcard
 * Uses secure Cloud Function to keep API key server-side
 *
 * @param {Object} card - The flashcard object { question, answer, category }
 * @param {string} userQuestion - The user's question
 * @returns {Promise<string>} Claude's response
 */
export async function askQCardQuestion(card, userQuestion) {
  const functions = getFunctions()
  const askQuestion = httpsCallable(functions, 'askQCardQuestion')

  try {
    const result = await askQuestion({
      question: userQuestion,
      card: {
        question: card.question,
        answer: card.answer,
        category: card.category
      }
    })

    if (result.data?.success) {
      return result.data.response
    } else {
      throw new Error(result.data?.error || 'Failed to get response')
    }
  } catch (error) {
    // Handle Firebase function errors
    if (error.code === 'functions/unauthenticated') {
      throw new Error('Please log in to use the AI assistant.')
    }
    if (error.code === 'functions/resource-exhausted') {
      throw new Error('Too many requests. Please wait a moment and try again.')
    }
    if (error.code === 'functions/failed-precondition') {
      throw new Error('AI service is not available. Please try again later.')
    }

    console.error('Claude API error:', error)
    throw new Error(error.message || 'Failed to get AI response. Please try again.')
  }
}

export default {
  askQCardQuestion
}
