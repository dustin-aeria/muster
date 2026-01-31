/**
 * MaintenanceCalendar.jsx
 * Maintenance-focused calendar view showing upcoming and overdue maintenance
 *
 * This is a wrapper around the main Calendar component that:
 * - Pre-filters to show only maintenance events
 * - Adds maintenance-specific quick actions
 * - Links back to maintenance dashboard
 *
 * @location src/pages/MaintenanceCalendar.jsx
 */

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Wrench,
  Plane,
  Package,
  AlertTriangle,
  Clock,
  CheckCircle,
  RefreshCw
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import { getUpcomingMaintenance, getAllMaintainableItems } from '../lib/firestoreMaintenance'
import { useOrganization } from '../hooks/useOrganization'

// Status colors and icons
const statusConfig = {
  ok: { color: 'bg-green-500', label: 'On Track' },
  due_soon: { color: 'bg-amber-500', label: 'Due Soon' },
  overdue: { color: 'bg-red-500', label: 'Overdue' }
}

export default function MaintenanceCalendar() {
  const { organizationId } = useOrganization()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(null)
  const [stats, setStats] = useState({ total: 0, overdue: 0, dueSoon: 0 })

  useEffect(() => {
    if (organizationId) {
      loadMaintenanceEvents()
    }
  }, [currentDate, organizationId])

  const loadMaintenanceEvents = async () => {
    if (!organizationId) return
    setLoading(true)
    try {
      // Get upcoming maintenance for the next year
      const maintenanceEvents = await getUpcomingMaintenance(organizationId, 365)

      // Calculate stats
      const overdueCount = maintenanceEvents.filter(e => e.status === 'overdue').length
      const dueSoonCount = maintenanceEvents.filter(e => e.status === 'due_soon').length

      setStats({
        total: maintenanceEvents.length,
        overdue: overdueCount,
        dueSoon: dueSoonCount
      })

      setEvents(maintenanceEvents)
    } catch (err) {
      console.error('Error loading maintenance events:', err)
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
      const eventDate = new Date(event.dueDate)
      return isSameDay(eventDate, date)
    })
  }

  // Navigation
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const goToToday = () => setCurrentDate(new Date())

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-aeria-navy" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            to="/maintenance"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <CalendarIcon className="w-7 h-7 text-aeria-navy" />
            Maintenance Calendar
          </h1>
          <p className="text-gray-500 mt-1">
            View upcoming and overdue maintenance schedules
          </p>
        </div>
        <Link
          to="/maintenance/items"
          className="btn-primary flex items-center gap-2"
        >
          <Wrench className="w-4 h-4" />
          View All Items
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-100">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500">Scheduled Events</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-100">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{stats.dueSoon}</p>
            <p className="text-sm text-gray-500">Due Soon</p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-red-100">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            <p className="text-sm text-gray-500">Overdue</p>
          </div>
        </div>
      </div>

      {/* Calendar */}
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
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                Overdue
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                Due Soon
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                On Track
              </span>
            </div>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-sm text-aeria-navy hover:bg-aeria-sky/20 rounded-lg transition-colors"
            >
              Today
            </button>
          </div>
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

              // Count by status
              const overdueCount = dayEvents.filter(e => e.status === 'overdue').length
              const dueSoonCount = dayEvents.filter(e => e.status === 'due_soon').length
              const okCount = dayEvents.filter(e => e.status === 'ok').length

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(date)}
                  className={`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors ${
                    isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  } ${isSelected ? 'border-aeria-navy ring-1 ring-aeria-navy' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isTodayDate ? 'w-6 h-6 flex items-center justify-center bg-aeria-navy text-white rounded-full' :
                    isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {format(date, 'd')}
                  </div>

                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => {
                      const config = statusConfig[event.status] || statusConfig.ok
                      const ItemIcon = event.itemType === 'aircraft' ? Plane : Package
                      return (
                        <div
                          key={`${event.itemId}-${event.scheduleId}`}
                          className={`text-xs px-1.5 py-0.5 rounded truncate ${config.color} text-white flex items-center gap-1`}
                          title={`${event.itemName} - ${event.scheduleName || 'Maintenance'}`}
                        >
                          <ItemIcon className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{event.itemName}</span>
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
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Close
            </button>
          </div>

          {getEventsForDay(selectedDate).length === 0 ? (
            <p className="text-gray-500 text-center py-8">No maintenance due on this day</p>
          ) : (
            <div className="space-y-3">
              {getEventsForDay(selectedDate).map(event => {
                const config = statusConfig[event.status] || statusConfig.ok
                const ItemIcon = event.itemType === 'aircraft' ? Plane : Package

                return (
                  <Link
                    key={`${event.itemId}-${event.scheduleId}`}
                    to={`/maintenance/item/${event.itemType}/${event.itemId}`}
                    className={`flex items-start gap-3 p-4 rounded-lg border-l-4 bg-gray-50 hover:bg-gray-100 transition-colors ${
                      event.status === 'overdue' ? 'border-red-500' :
                      event.status === 'due_soon' ? 'border-amber-500' :
                      'border-green-500'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      event.status === 'overdue' ? 'bg-red-100' :
                      event.status === 'due_soon' ? 'bg-amber-100' :
                      'bg-green-100'
                    }`}>
                      <ItemIcon className={`w-5 h-5 ${
                        event.status === 'overdue' ? 'text-red-600' :
                        event.status === 'due_soon' ? 'text-amber-600' :
                        'text-green-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{event.itemName}</h4>
                      <p className="text-sm text-gray-600">{event.scheduleName || 'Scheduled Maintenance'}</p>
                      <p className="text-sm text-gray-500 mt-1 capitalize">{event.itemType}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      event.status === 'overdue' ? 'bg-red-100 text-red-700' :
                      event.status === 'due_soon' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {config.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
