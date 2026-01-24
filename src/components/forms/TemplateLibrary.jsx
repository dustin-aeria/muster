/**
 * TemplateLibrary.jsx
 * Browse and import pre-built COR-compliant form templates
 *
 * @location src/components/forms/TemplateLibrary.jsx
 */

import { useState } from 'react'
import {
  X,
  Search,
  Download,
  Eye,
  Shield,
  AlertTriangle,
  Users,
  CheckSquare,
  FileText,
  Wrench,
  HardHat,
  GraduationCap,
  Truck,
  Calendar,
  ClipboardCheck,
  ClipboardList,
  CheckCircle,
  Info,
  Star
} from 'lucide-react'

// Icon mapping
const iconMap = {
  Shield, AlertTriangle, Users, CheckSquare, FileText,
  Wrench, HardHat, GraduationCap, Truck, Calendar, ClipboardCheck, ClipboardList
}

// Pre-built COR-compliant templates
const TEMPLATE_LIBRARY = [
  {
    id: 'flha_template',
    name: 'Field Level Hazard Assessment (FLHA)',
    shortName: 'FLHA',
    description: 'Daily on-site hazard identification and control verification. Required before starting work at any job site.',
    category: 'daily_field',
    icon: 'AlertTriangle',
    corCompliant: true,
    tags: ['HSE', 'COR', 'Required'],
    estimatedTime: '10-15 min',
    sections: [
      {
        id: 'site_info',
        title: 'Site Information',
        fields: [
          { id: 'date', type: 'date', label: 'Date', required: true, defaultToday: true },
          { id: 'location', type: 'text', label: 'Location/Site Name', required: true },
          { id: 'project', type: 'project_select', label: 'Project', required: false },
          { id: 'weather', type: 'text', label: 'Weather Conditions', required: true },
          { id: 'crew_members', type: 'crew_multi_select', label: 'Crew Members Present', required: true }
        ]
      },
      {
        id: 'hazard_assessment',
        title: 'Hazard Identification',
        repeatable: true,
        repeatLabel: 'Add Hazard',
        fields: [
          { id: 'hazard_category', type: 'select', label: 'Hazard Category', options: 'HAZARD_CATEGORIES', required: true },
          { id: 'hazard_description', type: 'textarea', label: 'Hazard Description', required: true },
          { id: 'severity', type: 'select', label: 'Severity', options: 'SEVERITY_RATINGS', required: true },
          { id: 'probability', type: 'select', label: 'Probability', options: 'PROBABILITY_RATINGS', required: true },
          { id: 'control_type', type: 'select', label: 'Control Type', options: 'CONTROL_TYPES', required: true },
          { id: 'controls', type: 'textarea', label: 'Controls in Place', required: true }
        ]
      },
      {
        id: 'sign_off',
        title: 'Sign-Off',
        fields: [
          { id: 'assessor_signature', type: 'signature', label: 'Assessor Signature', required: true },
          { id: 'crew_acknowledgment', type: 'checkbox', label: 'All crew members have been briefed on identified hazards and controls', required: true }
        ]
      }
    ]
  },
  {
    id: 'preflight_checklist_template',
    name: 'RPAS Pre-Flight Checklist',
    shortName: 'Pre-Flight',
    description: 'Comprehensive pre-flight inspection checklist for RPAS operations. Covers aircraft, batteries, payload, and site assessment.',
    category: 'daily_field',
    icon: 'ClipboardCheck',
    corCompliant: true,
    tags: ['RPAS', 'Required', 'CAR 901'],
    estimatedTime: '15-20 min',
    sections: [
      {
        id: 'flight_info',
        title: 'Flight Information',
        fields: [
          { id: 'date', type: 'date', label: 'Date', required: true, defaultToday: true },
          { id: 'pilot', type: 'operator_select', label: 'Pilot in Command', required: true },
          { id: 'aircraft', type: 'aircraft_select', label: 'Aircraft', required: true },
          { id: 'location', type: 'gps', label: 'Flight Location', required: true }
        ]
      },
      {
        id: 'aircraft_inspection',
        title: 'Aircraft Inspection',
        fields: [
          { id: 'airframe_clean', type: 'yesno', label: 'Airframe clean and undamaged', required: true },
          { id: 'props_secure', type: 'yesno', label: 'Propellers secure and undamaged', required: true },
          { id: 'motors_clear', type: 'yesno', label: 'Motors spin freely, no debris', required: true },
          { id: 'landing_gear', type: 'yesno', label: 'Landing gear secure', required: true },
          { id: 'payload_secure', type: 'yesno', label: 'Payload mounted and secure', required: true },
          { id: 'antennas_secure', type: 'yesno', label: 'All antennas secure', required: true }
        ]
      },
      {
        id: 'battery_check',
        title: 'Battery Check',
        fields: [
          { id: 'battery_charged', type: 'yesno', label: 'Battery fully charged (>80%)', required: true },
          { id: 'battery_cycles', type: 'number', label: 'Battery cycle count', required: true },
          { id: 'battery_physical', type: 'yesno', label: 'No swelling or damage', required: true },
          { id: 'battery_temp', type: 'yesno', label: 'Battery at safe operating temperature', required: true }
        ]
      },
      {
        id: 'controller_check',
        title: 'Controller & Display',
        fields: [
          { id: 'controller_charged', type: 'yesno', label: 'Controller fully charged', required: true },
          { id: 'display_charged', type: 'yesno', label: 'Display device charged', required: true },
          { id: 'sticks_centered', type: 'yesno', label: 'Control sticks centered and responsive', required: true },
          { id: 'app_current', type: 'yesno', label: 'Flight app is current version', required: true }
        ]
      },
      {
        id: 'site_check',
        title: 'Site Assessment',
        fields: [
          { id: 'airspace_clear', type: 'yesno', label: 'Airspace verified (NAV CANADA)', required: true },
          { id: 'notams_checked', type: 'yesno', label: 'NOTAMs checked', required: true },
          { id: 'weather_suitable', type: 'yesno', label: 'Weather within operating limits', required: true },
          { id: 'obstacles_identified', type: 'yesno', label: 'Obstacles identified and marked', required: true },
          { id: 'emergency_plan', type: 'yesno', label: 'Emergency procedures reviewed', required: true }
        ]
      },
      {
        id: 'approval',
        title: 'Flight Approval',
        fields: [
          { id: 'go_decision', type: 'yesno', label: 'All checks passed - GO for flight', required: true },
          { id: 'pilot_signature', type: 'signature', label: 'Pilot Signature', required: true }
        ]
      }
    ]
  },
  {
    id: 'tailgate_template',
    name: 'Tailgate Safety Briefing',
    shortName: 'Tailgate',
    description: 'Pre-work safety meeting documentation. Covers job scope, hazards, emergency procedures, and crew acknowledgments.',
    category: 'daily_field',
    icon: 'Users',
    corCompliant: true,
    tags: ['HSE', 'COR', 'Required'],
    estimatedTime: '15-20 min',
    sections: [
      {
        id: 'meeting_info',
        title: 'Meeting Information',
        fields: [
          { id: 'date', type: 'date', label: 'Date', required: true, defaultToday: true },
          { id: 'time', type: 'time', label: 'Time', required: true },
          { id: 'location', type: 'text', label: 'Location', required: true },
          { id: 'project', type: 'project_select', label: 'Project', required: true },
          { id: 'conducted_by', type: 'operator_select', label: 'Conducted By', required: true }
        ]
      },
      {
        id: 'scope',
        title: 'Scope of Work',
        fields: [
          { id: 'tasks_today', type: 'textarea', label: 'Tasks to be completed today', required: true, rows: 4 },
          { id: 'equipment_used', type: 'textarea', label: 'Equipment being used', required: true }
        ]
      },
      {
        id: 'hazards',
        title: 'Hazards & Controls',
        fields: [
          { id: 'hazards_discussed', type: 'textarea', label: 'Hazards discussed', required: true, rows: 4 },
          { id: 'controls_in_place', type: 'textarea', label: 'Controls in place', required: true, rows: 4 },
          { id: 'ppe_required', type: 'multiselect', label: 'PPE Required', options: [
            { value: 'hi_vis', label: 'High Visibility Vest' },
            { value: 'hard_hat', label: 'Hard Hat' },
            { value: 'safety_glasses', label: 'Safety Glasses' },
            { value: 'gloves', label: 'Gloves' },
            { value: 'steel_toe', label: 'Steel Toe Boots' },
            { value: 'hearing', label: 'Hearing Protection' },
            { value: 'sunscreen', label: 'Sunscreen' }
          ], required: true }
        ]
      },
      {
        id: 'emergency',
        title: 'Emergency Procedures',
        fields: [
          { id: 'muster_point', type: 'text', label: 'Muster Point Location', required: true },
          { id: 'first_aid_person', type: 'operator_select', label: 'First Aid Designate', required: true },
          { id: 'emergency_contact', type: 'text', label: 'Emergency Contact Number', required: true },
          { id: 'hospital_location', type: 'text', label: 'Nearest Hospital', required: true }
        ]
      },
      {
        id: 'attendees',
        title: 'Attendee Acknowledgment',
        fields: [
          { id: 'attendees', type: 'crew_multi_select', label: 'Attendees', required: true },
          { id: 'questions_asked', type: 'yesno', label: 'Opportunity given for questions', required: true },
          { id: 'conductor_signature', type: 'signature', label: 'Conductor Signature', required: true }
        ]
      }
    ]
  },
  {
    id: 'incident_report_template',
    name: 'Incident/Near Miss Report',
    shortName: 'Incident Report',
    description: 'Document workplace incidents and near misses. Includes regulatory trigger checks for TSB and Transport Canada notification.',
    category: 'incident',
    icon: 'AlertTriangle',
    corCompliant: true,
    tags: ['HSE', 'COR', 'Required', 'Regulatory'],
    estimatedTime: '20-30 min',
    hasTriggers: true,
    sections: [
      {
        id: 'incident_details',
        title: 'Incident Details',
        fields: [
          { id: 'incident_date', type: 'datetime', label: 'Date & Time of Incident', required: true },
          { id: 'location', type: 'gps', label: 'Incident Location', required: true },
          { id: 'project', type: 'project_select', label: 'Related Project' },
          { id: 'incident_type', type: 'select', label: 'Incident Type', options: [
            { value: 'near_miss', label: 'Near Miss' },
            { value: 'property_damage', label: 'Property Damage' },
            { value: 'minor_injury', label: 'Minor Injury' },
            { value: 'serious_injury', label: 'Serious Injury' },
            { value: 'equipment_failure', label: 'Equipment Failure' },
            { value: 'environmental', label: 'Environmental' }
          ], required: true }
        ]
      },
      {
        id: 'regulatory_triggers',
        title: 'Regulatory Notification Check',
        description: 'Answer these questions to determine notification requirements',
        fields: [
          { id: 'fatality', type: 'yesno', label: 'Was there a fatality?', required: true, trigger: 'TSB_IMMEDIATE' },
          { id: 'serious_injury', type: 'yesno', label: 'Was there a serious injury requiring hospitalization?', required: true, trigger: 'TSB_IMMEDIATE, WORKSAFEBC' },
          { id: 'rpas_over_25kg', type: 'yesno', label: 'Did this involve an RPAS over 25kg?', required: true, trigger: 'TSB_IMMEDIATE' },
          { id: 'collision_manned', type: 'yesno', label: 'Was there contact with a manned aircraft?', required: true, trigger: 'TSB_IMMEDIATE' },
          { id: 'fly_away', type: 'yesno', label: 'Was there a fly-away or loss of control?', required: true, trigger: 'TRANSPORT_CANADA' },
          { id: 'boundary_violation', type: 'yesno', label: 'Was there an airspace boundary violation?', required: true, trigger: 'TRANSPORT_CANADA' }
        ]
      },
      {
        id: 'notification_checklist',
        type: 'trigger_checklist',
        title: 'Required Notifications',
        description: 'Based on your answers above, the following notifications may be required'
      },
      {
        id: 'description',
        title: 'Description',
        fields: [
          { id: 'what_happened', type: 'textarea', label: 'What happened?', required: true, rows: 5 },
          { id: 'immediate_actions', type: 'textarea', label: 'Immediate actions taken', required: true },
          { id: 'witnesses', type: 'crew_multi_select', label: 'Witnesses' }
        ]
      },
      {
        id: 'photos',
        title: 'Documentation',
        fields: [
          { id: 'photos', type: 'file_upload', label: 'Photos/Evidence', multiple: true, accept: 'image/*' },
          { id: 'additional_docs', type: 'file_upload', label: 'Additional Documents', multiple: true }
        ]
      },
      {
        id: 'sign_off',
        title: 'Report Submission',
        fields: [
          { id: 'reported_by', type: 'signature', label: 'Reported By', required: true },
          { id: 'supervisor_notified', type: 'yesno', label: 'Supervisor has been notified', required: true }
        ]
      }
    ]
  },
  {
    id: 'vehicle_inspection_template',
    name: 'Vehicle Inspection Checklist',
    shortName: 'Vehicle Check',
    description: 'Pre-trip and post-trip vehicle inspection form. Required for all company or rental vehicles.',
    category: 'tracking',
    icon: 'Truck',
    corCompliant: true,
    tags: ['HSE', 'COR', 'Fleet'],
    estimatedTime: '10-15 min',
    sections: [
      {
        id: 'vehicle_info',
        title: 'Vehicle Information',
        fields: [
          { id: 'date', type: 'date', label: 'Date', required: true, defaultToday: true },
          { id: 'inspection_type', type: 'select', label: 'Inspection Type', options: [
            { value: 'pre_trip', label: 'Pre-Trip' },
            { value: 'post_trip', label: 'Post-Trip' }
          ], required: true },
          { id: 'vehicle', type: 'text', label: 'Vehicle (Make/Model)', required: true },
          { id: 'license_plate', type: 'text', label: 'License Plate', required: true },
          { id: 'odometer', type: 'number', label: 'Odometer Reading', required: true }
        ]
      },
      {
        id: 'exterior',
        title: 'Exterior Check',
        fields: [
          { id: 'tires_ok', type: 'yesno', label: 'Tires: Adequate tread and pressure', required: true },
          { id: 'lights_ok', type: 'yesno', label: 'Lights: Headlights, brake lights, signals working', required: true },
          { id: 'mirrors_ok', type: 'yesno', label: 'Mirrors: Clean and properly adjusted', required: true },
          { id: 'body_ok', type: 'yesno', label: 'Body: No new damage or concerns', required: true },
          { id: 'windows_ok', type: 'yesno', label: 'Windows/Windshield: Clean, no cracks', required: true }
        ]
      },
      {
        id: 'interior',
        title: 'Interior Check',
        fields: [
          { id: 'seat_belt_ok', type: 'yesno', label: 'Seat belts: Present and functional', required: true },
          { id: 'gauges_ok', type: 'yesno', label: 'Gauges: All reading normal', required: true },
          { id: 'horn_ok', type: 'yesno', label: 'Horn: Working', required: true },
          { id: 'wipers_ok', type: 'yesno', label: 'Wipers: Working with adequate fluid', required: true },
          { id: 'first_aid_ok', type: 'yesno', label: 'First aid kit: Present', required: true },
          { id: 'fire_extinguisher_ok', type: 'yesno', label: 'Fire extinguisher: Present and charged', required: true }
        ]
      },
      {
        id: 'defects',
        title: 'Defects',
        fields: [
          { id: 'defects_found', type: 'yesno', label: 'Were any defects found?', required: true },
          { id: 'defect_details', type: 'textarea', label: 'Defect Details', showIf: "defects_found === true" },
          { id: 'vehicle_safe', type: 'yesno', label: 'Vehicle is safe to operate', required: true }
        ]
      },
      {
        id: 'sign_off',
        title: 'Sign-Off',
        fields: [
          { id: 'inspector_signature', type: 'signature', label: 'Inspector Signature', required: true }
        ]
      }
    ]
  },
  {
    id: 'safety_meeting_template',
    name: 'Safety Meeting Minutes',
    shortName: 'Safety Meeting',
    description: 'Document regular safety meetings and toolbox talks. Track attendance, topics discussed, and action items.',
    category: 'tracking',
    icon: 'Users',
    corCompliant: true,
    tags: ['HSE', 'COR', 'Required'],
    estimatedTime: '10-15 min',
    sections: [
      {
        id: 'meeting_info',
        title: 'Meeting Information',
        fields: [
          { id: 'date', type: 'date', label: 'Date', required: true, defaultToday: true },
          { id: 'time', type: 'time', label: 'Time', required: true },
          { id: 'meeting_type', type: 'select', label: 'Meeting Type', options: [
            { value: 'weekly', label: 'Weekly Safety Meeting' },
            { value: 'monthly', label: 'Monthly Safety Meeting' },
            { value: 'toolbox', label: 'Toolbox Talk' },
            { value: 'jhsc', label: 'JHSC Meeting' },
            { value: 'special', label: 'Special Topic' }
          ], required: true },
          { id: 'conducted_by', type: 'operator_select', label: 'Conducted By', required: true }
        ]
      },
      {
        id: 'topics',
        title: 'Topics Discussed',
        fields: [
          { id: 'topics', type: 'textarea', label: 'Topics Covered', required: true, rows: 5 },
          { id: 'safety_topic', type: 'text', label: 'Primary Safety Topic', required: true },
          { id: 'documents_reviewed', type: 'textarea', label: 'Policies/Procedures Reviewed' }
        ]
      },
      {
        id: 'action_items',
        title: 'Action Items',
        repeatable: true,
        repeatLabel: 'Add Action Item',
        fields: [
          { id: 'action_description', type: 'text', label: 'Action Required', required: true },
          { id: 'assigned_to', type: 'operator_select', label: 'Assigned To', required: true },
          { id: 'due_date', type: 'date', label: 'Due Date', required: true }
        ]
      },
      {
        id: 'attendance',
        title: 'Attendance',
        fields: [
          { id: 'attendees', type: 'crew_multi_select', label: 'Attendees', required: true },
          { id: 'conductor_signature', type: 'signature', label: 'Conductor Signature', required: true }
        ]
      }
    ]
  }
]

// Template card component
function TemplateCard({ template, onPreview, onImport, isImported }) {
  const Icon = iconMap[template.icon] || ClipboardList

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-aeria-navy/30 hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-aeria-sky rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-aeria-navy" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 truncate">{template.shortName}</h4>
            {template.corCompliant && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-700 text-xs rounded">
                <Shield className="w-3 h-3" />
                COR
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{template.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {template.tags?.slice(0, 3).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>

          {/* Time estimate */}
          {template.estimatedTime && (
            <p className="text-xs text-gray-400 mt-2">{template.estimatedTime}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
        <button
          onClick={() => onPreview(template)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm text-gray-600 hover:text-aeria-navy hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
        <button
          onClick={() => onImport(template)}
          disabled={isImported}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm rounded-lg transition-colors ${
            isImported
              ? 'bg-green-50 text-green-700 cursor-default'
              : 'bg-aeria-navy text-white hover:bg-aeria-blue'
          }`}
        >
          {isImported ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Added
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Add to Library
            </>
          )}
        </button>
      </div>
    </div>
  )
}

// Template preview modal
function TemplatePreview({ template, onClose, onImport }) {
  const Icon = iconMap[template.icon] || ClipboardList

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-aeria-sky rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-aeria-navy" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{template.name}</h3>
              <p className="text-sm text-gray-500">{template.sections?.length || 0} sections</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-gray-600 mb-4">{template.description}</p>

          {/* Tags & Info */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {template.corCompliant && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-sm rounded">
                <Shield className="w-4 h-4" />
                COR Compliant
              </span>
            )}
            {template.estimatedTime && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
                {template.estimatedTime}
              </span>
            )}
            {template.hasTriggers && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-sm rounded">
                <AlertTriangle className="w-4 h-4" />
                Has Regulatory Triggers
              </span>
            )}
          </div>

          {/* Sections Preview */}
          <h4 className="font-medium text-gray-900 mb-3">Form Sections</h4>
          <div className="space-y-4">
            {template.sections?.map((section, index) => (
              <div key={section.id} className="border border-gray-200 rounded-lg">
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <h5 className="font-medium text-gray-900">{section.title}</h5>
                  {section.description && (
                    <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                  )}
                </div>
                <div className="p-3">
                  {section.fields ? (
                    <ul className="space-y-1">
                      {section.fields.map(field => (
                        <li key={field.id} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                          {field.label}
                          {field.required && <span className="text-red-500">*</span>}
                          <span className="text-gray-400">({field.type})</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      {section.type === 'trigger_checklist' ? 'Dynamic notification checklist based on answers' : 'No fields defined'}
                    </p>
                  )}
                  {section.repeatable && (
                    <p className="text-xs text-aeria-navy mt-2">This section can be repeated</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 flex-shrink-0 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => { onImport(template); onClose(); }}
            className="flex items-center gap-2 px-6 py-2 bg-aeria-navy text-white rounded-lg hover:bg-aeria-blue transition-colors"
          >
            <Download className="w-4 h-4" />
            Add to My Library
          </button>
        </div>
      </div>
    </div>
  )
}

// Main TemplateLibrary component
export default function TemplateLibrary({ isOpen, onClose, onImport, importedTemplates = [] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [previewTemplate, setPreviewTemplate] = useState(null)

  const categories = [
    { id: 'daily_field', name: 'Daily/Field', icon: Calendar },
    { id: 'incident', name: 'Incident', icon: AlertTriangle },
    { id: 'tracking', name: 'Tracking/Admin', icon: FileText }
  ]

  // Filter templates
  const filteredTemplates = TEMPLATE_LIBRARY.filter(template => {
    const matchesSearch = !searchQuery ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = !selectedCategory || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleImport = async (template) => {
    try {
      await onImport(template)
    } catch (err) {
      console.error('Failed to import template:', err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Form Templates Library</h2>
            <p className="text-sm text-gray-500">Pre-built COR-compliant forms ready to use</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  !selectedCategory ? 'bg-aeria-navy text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map(cat => {
                const CatIcon = cat.icon
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === cat.id ? 'bg-aeria-navy text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <CatIcon className="w-4 h-4" />
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onPreview={setPreviewTemplate}
                  onImport={handleImport}
                  isImported={importedTemplates.includes(template.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No templates found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="flex items-center gap-2 p-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-500 flex-shrink-0">
          <Info className="w-4 h-4" />
          <span>Templates added to your library can be customized using the Form Builder</span>
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onImport={handleImport}
        />
      )}
    </div>
  )
}

export { TEMPLATE_LIBRARY }
