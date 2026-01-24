/**
 * Date/Time Utilities
 * Common date and time operations for aviation operations
 *
 * @location src/lib/dateUtils.js
 */

// ============================================
// DATE FORMATTING
// ============================================

/**
 * Format date for display
 */
export function formatDate(date, options = {}) {
  if (!date) return ''

  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''

  const {
    format = 'short', // short, medium, long, full
    includeTime = false,
    includeSeconds = false,
    use24Hour = false
  } = options

  const dateOptions = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    medium: { month: 'short', day: 'numeric', year: 'numeric', weekday: 'short' },
    long: { month: 'long', day: 'numeric', year: 'numeric', weekday: 'long' },
    full: { month: 'long', day: 'numeric', year: 'numeric', weekday: 'long' }
  }

  let opts = { ...dateOptions[format] || dateOptions.short }

  if (includeTime) {
    opts.hour = 'numeric'
    opts.minute = '2-digit'
    if (includeSeconds) opts.second = '2-digit'
    if (use24Hour) opts.hour12 = false
  }

  return d.toLocaleDateString('en-US', opts)
}

/**
 * Format time only
 */
export function formatTime(date, options = {}) {
  if (!date) return ''

  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''

  const {
    includeSeconds = false,
    use24Hour = false
  } = options

  const opts = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !use24Hour
  }

  if (includeSeconds) opts.second = '2-digit'

  return d.toLocaleTimeString('en-US', opts)
}

/**
 * Format to ISO date string (YYYY-MM-DD)
 */
export function toISODateString(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}

/**
 * Format to ISO datetime string
 */
export function toISOString(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toISOString()
}

/**
 * Format date for input fields
 */
export function formatForInput(date, type = 'date') {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''

  switch (type) {
    case 'date':
      return toISODateString(d)
    case 'datetime-local':
      return d.toISOString().slice(0, 16)
    case 'time':
      return d.toTimeString().slice(0, 5)
    default:
      return toISODateString(d)
  }
}

// ============================================
// RELATIVE TIME
// ============================================

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date) {
  if (!date) return ''

  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''

  const now = new Date()
  const diff = now - d
  const absDiff = Math.abs(diff)
  const isPast = diff > 0

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day

  let value, unit

  if (absDiff < minute) {
    return 'Just now'
  } else if (absDiff < hour) {
    value = Math.floor(absDiff / minute)
    unit = value === 1 ? 'minute' : 'minutes'
  } else if (absDiff < day) {
    value = Math.floor(absDiff / hour)
    unit = value === 1 ? 'hour' : 'hours'
  } else if (absDiff < week) {
    value = Math.floor(absDiff / day)
    unit = value === 1 ? 'day' : 'days'
  } else if (absDiff < month) {
    value = Math.floor(absDiff / week)
    unit = value === 1 ? 'week' : 'weeks'
  } else if (absDiff < year) {
    value = Math.floor(absDiff / month)
    unit = value === 1 ? 'month' : 'months'
  } else {
    value = Math.floor(absDiff / year)
    unit = value === 1 ? 'year' : 'years'
  }

  return isPast ? `${value} ${unit} ago` : `in ${value} ${unit}`
}

/**
 * Get compact relative time (e.g., "2h")
 */
export function getCompactRelativeTime(date) {
  if (!date) return ''

  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''

  const now = new Date()
  const diff = now - d
  const absDiff = Math.abs(diff)

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day

  if (absDiff < minute) return 'now'
  if (absDiff < hour) return `${Math.floor(absDiff / minute)}m`
  if (absDiff < day) return `${Math.floor(absDiff / hour)}h`
  if (absDiff < week) return `${Math.floor(absDiff / day)}d`
  if (absDiff < month) return `${Math.floor(absDiff / week)}w`
  if (absDiff < year) return `${Math.floor(absDiff / month)}mo`
  return `${Math.floor(absDiff / year)}y`
}

// ============================================
// DATE CALCULATIONS
// ============================================

/**
 * Add time to a date
 */
export function addTime(date, amount, unit) {
  const d = new Date(date)

  switch (unit) {
    case 'minutes':
      d.setMinutes(d.getMinutes() + amount)
      break
    case 'hours':
      d.setHours(d.getHours() + amount)
      break
    case 'days':
      d.setDate(d.getDate() + amount)
      break
    case 'weeks':
      d.setDate(d.getDate() + (amount * 7))
      break
    case 'months':
      d.setMonth(d.getMonth() + amount)
      break
    case 'years':
      d.setFullYear(d.getFullYear() + amount)
      break
  }

  return d
}

/**
 * Subtract time from a date
 */
export function subtractTime(date, amount, unit) {
  return addTime(date, -amount, unit)
}

/**
 * Get difference between two dates
 */
export function getDateDiff(date1, date2, unit = 'days') {
  const d1 = date1 instanceof Date ? date1 : new Date(date1)
  const d2 = date2 instanceof Date ? date2 : new Date(date2)

  const diff = d2 - d1

  switch (unit) {
    case 'seconds':
      return Math.floor(diff / 1000)
    case 'minutes':
      return Math.floor(diff / 60000)
    case 'hours':
      return Math.floor(diff / 3600000)
    case 'days':
      return Math.floor(diff / 86400000)
    case 'weeks':
      return Math.floor(diff / 604800000)
    case 'months':
      return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth())
    case 'years':
      return d2.getFullYear() - d1.getFullYear()
    default:
      return diff
  }
}

/**
 * Get start of period
 */
export function startOf(date, unit) {
  const d = new Date(date)

  switch (unit) {
    case 'day':
      d.setHours(0, 0, 0, 0)
      break
    case 'week':
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - d.getDay())
      break
    case 'month':
      d.setHours(0, 0, 0, 0)
      d.setDate(1)
      break
    case 'year':
      d.setHours(0, 0, 0, 0)
      d.setMonth(0, 1)
      break
  }

  return d
}

/**
 * Get end of period
 */
export function endOf(date, unit) {
  const d = new Date(date)

  switch (unit) {
    case 'day':
      d.setHours(23, 59, 59, 999)
      break
    case 'week':
      d.setDate(d.getDate() + (6 - d.getDay()))
      d.setHours(23, 59, 59, 999)
      break
    case 'month':
      d.setMonth(d.getMonth() + 1, 0)
      d.setHours(23, 59, 59, 999)
      break
    case 'year':
      d.setMonth(11, 31)
      d.setHours(23, 59, 59, 999)
      break
  }

  return d
}

// ============================================
// DATE COMPARISONS
// ============================================

/**
 * Check if date is today
 */
export function isToday(date) {
  if (!date) return false
  const d = date instanceof Date ? date : new Date(date)
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date) {
  if (!date) return false
  const d = date instanceof Date ? date : new Date(date)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return d.toDateString() === yesterday.toDateString()
}

/**
 * Check if date is tomorrow
 */
export function isTomorrow(date) {
  if (!date) return false
  const d = date instanceof Date ? date : new Date(date)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return d.toDateString() === tomorrow.toDateString()
}

/**
 * Check if date is in the past
 */
export function isPast(date) {
  if (!date) return false
  const d = date instanceof Date ? date : new Date(date)
  return d < new Date()
}

/**
 * Check if date is in the future
 */
export function isFuture(date) {
  if (!date) return false
  const d = date instanceof Date ? date : new Date(date)
  return d > new Date()
}

/**
 * Check if date is within a range
 */
export function isWithinRange(date, startDate, endDate) {
  if (!date) return false
  const d = date instanceof Date ? date : new Date(date)
  const start = startDate instanceof Date ? startDate : new Date(startDate)
  const end = endDate instanceof Date ? endDate : new Date(endDate)
  return d >= start && d <= end
}

/**
 * Check if date is overdue
 */
export function isOverdue(date) {
  if (!date) return false
  const d = date instanceof Date ? date : new Date(date)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return d < now
}

/**
 * Check if date is due soon (within n days)
 */
export function isDueSoon(date, days = 7) {
  if (!date) return false
  const d = date instanceof Date ? date : new Date(date)
  const now = new Date()
  const threshold = addTime(now, days, 'days')
  return d >= now && d <= threshold
}

// ============================================
// FLIGHT TIME CALCULATIONS
// ============================================

/**
 * Format duration (milliseconds to HH:MM:SS)
 */
export function formatDuration(ms, options = {}) {
  if (!ms || ms < 0) return '00:00'

  const {
    includeSeconds = false,
    compact = false
  } = options

  const hours = Math.floor(ms / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)

  if (compact) {
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const h = String(hours).padStart(2, '0')
  const m = String(minutes).padStart(2, '0')
  const s = String(seconds).padStart(2, '0')

  return includeSeconds ? `${h}:${m}:${s}` : `${h}:${m}`
}

/**
 * Parse duration string to milliseconds
 */
export function parseDuration(durationStr) {
  if (!durationStr) return 0

  // Handle HH:MM:SS or HH:MM format
  if (durationStr.includes(':')) {
    const parts = durationStr.split(':').map(Number)
    if (parts.length === 3) {
      return (parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000
    } else if (parts.length === 2) {
      return (parts[0] * 3600 + parts[1] * 60) * 1000
    }
  }

  // Handle "1h 30m" format
  const hourMatch = durationStr.match(/(\d+)\s*h/i)
  const minMatch = durationStr.match(/(\d+)\s*m/i)
  const secMatch = durationStr.match(/(\d+)\s*s/i)

  let total = 0
  if (hourMatch) total += parseInt(hourMatch[1]) * 3600000
  if (minMatch) total += parseInt(minMatch[1]) * 60000
  if (secMatch) total += parseInt(secMatch[1]) * 1000

  return total
}

/**
 * Calculate flight time
 */
export function calculateFlightTime(takeoffTime, landingTime) {
  if (!takeoffTime || !landingTime) return null

  const takeoff = takeoffTime instanceof Date ? takeoffTime : new Date(takeoffTime)
  const landing = landingTime instanceof Date ? landingTime : new Date(landingTime)

  if (isNaN(takeoff.getTime()) || isNaN(landing.getTime())) return null
  if (landing < takeoff) return null

  return landing - takeoff
}

/**
 * Sum multiple durations
 */
export function sumDurations(...durations) {
  return durations.reduce((total, duration) => {
    if (typeof duration === 'string') {
      return total + parseDuration(duration)
    }
    return total + (duration || 0)
  }, 0)
}

// ============================================
// DATE RANGES
// ============================================

/**
 * Get date range presets
 */
export function getDateRangePresets() {
  const now = new Date()

  return {
    today: {
      label: 'Today',
      start: startOf(now, 'day'),
      end: endOf(now, 'day')
    },
    yesterday: {
      label: 'Yesterday',
      start: startOf(subtractTime(now, 1, 'days'), 'day'),
      end: endOf(subtractTime(now, 1, 'days'), 'day')
    },
    thisWeek: {
      label: 'This Week',
      start: startOf(now, 'week'),
      end: endOf(now, 'week')
    },
    lastWeek: {
      label: 'Last Week',
      start: startOf(subtractTime(now, 1, 'weeks'), 'week'),
      end: endOf(subtractTime(now, 1, 'weeks'), 'week')
    },
    thisMonth: {
      label: 'This Month',
      start: startOf(now, 'month'),
      end: endOf(now, 'month')
    },
    lastMonth: {
      label: 'Last Month',
      start: startOf(subtractTime(now, 1, 'months'), 'month'),
      end: endOf(subtractTime(now, 1, 'months'), 'month')
    },
    last7Days: {
      label: 'Last 7 Days',
      start: subtractTime(now, 7, 'days'),
      end: now
    },
    last30Days: {
      label: 'Last 30 Days',
      start: subtractTime(now, 30, 'days'),
      end: now
    },
    last90Days: {
      label: 'Last 90 Days',
      start: subtractTime(now, 90, 'days'),
      end: now
    },
    thisYear: {
      label: 'This Year',
      start: startOf(now, 'year'),
      end: endOf(now, 'year')
    },
    lastYear: {
      label: 'Last Year',
      start: startOf(subtractTime(now, 1, 'years'), 'year'),
      end: endOf(subtractTime(now, 1, 'years'), 'year')
    }
  }
}

/**
 * Generate date range for calendar
 */
export function getCalendarDates(year, month) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const dates = []

  // Add days from previous month to fill the first week
  const startPadding = firstDay.getDay()
  for (let i = startPadding - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    dates.push({ date: d, isCurrentMonth: false })
  }

  // Add all days of current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    dates.push({
      date: new Date(year, month, day),
      isCurrentMonth: true
    })
  }

  // Add days from next month to complete the last week
  const endPadding = 6 - lastDay.getDay()
  for (let i = 1; i <= endPadding; i++) {
    dates.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false
    })
  }

  return dates
}

// ============================================
// TIMEZONE HELPERS
// ============================================

/**
 * Get local timezone
 */
export function getLocalTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

/**
 * Format with timezone
 */
export function formatWithTimezone(date, timezone) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''

  return d.toLocaleString('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  })
}

/**
 * Get UTC offset for a timezone
 */
export function getTimezoneOffset(timezone) {
  const now = new Date()
  const utc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
  const tz = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
  return (tz - utc) / 3600000
}

export default {
  formatDate,
  formatTime,
  toISODateString,
  toISOString,
  formatForInput,
  getRelativeTime,
  getCompactRelativeTime,
  addTime,
  subtractTime,
  getDateDiff,
  startOf,
  endOf,
  isToday,
  isYesterday,
  isTomorrow,
  isPast,
  isFuture,
  isWithinRange,
  isOverdue,
  isDueSoon,
  formatDuration,
  parseDuration,
  calculateFlightTime,
  sumDurations,
  getDateRangePresets,
  getCalendarDates,
  getLocalTimezone,
  formatWithTimezone,
  getTimezoneOffset
}
