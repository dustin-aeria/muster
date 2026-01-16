import { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  Plus,
  Trash2,
  Shield,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Users,
  HardHat,
  Zap,
  ThermometerSun,
  Bug,
  Beaker,
  Mountain,
  Cable,
  Footprints,
  UserX,
  Wrench,
  ShieldCheck,
  ClipboardCheck
} from 'lucide-react'

// ============================================
// HSE HAZARD CATEGORIES (Per HSE1047)
// ============================================
const hazardCategories = [
  { 
    value: 'environmental', 
    label: 'Environmental', 
    icon: ThermometerSun,
    examples: 'Weather conditions, terrain hazards, water bodies, wildlife, temperature extremes',
    color: 'text-blue-600'
  },
  { 
    value: 'overhead', 
    label: 'Overhead / Obstacles', 
    icon: Cable,
    examples: 'Power lines, towers, buildings, trees, wires, guy-wires',
    color: 'text-orange-600'
  },
  { 
    value: 'access', 
    label: 'Access / Egress', 
    icon: Footprints,
    examples: 'Slips/trips, uneven terrain, water crossings, remote locations',
    color: 'text-amber-600'
  },
  { 
    value: 'ergonomic', 
    label: 'Ergonomic', 
    icon: UserX,
    examples: 'Awkward postures, repetitive tasks, manual handling, prolonged standing',
    color: 'text-purple-600'
  },
  { 
    value: 'personal', 
    label: 'Personal Limitations', 
    icon: Users,
    examples: 'Fatigue, distraction, training gaps, stress, fitness for duty',
    color: 'text-pink-600'
  },
  { 
    value: 'equipment', 
    label: 'Equipment', 
    icon: Wrench,
    examples: 'Malfunction, battery hazards, sharp edges, hot surfaces, moving parts',
    color: 'text-red-600'
  },
  { 
    value: 'biological', 
    label: 'Biological', 
    icon: Bug,
    examples: 'Insects, poisonous plants, animal encounters, pathogens',
    color: 'text-green-600'
  },
  { 
    value: 'chemical', 
    label: 'Chemical', 
    icon: Beaker,
    examples: 'Fuel, battery chemicals, site contaminants, cleaning agents',
    color: 'text-cyan-600'
  }
]

// ============================================
// LIKELIHOOD LEVELS (5x5 Matrix)
// ============================================
const likelihoodLevels = [
  { value: 1, label: 'Rare', description: 'Highly unlikely to occur', color: 'bg-green-100' },
  { value: 2, label: 'Unlikely', description: 'Could occur but not expected', color: 'bg-green-200' },
  { value: 3, label: 'Possible', description: 'Might occur occasionally', color: 'bg-yellow-100' },
  { value: 4, label: 'Likely', description: 'Will probably occur', color: 'bg-orange-100' },
  { value: 5, label: 'Almost Certain', description: 'Expected to occur', color: 'bg-red-100' }
]

// ============================================
// SEVERITY LEVELS (5x5 Matrix)
// ============================================
const severityLevels = [
  { value: 1, label: 'Negligible', description: 'No injury, minor inconvenience', color: 'bg-green-100' },
  { value: 2, label: 'Minor', description: 'First aid injury, minor damage', color: 'bg-green-200' },
  { value: 3, label: 'Moderate', description: 'Medical treatment, significant damage', color: 'bg-yellow-100' },
  { value: 4, label: 'Major', description: 'Serious injury, major damage', color: 'bg-orange-100' },
  { value: 5, label: 'Catastrophic', description: 'Fatality, total loss', color: 'bg-red-100' }
]

// ============================================
// HIERARCHY OF CONTROLS (Per HSE1048)
// ============================================
const controlHierarchy = [
  { 
    value: 'elimination', 
    label: 'Elimination', 
    description: 'Physically remove the hazard',
    effectiveness: 'Most Effective',
    color: 'bg-green-500'
  },
  { 
    value: 'substitution', 
    label: 'Substitution', 
    description: 'Replace the hazard with something safer',
    effectiveness: 'Highly Effective',
    color: 'bg-green-400'
  },
  { 
    value: 'engineering', 
    label: 'Engineering Controls', 
    description: 'Isolate people from the hazard',
    effectiveness: 'Effective',
    color: 'bg-yellow-400'
  },
  { 
    value: 'administrative', 
    label: 'Administrative Controls', 
    description: 'Change the way people work',
    effectiveness: 'Moderately Effective',
    color: 'bg-orange-400'
  },
  { 
    value: 'ppe', 
    label: 'PPE', 
    description: 'Protect the worker with equipment',
    effectiveness: 'Least Effective',
    color: 'bg-red-400'
  }
]

// ============================================
// RISK LEVEL CALCULATION
// ============================================
const getRiskLevel = (likelihood, severity) => {
  const score = likelihood * severity
  if (score <= 4) return { 
    level: 'Low', 
    color: 'bg-green-100 text-green-800 border-green-300', 
    action: 'Acceptable with monitoring',
    priority: 4
  }
  if (score <= 9) return { 
    level: 'Medium', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300', 
    action: 'Mitigations recommended',
    priority: 3
  }
  if (score <= 16) return { 
    level: 'High', 
    color: 'bg-orange-100 text-orange-800 border-orange-300', 
    action: 'Mitigations required before proceeding',
    priority: 2
  }
  return { 
    level: 'Critical', 
    color: 'bg-red-100 text-red-800 border-red-300', 
    action: 'Do not proceed without controls',
    priority: 1
  }
}

// ============================================
// RISK MATRIX VISUAL COMPONENT
// ============================================
const RiskMatrix = ({ hazards }) => {
  // Count hazards at each position
  const matrix = {}
  hazards.forEach((h, idx) => {
    const key = `${h.likelihood}-${h.severity}`
    if (!matrix[key]) matrix[key] = []
    matrix[key].push(idx + 1)
  })

  return (
    <div className="p-4 bg-gray-50 rounded-lg border">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Risk Matrix Overview</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="p-1"></th>
              {severityLevels.map(s => (
                <th key={s.value} className="p-1 text-center font-medium text-gray-600">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...likelihoodLevels].reverse().map(l => (
              <tr key={l.value}>
                <td className="p-1 text-right font-medium text-gray-600 pr-2">{l.label}</td>
                {severityLevels.map(s => {
                  const risk = getRiskLevel(l.value, s.value)
                  const key = `${l.value}-${s.value}`
                  const hazardNums = matrix[key] || []
                  return (
                    <td key={s.value} className={`p-1 text-center border ${risk.color}`}>
                      {hazardNums.length > 0 ? (
                        <span className="font-bold">{hazardNums.join(',')}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-2">Numbers indicate hazard # at that risk level</p>
    </div>
  )
}

// ============================================
// HAZARD CARD COMPONENT
// ============================================
const HazardCard = ({ hazard, index, onUpdate, onRemove }) => {
  const [expanded, setExpanded] = useState(true)
  const category = hazardCategories.find(c => c.value === hazard.category) || hazardCategories[0]
  const CategoryIcon = category.icon
  const initialRisk = getRiskLevel(hazard.likelihood, hazard.severity)
  const residualRisk = getRiskLevel(hazard.residualLikelihood, hazard.residualSeverity)

  return (
    <div className={`rounded-lg border-2 ${initialRisk.color} overflow-hidden`}>
      {/* Header */}
      <div 
        className="p-3 flex items-center justify-between cursor-pointer bg-white bg-opacity-50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
            initialRisk.level === 'Critical' ? 'bg-red-500' :
            initialRisk.level === 'High' ? 'bg-orange-500' :
            initialRisk.level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
          }`}>
            {index + 1}
          </span>
          <CategoryIcon className={`w-5 h-5 ${category.color}`} />
          <div>
            <span className="font-medium text-gray-900">{category.label}</span>
            {hazard.description && (
              <p className="text-sm text-gray-600 truncate max-w-xs">{hazard.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-gray-500">Initial Risk</p>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${initialRisk.color}`}>
              {initialRisk.level}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Residual</p>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${residualRisk.color}`}>
              {residualRisk.level}
            </span>
          </div>
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 bg-white border-t space-y-4">
          {/* Category & Description */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label text-xs">Hazard Category</label>
              <select
                value={hazard.category}
                onChange={(e) => onUpdate('category', e.target.value)}
                className="input text-sm"
              >
                {hazardCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">{category.examples}</p>
            </div>
            <div>
              <label className="label text-xs">Hazard Description</label>
              <textarea
                value={hazard.description}
                onChange={(e) => onUpdate('description', e.target.value)}
                className="input text-sm min-h-[80px]"
                placeholder="Describe the specific hazard..."
              />
            </div>
          </div>

          {/* Initial Risk Assessment */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Initial Risk Assessment</h4>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="label text-xs">Likelihood</label>
                <select
                  value={hazard.likelihood}
                  onChange={(e) => onUpdate('likelihood', parseInt(e.target.value))}
                  className="input text-sm"
                >
                  {likelihoodLevels.map(l => (
                    <option key={l.value} value={l.value}>{l.value} - {l.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label text-xs">Severity</label>
                <select
                  value={hazard.severity}
                  onChange={(e) => onUpdate('severity', parseInt(e.target.value))}
                  className="input text-sm"
                >
                  {severityLevels.map(s => (
                    <option key={s.value} value={s.value}>{s.value} - {s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label text-xs">Risk Score</label>
                <div className={`px-3 py-2 rounded text-sm font-medium border ${initialRisk.color}`}>
                  {hazard.likelihood * hazard.severity} - {initialRisk.level}
                </div>
                <p className="text-xs text-gray-500 mt-1">{initialRisk.action}</p>
              </div>
            </div>
          </div>

          {/* Control Measures */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Control Measures (Hierarchy of Controls)
            </h4>
            <div className="mb-3">
              <label className="label text-xs">Primary Control Type</label>
              <select
                value={hazard.controlType || 'administrative'}
                onChange={(e) => onUpdate('controlType', e.target.value)}
                className="input text-sm"
              >
                {controlHierarchy.map(c => (
                  <option key={c.value} value={c.value}>
                    {c.label} - {c.description}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label text-xs">Control Measure Details</label>
              <textarea
                value={hazard.controls}
                onChange={(e) => onUpdate('controls', e.target.value)}
                className="input text-sm min-h-[80px]"
                placeholder="Describe specific control measures to mitigate this hazard..."
              />
            </div>
          </div>

          {/* Residual Risk Assessment */}
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-sm font-medium text-green-800 mb-2">Residual Risk (After Controls)</h4>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="label text-xs">Residual Likelihood</label>
                <select
                  value={hazard.residualLikelihood}
                  onChange={(e) => onUpdate('residualLikelihood', parseInt(e.target.value))}
                  className="input text-sm"
                >
                  {likelihoodLevels.map(l => (
                    <option key={l.value} value={l.value}>{l.value} - {l.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label text-xs">Residual Severity</label>
                <select
                  value={hazard.residualSeverity}
                  onChange={(e) => onUpdate('residualSeverity', parseInt(e.target.value))}
                  className="input text-sm"
                >
                  {severityLevels.map(s => (
                    <option key={s.value} value={s.value}>{s.value} - {s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label text-xs">Residual Risk Score</label>
                <div className={`px-3 py-2 rounded text-sm font-medium border ${residualRisk.color}`}>
                  {hazard.residualLikelihood * hazard.residualSeverity} - {residualRisk.level}
                </div>
              </div>
            </div>
          </div>

          {/* Responsible Person */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label text-xs">Responsible Person</label>
              <input
                type="text"
                value={hazard.responsible || ''}
                onChange={(e) => onUpdate('responsible', e.target.value)}
                className="input text-sm"
                placeholder="Who is responsible for this control?"
              />
            </div>
            <div>
              <label className="label text-xs">Verification Method</label>
              <input
                type="text"
                value={hazard.verification || ''}
                onChange={(e) => onUpdate('verification', e.target.value)}
                className="input text-sm"
                placeholder="How will control effectiveness be verified?"
              />
            </div>
          </div>

          {/* Remove Button */}
          <div className="flex justify-end pt-2 border-t">
            <button
              onClick={onRemove}
              className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Remove Hazard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// SUMMARY STATS COMPONENT
// ============================================
const RiskSummary = ({ hazards }) => {
  const stats = {
    total: hazards.length,
    critical: hazards.filter(h => getRiskLevel(h.likelihood, h.severity).level === 'Critical').length,
    high: hazards.filter(h => getRiskLevel(h.likelihood, h.severity).level === 'High').length,
    medium: hazards.filter(h => getRiskLevel(h.likelihood, h.severity).level === 'Medium').length,
    low: hazards.filter(h => getRiskLevel(h.likelihood, h.severity).level === 'Low').length,
    controlled: hazards.filter(h => {
      const initial = getRiskLevel(h.likelihood, h.severity)
      const residual = getRiskLevel(h.residualLikelihood, h.residualSeverity)
      return residual.priority > initial.priority
    }).length
  }

  const uncontrolled = hazards.filter(h => {
    const residual = getRiskLevel(h.residualLikelihood, h.residualSeverity)
    return residual.level === 'Critical' || residual.level === 'High'
  }).length

  return (
    <div className={`p-4 rounded-lg border ${
      uncontrolled > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
    }`}>
      <div className="flex items-start gap-3">
        {uncontrolled > 0 ? (
          <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
        ) : (
          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
        )}
        <div className="flex-1">
          <h3 className={`font-medium ${uncontrolled > 0 ? 'text-red-800' : 'text-green-800'}`}>
            {uncontrolled > 0 
              ? `${uncontrolled} Hazard${uncontrolled > 1 ? 's' : ''} Require Additional Controls`
              : 'All Hazards Adequately Controlled'
            }
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
            <div className="text-center p-2 bg-white rounded">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total Hazards</p>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <p className="text-2xl font-bold text-red-600">{stats.critical + stats.high}</p>
              <p className="text-xs text-gray-500">High/Critical</p>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <p className="text-2xl font-bold text-yellow-600">{stats.medium}</p>
              <p className="text-xs text-gray-500">Medium</p>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <p className="text-2xl font-bold text-green-600">{stats.controlled}</p>
              <p className="text-xs text-gray-500">Risk Reduced</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ProjectHSERisk({ project, onUpdate }) {
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    hazards: true,
    matrix: false,
    review: true
  })

  // Initialize if not present
  useEffect(() => {
    if (!project.hseRiskAssessment) {
      onUpdate({
        hseRiskAssessment: {
          hazards: [],
          overallRiskAcceptable: null,
          reviewNotes: '',
          reviewedBy: '',
          reviewDate: '',
          approvedBy: '',
          approvalDate: ''
        }
      })
    }
  }, [project.hseRiskAssessment, onUpdate])

  const hseRisk = project.hseRiskAssessment || { hazards: [] }
  const hazards = hseRisk.hazards || []

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const updateHSERisk = (updates) => {
    onUpdate({
      hseRiskAssessment: {
        ...hseRisk,
        ...updates
      }
    })
  }

  const addHazard = () => {
    updateHSERisk({
      hazards: [...hazards, {
        id: Date.now().toString(),
        category: 'environmental',
        description: '',
        likelihood: 3,
        severity: 3,
        controlType: 'administrative',
        controls: '',
        residualLikelihood: 2,
        residualSeverity: 2,
        responsible: '',
        verification: ''
      }]
    })
  }

  const updateHazard = (index, field, value) => {
    const newHazards = [...hazards]
    newHazards[index] = { ...newHazards[index], [field]: value }
    updateHSERisk({ hazards: newHazards })
  }

  const removeHazard = (index) => {
    const newHazards = hazards.filter((_, i) => i !== index)
    updateHSERisk({ hazards: newHazards })
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-gradient-to-r from-amber-50 to-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <HardHat className="w-5 h-5 text-amber-600" />
            HSE Risk Assessment
          </h2>
          <span className="px-2 py-1 text-xs bg-amber-100 text-amber-700 rounded">
            Per HSE1047 & HSE1048
          </span>
        </div>
        <p className="text-sm text-gray-600">
          Identify workplace hazards, assess risks using the 5×5 matrix, and apply the hierarchy of controls 
          to reduce residual risk to acceptable levels.
        </p>
      </div>

      {/* Summary */}
      {hazards.length > 0 && (
        <RiskSummary hazards={hazards} />
      )}

      {/* Risk Matrix */}
      {hazards.length > 0 && (
        <div className="card">
          <button
            onClick={() => toggleSection('matrix')}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-gray-400" />
              Risk Matrix
            </h3>
            {expandedSections.matrix ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {expandedSections.matrix && (
            <div className="mt-4">
              <RiskMatrix hazards={hazards} />
            </div>
          )}
        </div>
      )}

      {/* Hazards Section */}
      <div className="card">
        <button
          onClick={() => toggleSection('hazards')}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Identified Hazards
            {hazards.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                {hazards.length}
              </span>
            )}
          </h3>
          {expandedSections.hazards ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.hazards && (
          <div className="mt-4 space-y-4">
            {hazards.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 mb-2">No hazards identified yet</p>
                <p className="text-sm text-gray-400 mb-4">
                  Start by identifying potential hazards in the operational environment
                </p>
                <button
                  onClick={addHazard}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Hazard
                </button>
              </div>
            ) : (
              <>
                {hazards.map((hazard, index) => (
                  <HazardCard
                    key={hazard.id || index}
                    hazard={hazard}
                    index={index}
                    onUpdate={(field, value) => updateHazard(index, field, value)}
                    onRemove={() => removeHazard(index)}
                  />
                ))}
                <button
                  onClick={addHazard}
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-amber-400 hover:text-amber-600 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Another Hazard
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Review & Sign-off Section */}
      <div className="card">
        <button
          onClick={() => toggleSection('review')}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            Review & Approval
          </h3>
          {expandedSections.review ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.review && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="label">Overall Risk Assessment</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="riskAcceptable"
                    checked={hseRisk.overallRiskAcceptable === true}
                    onChange={() => updateHSERisk({ overallRiskAcceptable: true })}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-sm">Risks are acceptable - proceed with controls in place</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="riskAcceptable"
                    checked={hseRisk.overallRiskAcceptable === false}
                    onChange={() => updateHSERisk({ overallRiskAcceptable: false })}
                    className="w-4 h-4 text-red-600"
                  />
                  <span className="text-sm">Risks are not acceptable - do not proceed</span>
                </label>
              </div>
            </div>

            <div>
              <label className="label">Review Notes</label>
              <textarea
                value={hseRisk.reviewNotes || ''}
                onChange={(e) => updateHSERisk({ reviewNotes: e.target.value })}
                className="input min-h-[80px]"
                placeholder="Any additional notes about this risk assessment..."
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Reviewed By</label>
                <input
                  type="text"
                  value={hseRisk.reviewedBy || ''}
                  onChange={(e) => updateHSERisk({ reviewedBy: e.target.value })}
                  className="input"
                  placeholder="Name of reviewer"
                />
              </div>
              <div>
                <label className="label">Review Date</label>
                <input
                  type="date"
                  value={hseRisk.reviewDate || ''}
                  onChange={(e) => updateHSERisk({ reviewDate: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Approved By</label>
                <input
                  type="text"
                  value={hseRisk.approvedBy || ''}
                  onChange={(e) => updateHSERisk({ approvedBy: e.target.value })}
                  className="input"
                  placeholder="Name of approver"
                />
              </div>
              <div>
                <label className="label">Approval Date</label>
                <input
                  type="date"
                  value={hseRisk.approvalDate || ''}
                  onChange={(e) => updateHSERisk({ approvalDate: e.target.value })}
                  className="input"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
