/**
 * WeatherWidget.jsx
 * Displays current weather and flight conditions for a location
 *
 * @location src/components/weather/WeatherWidget.jsx
 */

import { useState, useEffect } from 'react'
import {
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  Sun,
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Compass,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Plane
} from 'lucide-react'
import { getCurrentWeather, getWeatherForecast, getWindDirectionLabel } from '../../lib/weatherService'
import { format } from 'date-fns'

// Map weather icon names to Lucide components
const WEATHER_ICONS = {
  'sun': Sun,
  'cloud-sun': CloudSun,
  'cloud': Cloud,
  'cloud-rain': CloudRain,
  'cloud-snow': CloudSnow,
  'cloud-lightning': CloudLightning,
  'cloud-drizzle': CloudDrizzle,
  'cloud-fog': CloudFog
}

export default function WeatherWidget({ lat, lon, siteName = 'Site', compact = false }) {
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState(!compact)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (lat && lon) {
      loadWeather()
    }
  }, [lat, lon])

  const loadWeather = async () => {
    if (!lat || !lon) return

    setLoading(true)
    setError(null)

    try {
      const [currentWeather, forecastData] = await Promise.all([
        getCurrentWeather(lat, lon),
        getWeatherForecast(lat, lon, 5)
      ])

      setWeather(currentWeather)
      setForecast(forecastData.forecast)
    } catch (err) {
      console.error('Weather load error:', err)
      setError('Unable to load weather data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadWeather()
    setRefreshing(false)
  }

  if (!lat || !lon) {
    return (
      <div className="card bg-gray-50">
        <div className="flex items-center gap-2 text-gray-500">
          <Cloud className="w-5 h-5" />
          <span className="text-sm">No location coordinates available</span>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-500">Loading weather...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="p-1.5 text-red-600 hover:bg-red-100 rounded"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  if (!weather) return null

  const WeatherIcon = WEATHER_ICONS[weather.weatherIcon] || Cloud
  const assessment = weather.droneAssessment

  // Compact view for embedding in other components
  if (compact && !expanded) {
    return (
      <div className="card">
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${assessment.bgClass}`}>
              <Plane className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <WeatherIcon className="w-5 h-5 text-gray-600" />
                <span className="font-medium">{Math.round(weather.temperature)}°C</span>
                <span className="text-gray-500 text-sm">{weather.weatherDescription}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5" />
                  {Math.round(weather.windSpeed)} km/h
                </span>
                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${assessment.bgClass}`}>
                  {assessment.label}
                </span>
              </div>
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    )
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-aeria-navy" />
          <h3 className="font-semibold text-gray-900">Weather - {siteName}</h3>
        </div>
        <div className="flex items-center gap-2">
          {compact && (
            <button
              onClick={() => setExpanded(false)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Flight Conditions Banner */}
      <div className={`p-3 rounded-lg mb-4 ${assessment.bgClass}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {assessment.canFly ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <div>
              <span className="font-semibold">Drone Flight: {assessment.label}</span>
              <span className="mx-2">|</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${weather.flightCondition.bgClass}`}>
                {weather.flightCondition.label}
              </span>
            </div>
          </div>
        </div>
        {assessment.issues.length > 0 && (
          <ul className="mt-2 text-sm space-y-1">
            {assessment.issues.map((issue, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="mt-1">•</span>
                {issue}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Current Conditions */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Temperature & Conditions */}
        <div className="flex items-center gap-3">
          <WeatherIcon className="w-12 h-12 text-gray-600" />
          <div>
            <p className="text-3xl font-bold text-gray-900">{Math.round(weather.temperature)}°C</p>
            <p className="text-sm text-gray-500">
              Feels like {Math.round(weather.feelsLike)}°C
            </p>
            <p className="text-sm text-gray-600 font-medium">{weather.weatherDescription}</p>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Wind className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Wind:</span>
            <span className="font-medium">
              {Math.round(weather.windSpeed)} km/h {getWindDirectionLabel(weather.windDirection)}
            </span>
          </div>
          {weather.windGusts > weather.windSpeed && (
            <div className="flex items-center gap-2 text-sm">
              <Wind className="w-4 h-4 text-orange-400" />
              <span className="text-gray-600">Gusts:</span>
              <span className="font-medium text-orange-600">{Math.round(weather.windGusts)} km/h</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Eye className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Visibility:</span>
            <span className="font-medium">{weather.visibility.toFixed(1)} km</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Droplets className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">Humidity:</span>
            <span className="font-medium">{weather.humidity}%</span>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast */}
      {forecast && forecast.length > 0 && (
        <div className="border-t border-gray-100 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">5-Day Forecast</h4>
          <div className="grid grid-cols-5 gap-2">
            {forecast.map((day, i) => {
              const DayIcon = WEATHER_ICONS[day.weatherIcon] || Cloud
              const isToday = i === 0

              return (
                <div
                  key={i}
                  className={`text-center p-2 rounded-lg ${isToday ? 'bg-blue-50' : 'bg-gray-50'}`}
                >
                  <p className="text-xs font-medium text-gray-600">
                    {isToday ? 'Today' : format(day.date, 'EEE')}
                  </p>
                  <DayIcon className="w-6 h-6 mx-auto my-1 text-gray-500" />
                  <p className="text-sm font-medium">
                    {Math.round(day.tempMax)}°
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(day.tempMin)}°
                  </p>
                  {day.precipProbability > 20 && (
                    <p className="text-xs text-blue-600 mt-1">
                      {day.precipProbability}%
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <p className="text-xs text-gray-400 mt-3 text-right">
        Updated: {format(weather.timestamp, 'h:mm a')}
      </p>
    </div>
  )
}
