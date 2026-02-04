/**
 * defaultFHATemplates.js
 * Default Formal Hazard Assessment templates
 *
 * These templates are seeded to user accounts on setup and can be customized.
 * Content placeholders use {COMPANY_NAME}, {CONTACT_EMAIL}, etc. for white-labeling.
 *
 * Categories:
 * - personnel: Personnel safety and working conditions
 * - flight_ops: Standard flight operations
 * - environmental: Environmental and weather conditions
 * - equipment: Equipment handling and maintenance
 * - site_hazards: Site-specific hazards
 * - emergency: Emergency response procedures
 * - specialized: Specialized operation types
 *
 * @location src/data/defaultFHATemplates.js
 */

// ============================================
// FHA CATEGORY MAPPING
// ============================================

export const FHA_CATEGORY_MAP = {
  '1': 'personnel',      // Personnel safety
  '2': 'flight_ops',     // Flight operations
  '3': 'environmental',  // Environmental/special conditions
  '4': 'equipment',      // Equipment and emergency
  '5': 'site_hazards',   // Site operations
  '6': 'specialized',    // Marine/payload/specialized
  '7': 'specialized'     // Industrial/construction
}

// ============================================
// DEFAULT FHA TEMPLATES
// ============================================

export const DEFAULT_FHA_TEMPLATES = [
  // ==========================================
  // SECTION 1: PERSONNEL SAFETY
  // ==========================================
  {
    fhaNumber: 'FHA-1.8',
    title: 'Remote Camp Operations',
    category: 'personnel',
    description: 'Hazard assessment for RPAS operations conducted from remote camp locations with limited access to emergency services and communications.',
    consequences: 'Delayed emergency response, isolation-related incidents, inadequate medical support, communication failures, wildlife encounters.',
    likelihood: 3,
    severity: 4,
    riskScore: 12,
    controlMeasures: [
      { type: 'administrative', description: 'Satellite communication device required for all remote operations', responsible: 'PIC' },
      { type: 'administrative', description: 'Detailed emergency response plan specific to remote location', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'Check-in schedule with base operations every 2 hours', responsible: 'PIC' },
      { type: 'ppe', description: 'Personal locator beacon (PLB) for each crew member', responsible: 'All Crew' },
      { type: 'administrative', description: 'First aid trained personnel on site at all times', responsible: 'Operations Manager' },
      { type: 'engineering', description: 'Bear spray and wildlife deterrents available', responsible: 'PIC' }
    ],
    residualLikelihood: 2,
    residualSeverity: 3,
    residualRiskScore: 6,
    keywords: ['remote', 'camp', 'isolated', 'wilderness', 'satellite', 'emergency'],
    regulatoryRefs: ['CARs 901', 'OH&S Act'],
    applicableOperations: ['Remote surveys', 'Wilderness mapping', 'Resource exploration']
  },
  {
    fhaNumber: 'FHA-1.9',
    title: 'Working Alone',
    category: 'personnel',
    description: 'Hazard assessment for solo RPAS operations where a single crew member operates without immediate support or supervision.',
    consequences: 'Delayed response to medical emergencies, inability to manage equipment failures, increased workload errors, fatigue-related incidents.',
    likelihood: 3,
    severity: 4,
    riskScore: 12,
    controlMeasures: [
      { type: 'administrative', description: 'Working alone plan filed with operations base before deployment', responsible: 'PIC' },
      { type: 'administrative', description: 'Regular check-in schedule (minimum every 30 minutes)', responsible: 'PIC' },
      { type: 'administrative', description: 'Automatic man-down alert device worn', responsible: 'PIC' },
      { type: 'administrative', description: 'Site-specific emergency contacts identified and communicated', responsible: 'Operations Manager' },
      { type: 'ppe', description: 'First aid kit and personal protective equipment available', responsible: 'PIC' },
      { type: 'administrative', description: 'Maximum solo flight duration limits enforced (4 hours)', responsible: 'Operations Manager' }
    ],
    residualLikelihood: 2,
    residualSeverity: 3,
    residualRiskScore: 6,
    keywords: ['solo', 'alone', 'single operator', 'check-in', 'man-down'],
    regulatoryRefs: ['OH&S Working Alone Regulations', 'CARs 901'],
    applicableOperations: ['Survey operations', 'Inspection flights', 'Monitoring']
  },

  // ==========================================
  // SECTION 2: FLIGHT OPERATIONS
  // ==========================================
  {
    fhaNumber: 'FHA-2.1',
    title: 'Wildlife Encounters',
    category: 'flight_ops',
    description: 'Hazard assessment for RPAS operations in areas with potential wildlife encounters including birds, large mammals, and other animals that may interfere with operations.',
    consequences: 'Bird strikes causing aircraft damage or loss, ground crew injuries from wildlife, disrupted operations, environmental harm.',
    likelihood: 3,
    severity: 3,
    riskScore: 9,
    controlMeasures: [
      { type: 'administrative', description: 'Pre-flight wildlife assessment and observation period', responsible: 'PIC' },
      { type: 'administrative', description: 'Maintain awareness of bird migration patterns and nesting areas', responsible: 'PIC' },
      { type: 'administrative', description: 'Avoid operations during peak wildlife activity times (dawn/dusk)', responsible: 'Operations Manager' },
      { type: 'engineering', description: 'Visual observers positioned to monitor for wildlife approach', responsible: 'VO' },
      { type: 'ppe', description: 'Bear spray available in wildlife areas', responsible: 'All Crew' },
      { type: 'administrative', description: 'Immediate landing procedures if wildlife conflict detected', responsible: 'PIC' }
    ],
    residualLikelihood: 2,
    residualSeverity: 2,
    residualRiskScore: 4,
    keywords: ['wildlife', 'birds', 'animals', 'bear', 'migration', 'nesting'],
    regulatoryRefs: ['CARs 901', 'Wildlife Act'],
    applicableOperations: ['Rural operations', 'Environmental surveys', 'Pipeline inspection']
  },
  {
    fhaNumber: 'FHA-2.2',
    title: 'Uneven Terrain - Slips, Trips and Falls',
    category: 'flight_ops',
    description: 'Hazard assessment for ground operations on uneven, unstable, or hazardous terrain that presents slip, trip, and fall risks to crew members.',
    consequences: 'Musculoskeletal injuries, sprains, fractures, head injuries, equipment damage from falls.',
    likelihood: 3,
    severity: 3,
    riskScore: 9,
    controlMeasures: [
      { type: 'administrative', description: 'Pre-operation site walk to identify terrain hazards', responsible: 'PIC' },
      { type: 'ppe', description: 'Appropriate footwear with ankle support and non-slip soles', responsible: 'All Crew' },
      { type: 'administrative', description: 'Clear walking paths established to/from launch areas', responsible: 'PIC' },
      { type: 'administrative', description: 'Three points of contact maintained on slopes', responsible: 'All Crew' },
      { type: 'engineering', description: 'Portable ground mats for unstable launch areas', responsible: 'PIC' },
      { type: 'administrative', description: 'Operations suspended during poor visibility conditions', responsible: 'PIC' }
    ],
    residualLikelihood: 2,
    residualSeverity: 2,
    residualRiskScore: 4,
    keywords: ['terrain', 'slips', 'trips', 'falls', 'footwear', 'uneven ground'],
    regulatoryRefs: ['OH&S Act'],
    applicableOperations: ['Field operations', 'Survey work', 'Construction sites']
  },
  {
    fhaNumber: 'FHA-2.3',
    title: 'General Outdoor Hazards',
    category: 'flight_ops',
    description: 'Hazard assessment for general outdoor environmental hazards including sun exposure, heat stress, cold stress, insects, and vegetation hazards.',
    consequences: 'Heat stroke, hypothermia, sunburn, insect bites/stings, allergic reactions, dehydration.',
    likelihood: 3,
    severity: 3,
    riskScore: 9,
    controlMeasures: [
      { type: 'administrative', description: 'Weather monitoring and environmental condition assessment', responsible: 'PIC' },
      { type: 'ppe', description: 'Sun protection (hat, sunscreen, sunglasses) in summer operations', responsible: 'All Crew' },
      { type: 'ppe', description: 'Appropriate cold weather gear for winter operations', responsible: 'All Crew' },
      { type: 'administrative', description: 'Regular hydration breaks scheduled', responsible: 'PIC' },
      { type: 'ppe', description: 'Insect repellent and protective clothing available', responsible: 'All Crew' },
      { type: 'administrative', description: 'Crew medical conditions and allergies documented', responsible: 'Operations Manager' }
    ],
    residualLikelihood: 2,
    residualSeverity: 2,
    residualRiskScore: 4,
    keywords: ['outdoor', 'weather', 'sun', 'heat', 'cold', 'insects', 'hydration'],
    regulatoryRefs: ['OH&S Act'],
    applicableOperations: ['All outdoor RPAS operations']
  },
  {
    fhaNumber: 'FHA-2.4',
    title: 'Pre-Flight Planning and Checks',
    category: 'flight_ops',
    description: 'Hazard assessment for pre-flight planning activities including route planning, airspace verification, weather assessment, and equipment checks.',
    consequences: 'Airspace violations, inadequate mission planning, equipment failures in flight, regulatory non-compliance.',
    likelihood: 2,
    severity: 4,
    riskScore: 8,
    controlMeasures: [
      { type: 'administrative', description: 'Standardized pre-flight checklist completion mandatory', responsible: 'PIC' },
      { type: 'administrative', description: 'NOTAMs reviewed for operational area within 24 hours of flight', responsible: 'PIC' },
      { type: 'administrative', description: 'Weather briefing obtained and documented', responsible: 'PIC' },
      { type: 'administrative', description: 'Airspace authorization verified current and applicable', responsible: 'PIC' },
      { type: 'engineering', description: 'Aircraft systems check completed and logged', responsible: 'PIC' },
      { type: 'administrative', description: 'Emergency procedures reviewed with crew', responsible: 'PIC' }
    ],
    residualLikelihood: 1,
    residualSeverity: 3,
    residualRiskScore: 3,
    keywords: ['pre-flight', 'planning', 'checklist', 'NOTAMs', 'weather', 'airspace'],
    regulatoryRefs: ['CARs 901.29', 'CARs 901.30'],
    applicableOperations: ['All RPAS operations']
  },
  {
    fhaNumber: 'FHA-2.5',
    title: 'Standard Flight Operations',
    category: 'flight_ops',
    description: 'Hazard assessment for standard VLOS flight operations including takeoff, flight, and landing procedures under normal conditions.',
    consequences: 'Aircraft loss of control, flyaway, collision with obstacles, injury to crew or bystanders, property damage.',
    likelihood: 2,
    severity: 4,
    riskScore: 8,
    controlMeasures: [
      { type: 'administrative', description: 'Flight area surveyed and obstacles identified', responsible: 'PIC' },
      { type: 'administrative', description: 'Visual observers positioned for complete airspace coverage', responsible: 'PIC' },
      { type: 'engineering', description: 'Return-to-home settings verified and tested', responsible: 'PIC' },
      { type: 'administrative', description: 'Minimum safe distances maintained from people and obstacles', responsible: 'PIC' },
      { type: 'engineering', description: 'Geofencing enabled for flight area boundaries', responsible: 'PIC' },
      { type: 'administrative', description: 'Clear communication protocol between PIC and VO', responsible: 'PIC' }
    ],
    residualLikelihood: 1,
    residualSeverity: 3,
    residualRiskScore: 3,
    keywords: ['VLOS', 'standard', 'flight', 'takeoff', 'landing', 'operations'],
    regulatoryRefs: ['CARs 901.24', 'CARs 901.25'],
    applicableOperations: ['Standard VLOS operations']
  },
  {
    fhaNumber: 'FHA-2.6',
    title: 'Post-Flight Procedures',
    category: 'flight_ops',
    description: 'Hazard assessment for post-flight activities including aircraft shutdown, battery removal, equipment inspection, and data handling.',
    consequences: 'Battery thermal events, equipment damage from improper storage, data loss, injury during equipment handling.',
    likelihood: 2,
    severity: 3,
    riskScore: 6,
    controlMeasures: [
      { type: 'administrative', description: 'Post-flight checklist completion mandatory', responsible: 'PIC' },
      { type: 'administrative', description: 'Allow motors to cool before handling aircraft', responsible: 'PIC' },
      { type: 'engineering', description: 'Battery inspection for damage, swelling, or heat', responsible: 'PIC' },
      { type: 'administrative', description: 'Flight logs completed immediately after operation', responsible: 'PIC' },
      { type: 'administrative', description: 'Data backup procedures followed', responsible: 'PIC' },
      { type: 'engineering', description: 'Equipment stored in appropriate cases and conditions', responsible: 'All Crew' }
    ],
    residualLikelihood: 1,
    residualSeverity: 2,
    residualRiskScore: 2,
    keywords: ['post-flight', 'shutdown', 'battery', 'storage', 'data', 'inspection'],
    regulatoryRefs: ['CARs 901', 'Manufacturer guidelines'],
    applicableOperations: ['All RPAS operations']
  },
  {
    fhaNumber: 'FHA-2.7',
    title: 'BVLOS Operations',
    category: 'flight_ops',
    description: 'Hazard assessment for Beyond Visual Line of Sight operations. May be conducted under Level 1 Complex (RPOC) for low-risk scenarios or SFOC for higher-risk operations.',
    consequences: 'Loss of aircraft awareness, collision with manned aircraft, inability to detect obstacles, extended emergency response time.',
    likelihood: 3,
    severity: 5,
    riskScore: 15,
    controlMeasures: [
      { type: 'administrative', description: 'Valid BVLOS authorization (SFOC or Level 1 Complex RPOC) obtained', responsible: 'Operations Manager' },
      { type: 'engineering', description: 'Detect and Avoid (DAA) system operational and tested', responsible: 'PIC' },
      { type: 'administrative', description: 'Ground-based visual observers positioned along route', responsible: 'PIC' },
      { type: 'engineering', description: 'Redundant command and control links verified', responsible: 'PIC' },
      { type: 'administrative', description: 'ATC coordination completed where required', responsible: 'PIC' },
      { type: 'engineering', description: 'ADS-B or equivalent tracking system operational', responsible: 'PIC' },
      { type: 'administrative', description: 'Lost link procedures tested and understood', responsible: 'All Crew' }
    ],
    residualLikelihood: 2,
    residualSeverity: 4,
    residualRiskScore: 8,
    keywords: ['BVLOS', 'beyond visual', 'DAA', 'detect avoid', 'lost link', 'Level 1 Complex', 'RPOC'],
    regulatoryRefs: ['CARs 901 SFOC', 'BVLOS Authorization', 'Level 1 Complex RPOC'],
    applicableOperations: ['BVLOS surveys', 'Linear inspections', 'Extended range operations']
  },
  {
    fhaNumber: 'FHA-2.8',
    title: 'Operations Over People',
    category: 'flight_ops',
    description: 'Hazard assessment for RPAS operations conducted over or near uninvolved persons requiring enhanced safety measures.',
    consequences: 'Injury to persons from falling aircraft or debris, liability exposure, regulatory violations.',
    likelihood: 2,
    severity: 5,
    riskScore: 10,
    controlMeasures: [
      { type: 'administrative', description: 'Operations limited to aircraft certified for flight over people', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'Ground risk buffer calculations completed', responsible: 'PIC' },
      { type: 'engineering', description: 'Parachute recovery system operational (if equipped)', responsible: 'PIC' },
      { type: 'administrative', description: 'Area secured with barriers and signage where possible', responsible: 'PIC' },
      { type: 'administrative', description: 'Spotters positioned to warn of approaching persons', responsible: 'PIC' },
      { type: 'administrative', description: 'Immediate landing capability demonstrated', responsible: 'PIC' }
    ],
    residualLikelihood: 1,
    residualSeverity: 4,
    residualRiskScore: 4,
    keywords: ['over people', 'bystanders', 'public', 'ground risk', 'parachute'],
    regulatoryRefs: ['CARs 901.26', 'SFOC Conditions'],
    applicableOperations: ['Events', 'Urban operations', 'Public areas']
  },
  {
    fhaNumber: 'FHA-2.9',
    title: 'Controlled Airspace Operations',
    category: 'flight_ops',
    description: 'Hazard assessment for RPAS operations within controlled airspace requiring ATC coordination and authorization.',
    consequences: 'Conflict with manned aircraft, airspace violations, regulatory penalties, mid-air collision risk.',
    likelihood: 2,
    severity: 5,
    riskScore: 10,
    controlMeasures: [
      { type: 'administrative', description: 'NAV CANADA authorization obtained prior to flight', responsible: 'PIC' },
      { type: 'administrative', description: 'ATC contact established and maintained', responsible: 'PIC' },
      { type: 'engineering', description: 'Transponder or ADS-B operational where required', responsible: 'PIC' },
      { type: 'administrative', description: 'Radio communications capability verified', responsible: 'PIC' },
      { type: 'administrative', description: 'Altitude limits strictly observed', responsible: 'PIC' },
      { type: 'administrative', description: 'Immediate landing capability on ATC instruction', responsible: 'PIC' }
    ],
    residualLikelihood: 1,
    residualSeverity: 4,
    residualRiskScore: 4,
    keywords: ['controlled airspace', 'ATC', 'NAV CANADA', 'authorization', 'Class C', 'Class D'],
    regulatoryRefs: ['CARs 901.64', 'CARs 901.65'],
    applicableOperations: ['Airport proximity', 'Urban operations', 'Special events']
  },

  // ==========================================
  // SECTION 3: ENVIRONMENTAL/SPECIAL CONDITIONS
  // ==========================================
  {
    fhaNumber: 'FHA-3.1',
    title: 'Night Operations',
    category: 'environmental',
    description: 'Hazard assessment for RPAS operations conducted during night hours with reduced visibility conditions.',
    consequences: 'Reduced situational awareness, difficulty detecting obstacles, disorientation, wildlife strikes.',
    likelihood: 3,
    severity: 4,
    riskScore: 12,
    controlMeasures: [
      { type: 'administrative', description: 'Night operations SFOC or equivalent authorization obtained', responsible: 'Operations Manager' },
      { type: 'engineering', description: 'Aircraft lighting systems verified operational', responsible: 'PIC' },
      { type: 'administrative', description: 'Enhanced pre-flight site survey during daylight', responsible: 'PIC' },
      { type: 'ppe', description: 'Crew equipped with headlamps and reflective vests', responsible: 'All Crew' },
      { type: 'administrative', description: 'Reduced maximum flight distance from PIC', responsible: 'PIC' },
      { type: 'engineering', description: 'FPV or enhanced situational awareness systems available', responsible: 'PIC' }
    ],
    residualLikelihood: 2,
    residualSeverity: 3,
    residualRiskScore: 6,
    keywords: ['night', 'darkness', 'lighting', 'visibility', 'illumination'],
    regulatoryRefs: ['CARs 901.43', 'Night Operations SFOC'],
    applicableOperations: ['Emergency response', 'Security', 'Special projects']
  },
  {
    fhaNumber: 'FHA-3.2',
    title: 'Restricted Payloads',
    category: 'environmental',
    description: 'Hazard assessment for operations involving restricted or hazardous payloads including dangerous goods or sensitive equipment.',
    consequences: 'Payload release, contamination, equipment damage, regulatory violations, injury from payload materials.',
    likelihood: 2,
    severity: 4,
    riskScore: 8,
    controlMeasures: [
      { type: 'administrative', description: 'Payload authorization and permits verified', responsible: 'Operations Manager' },
      { type: 'engineering', description: 'Secure mounting and release mechanisms tested', responsible: 'PIC' },
      { type: 'administrative', description: 'Material Safety Data Sheets available for hazardous payloads', responsible: 'PIC' },
      { type: 'ppe', description: 'Appropriate PPE for payload handling', responsible: 'All Crew' },
      { type: 'administrative', description: 'Emergency procedures for payload release/failure documented', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'Restricted area established under flight path', responsible: 'PIC' }
    ],
    residualLikelihood: 1,
    residualSeverity: 3,
    residualRiskScore: 3,
    keywords: ['payload', 'dangerous goods', 'hazardous', 'restricted', 'release'],
    regulatoryRefs: ['TDG Regulations', 'CARs 901'],
    applicableOperations: ['Spray operations', 'Delivery', 'Specialized sensing']
  },
  {
    fhaNumber: 'FHA-3.3',
    title: 'Near National Defence Aerodromes',
    category: 'environmental',
    description: 'Hazard assessment for operations near military aerodromes and restricted airspace with enhanced security requirements.',
    consequences: 'Security violations, interference with military operations, enforcement action, aircraft interception.',
    likelihood: 2,
    severity: 5,
    riskScore: 10,
    controlMeasures: [
      { type: 'administrative', description: 'DND authorization obtained prior to any operations', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'Security clearance requirements verified', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'Direct communication link with base operations established', responsible: 'PIC' },
      { type: 'administrative', description: 'Flight boundaries strictly defined and monitored', responsible: 'PIC' },
      { type: 'engineering', description: 'Geofencing verified for restricted areas', responsible: 'PIC' },
      { type: 'administrative', description: 'Immediate compliance with military directives', responsible: 'PIC' }
    ],
    residualLikelihood: 1,
    residualSeverity: 4,
    residualRiskScore: 4,
    keywords: ['military', 'defence', 'DND', 'restricted', 'security', 'aerodrome'],
    regulatoryRefs: ['CARs 901.68', 'DND Regulations'],
    applicableOperations: ['Contract work', 'Infrastructure inspection', 'Special authorization']
  },
  {
    fhaNumber: 'FHA-3.4',
    title: 'Advertised Special Events',
    category: 'environmental',
    description: 'Hazard assessment for operations at or near advertised special events with large gatherings and temporary restricted airspace.',
    consequences: 'Airspace violations, interference with event operations, injury to spectators, media/liability exposure.',
    likelihood: 2,
    severity: 5,
    riskScore: 10,
    controlMeasures: [
      { type: 'administrative', description: 'SFOC obtained for event operations', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'Event organizer coordination and authorization documented', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'NOTAMs reviewed for temporary restricted airspace', responsible: 'PIC' },
      { type: 'administrative', description: 'Designated takeoff/landing areas secured', responsible: 'PIC' },
      { type: 'administrative', description: 'Crowd control barriers and safety perimeter established', responsible: 'Event Coordinator' },
      { type: 'engineering', description: 'Backup aircraft and equipment available', responsible: 'PIC' }
    ],
    residualLikelihood: 1,
    residualSeverity: 4,
    residualRiskScore: 4,
    keywords: ['event', 'special event', 'gathering', 'crowd', 'spectators', 'NOTAM'],
    regulatoryRefs: ['CARs 901.52', 'Event SFOC'],
    applicableOperations: ['Media coverage', 'Event documentation', 'Security']
  },
  {
    fhaNumber: 'FHA-3.5',
    title: 'Night Operations (Detailed)',
    category: 'environmental',
    description: 'Comprehensive hazard assessment for night RPAS operations including crew preparation, lighting requirements, and enhanced procedures.',
    consequences: 'Spatial disorientation, obstacle collision, loss of visual reference, crew fatigue.',
    likelihood: 3,
    severity: 4,
    riskScore: 12,
    controlMeasures: [
      { type: 'administrative', description: 'Night-specific crew briefing completed', responsible: 'PIC' },
      { type: 'engineering', description: 'Anti-collision lights verified visible for minimum 3SM', responsible: 'PIC' },
      { type: 'administrative', description: 'Illuminated launch and landing area established', responsible: 'PIC' },
      { type: 'administrative', description: 'Crew dark adaptation period observed', responsible: 'All Crew' },
      { type: 'ppe', description: 'Red/dim flashlights to preserve night vision', responsible: 'All Crew' },
      { type: 'administrative', description: 'Enhanced VO coverage with night vision aids if available', responsible: 'PIC' }
    ],
    residualLikelihood: 2,
    residualSeverity: 3,
    residualRiskScore: 6,
    keywords: ['night', 'anti-collision', 'lighting', 'dark adaptation', 'visibility'],
    regulatoryRefs: ['CARs 901.43', 'Night SFOC'],
    applicableOperations: ['Emergency response', 'Infrastructure', 'Security']
  },
  {
    fhaNumber: 'FHA-3.6',
    title: 'Multi-RPAS Operations',
    category: 'environmental',
    description: 'Hazard assessment for operations involving multiple RPAS aircraft operating simultaneously in the same area.',
    consequences: 'Mid-air collision between RPAS, command interference, loss of situational awareness, control confusion.',
    likelihood: 3,
    severity: 4,
    riskScore: 12,
    controlMeasures: [
      { type: 'administrative', description: 'Multi-aircraft coordination plan developed and briefed', responsible: 'Lead PIC' },
      { type: 'engineering', description: 'Altitude and area deconfliction procedures established', responsible: 'Lead PIC' },
      { type: 'administrative', description: 'Clear radio communication protocol between all PICs', responsible: 'Lead PIC' },
      { type: 'engineering', description: 'Distinct visual identification on each aircraft', responsible: 'PIC' },
      { type: 'administrative', description: 'Sequential launch and recovery procedures', responsible: 'Lead PIC' },
      { type: 'administrative', description: 'Central coordination point for all operations', responsible: 'Lead PIC' }
    ],
    residualLikelihood: 2,
    residualSeverity: 3,
    residualRiskScore: 6,
    keywords: ['multi-RPAS', 'swarm', 'multiple aircraft', 'coordination', 'deconfliction'],
    regulatoryRefs: ['CARs 901', 'SFOC'],
    applicableOperations: ['Large area surveys', 'Show operations', 'Research']
  },
  {
    fhaNumber: 'FHA-3.7',
    title: 'Marine Operations',
    category: 'environmental',
    description: 'Hazard assessment for RPAS operations in marine environments including coastal areas, vessels, and overwater operations.',
    consequences: 'Aircraft loss to water, salt damage to equipment, vessel instability, man overboard, drowning.',
    likelihood: 3,
    severity: 4,
    riskScore: 12,
    controlMeasures: [
      { type: 'administrative', description: 'Marine-specific risk assessment completed', responsible: 'PIC' },
      { type: 'engineering', description: 'Waterproof or water-resistant aircraft where possible', responsible: 'Operations Manager' },
      { type: 'ppe', description: 'Personal flotation devices worn by all crew on vessels', responsible: 'All Crew' },
      { type: 'administrative', description: 'Float plan filed for vessel operations', responsible: 'Vessel Master' },
      { type: 'engineering', description: 'Equipment secured against vessel movement', responsible: 'PIC' },
      { type: 'administrative', description: 'Weather and sea state limits established and monitored', responsible: 'PIC' }
    ],
    residualLikelihood: 2,
    residualSeverity: 3,
    residualRiskScore: 6,
    keywords: ['marine', 'coastal', 'vessel', 'overwater', 'salt', 'boat'],
    regulatoryRefs: ['CARs 901', 'Marine Safety Regulations'],
    applicableOperations: ['Marine surveys', 'Coastal mapping', 'Vessel inspection']
  },
  {
    fhaNumber: 'FHA-3.8',
    title: 'Arctic/Extreme Cold Operations',
    category: 'environmental',
    description: 'Hazard assessment for RPAS operations in arctic conditions or extreme cold temperatures affecting equipment and personnel.',
    consequences: 'Battery failure, equipment malfunction, frostbite, hypothermia, reduced flight times.',
    likelihood: 3,
    severity: 4,
    riskScore: 12,
    controlMeasures: [
      { type: 'engineering', description: 'Cold weather battery management procedures implemented', responsible: 'PIC' },
      { type: 'ppe', description: 'Appropriate extreme cold weather PPE for all crew', responsible: 'All Crew' },
      { type: 'administrative', description: 'Reduced flight times calculated for temperature', responsible: 'PIC' },
      { type: 'engineering', description: 'Battery warming systems utilized before flight', responsible: 'PIC' },
      { type: 'administrative', description: 'Shelter and warming facilities available on site', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'Cold stress monitoring protocol in place', responsible: 'PIC' }
    ],
    residualLikelihood: 2,
    residualSeverity: 3,
    residualRiskScore: 6,
    keywords: ['arctic', 'cold', 'winter', 'hypothermia', 'frostbite', 'battery'],
    regulatoryRefs: ['OH&S Cold Stress', 'CARs 901'],
    applicableOperations: ['Northern operations', 'Winter surveys', 'Arctic research']
  },
  {
    fhaNumber: 'FHA-3.9',
    title: 'Wildfire/Hazardous Environment Operations',
    category: 'environmental',
    description: 'Hazard assessment for RPAS operations in or near wildfire zones or other hazardous environmental conditions.',
    consequences: 'Smoke inhalation, burn injuries, aircraft loss, interference with firefighting operations, equipment damage.',
    likelihood: 3,
    severity: 5,
    riskScore: 15,
    controlMeasures: [
      { type: 'administrative', description: 'Coordination with fire management authorities mandatory', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'TFR and NOTAM review for fire areas', responsible: 'PIC' },
      { type: 'ppe', description: 'Fire-resistant PPE and respiratory protection available', responsible: 'All Crew' },
      { type: 'administrative', description: 'Minimum safe distance from active fire maintained', responsible: 'PIC' },
      { type: 'administrative', description: 'Immediate evacuation plan established', responsible: 'PIC' },
      { type: 'engineering', description: 'Air quality monitoring equipment available', responsible: 'PIC' }
    ],
    residualLikelihood: 2,
    residualSeverity: 4,
    residualRiskScore: 8,
    keywords: ['wildfire', 'fire', 'smoke', 'hazardous', 'TFR', 'emergency'],
    regulatoryRefs: ['CARs 601.15', 'Emergency Operations'],
    applicableOperations: ['Fire mapping', 'Emergency support', 'Damage assessment']
  },

  // ==========================================
  // SECTION 4: EQUIPMENT AND EMERGENCY
  // ==========================================
  {
    fhaNumber: 'FHA-4.1',
    title: 'Confined Space Industrial',
    category: 'equipment',
    description: 'Hazard assessment for RPAS operations within confined industrial spaces requiring specialized procedures.',
    consequences: 'GPS denial, signal loss, obstacle collision, atmospheric hazards, rescue complications.',
    likelihood: 3,
    severity: 4,
    riskScore: 12,
    controlMeasures: [
      { type: 'administrative', description: 'Confined space entry procedures followed', responsible: 'PIC' },
      { type: 'engineering', description: 'Aircraft capable of non-GPS flight modes', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'Atmospheric testing completed before entry', responsible: 'Safety Officer' },
      { type: 'engineering', description: 'Lighting systems adequate for confined space', responsible: 'PIC' },
      { type: 'administrative', description: 'Rescue plan and equipment in place', responsible: 'Safety Officer' },
      { type: 'administrative', description: 'Limited personnel in confined space during operations', responsible: 'PIC' }
    ],
    residualLikelihood: 2,
    residualSeverity: 3,
    residualRiskScore: 6,
    keywords: ['confined space', 'industrial', 'GPS denial', 'atmospheric', 'indoor'],
    regulatoryRefs: ['OH&S Confined Space', 'CARs 901'],
    applicableOperations: ['Tank inspection', 'Industrial facility', 'Infrastructure']
  },
  {
    fhaNumber: 'FHA-4.2',
    title: 'Search and Rescue Operations',
    category: 'equipment',
    description: 'Hazard assessment for RPAS deployment in support of search and rescue missions.',
    consequences: 'Interference with SAR operations, crew exhaustion, hazardous terrain exposure, delayed response.',
    likelihood: 3,
    severity: 4,
    riskScore: 12,
    controlMeasures: [
      { type: 'administrative', description: 'Integration with SAR incident command structure', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'Clear communication channels with ground teams', responsible: 'PIC' },
      { type: 'engineering', description: 'Thermal imaging and spotlight capabilities verified', responsible: 'PIC' },
      { type: 'administrative', description: 'Crew rotation and rest periods enforced', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'Airspace coordination with SAR aircraft', responsible: 'PIC' },
      { type: 'ppe', description: 'Crew equipped for extended field operations', responsible: 'All Crew' }
    ],
    residualLikelihood: 2,
    residualSeverity: 3,
    residualRiskScore: 6,
    keywords: ['SAR', 'search rescue', 'emergency', 'thermal', 'missing person'],
    regulatoryRefs: ['CARs 901', 'SAR Protocols'],
    applicableOperations: ['SAR support', 'Emergency response', 'Missing persons']
  },
  {
    fhaNumber: 'FHA-4.3',
    title: 'Battery Handling and Charging',
    category: 'equipment',
    description: 'Hazard assessment for LiPo/Li-ion battery handling, charging, storage, and transportation.',
    consequences: 'Battery fire, thermal runaway, chemical burns, explosion, property damage.',
    likelihood: 2,
    severity: 5,
    riskScore: 10,
    controlMeasures: [
      { type: 'engineering', description: 'Fireproof battery charging bags/containers used', responsible: 'PIC' },
      { type: 'administrative', description: 'Battery inspection before each charge cycle', responsible: 'PIC' },
      { type: 'administrative', description: 'Charging conducted in ventilated area away from flammables', responsible: 'PIC' },
      { type: 'engineering', description: 'Fire extinguisher (Class D or appropriate) available', responsible: 'PIC' },
      { type: 'administrative', description: 'Batteries stored at appropriate charge level (40-60%)', responsible: 'PIC' },
      { type: 'administrative', description: 'Damaged batteries quarantined and disposed properly', responsible: 'PIC' }
    ],
    residualLikelihood: 1,
    residualSeverity: 4,
    residualRiskScore: 4,
    keywords: ['battery', 'LiPo', 'charging', 'fire', 'thermal runaway', 'storage'],
    regulatoryRefs: ['TDG Regulations', 'Manufacturer Guidelines'],
    applicableOperations: ['All RPAS operations']
  },
  {
    fhaNumber: 'FHA-4.4',
    title: 'RPAS Maintenance and Inspection',
    category: 'equipment',
    description: 'Hazard assessment for aircraft maintenance, inspection, and repair activities.',
    consequences: 'Equipment malfunction, maintenance errors, electrical shock, cuts and injuries.',
    likelihood: 2,
    severity: 3,
    riskScore: 6,
    controlMeasures: [
      { type: 'administrative', description: 'Maintenance performed per manufacturer guidelines', responsible: 'PIC' },
      { type: 'administrative', description: 'Maintenance log entries completed', responsible: 'PIC' },
      { type: 'engineering', description: 'Propellers removed before maintenance', responsible: 'PIC' },
      { type: 'administrative', description: 'Battery disconnected during maintenance', responsible: 'PIC' },
      { type: 'ppe', description: 'Safety glasses and gloves worn as appropriate', responsible: 'Technician' },
      { type: 'administrative', description: 'Post-maintenance test flight in safe area', responsible: 'PIC' }
    ],
    residualLikelihood: 1,
    residualSeverity: 2,
    residualRiskScore: 2,
    keywords: ['maintenance', 'inspection', 'repair', 'propeller', 'servicing'],
    regulatoryRefs: ['CARs 901.30', 'Manufacturer Guidelines'],
    applicableOperations: ['All RPAS maintenance']
  },
  {
    fhaNumber: 'FHA-4.5',
    title: 'Equipment Transport and Storage',
    category: 'equipment',
    description: 'Hazard assessment for RPAS equipment transportation, vehicle loading, and storage procedures.',
    consequences: 'Equipment damage, vehicle accidents, improper battery transport, theft or loss.',
    likelihood: 2,
    severity: 3,
    riskScore: 6,
    controlMeasures: [
      { type: 'engineering', description: 'Equipment secured in protective cases', responsible: 'All Crew' },
      { type: 'administrative', description: 'Vehicle loading checklist used', responsible: 'PIC' },
      { type: 'administrative', description: 'Batteries transported per TDG requirements', responsible: 'PIC' },
      { type: 'engineering', description: 'Cases secured to prevent shifting during transport', responsible: 'Driver' },
      { type: 'administrative', description: 'Equipment inventory before and after transport', responsible: 'PIC' },
      { type: 'administrative', description: 'Secure storage location with access control', responsible: 'Operations Manager' }
    ],
    residualLikelihood: 1,
    residualSeverity: 2,
    residualRiskScore: 2,
    keywords: ['transport', 'storage', 'vehicle', 'cases', 'loading', 'security'],
    regulatoryRefs: ['TDG Regulations', 'OH&S'],
    applicableOperations: ['All RPAS operations']
  },
  {
    fhaNumber: 'FHA-4.6',
    title: 'Payload and Sensor Operations',
    category: 'equipment',
    description: 'Hazard assessment for installation, operation, and removal of payloads and sensors including cameras, LiDAR, and specialized equipment.',
    consequences: 'Payload detachment, sensor damage, altered flight characteristics, data loss.',
    likelihood: 2,
    severity: 3,
    riskScore: 6,
    controlMeasures: [
      { type: 'engineering', description: 'Payload mounting hardware inspected before each flight', responsible: 'PIC' },
      { type: 'administrative', description: 'Weight and balance verification with payload', responsible: 'PIC' },
      { type: 'administrative', description: 'Sensor calibration completed per requirements', responsible: 'PIC' },
      { type: 'engineering', description: 'Secondary retention system for heavy payloads', responsible: 'PIC' },
      { type: 'administrative', description: 'Flight characteristics tested after payload change', responsible: 'PIC' },
      { type: 'ppe', description: 'Gloves worn when handling sensors', responsible: 'Technician' }
    ],
    residualLikelihood: 1,
    residualSeverity: 2,
    residualRiskScore: 2,
    keywords: ['payload', 'sensor', 'camera', 'LiDAR', 'mounting', 'calibration'],
    regulatoryRefs: ['Manufacturer Guidelines', 'CARs 901'],
    applicableOperations: ['Survey', 'Inspection', 'Mapping']
  },
  {
    fhaNumber: 'FHA-4.7',
    title: 'First Aid and Medical Emergency',
    category: 'emergency',
    description: 'Hazard assessment for medical emergencies during RPAS operations and first aid response procedures.',
    consequences: 'Delayed medical treatment, improper first aid, evacuation challenges, fatality.',
    likelihood: 2,
    severity: 4,
    riskScore: 8,
    controlMeasures: [
      { type: 'administrative', description: 'First aid trained crew member on site', responsible: 'Operations Manager' },
      { type: 'engineering', description: 'First aid kit appropriate for operation type available', responsible: 'PIC' },
      { type: 'administrative', description: 'Emergency contact numbers documented and accessible', responsible: 'PIC' },
      { type: 'administrative', description: 'Site location and access routes documented for EMS', responsible: 'PIC' },
      { type: 'administrative', description: 'Crew medical conditions and allergies known', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'AED available for higher risk operations', responsible: 'Operations Manager' }
    ],
    residualLikelihood: 1,
    residualSeverity: 3,
    residualRiskScore: 3,
    keywords: ['first aid', 'medical', 'emergency', 'AED', 'evacuation', 'injury'],
    regulatoryRefs: ['OH&S First Aid Regulations'],
    applicableOperations: ['All RPAS operations']
  },
  {
    fhaNumber: 'FHA-4.8',
    title: 'Fire Emergency Response',
    category: 'emergency',
    description: 'Hazard assessment for fire emergencies during RPAS operations including battery fires and field fires.',
    consequences: 'Burns, smoke inhalation, equipment loss, property damage, environmental damage.',
    likelihood: 2,
    severity: 4,
    riskScore: 8,
    controlMeasures: [
      { type: 'engineering', description: 'Fire extinguisher available at operations site', responsible: 'PIC' },
      { type: 'administrative', description: 'Fire emergency procedures briefed to crew', responsible: 'PIC' },
      { type: 'administrative', description: 'Emergency services contact information available', responsible: 'PIC' },
      { type: 'engineering', description: 'Battery fire containment equipment available', responsible: 'PIC' },
      { type: 'administrative', description: 'Evacuation routes identified and communicated', responsible: 'PIC' },
      { type: 'administrative', description: 'Fire ban status checked for outdoor operations', responsible: 'PIC' }
    ],
    residualLikelihood: 1,
    residualSeverity: 3,
    residualRiskScore: 3,
    keywords: ['fire', 'emergency', 'extinguisher', 'battery fire', 'evacuation'],
    regulatoryRefs: ['Fire Code', 'OH&S'],
    applicableOperations: ['All RPAS operations']
  },
  {
    fhaNumber: 'FHA-4.9',
    title: 'Incident/Accident Response',
    category: 'emergency',
    description: 'Hazard assessment for response procedures following RPAS incidents or accidents.',
    consequences: 'Secondary injuries, evidence destruction, reporting failures, liability exposure.',
    likelihood: 2,
    severity: 4,
    riskScore: 8,
    controlMeasures: [
      { type: 'administrative', description: 'Incident response procedures documented and trained', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'Scene secured and evidence preserved', responsible: 'PIC' },
      { type: 'administrative', description: 'Transport Canada notification within required timeframe', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'Incident documentation completed promptly', responsible: 'PIC' },
      { type: 'administrative', description: 'Crew welfare checked and supported', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'Root cause investigation initiated', responsible: 'Safety Manager' }
    ],
    residualLikelihood: 1,
    residualSeverity: 3,
    residualRiskScore: 3,
    keywords: ['incident', 'accident', 'response', 'reporting', 'investigation', 'TSB'],
    regulatoryRefs: ['CARs 901.50', 'TSB Reporting'],
    applicableOperations: ['All RPAS operations']
  },

  // ==========================================
  // SECTION 5: SITE OPERATIONS
  // ==========================================
  {
    fhaNumber: 'FHA-5.1',
    title: 'Deploying Ground Control Points (GCPs)',
    category: 'site_hazards',
    description: 'Hazard assessment for deploying and retrieving ground control points for survey operations.',
    consequences: 'Slips and falls, wildlife encounters, traffic hazards, equipment damage, musculoskeletal injuries.',
    likelihood: 3,
    severity: 2,
    riskScore: 6,
    controlMeasures: [
      { type: 'administrative', description: 'GCP locations pre-planned to minimize hazards', responsible: 'PIC' },
      { type: 'ppe', description: 'Hi-vis vest worn when near roads or traffic', responsible: 'All Crew' },
      { type: 'ppe', description: 'Appropriate footwear for terrain', responsible: 'All Crew' },
      { type: 'administrative', description: 'Buddy system for remote GCP placement', responsible: 'PIC' },
      { type: 'administrative', description: 'Wildlife awareness maintained', responsible: 'All Crew' },
      { type: 'administrative', description: 'GCP inventory completed before departing site', responsible: 'PIC' }
    ],
    residualLikelihood: 2,
    residualSeverity: 2,
    residualRiskScore: 4,
    keywords: ['GCP', 'ground control', 'survey', 'targets', 'deployment'],
    regulatoryRefs: ['OH&S'],
    applicableOperations: ['Survey operations', 'Mapping']
  },
  {
    fhaNumber: 'FHA-5.2',
    title: 'Site Setup and Pack Up',
    category: 'site_hazards',
    description: 'Hazard assessment for RPAS operations site setup, equipment deployment, and pack up procedures.',
    consequences: 'Lifting injuries, equipment damage, trip hazards, delays from poor organization.',
    likelihood: 2,
    severity: 2,
    riskScore: 4,
    controlMeasures: [
      { type: 'administrative', description: 'Site setup checklist used', responsible: 'PIC' },
      { type: 'administrative', description: 'Safe lifting techniques used for heavy cases', responsible: 'All Crew' },
      { type: 'administrative', description: 'Equipment organized to minimize trip hazards', responsible: 'PIC' },
      { type: 'administrative', description: 'Pack up inventory completed', responsible: 'PIC' },
      { type: 'engineering', description: 'Equipment cases clearly labeled', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'Weather protection for equipment during setup', responsible: 'PIC' }
    ],
    residualLikelihood: 1,
    residualSeverity: 2,
    residualRiskScore: 2,
    keywords: ['setup', 'pack up', 'deployment', 'organization', 'lifting'],
    regulatoryRefs: ['OH&S'],
    applicableOperations: ['All field operations']
  },
  {
    fhaNumber: 'FHA-5.3',
    title: 'RPAS Operations - VLOS Standard',
    category: 'site_hazards',
    description: 'Hazard assessment for standard Visual Line of Sight RPAS operations under normal conditions.',
    consequences: 'Aircraft loss of control, collision, flyaway, injury to persons, property damage.',
    likelihood: 2,
    severity: 3,
    riskScore: 6,
    controlMeasures: [
      { type: 'administrative', description: 'VLOS maintained at all times', responsible: 'PIC' },
      { type: 'administrative', description: 'Visual observers positioned appropriately', responsible: 'PIC' },
      { type: 'engineering', description: 'Return to home settings verified', responsible: 'PIC' },
      { type: 'administrative', description: 'Weather minimums observed', responsible: 'PIC' },
      { type: 'administrative', description: 'Safe distances from obstacles maintained', responsible: 'PIC' },
      { type: 'administrative', description: 'Emergency procedures briefed', responsible: 'PIC' }
    ],
    residualLikelihood: 1,
    residualSeverity: 2,
    residualRiskScore: 2,
    keywords: ['VLOS', 'standard operations', 'line of sight', 'visual'],
    regulatoryRefs: ['CARs 901.24', 'CARs 901.25'],
    applicableOperations: ['Standard VLOS operations']
  },
  {
    fhaNumber: 'FHA-5.4',
    title: 'RPAS Operations - Class G Airspace',
    category: 'site_hazards',
    description: 'Hazard assessment for RPAS operations in uncontrolled Class G airspace.',
    consequences: 'Conflict with manned aircraft, inadequate see-and-avoid, communication gaps.',
    likelihood: 2,
    severity: 4,
    riskScore: 8,
    controlMeasures: [
      { type: 'administrative', description: 'NOTAMs and airspace activity reviewed', responsible: 'PIC' },
      { type: 'engineering', description: 'Visual observers scanning for aircraft', responsible: 'VO' },
      { type: 'administrative', description: 'Operations below 400ft AGL unless authorized', responsible: 'PIC' },
      { type: 'administrative', description: 'Monitoring of local aviation frequencies where practical', responsible: 'PIC' },
      { type: 'administrative', description: 'Right of way given to all manned aircraft', responsible: 'PIC' },
      { type: 'engineering', description: 'ADS-B In receiver for traffic awareness if available', responsible: 'PIC' }
    ],
    residualLikelihood: 1,
    residualSeverity: 3,
    residualRiskScore: 3,
    keywords: ['Class G', 'uncontrolled', 'airspace', 'see and avoid', 'traffic'],
    regulatoryRefs: ['CARs 901.24', 'CARs 901.38'],
    applicableOperations: ['Rural operations', 'Agricultural', 'Survey']
  },
  {
    fhaNumber: 'FHA-5.5',
    title: 'RPAS Operations - Controlled Ground Risk',
    category: 'site_hazards',
    description: 'Hazard assessment for operations over areas with controlled ground risk through barriers, agreements, or access restrictions.',
    consequences: 'Unauthorized entry to controlled area, injury to ground personnel, equipment damage.',
    likelihood: 2,
    severity: 3,
    riskScore: 6,
    controlMeasures: [
      { type: 'engineering', description: 'Physical barriers in place where required', responsible: 'PIC' },
      { type: 'administrative', description: 'Landowner/site agreements documented', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'Ground team communication established', responsible: 'PIC' },
      { type: 'administrative', description: 'Spotters positioned to enforce exclusion zones', responsible: 'PIC' },
      { type: 'administrative', description: 'Operations suspended if unauthorized persons enter', responsible: 'PIC' },
      { type: 'engineering', description: 'Signage posted at entry points', responsible: 'PIC' }
    ],
    residualLikelihood: 1,
    residualSeverity: 2,
    residualRiskScore: 2,
    keywords: ['controlled', 'ground risk', 'barriers', 'exclusion', 'access'],
    regulatoryRefs: ['CARs 901.26', 'SFOC'],
    applicableOperations: ['Construction', 'Industrial', 'Private property']
  },
  {
    fhaNumber: 'FHA-5.6',
    title: 'High Altitude Operations',
    category: 'site_hazards',
    description: 'Hazard assessment for operations at high elevations affecting personnel and equipment performance.',
    consequences: 'Altitude sickness, reduced aircraft performance, hypoxia, equipment malfunction.',
    likelihood: 2,
    severity: 4,
    riskScore: 8,
    controlMeasures: [
      { type: 'administrative', description: 'Crew acclimatization for high altitude operations', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'Aircraft performance calculations adjusted for altitude', responsible: 'PIC' },
      { type: 'administrative', description: 'Reduced maximum payload for high altitude', responsible: 'PIC' },
      { type: 'ppe', description: 'Supplemental oxygen available above 10,000ft', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'Altitude sickness symptoms monitored', responsible: 'All Crew' },
      { type: 'engineering', description: 'Low altitude props installed if available', responsible: 'PIC' }
    ],
    residualLikelihood: 1,
    residualSeverity: 3,
    residualRiskScore: 3,
    keywords: ['high altitude', 'mountain', 'elevation', 'hypoxia', 'performance'],
    regulatoryRefs: ['CARs 901', 'OH&S'],
    applicableOperations: ['Mountain surveys', 'Mining', 'High elevation sites']
  },
  {
    fhaNumber: 'FHA-5.7',
    title: 'Heavy Lift Operations',
    category: 'site_hazards',
    description: 'Hazard assessment for operations involving heavy lift RPAS or significant payload weights.',
    consequences: 'Aircraft instability, payload drop, ground personnel injury, equipment damage.',
    likelihood: 3,
    severity: 4,
    riskScore: 12,
    controlMeasures: [
      { type: 'administrative', description: 'Weight and balance calculations verified', responsible: 'PIC' },
      { type: 'administrative', description: 'Expanded safety buffer zone established', responsible: 'PIC' },
      { type: 'engineering', description: 'Payload release mechanism tested', responsible: 'PIC' },
      { type: 'administrative', description: 'Ground personnel clear of flight path', responsible: 'PIC' },
      { type: 'administrative', description: 'Enhanced pre-flight checks for lift systems', responsible: 'PIC' },
      { type: 'engineering', description: 'Redundant safety systems verified', responsible: 'PIC' }
    ],
    residualLikelihood: 2,
    residualSeverity: 3,
    residualRiskScore: 6,
    keywords: ['heavy lift', 'payload', 'cargo', 'weight', 'delivery'],
    regulatoryRefs: ['CARs 901', 'SFOC'],
    applicableOperations: ['Cargo delivery', 'Construction support', 'Equipment placement']
  },
  {
    fhaNumber: 'FHA-5.8',
    title: 'Controlled Airspace Operations (Detailed)',
    category: 'site_hazards',
    description: 'Comprehensive hazard assessment for operations within controlled airspace requiring ATC coordination.',
    consequences: 'Near misses with manned aircraft, airspace violations, operational delays, enforcement action.',
    likelihood: 2,
    severity: 5,
    riskScore: 10,
    controlMeasures: [
      { type: 'administrative', description: 'NAV CANADA authorization obtained', responsible: 'PIC' },
      { type: 'administrative', description: 'ATC coordination protocol followed', responsible: 'PIC' },
      { type: 'engineering', description: 'Two-way radio communication capability', responsible: 'PIC' },
      { type: 'administrative', description: 'Contingency plan for communication loss', responsible: 'PIC' },
      { type: 'engineering', description: 'Geofencing confirmed for airspace limits', responsible: 'PIC' },
      { type: 'administrative', description: 'Real-time traffic monitoring where possible', responsible: 'PIC' }
    ],
    residualLikelihood: 1,
    residualSeverity: 4,
    residualRiskScore: 4,
    keywords: ['controlled airspace', 'ATC', 'Class C', 'Class D', 'authorization'],
    regulatoryRefs: ['CARs 901.64', 'CARs 901.65'],
    applicableOperations: ['Airport proximity', 'Urban', 'Events']
  },
  {
    fhaNumber: 'FHA-5.9',
    title: 'Battery Handling, Charging, and Storage (Detailed)',
    category: 'equipment',
    description: 'Comprehensive hazard assessment for all battery handling operations including field charging.',
    consequences: 'Thermal runaway, fire, chemical exposure, battery damage, delayed operations.',
    likelihood: 2,
    severity: 5,
    riskScore: 10,
    controlMeasures: [
      { type: 'engineering', description: 'LiPo safe bags used for all charging', responsible: 'PIC' },
      { type: 'administrative', description: 'Batteries never left unattended during charging', responsible: 'PIC' },
      { type: 'administrative', description: 'Storage charge level maintained (40-60%)', responsible: 'PIC' },
      { type: 'engineering', description: 'Temperature monitoring during charge/discharge', responsible: 'PIC' },
      { type: 'administrative', description: 'Battery cycle count and age tracking', responsible: 'PIC' },
      { type: 'engineering', description: 'Fire suppression equipment immediately available', responsible: 'PIC' }
    ],
    residualLikelihood: 1,
    residualSeverity: 4,
    residualRiskScore: 4,
    keywords: ['battery', 'LiPo', 'charging', 'storage', 'thermal', 'fire'],
    regulatoryRefs: ['TDG Regulations', 'Manufacturer Guidelines'],
    applicableOperations: ['All RPAS operations']
  },

  // ==========================================
  // SECTION 6: SPECIALIZED OPERATIONS
  // ==========================================
  {
    fhaNumber: 'FHA-6.1',
    title: 'Payload Installation and Removal',
    category: 'specialized',
    description: 'Hazard assessment for installation and removal of payloads including sensors, cameras, and specialized equipment.',
    consequences: 'Equipment damage, improper installation, altered flight characteristics, payload loss.',
    likelihood: 2,
    severity: 3,
    riskScore: 6,
    controlMeasures: [
      { type: 'administrative', description: 'Installation checklist followed', responsible: 'PIC' },
      { type: 'administrative', description: 'Manufacturer mounting instructions followed', responsible: 'Technician' },
      { type: 'engineering', description: 'All fasteners properly torqued', responsible: 'Technician' },
      { type: 'administrative', description: 'Weight and balance recalculated', responsible: 'PIC' },
      { type: 'administrative', description: 'Functional test of payload before flight', responsible: 'PIC' },
      { type: 'engineering', description: 'Backup retention system for valuable payloads', responsible: 'PIC' }
    ],
    residualLikelihood: 1,
    residualSeverity: 2,
    residualRiskScore: 2,
    keywords: ['payload', 'installation', 'mounting', 'sensor', 'camera'],
    regulatoryRefs: ['Manufacturer Guidelines'],
    applicableOperations: ['Survey', 'Inspection', 'Specialized sensing']
  },
  {
    fhaNumber: 'FHA-6.2',
    title: 'LiDAR Sensor Equipment Handling',
    category: 'specialized',
    description: 'Hazard assessment for handling LiDAR sensors including laser safety, calibration, and operation.',
    consequences: 'Eye injury from laser, sensor damage, data quality issues, calibration errors.',
    likelihood: 2,
    severity: 4,
    riskScore: 8,
    controlMeasures: [
      { type: 'administrative', description: 'Laser safety training completed by all crew', responsible: 'Operations Manager' },
      { type: 'ppe', description: 'Laser safety eyewear available for sensor class', responsible: 'PIC' },
      { type: 'administrative', description: 'Sensor powered off during handling', responsible: 'Technician' },
      { type: 'administrative', description: 'Nominal Ocular Hazard Distance (NOHD) maintained', responsible: 'PIC' },
      { type: 'engineering', description: 'Laser warning signage posted', responsible: 'PIC' },
      { type: 'administrative', description: 'Calibration verified before operations', responsible: 'PIC' }
    ],
    residualLikelihood: 1,
    residualSeverity: 3,
    residualRiskScore: 3,
    keywords: ['LiDAR', 'laser', 'sensor', 'calibration', 'eye safety'],
    regulatoryRefs: ['Laser Safety Standards', 'OH&S'],
    applicableOperations: ['LiDAR survey', 'Mapping', 'Inspection']
  },
  {
    fhaNumber: 'FHA-6.3',
    title: 'Manual Handling - Heavy Cases',
    category: 'specialized',
    description: 'Hazard assessment for manual handling of heavy equipment cases and RPAS components.',
    consequences: 'Back injuries, muscle strains, dropped equipment, crushing injuries.',
    likelihood: 3,
    severity: 3,
    riskScore: 9,
    controlMeasures: [
      { type: 'administrative', description: 'Two-person lift for cases over 25kg', responsible: 'All Crew' },
      { type: 'engineering', description: 'Wheeled cases used where possible', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'Proper lifting technique used (bend knees)', responsible: 'All Crew' },
      { type: 'engineering', description: 'Lifting aids (cart, dolly) available for heavy loads', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'Clear path established before lifting', responsible: 'All Crew' },
      { type: 'ppe', description: 'Gloves worn when handling cases', responsible: 'All Crew' }
    ],
    residualLikelihood: 2,
    residualSeverity: 2,
    residualRiskScore: 4,
    keywords: ['manual handling', 'lifting', 'cases', 'back injury', 'ergonomic'],
    regulatoryRefs: ['OH&S Manual Handling'],
    applicableOperations: ['All field operations']
  },
  {
    fhaNumber: 'FHA-6.4',
    title: 'Field Equipment Maintenance and Repair',
    category: 'specialized',
    description: 'Hazard assessment for field repairs and maintenance of RPAS equipment.',
    consequences: 'Improper repairs leading to failure, electrical hazards, tool injuries, environmental contamination.',
    likelihood: 2,
    severity: 3,
    riskScore: 6,
    controlMeasures: [
      { type: 'administrative', description: 'Only authorized repairs performed in field', responsible: 'PIC' },
      { type: 'administrative', description: 'Battery disconnected before any work', responsible: 'Technician' },
      { type: 'ppe', description: 'Safety glasses worn during repairs', responsible: 'Technician' },
      { type: 'administrative', description: 'Repairs documented and verified before flight', responsible: 'PIC' },
      { type: 'administrative', description: 'Waste materials properly contained and disposed', responsible: 'All Crew' },
      { type: 'administrative', description: 'Test flight required after significant repairs', responsible: 'PIC' }
    ],
    residualLikelihood: 1,
    residualSeverity: 2,
    residualRiskScore: 2,
    keywords: ['field repair', 'maintenance', 'tools', 'troubleshooting'],
    regulatoryRefs: ['Manufacturer Guidelines', 'CARs 901.30'],
    applicableOperations: ['All field operations']
  },
  {
    fhaNumber: 'FHA-6.5',
    title: 'Small Vessel/Raft Operations',
    category: 'specialized',
    description: 'Hazard assessment for RPAS operations from small vessels, rafts, or inflatable boats.',
    consequences: 'Man overboard, capsizing, equipment loss to water, unstable launch/recovery.',
    likelihood: 3,
    severity: 4,
    riskScore: 12,
    controlMeasures: [
      { type: 'ppe', description: 'Personal flotation devices worn at all times', responsible: 'All Crew' },
      { type: 'administrative', description: 'Vessel stability assessed for RPAS operations', responsible: 'Vessel Operator' },
      { type: 'engineering', description: 'Equipment secured to prevent loss overboard', responsible: 'PIC' },
      { type: 'administrative', description: 'Launch/recovery with vessel stopped or minimal motion', responsible: 'PIC' },
      { type: 'administrative', description: 'Weather and water conditions monitored', responsible: 'Vessel Operator' },
      { type: 'administrative', description: 'Float plan filed with shore contact', responsible: 'Vessel Operator' }
    ],
    residualLikelihood: 2,
    residualSeverity: 3,
    residualRiskScore: 6,
    keywords: ['vessel', 'boat', 'raft', 'marine', 'water', 'flotation'],
    regulatoryRefs: ['Small Vessel Regulations', 'CARs 901'],
    applicableOperations: ['Marine survey', 'Coastal work', 'River operations']
  },
  {
    fhaNumber: 'FHA-6.6',
    title: 'Overwater RPAS Operations',
    category: 'specialized',
    description: 'Hazard assessment for RPAS flights over water bodies where aircraft recovery may not be possible.',
    consequences: 'Aircraft loss to water, data loss, environmental contamination, stranded equipment.',
    likelihood: 3,
    severity: 3,
    riskScore: 9,
    controlMeasures: [
      { type: 'administrative', description: 'Overwater operations risk acceptance documented', responsible: 'Operations Manager' },
      { type: 'engineering', description: 'Flotation system installed where practical', responsible: 'PIC' },
      { type: 'administrative', description: 'Minimum altitude maintained over water', responsible: 'PIC' },
      { type: 'administrative', description: 'Shore-based emergency landing areas identified', responsible: 'PIC' },
      { type: 'administrative', description: 'Data backup frequency increased', responsible: 'PIC' },
      { type: 'engineering', description: 'Visual tracking aids on aircraft', responsible: 'PIC' }
    ],
    residualLikelihood: 2,
    residualSeverity: 2,
    residualRiskScore: 4,
    keywords: ['overwater', 'water', 'ocean', 'lake', 'river', 'flotation'],
    regulatoryRefs: ['CARs 901'],
    applicableOperations: ['Marine survey', 'Coastal mapping', 'Environmental']
  },
  {
    fhaNumber: 'FHA-6.7',
    title: 'Shoreline/Coastal Operations',
    category: 'specialized',
    description: 'Hazard assessment for operations in coastal and shoreline environments.',
    consequences: 'Salt corrosion, sand ingestion, tidal hazards, wind effects, wildlife conflicts.',
    likelihood: 3,
    severity: 3,
    riskScore: 9,
    controlMeasures: [
      { type: 'administrative', description: 'Tidal schedule reviewed for operations', responsible: 'PIC' },
      { type: 'engineering', description: 'Equipment protected from salt spray', responsible: 'PIC' },
      { type: 'administrative', description: 'Wind effects near cliffs considered', responsible: 'PIC' },
      { type: 'administrative', description: 'Post-operation cleaning of equipment', responsible: 'PIC' },
      { type: 'administrative', description: 'Safe distance from water edge maintained', responsible: 'All Crew' },
      { type: 'administrative', description: 'Weather conditions monitored for rapid changes', responsible: 'PIC' }
    ],
    residualLikelihood: 2,
    residualSeverity: 2,
    residualRiskScore: 4,
    keywords: ['coastal', 'shoreline', 'beach', 'salt', 'tidal', 'wind'],
    regulatoryRefs: ['CARs 901'],
    applicableOperations: ['Coastal mapping', 'Erosion monitoring', 'Environmental']
  },
  {
    fhaNumber: 'FHA-6.8',
    title: 'ADCP/Hydrographic Data Collection',
    category: 'specialized',
    description: 'Hazard assessment for RPAS operations supporting hydrographic data collection including ADCP deployments.',
    consequences: 'Equipment loss to water, data quality issues, boat/vessel hazards, sensor damage.',
    likelihood: 3,
    severity: 3,
    riskScore: 9,
    controlMeasures: [
      { type: 'administrative', description: 'Coordination with hydrographic team', responsible: 'PIC' },
      { type: 'engineering', description: 'Waterproof/resistant aircraft and payloads', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'Low altitude operations over water', responsible: 'PIC' },
      { type: 'ppe', description: 'PFDs worn by all crew near water', responsible: 'All Crew' },
      { type: 'administrative', description: 'Weather and current conditions monitored', responsible: 'PIC' },
      { type: 'engineering', description: 'GPS/GNSS positioning verified before data collection', responsible: 'PIC' }
    ],
    residualLikelihood: 2,
    residualSeverity: 2,
    residualRiskScore: 4,
    keywords: ['ADCP', 'hydrographic', 'bathymetric', 'water survey', 'current'],
    regulatoryRefs: ['CARs 901', 'Hydrographic Standards'],
    applicableOperations: ['Bathymetric survey', 'River monitoring', 'Hydrographic']
  },
  {
    fhaNumber: 'FHA-6.9',
    title: 'Mine Site Operations',
    category: 'specialized',
    description: 'Hazard assessment for RPAS operations at active or inactive mine sites.',
    consequences: 'Dust interference, unstable ground, blasting hazards, heavy equipment conflicts, toxic exposure.',
    likelihood: 3,
    severity: 4,
    riskScore: 12,
    controlMeasures: [
      { type: 'administrative', description: 'Mine site safety orientation completed', responsible: 'All Crew' },
      { type: 'administrative', description: 'Coordination with mine operations control', responsible: 'PIC' },
      { type: 'administrative', description: 'Operations suspended during blasting', responsible: 'PIC' },
      { type: 'ppe', description: 'Mine site PPE requirements met (hard hat, steel toes, hi-vis)', responsible: 'All Crew' },
      { type: 'administrative', description: 'Haul truck and equipment movements monitored', responsible: 'VO' },
      { type: 'engineering', description: 'Aircraft filters checked/cleaned for dust', responsible: 'PIC' }
    ],
    residualLikelihood: 2,
    residualSeverity: 3,
    residualRiskScore: 6,
    keywords: ['mine', 'mining', 'quarry', 'blasting', 'dust', 'heavy equipment'],
    regulatoryRefs: ['Mining Safety Regulations', 'CARs 901'],
    applicableOperations: ['Mine survey', 'Stockpile measurement', 'Progress monitoring']
  },
  {
    fhaNumber: 'FHA-6.10',
    title: 'Bathymetric Survey Operations',
    category: 'specialized',
    description: 'Hazard assessment for bathymetric survey operations using sonar equipment from marine vessels.',
    consequences: 'Equipment loss, vessel capsizing, drowning, data quality issues.',
    likelihood: 3,
    severity: 4,
    riskScore: 12,
    controlMeasures: [
      { type: 'ppe', description: 'PFDs worn by all crew', responsible: 'All Crew' },
      { type: 'administrative', description: 'Float plan filed', responsible: 'Vessel Master' },
      { type: 'administrative', description: 'Tidal/current conditions assessed', responsible: 'Survey Lead' },
      { type: 'engineering', description: 'Equipment secured and waterproofed', responsible: 'Technician' }
    ],
    residualLikelihood: 2,
    residualSeverity: 3,
    residualRiskScore: 6,
    keywords: ['bathymetric', 'hydrographic', 'sonar', 'marine', 'vessel'],
    regulatoryRefs: ['Small Vessel Regulations', 'Marine Safety'],
    applicableOperations: ['Bathymetric survey', 'Hydrographic mapping']
  },
  {
    fhaNumber: 'FHA-6.11',
    title: 'Terrestrial LiDAR Operations',
    category: 'specialized',
    description: 'Hazard assessment for ground-based LiDAR survey operations.',
    consequences: 'Laser eye injury, equipment damage, slips/trips.',
    likelihood: 2,
    severity: 3,
    riskScore: 6,
    controlMeasures: [
      { type: 'administrative', description: 'Laser safety training completed', responsible: 'All Operators' },
      { type: 'ppe', description: 'Laser safety eyewear available', responsible: 'Technician' },
      { type: 'administrative', description: 'Public exclusion zone maintained', responsible: 'Survey Lead' }
    ],
    residualLikelihood: 1,
    residualSeverity: 2,
    residualRiskScore: 2,
    keywords: ['terrestrial', 'LiDAR', 'ground-based', 'laser', 'scanner'],
    regulatoryRefs: ['Laser Safety Standards', 'OH&S'],
    applicableOperations: ['Static LiDAR survey', 'As-built documentation']
  },
  {
    fhaNumber: 'FHA-6.12',
    title: 'Mobile Mapping Operations',
    category: 'specialized',
    description: 'Hazard assessment for vehicle-mounted mobile mapping operations.',
    consequences: 'Traffic accidents, equipment damage, data gaps.',
    likelihood: 2,
    severity: 4,
    riskScore: 8,
    controlMeasures: [
      { type: 'administrative', description: 'Route planning completed', responsible: 'Survey Manager' },
      { type: 'engineering', description: 'Equipment securely mounted', responsible: 'Technician' },
      { type: 'engineering', description: 'Warning lights on vehicle', responsible: 'Driver' }
    ],
    residualLikelihood: 1,
    residualSeverity: 3,
    residualRiskScore: 3,
    keywords: ['mobile mapping', 'vehicle', 'LiDAR', 'corridor'],
    regulatoryRefs: ['Highway Traffic Act', 'OH&S'],
    applicableOperations: ['Road surveys', 'Corridor mapping']
  },

  // ==========================================
  // SECTION 7: INDUSTRIAL/CONSTRUCTION
  // ==========================================
  {
    fhaNumber: 'FHA-7.1',
    title: 'Industrial Facility Operations',
    category: 'specialized',
    description: 'Hazard assessment for RPAS operations at industrial facilities including refineries, plants, and processing facilities.',
    consequences: 'Interference with facility operations, ignition sources, toxic exposure, security incidents.',
    likelihood: 3,
    severity: 4,
    riskScore: 12,
    controlMeasures: [
      { type: 'administrative', description: 'Facility safety orientation completed', responsible: 'All Crew' },
      { type: 'administrative', description: 'Hot work permit obtained if required', responsible: 'Operations Manager' },
      { type: 'engineering', description: 'Intrinsically safe or approved aircraft used in hazardous areas', responsible: 'Operations Manager' },
      { type: 'administrative', description: 'Coordination with facility operations/control room', responsible: 'PIC' },
      { type: 'ppe', description: 'Facility-required PPE worn', responsible: 'All Crew' },
      { type: 'administrative', description: 'Emergency evacuation procedures understood', responsible: 'All Crew' }
    ],
    residualLikelihood: 2,
    residualSeverity: 3,
    residualRiskScore: 6,
    keywords: ['industrial', 'facility', 'refinery', 'plant', 'processing'],
    regulatoryRefs: ['Industrial Safety Regulations', 'CARs 901'],
    applicableOperations: ['Facility inspection', 'Flare monitoring', 'Asset management']
  },
  {
    fhaNumber: 'FHA-7.2',
    title: 'Construction Site Operations',
    category: 'specialized',
    description: 'Hazard assessment for RPAS operations at active construction sites.',
    consequences: 'Crane/equipment conflicts, worker strikes, dust interference, changing site conditions.',
    likelihood: 3,
    severity: 4,
    riskScore: 12,
    controlMeasures: [
      { type: 'administrative', description: 'Construction site orientation completed', responsible: 'All Crew' },
      { type: 'administrative', description: 'Coordination with site superintendent', responsible: 'PIC' },
      { type: 'administrative', description: 'Active crane operations identified and avoided', responsible: 'PIC' },
      { type: 'ppe', description: 'Construction site PPE worn (hard hat, steel toes, hi-vis)', responsible: 'All Crew' },
      { type: 'administrative', description: 'Flight path clear of suspended loads', responsible: 'PIC' },
      { type: 'administrative', description: 'Worker notification before operations', responsible: 'PIC' }
    ],
    residualLikelihood: 2,
    residualSeverity: 3,
    residualRiskScore: 6,
    keywords: ['construction', 'crane', 'building', 'site', 'workers'],
    regulatoryRefs: ['Construction Safety Regulations', 'CARs 901'],
    applicableOperations: ['Progress monitoring', 'Site survey', 'Inspection']
  }
]

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get FHAs by category
 * @param {string} category - Category ID
 * @returns {Array}
 */
export function getDefaultFHAsByCategory(category) {
  return DEFAULT_FHA_TEMPLATES.filter(fha => fha.category === category)
}

/**
 * Get FHA by number
 * @param {string} fhaNumber - FHA number (e.g., 'FHA-2.5')
 * @returns {Object|undefined}
 */
export function getDefaultFHAByNumber(fhaNumber) {
  return DEFAULT_FHA_TEMPLATES.find(fha => fha.fhaNumber === fhaNumber)
}

/**
 * Get all unique categories from templates
 * @returns {Array}
 */
export function getUniqueFHACategories() {
  const categories = [...new Set(DEFAULT_FHA_TEMPLATES.map(fha => fha.category))]
  return categories
}

/**
 * Get FHA count by category
 * @returns {Object}
 */
export function getFHACountByCategory() {
  const counts = {}
  DEFAULT_FHA_TEMPLATES.forEach(fha => {
    counts[fha.category] = (counts[fha.category] || 0) + 1
  })
  return counts
}

/**
 * Get FHA count by risk level
 * @returns {Object}
 */
export function getFHACountByRiskLevel() {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 }
  DEFAULT_FHA_TEMPLATES.forEach(fha => {
    const score = fha.riskScore
    if (score >= 17) counts.critical++
    else if (score >= 10) counts.high++
    else if (score >= 5) counts.medium++
    else counts.low++
  })
  return counts
}

export default DEFAULT_FHA_TEMPLATES
