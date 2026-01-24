/**
 * Timeline Component
 * Vertical and horizontal timelines for events and activities
 *
 * @location src/components/ui/Timeline.jsx
 */

import React from 'react'
import { Check, Circle, Clock, AlertCircle, ChevronRight } from 'lucide-react'

// ============================================
// BASE TIMELINE
// ============================================

/**
 * Base timeline container
 */
export function Timeline({
  children,
  orientation = 'vertical',
  align = 'left',
  className = ''
}) {
  const alignClasses = {
    left: '',
    center: 'items-center',
    right: 'items-end',
    alternate: ''
  }

  if (orientation === 'horizontal') {
    return (
      <div className={`flex items-start ${className}`}>
        {children}
      </div>
    )
  }

  return (
    <div className={`flex flex-col ${alignClasses[align]} ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child

        return React.cloneElement(child, {
          isFirst: index === 0,
          isLast: index === React.Children.count(children) - 1,
          align: align === 'alternate' ? (index % 2 === 0 ? 'left' : 'right') : align
        })
      })}
    </div>
  )
}

// ============================================
// TIMELINE ITEM
// ============================================

/**
 * Individual timeline item
 */
export function TimelineItem({
  children,
  icon,
  iconBg = 'bg-blue-500',
  iconColor = 'text-white',
  date,
  title,
  description,
  status,
  isFirst,
  isLast,
  align = 'left',
  className = ''
}) {
  const statusIcons = {
    completed: { icon: Check, bg: 'bg-green-500' },
    current: { icon: Circle, bg: 'bg-blue-500' },
    pending: { icon: Clock, bg: 'bg-gray-400' },
    error: { icon: AlertCircle, bg: 'bg-red-500' }
  }

  const statusConfig = status ? statusIcons[status] : null
  const Icon = icon || (statusConfig?.icon) || Circle
  const bgColor = statusConfig?.bg || iconBg

  const isRight = align === 'right'
  const isCenter = align === 'center'

  return (
    <div className={`flex ${isRight ? 'flex-row-reverse' : ''} ${className}`}>
      {/* Timeline connector */}
      <div className={`flex flex-col items-center ${isCenter ? 'mx-4' : isRight ? 'ml-4' : 'mr-4'}`}>
        <div className={`flex items-center justify-center h-8 w-8 rounded-full ${bgColor} ${iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gray-200 min-h-[2rem]" />
        )}
      </div>

      {/* Content */}
      <div className={`pb-8 ${isRight ? 'text-right' : ''} ${isLast ? 'pb-0' : ''}`}>
        {date && (
          <time className="text-xs text-gray-500 font-medium">
            {date}
          </time>
        )}
        {title && (
          <h4 className="text-sm font-medium text-gray-900 mt-1">
            {title}
          </h4>
        )}
        {description && (
          <p className="text-sm text-gray-600 mt-1">
            {description}
          </p>
        )}
        {children}
      </div>
    </div>
  )
}

// ============================================
// SIMPLE TIMELINE
// ============================================

/**
 * Simple timeline from array
 */
export function SimpleTimeline({
  items = [],
  orientation = 'vertical',
  className = ''
}) {
  return (
    <Timeline orientation={orientation} className={className}>
      {items.map((item, index) => (
        <TimelineItem
          key={item.id || index}
          icon={item.icon}
          iconBg={item.iconBg}
          iconColor={item.iconColor}
          date={item.date}
          title={item.title}
          description={item.description}
          status={item.status}
        >
          {item.content}
        </TimelineItem>
      ))}
    </Timeline>
  )
}

// ============================================
// ACTIVITY TIMELINE
// ============================================

/**
 * Activity feed timeline
 */
export function ActivityTimeline({
  activities = [],
  showLoadMore = false,
  onLoadMore,
  loadMoreLabel = 'Load more',
  className = ''
}) {
  return (
    <div className={className}>
      <div className="flow-root">
        <ul className="-mb-8">
          {activities.map((activity, index) => {
            const isLast = index === activities.length - 1

            return (
              <li key={activity.id || index}>
                <div className="relative pb-8">
                  {!isLast && (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      {activity.avatar ? (
                        <img
                          src={activity.avatar}
                          alt=""
                          className="h-8 w-8 rounded-full bg-gray-400"
                        />
                      ) : (
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${activity.iconBg || 'bg-blue-500'}`}>
                          {activity.icon ? (
                            <activity.icon className={`h-4 w-4 ${activity.iconColor || 'text-white'}`} />
                          ) : (
                            <span className="text-white text-xs font-medium">
                              {activity.user?.charAt(0) || '?'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div>
                        <p className="text-sm text-gray-600">
                          {activity.user && (
                            <span className="font-medium text-gray-900">
                              {activity.user}
                            </span>
                          )}{' '}
                          {activity.action}
                          {activity.target && (
                            <>
                              {' '}
                              <span className="font-medium text-gray-900">
                                {activity.target}
                              </span>
                            </>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {activity.time}
                        </p>
                      </div>
                      {activity.comment && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                          {activity.comment}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
      {showLoadMore && (
        <div className="mt-6 text-center">
          <button
            onClick={onLoadMore}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {loadMoreLabel}
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================
// HORIZONTAL TIMELINE
// ============================================

/**
 * Horizontal timeline
 */
export function HorizontalTimeline({
  items = [],
  activeIndex = 0,
  onItemClick,
  className = ''
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="flex items-center min-w-max">
        {items.map((item, index) => {
          const isActive = index === activeIndex
          const isCompleted = index < activeIndex
          const isLast = index === items.length - 1

          return (
            <div
              key={item.id || index}
              className="flex items-center"
            >
              <button
                onClick={() => onItemClick?.(index)}
                className="flex flex-col items-center"
              >
                <div
                  className={`
                    h-10 w-10 rounded-full flex items-center justify-center
                    transition-colors
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${isActive ? 'bg-blue-500 text-white ring-4 ring-blue-100' : ''}
                    ${!isCompleted && !isActive ? 'bg-gray-200 text-gray-500' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : item.icon ? (
                    <item.icon className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-900'}`}>
                    {item.title}
                  </p>
                  {item.date && (
                    <p className="text-xs text-gray-500">{item.date}</p>
                  )}
                </div>
              </button>
              {!isLast && (
                <div className={`w-20 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// CENTERED TIMELINE
// ============================================

/**
 * Timeline with content on alternating sides
 */
export function CenteredTimeline({
  items = [],
  className = ''
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Center line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />

      {items.map((item, index) => {
        const isLeft = index % 2 === 0

        return (
          <div
            key={item.id || index}
            className={`relative flex items-center mb-8 last:mb-0 ${isLeft ? '' : 'flex-row-reverse'}`}
          >
            {/* Content */}
            <div className={`w-5/12 ${isLeft ? 'pr-8 text-right' : 'pl-8'}`}>
              {item.date && (
                <time className="text-xs text-gray-500 font-medium">
                  {item.date}
                </time>
              )}
              <h4 className="text-base font-medium text-gray-900 mt-1">
                {item.title}
              </h4>
              {item.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {item.description}
                </p>
              )}
            </div>

            {/* Center dot */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
              <div className={`h-4 w-4 rounded-full ${item.color || 'bg-blue-500'} ring-4 ring-white`} />
            </div>

            {/* Spacer */}
            <div className="w-5/12" />
          </div>
        )
      })}
    </div>
  )
}

// ============================================
// COMPACT TIMELINE
// ============================================

/**
 * Compact timeline for small spaces
 */
export function CompactTimeline({
  items = [],
  className = ''
}) {
  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => (
        <div key={item.id || index} className="flex items-start gap-3">
          <div className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${item.color || 'bg-blue-500'}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-gray-900 truncate">{item.title}</p>
              {item.time && (
                <span className="text-xs text-gray-500 flex-shrink-0">{item.time}</span>
              )}
            </div>
            {item.description && (
              <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================
// TIMELINE CARD
// ============================================

/**
 * Timeline with card content
 */
export function TimelineCard({
  items = [],
  className = ''
}) {
  return (
    <div className={`relative ${className}`}>
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

      {items.map((item, index) => (
        <div key={item.id || index} className="relative flex gap-4 pb-8 last:pb-0">
          {/* Dot */}
          <div className="relative z-10">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${item.iconBg || 'bg-blue-500'}`}>
              {item.icon ? (
                <item.icon className={`h-4 w-4 ${item.iconColor || 'text-white'}`} />
              ) : (
                <Circle className="h-4 w-4 text-white" />
              )}
            </div>
          </div>

          {/* Card */}
          <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                {item.subtitle && (
                  <p className="text-xs text-gray-500 mt-0.5">{item.subtitle}</p>
                )}
              </div>
              {item.time && (
                <span className="text-xs text-gray-500 flex-shrink-0">{item.time}</span>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-gray-600 mt-2">{item.description}</p>
            )}
            {item.actions && (
              <div className="mt-3 flex gap-2">
                {item.actions}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================
// PROCESS TIMELINE
// ============================================

/**
 * Process/workflow timeline
 */
export function ProcessTimeline({
  steps = [],
  currentStep = 0,
  orientation = 'horizontal',
  className = ''
}) {
  if (orientation === 'vertical') {
    return (
      <div className={className}>
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isLast = index === steps.length - 1

          return (
            <div key={step.id || index} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    h-10 w-10 rounded-full flex items-center justify-center
                    ${isCompleted ? 'bg-green-500 text-white' : ''}
                    ${isCurrent ? 'bg-blue-500 text-white' : ''}
                    ${!isCompleted && !isCurrent ? 'bg-gray-200 text-gray-500' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {!isLast && (
                  <div className={`w-0.5 h-12 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
              <div className="pb-12">
                <h4 className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-900'}`}>
                  {step.title}
                </h4>
                {step.description && (
                  <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className={`flex items-start ${className}`}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep
        const isLast = index === steps.length - 1

        return (
          <div key={step.id || index} className="flex-1 flex items-start">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`
                  h-10 w-10 rounded-full flex items-center justify-center
                  ${isCompleted ? 'bg-green-500 text-white' : ''}
                  ${isCurrent ? 'bg-blue-500 text-white' : ''}
                  ${!isCompleted && !isCurrent ? 'bg-gray-200 text-gray-500' : ''}
                `}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <div className="text-center mt-2">
                <h4 className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-900'}`}>
                  {step.title}
                </h4>
                {step.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                )}
              </div>
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 mt-5 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ============================================
// CHANGELOG TIMELINE
// ============================================

/**
 * Changelog/version history timeline
 */
export function ChangelogTimeline({
  releases = [],
  className = ''
}) {
  return (
    <div className={`space-y-8 ${className}`}>
      {releases.map((release, index) => (
        <div key={release.version || index}>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full">
              {release.version}
            </span>
            <span className="text-sm text-gray-500">{release.date}</span>
            {release.tag && (
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                release.tag === 'latest' ? 'bg-green-100 text-green-700' :
                release.tag === 'breaking' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {release.tag}
              </span>
            )}
          </div>
          {release.title && (
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{release.title}</h3>
          )}
          {release.description && (
            <p className="text-gray-600 mb-4">{release.description}</p>
          )}
          {release.changes && (
            <ul className="space-y-2">
              {release.changes.map((change, changeIndex) => (
                <li key={changeIndex} className="flex items-start gap-2">
                  <span className={`px-1.5 py-0.5 text-xs font-medium rounded flex-shrink-0 ${
                    change.type === 'added' ? 'bg-green-100 text-green-700' :
                    change.type === 'changed' ? 'bg-blue-100 text-blue-700' :
                    change.type === 'fixed' ? 'bg-yellow-100 text-yellow-700' :
                    change.type === 'removed' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {change.type}
                  </span>
                  <span className="text-sm text-gray-600">{change.description}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

export default {
  Timeline,
  TimelineItem,
  SimpleTimeline,
  ActivityTimeline,
  HorizontalTimeline,
  CenteredTimeline,
  CompactTimeline,
  TimelineCard,
  ProcessTimeline,
  ChangelogTimeline
}
