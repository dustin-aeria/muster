/**
 * regulatoryFrameworks.js
 * International regulatory framework configurations
 *
 * Supports:
 * - Transport Canada (CARs Part IX)
 * - EASA (European Union)
 * - FAA (United States Part 107)
 *
 * @location src/lib/regulatoryFrameworks.js
 */

// ============================================
// REGULATORY AUTHORITIES
// ============================================

export const REGULATORY_AUTHORITIES = {
  tc: {
    id: 'tc',
    name: 'Transport Canada',
    shortName: 'TC',
    country: 'Canada',
    flag: '🇨🇦',
    website: 'https://tc.canada.ca/en/aviation/drone-safety',
    primaryRegulation: 'Canadian Aviation Regulations (CARs) Part IX',
    description: 'RPAS operations under Canadian Aviation Regulations'
  },
  easa: {
    id: 'easa',
    name: 'European Union Aviation Safety Agency',
    shortName: 'EASA',
    country: 'European Union',
    flag: '🇪🇺',
    website: 'https://www.easa.europa.eu/domains/drones-air-mobility',
    primaryRegulation: 'EU Regulation 2019/947',
    description: 'UAS operations under EASA drone regulations'
  },
  faa: {
    id: 'faa',
    name: 'Federal Aviation Administration',
    shortName: 'FAA',
    country: 'United States',
    flag: '🇺🇸',
    website: 'https://www.faa.gov/uas',
    primaryRegulation: '14 CFR Part 107',
    description: 'Small UAS operations under FAA regulations'
  }
}

// ============================================
// OPERATION CATEGORIES BY AUTHORITY
// ============================================

export const OPERATION_CATEGORIES = {
  tc: {
    // Transport Canada categories
    basic: {
      id: 'basic',
      name: 'Basic Operations',
      description: 'Low-risk operations in uncontrolled airspace, away from people',
      requirements: [
        'Pilot certificate (Basic)',
        'Drone registration',
        'Fly in uncontrolled airspace only',
        'Keep drone in sight at all times (VLOS)',
        'Fly below 400 ft AGL',
        'Fly at least 30m from bystanders'
      ],
      maxWeight: 25, // kg
      maxAltitude: 400, // ft AGL
      requiresSFOC: false
    },
    advanced: {
      id: 'advanced',
      name: 'Advanced Operations',
      description: 'Operations in controlled airspace or near people',
      requirements: [
        'Pilot certificate (Advanced)',
        'Drone registration and marking',
        'NAV CANADA authorization for controlled airspace',
        'Flight review completed',
        'Can fly near people (not over)',
        'Can fly in controlled airspace with authorization'
      ],
      maxWeight: 25, // kg
      maxAltitude: 400, // ft AGL
      requiresSFOC: false
    },
    sfoc: {
      id: 'sfoc',
      name: 'Special Flight Operations Certificate',
      description: 'Operations outside Basic/Advanced rules',
      requirements: [
        'SFOC application approved by TC',
        'Operations manual',
        'Risk assessment',
        'Insurance coverage',
        'Specific conditions as per SFOC'
      ],
      examples: ['BVLOS', 'Night operations', 'Over 25kg', 'Over people'],
      requiresSFOC: true
    }
  },

  easa: {
    // EASA categories (EU 2019/947)
    open_a1: {
      id: 'open_a1',
      name: 'Open Category A1',
      description: 'Fly over people (not assemblies)',
      subcategory: 'A1',
      requirements: [
        'Online training and exam',
        'Class C0/C1 UAS or privately built <250g',
        'Can fly over uninvolved people',
        'Never fly over assemblies of people',
        'Max height 120m AGL'
      ],
      maxWeight: 0.9, // kg for C1
      maxAltitude: 120, // meters
      requiresAuthorization: false
    },
    open_a2: {
      id: 'open_a2',
      name: 'Open Category A2',
      description: 'Fly close to people',
      subcategory: 'A2',
      requirements: [
        'A1/A3 competency + additional exam',
        'Class C2 UAS',
        'Maintain 30m from uninvolved people (5m in low-speed mode)',
        'Never fly over assemblies of people',
        'Max height 120m AGL'
      ],
      maxWeight: 4, // kg for C2
      maxAltitude: 120, // meters
      requiresAuthorization: false
    },
    open_a3: {
      id: 'open_a3',
      name: 'Open Category A3',
      description: 'Fly far from people',
      subcategory: 'A3',
      requirements: [
        'Online training and exam',
        'Class C2/C3/C4 UAS or privately built <25kg',
        'Fly 150m away from residential/commercial areas',
        'Max height 120m AGL'
      ],
      maxWeight: 25, // kg for C3/C4
      maxAltitude: 120, // meters
      requiresAuthorization: false
    },
    specific_sta: {
      id: 'specific_sta',
      name: 'Specific Category (Standard Scenario)',
      description: 'Predefined standard scenarios',
      requirements: [
        'Declaration to competent authority',
        'Operator registration',
        'Remote pilot competency for scenario',
        'Comply with scenario limitations'
      ],
      scenarios: ['STS-01 (VLOS over controlled area)', 'STS-02 (BVLOS over sparsely populated)'],
      requiresAuthorization: false // Declaration only
    },
    specific_pdra: {
      id: 'specific_pdra',
      name: 'Specific Category (PDRA)',
      description: 'Pre-defined risk assessment scenarios',
      requirements: [
        'Operational authorization from authority',
        'PDRA compliance',
        'Operations manual',
        'Operator registration'
      ],
      requiresAuthorization: true
    },
    specific_sora: {
      id: 'specific_sora',
      name: 'Specific Category (SORA)',
      description: 'Full SORA risk assessment',
      requirements: [
        'Complete SORA assessment',
        'Operational authorization from authority',
        'Detailed operations manual',
        'Mitigations per SAIL level'
      ],
      requiresAuthorization: true
    },
    certified: {
      id: 'certified',
      name: 'Certified Category',
      description: 'High-risk operations requiring certification',
      requirements: [
        'Certified UAS',
        'Licensed remote pilot',
        'Certified operator',
        'Operational authorization'
      ],
      examples: ['Passenger transport', 'Dangerous goods', 'Over assemblies'],
      requiresAuthorization: true
    }
  },

  faa: {
    // FAA categories (Part 107)
    part107: {
      id: 'part107',
      name: 'Part 107 Standard',
      description: 'Standard small UAS operations',
      requirements: [
        'Remote Pilot Certificate',
        'Aircraft registration (if >0.55 lbs)',
        'Fly in Class G airspace (or with authorization)',
        'Keep aircraft in sight (VLOS)',
        'Fly below 400 ft AGL',
        'Maximum groundspeed 100 mph',
        'Daytime operations only (or civil twilight with anti-collision lighting)',
        'No flight over people',
        'No flight from moving vehicle'
      ],
      maxWeight: 55, // lbs (25 kg)
      maxAltitude: 400, // ft AGL
      maxSpeed: 100, // mph
      requiresWaiver: false
    },
    part107_waiver: {
      id: 'part107_waiver',
      name: 'Part 107 with Waiver',
      description: 'Operations requiring waiver from standard rules',
      requirements: [
        'Part 107 Remote Pilot Certificate',
        'Approved waiver from FAA',
        'Compliance with waiver conditions',
        'Risk mitigations as specified'
      ],
      waiverTypes: [
        'Night operations',
        'Over people',
        'Beyond visual line of sight',
        'Operations from moving vehicle',
        'Multiple aircraft',
        'Altitude above 400 ft'
      ],
      requiresWaiver: true
    },
    part107_over_people: {
      id: 'part107_over_people',
      name: 'Part 107 Operations Over People',
      description: 'Flight over people categories',
      categories: [
        {
          name: 'Category 1',
          maxWeight: 0.55, // lbs
          description: 'No exposed rotating parts'
        },
        {
          name: 'Category 2',
          description: 'Must not cause injury exceeding 11 ft-lbs kinetic energy'
        },
        {
          name: 'Category 3',
          description: 'No open-air assembly, operator control over area'
        },
        {
          name: 'Category 4',
          description: 'Airworthiness certificate required'
        }
      ],
      requiresWaiver: false // Built into updated Part 107
    },
    part91: {
      id: 'part91',
      name: 'Part 91 (Public/Governmental)',
      description: 'Governmental UAS operations',
      requirements: [
        'COA from FAA',
        'Governmental entity operator',
        'Compliance with COA terms'
      ],
      requiresWaiver: false // COA instead
    }
  }
}

// ============================================
// OPERATION TYPES BY AUTHORITY
// ============================================

export const OPERATION_TYPES = {
  tc: [
    { id: 'vlos', name: 'Visual Line of Sight (VLOS)', description: 'Pilot can see the drone at all times' },
    { id: 'evlos', name: 'Extended VLOS (EVLOS)', description: 'Using visual observers to extend range' },
    { id: 'bvlos', name: 'Beyond Visual Line of Sight (BVLOS)', description: 'Drone operated beyond visual range', requiresSFOC: true },
    { id: 'night', name: 'Night Operations', description: 'Operations during nighttime', requiresSFOC: true },
    { id: 'over_people', name: 'Over People', description: 'Flight directly over non-participants', requiresSFOC: true }
  ],
  easa: [
    { id: 'vlos', name: 'Visual Line of Sight (VLOS)', description: 'Pilot can see the drone at all times' },
    { id: 'evlos', name: 'Extended VLOS (EVLOS)', description: 'Using visual observers' },
    { id: 'bvlos', name: 'Beyond Visual Line of Sight (BVLOS)', description: 'Drone operated beyond visual range', requiresSpecific: true },
    { id: 'night', name: 'Night Operations', description: 'Operations during nighttime' },
    { id: 'over_people', name: 'Over People', description: 'Flight over uninvolved people' },
    { id: 'over_assemblies', name: 'Over Assemblies', description: 'Flight over gatherings of people', requiresCertified: true }
  ],
  faa: [
    { id: 'vlos', name: 'Visual Line of Sight (VLOS)', description: 'Pilot can see the drone at all times' },
    { id: 'bvlos', name: 'Beyond Visual Line of Sight (BVLOS)', description: 'Drone operated beyond visual range', requiresWaiver: true },
    { id: 'night', name: 'Night Operations', description: 'Operations at night (civil twilight with lights allowed)' },
    { id: 'over_people', name: 'Over People', description: 'Flight over non-participants', categories: ['Cat 1', 'Cat 2', 'Cat 3', 'Cat 4'] },
    { id: 'moving_vehicle', name: 'From Moving Vehicle', description: 'Launch/control from moving vehicle', requiresWaiver: true }
  ]
}

// ============================================
// AIRSPACE CLASSES BY AUTHORITY
// ============================================

export const AIRSPACE_CLASSES = {
  tc: [
    { id: 'class_a', name: 'Class A', controlled: true, requiresAuth: true, description: 'High-altitude IFR only' },
    { id: 'class_b', name: 'Class B', controlled: true, requiresAuth: true, description: 'Major airports' },
    { id: 'class_c', name: 'Class C', controlled: true, requiresAuth: true, description: 'Busy airports' },
    { id: 'class_d', name: 'Class D', controlled: true, requiresAuth: true, description: 'Airports with tower' },
    { id: 'class_e', name: 'Class E', controlled: true, requiresAuth: true, description: 'Controlled airspace below Class A' },
    { id: 'class_f', name: 'Class F', controlled: false, requiresAuth: false, description: 'Special use (advisory/restricted)' },
    { id: 'class_g', name: 'Class G', controlled: false, requiresAuth: false, description: 'Uncontrolled airspace' }
  ],
  easa: [
    { id: 'controlled', name: 'Controlled Airspace', controlled: true, requiresAuth: true, description: 'ATC authorization required' },
    { id: 'uncontrolled', name: 'Uncontrolled Airspace', controlled: false, requiresAuth: false, description: 'No ATC authorization needed' },
    { id: 'u_space', name: 'U-space', controlled: true, requiresAuth: true, description: 'Designated UAS traffic management areas' }
  ],
  faa: [
    { id: 'class_a', name: 'Class A', controlled: true, requiresAuth: true, description: '18,000 ft MSL and above' },
    { id: 'class_b', name: 'Class B', controlled: true, requiresAuth: true, description: 'Major airports (LAANC available)' },
    { id: 'class_c', name: 'Class C', controlled: true, requiresAuth: true, description: 'Busy airports (LAANC available)' },
    { id: 'class_d', name: 'Class D', controlled: true, requiresAuth: true, description: 'Airports with tower (LAANC available)' },
    { id: 'class_e', name: 'Class E', controlled: true, requiresAuth: true, description: 'Controlled airspace (some LAANC)' },
    { id: 'class_g', name: 'Class G', controlled: false, requiresAuth: false, description: 'Uncontrolled airspace' }
  ]
}

// ============================================
// PILOT CERTIFICATION REQUIREMENTS
// ============================================

export const PILOT_REQUIREMENTS = {
  tc: {
    basic: {
      name: 'Basic Pilot Certificate',
      minAge: 14,
      requirements: ['Pass Basic exam (online)', 'Review study materials'],
      validFor: 'Indefinite (with recurrency)',
      recurrency: '24 months flight review'
    },
    advanced: {
      name: 'Advanced Pilot Certificate',
      minAge: 16,
      requirements: ['Pass Advanced exam (in-person)', 'Flight review with instructor'],
      validFor: 'Indefinite (with recurrency)',
      recurrency: '24 months flight review'
    }
  },
  easa: {
    a1a3: {
      name: 'A1/A3 Competency',
      minAge: null, // Varies by member state
      requirements: ['Complete online training', 'Pass online exam'],
      validFor: '5 years',
      recurrency: 'Refresher training before expiry'
    },
    a2: {
      name: 'A2 Certificate of Competency',
      minAge: null,
      requirements: ['Hold A1/A3', 'Self-practical training', 'Pass A2 theory exam'],
      validFor: '5 years',
      recurrency: 'Refresher training before expiry'
    },
    sts: {
      name: 'STS Competency',
      minAge: null,
      requirements: ['Specific training for scenario', 'Theory and practical exam'],
      validFor: 'As specified in declaration',
      recurrency: 'As per scenario requirements'
    }
  },
  faa: {
    part107: {
      name: 'Remote Pilot Certificate',
      minAge: 16,
      requirements: [
        'Pass aeronautical knowledge test (Part 107)',
        'TSA background check',
        'English proficiency'
      ],
      validFor: '24 months',
      recurrency: 'Recurrent knowledge test every 24 months'
    },
    recreational: {
      name: 'Recreational Flyer',
      minAge: null,
      requirements: ['Pass TRUST exam (online)', 'Follow recreational guidelines'],
      validFor: 'Indefinite',
      recurrency: 'None (TRUST is one-time)'
    }
  }
}

// ============================================
// REGISTRATION REQUIREMENTS
// ============================================

export const REGISTRATION_REQUIREMENTS = {
  tc: {
    required: true,
    threshold: 0.25, // kg - drones 250g+ must register
    fee: 5, // CAD
    validity: 'Indefinite',
    markingRequired: true,
    url: 'https://tc.canada.ca/en/aviation/drone-safety/register-your-drone'
  },
  easa: {
    required: true,
    threshold: 0.25, // kg - varies, some need below this
    fee: null, // Varies by member state
    validity: 'Varies by member state',
    markingRequired: true,
    operatorRegistration: true,
    url: 'https://www.easa.europa.eu/domains/drones-air-mobility'
  },
  faa: {
    required: true,
    threshold: 0.25, // kg (0.55 lbs)
    fee: 5, // USD
    validity: '3 years',
    markingRequired: true,
    url: 'https://faadronezone.faa.gov/'
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get regulatory authority by ID
 * @param {string} authorityId - Authority ID (tc, easa, faa)
 * @returns {Object|null}
 */
export function getAuthority(authorityId) {
  return REGULATORY_AUTHORITIES[authorityId] || null
}

/**
 * Get operation categories for an authority
 * @param {string} authorityId - Authority ID
 * @returns {Object}
 */
export function getOperationCategories(authorityId) {
  return OPERATION_CATEGORIES[authorityId] || {}
}

/**
 * Get operation types for an authority
 * @param {string} authorityId - Authority ID
 * @returns {Array}
 */
export function getOperationTypes(authorityId) {
  return OPERATION_TYPES[authorityId] || []
}

/**
 * Get airspace classes for an authority
 * @param {string} authorityId - Authority ID
 * @returns {Array}
 */
export function getAirspaceClasses(authorityId) {
  return AIRSPACE_CLASSES[authorityId] || []
}

/**
 * Get pilot requirements for an authority
 * @param {string} authorityId - Authority ID
 * @returns {Object}
 */
export function getPilotRequirements(authorityId) {
  return PILOT_REQUIREMENTS[authorityId] || {}
}

/**
 * Get registration requirements for an authority
 * @param {string} authorityId - Authority ID
 * @returns {Object}
 */
export function getRegistrationRequirements(authorityId) {
  return REGISTRATION_REQUIREMENTS[authorityId] || {}
}

/**
 * Determine if operation requires special authorization
 * @param {string} authorityId - Authority ID
 * @param {string} categoryId - Operation category ID
 * @returns {boolean}
 */
export function requiresAuthorization(authorityId, categoryId) {
  const categories = OPERATION_CATEGORIES[authorityId]
  if (!categories) return false

  const category = categories[categoryId]
  if (!category) return false

  return category.requiresSFOC ||
         category.requiresAuthorization ||
         category.requiresWaiver ||
         false
}

/**
 * Get all authorities as array for dropdowns
 * @returns {Array}
 */
export function getAuthoritiesArray() {
  return Object.values(REGULATORY_AUTHORITIES)
}

/**
 * Map operation type across authorities
 * @param {string} operationType - Operation type (e.g., 'bvlos')
 * @param {string} fromAuthority - Source authority
 * @param {string} toAuthority - Target authority
 * @returns {Object|null} Equivalent operation type or null
 */
export function mapOperationType(operationType, fromAuthority, toAuthority) {
  const targetTypes = OPERATION_TYPES[toAuthority]
  if (!targetTypes) return null

  return targetTypes.find(t => t.id === operationType) || null
}
