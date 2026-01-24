/**
 * Avatar Component
 * User avatars and profile images
 *
 * @location src/components/ui/Avatar.jsx
 */

import React, { useState } from 'react'
import { User } from 'lucide-react'

// ============================================
// AVATAR SIZES
// ============================================

const AVATAR_SIZES = {
  xs: { container: 'h-6 w-6', text: 'text-xs', icon: 'h-3 w-3' },
  sm: { container: 'h-8 w-8', text: 'text-sm', icon: 'h-4 w-4' },
  md: { container: 'h-10 w-10', text: 'text-base', icon: 'h-5 w-5' },
  lg: { container: 'h-12 w-12', text: 'text-lg', icon: 'h-6 w-6' },
  xl: { container: 'h-16 w-16', text: 'text-xl', icon: 'h-8 w-8' },
  '2xl': { container: 'h-20 w-20', text: 'text-2xl', icon: 'h-10 w-10' },
  '3xl': { container: 'h-24 w-24', text: 'text-3xl', icon: 'h-12 w-12' }
}

// ============================================
// AVATAR COLORS
// ============================================

const AVATAR_COLORS = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-yellow-500',
  'bg-lime-500',
  'bg-green-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-fuchsia-500',
  'bg-pink-500',
  'bg-rose-500'
]

/**
 * Get consistent color based on string
 */
function getColorFromString(str) {
  if (!str) return AVATAR_COLORS[0]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

/**
 * Get initials from name
 */
function getInitials(name, maxLength = 2) {
  if (!name) return ''
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].substring(0, maxLength).toUpperCase()
  }
  return parts
    .slice(0, maxLength)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

// ============================================
// BASE AVATAR COMPONENT
// ============================================

/**
 * Avatar component
 */
export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  fallback,
  fallbackIcon: FallbackIcon = User,
  color,
  className = '',
  onClick
}) {
  const [imageError, setImageError] = useState(false)
  const sizeConfig = AVATAR_SIZES[size] || AVATAR_SIZES.md
  const shapeClass = shape === 'square' ? 'rounded-lg' : 'rounded-full'
  const bgColor = color || getColorFromString(name || alt)
  const initials = getInitials(name || alt)

  const handleImageError = () => {
    setImageError(true)
  }

  const showImage = src && !imageError
  const showInitials = !showImage && initials
  const showIcon = !showImage && !showInitials

  return (
    <div
      className={`
        inline-flex items-center justify-center flex-shrink-0 overflow-hidden
        ${sizeConfig.container} ${shapeClass}
        ${showImage ? '' : bgColor}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {showImage && (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          onError={handleImageError}
          className="h-full w-full object-cover"
        />
      )}
      {showInitials && (
        <span className={`font-medium text-white ${sizeConfig.text}`}>
          {fallback || initials}
        </span>
      )}
      {showIcon && (
        <FallbackIcon className={`text-white ${sizeConfig.icon}`} />
      )}
    </div>
  )
}

// ============================================
// AVATAR WITH STATUS
// ============================================

/**
 * Avatar with online/offline status indicator
 */
export function AvatarWithStatus({
  src,
  alt,
  name,
  size = 'md',
  status = 'offline',
  statusPosition = 'bottom-right',
  ...props
}) {
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500'
  }

  const statusSizes = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-3.5 w-3.5',
    '2xl': 'h-4 w-4',
    '3xl': 'h-5 w-5'
  }

  const positionClasses = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'bottom-right': 'bottom-0 right-0'
  }

  return (
    <div className="relative inline-flex">
      <Avatar src={src} alt={alt} name={name} size={size} {...props} />
      <span
        className={`
          absolute ${positionClasses[statusPosition]}
          ${statusSizes[size]} ${statusColors[status]}
          rounded-full ring-2 ring-white
        `}
      />
    </div>
  )
}

// ============================================
// AVATAR GROUP
// ============================================

/**
 * Group of overlapping avatars
 */
export function AvatarGroup({
  avatars,
  max = 4,
  size = 'md',
  spacing = 'tight',
  showCount = true,
  onMoreClick,
  className = ''
}) {
  const sizeConfig = AVATAR_SIZES[size] || AVATAR_SIZES.md
  const visible = avatars.slice(0, max)
  const remaining = avatars.length - max

  const spacingClasses = {
    tight: '-space-x-2',
    normal: '-space-x-1',
    loose: 'space-x-0'
  }

  return (
    <div className={`flex items-center ${spacingClasses[spacing]} ${className}`}>
      {visible.map((avatar, index) => (
        <Avatar
          key={avatar.id || index}
          src={avatar.src}
          alt={avatar.alt}
          name={avatar.name}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {showCount && remaining > 0 && (
        <div
          className={`
            inline-flex items-center justify-center flex-shrink-0
            ${sizeConfig.container} rounded-full
            bg-gray-200 ring-2 ring-white
            ${onMoreClick ? 'cursor-pointer hover:bg-gray-300' : ''}
          `}
          onClick={onMoreClick}
        >
          <span className={`font-medium text-gray-600 ${sizeConfig.text}`}>
            +{remaining}
          </span>
        </div>
      )}
    </div>
  )
}

// ============================================
// AVATAR WITH BADGE
// ============================================

/**
 * Avatar with a badge/count
 */
export function AvatarWithBadge({
  src,
  alt,
  name,
  size = 'md',
  badge,
  badgeColor = 'bg-red-500',
  badgePosition = 'top-right',
  ...props
}) {
  const positionClasses = {
    'top-left': '-top-1 -left-1',
    'top-right': '-top-1 -right-1',
    'bottom-left': '-bottom-1 -left-1',
    'bottom-right': '-bottom-1 -right-1'
  }

  return (
    <div className="relative inline-flex">
      <Avatar src={src} alt={alt} name={name} size={size} {...props} />
      {badge !== undefined && (
        <span
          className={`
            absolute ${positionClasses[badgePosition]}
            inline-flex items-center justify-center
            min-w-[1.25rem] h-5 px-1
            text-xs font-medium text-white
            ${badgeColor} rounded-full
          `}
        >
          {badge}
        </span>
      )}
    </div>
  )
}

// ============================================
// AVATAR WITH NAME
// ============================================

/**
 * Avatar with name and optional subtitle
 */
export function AvatarWithName({
  src,
  alt,
  name,
  subtitle,
  size = 'md',
  layout = 'horizontal',
  className = '',
  ...props
}) {
  const isVertical = layout === 'vertical'

  const textSizes = {
    xs: { name: 'text-xs', subtitle: 'text-xs' },
    sm: { name: 'text-sm', subtitle: 'text-xs' },
    md: { name: 'text-sm', subtitle: 'text-xs' },
    lg: { name: 'text-base', subtitle: 'text-sm' },
    xl: { name: 'text-lg', subtitle: 'text-sm' },
    '2xl': { name: 'text-xl', subtitle: 'text-base' }
  }

  const textConfig = textSizes[size] || textSizes.md

  return (
    <div
      className={`
        flex items-center
        ${isVertical ? 'flex-col text-center gap-2' : 'gap-3'}
        ${className}
      `}
    >
      <Avatar src={src} alt={alt} name={name} size={size} {...props} />
      <div className={isVertical ? '' : 'min-w-0'}>
        <p className={`font-medium text-gray-900 truncate ${textConfig.name}`}>
          {name}
        </p>
        {subtitle && (
          <p className={`text-gray-500 truncate ${textConfig.subtitle}`}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

// ============================================
// AVATAR PICKER
// ============================================

/**
 * Avatar selection picker
 */
export function AvatarPicker({
  value,
  onChange,
  options,
  size = 'md',
  className = ''
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => {
        const isSelected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              relative rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              ${isSelected ? 'ring-2 ring-blue-500' : ''}
            `}
          >
            <Avatar
              src={option.src}
              alt={option.alt}
              name={option.name}
              size={size}
            />
            {isSelected && (
              <div className="absolute inset-0 rounded-full bg-blue-500/20 flex items-center justify-center">
                <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}

// ============================================
// EDITABLE AVATAR
// ============================================

import { Camera } from 'lucide-react'

/**
 * Avatar with edit overlay
 */
export function EditableAvatar({
  src,
  alt,
  name,
  size = 'xl',
  onEdit,
  className = '',
  ...props
}) {
  const sizeConfig = AVATAR_SIZES[size] || AVATAR_SIZES.xl

  return (
    <div className={`relative inline-flex group ${className}`}>
      <Avatar src={src} alt={alt} name={name} size={size} {...props} />
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <Camera className={`text-white ${sizeConfig.icon}`} />
        </button>
      )}
    </div>
  )
}

// ============================================
// AVATAR UPLOAD
// ============================================

/**
 * Avatar with file upload
 */
export function AvatarUpload({
  src,
  alt,
  name,
  size = 'xl',
  onUpload,
  accept = 'image/*',
  className = '',
  ...props
}) {
  const inputRef = React.useRef(null)
  const sizeConfig = AVATAR_SIZES[size] || AVATAR_SIZES.xl

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload?.(file)
    }
  }

  return (
    <div className={`relative inline-flex ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="sr-only"
      />
      <button
        type="button"
        onClick={handleClick}
        className="relative group rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Avatar src={src} alt={alt} name={name} size={size} {...props} />
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Camera className={`text-white ${sizeConfig.icon}`} />
        </div>
      </button>
    </div>
  )
}

export default {
  Avatar,
  AvatarWithStatus,
  AvatarGroup,
  AvatarWithBadge,
  AvatarWithName,
  AvatarPicker,
  EditableAvatar,
  AvatarUpload,
  getInitials,
  getColorFromString,
  AVATAR_SIZES,
  AVATAR_COLORS
}
