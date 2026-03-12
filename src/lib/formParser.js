/**
 * Form Parser Utility
 * Parse markdown form content into structured fields for fillable forms
 *
 * Handles:
 * - Markdown tables with empty cells (text inputs)
 * - Checkboxes (☐, [ ], ☑, [x])
 * - Date patterns
 * - Signature fields
 * - Multi-line text areas
 *
 * @version 1.0.0
 */

// ============================================
// FIELD TYPE DETECTION
// ============================================

/**
 * Detect field type based on label and cell content
 * @param {string} label - Field label
 * @param {string} cellContent - Current cell content
 * @returns {string} Field type
 */
function detectFieldType(label, cellContent) {
  const lowerLabel = label.toLowerCase()

  // Signature detection
  if (lowerLabel.includes('signature') || lowerLabel.includes('sign here')) {
    return 'signature'
  }

  // Date detection
  if (
    lowerLabel.includes('date') ||
    lowerLabel.includes('when') ||
    /\d{4}[-/]\d{2}[-/]\d{2}/.test(cellContent) ||
    /\d{2}[-/]\d{2}[-/]\d{4}/.test(cellContent)
  ) {
    return 'date'
  }

  // Time detection
  if (lowerLabel.includes('time') && !lowerLabel.includes('datetime')) {
    return 'time'
  }

  // DateTime detection
  if (lowerLabel.includes('datetime') || lowerLabel.includes('date and time')) {
    return 'datetime'
  }

  // Email detection
  if (lowerLabel.includes('email') || lowerLabel.includes('e-mail')) {
    return 'email'
  }

  // Phone detection
  if (lowerLabel.includes('phone') || lowerLabel.includes('telephone') || lowerLabel.includes('mobile')) {
    return 'phone'
  }

  // Number detection
  if (
    lowerLabel.includes('number') ||
    lowerLabel.includes('count') ||
    lowerLabel.includes('quantity') ||
    lowerLabel.includes('amount') ||
    lowerLabel.includes('total') ||
    lowerLabel.includes('hours') ||
    lowerLabel.includes('minutes')
  ) {
    return 'number'
  }

  // Textarea detection (for description, notes, comments, etc.)
  if (
    lowerLabel.includes('description') ||
    lowerLabel.includes('notes') ||
    lowerLabel.includes('comments') ||
    lowerLabel.includes('details') ||
    lowerLabel.includes('summary') ||
    lowerLabel.includes('narrative') ||
    lowerLabel.includes('explain')
  ) {
    return 'textarea'
  }

  // Checkbox detection
  if (
    cellContent.includes('☐') ||
    cellContent.includes('☑') ||
    cellContent.includes('[ ]') ||
    cellContent.includes('[x]') ||
    cellContent.includes('[X]')
  ) {
    return 'checkbox'
  }

  // Default to text
  return 'text'
}

/**
 * Generate a unique field ID from label
 * @param {string} label - Field label
 * @param {number} index - Index for uniqueness
 * @returns {string} Field ID
 */
function generateFieldId(label, index) {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 30)
  return `${base}_${index}`
}

/**
 * Parse checkbox options from cell content
 * @param {string} content - Cell content with checkboxes
 * @returns {Array<{label: string, value: string, checked: boolean}>}
 */
function parseCheckboxOptions(content) {
  const options = []

  // Match patterns like "☐ Option" or "[ ] Option" or "☑ Option" or "[x] Option"
  const regex = /(☐|☑|\[\s*[xX]?\s*\])\s*([^\n☐☑\[\]]+)/g
  let match

  while ((match = regex.exec(content)) !== null) {
    const isChecked = match[1] === '☑' || /\[\s*[xX]\s*\]/.test(match[1])
    const label = match[2].trim()
    if (label) {
      options.push({
        label,
        value: label.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        checked: isChecked,
      })
    }
  }

  return options
}

// ============================================
// TABLE PARSING
// ============================================

/**
 * Parse a markdown table into rows and cells
 * @param {string} tableContent - Raw markdown table
 * @returns {Array<Array<string>>} 2D array of cell contents
 */
function parseMarkdownTable(tableContent) {
  const lines = tableContent.split('\n').filter(line => line.trim())
  const rows = []

  for (const line of lines) {
    // Skip separator rows (----)
    if (/^\s*\|?\s*[-:]+\s*(\|\s*[-:]+\s*)*\|?\s*$/.test(line)) {
      continue
    }

    // Parse cells from row
    const cells = line
      .split('|')
      .map(cell => cell.trim())
      .filter((_, index, arr) => {
        // Remove empty first/last cells from |cell|cell| format
        return !(index === 0 && arr[0] === '') && !(index === arr.length - 1 && arr[arr.length - 1] === '')
      })

    if (cells.length > 0) {
      rows.push(cells)
    }
  }

  return rows
}

/**
 * Determine if a cell is a label or a value field
 * @param {string} cell - Cell content
 * @param {number} colIndex - Column index
 * @param {Array<string>} row - Full row
 * @returns {boolean} True if cell is a label
 */
function isLabelCell(cell, colIndex, row) {
  // Empty cells are values, not labels
  if (!cell.trim()) return false

  // Cells ending with : are labels
  if (cell.trim().endsWith(':')) return true

  // Bold text (**label**) indicates a label
  if (/^\*\*[^*]+\*\*$/.test(cell.trim())) return true

  // First column in two-column table is usually label
  if (colIndex === 0 && row.length === 2) return true

  // Even columns in label|value|label|value pattern
  if (row.length >= 4 && colIndex % 2 === 0) return true

  return false
}

// ============================================
// MAIN PARSER FUNCTION
// ============================================

/**
 * Parse markdown form content into structured fields
 * @param {string} markdownContent - Markdown content with tables/forms
 * @returns {Array<FieldDefinition>} Array of field definitions
 */
export function parseFormToFields(markdownContent) {
  if (!markdownContent) return []

  const fields = []
  let fieldIndex = 0

  // Find all tables in the markdown
  const tableRegex = /(\|[^\n]+\|[\s\S]*?(?=\n\n|\n#|$))/g
  let tableMatch

  while ((tableMatch = tableRegex.exec(markdownContent)) !== null) {
    const tableContent = tableMatch[1]
    const rows = parseMarkdownTable(tableContent)

    if (rows.length === 0) continue

    // Check if first row is a header row
    const hasHeader = rows.length > 1 && rows[0].every(cell => cell.trim() !== '')
    const dataRows = hasHeader ? rows.slice(1) : rows
    const headerRow = hasHeader ? rows[0] : null

    // Process each data row
    for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex++) {
      const row = dataRows[rowIndex]

      // Process cells in pairs or based on structure
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cell = row[colIndex]

        // Check if this is a label cell
        if (isLabelCell(cell, colIndex, row)) {
          const label = cell.replace(/^\*\*|\*\*$|:$/g, '').trim()

          // Get the value from next cell if it exists
          const valueCell = row[colIndex + 1] || ''
          const type = detectFieldType(label, valueCell)

          // Handle checkbox fields specially
          if (type === 'checkbox' || valueCell.includes('☐') || valueCell.includes('[ ]')) {
            const options = parseCheckboxOptions(valueCell)

            if (options.length > 0) {
              // Multiple checkbox options
              fields.push({
                id: generateFieldId(label, fieldIndex++),
                label,
                type: 'checkbox-group',
                options,
                required: false,
                row: rowIndex,
                col: colIndex,
              })
            } else {
              // Single checkbox
              fields.push({
                id: generateFieldId(label, fieldIndex++),
                label,
                type: 'checkbox',
                defaultValue: false,
                required: false,
                row: rowIndex,
                col: colIndex,
              })
            }
          } else {
            // Regular field
            fields.push({
              id: generateFieldId(label, fieldIndex++),
              label,
              type,
              defaultValue: valueCell.trim() || '',
              placeholder: type === 'date' ? 'YYYY-MM-DD' : '',
              required: false,
              row: rowIndex,
              col: colIndex,
            })
          }

          // Skip the value cell we just processed
          colIndex++
        } else if (headerRow && headerRow[colIndex]) {
          // Use header as label for this column
          const label = headerRow[colIndex].replace(/^\*\*|\*\*$/g, '').trim()
          const type = detectFieldType(label, cell)

          fields.push({
            id: generateFieldId(label, fieldIndex++),
            label,
            type,
            defaultValue: cell.trim() || '',
            required: false,
            row: rowIndex,
            col: colIndex,
          })
        }
      }
    }
  }

  // Also look for inline checkboxes outside tables
  const inlineCheckboxRegex = /^[-*]\s*(☐|☑|\[\s*[xX]?\s*\])\s*(.+)$/gm
  let checkboxMatch

  while ((checkboxMatch = inlineCheckboxRegex.exec(markdownContent)) !== null) {
    const isChecked = checkboxMatch[1] === '☑' || /\[\s*[xX]\s*\]/.test(checkboxMatch[1])
    const label = checkboxMatch[2].trim()

    fields.push({
      id: generateFieldId(label, fieldIndex++),
      label,
      type: 'checkbox',
      defaultValue: isChecked,
      required: false,
    })
  }

  return fields
}

// ============================================
// GENERATE FILLED MARKDOWN
// ============================================

/**
 * Generate filled markdown from template and field values
 * @param {string} template - Original markdown template
 * @param {Object} fieldValues - Object with field values keyed by field ID
 * @param {Array<FieldDefinition>} fieldDefinitions - Field definitions from parsing
 * @returns {string} Filled markdown content
 */
export function generateFilledMarkdown(template, fieldValues, fieldDefinitions) {
  if (!template || !fieldDefinitions) return template

  let filledContent = template

  // Create a map of labels to values for replacement
  const labelToValue = {}
  for (const field of fieldDefinitions) {
    const value = fieldValues[field.id]
    if (value !== undefined && value !== null && value !== '') {
      labelToValue[field.label] = formatFieldValue(field, value)
    }
  }

  // Replace empty table cells with values
  // Pattern: | Label: |  | or | **Label** |  |
  for (const [label, value] of Object.entries(labelToValue)) {
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Pattern 1: | Label: | value |
    const pattern1 = new RegExp(
      `(\\|\\s*(?:\\*\\*)?${escapedLabel}(?:\\*\\*)?:?\\s*\\|)\\s*\\|`,
      'gi'
    )
    filledContent = filledContent.replace(pattern1, `$1 ${value} |`)

    // Pattern 2: | Label: | [empty] | -> | Label: | value |
    const pattern2 = new RegExp(
      `(\\|\\s*(?:\\*\\*)?${escapedLabel}(?:\\*\\*)?:?\\s*\\|)\\s*(?=\\|)`,
      'gi'
    )
    filledContent = filledContent.replace(pattern2, `$1 ${value} `)
  }

  // Replace checkbox markers
  for (const field of fieldDefinitions) {
    if (field.type === 'checkbox') {
      const value = fieldValues[field.id]
      const escapedLabel = field.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

      if (value === true) {
        // Replace ☐ or [ ] with ☑ or [x]
        filledContent = filledContent.replace(
          new RegExp(`(☐|\\[\\s*\\])\\s*${escapedLabel}`, 'gi'),
          `☑ ${field.label}`
        )
      }
    } else if (field.type === 'checkbox-group' && field.options) {
      const values = fieldValues[field.id] || []
      for (const option of field.options) {
        const escapedOption = option.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const isSelected = values.includes(option.value)

        if (isSelected) {
          filledContent = filledContent.replace(
            new RegExp(`(☐|\\[\\s*\\])\\s*${escapedOption}`, 'gi'),
            `☑ ${option.label}`
          )
        } else {
          filledContent = filledContent.replace(
            new RegExp(`(☑|\\[\\s*[xX]\\s*\\])\\s*${escapedOption}`, 'gi'),
            `☐ ${option.label}`
          )
        }
      }
    }
  }

  return filledContent
}

/**
 * Format field value for display in markdown
 * @param {FieldDefinition} field - Field definition
 * @param {*} value - Field value
 * @returns {string} Formatted value
 */
function formatFieldValue(field, value) {
  if (value === null || value === undefined) return ''

  switch (field.type) {
    case 'date':
      // Format date as YYYY-MM-DD
      if (value instanceof Date) {
        return value.toISOString().split('T')[0]
      }
      return String(value)

    case 'datetime':
      // Format datetime
      if (value instanceof Date) {
        return value.toISOString().replace('T', ' ').substring(0, 16)
      }
      return String(value)

    case 'checkbox':
      return value ? '☑' : '☐'

    case 'checkbox-group':
      if (Array.isArray(value)) {
        return value.join(', ')
      }
      return String(value)

    case 'signature':
      return value ? '[Signed]' : ''

    default:
      return String(value)
  }
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate field value based on field definition
 * @param {FieldDefinition} field - Field definition
 * @param {*} value - Field value
 * @returns {{valid: boolean, error?: string}}
 */
export function validateField(field, value) {
  // Check required fields
  if (field.required) {
    if (value === null || value === undefined || value === '') {
      return { valid: false, error: `${field.label} is required` }
    }
    if (field.type === 'checkbox-group' && (!Array.isArray(value) || value.length === 0)) {
      return { valid: false, error: `${field.label} requires at least one selection` }
    }
  }

  // Type-specific validation
  if (value !== null && value !== undefined && value !== '') {
    switch (field.type) {
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return { valid: false, error: `${field.label} must be a valid email address` }
        }
        break

      case 'phone':
        if (!/^[\d\s\-+()]{7,20}$/.test(value)) {
          return { valid: false, error: `${field.label} must be a valid phone number` }
        }
        break

      case 'number':
        if (isNaN(Number(value))) {
          return { valid: false, error: `${field.label} must be a number` }
        }
        break

      case 'date':
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          return { valid: false, error: `${field.label} must be a valid date (YYYY-MM-DD)` }
        }
        break
    }
  }

  return { valid: true }
}

/**
 * Validate all form fields
 * @param {Array<FieldDefinition>} fields - Field definitions
 * @param {Object} values - Field values
 * @returns {{valid: boolean, errors: Object}}
 */
export function validateForm(fields, values) {
  const errors = {}
  let valid = true

  for (const field of fields) {
    const result = validateField(field, values[field.id])
    if (!result.valid) {
      errors[field.id] = result.error
      valid = false
    }
  }

  return { valid, errors }
}

// ============================================
// FIELD EXTRACTION FROM DOCUMENTS
// ============================================

/**
 * Extract all fillable fields from a document's markdown content
 * This is a higher-level function that handles the full extraction process
 * @param {Object} document - Document object with content field
 * @returns {Array<FieldDefinition>} Array of field definitions
 */
export function extractFieldsFromDocument(document) {
  if (!document || !document.content) {
    return []
  }

  return parseFormToFields(document.content)
}

/**
 * Create initial field values object with defaults
 * @param {Array<FieldDefinition>} fields - Field definitions
 * @returns {Object} Object with field IDs as keys and default values
 */
export function createInitialValues(fields) {
  const values = {}

  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      values[field.id] = field.defaultValue
    } else {
      switch (field.type) {
        case 'checkbox':
          values[field.id] = false
          break
        case 'checkbox-group':
          values[field.id] = []
          break
        case 'number':
          values[field.id] = ''
          break
        default:
          values[field.id] = ''
      }
    }
  }

  return values
}
