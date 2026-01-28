// Aeria Ops Form Definitions
// Complete form specifications with COR/SECOR compliance fields

// Hazard categories from HSE program - includes RPAS-specific categories
export const HAZARD_CATEGORIES = [
  // Standard HSE Categories
  { value: 'environmental', label: 'Environmental Hazards', description: 'Weather, terrain, wildlife, temperature', category: 'general' },
  { value: 'overhead', label: 'Overhead Hazards', description: 'Power lines, structures, obstacles', category: 'general' },
  { value: 'access_egress', label: 'Access/Egress', description: 'Slips, trips, water hazards', category: 'general' },
  { value: 'ergonomic', label: 'Ergonomic', description: 'Awkward positions, repetitive tasks', category: 'general' },
  { value: 'personal_limitations', label: 'Personal Limitations', description: 'Fatigue, distraction, training gaps', category: 'general' },
  { value: 'equipment', label: 'Equipment', description: 'Malfunction, improper use', category: 'general' },
  { value: 'vehicle', label: 'Vehicle Hazards', description: 'Driving, loading, terrain navigation', category: 'general' },
  { value: 'chemical', label: 'Chemical/Biological', description: 'Fuel, batteries, contamination', category: 'general' },
  
  // RPAS-Specific Categories
  { value: 'airspace', label: 'Airspace Hazards', description: 'Controlled airspace, NOTAMs, TFRs, airport proximity', category: 'rpas' },
  { value: 'rf_interference', label: 'RF/Signal Hazards', description: 'Interference, link loss, GPS denial, EMI', category: 'rpas' },
  { value: 'flyaway', label: 'Loss of Control', description: 'Fly-away risk, GPS failure, compass interference', category: 'rpas' },
  { value: 'battery_thermal', label: 'Battery Hazards', description: 'Thermal runaway, swelling, cold weather performance', category: 'rpas' },
  { value: 'public_interaction', label: 'Public/Bystanders', description: 'Spectators, pedestrians, vehicle traffic', category: 'rpas' },
  { value: 'manned_aircraft', label: 'Manned Aircraft', description: 'Helicopters, fixed-wing, emergency aircraft', category: 'rpas' },
  { value: 'obstacle_collision', label: 'Obstacle Collision', description: 'Trees, buildings, powerlines, guy wires', category: 'rpas' },
  { value: 'vlos_limitations', label: 'VLOS Limitations', description: 'Visual line of sight obstructions, lighting', category: 'rpas' },
  { value: 'payload', label: 'Payload Hazards', description: 'Camera/sensor weight, balance, detachment', category: 'rpas' },
  { value: 'ground_crew', label: 'Ground Crew Safety', description: 'Prop strike, hand launch/catch, rotor hazards', category: 'rpas' },

  // Other category for custom hazards
  { value: 'other', label: 'Other', description: 'Specify custom hazard type in description', category: 'general' },
]

// Standard hazard categories (for filtering)
export const STANDARD_HAZARD_CATEGORIES = HAZARD_CATEGORIES.filter(h => h.category === 'general')

// RPAS-specific hazard categories (for filtering)
export const RPAS_HAZARD_CATEGORIES = HAZARD_CATEGORIES.filter(h => h.category === 'rpas')

// Severity ratings (1 = most severe)
export const SEVERITY_RATINGS = [
  { value: '1', label: '1 - Catastrophic', description: 'Death or permanent disability', color: 'bg-red-700' },
  { value: '2', label: '2 - Serious', description: 'Major injury or damage', color: 'bg-red-500' },
  { value: '3', label: '3 - Minor', description: 'Non-serious injury', color: 'bg-yellow-500' },
  { value: '4', label: '4 - Negligible', description: 'No injury, minor inconvenience', color: 'bg-green-500' },
]

// Probability ratings
export const PROBABILITY_RATINGS = [
  { value: 'A', label: 'A - Frequent', description: 'Will occur repeatedly', color: 'bg-red-600' },
  { value: 'B', label: 'B - Reasonably Probable', description: 'Will occur eventually', color: 'bg-orange-500' },
  { value: 'C', label: 'C - Remote', description: 'Could occur at some point', color: 'bg-yellow-500' },
  { value: 'D', label: 'D - Extremely Improbable', description: 'Very unlikely', color: 'bg-green-500' },
]

// Risk matrix calculation
export const calculateRiskScore = (severity, probability) => {
  const matrix = {
    '1A': 'critical', '1B': 'critical', '1C': 'high', '1D': 'medium',
    '2A': 'critical', '2B': 'high', '2C': 'medium', '2D': 'low',
    '3A': 'high', '3B': 'medium', '3C': 'low', '3D': 'low',
    '4A': 'medium', '4B': 'low', '4C': 'low', '4D': 'low',
  }
  return matrix[`${severity}${probability}`] || 'unknown'
}

// Hierarchy of controls
export const CONTROL_TYPES = [
  { value: 'elimination', label: '1. Elimination', description: 'Remove the hazard entirely' },
  { value: 'substitution', label: '2. Substitution', description: 'Replace with less hazardous option' },
  { value: 'engineering', label: '3. Engineering Controls', description: 'Isolate people from hazard' },
  { value: 'administrative', label: '4. Administrative Controls', description: 'Change work procedures' },
  { value: 'ppe', label: '5. PPE', description: 'Personal protective equipment (last resort)' },
]

// Immediate cause classifications (for incidents)
export const SUBSTANDARD_ACTS = [
  'Operating equipment without authorization',
  'Failure to warn or secure',
  'Operating at improper speed',
  'Using defective equipment',
  'Failing to use PPE properly',
  'Improper lifting or positioning',
  'Failure to follow procedures',
  'Failure to identify hazards',
]

export const SUBSTANDARD_CONDITIONS = [
  'Inadequate safety barriers or PPE',
  'Defective tools, equipment, or materials',
  'Poor housekeeping or clutter',
  'Exposure to hazardous substances',
  'Inadequate ventilation or lighting',
  'Extreme temperatures',
  'High noise levels',
  'Congested workspace',
]

// Root cause categories
export const PERSONAL_FACTORS = [
  'Inadequate physical capability',
  'Inadequate mental capability',
  'Lack of knowledge or training',
  'Improper motivation',
  'Lack of safety awareness',
  'Fatigue or overwork',
  'Emotional strain or stress',
]

export const JOB_SYSTEM_FACTORS = [
  'Inadequate leadership or supervision',
  'Deficient engineering or maintenance',
  'Inadequate tools or equipment',
  'Inadequate work standards',
  'Poor communication',
  'Lack of safety policies',
  'Inadequate purchasing controls',
]

// RPAS Incident Triggers - regulatory notification requirements
export const RPAS_INCIDENT_TRIGGERS = {
  TSB_IMMEDIATE: {
    label: 'TSB IMMEDIATE NOTIFICATION',
    phone: '1-800-387-3557',
    altPhone: '1-819-994-3741',
    conditions: [
      'fatality',
      'serious_injury_hospitalization',
      'rpas_over_25kg_accident',
      'collision_manned_aircraft',
    ],
    instructions: 'Call Transportation Safety Board IMMEDIATELY before any other actions.',
  },
  TRANSPORT_CANADA: {
    label: 'Transport Canada Notification',
    conditions: [
      'fly_away',
      'loss_of_control',
      'boundary_violation',
      'unintended_contact_person',
      'equipment_damage_affecting_flight',
      'near_miss_aircraft',
    ],
    instructions: 'Submit CADORS report. If under SFOC, submit RPAS Aviation Occurrence Reporting Form.',
  },
  WORKSAFEBC: {
    label: 'WorkSafeBC Notification',
    conditions: [
      'serious_injury_hospitalization',
      'fatality',
    ],
    instructions: 'Report workplace incident to WorkSafeBC.',
  },
  AERIA_INTERNAL: {
    label: 'Aeria Internal Notification',
    accountableExecutive: 'Dustin Wales',
    phone: '604-849-2345',
    conditions: ['all_incidents'],
    instructions: 'Notify Accountable Executive for ALL incidents.',
  },
}

// Form categories
export const FORM_CATEGORIES = [
  {
    id: 'pre_operation',
    name: 'Pre-Operation',
    description: 'Planning and assessment forms',
    icon: 'ClipboardCheck',
    forms: ['site_survey', 'flight_plan', 'formal_hazard_assessment', 'first_aid_assessment', 'client_orientation']
  },
  {
    id: 'daily_field',
    name: 'Daily/Field',
    description: 'Daily operations forms',
    icon: 'Calendar',
    forms: ['tailgate_briefing', 'flha', 'preflight_checklist', 'daily_flight_log', 'post_flight_report']
  },
  {
    id: 'incident',
    name: 'Incident',
    description: 'Incident and investigation forms',
    icon: 'AlertTriangle',
    forms: ['near_miss', 'incident_report', 'investigation_report']
  },
  {
    id: 'tracking',
    name: 'Tracking/Admin',
    description: 'Administrative tracking forms',
    icon: 'FileText',
    forms: ['safety_meeting_log', 'training_record', 'equipment_inspection', 'ppe_inspection', 'vehicle_inspection', 'battery_cycle_log', 'crew_competency_check']
  },
]

// Form Templates
export const FORM_TEMPLATES = {
  // ========================================
  // FIELD LEVEL HAZARD ASSESSMENT (FLHA)
  // ========================================
  flha: {
    id: 'flha',
    name: 'Field Level Hazard Assessment',
    shortName: 'FLHA',
    category: 'daily_field',
    description: 'Real-time hazard identification before/during field work',
    icon: 'Shield',
    version: '1.0',
    sections: [
      {
        id: 'header',
        title: 'Assessment Information',
        fields: [
          { id: 'form_id', type: 'auto_id', label: 'Form ID', required: true },
          { id: 'project', type: 'project_select', label: 'Project', required: true },
          { id: 'date', type: 'date', label: 'Date', required: true, defaultToday: true },
          { id: 'time', type: 'time', label: 'Time', required: true, defaultNow: true },
          { id: 'location_gps', type: 'gps', label: 'GPS Location', required: true },
          { id: 'location_description', type: 'text', label: 'Location Description', required: true },
          { id: 'weather', type: 'weather_conditions', label: 'Weather Conditions', required: true },
          { id: 'crew_present', type: 'crew_multi_select', label: 'Crew Present', required: true },
        ]
      },
      {
        id: 'hazards',
        title: 'Hazard Assessment',
        repeatable: true,
        repeatLabel: 'Add Hazard',
        fields: [
          { id: 'task', type: 'text', label: 'Task Being Performed', required: true },
          { id: 'hazard_category', type: 'select', label: 'Hazard Category', required: true, options: 'HAZARD_CATEGORIES' },
          { id: 'hazard_description', type: 'textarea', label: 'Specific Hazard', required: true },
          { id: 'source_identification', type: 'textarea', label: 'Source Identification', required: true, helpText: 'Where/why this hazard exists' },
          { id: 'severity', type: 'select', label: 'Severity', required: true, options: 'SEVERITY_RATINGS' },
          { id: 'probability', type: 'select', label: 'Probability', required: true, options: 'PROBABILITY_RATINGS' },
          { id: 'initial_risk', type: 'risk_matrix', label: 'Initial Risk Score', calculated: true },
          { id: 'control_type', type: 'select', label: 'Control Type', required: true, options: 'CONTROL_TYPES' },
          { id: 'control_description', type: 'textarea', label: 'Control Description', required: true },
          { id: 'residual_severity', type: 'select', label: 'Residual Severity', required: true, options: 'SEVERITY_RATINGS' },
          { id: 'residual_probability', type: 'select', label: 'Residual Probability', required: true, options: 'PROBABILITY_RATINGS' },
          { id: 'residual_risk', type: 'risk_matrix', label: 'Residual Risk Score', calculated: true },
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'completed_by', type: 'signature', label: 'Completed By', required: true },
          { id: 'crew_acknowledgment', type: 'multi_signature', label: 'Crew Acknowledgment', required: true, helpText: 'All crew members must sign' },
          { id: 'supervisor_review', type: 'signature', label: 'Supervisor Review (if applicable)', required: false },
          { id: 'notes', type: 'textarea', label: 'Additional Notes/Observations', required: false },
        ]
      }
    ]
  },

  // ========================================
  // RPAS INCIDENT/ACCIDENT REPORT
  // ========================================
  incident_report: {
    id: 'incident_report',
    name: 'RPAS Incident/Accident Report',
    shortName: 'Incident Report',
    category: 'incident',
    description: 'Document all RPAS-related incidents with regulatory trigger logic',
    icon: 'AlertOctagon',
    version: '1.0',
    hasTriggers: true,
    sections: [
      {
        id: 'header',
        title: 'Report Information',
        fields: [
          { id: 'form_id', type: 'auto_id', label: 'Form ID', required: true },
          { id: 'report_date', type: 'datetime', label: 'Date/Time of Report', required: true, defaultNow: true },
          { id: 'reporter_name', type: 'user_auto', label: 'Reporter Name', required: true },
          { id: 'reporter_role', type: 'select', label: 'Reporter Role', required: true, options: [
            { value: 'pic', label: 'Pilot in Command' },
            { value: 'vo', label: 'Visual Observer' },
            { value: 'crew', label: 'Crew Member' },
            { value: 'other', label: 'Other' },
          ]},
          { id: 'reporter_phone', type: 'phone', label: 'Reporter Phone', required: true },
        ]
      },
      {
        id: 'occurrence',
        title: 'Occurrence Details',
        fields: [
          { id: 'occurrence_date', type: 'date', label: 'Date of Occurrence', required: true },
          { id: 'occurrence_time', type: 'time', label: 'Time of Occurrence', required: true },
          { id: 'project', type: 'project_select', label: 'Project/Operation', required: true },
          { id: 'location_gps', type: 'gps', label: 'GPS Location', required: true },
          { id: 'location_description', type: 'text', label: 'Location Description', required: true },
        ]
      },
      {
        id: 'rpas_info',
        title: 'RPAS Information',
        fields: [
          { id: 'aircraft', type: 'aircraft_select', label: 'Aircraft', required: true },
          { id: 'rpas_weight', type: 'calculated', label: 'RPAS Weight Category', helpText: 'Auto-filled from aircraft selection' },
          { id: 'registration', type: 'calculated', label: 'Registration Number' },
        ]
      },
      {
        id: 'personnel',
        title: 'Personnel Involved',
        fields: [
          { id: 'pic', type: 'operator_select', label: 'PIC', required: true },
          { id: 'pic_cert', type: 'calculated', label: 'PIC Certificate #' },
          { id: 'visual_observers', type: 'crew_multi_select', label: 'Visual Observer(s)', required: false },
          { id: 'other_crew', type: 'crew_multi_select', label: 'Other Crew', required: false },
        ]
      },
      {
        id: 'classification',
        title: 'Occurrence Classification',
        description: 'Answer these questions to determine regulatory notification requirements',
        fields: [
          // TSB IMMEDIATE triggers
          { id: 'fatality', type: 'yesno', label: 'Was anyone killed?', required: true, trigger: 'TSB_IMMEDIATE' },
          { id: 'serious_injury', type: 'yesno', label: 'Was anyone seriously injured requiring hospitalization?', required: true, trigger: 'TSB_IMMEDIATE,WORKSAFEBC' },
          { id: 'collision_manned', type: 'yesno', label: 'Was there a collision with a manned aircraft?', required: true, trigger: 'TSB_IMMEDIATE' },
          { id: 'rpas_over_25kg', type: 'yesno_conditional', label: 'Was RPAS weight >25kg AND accident occurred?', required: true, trigger: 'TSB_IMMEDIATE', condition: 'rpas_weight > 25' },
          
          // Transport Canada triggers
          { id: 'fly_away', type: 'yesno', label: 'Did RPAS become uncontrollable/fly-away/go missing?', required: true, trigger: 'TRANSPORT_CANADA' },
          { id: 'boundary_violation', type: 'yesno', label: 'Was RPAS operated outside horizontal/altitude limits?', required: true, trigger: 'TRANSPORT_CANADA' },
          { id: 'unintended_contact', type: 'yesno', label: 'Was there unintended contact between RPAS and any person?', required: true, trigger: 'TRANSPORT_CANADA' },
          { id: 'equipment_damage', type: 'yesno', label: 'Was there damage affecting flight characteristics?', required: true, trigger: 'TRANSPORT_CANADA' },
          { id: 'near_miss', type: 'yesno', label: 'Was there risk of collision with another aircraft?', required: true, trigger: 'TRANSPORT_CANADA' },
          
          // Additional classification
          { id: 'medical_attention', type: 'yesno', label: 'Did injury require medical attention beyond first aid?', required: true },
          { id: 'property_damage', type: 'yesno', label: 'Was there property damage?', required: true },
          { id: 'property_damage_value', type: 'currency', label: 'Estimated property damage value', required: false, showIf: 'property_damage === true' },
          { id: 'under_sfoc', type: 'yesno', label: 'Was this operation under an SFOC?', required: true, trigger: 'SFOC_FORM' },
          { id: 'sfoc_reference', type: 'text', label: 'SFOC Reference Number', required: false, showIf: 'under_sfoc === true' },
          { id: 'police_report', type: 'yesno', label: 'Was a police report filed?', required: true },
        ]
      },
      {
        id: 'notification_checklist',
        title: 'Required Notifications',
        type: 'trigger_checklist',
        description: 'Based on your answers, the following notifications are required:',
        autoGenerated: true,
      },
      {
        id: 'description',
        title: 'Incident Description',
        fields: [
          { id: 'detailed_description', type: 'textarea', label: 'Detailed Description', required: true, rows: 6, helpText: 'What happened - be specific' },
          { id: 'weather_conditions', type: 'text', label: 'Weather at Time', required: true },
          { id: 'task_at_time', type: 'textarea', label: 'Task being performed when incident occurred', required: true, helpText: 'Source identification' },
        ]
      },
      {
        id: 'immediate_cause',
        title: 'Immediate Cause Classification',
        fields: [
          { id: 'substandard_acts', type: 'multiselect', label: 'Substandard Acts', options: 'SUBSTANDARD_ACTS', required: false },
          { id: 'substandard_acts_detail', type: 'textarea', label: 'Substandard Acts Details', required: false },
          { id: 'substandard_conditions', type: 'multiselect', label: 'Substandard Conditions', options: 'SUBSTANDARD_CONDITIONS', required: false },
          { id: 'substandard_conditions_detail', type: 'textarea', label: 'Substandard Conditions Details', required: false },
        ]
      },
      {
        id: 'evidence',
        title: 'Evidence',
        fields: [
          { id: 'photos', type: 'file_upload', label: 'Photos/Video', required: false, multiple: true, accept: 'image/*,video/*' },
          { id: 'airdata_log', type: 'file_upload', label: 'AirData Flight Log', required: true },
          { id: 'witnesses', type: 'repeatable_text', label: 'Witness Names', required: false },
          { id: 'witness_statements', type: 'file_upload', label: 'Witness Statements', required: false, multiple: true },
          { id: 'equipment_tagged', type: 'yesno', label: 'Equipment Tagged Out?', required: true },
          { id: 'scene_secured', type: 'yesno', label: 'Scene Secured?', required: true },
        ]
      },
      {
        id: 'immediate_actions',
        title: 'Immediate Actions Taken',
        fields: [
          { id: 'emergency_called', type: 'yesno', label: 'Emergency Services Called?', required: true },
          { id: 'emergency_time', type: 'time', label: 'Time Called', required: false, showIf: 'emergency_called === true' },
          { id: 'first_aid', type: 'yesno', label: 'First Aid Provided?', required: true },
          { id: 'first_aid_detail', type: 'textarea', label: 'First Aid Details', required: false, showIf: 'first_aid === true' },
          { id: 'operations_ceased', type: 'yesno', label: 'Operations Ceased?', required: true },
          { id: 'operations_ceased_time', type: 'time', label: 'Time Operations Ceased', required: false, showIf: 'operations_ceased === true' },
          { id: 'scene_preservation', type: 'textarea', label: 'Scene Preservation Actions', required: true },
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'reporter_signature', type: 'signature', label: 'Reporter Signature', required: true },
          { id: 'pic_signature', type: 'signature', label: 'PIC Signature (if different)', required: false },
          { id: 'supervisor_signature', type: 'signature', label: 'Supervisor Acknowledgment', required: true },
        ]
      }
    ]
  },

  // ========================================
  // INVESTIGATION REPORT
  // ========================================
  investigation_report: {
    id: 'investigation_report',
    name: 'Investigation Report',
    shortName: 'Investigation',
    category: 'incident',
    description: 'Root cause analysis and corrective action tracking',
    icon: 'Search',
    version: '1.0',
    sections: [
      {
        id: 'header',
        title: 'Investigation Information',
        fields: [
          { id: 'investigation_id', type: 'auto_id', label: 'Investigation ID', required: true },
          { id: 'linked_incident', type: 'incident_select', label: 'Linked Incident Report', required: true },
          { id: 'investigation_type', type: 'select', label: 'Investigation Type', required: true, options: [
            { value: 'formal_serious', label: 'Formal - Serious/Fatality' },
            { value: 'formal_regulatory', label: 'Formal - Regulatory' },
            { value: 'formal_environmental', label: 'Formal - Environmental' },
            { value: 'standard', label: 'Standard' },
            { value: 'informal', label: 'Informal' },
            { value: 'rpas_specific', label: 'RPAS-Specific' },
          ]},
          { id: 'lead_investigator', type: 'operator_select', label: 'Lead Investigator', required: true },
          { id: 'investigation_team', type: 'crew_multi_select', label: 'Investigation Team', required: false },
          { id: 'start_date', type: 'date', label: 'Investigation Start Date', required: true },
          { id: 'due_date', type: 'date', label: 'Due Date', required: true, helpText: 'Within 24 hours of incident' },
        ]
      },
      {
        id: 'scope',
        title: 'Investigation Scope',
        fields: [
          { id: 'external_agencies', type: 'multiselect', label: 'External Agencies Involved', options: [
            { value: 'tsb', label: 'Transportation Safety Board' },
            { value: 'transport_canada', label: 'Transport Canada' },
            { value: 'worksafebc', label: 'WorkSafeBC' },
            { value: 'rcmp', label: 'RCMP' },
            { value: 'environment_canada', label: 'Environment Canada' },
          ], required: false },
          { id: 'regulatory_reporting', type: 'checklist', label: 'Regulatory Reporting Completed', options: [
            { value: 'tsb', label: 'TSB Report' },
            { value: 'transport_canada', label: 'Transport Canada' },
            { value: 'sfoc_form', label: 'SFOC Occurrence Form' },
            { value: 'cadors', label: 'CADORS' },
            { value: 'worksafebc', label: 'WorkSafeBC' },
          ], required: true },
        ]
      },
      {
        id: 'fact_gathering_who',
        title: 'Fact Gathering - Who',
        fields: [
          { id: 'persons_involved', type: 'repeatable_person', label: 'Persons Involved', required: true },
          { id: 'witnesses', type: 'repeatable_witness', label: 'Witnesses Interviewed', required: false },
        ]
      },
      {
        id: 'fact_gathering_what',
        title: 'Fact Gathering - What Happened',
        fields: [
          { id: 'location_details', type: 'text', label: 'Location Details', required: true },
          { id: 'location_gps', type: 'gps', label: 'GPS Coordinates', required: true },
          { id: 'incident_datetime', type: 'datetime', label: 'Date/Time of Incident', required: true },
          { id: 'environmental_conditions', type: 'textarea', label: 'Environmental Conditions', required: true },
          { id: 'sequence_before', type: 'textarea', label: 'Sequence of Events - Before Incident', required: true, rows: 4 },
          { id: 'sequence_during', type: 'textarea', label: 'Sequence of Events - During Incident', required: true, rows: 4 },
          { id: 'sequence_after', type: 'textarea', label: 'Sequence of Events - After Incident', required: true, rows: 4 },
          { id: 'equipment_involved', type: 'multiselect_text', label: 'Equipment Involved', required: true },
          { id: 'equipment_condition', type: 'textarea', label: 'Equipment Condition', required: true },
        ]
      },
      {
        id: 'root_cause',
        title: 'Root Cause Analysis',
        fields: [
          { id: 'immediate_substandard_acts', type: 'multiselect', label: 'Immediate Causes - Substandard Acts', options: 'SUBSTANDARD_ACTS', required: false },
          { id: 'immediate_acts_detail', type: 'textarea', label: 'Substandard Acts Details', required: false },
          { id: 'immediate_substandard_conditions', type: 'multiselect', label: 'Immediate Causes - Substandard Conditions', options: 'SUBSTANDARD_CONDITIONS', required: false },
          { id: 'immediate_conditions_detail', type: 'textarea', label: 'Substandard Conditions Details', required: false },
        ]
      },
      {
        id: 'root_cause_personal',
        title: 'Root Causes - Personal Factors',
        fields: [
          { id: 'personal_factors', type: 'multiselect', label: 'Personal Factors Identified', options: 'PERSONAL_FACTORS', required: false },
          { id: 'personal_factors_detail', type: 'textarea', label: 'Personal Factors Details', required: false },
        ]
      },
      {
        id: 'root_cause_system',
        title: 'Root Causes - Job/System Factors',
        fields: [
          { id: 'system_factors', type: 'multiselect', label: 'Job/System Factors Identified', options: 'JOB_SYSTEM_FACTORS', required: false },
          { id: 'system_factors_detail', type: 'textarea', label: 'Job/System Factors Details', required: false },
        ]
      },
      {
        id: 'corrective_actions',
        title: 'Corrective Action Plan',
        repeatable: true,
        repeatLabel: 'Add Corrective Action',
        fields: [
          { id: 'action_description', type: 'textarea', label: 'Action Description', required: true },
          { id: 'control_type', type: 'select', label: 'Control Type', required: true, options: 'CONTROL_TYPES' },
          { id: 'responsible_party', type: 'operator_select', label: 'Responsible Party', required: true },
          { id: 'target_date', type: 'date', label: 'Target Completion Date', required: true },
          { id: 'actual_date', type: 'date', label: 'Actual Completion Date', required: false },
          { id: 'verification_method', type: 'text', label: 'Verification Method', required: true },
          { id: 'verifier', type: 'operator_select', label: 'Verifier', required: true },
          { id: 'verification_date', type: 'date', label: 'Verification Date', required: false },
          { id: 'status', type: 'select', label: 'Status', required: true, options: [
            { value: 'open', label: 'Open' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'verified', label: 'Verified' },
            { value: 'closed', label: 'Closed' },
          ]},
          { id: 'evidence', type: 'file_upload', label: 'Evidence of Completion', required: false },
        ]
      },
      {
        id: 'findings',
        title: 'Findings Summary',
        fields: [
          { id: 'summary', type: 'textarea', label: 'Summary of Findings', required: true, rows: 6 },
          { id: 'lessons_learned', type: 'textarea', label: 'Lessons Learned', required: true, rows: 4, helpText: 'For safety meetings' },
          { id: 'policy_updates', type: 'yesno_text', label: 'Policy/Procedure Updates Required', required: true },
          { id: 'training_updates', type: 'yesno_text', label: 'Training Updates Required', required: true },
        ]
      },
      {
        id: 'approval',
        title: 'Approval',
        fields: [
          { id: 'investigator_signature', type: 'signature', label: 'Investigator Signature', required: true },
          { id: 'hse_review', type: 'signature', label: 'HSE Representative Review', required: true },
          { id: 'management_approval', type: 'signature', label: 'Management Approval', required: true },
          { id: 'closed_date', type: 'date', label: 'Investigation Closed Date', required: false, helpText: 'When all CAs verified' },
        ]
      }
    ]
  },

  // ========================================
  // NEAR MISS REPORT
  // ========================================
  near_miss: {
    id: 'near_miss',
    name: 'Near Miss Report',
    shortName: 'Near Miss',
    category: 'incident',
    description: 'Capture close calls before they become incidents',
    icon: 'AlertTriangle',
    version: '1.0',
    sections: [
      {
        id: 'header',
        title: 'Event Information',
        fields: [
          { id: 'form_id', type: 'auto_id', label: 'Form ID', required: true },
          { id: 'event_datetime', type: 'datetime', label: 'Date/Time of Event', required: true },
          { id: 'location_gps', type: 'gps', label: 'GPS Location', required: true },
          { id: 'location_description', type: 'text', label: 'Location Description', required: true },
          { id: 'project', type: 'project_select', label: 'Project', required: true },
          { id: 'reporter', type: 'user_auto', label: 'Reporter', required: true },
        ]
      },
      {
        id: 'event_details',
        title: 'Event Details',
        fields: [
          { id: 'what_happened', type: 'textarea', label: 'What happened?', required: true, rows: 4 },
          { id: 'what_could_have_happened', type: 'textarea', label: 'What could have happened?', required: true, rows: 3, helpText: 'Potential consequence' },
          { id: 'task_performed', type: 'text', label: 'Task being performed', required: true, helpText: 'Source identification' },
        ]
      },
      {
        id: 'source',
        title: 'Source Identification',
        fields: [
          { id: 'hazard_category', type: 'select', label: 'Hazard Category', required: true, options: 'HAZARD_CATEGORIES' },
          { id: 'hazard_source', type: 'text', label: 'Source of Hazard', required: true, helpText: 'Equipment, environment, procedure, behavior' },
          { id: 'contributing_factors', type: 'multiselect_text', label: 'Contributing Factors', required: true },
        ]
      },
      {
        id: 'risk',
        title: 'Risk Assessment',
        fields: [
          { id: 'potential_severity', type: 'select', label: 'Potential Severity', required: true, options: 'SEVERITY_RATINGS', helpText: 'If it had resulted in incident' },
          { id: 'potential_probability', type: 'select', label: 'Potential Probability', required: true, options: 'PROBABILITY_RATINGS', helpText: 'How likely to recur' },
          { id: 'risk_score', type: 'risk_matrix', label: 'Risk Score', calculated: true },
        ]
      },
      {
        id: 'actions',
        title: 'Actions',
        fields: [
          { id: 'immediate_actions', type: 'textarea', label: 'Immediate Actions Taken', required: true },
          { id: 'hazard_still_present', type: 'yesno', label: 'Hazard Still Present?', required: true },
          { id: 'suggested_controls', type: 'textarea', label: 'Suggested Controls', required: true },
          { id: 'requires_investigation', type: 'yesno', label: 'Requires Follow-up Investigation?', required: true },
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'reporter_signature', type: 'signature', label: 'Reporter Signature', required: true },
          { id: 'supervisor_signature', type: 'signature', label: 'Supervisor Acknowledgment', required: true, helpText: 'Within 24 hours' },
        ]
      }
    ]
  },

  // ========================================
  // TAILGATE SAFETY BRIEFING
  // ========================================
  tailgate_briefing: {
    id: 'tailgate_briefing',
    name: 'Tailgate Safety Briefing',
    shortName: 'Tailgate',
    category: 'daily_field',
    description: 'Condensed ops plan for field briefing',
    icon: 'Users',
    version: '1.0',
    sections: [
      {
        id: 'header',
        title: 'Briefing Information',
        fields: [
          { id: 'form_id', type: 'auto_id', label: 'Form ID', required: true },
          { id: 'date', type: 'date', label: 'Date', required: true, defaultToday: true },
          { id: 'time', type: 'time', label: 'Time', required: true, defaultNow: true },
          { id: 'project', type: 'project_select', label: 'Project', required: true },
          { id: 'location', type: 'text', label: 'Location', required: true, autoFill: 'project.location' },
          { id: 'briefing_lead', type: 'operator_select', label: 'Briefing Led By', required: true },
        ]
      },
      {
        id: 'crew',
        title: 'Crew Present',
        fields: [
          { id: 'attendees', type: 'crew_multi_signature', label: 'Attendees', required: true, helpText: 'All must sign' },
        ]
      },
      {
        id: 'key_info',
        title: 'Key Information',
        autoPopulate: 'project',
        fields: [
          { id: 'objectives', type: 'textarea', label: "Today's Objectives", required: true },
          { id: 'key_hazards', type: 'hazard_summary', label: 'Key Hazards', required: true, autoFill: 'project.hazards' },
          { id: 'controls', type: 'control_summary', label: 'Controls in Place', required: true, autoFill: 'project.controls' },
          { id: 'ppe_required', type: 'checklist', label: 'PPE Required', required: true, autoFill: 'project.ppe' },
          { id: 'muster_point', type: 'text', label: 'Emergency Muster Point', required: true, autoFill: 'project.muster_point' },
          { id: 'emergency_contacts', type: 'contact_summary', label: 'Emergency Contacts', required: true },
          { id: 'flyaway_script', type: 'checkbox', label: 'Fly-Away Script Location Confirmed', required: true },
        ]
      },
      {
        id: 'amendments',
        title: 'Field Amendments',
        fields: [
          { id: 'conditions_changed', type: 'yesno', label: 'Site Conditions Changed from Plan?', required: true },
          { id: 'additional_hazards', type: 'textarea', label: 'Additional Hazards Identified', required: false, showIf: 'conditions_changed === true' },
          { id: 'additional_controls', type: 'textarea', label: 'Additional Controls Required', required: false, showIf: 'conditions_changed === true' },
          { id: 'weather_checked', type: 'yesno', label: 'Weather Check Completed?', required: true },
          { id: 'weather_conditions', type: 'text', label: 'Current Weather Conditions', required: true },
          { id: 'notams_reviewed', type: 'yesno', label: 'NOTAMs Reviewed?', required: true },
          { id: 'navcanada_submitted', type: 'yesno', label: 'NavCanada Flight Plan Submitted?', required: false },
        ]
      },
      {
        id: 'confirmation',
        title: 'Crew Confirmation',
        fields: [
          { id: 'roles_understood', type: 'checkbox', label: 'Everyone understands their roles', required: true },
          { id: 'fit_for_duty', type: 'checkbox', label: 'Everyone fit for duty', required: true },
          { id: 'questions_raised', type: 'textarea', label: 'Questions/Concerns Raised', required: false },
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'crew_signatures', type: 'multi_signature', label: 'All Crew Signatures', required: true },
          { id: 'briefing_complete_time', type: 'time', label: 'Briefing Complete Time', required: true },
        ]
      }
    ]
  },

  // ========================================
  // PRE-FLIGHT CHECKLIST
  // ========================================
  preflight_checklist: {
    id: 'preflight_checklist',
    name: 'Pre-Flight Checklist',
    shortName: 'Pre-Flight',
    category: 'daily_field',
    description: 'VO/PIC call-and-response before launch',
    icon: 'CheckSquare',
    version: '1.0',
    sections: [
      {
        id: 'header',
        title: 'Flight Information',
        fields: [
          { id: 'form_id', type: 'auto_id', label: 'Form ID', required: true },
          { id: 'datetime', type: 'datetime', label: 'Date/Time', required: true, defaultNow: true },
          { id: 'flight_number', type: 'number', label: 'Flight # (today)', required: true },
          { id: 'aircraft', type: 'aircraft_select', label: 'Aircraft', required: true },
          { id: 'pic', type: 'user_auto', label: 'PIC', required: true },
          { id: 'vo', type: 'operator_select', label: 'VO', required: true },
        ]
      },
      {
        id: 'call_response',
        title: 'Call & Response',
        description: 'VO reads call, PIC responds',
        fields: [
          { id: 'takeoff_time', type: 'time', label: 'Take-off Time Noted', required: true },
          { id: 'wind_weather', type: 'text', label: 'Wind & Weather', required: true, placeholder: 'Within limits / describe' },
          { id: 'air_vehicle_batteries', type: 'text', label: 'Air Vehicle Batteries (%)', required: true },
          { id: 'ground_control_batteries', type: 'text', label: 'Ground Control Batteries (%)', required: true },
          { id: 'ground_control_app', type: 'select', label: 'Ground Control App Status', required: true, options: [
            { value: 'ok', label: 'OK' },
            { value: 'error', label: 'Error' },
          ]},
          { id: 'payload', type: 'select', label: 'Payload Status', required: true, options: [
            { value: 'connected', label: 'Connected' },
            { value: 'clear', label: 'Clear' },
            { value: 'na', label: 'N/A' },
          ]},
          { id: 'failsafe', type: 'text', label: 'Failsafe Settings', required: true, helpText: 'Mode, RTL altitude, limits' },
          { id: 'takeoff_mode', type: 'text', label: 'Take-off Mode', required: true, defaultValue: 'P-GPS (Loiter)' },
          { id: 'area_traffic', type: 'select', label: 'Area & Air Traffic', required: true, options: [
            { value: 'clear', label: 'Clear' },
            { value: 'traffic_noted', label: 'Traffic Noted' },
          ]},
          { id: 'airdata_synced', type: 'yesno', label: 'AirData Synced?', required: true },
        ]
      },
      {
        id: 'clearance',
        title: 'Clearance',
        fields: [
          { id: 'vo_cleared', type: 'checkbox', label: 'VO: "Cleared for Takeoff"', required: true },
          { id: 'pic_clear', type: 'checkbox', label: 'PIC: "CLEAR"', required: true },
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'pic_signature', type: 'signature', label: 'PIC Signature', required: true },
          { id: 'vo_signature', type: 'signature', label: 'VO Signature', required: true },
        ]
      }
    ]
  },

  // ========================================
  // DAILY FLIGHT LOG
  // ========================================
  daily_flight_log: {
    id: 'daily_flight_log',
    name: 'Daily Flight Log',
    shortName: 'Flight Log',
    category: 'daily_field',
    description: 'CAR 901.48 compliance - 24 month retention',
    icon: 'FileText',
    version: '1.0',
    retentionPeriod: '24 months',
    sections: [
      {
        id: 'header',
        title: 'Log Information',
        fields: [
          { id: 'log_id', type: 'auto_id', label: 'Log ID', required: true },
          { id: 'date', type: 'date', label: 'Date', required: true, defaultToday: true },
          { id: 'project', type: 'project_select', label: 'Project', required: true },
          { id: 'location_gps', type: 'gps', label: 'GPS Location', required: true },
          { id: 'location_description', type: 'text', label: 'Location Description', required: true },
        ]
      },
      {
        id: 'flights',
        title: 'Flight Entries',
        repeatable: true,
        repeatLabel: 'Add Flight',
        fields: [
          { id: 'flight_number', type: 'auto_increment', label: 'Flight #', required: true },
          { id: 'aircraft', type: 'aircraft_select', label: 'Aircraft', required: true },
          { id: 'pic', type: 'operator_select', label: 'PIC', required: true },
          { id: 'takeoff_time', type: 'time', label: 'Take-off Time', required: true },
          { id: 'landing_time', type: 'time', label: 'Landing Time', required: true },
          { id: 'flight_duration', type: 'calculated', label: 'Flight Duration', calculated: true },
          { id: 'battery_id', type: 'battery_select', label: 'Battery Used', required: true },
          { id: 'battery_start', type: 'number', label: 'Battery Start %', required: true },
          { id: 'battery_end', type: 'number', label: 'Battery End %', required: true },
          { id: 'max_altitude', type: 'number', label: 'Max Altitude (AGL)', required: true },
          { id: 'flight_type', type: 'select', label: 'Flight Type', required: true, options: [
            { value: 'survey', label: 'Survey' },
            { value: 'inspection', label: 'Inspection' },
            { value: 'training', label: 'Training' },
            { value: 'test', label: 'Test Flight' },
          ]},
          { id: 'airdata_log_id', type: 'text', label: 'AirData Log ID', required: true },
          { id: 'notes', type: 'textarea', label: 'Incidents/Notes', required: false },
        ]
      },
      {
        id: 'summary',
        title: 'Daily Summary',
        fields: [
          { id: 'total_flights', type: 'calculated', label: 'Total Flights', calculated: true },
          { id: 'total_flight_time', type: 'calculated', label: 'Total Flight Time', calculated: true },
          { id: 'equipment_issues', type: 'textarea', label: 'Equipment Issues', required: false },
          { id: 'maintenance_required', type: 'yesno_text', label: 'Maintenance Required', required: false },
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'pic_signature', type: 'signature', label: 'PIC Signature', required: true },
          { id: 'signoff_date', type: 'date', label: 'Date', required: true },
        ]
      }
    ]
  },

  // ========================================
  // EQUIPMENT INSPECTION
  // ========================================
  equipment_inspection: {
    id: 'equipment_inspection',
    name: 'Equipment Inspection',
    shortName: 'Equipment',
    category: 'tracking',
    description: 'Track RPAS and support equipment condition',
    icon: 'Wrench',
    version: '1.0',
    sections: [
      {
        id: 'header',
        title: 'Inspection Information',
        fields: [
          { id: 'inspection_id', type: 'auto_id', label: 'Inspection ID', required: true },
          { id: 'date', type: 'date', label: 'Date', required: true, defaultToday: true },
          { id: 'inspector', type: 'operator_select', label: 'Inspector', required: true },
          { id: 'equipment_type', type: 'select', label: 'Equipment Type', required: true, options: [
            { value: 'rpas', label: 'RPAS' },
            { value: 'ground_control', label: 'Ground Control Station' },
            { value: 'battery', label: 'Battery' },
            { value: 'payload', label: 'Payload' },
            { value: 'support', label: 'Support Equipment' },
          ]},
          { id: 'equipment_id', type: 'equipment_select', label: 'Equipment ID', required: true },
        ]
      },
      {
        id: 'checklist',
        title: 'Inspection Checklist',
        dynamicByEquipmentType: true,
        repeatable: true,
        fields: [
          { id: 'item', type: 'text', label: 'Item', required: true },
          { id: 'condition', type: 'select', label: 'Condition', required: true, options: [
            { value: 'pass', label: 'Pass' },
            { value: 'fail', label: 'Fail' },
            { value: 'na', label: 'N/A' },
          ]},
          { id: 'notes', type: 'text', label: 'Notes', required: false, showIf: 'condition === "fail"' },
        ]
      },
      {
        id: 'results',
        title: 'Results',
        fields: [
          { id: 'overall_status', type: 'select', label: 'Overall Status', required: true, options: [
            { value: 'pass', label: 'Pass - Serviceable' },
            { value: 'fail', label: 'Fail - Remove from Service' },
          ]},
          { id: 'defects_found', type: 'repeatable_text', label: 'Defects Found', required: false, showIf: 'overall_status === "fail"' },
          { id: 'action_required', type: 'textarea', label: 'Action Required', required: false, showIf: 'overall_status === "fail"' },
          { id: 'locked_out', type: 'yesno', label: 'Equipment Locked Out?', required: true, showIf: 'overall_status === "fail"' },
          { id: 'lockout_tag', type: 'text', label: 'Lock-out Tag #', required: false, showIf: 'locked_out === true' },
        ]
      },
      {
        id: 'corrective',
        title: 'Corrective Action',
        showIf: 'overall_status === "fail"',
        fields: [
          { id: 'action_description', type: 'textarea', label: 'Action Description', required: true },
          { id: 'responsible', type: 'operator_select', label: 'Responsible Party', required: true },
          { id: 'due_date', type: 'date', label: 'Due Date', required: true },
          { id: 'completion_date', type: 'date', label: 'Completion Date', required: false },
          { id: 'return_to_service', type: 'signature', label: 'Return to Service Approved By', required: false },
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'inspector_signature', type: 'signature', label: 'Inspector Signature', required: true },
        ]
      }
    ]
  },

  // ========================================
  // PPE INSPECTION
  // ========================================
  ppe_inspection: {
    id: 'ppe_inspection',
    name: 'PPE Inspection',
    shortName: 'PPE',
    category: 'tracking',
    description: 'CSA/ANSI compliance tracking',
    icon: 'HardHat',
    version: '1.0',
    sections: [
      {
        id: 'header',
        title: 'Inspection Information',
        fields: [
          { id: 'inspection_id', type: 'auto_id', label: 'Inspection ID', required: true },
          { id: 'date', type: 'date', label: 'Date', required: true, defaultToday: true },
          { id: 'inspector', type: 'operator_select', label: 'Inspector', required: true },
        ]
      },
      {
        id: 'items',
        title: 'PPE Items',
        repeatable: true,
        repeatLabel: 'Add PPE Item',
        fields: [
          { id: 'ppe_type', type: 'select', label: 'PPE Type', required: true, options: [
            { value: 'hard_hat', label: 'Hard Hat' },
            { value: 'safety_glasses', label: 'Safety Glasses' },
            { value: 'hi_vis', label: 'Hi-Vis Vest' },
            { value: 'boots', label: 'Safety Boots' },
            { value: 'gloves', label: 'Gloves' },
            { value: 'hearing', label: 'Hearing Protection' },
            { value: 'fall_protection', label: 'Fall Protection' },
            { value: 'respirator', label: 'Respirator' },
          ]},
          { id: 'assigned_to', type: 'operator_select', label: 'Assigned To', required: true },
          { id: 'manufacturer', type: 'text', label: 'Manufacturer', required: true },
          { id: 'model', type: 'text', label: 'Model', required: true },
          { id: 'serial_number', type: 'text', label: 'Serial/Lot #', required: false },
          { id: 'manufacture_date', type: 'date', label: 'Manufacture Date', required: false },
          { id: 'expiry_date', type: 'date', label: 'Expiry Date', required: false },
          { id: 'visual_condition', type: 'select', label: 'Visual Condition', required: true, options: [
            { value: 'pass', label: 'Pass' },
            { value: 'fail', label: 'Fail' },
          ]},
          { id: 'functional_test', type: 'select', label: 'Functional Test', required: true, options: [
            { value: 'pass', label: 'Pass' },
            { value: 'fail', label: 'Fail' },
            { value: 'na', label: 'N/A' },
          ]},
          { id: 'cleanliness', type: 'select', label: 'Cleanliness', required: true, options: [
            { value: 'pass', label: 'Pass' },
            { value: 'fail', label: 'Fail' },
          ]},
          { id: 'defects', type: 'text', label: 'Defects Found', required: false },
          { id: 'disposition', type: 'select', label: 'Disposition', required: true, options: [
            { value: 'serviceable', label: 'Serviceable' },
            { value: 'replace', label: 'Replace' },
            { value: 'repair', label: 'Repair' },
          ]},
          { id: 'replacement_ordered', type: 'yesno', label: 'Replacement Ordered?', required: false, showIf: 'disposition === "replace"' },
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'inspector_signature', type: 'signature', label: 'Inspector Signature', required: true },
        ]
      }
    ]
  },

  // ========================================
  // TRAINING RECORD
  // ========================================
  training_record: {
    id: 'training_record',
    name: 'Training Record',
    shortName: 'Training',
    category: 'tracking',
    description: 'Personnel competency tracking',
    icon: 'GraduationCap',
    version: '1.0',
    sections: [
      {
        id: 'header',
        title: 'Record Information',
        fields: [
          { id: 'record_id', type: 'auto_id', label: 'Record ID', required: true },
          { id: 'employee', type: 'operator_select', label: 'Employee', required: true },
        ]
      },
      {
        id: 'training',
        title: 'Training Details',
        fields: [
          { id: 'training_type', type: 'select', label: 'Training Type', required: true, options: [
            { value: 'initial', label: 'Initial' },
            { value: 'refresher', label: 'Refresher' },
            { value: 'specialized', label: 'Specialized' },
            { value: 'certification', label: 'Certification' },
          ]},
          { id: 'course_topic', type: 'text', label: 'Course/Topic', required: true },
          { id: 'provider', type: 'text', label: 'Provider', required: true, helpText: 'Internal or external organization' },
          { id: 'trainer', type: 'text', label: 'Trainer Name', required: true },
          { id: 'date_completed', type: 'date', label: 'Date Completed', required: true },
          { id: 'duration', type: 'number', label: 'Duration (hours)', required: true },
          { id: 'location', type: 'text', label: 'Location', required: true },
        ]
      },
      {
        id: 'certification',
        title: 'Certification',
        fields: [
          { id: 'cert_issued', type: 'yesno', label: 'Certificate Issued?', required: true },
          { id: 'cert_number', type: 'text', label: 'Certificate Number', required: false, showIf: 'cert_issued === true' },
          { id: 'expiry_date', type: 'date', label: 'Expiry Date', required: false },
          { id: 'renewal_required', type: 'calculated', label: 'Renewal Required', calculated: true },
        ]
      },
      {
        id: 'assessment',
        title: 'Competency Assessment',
        fields: [
          { id: 'assessment_method', type: 'select', label: 'Assessment Method', required: false, options: [
            { value: 'written', label: 'Written' },
            { value: 'practical', label: 'Practical' },
            { value: 'observation', label: 'Observation' },
          ]},
          { id: 'assessment_result', type: 'select', label: 'Assessment Result', required: false, options: [
            { value: 'pass', label: 'Pass' },
            { value: 'fail', label: 'Fail' },
          ]},
          { id: 'competency_verified', type: 'signature', label: 'Competency Verified By', required: true },
        ]
      },
      {
        id: 'attachments',
        title: 'Attachments',
        fields: [
          { id: 'certificate_copy', type: 'file_upload', label: 'Certificate Copy', required: false },
          { id: 'training_materials', type: 'file_upload', label: 'Training Materials', required: false },
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'employee_signature', type: 'signature', label: 'Employee Acknowledgment', required: true },
          { id: 'supervisor_signature', type: 'signature', label: 'Supervisor Verification', required: true },
        ]
      }
    ]
  },

  // ========================================
  // SAFETY MEETING LOG
  // ========================================
  safety_meeting_log: {
    id: 'safety_meeting_log',
    name: 'Safety Meeting Log',
    shortName: 'Safety Meeting',
    category: 'tracking',
    description: 'Document tailgate and safety planning meetings',
    icon: 'Users',
    version: '1.0',
    sections: [
      {
        id: 'header',
        title: 'Meeting Information',
        fields: [
          { id: 'meeting_id', type: 'auto_id', label: 'Meeting ID', required: true },
          { id: 'date', type: 'date', label: 'Date', required: true, defaultToday: true },
          { id: 'time', type: 'time', label: 'Time', required: true },
          { id: 'meeting_type', type: 'select', label: 'Meeting Type', required: true, options: [
            { value: 'tailgate', label: 'Tailgate' },
            { value: 'safety_planning', label: 'Safety Planning' },
            { value: 'toolbox_talk', label: 'Toolbox Talk' },
            { value: 'incident_review', label: 'Incident Review' },
          ]},
          { id: 'location_project', type: 'text', label: 'Location/Project', required: true },
          { id: 'meeting_lead', type: 'operator_select', label: 'Meeting Led By', required: true },
        ]
      },
      {
        id: 'attendees',
        title: 'Attendees',
        fields: [
          { id: 'attendees', type: 'crew_multi_signature', label: 'Attendees', required: true },
        ]
      },
      {
        id: 'content',
        title: 'Content',
        fields: [
          { id: 'topics', type: 'textarea', label: 'Topics Discussed', required: true, rows: 4 },
          { id: 'hazards_reviewed', type: 'textarea', label: 'Hazards Reviewed', required: false },
          { id: 'incidents_discussed', type: 'textarea', label: 'Incidents/Near Misses Discussed', required: false },
          { id: 'lessons_shared', type: 'textarea', label: 'Lessons Learned Shared', required: false },
        ]
      },
      {
        id: 'actions',
        title: 'Action Items',
        repeatable: true,
        repeatLabel: 'Add Action Item',
        fields: [
          { id: 'action', type: 'text', label: 'Action Item', required: true },
          { id: 'assigned_to', type: 'operator_select', label: 'Assigned To', required: true },
          { id: 'due_date', type: 'date', label: 'Due Date', required: true },
          { id: 'status', type: 'select', label: 'Status', required: true, options: [
            { value: 'open', label: 'Open' },
            { value: 'complete', label: 'Complete' },
          ]},
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'all_signatures', type: 'multi_signature', label: 'All Attendee Signatures', required: true },
          { id: 'meeting_duration', type: 'number', label: 'Meeting Duration (minutes)', required: true },
        ]
      }
    ]
  },

  // ========================================
  // VEHICLE INSPECTION
  // ========================================
  vehicle_inspection: {
    id: 'vehicle_inspection',
    name: 'Vehicle Inspection',
    shortName: 'Vehicle',
    category: 'tracking',
    description: 'Pre/post trip compliance',
    icon: 'Truck',
    version: '1.0',
    sections: [
      {
        id: 'header',
        title: 'Inspection Information',
        fields: [
          { id: 'inspection_id', type: 'auto_id', label: 'Inspection ID', required: true },
          { id: 'date', type: 'date', label: 'Date', required: true, defaultToday: true },
          { id: 'inspection_type', type: 'select', label: 'Inspection Type', required: true, options: [
            { value: 'pre_trip', label: 'Pre-Trip' },
            { value: 'post_trip', label: 'Post-Trip' },
          ]},
          { id: 'vehicle_id', type: 'text', label: 'Vehicle ID/Plate', required: true },
          { id: 'odometer', type: 'number', label: 'Odometer Reading', required: true },
          { id: 'driver', type: 'operator_select', label: 'Driver', required: true },
        ]
      },
      {
        id: 'checklist',
        title: 'Inspection Checklist',
        fields: [
          { id: 'tires', type: 'select', label: 'Tires', required: true, options: [{ value: 'pass', label: 'Pass' }, { value: 'fail', label: 'Fail' }] },
          { id: 'fluids', type: 'select', label: 'Fluids (oil, coolant, washer)', required: true, options: [{ value: 'pass', label: 'Pass' }, { value: 'fail', label: 'Fail' }] },
          { id: 'lights', type: 'select', label: 'Lights (headlights, brake, signals)', required: true, options: [{ value: 'pass', label: 'Pass' }, { value: 'fail', label: 'Fail' }] },
          { id: 'brakes', type: 'select', label: 'Brakes', required: true, options: [{ value: 'pass', label: 'Pass' }, { value: 'fail', label: 'Fail' }] },
          { id: 'mirrors', type: 'select', label: 'Mirrors', required: true, options: [{ value: 'pass', label: 'Pass' }, { value: 'fail', label: 'Fail' }] },
          { id: 'wipers', type: 'select', label: 'Wipers', required: true, options: [{ value: 'pass', label: 'Pass' }, { value: 'fail', label: 'Fail' }] },
          { id: 'horn', type: 'select', label: 'Horn', required: true, options: [{ value: 'pass', label: 'Pass' }, { value: 'fail', label: 'Fail' }] },
          { id: 'seatbelts', type: 'select', label: 'Seatbelts', required: true, options: [{ value: 'pass', label: 'Pass' }, { value: 'fail', label: 'Fail' }] },
          { id: 'first_aid_kit', type: 'select', label: 'First Aid Kit', required: true, options: [{ value: 'pass', label: 'Pass' }, { value: 'fail', label: 'Fail' }] },
          { id: 'fire_extinguisher', type: 'select', label: 'Fire Extinguisher', required: true, options: [{ value: 'pass', label: 'Pass' }, { value: 'fail', label: 'Fail' }] },
        ]
      },
      {
        id: 'defects',
        title: 'Defects',
        fields: [
          { id: 'defects_found', type: 'textarea', label: 'Defects Found', required: false },
          { id: 'action_taken', type: 'textarea', label: 'Action Taken', required: false },
          { id: 'vehicle_serviceable', type: 'yesno', label: 'Vehicle Serviceable?', required: true },
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'driver_signature', type: 'signature', label: 'Driver Signature', required: true },
        ]
      }
    ]
  },

  // ========================================
  // FORMAL HAZARD ASSESSMENT (FHA)
  // ========================================
  formal_hazard_assessment: {
    id: 'formal_hazard_assessment',
    name: 'Formal Hazard Assessment',
    shortName: 'FHA',
    category: 'pre_operation',
    description: 'Comprehensive hazard analysis for project planning - feeds FLHA',
    icon: 'Shield',
    version: '1.0',
    sections: [
      {
        id: 'header',
        title: 'Assessment Information',
        fields: [
          { id: 'form_id', type: 'auto_id', label: 'Form ID', required: true },
          { id: 'project', type: 'project_select', label: 'Project', required: true },
          { id: 'assessment_date', type: 'date', label: 'Assessment Date', required: true, defaultToday: true },
          { id: 'assessor', type: 'operator_select', label: 'Assessor', required: true },
          { id: 'assessment_type', type: 'select', label: 'Assessment Type', required: true, options: [
            { value: 'initial', label: 'Initial Assessment' },
            { value: 'revision', label: 'Revision' },
            { value: 'periodic_review', label: 'Periodic Review' },
          ]},
          { id: 'scope_description', type: 'textarea', label: 'Scope of Work', required: true, helpText: 'Describe the operations covered by this assessment' },
        ]
      },
      {
        id: 'tasks',
        title: 'Task Inventory',
        description: 'List all tasks involved in this project/operation',
        repeatable: true,
        repeatLabel: 'Add Task',
        fields: [
          { id: 'task_name', type: 'text', label: 'Task Name', required: true },
          { id: 'task_description', type: 'textarea', label: 'Task Description', required: true },
          { id: 'task_category', type: 'select', label: 'Task Category', required: true, options: [
            { value: 'rpas_operation', label: 'RPAS Operation' },
            { value: 'ground_support', label: 'Ground Support' },
            { value: 'equipment_handling', label: 'Equipment Handling' },
            { value: 'vehicle_operation', label: 'Vehicle Operation' },
            { value: 'site_setup', label: 'Site Setup/Teardown' },
            { value: 'data_collection', label: 'Data Collection' },
            { value: 'environmental', label: 'Environmental Work' },
            { value: 'other', label: 'Other' },
          ]},
          { id: 'frequency', type: 'select', label: 'Task Frequency', required: true, options: [
            { value: 'every_flight', label: 'Every Flight' },
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'as_needed', label: 'As Needed' },
            { value: 'one_time', label: 'One Time' },
          ]},
          { id: 'personnel_required', type: 'text', label: 'Personnel Required', required: true },
          { id: 'equipment_required', type: 'textarea', label: 'Equipment Required', required: false },
        ]
      },
      {
        id: 'hazards',
        title: 'Hazard Identification',
        description: 'Identify all hazards associated with the tasks',
        repeatable: true,
        repeatLabel: 'Add Hazard',
        fields: [
          { id: 'related_task', type: 'text', label: 'Related Task(s)', required: true },
          { id: 'hazard_category', type: 'select', label: 'Hazard Category', required: true, options: 'HAZARD_CATEGORIES' },
          { id: 'hazard_description', type: 'textarea', label: 'Hazard Description', required: true },
          { id: 'source_identification', type: 'textarea', label: 'Source/Cause', required: true, helpText: 'What creates this hazard?' },
          { id: 'who_affected', type: 'multiselect', label: 'Who Could Be Affected', required: true, options: [
            { value: 'crew', label: 'Flight Crew' },
            { value: 'ground_crew', label: 'Ground Crew' },
            { value: 'client', label: 'Client Personnel' },
            { value: 'public', label: 'Public' },
            { value: 'emergency_responders', label: 'Emergency Responders' },
          ]},
          { id: 'severity', type: 'select', label: 'Severity (Uncontrolled)', required: true, options: 'SEVERITY_RATINGS' },
          { id: 'probability', type: 'select', label: 'Probability (Uncontrolled)', required: true, options: 'PROBABILITY_RATINGS' },
          { id: 'initial_risk', type: 'risk_matrix', label: 'Initial Risk Level', calculated: true },
        ]
      },
      {
        id: 'controls',
        title: 'Control Measures',
        description: 'Define controls following the Hierarchy of Controls',
        repeatable: true,
        repeatLabel: 'Add Control',
        fields: [
          { id: 'related_hazard', type: 'text', label: 'Related Hazard', required: true },
          { id: 'control_type', type: 'select', label: 'Control Type (Hierarchy)', required: true, options: 'CONTROL_TYPES' },
          { id: 'control_description', type: 'textarea', label: 'Control Description', required: true },
          { id: 'responsible_party', type: 'text', label: 'Responsible Party', required: true },
          { id: 'verification_method', type: 'select', label: 'Verification Method', required: true, options: [
            { value: 'visual_inspection', label: 'Visual Inspection' },
            { value: 'checklist', label: 'Checklist Verification' },
            { value: 'testing', label: 'Testing/Demonstration' },
            { value: 'documentation', label: 'Documentation Review' },
            { value: 'training_confirmation', label: 'Training Confirmation' },
          ]},
          { id: 'residual_severity', type: 'select', label: 'Residual Severity', required: true, options: 'SEVERITY_RATINGS' },
          { id: 'residual_probability', type: 'select', label: 'Residual Probability', required: true, options: 'PROBABILITY_RATINGS' },
          { id: 'residual_risk', type: 'risk_matrix', label: 'Residual Risk Level', calculated: true },
          { id: 'acceptable', type: 'yesno', label: 'Residual Risk Acceptable?', required: true },
          { id: 'additional_controls_needed', type: 'textarea', label: 'Additional Controls Needed', required: false, showIf: 'acceptable === false' },
        ]
      },
      {
        id: 'ppe_requirements',
        title: 'PPE Requirements',
        fields: [
          { id: 'required_ppe', type: 'checklist', label: 'Required PPE', required: true, options: [
            { value: 'hard_hat', label: 'Hard Hat' },
            { value: 'safety_glasses', label: 'Safety Glasses' },
            { value: 'high_vis', label: 'High Visibility Vest' },
            { value: 'safety_boots', label: 'Safety Boots' },
            { value: 'gloves', label: 'Gloves' },
            { value: 'hearing_protection', label: 'Hearing Protection' },
            { value: 'sun_protection', label: 'Sun Protection' },
            { value: 'cold_weather', label: 'Cold Weather Gear' },
            { value: 'rain_gear', label: 'Rain Gear' },
            { value: 'respirator', label: 'Respirator' },
          ]},
          { id: 'ppe_notes', type: 'textarea', label: 'PPE Notes/Special Requirements', required: false },
        ]
      },
      {
        id: 'training_requirements',
        title: 'Training Requirements',
        fields: [
          { id: 'required_training', type: 'checklist', label: 'Required Training/Certifications', required: true, options: [
            { value: 'rpas_pilot', label: 'RPAS Pilot Certificate (Basic/Advanced)' },
            { value: 'first_aid', label: 'First Aid Certification' },
            { value: 'defensive_driving', label: 'Defensive Driving' },
            { value: 'whmis', label: 'WHMIS' },
            { value: 'ground_disturbance', label: 'Ground Disturbance' },
            { value: 'wildlife_awareness', label: 'Wildlife Awareness' },
            { value: 'bear_aware', label: 'Bear Aware' },
            { value: 'h2s_alive', label: 'H2S Alive' },
            { value: 'confined_space', label: 'Confined Space Entry' },
            { value: 'fall_protection', label: 'Fall Protection' },
          ]},
          { id: 'training_notes', type: 'textarea', label: 'Additional Training Notes', required: false },
        ]
      },
      {
        id: 'review',
        title: 'Review & Approval',
        fields: [
          { id: 'review_date', type: 'date', label: 'Review Date', required: true },
          { id: 'next_review', type: 'date', label: 'Next Review Date', required: true },
          { id: 'assessor_signature', type: 'signature', label: 'Assessor Signature', required: true },
          { id: 'reviewer_signature', type: 'signature', label: 'Reviewer/Supervisor Signature', required: true },
          { id: 'approval_notes', type: 'textarea', label: 'Review Notes', required: false },
        ]
      }
    ]
  },

  // ========================================
  // FIRST AID ASSESSMENT
  // ========================================
  first_aid_assessment: {
    id: 'first_aid_assessment',
    name: 'First Aid Assessment',
    shortName: 'First Aid',
    category: 'pre_operation',
    description: 'OHS first aid requirements assessment for worksites',
    icon: 'Shield',
    version: '1.0',
    sections: [
      {
        id: 'header',
        title: 'Assessment Information',
        fields: [
          { id: 'form_id', type: 'auto_id', label: 'Form ID', required: true },
          { id: 'project', type: 'project_select', label: 'Project', required: true },
          { id: 'assessment_date', type: 'date', label: 'Assessment Date', required: true, defaultToday: true },
          { id: 'assessor', type: 'operator_select', label: 'Assessor', required: true },
          { id: 'work_location', type: 'text', label: 'Work Location', required: true },
          { id: 'location_gps', type: 'gps', label: 'GPS Coordinates', required: true },
        ]
      },
      {
        id: 'worksite_classification',
        title: 'Worksite Classification',
        description: 'Per OHS First Aid Regulation',
        fields: [
          { id: 'hazard_rating', type: 'select', label: 'Worksite Hazard Rating', required: true, options: [
            { value: 'low', label: 'Low Hazard - Office/clerical type work' },
            { value: 'moderate', label: 'Moderate Hazard - Light industrial, warehousing' },
            { value: 'high', label: 'High Hazard - Construction, forestry, mining' },
          ]},
          { id: 'workers_per_shift', type: 'number', label: 'Number of Workers Per Shift', required: true },
          { id: 'travel_time_medical', type: 'select', label: 'Travel Time to Medical Facility', required: true, options: [
            { value: 'under_20', label: 'Under 20 minutes' },
            { value: '20_to_40', label: '20-40 minutes' },
            { value: 'over_40', label: 'Over 40 minutes' },
          ]},
          { id: 'remote_worksite', type: 'yesno', label: 'Is this a Remote Worksite?', required: true, helpText: 'More than 40 minutes from medical facility' },
        ]
      },
      {
        id: 'medical_facilities',
        title: 'Nearest Medical Facilities',
        fields: [
          { id: 'nearest_hospital', type: 'text', label: 'Nearest Hospital Name', required: true },
          { id: 'hospital_address', type: 'textarea', label: 'Hospital Address', required: true },
          { id: 'hospital_phone', type: 'phone', label: 'Hospital Phone', required: true },
          { id: 'hospital_distance', type: 'text', label: 'Distance (km)', required: true },
          { id: 'hospital_time', type: 'text', label: 'Travel Time (minutes)', required: true },
          { id: 'nearest_clinic', type: 'text', label: 'Nearest Walk-In Clinic', required: false },
          { id: 'clinic_address', type: 'textarea', label: 'Clinic Address', required: false },
          { id: 'clinic_phone', type: 'phone', label: 'Clinic Phone', required: false },
        ]
      },
      {
        id: 'first_aid_requirements',
        title: 'First Aid Requirements',
        description: 'Based on worksite classification',
        fields: [
          { id: 'kit_level_required', type: 'select', label: 'First Aid Kit Level Required', required: true, options: [
            { value: 'level_1', label: 'Level 1 - Personal Kit' },
            { value: 'level_2', label: 'Level 2 - Basic Kit' },
            { value: 'level_3', label: 'Level 3 - Intermediate Kit' },
          ]},
          { id: 'first_aiders_required', type: 'number', label: 'Number of First Aiders Required', required: true },
          { id: 'first_aid_level_required', type: 'select', label: 'First Aid Certification Level Required', required: true, options: [
            { value: 'ofa_1', label: 'OFA Level 1 (8 hours)' },
            { value: 'ofa_2', label: 'OFA Level 2 (16 hours)' },
            { value: 'ofa_3', label: 'OFA Level 3 (70 hours)' },
            { value: 'emt', label: 'Emergency Medical Technician' },
          ]},
          { id: 'first_aid_room', type: 'yesno', label: 'First Aid Room Required?', required: true },
          { id: 'transportation_required', type: 'yesno', label: 'Emergency Transportation Required?', required: true },
        ]
      },
      {
        id: 'current_resources',
        title: 'Current First Aid Resources',
        fields: [
          { id: 'kit_available', type: 'yesno', label: 'First Aid Kit Available?', required: true },
          { id: 'kit_location', type: 'text', label: 'Kit Location', required: true },
          { id: 'kit_last_inspected', type: 'date', label: 'Kit Last Inspected', required: true },
          { id: 'aed_available', type: 'yesno', label: 'AED Available?', required: false },
          { id: 'aed_location', type: 'text', label: 'AED Location', required: false, showIf: 'aed_available === true' },
        ]
      },
      {
        id: 'first_aiders',
        title: 'Designated First Aiders',
        repeatable: true,
        repeatLabel: 'Add First Aider',
        fields: [
          { id: 'name', type: 'operator_select', label: 'First Aider Name', required: true },
          { id: 'certification_level', type: 'select', label: 'Certification Level', required: true, options: [
            { value: 'ofa_1', label: 'OFA Level 1' },
            { value: 'ofa_2', label: 'OFA Level 2' },
            { value: 'ofa_3', label: 'OFA Level 3' },
            { value: 'emt', label: 'EMT' },
            { value: 'other', label: 'Other' },
          ]},
          { id: 'certificate_number', type: 'text', label: 'Certificate Number', required: true },
          { id: 'expiry_date', type: 'date', label: 'Expiry Date', required: true },
          { id: 'renewal_required', type: 'calculated', label: 'Renewal Status' },
        ]
      },
      {
        id: 'emergency_communication',
        title: 'Emergency Communication',
        fields: [
          { id: 'cell_coverage', type: 'yesno', label: 'Cell Phone Coverage Available?', required: true },
          { id: 'sat_phone_required', type: 'yesno', label: 'Satellite Phone Required?', required: true },
          { id: 'sat_phone_available', type: 'yesno', label: 'Satellite Phone Available?', required: false, showIf: 'sat_phone_required === true' },
          { id: 'radio_available', type: 'yesno', label: 'Two-Way Radio Available?', required: false },
          { id: 'emergency_contacts', type: 'repeatable_person', label: 'Emergency Contact List', required: true },
        ]
      },
      {
        id: 'gaps_actions',
        title: 'Gaps & Action Items',
        fields: [
          { id: 'gaps_identified', type: 'textarea', label: 'Gaps Identified', required: false },
          { id: 'action_items', type: 'textarea', label: 'Action Items Required', required: false },
          { id: 'action_due_date', type: 'date', label: 'Action Items Due Date', required: false },
          { id: 'compliance_confirmed', type: 'yesno', label: 'First Aid Requirements Met?', required: true },
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'assessor_signature', type: 'signature', label: 'Assessor Signature', required: true },
          { id: 'supervisor_signature', type: 'signature', label: 'Supervisor Approval', required: true },
          { id: 'assessment_notes', type: 'textarea', label: 'Additional Notes', required: false },
        ]
      }
    ]
  },

  // ========================================
  // POST-FLIGHT REPORT
  // ========================================
  post_flight_report: {
    id: 'post_flight_report',
    name: 'Post-Flight Report',
    shortName: 'PFR',
    category: 'daily_field',
    description: 'Document flight outcomes, issues, and recommendations after operations',
    icon: 'FileText',
    version: '1.0',
    sections: [
      {
        id: 'header',
        title: 'Flight Information',
        fields: [
          { id: 'form_id', type: 'auto_id', label: 'Report ID', required: true },
          { id: 'project', type: 'project_select', label: 'Project', required: true },
          { id: 'date', type: 'date', label: 'Flight Date', required: true, defaultToday: true },
          { id: 'aircraft', type: 'aircraft_select', label: 'Aircraft', required: true },
          { id: 'pilot_name', type: 'operator_select', label: 'Pilot in Command', required: true },
          { id: 'flight_number', type: 'text', label: 'Flight Number', required: false },
          { id: 'total_flight_time', type: 'number', label: 'Total Flight Time (minutes)', required: true },
          { id: 'total_flights', type: 'number', label: 'Number of Flights', required: true },
        ]
      },
      {
        id: 'mission_summary',
        title: 'Mission Summary',
        fields: [
          { id: 'mission_objectives', type: 'textarea', label: 'Mission Objectives', required: true },
          { id: 'objectives_met', type: 'select', label: 'Objectives Met?', required: true, options: [
            { value: 'fully', label: 'Fully Achieved' },
            { value: 'partially', label: 'Partially Achieved' },
            { value: 'not_met', label: 'Not Achieved' },
            { value: 'exceeded', label: 'Exceeded Expectations' },
          ]},
          { id: 'coverage_area', type: 'text', label: 'Coverage Area (acres/km)', required: false },
          { id: 'data_collected', type: 'multiselect', label: 'Data Collected', required: false, options: [
            { value: 'rgb', label: 'RGB Imagery' },
            { value: 'thermal', label: 'Thermal Imagery' },
            { value: 'multispectral', label: 'Multispectral' },
            { value: 'lidar', label: 'LiDAR Point Cloud' },
            { value: 'video', label: 'Video Recording' },
            { value: 'other', label: 'Other' },
          ]},
        ]
      },
      {
        id: 'conditions',
        title: 'Operating Conditions',
        fields: [
          { id: 'weather_actual', type: 'textarea', label: 'Actual Weather Conditions', required: true },
          { id: 'wind_speed', type: 'text', label: 'Wind Speed (km/h)', required: true },
          { id: 'visibility', type: 'select', label: 'Visibility', required: true, options: [
            { value: 'excellent', label: 'Excellent (>10 km)' },
            { value: 'good', label: 'Good (5-10 km)' },
            { value: 'moderate', label: 'Moderate (2-5 km)' },
            { value: 'poor', label: 'Poor (<2 km)' },
          ]},
          { id: 'airspace_issues', type: 'yesno', label: 'Any Airspace Issues?', required: true },
          { id: 'airspace_details', type: 'textarea', label: 'Airspace Issue Details', required: false, showIf: 'airspace_issues === true' },
        ]
      },
      {
        id: 'aircraft_performance',
        title: 'Aircraft Performance',
        fields: [
          { id: 'performance_rating', type: 'select', label: 'Overall Aircraft Performance', required: true, options: [
            { value: 'excellent', label: 'Excellent - No issues' },
            { value: 'good', label: 'Good - Minor issues' },
            { value: 'fair', label: 'Fair - Some concerns' },
            { value: 'poor', label: 'Poor - Significant issues' },
          ]},
          { id: 'battery_performance', type: 'textarea', label: 'Battery Performance Notes', required: false },
          { id: 'batteries_used', type: 'number', label: 'Number of Batteries Used', required: true },
          { id: 'any_warnings', type: 'yesno', label: 'Any Aircraft Warnings/Errors?', required: true },
          { id: 'warning_details', type: 'textarea', label: 'Warning/Error Details', required: false, showIf: 'any_warnings === true' },
          { id: 'maintenance_required', type: 'yesno', label: 'Maintenance Required?', required: true },
          { id: 'maintenance_notes', type: 'textarea', label: 'Maintenance Notes', required: false, showIf: 'maintenance_required === true' },
        ]
      },
      {
        id: 'safety',
        title: 'Safety Review',
        fields: [
          { id: 'incidents_occurred', type: 'yesno', label: 'Any Incidents or Near Misses?', required: true },
          { id: 'incident_description', type: 'textarea', label: 'Incident/Near Miss Description', required: false, showIf: 'incidents_occurred === true' },
          { id: 'hazards_encountered', type: 'textarea', label: 'Hazards Encountered', required: false },
          { id: 'safety_observations', type: 'textarea', label: 'Safety Observations', required: false },
        ]
      },
      {
        id: 'recommendations',
        title: 'Recommendations',
        fields: [
          { id: 'lessons_learned', type: 'textarea', label: 'Lessons Learned', required: false },
          { id: 'recommendations', type: 'textarea', label: 'Recommendations for Future Ops', required: false },
          { id: 'client_feedback', type: 'textarea', label: 'Client Feedback (if any)', required: false },
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'pilot_signature', type: 'signature', label: 'Pilot Signature', required: true },
          { id: 'reviewer_signature', type: 'signature', label: 'Operations Review', required: false },
          { id: 'additional_notes', type: 'textarea', label: 'Additional Notes', required: false },
        ]
      }
    ]
  },

  // ========================================
  // BATTERY CYCLE LOG
  // ========================================
  battery_cycle_log: {
    id: 'battery_cycle_log',
    name: 'Battery Cycle Log',
    shortName: 'BCL',
    category: 'tracking',
    description: 'Track battery usage, cycles, and health status',
    icon: 'Battery',
    version: '1.0',
    sections: [
      {
        id: 'header',
        title: 'Battery Information',
        fields: [
          { id: 'form_id', type: 'auto_id', label: 'Log ID', required: true },
          { id: 'date', type: 'date', label: 'Date', required: true, defaultToday: true },
          { id: 'battery_id', type: 'text', label: 'Battery ID/Serial', required: true },
          { id: 'battery_model', type: 'text', label: 'Battery Model', required: true },
          { id: 'aircraft', type: 'aircraft_select', label: 'Aircraft Used With', required: false },
          { id: 'operator', type: 'operator_select', label: 'Logged By', required: true },
        ]
      },
      {
        id: 'usage',
        title: 'Usage Details',
        fields: [
          { id: 'cycle_number', type: 'number', label: 'Cycle Number', required: true },
          { id: 'flight_time', type: 'number', label: 'Flight Time (minutes)', required: true },
          { id: 'pre_flight_voltage', type: 'number', label: 'Pre-Flight Voltage (V)', required: true },
          { id: 'post_flight_voltage', type: 'number', label: 'Post-Flight Voltage (V)', required: true },
          { id: 'percent_used', type: 'number', label: 'Percentage Used (%)', required: true },
          { id: 'ambient_temp', type: 'number', label: 'Ambient Temperature (C)', required: false },
          { id: 'max_temp_flight', type: 'number', label: 'Max Temperature During Flight (C)', required: false },
        ]
      },
      {
        id: 'health',
        title: 'Battery Health',
        fields: [
          { id: 'physical_condition', type: 'select', label: 'Physical Condition', required: true, options: [
            { value: 'excellent', label: 'Excellent - No damage' },
            { value: 'good', label: 'Good - Minor wear' },
            { value: 'fair', label: 'Fair - Visible wear' },
            { value: 'poor', label: 'Poor - Damage present' },
            { value: 'retired', label: 'Retired - Do not use' },
          ]},
          { id: 'swelling', type: 'yesno', label: 'Any Swelling?', required: true },
          { id: 'damage_notes', type: 'textarea', label: 'Damage/Issue Notes', required: false },
          { id: 'cells_balanced', type: 'yesno', label: 'Cells Balanced?', required: false },
          { id: 'storage_voltage', type: 'yesno', label: 'Set to Storage Voltage?', required: true },
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'logged_by_signature', type: 'signature', label: 'Logged By', required: true },
          { id: 'notes', type: 'textarea', label: 'Additional Notes', required: false },
        ]
      }
    ]
  },

  // ========================================
  // CLIENT SITE ORIENTATION
  // ========================================
  client_orientation: {
    id: 'client_orientation',
    name: 'Client Site Orientation',
    shortName: 'CSO',
    category: 'pre_operation',
    description: 'Document client site-specific safety requirements and protocols',
    icon: 'Building',
    version: '1.0',
    sections: [
      {
        id: 'header',
        title: 'Orientation Details',
        fields: [
          { id: 'form_id', type: 'auto_id', label: 'Orientation ID', required: true },
          { id: 'date', type: 'date', label: 'Date', required: true, defaultToday: true },
          { id: 'client_name', type: 'client_select', label: 'Client', required: true },
          { id: 'site_name', type: 'text', label: 'Site Name', required: true },
          { id: 'site_address', type: 'textarea', label: 'Site Address', required: true },
          { id: 'client_contact', type: 'text', label: 'Client Contact Name', required: true },
          { id: 'client_phone', type: 'phone', label: 'Client Contact Phone', required: true },
          { id: 'crew_attending', type: 'crew_multi_select', label: 'Crew Attending', required: true },
        ]
      },
      {
        id: 'site_requirements',
        title: 'Site Requirements',
        fields: [
          { id: 'ppe_required', type: 'multiselect', label: 'PPE Required', required: true, options: [
            { value: 'hard_hat', label: 'Hard Hat' },
            { value: 'safety_vest', label: 'High-Vis Vest' },
            { value: 'safety_glasses', label: 'Safety Glasses' },
            { value: 'steel_toe', label: 'Steel-Toe Boots' },
            { value: 'hearing', label: 'Hearing Protection' },
            { value: 'gloves', label: 'Work Gloves' },
            { value: 'fr_clothing', label: 'FR Clothing' },
            { value: 'h2s_monitor', label: 'H2S Monitor' },
            { value: 'other', label: 'Other' },
          ]},
          { id: 'other_ppe', type: 'text', label: 'Other PPE Required', required: false, showIf: 'ppe_required includes other' },
          { id: 'site_induction', type: 'yesno', label: 'Site Induction Required?', required: true },
          { id: 'induction_completed', type: 'yesno', label: 'Induction Completed?', required: false, showIf: 'site_induction === true' },
          { id: 'security_clearance', type: 'yesno', label: 'Security Clearance Required?', required: true },
          { id: 'vehicle_requirements', type: 'textarea', label: 'Vehicle Requirements', required: false },
        ]
      },
      {
        id: 'hazards',
        title: 'Site-Specific Hazards',
        fields: [
          { id: 'site_hazards', type: 'multiselect', label: 'Site Hazards Identified', required: true, options: [
            { value: 'heavy_equipment', label: 'Heavy Equipment Operations' },
            { value: 'overhead', label: 'Overhead Work' },
            { value: 'excavation', label: 'Excavations/Trenches' },
            { value: 'confined_space', label: 'Confined Spaces' },
            { value: 'hazardous_materials', label: 'Hazardous Materials' },
            { value: 'high_voltage', label: 'High Voltage' },
            { value: 'wildlife', label: 'Wildlife' },
            { value: 'traffic', label: 'Vehicle Traffic' },
            { value: 'other', label: 'Other' },
          ]},
          { id: 'hazard_details', type: 'textarea', label: 'Hazard Details', required: false },
          { id: 'restricted_areas', type: 'textarea', label: 'Restricted Areas', required: false },
          { id: 'emergency_assembly', type: 'text', label: 'Emergency Assembly Point', required: true },
        ]
      },
      {
        id: 'flight_restrictions',
        title: 'Flight Restrictions',
        fields: [
          { id: 'no_fly_zones', type: 'textarea', label: 'No-Fly Zones on Site', required: false },
          { id: 'altitude_restrictions', type: 'textarea', label: 'Altitude Restrictions', required: false },
          { id: 'timing_restrictions', type: 'textarea', label: 'Timing Restrictions', required: false },
          { id: 'approval_required', type: 'yesno', label: 'Client Approval Required Before Each Flight?', required: true },
          { id: 'radio_channel', type: 'text', label: 'Site Radio Channel', required: false },
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'crew_acknowledgment', type: 'signature', label: 'Crew Acknowledgment', required: true },
          { id: 'client_signature', type: 'signature', label: 'Client Representative Signature', required: false },
          { id: 'notes', type: 'textarea', label: 'Additional Notes', required: false },
        ]
      }
    ]
  },

  // ========================================
  // CREW COMPETENCY CHECK
  // ========================================
  crew_competency_check: {
    id: 'crew_competency_check',
    name: 'Crew Competency Check',
    shortName: 'CCC',
    category: 'tracking',
    description: 'Document crew competency assessments and proficiency checks',
    icon: 'UserCheck',
    version: '1.0',
    sections: [
      {
        id: 'header',
        title: 'Assessment Information',
        fields: [
          { id: 'form_id', type: 'auto_id', label: 'Assessment ID', required: true },
          { id: 'date', type: 'date', label: 'Date', required: true, defaultToday: true },
          { id: 'crew_member', type: 'operator_select', label: 'Crew Member Being Assessed', required: true },
          { id: 'assessor', type: 'operator_select', label: 'Assessor', required: true },
          { id: 'role_assessed', type: 'select', label: 'Role Being Assessed', required: true, options: [
            { value: 'pic', label: 'Pilot in Command' },
            { value: 'pilot', label: 'Pilot' },
            { value: 'vo', label: 'Visual Observer' },
            { value: 'payload_op', label: 'Payload Operator' },
            { value: 'gcs_op', label: 'Ground Control Station Operator' },
          ]},
          { id: 'aircraft_type', type: 'text', label: 'Aircraft Type', required: true },
        ]
      },
      {
        id: 'knowledge',
        title: 'Knowledge Assessment',
        fields: [
          { id: 'regulations_knowledge', type: 'select', label: 'Regulations Knowledge', required: true, options: [
            { value: '5', label: '5 - Excellent' },
            { value: '4', label: '4 - Good' },
            { value: '3', label: '3 - Satisfactory' },
            { value: '2', label: '2 - Needs Improvement' },
            { value: '1', label: '1 - Unsatisfactory' },
          ]},
          { id: 'sop_knowledge', type: 'select', label: 'SOP Knowledge', required: true, options: [
            { value: '5', label: '5 - Excellent' },
            { value: '4', label: '4 - Good' },
            { value: '3', label: '3 - Satisfactory' },
            { value: '2', label: '2 - Needs Improvement' },
            { value: '1', label: '1 - Unsatisfactory' },
          ]},
          { id: 'emergency_procedures', type: 'select', label: 'Emergency Procedures', required: true, options: [
            { value: '5', label: '5 - Excellent' },
            { value: '4', label: '4 - Good' },
            { value: '3', label: '3 - Satisfactory' },
            { value: '2', label: '2 - Needs Improvement' },
            { value: '1', label: '1 - Unsatisfactory' },
          ]},
          { id: 'airspace_knowledge', type: 'select', label: 'Airspace Knowledge', required: true, options: [
            { value: '5', label: '5 - Excellent' },
            { value: '4', label: '4 - Good' },
            { value: '3', label: '3 - Satisfactory' },
            { value: '2', label: '2 - Needs Improvement' },
            { value: '1', label: '1 - Unsatisfactory' },
          ]},
          { id: 'knowledge_notes', type: 'textarea', label: 'Knowledge Assessment Notes', required: false },
        ]
      },
      {
        id: 'practical',
        title: 'Practical Skills Assessment',
        fields: [
          { id: 'preflight_inspection', type: 'select', label: 'Pre-Flight Inspection', required: true, options: [
            { value: '5', label: '5 - Excellent' },
            { value: '4', label: '4 - Good' },
            { value: '3', label: '3 - Satisfactory' },
            { value: '2', label: '2 - Needs Improvement' },
            { value: '1', label: '1 - Unsatisfactory' },
          ]},
          { id: 'flight_control', type: 'select', label: 'Flight Control Proficiency', required: true, options: [
            { value: '5', label: '5 - Excellent' },
            { value: '4', label: '4 - Good' },
            { value: '3', label: '3 - Satisfactory' },
            { value: '2', label: '2 - Needs Improvement' },
            { value: '1', label: '1 - Unsatisfactory' },
          ]},
          { id: 'situational_awareness', type: 'select', label: 'Situational Awareness', required: true, options: [
            { value: '5', label: '5 - Excellent' },
            { value: '4', label: '4 - Good' },
            { value: '3', label: '3 - Satisfactory' },
            { value: '2', label: '2 - Needs Improvement' },
            { value: '1', label: '1 - Unsatisfactory' },
          ]},
          { id: 'communication', type: 'select', label: 'Communication', required: true, options: [
            { value: '5', label: '5 - Excellent' },
            { value: '4', label: '4 - Good' },
            { value: '3', label: '3 - Satisfactory' },
            { value: '2', label: '2 - Needs Improvement' },
            { value: '1', label: '1 - Unsatisfactory' },
          ]},
          { id: 'decision_making', type: 'select', label: 'Decision Making', required: true, options: [
            { value: '5', label: '5 - Excellent' },
            { value: '4', label: '4 - Good' },
            { value: '3', label: '3 - Satisfactory' },
            { value: '2', label: '2 - Needs Improvement' },
            { value: '1', label: '1 - Unsatisfactory' },
          ]},
          { id: 'practical_notes', type: 'textarea', label: 'Practical Skills Notes', required: false },
        ]
      },
      {
        id: 'overall',
        title: 'Overall Assessment',
        fields: [
          { id: 'overall_rating', type: 'select', label: 'Overall Rating', required: true, options: [
            { value: 'competent', label: 'Competent' },
            { value: 'competent_with_conditions', label: 'Competent with Conditions' },
            { value: 'not_yet_competent', label: 'Not Yet Competent' },
          ]},
          { id: 'conditions', type: 'textarea', label: 'Conditions (if applicable)', required: false, showIf: 'overall_rating === competent_with_conditions' },
          { id: 'areas_for_improvement', type: 'textarea', label: 'Areas for Improvement', required: false },
          { id: 'training_recommendations', type: 'textarea', label: 'Training Recommendations', required: false },
          { id: 'next_assessment_date', type: 'date', label: 'Next Assessment Due', required: true },
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'crew_signature', type: 'signature', label: 'Crew Member Signature', required: true },
          { id: 'assessor_signature', type: 'signature', label: 'Assessor Signature', required: true },
          { id: 'additional_notes', type: 'textarea', label: 'Additional Notes', required: false },
        ]
      }
    ]
  },

  // ========================================
  // SITE SURVEY
  // ========================================
  site_survey: {
    id: 'site_survey',
    name: 'Site Survey & Assessment',
    shortName: 'Site Survey',
    category: 'pre_operation',
    description: 'Pre-operation site assessment for RPAS operations',
    icon: 'MapPin',
    version: '1.0',
    sections: [
      {
        id: 'header',
        title: 'Survey Information',
        fields: [
          { id: 'form_id', type: 'auto_id', label: 'Form ID', required: true },
          { id: 'project', type: 'project_select', label: 'Project', required: true },
          { id: 'survey_date', type: 'date', label: 'Survey Date', required: true, defaultToday: true },
          { id: 'surveyor', type: 'user_auto', label: 'Surveyor', required: true },
          { id: 'client_contact', type: 'text', label: 'Client Contact (if present)', required: false },
        ]
      },
      {
        id: 'location',
        title: 'Location Details',
        fields: [
          { id: 'site_name', type: 'text', label: 'Site Name', required: true },
          { id: 'address', type: 'address', label: 'Address', required: true },
          { id: 'gps_coordinates', type: 'gps', label: 'GPS Coordinates', required: true },
          { id: 'site_access', type: 'textarea', label: 'Site Access Instructions', required: true, helpText: 'Gate codes, parking, walking distance, etc.' },
          { id: 'site_contact', type: 'text', label: 'On-Site Contact Name', required: false },
          { id: 'site_contact_phone', type: 'phone', label: 'On-Site Contact Phone', required: false },
        ]
      },
      {
        id: 'airspace',
        title: 'Airspace Assessment',
        fields: [
          { id: 'airspace_class', type: 'select', label: 'Airspace Class', required: true, options: [
            { value: 'class_c', label: 'Class C (Controlled)' },
            { value: 'class_d', label: 'Class D (Controlled)' },
            { value: 'class_e', label: 'Class E (Controlled)' },
            { value: 'class_f', label: 'Class F (Special Use)' },
            { value: 'class_g', label: 'Class G (Uncontrolled)' },
          ]},
          { id: 'nearest_airport', type: 'text', label: 'Nearest Airport/Heliport', required: true },
          { id: 'airport_distance', type: 'number', label: 'Distance (NM)', required: true },
          { id: 'authorization_required', type: 'yesno', label: 'NAV CANADA Authorization Required?', required: true },
          { id: 'authorization_notes', type: 'textarea', label: 'Authorization Notes', required: false },
          { id: 'notams_checked', type: 'yesno', label: 'NOTAMs Checked?', required: true },
          { id: 'tfr_present', type: 'yesno', label: 'Any TFRs in Area?', required: true },
        ]
      },
      {
        id: 'obstacles',
        title: 'Obstacle Assessment',
        fields: [
          { id: 'powerlines', type: 'yesno', label: 'Power Lines Present?', required: true },
          { id: 'powerlines_notes', type: 'text', label: 'Power Lines Details', required: false, showIf: 'powerlines === true' },
          { id: 'towers', type: 'yesno', label: 'Towers/Antennas Present?', required: true },
          { id: 'towers_notes', type: 'text', label: 'Tower Details', required: false, showIf: 'towers === true' },
          { id: 'trees', type: 'yesno', label: 'Tall Trees/Vegetation?', required: true },
          { id: 'trees_height', type: 'number', label: 'Estimated Height (ft)', required: false, showIf: 'trees === true' },
          { id: 'buildings', type: 'yesno', label: 'Buildings/Structures?', required: true },
          { id: 'buildings_notes', type: 'text', label: 'Building Details', required: false, showIf: 'buildings === true' },
          { id: 'guy_wires', type: 'yesno', label: 'Guy Wires Present?', required: true },
          { id: 'other_obstacles', type: 'textarea', label: 'Other Obstacles', required: false },
          { id: 'obstacle_map', type: 'file_upload', label: 'Obstacle Map/Photo', required: false, accept: 'image/*' },
        ]
      },
      {
        id: 'ground_hazards',
        title: 'Ground Hazards',
        fields: [
          { id: 'terrain_type', type: 'select', label: 'Terrain Type', required: true, options: [
            { value: 'flat', label: 'Flat/Level' },
            { value: 'rolling', label: 'Rolling Hills' },
            { value: 'steep', label: 'Steep/Mountainous' },
            { value: 'mixed', label: 'Mixed Terrain' },
          ]},
          { id: 'ground_cover', type: 'select', label: 'Ground Cover', required: true, options: [
            { value: 'paved', label: 'Paved/Concrete' },
            { value: 'gravel', label: 'Gravel' },
            { value: 'grass', label: 'Grass' },
            { value: 'brush', label: 'Brush/Vegetation' },
            { value: 'water', label: 'Water/Wetland' },
            { value: 'snow', label: 'Snow/Ice' },
          ]},
          { id: 'water_hazards', type: 'yesno', label: 'Water Hazards Present?', required: true },
          { id: 'water_details', type: 'text', label: 'Water Hazard Details', required: false, showIf: 'water_hazards === true' },
          { id: 'wildlife', type: 'yesno', label: 'Wildlife Concerns?', required: true },
          { id: 'wildlife_details', type: 'text', label: 'Wildlife Details', required: false, showIf: 'wildlife === true' },
          { id: 'public_access', type: 'yesno', label: 'Public Access to Area?', required: true },
          { id: 'public_notes', type: 'textarea', label: 'Public Access Notes', required: false, showIf: 'public_access === true' },
        ]
      },
      {
        id: 'launch_recovery',
        title: 'Launch & Recovery Zones',
        fields: [
          { id: 'launch_zone_gps', type: 'gps', label: 'Primary Launch Zone GPS', required: true },
          { id: 'launch_zone_description', type: 'textarea', label: 'Launch Zone Description', required: true },
          { id: 'launch_zone_size', type: 'text', label: 'Launch Zone Size (approx)', required: true },
          { id: 'alternate_launch', type: 'gps', label: 'Alternate Launch Zone GPS', required: false },
          { id: 'emergency_landing_zones', type: 'textarea', label: 'Emergency Landing Zones', required: true, helpText: 'Identify safe areas for emergency landings' },
          { id: 'recovery_zone_gps', type: 'gps', label: 'Recovery Zone GPS', required: false },
          { id: 'zone_photos', type: 'file_upload', label: 'Zone Photos', required: false, multiple: true, accept: 'image/*' },
        ]
      },
      {
        id: 'rf_assessment',
        title: 'RF/EMI Assessment',
        fields: [
          { id: 'cell_towers', type: 'yesno', label: 'Cell Towers Nearby?', required: true },
          { id: 'radio_transmitters', type: 'yesno', label: 'Radio Transmitters Nearby?', required: true },
          { id: 'high_voltage', type: 'yesno', label: 'High Voltage Lines Nearby?', required: true },
          { id: 'magnetic_interference', type: 'yesno', label: 'Known Magnetic Interference?', required: true },
          { id: 'gps_quality', type: 'select', label: 'GPS Quality (if tested)', required: false, options: [
            { value: 'excellent', label: 'Excellent (10+ satellites)' },
            { value: 'good', label: 'Good (7-10 satellites)' },
            { value: 'marginal', label: 'Marginal (5-7 satellites)' },
            { value: 'poor', label: 'Poor (<5 satellites)' },
            { value: 'not_tested', label: 'Not Tested' },
          ]},
          { id: 'rf_notes', type: 'textarea', label: 'RF/EMI Notes', required: false },
        ]
      },
      {
        id: 'operational',
        title: 'Operational Considerations',
        fields: [
          { id: 'recommended_altitude', type: 'number', label: 'Recommended Max Altitude (ft AGL)', required: true },
          { id: 'recommended_boundary', type: 'textarea', label: 'Recommended Operating Boundary', required: true },
          { id: 'flight_restrictions', type: 'textarea', label: 'Site-Specific Flight Restrictions', required: false },
          { id: 'time_restrictions', type: 'textarea', label: 'Time Restrictions (if any)', required: false },
          { id: 'noise_sensitive', type: 'yesno', label: 'Noise Sensitive Area?', required: true },
          { id: 'recommended_crew_size', type: 'number', label: 'Recommended Crew Size', required: true },
          { id: 'vo_required', type: 'yesno', label: 'Visual Observer Required?', required: true },
        ]
      },
      {
        id: 'emergency',
        title: 'Emergency Planning',
        fields: [
          { id: 'nearest_hospital', type: 'text', label: 'Nearest Hospital', required: true },
          { id: 'hospital_distance', type: 'text', label: 'Hospital Distance/Time', required: true },
          { id: 'cell_coverage', type: 'select', label: 'Cell Phone Coverage', required: true, options: [
            { value: 'excellent', label: 'Excellent' },
            { value: 'good', label: 'Good' },
            { value: 'poor', label: 'Poor' },
            { value: 'none', label: 'No Coverage' },
          ]},
          { id: 'emergency_access', type: 'textarea', label: 'Emergency Vehicle Access', required: true },
          { id: 'evacuation_route', type: 'textarea', label: 'Evacuation Route', required: false },
          { id: 'muster_point', type: 'gps', label: 'Muster Point GPS', required: true },
        ]
      },
      {
        id: 'assessment',
        title: 'Overall Assessment',
        fields: [
          { id: 'site_suitability', type: 'select', label: 'Site Suitability', required: true, options: [
            { value: 'suitable', label: 'Suitable for Operations' },
            { value: 'suitable_conditions', label: 'Suitable with Conditions' },
            { value: 'marginal', label: 'Marginal - Additional Planning Required' },
            { value: 'not_suitable', label: 'Not Suitable' },
          ]},
          { id: 'conditions_required', type: 'textarea', label: 'Conditions/Requirements', required: false, showIf: 'site_suitability === suitable_conditions' },
          { id: 'key_risks', type: 'textarea', label: 'Key Risks Identified', required: true },
          { id: 'mitigation_summary', type: 'textarea', label: 'Mitigation Summary', required: true },
          { id: 'additional_notes', type: 'textarea', label: 'Additional Notes', required: false },
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'surveyor_signature', type: 'signature', label: 'Surveyor Signature', required: true },
          { id: 'review_date', type: 'date', label: 'Next Review Date', required: false },
          { id: 'attachments', type: 'file_upload', label: 'Additional Attachments', required: false, multiple: true },
        ]
      }
    ]
  },

  // ========================================
  // FLIGHT PLAN
  // ========================================
  flight_plan: {
    id: 'flight_plan',
    name: 'RPAS Flight Plan',
    shortName: 'Flight Plan',
    category: 'pre_operation',
    description: 'Pre-flight planning document for RPAS operations',
    icon: 'Navigation',
    version: '1.0',
    sections: [
      {
        id: 'header',
        title: 'Flight Plan Information',
        fields: [
          { id: 'form_id', type: 'auto_id', label: 'Form ID', required: true },
          { id: 'project', type: 'project_select', label: 'Project', required: true },
          { id: 'plan_date', type: 'date', label: 'Plan Date', required: true, defaultToday: true },
          { id: 'planned_flight_date', type: 'date', label: 'Planned Flight Date', required: true },
          { id: 'planned_by', type: 'user_auto', label: 'Planned By', required: true },
          { id: 'approved_by', type: 'operator_select', label: 'Approved By', required: false },
        ]
      },
      {
        id: 'mission',
        title: 'Mission Details',
        fields: [
          { id: 'mission_type', type: 'select', label: 'Mission Type', required: true, options: [
            { value: 'survey', label: 'Aerial Survey/Mapping' },
            { value: 'inspection', label: 'Infrastructure Inspection' },
            { value: 'photography', label: 'Photography/Videography' },
            { value: 'lidar', label: 'LiDAR Scanning' },
            { value: 'thermal', label: 'Thermal Imaging' },
            { value: 'delivery', label: 'Payload Delivery' },
            { value: 'training', label: 'Training Flight' },
            { value: 'other', label: 'Other' },
          ]},
          { id: 'mission_objective', type: 'textarea', label: 'Mission Objective', required: true, helpText: 'Describe what needs to be accomplished' },
          { id: 'deliverables', type: 'textarea', label: 'Expected Deliverables', required: false },
          { id: 'client_requirements', type: 'textarea', label: 'Client-Specific Requirements', required: false },
        ]
      },
      {
        id: 'aircraft',
        title: 'Aircraft & Equipment',
        fields: [
          { id: 'primary_aircraft', type: 'aircraft_select', label: 'Primary Aircraft', required: true },
          { id: 'backup_aircraft', type: 'aircraft_select', label: 'Backup Aircraft', required: false },
          { id: 'payload', type: 'text', label: 'Payload/Sensor', required: true },
          { id: 'payload_weight', type: 'number', label: 'Payload Weight (g)', required: false },
          { id: 'batteries_required', type: 'number', label: 'Batteries Required', required: true },
          { id: 'sd_cards', type: 'number', label: 'SD Cards Required', required: false },
          { id: 'additional_equipment', type: 'textarea', label: 'Additional Equipment', required: false },
        ]
      },
      {
        id: 'crew',
        title: 'Crew Assignment',
        fields: [
          { id: 'pic', type: 'operator_select', label: 'Pilot in Command', required: true },
          { id: 'backup_pic', type: 'operator_select', label: 'Backup PIC', required: false },
          { id: 'visual_observers', type: 'crew_multi_select', label: 'Visual Observer(s)', required: false },
          { id: 'payload_operator', type: 'crew_multi_select', label: 'Payload Operator', required: false },
          { id: 'ground_crew', type: 'crew_multi_select', label: 'Ground Crew', required: false },
          { id: 'crew_briefing_time', type: 'time', label: 'Crew Briefing Time', required: true },
        ]
      },
      {
        id: 'location',
        title: 'Location & Airspace',
        fields: [
          { id: 'site_survey_ref', type: 'text', label: 'Site Survey Reference', required: false, helpText: 'Link to completed site survey' },
          { id: 'launch_location', type: 'gps', label: 'Launch Location', required: true },
          { id: 'operating_area', type: 'textarea', label: 'Operating Area Description', required: true },
          { id: 'max_altitude', type: 'number', label: 'Maximum Altitude (ft AGL)', required: true },
          { id: 'max_distance', type: 'number', label: 'Maximum Distance from Pilot (m)', required: true },
          { id: 'airspace_class', type: 'select', label: 'Airspace Class', required: true, options: [
            { value: 'class_c', label: 'Class C' },
            { value: 'class_d', label: 'Class D' },
            { value: 'class_e', label: 'Class E' },
            { value: 'class_f', label: 'Class F' },
            { value: 'class_g', label: 'Class G' },
          ]},
          { id: 'authorization_required', type: 'yesno', label: 'Airspace Authorization Required?', required: true },
          { id: 'authorization_status', type: 'select', label: 'Authorization Status', required: false, showIf: 'authorization_required === true', options: [
            { value: 'not_submitted', label: 'Not Submitted' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'denied', label: 'Denied' },
          ]},
          { id: 'authorization_ref', type: 'text', label: 'Authorization Reference #', required: false, showIf: 'authorization_status === approved' },
        ]
      },
      {
        id: 'timing',
        title: 'Timing & Schedule',
        fields: [
          { id: 'arrival_time', type: 'time', label: 'Arrival On-Site', required: true },
          { id: 'setup_time', type: 'time', label: 'Setup Complete', required: true },
          { id: 'first_flight', type: 'time', label: 'First Flight', required: true },
          { id: 'last_flight', type: 'time', label: 'Last Flight', required: true },
          { id: 'departure_time', type: 'time', label: 'Departure', required: true },
          { id: 'total_flight_time', type: 'number', label: 'Estimated Total Flight Time (min)', required: true },
          { id: 'number_of_flights', type: 'number', label: 'Number of Flights', required: true },
        ]
      },
      {
        id: 'weather',
        title: 'Weather Requirements',
        fields: [
          { id: 'min_visibility', type: 'number', label: 'Minimum Visibility (SM)', required: true },
          { id: 'max_wind', type: 'number', label: 'Maximum Wind Speed (km/h)', required: true },
          { id: 'max_gusts', type: 'number', label: 'Maximum Gusts (km/h)', required: true },
          { id: 'min_ceiling', type: 'number', label: 'Minimum Ceiling (ft)', required: true },
          { id: 'precipitation', type: 'select', label: 'Precipitation Tolerance', required: true, options: [
            { value: 'none', label: 'No Precipitation' },
            { value: 'light', label: 'Light Rain OK' },
            { value: 'moderate', label: 'Moderate Rain OK' },
          ]},
          { id: 'temperature_min', type: 'number', label: 'Minimum Temperature (°C)', required: false },
          { id: 'temperature_max', type: 'number', label: 'Maximum Temperature (°C)', required: false },
          { id: 'weather_source', type: 'text', label: 'Weather Source', required: true, helpText: 'e.g., NAV CANADA METAR, Environment Canada' },
        ]
      },
      {
        id: 'flight_profile',
        title: 'Flight Profile',
        fields: [
          { id: 'flight_mode', type: 'select', label: 'Primary Flight Mode', required: true, options: [
            { value: 'manual', label: 'Manual' },
            { value: 'automated', label: 'Automated/Waypoint' },
            { value: 'hybrid', label: 'Hybrid (Both)' },
          ]},
          { id: 'mission_planning_software', type: 'text', label: 'Mission Planning Software', required: false, showIf: 'flight_mode !== manual' },
          { id: 'flight_pattern', type: 'textarea', label: 'Flight Pattern Description', required: true },
          { id: 'altitude_profile', type: 'textarea', label: 'Altitude Profile', required: true, helpText: 'Describe altitude changes during flight' },
          { id: 'ground_sample_distance', type: 'text', label: 'GSD / Resolution Required', required: false },
          { id: 'overlap_settings', type: 'text', label: 'Overlap Settings', required: false },
          { id: 'mission_file', type: 'file_upload', label: 'Mission File', required: false, accept: '.kmz,.kml,.plan,.waypoints' },
        ]
      },
      {
        id: 'communications',
        title: 'Communications Plan',
        fields: [
          { id: 'primary_comm', type: 'select', label: 'Primary Communication', required: true, options: [
            { value: 'verbal', label: 'Verbal (Direct)' },
            { value: 'radio', label: 'Two-Way Radio' },
            { value: 'headset', label: 'Headset/Intercom' },
            { value: 'phone', label: 'Cell Phone' },
          ]},
          { id: 'backup_comm', type: 'select', label: 'Backup Communication', required: true, options: [
            { value: 'verbal', label: 'Verbal (Direct)' },
            { value: 'radio', label: 'Two-Way Radio' },
            { value: 'phone', label: 'Cell Phone' },
            { value: 'hand_signals', label: 'Hand Signals' },
          ]},
          { id: 'radio_frequency', type: 'text', label: 'Radio Frequency/Channel', required: false },
          { id: 'emergency_frequency', type: 'text', label: 'Emergency Frequency', required: false },
          { id: 'atc_contact', type: 'yesno', label: 'ATC Contact Required?', required: true },
          { id: 'atc_frequency', type: 'text', label: 'ATC Frequency', required: false, showIf: 'atc_contact === true' },
        ]
      },
      {
        id: 'emergency',
        title: 'Emergency Procedures',
        fields: [
          { id: 'lost_link', type: 'textarea', label: 'Lost Link Procedure', required: true },
          { id: 'flyaway', type: 'textarea', label: 'Flyaway Procedure', required: true },
          { id: 'emergency_landing_zones', type: 'textarea', label: 'Emergency Landing Zones', required: true },
          { id: 'battery_failure', type: 'textarea', label: 'Low Battery Procedure', required: true },
          { id: 'medical_emergency', type: 'textarea', label: 'Medical Emergency Procedure', required: true },
          { id: 'manned_aircraft', type: 'textarea', label: 'Manned Aircraft Procedure', required: true },
          { id: 'emergency_contacts', type: 'textarea', label: 'Emergency Contacts', required: true },
        ]
      },
      {
        id: 'go_no_go',
        title: 'Go/No-Go Checklist',
        fields: [
          { id: 'weather_acceptable', type: 'yesno', label: 'Weather within limits?', required: true },
          { id: 'airspace_clear', type: 'yesno', label: 'Airspace authorization confirmed?', required: true },
          { id: 'crew_rested', type: 'yesno', label: 'Crew rested and fit for duty?', required: true },
          { id: 'equipment_ready', type: 'yesno', label: 'Equipment checked and ready?', required: true },
          { id: 'site_survey_current', type: 'yesno', label: 'Site survey current?', required: true },
          { id: 'notams_checked', type: 'yesno', label: 'NOTAMs checked?', required: true },
          { id: 'client_notified', type: 'yesno', label: 'Client notified?', required: false },
          { id: 'go_decision', type: 'select', label: 'Go/No-Go Decision', required: true, options: [
            { value: 'go', label: 'GO - All criteria met' },
            { value: 'conditional', label: 'CONDITIONAL - Proceed with caution' },
            { value: 'no_go', label: 'NO-GO - Do not proceed' },
          ]},
          { id: 'no_go_reason', type: 'textarea', label: 'No-Go Reason', required: false, showIf: 'go_decision === no_go' },
        ]
      },
      {
        id: 'signoff',
        title: 'Sign-Off',
        fields: [
          { id: 'planner_signature', type: 'signature', label: 'Planner Signature', required: true },
          { id: 'pic_signature', type: 'signature', label: 'PIC Acknowledgment', required: true },
          { id: 'approval_signature', type: 'signature', label: 'Operations Approval', required: false },
          { id: 'notes', type: 'textarea', label: 'Additional Notes', required: false },
        ]
      }
    ]
  },
}

export default FORM_TEMPLATES
