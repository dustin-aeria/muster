/**
 * Training Content Transformer
 *
 * Utilities for parsing Word document content structure and transforming
 * it into Firestore quest/lesson data structures.
 *
 * @version 1.0.0
 */

import { v4 as uuidv4 } from 'uuid'

/**
 * Generate a unique ID for quests/lessons
 * @param {string} prefix - Prefix for the ID (e.g., 'quest', 'lesson')
 * @returns {string} Unique ID
 */
export function generateId(prefix = 'item') {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}_${timestamp}_${random}`
}

/**
 * Generate a slug from a title
 * @param {string} title - Title to slugify
 * @returns {string} URL-safe slug
 */
export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50)
}

/**
 * Parse document structure to extract headings and content hierarchy
 * @param {string} rawContent - Raw text content from Word document
 * @returns {Object} Parsed document structure
 */
export function parseDocumentStructure(rawContent) {
  const lines = rawContent.split('\n')
  const structure = {
    title: '',
    sections: [],
    metadata: {}
  }

  let currentSection = null
  let currentSubsection = null

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Detect main headings (all caps or starting with numbers)
    if (/^[A-Z][A-Z\s]+$/.test(trimmed) || /^(?:MODULE|SECTION|CHAPTER)\s*\d+/i.test(trimmed)) {
      if (currentSection) {
        structure.sections.push(currentSection)
      }
      currentSection = {
        title: trimmed,
        content: [],
        subsections: []
      }
      currentSubsection = null
    }
    // Detect subsections (numbered like 1.1, 2.3, etc.)
    else if (/^\d+\.\d+/.test(trimmed)) {
      if (currentSection) {
        if (currentSubsection) {
          currentSection.subsections.push(currentSubsection)
        }
        currentSubsection = {
          title: trimmed,
          content: []
        }
      }
    }
    // Regular content
    else {
      if (currentSubsection) {
        currentSubsection.content.push(trimmed)
      } else if (currentSection) {
        currentSection.content.push(trimmed)
      } else {
        // Content before first section - likely title or intro
        if (!structure.title && trimmed.length > 5) {
          structure.title = trimmed
        }
      }
    }
  }

  // Push final section/subsection
  if (currentSubsection && currentSection) {
    currentSection.subsections.push(currentSubsection)
  }
  if (currentSection) {
    structure.sections.push(currentSection)
  }

  return structure
}

/**
 * Extract learning objectives from content
 * @param {string} content - Text content
 * @returns {Array<string>} Learning objectives
 */
export function extractLearningObjectives(content) {
  const objectives = []
  const patterns = [
    /(?:learning objectives?|objectives?|by the end.*you will)[:.]?\s*([^.]+)/gi,
    /(?:understand|explain|identify|describe|demonstrate|apply|analyze)\s+([^.]+)/gi
  ]

  for (const pattern of patterns) {
    const matches = content.matchAll(pattern)
    for (const match of matches) {
      const obj = match[1]?.trim()
      if (obj && obj.length > 10 && obj.length < 200) {
        objectives.push(obj)
      }
    }
  }

  return [...new Set(objectives)].slice(0, 5)
}

/**
 * Extract key points from content
 * @param {string} content - Text content
 * @returns {Array<string>} Key points
 */
export function extractKeyPoints(content) {
  const keyPoints = []

  // Look for bullet points, numbered items, or emphasized text
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()

    // Bullet points
    if (/^[•\-\*]\s*/.test(trimmed)) {
      const point = trimmed.replace(/^[•\-\*]\s*/, '').trim()
      if (point.length > 10 && point.length < 200) {
        keyPoints.push(point)
      }
    }

    // Numbered items
    if (/^\d+[.)]\s*/.test(trimmed)) {
      const point = trimmed.replace(/^\d+[.)]\s*/, '').trim()
      if (point.length > 10 && point.length < 200) {
        keyPoints.push(point)
      }
    }

    // Important/Note markers
    if (/^(?:important|note|key|remember)[:]/i.test(trimmed)) {
      const point = trimmed.replace(/^(?:important|note|key|remember)[:]\s*/i, '').trim()
      if (point.length > 10) {
        keyPoints.push(point)
      }
    }
  }

  return [...new Set(keyPoints)].slice(0, 10)
}

/**
 * Extract regulatory references from content
 * @param {string} content - Text content
 * @returns {Array<Object>} Regulatory references
 */
export function extractRegulatoryReferences(content) {
  const references = []

  const patterns = [
    { regex: /CAR[S]?\s*(\d+\.?\d*)/gi, type: 'CAR' },
    { regex: /Standard\s+(\d+\.?\d*)/gi, type: 'Standard' },
    { regex: /SOR\/\d{2,4}-\d+/gi, type: 'SOR' },
    { regex: /(?:CARs?\s*Part\s*)([IVX]+|\d+)/gi, type: 'CARs Part' },
    { regex: /SORA\s*([\d.]+)?/gi, type: 'SORA' },
    { regex: /AC\s*(\d+-\d+)/gi, type: 'Advisory Circular' }
  ]

  for (const { regex, type } of patterns) {
    const matches = content.matchAll(regex)
    for (const match of matches) {
      references.push({
        type,
        reference: match[0].trim(),
        section: match[1] || null
      })
    }
  }

  // Remove duplicates
  const unique = []
  const seen = new Set()
  for (const ref of references) {
    const key = `${ref.type}-${ref.reference}`
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(ref)
    }
  }

  return unique
}

/**
 * Convert parsed section into a quest structure
 * @param {Object} section - Parsed document section
 * @param {string} trackId - Parent track ID
 * @param {number} sequence - Quest sequence number
 * @returns {Object} Quest data structure
 */
export function sectionToQuest(section, trackId, sequence) {
  const questId = generateId('quest')
  const content = section.content.join(' ')

  return {
    id: questId,
    trackId,
    slug: slugify(section.title),
    title: cleanTitle(section.title),
    description: extractDescription(content),
    sequence,
    estimatedDuration: estimateDuration(content, section.subsections.length),
    difficulty: estimateDifficulty(content),
    objectives: extractLearningObjectives(content),
    keyPoints: extractKeyPoints(content),
    regulatoryRefs: extractRegulatoryReferences(content),
    totalLessons: section.subsections.length || 1,
    xpReward: calculateXpReward(section.subsections.length || 1),
    hasQuiz: true,
    hasScenario: shouldHaveScenario(section.title),
    isActive: true,
    createdAt: new Date().toISOString()
  }
}

/**
 * Convert subsection into a lesson structure
 * @param {Object} subsection - Parsed document subsection
 * @param {string} questId - Parent quest ID
 * @param {number} sequence - Lesson sequence number
 * @returns {Object} Lesson data structure
 */
export function subsectionToLesson(subsection, questId, sequence) {
  const lessonId = generateId('lesson')
  const content = subsection.content.join('\n')

  return {
    id: lessonId,
    questId,
    slug: slugify(subsection.title),
    title: cleanTitle(subsection.title),
    content: formatLessonContent(content),
    sequence,
    type: determineLessonType(content),
    estimatedDuration: Math.max(3, Math.ceil(content.length / 500)),
    keyPoints: extractKeyPoints(content),
    regulatoryRefs: extractRegulatoryReferences(content),
    xpReward: 10 + (sequence * 2),
    isActive: true,
    createdAt: new Date().toISOString()
  }
}

/**
 * Clean up a title string
 * @param {string} title - Raw title
 * @returns {string} Cleaned title
 */
function cleanTitle(title) {
  return title
    .replace(/^\d+\.?\d*\s*/, '') // Remove leading numbers
    .replace(/^(?:MODULE|SECTION|CHAPTER)\s*\d*:?\s*/i, '') // Remove section prefixes
    .replace(/[_]+/g, ' ') // Replace underscores
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

/**
 * Extract description from content (first ~200 chars that make sense)
 * @param {string} content - Raw content
 * @returns {string} Description
 */
function extractDescription(content) {
  const sentences = content.split(/[.!?]+/)
  let description = ''

  for (const sentence of sentences) {
    const trimmed = sentence.trim()
    if (trimmed.length < 10) continue

    description += trimmed + '. '
    if (description.length >= 150) break
  }

  return description.trim().substring(0, 200)
}

/**
 * Estimate reading/learning duration in minutes
 * @param {string} content - Content text
 * @param {number} subsectionCount - Number of subsections
 * @returns {number} Estimated duration in minutes
 */
function estimateDuration(content, subsectionCount) {
  // Average reading speed: 200-250 words per minute
  // Learning retention factor: 2x for comprehension
  const words = content.split(/\s+/).length
  const readingTime = Math.ceil(words / 150) // Slower for learning
  const lessonTime = subsectionCount * 5 // 5 min per lesson average

  return Math.max(10, readingTime + lessonTime)
}

/**
 * Estimate difficulty based on content analysis
 * @param {string} content - Content text
 * @returns {string} Difficulty level
 */
function estimateDifficulty(content) {
  const complexTerms = [
    'analysis', 'calculate', 'derive', 'evaluate', 'synthesize',
    'integrate', 'methodology', 'framework', 'matrix', 'algorithm'
  ]

  const advancedTerms = [
    'SAIL', 'GRC', 'ARC', 'OSO', 'SORA', 'ConOps',
    'FMEA', 'FHA', 'bow-tie', 'monte carlo'
  ]

  const lowerContent = content.toLowerCase()

  let complexCount = 0
  let advancedCount = 0

  for (const term of complexTerms) {
    if (lowerContent.includes(term)) complexCount++
  }

  for (const term of advancedTerms) {
    if (lowerContent.includes(term.toLowerCase())) advancedCount++
  }

  if (advancedCount >= 3 || complexCount >= 5) return 'advanced'
  if (advancedCount >= 1 || complexCount >= 2) return 'intermediate'
  return 'beginner'
}

/**
 * Calculate XP reward based on lesson count
 * @param {number} lessonCount - Number of lessons
 * @returns {number} XP reward
 */
function calculateXpReward(lessonCount) {
  const baseXp = 50
  const perLesson = 15
  return baseXp + (lessonCount * perLesson)
}

/**
 * Determine if a quest should have an interactive scenario
 * @param {string} title - Quest title
 * @returns {boolean} Whether to include scenario
 */
function shouldHaveScenario(title) {
  const scenarioKeywords = [
    'procedure', 'emergency', 'decision', 'assessment', 'response',
    'operation', 'management', 'handling', 'scenario', 'culture'
  ]

  const lowerTitle = title.toLowerCase()
  return scenarioKeywords.some(keyword => lowerTitle.includes(keyword))
}

/**
 * Determine lesson type based on content
 * @param {string} content - Lesson content
 * @returns {string} Lesson type
 */
function determineLessonType(content) {
  const lowerContent = content.toLowerCase()

  if (/definition|what is|means that|refers to/i.test(content)) return 'definition'
  if (/step\s*\d|procedure|process|how to/i.test(content)) return 'procedure'
  if (/example|scenario|case study|situation/i.test(content)) return 'scenario'
  if (/quiz|question|test|assessment/i.test(content)) return 'assessment'
  if (/video|watch|demonstration/i.test(content)) return 'video'

  return 'content'
}

/**
 * Format lesson content with proper HTML/Markdown structure
 * @param {string} content - Raw content
 * @returns {string} Formatted content
 */
function formatLessonContent(content) {
  // Convert bullet points to HTML lists
  let formatted = content
    .replace(/^[•\-\*]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')

  // Convert numbered lists
  formatted = formatted
    .replace(/^\d+[.)]\s+(.+)$/gm, '<li>$1</li>')

  // Wrap paragraphs
  formatted = formatted
    .split('\n\n')
    .map(para => {
      if (para.startsWith('<ul>') || para.startsWith('<ol>') || para.startsWith('<li>')) {
        return para
      }
      return `<p>${para.trim()}</p>`
    })
    .join('\n')

  // Bold important terms
  formatted = formatted
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^(Important|Note|Warning|Tip):/gm, '<strong>$1:</strong>')

  return formatted
}

/**
 * Transform a complete Word document into quest track structure
 * @param {string} rawContent - Full document content
 * @param {Object} trackMeta - Track metadata (name, description, etc.)
 * @returns {Object} Complete track structure with quests and lessons
 */
export function transformDocumentToTrack(rawContent, trackMeta) {
  const trackId = generateId('track')
  const structure = parseDocumentStructure(rawContent)

  const track = {
    id: trackId,
    slug: slugify(trackMeta.name || structure.title),
    name: trackMeta.name || structure.title,
    description: trackMeta.description || extractDescription(rawContent),
    category: trackMeta.category || 'general',
    icon: trackMeta.icon || 'BookOpen',
    color: trackMeta.color || 'blue',
    totalQuests: structure.sections.length,
    totalLessons: 0,
    totalXp: 0,
    estimatedHours: 0,
    badge: trackMeta.badge || null,
    prerequisites: trackMeta.prerequisites || [],
    isActive: true,
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    quests: []
  }

  // Transform sections into quests
  structure.sections.forEach((section, index) => {
    const quest = sectionToQuest(section, trackId, index + 1)
    quest.lessons = []

    // Transform subsections into lessons
    if (section.subsections.length > 0) {
      section.subsections.forEach((subsection, lessonIndex) => {
        const lesson = subsectionToLesson(subsection, quest.id, lessonIndex + 1)
        quest.lessons.push(lesson)
        track.totalLessons++
      })
    } else {
      // Create a single lesson from section content
      const lesson = {
        id: generateId('lesson'),
        questId: quest.id,
        slug: slugify(section.title),
        title: cleanTitle(section.title),
        content: formatLessonContent(section.content.join('\n')),
        sequence: 1,
        type: 'content',
        estimatedDuration: quest.estimatedDuration,
        keyPoints: quest.keyPoints,
        regulatoryRefs: quest.regulatoryRefs,
        xpReward: 25,
        isActive: true,
        createdAt: new Date().toISOString()
      }
      quest.lessons.push(lesson)
      track.totalLessons++
    }

    track.totalXp += quest.xpReward
    track.estimatedHours += quest.estimatedDuration / 60
    track.quests.push(quest)
  })

  track.estimatedHours = Math.round(track.estimatedHours * 10) / 10

  return track
}

/**
 * Validate track structure before seeding
 * @param {Object} track - Track structure to validate
 * @returns {Object} Validation result with errors if any
 */
export function validateTrack(track) {
  const errors = []

  if (!track.id) errors.push('Track missing ID')
  if (!track.name) errors.push('Track missing name')
  if (!track.quests || track.quests.length === 0) errors.push('Track has no quests')

  for (const quest of track.quests || []) {
    if (!quest.id) errors.push(`Quest missing ID: ${quest.title}`)
    if (!quest.title) errors.push('Quest missing title')
    if (!quest.trackId) errors.push(`Quest missing trackId: ${quest.title}`)

    for (const lesson of quest.lessons || []) {
      if (!lesson.id) errors.push(`Lesson missing ID: ${lesson.title}`)
      if (!lesson.title) errors.push('Lesson missing title')
      if (!lesson.content) errors.push(`Lesson missing content: ${lesson.title}`)
      if (!lesson.questId) errors.push(`Lesson missing questId: ${lesson.title}`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export default {
  generateId,
  slugify,
  parseDocumentStructure,
  extractLearningObjectives,
  extractKeyPoints,
  extractRegulatoryReferences,
  sectionToQuest,
  subsectionToLesson,
  transformDocumentToTrack,
  validateTrack
}
