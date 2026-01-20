/**
 * PolicyLibrary.jsx
 * Searchable Policy & Procedure Library with full CRUD support
 *
 * Features:
 * - Firestore-backed policy management
 * - Create, edit, delete policies
 * - File attachments via Firebase Storage
 * - Search functionality
 * - Category filter chips
 * - List/grid toggle view
 * - Sort by number/title/date
 * - Policy detail modal with edit/delete
 * - Review status badges (active/due/overdue)
 * - Loading skeleton UI
 *
 * Exports:
 * - POLICIES: Array of seed policy objects (for migration)
 * - getStatusInfo: Function to calculate policy review status
 *
 * @location src/components/PolicyLibrary.jsx
 */

import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Grid,
  List,
  FileText,
  Book,
  HardHat,
  Users,
  ChevronRight,
  X,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plane,
  Loader2,
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  History,
  Bell,
  Settings
} from 'lucide-react'
import PolicyEditor from './policies/PolicyEditor'
import { getPoliciesEnhanced, deletePolicyEnhanced } from '../lib/firestorePolicies'
import { usePolicyPermissions, usePendingAcknowledgments } from '../hooks/usePolicyPermissions'
import { useAuth } from '../contexts/AuthContext'

// ============================================
// POLICY DATA
// ============================================

export const POLICIES = [
  // RPAS Operations (1001-1012)
  {
    id: 'pol-1001',
    number: '1001',
    title: 'RPAS Operations Policy',
    category: 'rpas',
    description: 'Establishes the framework for all remotely piloted aircraft system operations, defining responsibilities, authorization requirements, and operational standards.',
    version: '3.0',
    effectiveDate: '2025-01-15',
    reviewDate: '2026-01-15',
    owner: 'Chief Pilot',
    status: 'active',
    keywords: ['operations', 'framework', 'authorization', 'standards', 'rpas', 'drone'],
    relatedPolicies: ['1002', '1003', '1009'],
    regulatoryRefs: ['CARs 901', 'CARs 903', 'SFOC Guidelines'],
    sections: [
      'Purpose and Scope',
      'Responsibilities',
      'Authorization Requirements',
      'Operational Categories',
      'Training Requirements',
      'Documentation',
      'Compliance Monitoring'
    ]
  },
  {
    id: 'pol-1002',
    number: '1002',
    title: 'Flight Authorization Procedure',
    category: 'rpas',
    description: 'Defines the process for obtaining internal flight authorization, including risk assessment review, crew qualification verification, and operational approval.',
    version: '2.1',
    effectiveDate: '2024-09-01',
    reviewDate: '2025-09-01',
    owner: 'Operations Manager',
    status: 'active',
    keywords: ['authorization', 'approval', 'risk assessment', 'flight', 'permission'],
    relatedPolicies: ['1001', '1005', '1006'],
    regulatoryRefs: ['CARs 901.71', 'CARs 903.03'],
    sections: [
      'Authorization Request Process',
      'Risk Assessment Requirements',
      'Crew Qualification Verification',
      'Site Survey Requirements',
      'Approval Authority Matrix',
      'Documentation Requirements'
    ]
  },
  {
    id: 'pol-1003',
    number: '1003',
    title: 'Airspace Authorization',
    category: 'rpas',
    description: 'Procedures for obtaining airspace authorization from NAV CANADA and operating in controlled airspace, including NOTAM requirements.',
    version: '2.0',
    effectiveDate: '2024-06-15',
    reviewDate: '2025-06-15',
    owner: 'Chief Pilot',
    status: 'active',
    keywords: ['airspace', 'NAV CANADA', 'controlled', 'authorization', 'ATC'],
    relatedPolicies: ['1001', '1004'],
    regulatoryRefs: ['CARs 901.64', 'CARs 901.65', 'NAV CANADA RPAS Guidelines'],
    sections: [
      'Airspace Classification Overview',
      'Authorization Requirements by Class',
      'NAV CANADA Application Process',
      'NOTAM Procedures',
      'Real-time Coordination',
      'Emergency Procedures'
    ]
  },
  {
    id: 'pol-1004',
    number: '1004',
    title: 'NOTAM Procedures',
    category: 'rpas',
    description: 'Procedures for filing, managing, and monitoring NOTAMs for drone operations, including timing requirements and coordination protocols.',
    version: '1.5',
    effectiveDate: '2024-08-01',
    reviewDate: '2025-08-01',
    owner: 'Operations Manager',
    status: 'active',
    keywords: ['NOTAM', 'notice', 'airmen', 'filing', 'airspace'],
    relatedPolicies: ['1003'],
    regulatoryRefs: ['CARs 602.73', 'NAV CANADA NOTAM Manual'],
    sections: [
      'NOTAM Requirements',
      'Filing Procedures',
      'Timing Requirements',
      'Content Standards',
      'Monitoring and Updates',
      'Cancellation Procedures'
    ]
  },
  {
    id: 'pol-1005',
    number: '1005',
    title: 'Weather Minimums and Limitations',
    category: 'rpas',
    description: 'Defines weather minimums for safe operations, including visibility, wind, precipitation, and temperature limitations for different aircraft types.',
    version: '2.2',
    effectiveDate: '2024-11-01',
    reviewDate: '2025-11-01',
    owner: 'Chief Pilot',
    status: 'active',
    keywords: ['weather', 'minimums', 'wind', 'visibility', 'conditions', 'limitations'],
    relatedPolicies: ['1002', '1006'],
    regulatoryRefs: ['CARs 901.22', 'Manufacturer Limitations'],
    sections: [
      'Weather Assessment Requirements',
      'Visibility Minimums',
      'Wind Limitations',
      'Precipitation Restrictions',
      'Temperature Limits',
      'Weather Monitoring During Operations'
    ]
  },
  {
    id: 'pol-1006',
    number: '1006',
    title: 'Emergency Procedures',
    category: 'rpas',
    description: 'Standard emergency procedures for RPAS operations including flyaways, loss of control link, battery emergencies, and collision response.',
    version: '3.1',
    effectiveDate: '2024-12-01',
    reviewDate: '2025-06-01',
    owner: 'Chief Pilot',
    status: 'active',
    keywords: ['emergency', 'flyaway', 'loss of link', 'battery', 'collision', 'procedures'],
    relatedPolicies: ['1001', '1007'],
    regulatoryRefs: ['CARs 901.73', 'Transport Canada Advisory Circulars'],
    sections: [
      'Emergency Classification',
      'Flyaway Procedures',
      'Loss of Control Link',
      'Low Battery Emergency',
      'Collision/Near-Miss Response',
      'Post-Emergency Reporting'
    ]
  },
  {
    id: 'pol-1007',
    number: '1007',
    title: 'Incident Reporting',
    category: 'rpas',
    description: 'Requirements and procedures for reporting safety incidents, accidents, and near-misses, including Transport Canada notification requirements.',
    version: '2.0',
    effectiveDate: '2024-07-01',
    reviewDate: '2025-07-01',
    owner: 'Safety Manager',
    status: 'active',
    keywords: ['incident', 'accident', 'reporting', 'notification', 'safety', 'near-miss'],
    relatedPolicies: ['1006', '1045', '1046'],
    regulatoryRefs: ['CARs 901.75', 'TSB Regulations'],
    sections: [
      'Reportable Events Definition',
      'Internal Reporting Process',
      'Transport Canada Notification',
      'TSB Notification Requirements',
      'Investigation Procedures',
      'Documentation Requirements'
    ]
  },
  {
    id: 'pol-1008',
    number: '1008',
    title: 'Aircraft Registration',
    category: 'rpas',
    description: 'Procedures for registering and marking RPAS with Transport Canada, including renewal requirements and record keeping.',
    version: '1.3',
    effectiveDate: '2024-03-01',
    reviewDate: '2025-03-01',
    owner: 'Operations Manager',
    status: 'due',
    keywords: ['registration', 'marking', 'Transport Canada', 'aircraft', 'renewal'],
    relatedPolicies: ['1009'],
    regulatoryRefs: ['CARs 901.03', 'CARs 901.05'],
    sections: [
      'Registration Requirements',
      'Marking Requirements',
      'Registration Process',
      'Renewal Procedures',
      'Record Keeping',
      'Fleet Management'
    ]
  },
  {
    id: 'pol-1009',
    number: '1009',
    title: 'Aircraft Maintenance',
    category: 'rpas',
    description: 'Maintenance requirements, inspection schedules, and airworthiness standards for the RPAS fleet, including pre-flight and periodic inspections.',
    version: '2.5',
    effectiveDate: '2024-10-15',
    reviewDate: '2025-10-15',
    owner: 'Maintenance Manager',
    status: 'active',
    keywords: ['maintenance', 'inspection', 'airworthiness', 'pre-flight', 'periodic'],
    relatedPolicies: ['1001', '1008'],
    regulatoryRefs: ['CARs 901.29', 'Manufacturer Maintenance Manuals'],
    sections: [
      'Maintenance Philosophy',
      'Pre-flight Inspection',
      'Periodic Inspection Schedule',
      'Component Life Limits',
      'Maintenance Documentation',
      'Defect Reporting and Rectification'
    ]
  },
  {
    id: 'pol-1010',
    number: '1010',
    title: 'Pilot Certification',
    category: 'rpas',
    description: 'Requirements for pilot certification, currency, and proficiency, including Basic and Advanced certificate requirements.',
    version: '2.1',
    effectiveDate: '2024-05-01',
    reviewDate: '2025-05-01',
    owner: 'Chief Pilot',
    status: 'active',
    keywords: ['certification', 'pilot', 'basic', 'advanced', 'currency', 'proficiency'],
    relatedPolicies: ['1001', '1011'],
    regulatoryRefs: ['CARs 901.54', 'CARs 901.55', 'CARs 901.56'],
    sections: [
      'Certification Requirements',
      'Basic vs Advanced Operations',
      'Currency Requirements',
      'Proficiency Standards',
      'Recertification Process',
      'Record Keeping'
    ]
  },
  {
    id: 'pol-1011',
    number: '1011',
    title: 'Flight Review Program',
    category: 'rpas',
    description: 'Internal flight review program for maintaining pilot proficiency, including annual check requirements and remedial training.',
    version: '1.8',
    effectiveDate: '2024-04-01',
    reviewDate: '2025-04-01',
    owner: 'Chief Pilot',
    status: 'active',
    keywords: ['flight review', 'proficiency', 'check', 'annual', 'training'],
    relatedPolicies: ['1010'],
    regulatoryRefs: ['CARs 901.57'],
    sections: [
      'Flight Review Requirements',
      'Review Schedule',
      'Evaluation Criteria',
      'Remedial Training',
      'Documentation',
      'Examiner Qualifications'
    ]
  },
  {
    id: 'pol-1012',
    number: '1012',
    title: 'SFOC Operations',
    category: 'rpas',
    description: 'Procedures for conducting operations under Special Flight Operations Certificates, including application process and compliance requirements.',
    version: '2.3',
    effectiveDate: '2024-08-15',
    reviewDate: '2025-08-15',
    owner: 'Chief Pilot',
    status: 'active',
    keywords: ['SFOC', 'special', 'operations', 'certificate', 'Transport Canada'],
    relatedPolicies: ['1001', '1002', '1003'],
    regulatoryRefs: ['CARs 903', 'Transport Canada SFOC Guidelines'],
    sections: [
      'SFOC Requirements',
      'Application Process',
      'Operational Conditions',
      'Compliance Monitoring',
      'Reporting Requirements',
      'Renewal Process'
    ]
  },
  
  // CRM Policies (1013-1021)
  {
    id: 'pol-1013',
    number: '1013',
    title: 'Crew Resource Management',
    category: 'crm',
    description: 'CRM principles and practices for RPAS operations, including communication, decision making, and situational awareness.',
    version: '2.0',
    effectiveDate: '2024-06-01',
    reviewDate: '2025-06-01',
    owner: 'Chief Pilot',
    status: 'active',
    keywords: ['CRM', 'crew', 'resource', 'management', 'communication', 'teamwork'],
    relatedPolicies: ['1014', '1017', '1018'],
    regulatoryRefs: ['Transport Canada CRM Guidelines', 'ICAO Doc 9995'],
    sections: [
      'CRM Principles',
      'Communication Standards',
      'Situational Awareness',
      'Workload Management',
      'Team Coordination',
      'Error Management'
    ]
  },
  {
    id: 'pol-1014',
    number: '1014',
    title: 'Briefing and Debriefing',
    category: 'crm',
    description: 'Requirements for pre-flight briefings, operational briefings, and post-flight debriefings to ensure effective crew coordination.',
    version: '1.7',
    effectiveDate: '2024-05-15',
    reviewDate: '2025-05-15',
    owner: 'Operations Manager',
    status: 'active',
    keywords: ['briefing', 'debriefing', 'pre-flight', 'post-flight', 'coordination'],
    relatedPolicies: ['1013', '1015'],
    regulatoryRefs: ['CARs 901.71'],
    sections: [
      'Pre-Flight Briefing Requirements',
      'Briefing Content Standards',
      'Operational Briefings',
      'Debriefing Process',
      'Lessons Learned Documentation',
      'Briefing Checklists'
    ]
  },
  {
    id: 'pol-1015',
    number: '1015',
    title: 'Visual Observer Procedures',
    category: 'crm',
    description: 'Requirements, responsibilities, and procedures for visual observers supporting RPAS operations.',
    version: '2.2',
    effectiveDate: '2024-07-01',
    reviewDate: '2025-07-01',
    owner: 'Chief Pilot',
    status: 'active',
    keywords: ['visual observer', 'VO', 'spotter', 'EVLOS', 'procedures'],
    relatedPolicies: ['1013', '1016', '1021'],
    regulatoryRefs: ['CARs 901.70', 'CARs 901.71'],
    sections: [
      'Visual Observer Requirements',
      'Qualifications and Training',
      'Communication Protocols',
      'Positioning Requirements',
      'Handover Procedures',
      'Documentation'
    ]
  },
  {
    id: 'pol-1016',
    number: '1016',
    title: 'Crew Composition',
    category: 'crm',
    description: 'Requirements for crew composition based on operation type, complexity, and risk level.',
    version: '1.5',
    effectiveDate: '2024-04-01',
    reviewDate: '2025-04-01',
    owner: 'Operations Manager',
    status: 'active',
    keywords: ['crew', 'composition', 'staffing', 'roles', 'requirements'],
    relatedPolicies: ['1013', '1015'],
    regulatoryRefs: ['CARs 901.69'],
    sections: [
      'Minimum Crew Requirements',
      'Role Definitions',
      'Complexity-Based Staffing',
      'Qualification Matrix',
      'Crew Assignment Process',
      'Substitution Procedures'
    ]
  },
  {
    id: 'pol-1017',
    number: '1017',
    title: 'Aeronautical Decision Making',
    category: 'crm',
    description: 'Framework for aeronautical decision making including the FORDEC model and risk-based decision processes.',
    version: '2.1',
    effectiveDate: '2024-09-01',
    reviewDate: '2025-09-01',
    owner: 'Chief Pilot',
    status: 'active',
    keywords: ['decision making', 'FORDEC', 'ADM', 'risk', 'judgment'],
    relatedPolicies: ['1013', '1018'],
    regulatoryRefs: ['Transport Canada ADM Guidelines'],
    sections: [
      'Decision Making Framework',
      'FORDEC Model',
      'Risk Assessment Integration',
      'Go/No-Go Decisions',
      'In-Flight Decision Making',
      'Post-Decision Review'
    ]
  },
  {
    id: 'pol-1018',
    number: '1018',
    title: 'Threat and Error Management',
    category: 'crm',
    description: 'TEM model implementation for identifying, managing, and mitigating threats and errors in RPAS operations.',
    version: '1.8',
    effectiveDate: '2024-10-01',
    reviewDate: '2025-10-01',
    owner: 'Safety Manager',
    status: 'active',
    keywords: ['TEM', 'threat', 'error', 'management', 'safety'],
    relatedPolicies: ['1013', '1017'],
    regulatoryRefs: ['ICAO Doc 9995', 'Transport Canada SMS Guidelines'],
    sections: [
      'TEM Model Overview',
      'Threat Identification',
      'Error Classification',
      'Countermeasures',
      'Undesired Aircraft States',
      'TEM Training Requirements'
    ]
  },
  {
    id: 'pol-1019',
    number: '1019',
    title: 'Fatigue Risk Management',
    category: 'crm',
    description: 'Fatigue risk management system including duty time limitations, rest requirements, and fatigue reporting.',
    version: '2.0',
    effectiveDate: '2024-11-15',
    reviewDate: '2025-11-15',
    owner: 'Operations Manager',
    status: 'active',
    keywords: ['fatigue', 'duty time', 'rest', 'FRMS', 'hours'],
    relatedPolicies: ['1020'],
    regulatoryRefs: ['Transport Canada FRMS Guidelines'],
    sections: [
      'Fatigue Risk Factors',
      'Duty Time Limitations',
      'Rest Requirements',
      'Fatigue Reporting',
      'Scheduling Considerations',
      'Fatigue Countermeasures'
    ]
  },
  {
    id: 'pol-1020',
    number: '1020',
    title: 'Fitness for Duty',
    category: 'crm',
    description: 'Requirements for crew fitness for duty including medical fitness, substance use policy, and self-assessment.',
    version: '1.6',
    effectiveDate: '2024-08-01',
    reviewDate: '2025-08-01',
    owner: 'Operations Manager',
    status: 'active',
    keywords: ['fitness', 'duty', 'medical', 'IMSAFE', 'impairment'],
    relatedPolicies: ['1019'],
    regulatoryRefs: ['CARs 602.02', 'Transport Canada Guidelines'],
    sections: [
      'Fitness Standards',
      'IMSAFE Checklist',
      'Medical Requirements',
      'Substance Use Policy',
      'Self-Declaration',
      'Return to Duty Process'
    ]
  },
  {
    id: 'pol-1021',
    number: '1021',
    title: 'Communication Procedures',
    category: 'crm',
    description: 'Standard communication procedures for crew coordination, including radio procedures and emergency communications.',
    version: '1.9',
    effectiveDate: '2024-06-15',
    reviewDate: '2025-06-15',
    owner: 'Chief Pilot',
    status: 'active',
    keywords: ['communication', 'radio', 'procedures', 'crew', 'coordination'],
    relatedPolicies: ['1013', '1015'],
    regulatoryRefs: ['CARs 901.71'],
    sections: [
      'Communication Standards',
      'Radio Procedures',
      'Crew Communication',
      'External Communications',
      'Emergency Communications',
      'Communication Equipment'
    ]
  },
  
  // HSE Policies (1022-1045)
  {
    id: 'pol-1022',
    number: '1022',
    title: 'Health and Safety Policy',
    category: 'hse',
    description: 'Overarching health and safety policy establishing commitment, responsibilities, and HSE management system framework.',
    version: '3.0',
    effectiveDate: '2025-01-01',
    reviewDate: '2026-01-01',
    owner: 'HSE Manager',
    status: 'active',
    keywords: ['health', 'safety', 'policy', 'HSE', 'OHS', 'management'],
    relatedPolicies: ['1023', '1024'],
    regulatoryRefs: ['OH&S Act', 'COR Requirements'],
    sections: [
      'Policy Statement',
      'Management Commitment',
      'Responsibilities',
      'HSE Management System',
      'Performance Monitoring',
      'Continuous Improvement'
    ]
  },
  {
    id: 'pol-1023',
    number: '1023',
    title: 'Hazard Identification and Risk Assessment',
    category: 'hse',
    description: 'Procedures for identifying workplace hazards and conducting risk assessments using the 5x5 risk matrix.',
    version: '2.4',
    effectiveDate: '2024-09-01',
    reviewDate: '2025-09-01',
    owner: 'HSE Manager',
    status: 'active',
    keywords: ['hazard', 'HIRA', 'risk assessment', 'matrix', 'identification'],
    relatedPolicies: ['1022', '1024'],
    regulatoryRefs: ['OH&S Act', 'COR Requirements', 'CSA Z1002'],
    sections: [
      'Hazard Identification Process',
      'Risk Assessment Methodology',
      '5x5 Risk Matrix',
      'Risk Ranking and Prioritization',
      'Control Measures',
      'Documentation Requirements'
    ]
  },
  {
    id: 'pol-1024',
    number: '1024',
    title: 'Site Safety',
    category: 'hse',
    description: 'Site-specific safety requirements including site setup, hazard controls, and safe work practices for field operations.',
    version: '2.1',
    effectiveDate: '2024-07-15',
    reviewDate: '2025-07-15',
    owner: 'HSE Manager',
    status: 'active',
    keywords: ['site', 'safety', 'field', 'setup', 'controls'],
    relatedPolicies: ['1022', '1023', '1025'],
    regulatoryRefs: ['OH&S Act', 'COR Requirements'],
    sections: [
      'Site Assessment',
      'Site Setup Requirements',
      'Exclusion Zones',
      'Signage Requirements',
      'Traffic Management',
      'Site Inspections'
    ]
  },
  {
    id: 'pol-1025',
    number: '1025',
    title: 'Personal Protective Equipment',
    category: 'hse',
    description: 'PPE requirements, selection, use, maintenance, and training for all operational activities.',
    version: '2.0',
    effectiveDate: '2024-06-01',
    reviewDate: '2025-06-01',
    owner: 'HSE Manager',
    status: 'active',
    keywords: ['PPE', 'protective', 'equipment', 'safety gear', 'protection'],
    relatedPolicies: ['1024'],
    regulatoryRefs: ['OH&S Act', 'CSA Standards'],
    sections: [
      'PPE Requirements by Task',
      'Selection Criteria',
      'Use and Limitations',
      'Inspection and Maintenance',
      'Training Requirements',
      'Procurement Standards'
    ]
  },
  {
    id: 'pol-1026',
    number: '1026',
    title: 'Emergency Response Plan',
    category: 'hse',
    description: 'Emergency response procedures for medical emergencies, fires, severe weather, and other emergency situations.',
    version: '2.5',
    effectiveDate: '2024-10-01',
    reviewDate: '2025-04-01',
    owner: 'HSE Manager',
    status: 'active',
    keywords: ['emergency', 'response', 'plan', 'ERP', 'evacuation'],
    relatedPolicies: ['1006', '1027', '1028'],
    regulatoryRefs: ['OH&S Act', 'Fire Code'],
    sections: [
      'Emergency Classification',
      'Response Procedures',
      'Evacuation Procedures',
      'Emergency Contacts',
      'Emergency Equipment',
      'Drill Requirements'
    ]
  },
  {
    id: 'pol-1027',
    number: '1027',
    title: 'First Aid',
    category: 'hse',
    description: 'First aid requirements, equipment, training, and response procedures for workplace injuries.',
    version: '1.8',
    effectiveDate: '2024-05-01',
    reviewDate: '2025-05-01',
    owner: 'HSE Manager',
    status: 'active',
    keywords: ['first aid', 'medical', 'injury', 'treatment', 'kit'],
    relatedPolicies: ['1026'],
    regulatoryRefs: ['OH&S Act', 'First Aid Regulation'],
    sections: [
      'First Aid Requirements',
      'Training Standards',
      'First Aid Kit Contents',
      'Response Procedures',
      'Record Keeping',
      'Medical Transportation'
    ]
  },
  {
    id: 'pol-1028',
    number: '1028',
    title: 'Fire Prevention and Response',
    category: 'hse',
    description: 'Fire prevention measures, fire fighting equipment, and emergency response procedures for fire incidents.',
    version: '1.6',
    effectiveDate: '2024-04-15',
    reviewDate: '2025-04-15',
    owner: 'HSE Manager',
    status: 'active',
    keywords: ['fire', 'prevention', 'extinguisher', 'response', 'LiPo'],
    relatedPolicies: ['1026'],
    regulatoryRefs: ['Fire Code', 'NFPA Standards'],
    sections: [
      'Fire Prevention Measures',
      'LiPo Battery Safety',
      'Fire Fighting Equipment',
      'Fire Response Procedures',
      'Evacuation',
      'Post-Fire Procedures'
    ]
  },
  {
    id: 'pol-1029',
    number: '1029',
    title: 'Vehicle Safety',
    category: 'hse',
    description: 'Vehicle safety requirements including inspections, safe driving practices, and incident response.',
    version: '1.5',
    effectiveDate: '2024-03-01',
    reviewDate: '2025-03-01',
    owner: 'HSE Manager',
    status: 'due',
    keywords: ['vehicle', 'driving', 'safety', 'inspection', 'fleet'],
    relatedPolicies: ['1024'],
    regulatoryRefs: ['Traffic Safety Act', 'Company Fleet Policy'],
    sections: [
      'Vehicle Inspection Requirements',
      'Safe Driving Practices',
      'Journey Management',
      'Loading and Securing',
      'Incident Response',
      'Maintenance Requirements'
    ]
  },
  {
    id: 'pol-1030',
    number: '1030',
    title: 'Working at Heights',
    category: 'hse',
    description: 'Safety requirements for working at heights including fall protection, equipment, and rescue procedures.',
    version: '1.7',
    effectiveDate: '2024-06-01',
    reviewDate: '2025-06-01',
    owner: 'HSE Manager',
    status: 'active',
    keywords: ['heights', 'fall protection', 'ladder', 'scaffold', 'rescue'],
    relatedPolicies: ['1025'],
    regulatoryRefs: ['OH&S Act', 'Fall Protection Code'],
    sections: [
      'Working at Heights Definition',
      'Fall Protection Requirements',
      'Equipment Standards',
      'Training Requirements',
      'Rescue Procedures',
      'Inspection Requirements'
    ]
  },
  {
    id: 'pol-1031',
    number: '1031',
    title: 'Hazardous Materials',
    category: 'hse',
    description: 'Handling, storage, and disposal of hazardous materials including batteries, fuels, and chemicals.',
    version: '2.0',
    effectiveDate: '2024-08-01',
    reviewDate: '2025-08-01',
    owner: 'HSE Manager',
    status: 'active',
    keywords: ['hazmat', 'hazardous', 'materials', 'WHMIS', 'SDS', 'battery'],
    relatedPolicies: ['1028', '1032'],
    regulatoryRefs: ['WHMIS Regulations', 'TDG Act'],
    sections: [
      'WHMIS Requirements',
      'SDS Management',
      'Storage Requirements',
      'Handling Procedures',
      'Spill Response',
      'Disposal Procedures'
    ]
  },
  {
    id: 'pol-1032',
    number: '1032',
    title: 'Environmental Protection',
    category: 'hse',
    description: 'Environmental protection measures including spill prevention, waste management, and environmental incident response.',
    version: '1.8',
    effectiveDate: '2024-07-01',
    reviewDate: '2025-07-01',
    owner: 'HSE Manager',
    status: 'active',
    keywords: ['environmental', 'protection', 'spill', 'waste', 'pollution'],
    relatedPolicies: ['1031'],
    regulatoryRefs: ['Environmental Protection Act', 'Spill Reporting Regulation'],
    sections: [
      'Environmental Responsibilities',
      'Spill Prevention',
      'Waste Management',
      'Spill Response',
      'Reporting Requirements',
      'Remediation Procedures'
    ]
  },
  {
    id: 'pol-1033',
    number: '1033',
    title: 'Noise Management',
    category: 'hse',
    description: 'Noise exposure assessment, hearing protection, and noise management for operations in noisy environments.',
    version: '1.4',
    effectiveDate: '2024-05-15',
    reviewDate: '2025-05-15',
    owner: 'HSE Manager',
    status: 'active',
    keywords: ['noise', 'hearing', 'protection', 'exposure', 'decibels'],
    relatedPolicies: ['1025'],
    regulatoryRefs: ['OH&S Act', 'Noise Exposure Regulation'],
    sections: [
      'Noise Exposure Limits',
      'Assessment Requirements',
      'Hearing Protection',
      'Engineering Controls',
      'Monitoring',
      'Training'
    ]
  },
  {
    id: 'pol-1034',
    number: '1034',
    title: 'Heat and Cold Stress',
    category: 'hse',
    description: 'Prevention and management of heat and cold stress for outdoor operations in extreme temperatures.',
    version: '1.6',
    effectiveDate: '2024-04-01',
    reviewDate: '2025-04-01',
    owner: 'HSE Manager',
    status: 'active',
    keywords: ['heat', 'cold', 'stress', 'temperature', 'thermal', 'hypothermia'],
    relatedPolicies: ['1025', '1035'],
    regulatoryRefs: ['OH&S Act', 'ACGIH TLVs'],
    sections: [
      'Temperature Thresholds',
      'Heat Stress Prevention',
      'Cold Stress Prevention',
      'Work/Rest Schedules',
      'Hydration Requirements',
      'Emergency Response'
    ]
  },
  {
    id: 'pol-1035',
    number: '1035',
    title: 'Sun and UV Protection',
    category: 'hse',
    description: 'Protection measures for sun and UV exposure during outdoor operations.',
    version: '1.3',
    effectiveDate: '2024-06-01',
    reviewDate: '2025-06-01',
    owner: 'HSE Manager',
    status: 'active',
    keywords: ['sun', 'UV', 'protection', 'sunscreen', 'shade'],
    relatedPolicies: ['1025', '1034'],
    regulatoryRefs: ['OH&S Act', 'Cancer Prevention Guidelines'],
    sections: [
      'UV Exposure Risks',
      'Protection Measures',
      'PPE Requirements',
      'Work Scheduling',
      'Training',
      'Medical Monitoring'
    ]
  },
  {
    id: 'pol-1036',
    number: '1036',
    title: 'Electrical Safety',
    category: 'hse',
    description: 'Electrical safety requirements for working near electrical infrastructure and using electrical equipment.',
    version: '1.9',
    effectiveDate: '2024-09-01',
    reviewDate: '2025-09-01',
    owner: 'HSE Manager',
    status: 'active',
    keywords: ['electrical', 'safety', 'power', 'lines', 'shock', 'arc flash'],
    relatedPolicies: ['1024'],
    regulatoryRefs: ['OH&S Act', 'Electrical Code', 'Utility Safety Rules'],
    sections: [
      'Electrical Hazards',
      'Safe Approach Distances',
      'Equipment Requirements',
      'Lockout/Tagout',
      'Emergency Response',
      'Training Requirements'
    ]
  },
  {
    id: 'pol-1037',
    number: '1037',
    title: 'Lone Worker Safety',
    category: 'hse',
    description: 'Safety procedures for personnel working alone or in remote locations.',
    version: '1.7',
    effectiveDate: '2024-08-15',
    reviewDate: '2025-08-15',
    owner: 'HSE Manager',
    status: 'active',
    keywords: ['lone', 'worker', 'remote', 'isolated', 'check-in'],
    relatedPolicies: ['1026'],
    regulatoryRefs: ['OH&S Act', 'Working Alone Regulation'],
    sections: [
      'Lone Worker Definition',
      'Risk Assessment',
      'Communication Requirements',
      'Check-In Procedures',
      'Emergency Response',
      'Technology Solutions'
    ]
  },
  {
    id: 'pol-1038',
    number: '1038',
    title: 'Wildlife and Insect Hazards',
    category: 'hse',
    description: 'Safety measures for wildlife encounters and insect hazards in outdoor operations.',
    version: '1.5',
    effectiveDate: '2024-05-01',
    reviewDate: '2025-05-01',
    owner: 'HSE Manager',
    status: 'active',
    keywords: ['wildlife', 'insect', 'bear', 'tick', 'bee', 'animal'],
    relatedPolicies: ['1024', '1026'],
    regulatoryRefs: ['Wildlife Act', 'OH&S Act'],
    sections: [
      'Wildlife Hazard Assessment',
      'Prevention Measures',
      'Bear Safety',
      'Insect Protection',
      'Emergency Response',
      'Reporting'
    ]
  },
  {
    id: 'pol-1039',
    number: '1039',
    title: 'Workplace Violence and Harassment',
    category: 'hse',
    description: 'Prevention and response procedures for workplace violence and harassment.',
    version: '2.1',
    effectiveDate: '2024-10-01',
    reviewDate: '2025-10-01',
    owner: 'HR Manager',
    status: 'active',
    keywords: ['violence', 'harassment', 'workplace', 'prevention', 'investigation'],
    relatedPolicies: ['1022'],
    regulatoryRefs: ['OH&S Act', 'Human Rights Code'],
    sections: [
      'Policy Statement',
      'Definitions',
      'Prevention Measures',
      'Reporting Procedures',
      'Investigation Process',
      'Support Resources'
    ]
  },
  {
    id: 'pol-1040',
    number: '1040',
    title: 'Incident Investigation',
    category: 'hse',
    description: 'Procedures for investigating workplace incidents and near-misses to identify root causes and prevent recurrence.',
    version: '2.3',
    effectiveDate: '2024-11-01',
    reviewDate: '2025-11-01',
    owner: 'HSE Manager',
    status: 'active',
    keywords: ['incident', 'investigation', 'root cause', 'analysis', 'near miss'],
    relatedPolicies: ['1007', '1041'],
    regulatoryRefs: ['OH&S Act', 'COR Requirements'],
    sections: [
      'Investigation Requirements',
      'Investigation Team',
      'Root Cause Analysis',
      'Documentation',
      'Corrective Actions',
      'Lessons Learned'
    ]
  },
  {
    id: 'pol-1041',
    number: '1041',
    title: 'Corrective and Preventive Actions',
    category: 'hse',
    description: 'CAPA process for addressing non-conformances, incidents, and opportunities for improvement.',
    version: '2.0',
    effectiveDate: '2024-09-15',
    reviewDate: '2025-09-15',
    owner: 'HSE Manager',
    status: 'active',
    keywords: ['CAPA', 'corrective', 'preventive', 'action', 'improvement'],
    relatedPolicies: ['1040'],
    regulatoryRefs: ['COR Requirements', 'ISO 45001'],
    sections: [
      'CAPA Process',
      'Root Cause Requirements',
      'Action Planning',
      'Implementation',
      'Effectiveness Verification',
      'Closure Criteria'
    ]
  },
  {
    id: 'pol-1042',
    number: '1042',
    title: 'Safety Meetings',
    category: 'hse',
    description: 'Requirements for toolbox talks, safety meetings, and safety committee activities.',
    version: '1.6',
    effectiveDate: '2024-04-01',
    reviewDate: '2025-04-01',
    owner: 'HSE Manager',
    status: 'active',
    keywords: ['safety meeting', 'toolbox', 'talk', 'committee', 'communication'],
    relatedPolicies: ['1022'],
    regulatoryRefs: ['OH&S Act', 'COR Requirements'],
    sections: [
      'Meeting Requirements',
      'Toolbox Talk Program',
      'Safety Committee',
      'Documentation',
      'Participation Requirements',
      'Topics and Content'
    ]
  },
  {
    id: 'pol-1043',
    number: '1043',
    title: 'Contractor Safety Management',
    category: 'hse',
    description: 'Safety requirements for contractors, subcontractors, and visitors to worksites.',
    version: '1.9',
    effectiveDate: '2024-07-15',
    reviewDate: '2025-07-15',
    owner: 'HSE Manager',
    status: 'active',
    keywords: ['contractor', 'subcontractor', 'visitor', 'management', 'orientation'],
    relatedPolicies: ['1022', '1024'],
    regulatoryRefs: ['OH&S Act', 'Prime Contractor Regulation'],
    sections: [
      'Contractor Pre-Qualification',
      'Safety Requirements',
      'Orientation Requirements',
      'Monitoring and Supervision',
      'Non-Compliance',
      'Documentation'
    ]
  },
  {
    id: 'pol-1044',
    number: '1044',
    title: 'Training and Competency',
    category: 'hse',
    description: 'HSE training requirements, competency assessment, and training records management.',
    version: '2.2',
    effectiveDate: '2024-08-01',
    reviewDate: '2025-08-01',
    owner: 'HSE Manager',
    status: 'active',
    keywords: ['training', 'competency', 'qualification', 'assessment', 'certification'],
    relatedPolicies: ['1010', '1011'],
    regulatoryRefs: ['OH&S Act', 'COR Requirements'],
    sections: [
      'Training Matrix',
      'Mandatory Training',
      'Competency Assessment',
      'Refresher Requirements',
      'Records Management',
      'Training Evaluation'
    ]
  },
  {
    id: 'pol-1045',
    number: '1045',
    title: 'Records and Documentation',
    category: 'hse',
    description: 'Requirements for HSE records retention, documentation standards, and record management.',
    version: '1.8',
    effectiveDate: '2024-06-15',
    reviewDate: '2025-06-15',
    owner: 'HSE Manager',
    status: 'active',
    keywords: ['records', 'documentation', 'retention', 'filing', 'audit'],
    relatedPolicies: ['1022'],
    regulatoryRefs: ['OH&S Act', 'COR Requirements', 'Privacy Act'],
    sections: [
      'Document Control',
      'Required Records',
      'Retention Periods',
      'Storage Requirements',
      'Access and Confidentiality',
      'Disposal Procedures'
    ]
  }
]

const CATEGORIES = {
  rpas: {
    id: 'rpas',
    name: 'RPAS Operations',
    icon: Plane,
    color: 'blue',
    description: 'Policies governing remotely piloted aircraft system operations'
  },
  crm: {
    id: 'crm',
    name: 'Crew Resource Management',
    icon: Users,
    color: 'purple',
    description: 'Policies for crew coordination, communication, and decision making'
  },
  hse: {
    id: 'hse',
    name: 'Health, Safety & Environment',
    icon: HardHat,
    color: 'green',
    description: 'Workplace health, safety, and environmental protection policies'
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getStatusInfo = (policy) => {
  const today = new Date()
  const reviewDate = new Date(policy.reviewDate)
  const daysUntilReview = Math.ceil((reviewDate - today) / (1000 * 60 * 60 * 24))
  
  if (policy.status === 'draft') {
    return { status: 'draft', label: 'Draft', color: 'gray', icon: FileText }
  }
  
  if (daysUntilReview < 0) {
    return { status: 'overdue', label: 'Review Overdue', color: 'red', icon: AlertCircle }
  }
  
  if (daysUntilReview <= 30) {
    return { status: 'due', label: 'Review Due', color: 'amber', icon: Clock }
  }
  
  return { status: 'active', label: 'Active', color: 'green', icon: CheckCircle2 }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// ============================================
// UI COMPONENTS
// ============================================

function CategoryFilters({ selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          selected === null
            ? 'bg-aeria-navy text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        All Policies
      </button>
      {Object.values(CATEGORIES).map(cat => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
            selected === cat.id
              ? cat.color === 'blue' ? 'bg-blue-600 text-white' :
                cat.color === 'purple' ? 'bg-purple-600 text-white' :
                'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <cat.icon className="w-4 h-4" />
          {cat.name}
        </button>
      ))}
    </div>
  )
}

function PolicyStatusBadge({ policy }) {
  const { label, color, icon: Icon } = getStatusInfo(policy)
  
  const colors = {
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    red: 'bg-red-100 text-red-700 border-red-200'
  }
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium ${colors[color]}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

function PolicyCard({ policy, view, onClick }) {
  const category = CATEGORIES[policy.category]
  const statusInfo = getStatusInfo(policy)
  
  const categoryColors = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    green: 'bg-green-100 text-green-700 border-green-200'
  }
  
  if (view === 'list') {
    return (
      <button
        onClick={onClick}
        className="w-full p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all text-left flex items-center gap-4"
      >
        <div className="w-16 text-center flex-shrink-0">
          <span className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${categoryColors[category.color]}`}>
            {policy.number}
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{policy.title}</h3>
          <p className="text-sm text-gray-500 truncate mt-0.5">{policy.description}</p>
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${categoryColors[category.color]}`}>
            {category.name}
          </span>
          <PolicyStatusBadge policy={policy} />
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </button>
    )
  }
  
  // Grid view
  return (
    <button
      onClick={onClick}
      className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all text-left h-full flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${categoryColors[category.color]}`}>
          {policy.number}
        </span>
        <PolicyStatusBadge policy={policy} />
      </div>
      
      <h3 className="font-medium text-gray-900 mb-2">{policy.title}</h3>
      <p className="text-sm text-gray-500 flex-1 line-clamp-2">{policy.description}</p>
      
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          v{policy.version}
        </span>
        <span className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {policy.owner}
        </span>
      </div>
    </button>
  )
}

// PolicyDetailModal removed - now using dedicated PolicyDetail page

function EmptyState({ searchQuery, categoryFilter }) {
  return (
    <div className="text-center py-12">
      <FolderOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No policies found</h3>
      <p className="text-gray-500">
        {searchQuery
          ? `No policies match "${searchQuery}"`
          : categoryFilter
            ? `No policies in this category`
            : 'No policies available'
        }
      </p>
    </div>
  )
}

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-48 bg-gray-100 rounded"></div>
          </div>
          <div className="flex items-center gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="text-center px-4">
                <div className="h-8 w-12 bg-gray-200 rounded mx-auto mb-1"></div>
                <div className="h-3 w-10 bg-gray-100 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Search skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="h-10 bg-gray-100 rounded-lg"></div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 w-24 bg-gray-100 rounded-full"></div>
          ))}
        </div>
      </div>
      
      {/* List skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-5 w-48 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-96 bg-gray-100 rounded"></div>
              </div>
              <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// DELETE CONFIRMATION MODAL
// ============================================

function DeleteConfirmModal({ policy, onConfirm, onCancel, deleting }) {
  if (!policy) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Delete Policy</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{policy.number} - {policy.title}</strong>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="btn-primary bg-red-600 hover:bg-red-700"
          >
            {deleting ? 'Deleting...' : 'Delete Policy'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function PolicyLibrary() {
  const navigate = useNavigate()
  const { user, userProfile } = useAuth()
  const permissions = usePolicyPermissions()
  const { pendingCount } = usePendingAcknowledgments()

  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [sortBy, setSortBy] = useState('number')
  const [sortOrder, setSortOrder] = useState('asc')

  // Modal states
  const [showPolicyEditor, setShowPolicyEditor] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState(null)
  const [deletingPolicy, setDeletingPolicy] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load policies from Firestore
  const loadPolicies = async () => {
    try {
      setError('')
      const data = await getPoliciesEnhanced()
      setPolicies(data)
    } catch (err) {
      setError('Failed to load policies. Please try again.')
      console.error('Error loading policies:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPolicies()
  }, [])

  // Handle policy click - navigate to detail page
  const handlePolicyClick = (policy) => {
    navigate(`/policies/${policy.id}`)
  }

  // Handle policy saved (create/update)
  const handlePolicySaved = () => {
    loadPolicies()
    setEditingPolicy(null)
    setShowPolicyEditor(false)
  }

  // Handle edit policy
  const handleEditPolicy = (policy) => {
    setEditingPolicy(policy)
    setShowPolicyEditor(true)
  }

  // Handle delete policy
  const handleDeletePolicy = (policy) => {
    setDeletingPolicy(policy)
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!deletingPolicy) return

    setIsDeleting(true)
    try {
      await deletePolicyEnhanced(deletingPolicy.id)
      await loadPolicies()
      setDeletingPolicy(null)
    } catch (err) {
      setError('Failed to delete policy. Please try again.')
      console.error('Error deleting policy:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  // Filter and sort policies
  const filteredPolicies = useMemo(() => {
    let result = [...policies]

    // Category filter
    if (categoryFilter) {
      result = result.filter(p => p.category === categoryFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.number?.includes(query) ||
        p.title?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.keywords?.some(k => k.toLowerCase().includes(query))
      )
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'number':
          comparison = (a.number || '').localeCompare(b.number || '', undefined, { numeric: true })
          break
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '')
          break
        case 'date':
          comparison = new Date(a.effectiveDate || 0) - new Date(b.effectiveDate || 0)
          break
        default:
          comparison = 0
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [policies, searchQuery, categoryFilter, sortBy, sortOrder])

  // Stats
  const stats = useMemo(() => {
    const all = policies.length
    const active = policies.filter(p => getStatusInfo(p).status === 'active').length
    const due = policies.filter(p => getStatusInfo(p).status === 'due').length
    const overdue = policies.filter(p => getStatusInfo(p).status === 'overdue').length

    return { all, active, due, overdue }
  }, [policies])

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  // Show loading skeleton
  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto p-1 hover:bg-red-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Book className="w-7 h-7 text-aeria-navy" />
              Policy & Procedure Library
            </h1>
            <p className="text-gray-500 mt-1">
              Access and manage organizational policies and procedures
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Pending Acknowledgments */}
            {pendingCount > 0 && (
              <button
                onClick={() => navigate('/my-acknowledgments')}
                className="flex items-center gap-2 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="font-medium">{pendingCount} Pending</span>
              </button>
            )}

            {/* New Policy Button - show for admin, manager, or editor roles */}
            <button
              onClick={() => {
                setEditingPolicy(null)
                setShowPolicyEditor(true)
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Policy
            </button>

            {/* Stats */}
            <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
              <div className="text-center px-4">
                <p className="text-2xl font-bold text-gray-900">{stats.all}</p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
              <div className="text-center px-4 border-l border-gray-200">
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
              <div className="text-center px-4 border-l border-gray-200">
                <p className="text-2xl font-bold text-amber-600">{stats.due}</p>
                <p className="text-xs text-gray-500">Due</p>
              </div>
              <div className="text-center px-4 border-l border-gray-200">
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                <p className="text-xs text-gray-500">Overdue</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by number, title, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-aeria-navy text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-aeria-navy text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort:</span>
            <button
              onClick={() => toggleSort('number')}
              className={`px-3 py-1 text-sm rounded ${
                sortBy === 'number' ? 'bg-aeria-navy text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Number {sortBy === 'number' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => toggleSort('title')}
              className={`px-3 py-1 text-sm rounded ${
                sortBy === 'title' ? 'bg-aeria-navy text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => toggleSort('date')}
              className={`px-3 py-1 text-sm rounded ${
                sortBy === 'date' ? 'bg-aeria-navy text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <CategoryFilters selected={categoryFilter} onChange={setCategoryFilter} />
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredPolicies.length} of {policies.length} policies
        </p>
        {(searchQuery || categoryFilter) && (
          <button
            onClick={() => {
              setSearchQuery('')
              setCategoryFilter(null)
            }}
            className="text-sm text-aeria-navy hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Policy List/Grid */}
      {filteredPolicies.length === 0 ? (
        <EmptyState searchQuery={searchQuery} categoryFilter={categoryFilter} />
      ) : viewMode === 'list' ? (
        <div className="space-y-2">
          {filteredPolicies.map(policy => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              view="list"
              onClick={() => handlePolicyClick(policy)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPolicies.map(policy => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              view="grid"
              onClick={() => handlePolicyClick(policy)}
            />
          ))}
        </div>
      )}

      {/* Policy Create/Edit Modal */}
      <PolicyEditor
        isOpen={showPolicyEditor}
        onClose={() => {
          setShowPolicyEditor(false)
          setEditingPolicy(null)
        }}
        policy={editingPolicy}
        onSaved={handlePolicySaved}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        policy={deletingPolicy}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingPolicy(null)}
        deleting={isDeleting}
      />
    </div>
  )
}
