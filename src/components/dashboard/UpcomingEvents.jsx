/**
 * Upcoming Events Widget
 * Shows upcoming calendar events from projects, training, etc.
 *
 * @location src/components/dashboard/UpcomingEvents.jsx
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  FolderKanban,
  GraduationCap,
  ClipboardCheck,
  Shield,
  ArrowRight,
  Clock,
  MapPin,
  FileCheck,
  Scale
} from 'lucide-react'
import { getProjects } from '../../lib/firestore'
import { getAllTrainingRecords } from '../../lib/firestoreTraining'
import { getInspections } from '../../lib/firestoreInspections'
import { getInsurancePolicies } from '../../lib/firestoreInsurance'
import { getSFOCApplications } from '../../lib/firestoreSFOC'
import { useAuth } from '../../contexts/AuthContext'
import { useOrganization } from '../../hooks/useOrganization'
import { addDays, isBefore, isAfter, startOfDay, format } from 'date-fns'

const EVENT_TYPES = {
  project: { icon: FolderKanban, color: 'bg-blue-100 text-blue-700', label: 'Project' },
  training: { icon: GraduationCap, color: 'bg-green-100 text-green-700', label: 'Training' },
  inspection: { icon: ClipboardCheck, color: 'bg-purple-100 text-purple-700', label: 'Inspection' },
  insurance: { icon: Shield, color: 'bg-orange-100 text-orange-700', label: 'Insurance' },
  sfoc: { icon: FileCheck, color: 'bg-indigo-100 text-indigo-700', label: 'SFOC' },
  sora: { icon: Scale, color: 'bg-violet-100 text-violet-700', label: 'SORA' }
}

export default function UpcomingEvents({ daysAhead = 14, limit = 5 }) {
  const { user } = useAuth()
  const { organizationId } = useOrganization()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEvents = async () => {
      if (!user?.uid || !organizationId) return

      setLoading(true)
      const allEvents = []
      const today = startOfDay(new Date())
      const endDate = addDays(today, daysAhead)

      try {
        // Load projects with start dates
        const projects = await getProjects(organizationId)
        projects.forEach(project => {
          if (project.startDate) {
            const startDate = new Date(project.startDate)
            if (isAfter(startDate, today) && isBefore(startDate, endDate)) {
              allEvents.push({
                id: `project-${project.id}`,
                type: 'project',
                title: project.name,
                date: startDate,
                description: project.location || project.clientName || 'Project starts',
                link: `/projects/${project.id}`
              })
            }
          }
        })

        // Load training due dates
        try {
          const training = await getAllTrainingRecords(user.uid)
          training.forEach(record => {
            if (record.dueDate) {
              const dueDate = record.dueDate?.toDate ? record.dueDate.toDate() : new Date(record.dueDate)
              if (isAfter(dueDate, today) && isBefore(dueDate, endDate)) {
                allEvents.push({
                  id: `training-${record.id}`,
                  type: 'training',
                  title: record.courseName || 'Training Due',
                  date: dueDate,
                  description: record.employeeName || 'Training required',
                  link: '/training'
                })
              }
            }
          })
        } catch (err) {
          // Training data optional
        }

        // Load upcoming inspections
        try {
          const inspections = await getInspections(user.uid)
          inspections.forEach(inspection => {
            if (inspection.scheduledDate) {
              const scheduledDate = inspection.scheduledDate?.toDate ? inspection.scheduledDate.toDate() : new Date(inspection.scheduledDate)
              if (isAfter(scheduledDate, today) && isBefore(scheduledDate, endDate)) {
                allEvents.push({
                  id: `inspection-${inspection.id}`,
                  type: 'inspection',
                  title: inspection.name || 'Inspection',
                  date: scheduledDate,
                  description: inspection.location || inspection.type || 'Scheduled inspection',
                  link: '/inspections'
                })
              }
            }
          })
        } catch (err) {
          // Inspection data optional
        }

        // Load insurance expiry
        try {
          const insurance = await getInsurancePolicies(user.uid)
          insurance.forEach(policy => {
            if (policy.expiryDate) {
              const expiryDate = policy.expiryDate?.toDate ? policy.expiryDate.toDate() : new Date(policy.expiryDate)
              if (isAfter(expiryDate, today) && isBefore(expiryDate, endDate)) {
                allEvents.push({
                  id: `insurance-${policy.id}`,
                  type: 'insurance',
                  title: policy.policyName || 'Insurance Expiry',
                  date: expiryDate,
                  description: `${policy.provider || 'Policy'} expires`,
                  link: '/settings?tab=insurance'
                })
              }
            }
          })
        } catch (err) {
          // Insurance data optional
        }

        // Load SFOC expiry dates
        try {
          const sfocs = await getSFOCApplications(organizationId)
          sfocs.forEach(sfoc => {
            // Add expiring SFOCs
            if (sfoc.status === 'approved' && sfoc.approvedEndDate) {
              const expiryDate = sfoc.approvedEndDate?.toDate ? sfoc.approvedEndDate.toDate() : new Date(sfoc.approvedEndDate)
              // Show SFOC expiry in calendar view (extend to 60 days for better visibility)
              const sfocEndDate = addDays(today, 60)
              if (isAfter(expiryDate, today) && isBefore(expiryDate, sfocEndDate)) {
                allEvents.push({
                  id: `sfoc-${sfoc.id}`,
                  type: 'sfoc',
                  title: `SFOC Expiry: ${sfoc.name}`,
                  date: expiryDate,
                  description: sfoc.sfocNumber ? `SFOC #${sfoc.sfocNumber} expires` : 'SFOC authorization expires',
                  link: `/sfoc/${sfoc.id}`
                })
              }
            }
            // Add submitted SFOCs awaiting review
            if (sfoc.status === 'submitted' && sfoc.submissionDate) {
              const submissionDate = sfoc.submissionDate?.toDate ? sfoc.submissionDate.toDate() : new Date(sfoc.submissionDate)
              if (isAfter(submissionDate, addDays(today, -30))) {
                allEvents.push({
                  id: `sfoc-pending-${sfoc.id}`,
                  type: 'sfoc',
                  title: `SFOC Pending: ${sfoc.name}`,
                  date: submissionDate,
                  description: 'Awaiting TC review',
                  link: `/sfoc/${sfoc.id}`
                })
              }
            }
          })
        } catch (err) {
          // SFOC data optional
        }

        // Sort by date and limit
        allEvents.sort((a, b) => a.date - b.date)
        setEvents(allEvents.slice(0, limit))
      } catch (err) {
        // Widget is optional, fail silently
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [user?.uid, organizationId, daysAhead, limit])

  const formatEventDate = (date) => {
    const today = startOfDay(new Date())
    const tomorrow = addDays(today, 1)
    const eventDay = startOfDay(date)

    if (eventDay.getTime() === today.getTime()) {
      return `Today, ${format(date, 'h:mm a')}`
    }
    if (eventDay.getTime() === tomorrow.getTime()) {
      return `Tomorrow, ${format(date, 'h:mm a')}`
    }
    return format(date, 'EEE, MMM d')
  }

  const getDaysUntil = (date) => {
    const today = startOfDay(new Date())
    const diff = Math.ceil((date - today) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Today'
    if (diff === 1) return 'Tomorrow'
    return `${diff} days`
  }

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-aeria-navy" />
            Upcoming Events
          </h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <div className="h-4 w-36 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 w-24 bg-gray-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-aeria-navy" />
          Upcoming Events
        </h2>
        <Link to="/calendar" className="text-sm text-aeria-blue hover:text-aeria-navy flex items-center gap-1">
          View calendar
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No upcoming events</p>
          <p className="text-xs mt-1">Events from the next {daysAhead} days will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((event) => {
            const typeConfig = EVENT_TYPES[event.type]
            const Icon = typeConfig?.icon || Calendar

            return (
              <Link
                key={event.id}
                to={event.link}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`p-2 rounded ${typeConfig?.color || 'bg-gray-100 text-gray-700'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{event.title}</p>
                  <p className="text-xs text-gray-500 truncate">{event.description}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {formatEventDate(event.date)}
                  </p>
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  {getDaysUntil(event.date)}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
