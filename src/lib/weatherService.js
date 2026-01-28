/**
 * Weather Service
 * Integration with Open-Meteo API for weather data and flight conditions
 *
 * Open-Meteo is free, no API key required
 * https://open-meteo.com/
 *
 * @location src/lib/weatherService.js
 */

import { logger } from './logger'

const BASE_URL = 'https://api.open-meteo.com/v1'

// WMO Weather Codes mapping
const WMO_CODES = {
  0: { description: 'Clear sky', icon: 'sun' },
  1: { description: 'Mainly clear', icon: 'sun' },
  2: { description: 'Partly cloudy', icon: 'cloud-sun' },
  3: { description: 'Overcast', icon: 'cloud' },
  45: { description: 'Fog', icon: 'cloud-fog' },
  48: { description: 'Depositing rime fog', icon: 'cloud-fog' },
  51: { description: 'Light drizzle', icon: 'cloud-drizzle' },
  53: { description: 'Moderate drizzle', icon: 'cloud-drizzle' },
  55: { description: 'Dense drizzle', icon: 'cloud-drizzle' },
  56: { description: 'Light freezing drizzle', icon: 'cloud-drizzle' },
  57: { description: 'Dense freezing drizzle', icon: 'cloud-drizzle' },
  61: { description: 'Slight rain', icon: 'cloud-rain' },
  63: { description: 'Moderate rain', icon: 'cloud-rain' },
  65: { description: 'Heavy rain', icon: 'cloud-rain' },
  66: { description: 'Light freezing rain', icon: 'cloud-rain' },
  67: { description: 'Heavy freezing rain', icon: 'cloud-rain' },
  71: { description: 'Slight snow', icon: 'cloud-snow' },
  73: { description: 'Moderate snow', icon: 'cloud-snow' },
  75: { description: 'Heavy snow', icon: 'cloud-snow' },
  77: { description: 'Snow grains', icon: 'cloud-snow' },
  80: { description: 'Slight rain showers', icon: 'cloud-rain' },
  81: { description: 'Moderate rain showers', icon: 'cloud-rain' },
  82: { description: 'Violent rain showers', icon: 'cloud-rain' },
  85: { description: 'Slight snow showers', icon: 'cloud-snow' },
  86: { description: 'Heavy snow showers', icon: 'cloud-snow' },
  95: { description: 'Thunderstorm', icon: 'cloud-lightning' },
  96: { description: 'Thunderstorm with slight hail', icon: 'cloud-lightning' },
  99: { description: 'Thunderstorm with heavy hail', icon: 'cloud-lightning' }
}

// Flight condition thresholds (simplified VFR/MVFR/IFR/LIFR)
const FLIGHT_CONDITIONS = {
  VFR: {
    label: 'VFR',
    description: 'Visual Flight Rules',
    color: 'green',
    bgClass: 'bg-green-100 text-green-800',
    minVisibility: 8, // km
    minCeiling: 1000 // meters
  },
  MVFR: {
    label: 'MVFR',
    description: 'Marginal VFR',
    color: 'blue',
    bgClass: 'bg-blue-100 text-blue-800',
    minVisibility: 5,
    minCeiling: 300
  },
  IFR: {
    label: 'IFR',
    description: 'Instrument Flight Rules',
    color: 'red',
    bgClass: 'bg-red-100 text-red-800',
    minVisibility: 1.6,
    minCeiling: 150
  },
  LIFR: {
    label: 'LIFR',
    description: 'Low IFR',
    color: 'purple',
    bgClass: 'bg-purple-100 text-purple-800',
    minVisibility: 0,
    minCeiling: 0
  }
}

/**
 * Calculate flight condition category based on visibility and cloud base
 */
export function calculateFlightCondition(visibility, cloudBase) {
  // visibility in km, cloudBase in meters
  if (visibility >= 8 && cloudBase >= 1000) return FLIGHT_CONDITIONS.VFR
  if (visibility >= 5 && cloudBase >= 300) return FLIGHT_CONDITIONS.MVFR
  if (visibility >= 1.6 && cloudBase >= 150) return FLIGHT_CONDITIONS.IFR
  return FLIGHT_CONDITIONS.LIFR
}

/**
 * Assess drone flight suitability
 */
export function assessDroneFlightConditions(weather) {
  const issues = []
  let severity = 'good' // good, caution, warning, no-fly

  // Wind assessment (typical small drone limits)
  if (weather.windSpeed > 40) {
    issues.push('Wind exceeds safe operating limits (>40 km/h)')
    severity = 'no-fly'
  } else if (weather.windSpeed > 30) {
    issues.push('High winds - exercise caution')
    if (severity !== 'no-fly') severity = 'warning'
  } else if (weather.windSpeed > 20) {
    issues.push('Moderate winds')
    if (severity === 'good') severity = 'caution'
  }

  // Wind gusts
  if (weather.windGusts > 50) {
    issues.push('Dangerous wind gusts (>50 km/h)')
    severity = 'no-fly'
  } else if (weather.windGusts > 35) {
    issues.push('Strong gusts present')
    if (severity !== 'no-fly') severity = 'warning'
  }

  // Precipitation
  if (weather.precipitation > 0) {
    issues.push('Precipitation present - not recommended for most drones')
    if (severity === 'good' || severity === 'caution') severity = 'warning'
  }

  // Visibility
  if (weather.visibility < 3) {
    issues.push('Low visibility (<3 km) - VLOS operations compromised')
    severity = 'no-fly'
  } else if (weather.visibility < 5) {
    issues.push('Reduced visibility')
    if (severity === 'good') severity = 'caution'
  }

  // Temperature
  if (weather.temperature < -10) {
    issues.push('Very cold temperatures may affect battery performance')
    if (severity === 'good') severity = 'caution'
  } else if (weather.temperature > 40) {
    issues.push('High temperatures may cause overheating')
    if (severity === 'good') severity = 'caution'
  }

  // Weather code based issues
  const weatherCode = weather.weatherCode
  if ([95, 96, 99].includes(weatherCode)) {
    issues.push('Thunderstorm activity - do not fly')
    severity = 'no-fly'
  } else if ([45, 48].includes(weatherCode)) {
    issues.push('Fog conditions')
    if (severity !== 'no-fly') severity = 'warning'
  } else if ([65, 67, 75, 82, 86].includes(weatherCode)) {
    issues.push('Heavy precipitation')
    if (severity !== 'no-fly') severity = 'warning'
  }

  const severityConfig = {
    'good': { label: 'Good', color: 'green', bgClass: 'bg-green-100 text-green-800' },
    'caution': { label: 'Caution', color: 'yellow', bgClass: 'bg-yellow-100 text-yellow-800' },
    'warning': { label: 'Warning', color: 'orange', bgClass: 'bg-orange-100 text-orange-800' },
    'no-fly': { label: 'No-Fly', color: 'red', bgClass: 'bg-red-100 text-red-800' }
  }

  return {
    severity,
    ...severityConfig[severity],
    issues,
    canFly: severity !== 'no-fly'
  }
}

/**
 * Fetch current weather for a location
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Current weather data
 */
export async function getCurrentWeather(lat, lon) {
  try {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'precipitation',
        'weather_code',
        'cloud_cover',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m',
        'visibility'
      ].join(','),
      wind_speed_unit: 'kmh',
      timezone: 'auto'
    })

    const response = await fetch(`${BASE_URL}/forecast?${params}`)

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()
    const current = data.current

    const weatherCode = current.weather_code
    const weatherInfo = WMO_CODES[weatherCode] || { description: 'Unknown', icon: 'cloud' }

    // Estimate cloud base (rough approximation based on humidity and temp)
    // In reality this would come from METAR data
    const cloudBase = current.cloud_cover > 50
      ? Math.max(300, 3000 - (current.cloud_cover * 20))
      : 3000

    const weather = {
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      precipitation: current.precipitation,
      weatherCode,
      weatherDescription: weatherInfo.description,
      weatherIcon: weatherInfo.icon,
      cloudCover: current.cloud_cover,
      windSpeed: current.wind_speed_10m,
      windDirection: current.wind_direction_10m,
      windGusts: current.wind_gusts_10m,
      visibility: current.visibility / 1000, // Convert m to km
      cloudBase,
      timestamp: new Date(current.time),
      timezone: data.timezone
    }

    // Add calculated conditions
    weather.flightCondition = calculateFlightCondition(weather.visibility, cloudBase)
    weather.droneAssessment = assessDroneFlightConditions(weather)

    return weather
  } catch (error) {
    logger.error('Error fetching current weather:', error)
    throw error
  }
}

/**
 * Fetch weather forecast for a location
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} days - Number of days (1-16)
 * @returns {Promise<Object>} Forecast data
 */
export async function getWeatherForecast(lat, lon, days = 7) {
  try {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
        'precipitation_probability_max',
        'wind_speed_10m_max',
        'wind_gusts_10m_max',
        'wind_direction_10m_dominant'
      ].join(','),
      wind_speed_unit: 'kmh',
      timezone: 'auto',
      forecast_days: days
    })

    const response = await fetch(`${BASE_URL}/forecast?${params}`)

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()
    const daily = data.daily

    const forecast = daily.time.map((date, i) => {
      const weatherCode = daily.weather_code[i]
      const weatherInfo = WMO_CODES[weatherCode] || { description: 'Unknown', icon: 'cloud' }

      return {
        date: new Date(date),
        tempMax: daily.temperature_2m_max[i],
        tempMin: daily.temperature_2m_min[i],
        precipitation: daily.precipitation_sum[i],
        precipProbability: daily.precipitation_probability_max[i],
        windSpeedMax: daily.wind_speed_10m_max[i],
        windGustsMax: daily.wind_gusts_10m_max[i],
        windDirection: daily.wind_direction_10m_dominant[i],
        weatherCode,
        weatherDescription: weatherInfo.description,
        weatherIcon: weatherInfo.icon
      }
    })

    return {
      forecast,
      timezone: data.timezone,
      location: {
        lat: data.latitude,
        lon: data.longitude
      }
    }
  } catch (error) {
    logger.error('Error fetching weather forecast:', error)
    throw error
  }
}

/**
 * Get hourly forecast for flight planning
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} hours - Hours ahead (max 168 = 7 days)
 * @returns {Promise<Object>} Hourly forecast data
 */
export async function getHourlyForecast(lat, lon, hours = 24) {
  try {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      hourly: [
        'temperature_2m',
        'precipitation',
        'precipitation_probability',
        'weather_code',
        'cloud_cover',
        'visibility',
        'wind_speed_10m',
        'wind_direction_10m',
        'wind_gusts_10m'
      ].join(','),
      wind_speed_unit: 'kmh',
      timezone: 'auto',
      forecast_hours: hours
    })

    const response = await fetch(`${BASE_URL}/forecast?${params}`)

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()
    const hourly = data.hourly

    const forecast = hourly.time.map((time, i) => {
      const weatherCode = hourly.weather_code[i]
      const weatherInfo = WMO_CODES[weatherCode] || { description: 'Unknown', icon: 'cloud' }
      const visibility = hourly.visibility[i] / 1000 // Convert to km
      const cloudBase = hourly.cloud_cover[i] > 50
        ? Math.max(300, 3000 - (hourly.cloud_cover[i] * 20))
        : 3000

      const weather = {
        time: new Date(time),
        temperature: hourly.temperature_2m[i],
        precipitation: hourly.precipitation[i],
        precipProbability: hourly.precipitation_probability[i],
        weatherCode,
        weatherDescription: weatherInfo.description,
        weatherIcon: weatherInfo.icon,
        cloudCover: hourly.cloud_cover[i],
        visibility,
        windSpeed: hourly.wind_speed_10m[i],
        windDirection: hourly.wind_direction_10m[i],
        windGusts: hourly.wind_gusts_10m[i],
        cloudBase
      }

      weather.flightCondition = calculateFlightCondition(visibility, cloudBase)
      weather.droneAssessment = assessDroneFlightConditions(weather)

      return weather
    })

    return {
      forecast,
      timezone: data.timezone
    }
  } catch (error) {
    logger.error('Error fetching hourly forecast:', error)
    throw error
  }
}

/**
 * Get wind direction as compass bearing
 */
export function getWindDirectionLabel(degrees) {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  const index = Math.round(degrees / 22.5) % 16
  return directions[index]
}

export default {
  getCurrentWeather,
  getWeatherForecast,
  getHourlyForecast,
  calculateFlightCondition,
  assessDroneFlightConditions,
  getWindDirectionLabel,
  FLIGHT_CONDITIONS,
  WMO_CODES
}
