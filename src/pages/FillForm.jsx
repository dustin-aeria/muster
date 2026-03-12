/**
 * FillForm Page
 * Page for filling out a form template
 *
 * Features:
 * - Load form template and parse fields
 * - Interactive form filling
 * - Draft saving
 * - PDF generation
 * - Workflow integration
 *
 * @version 1.0.0
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  Save,
  Send,
  Download,
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle,
  GitBranch,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../hooks/useOrganization'
import { getCustomForm } from '../lib/firestore'
import {
  createFormSubmission,
  updateFormSubmission,
  submitFormSubmission,
  getFormSubmission,
  updateSubmissionPdf,
} from '../lib/firestoreFormSubmissions'
import {
  getActiveWorkflowTemplates,
  startWorkflow,
} from '../lib/firestoreWorkflows'
import { linkWorkflowToSubmission } from '../lib/firestoreFormSubmissions'
import {
  parseFormToFields,
  createInitialValues,
  validateForm,
} from '../lib/formParser'
import { generateFormPdf, openPrintPreview } from '../lib/pdfGenerator'
import FillableForm from '../components/FillableForm'
import LoadingSpinner from '../components/LoadingSpinner'

export default function FillForm() {
  const { formId } = useParams()
  const [searchParams] = useSearchParams()
  const submissionId = searchParams.get('submission')
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  const { organization } = useOrganization()

  // State
  const [form, setForm] = useState(null)
  const [submission, setSubmission] = useState(null)
  const [fields, setFields] = useState([])
  const [values, setValues] = useState({})
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [workflowTemplates, setWorkflowTemplates] = useState([])
  const [selectedWorkflow, setSelectedWorkflow] = useState('')
  const [showWorkflowOptions, setShowWorkflowOptions] = useState(false)

  // Load form and submission data
  useEffect(() => {
    async function loadData() {
      if (!formId || !organization?.id) return

      setLoading(true)
      setError(null)

      try {
        // Load the form template (custom form)
        const formDoc = await getCustomForm(formId)
        if (!formDoc) {
          setError('Form template not found')
          return
        }
        setForm(formDoc)

        // Get form fields - either from the form's fields array or by parsing markdown content
        let parsedFields = []
        if (formDoc.fields && Array.isArray(formDoc.fields) && formDoc.fields.length > 0) {
          // Custom form builder fields - normalize to our field format
          parsedFields = formDoc.fields.map((f, idx) => ({
            id: f.id || `field_${idx}`,
            label: f.label || f.name || `Field ${idx + 1}`,
            type: f.type || 'text',
            required: f.required || false,
            options: f.options || [],
            placeholder: f.placeholder || '',
            defaultValue: f.defaultValue || '',
          }))
        } else if (formDoc.content) {
          // Markdown content - parse to extract fields
          parsedFields = parseFormToFields(formDoc.content)
        }
        setFields(parsedFields)

        // Load existing submission if editing
        if (submissionId) {
          const existingSubmission = await getFormSubmission(submissionId)
          if (existingSubmission) {
            setSubmission(existingSubmission)
            setValues(existingSubmission.fieldValues || {})
          }
        } else {
          // Create initial values
          setValues(createInitialValues(parsedFields))
        }

        // Load workflow templates for this form type
        const workflows = await getActiveWorkflowTemplates(organization.id)
        // Filter workflows that can be triggered by form submission
        const applicableWorkflows = workflows.filter(w => {
          if (w.triggerType === 'manual') return true
          if (w.triggerType === 'form_submission') {
            // Check if this form type matches
            if (!w.triggerFormTypes || w.triggerFormTypes.length === 0) return true
            return w.triggerFormTypes.includes(formDoc.doc_type)
          }
          return false
        })
        setWorkflowTemplates(applicableWorkflows)
      } catch (err) {
        console.error('Error loading form:', err)
        setError(err.message || 'Failed to load form')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [formId, submissionId, organization?.id])

  // Handle field changes
  const handleChange = (newValues) => {
    setValues(newValues)
    setSuccessMessage(null)
  }

  // Save draft
  const handleSaveDraft = async () => {
    if (!organization?.id || !user?.uid) return

    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const userName = userProfile?.firstName
        ? `${userProfile.firstName} ${userProfile.lastName}`
        : user.email

      if (submission) {
        // Update existing submission
        await updateFormSubmission(submission.id, {
          fieldValues: values,
          fieldDefinitions: fields,
        })
        setSuccessMessage('Draft saved successfully')
      } else {
        // Create new submission
        const newSubmission = await createFormSubmission({
          formId,
          formTitle: (form.title || form.name),
          formNumber: (form.form_number || form.formNumber),
          organizationId: organization.id,
          fieldValues: values,
          fieldDefinitions: fields,
          createdBy: user.uid,
          createdByName: userName,
        })
        setSubmission(newSubmission)
        // Update URL without full navigation
        window.history.replaceState(
          null,
          '',
          `/forms/${formId}/fill?submission=${newSubmission.id}`
        )
        setSuccessMessage('Draft created successfully')
      }
    } catch (err) {
      console.error('Error saving draft:', err)
      setError(err.message || 'Failed to save draft')
    } finally {
      setSaving(false)
    }
  }

  // Submit form
  const handleSubmit = async (formValues) => {
    if (!organization?.id || !user?.uid) return

    // Validate form
    const validation = validateForm(fields, formValues)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    setSubmitting(true)
    setError(null)
    setErrors({})

    try {
      const userName = userProfile?.firstName
        ? `${userProfile.firstName} ${userProfile.lastName}`
        : user.email

      let currentSubmission = submission

      // Create or update submission
      if (currentSubmission) {
        await updateFormSubmission(currentSubmission.id, {
          fieldValues: formValues,
          fieldDefinitions: fields,
        })
      } else {
        currentSubmission = await createFormSubmission({
          formId,
          formTitle: (form.title || form.name),
          formNumber: (form.form_number || form.formNumber),
          organizationId: organization.id,
          fieldValues: formValues,
          fieldDefinitions: fields,
          createdBy: user.uid,
          createdByName: userName,
        })
        setSubmission(currentSubmission)
      }

      // Submit the form
      await submitFormSubmission(currentSubmission.id, user.uid, userName)

      // Start workflow if selected
      if (selectedWorkflow) {
        const workflowInstance = await startWorkflow({
          templateId: selectedWorkflow,
          organizationId: organization.id,
          entityType: 'form_submission',
          entityId: currentSubmission.id,
          entityTitle: (form.title || form.name),
          startedBy: user.uid,
          startedByName: userName,
        })

        // Link workflow to submission
        await linkWorkflowToSubmission(currentSubmission.id, workflowInstance.id)
      }

      // Generate PDF
      try {
        const pdfBlob = await generateFormPdf({
          title: (form.title || form.name),
          formNumber: (form.form_number || form.formNumber),
          template: form.content,
          fieldValues: formValues,
          fieldDefinitions: fields,
          metadata: {
            submittedBy: userName,
            organization: organization.name,
          },
        })

        if (pdfBlob) {
          // In production, upload to Firebase Storage
          // For now, we'll just log success
          console.log('PDF generated successfully')
        }
      } catch (pdfError) {
        console.warn('PDF generation failed:', pdfError)
        // Don't block submission for PDF failure
      }

      setSuccessMessage('Form submitted successfully!')

      // Navigate to submissions list after short delay
      setTimeout(() => {
        navigate('/form-submissions')
      }, 1500)
    } catch (err) {
      console.error('Error submitting form:', err)
      setError(err.message || 'Failed to submit form')
    } finally {
      setSubmitting(false)
    }
  }

  // Preview/print form
  const handlePreview = () => {
    const userName = userProfile?.firstName
      ? `${userProfile.firstName} ${userProfile.lastName}`
      : user.email

    openPrintPreview({
      title: (form.title || form.name),
      formNumber: (form.form_number || form.formNumber),
      template: form.content,
      fieldValues: values,
      fieldDefinitions: fields,
      metadata: {
        submittedBy: userName,
        organization: organization?.name,
      },
    })
  }

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading form..." />
  }

  if (error && !form) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Form</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/forms')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Forms
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/forms')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Forms
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-7 h-7 text-blue-600" />
              {form?.title}
            </h1>
            {form?.form_number && (
              <p className="text-gray-500 mt-1">Form #{(form.form_number || form.formNumber)}</p>
            )}
            {submission && (
              <p className="text-sm text-gray-500 mt-1">
                {submission.status === 'draft' ? (
                  <span className="text-amber-600">Draft - Last saved {submission.updatedAt?.toLocaleDateString()}</span>
                ) : (
                  <span className="text-green-600">Submitted {submission.submittedAt?.toLocaleDateString()}</span>
                )}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePreview}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">Error</p>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-800">Success</p>
            <p className="text-green-600">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Form content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {fields.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No fillable fields detected</p>
            <p className="text-sm mt-2">
              This form template does not contain any recognizable fillable fields.
            </p>
          </div>
        ) : (
          <>
            <FillableForm
              fields={fields}
              values={values}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onSaveDraft={handleSaveDraft}
              loading={saving || submitting}
              errors={errors}
              readOnly={submission?.status === 'submitted' || submission?.status === 'approved'}
            />

            {/* Workflow options */}
            {workflowTemplates.length > 0 && submission?.status !== 'submitted' && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowWorkflowOptions(!showWorkflowOptions)}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                >
                  <GitBranch className="w-5 h-5" />
                  <span className="font-medium">Workflow Options</span>
                </button>

                {showWorkflowOptions && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start a workflow when submitting:
                    </label>
                    <select
                      value={selectedWorkflow}
                      onChange={(e) => setSelectedWorkflow(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">No workflow (submit directly)</option>
                      {workflowTemplates.map((wf) => (
                        <option key={wf.id} value={wf.id}>
                          {wf.name} - {wf.description || `${wf.steps?.length || 0} steps`}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                      {selectedWorkflow
                        ? 'The form will go through an approval workflow after submission.'
                        : 'The form will be submitted directly without approval workflow.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Form description */}
      {form?.description && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">About this form</h3>
          <p className="text-blue-700 text-sm">{form.description}</p>
        </div>
      )}
    </div>
  )
}
