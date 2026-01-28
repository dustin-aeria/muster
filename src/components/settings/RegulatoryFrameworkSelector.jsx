/**
 * RegulatoryFrameworkSelector.jsx
 * Component for selecting and displaying regulatory framework settings
 *
 * Features:
 * - Select primary regulatory authority (TC, EASA, FAA)
 * - Display authority-specific requirements
 * - Show operation categories for selected authority
 * - Integration with project and organization settings
 *
 * @location src/components/settings/RegulatoryFrameworkSelector.jsx
 */

import { useState, useEffect } from 'react'
import {
  Globe,
  Shield,
  ChevronRight,
  Check,
  Info,
  ExternalLink,
  Plane,
  Users,
  FileText,
  AlertCircle
} from 'lucide-react'
import {
  REGULATORY_AUTHORITIES,
  getOperationCategories,
  getOperationTypes,
  getPilotRequirements,
  getRegistrationRequirements,
  getAuthoritiesArray
} from '../../lib/regulatoryFrameworks'

// ============================================
// AUTHORITY CARD
// ============================================

function AuthorityCard({ authority, isSelected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(authority.id)}
      className={`p-4 rounded-xl border-2 text-left transition-all ${
        isSelected
          ? 'border-aeria-navy bg-aeria-sky/30'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{authority.flag}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{authority.shortName}</h3>
            {isSelected && <Check className="w-4 h-4 text-green-600" />}
          </div>
          <p className="text-sm text-gray-600">{authority.name}</p>
          <p className="text-xs text-gray-500 mt-1">{authority.primaryRegulation}</p>
        </div>
      </div>
    </button>
  )
}

// ============================================
// OPERATION CATEGORY CARD
// ============================================

function CategoryCard({ category, isExpanded, onToggle }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900">{category.name}</span>
          {category.requiresSFOC || category.requiresAuthorization || category.requiresWaiver ? (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              Authorization Required
            </span>
          ) : (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              Standard
            </span>
          )}
        </div>
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {isExpanded && (
        <div className="p-3 bg-white border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-3">{category.description}</p>

          {category.requirements && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-700 mb-1">Requirements:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {category.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {category.maxWeight && (
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Max Weight: {category.maxWeight} kg</span>
              {category.maxAltitude && <span>Max Altitude: {category.maxAltitude} ft</span>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function RegulatoryFrameworkSelector({
  value = 'tc',
  onChange,
  showDetails = true,
  compact = false
}) {
  const [selectedAuthority, setSelectedAuthority] = useState(value)
  const [expandedCategory, setExpandedCategory] = useState(null)

  const authorities = getAuthoritiesArray()
  const currentAuthority = REGULATORY_AUTHORITIES[selectedAuthority]
  const categories = getOperationCategories(selectedAuthority)
  const operationTypes = getOperationTypes(selectedAuthority)
  const pilotReqs = getPilotRequirements(selectedAuthority)
  const registrationReqs = getRegistrationRequirements(selectedAuthority)

  useEffect(() => {
    setSelectedAuthority(value)
  }, [value])

  const handleSelect = (authorityId) => {
    setSelectedAuthority(authorityId)
    onChange?.(authorityId)
    setExpandedCategory(null)
  }

  if (compact) {
    return (
      <div className="space-y-3">
        <label className="label flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Regulatory Authority
        </label>
        <select
          value={selectedAuthority}
          onChange={(e) => handleSelect(e.target.value)}
          className="input"
        >
          {authorities.map(auth => (
            <option key={auth.id} value={auth.id}>
              {auth.flag} {auth.shortName} - {auth.name}
            </option>
          ))}
        </select>
        {currentAuthority && (
          <p className="text-xs text-gray-500">
            {currentAuthority.primaryRegulation}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Authority Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Globe className="w-5 h-5 text-aeria-navy" />
          Regulatory Framework
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Select the primary aviation authority for your operations
        </p>

        <div className="grid sm:grid-cols-3 gap-4">
          {authorities.map(auth => (
            <AuthorityCard
              key={auth.id}
              authority={auth}
              isSelected={selectedAuthority === auth.id}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>

      {showDetails && currentAuthority && (
        <>
          {/* Selected Authority Details */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-xl">{currentAuthority.flag}</span>
                  {currentAuthority.name}
                </h4>
                <p className="text-sm text-gray-600">{currentAuthority.description}</p>
              </div>
              <a
                href={currentAuthority.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-aeria-blue hover:text-aeria-navy flex items-center gap-1"
              >
                Official Website
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Quick Info */}
            <div className="grid sm:grid-cols-3 gap-4">
              {/* Registration */}
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Plane className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Registration</span>
                </div>
                <p className="text-xs text-gray-600">
                  Required for drones {'>'}  {registrationReqs.threshold * 1000}g
                </p>
                {registrationReqs.fee && (
                  <p className="text-xs text-gray-500 mt-1">
                    Fee: ${registrationReqs.fee} {selectedAuthority === 'tc' ? 'CAD' : 'USD'}
                  </p>
                )}
              </div>

              {/* Pilot Certification */}
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Pilot Certification</span>
                </div>
                <p className="text-xs text-gray-600">
                  {Object.keys(pilotReqs).length} certification level(s) available
                </p>
              </div>

              {/* Operation Categories */}
              <div className="bg-white rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">Categories</span>
                </div>
                <p className="text-xs text-gray-600">
                  {Object.keys(categories).length} operation categories defined
                </p>
              </div>
            </div>
          </div>

          {/* Operation Categories */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-500" />
              Operation Categories
            </h4>
            <div className="space-y-2">
              {Object.values(categories).map(category => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isExpanded={expandedCategory === category.id}
                  onToggle={() => setExpandedCategory(
                    expandedCategory === category.id ? null : category.id
                  )}
                />
              ))}
            </div>
          </div>

          {/* Operation Types */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Plane className="w-4 h-4 text-gray-500" />
              Operation Types
            </h4>
            <div className="flex flex-wrap gap-2">
              {operationTypes.map(type => (
                <div
                  key={type.id}
                  className={`px-3 py-2 rounded-lg border text-sm ${
                    type.requiresSFOC || type.requiresWaiver || type.requiresSpecific || type.requiresCertified
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-gray-50 border-gray-200 text-gray-700'
                  }`}
                  title={type.description}
                >
                  <span className="font-medium">{type.name}</span>
                  {(type.requiresSFOC || type.requiresWaiver || type.requiresSpecific || type.requiresCertified) && (
                    <span className="ml-2 text-xs">*</span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * Requires special authorization or waiver
            </p>
          </div>

          {/* Info Notice */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Regulatory Compliance</p>
              <p className="text-sm text-blue-700 mt-1">
                This selection affects operation type options, SORA requirements, and compliance documentation throughout the application.
                Ensure you select the correct authority for your primary operating jurisdiction.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
