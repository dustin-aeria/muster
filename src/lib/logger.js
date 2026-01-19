/**
 * logger.js
 * Development logger utility
 * 
 * Provides console logging that can be disabled in production.
 * All log statements should use these functions instead of console.log directly.
 * 
 * Usage:
 *   import { logger } from '../lib/logger'
 *   logger.debug('My debug message', data)
 *   logger.info('User logged in', { userId })
 *   logger.warn('Rate limit approaching')
 *   logger.error('Failed to save', error)
 * 
 * @location src/lib/logger.js
 * @action NEW
 */

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'

// Log levels
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
}

// Current log level (can be configured via environment variable)
const currentLevel = isDevelopment ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN

/**
 * Format log message with timestamp
 * @param {string} level - Log level name
 * @param {string} message - Log message
 * @returns {string} Formatted message
 */
function formatMessage(level, message) {
  const timestamp = new Date().toISOString().split('T')[1].slice(0, 12)
  return `[${timestamp}] [${level}] ${message}`
}

/**
 * Logger object with level-based methods
 */
export const logger = {
  /**
   * Debug level logging - only in development
   * Use for detailed debugging information
   */
  debug: (message, ...args) => {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.log(formatMessage('DEBUG', message), ...args)
    }
  },

  /**
   * Info level logging - important events
   * Use for significant application events
   */
  info: (message, ...args) => {
    if (currentLevel <= LOG_LEVELS.INFO) {
      console.info(formatMessage('INFO', message), ...args)
    }
  },

  /**
   * Warning level logging - potential issues
   * Use for non-critical problems that should be noted
   */
  warn: (message, ...args) => {
    if (currentLevel <= LOG_LEVELS.WARN) {
      console.warn(formatMessage('WARN', message), ...args)
    }
  },

  /**
   * Error level logging - errors and exceptions
   * Use for errors that need attention
   */
  error: (message, ...args) => {
    if (currentLevel <= LOG_LEVELS.ERROR) {
      console.error(formatMessage('ERROR', message), ...args)
    }
  },

  /**
   * Group related logs together
   * @param {string} label - Group label
   * @param {function} fn - Function containing log statements
   */
  group: (label, fn) => {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.group(label)
      fn()
      console.groupEnd()
    }
  },

  /**
   * Log a table of data
   * @param {Array|Object} data - Data to display as table
   */
  table: (data) => {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.table(data)
    }
  },

  /**
   * Time an operation
   * @param {string} label - Timer label
   */
  time: (label) => {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.time(label)
    }
  },

  /**
   * End timing an operation
   * @param {string} label - Timer label
   */
  timeEnd: (label) => {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.timeEnd(label)
    }
  }
}

/**
 * Create a namespaced logger for a specific module
 * @param {string} namespace - Module name
 * @returns {Object} Namespaced logger
 */
export function createLogger(namespace) {
  return {
    debug: (message, ...args) => logger.debug(`[${namespace}] ${message}`, ...args),
    info: (message, ...args) => logger.info(`[${namespace}] ${message}`, ...args),
    warn: (message, ...args) => logger.warn(`[${namespace}] ${message}`, ...args),
    error: (message, ...args) => logger.error(`[${namespace}] ${message}`, ...args)
  }
}

export default logger
