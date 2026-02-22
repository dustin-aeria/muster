/**
 * Training Content Seeding Script
 *
 * Seeds quest tracks, quests, lessons, quizzes, and scenarios to Firestore.
 * Supports incremental updates and validation.
 *
 * Usage:
 *   node --experimental-specifier-resolution=node seedTrainingContent.js
 *
 * Or with specific track:
 *   node seedTrainingContent.js --track=sms
 *
 * @version 1.0.0
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ES module compatibility
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Initialize Firebase Admin
const serviceAccountPath = resolve(__dirname, '../../scripts/serviceAccountKey.json')

if (!existsSync(serviceAccountPath)) {
  console.error('❌ Service account key not found at:', serviceAccountPath)
  console.error('Please ensure serviceAccountKey.json exists in the scripts folder')
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'))

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

// Collections
const COLLECTIONS = {
  TRACKS: 'trainingTracks',
  QUESTS: 'trainingQuests',
  LESSONS: 'trainingLessons',
  QUIZZES: 'trainingQuizzes',
  SCENARIOS: 'trainingScenarios',
  BADGES: 'trainingBadges',
  PROGRESS: 'userTrainingProgress'
}

/**
 * Batch write with progress logging
 * @param {Array} items - Items to write
 * @param {string} collectionName - Firestore collection name
 * @param {Function} transform - Transform function for each item
 */
async function batchWrite(items, collectionName, transform = (x) => x) {
  const batchSize = 500 // Firestore batch limit
  let processed = 0
  let created = 0
  let updated = 0
  let skipped = 0

  console.log(`\n📝 Writing ${items.length} items to ${collectionName}...`)

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = db.batch()
    const chunk = items.slice(i, i + batchSize)

    for (const item of chunk) {
      const data = transform(item)
      const docId = data.id || data.slug || `auto_${Date.now()}_${Math.random().toString(36).substring(7)}`
      const ref = db.collection(collectionName).doc(docId)

      // Check if document exists
      const existing = await ref.get()

      if (existing.exists) {
        const existingData = existing.data()
        // Only update if version is newer or content changed
        if (data.version && existingData.version && data.version <= existingData.version) {
          skipped++
          continue
        }
        batch.update(ref, {
          ...data,
          updatedAt: FieldValue.serverTimestamp()
        })
        updated++
      } else {
        batch.set(ref, {
          ...data,
          createdAt: FieldValue.serverTimestamp()
        })
        created++
      }

      processed++
    }

    await batch.commit()
    console.log(`  ✓ Batch ${Math.floor(i / batchSize) + 1} committed (${processed}/${items.length})`)
  }

  console.log(`  📊 Results: ${created} created, ${updated} updated, ${skipped} skipped`)
  return { created, updated, skipped }
}

/**
 * Seed a complete quest track with all nested content
 * @param {Object} track - Track data with quests and lessons
 * @param {string} organizationId - Organization ID (optional, for multi-tenant)
 */
async function seedTrack(track, organizationId = null) {
  console.log(`\n🎯 Seeding track: ${track.name}`)
  console.log(`   ${track.quests?.length || 0} quests, ${track.totalLessons || 0} lessons`)

  // Validate track structure
  const errors = validateTrackStructure(track)
  if (errors.length > 0) {
    console.error('❌ Validation errors:')
    errors.forEach(err => console.error(`   - ${err}`))
    throw new Error('Track validation failed')
  }

  // 1. Seed the track document
  const trackData = {
    ...track,
    organizationId,
    quests: undefined, // Don't store nested quests in track doc
    version: track.version || '1.0.0'
  }
  delete trackData.quests

  await db.collection(COLLECTIONS.TRACKS).doc(track.id).set({
    ...trackData,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true })
  console.log(`  ✓ Track document created: ${track.id}`)

  // 2. Seed quests
  const quests = track.quests || []
  for (const quest of quests) {
    const questData = {
      ...quest,
      organizationId,
      trackId: track.id,
      trackName: track.name,
      lessons: undefined // Don't store nested lessons in quest doc
    }
    delete questData.lessons

    await db.collection(COLLECTIONS.QUESTS).doc(quest.id).set({
      ...questData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true })

    // 3. Seed lessons for this quest
    const lessons = quest.lessons || []
    for (const lesson of lessons) {
      const lessonData = {
        ...lesson,
        organizationId,
        trackId: track.id,
        questId: quest.id,
        questTitle: quest.title
      }

      await db.collection(COLLECTIONS.LESSONS).doc(lesson.id).set({
        ...lessonData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true })
    }
    console.log(`  ✓ Quest "${quest.title}" with ${lessons.length} lessons`)
  }

  // 4. Seed quizzes if present
  if (track.quizzes && track.quizzes.length > 0) {
    await batchWrite(track.quizzes, COLLECTIONS.QUIZZES, (quiz) => ({
      ...quiz,
      organizationId,
      trackId: track.id
    }))
  }

  // 5. Seed scenarios if present
  if (track.scenarios && track.scenarios.length > 0) {
    await batchWrite(track.scenarios, COLLECTIONS.SCENARIOS, (scenario) => ({
      ...scenario,
      organizationId,
      trackId: track.id
    }))
  }

  // 6. Seed badge if present
  if (track.badge) {
    await db.collection(COLLECTIONS.BADGES).doc(track.badge.id || `badge_${track.id}`).set({
      ...track.badge,
      trackId: track.id,
      organizationId,
      createdAt: FieldValue.serverTimestamp()
    }, { merge: true })
    console.log(`  ✓ Badge "${track.badge.name}" created`)
  }

  console.log(`✅ Track "${track.name}" seeded successfully!`)
}

/**
 * Validate track structure
 * @param {Object} track - Track to validate
 * @returns {Array<string>} Array of error messages
 */
function validateTrackStructure(track) {
  const errors = []

  // Track-level validation
  if (!track.id) errors.push('Track missing ID')
  if (!track.name) errors.push('Track missing name')
  if (!track.slug) errors.push('Track missing slug')
  if (!track.description) errors.push('Track missing description')

  // Quest validation
  const quests = track.quests || []
  if (quests.length === 0) errors.push('Track has no quests')

  const questIds = new Set()
  for (const quest of quests) {
    if (!quest.id) errors.push(`Quest "${quest.title}" missing ID`)
    if (!quest.title) errors.push('Quest missing title')
    if (!quest.sequence) errors.push(`Quest "${quest.title}" missing sequence`)

    if (questIds.has(quest.id)) {
      errors.push(`Duplicate quest ID: ${quest.id}`)
    }
    questIds.add(quest.id)

    // Lesson validation
    const lessons = quest.lessons || []
    if (lessons.length === 0) errors.push(`Quest "${quest.title}" has no lessons`)

    const lessonIds = new Set()
    for (const lesson of lessons) {
      if (!lesson.id) errors.push(`Lesson "${lesson.title}" missing ID`)
      if (!lesson.title) errors.push('Lesson missing title')
      if (!lesson.content && lesson.type !== 'video') {
        errors.push(`Lesson "${lesson.title}" missing content`)
      }

      if (lessonIds.has(lesson.id)) {
        errors.push(`Duplicate lesson ID: ${lesson.id}`)
      }
      lessonIds.add(lesson.id)
    }
  }

  return errors
}

/**
 * Seed all training content from track data files
 * @param {Object} options - Seeding options
 */
async function seedAllContent(options = {}) {
  console.log('🚀 Starting training content seeding...')
  console.log(`   Target: ${options.trackFilter || 'All tracks'}`)
  console.log(`   Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`)

  // Import all track data
  const tracks = []

  try {
    // Dynamic imports for track data
    const trackModules = [
      '../data/questTracks/smsTrack.js',
      '../data/questTracks/crmTrack.js',
      '../data/questTracks/rpasOpsTrack.js',
      '../data/questTracks/regulatoryTrack.js',
      '../data/questTracks/riskHazardTrack.js',
      '../data/questTracks/fieldSafetyTrack.js',
      '../data/questTracks/wildlifeTrack.js',
      '../data/questTracks/specializedOpsTrack.js'
    ]

    for (const modulePath of trackModules) {
      try {
        const fullPath = resolve(__dirname, modulePath)
        if (existsSync(fullPath.replace('.js', '.js'))) {
          const module = await import(modulePath)
          if (module.default) {
            tracks.push(module.default)
          }
        }
      } catch (err) {
        console.warn(`  ⚠️ Could not load ${modulePath}: ${err.message}`)
      }
    }

    console.log(`\n📚 Found ${tracks.length} tracks to seed`)

    // Filter tracks if specified
    const filteredTracks = options.trackFilter
      ? tracks.filter(t => t.slug === options.trackFilter || t.id === options.trackFilter)
      : tracks

    if (filteredTracks.length === 0) {
      console.warn('⚠️ No matching tracks found')
      return
    }

    // Seed each track
    for (const track of filteredTracks) {
      if (options.dryRun) {
        console.log(`\n[DRY RUN] Would seed: ${track.name}`)
        const errors = validateTrackStructure(track)
        if (errors.length > 0) {
          console.log('  Validation errors:', errors)
        } else {
          console.log('  ✓ Validation passed')
        }
      } else {
        await seedTrack(track, options.organizationId)
      }
    }

    console.log('\n✨ Seeding complete!')

    // Print summary
    console.log('\n📊 Summary:')
    for (const track of filteredTracks) {
      console.log(`   ${track.name}: ${track.quests?.length || 0} quests, ${track.totalLessons || 0} lessons`)
    }

  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    throw error
  }
}

/**
 * Delete all training content (for reset/cleanup)
 * @param {boolean} confirm - Must be true to proceed
 */
async function deleteAllContent(confirm = false) {
  if (!confirm) {
    console.error('❌ Must pass confirm=true to delete all content')
    return
  }

  console.log('🗑️ Deleting all training content...')

  const collections = Object.values(COLLECTIONS)

  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get()

    if (snapshot.empty) {
      console.log(`  ✓ ${collectionName}: empty`)
      continue
    }

    const batch = db.batch()
    let count = 0

    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
      count++
    })

    await batch.commit()
    console.log(`  ✓ ${collectionName}: deleted ${count} documents`)
  }

  console.log('✅ All training content deleted')
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    dryRun: args.includes('--dry-run'),
    delete: args.includes('--delete'),
    trackFilter: null,
    organizationId: null
  }

  for (const arg of args) {
    if (arg.startsWith('--track=')) {
      options.trackFilter = arg.replace('--track=', '')
    }
    if (arg.startsWith('--org=')) {
      options.organizationId = arg.replace('--org=', '')
    }
  }

  return options
}

// Main execution
const options = parseArgs()

if (options.delete) {
  deleteAllContent(true)
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
} else {
  seedAllContent(options)
    .then(() => process.exit(0))
    .catch(() => process.exit(1))
}

// Export for use as module
export {
  seedTrack,
  seedAllContent,
  deleteAllContent,
  batchWrite,
  validateTrackStructure,
  COLLECTIONS
}
