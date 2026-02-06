/**
 * CAR Standard 922 Requirement Guidance
 * Comprehensive guidance data for each 922.xx requirement
 *
 * Reference Documents:
 * - Transport Canada CAR Standard 922 - Safety Assurance - RPAS
 * - AC 922-001 - Advisory Circular for CAR 922
 *
 * @version 1.0.0
 */

// ============================================
// Kinetic Energy Categories & Reliability Targets
// ============================================

export const KINETIC_ENERGY_CATEGORIES = {
  low: {
    label: 'Low',
    maxEnergy: 700, // Joules
    description: 'Less than 700 J',
    color: 'bg-green-100 text-green-800',
    colorDark: 'bg-green-600',
    reliabilityTargets: {
      catastrophic: 1e-4,
      hazardous: 1e-3,
      major: 1e-2,
      minor: 1e-2
    }
  },
  medium: {
    label: 'Medium',
    maxEnergy: 34000, // Joules
    description: '700 J to 34,000 J',
    color: 'bg-yellow-100 text-yellow-800',
    colorDark: 'bg-yellow-600',
    reliabilityTargets: {
      catastrophic: 1e-5,
      hazardous: 1e-4,
      major: 1e-3,
      minor: 1e-2
    }
  },
  high: {
    label: 'High',
    maxEnergy: 1084000, // Joules
    description: '34,000 J to 1,084,000 J',
    color: 'bg-orange-100 text-orange-800',
    colorDark: 'bg-orange-600',
    reliabilityTargets: {
      catastrophic: 1e-6,
      hazardous: 1e-5,
      major: 1e-4,
      minor: 1e-3
    }
  },
  very_high: {
    label: 'Very High',
    maxEnergy: Infinity,
    description: 'Greater than 1,084,000 J',
    color: 'bg-red-100 text-red-800',
    colorDark: 'bg-red-600',
    reliabilityTargets: null, // Requires TC consultation
    warning: 'Requires direct consultation with Transport Canada'
  }
}

export const RPAS_WEIGHT_CATEGORIES = {
  micro: {
    label: 'Micro RPAS',
    maxWeight: 0.25, // kg
    description: '250 grams or less'
  },
  small: {
    label: 'Small RPAS',
    maxWeight: 25, // kg
    description: '250g to 25 kg'
  },
  medium: {
    label: 'Medium RPAS',
    maxWeight: 150, // kg
    description: '25 kg to 150 kg'
  },
  large: {
    label: 'Large RPAS',
    maxWeight: Infinity,
    description: 'Greater than 150 kg'
  }
}

export const SEVERITY_CLASSIFICATIONS = {
  catastrophic: {
    label: 'Catastrophic',
    description: 'Multiple fatalities or fatal injury',
    color: 'bg-red-600 text-white'
  },
  hazardous: {
    label: 'Hazardous',
    description: 'Single fatality or serious injury',
    color: 'bg-orange-500 text-white'
  },
  major: {
    label: 'Major',
    description: 'Non-serious injury or significant damage',
    color: 'bg-yellow-500 text-black'
  },
  minor: {
    label: 'Minor',
    description: 'Minor injury or nuisance',
    color: 'bg-blue-500 text-white'
  }
}

// ============================================
// Compliance Methods
// ============================================

export const COMPLIANCE_METHODS = {
  inspection: {
    id: 'inspection',
    label: 'Inspection',
    description: 'Systematic examination of designs, hardware, software, or documentation',
    icon: 'Search',
    examples: [
      'Design document review',
      'Hardware inspection report',
      'Software code review',
      'Manufacturing process audit'
    ],
    bestFor: [
      'Design requirements',
      'Documentation requirements',
      'Physical characteristics'
    ]
  },
  analysis: {
    id: 'analysis',
    label: 'Analysis',
    description: 'Calculations, simulation, modeling, or engineering assessment',
    icon: 'Calculator',
    examples: [
      'Fault Tree Analysis (FTA)',
      'Failure Mode and Effects Analysis (FMEA)',
      'Monte Carlo simulation',
      'Structural load calculations'
    ],
    bestFor: [
      'Reliability requirements',
      'Performance calculations',
      'Safety assessments'
    ]
  },
  test: {
    id: 'test',
    label: 'Test',
    description: 'Performance verification through physical testing and demonstration',
    icon: 'FlaskConical',
    examples: [
      'Flight test reports',
      'Environmental testing (temperature, EMI)',
      'Functional verification tests',
      'Endurance testing'
    ],
    bestFor: [
      'Performance requirements',
      'Environmental envelope',
      'Functional behavior'
    ]
  },
  service_experience: {
    id: 'service_experience',
    label: 'Service Experience',
    description: 'Documented history demonstrating reliability from similar designs/operations',
    icon: 'History',
    examples: [
      'Fleet operational data',
      'Failure rate statistics',
      'Similar type certificate data',
      'Manufacturer service history'
    ],
    bestFor: [
      'Reliability demonstration',
      'Mature designs',
      'Commercial off-the-shelf equipment'
    ]
  }
}

// ============================================
// Section-Level Guidance
// ============================================

export const SECTION_GUIDANCE = {
  '922.04': {
    title: 'Controlled Airspace Operations',
    summary: 'Requirements for position accuracy when operating in controlled airspace',
    keyPoints: [
      'Lateral position accuracy: 10 metres or better',
      'Vertical position accuracy: 16 metres or better',
      'Applies when operating in controlled airspace',
      'GPS with WAAS/SBAS typically meets these requirements'
    ],
    difficulty: 'low',
    typicalEvidence: ['GPS specifications', 'Position accuracy test data', 'Manufacturer documentation']
  },
  '922.05': {
    title: 'Operations Near People (30m)',
    summary: 'Requirements for operations within 30 metres lateral distance of non-participating persons',
    keyPoints: [
      'No single failure may cause severe injury to non-participating persons',
      'Combined probability of failure causing severe injury must be assessed',
      'Requires identification of failure modes that could impact people',
      'Mitigation may include parachutes, flight termination systems, or operational limits'
    ],
    difficulty: 'medium',
    typicalEvidence: ['Safety assessment', 'Failure mode analysis', 'Mitigation system documentation']
  },
  '922.06': {
    title: 'Operations Over People (5m)',
    summary: 'Requirements for operations within 5 metres lateral distance of non-participating persons',
    keyPoints: [
      'Most stringent requirements in Standard 922',
      'No single failure may cause severe injury',
      'Combined probability of multiple failures < 10^-5 per flight hour',
      'Requires comprehensive system safety assessment',
      'Limited to Low kinetic energy category typically'
    ],
    difficulty: 'high',
    typicalEvidence: ['Formal safety assessment', 'Reliability analysis', 'Extensive test data', 'Redundancy analysis']
  },
  '922.07': {
    title: 'Safety and Reliability',
    summary: 'Reliability targets based on kinetic energy category',
    keyPoints: [
      'Reliability targets vary by kinetic energy category',
      'Lower KE = less stringent targets',
      'Requires formal system safety assessment for higher KE categories',
      'Must demonstrate reliability through analysis, test, or service experience',
      'MTBF and failure probability calculations required'
    ],
    difficulty: 'high',
    typicalEvidence: ['System safety assessment', 'Reliability analysis', 'Component failure data', 'MTBF calculations']
  },
  '922.08': {
    title: 'Containment',
    summary: 'Geofencing and operational containment requirements',
    keyPoints: [
      'RPAS must remain within declared operational volume',
      'Low robustness: Basic geofencing sufficient',
      'High robustness: Requires redundant containment systems',
      'Must define lost-link behavior and contingency areas',
      'Containment system must be independent of primary flight control'
    ],
    difficulty: 'medium',
    typicalEvidence: ['Geofence system documentation', 'Lost-link procedure', 'Containment test results']
  },
  '922.09': {
    title: 'C2 Link Reliability',
    summary: 'Command and Control link performance requirements',
    keyPoints: [
      'C2 link loss probability must be documented',
      'Predictable lost-link behavior required',
      'Link quality monitoring recommended',
      'Applies to both direct RF and network-based links',
      'Redundant links may be required for complex operations'
    ],
    difficulty: 'medium',
    typicalEvidence: ['C2 link specifications', 'Link budget analysis', 'Lost-link test results']
  },
  '922.10': {
    title: 'Detect, Alert, and Avoid (DAA)',
    summary: 'Requirements for airspace integration and conflict avoidance',
    keyPoints: [
      'DAA capability may be required for certain airspace classes',
      'Risk ratio must be maintained at or below baseline',
      'May use technology (ADS-B, radar) or procedures (observers)',
      'Requirements vary by airspace class and operation type'
    ],
    difficulty: 'high',
    typicalEvidence: ['DAA system documentation', 'Airspace risk analysis', 'Procedure documentation']
  },
  '922.11': {
    title: 'Control Station Design',
    summary: 'Human factors and crew interface requirements',
    keyPoints: [
      'Control station must support safe operation',
      'Task analysis required to identify workload',
      'Bedford Workload Rating or Cooper-Harper evaluation recommended',
      'Crew interface must provide adequate situational awareness',
      'Error prevention and recovery must be considered'
    ],
    difficulty: 'medium',
    typicalEvidence: ['Human factors analysis', 'Workload assessment', 'Interface design documentation']
  },
  '922.12': {
    title: 'Demonstrated Environmental Envelope',
    summary: 'Flight test and environmental demonstration requirements',
    keyPoints: [
      'RPAS must be tested within declared environmental envelope',
      'Weather limits must be verified through test',
      'EMI/EMC testing may be required',
      'Failure mode testing required for critical systems',
      'Flight test data must support claimed performance'
    ],
    difficulty: 'high',
    typicalEvidence: ['Flight test reports', 'Environmental test data', 'Weather limits documentation']
  }
}

// ============================================
// Detailed Requirement Guidance
// ============================================

export const REQUIREMENT_GUIDANCE = {
  // 922.04 - Controlled Airspace
  '922.04.1': {
    requirementId: '922.04.1',
    plainLanguage: 'Your drone must know its lateral position within 10 metres when flying in controlled airspace.',
    whyItMatters: 'In controlled airspace, precise positioning prevents conflicts with manned aircraft and ensures you stay within assigned areas. Air traffic control relies on accurate position reporting.',
    howToComply: [
      'Use GPS with WAAS or SBAS augmentation for enhanced accuracy',
      'Obtain manufacturer specifications for position accuracy',
      'Conduct position accuracy testing if required',
      'Document the specification and any test results'
    ],
    evidenceExamples: [
      'GPS module datasheet showing horizontal accuracy specifications',
      'Manufacturer statement of position accuracy',
      'Position accuracy test report comparing RPAS position to known reference',
      'Integration test showing position display accuracy'
    ],
    commonMistakes: [
      'Using consumer-grade GPS specifications without verification',
      'Not accounting for multi-path errors in urban environments',
      'Confusing CEP (Circular Error Probable) with maximum error',
      'Not considering GPS accuracy degradation in challenging conditions'
    ],
    relatedStandards: ['DO-229E (WAAS)', 'ED-76A'],
    tips: {
      commercial: 'Most commercial drones from major manufacturers (DJI, Freefly, etc.) already meet this requirement with WAAS-enabled GPS.',
      custom: 'Ensure your GPS module specification explicitly states horizontal accuracy. Test in your typical operating environment.'
    }
  },

  '922.04.2': {
    requirementId: '922.04.2',
    plainLanguage: 'Your drone must know its altitude within 16 metres when flying in controlled airspace.',
    whyItMatters: 'Vertical separation is critical for avoiding conflicts with manned aircraft. Altitude accuracy ensures you maintain assigned altitudes and separation requirements.',
    howToComply: [
      'Use barometric altitude with GPS altitude cross-check',
      'Calibrate altimeter before each flight in controlled airspace',
      'Document altitude accuracy specifications',
      'Consider pressure altitude vs geometric altitude differences'
    ],
    evidenceExamples: [
      'Barometric altimeter specifications',
      'Altitude accuracy test results',
      'Calibration procedure documentation',
      'Flight data showing altitude accuracy against known references'
    ],
    commonMistakes: [
      'Not calibrating barometric altitude to local pressure',
      'Relying solely on GPS altitude without barometric reference',
      'Not understanding the difference between AGL and MSL',
      'Ignoring altimeter drift during long flights'
    ],
    relatedStandards: ['DO-178C (for software)', 'RTCA standards'],
    tips: {
      commercial: 'Verify your GCS displays accurate altitude and configure proper units (AGL vs MSL).',
      custom: 'Use a quality barometric sensor and implement calibration procedures.'
    }
  },

  // 922.05 - Operations Near People
  '922.05.1': {
    requirementId: '922.05.1',
    plainLanguage: 'If you fly within 30 metres of people who are not part of your operation, no single equipment failure should be able to cause serious injury.',
    whyItMatters: 'Single-point failures are the most common cause of accidents. By ensuring no single failure can cause serious injury, we dramatically reduce risk to bystanders.',
    howToComply: [
      'Identify all single-point failure modes using FMEA or similar analysis',
      'Assess which failures could result in uncontrolled descent or flyaway',
      'Implement mitigations: redundancy, limiters, or operational controls',
      'Document the analysis and mitigations'
    ],
    evidenceExamples: [
      'Failure Mode and Effects Analysis (FMEA) document',
      'Single-point failure identification table',
      'Mitigation system documentation (e.g., parachute specs)',
      'Analysis showing injury severity for identified failures'
    ],
    commonMistakes: [
      'Not considering all potential failure modes',
      'Assuming manufacturer reliability without verification',
      'Underestimating impact energy and injury potential',
      'Not considering common-cause failures'
    ],
    relatedStandards: ['SAE ARP4761', 'MIL-STD-882', 'SAE ARP4754A'],
    tips: {
      commercial: 'Many commercial drones have built-in redundancy. Document what redundancy exists and what failure modes remain.',
      custom: 'Consider adding a parachute recovery system as a mitigation for motor or propeller failures.'
    }
  },

  // 922.06 - Operations Over People
  '922.06.1': {
    requirementId: '922.06.1',
    plainLanguage: 'Flying directly over people (within 5m lateral) has the strictest requirements. Combined probability of failures causing severe injury must be less than 1 in 100,000 per flight hour.',
    whyItMatters: 'Direct overflight gives people almost no time to react or escape. The consequences of a failure are severe, so the probability must be extremely low.',
    howToComply: [
      'Conduct comprehensive Functional Hazard Assessment',
      'Perform Fault Tree Analysis for critical failure combinations',
      'Calculate combined failure probabilities',
      'Demonstrate compliance through analysis, test, and service experience',
      'Consider limiting operations to low kinetic energy RPAS'
    ],
    evidenceExamples: [
      'Functional Hazard Assessment (FHA) document',
      'Fault Tree Analysis (FTA) showing probability calculations',
      'Reliability demonstration through component data',
      'Flight test data supporting reliability claims',
      'Design assurance documentation'
    ],
    commonMistakes: [
      'Underestimating the rigor required for this analysis',
      'Not using industry-standard safety assessment methods',
      'Failing to account for software-related failures',
      'Assuming component independence without justification'
    ],
    relatedStandards: ['SAE ARP4761', 'SAE ARP4754A', 'DO-178C', 'DO-254'],
    tips: {
      commercial: 'Very few commercial drones are designed for direct overflight. Consider whether this operation is truly necessary.',
      custom: 'This requires aerospace-grade safety analysis. Consider engaging a safety consultant.'
    }
  },

  // 922.07 - Safety and Reliability
  '922.07.1': {
    requirementId: '922.07.1',
    plainLanguage: 'Your reliability targets depend on your drone\'s kinetic energy. Higher energy = stricter targets because crashes cause more harm.',
    whyItMatters: 'A heavy, fast drone causes more damage than a light, slow one. Reliability targets are scaled to match the potential consequences.',
    howToComply: [
      'Calculate kinetic energy: KE = 0.5 * mass * velocity^2',
      'Determine your kinetic energy category (Low, Medium, High)',
      'Identify applicable reliability targets from the matrix',
      'Demonstrate compliance for each failure severity category'
    ],
    evidenceExamples: [
      'Kinetic energy calculation worksheet',
      'Reliability target matrix for your KE category',
      'Component reliability data (MTBF values)',
      'System-level reliability analysis'
    ],
    commonMistakes: [
      'Using incorrect velocity (should be maximum achievable, not cruise)',
      'Not including all mass (batteries, payload, etc.)',
      'Confusing kinetic energy with impact energy',
      'Not understanding the relationship between MTBF and probability'
    ],
    relatedStandards: ['MIL-HDBK-217', 'FIDES reliability handbook'],
    tips: {
      commercial: 'Calculate KE using max takeoff weight and maximum speed from manufacturer specs.',
      custom: 'Weigh your complete aircraft with all equipment and measure actual maximum speed.'
    }
  },

  '922.07.2': {
    requirementId: '922.07.2',
    plainLanguage: 'You must conduct a System Safety Assessment appropriate for your operations and kinetic energy category.',
    whyItMatters: 'A structured safety assessment ensures all hazards are identified and appropriately mitigated. It\'s the foundation of your safety case.',
    howToComply: [
      'Conduct Functional Hazard Assessment (FHA)',
      'Perform Preliminary System Safety Assessment (PSSA)',
      'Complete System Safety Assessment (SSA)',
      'Document findings and mitigations'
    ],
    evidenceExamples: [
      'Functional Hazard Assessment document',
      'FMEA or FMECA analysis',
      'Fault Tree Analysis for critical hazards',
      'Safety assessment summary report'
    ],
    commonMistakes: [
      'Treating safety assessment as a checkbox exercise',
      'Not involving operations personnel in hazard identification',
      'Failing to update assessment when design changes',
      'Not considering operational and human factors hazards'
    ],
    relatedStandards: ['SAE ARP4761', 'SAE ARP4754A', 'MIL-STD-882'],
    tips: {
      commercial: 'Even for commercial drones, you should assess integration risks and operational hazards.',
      custom: 'Start with a simple FMEA and expand as needed based on your kinetic energy category.'
    }
  },

  // 922.08 - Containment
  '922.08.1': {
    requirementId: '922.08.1',
    plainLanguage: 'Your drone must stay within the area you declare it will operate in. Geofencing or equivalent containment is required.',
    whyItMatters: 'Containment ensures your drone doesn\'t fly where it shouldn\'t - into restricted airspace, over unauthorized areas, or beyond line of sight.',
    howToComply: [
      'Implement geofencing based on GPS position',
      'Define operational volume with appropriate margins',
      'Program containment limits into flight controller',
      'Test containment system behavior at boundaries'
    ],
    evidenceExamples: [
      'Geofence configuration documentation',
      'Boundary testing flight logs',
      'Containment system specifications',
      'Lost-link behavior documentation'
    ],
    commonMistakes: [
      'Setting geofence boundaries too close to actual limits',
      'Not accounting for GPS drift near boundaries',
      'Relying solely on pilot intervention for containment',
      'Not testing containment behavior in realistic conditions'
    ],
    relatedStandards: [],
    tips: {
      commercial: 'Most commercial drones have built-in geofencing. Document the capabilities and test them.',
      custom: 'Implement geofencing in your flight controller. Allow for GPS uncertainty margins.'
    }
  },

  '922.08.2': {
    requirementId: '922.08.2',
    plainLanguage: 'High robustness containment requires redundant systems - if one containment method fails, another should keep the drone contained.',
    whyItMatters: 'For operations near critical infrastructure or in challenging environments, single-point failures in containment are unacceptable.',
    howToComply: [
      'Implement primary and backup containment systems',
      'Ensure independence between containment methods',
      'Document the architecture and failure modes',
      'Test both primary and backup containment'
    ],
    evidenceExamples: [
      'Redundant containment architecture document',
      'Independence analysis between systems',
      'Backup containment test results',
      'Failure mode analysis for containment'
    ],
    commonMistakes: [
      'Assuming software redundancy equals hardware independence',
      'Not testing backup containment in isolation',
      'Common-cause failures affecting both systems',
      'Relying on pilot as the redundant system'
    ],
    relatedStandards: ['DO-178C (software)', 'DO-254 (hardware)'],
    tips: {
      commercial: 'Few commercial drones have truly redundant containment. Consider if high robustness is required.',
      custom: 'Consider flight termination system as backup to geofencing.'
    }
  },

  // 922.09 - C2 Link
  '922.09.1': {
    requirementId: '922.09.1',
    plainLanguage: 'Your command and control link must be reliable, and you must know what your drone will do if it loses the link.',
    whyItMatters: 'Loss of control link is one of the most common failure modes. Predictable lost-link behavior ensures safe outcomes.',
    howToComply: [
      'Document C2 link specifications and expected reliability',
      'Define lost-link behavior (RTH, loiter, land, terminate)',
      'Test lost-link behavior under realistic conditions',
      'Implement link quality monitoring if available'
    ],
    evidenceExamples: [
      'C2 link specifications and range data',
      'Link budget analysis',
      'Lost-link behavior test results',
      'Link quality monitoring documentation'
    ],
    commonMistakes: [
      'Not testing lost-link at expected range limits',
      'Assuming lost-link will always result in RTH',
      'Not considering interference environments',
      'Ignoring latency requirements for safe control'
    ],
    relatedStandards: ['RTCA standards for datalinks'],
    tips: {
      commercial: 'Test lost-link behavior in your actual operating environment. RF conditions vary greatly.',
      custom: 'Consider redundant links (e.g., 2.4GHz primary, 900MHz backup) for critical operations.'
    }
  },

  // 922.10 - DAA
  '922.10.1': {
    requirementId: '922.10.1',
    plainLanguage: 'If required for your airspace and operation, you must have a way to detect other aircraft and avoid conflicts.',
    whyItMatters: 'Integration with manned aviation requires maintaining an equivalent level of safety. DAA ensures you don\'t create conflicts.',
    howToComply: [
      'Assess DAA requirements for your specific operation',
      'Implement appropriate DAA capability (technology or procedures)',
      'Calculate risk ratio to demonstrate equivalent safety',
      'Document DAA system and procedures'
    ],
    evidenceExamples: [
      'DAA system specifications (if technology-based)',
      'Observer procedures (if procedure-based)',
      'Risk ratio analysis',
      'Airspace conflict assessment'
    ],
    commonMistakes: [
      'Assuming visual observers are always sufficient',
      'Not considering all aircraft types in the area',
      'Underestimating closure rates with fast aircraft',
      'Not accounting for RPAS maneuverability limits'
    ],
    relatedStandards: ['RTCA DO-365', 'RTCA DO-366'],
    tips: {
      commercial: 'ADS-B receivers are becoming common. Consider adding one for situational awareness.',
      custom: 'For BVLOS, technology-based DAA will likely be required.'
    }
  },

  // 922.11 - Control Station Design
  '922.11.1': {
    requirementId: '922.11.1',
    plainLanguage: 'Your control station must support safe operation. The pilot should have the information they need without being overwhelmed.',
    whyItMatters: 'Human error contributes to many accidents. Good interface design reduces errors and improves safety.',
    howToComply: [
      'Conduct task analysis for your operations',
      'Assess pilot workload using Bedford or Cooper-Harper',
      'Ensure critical information is prominently displayed',
      'Design for error prevention and recovery'
    ],
    evidenceExamples: [
      'Task analysis document',
      'Workload assessment results',
      'Human factors design rationale',
      'Interface design documentation'
    ],
    commonMistakes: [
      'Overloading the display with unnecessary information',
      'Not considering task switching during flight',
      'Ignoring environmental factors (sun glare, cold)',
      'Not training pilots on abnormal procedures'
    ],
    relatedStandards: ['MIL-STD-1472 (Human Engineering)'],
    tips: {
      commercial: 'Evaluate the manufacturer\'s app/controller against your operational needs.',
      custom: 'Keep critical information (battery, GPS, link quality) always visible.'
    }
  },

  // 922.12 - Environmental Envelope
  '922.12.1': {
    requirementId: '922.12.1',
    plainLanguage: 'You must test your drone within the environmental conditions you claim it can operate in. Don\'t claim capabilities you haven\'t verified.',
    whyItMatters: 'Environmental conditions affect performance. Testing validates that your drone can safely handle the conditions you\'ll encounter.',
    howToComply: [
      'Define your environmental envelope (temperature, wind, rain)',
      'Conduct flight tests at envelope boundaries',
      'Document performance at each condition',
      'Set conservative limits with appropriate margins'
    ],
    evidenceExamples: [
      'Environmental envelope definition document',
      'Flight test reports at envelope boundaries',
      'Wind testing data',
      'Temperature performance data'
    ],
    commonMistakes: [
      'Claiming manufacturer specs without verification',
      'Not testing at actual boundary conditions',
      'Ignoring combined effects (e.g., cold + wind)',
      'Not accounting for payload effects on limits'
    ],
    relatedStandards: ['RTCA DO-160 (Environmental)'],
    tips: {
      commercial: 'Test at your actual operating site conditions, not just manufacturer specs.',
      custom: 'Start conservative and expand envelope as you gather test data.'
    }
  },

  '922.12.2': {
    requirementId: '922.12.2',
    plainLanguage: 'You must test critical systems in failure conditions to understand how your drone behaves when things go wrong.',
    whyItMatters: 'Understanding failure behavior is critical for developing emergency procedures and assessing risk.',
    howToComply: [
      'Identify critical failure modes from safety assessment',
      'Develop safe test procedures for each failure',
      'Conduct failure injection tests',
      'Document results and update procedures'
    ],
    evidenceExamples: [
      'Failure test plan and procedures',
      'Failure test results (video, telemetry)',
      'Emergency procedure validation',
      'Updated risk assessment based on test results'
    ],
    commonMistakes: [
      'Not testing failures in realistic conditions',
      'Conducting unsafe failure tests',
      'Not involving safety observers in failure testing',
      'Failing to update procedures based on results'
    ],
    relatedStandards: [],
    tips: {
      commercial: 'Simulate motor failures in a safe area. Many flight controllers support motor-out simulation.',
      custom: 'Build in safe failure injection capability for testing.'
    }
  }
}

// ============================================
// Common Drone Presets
// ============================================

export const DRONE_PRESETS = {
  // DJI Drones
  'dji_mavic_3': {
    manufacturer: 'DJI',
    model: 'Mavic 3',
    weightKg: 0.895,
    maxVelocityMs: 21,
    category: 'small',
    notes: 'Popular prosumer drone with obstacle avoidance'
  },
  'dji_mavic_3_enterprise': {
    manufacturer: 'DJI',
    model: 'Mavic 3 Enterprise',
    weightKg: 0.920,
    maxVelocityMs: 21,
    category: 'small',
    notes: 'Enterprise version with RTK capability'
  },
  'dji_m300_rtk': {
    manufacturer: 'DJI',
    model: 'Matrice 300 RTK',
    weightKg: 9.0, // with batteries, typical payload
    maxVelocityMs: 23,
    category: 'small',
    notes: 'Heavy-lift commercial platform'
  },
  'dji_m30': {
    manufacturer: 'DJI',
    model: 'Matrice 30',
    weightKg: 3.77,
    maxVelocityMs: 23,
    category: 'small',
    notes: 'Commercial inspection drone'
  },
  'dji_m350_rtk': {
    manufacturer: 'DJI',
    model: 'Matrice 350 RTK',
    weightKg: 6.47,
    maxVelocityMs: 23,
    category: 'small',
    notes: 'Latest heavy-lift platform, successor to M300'
  },
  'dji_inspire_3': {
    manufacturer: 'DJI',
    model: 'Inspire 3',
    weightKg: 3.995,
    maxVelocityMs: 26,
    category: 'small',
    notes: 'Cinema drone with full-frame camera'
  },
  'dji_mini_4_pro': {
    manufacturer: 'DJI',
    model: 'Mini 4 Pro',
    weightKg: 0.249,
    maxVelocityMs: 16,
    category: 'micro',
    notes: 'Sub-250g consumer drone'
  },
  'dji_air_3': {
    manufacturer: 'DJI',
    model: 'Air 3',
    weightKg: 0.720,
    maxVelocityMs: 21,
    category: 'small',
    notes: 'Dual-camera consumer drone'
  },
  'dji_phantom_4_rtk': {
    manufacturer: 'DJI',
    model: 'Phantom 4 RTK',
    weightKg: 1.391,
    maxVelocityMs: 16,
    category: 'small',
    notes: 'Mapping drone with RTK'
  },

  // Freefly Drones
  'freefly_alta_x': {
    manufacturer: 'Freefly',
    model: 'Alta X',
    weightKg: 20.4, // max takeoff weight
    maxVelocityMs: 25,
    category: 'small',
    notes: 'Heavy-lift cinema drone, up to 15.9kg payload'
  },
  'freefly_astro': {
    manufacturer: 'Freefly',
    model: 'Astro',
    weightKg: 9.0,
    maxVelocityMs: 20,
    category: 'small',
    notes: 'Mapping and inspection platform'
  },

  // Autel Drones
  'autel_evo_ii_pro': {
    manufacturer: 'Autel',
    model: 'EVO II Pro',
    weightKg: 1.191,
    maxVelocityMs: 20,
    category: 'small',
    notes: '6K camera prosumer drone'
  },
  'autel_evo_max': {
    manufacturer: 'Autel',
    model: 'EVO Max 4T',
    weightKg: 1.414,
    maxVelocityMs: 23,
    category: 'small',
    notes: 'Enterprise drone with thermal'
  },

  // Skydio
  'skydio_2': {
    manufacturer: 'Skydio',
    model: 'Skydio 2+',
    weightKg: 0.775,
    maxVelocityMs: 15,
    category: 'small',
    notes: 'Autonomous obstacle avoidance'
  },
  'skydio_x2': {
    manufacturer: 'Skydio',
    model: 'X2',
    weightKg: 1.0,
    maxVelocityMs: 15,
    category: 'small',
    notes: 'Enterprise/defense platform'
  },

  // Fixed Wing
  'wingtra_one': {
    manufacturer: 'Wingtra',
    model: 'WingtraOne',
    weightKg: 4.7,
    maxVelocityMs: 18,
    category: 'small',
    notes: 'VTOL fixed-wing for mapping'
  },
  'senseFly_eBee_X': {
    manufacturer: 'senseFly',
    model: 'eBee X',
    weightKg: 1.4,
    maxVelocityMs: 34,
    category: 'small',
    notes: 'Fixed-wing mapping drone'
  }
}

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate kinetic energy
 */
export function calculateKineticEnergy(massKg, velocityMs) {
  return 0.5 * massKg * Math.pow(velocityMs, 2)
}

/**
 * Get kinetic energy category
 */
export function getKineticEnergyCategory(kineticEnergy) {
  if (kineticEnergy < 700) return 'low'
  if (kineticEnergy < 34000) return 'medium'
  if (kineticEnergy < 1084000) return 'high'
  return 'very_high'
}

/**
 * Get RPAS weight category
 */
export function getRPASCategory(weightKg) {
  if (weightKg <= 0.25) return 'micro'
  if (weightKg <= 25) return 'small'
  if (weightKg <= 150) return 'medium'
  return 'large'
}

/**
 * Get reliability target for given KE category and severity
 */
export function getReliabilityTarget(keCategory, severity) {
  const category = KINETIC_ENERGY_CATEGORIES[keCategory]
  if (!category || !category.reliabilityTargets) return null
  return category.reliabilityTargets[severity]
}

/**
 * Format probability as scientific notation
 */
export function formatProbability(probability) {
  if (!probability) return 'N/A'
  const exponent = Math.log10(probability)
  return `10^${Math.round(exponent)}`
}

/**
 * Get guidance for a specific requirement
 */
export function getGuidance(requirementId) {
  return REQUIREMENT_GUIDANCE[requirementId] || null
}

/**
 * Get section guidance
 */
export function getSectionGuidance(sectionId) {
  return SECTION_GUIDANCE[sectionId] || null
}

/**
 * Get drone preset by ID
 */
export function getDronePreset(presetId) {
  return DRONE_PRESETS[presetId] || null
}

/**
 * Search drone presets by manufacturer or model
 */
export function searchDronePresets(searchTerm) {
  const term = searchTerm.toLowerCase()
  return Object.entries(DRONE_PRESETS)
    .filter(([id, drone]) =>
      drone.manufacturer.toLowerCase().includes(term) ||
      drone.model.toLowerCase().includes(term)
    )
    .map(([id, drone]) => ({ id, ...drone }))
}

// ============================================
// Export All
// ============================================

export default {
  KINETIC_ENERGY_CATEGORIES,
  RPAS_WEIGHT_CATEGORIES,
  SEVERITY_CLASSIFICATIONS,
  COMPLIANCE_METHODS,
  SECTION_GUIDANCE,
  REQUIREMENT_GUIDANCE,
  DRONE_PRESETS,
  calculateKineticEnergy,
  getKineticEnergyCategory,
  getRPASCategory,
  getReliabilityTarget,
  formatProbability,
  getGuidance,
  getSectionGuidance,
  getDronePreset,
  searchDronePresets
}
