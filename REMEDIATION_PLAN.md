# MUSTER APPLICATION - COMPLETE REMEDIATION PLAN

## Overview

This document provides a step-by-step plan to fix all issues identified in the comprehensive audit. Follow phases in order - later phases depend on earlier ones.

**Total Estimated Time:** 3-4 days for critical/high, 2 weeks for complete remediation

---

# PHASE 1: EMERGENCY SECURITY FIXES (Do Immediately - 2-3 hours)

## Step 1.1: Revoke Exposed Firebase Service Account Key

**Time:** 15 minutes

1. Go to Google Cloud Console: https://console.cloud.google.com
2. Select project: `aeria-operations`
3. Navigate to: IAM & Admin → Service Accounts
4. Find: `firebase-adminsdk-fbsvc@aeria-operations.iam.gserviceaccount.com`
5. Click on the service account → Keys tab
6. Find key ID: `8431c9f71a9e0bf77d427502c1c1b96216652879`
7. Click the trash icon to DELETE this key
8. Create a NEW key (JSON format)
9. Download and store securely (NOT in git repo)

## Step 1.2: Revoke Exposed Resend API Key

**Time:** 10 minutes

1. Go to Resend Dashboard: https://resend.com/api-keys
2. Find and REVOKE key: `re_ereAL9VW_7s7LC5LyWYbz2mFrbUZCs61X`
3. Create a NEW API key
4. Note the new key (you'll configure it in Step 1.4)

## Step 1.3: Remove Secrets from Git History

**Time:** 30 minutes

```bash
# Install BFG Repo-Cleaner (if not installed)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Create backup first
cd C:\Users\Dusti\Desktop
cp -r Muster Muster_backup

# Navigate to repo
cd C:\Users\Dusti\Desktop\Muster

# Create a file listing secrets to remove
cat > secrets-to-remove.txt << 'EOF'
re_ereAL9VW_7s7LC5LyWYbz2mFrbUZCs61X
8431c9f71a9e0bf77d427502c1c1b96216652879
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDMXOxk0EXwL
firebase-adminsdk-fbsvc@aeria-operations.iam.gserviceaccount.com
EOF

# Run BFG to remove secrets
java -jar bfg.jar --replace-text secrets-to-remove.txt

# Clean up
git reflog expire --expire=now --all && git gc --prune=now --aggressive

# Force push (coordinate with team first!)
git push --force
```

**Alternative using git filter-repo:**
```bash
pip install git-filter-repo
git filter-repo --invert-paths --path scripts/serviceAccountKey.json
git filter-repo --invert-paths --path scripts/aeria-operations-firebase-adminsdk-fbsvc-8431c9f71a.json
```

## Step 1.4: Configure Firebase Functions Secrets Properly

**Time:** 15 minutes

```bash
cd C:\Users\Dusti\Desktop\Muster

# Set secrets using Firebase config (replace with your new keys)
firebase functions:config:set resend.api_key="YOUR_NEW_RESEND_API_KEY"
firebase functions:config:set resend.from_email="Muster <notifications@yourdomain.com>"
firebase functions:config:set app.url="https://aeria-ops.vercel.app"

# Verify configuration
firebase functions:config:get

# Deploy functions with new config
firebase deploy --only functions
```

Then update `functions/index.js` to use Firebase config:

```javascript
// Replace lines 17-20 with:
const functions = require('firebase-functions')

// Use Firebase config instead of process.env
const config = functions.config()
const RESEND_API_KEY = config.resend?.api_key
const FROM_EMAIL = config.resend?.from_email
const APP_URL = config.app?.url

if (!RESEND_API_KEY) {
  functions.logger.error('Resend API key not configured. Run: firebase functions:config:set resend.api_key="YOUR_KEY"')
}
```

## Step 1.5: Delete Local Secret Files

**Time:** 5 minutes

```bash
cd C:\Users\Dusti\Desktop\Muster

# Delete the exposed files
rm scripts/serviceAccountKey.json
rm scripts/aeria-operations-firebase-adminsdk-fbsvc-8431c9f71a.json
rm functions/.env

# Verify .gitignore has proper entries (already there, but verify)
cat .gitignore | grep -E "(serviceAccountKey|firebase-adminsdk|\.env)"
```

## Step 1.6: Create Firebase Storage Security Rules

**Time:** 15 minutes

Create file `storage.rules`:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper function to check authentication
    function isAuthenticated() {
      return request.auth != null;
    }

    // Helper function to check organization membership
    function isMemberOfOrg(orgId) {
      return isAuthenticated() &&
        firestore.exists(/databases/(default)/documents/organizationMembers/$(request.auth.uid)_$(orgId));
    }

    // Organization files - only members can read/write
    match /organizations/{orgId}/{allPaths=**} {
      allow read: if isMemberOfOrg(orgId);
      allow write: if isMemberOfOrg(orgId);
    }

    // User profile images
    match /users/{userId}/{allPaths=**} {
      allow read: if isAuthenticated();
      allow write: if request.auth.uid == userId;
    }

    // Deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

Update `firebase.json` to include storage rules:

```json
{
  "functions": [...],
  "firestore": {...},
  "storage": {
    "rules": "storage.rules"
  }
}
```

Deploy:
```bash
firebase deploy --only storage
```

---

# PHASE 2: FIRESTORE SECURITY RULES FIXES (1-2 hours)

## Step 2.1: Fix Settings Collection Rules

**File:** `firestore.rules`
**Lines:** 738-741

Replace:
```
match /settings/{settingId} {
  allow read: if isAuthenticated();
  allow write: if isAuthenticated(); // Consider restricting to admins
}
```

With:
```
match /settings/{settingId} {
  allow read: if isAuthenticated();
  // Only admins can write global settings
  allow write: if isAuthenticated() &&
    exists(/databases/$(database)/documents/organizationMembers/$(request.auth.uid + '_' + resource.data.organizationId)) &&
    get(/databases/$(database)/documents/organizationMembers/$(request.auth.uid + '_' + resource.data.organizationId)).data.role == 'admin';
}
```

## Step 2.2: Fix Field Hazard Reviews Create Rule

**File:** `firestore.rules`
**Lines:** 400-411

Replace line 405:
```
allow create: if isAuthenticated();
```

With:
```
allow create: if isAuthenticated() &&
  canEdit(request.resource.data.organizationId);
```

## Step 2.3: Add Portal Collections Rules

**File:** `firestore.rules`

Add after line 741 (before the closing braces):

```
// ============================================
// Portal Users Collection
// ============================================
match /portalUsers/{portalUserId} {
  // Portal users can only read their own data
  allow read: if isAuthenticated() &&
    (request.auth.uid == portalUserId ||
     isMemberOf(resource.data.organizationId));
  // Only organization members can create/update portal users
  allow create: if isAuthenticated() &&
    canEdit(request.resource.data.organizationId);
  allow update: if isAuthenticated() &&
    canEdit(resource.data.organizationId);
  allow delete: if isAuthenticated() &&
    canDelete(resource.data.organizationId);
}

// ============================================
// Portal Sessions Collection (Magic Links)
// ============================================
match /portalSessions/{sessionId} {
  // Sessions should only be readable during verification
  // Write operations should be server-side only
  allow read: if false; // Use Admin SDK for verification
  allow write: if false; // Use Admin SDK for creation
}

// ============================================
// Portal Invitations Collection
// ============================================
match /portalInvitations/{inviteId} {
  allow read: if isAuthenticated() &&
    isMemberOf(resource.data.organizationId);
  allow create: if isAuthenticated() &&
    canEdit(request.resource.data.organizationId);
  allow update: if isAuthenticated() &&
    canEdit(resource.data.organizationId);
  allow delete: if isAuthenticated() &&
    canDelete(resource.data.organizationId);
}
```

## Step 2.4: Deploy Updated Firestore Rules

```bash
cd C:\Users\Dusti\Desktop\Muster
firebase deploy --only firestore:rules
```

## Step 2.5: Test Rules with Emulator

```bash
# Start emulator
firebase emulators:start --only firestore

# Run rule tests (create test file first - see Phase 7)
npm test
```

---

# PHASE 3: AUTHENTICATION & TOKEN SECURITY (2-3 hours)

## Step 3.1: Fix Magic Link Token Generation

**File:** `src/lib/firestorePortal.js`

Replace the `generateToken` function (around line 194-201):

```javascript
/**
 * Generate cryptographically secure token
 * @returns {string} 64-character secure random token
 */
function generateToken() {
  // Use Web Crypto API for cryptographically secure random values
  const array = new Uint8Array(48); // 48 bytes = 64 base64 characters
  crypto.getRandomValues(array);

  // Convert to base64 and make URL-safe
  const base64 = btoa(String.fromCharCode.apply(null, array));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Hash a token for secure storage
 * @param {string} token - Plain token
 * @returns {Promise<string>} SHA-256 hash of token
 */
async function hashToken(token) {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

## Step 3.2: Update Magic Link Session Creation

**File:** `src/lib/firestorePortal.js`

Update the `createMagicLinkSession` function to hash tokens:

```javascript
export async function createMagicLinkSession(data) {
  const token = generateToken();
  const tokenHash = await hashToken(token);

  const session = {
    portalUserId: data.portalUserId,
    clientId: data.clientId,
    email: data.email,
    type: data.type || 'login',
    tokenHash: tokenHash, // Store hash, not plain token
    used: false,
    createdAt: serverTimestamp(),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
  };

  const docRef = await addDoc(portalSessionsRef, session);

  return {
    id: docRef.id,
    token: token, // Return plain token to send in email (not stored)
    ...session
  };
}
```

## Step 3.3: Update Magic Link Verification

**File:** `src/lib/firestorePortal.js`

Update `verifyMagicLinkToken` to compare hashes:

```javascript
export async function verifyMagicLinkToken(token) {
  const tokenHash = await hashToken(token);

  const q = query(
    portalSessionsRef,
    where('tokenHash', '==', tokenHash),
    where('used', '==', false),
    limit(1)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const sessionDoc = snapshot.docs[0];
  const session = sessionDoc.data();

  // Check expiration server-side
  const expiresAt = session.expiresAt?.toDate?.() || new Date(session.expiresAt);
  if (expiresAt < new Date()) {
    // Mark as expired
    await updateDoc(sessionDoc.ref, { used: true, expiredAt: serverTimestamp() });
    return null;
  }

  // Mark as used
  await updateDoc(sessionDoc.ref, {
    used: true,
    usedAt: serverTimestamp()
  });

  return {
    id: sessionDoc.id,
    ...session
  };
}
```

## Step 3.4: Add Server-Side Session Validation

**File:** `src/lib/firestorePortal.js`

Add a function to validate sessions server-side:

```javascript
/**
 * Validate portal session server-side
 * Call this on protected API routes
 */
export async function validatePortalSession(portalUserId, clientId) {
  if (!portalUserId || !clientId) {
    return { valid: false, error: 'Missing session data' };
  }

  try {
    // Verify user exists and is active
    const user = await getPortalUserById(portalUserId);
    if (!user || user.status === 'disabled') {
      return { valid: false, error: 'User not found or disabled' };
    }

    // Verify user belongs to claimed client
    if (user.clientId !== clientId) {
      return { valid: false, error: 'Client mismatch' };
    }

    return { valid: true, user };
  } catch (err) {
    logger.error('Session validation failed:', err);
    return { valid: false, error: 'Validation failed' };
  }
}
```

## Step 3.5: Update Portal Auth Context for Secure Sessions

**File:** `src/contexts/PortalAuthContext.jsx`

Update session storage to be more secure:

```javascript
// Add at top of file
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Replace checkExistingSession function
const checkExistingSession = async () => {
  try {
    const sessionData = localStorage.getItem(PORTAL_SESSION_KEY);
    if (!sessionData) {
      setLoading(false);
      return;
    }

    const session = JSON.parse(sessionData);

    // Client-side expiry check (server will also validate)
    if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(PORTAL_SESSION_KEY);
      setLoading(false);
      return;
    }

    // SERVER-SIDE VALIDATION (important!)
    const validation = await validatePortalSession(
      session.portalUserId,
      session.clientId
    );

    if (!validation.valid) {
      logger.warn('Session validation failed:', validation.error);
      localStorage.removeItem(PORTAL_SESSION_KEY);
      setLoading(false);
      return;
    }

    // Session is valid - load user data
    const user = validation.user;
    const clientData = await getClientForPortal(user.clientId);

    if (!clientData) {
      localStorage.removeItem(PORTAL_SESSION_KEY);
      setLoading(false);
      return;
    }

    setPortalUser(user);
    setClient(clientData);
  } catch (err) {
    logger.error('Failed to check portal session:', err);
    localStorage.removeItem(PORTAL_SESSION_KEY);
  } finally {
    setLoading(false);
  }
};
```

---

# PHASE 4: CLOUD FUNCTIONS SECURITY (1-2 hours)

## Step 4.1: Add Authorization to Resend Function

**File:** `functions/index.js`

Update `resendInvitationEmail` to verify caller has permission:

```javascript
exports.resendInvitationEmail = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const { memberId } = data;
  const callerUid = context.auth.uid;

  if (!memberId || typeof memberId !== 'string' || memberId.length > 255) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Valid member ID is required'
    );
  }

  try {
    const memberDoc = await db.collection('organizationMembers').doc(memberId).get();

    if (!memberDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Invitation not found');
    }

    const member = memberDoc.data();

    // AUTHORIZATION CHECK: Verify caller is member of same organization
    const callerMembershipId = `${callerUid}_${member.organizationId}`;
    const callerMembership = await db.collection('organizationMembers').doc(callerMembershipId).get();

    if (!callerMembership.exists) {
      functions.logger.warn('Unauthorized resend attempt', { callerUid, memberId });
      throw new functions.https.HttpsError(
        'permission-denied',
        'You do not have permission to resend this invitation'
      );
    }

    const callerRole = callerMembership.data().role;
    if (!['admin', 'management'].includes(callerRole)) {
      functions.logger.warn('Insufficient role for resend', { callerUid, callerRole, memberId });
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only administrators and management can resend invitations'
      );
    }

    // ... rest of existing function
  } catch (error) {
    // ... error handling
  }
});
```

## Step 4.2: Add Rate Limiting

**File:** `functions/index.js`

Add rate limiting helper and apply to resend function:

```javascript
// Add at top of file
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_RESENDS_PER_WINDOW = 5;

/**
 * Check rate limit for an action
 * @param {string} key - Rate limit key (e.g., memberId)
 * @param {string} action - Action name
 * @returns {Promise<boolean>} - True if within limit
 */
async function checkRateLimit(key, action) {
  const rateLimitRef = db.collection('rateLimits').doc(`${action}_${key}`);
  const doc = await rateLimitRef.get();

  const now = Date.now();

  if (!doc.exists) {
    await rateLimitRef.set({
      count: 1,
      windowStart: now,
      lastAttempt: now
    });
    return true;
  }

  const data = doc.data();

  // Reset window if expired
  if (now - data.windowStart > RATE_LIMIT_WINDOW_MS) {
    await rateLimitRef.set({
      count: 1,
      windowStart: now,
      lastAttempt: now
    });
    return true;
  }

  // Check limit
  if (data.count >= MAX_RESENDS_PER_WINDOW) {
    return false;
  }

  // Increment counter
  await rateLimitRef.update({
    count: admin.firestore.FieldValue.increment(1),
    lastAttempt: now
  });

  return true;
}

// In resendInvitationEmail, add after authorization check:
const withinLimit = await checkRateLimit(memberId, 'resend_invitation');
if (!withinLimit) {
  throw new functions.https.HttpsError(
    'resource-exhausted',
    'Too many resend attempts. Please try again later.'
  );
}
```

## Step 4.3: Sanitize HTML in Email Templates

**File:** `functions/index.js`

Add HTML escaping helper and use it:

```javascript
// Add at top of file
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Update email template (around line 105):
<p>${escapeHtml(inviterName)} has invited you to join <strong>${escapeHtml(orgName)}</strong> on Muster as a <strong>${escapeHtml(roleName)}</strong>.</p>

// And line 115:
<p style="color: #6b7280; font-size: 14px;">Simply sign up or log in with this email address (<strong>${escapeHtml(member.email)}</strong>) and you'll automatically be added to the organization.</p>
```

## Step 4.4: Fix Error Information Disclosure

**File:** `functions/index.js`

Replace error returns with generic messages:

```javascript
// Replace line 134:
return { success: false, error: 'Failed to send invitation email' };

// Replace line 158:
return { success: false, error: 'An error occurred while sending the invitation' };

// Replace line 262:
throw new functions.https.HttpsError('internal', 'Failed to send email');

// Replace line 276:
throw new functions.https.HttpsError('internal', 'An error occurred');
```

## Step 4.5: Deploy Updated Functions

```bash
cd C:\Users\Dusti\Desktop\Muster
firebase deploy --only functions
```

---

# PHASE 5: ERROR HANDLING & LOGGING (2-3 hours)

## Step 5.1: Create Enhanced Logger

**File:** `src/lib/logger.js`

Update or create logger with more features:

```javascript
/**
 * Enhanced logging utility
 * Replaces console.* throughout the application
 */

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// Set minimum log level based on environment
const MIN_LOG_LEVEL = import.meta.env.DEV ? 'debug' : 'warn';

function shouldLog(level) {
  return LOG_LEVELS[level] >= LOG_LEVELS[MIN_LOG_LEVEL];
}

function formatMessage(level, message, data) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  return { prefix, message, data };
}

export const logger = {
  debug: (message, data) => {
    if (shouldLog('debug')) {
      const { prefix } = formatMessage('debug', message, data);
      console.debug(prefix, message, data || '');
    }
  },

  info: (message, data) => {
    if (shouldLog('info')) {
      const { prefix } = formatMessage('info', message, data);
      console.info(prefix, message, data || '');
    }
  },

  warn: (message, data) => {
    if (shouldLog('warn')) {
      const { prefix } = formatMessage('warn', message, data);
      console.warn(prefix, message, data || '');
    }
  },

  error: (message, error) => {
    if (shouldLog('error')) {
      const { prefix } = formatMessage('error', message, error);
      console.error(prefix, message, error || '');

      // In production, you might want to send to error tracking service
      // if (!import.meta.env.DEV) {
      //   sendToErrorTracking({ message, error });
      // }
    }
  }
};

export default logger;
```

## Step 5.2: Fix Silent Catch Blocks

**File:** `src/pages/Calendar.jsx`

Replace all `.catch(() => [])` patterns:

```javascript
// Replace lines like:
const projects = await getProjects(organizationId).catch(() => [])

// With:
const projects = await getProjects(organizationId).catch(err => {
  logger.error('Failed to load projects for calendar:', err);
  return [];
});

// Apply to all 6 instances in Calendar.jsx (lines 98, 117, 150, 170, 190, 212)
```

**File:** `src/components/dashboard/QuickStats.jsx`

```javascript
// Same pattern - replace silent catches with logged catches
```

**File:** `src/components/onboarding/OnboardingChecklist.jsx`

```javascript
// Same pattern
```

## Step 5.3: Replace Console Statements

Create a script to help find and replace:

```bash
# Find all console.* statements
cd C:\Users\Dusti\Desktop\Muster\src
grep -rn "console\." --include="*.js" --include="*.jsx" | grep -v node_modules
```

Manual replacements needed in:
- `src/lib/adminUtils.js` - 12 instances
- `src/lib/firestore.js` - 8 instances
- `src/contexts/OrganizationContext.jsx` - 4 instances
- `src/pages/Calendar.jsx` - 1 instance

Example replacement:
```javascript
// Before:
console.error('Error fetching organization data:', err)

// After:
logger.error('Error fetching organization data:', err)
```

## Step 5.4: Add Error Boundaries to Key Components

**File:** `src/components/ErrorBoundary.jsx` (already exists, verify it's used)

Ensure ErrorBoundary wraps main routes in App.jsx (already done, but verify).

## Step 5.5: Improve Promise.all Error Handling

**File:** `src/pages/Dashboard.jsx`

Replace:
```javascript
const [projects, operators, aircraft] = await Promise.all([
  getProjects(organizationId),
  getOperators(organizationId),
  getAircraft(organizationId)
]);
```

With:
```javascript
const [projectsResult, operatorsResult, aircraftResult] = await Promise.allSettled([
  getProjects(organizationId),
  getOperators(organizationId),
  getAircraft(organizationId)
]);

const projects = projectsResult.status === 'fulfilled' ? projectsResult.value : [];
const operators = operatorsResult.status === 'fulfilled' ? operatorsResult.value : [];
const aircraft = aircraftResult.status === 'fulfilled' ? aircraftResult.value : [];

// Log any failures
if (projectsResult.status === 'rejected') {
  logger.error('Failed to load projects:', projectsResult.reason);
}
if (operatorsResult.status === 'rejected') {
  logger.error('Failed to load operators:', operatorsResult.reason);
}
if (aircraftResult.status === 'rejected') {
  logger.error('Failed to load aircraft:', aircraftResult.reason);
}
```

---

# PHASE 6: CODE QUALITY FIXES (3-4 hours)

## Step 6.1: Remove Hardcoded Contact Information

**File:** `src/pages/Forms.jsx`

Replace lines 140-142:
```javascript
// Before:
<p>Dustin Wales: <span className="font-mono">604-849-2345</span></p>

// After - use organization settings or constants:
// First, add to src/lib/uiConstants.js:
export const EMERGENCY_CONTACTS = {
  accountableExecutive: {
    name: 'Accountable Executive',
    phone: '', // Set via organization settings
  }
};

// Then in Forms.jsx, get from organization context:
const { organization } = useOrganizationContext();
const aeContact = organization?.settings?.accountableExecutive;

// Render:
{aeContact && (
  <p>{aeContact.name}: <span className="font-mono">{aeContact.phone}</span></p>
)}
```

## Step 6.2: Remove Window Auth Exposure

**File:** `src/lib/firebase.js`

Remove lines 25-28:
```javascript
// DELETE THIS BLOCK:
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  window.auth = auth
  window.db = db
}
```

## Step 6.3: Fix Validation Functions

**File:** `src/lib/validation.js`

Update email validation:
```javascript
/**
 * Validate email address with stricter rules
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;

  // More comprehensive email regex
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!regex.test(email)) return false;

  // Additional checks
  if (email.length > 254) return false;
  const [local, domain] = email.split('@');
  if (local.length > 64) return false;
  if (!domain || domain.length < 3) return false;

  return true;
}

/**
 * Validate phone number
 * @param {string} phone
 * @param {string} country - Country code for validation (default: 'US')
 * @returns {boolean}
 */
export function isValidPhone(phone, country = 'US') {
  if (!phone || typeof phone !== 'string') return false;

  const digits = phone.replace(/\D/g, '');

  // North American validation
  if (country === 'US' || country === 'CA') {
    // Must be 10 or 11 digits (with optional 1 prefix)
    if (digits.length === 10) return true;
    if (digits.length === 11 && digits.startsWith('1')) return true;
    return false;
  }

  // Generic international
  return digits.length >= 7 && digits.length <= 15;
}
```

## Step 6.4: Add Missing useCallback Dependencies

**File:** `src/hooks/useMapData.js`

Fix stale closure in selectSite (around line 436):
```javascript
// Before:
const selectSite = useCallback((siteId) => {
  // ... implementation
}, [onUpdate, project]);

// After - add missing dependencies:
const selectSite = useCallback((siteId) => {
  // ... implementation
}, [onUpdate, project, activeSiteId]);
```

## Step 6.5: Add Pagination to Calendar

**File:** `src/pages/Calendar.jsx`

Add pagination to large data fetches:

```javascript
// Before:
const maintenanceEvents = await getUpcomingMaintenance(organizationId, 365)

// After:
const ITEMS_PER_PAGE = 100;
const maintenanceEvents = await getUpcomingMaintenance(
  organizationId,
  90, // Reduce to 90 days
  ITEMS_PER_PAGE
);
```

Update the firestore function to support limits:
```javascript
// In src/lib/firestoreMaintenance.js or wherever getUpcomingMaintenance is defined
export async function getUpcomingMaintenance(organizationId, daysAhead = 30, maxItems = 100) {
  // Add limit to query
  const q = query(
    maintenanceRef,
    where('organizationId', '==', organizationId),
    where('dueDate', '<=', futureDate),
    orderBy('dueDate', 'asc'),
    limit(maxItems)
  );
  // ...
}
```

---

# PHASE 7: ACCESSIBILITY FIXES (3-4 hours)

## Step 7.1: Add ARIA Labels to Icon Buttons

**File:** `src/components/ui/Button.jsx`

Ensure IconButton always has aria-label:
```javascript
// Around line 115-170, update IconButton:
export function IconButton({
  icon: Icon,
  label, // Make this required or provide default
  ...props
}) {
  if (!label && import.meta.env.DEV) {
    console.warn('IconButton missing aria-label');
  }

  return (
    <button
      aria-label={label || 'Button'}
      {...props}
    >
      <Icon />
    </button>
  );
}

// Add PropTypes
IconButton.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired, // Mark as required
};
```

## Step 7.2: Fix Password Toggle Button

**File:** `src/components/ui/Input.jsx`

Around lines 141-151:
```javascript
<button
  type="button"
  onClick={() => setShowPassword(!showPassword)}
  className="absolute inset-y-0 right-0 flex items-center pr-3"
  aria-label={showPassword ? 'Hide password' : 'Show password'}
  aria-pressed={showPassword}
>
  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
</button>
```

## Step 7.3: Fix Search Clear Button

**File:** `src/components/ui/Input.jsx`

Around lines 219-226:
```javascript
<button
  type="button"
  onClick={onClear}
  className="absolute inset-y-0 right-0 flex items-center pr-3"
  aria-label="Clear search"
>
  <X className="h-4 w-4" />
</button>
```

## Step 7.4: Fix Number Input Buttons

**File:** `src/components/ui/Input.jsx`

Around lines 282-310:
```javascript
<button
  type="button"
  onClick={handleDecrement}
  aria-label="Decrease value"
  // ... other props
>
  <Minus />
</button>

<button
  type="button"
  onClick={handleIncrement}
  aria-label="Increase value"
  // ... other props
>
  <Plus />
</button>
```

## Step 7.5: Add Keyboard Navigation to SplitButton

**File:** `src/components/ui/Button.jsx`

Around lines 225-288, add keyboard handler:
```javascript
function SplitButton({ options, onSelect, ...props }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const menuRef = useRef(null);

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(i => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(options[focusedIndex]);
        setIsOpen(false);
        break;
    }
  };

  return (
    <div onKeyDown={handleKeyDown} role="menu" aria-haspopup="true" aria-expanded={isOpen}>
      {/* ... existing implementation with role="menuitem" on options */}
    </div>
  );
}
```

## Step 7.6: Fix Color Contrast

**File:** Multiple UI components

Replace `text-gray-400` with `text-gray-500` or `text-gray-600` for better contrast:

```javascript
// In src/components/ui/Input.jsx, Button.jsx, Alert.jsx
// Find and replace:
// text-gray-400 → text-gray-500 (for icons and secondary text)
```

## Step 7.7: Add Required Attribute to Form Fields

**File:** `src/components/ui/FormField.jsx`

Update to pass required attribute:
```javascript
// In the Input/Select/Textarea wrappers, ensure required is passed through:
export function FormInput({ required, ...props }) {
  return (
    <input
      required={required}
      aria-required={required}
      {...props}
    />
  );
}
```

---

# PHASE 8: TESTING SETUP (2-3 hours)

## Step 8.1: Install Testing Dependencies

```bash
cd C:\Users\Dusti\Desktop\Muster
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

## Step 8.2: Configure Vitest

Create `vitest.config.js`:
```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
});
```

Create `src/test/setup.js`:
```javascript
import '@testing-library/jest-dom';
```

## Step 8.3: Add Validation Tests

Create `src/lib/__tests__/validation.test.js`:
```javascript
import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidPhone } from '../validation';

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.org')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('a@b.c')).toBe(false); // Too short domain
    expect(isValidEmail('@domain.com')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('accepts valid North American phones', () => {
    expect(isValidPhone('6048492345')).toBe(true);
    expect(isValidPhone('604-849-2345')).toBe(true);
    expect(isValidPhone('1-604-849-2345')).toBe(true);
  });

  it('rejects invalid phones', () => {
    expect(isValidPhone('')).toBe(false);
    expect(isValidPhone('123')).toBe(false);
  });
});
```

## Step 8.4: Add Firestore Rules Tests

Create `firestore-rules.test.js`:
```javascript
const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const fs = require('fs');

const PROJECT_ID = 'test-project';

let testEnv;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Firestore Rules', () => {
  describe('Settings collection', () => {
    it('allows admin to write settings', async () => {
      const admin = testEnv.authenticatedContext('admin-user');
      // ... test implementation
    });

    it('denies non-admin write to settings', async () => {
      const user = testEnv.authenticatedContext('regular-user');
      // ... test implementation
    });
  });
});
```

## Step 8.5: Update package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:rules": "firebase emulators:exec --only firestore 'npm run test:firestore'",
    "test:firestore": "vitest firestore-rules.test.js"
  }
}
```

---

# PHASE 9: DOCUMENTATION & CLEANUP (1-2 hours)

## Step 9.1: Create .env.example

Create `.env.example` in project root:
```
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

# Mapbox (for maps)
VITE_MAPBOX_TOKEN=your_mapbox_token_here

# Optional: Claude API (for AI briefings)
VITE_CLAUDE_API_KEY=your_claude_key_here
```

Create `functions/.env.example`:
```
# DO NOT commit actual values - use Firebase config instead
# firebase functions:config:set resend.api_key="YOUR_KEY"

# These are just for local development with emulator
RESEND_API_KEY=test_key
RESEND_FROM_EMAIL=Test <test@test.com>
APP_URL=http://localhost:5173
```

## Step 9.2: Update README

Add security section to `README.md`:
```markdown
## Security

### Environment Variables
Never commit secrets to the repository. Use:
- `.env.local` for local development (already in .gitignore)
- Firebase Functions config for production: `firebase functions:config:set`

### Firestore Security
Security rules are in `firestore.rules`. Always test changes with the emulator before deploying.

### Reporting Security Issues
Report security vulnerabilities to [security@yourdomain.com]
```

## Step 9.3: Clean Up Unused Files

```bash
# Remove any backup or temporary files
cd C:\Users\Dusti\Desktop\Muster
rm -f nul
rm -rf *.bak

# Check for any other sensitive files
find . -name "*.key" -o -name "*secret*" -o -name "*credential*" | grep -v node_modules
```

---

# DEPLOYMENT CHECKLIST

Before deploying to production, verify:

## Security
- [ ] All API keys rotated and old ones revoked
- [ ] Secrets removed from git history
- [ ] Storage rules deployed
- [ ] Firestore rules updated and deployed
- [ ] Cloud Functions deployed with new config

## Testing
- [ ] All tests passing
- [ ] Manual testing of auth flows
- [ ] Manual testing of portal magic links
- [ ] Security rules tested with emulator

## Monitoring
- [ ] Firebase Security Alerts enabled
- [ ] Error tracking configured (e.g., Sentry)
- [ ] Cloud Functions logs monitored

---

# TIMELINE SUMMARY

| Phase | Duration | Priority |
|-------|----------|----------|
| Phase 1: Emergency Security | 2-3 hours | CRITICAL |
| Phase 2: Firestore Rules | 1-2 hours | CRITICAL |
| Phase 3: Auth Security | 2-3 hours | HIGH |
| Phase 4: Cloud Functions | 1-2 hours | HIGH |
| Phase 5: Error Handling | 2-3 hours | HIGH |
| Phase 6: Code Quality | 3-4 hours | MEDIUM |
| Phase 7: Accessibility | 3-4 hours | MEDIUM |
| Phase 8: Testing | 2-3 hours | MEDIUM |
| Phase 9: Documentation | 1-2 hours | LOW |

**Total: 18-26 hours (3-4 days)**

---

*Remediation plan created February 2, 2026*
