/**
 * OfflineCachePanel.jsx
 * UI component for managing offline map tile caching
 * 
 * Features:
 * - Cache current map view for offline use
 * - Show caching progress
 * - Display cache storage status
 * - Clear cache option
 * 
 * @location src/components/map/OfflineCachePanel.jsx
 * @action NEW
 */

import React, { useState, useEffect } from 'react'
import {
  Download,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  WifiOff,
  X
} from 'lucide-react'
import {
  cacheMapTiles,
  clearMapCache,
  getCacheStatus,
  estimateCacheSize
} from '../../lib/mapOfflineCache'

export default function OfflineCachePanel({ 
  bounds, 
  mapboxToken,
  onClose,
  isOpen = false 
}) {
  const [status, setStatus] = useState('idle') // idle, estimating, caching, success, error
  const [progress, setProgress] = useState({ cached: 0, total: 0, percent: 0 })
  const [estimate, setEstimate] = useState(null)
  const [cacheInfo, setCacheInfo] = useState(null)
  const [error, setError] = useState(null)
  const [minZoom, setMinZoom] = useState(12)
  const [maxZoom, setMaxZoom] = useState(15)

  // Load cache status on mount
  useEffect(() => {
    loadCacheStatus()
  }, [])

  // Estimate cache size when bounds or zoom changes
  useEffect(() => {
    if (bounds && isOpen) {
      const normalizedBounds = bounds.toArray 
        ? { 
            west: bounds.getWest(), 
            east: bounds.getEast(), 
            north: bounds.getNorth(), 
            south: bounds.getSouth() 
          }
        : bounds
      
      const est = estimateCacheSize(normalizedBounds, minZoom, maxZoom)
      setEstimate(est)
    }
  }, [bounds, minZoom, maxZoom, isOpen])

  const loadCacheStatus = async () => {
    const info = await getCacheStatus()
    setCacheInfo(info)
  }

  const handleCache = async () => {
    if (!bounds || !mapboxToken) {
      setError('Map bounds and token required')
      return
    }

    setStatus('caching')
    setError(null)
    setProgress({ cached: 0, total: 0, percent: 0 })

    try {
      const result = await cacheMapTiles(bounds, {
        minZoom,
        maxZoom,
        token: mapboxToken,
        onProgress: (cached, total, percent) => {
          setProgress({ cached, total, percent })
        }
      })

      if (result.success) {
        setStatus('success')
        loadCacheStatus()
      } else {
        setStatus('error')
        setError(result.error || 'Failed to cache tiles')
      }
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }

  const handleClear = async () => {
    if (window.confirm('Clear all cached map tiles? This cannot be undone.')) {
      const success = await clearMapCache()
      if (success) {
        setCacheInfo({ used: 0, available: 0, usedMB: '0' })
        setStatus('idle')
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="absolute top-4 right-4 z-30 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-gray-900">Offline Maps</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Current cache status */}
        {cacheInfo && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <HardDrive className="w-5 h-5 text-gray-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {cacheInfo.usedMB} MB cached
              </p>
              <p className="text-xs text-gray-500">
                Stored on this device
              </p>
            </div>
            {parseFloat(cacheInfo.usedMB) > 0 && (
              <button
                onClick={handleClear}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                title="Clear cache"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Zoom level selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Zoom Levels to Cache
          </label>
          <div className="flex items-center gap-3">
            <select
              value={minZoom}
              onChange={(e) => setMinZoom(Number(e.target.value))}
              className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded"
              disabled={status === 'caching'}
            >
              {[10, 11, 12, 13, 14].map(z => (
                <option key={z} value={z}>Min: {z}</option>
              ))}
            </select>
            <span className="text-gray-400">to</span>
            <select
              value={maxZoom}
              onChange={(e) => setMaxZoom(Number(e.target.value))}
              className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded"
              disabled={status === 'caching'}
            >
              {[14, 15, 16, 17, 18].map(z => (
                <option key={z} value={z}>Max: {z}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Estimate */}
        {estimate && status !== 'caching' && (
          <div className="text-sm text-gray-600">
            <p>
              This will cache approximately <strong>{estimate.tileCount}</strong> tiles
              (~{estimate.estimatedMB} MB)
            </p>
            {estimate.tileCount > 500 && (
              <p className="text-amber-600 text-xs mt-1">
                ⚠️ Large area. Consider caching a smaller region.
              </p>
            )}
          </div>
        )}

        {/* Progress */}
        {status === 'caching' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Caching tiles...</span>
              <span className="font-medium">{progress.percent}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-aeria-navy transition-all duration-300"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {progress.cached} of {progress.total} tiles
            </p>
          </div>
        )}

        {/* Success message */}
        {status === 'success' && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
            <div>
              <p className="font-medium">Caching complete!</p>
              <p className="text-sm">Map tiles saved for offline use.</p>
            </div>
          </div>
        )}

        {/* Error message */}
        {status === 'error' && error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Caching failed</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Action button */}
        <button
          onClick={handleCache}
          disabled={status === 'caching' || !bounds}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            status === 'caching'
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-aeria-navy text-white hover:bg-aeria-navy/90'
          }`}
        >
          {status === 'caching' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Caching...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Cache Current View
            </>
          )}
        </button>

        {/* Help text */}
        <p className="text-xs text-gray-500">
          Cached maps will be available when you're offline. Cache the areas you'll need before going to remote locations.
        </p>
      </div>
    </div>
  )
}
