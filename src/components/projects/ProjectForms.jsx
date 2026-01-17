import { useState, useEffect } from 'react'
import { FORM_TEMPLATES, FORM_CATEGORIES } from './formDefinitions'
import { getOperators } from './firestore'
import { 
  ClipboardList,
  Plus,
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Info,
  Search,
  X,
  Edit3,
  Eye,
  Save,
  Shield,
  Users,
  Truck,
  AlertOctagon,
  ClipboardCheck,
  Clipboard
} from 'lucide-react'

// Map icon names to components
const iconMap = {
  Shield: Shield,
  Users: Users,
  Truck: Truck,
  AlertTriangle: AlertTriangle,
  FileText: FileText,
  ClipboardCheck: ClipboardCheck,
  Calendar: Calendar,
  Clipboard: Clipboard
}

// Convert FORM_TEMPLATES to array format for the library
const getAvailableForms = () => {
  return Object.values(FORM_TEMPLATES).map(form => ({
    id: form.id,
    name: form.name,
    shortName: form.shortName,
    description: form.description,
    category: form.category,
    icon: form.icon,
    version: form.version,
    sections: form.sections,
    required: ['flha', 'tailgate_briefing', 'preflight_checklist'].includes(form.id)
  }))
}

const formStatuses = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-600', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: Edit3 },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  issue: { label: 'Issue Noted', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle }
}

// Form Viewer/Filler Modal
function FormModal({ form, formTemplate, project, operators, onSave, onClose }) {
  const [formData, setFormData] = useState(form?.data || {})
  const [activeSection, setActiveSection] = useState(0)

  if (!formTemplate) return null

  const updateField = (sectionId, fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] || {}),
        [fieldId]: value
      }
    }))
  }

  const getFieldValue = (sectionId, fieldId) => {
    return formData[sectionId]?.[fieldId] || ''
  }

  const handleSave = (markComplete = false) => {
    onSave(formData, markComplete)
  }

  const renderField = (field, sectionId) => {
    const value = getFieldValue(sectionId, field.id)
    
    switch (field.type) {
      case 'text':
      case 'auto_id':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateField(sectionId, field.id, e.target.value)}
            className="input"
            placeholder={field.placeholder || ''}
            readOnly={field.type === 'auto_id'}
          />
        )
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => updateField(sectionId, field.id, e.target.value)}
            className="input"
            min={field.min}
            max={field.max}
          />
        )
      
      case 'date':
        return (
          <input
            type="date"
            value={value || (field.defaultToday ? new Date().toISOString().split('T')[0] : '')}
            onChange={(e) => updateField(sectionId, field.id, e.target.value)}
            className="input"
          />
        )
      
      case 'time':
        return (
          <input
            type="time"
            value={value}
            onChange={(e) => updateField(sectionId, field.id, e.target.value)}
            className="input"
          />
        )
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => updateField(sectionId, field.id, e.target.value)}
            className="input min-h-[80px]"
            rows={field.rows || 3}
            placeholder={field.placeholder || ''}
          />
        )
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => updateField(sectionId, field.id, e.target.value)}
            className="input"
          >
            <option value="">Select...</option>
            {field.options?.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )
      
      case 'yesno':
        return (
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`${sectionId}_${field.id}`}
                checked={value === true || value === 'true'}
                onChange={() => updateField(sectionId, field.id, true)}
                className="w-4 h-4"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`${sectionId}_${field.id}`}
                checked={value === false || value === 'false'}
                onChange={() => updateField(sectionId, field.id, false)}
                className="w-4 h-4"
              />
              <span>No</span>
            </label>
          </div>
        )
      
      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => updateField(sectionId, field.id, e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">{field.checkboxLabel || 'Yes'}</span>
          </label>
        )
      
      case 'checklist':
        const checklistValue = value || {}
        return (
          <div className="space-y-2">
            {field.items?.map(item => (
              <label key={item.value} className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checklistValue[item.value] === true}
                  onChange={(e) => updateField(sectionId, field.id, {
                    ...checklistValue,
                    [item.value]: e.target.checked
                  })}
                  className="w-4 h-4 rounded mt-0.5"
                />
                <span className="text-sm">{item.label}</span>
              </label>
            ))}
          </div>
        )
      
      case 'operator_select':
        return (
          <select
            value={value}
            onChange={(e) => updateField(sectionId, field.id, e.target.value)}
            className="input"
          >
            <option value="">Select person...</option>
            {operators.map(op => (
              <option key={op.id} value={op.id}>{op.name}</option>
            ))}
          </select>
        )
      
      case 'project_select':
        return (
          <input
            type="text"
            value={project?.name || ''}
            className="input bg-gray-50"
            readOnly
          />
        )
      
      case 'signature':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            {value ? (
              <div>
                <p className="text-sm text-gray-700">Signed by: {value.name}</p>
                <p className="text-xs text-gray-500">{value.timestamp}</p>
              </div>
            ) : (
              <button
                onClick={() => updateField(sectionId, field.id, {
                  name: 'Current User', // Would be replaced with actual user
                  timestamp: new Date().toISOString()
                })}
                className="text-sm text-aeria-blue hover:underline"
              >
                Click to sign
              </button>
            )}
          </div>
        )
      
      case 'hazard_repeater':
      case 'crew_multi_signature':
      case 'multi_signature':
        return (
          <div className="p-3 bg-gray-50 rounded border border-gray-200 text-sm text-gray-500">
            Advanced field type - coming soon
          </div>
        )
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateField(sectionId, field.id, e.target.value)}
            className="input"
          />
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{formTemplate.name}</h2>
            <p className="text-sm text-gray-500">{formTemplate.description}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="border-b overflow-x-auto">
          <div className="flex">
            {formTemplate.sections.map((section, idx) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(idx)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeSection === idx
                    ? 'border-aeria-blue text-aeria-blue'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {formTemplate.sections[activeSection] && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 mb-4">
                {formTemplate.sections[activeSection].title}
              </h3>
              
              <div className="grid gap-4">
                {formTemplate.sections[activeSection].fields.map(field => (
                  <div key={field.id}>
                    <label className="label">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.helpText && (
                      <p className="text-xs text-gray-500 mb-1">{field.helpText}</p>
                    )}
                    {renderField(field, formTemplate.sections[activeSection].id)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between gap-3">
          <div className="text-sm text-gray-500">
            Section {activeSection + 1} of {formTemplate.sections.length}
          </div>
          <div className="flex gap-2">
            {activeSection > 0 && (
              <button
                onClick={() => setActiveSection(prev => prev - 1)}
                className="btn-secondary"
              >
                Previous
              </button>
            )}
            {activeSection < formTemplate.sections.length - 1 ? (
              <button
                onClick={() => setActiveSection(prev => prev + 1)}
                className="btn-primary"
              >
                Next
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleSave(false)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Draft
                </button>
                <button
                  onClick={() => handleSave(true)}
                  className="btn-primary flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Complete Form
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProjectForms({ project, onUpdate }) {
  const [operators, setOperators] = useState([])
  const [expandedSections, setExpandedSections] = useState({
    linked: true,
    available: true
  })
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFormModal, setActiveFormModal] = useState(null)

  const availableForms = getAvailableForms()

  useEffect(() => {
    loadOperators()
  }, [])

  const loadOperators = async () => {
    try {
      const data = await getOperators()
      setOperators(data)
    } catch (err) {
      console.error('Error loading operators:', err)
    }
  }

  // Initialize forms if not present
  useEffect(() => {
    if (!project.forms) {
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
          data: {},
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
          data: {},
          entries: []
        }
      ]
    })
  }

  const removeForm = (formId) => {
    if (!confirm('Remove this form from the project?')) return
    updateForms({
      linkedForms: linkedForms.filter(f => f.formId !== formId)
    })
  }

  const updateLinkedForm = (formId, updates) => {
    updateForms({
      linkedForms: linkedForms.map(f => 
        f.formId === formId ? { ...f, ...updates } : f
      )
    })
  }

  const openFormModal = (form) => {
    setActiveFormModal(form)
  }

  const handleFormSave = (formData, markComplete) => {
    const form = activeFormModal
    const updates = {
      data: formData,
      status: markComplete ? 'completed' : 'in_progress'
    }
    
    if (markComplete) {
      updates.completedDate = new Date().toISOString().split('T')[0]
      updates.completedBy = 'Current User' // Would be replaced with actual user
    }

    updateLinkedForm(form.formId, updates)
    setActiveFormModal(null)
  }

  // Filter available forms
  const filteredAvailable = availableForms.filter(form => {
    const notLinked = !linkedForms.some(f => f.formId === form.id)
    const matchesCategory = categoryFilter === 'all' || form.category === categoryFilter
    const matchesSearch = !searchQuery || 
      form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description.toLowerCase().includes(searchQuery.toLowerCase())
    return notLinked && matchesCategory && matchesSearch
  })

  // Get completion stats
  const completedCount = linkedForms.filter(f => f.status === 'completed').length
  const totalCount = linkedForms.length
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="card bg-gradient-to-r from-aeria-navy to-aeria-blue text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Form Completion</h3>
            <p className="text-white/80 text-sm mt-1">
              {completedCount} of {totalCount} forms completed
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{completionPct}%</div>
            <div className="w-24 h-2 bg-white/20 rounded-full mt-2">
              <div 
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
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
            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
              {linkedForms.length}
            </span>
          </h2>
          {expandedSections.linked ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.linked && (
          <div className="mt-4 space-y-3">
            {linkedForms.length === 0 ? (
              <p className="text-center py-6 text-gray-500">
                No forms linked to this project. Add forms from the library below.
              </p>
            ) : (
              linkedForms.map((form) => {
                const template = availableForms.find(f => f.id === form.formId)
                const status = formStatuses[form.status] || formStatuses.pending
                const StatusIcon = status.icon
                const FormIcon = template?.icon ? (iconMap[template.icon] || FileText) : FileText

                return (
                  <div 
                    key={form.formId}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <FormIcon className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{form.name}</h4>
                            <span className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 ${status.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                            {template?.required && (
                              <span className="px-1.5 py-0.5 text-xs rounded bg-red-100 text-red-600">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{template?.description}</p>
                          
                          {/* Form metadata */}
                          <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                            {form.assignedTo && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {operators.find(o => o.id === form.assignedTo)?.name || form.assignedTo}
                              </span>
                            )}
                            {form.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Due: {form.dueDate}
                              </span>
                            )}
                            {form.completedDate && (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 className="w-3 h-3" />
                                Completed: {form.completedDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {template?.sections && (
                          <button
                            onClick={() => openFormModal(form)}
                            className="p-2 text-aeria-blue hover:bg-aeria-sky rounded-lg flex items-center gap-1"
                            title={form.status === 'completed' ? 'View Form' : 'Fill Form'}
                          >
                            {form.status === 'completed' ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <Edit3 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => removeForm(form.formId)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                          title="Remove from project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Quick assign */}
                    <div className="mt-3 pt-3 border-t border-gray-100 grid sm:grid-cols-2 gap-3">
                      <div>
                        <label className="label text-xs">Assigned To</label>
                        <select
                          value={form.assignedTo || ''}
                          onChange={(e) => updateLinkedForm(form.formId, { assignedTo: e.target.value })}
                          className="input text-sm"
                        >
                          <option value="">Unassigned</option>
                          {operators.map(op => (
                            <option key={op.id} value={op.id}>{op.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label text-xs">Due Date</label>
                        <input
                          type="date"
                          value={form.dueDate || ''}
                          onChange={(e) => updateLinkedForm(form.formId, { dueDate: e.target.value })}
                          className="input text-sm"
                        />
                      </div>
                    </div>
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
            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
              {availableForms.length} available
            </span>
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
                <option value="all">All Categories</option>
                {FORM_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Category Groups */}
            {FORM_CATEGORIES.map(category => {
              const categoryForms = filteredAvailable.filter(f => f.category === category.id)
              if (categoryForms.length === 0) return null

              return (
                <div key={category.id}>
                  <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    {category.name}
                    <span className="text-xs text-gray-400">({categoryForms.length})</span>
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {categoryForms.map((form) => {
                      const FormIcon = form.icon ? (iconMap[form.icon] || FileText) : FileText
                      return (
                        <div 
                          key={form.id}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-aeria-blue transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-3">
                              <div className="p-1.5 bg-white rounded">
                                <FormIcon className="w-4 h-4 text-gray-500" />
                              </div>
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
                                <p className="text-xs text-gray-400 mt-1">
                                  {form.sections?.length || 0} sections
                                </p>
                              </div>
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
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {filteredAvailable.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                {linkedForms.length === availableForms.length 
                  ? 'All available forms have been added to this project.'
                  : 'No forms match your search.'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Digital Forms</h3>
            <p className="text-sm text-blue-700 mt-1">
              Forms from your HSE program are available here. Click the edit button to fill out a form, 
              or assign it to a crew member with a due date. Completed forms are stored with your project.
            </p>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {activeFormModal && (
        <FormModal
          form={activeFormModal}
          formTemplate={availableForms.find(f => f.id === activeFormModal.formId)}
          project={project}
          operators={operators}
          onSave={handleFormSave}
          onClose={() => setActiveFormModal(null)}
        />
      )}
    </div>
  )
}
