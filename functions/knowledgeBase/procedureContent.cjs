/**
 * Procedure Content Data
 * Step-by-step operational procedures extracted from procedure documents
 *
 * Structure for procedures:
 * - Title, category, description
 * - Steps array with step number, action, details, cautions, checkpoints
 * - Equipment/tools required
 * - Personnel required
 * - Regulatory references
 * - Related policies
 *
 * White-label support: Use {{COMPANY_NAME}} placeholder
 *
 * @location src/data/procedureContent.js
 */

// Procedure Categories
const PROCEDURE_CATEGORIES = {
  general: {
    id: 'general',
    name: 'General Procedures',
    description: 'Pre-flight, post-flight, and routine operational procedures',
    icon: 'ClipboardList',
    color: 'blue',
    numberRange: { start: 'GP-001', end: 'GP-999' }
  },
  advanced: {
    id: 'advanced',
    name: 'Advanced Procedures',
    description: 'BVLOS, complex operations, and specialized tasks',
    icon: 'Zap',
    color: 'purple',
    numberRange: { start: 'AP-001', end: 'AP-999' }
  },
  emergency: {
    id: 'emergency',
    name: 'Emergency Procedures',
    description: 'Flyaways, lost link, injuries, and emergency response',
    icon: 'AlertTriangle',
    color: 'red',
    numberRange: { start: 'EP-001', end: 'EP-999' }
  }
}

const PROCEDURE_CONTENT = {
  // ============================================
  // GENERAL PROCEDURES (GP-001 to GP-020)
  // ============================================

  'GP-001': {
    id: 'proc-gp-001',
    number: 'GP-001',
    title: 'Operation Planning Flow',
    category: 'general',
    description: 'Documentation and measures necessary before management signs off on mission readiness. This is done before departure.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Operations Manager',
    status: 'active',
    regulatoryRefs: ['CARs Part IX', 'Transport Canada AC 903-001'],
    relatedPolicies: ['1001', '1002', '1005'],
    keywords: ['planning', 'flight plan', 'CONOPS', 'site survey', 'pre-mission'],
    equipmentRequired: [
      'Google Earth Pro',
      'DSST-2 Assessment Tool',
      'SiteDocs',
      'NavCanada CFPS',
      'AirData Platform'
    ],
    personnelRequired: ['Operations Manager', 'Pilot in Command'],
    steps: [
      {
        stepNumber: 1,
        action: 'Develop draft flight plan',
        details: 'Create a draft flight plan in Google Earth Pro for the purposes of obtaining Operational Volume. Build a flight plan based on the CL1 assessment table for multi-phase operations.',
        notes: 'For contingency volume, assume RPAS max speed for 15 seconds. For ground risk buffer, add the maximum planned altitude to the operational volume horizontally.',
        cautions: null,
        checkpoints: ['Flight plan created', 'Operational volume defined']
      },
      {
        stepNumber: 2,
        action: 'Assess operational type',
        details: 'Open DSST-2 to assess operational type (CL1, SFOC, etc.)',
        notes: null,
        cautions: null,
        checkpoints: ['Operational type determined']
      },
      {
        stepNumber: 3,
        action: 'Check declaration requirements',
        details: 'Check Standard 922 for declaration requirements.',
        notes: null,
        cautions: null,
        checkpoints: ['Declaration requirements verified']
      },
      {
        stepNumber: 4,
        action: 'Confirm population density',
        details: 'Check StatsCan to confirm the population density of the operational area.',
        notes: null,
        cautions: null,
        checkpoints: ['Population density confirmed']
      },
      {
        stepNumber: 5,
        action: 'File Operational Plan',
        details: 'File Operational Plan through SiteDocs to include flight plan, site survey, emergency plan, and other important details.',
        notes: null,
        cautions: null,
        checkpoints: ['Operational plan filed']
      },
      {
        stepNumber: 6,
        action: 'Conduct Operational Safety Meeting',
        details: 'Hold operational safety meeting to review operational plan with all crew members.',
        notes: null,
        cautions: null,
        checkpoints: ['Safety meeting completed']
      },
      {
        stepNumber: 7,
        action: 'Prepare NavCanada Flight Plan',
        details: 'Prepare and review NavCanada Flight Plan for submission.',
        notes: null,
        cautions: null,
        checkpoints: ['NavCanada flight plan prepared']
      },
      {
        stepNumber: 8,
        action: 'Prepare AirData Mission Plans',
        details: 'Upload the NavCanada flight plan and the Operation plan to the AirData Mission plan.',
        notes: null,
        cautions: null,
        checkpoints: ['AirData mission plan created']
      }
    ]
  },

  'GP-002': {
    id: 'proc-gp-002',
    number: 'GP-002',
    title: 'Kit Preparation Flow',
    category: 'general',
    description: 'Ensure all RPAS equipment, batteries, software, and documents are ready before deployment.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Operations Manager',
    status: 'active',
    regulatoryRefs: ['CARs Part IX'],
    relatedPolicies: ['1003', '1009'],
    keywords: ['kit', 'preparation', 'equipment', 'batteries', 'pre-deployment'],
    equipmentRequired: [
      'RPAS equipment',
      'Batteries',
      'Ground control station',
      'Payloads',
      'Spare parts',
      'Documentation'
    ],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Inventory check',
        details: 'Verify all equipment, spares, and backups are present and accounted for.',
        notes: null,
        cautions: null,
        checkpoints: ['Inventory complete']
      },
      {
        stepNumber: 2,
        action: 'Battery check',
        details: 'Confirm all batteries are fully charged and stored safely.',
        notes: null,
        cautions: 'Do not use swollen or damaged batteries.',
        checkpoints: ['All batteries charged', 'Battery condition verified']
      },
      {
        stepNumber: 3,
        action: 'Software check',
        details: 'Update flight apps and payload tools to latest versions.',
        notes: null,
        cautions: null,
        checkpoints: ['Software updated']
      },
      {
        stepNumber: 4,
        action: 'Documentation pack',
        details: 'Pack certifications, manuals, and permissions.',
        notes: null,
        cautions: null,
        checkpoints: ['Documents packed']
      },
      {
        stepNumber: 5,
        action: 'Pack gear',
        details: 'Secure, organize, and label all gear.',
        notes: null,
        cautions: null,
        checkpoints: ['Gear packed and labeled']
      },
      {
        stepNumber: 6,
        action: 'Submit NavCanada flight plan',
        details: 'Submit the prepared NavCanada flight plan.',
        notes: null,
        cautions: null,
        checkpoints: ['Flight plan submitted']
      }
    ]
  },

  'GP-003': {
    id: 'proc-gp-003',
    number: 'GP-003',
    title: 'Weather & NOTAM Review Flow',
    category: 'general',
    description: 'Day before and morning of operation, check to ensure safe flight conditions are met.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Pilot in Command',
    status: 'active',
    regulatoryRefs: ['CARs 901.22', 'CARs Part IX'],
    relatedPolicies: ['1005'],
    keywords: ['weather', 'NOTAM', 'conditions', 'pre-flight', 'safety'],
    equipmentRequired: [
      'Windy App',
      'NavCanada CFPS',
      'Internet access'
    ],
    personnelRequired: ['Pilot in Command'],
    steps: [
      {
        stepNumber: 1,
        action: 'Check Windy',
        details: 'Open Windy, click on the VFR airspaces map (bottom right of map).',
        notes: null,
        cautions: null,
        checkpoints: ['Windy accessed']
      },
      {
        stepNumber: 2,
        action: 'Assess weather conditions',
        details: 'Using the known flight location, assess weather conditions based on Windy.',
        notes: null,
        cautions: 'Ensure conditions are within operational limits.',
        checkpoints: ['Weather assessed']
      },
      {
        stepNumber: 3,
        action: 'Open CFPS',
        details: 'Open NavCanada CFPS and click on File a Flight Plan.',
        notes: null,
        cautions: null,
        checkpoints: ['CFPS accessed']
      },
      {
        stepNumber: 4,
        action: 'Check Weather and NOTAM',
        details: 'Click on Weather and NOTAM section.',
        notes: null,
        cautions: null,
        checkpoints: ['Weather and NOTAM section accessed']
      },
      {
        stepNumber: 5,
        action: 'Enter weather stations',
        details: 'Enter the nearest (use multiple if applicable) aeronautical weather station. Enable: Radar, Graphical Forecast, Significant Weather, Wind.',
        notes: null,
        cautions: null,
        checkpoints: ['Weather data retrieved', 'NOTAMs reviewed']
      }
    ]
  },

  'GP-004': {
    id: 'proc-gp-004',
    number: 'GP-004',
    title: 'Team Briefing Flow',
    category: 'general',
    description: 'Align crew on objectives, roles, safety, and conditions before flight.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Pilot in Command',
    status: 'active',
    regulatoryRefs: ['CARs 901.71'],
    relatedPolicies: ['1013', '1014'],
    keywords: ['briefing', 'crew', 'safety', 'communication', 'pre-flight'],
    equipmentRequired: ['Operational Plan', 'Site Survey', 'Emergency Plan'],
    personnelRequired: ['Pilot in Command', 'Visual Observer', 'Support Crew'],
    steps: [
      {
        stepNumber: 1,
        action: 'Operation overview',
        details: 'Review objectives, expected outcomes, and potential challenges.',
        notes: null,
        cautions: null,
        checkpoints: ['Objectives understood']
      },
      {
        stepNumber: 2,
        action: 'Role assignment',
        details: 'Assign and confirm roles: PIC, VO, support personnel.',
        notes: null,
        cautions: null,
        checkpoints: ['Roles assigned and confirmed']
      },
      {
        stepNumber: 3,
        action: 'Safety review',
        details: 'Review hazards, emergency plans, and communication protocols.',
        notes: null,
        cautions: null,
        checkpoints: ['Safety briefing complete']
      },
      {
        stepNumber: 4,
        action: 'Weather update',
        details: 'Review current and forecast weather conditions.',
        notes: null,
        cautions: null,
        checkpoints: ['Weather confirmed acceptable']
      },
      {
        stepNumber: 5,
        action: 'Workload check',
        details: 'Confirm crew capacity and adjust assignments if needed.',
        notes: null,
        cautions: null,
        checkpoints: ['Crew capacity confirmed']
      }
    ]
  },

  'GP-005': {
    id: 'proc-gp-005',
    number: 'GP-005',
    title: 'Site Setup Flow',
    category: 'general',
    description: 'Prepare and secure the operation area for safe RPAS activities that day.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Pilot in Command',
    status: 'active',
    regulatoryRefs: ['CARs Part IX', 'OH&S Regulations'],
    relatedPolicies: ['1024'],
    keywords: ['site', 'setup', 'perimeter', 'safety', 'comms'],
    equipmentRequired: [
      'Radios',
      'First aid kit',
      'Fire extinguisher',
      'Perimeter markers',
      'PPE'
    ],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Inspect the area',
        details: 'Identify obstacles and hazards in the operational area.',
        notes: null,
        cautions: null,
        checkpoints: ['Area inspected']
      },
      {
        stepNumber: 2,
        action: 'Establish perimeter',
        details: 'Mark launch and recovery zone with appropriate markers.',
        notes: null,
        cautions: null,
        checkpoints: ['Perimeter established']
      },
      {
        stepNumber: 3,
        action: 'Set up communications',
        details: 'Test radios and backup communication channels.',
        notes: null,
        cautions: null,
        checkpoints: ['Communications verified']
      },
      {
        stepNumber: 4,
        action: 'Position emergency gear',
        details: 'Position first aid kit and fire extinguisher in accessible locations.',
        notes: null,
        cautions: null,
        checkpoints: ['Emergency equipment positioned']
      },
      {
        stepNumber: 5,
        action: 'Check NOTAMs',
        details: 'Final NOTAM check for any last-minute airspace changes.',
        notes: null,
        cautions: null,
        checkpoints: ['NOTAMs verified']
      },
      {
        stepNumber: 6,
        action: 'Tailgate Meeting',
        details: 'Review the Operation Plan, safety findings, amendments based on on-site inspection, confirm the NavCanada flight plan submitted.',
        notes: null,
        cautions: null,
        checkpoints: ['Tailgate meeting complete']
      }
    ]
  },

  'GP-006': {
    id: 'proc-gp-006',
    number: 'GP-006',
    title: 'RPAS Setup Flow',
    category: 'general',
    description: 'Assemble and verify RPAS systems are ready for flight.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Pilot in Command',
    status: 'active',
    regulatoryRefs: ['CARs 901.29', 'Manufacturer Guidelines'],
    relatedPolicies: ['1003', '1009'],
    keywords: ['RPAS', 'setup', 'assembly', 'calibration', 'pre-flight'],
    equipmentRequired: ['RPAS', 'Batteries', 'Payloads', 'Ground control station'],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Assemble RPAS',
        details: 'Secure all components properly.',
        notes: null,
        cautions: 'Ensure all connections are secure.',
        checkpoints: ['RPAS assembled']
      },
      {
        stepNumber: 2,
        action: 'Calibrate sensors',
        details: 'Calibrate compass, IMU, and payloads as required.',
        notes: null,
        cautions: 'Perform calibration away from metal objects.',
        checkpoints: ['Sensors calibrated']
      },
      {
        stepNumber: 3,
        action: 'System check',
        details: 'Verify GPS, communications, and telemetry systems.',
        notes: null,
        cautions: null,
        checkpoints: ['Systems verified']
      },
      {
        stepNumber: 4,
        action: 'Battery check',
        details: 'Confirm full charge and no visible damage.',
        notes: null,
        cautions: 'Do not use damaged or swollen batteries.',
        checkpoints: ['Battery condition verified']
      },
      {
        stepNumber: 5,
        action: 'RPAS Serviceability',
        details: 'Verify maintenance requirements have been adhered to.',
        notes: null,
        cautions: null,
        checkpoints: ['Maintenance compliance verified']
      },
      {
        stepNumber: 6,
        action: 'Final inspection',
        details: 'Confirm RPAS is airworthy and ready for flight.',
        notes: null,
        cautions: null,
        checkpoints: ['RPAS airworthy']
      }
    ]
  },

  'GP-007': {
    id: 'proc-gp-007',
    number: 'GP-007',
    title: 'Records Checklist',
    category: 'general',
    description: 'Confirm all operational data is logged and synced for compliance and review.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Pilot in Command',
    status: 'active',
    regulatoryRefs: ['CARs Part IX'],
    relatedPolicies: ['1045'],
    keywords: ['records', 'logging', 'compliance', 'AirData', 'documentation'],
    equipmentRequired: ['AirData Platform', 'Ground control station'],
    personnelRequired: ['Pilot in Command'],
    steps: [
      {
        stepNumber: 1,
        action: 'Verify pilot credentials',
        details: 'Confirm pilot credentials are logged in the system.',
        notes: null,
        cautions: null,
        checkpoints: ['Credentials verified']
      },
      {
        stepNumber: 2,
        action: 'Confirm AirData sync',
        details: 'Verify AirData is synced with ground control.',
        notes: null,
        cautions: null,
        checkpoints: ['AirData synced']
      },
      {
        stepNumber: 3,
        action: 'Check flight logs',
        details: 'Confirm flight logs are recorded correctly.',
        notes: null,
        cautions: null,
        checkpoints: ['Flight logs verified']
      },
      {
        stepNumber: 4,
        action: 'Maintenance records',
        details: 'Ensure maintenance records are updated.',
        notes: null,
        cautions: null,
        checkpoints: ['Maintenance records current']
      },
      {
        stepNumber: 5,
        action: 'Save/backup documentation',
        details: 'Save and backup all mission documentation.',
        notes: null,
        cautions: null,
        checkpoints: ['Documentation backed up']
      }
    ]
  },

  'GP-008': {
    id: 'proc-gp-008',
    number: 'GP-008',
    title: 'Operations Ready Checklist',
    category: 'general',
    description: 'Final confirmation that crew, equipment, and systems are ready for flight.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Pilot in Command',
    status: 'active',
    regulatoryRefs: ['CARs Part IX'],
    relatedPolicies: ['1001', '1002'],
    keywords: ['ready', 'checklist', 'final', 'pre-flight', 'verification'],
    equipmentRequired: ['RPAS', 'Ground control station', 'Communication equipment'],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Confirm crew present',
        details: 'Verify all crew members are present and roles are understood.',
        notes: null,
        cautions: null,
        checkpoints: ['All crew present']
      },
      {
        stepNumber: 2,
        action: 'Verify communications',
        details: 'Confirm communication systems are working.',
        notes: null,
        cautions: null,
        checkpoints: ['Communications verified']
      },
      {
        stepNumber: 3,
        action: 'RPAS status',
        details: 'Ensure RPAS is assembled, inspected, and functional.',
        notes: null,
        cautions: null,
        checkpoints: ['RPAS ready']
      },
      {
        stepNumber: 4,
        action: 'Battery status',
        details: 'Check batteries are installed and charged.',
        notes: null,
        cautions: null,
        checkpoints: ['Batteries ready']
      },
      {
        stepNumber: 5,
        action: 'Safety equipment',
        details: 'Confirm safety gear and emergency plans are in place.',
        notes: null,
        cautions: null,
        checkpoints: ['Safety equipment ready']
      }
    ]
  },

  'GP-009': {
    id: 'proc-gp-009',
    number: 'GP-009',
    title: 'Power-Up Flow',
    category: 'general',
    description: 'Sequence for safely powering ground control and RPAS systems.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Pilot in Command',
    status: 'active',
    regulatoryRefs: ['Manufacturer Guidelines'],
    relatedPolicies: ['1003'],
    keywords: ['power', 'startup', 'ground control', 'RPAS', 'sequence'],
    equipmentRequired: ['RPAS', 'Ground control station', 'AirData App'],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Power ground control first',
        details: 'Turn on the ground control station before the RPAS.',
        notes: null,
        cautions: null,
        checkpoints: ['Ground control powered']
      },
      {
        stepNumber: 2,
        action: 'Announce RPAS ON',
        details: 'Verbally announce "RPAS ON" to alert crew.',
        notes: null,
        cautions: null,
        checkpoints: ['Crew notified']
      },
      {
        stepNumber: 3,
        action: 'Power RPAS',
        details: 'Power on RPAS and onboard systems.',
        notes: null,
        cautions: null,
        checkpoints: ['RPAS powered']
      },
      {
        stepNumber: 4,
        action: 'Confirm system startup',
        details: 'Verify system startup completes without errors.',
        notes: null,
        cautions: 'Do not proceed if errors are displayed.',
        checkpoints: ['No errors on startup']
      },
      {
        stepNumber: 5,
        action: 'Establish ground control link',
        details: 'Verify connection between RPAS and ground control.',
        notes: null,
        cautions: null,
        checkpoints: ['Link established']
      },
      {
        stepNumber: 6,
        action: 'Test systems',
        details: 'Test gimbal, payload, telemetry, and video feed.',
        notes: null,
        cautions: null,
        checkpoints: ['All systems functional']
      },
      {
        stepNumber: 7,
        action: 'Verify failsafe settings',
        details: 'Confirm failsafe settings match the operation plan.',
        notes: null,
        cautions: null,
        checkpoints: ['Failsafe verified']
      },
      {
        stepNumber: 8,
        action: 'Verify AirData App',
        details: 'Confirm AirData App is on. If not, refer to the take-off checklist.',
        notes: null,
        cautions: null,
        checkpoints: ['AirData ready']
      },
      {
        stepNumber: 9,
        action: 'Inform VO',
        details: 'Tell VO: "Ready for Take-off Checklist."',
        notes: null,
        cautions: null,
        checkpoints: ['VO notified']
      }
    ]
  },

  'GP-010': {
    id: 'proc-gp-010',
    number: 'GP-010',
    title: 'Take-Off Checklist',
    category: 'general',
    description: 'VO and PIC call-and-response to confirm readiness before launch.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Pilot in Command',
    status: 'active',
    regulatoryRefs: ['CARs Part IX'],
    relatedPolicies: ['1001', '1006'],
    keywords: ['takeoff', 'checklist', 'call-response', 'pre-flight', 'launch'],
    equipmentRequired: ['RPAS', 'Ground control station', 'AirData App'],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Note time',
        details: 'PIC: "Take note of time" — VO writes down time.',
        notes: null,
        cautions: null,
        checkpoints: ['Time recorded']
      },
      {
        stepNumber: 2,
        action: 'Wind & weather',
        details: 'VO: "Wind & weather" — PIC confirms "Within limits."',
        notes: null,
        cautions: 'Abort if conditions exceed limits.',
        checkpoints: ['Weather confirmed']
      },
      {
        stepNumber: 3,
        action: 'Air vehicle batteries',
        details: 'VO: "Air vehicle batteries" — PIC reads percentage/bars.',
        notes: null,
        cautions: null,
        checkpoints: ['Battery level confirmed']
      },
      {
        stepNumber: 4,
        action: 'Ground control batteries',
        details: 'VO: "Ground control batteries" — PIC reads percentage.',
        notes: null,
        cautions: null,
        checkpoints: ['GCS battery confirmed']
      },
      {
        stepNumber: 5,
        action: 'Ground control app',
        details: 'VO: "Ground control app" — PIC confirms status OK.',
        notes: null,
        cautions: null,
        checkpoints: ['App status OK']
      },
      {
        stepNumber: 6,
        action: 'Payload',
        details: 'VO: "Payload" — PIC confirms connected/clear.',
        notes: null,
        cautions: null,
        checkpoints: ['Payload confirmed']
      },
      {
        stepNumber: 7,
        action: 'Failsafe',
        details: 'VO: "Failsafe" — PIC states mode, RTL altitude, limits.',
        notes: null,
        cautions: null,
        checkpoints: ['Failsafe settings confirmed']
      },
      {
        stepNumber: 8,
        action: 'Take-off mode',
        details: 'VO: "Take-off mode" — PIC confirms P-GPS (loiter).',
        notes: null,
        cautions: null,
        checkpoints: ['Flight mode confirmed']
      },
      {
        stepNumber: 9,
        action: 'Area & air traffic',
        details: 'VO: "Area & air traffic" — PIC reports clear.',
        notes: null,
        cautions: null,
        checkpoints: ['Airspace clear']
      },
      {
        stepNumber: 10,
        action: 'Cleared for takeoff',
        details: 'VO: "Cleared for takeoff" — PIC responds "CLEAR."',
        notes: null,
        cautions: null,
        checkpoints: ['Takeoff authorized']
      }
    ]
  },

  'GP-011': {
    id: 'proc-gp-011',
    number: 'GP-011',
    title: 'Take-Off Flow',
    category: 'general',
    description: 'Steps to safely launch and verify RPAS flight readiness.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Pilot in Command',
    status: 'active',
    regulatoryRefs: ['CARs Part IX'],
    relatedPolicies: ['1001'],
    keywords: ['takeoff', 'launch', 'ascend', 'flight', 'startup'],
    equipmentRequired: ['RPAS', 'Ground control station'],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Engage motors',
        details: 'Engage motors and initiate takeoff.',
        notes: null,
        cautions: 'Ensure launch area is clear.',
        checkpoints: ['Motors engaged']
      },
      {
        stepNumber: 2,
        action: 'Monitor telemetry',
        details: 'Watch telemetry for any errors during ascent.',
        notes: null,
        cautions: 'Abort if errors appear.',
        checkpoints: ['Telemetry normal']
      },
      {
        stepNumber: 3,
        action: 'Ascend to hover',
        details: 'Ascend to safe hover altitude.',
        notes: null,
        cautions: null,
        checkpoints: ['Hover altitude reached']
      },
      {
        stepNumber: 4,
        action: 'Visual/audible check',
        details: 'Conduct visual and audible check for any concerns.',
        notes: 'Listen for unusual sounds.',
        cautions: null,
        checkpoints: ['No concerns noted']
      },
      {
        stepNumber: 5,
        action: 'Test movements',
        details: 'Test basic movements (attitude, control response).',
        notes: null,
        cautions: null,
        checkpoints: ['Controls responsive']
      },
      {
        stepNumber: 6,
        action: 'Continue mission',
        details: 'If stable and clear, continue with the mission.',
        notes: null,
        cautions: null,
        checkpoints: ['Mission commenced']
      }
    ]
  },

  'GP-012': {
    id: 'proc-gp-012',
    number: 'GP-012',
    title: 'Mid-Flight Flow',
    category: 'general',
    description: 'Maintain safe RPAS operation and situational awareness in flight.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Pilot in Command',
    status: 'active',
    regulatoryRefs: ['CARs Part IX'],
    relatedPolicies: ['1001', '1015'],
    keywords: ['in-flight', 'monitoring', 'situational awareness', 'telemetry'],
    equipmentRequired: ['RPAS', 'Ground control station', 'Communication equipment'],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Monitor telemetry',
        details: 'Continuously monitor telemetry and battery levels.',
        notes: null,
        cautions: null,
        checkpoints: ['Telemetry monitored']
      },
      {
        stepNumber: 2,
        action: 'Track position',
        details: 'Track RPAS position and flight path.',
        notes: null,
        cautions: null,
        checkpoints: ['Position tracked']
      },
      {
        stepNumber: 3,
        action: 'Adjust parameters',
        details: 'Adjust flight parameters as required.',
        notes: null,
        cautions: null,
        checkpoints: ['Parameters adjusted']
      },
      {
        stepNumber: 4,
        action: 'Maintain communications',
        details: 'Maintain constant communications with crew and VO.',
        notes: null,
        cautions: null,
        checkpoints: ['Communications maintained']
      },
      {
        stepNumber: 5,
        action: 'Watch for hazards',
        details: 'Monitor for hazards, air traffic, or weather changes.',
        notes: null,
        cautions: 'Be prepared to abort if conditions deteriorate.',
        checkpoints: ['Hazards monitored']
      },
      {
        stepNumber: 6,
        action: 'Follow mission plan',
        details: 'Follow the mission plan unless safety requires deviation.',
        notes: null,
        cautions: null,
        checkpoints: ['Mission plan followed']
      }
    ]
  },

  'GP-013': {
    id: 'proc-gp-013',
    number: 'GP-013',
    title: 'Approach Flow',
    category: 'general',
    description: 'Confirm conditions and prepare RPAS for safe approach.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Pilot in Command',
    status: 'active',
    regulatoryRefs: ['CARs Part IX'],
    relatedPolicies: ['1001'],
    keywords: ['approach', 'landing', 'descent', 'preparation'],
    equipmentRequired: ['RPAS', 'Ground control station'],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Verify landing area',
        details: 'Verify the landing area is clear and secure.',
        notes: null,
        cautions: null,
        checkpoints: ['Landing area clear']
      },
      {
        stepNumber: 2,
        action: 'Check battery levels',
        details: 'Confirm battery levels are sufficient for descent.',
        notes: null,
        cautions: 'Expedite landing if battery is low.',
        checkpoints: ['Battery sufficient']
      },
      {
        stepNumber: 3,
        action: 'Review weather',
        details: 'Review weather for any landing impact.',
        notes: null,
        cautions: null,
        checkpoints: ['Weather reviewed']
      },
      {
        stepNumber: 4,
        action: 'Announce approach',
        details: 'Announce landing intent to crew/VO: "Drone On Approach".',
        notes: null,
        cautions: null,
        checkpoints: ['Approach announced']
      },
      {
        stepNumber: 5,
        action: 'Position RPAS',
        details: 'Position RPAS for controlled approach.',
        notes: null,
        cautions: null,
        checkpoints: ['RPAS positioned']
      }
    ]
  },

  'GP-014': {
    id: 'proc-gp-014',
    number: 'GP-014',
    title: 'Landing Flow',
    category: 'general',
    description: 'Actions to take in the landing sequence and once RPAS has safely landed.',
    version: '1.0',
    effectiveDate: '2025-10-16',
    reviewDate: '2026-02-01',
    owner: 'Pilot in Command',
    status: 'active',
    regulatoryRefs: ['CARs Part IX'],
    relatedPolicies: ['1001'],
    keywords: ['landing', 'touchdown', 'power down', 'secure'],
    equipmentRequired: ['RPAS', 'Ground control station'],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Guide RPAS',
        details: 'Guide the RPA into the predetermined landing column or along the designated landing route.',
        notes: null,
        cautions: null,
        checkpoints: ['On landing path']
      },
      {
        stepNumber: 2,
        action: 'Land RPAS',
        details: 'Land RPA slowly and with control.',
        notes: null,
        cautions: 'Maintain control throughout descent.',
        checkpoints: ['Landed safely']
      },
      {
        stepNumber: 3,
        action: 'Power down',
        details: 'Once landed, power down immediately.',
        notes: null,
        cautions: null,
        checkpoints: ['Powered down']
      },
      {
        stepNumber: 4,
        action: 'Announce clear',
        details: 'Once powered down and ground control station is cleared of input, state "Clear to Approach".',
        notes: null,
        cautions: null,
        checkpoints: ['Clear announced']
      },
      {
        stepNumber: 5,
        action: 'Secure RPAS',
        details: 'Secure the RPAS.',
        notes: null,
        cautions: null,
        checkpoints: ['RPAS secured']
      },
      {
        stepNumber: 6,
        action: 'Note time',
        details: 'Record landing time.',
        notes: null,
        cautions: null,
        checkpoints: ['Time recorded']
      }
    ]
  },

  'GP-015': {
    id: 'proc-gp-015',
    number: 'GP-015',
    title: 'Battery Swap Flow',
    category: 'general',
    description: 'Safely exchange depleted RPAS batteries and prepare for continued flight.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Pilot in Command',
    status: 'active',
    regulatoryRefs: ['Manufacturer Guidelines'],
    relatedPolicies: ['1003', '1009'],
    keywords: ['battery', 'swap', 'exchange', 'replacement', 'multi-flight'],
    equipmentRequired: ['RPAS', 'Charged batteries', 'Battery storage'],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Land and disarm',
        details: 'Land RPAS and disarm motors.',
        notes: null,
        cautions: null,
        checkpoints: ['Motors disarmed']
      },
      {
        stepNumber: 2,
        action: 'Announce safe',
        details: 'PIC announces "Safe for approach."',
        notes: null,
        cautions: null,
        checkpoints: ['Safe announced']
      },
      {
        stepNumber: 3,
        action: 'VO approaches',
        details: 'VO approaches and removes the depleted battery.',
        notes: null,
        cautions: 'Handle batteries carefully.',
        checkpoints: ['Battery removed']
      },
      {
        stepNumber: 4,
        action: 'Inspect RPAS',
        details: 'VO inspects RPAS (rotors, body, connectors).',
        notes: null,
        cautions: null,
        checkpoints: ['Inspection complete']
      },
      {
        stepNumber: 5,
        action: 'Install new battery',
        details: 'Install a fully charged battery.',
        notes: null,
        cautions: 'Ensure battery is properly seated.',
        checkpoints: ['Battery installed']
      },
      {
        stepNumber: 6,
        action: 'VO steps back',
        details: 'VO steps back and announces "Ready for pre-flight."',
        notes: null,
        cautions: null,
        checkpoints: ['VO clear']
      },
      {
        stepNumber: 7,
        action: 'Pre-flight checklist',
        details: 'PIC requests the pre-flight checklist before the next launch.',
        notes: null,
        cautions: null,
        checkpoints: ['Pre-flight requested']
      }
    ]
  },

  'GP-016': {
    id: 'proc-gp-016',
    number: 'GP-016',
    title: 'Post-Flight Flow',
    category: 'general',
    description: 'Secure RPAS and complete checks after landing.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Pilot in Command',
    status: 'active',
    regulatoryRefs: ['CARs Part IX'],
    relatedPolicies: ['1003', '1009'],
    keywords: ['post-flight', 'inspection', 'debrief', 'logging'],
    equipmentRequired: ['RPAS', 'AirData Platform'],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Land and disarm',
        details: 'Land RPAS and disarm motors.',
        notes: null,
        cautions: null,
        checkpoints: ['Motors disarmed']
      },
      {
        stepNumber: 2,
        action: 'Announce safe',
        details: 'PIC announces "Safe for approach."',
        notes: null,
        cautions: null,
        checkpoints: ['Safe announced']
      },
      {
        stepNumber: 3,
        action: 'Remove batteries',
        details: 'VO removes batteries and powers down systems.',
        notes: null,
        cautions: null,
        checkpoints: ['Batteries removed']
      },
      {
        stepNumber: 4,
        action: 'Post-flight inspection',
        details: 'Conduct post-flight inspection for damage/wear.',
        notes: null,
        cautions: null,
        checkpoints: ['Inspection complete']
      },
      {
        stepNumber: 5,
        action: 'Record flight details',
        details: 'Record flight details in log and AirData.',
        notes: null,
        cautions: null,
        checkpoints: ['Flight logged']
      },
      {
        stepNumber: 6,
        action: 'Debrief crew',
        details: 'Debrief crew on performance and any issues.',
        notes: null,
        cautions: null,
        checkpoints: ['Debrief complete']
      },
      {
        stepNumber: 7,
        action: 'Pack equipment',
        details: 'Pack and secure all equipment.',
        notes: null,
        cautions: null,
        checkpoints: ['Equipment packed']
      }
    ]
  },

  'GP-017': {
    id: 'proc-gp-017',
    number: 'GP-017',
    title: 'Pack-Up Flow',
    category: 'general',
    description: 'Disassemble and secure all equipment after operations.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Visual Observer',
    status: 'active',
    regulatoryRefs: [],
    relatedPolicies: ['1003'],
    keywords: ['pack-up', 'disassembly', 'storage', 'cleanup'],
    equipmentRequired: ['Equipment cases', 'Inventory list'],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Disassemble RPAS',
        details: 'Disassemble RPAS and payloads.',
        notes: null,
        cautions: null,
        checkpoints: ['RPAS disassembled']
      },
      {
        stepNumber: 2,
        action: 'Collect gear',
        details: 'Collect and account for all gear.',
        notes: null,
        cautions: null,
        checkpoints: ['All gear collected']
      },
      {
        stepNumber: 3,
        action: 'Verify inventory',
        details: 'Verify inventory against kit list.',
        notes: null,
        cautions: null,
        checkpoints: ['Inventory verified']
      },
      {
        stepNumber: 4,
        action: 'Inspect before storage',
        details: 'Inspect equipment for damage before storage.',
        notes: null,
        cautions: 'Report any damage found.',
        checkpoints: ['Equipment inspected']
      },
      {
        stepNumber: 5,
        action: 'Pack securely',
        details: 'Pack all equipment securely in cases.',
        notes: null,
        cautions: null,
        checkpoints: ['Equipment packed']
      },
      {
        stepNumber: 6,
        action: 'Clear site',
        details: 'Clean and clear site of all materials and debris.',
        notes: null,
        cautions: null,
        checkpoints: ['Site cleared']
      }
    ]
  },

  'GP-018': {
    id: 'proc-gp-018',
    number: 'GP-018',
    title: 'Team Debrief Flow',
    category: 'general',
    description: 'Review mission performance and capture lessons learned.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Pilot in Command',
    status: 'active',
    regulatoryRefs: [],
    relatedPolicies: ['1014'],
    keywords: ['debrief', 'lessons learned', 'review', 'feedback'],
    equipmentRequired: [],
    personnelRequired: ['Pilot in Command', 'Visual Observer', 'Support Crew'],
    steps: [
      {
        stepNumber: 1,
        action: 'Confirm objectives',
        details: 'Confirm if mission objectives were met.',
        notes: null,
        cautions: null,
        checkpoints: ['Objectives reviewed']
      },
      {
        stepNumber: 2,
        action: 'Discuss issues',
        details: 'Discuss any issues or incidents encountered.',
        notes: null,
        cautions: null,
        checkpoints: ['Issues discussed']
      },
      {
        stepNumber: 3,
        action: 'Review situational awareness',
        details: 'Review any situational awareness challenges.',
        notes: null,
        cautions: null,
        checkpoints: ['SA challenges reviewed']
      },
      {
        stepNumber: 4,
        action: 'Gather feedback',
        details: 'Gather feedback from all team members.',
        notes: null,
        cautions: null,
        checkpoints: ['Feedback collected']
      },
      {
        stepNumber: 5,
        action: 'Note improvements',
        details: 'Note improvements for future operations.',
        notes: null,
        cautions: null,
        checkpoints: ['Improvements documented']
      }
    ]
  },

  'GP-019': {
    id: 'proc-gp-019',
    number: 'GP-019',
    title: 'Data Debrief Flow',
    category: 'general',
    description: 'Review and process collected data after operations.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Operations Manager',
    status: 'active',
    regulatoryRefs: [],
    relatedPolicies: ['1045'],
    keywords: ['data', 'processing', 'analysis', 'quality', 'reporting'],
    equipmentRequired: ['Data storage', 'Analysis software'],
    personnelRequired: ['Operations Manager', 'Data Analyst'],
    steps: [
      {
        stepNumber: 1,
        action: 'Transfer data',
        details: 'Transfer flight data from RPAS to storage.',
        notes: null,
        cautions: null,
        checkpoints: ['Data transferred']
      },
      {
        stepNumber: 2,
        action: 'Verify integrity',
        details: 'Verify data integrity and completeness.',
        notes: null,
        cautions: null,
        checkpoints: ['Data integrity verified']
      },
      {
        stepNumber: 3,
        action: 'Analyze data',
        details: 'Analyze data for quality and mission results.',
        notes: null,
        cautions: null,
        checkpoints: ['Analysis complete']
      },
      {
        stepNumber: 4,
        action: 'Document findings',
        details: 'Document findings and prepare reports.',
        notes: null,
        cautions: null,
        checkpoints: ['Findings documented']
      },
      {
        stepNumber: 5,
        action: 'Identify improvements',
        details: 'Identify improvements for future data collection.',
        notes: null,
        cautions: null,
        checkpoints: ['Improvements identified']
      }
    ]
  },

  'GP-020': {
    id: 'proc-gp-020',
    number: 'GP-020',
    title: 'Equipment Management Flow',
    category: 'general',
    description: 'Maintain RPAS equipment readiness through inspection, repair, and storage.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Maintenance Manager',
    status: 'active',
    regulatoryRefs: ['CARs 901.29', 'Manufacturer Guidelines'],
    relatedPolicies: ['1003', '1009'],
    keywords: ['maintenance', 'equipment', 'inspection', 'repair', 'storage'],
    equipmentRequired: ['Maintenance tools', 'AirData Platform'],
    personnelRequired: ['Maintenance Manager'],
    steps: [
      {
        stepNumber: 1,
        action: 'Schedule maintenance',
        details: 'Schedule regular maintenance checks.',
        notes: null,
        cautions: null,
        checkpoints: ['Maintenance scheduled']
      },
      {
        stepNumber: 2,
        action: 'Inspect equipment',
        details: 'Inspect equipment for wear or damage after use.',
        notes: null,
        cautions: null,
        checkpoints: ['Inspection complete']
      },
      {
        stepNumber: 3,
        action: 'Perform repairs',
        details: 'Perform required repairs or lock out defective gear.',
        notes: null,
        cautions: 'Do not use defective equipment.',
        checkpoints: ['Repairs complete or gear locked out']
      },
      {
        stepNumber: 4,
        action: 'Battery maintenance',
        details: 'Charge, cycle, and store batteries safely.',
        notes: null,
        cautions: 'Follow battery safety guidelines.',
        checkpoints: ['Batteries maintained']
      },
      {
        stepNumber: 5,
        action: 'Update logs',
        details: 'Update maintenance and service logs.',
        notes: null,
        cautions: null,
        checkpoints: ['Logs updated']
      },
      {
        stepNumber: 6,
        action: 'Prepare for next operation',
        details: 'Prepare equipment for next operation.',
        notes: null,
        cautions: null,
        checkpoints: ['Equipment ready']
      }
    ]
  },

  // ============================================
  // EMERGENCY PROCEDURES (EP-001 to EP-010)
  // ============================================

  'EP-001': {
    id: 'proc-ep-001',
    number: 'EP-001',
    title: 'Control Station Failure',
    category: 'emergency',
    description: 'Respond to loss of function or power at the RPAS control station.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['CARs 901.47-901.49'],
    relatedPolicies: ['1006'],
    keywords: ['emergency', 'control station', 'failure', 'RTH', 'power loss'],
    equipmentRequired: ['Backup control station', 'Power source'],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'RTH activates',
        details: 'RTH (Return to Home) should activate automatically.',
        notes: null,
        cautions: null,
        checkpoints: ['RTH activated']
      },
      {
        stepNumber: 2,
        action: 'Attempt restore',
        details: 'During RTH, attempt to restore control station power: toggle power off/on, connect to power source, switch to backup station if available.',
        notes: null,
        cautions: null,
        checkpoints: ['Restore attempted']
      },
      {
        stepNumber: 3,
        action: 'Prepare emergency landing',
        details: 'If control is not regained, prepare for an emergency landing.',
        notes: null,
        cautions: 'Monitor RTH progress.',
        checkpoints: ['Emergency landing prepared']
      },
      {
        stepNumber: 4,
        action: 'Land safely',
        details: 'If control is regained, land RPAS safely.',
        notes: null,
        cautions: null,
        checkpoints: ['RPAS landed']
      },
      {
        stepNumber: 5,
        action: 'Recover and lock out',
        details: 'Recover RPAS, lock out equipment until inspection is completed.',
        notes: null,
        cautions: null,
        checkpoints: ['Equipment locked out']
      },
      {
        stepNumber: 6,
        action: 'Log incident',
        details: 'Log the incident and investigate the cause.',
        notes: null,
        cautions: null,
        checkpoints: ['Incident logged']
      }
    ]
  },

  'EP-002': {
    id: 'proc-ep-002',
    number: 'EP-002',
    title: 'Ground Equipment Failure',
    category: 'emergency',
    description: 'Response to malfunction of support equipment (antennas, power supplies, monitors, etc.).',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['CARs Part IX'],
    relatedPolicies: ['1006'],
    keywords: ['emergency', 'ground equipment', 'malfunction', 'antenna', 'monitor'],
    equipmentRequired: ['Backup equipment'],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Identify failure',
        details: 'Identify the failed equipment.',
        notes: null,
        cautions: null,
        checkpoints: ['Failure identified']
      },
      {
        stepNumber: 2,
        action: 'Prepare return',
        details: 'Prepare RPAS for immediate return.',
        notes: null,
        cautions: null,
        checkpoints: ['Return initiated']
      },
      {
        stepNumber: 3,
        action: 'Adjust landing area',
        details: 'Adjust the landing area if needed.',
        notes: null,
        cautions: null,
        checkpoints: ['Landing area confirmed']
      },
      {
        stepNumber: 4,
        action: 'Land safely',
        details: 'Land RPAS safely.',
        notes: null,
        cautions: null,
        checkpoints: ['RPAS landed']
      },
      {
        stepNumber: 5,
        action: 'Lock out equipment',
        details: 'Lock out defective equipment.',
        notes: null,
        cautions: null,
        checkpoints: ['Equipment locked out']
      },
      {
        stepNumber: 6,
        action: 'Repair/replace',
        details: 'Repair or replace before resuming flight.',
        notes: null,
        cautions: null,
        checkpoints: ['Equipment repaired/replaced']
      },
      {
        stepNumber: 7,
        action: 'Log incident',
        details: 'Log incident and corrective action.',
        notes: null,
        cautions: null,
        checkpoints: ['Incident logged']
      }
    ]
  },

  'EP-003': {
    id: 'proc-ep-003',
    number: 'EP-003',
    title: 'RPAS Failure',
    category: 'emergency',
    description: 'Response to malfunction of RPAS systems (motors, sensors, comms, navigation).',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['CARs 901.47-901.49'],
    relatedPolicies: ['1006'],
    keywords: ['emergency', 'RPAS failure', 'malfunction', 'motor', 'sensor'],
    equipmentRequired: [],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Attempt RTH or manual',
        details: 'Attempt RTH or switch to manual mode.',
        notes: null,
        cautions: null,
        checkpoints: ['Recovery attempted']
      },
      {
        stepNumber: 2,
        action: 'Emergency landing if stable',
        details: 'If stable, initiate emergency landing.',
        notes: null,
        cautions: null,
        checkpoints: ['Emergency landing initiated']
      },
      {
        stepNumber: 3,
        action: 'Expect crash if uncontrollable',
        details: 'If uncontrollable (not a fly-away), expect crash and follow crash protocol.',
        notes: null,
        cautions: 'Prepare for crash recovery.',
        checkpoints: ['Crash protocol ready']
      },
      {
        stepNumber: 4,
        action: 'Secure site',
        details: 'After landing/crash, secure site and recover RPAS.',
        notes: null,
        cautions: 'Approach cautiously.',
        checkpoints: ['Site secured']
      },
      {
        stepNumber: 5,
        action: 'Lock out RPAS',
        details: 'Lock out RPAS until inspection/repair.',
        notes: null,
        cautions: null,
        checkpoints: ['RPAS locked out']
      },
      {
        stepNumber: 6,
        action: 'Log and investigate',
        details: 'Log the incident and investigate the cause.',
        notes: null,
        cautions: null,
        checkpoints: ['Investigation initiated']
      }
    ]
  },

  'EP-004': {
    id: 'proc-ep-004',
    number: 'EP-004',
    title: 'Crash Event',
    category: 'emergency',
    description: 'Steps to follow if RPAS impacts ground, structure, or object.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['CARs 901.47-901.49', 'TSB Regulations'],
    relatedPolicies: ['1006', '1007'],
    keywords: ['emergency', 'crash', 'impact', 'recovery', 'investigation'],
    equipmentRequired: ['First aid kit', 'Fire extinguisher'],
    personnelRequired: ['Pilot in Command', 'Visual Observer', 'Retrieval Team'],
    steps: [
      {
        stepNumber: 1,
        action: 'Notify crew',
        details: 'Notify crew of crash.',
        notes: null,
        cautions: null,
        checkpoints: ['Crew notified']
      },
      {
        stepNumber: 2,
        action: 'Maintain visual',
        details: 'Maintain visual contact with crash site if possible.',
        notes: null,
        cautions: null,
        checkpoints: ['Visual maintained']
      },
      {
        stepNumber: 3,
        action: 'VO scans area',
        details: 'VO scans area for RPAS (if BVLOS, monitor telemetry/location).',
        notes: null,
        cautions: null,
        checkpoints: ['Area scanned']
      },
      {
        stepNumber: 4,
        action: 'Prepare retrieval team',
        details: 'Prepare retrieval team with first aid kit and fire extinguisher.',
        notes: null,
        cautions: 'Be prepared for fire or injury.',
        checkpoints: ['Team prepared']
      },
      {
        stepNumber: 5,
        action: 'Recover RPAS',
        details: 'Recover RPAS only if safe to do so.',
        notes: null,
        cautions: 'Do not approach if fire or hazard present.',
        checkpoints: ['RPAS recovered']
      },
      {
        stepNumber: 6,
        action: 'Notify authorities',
        details: 'Notify authorities as per site/airspace requirements.',
        notes: null,
        cautions: null,
        checkpoints: ['Authorities notified']
      },
      {
        stepNumber: 7,
        action: 'Secure site',
        details: 'Secure RPAS and crash site for investigation.',
        notes: null,
        cautions: 'Preserve evidence.',
        checkpoints: ['Site secured']
      },
      {
        stepNumber: 8,
        action: 'Complete investigation',
        details: 'Log incident and complete full investigation.',
        notes: null,
        cautions: null,
        checkpoints: ['Investigation complete']
      }
    ]
  },

  'EP-005': {
    id: 'proc-ep-005',
    number: 'EP-005',
    title: 'Emergency Landing',
    category: 'emergency',
    description: 'Steps to bring RPAS down quickly and safely due to hazard or malfunction.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['CARs Part IX'],
    relatedPolicies: ['1006'],
    keywords: ['emergency', 'landing', 'hazard', 'malfunction', 'descent'],
    equipmentRequired: [],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Identify landing site',
        details: 'Identify safe landing site clear of people and structures.',
        notes: null,
        cautions: null,
        checkpoints: ['Site identified']
      },
      {
        stepNumber: 2,
        action: 'Announce emergency',
        details: 'Announce emergency landing to crew.',
        notes: null,
        cautions: null,
        checkpoints: ['Crew notified']
      },
      {
        stepNumber: 3,
        action: 'Execute landing',
        details: 'Execute landing promptly and under control.',
        notes: null,
        cautions: 'Prioritize safety over equipment.',
        checkpoints: ['Landing executed']
      },
      {
        stepNumber: 4,
        action: 'Secure and power down',
        details: 'Secure RPAS and power down.',
        notes: null,
        cautions: null,
        checkpoints: ['RPAS secured']
      },
      {
        stepNumber: 5,
        action: 'Inspect for damage',
        details: 'Inspect for damage before any reuse.',
        notes: null,
        cautions: null,
        checkpoints: ['Inspection complete']
      },
      {
        stepNumber: 6,
        action: 'Log incident',
        details: 'Log incident and corrective action.',
        notes: null,
        cautions: null,
        checkpoints: ['Incident logged']
      }
    ]
  },

  'EP-006': {
    id: 'proc-ep-006',
    number: 'EP-006',
    title: 'Fly-Away',
    category: 'emergency',
    description: 'Response to RPAS leaving operator control due to link, GPS, or system failure.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['CARs 901.47-901.49'],
    relatedPolicies: ['1006', '1007'],
    keywords: ['emergency', 'fly-away', 'lost control', 'GPS', 'link failure'],
    equipmentRequired: ['Communication equipment', 'Fly-away call script'],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Attempt to regain control',
        details: 'Attempt to regain control with sticks or mode change.',
        notes: null,
        cautions: null,
        checkpoints: ['Control attempted']
      },
      {
        stepNumber: 2,
        action: 'Activate failsafe',
        details: 'Activate failsafe/RTH if available.',
        notes: null,
        cautions: null,
        checkpoints: ['Failsafe activated']
      },
      {
        stepNumber: 3,
        action: 'Notify authorities',
        details: 'Notify airspace authorities immediately using fly-away call script.',
        notes: null,
        cautions: 'Time is critical.',
        checkpoints: ['Authorities notified']
      },
      {
        stepNumber: 4,
        action: 'Track RPAS',
        details: 'Track RPAS via telemetry/location data.',
        notes: null,
        cautions: null,
        checkpoints: ['Tracking active']
      },
      {
        stepNumber: 5,
        action: 'Estimate range',
        details: 'Estimate remaining battery/time and possible range.',
        notes: null,
        cautions: null,
        checkpoints: ['Range estimated']
      },
      {
        stepNumber: 6,
        action: 'Recover RPAS',
        details: 'Recover RPAS if safe and possible.',
        notes: null,
        cautions: null,
        checkpoints: ['Recovery attempted']
      },
      {
        stepNumber: 7,
        action: 'Lock out and investigate',
        details: 'Lock out RPAS until the inspection/investigation is complete.',
        notes: null,
        cautions: null,
        checkpoints: ['RPAS locked out']
      },
      {
        stepNumber: 8,
        action: 'File reports',
        details: 'Log the incident and file the required reports.',
        notes: null,
        cautions: null,
        checkpoints: ['Reports filed']
      }
    ]
  },

  'EP-007': {
    id: 'proc-ep-007',
    number: 'EP-007',
    title: 'Flight Termination',
    category: 'emergency',
    description: 'Deliberate shutdown of RPAS in emergency to prevent greater risk.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['CARs Part IX'],
    relatedPolicies: ['1006'],
    keywords: ['emergency', 'termination', 'shutdown', 'deliberate', 'risk mitigation'],
    equipmentRequired: ['Fire extinguisher', 'Recovery gear'],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Move to safe area',
        details: 'Move RPAS toward safe area away from people/property.',
        notes: null,
        cautions: null,
        checkpoints: ['RPAS repositioned']
      },
      {
        stepNumber: 2,
        action: 'Announce termination',
        details: 'Announce termination to crew.',
        notes: null,
        cautions: null,
        checkpoints: ['Crew notified']
      },
      {
        stepNumber: 3,
        action: 'Reduce altitude',
        details: 'Reduce altitude to lowest safe level.',
        notes: null,
        cautions: null,
        checkpoints: ['Altitude reduced']
      },
      {
        stepNumber: 4,
        action: 'Reduce speed',
        details: 'Reduce speed to minimum.',
        notes: null,
        cautions: null,
        checkpoints: ['Speed reduced']
      },
      {
        stepNumber: 5,
        action: 'Initiate termination',
        details: 'Initiate shutdown/termination command.',
        notes: null,
        cautions: 'Last resort action.',
        checkpoints: ['Termination initiated']
      },
      {
        stepNumber: 6,
        action: 'Prepare recovery gear',
        details: 'Prepare fire extinguisher and recovery gear.',
        notes: null,
        cautions: null,
        checkpoints: ['Recovery gear ready']
      },
      {
        stepNumber: 7,
        action: 'Recover and secure',
        details: 'Recover RPAS and secure site.',
        notes: null,
        cautions: 'Approach cautiously.',
        checkpoints: ['Site secured']
      },
      {
        stepNumber: 8,
        action: 'Log and investigate',
        details: 'Log incident and investigate the cause.',
        notes: null,
        cautions: null,
        checkpoints: ['Investigation initiated']
      }
    ]
  },

  'EP-008': {
    id: 'proc-ep-008',
    number: 'EP-008',
    title: 'Communication Failure',
    category: 'emergency',
    description: 'Loss of telemetry, video, or status data between RPAS and control station.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['CARs Part IX'],
    relatedPolicies: ['1006', '1021'],
    keywords: ['emergency', 'communication', 'telemetry', 'video', 'data loss'],
    equipmentRequired: [],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Take manual control',
        details: 'Take manual control if available.',
        notes: null,
        cautions: null,
        checkpoints: ['Manual control attempted']
      },
      {
        stepNumber: 2,
        action: 'Notify crew',
        details: 'Notify crew/VO of comms failure.',
        notes: null,
        cautions: null,
        checkpoints: ['Crew notified']
      },
      {
        stepNumber: 3,
        action: 'Reduce altitude',
        details: 'Reduce altitude to safe height.',
        notes: null,
        cautions: null,
        checkpoints: ['Altitude reduced']
      },
      {
        stepNumber: 4,
        action: 'Navigate to landing',
        details: 'Navigate back to landing zone.',
        notes: null,
        cautions: null,
        checkpoints: ['Returning to landing zone']
      },
      {
        stepNumber: 5,
        action: 'Land and power down',
        details: 'Land RPAS and power down.',
        notes: null,
        cautions: null,
        checkpoints: ['RPAS landed']
      },
      {
        stepNumber: 6,
        action: 'Inspect equipment',
        details: 'Inspect comms equipment before resuming flight.',
        notes: null,
        cautions: null,
        checkpoints: ['Equipment inspected']
      },
      {
        stepNumber: 7,
        action: 'Log incident',
        details: 'Log incident and corrective action.',
        notes: null,
        cautions: null,
        checkpoints: ['Incident logged']
      }
    ]
  },

  'EP-009': {
    id: 'proc-ep-009',
    number: 'EP-009',
    title: 'Command and Control Link Failure',
    category: 'emergency',
    description: 'Loss of primary control link between RPAS and control station.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['CARs Part IX'],
    relatedPolicies: ['1006'],
    keywords: ['emergency', 'C2 link', 'control link', 'failsafe', 'RTH'],
    equipmentRequired: [],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Attempt re-establish',
        details: 'Attempt to re-establish link (toggle channels/frequencies).',
        notes: null,
        cautions: null,
        checkpoints: ['Re-establish attempted']
      },
      {
        stepNumber: 2,
        action: 'Notify crew',
        details: 'Notify crew/VO of failure.',
        notes: null,
        cautions: null,
        checkpoints: ['Crew notified']
      },
      {
        stepNumber: 3,
        action: 'Activate failsafe',
        details: 'If link not restored, activate fail-safe (RTH, hover, land).',
        notes: null,
        cautions: null,
        checkpoints: ['Failsafe activated']
      },
      {
        stepNumber: 4,
        action: 'Monitor RPAS',
        details: 'Monitor RPAS visually or via telemetry if available.',
        notes: null,
        cautions: null,
        checkpoints: ['Monitoring active']
      },
      {
        stepNumber: 5,
        action: 'Prepare emergency landing',
        details: 'Prepare for emergency landing if safe.',
        notes: null,
        cautions: null,
        checkpoints: ['Emergency landing prepared']
      },
      {
        stepNumber: 6,
        action: 'Lock out after recovery',
        details: 'After recovery, lock out RPAS until inspection completed.',
        notes: null,
        cautions: null,
        checkpoints: ['RPAS locked out']
      },
      {
        stepNumber: 7,
        action: 'Log and investigate',
        details: 'Log incident and investigate cause.',
        notes: null,
        cautions: null,
        checkpoints: ['Investigation initiated']
      }
    ]
  },

  'EP-010': {
    id: 'proc-ep-010',
    number: 'EP-010',
    title: 'Unintended Loss of Visual Contact',
    category: 'emergency',
    description: 'Steps to follow if PIC or VO unexpectedly loses sight of the RPAS.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['CARs 901.70', 'CARs 901.71'],
    relatedPolicies: ['1006', '1015'],
    keywords: ['emergency', 'visual contact', 'lost sight', 'VLOS', 'recovery'],
    equipmentRequired: [],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Notify crew',
        details: 'PIC immediately notifies VO/Crew.',
        notes: null,
        cautions: null,
        checkpoints: ['Crew notified']
      },
      {
        stepNumber: 2,
        action: 'Use telemetry',
        details: 'Use telemetry to locate RPAS position.',
        notes: null,
        cautions: null,
        checkpoints: ['Position located']
      },
      {
        stepNumber: 3,
        action: 'Increase altitude',
        details: 'Increase altitude if safe to clear obstacles.',
        notes: null,
        cautions: 'Check for overhead hazards.',
        checkpoints: ['Altitude increased']
      },
      {
        stepNumber: 4,
        action: 'Attempt visual',
        details: 'Attempt to regain visual contact.',
        notes: null,
        cautions: null,
        checkpoints: ['Visual attempted']
      },
      {
        stepNumber: 5,
        action: 'Initiate RTH',
        details: 'If visual not regained, initiate RTH.',
        notes: null,
        cautions: null,
        checkpoints: ['RTH initiated']
      },
      {
        stepNumber: 6,
        action: 'Continue search',
        details: 'Continue search until visual is established or RPAS landed.',
        notes: null,
        cautions: null,
        checkpoints: ['Search continued']
      },
      {
        stepNumber: 7,
        action: 'Inspect and log',
        details: 'After recovery, inspect RPAS and log the incident.',
        notes: null,
        cautions: null,
        checkpoints: ['Incident logged']
      }
    ]
  },

  'EP-011': {
    id: 'proc-ep-011',
    number: 'EP-011',
    title: 'Inadvertent Entry into Restricted Airspace',
    category: 'emergency',
    description: 'Steps to follow if RPAS is no longer under control and is or is likely to enter Class F Restricted Airspace.',
    version: '1.0',
    effectiveDate: '2025-10-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['CARs Part IX', 'CARs 901.64'],
    relatedPolicies: ['1003', '1006'],
    keywords: ['emergency', 'restricted airspace', 'Class F', 'ATC', 'inadvertent entry'],
    equipmentRequired: ['Communication equipment'],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Notify crew',
        details: 'PIC immediately notifies VO/Crew.',
        notes: null,
        cautions: null,
        checkpoints: ['Crew notified']
      },
      {
        stepNumber: 2,
        action: 'Attempt control',
        details: 'Continue to attempt to regain control of the RPAS.',
        notes: null,
        cautions: null,
        checkpoints: ['Control attempted']
      },
      {
        stepNumber: 3,
        action: 'Contact ATC',
        details: 'Immediately contact the Air Traffic Control Unit, Flight Service Station, or User Agency to notify them of the RPA behaviour and location.',
        notes: null,
        cautions: 'Time is critical.',
        checkpoints: ['ATC contacted']
      }
    ]
  },

  // ============================================
  // ADVANCED PROCEDURES (AP-001 to AP-008)
  // ============================================

  'AP-001': {
    id: 'proc-ap-001',
    number: 'AP-001',
    title: 'Entering/Exiting BVLOS Communications',
    category: 'advanced',
    description: 'Standard callouts and confirmations for safe transition into and out of BVLOS flight.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['CARs 901.62', 'CARs 903.02', 'AC 903-001'],
    relatedPolicies: ['1012', '1021'],
    keywords: ['BVLOS', 'beyond visual', 'communications', 'transition', 'advanced'],
    equipmentRequired: ['RPAS', 'Ground control station', 'Communication equipment'],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Entry - PIC announces',
        details: 'PIC: "Entering BVLOS."',
        notes: null,
        cautions: null,
        checkpoints: ['Entry announced']
      },
      {
        stepNumber: 2,
        action: 'Entry - VO confirms',
        details: 'VO: "Ready for BVLOS."',
        notes: null,
        cautions: null,
        checkpoints: ['VO ready']
      },
      {
        stepNumber: 3,
        action: 'Entry - PIC eyes in',
        details: 'PIC: "Eyes in." (focusing on telemetry)',
        notes: null,
        cautions: null,
        checkpoints: ['PIC focused on instruments']
      },
      {
        stepNumber: 4,
        action: 'Entry - VO eyes out',
        details: 'VO: "Eyes out." (scanning airspace)',
        notes: null,
        cautions: null,
        checkpoints: ['VO scanning']
      },
      {
        stepNumber: 5,
        action: 'During BVLOS - PIC reports',
        details: 'PIC reports telemetry (battery, range, alerts) on request.',
        notes: null,
        cautions: null,
        checkpoints: ['Telemetry reported']
      },
      {
        stepNumber: 6,
        action: 'During BVLOS - VO reports',
        details: 'VO reports airspace status (traffic, hazards).',
        notes: null,
        cautions: null,
        checkpoints: ['Airspace status reported']
      },
      {
        stepNumber: 7,
        action: 'During BVLOS - Check-ins',
        details: 'Maintain regular check-ins.',
        notes: null,
        cautions: null,
        checkpoints: ['Check-ins maintained']
      },
      {
        stepNumber: 8,
        action: 'Exit - PIC announces',
        details: 'PIC: "Exiting BVLOS."',
        notes: null,
        cautions: null,
        checkpoints: ['Exit announced']
      },
      {
        stepNumber: 9,
        action: 'Exit - VO confirms',
        details: 'VO: "Visual contact regained."',
        notes: null,
        cautions: null,
        checkpoints: ['Visual regained']
      },
      {
        stepNumber: 10,
        action: 'Resume VLOS',
        details: 'Resume normal VLOS communications.',
        notes: null,
        cautions: null,
        checkpoints: ['VLOS comms resumed']
      }
    ]
  },

  'AP-002': {
    id: 'proc-ap-002',
    number: 'AP-002',
    title: 'Pilot Handover Communication',
    category: 'advanced',
    description: 'Standard call-and-response for transferring RPAS control between two qualified pilots while maintaining safety and situational awareness.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['CARs Part IX'],
    relatedPolicies: ['1013', '1016'],
    keywords: ['handover', 'transfer', 'pilot', 'control', 'advanced'],
    equipmentRequired: ['RPAS', 'Ground control station'],
    personnelRequired: ['Original Pilot in Command', 'Incoming Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Pre-conditions',
        details: 'Verify: Both pilots qualified and briefed. VO has eyes on RPAS. RPAS stable (hover or straight-and-level). Failsafe parameters verified.',
        notes: null,
        cautions: null,
        checkpoints: ['Pre-conditions met']
      },
      {
        stepNumber: 2,
        action: 'OPIC prepares',
        details: 'Current PIC (OPIC): "Stable - preparing handover."',
        notes: null,
        cautions: null,
        checkpoints: ['Handover announced']
      },
      {
        stepNumber: 3,
        action: 'VO confirms',
        details: 'VO: "Visual - airspace clear."',
        notes: null,
        cautions: null,
        checkpoints: ['VO confirmed']
      },
      {
        stepNumber: 4,
        action: 'OPIC states status',
        details: 'OPIC states: altitude, heading/hover, battery %, hazards.',
        notes: null,
        cautions: null,
        checkpoints: ['Status communicated']
      },
      {
        stepNumber: 5,
        action: 'IPIC acknowledges',
        details: 'Incoming PIC (IPIC): "Copy - ready to receive."',
        notes: null,
        cautions: null,
        checkpoints: ['IPIC ready']
      },
      {
        stepNumber: 6,
        action: 'OPIC neutralizes',
        details: 'OPIC: "Controls neutral."',
        notes: null,
        cautions: null,
        checkpoints: ['Controls neutral']
      },
      {
        stepNumber: 7,
        action: 'Physical transfer',
        details: 'Physical transfer of controller (strap, grip, confirm).',
        notes: null,
        cautions: 'Ensure secure grip before release.',
        checkpoints: ['Controller transferred']
      },
      {
        stepNumber: 8,
        action: 'IPIC takes control',
        details: 'IPIC makes slight input (yaw/pitch): "I have control."',
        notes: null,
        cautions: null,
        checkpoints: ['Control confirmed']
      },
      {
        stepNumber: 9,
        action: 'OPIC confirms',
        details: 'OPIC verifies: "You have control, I am monitor."',
        notes: null,
        cautions: null,
        checkpoints: ['Transfer complete']
      },
      {
        stepNumber: 10,
        action: 'VO confirms',
        details: 'VO: "Control change confirmed."',
        notes: null,
        cautions: null,
        checkpoints: ['VO confirmed change']
      }
    ]
  },

  'AP-003': {
    id: 'proc-ap-003',
    number: 'AP-003',
    title: 'Ground Collision Avoidance',
    category: 'advanced',
    description: 'Prevent RPAS collisions with terrain, structures, vehicles, or people during operations.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['CARs Part IX'],
    relatedPolicies: ['1024'],
    keywords: ['collision avoidance', 'ground', 'terrain', 'obstacles', 'safety'],
    equipmentRequired: ['Site survey', 'Perimeter markers'],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Site survey',
        details: 'Conduct site survey to identify obstacles, hazards, and ground risks.',
        notes: null,
        cautions: null,
        checkpoints: ['Survey complete']
      },
      {
        stepNumber: 2,
        action: 'Mark zones',
        details: 'Mark safe launch and recovery zones.',
        notes: null,
        cautions: null,
        checkpoints: ['Zones marked']
      },
      {
        stepNumber: 3,
        action: 'Establish buffers',
        details: 'Establish buffer zones around crew and uninvolved persons.',
        notes: null,
        cautions: null,
        checkpoints: ['Buffers established']
      },
      {
        stepNumber: 4,
        action: 'Clear areas',
        details: 'Clear takeoff/landing areas of people, vehicles, and equipment.',
        notes: null,
        cautions: null,
        checkpoints: ['Areas cleared']
      },
      {
        stepNumber: 5,
        action: 'Maintain separation',
        details: 'Maintain horizontal/vertical separation from structures, powerlines, and obstacles.',
        notes: null,
        cautions: null,
        checkpoints: ['Separation maintained']
      },
      {
        stepNumber: 6,
        action: 'Use sensors',
        details: 'Use onboard sensors (if equipped) for terrain/obstacle detection.',
        notes: null,
        cautions: null,
        checkpoints: ['Sensors active']
      },
      {
        stepNumber: 7,
        action: 'VO monitors',
        details: 'VO monitors ground activity and alerts PIC to hazards.',
        notes: null,
        cautions: null,
        checkpoints: ['Ground monitored']
      },
      {
        stepNumber: 8,
        action: 'Abort if unsafe',
        details: 'Abort landing/takeoff if area becomes unsafe.',
        notes: null,
        cautions: 'Safety over mission.',
        checkpoints: ['Abort ready']
      }
    ]
  },

  'AP-004': {
    id: 'proc-ap-004',
    number: 'AP-004',
    title: 'Airborne Collision Avoidance',
    category: 'advanced',
    description: 'Ensure safe separation from all manned and unmanned aircraft during RPAS operations.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['CARs 901.17', 'CARs 901.18'],
    relatedPolicies: ['1003'],
    keywords: ['collision avoidance', 'airborne', 'aircraft', 'traffic', 'separation'],
    equipmentRequired: ['ADS-B receiver (if equipped)', 'Radio'],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Yield right of way',
        details: 'Yield right of way to all manned aircraft (CAR 901.17).',
        notes: null,
        cautions: 'Manned aircraft always have priority.',
        checkpoints: ['Right of way understood']
      },
      {
        stepNumber: 2,
        action: 'Maintain separation',
        details: 'Maintain safe separation from all airspace users (CAR 901.18).',
        notes: null,
        cautions: null,
        checkpoints: ['Separation maintained']
      },
      {
        stepNumber: 3,
        action: 'VO scans',
        details: 'VO maintains constant visual scan of airspace.',
        notes: null,
        cautions: null,
        checkpoints: ['Airspace scanned']
      },
      {
        stepNumber: 4,
        action: 'PIC monitors',
        details: 'PIC maintains telemetry monitoring and situational awareness.',
        notes: null,
        cautions: null,
        checkpoints: ['SA maintained']
      },
      {
        stepNumber: 5,
        action: 'Use aids',
        details: 'Use onboard aids (ADS-B, TCAS) if equipped.',
        notes: null,
        cautions: null,
        checkpoints: ['Aids active']
      },
      {
        stepNumber: 6,
        action: 'Monitor frequency',
        details: 'Monitor appropriate ATC/uncontrolled airspace frequency (e.g., 126.7 MHz, 123.2 MHz).',
        notes: null,
        cautions: null,
        checkpoints: ['Frequency monitored']
      },
      {
        stepNumber: 7,
        action: 'Traffic detected',
        details: 'Upon detecting manned aircraft: VO call "Traffic in area." PIC reduces altitude/holds hover until clear.',
        notes: null,
        cautions: null,
        checkpoints: ['Traffic procedure executed']
      },
      {
        stepNumber: 8,
        action: 'Record conflicts',
        details: 'Record any conflict events in flight log.',
        notes: null,
        cautions: null,
        checkpoints: ['Events logged']
      }
    ]
  },

  'AP-005': {
    id: 'proc-ap-005',
    number: 'AP-005',
    title: 'Pre-Flight Airspace Planning',
    category: 'advanced',
    description: 'Identify and mitigate airborne risks before launch through planning and coordination.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Operations Manager',
    status: 'active',
    regulatoryRefs: ['CARs Part IX'],
    relatedPolicies: ['1003', '1004'],
    keywords: ['airspace', 'planning', 'NOTAM', 'coordination', 'pre-flight'],
    equipmentRequired: ['Airspace charts', 'NOTAM access', 'ROC-A radio'],
    personnelRequired: ['Operations Manager', 'Pilot in Command'],
    steps: [
      {
        stepNumber: 1,
        action: 'Analyze airspace',
        details: 'Analyze operational airspace (class, restrictions, nearby aerodromes).',
        notes: null,
        cautions: null,
        checkpoints: ['Airspace analyzed']
      },
      {
        stepNumber: 2,
        action: 'Check NOTAMs',
        details: 'Check NOTAMs for active advisories.',
        notes: null,
        cautions: null,
        checkpoints: ['NOTAMs checked']
      },
      {
        stepNumber: 3,
        action: 'Identify traffic',
        details: 'Identify local traffic routes and patterns.',
        notes: null,
        cautions: null,
        checkpoints: ['Traffic identified']
      },
      {
        stepNumber: 4,
        action: 'Confirm VO responsibilities',
        details: 'Confirm VO responsibilities for airspace monitoring.',
        notes: null,
        cautions: null,
        checkpoints: ['VO briefed']
      },
      {
        stepNumber: 5,
        action: 'Establish contacts',
        details: 'Establish ATC/FIC contact info for area.',
        notes: null,
        cautions: null,
        checkpoints: ['Contacts established']
      },
      {
        stepNumber: 6,
        action: 'Verify comms',
        details: 'Verify comms equipment ready (ROC-A radio, backups).',
        notes: null,
        cautions: null,
        checkpoints: ['Comms verified']
      },
      {
        stepNumber: 7,
        action: 'Define limits',
        details: 'Define altitude limits and flight boundaries in plan.',
        notes: null,
        cautions: null,
        checkpoints: ['Limits defined']
      },
      {
        stepNumber: 8,
        action: 'Document risks',
        details: 'Document airspace risks in site survey and CONOPS.',
        notes: null,
        cautions: null,
        checkpoints: ['Risks documented']
      },
      {
        stepNumber: 9,
        action: 'Brief crew',
        details: 'Brief crew on airspace hazards and contingency actions.',
        notes: null,
        cautions: null,
        checkpoints: ['Crew briefed']
      }
    ]
  },

  'AP-006': {
    id: 'proc-ap-006',
    number: 'AP-006',
    title: 'In-Flight Monitoring & Procedure',
    category: 'advanced',
    description: 'Maintain awareness of RPAS position, airspace, and potential hazards during flight.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Pilot in Command',
    status: 'active',
    regulatoryRefs: ['CARs Part IX'],
    relatedPolicies: ['1013', '1018'],
    keywords: ['monitoring', 'in-flight', 'awareness', 'scanning', 'hazards'],
    equipmentRequired: ['RPAS', 'Ground control station', 'Communication equipment'],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'PIC monitors telemetry',
        details: 'PIC monitors telemetry (altitude, heading, battery, system alerts).',
        notes: null,
        cautions: null,
        checkpoints: ['Telemetry monitored']
      },
      {
        stepNumber: 2,
        action: 'VO scans',
        details: 'VO maintains continuous visual scan of airspace and surroundings.',
        notes: null,
        cautions: null,
        checkpoints: ['Scanning active']
      },
      {
        stepNumber: 3,
        action: 'Systematic scanning',
        details: 'Use systematic scanning (block method) to detect aircraft/obstacles.',
        notes: null,
        cautions: null,
        checkpoints: ['Block scanning used']
      },
      {
        stepNumber: 4,
        action: 'Listen for cues',
        details: 'Listen for audible cues (engine noise, rotor wash).',
        notes: null,
        cautions: null,
        checkpoints: ['Audible monitoring active']
      },
      {
        stepNumber: 5,
        action: 'Regular check-ins',
        details: 'Maintain regular PIC-VO check-ins on flight status.',
        notes: null,
        cautions: null,
        checkpoints: ['Check-ins maintained']
      },
      {
        stepNumber: 6,
        action: 'Traffic announcement',
        details: 'If VO detects traffic, announce location/direction relative to RPAS.',
        notes: null,
        cautions: null,
        checkpoints: ['Traffic announced']
      },
      {
        stepNumber: 7,
        action: 'PIC responds',
        details: 'PIC responds with acknowledgement and evasive action if required.',
        notes: null,
        cautions: null,
        checkpoints: ['Response executed']
      },
      {
        stepNumber: 8,
        action: 'Hold or RTH',
        details: 'Hold hover or return home if traffic conflict suspected.',
        notes: null,
        cautions: null,
        checkpoints: ['Safety action taken']
      },
      {
        stepNumber: 9,
        action: 'Record activity',
        details: 'Record any unusual airspace activity in log.',
        notes: null,
        cautions: null,
        checkpoints: ['Activity logged']
      }
    ]
  },

  'AP-007': {
    id: 'proc-ap-007',
    number: 'AP-007',
    title: 'Conflict De-Confliction Scheme',
    category: 'advanced',
    description: 'Standard responses to different levels of airspace conflict to prevent collisions.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['CARs 901.17', 'CARs 901.18'],
    relatedPolicies: ['1006'],
    keywords: ['de-confliction', 'conflict', 'aircraft', 'response', 'threat level'],
    equipmentRequired: [],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Planned Aircraft Approach',
        details: 'If planned aircraft approach is known, RPAS is grounded.',
        notes: null,
        cautions: null,
        checkpoints: ['Grounding confirmed']
      },
      {
        stepNumber: 2,
        action: 'Announced Aircraft',
        details: 'Entered Airspace - Announced Aircraft: Restrict RPAS to below 400ft AGL and maintain at least 1km horizontal distance from the aircraft path.',
        notes: null,
        cautions: null,
        checkpoints: ['Altitude restricted']
      },
      {
        stepNumber: 3,
        action: 'Non-Threat Detected',
        details: 'Unannounced Aircraft Detected - Non-Threat: Continue operation, maintain awareness of the aircraft in case of changing threat level.',
        notes: null,
        cautions: null,
        checkpoints: ['Awareness maintained']
      },
      {
        stepNumber: 4,
        action: 'Potential Conflict',
        details: 'Unannounced Aircraft Detected - Potential Conflict: Return RPAS to home or initiate hover and hold.',
        notes: null,
        cautions: null,
        checkpoints: ['RTH or hover initiated']
      },
      {
        stepNumber: 5,
        action: 'Critical Threat',
        details: 'Unannounced Aircraft Detected - Critical Threat: IMMEDIATE DESCENT REQUIRED - Execute DESCEND DESCEND DESCEND Protocol.',
        notes: null,
        cautions: 'EMERGENCY ACTION REQUIRED.',
        checkpoints: ['Descent protocol executed']
      }
    ]
  },

  'AP-008': {
    id: 'proc-ap-008',
    number: 'AP-008',
    title: 'Descend Protocol',
    category: 'advanced',
    description: 'Emergency maneuver to rapidly reduce altitude when an immediate collision threat is identified.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['CARs Part IX'],
    relatedPolicies: ['1006'],
    keywords: ['descend', 'emergency', 'collision', 'immediate', 'threat'],
    equipmentRequired: [],
    personnelRequired: ['Pilot in Command', 'Visual Observer'],
    steps: [
      {
        stepNumber: 1,
        action: 'Without VO - Identify threat',
        details: 'PIC identifies critical threat.',
        notes: null,
        cautions: null,
        checkpoints: ['Threat identified']
      },
      {
        stepNumber: 2,
        action: 'Take manual control',
        details: 'PIC takes manual control.',
        notes: null,
        cautions: null,
        checkpoints: ['Manual control active']
      },
      {
        stepNumber: 3,
        action: 'Announce descent',
        details: 'PIC loudly announces: "DESCEND, DESCEND, DESCEND."',
        notes: null,
        cautions: null,
        checkpoints: ['Descent announced']
      },
      {
        stepNumber: 4,
        action: 'Descend',
        details: 'Descend straight down to safe altitude.',
        notes: null,
        cautions: 'Avoid terrain/structures.',
        checkpoints: ['Descent executed']
      },
      {
        stepNumber: 5,
        action: 'With VO - VO identifies',
        details: 'VO identifies critical threat and calls: "Critical Threat - DESCEND, DESCEND, DESCEND."',
        notes: null,
        cautions: null,
        checkpoints: ['VO call made']
      },
      {
        stepNumber: 6,
        action: 'Maneuver if needed',
        details: 'If straight descent unsafe, maneuver downwards and away from threat.',
        notes: null,
        cautions: null,
        checkpoints: ['Maneuver complete']
      },
      {
        stepNumber: 7,
        action: 'Resume mission',
        details: 'Resume mission only once airspace confirmed clear.',
        notes: null,
        cautions: null,
        checkpoints: ['Airspace clear']
      },
      {
        stepNumber: 8,
        action: 'Log incident',
        details: 'Log incident and include in debrief.',
        notes: null,
        cautions: null,
        checkpoints: ['Incident logged']
      }
    ]
  }
}

// Default procedures array for seeding
const DEFAULT_PROCEDURES = Object.values(PROCEDURE_CONTENT)

// Helper function to replace company name placeholder
function replaceCompanyName(content, companyName) {
  if (!content || !companyName) return content

  const placeholder = /\{\{COMPANY_NAME\}\}/g

  if (typeof content === 'string') {
    return content.replace(placeholder, companyName)
  }

  if (Array.isArray(content)) {
    return content.map(item => replaceCompanyName(item, companyName))
  }

  if (typeof content === 'object') {
    const result = {}
    for (const key in content) {
      result[key] = replaceCompanyName(content[key], companyName)
    }
    return result
  }

  return content
}

module.exports = { PROCEDURE_CATEGORIES, PROCEDURE_CONTENT, replaceCompanyName };
