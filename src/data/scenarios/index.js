/**
 * Scenarios Index
 *
 * Central export for all training scenarios.
 * Import from here to access all scenarios.
 *
 * @version 1.0.0
 */

import smsScenarios from './smsScenarios.js'
import crmScenarios from './crmScenarios.js'
import rpasScenarios from './rpasScenarios.js'
import regulatoryScenarios from './regulatoryScenarios.js'
import riskScenarios from './riskScenarios.js'
import fieldSafetyScenarios from './fieldSafetyScenarios.js'
import wildlifeScenarios from './wildlifeScenarios.js'
import specializedScenarios from './specializedScenarios.js'

// All scenarios by category
export const scenariosByTrack = {
  sms: smsScenarios,
  crm: crmScenarios,
  rpasOps: rpasScenarios,
  regulatory: regulatoryScenarios,
  riskHazard: riskScenarios,
  fieldSafety: fieldSafetyScenarios,
  wildlife: wildlifeScenarios,
  specializedOps: specializedScenarios
}

// Flatten all scenarios into a single object
export const allScenarios = {
  ...smsScenarios,
  ...crmScenarios,
  ...rpasScenarios,
  ...regulatoryScenarios,
  ...riskScenarios,
  ...fieldSafetyScenarios,
  ...wildlifeScenarios,
  ...specializedScenarios
}

// Get scenario by ID
export function getScenario(scenarioId) {
  return allScenarios[scenarioId] || null
}

// Get scenarios for a specific track
export function getScenariosForTrack(trackId) {
  return Object.values(allScenarios).filter(
    scenario => scenario.trackId === trackId
  )
}

// Get scenarios for a specific quest
export function getScenariosForQuest(questId) {
  return Object.values(allScenarios).filter(
    scenario => scenario.questId === questId
  )
}

// Get all scenario IDs
export function getAllScenarioIds() {
  return Object.keys(allScenarios)
}

// Scenario statistics
export function getScenarioStats() {
  const scenarios = Object.values(allScenarios)
  return {
    total: scenarios.length,
    byDifficulty: {
      beginner: scenarios.filter(s => s.difficulty === 'beginner').length,
      intermediate: scenarios.filter(s => s.difficulty === 'intermediate').length,
      advanced: scenarios.filter(s => s.difficulty === 'advanced').length
    },
    totalXp: scenarios.reduce((sum, s) => sum + (s.xpReward || 0), 0),
    avgTime: scenarios.reduce((sum, s) => sum + (s.estimatedTime || 0), 0) / scenarios.length
  }
}

// Export individual scenario collections
export { smsScenarios, crmScenarios, rpasScenarios, regulatoryScenarios, riskScenarios, fieldSafetyScenarios, wildlifeScenarios, specializedScenarios }

export default allScenarios
