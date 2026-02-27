/**
 * Master Rate Card Data
 *
 * Central library of all billable line items with editable pricing.
 * Organized by category for easy navigation and project integration.
 *
 * @version 1.0.0
 */

// Rate card categories with metadata
export const RATE_CARD_CATEGORIES = {
  'personnel-pic': {
    id: 'personnel-pic',
    name: 'Personnel - PIC',
    description: 'Pilot in Command rates for various operation types',
    icon: 'UserCheck',
    color: 'blue'
  },
  'personnel-field': {
    id: 'personnel-field',
    name: 'Personnel - Field',
    description: 'Field crew roles and support personnel',
    icon: 'Users',
    color: 'green'
  },
  'personnel-travel': {
    id: 'personnel-travel',
    name: 'Personnel - Travel',
    description: 'Travel day rates (50% of field rates)',
    icon: 'Car',
    color: 'slate'
  },
  'personnel-office': {
    id: 'personnel-office',
    name: 'Personnel - Office',
    description: 'Office and management personnel',
    icon: 'Building2',
    color: 'indigo'
  },
  'mob-demob': {
    id: 'mob-demob',
    name: 'Mobilization / Demobilization',
    description: 'Setup and teardown fees by complexity',
    icon: 'Truck',
    color: 'orange'
  },
  'equipment-rpas-small': {
    id: 'equipment-rpas-small',
    name: 'Equipment - RPAS <25kg',
    description: 'Small RPAS systems under 25kg',
    icon: 'Plane',
    color: 'sky'
  },
  'equipment-rpas-medium': {
    id: 'equipment-rpas-medium',
    name: 'Equipment - RPAS 25-150kg',
    description: 'Medium RPAS systems 25-150kg',
    icon: 'Plane',
    color: 'cyan'
  },
  'equipment-water': {
    id: 'equipment-water',
    name: 'Equipment - Water',
    description: 'Watercraft for marine and river operations',
    icon: 'Ship',
    color: 'blue'
  },
  'equipment-sensors': {
    id: 'equipment-sensors',
    name: 'Equipment - Sensors',
    description: 'Payloads and sensor systems',
    icon: 'Camera',
    color: 'purple'
  },
  'services-consulting': {
    id: 'services-consulting',
    name: 'Services - Consulting',
    description: 'Consulting, planning, and regulatory services',
    icon: 'FileText',
    color: 'violet'
  },
  'services-training': {
    id: 'services-training',
    name: 'Services - Training',
    description: 'Training and certification services',
    icon: 'GraduationCap',
    color: 'amber'
  },
  'services-field': {
    id: 'services-field',
    name: 'Services - Field Operations',
    description: 'Field service packages and operations',
    icon: 'MapPin',
    color: 'emerald'
  },
  'data-processing': {
    id: 'data-processing',
    name: 'Data Processing',
    description: 'Data processing and analysis services',
    icon: 'Database',
    color: 'teal'
  },
  'deliverables': {
    id: 'deliverables',
    name: 'Deliverables',
    description: 'Output products and deliverable items',
    icon: 'Package',
    color: 'pink'
  },
  'specialized': {
    id: 'specialized',
    name: 'Specialized Operations',
    description: 'Emergency response and specialized services',
    icon: 'AlertTriangle',
    color: 'red'
  },
  'insurance': {
    id: 'insurance',
    name: 'Insurance',
    description: 'Project and operational insurance coverage',
    icon: 'Shield',
    color: 'lime'
  },
  'travel-expenses': {
    id: 'travel-expenses',
    name: 'Travel & Expenses',
    description: 'Travel, accommodations, and reimbursables',
    icon: 'Receipt',
    color: 'stone'
  }
}

// Default rate card items - these are the baseline rates
// Actual rates are stored in Firestore per organization
export const DEFAULT_RATE_CARD_ITEMS = [
  // ========== PERSONNEL - PIC ==========
  {
    id: 'pic-basic',
    category: 'personnel-pic',
    name: 'Pilot in Command - Basic',
    description: 'Certified PIC for standard VLOS operations',
    pricingOptions: ['hourly', 'half-day', 'day', 'week'],
    baseUnit: 'day',
    rates: {
      hourly: 225,
      halfDay: 900,
      day: 1500,
      week: 6750  // 5 days × 4.5x
    },
    notes: 'Week rate = 5 days at 4.5x daily',
    isActive: true
  },
  {
    id: 'pic-advanced',
    category: 'personnel-pic',
    name: 'Pilot in Command - Advanced',
    description: 'PIC for advanced operations (EVLOS, complex airspace)',
    pricingOptions: ['hourly', 'half-day', 'day', 'week'],
    baseUnit: 'day',
    rates: {
      hourly: 265,
      halfDay: 1050,
      day: 1750,
      week: 7875
    },
    notes: 'Week rate = 5 days at 4.5x daily',
    isActive: true
  },
  {
    id: 'pic-complex',
    category: 'personnel-pic',
    name: 'Pilot in Command - Complex',
    description: 'PIC for BVLOS, high-altitude, or complex regulatory operations',
    pricingOptions: ['hourly', 'half-day', 'day', 'week'],
    baseUnit: 'day',
    rates: {
      hourly: 310,
      halfDay: 1230,
      day: 2050,
      week: 9225
    },
    notes: 'Week rate = 5 days at 4.5x daily',
    isActive: true
  },
  {
    id: 'pic-specialized',
    category: 'personnel-pic',
    name: 'Pilot in Command - Specialized',
    description: 'PIC tasked with piloting specialized vessels or platforms',
    pricingOptions: ['hourly', 'half-day', 'day', 'week'],
    baseUnit: 'day',
    rates: {
      hourly: 375,
      halfDay: 1500,
      day: 2500,
      week: 11250
    },
    notes: 'Week rate = 5 days at 4.5x daily',
    isActive: true
  },

  // ========== PERSONNEL - FIELD ==========
  {
    id: 'visual-observer',
    category: 'personnel-field',
    name: 'Visual Observer',
    description: 'Maintains VLOS with RPAS, monitors airspace',
    pricingOptions: ['hourly', 'half-day', 'day', 'week'],
    baseUnit: 'day',
    rates: {
      hourly: 135,
      halfDay: 540,
      day: 900,
      week: 4050
    },
    isActive: true
  },
  {
    id: 'ground-supervisor',
    category: 'personnel-field',
    name: 'Ground Supervisor',
    description: 'Site management, bystander control, ground operations',
    pricingOptions: ['hourly', 'half-day', 'day', 'week'],
    baseUnit: 'day',
    rates: {
      hourly: 180,
      halfDay: 720,
      day: 1200,
      week: 5400
    },
    isActive: true
  },
  {
    id: 'payload-operator',
    category: 'personnel-field',
    name: 'Payload Operator',
    description: 'Operation of specialized sensors and payloads',
    pricingOptions: ['hourly', 'half-day', 'day', 'week'],
    baseUnit: 'day',
    rates: {
      hourly: 165,
      halfDay: 660,
      day: 1100,
      week: 4950
    },
    isActive: true
  },
  {
    id: 'field-biologist',
    category: 'personnel-field',
    name: 'Field Biologist',
    description: 'Wildlife expertise, species ID, behavioral monitoring',
    pricingOptions: ['hourly', 'half-day', 'day', 'week'],
    baseUnit: 'day',
    rates: {
      hourly: 180,
      halfDay: 720,
      day: 1200,
      week: 5400
    },
    isActive: true
  },
  {
    id: 'mmo',
    category: 'personnel-field',
    name: 'Marine Mammal Observer (MMO)',
    description: 'Wildlife disturbance monitoring, DFO compliance',
    pricingOptions: ['hourly', 'half-day', 'day', 'week'],
    baseUnit: 'day',
    rates: {
      hourly: 150,
      halfDay: 600,
      day: 1000,
      week: 4500
    },
    isActive: true
  },
  {
    id: 'hse-officer',
    category: 'personnel-field',
    name: 'HSE Officer',
    description: 'Health, Safety, and Environment oversight in field',
    pricingOptions: ['hourly', 'half-day', 'day', 'week'],
    baseUnit: 'day',
    rates: {
      hourly: 180,
      halfDay: 720,
      day: 1200,
      week: 5400
    },
    isActive: true
  },
  {
    id: 'boat-operator',
    category: 'personnel-field',
    name: 'Boat Operator',
    description: 'Operation of watercraft for marine/river operations',
    pricingOptions: ['hourly', 'half-day', 'day', 'week'],
    baseUnit: 'day',
    rates: {
      hourly: 150,
      halfDay: 600,
      day: 1000,
      week: 4500
    },
    isActive: true
  },
  {
    id: 'field-technician',
    category: 'personnel-field',
    name: 'Field Technician',
    description: 'General field support, equipment handling, logistics',
    pricingOptions: ['hourly', 'half-day', 'day', 'week'],
    baseUnit: 'day',
    rates: {
      hourly: 115,
      halfDay: 450,
      day: 750,
      week: 3375
    },
    isActive: true
  },

  // ========== PERSONNEL - TRAVEL ==========
  {
    id: 'pic-basic-travel',
    category: 'personnel-travel',
    name: 'PIC - Basic - Travel',
    description: 'Travel day rate (50% of field rate)',
    pricingOptions: ['day'],
    baseUnit: 'day',
    rates: { day: 750 },
    isActive: true
  },
  {
    id: 'pic-advanced-travel',
    category: 'personnel-travel',
    name: 'PIC - Advanced - Travel',
    description: 'Travel day rate (50% of field rate)',
    pricingOptions: ['day'],
    baseUnit: 'day',
    rates: { day: 875 },
    isActive: true
  },
  {
    id: 'pic-complex-travel',
    category: 'personnel-travel',
    name: 'PIC - Complex - Travel',
    description: 'Travel day rate (50% of field rate)',
    pricingOptions: ['day'],
    baseUnit: 'day',
    rates: { day: 1025 },
    isActive: true
  },
  {
    id: 'pic-specialized-travel',
    category: 'personnel-travel',
    name: 'PIC - Specialized - Travel',
    description: 'Travel day rate (50% of field rate)',
    pricingOptions: ['day'],
    baseUnit: 'day',
    rates: { day: 1250 },
    isActive: true
  },
  {
    id: 'vo-travel',
    category: 'personnel-travel',
    name: 'Visual Observer - Travel',
    description: 'Travel day rate (50% of field rate)',
    pricingOptions: ['day'],
    baseUnit: 'day',
    rates: { day: 450 },
    isActive: true
  },
  {
    id: 'gs-travel',
    category: 'personnel-travel',
    name: 'Ground Supervisor - Travel',
    description: 'Travel day rate (50% of field rate)',
    pricingOptions: ['day'],
    baseUnit: 'day',
    rates: { day: 600 },
    isActive: true
  },
  {
    id: 'po-travel',
    category: 'personnel-travel',
    name: 'Payload Operator - Travel',
    description: 'Travel day rate (50% of field rate)',
    pricingOptions: ['day'],
    baseUnit: 'day',
    rates: { day: 550 },
    isActive: true
  },
  {
    id: 'ft-travel',
    category: 'personnel-travel',
    name: 'Field Technician - Travel',
    description: 'Travel day rate (50% of field rate)',
    pricingOptions: ['day'],
    baseUnit: 'day',
    rates: { day: 375 },
    isActive: true
  },

  // ========== PERSONNEL - OFFICE ==========
  {
    id: 'project-manager',
    category: 'personnel-office',
    name: 'Project Manager',
    description: 'Project planning, scheduling, resource allocation, client liaison',
    pricingOptions: ['hourly', 'half-day', 'day', 'monthly'],
    baseUnit: 'day',
    rates: {
      hourly: 195,
      halfDay: 780,
      day: 1300,
      monthly: 22000
    },
    isActive: true
  },
  {
    id: 'hse-planning-officer',
    category: 'personnel-office',
    name: 'HSE Planning Officer',
    description: 'Safety planning, risk assessment, compliance documentation',
    pricingOptions: ['hourly', 'half-day', 'day', 'per-deliverable'],
    baseUnit: 'day',
    rates: {
      hourly: 180,
      halfDay: 720,
      day: 1200
    },
    isActive: true
  },
  {
    id: 'compliance-officer',
    category: 'personnel-office',
    name: 'Compliance Officer',
    description: 'Regulatory compliance, TC liaison, permit management',
    pricingOptions: ['hourly', 'half-day', 'day', 'per-application'],
    baseUnit: 'day',
    rates: {
      hourly: 195,
      halfDay: 780,
      day: 1300
    },
    isActive: true
  },
  {
    id: 'technical-officer',
    category: 'personnel-office',
    name: 'Technical Officer',
    description: 'Technical specifications, equipment selection, QA',
    pricingOptions: ['hourly', 'half-day', 'day', 'per-review'],
    baseUnit: 'day',
    rates: {
      hourly: 180,
      halfDay: 720,
      day: 1200
    },
    isActive: true
  },
  {
    id: 'logistics-coordinator',
    category: 'personnel-office',
    name: 'Logistics Coordinator',
    description: 'Mobilization planning, shipping, travel coordination',
    pricingOptions: ['hourly', 'half-day', 'day', 'per-project'],
    baseUnit: 'day',
    rates: {
      hourly: 145,
      halfDay: 570,
      day: 950
    },
    isActive: true
  },
  {
    id: 'rpas-ops-planner',
    category: 'personnel-office',
    name: 'RPAS Operations Planner',
    description: 'Flight planning, airspace coordination, mission planning',
    pricingOptions: ['hourly', 'half-day', 'day', 'per-mission'],
    baseUnit: 'day',
    rates: {
      hourly: 180,
      halfDay: 720,
      day: 1200
    },
    isActive: true
  },
  {
    id: 'data-analyst-gis',
    category: 'personnel-office',
    name: 'Data Analyst / GIS Specialist',
    description: 'Data processing, analysis, deliverable production',
    pricingOptions: ['hourly', 'day', 'per-gb', 'per-hectare', 'per-deliverable'],
    baseUnit: 'day',
    rates: {
      hourly: 165,
      day: 1100
    },
    isActive: true
  },

  // ========== MOB/DEMOB ==========
  {
    id: 'mob-local',
    category: 'mob-demob',
    name: 'Mobilization - Local',
    description: 'Preparation for projects within 100km',
    pricingOptions: ['fixed'],
    baseUnit: 'each',
    rates: { fixed: 500 },
    isActive: true
  },
  {
    id: 'mob-standard',
    category: 'mob-demob',
    name: 'Mobilization - Standard',
    description: 'Preparation of RPAS and equipment for regional project',
    pricingOptions: ['fixed'],
    baseUnit: 'each',
    rates: { fixed: 1040 },
    isActive: true
  },
  {
    id: 'mob-complex',
    category: 'mob-demob',
    name: 'Mobilization - Complex Integration',
    description: 'Integration of specialized payloads (ADCP, sonar, etc.)',
    pricingOptions: ['fixed'],
    baseUnit: 'each',
    rates: { fixed: 1500 },
    isActive: true
  },
  {
    id: 'mob-remote',
    category: 'mob-demob',
    name: 'Mobilization - Remote/Arctic',
    description: 'Mobilization with logistics for remote locations incl. shipping',
    pricingOptions: ['fixed'],
    baseUnit: 'each',
    rates: { fixed: 1500 },
    notes: 'Plus shipping at cost',
    isActive: true
  },
  {
    id: 'demob-standard',
    category: 'mob-demob',
    name: 'Demobilization - Standard',
    description: 'Breakdown, packing, equipment return',
    pricingOptions: ['fixed'],
    baseUnit: 'each',
    rates: { fixed: 1040 },
    isActive: true
  },
  {
    id: 'demob-complex',
    category: 'mob-demob',
    name: 'Demobilization - Complex',
    description: 'Demobilization of all equipment including specialized gear',
    pricingOptions: ['fixed'],
    baseUnit: 'each',
    rates: { fixed: 1500 },
    isActive: true
  },

  // ========== EQUIPMENT - RPAS <25kg ==========
  {
    id: 'rpas-standard-small',
    category: 'equipment-rpas-small',
    name: 'RPAS System - Standard (<25kg)',
    description: 'Standard commercial RPAS (DJI M350, Autel, etc.)',
    pricingOptions: ['day', 'week', 'project'],
    baseUnit: 'day',
    rates: {
      day: 730,
      week: 2920  // 5d × 4x
    },
    isActive: true
  },
  {
    id: 'rpas-modified-small',
    category: 'equipment-rpas-small',
    name: 'RPAS System - Modified (<25kg)',
    description: 'Commercial RPAS with modifications for specific use',
    pricingOptions: ['day', 'week', 'project'],
    baseUnit: 'day',
    rates: {
      day: 850,
      week: 3400
    },
    isActive: true
  },
  {
    id: 'rpas-custom-small',
    category: 'equipment-rpas-small',
    name: 'RPAS System - Custom (<25kg)',
    description: 'Purpose-built or heavily customized RPAS system',
    pricingOptions: ['day', 'week', 'project'],
    baseUnit: 'day',
    rates: {
      day: 1100,
      week: 4400
    },
    isActive: true
  },
  {
    id: 'rpas-backup-small',
    category: 'equipment-rpas-small',
    name: 'Backup RPAS System (<25kg)',
    description: 'Secondary/backup RPAS for redundancy',
    pricingOptions: ['day', 'week'],
    baseUnit: 'day',
    rates: {
      day: 400,
      week: 1600
    },
    isActive: true
  },

  // ========== EQUIPMENT - RPAS 25-150kg ==========
  {
    id: 'rpas-standard-medium',
    category: 'equipment-rpas-medium',
    name: 'RPAS System - Standard (25-150kg)',
    description: 'Standard medium RPAS system',
    pricingOptions: ['day', 'week', 'project'],
    baseUnit: 'day',
    rates: {
      day: 1400,
      week: 5600
    },
    isActive: true
  },
  {
    id: 'rpas-modified-medium',
    category: 'equipment-rpas-medium',
    name: 'RPAS System - Modified (25-150kg)',
    description: 'Medium RPAS with modifications for specific use',
    pricingOptions: ['day', 'week', 'project'],
    baseUnit: 'day',
    rates: {
      day: 1700,
      week: 6800
    },
    isActive: true
  },
  {
    id: 'rpas-custom-medium',
    category: 'equipment-rpas-medium',
    name: 'RPAS System - Custom (25-150kg)',
    description: 'Purpose-built or heavily customized medium RPAS',
    pricingOptions: ['day', 'week', 'project'],
    baseUnit: 'day',
    rates: {
      day: 2200,
      week: 8800
    },
    isActive: true
  },

  // ========== EQUIPMENT - WATER ==========
  {
    id: 'jet-boat',
    category: 'equipment-water',
    name: 'Jet Boat',
    description: 'Motorized jet boat for river operations',
    pricingOptions: ['day', 'week', 'project'],
    baseUnit: 'day',
    rates: {
      day: 850,
      week: 3400
    },
    isActive: true
  },
  {
    id: 'rowing-raft',
    category: 'equipment-water',
    name: 'Rowing Raft',
    description: 'Rowing raft with frame for suitable river conditions',
    pricingOptions: ['day', 'week'],
    baseUnit: 'day',
    rates: {
      day: 250,
      week: 1000
    },
    isActive: true
  },
  {
    id: 'zodiac',
    category: 'equipment-water',
    name: 'Zodiac/Inflatable',
    description: 'Inflatable boat for marine/lake operations',
    pricingOptions: ['day', 'week'],
    baseUnit: 'day',
    rates: {
      day: 400,
      week: 1600
    },
    isActive: true
  },

  // ========== EQUIPMENT - SENSORS ==========
  {
    id: 'lidar-payload',
    category: 'equipment-sensors',
    name: 'LiDAR Payload',
    description: 'LiDAR sensor for point cloud collection',
    pricingOptions: ['day', 'week', 'per-flight-hour'],
    baseUnit: 'day',
    rates: {
      day: 1000,
      week: 4000
    },
    isActive: true
  },
  {
    id: 'thermal-camera',
    category: 'equipment-sensors',
    name: 'Thermal/IR Camera',
    description: 'Thermal/infrared camera payload',
    pricingOptions: ['day', 'week'],
    baseUnit: 'day',
    rates: {
      day: 350,
      week: 1400
    },
    isActive: true
  },
  {
    id: 'rgb-camera-standard',
    category: 'equipment-sensors',
    name: 'RGB Camera (Standard)',
    description: 'Standard RGB camera payload',
    pricingOptions: ['included', 'day'],
    baseUnit: 'day',
    rates: {
      day: 0
    },
    notes: 'Included with RPAS',
    isActive: true
  },
  {
    id: 'rgb-camera-highres',
    category: 'equipment-sensors',
    name: 'RGB Camera (High-Res/Phase One)',
    description: 'High-resolution mapping camera (Phase One, etc.)',
    pricingOptions: ['day', 'week'],
    baseUnit: 'day',
    rates: {
      day: 700,
      week: 2800
    },
    isActive: true
  },
  {
    id: 'multispectral-camera',
    category: 'equipment-sensors',
    name: 'Multispectral Camera',
    description: 'Multispectral sensor for vegetation/environmental analysis',
    pricingOptions: ['day', 'week'],
    baseUnit: 'day',
    rates: {
      day: 450,
      week: 1800
    },
    isActive: true
  },
  {
    id: 'adcp-system',
    category: 'equipment-sensors',
    name: 'ADCP System',
    description: 'Acoustic Doppler Current Profiler for water velocity',
    pricingOptions: ['day', 'week', 'per-survey'],
    baseUnit: 'day',
    rates: {
      day: 600,
      week: 2400
    },
    isActive: true
  },
  {
    id: 'bathymetric-sonar',
    category: 'equipment-sensors',
    name: 'Bathymetric Sonar',
    description: 'Sonar system for bathymetric survey',
    pricingOptions: ['day', 'week', 'per-survey'],
    baseUnit: 'day',
    rates: {
      day: 700,
      week: 2800
    },
    isActive: true
  },
  {
    id: 'sidescan-sonar',
    category: 'equipment-sensors',
    name: 'Side-Scan Sonar',
    description: 'Side-scan sonar for underwater imaging',
    pricingOptions: ['day', 'week', 'per-survey'],
    baseUnit: 'day',
    rates: {
      day: 800,
      week: 3200
    },
    isActive: true
  },
  {
    id: 'gnss-rtk',
    category: 'equipment-sensors',
    name: 'GNSS/RTK Base Station',
    description: 'High-precision GNSS receiver (EMLID RS2 or similar)',
    pricingOptions: ['day', 'week', 'per-project'],
    baseUnit: 'day',
    rates: {
      day: 200,
      week: 800
    },
    isActive: true
  },
  {
    id: 'gcps',
    category: 'equipment-sensors',
    name: 'Ground Control Points (GCPs)',
    description: 'Survey-grade GCP targets - full set',
    pricingOptions: ['per-project', 'per-set'],
    baseUnit: 'set',
    rates: {
      fixed: 100
    },
    isActive: true
  },
  {
    id: 'additional-batteries',
    category: 'equipment-sensors',
    name: 'Additional Batteries',
    description: 'Spare/replacement RPAS batteries',
    pricingOptions: ['per-unit', 'included'],
    baseUnit: 'each',
    rates: {
      perUnit: 315
    },
    isActive: true
  },

  // ========== SERVICES - CONSULTING ==========
  {
    id: 'initial-consultation',
    category: 'services-consulting',
    name: 'Initial Consultation / Scoping',
    description: 'Project scoping, requirements gathering, feasibility assessment',
    pricingOptions: ['hourly', 'fixed'],
    baseUnit: 'hour',
    rates: {
      hourly: 175
    },
    notes: 'Up to 2hr free for qualified leads',
    isActive: true
  },
  {
    id: 'conops-small',
    category: 'services-consulting',
    name: 'CONOPS Development - Small',
    description: 'Simple single-mission type concept of operations',
    pricingOptions: ['fixed'],
    baseUnit: 'project',
    rates: { fixed: 3500 },
    isActive: true
  },
  {
    id: 'conops-medium',
    category: 'services-consulting',
    name: 'CONOPS Development - Medium',
    description: 'Multi-mission CONOPS, moderate complexity',
    pricingOptions: ['fixed'],
    baseUnit: 'project',
    rates: { fixed: 6500 },
    isActive: true
  },
  {
    id: 'conops-large',
    category: 'services-consulting',
    name: 'CONOPS Development - Large',
    description: 'Full program CONOPS - equipment, techniques, procedures',
    pricingOptions: ['fixed'],
    baseUnit: 'project',
    rates: { fixed: 12000 },
    isActive: true
  },
  {
    id: 'site-assessment',
    category: 'services-consulting',
    name: 'Site Assessment',
    description: 'On-site evaluation of operational requirements and constraints',
    pricingOptions: ['half-day', 'day', 'fixed'],
    baseUnit: 'day',
    rates: {
      halfDay: 900,
      day: 1500
    },
    isActive: true
  },
  {
    id: 'rpas-program-dev',
    category: 'services-consulting',
    name: 'RPAS Program Development',
    description: 'Full RPAS program design - SOPs, manuals, training plan',
    pricingOptions: ['fixed'],
    baseUnit: 'project',
    rates: { fixed: 18000 },
    notes: 'Phased milestones',
    isActive: true
  },
  {
    id: 'rpoc-development',
    category: 'services-consulting',
    name: 'RPOC Development / Application',
    description: 'RPAS Operator Certificate application and documentation',
    pricingOptions: ['fixed'],
    baseUnit: 'project',
    rates: { fixed: 15000 },
    isActive: true
  },
  {
    id: 'sfoc-simple',
    category: 'services-consulting',
    name: 'SFOC Preparation - Simple',
    description: 'Standard SFOC extension or renewal',
    pricingOptions: ['fixed'],
    baseUnit: 'each',
    rates: { fixed: 1200 },
    isActive: true
  },
  {
    id: 'sfoc-standard',
    category: 'services-consulting',
    name: 'SFOC Preparation - Standard',
    description: 'New SFOC, moderate complexity',
    pricingOptions: ['fixed'],
    baseUnit: 'each',
    rates: { fixed: 2500 },
    isActive: true
  },
  {
    id: 'sfoc-complex',
    category: 'services-consulting',
    name: 'SFOC Preparation - Complex',
    description: 'BVLOS, multi-site, or novel operations SFOC',
    pricingOptions: ['fixed'],
    baseUnit: 'each',
    rates: { fixed: 4500 },
    isActive: true
  },
  {
    id: 'mission-planning-pkg',
    category: 'services-consulting',
    name: 'Mission Planning Package',
    description: 'Complete mission planning including airspace, risk assessment, procedures',
    pricingOptions: ['fixed', 'per-mission'],
    baseUnit: 'each',
    rates: { fixed: 800 },
    isActive: true
  },
  {
    id: 'dfo-permit-support',
    category: 'services-consulting',
    name: 'DFO Permit Support',
    description: 'DFO permit support for marine mammal/fish operations',
    pricingOptions: ['fixed'],
    baseUnit: 'project',
    rates: { fixed: 3500 },
    isActive: true
  },
  {
    id: 'compliance-review',
    category: 'services-consulting',
    name: 'Regulatory Compliance Review',
    description: 'Review of operations for regulatory compliance',
    pricingOptions: ['hourly', 'fixed', 'per-review'],
    baseUnit: 'hour',
    rates: { hourly: 175 },
    isActive: true
  },

  // ========== SERVICES - TRAINING ==========
  {
    id: 'advanced-rpas-training',
    category: 'services-training',
    name: 'Advanced RPAS Training',
    description: 'Advanced operations training including flight review',
    pricingOptions: ['per-person', 'per-day'],
    baseUnit: 'person',
    rates: {
      perPerson: 1000,
      day: 1500
    },
    isActive: true
  },
  {
    id: 'basic-cert-prep',
    category: 'services-training',
    name: 'Basic Pilot Certification Prep',
    description: 'Preparation for Transport Canada Basic certificate exam',
    pricingOptions: ['per-person', 'group'],
    baseUnit: 'person',
    rates: { perPerson: 500 },
    notes: 'Group rate for 4+ people',
    isActive: true
  },
  {
    id: 'advanced-cert-prep',
    category: 'services-training',
    name: 'Advanced Pilot Certification Prep',
    description: 'Preparation for Transport Canada Advanced certificate exam',
    pricingOptions: ['per-person', 'group'],
    baseUnit: 'person',
    rates: { perPerson: 900 },
    notes: 'Group rate for 4+ people',
    isActive: true
  },
  {
    id: 'l1c-ground-school',
    category: 'services-training',
    name: 'Level 1 Complex Ground School',
    description: 'L1C ground school (20hr) - self-study or instructor-led',
    pricingOptions: ['per-person', 'group'],
    baseUnit: 'person',
    rates: { perPerson: 700 },
    isActive: true
  },
  {
    id: 'flight-review',
    category: 'services-training',
    name: 'Flight Review',
    description: 'Practical flight assessment and review',
    pricingOptions: ['per-person', 'per-session'],
    baseUnit: 'person',
    rates: { perPerson: 500 },
    isActive: true
  },
  {
    id: 'mission-specific-training',
    category: 'services-training',
    name: 'Mission-Specific Training',
    description: 'Custom training for specific mission types (SAR, mapping, etc.)',
    pricingOptions: ['per-person', 'per-day', 'group'],
    baseUnit: 'day',
    rates: { day: 1500 },
    isActive: true
  },
  {
    id: 'vo-crew-training',
    category: 'services-training',
    name: 'VO/Crew Training',
    description: 'Visual Observer and crew member training',
    pricingOptions: ['per-person', 'per-day', 'group'],
    baseUnit: 'person',
    rates: { perPerson: 400 },
    isActive: true
  },
  {
    id: 'custom-course-dev',
    category: 'services-training',
    name: 'Custom Course Development',
    description: 'Development of custom training curriculum',
    pricingOptions: ['fixed'],
    baseUnit: 'project',
    rates: { fixed: 7500 },
    isActive: true
  },
  {
    id: 'onsite-team-training',
    category: 'services-training',
    name: 'On-Site Team Training',
    description: 'Training delivered at client site for team',
    pricingOptions: ['per-day', 'package'],
    baseUnit: 'day',
    rates: { day: 2200 },
    notes: 'Plus per-person fee',
    isActive: true
  },

  // ========== SERVICES - FIELD ==========
  {
    id: 'area-mapping-standard',
    category: 'services-field',
    name: 'Area Mapping - Standard',
    description: 'Photogrammetric mapping of defined area',
    pricingOptions: ['day', 'per-hectare', 'per-km2'],
    baseUnit: 'day',
    rates: { day: 4000 },
    isActive: true
  },
  {
    id: 'area-mapping-highres',
    category: 'services-field',
    name: 'Area Mapping - High Resolution',
    description: 'High-resolution or survey-grade mapping',
    pricingOptions: ['day', 'per-hectare'],
    baseUnit: 'day',
    rates: { day: 5200 },
    isActive: true
  },
  {
    id: 'corridor-mapping',
    category: 'services-field',
    name: 'Corridor Mapping',
    description: 'Linear corridor survey (pipeline, powerline, road)',
    pricingOptions: ['day', 'per-km'],
    baseUnit: 'day',
    rates: { day: 4000 },
    isActive: true
  },
  {
    id: 'wildlife-monitoring-vlos',
    category: 'services-field',
    name: 'Wildlife Monitoring - VLOS',
    description: 'RPAS-based wildlife survey within visual line of sight',
    pricingOptions: ['day', 'per-survey-area'],
    baseUnit: 'day',
    rates: { day: 4500 },
    isActive: true
  },
  {
    id: 'wildlife-monitoring-bvlos',
    category: 'services-field',
    name: 'Wildlife Monitoring - BVLOS',
    description: 'RPAS-based wildlife survey beyond visual line of sight',
    pricingOptions: ['day', 'per-survey-area'],
    baseUnit: 'day',
    rates: { day: 6500 },
    isActive: true
  },
  {
    id: 'structure-inspection',
    category: 'services-field',
    name: 'Structure Inspection',
    description: 'Visual inspection of structures (bridges, towers, etc.)',
    pricingOptions: ['per-structure', 'day', 'half-day'],
    baseUnit: 'each',
    rates: {
      perStructure: 2500,
      day: 4000
    },
    isActive: true
  },
  {
    id: '3d-structure-modelling',
    category: 'services-field',
    name: '3D Structure Modelling',
    description: '3D capture and modelling of structures',
    pricingOptions: ['per-structure', 'day'],
    baseUnit: 'each',
    rates: {
      perStructure: 3500,
      day: 5000
    },
    isActive: true
  },
  {
    id: 'topographic-survey',
    category: 'services-field',
    name: 'Topographic Survey',
    description: 'Terrain survey for elevation/contour mapping',
    pricingOptions: ['day', 'per-hectare', 'per-km2'],
    baseUnit: 'day',
    rates: { day: 4000 },
    isActive: true
  },
  {
    id: 'bathymetric-survey',
    category: 'services-field',
    name: 'Bathymetric Survey',
    description: 'Water depth survey using sonar/ADCP',
    pricingOptions: ['day', 'per-km', 'per-hectare'],
    baseUnit: 'day',
    rates: { day: 5500 },
    isActive: true
  },
  {
    id: 'media-production',
    category: 'services-field',
    name: 'Media/Video Production',
    description: 'Video/photo capture for communications/marketing',
    pricingOptions: ['half-day', 'day', 'per-deliverable'],
    baseUnit: 'day',
    rates: {
      halfDay: 1800,
      day: 3000
    },
    isActive: true
  },
  {
    id: 'sar-support',
    category: 'services-field',
    name: 'SAR Support / Search Operations',
    description: 'Search and rescue or search operations support',
    pricingOptions: ['day', 'hourly', 'callout'],
    baseUnit: 'day',
    rates: {
      day: 4000,
      hourly: 500
    },
    isActive: true
  },

  // ========== DATA PROCESSING ==========
  {
    id: 'orthomosaic-gen',
    category: 'data-processing',
    name: 'Orthomosaic Generation',
    description: 'Flight alignment, dense point cloud, mosaic generation',
    pricingOptions: ['per-collection', 'per-hectare', 'per-gb'],
    baseUnit: 'collection',
    rates: {
      perCollection: 600,
      perHectare: 50
    },
    isActive: true
  },
  {
    id: 'radiometric-calibration',
    category: 'data-processing',
    name: 'Radiometric Calibration',
    description: 'Reflectance panel processing, cross-flight normalization',
    pricingOptions: ['per-collection', 'included'],
    baseUnit: 'collection',
    rates: { perCollection: 300 },
    isActive: true
  },
  {
    id: 'georeferencing-qa',
    category: 'data-processing',
    name: 'Georeferencing & Accuracy QA',
    description: 'RTK/PPK correction, tie point integration, accuracy report',
    pricingOptions: ['per-collection', 'per-project'],
    baseUnit: 'collection',
    rates: { perCollection: 400 },
    isActive: true
  },
  {
    id: 'index-products',
    category: 'data-processing',
    name: 'Index Products (NDVI, NDRE, etc.)',
    description: 'Spectral index generation per client specification',
    pricingOptions: ['per-index', 'per-hectare', 'package'],
    baseUnit: 'each',
    rates: { perIndex: 200 },
    isActive: true
  },
  {
    id: 'lidar-processing',
    category: 'data-processing',
    name: 'LiDAR Point Cloud Processing',
    description: 'LiDAR data processing, classification, and filtering',
    pricingOptions: ['day', 'per-km2', 'per-gb'],
    baseUnit: 'day',
    rates: { day: 1500 },
    isActive: true
  },
  {
    id: 'dem-generation',
    category: 'data-processing',
    name: 'DEM/DTM/DSM Generation',
    description: 'Elevation model creation from photogrammetry or LiDAR',
    pricingOptions: ['per-collection', 'per-km2', 'included'],
    baseUnit: 'collection',
    rates: { perCollection: 400 },
    isActive: true
  },
  {
    id: 'volumetric-calcs',
    category: 'data-processing',
    name: 'Volumetric Calculations',
    description: 'Stockpile/cut-fill volume analysis',
    pricingOptions: ['per-stockpile', 'per-project', 'day'],
    baseUnit: 'each',
    rates: { perStockpile: 400 },
    isActive: true
  },
  {
    id: 'change-detection',
    category: 'data-processing',
    name: 'Change Detection Analysis',
    description: 'Multi-temporal comparison and change mapping',
    pricingOptions: ['per-comparison', 'per-hectare', 'day'],
    baseUnit: 'each',
    rates: { perComparison: 600 },
    isActive: true
  },
  {
    id: 'processing-qaqc',
    category: 'data-processing',
    name: 'Processing QA/QC',
    description: 'Gap analysis, coverage verification, artifact identification',
    pricingOptions: ['per-collection', 'included', 'percentage'],
    baseUnit: 'collection',
    rates: {},
    notes: 'Typically 15% of processing or included',
    isActive: true
  },
  {
    id: 'data-packaging',
    category: 'data-processing',
    name: 'Data Packaging & Delivery',
    description: 'File organization, metadata, coordinate system verification',
    pricingOptions: ['included', 'per-project', 'per-gb'],
    baseUnit: 'project',
    rates: {},
    notes: 'Usually included, per-GB for large datasets',
    isActive: true
  },
  {
    id: 'post-mission-analysis',
    category: 'data-processing',
    name: 'Post-Mission Data Analysis',
    description: 'Flight logs, data interpretation, client assistance',
    pricingOptions: ['day', 'hourly', 'per-project'],
    baseUnit: 'day',
    rates: {
      day: 1250,
      hourly: 175
    },
    isActive: true
  },
  {
    id: 'rush-processing',
    category: 'data-processing',
    name: 'Rush Processing',
    description: 'Expedited processing with priority turnaround',
    pricingOptions: ['multiplier'],
    baseUnit: 'multiplier',
    rates: {
      standard: 1.5,
      urgent: 2.0
    },
    notes: 'Standard +50%, Urgent +100%',
    isActive: true
  },

  // ========== DELIVERABLES ==========
  {
    id: 'orthomosaic-deliverable',
    category: 'deliverables',
    name: 'Orthomosaic Map',
    description: 'Georeferenced orthomosaic imagery product',
    pricingOptions: ['included', 'standalone'],
    baseUnit: 'each',
    rates: { standalone: 800 },
    notes: 'Usually included in processing',
    isActive: true
  },
  {
    id: 'dem-deliverable',
    category: 'deliverables',
    name: 'Digital Elevation Model (DEM)',
    description: 'Terrain or surface model',
    pricingOptions: ['included', 'standalone'],
    baseUnit: 'each',
    rates: { standalone: 500 },
    isActive: true
  },
  {
    id: 'pointcloud-deliverable',
    category: 'deliverables',
    name: 'Point Cloud Dataset',
    description: 'Classified point cloud (photogrammetric or LiDAR)',
    pricingOptions: ['included', 'standalone'],
    baseUnit: 'each',
    rates: { standalone: 700 },
    isActive: true
  },
  {
    id: '3d-model-deliverable',
    category: 'deliverables',
    name: '3D Model / Mesh',
    description: 'Photogrammetric 3D mesh or textured model',
    pricingOptions: ['per-model', 'fixed'],
    baseUnit: 'each',
    rates: { perModel: 1200 },
    isActive: true
  },
  {
    id: 'video-raw',
    category: 'deliverables',
    name: 'Video - Raw Footage',
    description: 'Unedited video footage as captured',
    pricingOptions: ['included', 'per-flight'],
    baseUnit: 'each',
    rates: {},
    notes: 'Usually included',
    isActive: true
  },
  {
    id: 'video-basic-edit',
    category: 'deliverables',
    name: 'Video - Basic Edit',
    description: 'Basic editing, color correction, titles',
    pricingOptions: ['fixed', 'per-minute'],
    baseUnit: 'each',
    rates: { fixed: 350 },
    isActive: true
  },
  {
    id: 'video-full-production',
    category: 'deliverables',
    name: 'Video - Full Production',
    description: 'Full editing with graphics, music, effects',
    pricingOptions: ['fixed', 'per-minute', 'hourly'],
    baseUnit: 'each',
    rates: { fixed: 750 },
    isActive: true
  },
  {
    id: 'report-summary',
    category: 'deliverables',
    name: 'Technical Report - Summary',
    description: 'Brief summary report of methodology and findings',
    pricingOptions: ['included', 'fixed'],
    baseUnit: 'each',
    rates: {},
    notes: 'Usually included in project',
    isActive: true
  },
  {
    id: 'report-comprehensive',
    category: 'deliverables',
    name: 'Technical Report - Comprehensive',
    description: 'Detailed report with full methodology, analysis, recommendations',
    pricingOptions: ['fixed', 'day'],
    baseUnit: 'each',
    rates: { fixed: 1500 },
    isActive: true
  },
  {
    id: 'flight-log-pkg',
    category: 'deliverables',
    name: 'Flight Log Package',
    description: 'Complete flight documentation and records',
    pricingOptions: ['included'],
    baseUnit: 'each',
    rates: {},
    notes: 'Included',
    isActive: true
  },
  {
    id: 'raw-data-archive',
    category: 'deliverables',
    name: 'Raw Data Archive',
    description: 'All raw imagery, sensor data, metadata',
    pricingOptions: ['included', 'per-gb'],
    baseUnit: 'each',
    rates: {},
    notes: 'Included, per-GB for archival',
    isActive: true
  },
  {
    id: 'web-map-portal',
    category: 'deliverables',
    name: 'Web Map / Portal Access',
    description: 'Online interactive map viewer access',
    pricingOptions: ['per-month', 'per-year', 'fixed'],
    baseUnit: 'month',
    rates: {
      perMonth: 200,
      perYear: 2000
    },
    isActive: true
  },

  // ========== SPECIALIZED ==========
  {
    id: 'emergency-activation',
    category: 'specialized',
    name: 'Emergency Response - Activation',
    description: 'Rapid deployment callout for emergency situations',
    pricingOptions: ['callout', 'callout-hourly', 'callout-day'],
    baseUnit: 'callout',
    rates: {
      callout: 500
    },
    notes: 'Plus hourly or day rate',
    isActive: true
  },
  {
    id: 'emergency-operations',
    category: 'specialized',
    name: 'Emergency Response - Operations',
    description: 'Active emergency response operations',
    pricingOptions: ['hourly', 'day'],
    baseUnit: 'day',
    rates: {
      hourly: 350,
      day: 2500
    },
    notes: 'Premium rates',
    isActive: true
  },
  {
    id: 'wildfire-support',
    category: 'specialized',
    name: 'Wildfire Support',
    description: 'RPAS operations in support of wildfire response',
    pricingOptions: ['day', 'per-assignment'],
    baseUnit: 'day',
    rates: { day: 3500 },
    notes: 'Premium rates',
    isActive: true
  },
  {
    id: 'standby-oncall',
    category: 'specialized',
    name: 'Standby / On-Call',
    description: 'On-call availability for rapid deployment',
    pricingOptions: ['daily', 'weekly'],
    baseUnit: 'day',
    rates: {
      daily: 600,
      weekly: 2400
    },
    isActive: true
  },
  {
    id: 'after-hours',
    category: 'specialized',
    name: 'After-Hours Operations',
    description: 'Operations outside standard business hours',
    pricingOptions: ['multiplier'],
    baseUnit: 'multiplier',
    rates: { multiplier: 1.35 },
    notes: 'Standard rate +35%',
    isActive: true
  },
  {
    id: 'weather-standby',
    category: 'specialized',
    name: 'Weather Delay / Standby (On-Site)',
    description: 'On-site standby due to weather or client delays',
    pricingOptions: ['day'],
    baseUnit: 'day',
    rates: { day: 800 },
    notes: '50% of day rate',
    isActive: true
  },

  // ========== INSURANCE ==========
  {
    id: 'insurance-standard',
    category: 'insurance',
    name: 'Insurance - Standard Project',
    description: 'Task-specific RPAS liability coverage',
    pricingOptions: ['per-project', 'per-day'],
    baseUnit: 'project',
    rates: {
      perProject: 3000,
      perDay: 150
    },
    isActive: true
  },
  {
    id: 'insurance-bvlos',
    category: 'insurance',
    name: 'Insurance - BVLOS/High Risk',
    description: 'Enhanced insurance for BVLOS/complex operations',
    pricingOptions: ['per-project', 'quoted'],
    baseUnit: 'project',
    rates: { perProject: 5200 },
    isActive: true
  },
  {
    id: 'insurance-extended',
    category: 'insurance',
    name: 'Insurance - Extended/Long-Term',
    description: 'Coverage for projects exceeding 30 days',
    pricingOptions: ['per-month', 'per-project'],
    baseUnit: 'month',
    rates: { perMonth: 4500 },
    isActive: true
  },

  // ========== TRAVEL & EXPENSES ==========
  {
    id: 'mileage',
    category: 'travel-expenses',
    name: 'Mileage',
    description: 'Vehicle usage per WorkSafe BC guidelines',
    pricingOptions: ['per-km'],
    baseUnit: 'km',
    rates: { perKm: 0.70 },
    isActive: true
  },
  {
    id: 'per-diem',
    category: 'travel-expenses',
    name: 'Per Diem',
    description: 'Daily meal and incidental allowance',
    pricingOptions: ['per-person-day'],
    baseUnit: 'person/day',
    rates: { perPersonDay: 80 },
    isActive: true
  },
  {
    id: 'accommodations-standard',
    category: 'travel-expenses',
    name: 'Accommodations - Standard',
    description: 'Standard hotel/lodging',
    pricingOptions: ['at-cost', 'estimated'],
    baseUnit: 'night',
    rates: { estimated: 200 },
    notes: 'At cost + 15% admin',
    isActive: true
  },
  {
    id: 'accommodations-remote',
    category: 'travel-expenses',
    name: 'Accommodations - Remote/Camp',
    description: 'Remote camp or field accommodation',
    pricingOptions: ['at-cost', 'estimated'],
    baseUnit: 'night',
    rates: { estimated: 350 },
    notes: 'At cost + 15% admin',
    isActive: true
  },
  {
    id: 'flights-domestic',
    category: 'travel-expenses',
    name: 'Flights - Domestic',
    description: 'Domestic airfare',
    pricingOptions: ['at-cost', 'estimated'],
    baseUnit: 'round-trip',
    rates: { estimated: 800 },
    notes: 'At cost + 15% admin',
    isActive: true
  },
  {
    id: 'flights-charter',
    category: 'travel-expenses',
    name: 'Flights - Remote/Charter',
    description: 'Remote or charter flights',
    pricingOptions: ['at-cost'],
    baseUnit: 'trip',
    rates: {},
    notes: 'At cost + 15% admin',
    isActive: true
  },
  {
    id: 'ground-transport',
    category: 'travel-expenses',
    name: 'Ground Transport - Rental',
    description: 'Vehicle rental',
    pricingOptions: ['at-cost', 'estimated'],
    baseUnit: 'day',
    rates: { estimated: 125 },
    notes: 'At cost + 15% admin',
    isActive: true
  },
  {
    id: 'ferry-watertaxi',
    category: 'travel-expenses',
    name: 'Ferry/Water Taxi',
    description: 'Ferry or water taxi costs',
    pricingOptions: ['at-cost'],
    baseUnit: 'trip',
    rates: {},
    notes: 'At cost + 15% admin',
    isActive: true
  },
  {
    id: 'fuel-field',
    category: 'travel-expenses',
    name: 'Fuel - Field Operations',
    description: 'Fuel for boats, generators, support vehicles',
    pricingOptions: ['at-cost'],
    baseUnit: 'lump-sum',
    rates: {},
    notes: 'At cost + 15% admin',
    isActive: true
  },
  {
    id: 'shipping-equipment',
    category: 'travel-expenses',
    name: 'Shipping - Equipment',
    description: 'Freight/shipping for equipment',
    pricingOptions: ['at-cost'],
    baseUnit: 'lump-sum',
    rates: {},
    notes: 'At cost + 15% admin, estimated by weight/distance',
    isActive: true
  },
  {
    id: 'shipping-dg',
    category: 'travel-expenses',
    name: 'Shipping - Dangerous Goods (Batteries)',
    description: 'DG shipping for LiPo batteries',
    pricingOptions: ['at-cost'],
    baseUnit: 'shipment',
    rates: {},
    notes: 'At cost + 15% admin',
    isActive: true
  }
]

// Helper functions
export function getRateCardItemsByCategory(categoryId) {
  return DEFAULT_RATE_CARD_ITEMS.filter(item => item.category === categoryId)
}

export function getRateCardItem(itemId) {
  return DEFAULT_RATE_CARD_ITEMS.find(item => item.id === itemId)
}

export function getAllCategories() {
  return Object.values(RATE_CARD_CATEGORIES)
}

export function getCategoryById(categoryId) {
  return RATE_CARD_CATEGORIES[categoryId]
}

// Calculate price based on rate type and quantity
export function calculateItemPrice(item, rateType, quantity = 1, organizationRates = null) {
  // Use organization-specific rates if provided, otherwise use defaults
  const rates = organizationRates || item.rates

  const rate = rates[rateType] || 0
  return rate * quantity
}

export default DEFAULT_RATE_CARD_ITEMS
