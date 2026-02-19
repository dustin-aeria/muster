/**
 * Knowledge Base Service
 * Maps document types to relevant internal policies and procedures
 * Supports filtering based on client scope (drone ops, general, etc.)
 *
 * @version 1.0.0
 */

const { POLICY_CONTENT } = require('./policyContent.cjs')
const { PROCEDURE_CONTENT, PROCEDURE_CATEGORIES } = require('./procedureContent.cjs')

// ============================================
// Policy Categories
// ============================================

const POLICY_CATEGORIES = {
  rpas: {
    id: 'rpas',
    name: 'RPAS Operations',
    description: 'Drone/RPAS-specific policies',
    policyRange: ['1001', '1012'],
    keywords: ['rpas', 'drone', 'uas', 'pilot', 'flight', 'airspace', 'bvlos', 'vlos']
  },
  safety: {
    id: 'safety',
    name: 'Safety Management',
    description: 'Safety policies and procedures',
    policyRange: ['1013', '1022'],
    keywords: ['safety', 'hazard', 'risk', 'incident', 'sms', 'emergency']
  },
  hse: {
    id: 'hse',
    name: 'Health, Safety & Environment',
    description: 'HSE policies',
    policyRange: ['1023', '1032'],
    keywords: ['hse', 'health', 'environment', 'ppe', 'workplace', 'injury']
  },
  training: {
    id: 'training',
    name: 'Training & Competency',
    description: 'Training and certification policies',
    policyRange: ['1033', '1042'],
    keywords: ['training', 'competency', 'certification', 'qualification', 'recurrency']
  },
  operations: {
    id: 'operations',
    name: 'Operations Management',
    description: 'Operational policies and SOPs',
    policyRange: ['1043', '1053'],
    keywords: ['operations', 'sop', 'procedure', 'workflow', 'process']
  }
}

// ============================================
// Document Type to Content Mapping
// ============================================

/**
 * Maps document types to relevant policy and procedure categories
 * Each entry defines what internal content is most relevant
 */
const DOCUMENT_TYPE_CONTENT_MAP = {
  sms: {
    name: 'Safety Management System',
    relevantPolicyCategories: ['safety', 'hse', 'operations'],
    relevantProcedureCategories: ['general', 'emergency'],
    requiredForDroneOps: ['rpas'],
    keywords: ['safety', 'risk', 'hazard', 'incident', 'assurance', 'promotion', 'policy'],
    specificPolicies: ['1013', '1014', '1015', '1016', '1017', '1018', '1019', '1020'],
    specificProcedures: ['GP-006', 'EP-001', 'EP-002', 'EP-003']
  },

  training_manual: {
    name: 'Training Manual',
    relevantPolicyCategories: ['training'],
    relevantProcedureCategories: ['general', 'advanced'],
    requiredForDroneOps: ['rpas', 'training'],
    keywords: ['training', 'competency', 'certification', 'pilot', 'ground', 'flight', 'proficiency'],
    specificPolicies: ['1001', '1033', '1034', '1035', '1036'],
    specificProcedures: ['GP-001', 'GP-002', 'GP-003', 'AP-001', 'AP-002']
  },

  maintenance_plan: {
    name: 'Maintenance Program',
    relevantPolicyCategories: ['operations'],
    relevantProcedureCategories: ['general'],
    requiredForDroneOps: ['rpas'],
    keywords: ['maintenance', 'inspection', 'repair', 'schedule', 'records', 'equipment'],
    specificPolicies: ['1007', '1008', '1043', '1044'],
    specificProcedures: ['GP-002', 'GP-007', 'GP-008']
  },

  ops_manual: {
    name: 'Operations Manual',
    relevantPolicyCategories: ['operations', 'safety'],
    relevantProcedureCategories: ['general', 'advanced', 'emergency'],
    requiredForDroneOps: ['rpas', 'operations'],
    keywords: ['operations', 'sop', 'procedure', 'organization', 'flight', 'emergency'],
    specificPolicies: ['1002', '1003', '1004', '1005', '1006', '1043', '1044', '1045'],
    specificProcedures: ['GP-001', 'GP-002', 'GP-003', 'GP-004', 'GP-005', 'EP-001', 'EP-002']
  },

  safety_declaration: {
    name: 'Safety Declaration',
    relevantPolicyCategories: ['safety'],
    relevantProcedureCategories: ['general'],
    requiredForDroneOps: ['rpas', 'safety'],
    keywords: ['declaration', 'safety', 'scope', 'commitment', 'risk'],
    specificPolicies: ['1013', '1014', '1015'],
    specificProcedures: ['GP-001', 'GP-006']
  },

  hse_manual: {
    name: 'HSE Manual',
    relevantPolicyCategories: ['hse', 'safety'],
    relevantProcedureCategories: ['general', 'emergency'],
    requiredForDroneOps: [],
    keywords: ['hse', 'health', 'safety', 'environment', 'hazard', 'ppe', 'incident'],
    specificPolicies: ['1023', '1024', '1025', '1026', '1027', '1028', '1029', '1030'],
    specificProcedures: ['GP-006', 'EP-001', 'EP-002', 'EP-003', 'EP-004']
  },

  risk_assessment: {
    name: 'Risk Assessment',
    relevantPolicyCategories: ['safety'],
    relevantProcedureCategories: ['general'],
    requiredForDroneOps: ['rpas', 'safety'],
    keywords: ['risk', 'hazard', 'assessment', 'mitigation', 'control', 'analysis'],
    specificPolicies: ['1014', '1015', '1016'],
    specificProcedures: ['GP-001', 'GP-006']
  },

  sop: {
    name: 'Standard Operating Procedure',
    relevantPolicyCategories: ['operations'],
    relevantProcedureCategories: ['general', 'advanced'],
    requiredForDroneOps: ['rpas'],
    keywords: ['sop', 'procedure', 'step', 'workflow', 'process', 'instruction'],
    specificPolicies: ['1043', '1044', '1045'],
    specificProcedures: ['GP-001', 'GP-002', 'GP-003', 'GP-004', 'GP-005']
  },

  erp: {
    name: 'Emergency Response Plan',
    relevantPolicyCategories: ['safety', 'hse'],
    relevantProcedureCategories: ['emergency'],
    requiredForDroneOps: ['rpas', 'safety'],
    keywords: ['emergency', 'response', 'incident', 'crisis', 'evacuation', 'contact'],
    specificPolicies: ['1017', '1018', '1019', '1020'],
    specificProcedures: ['EP-001', 'EP-002', 'EP-003', 'EP-004', 'EP-005', 'EP-006', 'EP-007']
  },

  compliance_matrix: {
    name: 'Compliance Matrix',
    relevantPolicyCategories: ['operations', 'safety'],
    relevantProcedureCategories: ['general'],
    requiredForDroneOps: ['rpas'],
    keywords: ['compliance', 'regulation', 'requirement', 'audit', 'evidence', 'gap'],
    specificPolicies: ['1001', '1013', '1043'],
    specificProcedures: ['GP-001']
  }
}

// ============================================
// Content Retrieval Functions
// ============================================

/**
 * Get a policy by ID
 * @param {string} policyId - Policy ID (e.g., '1001')
 * @returns {Object|null} Policy content or null
 */
function getPolicy(policyId) {
  return POLICY_CONTENT[policyId] || null
}

/**
 * Get a procedure by ID
 * @param {string} procedureId - Procedure ID (e.g., 'GP-001')
 * @returns {Object|null} Procedure content or null
 */
function getProcedure(procedureId) {
  return PROCEDURE_CONTENT[procedureId] || null
}

/**
 * Get all policies in a category
 * @param {string} categoryId - Category ID
 * @returns {Array} Array of policies
 */
function getPoliciesByCategory(categoryId) {
  const category = POLICY_CATEGORIES[categoryId]
  if (!category) return []

  const [start, end] = category.policyRange
  const startNum = parseInt(start)
  const endNum = parseInt(end)

  const policies = []
  for (let i = startNum; i <= endNum; i++) {
    const policy = POLICY_CONTENT[i.toString()]
    if (policy) {
      policies.push(policy)
    }
  }
  return policies
}

/**
 * Get all procedures in a category
 * @param {string} categoryId - Category ID (general, advanced, emergency)
 * @returns {Array} Array of procedures
 */
function getProceduresByCategory(categoryId) {
  return Object.values(PROCEDURE_CONTENT).filter(proc => proc.category === categoryId)
}

/**
 * Search policies by keywords
 * @param {string} query - Search query
 * @param {number} limit - Max results
 * @returns {Array} Matching policies
 */
function searchPolicies(query, limit = 10) {
  const queryTerms = query.toLowerCase().split(/\s+/)

  const scored = Object.values(POLICY_CONTENT).map(policy => {
    const searchText = [
      policy.title,
      policy.description,
      policy.keywords?.join(' ') || '',
      policy.sections?.map(s => s.title + ' ' + s.content).join(' ') || ''
    ].join(' ').toLowerCase()

    let score = 0
    queryTerms.forEach(term => {
      if (searchText.includes(term)) {
        score += 1
        // Boost for title/keyword matches
        if (policy.title?.toLowerCase().includes(term)) score += 2
        if (policy.keywords?.some(k => k.toLowerCase().includes(term))) score += 2
      }
    })

    return { ...policy, _score: score }
  })

  return scored
    .filter(p => p._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, limit)
}

/**
 * Search procedures by keywords
 * @param {string} query - Search query
 * @param {number} limit - Max results
 * @returns {Array} Matching procedures
 */
function searchProcedures(query, limit = 10) {
  const queryTerms = query.toLowerCase().split(/\s+/)

  const scored = Object.values(PROCEDURE_CONTENT).map(proc => {
    const searchText = [
      proc.title,
      proc.description,
      proc.keywords?.join(' ') || '',
      proc.steps?.map(s => s.action + ' ' + (s.details || '')).join(' ') || ''
    ].join(' ').toLowerCase()

    let score = 0
    queryTerms.forEach(term => {
      if (searchText.includes(term)) {
        score += 1
        if (proc.title?.toLowerCase().includes(term)) score += 2
        if (proc.keywords?.some(k => k.toLowerCase().includes(term))) score += 2
      }
    })

    return { ...proc, _score: score }
  })

  return scored
    .filter(p => p._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, limit)
}

// ============================================
// Smart Content Matching
// ============================================

/**
 * Determine if client operations include drone/RPAS work
 * @param {Object} projectContext - Project shared context
 * @returns {boolean}
 */
function clientIncludesDroneOps(projectContext) {
  if (!projectContext) return false

  const searchText = [
    projectContext.operationsScope || '',
    projectContext.companyProfile || '',
    projectContext.customContext || '',
    (projectContext.aircraftTypes || []).join(' ')
  ].join(' ').toLowerCase()

  const droneKeywords = ['drone', 'rpas', 'uas', 'uav', 'remotely piloted', 'unmanned',
    'aerial', 'aircraft', 'flight', 'pilot', 'bvlos', 'vlos']

  return droneKeywords.some(keyword => searchText.includes(keyword))
}

/**
 * Get relevant content for a document type based on client context
 * @param {string} documentType - Document type (sms, ops_manual, etc.)
 * @param {Object} projectContext - Project shared context
 * @param {Object} options - Additional options
 * @returns {Object} Relevant policies and procedures
 */
function getRelevantContent(documentType, projectContext = {}, options = {}) {
  const mapping = DOCUMENT_TYPE_CONTENT_MAP[documentType]
  if (!mapping) {
    return { policies: [], procedures: [], gaps: [] }
  }

  const includesDroneOps = clientIncludesDroneOps(projectContext)
  const policies = []
  const procedures = []
  const gaps = []

  // Get specifically mapped policies
  if (mapping.specificPolicies) {
    mapping.specificPolicies.forEach(id => {
      const policy = getPolicy(id)
      if (policy) {
        // Skip RPAS-specific if client doesn't do drone ops
        if (policy.category === 'rpas' && !includesDroneOps) {
          return
        }
        policies.push(policy)
      }
    })
  }

  // Get specifically mapped procedures
  if (mapping.specificProcedures) {
    mapping.specificProcedures.forEach(id => {
      const proc = getProcedure(id)
      if (proc) {
        // Skip if procedure is RPAS-specific and client doesn't do drone ops
        const searchText = [proc.title, proc.description, proc.keywords?.join(' ')].join(' ').toLowerCase()
        if (!includesDroneOps &&
            (searchText.includes('rpas') || searchText.includes('drone') || searchText.includes('flight'))) {
          return
        }
        procedures.push(proc)
      }
    })
  }

  // Add drone-specific content if applicable
  if (includesDroneOps && mapping.requiredForDroneOps) {
    mapping.requiredForDroneOps.forEach(categoryId => {
      if (categoryId === 'rpas') {
        const rpasPolicies = getPoliciesByCategory('rpas')
        rpasPolicies.forEach(p => {
          if (!policies.find(existing => existing.number === p.number)) {
            policies.push(p)
          }
        })
      }
    })
  }

  // Identify potential gaps - topics the client needs that aren't well covered
  if (projectContext.operationsScope) {
    const scopeTerms = projectContext.operationsScope.toLowerCase().split(/\s+/)
    const coveredTerms = new Set()

    policies.forEach(p => {
      p.keywords?.forEach(k => coveredTerms.add(k.toLowerCase()))
    })
    procedures.forEach(p => {
      p.keywords?.forEach(k => coveredTerms.add(k.toLowerCase()))
    })

    // Find terms in scope not well covered
    scopeTerms.forEach(term => {
      if (term.length > 3 && !coveredTerms.has(term)) {
        // Check if it's a meaningful gap
        const isGap = !['the', 'and', 'for', 'with', 'that', 'this'].includes(term)
        if (isGap) {
          gaps.push(term)
        }
      }
    })
  }

  return {
    policies,
    procedures,
    gaps: [...new Set(gaps)].slice(0, 10), // Unique gaps, max 10
    includesDroneOps,
    mapping
  }
}

/**
 * Format policy content for Claude context
 * @param {Object} policy - Policy object
 * @returns {string} Formatted content
 */
function formatPolicyForContext(policy) {
  if (!policy) return ''

  let content = `## Policy ${policy.number}: ${policy.title}\n`
  content += `Category: ${policy.category || 'General'}\n`
  content += `Version: ${policy.version || '1.0'}\n\n`

  if (policy.sections) {
    policy.sections.forEach(section => {
      content += `### ${section.title}\n`
      content += `${section.content}\n\n`
    })
  }

  return content
}

/**
 * Format procedure content for Claude context
 * @param {Object} procedure - Procedure object
 * @returns {string} Formatted content
 */
function formatProcedureForContext(procedure) {
  if (!procedure) return ''

  let content = `## Procedure ${procedure.number}: ${procedure.title}\n`
  content += `Category: ${procedure.category || 'General'}\n`
  content += `Description: ${procedure.description || ''}\n\n`

  if (procedure.equipmentRequired?.length) {
    content += `### Equipment Required\n`
    procedure.equipmentRequired.forEach(item => {
      content += `- ${item}\n`
    })
    content += '\n'
  }

  if (procedure.steps?.length) {
    content += `### Steps\n`
    procedure.steps.forEach(step => {
      content += `${step.stepNumber}. **${step.action}**\n`
      if (step.details) content += `   ${step.details}\n`
      if (step.cautions) content += `   ⚠️ ${step.cautions}\n`
      content += '\n'
    })
  }

  return content
}

/**
 * Build full knowledge base context for a document generation request
 * @param {string} documentType - Document type
 * @param {Object} projectContext - Project shared context
 * @param {number} maxTokenEstimate - Rough max tokens to include
 * @returns {Object} Context object with formatted content
 */
function buildKnowledgeContext(documentType, projectContext, maxTokenEstimate = 10000) {
  const relevant = getRelevantContent(documentType, projectContext)

  let context = ''
  let includedPolicies = []
  let includedProcedures = []
  let estimatedTokens = 0
  const avgCharsPerToken = 4

  // Add most relevant policies first
  for (const policy of relevant.policies) {
    const formatted = formatPolicyForContext(policy)
    const tokens = Math.ceil(formatted.length / avgCharsPerToken)

    if (estimatedTokens + tokens < maxTokenEstimate * 0.7) { // Reserve 30% for procedures
      context += formatted + '\n---\n\n'
      includedPolicies.push({ number: policy.number, title: policy.title })
      estimatedTokens += tokens
    }
  }

  // Add relevant procedures
  for (const proc of relevant.procedures) {
    const formatted = formatProcedureForContext(proc)
    const tokens = Math.ceil(formatted.length / avgCharsPerToken)

    if (estimatedTokens + tokens < maxTokenEstimate) {
      context += formatted + '\n---\n\n'
      includedProcedures.push({ number: proc.number, title: proc.title })
      estimatedTokens += tokens
    }
  }

  return {
    content: context,
    includedPolicies,
    includedProcedures,
    gaps: relevant.gaps,
    includesDroneOps: relevant.includesDroneOps,
    estimatedTokens
  }
}

// ============================================
// Exports
// ============================================

module.exports = {
  // Content retrieval
  getPolicy,
  getProcedure,
  getPoliciesByCategory,
  getProceduresByCategory,
  searchPolicies,
  searchProcedures,

  // Smart matching
  clientIncludesDroneOps,
  getRelevantContent,
  buildKnowledgeContext,

  // Formatting
  formatPolicyForContext,
  formatProcedureForContext,

  // Constants
  POLICY_CATEGORIES,
  PROCEDURE_CATEGORIES,
  DOCUMENT_TYPE_CONTENT_MAP,

  // Raw content (for advanced usage)
  POLICY_CONTENT,
  PROCEDURE_CONTENT
}
