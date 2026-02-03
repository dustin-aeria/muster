/**
 * organizationDefaults.js
 * Centralized default values for organization settings
 *
 * These values should eventually be moved to organization settings in Firestore
 * so each organization can customize their own contacts.
 *
 * For now, this file provides a single source of truth for default values.
 *
 * @location src/lib/organizationDefaults.js
 */

// Default emergency contact for the organization
// TODO: Move these to organization settings in Firestore
export const DEFAULT_ACCOUNTABLE_EXECUTIVE = {
  name: 'Accountable Executive',
  phone: '',
  email: '',
  // Set these via organization settings
}

// Regulatory contacts (these are standard and don't change per org)
export const REGULATORY_CONTACTS = {
  TRANSPORT_CANADA: {
    label: 'Transport Canada CADORS',
    phone: '1-800-305-2059',
    instructions: 'For serious incidents, injuries, or regulatory violations',
  },
  EMERGENCY_SERVICES: {
    label: 'Emergency Services',
    phone: '911',
    instructions: 'For immediate emergencies',
  },
  POISON_CONTROL: {
    label: 'Poison Control',
    phone: '1-800-567-8911',
    instructions: 'For chemical exposure or poisoning',
  },
}

/**
 * Get accountable executive contact from organization or use default
 * @param {Object} organization - Organization object from context
 * @returns {Object} Contact info with name and phone
 */
export function getAccountableExecutive(organization) {
  if (organization?.settings?.accountableExecutive) {
    return organization.settings.accountableExecutive
  }
  return DEFAULT_ACCOUNTABLE_EXECUTIVE
}

/**
 * Get all emergency contacts including org-specific and defaults
 * @param {Object} organization - Organization object
 * @param {Array} customContacts - Custom contacts from project/form
 * @returns {Array} Combined contact list
 */
export function getEmergencyContacts(organization, customContacts = []) {
  const contacts = [...customContacts]

  // Add regulatory contacts
  contacts.push(
    { role: 'Emergency Services', number: REGULATORY_CONTACTS.EMERGENCY_SERVICES.phone },
    { role: 'Poison Control', number: REGULATORY_CONTACTS.POISON_CONTROL.phone }
  )

  // Add accountable executive if configured
  const ae = getAccountableExecutive(organization)
  if (ae.phone) {
    contacts.push({ role: 'Accountable Executive', number: ae.phone })
  }

  return contacts
}
