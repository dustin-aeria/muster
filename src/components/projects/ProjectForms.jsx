import { useState, useEffect } from 'react'
import { 
  ClipboardList,
  Plus,
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Info,
  Search,
  Filter,
  Download
} from 'lucide-react'

// Standard RPAS field forms
const availableForms = [
  { 
    id: 'preflight_checklist', 
    name: 'Pre-Flight Checklist',
    description: 'Aircraft inspection and systems check before flight',
    category: 'flight',
    required: true
  },
  { 
    id: 'postflight_checklist', 
    name: 'Post-Flight Checklist',
    description: 'Aircraft inspection and data management after flight',
    category: 'flight',
    required: true
  },
  { 
    id: 'flight_log', 
    name: 'Flight Log',
    description: 'Individual flight record with times, locations, and notes',
    category: 'flight',
    required: true
  },
  { 
    id: 'battery_log', 
    name: 'Battery Log',
    description: 'Battery cycle tracking and health monitoring',
    category: 'equipment',
    required: false
  },
  { 
    id: 'maintenance_record', 
    name: 'Maintenance Record',
    description: 'Equipment maintenance and repair documentation',
    category: 'equipment',
    required: false
  },
  { 
    id: 'site_inspection', 
    name: 'Site Inspection Form',
    description: 'On-site hazard assessment and conditions check',
    category: 'safety',
    required: false
  },
  { 
    id: 'incident_report', 
    name: 'Incident Report',
    description: 'Documentation of incidents, accidents, or near-misses',
    category: 'safety',
    required: false
  },
  { 
    id: 'jsa_form', 
    name: 'Job Safety Analysis (JSA)',
    description: 'Task-specific hazard identification and controls',
    category: 'safety',
    required: false
  },
  { 
    id: 'crew_signoff', 
    name: 'Crew Sign-Off Sheet',
    description: 'Daily crew briefing acknowledgment',
    category: 'admin',
    required: false
  },
  { 
    id: 'client_signoff', 
    name: 'Client Sign-Off',
    description: 'Client acceptance of deliverables',
    category: 'admin',
    required: false
  },
  { 
    id: 'data_transfer', 
    name: 'Data Transfer Log',
    description: 'Chain of custody for collected data',
    category: 'admin',
    required: false
  }
]

const formCategories = [
  { value: 'all', label: 'All Forms' },
  { value: 'flight', label: 'Flight Operations' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'safety', label: 'Safety' },
  { value: 'admin', label: 'Administrative' }
]

const formStatuses = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-600', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: FileText },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  issue: { label: 'Issue Noted', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle }
}

export default function ProjectForms({ project, onUpdate }) {
  const [expandedSections, setExpandedSections] = useState({
    linked: true,
    available: true
  })
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [customFormName, setCustomFormName] = useState('')

  // Initialize forms if not present
  useEffect(() => {
    if (!project.forms) {
      // Auto-add required forms
      const requiredForms = availableForms
        .filter(f => f.required)
        .map(f => ({
          formId: f.id,
          name: f.name,
          status: 'pending',
          assignedTo: '',
          dueDate: '',
          completedDate: '',
          completedBy: '',
          notes: '',
          entries: []
        }))

      onUpdate({
        forms: {
          linkedForms: requiredForms,
          customForms: []
        }
      })
    }
  }, [project.forms])

  const forms = project.forms || { linkedForms: [], customForms: [] }
  const linkedForms = forms.linkedForms || []

  const updateForms = (updates) => {
    onUpdate({
      forms: {
        ...forms,
        ...updates
      }
    })
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Add form to project
  const addForm = (formTemplate) => {
    const alreadyLinked = linkedForms.some(f => f.formId === formTemplate.id)
    if (alreadyLinked) return

    updateForms({
      linkedForms: [
        ...linkedForms,
        {
          formId: formTemplate.id,
          name: formTemplate.name,
          status: 'pending',
          assignedTo: '',
          dueDate: '',
          completedDate: '',
          completedBy: '',
          notes: '',
          entries: []
        }
      ]
    })
  }

  // Remove form from project
  const removeForm = (formId) => {
    if (!confirm('Remove this form from the project?')) return
    updateForms({
      linkedForms: linkedForms.filter(f => f.formId !== formId)
    })
  }

  // Update linked form
  const updateLinkedForm = (formId, field, value) => {
    updateForms({
      linkedForms: linkedForms.map(f => 
        f.formId === formId ? { ...f, [field]: value } : f
      )
    })
  }

  // Add entry to form (for logs)
  const addFormEntry = (formId) => {
    const form = linkedForms.find(f => f.formId === formId)
    if (!form) return

    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      completedBy: '',
      notes: '',
      data: {}
    }

    updateForms({
      linkedForms: linkedForms.map(f => 
        f.formId === formId 
          ? { ...f, entries: [...(f.entries || []), newEntry] }
          : f
      )
    })
  }

  // Mark form as complete
  const markComplete = (formId) => {
    updateLinkedForm(formId, 'status', 'completed')
    updateLinkedForm(formId, 'completedDate', new Date().toISOString().split('T')[0])
  }

  // Filter available forms
  const filteredAvailable = availableForms.filter(form => {
    const matchesCategory = categoryFilter === 'all' || form.category === categoryFilter
    const matchesSearch = form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchQuery.toLowerCase())
    const notLinked = !linkedForms.some(f => f.formId === form.id)
    return matchesCategory && matchesSearch && notLinked
  })

  // Stats
  const completedCount = linkedForms.filter(f => f.status === 'completed').length
  const totalLinked = linkedForms.length
  const issueCount = linkedForms.filter(f => f.status === 'issue').length

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-900">{totalLinked}</p>
          <p className="text-sm text-gray-500">Forms Linked</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </div>
        <div className="card text-center">
          <p className={`text-2xl font-bold ${issueCount > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
            {issueCount}
          </p>
          <p className="text-sm text-gray-500">Issues</p>
        </div>
      </div>

      {/* Linked Forms */}
      <div className="card">
        <button
          onClick={() => toggleSection('linked')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-aeria-blue" />
            Project Forms
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
              {completedCount}/{totalLinked}
            </span>
          </h2>
          {expandedSections.linked ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.linked && (
          <div className="mt-4 space-y-3">
            {linkedForms.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <ClipboardList className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-gray-500">No forms linked to this project.</p>
                <button
                  onClick={() => setExpandedSections(prev => ({ ...prev, available: true }))}
                  className="text-sm text-aeria-blue hover:underline mt-2"
                >
                  Add forms from library
                </button>
              </div>
            ) : (
              linkedForms.map((form) => {
                const template = availableForms.find(f => f.id === form.formId)
                const statusInfo = formStatuses[form.status] || formStatuses.pending
                const StatusIcon = statusInfo.icon

                return (
                  <div 
                    key={form.formId}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{form.name}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </span>
                          {template?.required && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700">
                              Required
                            </span>
                          )}
                        </div>
                        {template?.description && (
                          <p className="text-sm text-gray-500">{template.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeForm(form.formId)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                        title="Remove form"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid sm:grid-cols-4 gap-3 mb-3">
                      <div>
                        <label className="label text-xs">Status</label>
                        <select
                          value={form.status}
                          onChange={(e) => updateLinkedForm(form.formId, 'status', e.target.value)}
                          className="input text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="issue">Issue Noted</option>
                        </select>
                      </div>
                      <div>
                        <label className="label text-xs">Assigned To</label>
                        <select
                          value={form.assignedTo}
                          onChange={(e) => updateLinkedForm(form.formId, 'assignedTo', e.target.value)}
                          className="input text-sm"
                        >
                          <option value="">Unassigned</option>
                          {(project.crew || []).map(member => (
                            <option key={member.id} value={member.id}>
                              {member.name} ({member.role})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label text-xs">Due Date</label>
                        <input
                          type="date"
                          value={form.dueDate || ''}
                          onChange={(e) => updateLinkedForm(form.formId, 'dueDate', e.target.value)}
                          className="input text-sm"
                        />
                      </div>
                      <div>
                        <label className="label text-xs">Completed Date</label>
                        <input
                          type="date"
                          value={form.completedDate || ''}
                          onChange={(e) => updateLinkedForm(form.formId, 'completedDate', e.target.value)}
                          className="input text-sm"
                          disabled={form.status !== 'completed'}
                        />
                      </div>
                    </div>

                    {/* Form Entries (for logs) */}
                    {['flight_log', 'battery_log', 'maintenance_record'].includes(form.formId) && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Entries ({(form.entries || []).length})
                          </span>
                          <button
                            onClick={() => addFormEntry(form.formId)}
                            className="text-xs text-aeria-blue hover:underline inline-flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Add Entry
                          </button>
                        </div>
                        {(form.entries || []).length > 0 && (
                          <div className="space-y-1">
                            {(form.entries || []).slice(-3).map((entry, i) => (
                              <div key={entry.id} className="text-xs text-gray-500 flex items-center gap-2">
                                <span>{entry.date}</span>
                                <span>{entry.time}</span>
                                {entry.completedBy && <span>by {entry.completedBy}</span>}
                              </div>
                            ))}
                            {(form.entries || []).length > 3 && (
                              <p className="text-xs text-gray-400">
                                +{(form.entries || []).length - 3} more entries
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Notes */}
                    <div className="mt-3">
                      <input
                        type="text"
                        value={form.notes || ''}
                        onChange={(e) => updateLinkedForm(form.formId, 'notes', e.target.value)}
                        className="input text-sm"
                        placeholder="Notes..."
                      />
                    </div>

                    {/* Quick Actions */}
                    {form.status !== 'completed' && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => markComplete(form.formId)}
                          className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          Mark Complete
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Available Forms Library */}
      <div className="card">
        <button
          onClick={() => toggleSection('available')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-aeria-blue" />
            Forms Library
          </h2>
          {expandedSections.available ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.available && (
          <div className="mt-4 space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-10"
                    placeholder="Search forms..."
                  />
                </div>
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input w-auto"
              >
                {formCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Form List */}
            {filteredAvailable.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                {linkedForms.length === availableForms.length 
                  ? 'All available forms have been added to this project.'
                  : 'No forms match your search.'}
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {filteredAvailable.map((form) => (
                  <div 
                    key={form.id}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-aeria-blue transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 text-sm">{form.name}</h4>
                          {form.required && (
                            <span className="px-1.5 py-0.5 text-xs rounded bg-red-100 text-red-600">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">{form.description}</p>
                        <span className="text-xs text-gray-400 capitalize mt-1 inline-block">
                          {form.category}
                        </span>
                      </div>
                      <button
                        onClick={() => addForm(form)}
                        className="p-1.5 text-aeria-blue hover:bg-aeria-sky rounded"
                        title="Add to project"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Custom Form */}
      <div className="card bg-gray-50">
        <h3 className="font-medium text-gray-700 mb-3">Custom Form</h3>
        <p className="text-sm text-gray-500 mb-3">
          Need a form that's not in the library? Add a custom form.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Custom form name"
            className="input flex-1"
            value={customFormName}
            onChange={(e) => setCustomFormName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customFormName.trim()) {
                addForm({
                  id: `custom_${Date.now()}`,
                  name: customFormName.trim(),
                  description: 'Custom form',
                  category: 'admin',
                  required: false
                })
                setCustomFormName('')
              }
            }}
          />
          <button
            onClick={() => {
              if (customFormName.trim()) {
                addForm({
                  id: `custom_${Date.now()}`,
                  name: customFormName.trim(),
                  description: 'Custom form',
                  category: 'admin',
                  required: false
                })
                setCustomFormName('')
              }
            }}
            className="btn-secondary"
          >
            Add
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Form Management</h3>
            <p className="text-sm text-blue-700 mt-1">
              Link standard forms to track completion status. Required forms (Pre-Flight, Post-Flight, 
              Flight Log) are automatically added. Form data can be exported with the project package.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
