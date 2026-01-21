/**
 * seedComplianceTemplates.js
 * Seed script for compliance matrix templates
 *
 * Contains the Transport Canada SFOC BVLOS compliance matrix
 * Based on CAR 903.01(b) requirements
 *
 * @location src/lib/seedComplianceTemplates.js
 */

import { seedComplianceTemplate } from './firestoreCompliance'

// ============================================
// SFOC BVLOS COMPLIANCE MATRIX TEMPLATE
// CAR 903.01(b) - Beyond Visual Line of Sight Operations
// ============================================

export const SFOC_BVLOS_TEMPLATE = {
  id: 'sfoc-bvlos-903-01b',
  name: 'SFOC - BVLOS Operations',
  shortName: 'BVLOS SFOC',
  description: 'Compliance checklist for CAR 903.01(b) - RPAS in Beyond Visual Line of Sight operations. This matrix covers all Transport Canada requirements for BVLOS SFOC applications.',

  // Metadata
  category: 'sfoc',
  regulatoryBody: 'Transport Canada',
  regulation: 'CAR 903.01(b)',
  version: '2024-01',
  effectiveDate: '2024-01-15',

  // Categories/Sections
  categories: [
    {
      id: 'operations',
      name: 'RPAS Operation / Risk Assessment',
      description: 'Requirements related to operational planning, SORA, and risk management',
      order: 1
    },
    {
      id: 'equipment',
      name: 'RPAS Equipment / Capability',
      description: 'Requirements related to aircraft, systems, and technical capabilities',
      order: 2
    },
    {
      id: 'crew',
      name: 'Applicant / Operator / Pilot',
      description: 'Requirements related to personnel, qualifications, and organizational standards',
      order: 3
    }
  ],

  // Requirements
  requirements: [
    // ============================================
    // SECTION 1: RPAS Operation / Risk Assessment
    // ============================================
    {
      id: 'req-001',
      category: 'operations',
      order: 1,
      text: 'As per CAR 903.02(d), describe in detail the purpose of the operations. Provide a CONOPS type document to cover scope of the proposed operation.',
      shortText: 'Purpose of Operations / CONOPS',
      regulatoryRef: 'CAR 903.02(d)',
      guidance: 'Include: operational objectives, geographic scope, duration, aircraft types, altitude ranges, and any special considerations. The CONOPS should be comprehensive and cover all aspects of the proposed BVLOS operation.',
      responseType: 'document-reference',
      required: true,
      minResponseLength: 50,
      autoPopulateFrom: [
        'project.overview.description',
        'project.sora.conops',
        'project.flightPlan.summary'
      ],
      suggestedPolicies: ['1001', '1005', '1006', '1012'],
      suggestedDocTypes: ['operations-manual', 'conops', 'sora-report'],
      validationRules: [
        { type: 'requiresDocument', docTypes: ['conops', 'operations-manual'] },
        { type: 'minDocuments', count: 1 }
      ],
      helpText: 'This requirement asks you to explain WHY you are conducting the operation and provide a Concept of Operations document. Be specific about the purpose, scope, and nature of the BVLOS operations.',
      exampleResponse: 'The purpose of this operation is to conduct aerial pipeline inspection services for [Client] in the [Location] area. Operations will involve systematic survey flights along the pipeline corridor using [Aircraft Type] equipped with [Sensors]. See attached CONOPS document (Operations Manual Section 3.2, pages 12-18) for complete operational details including flight profiles, altitude ranges, and risk mitigations.'
    },
    {
      id: 'req-002',
      category: 'operations',
      order: 2,
      text: 'Provide the Specific Operational Risk Assessment (SORA), SAIL level and Appendix C - Operational Safety Objectives (OSOs) as detailed in AC 903-001.',
      shortText: 'SORA Assessment & OSOs',
      regulatoryRef: 'AC 903-001',
      guidance: 'Must include complete SORA with Ground Risk Class (GRC), Air Risk Class (ARC), final SAIL level, and all applicable OSO compliance evidence. Ensure SORA version 2.5 methodology is followed.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: [
        'project.sora.sailLevel',
        'project.sora.grc',
        'project.sora.arc',
        'project.sora.osos'
      ],
      suggestedDocTypes: ['sora-report'],
      validationRules: [
        { type: 'requiresProjectData', fields: ['sora.sailLevel'] },
        { type: 'requiresDocument', docTypes: ['sora-report'] }
      ],
      helpText: 'The SORA assessment determines the Specific Assurance and Integrity Level (SAIL) required for your operation based on ground and air risk analysis.',
      exampleResponse: 'SORA Assessment completed per JARUS SORA 2.5 methodology. Final SAIL Level: II. Ground Risk Class (GRC): 3 (Sparsely populated, mitigated by M1 & M2). Air Risk Class (ARC): ARC-b (uncontrolled airspace, VLOS mitigation). All applicable OSOs have been addressed with evidence documented in the attached SORA report.'
    },
    {
      id: 'req-003',
      category: 'operations',
      order: 3,
      text: 'Provide a description of the area of operation, including geographic boundaries, airspace classification, and any airspace restrictions.',
      shortText: 'Area of Operation Description',
      regulatoryRef: 'CAR 903.02(d)',
      guidance: 'Include detailed geographic coordinates or boundary descriptions, airspace class (A through G), any NOTAMs, TFRs, or permanent airspace restrictions. Include maps where appropriate.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: [
        'project.siteSurvey.location',
        'project.siteSurvey.airspace',
        'project.mapData.operationalArea'
      ],
      suggestedDocTypes: ['site-survey', 'maps'],
      helpText: 'Clearly define where operations will take place. Include all relevant airspace information and any potential conflicts.',
      exampleResponse: 'Operations will be conducted within a defined corridor along the Trans-Northern Pipeline from [Start Point coordinates] to [End Point coordinates]. The operational area is within Class G uncontrolled airspace, below 400ft AGL. Nearest aerodrome is [Name] at [Distance] NM. See attached maps and site survey documentation.'
    },
    {
      id: 'req-004',
      category: 'operations',
      order: 4,
      text: 'Provide details of the proposed flight profiles, including maximum altitude AGL, maximum distance from pilot, and flight duration.',
      shortText: 'Flight Profiles',
      regulatoryRef: 'CAR 903.02(d)',
      guidance: 'Describe typical and maximum operational parameters. Include altitude limits, range limits, typical flight duration, and any variations based on mission requirements.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: [
        'project.flightPlan.maxAltitudeAGL',
        'project.flightPlan.operationType'
      ],
      helpText: 'Define the envelope within which operations will be conducted.',
      exampleResponse: 'Maximum altitude: 120m (400ft) AGL. Maximum range from pilot: 2km (within C2 link range). Typical flight duration: 25-30 minutes per battery. Flight profile: Linear corridor survey at 50m AGL with terrain following. See Operations Manual Section 4.3.'
    },
    {
      id: 'req-005',
      category: 'operations',
      order: 5,
      text: 'Describe the method(s) used to maintain situational awareness of other aircraft in the area of operation when operating BVLOS.',
      shortText: 'Situational Awareness Methods',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Explain how you will detect and avoid other aircraft. This may include visual observers, ADS-B receivers, FLARM, radar, or other DAA systems. For SAIL II+, explain the DAA system or procedural mitigations.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1015', '1017'],
      suggestedDocTypes: ['operations-manual', 'daa-procedures'],
      helpText: 'BVLOS operations require robust methods to detect and avoid conflicting traffic.',
      exampleResponse: 'Situational awareness maintained through: 1) Network of trained Visual Observers (VOs) positioned along the flight corridor with radio communication to PIC. 2) ADS-B In receiver on GCS displaying nearby traffic. 3) Real-time monitoring of NAV CANADA traffic advisories. 4) Pre-flight NOTAM check and coordination with local air traffic. See VO procedures in Operations Manual Section 5.2.'
    },
    {
      id: 'req-006',
      category: 'operations',
      order: 6,
      text: 'Describe the procedures for coordination with NAV CANADA and/or the appropriate air traffic control authority.',
      shortText: 'ATC Coordination Procedures',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Detail how you will coordinate with ATC, FIC, or other authorities before and during operations. Include NOTAM procedures if applicable.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1003', '1004'],
      helpText: 'Proper coordination with air traffic services is essential for BVLOS operations.',
      exampleResponse: 'Pre-flight: File flight plan with FIC Edmonton 24 hours prior. Issue NOTAM for operation area. Day of operation: Contact FIC for traffic advisory. During flight: Monitor 126.7 MHz. Emergency: Contact FIC immediately via phone (1-866-541-4102). See NAV CANADA coordination checklist in Operations Manual Appendix D.'
    },
    {
      id: 'req-007',
      category: 'operations',
      order: 7,
      text: 'Provide emergency procedures including loss of command and control link, fly-away, and other abnormal situations.',
      shortText: 'Emergency Procedures',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Document all emergency procedures specific to BVLOS operations. Include loss of C2 link, GPS failure, fly-away, battery emergency, weather deterioration, and collision avoidance.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1006', '1007'],
      autoPopulateFrom: [
        'project.flightPlan.contingencies',
        'project.emergencyPlan'
      ],
      suggestedDocTypes: ['emergency-procedures', 'operations-manual'],
      helpText: 'Emergency procedures must be comprehensive and practiced.',
      exampleResponse: 'Emergency procedures documented in Operations Manual Section 6. Key procedures: 1) Loss of C2 Link: RPAS executes RTH automatically, VOs track visually. 2) Fly-away: Attempt regain control, contact FIC immediately, track via ADS-B. 3) Low battery: Immediate RTH, land with 20% reserve. 4) Weather deterioration: Land immediately if below minimums. All crew trained quarterly on emergency procedures.'
    },
    {
      id: 'req-008',
      category: 'operations',
      order: 8,
      text: 'Describe the communication procedures between the pilot and any visual observers or other crew members.',
      shortText: 'Crew Communication Procedures',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Detail the communication methods, frequencies/channels, standard phraseology, and backup communication methods.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1013', '1015', '1021'],
      autoPopulateFrom: ['project.communications'],
      helpText: 'Clear communication protocols are essential for safe BVLOS operations.',
      exampleResponse: 'Primary: Dedicated UHF radio channel. Backup: Cellular phone. Standard phraseology per Operations Manual Section 5.3. Check-in intervals: Every 2 minutes during BVLOS flight. Emergency stop word: "ABORT ABORT ABORT". All crew briefed on communications procedures pre-flight.'
    },
    {
      id: 'req-009',
      category: 'operations',
      order: 9,
      text: 'Provide weather minimums and limitations for the proposed operations.',
      shortText: 'Weather Minimums',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Specify visibility minimums, ceiling requirements, wind limitations, and any other weather restrictions specific to BVLOS operations.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1005'],
      autoPopulateFrom: ['project.flightPlan.weatherMinimums'],
      helpText: 'Weather minimums for BVLOS should be more conservative than VLOS operations.',
      exampleResponse: 'Minimum visibility: 3 SM. Minimum ceiling: 500ft AGL. Maximum wind: 25 km/h sustained, 35 km/h gusts. No operations in precipitation, fog, or icing conditions. Weather checked via AWOS/METAR 1 hour prior and continuously monitored. Operations suspended if conditions deteriorate below minimums.'
    },
    {
      id: 'req-010',
      category: 'operations',
      order: 10,
      text: 'Describe the procedures for pre-flight planning and risk assessment for each operation.',
      shortText: 'Pre-flight Planning Procedures',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Document the systematic approach to planning each flight, including risk assessment, go/no-go decisions, and crew briefing.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1002', '1014', '1017'],
      suggestedDocTypes: ['operations-manual', 'checklists'],
      helpText: 'Thorough pre-flight planning reduces operational risk.',
      exampleResponse: 'Pre-flight planning follows Operations Manual Section 3: 1) Weather assessment (METAR, TAF, AWOS). 2) NOTAM check. 3) Site-specific risk assessment update. 4) Equipment serviceability check. 5) Crew fitness verification (IMSAFE). 6) Full crew briefing using standard briefing checklist. 7) Go/No-Go decision by PIC. See attached pre-flight checklist.'
    },

    // ============================================
    // SECTION 2: RPAS Equipment / Capability
    // ============================================
    {
      id: 'req-011',
      category: 'equipment',
      order: 1,
      text: 'Provide make, model, and specifications of the RPAS to be used, including MTOW, maximum speed, and endurance.',
      shortText: 'RPAS Specifications',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include complete aircraft specifications, registration number if applicable, and any relevant type certificates or design approvals.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: ['project.flightPlan.aircraft'],
      suggestedDocTypes: ['aircraft-specs', 'registration'],
      helpText: 'Provide detailed specifications for all aircraft to be used in BVLOS operations.',
      exampleResponse: 'Primary Aircraft: DJI Matrice 300 RTK. MTOW: 9kg. Max Speed: 23 m/s. Endurance: 55 min (no payload). Registration: C-XXXX. Secondary Aircraft: [Details]. See attached aircraft specification sheets and airworthiness documentation.'
    },
    {
      id: 'req-012',
      category: 'equipment',
      order: 2,
      text: 'Describe the command and control (C2) link system, including frequencies, range, and redundancy measures.',
      shortText: 'C2 Link System',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Detail the C2 link technology, operating frequencies, effective range, and any backup or redundant systems.',
      responseType: 'document-reference',
      required: true,
      suggestedDocTypes: ['equipment-specs'],
      helpText: 'C2 link reliability is critical for BVLOS operations.',
      exampleResponse: 'Primary C2: OcuSync 3.0, 2.4/5.8 GHz dual-band. Effective range: 15km (optimal conditions). Redundancy: 4 antenna diversity system. Automatic frequency hopping. Backup: 4G LTE module for telemetry (data only). C2 link tested prior to each flight. Operations remain within demonstrated reliable range.'
    },
    {
      id: 'req-013',
      category: 'equipment',
      order: 3,
      text: 'Describe the lost link procedures and automatic return-to-home (RTH) capabilities.',
      shortText: 'Lost Link & RTH Procedures',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Explain what happens automatically when C2 link is lost and any manual override procedures.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1006'],
      helpText: 'Lost link procedures must be failsafe and predictable.',
      exampleResponse: 'Lost Link Response: 1) RPAS hovers for 10 seconds attempting reconnection. 2) If no reconnection, automatic RTH at 50m AGL following recorded path. 3) If RTH not feasible, controlled descent and landing. RTH tested before each flight. Manual override available via backup controller. See Operations Manual Section 6.2.'
    },
    {
      id: 'req-014',
      category: 'equipment',
      order: 4,
      text: 'Describe any geo-fencing or containment systems used to prevent the RPAS from leaving the approved operational area.',
      shortText: 'Geo-fencing / Containment',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Detail any electronic geo-fencing, virtual boundaries, or physical containment measures.',
      responseType: 'document-reference',
      required: true,
      autoPopulateFrom: ['project.sora.containment'],
      helpText: 'Containment is a key mitigation for ground risk in SORA.',
      exampleResponse: 'Software geo-fence programmed in flight controller with 100m buffer from operational boundary. Hard altitude limit: 130m AGL. Automatic hover and alert if approaching geo-fence. Emergency RTH triggered if boundary breach attempted. Geo-fence verified during pre-flight checks. See SORA containment evidence documentation.'
    },
    {
      id: 'req-015',
      category: 'equipment',
      order: 5,
      text: 'Describe the RPAS navigation system(s) and any redundancy measures.',
      shortText: 'Navigation Systems',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Detail GPS/GNSS systems, any RTK augmentation, backup navigation methods, and behavior during navigation failure.',
      responseType: 'document-reference',
      required: true,
      helpText: 'Reliable navigation is essential for BVLOS operations.',
      exampleResponse: 'Primary Navigation: Multi-constellation GNSS (GPS L1/L2, GLONASS, Galileo, BeiDou). RTK positioning via D-RTK2 base station (2cm accuracy). Backup: Vision positioning system (below 50m). IMU-based dead reckoning for short-duration GPS loss. GPS failure procedure: Immediate transition to ATTI mode and controlled return.'
    },
    {
      id: 'req-016',
      category: 'equipment',
      order: 6,
      text: 'Describe the method(s) used for detecting and avoiding obstacles during BVLOS flight.',
      shortText: 'Obstacle Detection & Avoidance',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Detail any onboard sensors, pre-planned route verification, or procedural methods for obstacle avoidance.',
      responseType: 'document-reference',
      required: true,
      helpText: 'Obstacle avoidance is critical when the pilot cannot directly see obstacles.',
      exampleResponse: 'Multi-directional obstacle sensing (forward, backward, lateral, up, down) using infrared and vision sensors. Detection range: 40m. Automatic brake and hover when obstacle detected. Pre-flight route verification against terrain and obstacle database. Minimum safe altitude established per segment based on site survey. See Operations Manual Section 4.5.'
    },
    {
      id: 'req-017',
      category: 'equipment',
      order: 7,
      text: 'Describe the method(s) used for ground-based surveillance of the RPAS during BVLOS operations.',
      shortText: 'Ground-Based Surveillance',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Explain how you maintain awareness of RPAS position and status when beyond visual line of sight.',
      responseType: 'document-reference',
      required: true,
      helpText: 'Ground-based tracking enables situational awareness during BVLOS.',
      exampleResponse: 'Real-time telemetry displayed on GCS showing position, altitude, heading, speed, battery status, and system health. Position updated 5Hz. ADS-B Out for external tracking. Flight path recording for post-flight review. Telemetry alerts for abnormal parameters. Visual observers provide backup visual tracking where possible.'
    },
    {
      id: 'req-018',
      category: 'equipment',
      order: 8,
      text: 'Provide details of any flight termination system (FTS) or parachute recovery system (PRS) if applicable.',
      shortText: 'FTS / Parachute System',
      regulatoryRef: 'CAR 903.02',
      guidance: 'If equipped, describe the termination or recovery system capabilities, activation methods, and testing requirements.',
      responseType: 'document-reference',
      required: false,
      helpText: 'FTS/PRS may be required for certain SAIL levels or population densities.',
      exampleResponse: 'N/A - Operations conducted over sparsely populated areas with SAIL II. Aircraft descent rate in power-off condition: [X] m/s. Impact energy calculations support operations without FTS/PRS per SORA methodology. If FTS required for specific mission: [Describe system and procedures].'
    },
    {
      id: 'req-019',
      category: 'equipment',
      order: 9,
      text: 'Describe the maintenance program for the RPAS and associated equipment.',
      shortText: 'Maintenance Program',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Detail the preventive maintenance schedule, inspection intervals, and record-keeping procedures.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1009'],
      suggestedDocTypes: ['maintenance-manual'],
      helpText: 'Regular maintenance ensures aircraft reliability for BVLOS operations.',
      exampleResponse: 'Maintenance per manufacturer recommendations and Operations Manual Section 8. Pre-flight inspection before each flight. 25-hour inspection interval. 100-hour major inspection. Battery cycle tracking and replacement criteria. All maintenance logged in aircraft logbook. See attached maintenance schedule and sample logs.'
    },
    {
      id: 'req-020',
      category: 'equipment',
      order: 10,
      text: 'Describe the Ground Control Station (GCS) setup and capabilities.',
      shortText: 'GCS Setup & Capabilities',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Detail the GCS hardware, software, displays, and any redundancy measures.',
      responseType: 'document-reference',
      required: true,
      helpText: 'The GCS is the primary interface for BVLOS operations.',
      exampleResponse: 'GCS: DJI RC Plus controller with integrated display. Backup: Tablet with DJI Pilot 2 app. Displays: Real-time video feed, telemetry overlay, map view with position, geofence status. Power: Internal battery plus external power bank (4+ hours operation). Sun shade for outdoor visibility. See GCS setup checklist.'
    },

    // ============================================
    // SECTION 3: Applicant / Operator / Pilot
    // ============================================
    {
      id: 'req-021',
      category: 'crew',
      order: 1,
      text: 'Provide details of the applicant organization, including company name, address, and primary contact.',
      shortText: 'Applicant Information',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include full legal company name, mailing address, and contact details for the person responsible for the SFOC.',
      responseType: 'text',
      required: true,
      helpText: 'Provide complete and accurate applicant information.',
      exampleResponse: 'Company: [Company Name]\nAddress: [Street, City, Province, Postal Code]\nPrimary Contact: [Name, Title]\nPhone: [Number]\nEmail: [Email]'
    },
    {
      id: 'req-022',
      category: 'crew',
      order: 2,
      text: 'Provide Transport Canada RPAS registration number(s) for all aircraft to be used.',
      shortText: 'RPAS Registration',
      regulatoryRef: 'CAR 901.03',
      guidance: 'List all TC registration numbers. Aircraft must be properly registered and marked.',
      responseType: 'text',
      required: true,
      suggestedPolicies: ['1008'],
      helpText: 'All aircraft used must be registered with Transport Canada.',
      exampleResponse: 'Primary Aircraft: C-XXXX (DJI Matrice 300 RTK)\nSecondary Aircraft: C-YYYY (DJI Matrice 30T)'
    },
    {
      id: 'req-023',
      category: 'crew',
      order: 3,
      text: 'Provide pilot certification details for all pilots who will conduct BVLOS operations.',
      shortText: 'Pilot Certifications',
      regulatoryRef: 'CAR 901.54',
      guidance: 'Include certificate type (Basic/Advanced), certificate number, and any additional ratings or endorsements.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1010'],
      autoPopulateFrom: ['project.crew'],
      helpText: 'Pilots must hold appropriate certificates for BVLOS operations.',
      exampleResponse: 'PIC: [Name] - Advanced RPAS Certificate #[Number], Medical Category 1/3. Issued: [Date]. Additional: Night Rating, Ground Instructor. See attached certificate copies.'
    },
    {
      id: 'req-024',
      category: 'crew',
      order: 4,
      text: 'Describe the training and experience requirements for pilots conducting BVLOS operations.',
      shortText: 'Pilot Training Requirements',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Detail specific BVLOS training, flight hour requirements, and currency requirements.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1010', '1011', '1044'],
      helpText: 'BVLOS operations typically require additional training beyond standard certification.',
      exampleResponse: 'BVLOS Pilot Requirements: 1) Valid Advanced RPAS Certificate. 2) Minimum 50 hours on type. 3) Company BVLOS ground school (8 hours). 4) BVLOS practical training (10 hours supervised). 5) Annual proficiency check. 6) Current within 90 days on type. See Training Manual Section 3.'
    },
    {
      id: 'req-025',
      category: 'crew',
      order: 5,
      text: 'Describe the roles and responsibilities of all crew members involved in BVLOS operations.',
      shortText: 'Crew Roles & Responsibilities',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Define each crew position (PIC, VO, GCS Operator, etc.) and their specific responsibilities.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1013', '1015', '1016'],
      autoPopulateFrom: ['project.crew'],
      helpText: 'Clear role definition ensures safe crew coordination.',
      exampleResponse: 'Pilot in Command (PIC): Overall flight safety responsibility, aircraft control, go/no-go decisions. Visual Observer (VO): Scan for traffic, maintain awareness of RPAS position, relay observations to PIC. Ground Operations Lead: Site safety, communications coordination, emergency response lead. See Operations Manual Section 2 for detailed responsibilities matrix.'
    },
    {
      id: 'req-026',
      category: 'crew',
      order: 6,
      text: 'Describe the training requirements and qualifications for visual observers.',
      shortText: 'Visual Observer Training',
      regulatoryRef: 'CAR 901.70',
      guidance: 'Detail VO training curriculum, competency requirements, and any certification or documentation.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1015', '1044'],
      helpText: 'VOs play a critical role in BVLOS situational awareness.',
      exampleResponse: 'VO Training Requirements: 1) Company VO ground school (4 hours). 2) Radio communication procedures. 3) Aircraft recognition and tracking. 4) Emergency procedures briefing. 5) Site-specific briefing for each operation. VOs must pass practical assessment. Records maintained in training database.'
    },
    {
      id: 'req-027',
      category: 'crew',
      order: 7,
      text: 'Provide a copy of the Operations Manual or relevant sections covering BVLOS procedures.',
      shortText: 'Operations Manual',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include the complete Operations Manual or, at minimum, sections covering BVLOS-specific procedures, emergency procedures, and crew duties.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1001', '1012'],
      suggestedDocTypes: ['operations-manual'],
      validationRules: [
        { type: 'requiresDocument', docTypes: ['operations-manual'] }
      ],
      helpText: 'The Operations Manual is a key compliance document.',
      exampleResponse: 'Operations Manual Version 3.0, dated [Date]. Relevant sections attached: Section 3 (Flight Operations), Section 4 (BVLOS Procedures), Section 5 (Crew Duties), Section 6 (Emergency Procedures). Full manual available upon request.'
    },
    {
      id: 'req-028',
      category: 'crew',
      order: 8,
      text: 'Describe the Safety Management System (SMS) or safety culture within the organization.',
      shortText: 'Safety Management System',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Describe how safety is managed within the organization, including hazard reporting, incident investigation, and continuous improvement.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1007', '1040', '1041', '1045'],
      helpText: 'A safety culture supports safe BVLOS operations.',
      exampleResponse: 'Safety Management System includes: 1) Hazard identification and risk assessment process. 2) Confidential safety reporting system. 3) Incident investigation procedures. 4) CAPA process for continuous improvement. 5) Regular safety meetings. 6) Safety KPIs and monitoring. See SMS Manual and Policy 1045.'
    },
    {
      id: 'req-029',
      category: 'crew',
      order: 9,
      text: 'Provide evidence of liability insurance coverage appropriate for BVLOS operations.',
      shortText: 'Insurance Coverage',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include certificate of insurance showing coverage amounts and that BVLOS operations are covered.',
      responseType: 'document-reference',
      required: true,
      suggestedDocTypes: ['insurance-certificate'],
      validationRules: [
        { type: 'requiresDocument', docTypes: ['insurance-certificate'] }
      ],
      helpText: 'Insurance must cover BVLOS operations specifically.',
      exampleResponse: 'Liability Insurance: [Insurance Company], Policy #[Number]. Coverage: $[Amount] per occurrence. Policy specifically endorses BVLOS operations. Certificate of Insurance attached. Expiry: [Date].'
    },
    {
      id: 'req-030',
      category: 'crew',
      order: 10,
      text: 'Describe any previous SFOC history or BVLOS operational experience.',
      shortText: 'SFOC / BVLOS Experience',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Include previous SFOCs held, number of BVLOS flight hours, and any relevant operational history.',
      responseType: 'text',
      required: false,
      helpText: 'Operational experience demonstrates capability.',
      exampleResponse: 'Previous SFOCs: [List previous SFOC numbers and purposes]. Total BVLOS flight hours: [Hours]. Operations conducted without incident since [Year]. Reference letters available upon request.'
    },
    {
      id: 'req-031',
      category: 'crew',
      order: 11,
      text: 'Provide proposed SFOC validity period and operational dates.',
      shortText: 'SFOC Validity Period',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Specify requested start date, end date, and any seasonal or schedule limitations.',
      responseType: 'text',
      required: true,
      helpText: 'Specify the period for which SFOC approval is requested.',
      exampleResponse: 'Requested validity period: [Start Date] to [End Date] (12 months). Operations expected: [Frequency, e.g., 2-3 times per month during summer season]. Request renewal process details if available.'
    },
    {
      id: 'req-032',
      category: 'crew',
      order: 12,
      text: 'Describe how compliance with SFOC conditions will be monitored and maintained.',
      shortText: 'Compliance Monitoring',
      regulatoryRef: 'CAR 903.02',
      guidance: 'Explain the internal audit or monitoring processes to ensure ongoing SFOC compliance.',
      responseType: 'document-reference',
      required: true,
      suggestedPolicies: ['1012', '1045', '1053'],
      helpText: 'Ongoing compliance monitoring is expected.',
      exampleResponse: 'Compliance maintained through: 1) Pre-flight SFOC conditions review. 2) Flight logs documenting compliance with conditions. 3) Quarterly internal audit of SFOC requirements. 4) Document control system for current procedures. 5) Training records verification. See Quality Assurance Manual.'
    }
  ],

  // Export configuration
  exportFormat: {
    type: 'matrix',
    columns: ['requirement', 'response', 'documentRef'],
    includeGuidance: false,
    tcFormNumber: '26-0835'
  },

  // Related templates
  relatedTemplates: ['sfoc-25kg-903-01a', 'sfoc-night-ops'],

  // Status
  status: 'active',
  isPublic: true
}

// ============================================
// SEED FUNCTIONS
// ============================================

/**
 * Seed all compliance templates
 * @param {string} userId - User performing the seed
 * @returns {Promise<Object>} Result with counts
 */
export async function seedAllComplianceTemplates(userId = null) {
  const results = {
    success: true,
    seeded: [],
    errors: []
  }

  const templates = [
    SFOC_BVLOS_TEMPLATE
  ]

  for (const template of templates) {
    try {
      await seedComplianceTemplate({
        ...template,
        createdBy: userId,
        updatedBy: userId
      })
      results.seeded.push(template.id)
    } catch (error) {
      console.error(`Error seeding template ${template.id}:`, error)
      results.errors.push({ id: template.id, error: error.message })
      results.success = false
    }
  }

  return results
}

/**
 * Seed just the SFOC BVLOS template
 * @param {string} userId - User performing the seed
 * @returns {Promise<Object>}
 */
export async function seedSFOCBVLOSTemplate(userId = null) {
  return await seedComplianceTemplate({
    ...SFOC_BVLOS_TEMPLATE,
    createdBy: userId,
    updatedBy: userId
  })
}

export default {
  SFOC_BVLOS_TEMPLATE,
  seedAllComplianceTemplates,
  seedSFOCBVLOSTemplate
}
