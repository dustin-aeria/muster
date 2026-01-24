import React from 'react';
import { cn } from '../../lib/utils';
import {
  Inbox,
  Search,
  FileX,
  FolderOpen,
  Users,
  Bell,
  ShoppingCart,
  Calendar,
  MessageSquare,
  Heart,
  Star,
  CloudOff,
  WifiOff,
  AlertCircle,
  Lock,
  Rocket,
  FileQuestion,
  ImageOff,
  Database
} from 'lucide-react';

/**
 * Batch 96: Empty State Component
 *
 * Empty state components for when there's no content to display.
 *
 * Exports:
 * - EmptyState: Basic empty state
 * - EmptyInbox: No messages/inbox empty
 * - EmptySearch: No search results
 * - EmptyFiles: No files
 * - EmptyFolder: Empty folder
 * - EmptyUsers: No users/members
 * - EmptyNotifications: No notifications
 * - EmptyCart: Empty shopping cart
 * - EmptyCalendar: No events
 * - EmptyComments: No comments
 * - EmptyFavorites: No favorites
 * - EmptyOffline: Offline state
 * - EmptyError: Error state
 * - EmptyLocked: Access denied
 * - EmptyNoData: No data available
 * - EmptyGetStarted: Getting started prompt
 */

// ============================================================================
// EMPTY STATE - Basic empty state
// ============================================================================
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  image,
  size = 'md',
  variant = 'default',
  className,
  ...props
}) {
  const sizeClasses = {
    sm: {
      container: 'py-6',
      icon: 'w-10 h-10',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'w-16 h-16',
      title: 'text-lg',
      description: 'text-base',
    },
    lg: {
      container: 'py-16',
      icon: 'w-20 h-20',
      title: 'text-xl',
      description: 'text-base',
    },
  };

  const variantClasses = {
    default: {
      container: '',
      icon: 'text-gray-300 dark:text-gray-600',
      iconBg: 'bg-gray-100 dark:bg-gray-800',
    },
    primary: {
      container: '',
      icon: 'text-blue-400 dark:text-blue-500',
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    muted: {
      container: 'opacity-75',
      icon: 'text-gray-200 dark:text-gray-700',
      iconBg: 'bg-gray-50 dark:bg-gray-900',
    },
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-4',
        sizeClasses[size].container,
        variantClasses[variant].container,
        className
      )}
      {...props}
    >
      {image ? (
        <img
          src={image}
          alt=""
          className={cn('mb-6', size === 'sm' ? 'w-24' : size === 'md' ? 'w-32' : 'w-40')}
        />
      ) : Icon && (
        <div
          className={cn(
            'rounded-full p-4 mb-4',
            variantClasses[variant].iconBg
          )}
        >
          <Icon
            className={cn(
              sizeClasses[size].icon,
              variantClasses[variant].icon
            )}
          />
        </div>
      )}

      {title && (
        <h3
          className={cn(
            'font-semibold text-gray-900 dark:text-white mb-2',
            sizeClasses[size].title
          )}
        >
          {title}
        </h3>
      )}

      {description && (
        <p
          className={cn(
            'text-gray-500 dark:text-gray-400 max-w-sm mb-6',
            sizeClasses[size].description
          )}
        >
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-wrap gap-3 justify-center">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// EMPTY INBOX - No messages/inbox empty
// ============================================================================
export function EmptyInbox({
  title = 'Your inbox is empty',
  description = 'Messages you receive will appear here.',
  ...props
}) {
  return (
    <EmptyState
      icon={Inbox}
      title={title}
      description={description}
      {...props}
    />
  );
}

// ============================================================================
// EMPTY SEARCH - No search results
// ============================================================================
export function EmptySearch({
  query,
  title = 'No results found',
  description,
  suggestions = [],
  onSuggestionClick,
  ...props
}) {
  const defaultDescription = query
    ? `We couldn't find anything matching "${query}".`
    : 'Try adjusting your search or filters.';

  return (
    <EmptyState
      icon={Search}
      title={title}
      description={description || defaultDescription}
      {...props}
    >
      {suggestions.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            Try searching for:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </EmptyState>
  );
}

// ============================================================================
// EMPTY FILES - No files
// ============================================================================
export function EmptyFiles({
  title = 'No files yet',
  description = 'Upload files to get started.',
  onUpload,
  ...props
}) {
  return (
    <EmptyState
      icon={FileX}
      title={title}
      description={description}
      action={
        onUpload && (
          <button
            onClick={onUpload}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            Upload Files
          </button>
        )
      }
      {...props}
    />
  );
}

// ============================================================================
// EMPTY FOLDER - Empty folder
// ============================================================================
export function EmptyFolder({
  title = 'This folder is empty',
  description = 'Add files or create subfolders to organize your content.',
  onCreateFolder,
  onUpload,
  ...props
}) {
  return (
    <EmptyState
      icon={FolderOpen}
      title={title}
      description={description}
      action={
        onCreateFolder && (
          <button
            onClick={onCreateFolder}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            New Folder
          </button>
        )
      }
      secondaryAction={
        onUpload && (
          <button
            onClick={onUpload}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm font-medium"
          >
            Upload
          </button>
        )
      }
      {...props}
    />
  );
}

// ============================================================================
// EMPTY USERS - No users/members
// ============================================================================
export function EmptyUsers({
  title = 'No team members',
  description = 'Invite team members to collaborate.',
  onInvite,
  ...props
}) {
  return (
    <EmptyState
      icon={Users}
      title={title}
      description={description}
      action={
        onInvite && (
          <button
            onClick={onInvite}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            Invite Members
          </button>
        )
      }
      {...props}
    />
  );
}

// ============================================================================
// EMPTY NOTIFICATIONS - No notifications
// ============================================================================
export function EmptyNotifications({
  title = 'All caught up!',
  description = "You don't have any notifications right now.",
  ...props
}) {
  return (
    <EmptyState
      icon={Bell}
      title={title}
      description={description}
      variant="primary"
      {...props}
    />
  );
}

// ============================================================================
// EMPTY CART - Empty shopping cart
// ============================================================================
export function EmptyCart({
  title = 'Your cart is empty',
  description = 'Browse our products and add items to your cart.',
  onBrowse,
  ...props
}) {
  return (
    <EmptyState
      icon={ShoppingCart}
      title={title}
      description={description}
      action={
        onBrowse && (
          <button
            onClick={onBrowse}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            Start Shopping
          </button>
        )
      }
      {...props}
    />
  );
}

// ============================================================================
// EMPTY CALENDAR - No events
// ============================================================================
export function EmptyCalendar({
  title = 'No events scheduled',
  description = "You don't have any events on this day.",
  onCreateEvent,
  ...props
}) {
  return (
    <EmptyState
      icon={Calendar}
      title={title}
      description={description}
      action={
        onCreateEvent && (
          <button
            onClick={onCreateEvent}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            Create Event
          </button>
        )
      }
      {...props}
    />
  );
}

// ============================================================================
// EMPTY COMMENTS - No comments
// ============================================================================
export function EmptyComments({
  title = 'No comments yet',
  description = 'Be the first to leave a comment.',
  onComment,
  ...props
}) {
  return (
    <EmptyState
      icon={MessageSquare}
      title={title}
      description={description}
      action={
        onComment && (
          <button
            onClick={onComment}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            Add Comment
          </button>
        )
      }
      {...props}
    />
  );
}

// ============================================================================
// EMPTY FAVORITES - No favorites
// ============================================================================
export function EmptyFavorites({
  title = 'No favorites yet',
  description = 'Items you favorite will appear here.',
  onBrowse,
  ...props
}) {
  return (
    <EmptyState
      icon={Heart}
      title={title}
      description={description}
      action={
        onBrowse && (
          <button
            onClick={onBrowse}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            Browse Items
          </button>
        )
      }
      {...props}
    />
  );
}

// ============================================================================
// EMPTY OFFLINE - Offline state
// ============================================================================
export function EmptyOffline({
  title = "You're offline",
  description = 'Please check your internet connection and try again.',
  onRetry,
  ...props
}) {
  return (
    <EmptyState
      icon={WifiOff}
      title={title}
      description={description}
      action={
        onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            Try Again
          </button>
        )
      }
      {...props}
    />
  );
}

// ============================================================================
// EMPTY ERROR - Error state
// ============================================================================
export function EmptyError({
  title = 'Something went wrong',
  description = 'We encountered an error. Please try again later.',
  error,
  onRetry,
  ...props
}) {
  return (
    <EmptyState
      icon={AlertCircle}
      title={title}
      description={description}
      action={
        onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            Try Again
          </button>
        )
      }
      {...props}
    >
      {error && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-left max-w-md">
          <code className="text-xs text-red-600 dark:text-red-400 break-all">
            {typeof error === 'string' ? error : error.message}
          </code>
        </div>
      )}
    </EmptyState>
  );
}

// ============================================================================
// EMPTY LOCKED - Access denied
// ============================================================================
export function EmptyLocked({
  title = 'Access Restricted',
  description = "You don't have permission to view this content.",
  onRequestAccess,
  ...props
}) {
  return (
    <EmptyState
      icon={Lock}
      title={title}
      description={description}
      action={
        onRequestAccess && (
          <button
            onClick={onRequestAccess}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            Request Access
          </button>
        )
      }
      {...props}
    />
  );
}

// ============================================================================
// EMPTY NO DATA - No data available
// ============================================================================
export function EmptyNoData({
  title = 'No data available',
  description = 'There is no data to display at this time.',
  ...props
}) {
  return (
    <EmptyState
      icon={Database}
      title={title}
      description={description}
      variant="muted"
      {...props}
    />
  );
}

// ============================================================================
// EMPTY GET STARTED - Getting started prompt
// ============================================================================
export function EmptyGetStarted({
  title = 'Get Started',
  description = 'Create your first item to get started.',
  steps = [],
  onCreate,
  ...props
}) {
  return (
    <EmptyState
      icon={Rocket}
      title={title}
      description={description}
      variant="primary"
      action={
        onCreate && (
          <button
            onClick={onCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            Create First Item
          </button>
        )
      }
      {...props}
    >
      {steps.length > 0 && (
        <div className="mt-6 text-left max-w-sm">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            How to get started:
          </p>
          <ol className="space-y-2">
            {steps.map((step, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </EmptyState>
  );
}

// ============================================================================
// EMPTY IMAGE - No image
// ============================================================================
export function EmptyImage({
  title = 'No image',
  description = 'Upload an image to display here.',
  onUpload,
  ...props
}) {
  return (
    <EmptyState
      icon={ImageOff}
      title={title}
      description={description}
      size="sm"
      action={
        onUpload && (
          <button
            onClick={onUpload}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium"
          >
            Upload Image
          </button>
        )
      }
      {...props}
    />
  );
}

// ============================================================================
// EMPTY REVIEWS - No reviews
// ============================================================================
export function EmptyReviews({
  title = 'No reviews yet',
  description = 'Be the first to write a review.',
  onReview,
  ...props
}) {
  return (
    <EmptyState
      icon={Star}
      title={title}
      description={description}
      action={
        onReview && (
          <button
            onClick={onReview}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            Write a Review
          </button>
        )
      }
      {...props}
    />
  );
}

// ============================================================================
// EMPTY PAGE NOT FOUND - 404 style
// ============================================================================
export function EmptyPageNotFound({
  title = 'Page not found',
  description = "The page you're looking for doesn't exist or has been moved.",
  onGoHome,
  onGoBack,
  ...props
}) {
  return (
    <EmptyState
      icon={FileQuestion}
      title={title}
      description={description}
      size="lg"
      action={
        onGoHome && (
          <button
            onClick={onGoHome}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
          >
            Go to Homepage
          </button>
        )
      }
      secondaryAction={
        onGoBack && (
          <button
            onClick={onGoBack}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm font-medium"
          >
            Go Back
          </button>
        )
      }
      {...props}
    />
  );
}

export default EmptyState;
