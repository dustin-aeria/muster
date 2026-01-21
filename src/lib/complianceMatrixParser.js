/**
 * complianceMatrixParser.js
 * Universal Compliance Matrix Parser
 *
 * Parses compliance documents (matrices, checklists, questionnaires) from
 * various formats into structured requirements that can be used with the
 * compliance assistant.
 *
 * Supported input formats:
 * - Pasted text (numbered lists, bulleted lists, tables)
 * - Structured text from document extraction
 * - JSON import from other systems
 *
 * @location src/lib/complianceMatrixParser.js
 */

import {
  analyzeComplianceText,
  mapRequirementToPatterns,
  REGULATORY_REFERENCES,
  COMPLIANCE_CATEGORIES
} from './regulatoryPatterns'

// ============================================
// PARSING CONFIGURATION
// ============================================

/**
 * Regex patterns for extracting regulatory references
 */
const REG_REF_PATTERNS = [
  // CAR references: CAR 901.54, CAR 903.02(d), CAR 903.01(a)(b)
  /CAR\s*(\d{3}(?:\.\d{2})?(?:\s*\([a-z]\))*)/gi,
  // AC references: AC 903-001
  /AC\s*(\d{3}-\d{3})/gi,
  // SI references: SI 623-001
  /SI\s*(\d{3}-\d{3})/gi,
  // Generic section references: Section 3.2, s. 3.2
  /(?:Section|s\.)\s*(\d+(?:\.\d+)*)/gi
]

/**
 * Patterns for identifying requirement boundaries
 */
const REQUIREMENT_PATTERNS = {
  // Numbered: 1. 2. 3. or 1) 2) 3)
  numbered: /^(\d+)[.)]\s*/,
  // Lettered: a. b. c. or a) b) c) or (a) (b) (c)
  lettered: /^(?:\()?([a-z])[.)]\)?\s*/i,
  // Roman: i. ii. iii. or (i) (ii) (iii)
  roman: /^(?:\()?(i{1,3}|iv|vi{0,3}|ix|x)[.)]\)?\s*/i,
  // Bullet points
  bullet: /^[•\-\*]\s*/,
  // Reference prefix: Per CAR xxx, As per..., In accordance with...
  referencePrefix: /^(?:per|as per|in accordance with|pursuant to|refer to)\s+/i,
  // Question format: ends with ?
  question: /\?$/
}

// ============================================
// CORE PARSING FUNCTIONS
// ============================================

/**
 * Parse raw text into structured requirements
 * @param {string} rawText - Raw text from document
 * @param {Object} options - Parsing options
 * @returns {Object} Parsed result with requirements and metadata
 */
export function parseComplianceText(rawText, options = {}) {
  const {
    documentName = 'Untitled Document',
    documentType = 'custom',
    preserveStructure = true
  } = options

  const result = {
    documentName,
    documentType,
    parsedAt: new Date().toISOString(),
    requirements: [],
    categories: {},
    regulatoryRefs: new Set(),
    warnings: [],
    stats: {
      totalRequirements: 0,
      categorized: 0,
      withRegRef: 0,
      uncategorized: 0
    }
  }

  // Normalize line endings and split into lines
  const lines = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)

  // Detect document structure
  const structure = detectDocumentStructure(lines)
  result.detectedStructure = structure

  // Parse based on detected structure
  let requirements = []
  switch (structure.type) {
    case 'numbered-list':
      requirements = parseNumberedList(lines, structure)
      break
    case 'table':
      requirements = parseTableFormat(lines, structure)
      break
    case 'sectioned':
      requirements = parseSectionedDocument(lines, structure)
      break
    default:
      requirements = parseGenericText(lines)
  }

  // Process each requirement
  for (let i = 0; i < requirements.length; i++) {
    const req = requirements[i]
    const processed = processRequirement(req, i + 1)

    result.requirements.push(processed)

    // Update stats
    result.stats.totalRequirements++

    if (processed.category) {
      result.stats.categorized++
      result.categories[processed.category] = (result.categories[processed.category] || 0) + 1
    } else {
      result.stats.uncategorized++
    }

    if (processed.regulatoryRef) {
      result.stats.withRegRef++
      result.regulatoryRefs.add(processed.regulatoryRef)
    }
  }

  // Convert Set to Array
  result.regulatoryRefs = [...result.regulatoryRefs]

  return result
}

/**
 * Detect the structure type of the document
 * @param {Array} lines - Document lines
 * @returns {Object} Structure information
 */
function detectDocumentStructure(lines) {
  const structure = {
    type: 'generic',
    confidence: 0,
    details: {}
  }

  // Count pattern occurrences
  let numberedCount = 0
  let letteredCount = 0
  let bulletCount = 0
  let tableIndicators = 0

  for (const line of lines) {
    if (REQUIREMENT_PATTERNS.numbered.test(line)) numberedCount++
    if (REQUIREMENT_PATTERNS.lettered.test(line)) letteredCount++
    if (REQUIREMENT_PATTERNS.bullet.test(line)) bulletCount++
    if (line.includes('\t') || line.includes('|')) tableIndicators++
  }

  const totalLines = lines.length

  // Determine most likely structure
  if (numberedCount > totalLines * 0.3) {
    structure.type = 'numbered-list'
    structure.confidence = numberedCount / totalLines
    structure.details.pattern = 'numbered'
  } else if (tableIndicators > totalLines * 0.5) {
    structure.type = 'table'
    structure.confidence = tableIndicators / totalLines
    structure.details.delimiter = lines[0].includes('|') ? '|' : '\t'
  } else if (bulletCount > totalLines * 0.3) {
    structure.type = 'numbered-list'
    structure.confidence = bulletCount / totalLines
    structure.details.pattern = 'bullet'
  } else {
    // Check for section headers
    const sectionHeaders = lines.filter(l =>
      /^(?:section|\d+\.|[A-Z][A-Z\s]+:)/i.test(l)
    )
    if (sectionHeaders.length > 2) {
      structure.type = 'sectioned'
      structure.confidence = sectionHeaders.length / totalLines
      structure.details.headers = sectionHeaders
    }
  }

  return structure
}

/**
 * Parse numbered/bulleted list format
 * @param {Array} lines - Document lines
 * @param {Object} structure - Detected structure
 * @returns {Array} Parsed requirements
 */
function parseNumberedList(lines, structure) {
  const requirements = []
  let currentRequirement = null
  let currentSection = null

  for (const line of lines) {
    // Check for section header
    if (isSectionHeader(line)) {
      currentSection = extractSectionTitle(line)
      continue
    }

    // Check for new requirement
    const isNewItem = REQUIREMENT_PATTERNS.numbered.test(line) ||
      REQUIREMENT_PATTERNS.lettered.test(line) ||
      REQUIREMENT_PATTERNS.bullet.test(line)

    if (isNewItem) {
      // Save previous requirement
      if (currentRequirement) {
        requirements.push(currentRequirement)
      }

      // Start new requirement
      currentRequirement = {
        rawText: cleanRequirementText(line),
        section: currentSection,
        continuations: []
      }
    } else if (currentRequirement) {
      // Continuation of current requirement
      currentRequirement.continuations.push(line)
    }
  }

  // Don't forget last requirement
  if (currentRequirement) {
    requirements.push(currentRequirement)
  }

  return requirements
}

/**
 * Parse table format (tab or pipe delimited)
 * @param {Array} lines - Document lines
 * @param {Object} structure - Detected structure
 * @returns {Array} Parsed requirements
 */
function parseTableFormat(lines, structure) {
  const requirements = []
  const delimiter = structure.details.delimiter || '\t'

  // Try to detect header row
  let headerRow = null
  let dataStartIndex = 0

  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const cells = lines[i].split(delimiter).map(c => c.trim())
    if (looksLikeHeader(cells)) {
      headerRow = cells
      dataStartIndex = i + 1
      break
    }
  }

  // Parse data rows
  for (let i = dataStartIndex; i < lines.length; i++) {
    const cells = lines[i].split(delimiter).map(c => c.trim())
    if (cells.length < 2) continue

    // Skip separator rows (----)
    if (cells.every(c => /^[-=]+$/.test(c))) continue

    const requirement = {
      rawText: '',
      cells: {},
      section: null
    }

    if (headerRow) {
      // Map cells to headers
      for (let j = 0; j < headerRow.length; j++) {
        const header = headerRow[j].toLowerCase()
        const value = cells[j] || ''

        requirement.cells[header] = value

        // Common column mappings
        if (/requirement|description|text/i.test(header)) {
          requirement.rawText = value
        }
        if (/section|category/i.test(header)) {
          requirement.section = value
        }
        if (/reference|reg|car/i.test(header)) {
          requirement.regulatoryRef = value
        }
      }
    } else {
      // Assume first substantial cell is the requirement text
      requirement.rawText = cells.find(c => c.length > 20) || cells.join(' ')
    }

    if (requirement.rawText) {
      requirements.push(requirement)
    }
  }

  return requirements
}

/**
 * Parse sectioned document format
 * @param {Array} lines - Document lines
 * @param {Object} structure - Detected structure
 * @returns {Array} Parsed requirements
 */
function parseSectionedDocument(lines, structure) {
  const requirements = []
  let currentSection = null
  let currentSubsection = null
  let textBuffer = []

  const flushBuffer = () => {
    if (textBuffer.length > 0) {
      const text = textBuffer.join(' ').trim()
      if (text.length > 20) { // Minimum length for a requirement
        requirements.push({
          rawText: text,
          section: currentSection,
          subsection: currentSubsection
        })
      }
      textBuffer = []
    }
  }

  for (const line of lines) {
    if (isSectionHeader(line)) {
      flushBuffer()
      currentSection = extractSectionTitle(line)
      currentSubsection = null
    } else if (isSubsectionHeader(line)) {
      flushBuffer()
      currentSubsection = extractSectionTitle(line)
    } else if (REQUIREMENT_PATTERNS.numbered.test(line) ||
      REQUIREMENT_PATTERNS.lettered.test(line)) {
      flushBuffer()
      textBuffer.push(cleanRequirementText(line))
    } else {
      textBuffer.push(line)
    }
  }

  flushBuffer()
  return requirements
}

/**
 * Parse generic text (fallback)
 * @param {Array} lines - Document lines
 * @returns {Array} Parsed requirements
 */
function parseGenericText(lines) {
  const requirements = []

  // Split on sentences that look like requirements
  const text = lines.join(' ')
  const sentences = text.split(/(?<=[.?])\s+/)

  for (const sentence of sentences) {
    if (sentence.length > 30 && looksLikeRequirement(sentence)) {
      requirements.push({
        rawText: sentence.trim(),
        section: null
      })
    }
  }

  return requirements
}

// ============================================
// REQUIREMENT PROCESSING
// ============================================

/**
 * Process a raw requirement into structured format
 * @param {Object} rawReq - Raw requirement from parser
 * @param {number} order - Order number
 * @returns {Object} Processed requirement
 */
function processRequirement(rawReq, order) {
  // Combine text with continuations
  const fullText = [
    rawReq.rawText,
    ...(rawReq.continuations || [])
  ].join(' ').trim()

  // Extract regulatory reference
  const regulatoryRef = rawReq.regulatoryRef || extractRegulatoryRef(fullText)

  // Analyze and categorize
  const patterns = mapRequirementToPatterns({
    text: fullText,
    regulatoryRef
  })

  // Generate short text (first sentence or truncated)
  const shortText = generateShortText(fullText)

  // Build processed requirement
  const processed = {
    id: `req-${order.toString().padStart(3, '0')}`,
    order,
    text: fullText,
    shortText,
    section: rawReq.section || null,
    subsection: rawReq.subsection || null,
    regulatoryRef,
    category: patterns.primaryCategory?.id || null,
    categoryName: patterns.primaryCategory?.name || null,
    confidence: patterns.analysis.confidence,
    suggestedEvidence: patterns.suggestedEvidence.slice(0, 3),
    responseHints: patterns.responseHints.slice(0, 3),
    searchTerms: patterns.searchTerms,
    // For UI
    status: 'pending',
    response: '',
    notes: ''
  }

  return processed
}

/**
 * Extract regulatory reference from text
 * @param {string} text - Requirement text
 * @returns {string|null} Extracted reference or null
 */
function extractRegulatoryRef(text) {
  for (const pattern of REG_REF_PATTERNS) {
    const match = text.match(pattern)
    if (match) {
      return match[0].toUpperCase().replace(/\s+/g, ' ')
    }
  }
  return null
}

/**
 * Generate short text summary
 * @param {string} text - Full requirement text
 * @returns {string} Short summary
 */
function generateShortText(text) {
  // Try to get first sentence
  const firstSentence = text.split(/[.?!]/)[0]

  if (firstSentence.length <= 80) {
    return firstSentence
  }

  // Truncate intelligently
  const truncated = text.substring(0, 77)
  const lastSpace = truncated.lastIndexOf(' ')

  return truncated.substring(0, lastSpace) + '...'
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if line is a section header
 */
function isSectionHeader(line) {
  return (
    /^(?:section|part|chapter)\s+\d+/i.test(line) ||
    /^\d+\.\s+[A-Z]/.test(line) ||
    /^[A-Z][A-Z\s]{5,}$/.test(line) || // ALL CAPS HEADERS
    /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*:$/.test(line) // Title Case:
  )
}

/**
 * Check if line is a subsection header
 */
function isSubsectionHeader(line) {
  return /^\d+\.\d+\s/.test(line) || /^[a-z]\)\s+[A-Z]/.test(line)
}

/**
 * Extract section title from header line
 */
function extractSectionTitle(line) {
  return line
    .replace(/^(?:section|part|chapter)\s+\d+[.:]\s*/i, '')
    .replace(/^\d+(?:\.\d+)*[.:]\s*/, '')
    .replace(/:$/, '')
    .trim()
}

/**
 * Clean requirement text (remove numbering, bullets)
 */
function cleanRequirementText(line) {
  return line
    .replace(REQUIREMENT_PATTERNS.numbered, '')
    .replace(REQUIREMENT_PATTERNS.lettered, '')
    .replace(REQUIREMENT_PATTERNS.roman, '')
    .replace(REQUIREMENT_PATTERNS.bullet, '')
    .trim()
}

/**
 * Check if cells look like a header row
 */
function looksLikeHeader(cells) {
  const headerWords = ['requirement', 'description', 'reference', 'section',
    'category', 'response', 'evidence', 'status', 'notes', 'item', 'reg']

  const matchCount = cells.filter(cell =>
    headerWords.some(word => cell.toLowerCase().includes(word))
  ).length

  return matchCount >= 2
}

/**
 * Check if text looks like a requirement
 */
function looksLikeRequirement(text) {
  const requirementIndicators = [
    /shall\b/i,
    /must\b/i,
    /require/i,
    /demonstrate/i,
    /provide\b/i,
    /describe/i,
    /explain/i,
    /how\s+(?:do|does|will)/i,
    /what\s+(?:is|are)/i,
    /CAR\s+\d/i,
    /\?$/
  ]

  return requirementIndicators.some(pattern => pattern.test(text))
}

// ============================================
// IMPORT/EXPORT FUNCTIONS
// ============================================

/**
 * Import requirements from JSON format
 * @param {Object} json - JSON data
 * @returns {Object} Parsed result
 */
export function importFromJSON(json) {
  const result = {
    documentName: json.name || 'Imported Document',
    documentType: json.type || 'imported',
    parsedAt: new Date().toISOString(),
    requirements: [],
    categories: {},
    regulatoryRefs: [],
    warnings: [],
    stats: { totalRequirements: 0, categorized: 0, withRegRef: 0, uncategorized: 0 }
  }

  const requirements = json.requirements || json.items || []

  for (let i = 0; i < requirements.length; i++) {
    const item = requirements[i]
    const processed = processRequirement({
      rawText: item.text || item.description || item.requirement || '',
      section: item.section || item.category || null,
      regulatoryRef: item.regulatoryRef || item.reference || null
    }, i + 1)

    // Preserve any existing data
    if (item.id) processed.id = item.id
    if (item.response) processed.response = item.response
    if (item.status) processed.status = item.status
    if (item.notes) processed.notes = item.notes

    result.requirements.push(processed)
    result.stats.totalRequirements++

    if (processed.category) {
      result.stats.categorized++
      result.categories[processed.category] = (result.categories[processed.category] || 0) + 1
    }
    if (processed.regulatoryRef) {
      result.stats.withRegRef++
      if (!result.regulatoryRefs.includes(processed.regulatoryRef)) {
        result.regulatoryRefs.push(processed.regulatoryRef)
      }
    }
  }

  return result
}

/**
 * Export requirements to JSON format
 * @param {Object} parsedResult - Parsed compliance document
 * @returns {Object} JSON export
 */
export function exportToJSON(parsedResult) {
  return {
    name: parsedResult.documentName,
    type: parsedResult.documentType,
    exportedAt: new Date().toISOString(),
    stats: parsedResult.stats,
    requirements: parsedResult.requirements.map(req => ({
      id: req.id,
      order: req.order,
      text: req.text,
      shortText: req.shortText,
      section: req.section,
      regulatoryRef: req.regulatoryRef,
      category: req.category,
      response: req.response,
      status: req.status,
      notes: req.notes
    }))
  }
}

// ============================================
// TEMPLATE GENERATION
// ============================================

/**
 * Generate a compliance template from parsed requirements
 * @param {Object} parsedResult - Parsed compliance document
 * @returns {Object} Template ready for storage
 */
export function generateTemplate(parsedResult) {
  return {
    id: `template-${Date.now()}`,
    name: parsedResult.documentName,
    description: `Template generated from ${parsedResult.documentName}`,
    documentType: parsedResult.documentType,
    createdAt: new Date().toISOString(),
    stats: parsedResult.stats,
    structure: {
      categories: Object.keys(parsedResult.categories),
      requirementCount: parsedResult.stats.totalRequirements,
      commonRegRefs: parsedResult.regulatoryRefs
    },
    requirements: parsedResult.requirements.map(req => ({
      id: req.id,
      order: req.order,
      text: req.text,
      shortText: req.shortText,
      section: req.section,
      regulatoryRef: req.regulatoryRef,
      category: req.category,
      suggestedEvidence: req.suggestedEvidence,
      responseHints: req.responseHints
    }))
  }
}

// ============================================
// EXPORT
// ============================================

export default {
  parseComplianceText,
  importFromJSON,
  exportToJSON,
  generateTemplate
}
