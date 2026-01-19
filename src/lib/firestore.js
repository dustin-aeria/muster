/**
 * FIRESTORE COORDINATE SERIALIZATION FIX
 * 
 * Add these functions to firestore.js after the imports section.
 * Then update getProject and updateProject as shown below.
 * 
 * Problem: Firestore doesn't support nested arrays (e.g., polygon coordinates [[lng,lat], [lng,lat]])
 * Solution: Serialize coordinate arrays to JSON strings before saving, deserialize after loading
 */

// ============================================
// COORDINATE SERIALIZATION HELPERS
// Add these after the imports in firestore.js
// ============================================

const COORDINATE_MARKER = '__COORDS__:'

/**
 * Check if a value is a coordinate array (array of [number, number] pairs)
 */
function isCoordinateArray(value) {
  if (!Array.isArray(value) || value.length === 0) return false
  // Check if first element is an array of 2 numbers (coordinate pair)
  const first = value[0]
  if (Array.isArray(first) && first.length === 2 && 
      typeof first[0] === 'number' && typeof first[1] === 'number') {
    return true
  }
  return false
}

/**
 * Recursively serialize nested arrays (coordinates) to JSON strings
 * This prevents Firestore "nested arrays not supported" error
 */
function serializeForFirestore(obj) {
  if (obj === null || obj === undefined) return obj
  if (typeof obj !== 'object') return obj
  
  if (Array.isArray(obj)) {
    // Check if this is a coordinate array (nested array)
    if (isCoordinateArray(obj)) {
      return COORDINATE_MARKER + JSON.stringify(obj)
    }
    // Otherwise, recursively process array elements
    return obj.map(item => serializeForFirestore(item))
  }
  
  // For objects, recursively process each property
  const result = {}
  for (const key of Object.keys(obj)) {
    result[key] = serializeForFirestore(obj[key])
  }
  return result
}

/**
 * Recursively deserialize JSON strings back to coordinate arrays
 */
function deserializeFromFirestore(obj) {
  if (obj === null || obj === undefined) return obj
  
  if (typeof obj === 'string' && obj.startsWith(COORDINATE_MARKER)) {
    try {
      return JSON.parse(obj.slice(COORDINATE_MARKER.length))
    } catch (e) {
      console.warn('Failed to parse coordinates:', obj)
      return obj
    }
  }
  
  if (typeof obj !== 'object') return obj
  
  if (Array.isArray(obj)) {
    return obj.map(item => deserializeFromFirestore(item))
  }
  
  // For objects, recursively process each property
  const result = {}
  for (const key of Object.keys(obj)) {
    result[key] = deserializeFromFirestore(obj[key])
  }
  return result
}

// ============================================
// UPDATED getProject FUNCTION
// Replace the existing getProject with this:
// ============================================

export async function getProject(id) {
  const docRef = doc(db, 'projects', id)
  const snapshot = await getDoc(docRef)
  
  if (!snapshot.exists()) {
    throw new Error('Project not found')
  }
  
  // Deserialize coordinate strings back to arrays
  const data = deserializeFromFirestore(snapshot.data())
  return { id: snapshot.id, ...data }
}

// ============================================
// UPDATED updateProject FUNCTION
// Replace the existing updateProject with this:
// ============================================

export async function updateProject(id, data) {
  const docRef = doc(db, 'projects', id)
  
  // Serialize nested arrays (coordinates) to JSON strings
  const serializedData = serializeForFirestore(data)
  
  await updateDoc(docRef, {
    ...serializedData,
    updatedAt: serverTimestamp()
  })
}
