/**
 * cleanupOrganizations.js
 * One-time script to consolidate to a single organization
 *
 * Run with: node scripts/cleanupOrganizations.js
 */

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Configuration - UPDATE THESE VALUES
const PRIMARY_ORG_NAME = 'Aeria Solutions Ltd'
const OWNER_EMAIL = 'dustin@aeria.ai'

// Initialize Firebase Admin
const serviceAccountPath = resolve(__dirname, 'serviceAccountKey.json')
let serviceAccount
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))
} catch (err) {
  console.error('Error: Could not read serviceAccountKey.json')
  process.exit(1)
}

initializeApp({ credential: cert(serviceAccount) })
const db = getFirestore()

// Collections that have organizationId
const COLLECTIONS = [
  'projects', 'clients', 'aircraft', 'equipment', 'services',
  'incidents', 'capas', 'trainingModules', 'trainingRecords',
  'complianceApplications', 'inspections', 'inspectionTemplates',
  'inspectionFindings', 'corAudits', 'corAuditors', 'corCertificates',
  'jhscMeetings', 'jhscMembers', 'jhscRecommendations', 'policies',
  'procedures', 'hazardAssessments', 'maintenanceLogs', 'permits',
  'checklists', 'checklistTemplates', 'flightLogs', 'attachments',
  'comments', 'notifications', 'distributionLists', 'insurancePolicies',
  'templates', 'knowledgeBase', 'equipmentAssignments', 'timeEntries'
]

async function cleanup() {
  console.log('========================================')
  console.log('Organization Cleanup Script')
  console.log('========================================')
  console.log(`Target Organization: ${PRIMARY_ORG_NAME}`)
  console.log(`Owner Email: ${OWNER_EMAIL}`)
  console.log('')

  // Step 1: Find the owner's user ID
  console.log('Step 1: Finding owner user...')
  const operatorsSnapshot = await db.collection('operators')
    .where('email', '==', OWNER_EMAIL)
    .limit(1)
    .get()

  if (operatorsSnapshot.empty) {
    console.error(`Error: No user found with email ${OWNER_EMAIL}`)
    process.exit(1)
  }

  const ownerId = operatorsSnapshot.docs[0].id
  console.log(`  Found owner: ${ownerId}`)

  // Step 2: Find all organizations
  console.log('\nStep 2: Finding organizations...')
  const orgsSnapshot = await db.collection('organizations').get()
  console.log(`  Found ${orgsSnapshot.size} organizations`)

  let primaryOrgId = null
  const orgsToDelete = []

  orgsSnapshot.forEach(doc => {
    const data = doc.data()
    console.log(`  - ${doc.id}: ${data.name} (created by: ${data.createdBy})`)

    // Keep the org created by the owner, or the first one
    if (data.createdBy === ownerId || (!primaryOrgId && data.name?.includes('Aeria'))) {
      primaryOrgId = doc.id
    } else {
      orgsToDelete.push(doc.id)
    }
  })

  if (!primaryOrgId && orgsSnapshot.size > 0) {
    primaryOrgId = orgsSnapshot.docs[0].id
  }

  console.log(`\n  Primary organization: ${primaryOrgId}`)
  console.log(`  Organizations to delete: ${orgsToDelete.length}`)

  // Step 3: Update primary organization name
  console.log('\nStep 3: Updating primary organization...')
  await db.collection('organizations').doc(primaryOrgId).update({
    name: PRIMARY_ORG_NAME,
    slug: 'aeria-solutions-ltd',
    updatedAt: FieldValue.serverTimestamp()
  })
  console.log(`  Updated name to: ${PRIMARY_ORG_NAME}`)

  // Step 4: Ensure owner membership exists
  console.log('\nStep 4: Ensuring owner membership...')
  const ownerMembershipId = `${ownerId}_${primaryOrgId}`
  const membershipRef = db.collection('organizationMembers').doc(ownerMembershipId)
  const membershipDoc = await membershipRef.get()

  if (!membershipDoc.exists) {
    await membershipRef.set({
      organizationId: primaryOrgId,
      userId: ownerId,
      email: OWNER_EMAIL,
      role: 'owner',
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })
    console.log('  Created owner membership')
  } else {
    await membershipRef.update({
      role: 'owner',
      status: 'active',
      updatedAt: FieldValue.serverTimestamp()
    })
    console.log('  Updated owner membership')
  }

  // Step 5: Migrate all data to primary organization
  console.log('\nStep 5: Migrating all data to primary organization...')
  let totalUpdated = 0

  for (const collectionName of COLLECTIONS) {
    try {
      const snapshot = await db.collection(collectionName).get()
      let updated = 0

      const batch = db.batch()
      let batchCount = 0

      for (const doc of snapshot.docs) {
        const data = doc.data()

        // Update if organizationId is different or missing
        if (data.organizationId !== primaryOrgId) {
          batch.update(doc.ref, {
            organizationId: primaryOrgId,
            updatedAt: FieldValue.serverTimestamp()
          })
          updated++
          batchCount++

          // Commit in batches of 100
          if (batchCount >= 100) {
            await batch.commit()
            batchCount = 0
          }
        }
      }

      if (batchCount > 0) {
        await batch.commit()
      }

      if (updated > 0) {
        console.log(`  ${collectionName}: ${updated} documents updated`)
        totalUpdated += updated
      }
    } catch (err) {
      console.log(`  ${collectionName}: skipped (${err.message})`)
    }
  }

  console.log(`\n  Total documents updated: ${totalUpdated}`)

  // Step 6: Delete other organizations and their memberships
  console.log('\nStep 6: Cleaning up other organizations...')
  for (const orgId of orgsToDelete) {
    // Delete memberships for this org
    const membershipsSnapshot = await db.collection('organizationMembers')
      .where('organizationId', '==', orgId)
      .get()

    for (const doc of membershipsSnapshot.docs) {
      await doc.ref.delete()
    }
    console.log(`  Deleted ${membershipsSnapshot.size} memberships for org ${orgId}`)

    // Delete the organization
    await db.collection('organizations').doc(orgId).delete()
    console.log(`  Deleted organization ${orgId}`)
  }

  console.log('\n========================================')
  console.log('Cleanup Complete!')
  console.log('========================================')
  console.log(`Primary Organization: ${PRIMARY_ORG_NAME}`)
  console.log(`Organization ID: ${primaryOrgId}`)
  console.log(`Owner: ${OWNER_EMAIL} (${ownerId})`)
  console.log('')
}

cleanup()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err)
    process.exit(1)
  })
