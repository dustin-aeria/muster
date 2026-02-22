/**
 * Quest Tracks Index
 *
 * Central export for all training quest tracks.
 * Import from here to access all tracks.
 *
 * @version 1.0.0
 */

import smsTrack from './smsTrack.js'
import crmTrack from './crmTrack.js'
import rpasOpsTrack from './rpasOpsTrack.js'
import regulatoryTrack from './regulatoryTrack.js'
import riskHazardTrack from './riskHazardTrack.js'
import fieldSafetyTrack from './fieldSafetyTrack.js'
import wildlifeTrack from './wildlifeTrack.js'
import specializedOpsTrack from './specializedOpsTrack.js'

// All available tracks
export const tracks = {
  sms: smsTrack,
  crm: crmTrack,
  rpasOps: rpasOpsTrack,
  regulatory: regulatoryTrack,
  riskHazard: riskHazardTrack,
  fieldSafety: fieldSafetyTrack,
  wildlife: wildlifeTrack,
  specializedOps: specializedOpsTrack
}

// Track array for iteration
export const allTracks = [
  smsTrack,
  crmTrack,
  rpasOpsTrack,
  regulatoryTrack,
  riskHazardTrack,
  fieldSafetyTrack,
  wildlifeTrack,
  specializedOpsTrack
]

// Get track by ID or slug
export function getTrack(idOrSlug) {
  return allTracks.find(
    track => track.id === idOrSlug || track.slug === idOrSlug
  )
}

// Get all quests across all tracks
export function getAllQuests() {
  return allTracks.flatMap(track => track.quests || [])
}

// Get all lessons across all tracks
export function getAllLessons() {
  return allTracks.flatMap(track =>
    (track.quests || []).flatMap(quest => quest.lessons || [])
  )
}

// Get track by category
export function getTracksByCategory(category) {
  return allTracks.filter(track => track.category === category)
}

// Track categories
export const categories = [
  { id: 'safety', name: 'Safety Management', icon: 'Shield', color: 'emerald' },
  { id: 'human-factors', name: 'Human Factors', icon: 'Users', color: 'blue' },
  { id: 'operations', name: 'Operations', icon: 'Plane', color: 'indigo' },
  { id: 'regulatory', name: 'Regulatory', icon: 'FileCheck', color: 'purple' },
  { id: 'specialized', name: 'Specialized', icon: 'Star', color: 'amber' }
]

// Export individual tracks
export { smsTrack, crmTrack, rpasOpsTrack, regulatoryTrack, riskHazardTrack, fieldSafetyTrack, wildlifeTrack, specializedOpsTrack }

export default tracks
