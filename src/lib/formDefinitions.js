// Aeria Ops Form Definitions
// Complete form specifications with COR/SECOR compliance fields

// Hazard categories from HSE program
export const HAZARD_CATEGORIES = [
  { value: 'environmental', label: 'Environmental Hazards', description: 'Weather, terrain, wildlife, temperature' },
  { value: 'overhead', label: 'Overhead Hazards', description: 'Power lines, structures' },
  { value: 'access_egress', label: 'Access/Egress', description: 'Slips, trips, water hazards' },
  { value: 'ergonomic', label: 'Ergonomic', description: 'Awkward positions, repetitive tasks' },
  { value: 'personal_limitations', label: 'Personal Limitations', description: 'Fatigue, distraction, training gaps' },
  { value: 'equipment', label: 'Equipment', description: 'Malfunction, improper use' },
]

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
    forms: ['site_survey', 'flight_plan', 'formal_hazard_assessment', 'first_aid_assessment']
  },
  { 
    id: 'daily_field', 
    name: 'Daily/Field', 
    description: 'Daily operations forms',
    icon: 'Calendar',
    forms: ['tailgate_briefing', 'flha', 'preflight_checklist', 'daily_flight_log']
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
    forms: ['safety_meeting_log', 'training_record', 'equipment_inspection', 'ppe_inspection', 'vehicle_inspection']
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
}

export default FORM_TEMPLATES
