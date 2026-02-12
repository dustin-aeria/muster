/**
 * Claude API Service
 * Handles communication with Anthropic's Claude API
 *
 * @location src/lib/claudeService.js
 */

import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages'

/**
 * Get the stored Claude API key for a user
 * @param {string} userId - Firebase user ID
 * @returns {Promise<string|null>} API key or null
 */
export async function getClaudeApiKey(userId) {
  try {
    const docRef = doc(db, 'userPreferences', userId)
    const snapshot = await getDoc(docRef)
    if (snapshot.exists()) {
      return snapshot.data().claudeApiKey || null
    }
    return null
  } catch (error) {
    console.error('Error fetching Claude API key:', error)
    return null
  }
}

/**
 * Save the Claude API key for a user
 * @param {string} userId - Firebase user ID
 * @param {string} apiKey - Claude API key
 */
export async function saveClaudeApiKey(userId, apiKey) {
  try {
    const docRef = doc(db, 'userPreferences', userId)
    await setDoc(docRef, { claudeApiKey: apiKey }, { merge: true })
    return true
  } catch (error) {
    console.error('Error saving Claude API key:', error)
    throw error
  }
}

/**
 * Send a message to Claude API
 * @param {string} apiKey - Claude API key
 * @param {string} systemPrompt - System context
 * @param {string} userMessage - User's question
 * @returns {Promise<string>} Claude's response
 */
export async function askClaude(apiKey, systemPrompt, userMessage) {
  if (!apiKey) {
    throw new Error('No API key configured. Please add your Claude API key in Settings > Integrations.')
  }

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your Claude API key in Settings > Integrations.')
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.')
      }
      throw new Error(errorData.error?.message || `API error: ${response.status}`)
    }

    const data = await response.json()
    return data.content?.[0]?.text || 'No response received.'
  } catch (error) {
    if (error.message.includes('API key') || error.message.includes('Rate limit')) {
      throw error
    }
    console.error('Claude API error:', error)
    throw new Error('Failed to connect to Claude. Please check your connection and try again.')
  }
}

/**
 * Generate a study assistant prompt for flashcards
 * @param {Object} card - The flashcard object
 * @returns {string} System prompt for Claude
 */
export function generateFlashcardSystemPrompt(card) {
  return `You are a knowledgeable RPAS (Remotely Piloted Aircraft Systems) instructor helping a student study for their Level 1 Complex Operations certification in Canada.

The student is studying the following flashcard:

**Question:** ${card.question}

**Correct Answer:** ${card.answer}

Your role is to:
1. Help explain concepts in different ways if the student is confused
2. Provide real-world examples and scenarios
3. Connect this topic to related regulations or concepts
4. Help the student understand WHY this information is important for safe RPAS operations
5. Answer follow-up questions about this topic

Keep responses concise but helpful. Use bullet points for clarity when appropriate. Reference specific regulations (CARs, TP documents) when relevant.`
}

export default {
  getClaudeApiKey,
  saveClaudeApiKey,
  askClaude,
  generateFlashcardSystemPrompt
}
