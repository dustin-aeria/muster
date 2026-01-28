/**
 * Calendar.jsx
 * Calendar view with system events and manual event creation
 *
 * @location src/pages/Calendar.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Download,
  X,
  Clock,
  MapPin,
  Users,
  Plane,
  GraduationCap,
  ClipboardCheck,
  AlertTriangle,
  FileText,
  Shield,
  Settings,
  RefreshCw
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO } from 'date-fns'
import { getProjects } from '../lib/firestore'
import { getAllTrainingRecords, getTrainingMetrics } from '../lib/firestoreTraining'
import { getInsurancePolicies } from '../lib/firestoreInsurance'
import { getInspections } from '../lib/firestoreInspections'
import { getUpcomingMaintenance, getAllMaintainableItems } from '../lib/firestoreMaintenance'

// Event types with colors
const EVENT_TYPES = {
  project: { label: 'Project', color: 'bg-blue-500', icon: Plane, bgLight: 'bg-blue-100 text-blue-800' },
  training: { label: 'Training', color: 'bg-green-500', icon: GraduationCap, bgLight: 'bg-green-100 text-green-800' },
  training_expiry: { label: 'Training Expiry', color: 'bg-yellow-500', icon: AlertTriangle, bgLight: 'bg-yellow-100 text-yellow-800' },
  inspection: { label: 'Inspection', color: 'bg-purple-500', icon: ClipboardCheck, bgLight: 'bg-purple-100 text-purple-800' },
  insurance_expiry: { label: 'Insurance Expiry', color: 'bg-red-500', icon: Shield, bgLight: 'bg-red-100 text-red-800' },
  maintenance: { label: 'Maintenance', color: 'bg-orange-500', icon: Settings, bgLight: 'bg-orange-100 text-orange-800' },
  manual: { label: 'Event', color: 'bg-gray-500', icon: CalendarIcon, bgLight: 'bg-gray-100 text-gray-800' }
}

export default function Calendar() {
  const { user } = useAuth()
  const operatorId = user?.uid

  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    project: true,
    training: true,
    training_expiry: true,
    inspection: true,
    insurance_expiry: true,
    maintenance: true,
    manual: true
  })

  // New event form
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    type: 'manual'
  })

  // Manual events storage (in real app, this would be in Firestore)
  const [manualEvents, setManualEvents] = useState([])

  useEffect(() => {
    if (operatorId) {
      loadEvents()
    }
  }, [operatorId, currentDate])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const allEvents = []

      // Load projects
      const projects = await getProjects(operatorId).catch(() => [])
      projects.forEach(project => {
        if (project.startDate) {
          allEvents.push({
            id: `project-${project.id}`,
            title: project.name || project.projectCode,
            date: project.startDate,
            type: 'project',
            source: 'project',
            sourceId: project.id,
            details: {
              client: project.clientName,
              location: project.location
            }
          })
        }
      })

      // Load training records with expiry dates
      const trainingRecords = await getAllTrainingRecords(operatorId).catch(() => [])
      trainingRecords.forEach(record => {
        if (record.expiryDate) {
          const expiryDate = record.expiryDate?.toDate?.() || new Date(record.expiryDate)
          allEvents.push({
            id: `training-expiry-${record.id}`,
            title: `${record.courseName} expires`,
            subtitle: record.crewMemberName,
            date: expiryDate,
            type: 'training_expiry',
            source: 'training',
            sourceId: record.id,
            details: {
              course: record.courseName,
              person: record.crewMemberName
            }
          })
        }
        if (record.completionDate) {
          const completionDate = record.completionDate?.toDate?.() || new Date(record.completionDate)
          allEvents.push({
            id: `training-${record.id}`,
            title: `${record.courseName} completed`,
            subtitle: record.crewMemberName,
            date: completionDate,
            type: 'training',
            source: 'training',
            sourceId: record.id
          })
        }
      })

      // Load insurance policies with expiry dates
      const policies = await getInsurancePolicies(operatorId).catch(() => [])
      policies.forEach(policy => {
        if (policy.expiryDate) {
          const expiryDate = policy.expiryDate?.toDate?.() || new Date(policy.expiryDate)
          allEvents.push({
            id: `insurance-${policy.id}`,
            title: `${policy.carrier} policy expires`,
            date: expiryDate,
            type: 'insurance_expiry',
            source: 'insurance',
            sourceId: policy.id,
            details: {
              carrier: policy.carrier,
              policyNumber: policy.policyNumber
            }
          })
        }
      })

      // Load inspections
      const inspections = await getInspections(operatorId).catch(() => [])
      inspections.forEach(inspection => {
        if (inspection.scheduledDate) {
          const scheduledDate = inspection.scheduledDate?.toDate?.() || new Date(inspection.scheduledDate)
          allEvents.push({
            id: `inspection-${inspection.id}`,
            title: inspection.templateName || 'Inspection',
            date: scheduledDate,
            type: 'inspection',
            source: 'inspection',
            sourceId: inspection.id,
            details: {
              location: inspection.location,
              inspector: inspection.inspectorName
            }
          })
        }
      })

      // Load maintenance due dates
      const maintenanceEvents = await getUpcomingMaintenance(365).catch(() => [])
      maintenanceEvents.forEach(maint => {
        if (maint.dueDate) {
          const dueDate = new Date(maint.dueDate)
          allEvents.push({
            id: `maintenance-${maint.itemId}-${maint.scheduleId}`,
            title: `${maint.itemName} maintenance due`,
            subtitle: maint.scheduleName || 'Scheduled maintenance',
            date: dueDate,
            type: 'maintenance',
            source: 'maintenance',
            sourceId: maint.itemId,
            status: maint.status,
            details: {
              itemType: maint.itemType,
              daysUntil: maint.daysUntil
            }
          })
        }
      })

      // Add manual events
      manualEvents.forEach(event => {
        allEvents.push({
          ...event,
          type: 'manual'
        })
      })

      setEvents(allEvents)
    } catch (err) {
      console.error('Error loading calendar events:', err)
    } finally {
      setLoading(false)
    }
  }

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate)
    const end = endOfMonth(currentDate)
    const days = eachDayOfInterval({ start, end })

    // Add padding days from previous month
    const startDay = start.getDay()
    const paddingStart = []
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(start)
      date.setDate(date.getDate() - i - 1)
      paddingStart.push({ date, isCurrentMonth: false })
    }

    // Add padding days for next month
    const endDay = end.getDay()
    const paddingEnd = []
    for (let i = 1; i < 7 - endDay; i++) {
      const date = new Date(end)
      date.setDate(date.getDate() + i)
      paddingEnd.push({ date, isCurrentMonth: false })
    }

    return [
      ...paddingStart,
      ...days.map(date => ({ date, isCurrentMonth: true })),
      ...paddingEnd
    ]
  }, [currentDate])

  // Get events for a specific day
  const getEventsForDay = (date) => {
    return events.filter(event => {
      const eventDate = event.date instanceof Date ? event.date : new Date(event.date)
      return isSameDay(eventDate, date) && filters[event.type]
    })
  }

  // Navigation
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const goToToday = () => setCurrentDate(new Date())

  // Handle adding a new event
  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) return

    const event = {
      id: `manual-${Date.now()}`,
      title: newEvent.title,
      date: new Date(`${newEvent.date}T${newEvent.time || '00:00'}`),
      location: newEvent.location,
      description: newEvent.description,
      type: 'manual'
    }

    setManualEvents(prev => [...prev, event])
    setEvents(prev => [...prev, event])
    setShowEventModal(false)
    setNewEvent({ title: '', date: '', time: '', location: '', description: '', type: 'manual' })
  }

  // Export to ICS
  const exportToICS = () => {
    const filteredEvents = events.filter(e => filters[e.type])

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Aeria Ops//Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ]

    filteredEvents.forEach(event => {
      const eventDate = event.date instanceof Date ? event.date : new Date(event.date)
      const dateStr = format(eventDate, "yyyyMMdd'T'HHmmss")

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${event.id}@aeriaops`,
        `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss")}`,
        `DTSTART:${dateStr}`,
        `SUMMARY:${event.title}`,
        event.location ? `LOCATION:${event.location}` : '',
        event.description ? `DESCRIPTION:${event.description}` : '',
        'END:VEVENT'
      )
    })

    icsContent.push('END:VCALENDAR')

    const blob = new Blob([icsContent.filter(Boolean).join('\r\n')], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aeria-ops-calendar-${format(currentDate, 'yyyy-MM')}.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-aeria-blue" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1">View all scheduled events and deadlines</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-2 border rounded-lg transition-colors ${
              showFilters ? 'border-aeria-blue text-aeria-blue bg-aeria-blue/5' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={exportToICS}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => {
              setNewEvent(prev => ({ ...prev, date: format(selectedDate || new Date(), 'yyyy-MM-dd') }))
              setShowEventModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap gap-3">
            {Object.entries(EVENT_TYPES).map(([key, type]) => (
              <label
                key={key}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
                  filters[key] ? type.bgLight : 'bg-gray-100 text-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={filters[key]}
                  onChange={(e) => setFilters(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="sr-only"
                />
                <type.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{type.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm text-aeria-blue hover:bg-aeria-blue/5 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ date, isCurrentMonth }, idx) => {
              const dayEvents = getEventsForDay(date)
              const isSelected = selectedDate && isSameDay(date, selectedDate)
              const isTodayDate = isToday(date)

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(date)}
                  className={`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors ${
                    isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  } ${isSelected ? 'border-aeria-blue ring-1 ring-aeria-blue' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isTodayDate ? 'w-6 h-6 flex items-center justify-center bg-aeria-blue text-white rounded-full' :
                    isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {format(date, 'd')}
                  </div>

                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => {
                      const eventType = EVENT_TYPES[event.type]
                      return (
                        <div
                          key={event.id}
                          className={`text-xs px-1.5 py-0.5 rounded truncate ${eventType.color} text-white`}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      )
                    })}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 px-1.5">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Selected Day Events */}
      {selectedDate && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {getEventsForDay(selectedDate).length === 0 ? (
            <p className="text-gray-500 text-center py-8">No events on this day</p>
          ) : (
            <div className="space-y-3">
              {getEventsForDay(selectedDate).map(event => {
                const eventType = EVENT_TYPES[event.type]
                const EventIcon = eventType.icon

                return (
                  <div
                    key={event.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${eventType.color.replace('bg-', 'border-')} bg-gray-50`}
                  >
                    <div className={`p-2 rounded-lg ${eventType.bgLight}`}>
                      <EventIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      {event.subtitle && (
                        <p className="text-sm text-gray-600">{event.subtitle}</p>
                      )}
                      {event.details?.location && (
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {event.details.location}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${eventType.bgLight}`}>
                      {eventType.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Add Event</h3>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                  placeholder="Enter event title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                  placeholder="Enter location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
                  rows={3}
                  placeholder="Enter description"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                disabled={!newEvent.title || !newEvent.date}
                className="px-4 py-2 bg-aeria-blue text-white rounded-lg hover:bg-aeria-navy transition-colors disabled:opacity-50"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
