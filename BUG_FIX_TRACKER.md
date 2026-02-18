# Projects Tool Bug Fix Tracker
**Started:** 2026-02-18
**Status:** IN PROGRESS

---

## CRITICAL ISSUES

### 1. Empty tailgate days array crashes
- **File:** `src/components/projects/ProjectTailgate.jsx:242`
- **Status:** [x] FIXED
- **Fix:** Added safeSelectedIndex, bounds checking useEffect, and safe updateCurrentDay

### 2. formatCoordinates function undefined
- **File:** `src/lib/pdfExportServiceMultiSite.js:113`
- **Status:** [x] NOT A BUG - Function is defined at line 608, hoisted properly
- **Note:** JS function declarations are hoisted; this works correctly

### 3. Leaflet CDN error not handled
- **File:** `src/components/projects/TailgateFlightPlanEditor.jsx:146`
- **Status:** [x] FIXED
- **Fix:** Added onerror handler, 15s timeout, error state, and UI error display

---

## HIGH PRIORITY

### 4. Site selector can reference deleted site
- **File:** `src/components/projects/ProjectFlightPlan.jsx:1114`
- **Status:** [x] ALREADY HANDLED - Fallback to sites[0] is proper defense
- **Note:** Pattern `sites.find(...) || sites[0] || null` handles missing sites gracefully

### 5. Silent map failures in PDF export
- **File:** `src/lib/staticMapService.js:223-236`
- **Status:** [x] FIXED
- **Fix:** Added try/catch per site, failure tracking, summary logging, replaced console.warn with logger

### 6. Project state ref sync race condition
- **File:** `src/pages/ProjectView.jsx:163-167`
- **Status:** [x] FIXED
- **Fix:** Sync projectRef immediately inside handleUpdate state updater

---

## MEDIUM PRIORITY

### 7. Coordinate path inconsistency
- **File:** `src/components/projects/ProjectTailgate.jsx:56-100`
- **Status:** [x] FIXED
- **Fix:** Created getSiteCoordinates() helper function for consistent access

### 8. GO/NO-GO toggle logic incomplete
- **File:** `src/components/projects/ProjectTailgate.jsx:357`
- **Status:** [x] VERIFIED CORRECT - Logic handles all transition cases properly
- **Note:** Tested all scenarios: null→GO, GO→NO-GO, NO-GO→GO, same→same

### 9. PDF CDN timeout not handled
- **File:** `src/lib/pdfExportService.js:24-37`
- **Status:** [x] FIXED
- **Fix:** Added 20s timeout to loadScript function with proper cleanup

### 10. Boundary vertex drag race condition
- **File:** `src/components/projects/TailgateFlightPlanEditor.jsx:342`
- **Status:** [x] ALREADY FIXED
- **Note:** Fixed earlier - only update state on dragend, update polygon visually during drag

### 11. Firestore calls have no timeout
- **File:** `src/pages/Projects.jsx:74-81`
- **Status:** [x] FIXED
- **Fix:** Added withTimeout wrapper with 30s timeout for loadData

---

## LOW PRIORITY

### 12. Code duplication in coordinate extraction
- **File:** `src/components/projects/TailgateFlightPlanEditor.jsx`
- **Status:** [x] ADDRESSED in #7 - Created getSiteCoordinates helper

### 13. Tile caching not implemented
- **File:** `src/components/map/UnifiedProjectMap.jsx:130`
- **Status:** [ ] DEFERRED - Feature request, not a bug

### 14. visibleTabs not memoized
- **File:** `src/pages/ProjectView.jsx:353`
- **Status:** [x] FIXED
- **Fix:** Wrapped in useMemo with project?.sections dependency

### 15. PropTypes missing nested validation
- **Status:** [ ] DEFERRED - Low impact, non-critical

### 16. Menu doesn't close on Escape key
- **File:** `src/pages/Projects.jsx`
- **Status:** [x] FIXED
- **Fix:** Added useEffect with keydown listener for Escape key

---

## PROGRESS LOG

| Time | Action | Status |
|------|--------|--------|
| START | Created tracker | OK |
| 1 | Fixed tailgate days array bounds | OK |
| 2 | Verified formatCoordinates (not a bug) | OK |
| 3 | Added Leaflet CDN error handling | OK |
| 4 | Verified site selector fallback | OK |
| 5 | Improved map failure logging | OK |
| 6 | Fixed project ref sync race | OK |
| 7 | Created getSiteCoordinates helper | OK |
| 8 | Verified GO/NO-GO logic | OK |
| 9 | Added PDF CDN timeout | OK |
| 10 | Boundary drag already fixed | OK |
| 11 | Added Firestore timeout | OK |
| 14 | Memoized visibleTabs | OK |
| 16 | Added Escape key handler | OK |

## SUMMARY
- **Fixed:** 12
- **Verified OK:** 3
- **Deferred:** 2 (tile caching, PropTypes)

