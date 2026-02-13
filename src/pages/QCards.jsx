/**
 * QCards.jsx
 * Page wrapper for the Q-Cards training component
 *
 * @location src/pages/QCards.jsx
 */

import QCardsComponent from '../components/training/QCards'

export default function QCards() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Q-Cards</h1>
        <p className="text-gray-600 mt-1">Study flashcards for RPAS L1C certification</p>
      </div>
      <QCardsComponent />
    </div>
  )
}
