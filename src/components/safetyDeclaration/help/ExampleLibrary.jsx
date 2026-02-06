/**
 * Example Library Component
 * Provides real-world examples for Safety Declaration requirements
 *
 * @location src/components/safetyDeclaration/help/ExampleLibrary.jsx
 */

import React, { useState, useMemo } from 'react'
import {
  BookOpen,
  Calculator,
  FileText,
  ChevronDown,
  ChevronUp,
  Search,
  Copy,
  Check,
  Plane,
  FileSpreadsheet,
  ClipboardList,
  Zap,
  Shield,
  Target,
  Radio,
  Eye,
  Users,
  Thermometer
} from 'lucide-react'

// ============================================
// Example Data
// ============================================

export const EXAMPLE_CALCULATIONS = [
  {
    id: 'ke_m300',
    title: 'Kinetic Energy - DJI M300 RTK',
    category: 'kinetic_energy',
    drone: 'DJI M300 RTK',
    description: 'Calculate kinetic energy for a commercial inspection platform',
    inputs: {
      mass: 9.0,
      velocity: 23,
      massUnit: 'kg',
      velocityUnit: 'm/s'
    },
    calculation: {
      formula: 'KE = 0.5 × m × v²',
      steps: [
        'KE = 0.5 × 9.0 kg × (23 m/s)²',
        'KE = 0.5 × 9.0 × 529',
        'KE = 2,380.5 J'
      ],
      result: 2380.5,
      unit: 'J'
    },
    outcome: {
      category: 'medium',
      label: 'Medium Kinetic Energy',
      explanation: 'With 2,380 J, this falls into the Medium KE category (700-34,000 J). Reliability targets: 10^-5 for catastrophic failures.'
    }
  },
  {
    id: 'ke_mini',
    title: 'Kinetic Energy - DJI Mini 4 Pro',
    category: 'kinetic_energy',
    drone: 'DJI Mini 4 Pro',
    description: 'Calculate kinetic energy for a sub-250g consumer drone',
    inputs: {
      mass: 0.249,
      velocity: 16,
      massUnit: 'kg',
      velocityUnit: 'm/s'
    },
    calculation: {
      formula: 'KE = 0.5 × m × v²',
      steps: [
        'KE = 0.5 × 0.249 kg × (16 m/s)²',
        'KE = 0.5 × 0.249 × 256',
        'KE = 31.9 J'
      ],
      result: 31.9,
      unit: 'J'
    },
    outcome: {
      category: 'low',
      label: 'Low Kinetic Energy',
      explanation: 'With only 32 J, this is well within the Low KE category (<700 J). Reliability targets: 10^-4 for catastrophic failures - the least stringent.'
    }
  },
  {
    id: 'ke_altax',
    title: 'Kinetic Energy - Freefly Alta X (Loaded)',
    category: 'kinetic_energy',
    drone: 'Freefly Alta X',
    description: 'Calculate kinetic energy for a heavy-lift cinema drone with payload',
    inputs: {
      mass: 20.4,
      velocity: 25,
      massUnit: 'kg',
      velocityUnit: 'm/s'
    },
    calculation: {
      formula: 'KE = 0.5 × m × v²',
      steps: [
        'KE = 0.5 × 20.4 kg × (25 m/s)²',
        'KE = 0.5 × 20.4 × 625',
        'KE = 6,375 J'
      ],
      result: 6375,
      unit: 'J'
    },
    outcome: {
      category: 'medium',
      label: 'Medium Kinetic Energy',
      explanation: 'At 6,375 J, this is in the Medium KE category but approaching the higher end. System safety assessment should be thorough.'
    }
  },
  {
    id: 'reliability_medium',
    title: 'Reliability Target - Medium KE Category',
    category: 'reliability',
    description: 'Determine required failure probability for a Medium KE RPAS',
    inputs: {
      keCategory: 'medium',
      severity: 'catastrophic'
    },
    calculation: {
      formula: 'P_target from CAR 922.07 matrix',
      steps: [
        'KE Category: Medium (700 - 34,000 J)',
        'Failure Severity: Catastrophic',
        'Look up in reliability matrix',
        'Target: 10^-5 per flight hour'
      ],
      result: 0.00001,
      unit: 'per flight hour'
    },
    outcome: {
      category: 'medium',
      label: '10^-5 Probability',
      explanation: 'This means no more than 1 catastrophic failure per 100,000 flight hours. Demonstrating this typically requires Fault Tree Analysis combined with component MTBF data.'
    }
  },
  {
    id: 'mtbf_conversion',
    title: 'MTBF to Failure Rate Conversion',
    category: 'reliability',
    description: 'Convert Mean Time Between Failures to hourly failure rate',
    inputs: {
      mtbf: 10000,
      unit: 'hours'
    },
    calculation: {
      formula: 'Failure Rate (λ) = 1 / MTBF',
      steps: [
        'MTBF = 10,000 hours',
        'λ = 1 / 10,000',
        'λ = 0.0001 per hour',
        'λ = 10^-4 per hour'
      ],
      result: 0.0001,
      unit: 'failures per hour'
    },
    outcome: {
      label: 'Basic Conversion',
      explanation: 'A component with 10,000 hour MTBF has a failure rate of 10^-4 per hour. This meets the Low KE catastrophic target but not Medium or High.'
    }
  }
]

export const EXAMPLE_EVIDENCE = [
  {
    id: 'gps_spec',
    title: 'GPS Position Accuracy Evidence',
    requirement: '922.04.1',
    requirementText: 'Lateral position accuracy within 10m',
    type: 'manufacturer_data',
    description: 'Manufacturer specification showing GPS accuracy meets requirement',
    format: 'PDF specification sheet',
    exampleContent: `GPS Receiver Specifications - Example

Module: u-blox ZED-F9P
Horizontal Position Accuracy:
- RTK: 0.01m + 1ppm CEP
- SBAS: 0.5m CEP
- Standard: 1.5m CEP

WAAS/SBAS Enabled: Yes
Multi-constellation: GPS, GLONASS, Galileo, BeiDou

Certification: FCC Part 15B

This specification demonstrates compliance with CAR 922.04.1
requiring lateral position accuracy within 10 metres.`,
    tips: [
      'Include the complete datasheet, not just excerpts',
      'Highlight the relevant accuracy specifications',
      'Note which accuracy mode applies to your operations',
      'Consider documenting typical vs worst-case accuracy'
    ]
  },
  {
    id: 'fmea_example',
    title: 'Failure Mode and Effects Analysis (FMEA)',
    requirement: '922.05.1',
    requirementText: 'Single failure shall not cause severe injury',
    type: 'analysis_document',
    description: 'FMEA identifying potential failure modes and their effects',
    format: 'Spreadsheet or document',
    exampleContent: `FMEA Summary - Single Failure Analysis

System: Example Quadcopter RPAS
Date: 2024-01-15
Analyst: J. Smith, Safety Engineer

| Component | Failure Mode | Effect | Severity | Mitigation |
|-----------|--------------|--------|----------|------------|
| Motor 1 | Loss of thrust | Uncontrolled descent | High | Motor redundancy (4 motors) |
| ESC 1 | Short circuit | Motor 1 failure | High | Motor redundancy |
| Battery | Cell failure | Power loss | High | Dual battery system |
| GPS | Signal loss | Position unknown | Medium | Inertial fallback |
| Radio link | Connection lost | No commands | Medium | RTH on link loss |

Conclusion: No single failure identified that would result in
immediate uncontrolled descent. Motor/ESC failures are mitigated
by quadcopter redundancy (can maintain controlled flight on 3 motors).`,
    tips: [
      'Be systematic - cover all major components',
      'Consider failure combinations, not just single failures',
      'Document the severity assessment rationale',
      'Link mitigations to specific design features'
    ]
  },
  {
    id: 'containment_test',
    title: 'Geofence Containment Test Report',
    requirement: '922.08.1',
    requirementText: 'RPAS shall remain within operational volume',
    type: 'test_report',
    description: 'Flight test demonstrating geofence boundary behavior',
    format: 'Test report with telemetry',
    exampleContent: `Geofence Containment Test Report

Test Date: 2024-01-20
Location: Test Range Alpha
Aircraft: Example RPAS S/N 001
Pilot: A. Johnson (PIC)

Test Objective:
Verify geofence boundary behavior meets 922.08 requirements

Test Conditions:
- Wind: 12 kts from NW
- Temperature: 15°C
- GPS HDOP: 0.9

Test Procedure:
1. Establish 500m x 500m geofence
2. Fly toward boundary at cruise speed
3. Document aircraft behavior at boundary

Results:
- Aircraft initiated braking at 485m (15m from boundary)
- Aircraft achieved full stop at 492m (8m from boundary)
- No boundary violation occurred
- RTH activated when attempting to exceed boundary

Conclusion: PASS - Geofence containment effective with margin.`,
    tips: [
      'Include GPS logs/telemetry as evidence',
      'Test at various approach speeds and angles',
      'Document weather conditions during test',
      'Test both horizontal and vertical containment'
    ]
  },
  {
    id: 'c2_link_spec',
    title: 'C2 Link Specification and Test',
    requirement: '922.09.1',
    requirementText: 'C2 link reliability documented',
    type: 'test_report',
    description: 'Command and Control link performance documentation',
    format: 'Specification + test results',
    exampleContent: `C2 Link Performance Documentation

Radio System: Example 2.4GHz / 900MHz Dual-Link
Manufacturer: Example Radio Co.

Specifications:
- Primary: 2.4GHz, 20dBm, LOS range 10km
- Backup: 900MHz, 27dBm, LOS range 25km
- Latency: <100ms typical
- Update rate: 50Hz

Link Budget Analysis:
- Transmit power: 20dBm
- Antenna gain: 3dBi
- Path loss at 5km: -98dB
- Receiver sensitivity: -105dBm
- Link margin: 30dB

Lost-Link Behavior:
1. Link warning at RSSI < -90dBm
2. Auto-switch to 900MHz at link loss
3. If both links lost >5s: Execute RTH
4. If RTH not possible: Land immediately

Test Results:
- Range test: Maintained link to 8km
- Lost-link test: RTH initiated within 6s
- No unexpected behavior observed`,
    tips: [
      'Document both primary and backup link specifications',
      'Include link budget analysis for your typical range',
      'Test lost-link behavior explicitly',
      'Document the RTH behavior and timing'
    ]
  },
  {
    id: 'environmental_test',
    title: 'Environmental Envelope Test Report',
    requirement: '922.12.1',
    requirementText: 'Demonstrated environmental envelope',
    type: 'test_report',
    description: 'Flight testing at environmental limits',
    format: 'Test report with data',
    exampleContent: `Environmental Envelope Demonstration

Test Program: Environmental Limits Verification
Aircraft: Example RPAS
Test Period: January - March 2024

Claimed Envelope:
- Temperature: -20°C to +40°C
- Wind: Up to 25 kts sustained
- Rain: Light rain (< 4mm/hr)
- Altitude: Sea level to 3000m AGL

Tests Conducted:

1. Cold Temperature Test (-15°C actual)
   Location: Northern Ontario, January
   Result: PASS - Normal operation, 15% battery reduction

2. Wind Test (22 kts sustained, 28 kt gusts)
   Location: Coastal test site
   Result: PASS - Maintained position, increased power draw

3. Light Rain Test (2mm/hr)
   Result: PASS - Normal operation, no water ingress

4. Altitude Test (2800m)
   Location: Mountain test site
   Result: PASS - 8% thrust reduction, within margins

Conclusion:
Aircraft demonstrated capability within claimed envelope.
Recommend 20% power margin for high altitude + wind combination.`,
    tips: [
      'Test at actual boundary conditions, not just close',
      'Document conditions precisely (use weather station)',
      'Include flight logs as supporting evidence',
      'Note any performance degradation observed'
    ]
  }
]

export const INDUSTRY_BENCHMARKS = {
  ke_thresholds: {
    title: 'Kinetic Energy Thresholds',
    description: 'CAR 922 kinetic energy category boundaries',
    data: [
      { category: 'Low', maxKE: 700, unit: 'J', color: 'green' },
      { category: 'Medium', maxKE: 34000, unit: 'J', color: 'yellow' },
      { category: 'High', maxKE: 1084000, unit: 'J', color: 'orange' },
      { category: 'Very High', maxKE: 'No limit', unit: '', color: 'red' }
    ]
  },
  reliability_targets: {
    title: 'Reliability Targets by Severity',
    description: 'Required failure probability per flight hour',
    headers: ['Severity', 'Low KE', 'Medium KE', 'High KE'],
    data: [
      { severity: 'Catastrophic', low: '10⁻⁴', medium: '10⁻⁵', high: '10⁻⁶' },
      { severity: 'Hazardous', low: '10⁻³', medium: '10⁻⁴', high: '10⁻⁵' },
      { severity: 'Major', low: '10⁻²', medium: '10⁻³', high: '10⁻⁴' },
      { severity: 'Minor', low: '10⁻²', medium: '10⁻²', high: '10⁻³' }
    ]
  },
  typical_component_mtbf: {
    title: 'Typical Component MTBF Values',
    description: 'Industry typical values for reliability calculations',
    data: [
      { component: 'Brushless Motor', mtbf: '5,000 - 10,000', unit: 'hours' },
      { component: 'ESC', mtbf: '10,000 - 20,000', unit: 'hours' },
      { component: 'Flight Controller', mtbf: '20,000 - 50,000', unit: 'hours' },
      { component: 'GPS Receiver', mtbf: '50,000 - 100,000', unit: 'hours' },
      { component: 'LiPo Battery', mtbf: '500 - 1,000', unit: 'cycles' },
      { component: 'Radio Transmitter', mtbf: '20,000 - 50,000', unit: 'hours' }
    ],
    note: 'These are rough industry estimates. Use manufacturer data when available.'
  }
}

// ============================================
// Category Icons
// ============================================

const CATEGORY_ICONS = {
  kinetic_energy: Zap,
  reliability: Shield,
  containment: Target,
  c2_link: Radio,
  daa: Eye,
  human_factors: Users,
  environmental: Thermometer,
  general: FileText
}

// ============================================
// Example Library Component
// ============================================

export function ExampleLibrary({
  filter = null, // 'kinetic_energy', 'reliability', etc.
  requirementFilter = null, // '922.04', '922.05', etc.
  onSelectExample,
  className = ''
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('calculations')
  const [expandedItems, setExpandedItems] = useState({})

  // Filter examples based on props and search
  const filteredCalculations = useMemo(() => {
    return EXAMPLE_CALCULATIONS.filter(ex => {
      const matchesFilter = !filter || ex.category === filter
      const matchesSearch = !searchTerm ||
        ex.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.drone?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [filter, searchTerm])

  const filteredEvidence = useMemo(() => {
    return EXAMPLE_EVIDENCE.filter(ex => {
      const matchesReq = !requirementFilter || ex.requirement.startsWith(requirementFilter)
      const matchesSearch = !searchTerm ||
        ex.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.requirement.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesReq && matchesSearch
    })
  }, [requirementFilter, searchTerm])

  const toggleExpanded = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h3 className="font-medium text-gray-900">Example Library</h3>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search examples..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setSelectedTab('calculations')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              selectedTab === 'calculations'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calculator className="w-4 h-4 inline mr-1" />
            Calculations
          </button>
          <button
            onClick={() => setSelectedTab('evidence')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              selectedTab === 'evidence'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-1" />
            Evidence
          </button>
          <button
            onClick={() => setSelectedTab('benchmarks')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              selectedTab === 'benchmarks'
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ClipboardList className="w-4 h-4 inline mr-1" />
            Benchmarks
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {/* Calculations Tab */}
        {selectedTab === 'calculations' && (
          <div className="divide-y divide-gray-100">
            {filteredCalculations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Calculator className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No calculation examples found</p>
              </div>
            ) : (
              filteredCalculations.map((example) => (
                <CalculationExample
                  key={example.id}
                  example={example}
                  isExpanded={expandedItems[example.id]}
                  onToggle={() => toggleExpanded(example.id)}
                  onSelect={() => onSelectExample?.(example)}
                />
              ))
            )}
          </div>
        )}

        {/* Evidence Tab */}
        {selectedTab === 'evidence' && (
          <div className="divide-y divide-gray-100">
            {filteredEvidence.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No evidence examples found</p>
              </div>
            ) : (
              filteredEvidence.map((example) => (
                <EvidenceExample
                  key={example.id}
                  example={example}
                  isExpanded={expandedItems[example.id]}
                  onToggle={() => toggleExpanded(example.id)}
                />
              ))
            )}
          </div>
        )}

        {/* Benchmarks Tab */}
        {selectedTab === 'benchmarks' && (
          <div className="p-4 space-y-6">
            <BenchmarkTable data={INDUSTRY_BENCHMARKS.ke_thresholds} />
            <ReliabilityMatrix data={INDUSTRY_BENCHMARKS.reliability_targets} />
            <ComponentMTBFTable data={INDUSTRY_BENCHMARKS.typical_component_mtbf} />
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// Calculation Example Card
// ============================================

function CalculationExample({ example, isExpanded, onToggle, onSelect }) {
  const [copied, setCopied] = useState(false)
  const CategoryIcon = CATEGORY_ICONS[example.category] || FileText

  const copyFormula = () => {
    navigator.clipboard.writeText(example.calculation.formula)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-4">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between text-left"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <CategoryIcon className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">{example.title}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{example.description}</p>
            {example.drone && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                <Plane className="w-3 h-3" />
                {example.drone}
              </span>
            )}
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 ml-11 space-y-4">
          {/* Inputs */}
          <div>
            <h5 className="text-xs font-medium text-gray-700 mb-2">Inputs</h5>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(example.inputs).map(([key, value]) => (
                !key.includes('Unit') && (
                  <div key={key} className="bg-gray-50 p-2 rounded text-sm">
                    <span className="text-gray-500">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                    <span className="font-medium">{value} {example.inputs[`${key}Unit`] || ''}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Calculation Steps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-medium text-gray-700">Calculation</h5>
              <button
                onClick={copyFormula}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy formula
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-sm space-y-1">
              <p className="text-indigo-400">{example.calculation.formula}</p>
              {example.calculation.steps.map((step, i) => (
                <p key={i} className="text-gray-300">{step}</p>
              ))}
              <p className="text-green-400 font-medium">
                = {example.calculation.result.toLocaleString()} {example.calculation.unit}
              </p>
            </div>
          </div>

          {/* Outcome */}
          {example.outcome && (
            <div className={`p-3 rounded-lg ${
              example.outcome.category === 'low' ? 'bg-green-50 border border-green-200' :
                example.outcome.category === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
                  example.outcome.category === 'high' ? 'bg-orange-50 border border-orange-200' :
                    'bg-gray-50 border border-gray-200'
            }`}>
              <p className={`text-sm font-medium ${
                example.outcome.category === 'low' ? 'text-green-700' :
                  example.outcome.category === 'medium' ? 'text-yellow-700' :
                    example.outcome.category === 'high' ? 'text-orange-700' :
                      'text-gray-700'
              }`}>
                {example.outcome.label}
              </p>
              <p className="text-xs text-gray-600 mt-1">{example.outcome.explanation}</p>
            </div>
          )}

          {/* Use This Example Button */}
          {onSelect && (
            <button
              onClick={onSelect}
              className="w-full py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Use This Example
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// Evidence Example Card
// ============================================

function EvidenceExample({ example, isExpanded, onToggle }) {
  const [copied, setCopied] = useState(false)

  const copyContent = () => {
    navigator.clipboard.writeText(example.exampleContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-4">
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between text-left"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">{example.title}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{example.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                {example.requirement}
              </span>
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                {example.format}
              </span>
            </div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 ml-11 space-y-4">
          {/* Requirement Reference */}
          <div className="p-2 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs font-medium text-blue-700">Requirement {example.requirement}</p>
            <p className="text-xs text-blue-600">{example.requirementText}</p>
          </div>

          {/* Example Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-medium text-gray-700">Example Content</h5>
              <button
                onClick={copyContent}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap">
              {example.exampleContent}
            </pre>
          </div>

          {/* Tips */}
          {example.tips && (
            <div>
              <h5 className="text-xs font-medium text-gray-700 mb-2">Tips for This Evidence</h5>
              <ul className="space-y-1">
                {example.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                    <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// Benchmark Tables
// ============================================

function BenchmarkTable({ data }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-900 mb-2">{data.title}</h4>
      <p className="text-xs text-gray-500 mb-3">{data.description}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Category</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Max KE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.data.map((row, i) => (
              <tr key={i}>
                <td className="px-3 py-2">
                  <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded ${
                    row.color === 'green' ? 'bg-green-100 text-green-700' :
                      row.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                        row.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                  }`}>
                    {row.category}
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs">
                  {typeof row.maxKE === 'number' ? row.maxKE.toLocaleString() : row.maxKE} {row.unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ReliabilityMatrix({ data }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-900 mb-2">{data.title}</h4>
      <p className="text-xs text-gray-500 mb-3">{data.description}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              {data.headers.map((header, i) => (
                <th key={i} className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.data.map((row, i) => (
              <tr key={i}>
                <td className="px-3 py-2 font-medium text-gray-900">{row.severity}</td>
                <td className="px-3 py-2 font-mono text-xs text-green-700">{row.low}</td>
                <td className="px-3 py-2 font-mono text-xs text-yellow-700">{row.medium}</td>
                <td className="px-3 py-2 font-mono text-xs text-orange-700">{row.high}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ComponentMTBFTable({ data }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-900 mb-2">{data.title}</h4>
      <p className="text-xs text-gray-500 mb-3">{data.description}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Component</th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Typical MTBF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.data.map((row, i) => (
              <tr key={i}>
                <td className="px-3 py-2 text-gray-900">{row.component}</td>
                <td className="px-3 py-2 text-right font-mono text-xs">
                  {row.mtbf} {row.unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.note && (
        <p className="text-xs text-amber-600 mt-2 flex items-start gap-1">
          <span className="font-medium">Note:</span> {data.note}
        </p>
      )}
    </div>
  )
}

// ============================================
// Export All
// ============================================

export default ExampleLibrary
