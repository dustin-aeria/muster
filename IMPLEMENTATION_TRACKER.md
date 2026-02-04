# Implementation Tracker: Expense Tracker & In-Field Activities Tracker

**Started:** 2026-02-04
**Status:** Phase 3 Complete

---

## Phase 1: Expense Tracker - Core Infrastructure ✅
- [x] 1.1 Create `src/lib/firestoreExpenses.js` - CRUD operations, constants
- [x] 1.2 Add `uploadExpenseReceipt()` to `src/lib/storageHelpers.js`
- [x] 1.3 Update `firestore.rules` - add expenses collection rules

**Commit:** `48cff158`

---

## Phase 2: Expense Tracker - UI Components ✅
- [x] 2.1 Create `src/components/expenses/ExpenseForm.jsx` - form with receipt capture
- [x] 2.2 Create `src/components/expenses/ExpenseList.jsx` - list with filtering
- [x] 2.3 Create `src/components/projects/ProjectExpenses.jsx` - project tab

**Commit:** `2b0341af`

---

## Phase 3: Expense Tracker - Integration ✅
- [x] 3.1 Update `src/pages/ProjectView.jsx` - add expenses tab
- [x] 3.2 Update `src/components/projects/PhaseNavigator.jsx` - add to plan phase
- [x] 3.3 Create `src/pages/ExpenseApproval.jsx` - manager approval page
- [x] 3.4 Update `src/App.jsx` - add ExpenseApproval route

**Commit:** _committing..._

---

## Phase 4: Expense Tracker - OCR Cloud Function
- [ ] 4.1 Add `@google-cloud/vision` to `functions/package.json`
- [ ] 4.2 Create OCR trigger in `functions/index.js`
- [ ] 4.3 Deploy Cloud Function

**Commit:** _pending_

---

## Phase 5: Activities Tracker - Core Infrastructure
- [ ] 5.1 Create `src/lib/firestoreActivities.js` - CRUD, timer helpers
- [ ] 5.2 Create `src/hooks/useActivityTimer.js` - real-time timer hook
- [ ] 5.3 Update `firestore.rules` - add activities collection rules

**Commit:** _pending_

---

## Phase 6: Activities Tracker - UI Components
- [ ] 6.1 Create `src/components/activities/ActivityTimer.jsx` - timer display
- [ ] 6.2 Create `src/components/activities/ActivityForm.jsx` - start/edit modal
- [ ] 6.3 Create `src/components/activities/ActivityList.jsx` - timeline view
- [ ] 6.4 Create `src/components/projects/ProjectActivities.jsx` - project tab

**Commit:** _pending_

---

## Phase 7: Activities Tracker - Integration
- [ ] 7.1 Update `src/pages/ProjectView.jsx` - add activities tab
- [ ] 7.2 Update `src/components/projects/PhaseNavigator.jsx` - add to field phase
- [ ] 7.3 Create `src/components/activities/ActiveTimerWidget.jsx` - floating widget
- [ ] 7.4 Update `src/components/Layout.jsx` - add floating widget

**Commit:** _pending_

---

## Phase 8: Final Integration & Polish
- [ ] 8.1 Update `src/components/projects/ProjectCosts.jsx` - show expense totals
- [ ] 8.2 Update export/report generation - include activities
- [ ] 8.3 Final testing and verification

**Commit:** _pending_

---

## Completion Log

| Phase | Completed | Commit Hash | Notes |
|-------|-----------|-------------|-------|
| 1     | ✅ 2026-02-04 | `48cff158` | Core infrastructure: firestoreExpenses.js, storageHelpers, rules |
| 2     | ✅ 2026-02-04 | `2b0341af` | UI components: ExpenseForm, ExpenseList, ProjectExpenses |
| 3     |           |             |       |
| 4     |           |             |       |
| 5     |           |             |       |
| 6     |           |             |       |
| 7     |           |             |       |
| 8     |           |             |       |
