# Continue Audit Fixes - Prompt for New Claude Session

Copy and paste everything below this line into a new Claude Code session:

---

This is Aeria Ops - a drone operations management platform in `aeria-ops/`. It auto-deploys to Vercel from GitHub.

## CONTEXT: Previous Audit Work Completed

A comprehensive forensic audit was completed and documented in `docs/AUDIT_REPORT.md`. Four batches of fixes have already been deployed:

### Completed Batches:
1. **Batch 1** - Security fixes (removed window.adminUtils and window.firebaseAuth exposure)
2. **Batch 2** - Race condition fix in firestoreCompliance.js, console fixes in 3 pages
3. **Batch 3** - Console statements converted to logger in 7 pages (36 statements)
4. **Batch 4** - Console statements converted to logger in 9 components (23 statements)

**Total fixed so far: ~85 issues**

---

## YOUR TASK: Continue Fixing Remaining Issues

### Priority 1: Remaining Console Statements (~50 remaining)

Convert all remaining `console.log`, `console.error`, and `console.warn` to use the logger utility.

**Pattern to follow:**
```javascript
// Add import at top of file:
import { logger } from '../lib/logger'  // or '../../lib/logger' for nested components

// Replace console calls:
console.log('message')    → logger.debug('message')
console.error('msg', err) → logger.error('msg', err)
console.warn('msg')       → logger.warn('msg')
```

**Files still needing fixes (run this to find them):**
```bash
grep -rn "console\.\(log\|error\|warn\)" src/ --include="*.jsx" --include="*.js" | grep -v node_modules
```

**Key files to prioritize:**
- `src/components/map/UnifiedProjectMap.jsx` (2 console.error for map errors - consider keeping but with logger)
- `src/components/map/SiteSurveyMapTools.jsx`
- `src/components/NoAircraftAssignedModal.jsx`
- `src/components/AircraftSpecSheet.jsx`
- `src/components/policies/*.jsx` (several files)
- `src/pages/MasterPolicyAdmin.jsx`

---

### Priority 2: Empty Catch Blocks (~30 locations)

Find and improve empty catch blocks that silently swallow errors. Many are intentional "fail silently" patterns, but some need user feedback.

**Find them:**
```bash
grep -rn "catch {" src/ --include="*.jsx" --include="*.js"
```

**Pattern - If user feedback IS needed:**
```javascript
// Before:
} catch {
  // Silent fail
}

// After:
} catch (err) {
  logger.error('Operation failed:', err)
  setError('Something went wrong. Please try again.')
}
```

**Pattern - If silent fail IS acceptable (e.g., optional feature):**
```javascript
// Add a comment explaining why:
} catch {
  // Intentionally silent - feature is optional and failure is non-critical
}
```

---

### Priority 3: Missing PropTypes Validation

All 19 project component files in `src/components/projects/` lack PropTypes. Options:
1. Add PropTypes to each component (quick fix)
2. Consider migrating to TypeScript (bigger effort, better long-term)

**For PropTypes approach:**
```javascript
import PropTypes from 'prop-types'

ComponentName.propTypes = {
  project: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  // etc.
}
```

---

### Priority 4: Hardcoded Values

Move hardcoded configuration to constants files. Key locations:
- `src/components/projects/ProjectComms.jsx` - communication methods, radio channels
- `src/components/projects/ProjectHSERisk.jsx` - hazard categories, risk levels
- `src/components/projects/ProjectPPE.jsx` - PPE items
- `src/components/projects/ProjectFlightPlan.jsx` - operation types, airspace classes

**Create:** `src/lib/constants.js` or `src/config/` directory for these.

---

### Priority 5: Bundle Size Optimization

Current bundle is 3.9MB. Implement code splitting:

1. **Lazy load routes** in `App.jsx`:
```javascript
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Projects = lazy(() => import('./pages/Projects'))
// etc.
```

2. **Add Suspense wrapper:**
```javascript
<Suspense fallback={<LoadingSpinner />}>
  <Routes>...</Routes>
</Suspense>
```

---

### Priority 6: Accessibility Improvements

Key files needing ARIA labels:
- `src/components/projects/ProjectSections.jsx` - toggle controls
- `src/components/projects/ProjectSiteSurvey.jsx` - dropdown menus
- `src/components/projects/ProjectFlightPlan.jsx` - checkboxes
- `src/pages/Login.jsx` - form inputs
- `src/components/compliance/*.jsx` - search inputs

**Pattern:**
```javascript
<input
  aria-label="Search policies"
  placeholder="Search..."
/>

<button
  aria-label="Close modal"
  onClick={onClose}
>
  <X />
</button>
```

---

## GIT WORKFLOW

For each batch of fixes:
```bash
cd aeria-ops
git add .
git commit -m "fix: [description] - audit batch X"
git push origin main
# Wait for Vercel deployment
# Verify at production URL
# Then proceed to next batch
```

**Commit message format:**
```
fix: [category] issues from audit - batch X

- Bullet point of changes
- Another change

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

---

## REFERENCE FILES

- **Audit Report:** `docs/AUDIT_REPORT.md` - Full list of 221 issues found
- **Logger Utility:** `src/lib/logger.js` - Use this instead of console
- **Example fixed files:** Look at `src/pages/CapaDetail.jsx` or `src/pages/Aircraft.jsx` for pattern

---

## START HERE

1. First, read `docs/AUDIT_REPORT.md` to understand remaining issues
2. Run the grep commands above to find specific issues
3. Fix in batches, commit, push, verify deployment between each batch
4. Start with Priority 1 (remaining console statements) as it's the most straightforward

Begin now. Be thorough.
