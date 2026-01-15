import { 
  MapPin, 
  Plane, 
  Users, 
  AlertTriangle, 
  ShieldAlert, 
  HardHat, 
  Radio, 
  FileCheck,
  CheckCircle2,
  Circle,
  Lock
} from 'lucide-react'

const sections = [
  {
    id: 'crew',
    key: null, // Always on
    label: 'Crew & Roles',
    description: 'Assign team members and define their responsibilities for the operation.',
    icon: Users,
    alwaysOn: true
  },
  {
    id: 'siteSurvey',
    key: 'siteSurvey',
    label: 'Site Survey',
    description: 'Document the operational area including location, airspace, obstacles, and access routes.',
    icon: MapPin,
    alwaysOn: false
  },
  {
    id: 'flightPlan',
    key: 'flightPlan',
    label: 'Flight Plan',
    description: 'Define aircraft, flight profile, weather minimums, and contingency procedures.',
    icon: Plane,
    alwaysOn: false
  },
  {
    id: 'riskAssessment',
    key: null, // Always on
    label: 'Risk Assessment',
    description: 'SORA assessment (when Flight Plan is enabled) and HSE hazard identification.',
    icon: AlertTriangle,
    alwaysOn: true
  },
  {
    id: 'emergencyPlan',
    key: null, // Always on
    label: 'Emergency Plan',
    description: 'Emergency contacts, muster points, evacuation routes, and response procedures.',
    icon: ShieldAlert,
    alwaysOn: true
  },
  {
    id: 'ppe',
    key: null, // Always on
    label: 'PPE Requirements',
    description: 'Required personal protective equipment for the operation.',
    icon: HardHat,
    alwaysOn: true
  },
  {
    id: 'communications',
    key: null, // Always on
    label: 'Communications',
    description: 'Communication methods, radio channels, check-in protocols, and emergency procedures.',
    icon: Radio,
    alwaysOn: true
  },
  {
    id: 'approvals',
    key: null, // Always on
    label: 'Approvals & Signatures',
    description: 'Document review, approval chain, and crew acknowledgments.',
    icon: FileCheck,
    alwaysOn: true
  }
]

export default function ProjectSections({ project, onUpdate }) {
  const handleToggle = (sectionKey) => {
    const currentValue = project.sections?.[sectionKey] ?? false
    onUpdate({
      sections: {
        ...project.sections,
        [sectionKey]: !currentValue
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Operations Plan Sections</h2>
        <p className="text-sm text-gray-500 mb-6">
          Enable or disable sections based on your operation requirements. 
          Some sections are always included for safety compliance.
        </p>

        <div className="space-y-3">
          {sections.map((section) => {
            const isEnabled = section.alwaysOn || project.sections?.[section.key]
            const Icon = section.icon

            return (
              <div
                key={section.id}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                  isEnabled 
                    ? 'bg-aeria-sky/30 border-aeria-light-blue/30' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                {/* Icon */}
                <div className={`p-2 rounded-lg ${isEnabled ? 'bg-aeria-blue text-white' : 'bg-gray-200 text-gray-500'}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-medium ${isEnabled ? 'text-gray-900' : 'text-gray-500'}`}>
                      {section.label}
                    </h3>
                    {section.alwaysOn && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
                        <Lock className="w-3 h-3" />
                        Required
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${isEnabled ? 'text-gray-600' : 'text-gray-400'}`}>
                    {section.description}
                  </p>
                </div>

                {/* Toggle */}
                <div className="flex-shrink-0">
                  {section.alwaysOn ? (
                    <div className="w-10 h-6 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                  ) : (
                    <button
                      onClick={() => handleToggle(section.key)}
                      className={`relative w-10 h-6 rounded-full transition-colors ${
                        isEnabled ? 'bg-aeria-navy' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          isEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Info box about SORA */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">About Risk Assessment</h3>
            <p className="text-sm text-blue-700 mt-1">
              When the <strong>Flight Plan</strong> section is enabled, the Risk Assessment will include 
              the full <strong>SORA 2.5</strong> (Specific Operations Risk Assessment) wizard. 
              This calculates Ground Risk Class, Air Risk Class, and determines the required SAIL level 
              and Operational Safety Objectives.
            </p>
            <p className="text-sm text-blue-700 mt-2">
              The <strong>HSE Hazard Assessment</strong> is always included regardless of whether 
              Flight Plan is enabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
