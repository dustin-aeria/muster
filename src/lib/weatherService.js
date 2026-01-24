/**
 * Weather Service
 * Check weather conditions for flight operations
 *
 * @location src/lib/weatherService.js
 */

// ============================================
// WEATHER CONDITION TYPES
// ============================================

export const FLIGHT_CATEGORIES = {
  vfr: {
    label: 'VFR',
    description: 'Visual Flight Rules',
    color: 'bg-green-100 text-green-700',
    criteria: 'Ceiling > 3000ft, Visibility > 5 miles'
  },
  mvfr: {
    label: 'MVFR',
    description: 'Marginal VFR',
    color: 'bg-yellow-100 text-yellow-700',
    criteria: 'Ceiling 1000-3000ft, Visibility 3-5 miles'
  },
  ifr: {
    label: 'IFR',
    description: 'Instrument Flight Rules',
    color: 'bg-orange-100 text-orange-700',
    criteria: 'Ceiling 500-1000ft, Visibility 1-3 miles'
  },
  lifr: {
    label: 'LIFR',
    description: 'Low IFR',
    color: 'bg-red-100 text-red-700',
    criteria: 'Ceiling < 500ft, Visibility < 1 mile'
  }
}

export const WIND_CONDITIONS = {
  calm: { label: 'Calm', maxSpeed: 5, color: 'bg-green-100 text-green-700' },
  light: { label: 'Light', maxSpeed: 10, color: 'bg-green-100 text-green-700' },
  moderate: { label: 'Moderate', maxSpeed: 20, color: 'bg-yellow-100 text-yellow-700' },
  strong: { label: 'Strong', maxSpeed: 30, color: 'bg-orange-100 text-orange-700' },
  severe: { label: 'Severe', maxSpeed: Infinity, color: 'bg-red-100 text-red-700' }
}

export const PRECIPITATION_TYPES = {
  none: { label: 'None', icon: 'Sun', flyable: true },
  light_rain: { label: 'Light Rain', icon: 'CloudDrizzle', flyable: false },
  rain: { label: 'Rain', icon: 'CloudRain', flyable: false },
  heavy_rain: { label: 'Heavy Rain', icon: 'CloudRain', flyable: false },
  snow: { label: 'Snow', icon: 'CloudSnow', flyable: false },
  fog: { label: 'Fog', icon: 'Cloud', flyable: false },
  thunderstorm: { label: 'Thunderstorm', icon: 'CloudLightning', flyable: false }
}

// ============================================
// WEATHER LIMITS FOR DRONE OPERATIONS
// ============================================

export const DEFAULT_WEATHER_LIMITS = {
  maxWindSpeed: 10, // m/s
  maxGustSpeed: 15, // m/s
  minVisibility: 5, // km
  minCeiling: 120, // meters (400ft)
  maxPrecipitation: 'none',
  minTemperature: 0, // celsius
  maxTemperature: 40 // celsius
}

// ============================================
// WEATHER ASSESSMENT
// ============================================

/**
 * Assess weather conditions for flight
 */
export function assessWeatherConditions(weather, limits = DEFAULT_WEATHER_LIMITS) {
  const issues = []
  let flyable = true
  let category = 'vfr'

  // Wind check
  if (weather.windSpeed > limits.maxWindSpeed) {
    issues.push({
      type: 'wind',
      severity: 'warning',
      message: `Wind speed ${weather.windSpeed} m/s exceeds limit of ${limits.maxWindSpeed} m/s`
    })
    flyable = false
  }

  if (weather.gustSpeed && weather.gustSpeed > limits.maxGustSpeed) {
    issues.push({
      type: 'gusts',
      severity: 'warning',
      message: `Gust speed ${weather.gustSpeed} m/s exceeds limit of ${limits.maxGustSpeed} m/s`
    })
    flyable = false
  }

  // Visibility check
  if (weather.visibility < limits.minVisibility) {
    issues.push({
      type: 'visibility',
      severity: 'warning',
      message: `Visibility ${weather.visibility} km below minimum of ${limits.minVisibility} km`
    })
    flyable = false

    if (weather.visibility < 1) {
      category = 'lifr'
    } else if (weather.visibility < 5) {
      category = 'ifr'
    } else {
      category = 'mvfr'
    }
  }

  // Ceiling check
  if (weather.ceiling && weather.ceiling < limits.minCeiling) {
    issues.push({
      type: 'ceiling',
      severity: 'warning',
      message: `Cloud ceiling ${weather.ceiling}m below minimum of ${limits.minCeiling}m`
    })
    flyable = false
  }

  // Precipitation check
  if (weather.precipitation && weather.precipitation !== 'none') {
    const precip = PRECIPITATION_TYPES[weather.precipitation]
    if (precip && !precip.flyable) {
      issues.push({
        type: 'precipitation',
        severity: 'critical',
        message: `${precip.label} conditions - flight not recommended`
      })
      flyable = false
    }
  }

  // Temperature check
  if (weather.temperature < limits.minTemperature) {
    issues.push({
      type: 'temperature',
      severity: 'warning',
      message: `Temperature ${weather.temperature}°C below minimum of ${limits.minTemperature}°C`
    })
  }

  if (weather.temperature > limits.maxTemperature) {
    issues.push({
      type: 'temperature',
      severity: 'warning',
      message: `Temperature ${weather.temperature}°C exceeds maximum of ${limits.maxTemperature}°C`
    })
  }

  return {
    flyable,
    category,
    categoryInfo: FLIGHT_CATEGORIES[category],
    issues,
    summary: flyable
      ? 'Weather conditions suitable for flight'
      : `${issues.length} issue(s) detected - review before flight`
  }
}

/**
 * Get wind condition category
 */
export function getWindCondition(speedMs) {
  if (speedMs <= 5) return WIND_CONDITIONS.calm
  if (speedMs <= 10) return WIND_CONDITIONS.light
  if (speedMs <= 20) return WIND_CONDITIONS.moderate
  if (speedMs <= 30) return WIND_CONDITIONS.strong
  return WIND_CONDITIONS.severe
}

/**
 * Convert wind direction degrees to cardinal
 */
export function degreesToCardinal(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

// ============================================
// WEATHER DATA FORMATTING
// ============================================

/**
 * Format weather data for display
 */
export function formatWeatherData(weather) {
  return {
    temperature: weather.temperature !== undefined
      ? `${Math.round(weather.temperature)}°C`
      : 'N/A',
    feelsLike: weather.feelsLike !== undefined
      ? `${Math.round(weather.feelsLike)}°C`
      : null,
    humidity: weather.humidity !== undefined
      ? `${weather.humidity}%`
      : 'N/A',
    wind: weather.windSpeed !== undefined
      ? `${weather.windSpeed.toFixed(1)} m/s ${weather.windDirection ? degreesToCardinal(weather.windDirection) : ''}`
      : 'N/A',
    gusts: weather.gustSpeed
      ? `${weather.gustSpeed.toFixed(1)} m/s`
      : null,
    visibility: weather.visibility !== undefined
      ? `${weather.visibility} km`
      : 'N/A',
    ceiling: weather.ceiling
      ? `${weather.ceiling}m`
      : 'Unlimited',
    pressure: weather.pressure
      ? `${weather.pressure} hPa`
      : null,
    dewPoint: weather.dewPoint !== undefined
      ? `${Math.round(weather.dewPoint)}°C`
      : null,
    precipitation: weather.precipitation
      ? PRECIPITATION_TYPES[weather.precipitation]?.label || weather.precipitation
      : 'None',
    condition: weather.condition || 'Unknown'
  }
}

/**
 * Create weather summary text
 */
export function createWeatherSummary(weather) {
  const parts = []

  if (weather.condition) {
    parts.push(weather.condition)
  }

  if (weather.temperature !== undefined) {
    parts.push(`${Math.round(weather.temperature)}°C`)
  }

  if (weather.windSpeed !== undefined) {
    const windCond = getWindCondition(weather.windSpeed)
    parts.push(`${windCond.label} wind ${weather.windSpeed.toFixed(1)} m/s`)
  }

  if (weather.visibility !== undefined && weather.visibility < 10) {
    parts.push(`Visibility ${weather.visibility} km`)
  }

  return parts.join(', ')
}

// ============================================
// WEATHER WINDOW CALCULATION
// ============================================

/**
 * Find optimal flight windows in forecast
 */
export function findFlightWindows(forecast, limits = DEFAULT_WEATHER_LIMITS) {
  const windows = []
  let currentWindow = null

  forecast.forEach((hour, index) => {
    const assessment = assessWeatherConditions(hour, limits)

    if (assessment.flyable) {
      if (!currentWindow) {
        currentWindow = {
          start: hour.time,
          startIndex: index,
          conditions: []
        }
      }
      currentWindow.conditions.push(hour)
    } else {
      if (currentWindow) {
        currentWindow.end = forecast[index - 1]?.time || hour.time
        currentWindow.endIndex = index - 1
        currentWindow.duration = currentWindow.conditions.length
        windows.push(currentWindow)
        currentWindow = null
      }
    }
  })

  // Close any open window
  if (currentWindow) {
    currentWindow.end = forecast[forecast.length - 1]?.time
    currentWindow.endIndex = forecast.length - 1
    currentWindow.duration = currentWindow.conditions.length
    windows.push(currentWindow)
  }

  return windows
}

/**
 * Get best flight window
 */
export function getBestFlightWindow(forecast, limits = DEFAULT_WEATHER_LIMITS, minDuration = 2) {
  const windows = findFlightWindows(forecast, limits)
  const validWindows = windows.filter(w => w.duration >= minDuration)

  if (validWindows.length === 0) return null

  // Sort by duration (longest first) then by earliest start
  validWindows.sort((a, b) => {
    if (b.duration !== a.duration) return b.duration - a.duration
    return a.startIndex - b.startIndex
  })

  return validWindows[0]
}

// ============================================
// UNIT CONVERSIONS
// ============================================

export const conversions = {
  // Wind speed
  msToKnots: (ms) => ms * 1.94384,
  knotsToMs: (knots) => knots / 1.94384,
  msToKmh: (ms) => ms * 3.6,
  kmhToMs: (kmh) => kmh / 3.6,
  msToMph: (ms) => ms * 2.23694,
  mphToMs: (mph) => mph / 2.23694,

  // Temperature
  celsiusToFahrenheit: (c) => (c * 9/5) + 32,
  fahrenheitToCelsius: (f) => (f - 32) * 5/9,

  // Distance/Visibility
  kmToMiles: (km) => km * 0.621371,
  milesToKm: (miles) => miles / 0.621371,
  metersToFeet: (m) => m * 3.28084,
  feetToMeters: (ft) => ft / 3.28084,

  // Pressure
  hPaToInHg: (hPa) => hPa * 0.02953,
  inHgToHPa: (inHg) => inHg / 0.02953
}

export default {
  FLIGHT_CATEGORIES,
  WIND_CONDITIONS,
  PRECIPITATION_TYPES,
  DEFAULT_WEATHER_LIMITS,
  assessWeatherConditions,
  getWindCondition,
  degreesToCardinal,
  formatWeatherData,
  createWeatherSummary,
  findFlightWindows,
  getBestFlightWindow,
  conversions
}
