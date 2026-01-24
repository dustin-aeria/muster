import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';

/**
 * Batch 110: Portal Component
 *
 * Portal and overlay components for rendering outside DOM hierarchy.
 *
 * Exports:
 * - Portal: Basic portal
 * - PortalWithState: Portal with open/close state
 * - Overlay: Full screen overlay
 * - OverlayContent: Content within overlay
 * - FocusTrap: Focus trap container
 * - BodyScrollLock: Prevent body scroll
 * - ClickOutside: Detect clicks outside
 * - Teleport: Named teleport destinations
 */

// ============================================================================
// PORTAL - Basic portal
// ============================================================================
export function Portal({
  children,
  container,
  disabled = false,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (disabled || !mounted) {
    return <>{children}</>;
  }

  const target = container || document.body;
  return createPortal(children, target);
}

// ============================================================================
// PORTAL WITH STATE - Portal with open/close state
// ============================================================================
export function PortalWithState({
  children,
  isOpen,
  onClose,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  container,
}) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  useEffect(() => {
    if (!isOpen || !closeOnOutsideClick) return;

    const handleClickOutside = (e) => {
      if (contentRef.current && !contentRef.current.contains(e.target)) {
        onClose?.();
      }
    };

    // Delay to prevent immediate close on open click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeOnOutsideClick, onClose]);

  if (!isOpen) return null;

  return (
    <Portal container={container}>
      {typeof children === 'function'
        ? children({ ref: contentRef, onClose })
        : React.cloneElement(children, { ref: contentRef })}
    </Portal>
  );
}

// ============================================================================
// OVERLAY - Full screen overlay
// ============================================================================
export function Overlay({
  children,
  isOpen,
  onClose,
  blur = false,
  color = 'dark',
  zIndex = 50,
  animated = true,
  className,
  ...props
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
      if (animated) {
        const timer = setTimeout(() => setIsVisible(false), 200);
        return () => clearTimeout(timer);
      } else {
        setIsVisible(false);
      }
    }
  }, [isOpen, animated]);

  const colorClasses = {
    dark: 'bg-black/50',
    light: 'bg-white/50',
    transparent: 'bg-transparent',
    custom: '',
  };

  if (!isVisible) return null;

  return (
    <Portal>
      <div
        className={cn(
          'fixed inset-0 transition-opacity duration-200',
          colorClasses[color],
          blur && 'backdrop-blur-sm',
          animated && (isAnimating ? 'opacity-100' : 'opacity-0'),
          className
        )}
        style={{ zIndex }}
        onClick={onClose}
        aria-hidden="true"
        {...props}
      >
        {children}
      </div>
    </Portal>
  );
}

// ============================================================================
// OVERLAY CONTENT - Content within overlay
// ============================================================================
export function OverlayContent({
  children,
  position = 'center',
  animated = true,
  isAnimating = true,
  onClick,
  className,
  ...props
}) {
  const positionClasses = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-20',
    bottom: 'items-end justify-center pb-20',
    left: 'items-center justify-start pl-20',
    right: 'items-center justify-end pr-20',
  };

  const animationClasses = {
    center: isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
    top: isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0',
    bottom: isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
    left: isAnimating ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0',
    right: isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0',
  };

  return (
    <div
      className={cn(
        'fixed inset-0 flex',
        positionClasses[position],
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      {...props}
    >
      <div
        className={cn(
          'transition-all duration-200',
          animated && animationClasses[position]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// FOCUS TRAP - Focus trap container
// ============================================================================
export function FocusTrap({
  children,
  active = true,
  returnFocus = true,
  initialFocus,
  className,
  ...props
}) {
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    // Store previous focus
    previousFocusRef.current = document.activeElement;

    // Get focusable elements
    const getFocusableElements = () => {
      if (!containerRef.current) return [];
      return containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    };

    // Set initial focus
    const focusableElements = getFocusableElements();
    if (initialFocus?.current) {
      initialFocus.current.focus();
    } else if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Handle tab key
    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const focusables = getFocusableElements();
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Return focus
      if (returnFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [active, initialFocus, returnFocus]);

  return (
    <div ref={containerRef} className={className} {...props}>
      {children}
    </div>
  );
}

// ============================================================================
// BODY SCROLL LOCK - Prevent body scroll
// ============================================================================
export function BodyScrollLock({ active = true }) {
  useEffect(() => {
    if (!active) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = originalStyle;
      document.body.style.paddingRight = '';
    };
  }, [active]);

  return null;
}

// ============================================================================
// CLICK OUTSIDE - Detect clicks outside
// ============================================================================
export function ClickOutside({
  children,
  onClickOutside,
  disabled = false,
  mouseEvent = 'mousedown',
  touchEvent = 'touchstart',
}) {
  const ref = useRef(null);

  useEffect(() => {
    if (disabled) return;

    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClickOutside?.(e);
      }
    };

    document.addEventListener(mouseEvent, handleClick);
    document.addEventListener(touchEvent, handleClick);

    return () => {
      document.removeEventListener(mouseEvent, handleClick);
      document.removeEventListener(touchEvent, handleClick);
    };
  }, [disabled, mouseEvent, touchEvent, onClickOutside]);

  return React.cloneElement(children, { ref });
}

// ============================================================================
// TELEPORT CONTEXT
// ============================================================================
const TeleportContext = createContext({});

// ============================================================================
// TELEPORT PROVIDER - Provider for teleport destinations
// ============================================================================
export function TeleportProvider({ children }) {
  const [destinations, setDestinations] = useState({});

  const registerDestination = (name, element) => {
    setDestinations((prev) => ({ ...prev, [name]: element }));
  };

  const unregisterDestination = (name) => {
    setDestinations((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  return (
    <TeleportContext.Provider
      value={{ destinations, registerDestination, unregisterDestination }}
    >
      {children}
    </TeleportContext.Provider>
  );
}

// ============================================================================
// TELEPORT DESTINATION - Named teleport target
// ============================================================================
export function TeleportDestination({
  name,
  className,
  ...props
}) {
  const ref = useRef(null);
  const { registerDestination, unregisterDestination } = useContext(TeleportContext);

  useEffect(() => {
    if (ref.current) {
      registerDestination(name, ref.current);
    }

    return () => {
      unregisterDestination(name);
    };
  }, [name, registerDestination, unregisterDestination]);

  return <div ref={ref} className={className} {...props} />;
}

// ============================================================================
// TELEPORT - Teleport content to named destination
// ============================================================================
export function Teleport({
  children,
  to,
  disabled = false,
}) {
  const { destinations } = useContext(TeleportContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (disabled || !mounted || !destinations[to]) {
    return <>{children}</>;
  }

  return createPortal(children, destinations[to]);
}

// ============================================================================
// LAZY PORTAL - Portal with lazy mounting
// ============================================================================
export function LazyPortal({
  children,
  isOpen,
  keepMounted = false,
  container,
}) {
  const [hasBeenOpened, setHasBeenOpened] = useState(false);

  useEffect(() => {
    if (isOpen && !hasBeenOpened) {
      setHasBeenOpened(true);
    }
  }, [isOpen, hasBeenOpened]);

  if (!isOpen && !keepMounted) return null;
  if (!isOpen && keepMounted && !hasBeenOpened) return null;

  return (
    <Portal container={container}>
      <div style={{ display: isOpen ? 'block' : 'none' }}>
        {children}
      </div>
    </Portal>
  );
}

// ============================================================================
// STACK CONTEXT - For managing stacked portals
// ============================================================================
const StackContext = createContext({ stack: [], push: () => {}, pop: () => {} });

export function StackProvider({ children }) {
  const [stack, setStack] = useState([]);

  const push = (id) => {
    setStack((prev) => [...prev, id]);
  };

  const pop = (id) => {
    setStack((prev) => prev.filter((item) => item !== id));
  };

  return (
    <StackContext.Provider value={{ stack, push, pop }}>
      {children}
    </StackContext.Provider>
  );
}

export function useStack() {
  return useContext(StackContext);
}

// ============================================================================
// STACKED PORTAL - Portal that manages z-index in a stack
// ============================================================================
export function StackedPortal({
  children,
  id,
  baseZIndex = 50,
  container,
}) {
  const { stack, push, pop } = useStack();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    push(id);

    return () => {
      pop(id);
    };
  }, [id, push, pop]);

  if (!mounted) return null;

  const index = stack.indexOf(id);
  const zIndex = baseZIndex + (index >= 0 ? index * 10 : 0);

  return (
    <Portal container={container}>
      <div style={{ position: 'relative', zIndex }}>
        {children}
      </div>
    </Portal>
  );
}

// ============================================================================
// USE PORTAL - Hook for creating portals
// ============================================================================
export function usePortal(id) {
  const [container, setContainer] = useState(null);

  useEffect(() => {
    let element = document.getElementById(id);

    if (!element) {
      element = document.createElement('div');
      element.id = id;
      document.body.appendChild(element);
    }

    setContainer(element);

    return () => {
      if (element && element.childNodes.length === 0) {
        element.remove();
      }
    };
  }, [id]);

  return container;
}

// ============================================================================
// PORTAL ROOT - Root container for portals
// ============================================================================
export function PortalRoot({
  id = 'portal-root',
  className,
  ...props
}) {
  return <div id={id} className={className} {...props} />;
}

export default Portal;
