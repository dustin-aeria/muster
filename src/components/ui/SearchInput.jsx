import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { Search, X, Loader2, Mic, MicOff, Clock, TrendingUp, ArrowRight, Filter } from 'lucide-react';

/**
 * Batch 111: SearchInput Component
 *
 * Enhanced search input components.
 *
 * Exports:
 * - SearchInput: Basic search input
 * - SearchInputWithButton: Search with submit button
 * - SearchInputWithDropdown: Search with suggestions dropdown
 * - SearchInputWithTags: Search with filter tags
 * - GlobalSearch: Full-featured global search
 * - QuickSearch: Compact quick search
 * - VoiceSearch: Search with voice input
 * - SearchWithFilters: Search with filter panel
 */

// ============================================================================
// SEARCH INPUT - Basic search input
// ============================================================================
export const SearchInput = forwardRef(function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  size = 'md',
  variant = 'default',
  loading = false,
  disabled = false,
  autoFocus = false,
  className,
  ...props
}, ref) {
  const inputRef = useRef(null);
  const combinedRef = ref || inputRef;

  const sizeClasses = {
    sm: 'h-8 text-sm pl-8 pr-8',
    md: 'h-10 text-sm pl-10 pr-10',
    lg: 'h-12 text-base pl-12 pr-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const iconPositions = {
    sm: 'left-2',
    md: 'left-3',
    lg: 'left-3',
  };

  const clearPositions = {
    sm: 'right-2',
    md: 'right-3',
    lg: 'right-3',
  };

  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    filled: 'bg-gray-100 dark:bg-gray-800 border-0 focus:ring-2 focus:ring-blue-500',
    ghost: 'bg-transparent border-0 focus:bg-gray-100 dark:focus:bg-gray-800',
    underlined: 'bg-transparent border-0 border-b-2 border-gray-200 dark:border-gray-700 rounded-none focus:border-blue-500',
  };

  const handleClear = () => {
    onChange?.({ target: { value: '' } });
    onClear?.();
    combinedRef.current?.focus();
  };

  return (
    <div className={cn('relative', className)}>
      <div className={cn('absolute top-1/2 -translate-y-1/2 text-gray-400', iconPositions[size])}>
        {loading ? (
          <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
        ) : (
          <Search className={iconSizes[size]} />
        )}
      </div>

      <input
        ref={combinedRef}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={cn(
          'w-full rounded-lg outline-none transition-colors',
          sizeClasses[size],
          variantClasses[variant],
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        {...props}
      />

      {value && !loading && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
            clearPositions[size]
          )}
        >
          <X className={iconSizes[size]} />
        </button>
      )}
    </div>
  );
});

// ============================================================================
// SEARCH INPUT WITH BUTTON - Search with submit button
// ============================================================================
export function SearchInputWithButton({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search...',
  buttonText = 'Search',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  ...props
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(value);
  };

  const sizeClasses = {
    sm: { input: 'h-8 text-sm pl-8 pr-3', button: 'h-8 px-3 text-sm' },
    md: { input: 'h-10 text-sm pl-10 pr-3', button: 'h-10 px-4 text-sm' },
    lg: { input: 'h-12 text-base pl-12 pr-3', button: 'h-12 px-6 text-base' },
  };

  return (
    <form onSubmit={handleSubmit} className={cn('flex gap-2', className)} {...props}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none',
            sizeClasses[size].input,
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
      </div>
      <button
        type="submit"
        disabled={disabled || loading}
        className={cn(
          'rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
          sizeClasses[size].button
        )}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : buttonText}
      </button>
    </form>
  );
}

// ============================================================================
// SEARCH INPUT WITH DROPDOWN - Search with suggestions dropdown
// ============================================================================
export function SearchInputWithDropdown({
  value,
  onChange,
  onSelect,
  onSubmit,
  suggestions = [],
  recentSearches = [],
  trendingSearches = [],
  placeholder = 'Search...',
  loading = false,
  disabled = false,
  showDropdownOnFocus = true,
  className,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const allItems = [
    ...suggestions.map((s) => ({ type: 'suggestion', ...s })),
    ...recentSearches.map((s) => ({ type: 'recent', ...s })),
    ...trendingSearches.map((s) => ({ type: 'trending', ...s })),
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < allItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : allItems.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && allItems[highlightedIndex]) {
          onSelect?.(allItems[highlightedIndex]);
          setIsOpen(false);
        } else {
          onSubmit?.(value);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (item) => {
    onSelect?.(item);
    setIsOpen(false);
  };

  const showDropdown = isOpen && (allItems.length > 0 || loading);

  return (
    <div ref={containerRef} className={cn('relative', className)} {...props}>
      <SearchInput
        ref={inputRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        loading={loading}
        disabled={disabled}
        onFocus={() => showDropdownOnFocus && setIsOpen(true)}
        onKeyDown={handleKeyDown}
      />

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            </div>
          ) : (
            <>
              {suggestions.length > 0 && (
                <div className="p-2">
                  {suggestions.map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded-md',
                        highlightedIndex === index
                          ? 'bg-gray-100 dark:bg-gray-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      )}
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="flex-1 text-gray-900 dark:text-white">
                        {item.label || item.value}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              )}

              {recentSearches.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                  <p className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">
                    Recent
                  </p>
                  {recentSearches.map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="flex-1 text-gray-900 dark:text-white">
                        {item.label || item.value}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {trendingSearches.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                  <p className="px-3 py-1 text-xs font-medium text-gray-500 uppercase">
                    Trending
                  </p>
                  {trendingSearches.map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      <span className="flex-1 text-gray-900 dark:text-white">
                        {item.label || item.value}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SEARCH INPUT WITH TAGS - Search with filter tags
// ============================================================================
export function SearchInputWithTags({
  value,
  onChange,
  tags = [],
  onTagRemove,
  onTagsClear,
  placeholder = 'Search...',
  size = 'md',
  className,
  ...props
}) {
  const inputRef = useRef(null);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500',
        className
      )}
      onClick={handleContainerClick}
      {...props}
    >
      <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />

      {tags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm rounded-md"
        >
          {tag.label || tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTagRemove?.(tag, index);
            }}
            className="hover:text-blue-900 dark:hover:text-blue-300"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={tags.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[100px] bg-transparent border-0 outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
      />

      {tags.length > 0 && (
        <button
          type="button"
          onClick={onTagsClear}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

// ============================================================================
// GLOBAL SEARCH - Full-featured global search
// ============================================================================
export function GlobalSearch({
  value,
  onChange,
  onSelect,
  results = [],
  categories = [],
  loading = false,
  placeholder = 'Search anything...',
  shortcut = '⌘K',
  className,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const filteredResults = selectedCategory
    ? results.filter((r) => r.category === selectedCategory)
    : results;

  return (
    <div className={cn('relative', className)} {...props}>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <Search className="w-5 h-5" />
        <span className="flex-1 text-left text-sm">{placeholder}</span>
        <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
          {shortcut}
        </kbd>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <SearchInput
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                loading={loading}
                autoFocus
                size="lg"
                variant="ghost"
              />
            </div>

            {categories.length > 0 && (
              <div className="flex gap-2 p-2 border-b border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    'px-3 py-1 text-sm rounded-md transition-colors',
                    !selectedCategory
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={cn(
                      'px-3 py-1 text-sm rounded-md transition-colors',
                      selectedCategory === cat.value
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            )}

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p>Searching...</p>
                </div>
              ) : filteredResults.length > 0 ? (
                <div className="p-2">
                  {filteredResults.map((result, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        onSelect?.(result);
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {result.icon && (
                        <result.icon className="w-5 h-5 text-gray-400" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {result.title}
                        </p>
                        {result.description && (
                          <p className="text-xs text-gray-500 truncate">
                            {result.description}
                          </p>
                        )}
                      </div>
                      {result.category && (
                        <span className="text-xs text-gray-400">
                          {result.category}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : value ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No results found for "{value}"</p>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>Start typing to search</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
              <div className="flex items-center gap-3">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>Esc Close</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// QUICK SEARCH - Compact quick search
// ============================================================================
export function QuickSearch({
  value,
  onChange,
  onSubmit,
  placeholder = 'Quick search...',
  className,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(value);
      }}
      className={cn('relative', className)}
      {...props}
    >
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          'w-full py-1 text-sm bg-transparent border-0 border-b border-gray-200 dark:border-gray-700 outline-none transition-all',
          isFocused
            ? 'border-blue-500 pr-8'
            : 'pr-2'
        )}
      />
      {isFocused && value && (
        <button
          type="submit"
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}

// ============================================================================
// VOICE SEARCH - Search with voice input
// ============================================================================
export function VoiceSearch({
  value,
  onChange,
  onVoiceStart,
  onVoiceEnd,
  onVoiceResult,
  placeholder = 'Search or speak...',
  isListening = false,
  voiceSupported = true,
  className,
  ...props
}) {
  return (
    <div className={cn('relative', className)} {...props}>
      <SearchInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pr-12"
      />

      {voiceSupported && (
        <button
          type="button"
          onClick={isListening ? onVoiceEnd : onVoiceStart}
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors',
            isListening
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          )}
        >
          {isListening ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>
      )}

      {isListening && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-75" />
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-150" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Listening...</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// SEARCH WITH FILTERS - Search with filter panel
// ============================================================================
export function SearchWithFilters({
  value,
  onChange,
  onSubmit,
  filters = [],
  activeFilters = {},
  onFilterChange,
  onClearFilters,
  placeholder = 'Search...',
  className,
  ...props
}) {
  const [showFilters, setShowFilters] = useState(false);
  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className={cn('space-y-3', className)} {...props}>
      <div className="flex gap-2">
        <SearchInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="flex-1"
        />
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'px-3 py-2 rounded-lg border transition-colors',
            showFilters || hasActiveFilters
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
          )}
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {showFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {filter.label}
                </label>
                <select
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => onFilterChange?.(filter.key, e.target.value || null)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClearFilters}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchInput;
