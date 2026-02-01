/**
 * RegulatoryComplianceSettings.jsx
 * Comprehensive regulatory compliance dashboard for global field operations
 *
 * Covers multiple regulatory domains:
 * - Aviation/Airspace (RPAS operations)
 * - Data Privacy & Protection
 * - Environmental & Wildlife
 * - Radio Frequency/Spectrum
 * - Export Controls & Customs
 * - Land Access & Property
 * - Occupational Health & Safety
 * - Insurance Requirements
 *
 * @location src/pages/settings/RegulatoryComplianceSettings.jsx
 */

import { useState, useEffect } from 'react'
import { useOrganization } from '../../hooks/useOrganization'
import { updateOrganization } from '../../lib/firestoreOrganizations'
import {
  Globe,
  Plane,
  Shield,
  Eye,
  Leaf,
  Radio,
  Package,
  MapPin,
  HardHat,
  FileCheck,
  ChevronDown,
  ChevronRight,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  Loader2,
  AlertCircle,
  Info
} from 'lucide-react'

// ============================================
// REGULATORY DOMAINS CONFIGURATION
// ============================================

const REGULATORY_DOMAINS = [
  {
    id: 'aviation',
    name: 'Aviation & Airspace',
    icon: Plane,
    description: 'RPAS/UAS operating licenses, pilot certifications, and airspace authorizations',
    color: 'blue',
    fields: [
      { id: 'authority', label: 'Primary Aviation Authority', type: 'select', options: [
        { value: '', label: 'Select Authority' },
        { value: 'tc', label: 'Transport Canada (Canada)' },
        { value: 'faa', label: 'FAA (United States)' },
        { value: 'easa', label: 'EASA (European Union)' },
        { value: 'casa', label: 'CASA (Australia)' },
        { value: 'caa_uk', label: 'CAA (United Kingdom)' },
        { value: 'dgca', label: 'DGCA (India)' },
        { value: 'caac', label: 'CAAC (China)' },
        { value: 'jcab', label: 'JCAB (Japan)' },
        { value: 'other', label: 'Other' }
      ]},
      { id: 'operatorLicense', label: 'Operator License/Certificate Number', type: 'text', placeholder: 'License number' },
      { id: 'operatorLicenseExpiry', label: 'License Expiry Date', type: 'date' },
      { id: 'additionalAuthorities', label: 'Additional Operating Authorities', type: 'textarea', placeholder: 'List any additional countries/authorities you operate under' }
    ],
    resources: [
      { name: 'ICAO UAS Toolkit', url: 'https://www.icao.int/safety/UA/Pages/UAS-Toolkit.aspx' },
      { name: 'Global Drone Regulations Database', url: 'https://www.droneregulations.info/' }
    ]
  },
  {
    id: 'dataPrivacy',
    name: 'Data Privacy & Protection',
    icon: Eye,
    description: 'Compliance with data protection regulations for imagery, surveying, and mapping data',
    color: 'purple',
    fields: [
      { id: 'gdprCompliant', label: 'GDPR Compliant (EU)', type: 'checkbox' },
      { id: 'ccpaCompliant', label: 'CCPA Compliant (California)', type: 'checkbox' },
      { id: 'pipedaCompliant', label: 'PIPEDA Compliant (Canada)', type: 'checkbox' },
      { id: 'dataProtectionOfficer', label: 'Data Protection Officer', type: 'text', placeholder: 'Name or contact' },
      { id: 'dataRetentionPolicy', label: 'Data Retention Period', type: 'select', options: [
        { value: '', label: 'Select Period' },
        { value: '30days', label: '30 Days' },
        { value: '90days', label: '90 Days' },
        { value: '1year', label: '1 Year' },
        { value: '3years', label: '3 Years' },
        { value: '7years', label: '7 Years' },
        { value: 'indefinite', label: 'Indefinite' },
        { value: 'custom', label: 'Custom Policy' }
      ]},
      { id: 'privacyPolicyUrl', label: 'Privacy Policy URL', type: 'url', placeholder: 'https://' }
    ],
    resources: [
      { name: 'GDPR Official Text', url: 'https://gdpr.eu/' },
      { name: 'IAPP Privacy Resource Center', url: 'https://iapp.org/resources/' }
    ]
  },
  {
    id: 'environmental',
    name: 'Environmental & Wildlife',
    icon: Leaf,
    description: 'Environmental permits, wildlife disturbance restrictions, and protected area compliance',
    color: 'green',
    fields: [
      { id: 'environmentalPermits', label: 'Environmental Permits Held', type: 'textarea', placeholder: 'List permits and permit numbers' },
      { id: 'wildlifeRestrictions', label: 'Wildlife Restriction Awareness', type: 'checkbox', checkboxLabel: 'Team trained on wildlife disturbance protocols' },
      { id: 'protectedAreaPolicy', label: 'Protected Area Operating Policy', type: 'select', options: [
        { value: '', label: 'Select Policy' },
        { value: 'no_operations', label: 'No operations in protected areas' },
        { value: 'permit_required', label: 'Only with specific permits' },
        { value: 'case_by_case', label: 'Case-by-case assessment' }
      ]},
      { id: 'noiseCompliance', label: 'Noise Regulation Compliance', type: 'checkbox', checkboxLabel: 'Noise impact assessments conducted when required' }
    ],
    resources: [
      { name: 'IUCN Protected Areas', url: 'https://www.iucn.org/theme/protected-areas' },
      { name: 'Protected Planet', url: 'https://www.protectedplanet.net/' }
    ]
  },
  {
    id: 'radioFrequency',
    name: 'Radio Frequency & Spectrum',
    icon: Radio,
    description: 'RF licensing, transmission regulations, and equipment certifications',
    color: 'amber',
    fields: [
      { id: 'rfLicenses', label: 'RF Licenses Held', type: 'textarea', placeholder: 'List any radio frequency licenses' },
      { id: 'equipmentCertifications', label: 'Equipment Certification Marks', type: 'multiselect', options: [
        { value: 'fcc', label: 'FCC (United States)' },
        { value: 'ce', label: 'CE (European Union)' },
        { value: 'ised', label: 'ISED (Canada)' },
        { value: 'telec', label: 'TELEC (Japan)' },
        { value: 'other', label: 'Other' }
      ]},
      { id: 'frequencyBands', label: 'Operating Frequency Bands', type: 'text', placeholder: 'e.g., 2.4GHz, 5.8GHz' }
    ],
    resources: [
      { name: 'ITU Radio Regulations', url: 'https://www.itu.int/pub/R-REG-RR' }
    ]
  },
  {
    id: 'exportControls',
    name: 'Export Controls & Customs',
    icon: Package,
    description: 'ITAR/EAR compliance, dual-use technology, and equipment import/export',
    color: 'red',
    fields: [
      { id: 'itarControlled', label: 'ITAR Controlled Items', type: 'checkbox', checkboxLabel: 'Organization handles ITAR controlled technology' },
      { id: 'earControlled', label: 'EAR Controlled Items', type: 'checkbox', checkboxLabel: 'Organization handles EAR controlled technology' },
      { id: 'ataCarnet', label: 'ATA Carnet', type: 'checkbox', checkboxLabel: 'ATA Carnet used for temporary equipment imports' },
      { id: 'exportLicenses', label: 'Export Licenses Held', type: 'textarea', placeholder: 'List any export licenses' },
      { id: 'customsBroker', label: 'Customs Broker Contact', type: 'text', placeholder: 'Broker name or company' }
    ],
    resources: [
      { name: 'US BIS Export Administration', url: 'https://www.bis.doc.gov/' },
      { name: 'ATA Carnet Information', url: 'https://www.atacarnet.com/' }
    ]
  },
  {
    id: 'landAccess',
    name: 'Land Access & Property',
    icon: MapPin,
    description: 'Property access rights, critical infrastructure restrictions, and overflight permissions',
    color: 'cyan',
    fields: [
      { id: 'propertyAccessPolicy', label: 'Property Access Policy', type: 'select', options: [
        { value: '', label: 'Select Policy' },
        { value: 'written_only', label: 'Written permission required' },
        { value: 'verbal_ok', label: 'Verbal permission acceptable' },
        { value: 'public_only', label: 'Public land/airspace only' }
      ]},
      { id: 'criticalInfraPolicy', label: 'Critical Infrastructure Policy', type: 'select', options: [
        { value: '', label: 'Select Policy' },
        { value: 'no_operations', label: 'No operations near critical infrastructure' },
        { value: 'authorization_required', label: 'Specific authorization required' },
        { value: 'buffer_zones', label: 'Maintain buffer zones per regulations' }
      ]},
      { id: 'trespassProtocol', label: 'Trespass Prevention Protocol', type: 'checkbox', checkboxLabel: 'Written protocol in place' }
    ],
    resources: [
      { name: 'FAA UAS Facility Maps', url: 'https://www.faa.gov/uas/commercial_operators/uas_facility_maps' }
    ]
  },
  {
    id: 'healthSafety',
    name: 'Occupational Health & Safety',
    icon: HardHat,
    description: 'Worker safety regulations, PPE requirements, and field operation protocols',
    color: 'orange',
    fields: [
      { id: 'safetyManagementSystem', label: 'Safety Management System', type: 'checkbox', checkboxLabel: 'Formal SMS implemented' },
      { id: 'ppePolicy', label: 'PPE Requirements Documented', type: 'checkbox', checkboxLabel: 'PPE policy in place' },
      { id: 'fieldSafetyTraining', label: 'Field Safety Training', type: 'select', options: [
        { value: '', label: 'Select Requirement' },
        { value: 'annual', label: 'Annual training required' },
        { value: 'biannual', label: 'Bi-annual training required' },
        { value: 'per_project', label: 'Per-project briefings' },
        { value: 'none', label: 'No formal requirement' }
      ]},
      { id: 'incidentReportingSystem', label: 'Incident Reporting System', type: 'checkbox', checkboxLabel: 'Formal incident reporting in place' },
      { id: 'emergencyResponsePlan', label: 'Emergency Response Plan', type: 'checkbox', checkboxLabel: 'Written ERP in place' }
    ],
    resources: [
      { name: 'OSHA Resources', url: 'https://www.osha.gov/' },
      { name: 'ISO 45001 OH&S', url: 'https://www.iso.org/iso-45001-occupational-health-and-safety.html' }
    ]
  },
  {
    id: 'insurance',
    name: 'Insurance Requirements',
    icon: FileCheck,
    description: 'Liability coverage, professional indemnity, and equipment insurance',
    color: 'indigo',
    fields: [
      { id: 'liabilityInsurance', label: 'Liability Insurance', type: 'checkbox', checkboxLabel: 'Current liability insurance in place' },
      { id: 'liabilityCoverage', label: 'Liability Coverage Amount', type: 'text', placeholder: 'e.g., $2,000,000' },
      { id: 'professionalIndemnity', label: 'Professional Indemnity', type: 'checkbox', checkboxLabel: 'Professional indemnity insurance in place' },
      { id: 'equipmentInsurance', label: 'Equipment Insurance', type: 'checkbox', checkboxLabel: 'Equipment/hull insurance in place' },
      { id: 'workersComp', label: 'Workers Compensation', type: 'checkbox', checkboxLabel: 'Workers compensation coverage in place' },
      { id: 'insuranceProvider', label: 'Primary Insurance Provider', type: 'text', placeholder: 'Insurance company name' },
      { id: 'policyExpiry', label: 'Policy Expiry Date', type: 'date' }
    ],
    resources: [
      { name: 'Insurance Information Institute', url: 'https://www.iii.org/' }
    ]
  }
]

// ============================================
// COLOR UTILITIES
// ============================================

const getColorClasses = (color, variant = 'bg') => {
  const colors = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', icon: 'text-blue-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', icon: 'text-purple-600' },
    green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', icon: 'text-green-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', icon: 'text-amber-600' },
    red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', icon: 'text-red-600' },
    cyan: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200', icon: 'text-cyan-600' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', icon: 'text-orange-600' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', icon: 'text-indigo-600' }
  }
  return colors[color]?.[variant] || colors.blue[variant]
}

// ============================================
// DOMAIN SECTION COMPONENT
// ============================================

function DomainSection({ domain, data, onChange, isExpanded, onToggleExpand, isEnabled, onToggleEnabled }) {
  const Icon = domain.icon
  const colorClasses = {
    bg: getColorClasses(domain.color, 'bg'),
    text: getColorClasses(domain.color, 'text'),
    border: getColorClasses(domain.color, 'border'),
    icon: getColorClasses(domain.color, 'icon')
  }

  const handleFieldChange = (fieldId, value) => {
    onChange(domain.id, fieldId, value)
  }

  return (
    <div className={`border rounded-xl overflow-hidden ${isEnabled ? colorClasses.border : 'border-gray-200'}`}>
      {/* Header */}
      <div
        className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
          isEnabled ? colorClasses.bg : 'bg-gray-50'
        }`}
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isEnabled ? 'bg-white' : 'bg-gray-200'}`}>
            <Icon className={`w-5 h-5 ${isEnabled ? colorClasses.icon : 'text-gray-400'}`} />
          </div>
          <div>
            <h3 className={`font-semibold ${isEnabled ? 'text-gray-900' : 'text-gray-500'}`}>
              {domain.name}
            </h3>
            <p className={`text-sm ${isEnabled ? 'text-gray-600' : 'text-gray-400'}`}>
              {domain.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Enable/Disable Toggle */}
          <label className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <span className="text-xs text-gray-500">Track</span>
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => onToggleEnabled(domain.id, e.target.checked)}
              className="w-4 h-4 text-aeria-navy rounded"
            />
          </label>
          {/* Expand/Collapse */}
          {isEnabled && (
            isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isEnabled && isExpanded && (
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="space-y-4">
            {domain.fields.map(field => (
              <div key={field.id}>
                {field.type === 'checkbox' ? (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={data?.[field.id] || false}
                      onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                      className="w-4 h-4 text-aeria-navy rounded"
                    />
                    <span className="text-sm text-gray-700">{field.checkboxLabel || field.label}</span>
                  </label>
                ) : field.type === 'select' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                    <select
                      value={data?.[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="input"
                    >
                      {field.options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                ) : field.type === 'textarea' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                    <textarea
                      value={data?.[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="input min-h-[80px]"
                      placeholder={field.placeholder}
                    />
                  </div>
                ) : field.type === 'multiselect' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{field.label}</label>
                    <div className="flex flex-wrap gap-2">
                      {field.options.map(opt => (
                        <label key={opt.value} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                          <input
                            type="checkbox"
                            checked={(data?.[field.id] || []).includes(opt.value)}
                            onChange={(e) => {
                              const current = data?.[field.id] || []
                              const updated = e.target.checked
                                ? [...current, opt.value]
                                : current.filter(v => v !== opt.value)
                              handleFieldChange(field.id, updated)
                            }}
                            className="w-3 h-3 text-aeria-navy rounded"
                          />
                          <span className="text-sm text-gray-700">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                    <input
                      type={field.type}
                      value={data?.[field.id] || ''}
                      onChange={(e) => handleFieldChange(field.id, e.target.value)}
                      className="input"
                      placeholder={field.placeholder}
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Resources */}
            {domain.resources && domain.resources.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">Resources</p>
                <div className="flex flex-wrap gap-2">
                  {domain.resources.map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-aeria-navy hover:underline flex items-center gap-1"
                    >
                      {resource.name}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function RegulatoryComplianceSettings() {
  const { organization, refreshOrganization, canManageSettings } = useOrganization()

  const [regulatoryData, setRegulatoryData] = useState({})
  const [enabledDomains, setEnabledDomains] = useState([])
  const [expandedDomain, setExpandedDomain] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (organization) {
      setRegulatoryData(organization.regulatory || {})
      setEnabledDomains(organization.regulatoryDomains || ['aviation'])
    }
  }, [organization])

  const handleFieldChange = (domainId, fieldId, value) => {
    setRegulatoryData(prev => ({
      ...prev,
      [domainId]: {
        ...prev[domainId],
        [fieldId]: value
      }
    }))
    setSaved(false)
  }

  const handleToggleEnabled = (domainId, enabled) => {
    setEnabledDomains(prev =>
      enabled ? [...prev, domainId] : prev.filter(id => id !== domainId)
    )
    setSaved(false)
  }

  const handleSave = async () => {
    if (!organization?.id || !canManageSettings) return

    setSaving(true)
    setError(null)

    try {
      await updateOrganization(organization.id, {
        regulatory: regulatoryData,
        regulatoryDomains: enabledDomains
      })

      await refreshOrganization()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Error saving regulatory settings:', err)
      setError(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No organization found</p>
        </div>
      </div>
    )
  }

  if (!canManageSettings) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <p className="text-gray-600">You don't have permission to manage regulatory settings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-aeria-sky rounded-lg">
            <Globe className="w-5 h-5 text-aeria-navy" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Regulatory Compliance</h2>
            <p className="text-sm text-gray-500">
              Track compliance across multiple regulatory domains for your global operations
            </p>
          </div>
        </div>

        {/* Info Notice */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800">
              Enable the regulatory domains relevant to your operations. Each domain allows you to track
              certifications, licenses, and compliance status. This information helps ensure your team
              maintains proper authorizations across all jurisdictions.
            </p>
          </div>
        </div>
      </div>

      {/* Compliance Summary */}
      <div className="card">
        <h3 className="font-medium text-gray-900 mb-4">Compliance Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-green-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-700">{enabledDomains.length}</p>
            <p className="text-xs text-green-600">Domains Tracked</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-700">
              {enabledDomains.reduce((count, domainId) => {
                const data = regulatoryData[domainId] || {}
                return count + Object.values(data).filter(v => v && v !== '').length
              }, 0)}
            </p>
            <p className="text-xs text-blue-600">Fields Completed</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-amber-700">
              {REGULATORY_DOMAINS.length - enabledDomains.length}
            </p>
            <p className="text-xs text-amber-600">Domains Available</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-700">
              {enabledDomains.reduce((count, domainId) => {
                const domain = REGULATORY_DOMAINS.find(d => d.id === domainId)
                return count + (domain?.resources?.length || 0)
              }, 0)}
            </p>
            <p className="text-xs text-purple-600">Resources Linked</p>
          </div>
        </div>
      </div>

      {/* Domain Sections */}
      <div className="space-y-4">
        {REGULATORY_DOMAINS.map(domain => (
          <DomainSection
            key={domain.id}
            domain={domain}
            data={regulatoryData[domain.id]}
            onChange={handleFieldChange}
            isExpanded={expandedDomain === domain.id}
            onToggleExpand={() => setExpandedDomain(expandedDomain === domain.id ? null : domain.id)}
            isEnabled={enabledDomains.includes(domain.id)}
            onToggleEnabled={handleToggleEnabled}
          />
        ))}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Compliance Settings
            </>
          )}
        </button>
      </div>
    </div>
  )
}
