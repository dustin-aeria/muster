/**
 * Seed Gamification Content
 * Creates initial quest tracks, quests, lessons, and scenarios
 */

import { db } from './firebase'
import { collection, doc, setDoc, writeBatch } from 'firebase/firestore'

/**
 * Seed all gamification content for an organization
 */
export async function seedGamificationContent(organizationId) {
  console.log('Starting gamification content seed for org:', organizationId)

  const batch = writeBatch(db)

  // ============================================
  // QUEST TRACKS
  // ============================================

  const questTracks = [
    {
      id: 'rpas-fundamentals',
      name: 'RPAS Fundamentals',
      description: 'Core knowledge for drone operations under Transport Canada regulations',
      icon: 'plane',
      color: 'blue',
      order: 1,
      isActive: true,
      questCount: 4,
      estimatedMinutes: 60
    },
    {
      id: 'field-safety',
      name: 'Field Safety',
      description: 'WorkSafeBC requirements and best practices for field operations',
      icon: 'shield',
      color: 'green',
      order: 2,
      isActive: true,
      questCount: 3,
      estimatedMinutes: 45
    },
    {
      id: 'emergency-response',
      name: 'Emergency Response',
      description: 'How to handle incidents, flyaways, and emergency situations',
      icon: 'alert-triangle',
      color: 'red',
      order: 3,
      isActive: true,
      questCount: 3,
      estimatedMinutes: 40
    },
    {
      id: 'marine-operations',
      name: 'Marine Operations',
      description: 'Safety protocols for vessel-based and coastal survey work',
      icon: 'anchor',
      color: 'cyan',
      order: 4,
      isActive: true,
      questCount: 2,
      estimatedMinutes: 30
    }
  ]

  for (const track of questTracks) {
    const trackRef = doc(db, 'organizations', organizationId, 'questTracks', track.id)
    batch.set(trackRef, track)
  }

  // ============================================
  // QUESTS
  // ============================================

  const quests = [
    // RPAS Fundamentals Track
    {
      id: 'pre-flight-essentials',
      trackId: 'rpas-fundamentals',
      title: 'Pre-Flight Essentials',
      description: 'Master the pre-flight checklist and airspace verification procedures',
      icon: 'clipboard-check',
      order: 1,
      isActive: true,
      xpReward: 100,
      lessonCount: 3,
      estimatedMinutes: 15,
      prerequisites: [],
      regulatoryReferences: ['CARs 901.19', 'CARs 901.24']
    },
    {
      id: 'airspace-awareness',
      trackId: 'rpas-fundamentals',
      title: 'Airspace Awareness',
      description: 'Understanding controlled airspace, NOTAMs, and flight authorization',
      icon: 'map',
      order: 2,
      isActive: true,
      xpReward: 125,
      lessonCount: 4,
      estimatedMinutes: 20,
      prerequisites: ['pre-flight-essentials'],
      regulatoryReferences: ['CARs 901.71', 'CARs 901.72']
    },
    {
      id: 'weather-decision-making',
      trackId: 'rpas-fundamentals',
      title: 'Weather Decision Making',
      description: 'Assess weather conditions and make go/no-go decisions',
      icon: 'cloud',
      order: 3,
      isActive: true,
      xpReward: 150,
      lessonCount: 4,
      estimatedMinutes: 18,
      prerequisites: ['pre-flight-essentials'],
      regulatoryReferences: ['CARs 901.20']
    },
    {
      id: 'battery-management',
      trackId: 'rpas-fundamentals',
      title: 'Battery Safety & Management',
      description: 'LiPo battery handling, storage, charging, and transport',
      icon: 'battery',
      order: 4,
      isActive: true,
      xpReward: 100,
      lessonCount: 3,
      estimatedMinutes: 12,
      prerequisites: [],
      regulatoryReferences: ['TDG Act', 'IATA DGR']
    },

    // Field Safety Track
    {
      id: 'hazard-identification',
      trackId: 'field-safety',
      title: 'Hazard Identification',
      description: 'Spot and document workplace hazards before they cause incidents',
      icon: 'search',
      order: 1,
      isActive: true,
      xpReward: 100,
      lessonCount: 3,
      estimatedMinutes: 15,
      prerequisites: [],
      regulatoryReferences: ['WorkSafeBC Part 4', 'OHS Regulation 4.3']
    },
    {
      id: 'ppe-requirements',
      trackId: 'field-safety',
      title: 'PPE Requirements',
      description: 'Know when and how to use personal protective equipment',
      icon: 'hard-hat',
      order: 2,
      isActive: true,
      xpReward: 75,
      lessonCount: 2,
      estimatedMinutes: 10,
      prerequisites: [],
      regulatoryReferences: ['WorkSafeBC Part 8']
    },
    {
      id: 'wildlife-encounters',
      trackId: 'field-safety',
      title: 'Wildlife Encounters',
      description: 'Safe practices around bears, cougars, and other BC wildlife',
      icon: 'paw-print',
      order: 3,
      isActive: true,
      xpReward: 100,
      lessonCount: 3,
      estimatedMinutes: 15,
      prerequisites: [],
      regulatoryReferences: ['Wildlife Act (BC)', 'WorkSafeBC 4.20.1']
    },

    // Emergency Response Track
    {
      id: 'flyaway-procedures',
      trackId: 'emergency-response',
      title: 'Flyaway Response',
      description: 'What to do when you lose control of your aircraft',
      icon: 'alert-circle',
      order: 1,
      isActive: true,
      xpReward: 150,
      lessonCount: 3,
      estimatedMinutes: 12,
      prerequisites: [],
      regulatoryReferences: ['CARs 901.26', 'CARs 901.27']
    },
    {
      id: 'incident-reporting',
      trackId: 'emergency-response',
      title: 'Incident Reporting',
      description: 'When, how, and what to report to Transport Canada and internally',
      icon: 'file-text',
      order: 2,
      isActive: true,
      xpReward: 100,
      lessonCount: 3,
      estimatedMinutes: 15,
      prerequisites: [],
      regulatoryReferences: ['CARs 901.48', 'CARs 901.49']
    },
    {
      id: 'first-aid-basics',
      trackId: 'emergency-response',
      title: 'Field First Aid Basics',
      description: 'Essential first aid knowledge for remote field operations',
      icon: 'heart',
      order: 3,
      isActive: true,
      xpReward: 125,
      lessonCount: 4,
      estimatedMinutes: 18,
      prerequisites: [],
      regulatoryReferences: ['WorkSafeBC Part 3', 'OHS Regulation 3.16']
    },

    // Marine Operations Track
    {
      id: 'vessel-safety',
      trackId: 'marine-operations',
      title: 'Small Vessel Safety',
      description: 'Safety requirements for launching drones from boats',
      icon: 'ship',
      order: 1,
      isActive: true,
      xpReward: 125,
      lessonCount: 3,
      estimatedMinutes: 15,
      prerequisites: [],
      regulatoryReferences: ['Small Vessel Regulations', 'CSA Z275']
    },
    {
      id: 'coastal-hazards',
      trackId: 'marine-operations',
      title: 'Coastal Hazards',
      description: 'Understanding tides, currents, and coastal-specific risks',
      icon: 'waves',
      order: 2,
      isActive: true,
      xpReward: 100,
      lessonCount: 3,
      estimatedMinutes: 12,
      prerequisites: ['vessel-safety'],
      regulatoryReferences: ['WorkSafeBC Part 21']
    }
  ]

  for (const quest of quests) {
    const questRef = doc(db, 'organizations', organizationId, 'quests', quest.id)
    batch.set(questRef, quest)
  }

  // ============================================
  // LESSONS
  // ============================================

  const lessons = [
    // Pre-Flight Essentials Quest
    {
      id: 'pf-checklist-overview',
      questId: 'pre-flight-essentials',
      title: 'The Pre-Flight Checklist',
      order: 1,
      xpReward: 25,
      estimatedMinutes: 5,
      content: {
        introduction: 'Every safe flight starts with a thorough pre-flight inspection. This lesson covers the essential checks required before every RPAS operation.',
        sections: [
          {
            heading: 'Why Pre-Flight Matters',
            content: 'Transport Canada requires pilots to verify aircraft airworthiness before each flight. A proper pre-flight catches issues that could lead to flyaways, crashes, or regulatory violations. According to CARs 901.19, the pilot-in-command is responsible for ensuring the RPAS is safe for flight.',
            keyPoint: 'The PIC is legally responsible for aircraft airworthiness'
          },
          {
            heading: 'Aircraft Physical Inspection',
            content: 'Check propellers for cracks, nicks, or deformation. Inspect the frame for loose screws or damage. Verify camera/sensor mounts are secure. Check landing gear for stability. Ensure all covers and hatches are properly closed.',
            keyPoint: 'Look for cracks, loose parts, and damage before every flight'
          },
          {
            heading: 'Battery & Power Systems',
            content: 'Check battery charge level (minimum 50% for most operations). Inspect battery for swelling, damage, or unusual heat. Verify battery is securely mounted. Check connection points for corrosion or damage. Confirm failsafe battery levels are set correctly.',
            keyPoint: 'Never fly with damaged, swollen, or improperly charged batteries'
          }
        ],
        summary: 'A thorough pre-flight inspection takes 5-10 minutes but can prevent accidents, incidents, and regulatory issues. Make it a non-negotiable habit.',
        references: ['CARs 901.19', 'Manufacturer Flight Manual']
      }
    },
    {
      id: 'pf-airspace-check',
      questId: 'pre-flight-essentials',
      title: 'Airspace Verification',
      order: 2,
      xpReward: 30,
      estimatedMinutes: 6,
      content: {
        introduction: 'Before flying, you must verify you have legal access to the airspace. This lesson covers how to check airspace restrictions and obtain necessary authorizations.',
        sections: [
          {
            heading: 'NAV DRONE App',
            content: 'Transport Canada\'s NAV DRONE app is the official tool for checking airspace restrictions. Open the app and enter your flight location to see applicable restrictions, controlled airspace boundaries, and special use areas. The app integrates with the NAV CANADA RPAS Zone Authorization system.',
            keyPoint: 'Always check NAV DRONE before every flight'
          },
          {
            heading: 'Controlled Airspace',
            content: 'Flying in controlled airspace (Classes A through E) requires authorization. Class C and D airspace around airports has specific altitude and distance restrictions. An SFOC or Zone Authorization may be required. Never fly within 5.6 km of an aerodrome without authorization.',
            keyPoint: 'Controlled airspace requires authorization - no exceptions'
          },
          {
            heading: 'NOTAMs and Temporary Restrictions',
            content: 'Check NOTAMs (Notices to Air Missions) for temporary restrictions. Wildfires, VIP movements, and special events can create temporary no-fly zones. NOTAMs are available through NAV CANADA or the NAV DRONE app.',
            keyPoint: 'Temporary restrictions can appear at any time - check NOTAMs day-of'
          }
        ],
        summary: 'Airspace verification is legally required and operationally critical. Use NAV DRONE to check restrictions and obtain necessary authorizations before every flight.',
        references: ['CARs 901.71', 'CARs 901.72', 'NAV CANADA RPAS Zone Authorization']
      }
    },
    {
      id: 'pf-site-survey',
      questId: 'pre-flight-essentials',
      title: 'Site Survey Essentials',
      order: 3,
      xpReward: 30,
      estimatedMinutes: 5,
      content: {
        introduction: 'A good site survey identifies hazards and ensures your flight plan accounts for real-world conditions. This lesson covers what to look for on-site.',
        sections: [
          {
            heading: 'Physical Hazards',
            content: 'Survey the area for power lines, towers, trees, and structures. Identify any obstacles that could interfere with flight paths. Note reflective surfaces that could cause GPS interference. Check for people and vehicle traffic patterns.',
            keyPoint: 'Walk the site and identify all potential obstacles'
          },
          {
            heading: 'Launch & Recovery Areas',
            content: 'Select a clear, level area for takeoff and landing. Ensure adequate clearance in all directions. Consider wind direction for approach paths. Have a backup landing area identified.',
            keyPoint: 'A good LZ is flat, clear, and has approach options from multiple directions'
          },
          {
            heading: 'Emergency Planning',
            content: 'Identify safe areas to land in case of emergency. Know the location of the nearest hospital and emergency services. Have a communication plan with your VO and team. Know the property owner/manager contact information.',
            keyPoint: 'Plan your emergency response before you need it'
          }
        ],
        summary: 'A thorough site survey takes 10-15 minutes and dramatically reduces risk. Document your findings for future flights at the same location.',
        references: ['CARs 901.20', 'WorkSafeBC Part 4']
      }
    },

    // Hazard Identification Quest (Field Safety)
    {
      id: 'hi-spot-hazards',
      questId: 'hazard-identification',
      title: 'Spotting Workplace Hazards',
      order: 1,
      xpReward: 30,
      estimatedMinutes: 5,
      content: {
        introduction: 'Hazard identification is the first step in preventing workplace injuries. This lesson teaches you to systematically identify hazards in field environments.',
        sections: [
          {
            heading: 'Types of Hazards',
            content: 'Physical hazards include uneven terrain, overhead obstacles, and moving equipment. Chemical hazards include fuels, solvents, and natural substances like plant oils. Biological hazards include wildlife, insects, and waterborne pathogens. Environmental hazards include weather, UV exposure, and temperature extremes.',
            keyPoint: 'Hazards come in many forms - physical, chemical, biological, and environmental'
          },
          {
            heading: 'The 360° Assessment',
            content: 'When arriving at a new site, do a complete visual sweep. Look up (overhead hazards, weather). Look down (trip hazards, holes, unstable ground). Look around (traffic, equipment, people). Ask: What could hurt someone here?',
            keyPoint: 'Always look up, down, and around when assessing a site'
          },
          {
            heading: 'Dynamic Hazards',
            content: 'Conditions change throughout the day. Weather can shift rapidly. Equipment moves. People come and go. Reassess hazards when conditions change. A safe site in the morning may not be safe in the afternoon.',
            keyPoint: 'Hazards are dynamic - reassess throughout the day'
          }
        ],
        summary: 'Effective hazard identification requires systematic observation and ongoing awareness. Make the 360° assessment a habit at every site.',
        references: ['WorkSafeBC Part 4', 'OHS Regulation 4.3', 'COR Audit Standard']
      }
    },
    {
      id: 'hi-document-report',
      questId: 'hazard-identification',
      title: 'Documenting & Reporting',
      order: 2,
      xpReward: 25,
      estimatedMinutes: 5,
      content: {
        introduction: 'Finding hazards is only half the job - you need to document and report them so they can be controlled. This lesson covers effective hazard documentation.',
        sections: [
          {
            heading: 'When to Report',
            content: 'Report any hazard that could cause injury or property damage. Report immediately if the hazard poses imminent danger. Don\'t assume someone else has already reported it. When in doubt, report it.',
            keyPoint: 'When in doubt, report it'
          },
          {
            heading: 'What to Include',
            content: 'Describe the hazard specifically (not just "unsafe"). Note the exact location. Identify who could be affected. Estimate the severity if the hazard caused an incident. Include photos when possible. Suggest controls if you have ideas.',
            keyPoint: 'Be specific - location, severity, and who is affected'
          },
          {
            heading: 'Following Up',
            content: 'Track whether your report was addressed. If a hazard persists, escalate to supervision. You have the right to refuse unsafe work under WorkSafeBC regulations. Document any ongoing concerns.',
            keyPoint: 'Follow up on reported hazards - it\'s your right and responsibility'
          }
        ],
        summary: 'Hazard reporting is a legal obligation and a professional responsibility. Good reports lead to effective controls and safer workplaces.',
        references: ['WorkSafeBC Part 3', 'OHS Regulation 3.12', 'Right to Refuse Unsafe Work']
      }
    },
    {
      id: 'hi-controls',
      questId: 'hazard-identification',
      title: 'Hierarchy of Controls',
      order: 3,
      xpReward: 35,
      estimatedMinutes: 6,
      content: {
        introduction: 'Once hazards are identified, they must be controlled. The hierarchy of controls prioritizes the most effective methods. This lesson teaches you to apply the hierarchy.',
        sections: [
          {
            heading: 'The Hierarchy',
            content: '1. ELIMINATION - Remove the hazard entirely\n2. SUBSTITUTION - Replace with something less hazardous\n3. ENGINEERING CONTROLS - Physical barriers or system changes\n4. ADMINISTRATIVE CONTROLS - Training, procedures, warnings\n5. PPE - Personal protective equipment (last resort)',
            keyPoint: 'Start at the top of the hierarchy - elimination is always preferred'
          },
          {
            heading: 'Practical Examples',
            content: 'Elimination: Don\'t fly in poor weather (eliminate the hazard by not operating). Substitution: Use a smaller drone that poses less risk. Engineering: Install propeller guards. Administrative: Create a minimum distance rule from people. PPE: Wear safety glasses during maintenance.',
            keyPoint: 'Multiple controls can be combined for better protection'
          },
          {
            heading: 'Choosing Controls',
            content: 'Consider effectiveness, practicality, and cost. Higher-level controls are usually more effective but may cost more. Lower-level controls like PPE require ongoing compliance. The best control is one that works automatically without relying on human behavior.',
            keyPoint: 'The best control works without relying on human behavior'
          }
        ],
        summary: 'Apply the hierarchy of controls systematically. Prefer elimination and engineering controls over administrative and PPE where practical.',
        references: ['WorkSafeBC Part 4', 'OHS Regulation 4.14', 'CSA Z1000']
      }
    },

    // Airspace Awareness Quest
    {
      id: 'aa-controlled-airspace',
      questId: 'airspace-awareness',
      title: 'Understanding Controlled Airspace',
      order: 1,
      xpReward: 35,
      estimatedMinutes: 8,
      content: {
        introduction: 'Canadian airspace is divided into controlled and uncontrolled areas. Understanding these classifications is essential for legal RPAS operations.',
        sections: [
          {
            heading: 'Airspace Classes',
            content: 'Class A: High altitude, IFR only (18,000ft+). Class B: Major airports, IFR/VFR with clearance. Class C: Busy airports with radar, clearance required. Class D: Airports with towers, two-way communication required. Class E: Controlled but fewer restrictions. Class F: Special use (restricted, advisory). Class G: Uncontrolled airspace.',
            keyPoint: 'Classes A-E are controlled; RPAS operations require authorization'
          },
          {
            heading: 'The 5.6km Rule',
            content: 'Under CARs 901.71, you cannot fly within 5.6 km (3 nautical miles) of an airport without authorization. This applies to aerodromes with towers. For heliports and uncontrolled airports, different rules may apply.',
            keyPoint: 'Never fly within 5.6km of an airport without authorization'
          }
        ],
        summary: 'Always verify airspace classification before flying. Use NAV DRONE app and obtain necessary authorizations.',
        references: ['CARs 901.71', 'CARs 901.72', 'Transport Canada AIM']
      }
    },

    // Weather Decision Making Quest
    {
      id: 'wdm-basics',
      questId: 'weather-decision-making',
      title: 'Weather Minimums for RPAS',
      order: 1,
      xpReward: 30,
      estimatedMinutes: 6,
      content: {
        introduction: 'Weather conditions directly impact flight safety. Know your limits and the regulatory requirements.',
        sections: [
          {
            heading: 'Visibility Requirements',
            content: 'Basic operations require at least 3 statute miles visibility. Advanced operations may have different requirements based on your certificate. Always maintain visual line-of-sight with the aircraft.',
            keyPoint: 'Minimum 3 statute miles visibility for basic operations'
          },
          {
            heading: 'Wind Limitations',
            content: 'Each aircraft has maximum wind specifications. Typical limits are 30-40 km/h sustained winds. Gusts can exceed your aircraft\'s capability quickly. High winds increase battery consumption significantly.',
            keyPoint: 'Know your aircraft\'s wind limits - they vary by model'
          }
        ],
        summary: 'Check weather before and during operations. When in doubt, don\'t fly.',
        references: ['CARs 901.20', 'Aircraft flight manual']
      }
    },

    // Battery Management Quest
    {
      id: 'bm-fundamentals',
      questId: 'battery-management',
      title: 'LiPo Battery Safety',
      order: 1,
      xpReward: 30,
      estimatedMinutes: 7,
      content: {
        introduction: 'Lithium polymer batteries power most RPAS. Proper handling prevents fires, extends battery life, and ensures reliable performance.',
        sections: [
          {
            heading: 'Storage & Charging',
            content: 'Store batteries at 40-60% charge for long-term storage. Never charge unattended. Use a fireproof charging bag or container. Allow batteries to cool before charging after flight.',
            keyPoint: 'Never charge batteries unattended'
          },
          {
            heading: 'Signs of Damage',
            content: 'Swelling (puffing) indicates internal damage - stop using immediately. Physical damage to the casing is dangerous. Unusual heat during charging is a warning sign. Reduced flight times may indicate cell degradation.',
            keyPoint: 'Swollen batteries are fire hazards - dispose of them properly'
          }
        ],
        summary: 'Proper battery care extends lifespan and prevents fires. Inspect batteries before every flight.',
        references: ['Manufacturer guidelines', 'Transport of Dangerous Goods Act']
      }
    },

    // PPE Requirements Quest
    {
      id: 'ppe-field',
      questId: 'ppe-requirements',
      title: 'Field PPE Essentials',
      order: 1,
      xpReward: 25,
      estimatedMinutes: 5,
      content: {
        introduction: 'Personal protective equipment protects you from site-specific hazards. Know what\'s required and when to use it.',
        sections: [
          {
            heading: 'Basic Field PPE',
            content: 'High-visibility vest: Required on most industrial sites. Safety glasses: Protect against debris and UV. Hard hat: Required in areas with overhead hazards. Safety boots: Steel toe on construction sites.',
            keyPoint: 'Site requirements vary - always confirm with the site contact'
          },
          {
            heading: 'RPAS-Specific Considerations',
            content: 'Safety glasses during prop changes and maintenance. Hearing protection when flying larger aircraft. Sun protection (hat, sunscreen) for outdoor operations. Gloves when handling hot batteries.',
            keyPoint: 'Spinning props are the most common RPAS injury cause'
          }
        ],
        summary: 'PPE requirements vary by site. When in doubt, bring more than you think you need.',
        references: ['WorkSafeBC Part 8', 'Site safety plans']
      }
    },

    // Flyaway Procedures Quest
    {
      id: 'fp-response',
      questId: 'flyaway-procedures',
      title: 'Responding to Flyaways',
      order: 1,
      xpReward: 40,
      estimatedMinutes: 8,
      content: {
        introduction: 'A flyaway occurs when you lose control of the aircraft. Quick, correct response can prevent injury and property damage.',
        sections: [
          {
            heading: 'Immediate Actions',
            content: '1. Attempt to regain control (switch modes, use RTH). 2. Alert all personnel in the area verbally. 3. Track the aircraft visually as long as possible. 4. Note last known heading and position. 5. Contact ATC if near controlled airspace.',
            keyPoint: 'First priority: warn people in the area'
          },
          {
            heading: 'Post-Flyaway',
            content: 'Do not leave the area until you\'ve searched for the aircraft. Report to your supervisor immediately. Document everything (time, location, conditions, actions taken). File an incident report within 24 hours if required.',
            keyPoint: 'Document everything - it\'s required for incident reporting'
          }
        ],
        summary: 'Stay calm, warn others, track the aircraft, and document everything.',
        references: ['CARs 901.49', 'Company SOP']
      }
    },

    // Incident Reporting Quest
    {
      id: 'ir-basics',
      questId: 'incident-reporting',
      title: 'When & How to Report',
      order: 1,
      xpReward: 35,
      estimatedMinutes: 7,
      content: {
        introduction: 'Incident reporting is both a legal requirement and a professional responsibility. Proper reporting helps prevent future incidents.',
        sections: [
          {
            heading: 'Reportable Events',
            content: 'CARs 901.49 requires reporting: Injuries to persons. Damage to property. Risk of collision with manned aircraft. Flyaways. Any event compromising safety of others.',
            keyPoint: 'When in doubt, report it'
          },
          {
            heading: 'Reporting Process',
            content: 'Internal reports: Submit within 24 hours. TSB reports: Required for serious incidents. Include: Date, time, location, conditions, what happened, actions taken, damage/injuries. Preserve evidence (logs, photos, video).',
            keyPoint: 'Report within 24 hours - preserve all evidence'
          }
        ],
        summary: 'Timely, accurate reporting improves safety for everyone and protects you legally.',
        references: ['CARs 901.49', 'TSB Regulations', 'Company incident policy']
      }
    },

    // First Aid Basics Quest
    {
      id: 'fa-field',
      questId: 'first-aid-basics',
      title: 'Field First Aid Essentials',
      order: 1,
      xpReward: 30,
      estimatedMinutes: 6,
      content: {
        introduction: 'Field operations often occur far from medical facilities. Basic first aid knowledge can save lives.',
        sections: [
          {
            heading: 'First Aid Kit Requirements',
            content: 'WorkSafeBC requires appropriate first aid based on crew size and distance from medical facilities. Minimum: bandages, gauze, antiseptic, tweezers, emergency blanket, CPR mask. Check expiration dates regularly.',
            keyPoint: 'Your kit must match your crew size and remoteness'
          },
          {
            heading: 'Emergency Response',
            content: 'Know the address/coordinates of your work site. Know the nearest hospital location. Have emergency contacts programmed in your phone. Designate someone to guide emergency responders if needed.',
            keyPoint: 'Know your location - emergency services need accurate coordinates'
          }
        ],
        summary: 'Preparation is key. Know your location, have a stocked kit, and know how to get help.',
        references: ['WorkSafeBC Part 3', 'OHS Regulation 3.16']
      }
    },

    // Vessel Safety Quest
    {
      id: 'vs-basics',
      questId: 'vessel-safety',
      title: 'Operating from Vessels',
      order: 1,
      xpReward: 35,
      estimatedMinutes: 8,
      content: {
        introduction: 'Marine-based RPAS operations add complexity. Vessel movement, wind, and water create unique challenges.',
        sections: [
          {
            heading: 'Vessel-Based Launch',
            content: 'Coordinate with the captain/helmsman. Launch from stable platforms when possible. Account for vessel movement in takeoff. Use a spotter to watch for approaching waves. Secure all equipment against wave action.',
            keyPoint: 'Always coordinate with the vessel operator before launch'
          },
          {
            heading: 'Marine Safety Requirements',
            content: 'PFDs (life jackets) required on deck. Know emergency procedures for man-overboard. Understand vessel communication systems. Be aware of other vessel traffic.',
            keyPoint: 'Wear your PFD - falling overboard while watching a drone is a real risk'
          }
        ],
        summary: 'Marine ops require coordination with vessel crew and extra safety precautions.',
        references: ['Transport Canada Marine', 'Vessel safety plans']
      }
    },

    // Coastal Hazards Quest
    {
      id: 'ch-awareness',
      questId: 'coastal-hazards',
      title: 'Coastal Environment Hazards',
      order: 1,
      xpReward: 30,
      estimatedMinutes: 6,
      content: {
        introduction: 'Coastal and shoreline operations present unique environmental hazards. Be prepared for rapidly changing conditions.',
        sections: [
          {
            heading: 'Weather Hazards',
            content: 'Sea breezes can develop rapidly in afternoon. Fog can roll in quickly, reducing visibility. Salt spray affects equipment - clean after coastal flights. Tides can trap you on shorelines.',
            keyPoint: 'Coastal weather changes faster than inland - check frequently'
          },
          {
            heading: 'Wildlife Considerations',
            content: 'Nesting birds may attack aircraft near colonies. Marine mammals are protected - maintain distance. Bears frequent coastal areas - be aware. Avoid disturbing wildlife - it may be illegal.',
            keyPoint: 'Know what wildlife is in your area before operations'
          }
        ],
        summary: 'Coastal environments are dynamic. Stay aware of weather, tides, and wildlife.',
        references: ['Wildlife Act (BC)', 'Migratory Birds Convention Act']
      }
    },

    // Wildlife Encounters Quest
    {
      id: 'we-response',
      questId: 'wildlife-encounters',
      title: 'Wildlife Awareness & Response',
      order: 1,
      xpReward: 35,
      estimatedMinutes: 7,
      content: {
        introduction: 'Working in remote areas means encountering wildlife. Know how to prevent and respond to encounters safely.',
        sections: [
          {
            heading: 'Prevention',
            content: 'Make noise while moving through brush. Store food properly - use bear caches or vehicle. Be extra alert during dawn and dusk. Know what wildlife is active in your area seasonally.',
            keyPoint: 'Prevention is better than reaction - make noise and be aware'
          },
          {
            heading: 'Bear Encounters',
            content: 'Don\'t run - back away slowly. Speak calmly to identify yourself as human. If attacked by black bear - fight back. If attacked by grizzly - play dead (protect neck/stomach). Carry bear spray and know how to use it.',
            keyPoint: 'Carry bear spray and know the difference between black and grizzly responses'
          }
        ],
        summary: 'Be aware, be prepared, and know appropriate responses for different wildlife.',
        references: ['WildSafeBC', 'Bear Smart guidelines']
      }
    }
  ]

  for (const lesson of lessons) {
    const lessonRef = doc(db, 'organizations', organizationId, 'lessons', lesson.id)
    batch.set(lessonRef, lesson)
  }

  // ============================================
  // SCENARIOS
  // ============================================

  const scenarios = [
    {
      id: 'changing-weather',
      title: 'The Changing Weather',
      description: 'Weather conditions shift during your flight operation. How do you handle it?',
      category: 'RPAS_flight',
      difficultyTier: 'yellow',
      xpReward: 75,
      estimatedMinutes: 10,
      isActive: true,
      reviewStatus: 'approved',
      contextData: {
        weather: { conditions: 'Initially clear, building clouds', visibility: '10km', wind: '15km/h gusting 25' },
        terrain: 'Coastal survey site',
        equipment: { aircraft: 'DJI M300', batteries: '3 sets charged' },
        crewComposition: ['PIC', 'VO'],
        clientExpectations: 'Complete survey by end of day',
        timePressure: 'Client arriving at 4pm for results'
      },
      procedureReferences: ['SOP-WEATHER-001'],
      regulatoryReferences: ['CARs 901.20'],
      maxScore: 100
    },
    {
      id: 'battery-warning',
      title: 'Critical Battery Warning',
      description: 'Mid-flight, you receive an unexpected low battery warning. What\'s your next move?',
      category: 'RPAS_flight',
      difficultyTier: 'red',
      xpReward: 100,
      estimatedMinutes: 8,
      isActive: true,
      reviewStatus: 'approved',
      contextData: {
        weather: { conditions: 'Clear', visibility: '15km', wind: '10km/h' },
        terrain: 'Mining site with obstacles',
        equipment: { aircraft: 'DJI Mavic 3E', batteries: '2 sets charged' },
        crewComposition: ['PIC'],
        clientExpectations: 'Routine inspection',
        timePressure: 'Low'
      },
      procedureReferences: ['SOP-EMERGENCY-001'],
      regulatoryReferences: ['CARs 901.26'],
      maxScore: 100
    },
    {
      id: 'wildlife-encounter',
      title: 'Bear in the Area',
      description: 'Your VO spots a bear approaching the work area. How do you respond?',
      category: 'field_logistics',
      difficultyTier: 'yellow',
      xpReward: 75,
      estimatedMinutes: 8,
      isActive: true,
      reviewStatus: 'approved',
      contextData: {
        weather: { conditions: 'Clear', visibility: 'Good' },
        terrain: 'Remote forestry site',
        equipment: { aircraft: 'DJI M30', status: 'In flight' },
        crewComposition: ['PIC', 'VO'],
        clientExpectations: 'Forest health survey',
        timePressure: 'Moderate - scheduled pickup at 5pm'
      },
      procedureReferences: ['SOP-WILDLIFE-001'],
      regulatoryReferences: ['Wildlife Act (BC)'],
      maxScore: 100
    },
    {
      id: 'client-pressure',
      title: 'Pressure to Fly',
      description: 'The client wants you to fly despite marginal conditions. How do you handle it?',
      category: 'RPAS_flight',
      difficultyTier: 'green',
      xpReward: 50,
      estimatedMinutes: 7,
      isActive: true,
      reviewStatus: 'approved',
      contextData: {
        weather: { conditions: 'Overcast, light rain', visibility: '5km', wind: '20km/h' },
        terrain: 'Construction site',
        equipment: { aircraft: 'DJI Phantom 4 RTK', status: 'Ready' },
        crewComposition: ['PIC'],
        clientExpectations: 'Progress photos needed for investor meeting tomorrow',
        timePressure: 'High - client is visibly frustrated'
      },
      procedureReferences: ['SOP-WEATHER-001', 'SOP-CLIENT-001'],
      regulatoryReferences: ['CARs 901.20'],
      maxScore: 100
    },
    {
      id: 'lost-link',
      title: 'Lost Link Emergency',
      description: 'You suddenly lose control link with your aircraft at 100m altitude.',
      category: 'RPAS_flight',
      difficultyTier: 'red',
      xpReward: 100,
      estimatedMinutes: 6,
      isActive: true,
      reviewStatus: 'approved',
      contextData: {
        weather: { conditions: 'Clear', visibility: '10km', wind: '15km/h' },
        terrain: 'Urban survey near buildings',
        equipment: { aircraft: 'DJI M300', status: 'In flight, link lost' },
        crewComposition: ['PIC', 'VO'],
        clientExpectations: 'Roof inspection',
        timePressure: 'None'
      },
      procedureReferences: ['SOP-EMERGENCY-001'],
      regulatoryReferences: ['CARs 901.26', 'CARs 901.27'],
      maxScore: 100
    }
  ]

  for (const scenario of scenarios) {
    const scenarioRef = doc(db, 'organizations', organizationId, 'scenarios', scenario.id)
    batch.set(scenarioRef, scenario)
  }

  // ============================================
  // SCENARIO NODES (for branching narrative)
  // ============================================

  const scenarioNodes = [
    // Changing Weather Scenario Nodes
    {
      id: 'cw-start',
      scenarioId: 'changing-weather',
      type: 'narrative',
      order: 1,
      content: 'You\'re 45 minutes into a coastal survey when you notice dark clouds building to the west. The wind has picked up from 15 to 25 km/h with gusts to 30. Your aircraft is handling it, but your VO mentions concern about the changing conditions. You\'re about 60% through the planned flight area.',
      decisions: [
        {
          id: 'd1a',
          text: 'Continue flying - we\'re handling it fine and need to finish',
          nextNodeId: 'cw-continue',
          scoreImpact: -20,
          isOptimal: false,
          rationale: 'Continuing in deteriorating conditions ignores weather warnings'
        },
        {
          id: 'd1b',
          text: 'Land immediately and assess the weather',
          nextNodeId: 'cw-land-assess',
          scoreImpact: 25,
          isOptimal: true,
          rationale: 'Safe and measured response - land before conditions worsen further'
        },
        {
          id: 'd1c',
          text: 'Climb higher to get above the wind',
          nextNodeId: 'cw-climb',
          scoreImpact: -15,
          isOptimal: false,
          rationale: 'Climbing doesn\'t solve weather problems and may exceed limits'
        }
      ]
    },
    {
      id: 'cw-land-assess',
      scenarioId: 'changing-weather',
      type: 'consequence',
      content: 'You land the aircraft safely. The wind continues to increase, and light rain begins within 10 minutes. Your weather app shows a front passing through with potential for thunderstorms. You have about 40% of the survey remaining.',
      decisions: [
        {
          id: 'd2a',
          text: 'Wait it out - fronts usually pass quickly',
          nextNodeId: 'cw-wait',
          scoreImpact: 15,
          isOptimal: false,
          rationale: 'Waiting is reasonable but needs a time limit'
        },
        {
          id: 'd2b',
          text: 'Call the client to discuss options and reschedule the remainder',
          nextNodeId: 'cw-call-client',
          scoreImpact: 30,
          isOptimal: true,
          rationale: 'Proactive communication shows professionalism'
        },
        {
          id: 'd2c',
          text: 'Pack up and leave - we\'ll come back another day',
          nextNodeId: 'cw-leave',
          scoreImpact: 10,
          isOptimal: false,
          rationale: 'Safe but missed opportunity for communication'
        }
      ]
    },
    {
      id: 'cw-call-client',
      scenarioId: 'changing-weather',
      type: 'ending',
      content: 'You call the client and explain the weather situation professionally. They appreciate the communication and your prioritization of safety. You agree to return tomorrow morning to complete the remaining 40%. The front passes, bringing heavier rain and gusty winds - confirming your decision to stop was correct. The client later comments on your professionalism in their review.',
      isEnding: true,
      endingType: 'success',
      finalScore: 85
    },
    {
      id: 'cw-continue',
      scenarioId: 'changing-weather',
      type: 'consequence',
      content: 'You continue flying. The wind increases further to steady 30 km/h with gusts to 40. The aircraft is struggling to maintain position for clean imagery. Your battery consumption is significantly higher than normal. Suddenly, the rain arrives - harder than expected.',
      decisions: [
        {
          id: 'd3a',
          text: 'RTH immediately',
          nextNodeId: 'cw-emergency-rth',
          scoreImpact: 10,
          isOptimal: true,
          rationale: 'Better late than never'
        },
        {
          id: 'd3b',
          text: 'Try to shelter under a tree and continue when it passes',
          nextNodeId: 'cw-shelter',
          scoreImpact: -30,
          isOptimal: false,
          rationale: 'Trees in storms are dangerous - and the drone is still flying'
        }
      ]
    },
    {
      id: 'cw-emergency-rth',
      scenarioId: 'changing-weather',
      type: 'ending',
      content: 'You trigger RTH. The aircraft struggles against the wind and rain but makes it back. It lands hard due to gusty conditions, damaging a propeller. The aircraft is grounded until replacement parts arrive. The imagery captured in the rain is unusable. You\'ll need to return and redo the affected portion. The client is understanding but notes the delay.',
      isEnding: true,
      endingType: 'partial',
      finalScore: 45
    },
    {
      id: 'cw-climb',
      scenarioId: 'changing-weather',
      type: 'ending',
      content: 'You climb to 120m, approaching your altitude limit. The wind is actually stronger at altitude. Your aircraft is consuming battery rapidly fighting the wind. The cloud base is at 150m - you\'re now flying in marginal VFR conditions. You trigger RTH but the high battery consumption means you land with only 8% remaining - well below safe minimums. The flight is documented and requires an internal review.',
      isEnding: true,
      endingType: 'failure',
      finalScore: 30
    },
    {
      id: 'cw-wait',
      scenarioId: 'changing-weather',
      type: 'ending',
      content: 'You wait for 90 minutes. The front is slower than expected and the rain continues. By the time it clears, it\'s too late to complete the survey with adequate light. The client is annoyed they weren\'t informed of the delay. You return the next day to finish, but the relationship is strained.',
      isEnding: true,
      endingType: 'partial',
      finalScore: 55
    },
    {
      id: 'cw-leave',
      scenarioId: 'changing-weather',
      type: 'ending',
      content: 'You pack up and leave without contacting the client. They call later asking for an update and are frustrated to learn you left without communication. Although you made the safe choice to stop flying, the lack of communication damages the client relationship.',
      isEnding: true,
      endingType: 'partial',
      finalScore: 50
    },
    {
      id: 'cw-shelter',
      scenarioId: 'changing-weather',
      type: 'ending',
      content: 'While you shelter, a lightning strike hits nearby. Your aircraft, still in the air, loses GPS lock in the electrical interference. It enters attitude mode and drifts before you regain control and land it in a tree. Equipment is damaged, and you\'re shaken. This incident requires a full investigation and report to Transport Canada.',
      isEnding: true,
      endingType: 'failure',
      finalScore: 15
    },

    // Battery Warning Scenario Nodes
    {
      id: 'bw-start',
      scenarioId: 'battery-warning',
      type: 'narrative',
      order: 1,
      content: 'You\'re conducting a routine inspection at a mining site. The aircraft is at 100m altitude, 200m horizontal distance from your position. Suddenly, your controller shows a critical battery warning - 15% remaining. This doesn\'t match your flight plan; you should have 35% by now. The battery may be faulty or the cold conditions are draining it faster than expected.',
      decisions: [
        {
          id: 'bw1a',
          text: 'Trigger immediate RTH',
          nextNodeId: 'bw-rth',
          scoreImpact: 25,
          isOptimal: true,
          rationale: 'Immediate RTH is the safest response to unexpected low battery'
        },
        {
          id: 'bw1b',
          text: 'Manually fly back quickly to save RTH processing time',
          nextNodeId: 'bw-manual',
          scoreImpact: 15,
          isOptimal: false,
          rationale: 'Manual return is acceptable but RTH may be more efficient'
        },
        {
          id: 'bw1c',
          text: 'Continue to finish this scan line - we\'re almost done',
          nextNodeId: 'bw-continue',
          scoreImpact: -40,
          isOptimal: false,
          rationale: 'Ignoring a critical battery warning is extremely dangerous'
        }
      ]
    },
    {
      id: 'bw-rth',
      scenarioId: 'battery-warning',
      type: 'ending',
      content: 'You trigger RTH immediately. The aircraft calculates an optimal return path and descends efficiently. It lands with 6% battery - cutting it close. Post-flight inspection reveals the battery has slight swelling - it was failing. You document the battery issue and remove it from service. Good call on the immediate return.',
      isEnding: true,
      endingType: 'success',
      finalScore: 90
    },
    {
      id: 'bw-manual',
      scenarioId: 'battery-warning',
      type: 'consequence',
      content: 'You take manual control and fly directly back. The battery drops to 10% at 50m from home. The aircraft triggers auto-land at 8%.',
      decisions: [
        {
          id: 'bw2a',
          text: 'Let it auto-land where it is',
          nextNodeId: 'bw-autoland',
          scoreImpact: 15,
          isOptimal: true,
          rationale: 'Auto-land in a clear area is safer than trying to override'
        },
        {
          id: 'bw2b',
          text: 'Override and try to make it to the home point',
          nextNodeId: 'bw-override',
          scoreImpact: -20,
          isOptimal: false,
          rationale: 'Overriding safety systems is rarely the right choice'
        }
      ]
    },
    {
      id: 'bw-autoland',
      scenarioId: 'battery-warning',
      type: 'ending',
      content: 'The aircraft auto-lands in a clear area 30m from your position. You walk over and retrieve it with 3% battery remaining. The aircraft is undamaged. You document the event and the battery behavior. A close call, but a safe outcome.',
      isEnding: true,
      endingType: 'success',
      finalScore: 75
    },
    {
      id: 'bw-override',
      scenarioId: 'battery-warning',
      type: 'ending',
      content: 'You override the auto-land. The aircraft makes it 10m further before the battery hits critical cutoff. It drops from 3m altitude onto gravel, damaging a motor arm and the gimbal. The flight data shows you overrode multiple safety warnings. This incident requires a full investigation.',
      isEnding: true,
      endingType: 'failure',
      finalScore: 25
    },
    {
      id: 'bw-continue',
      scenarioId: 'battery-warning',
      type: 'ending',
      content: 'You continue flying. Thirty seconds later, the battery hits 10% and auto-RTH triggers. But you\'re now 250m from home. The aircraft doesn\'t make it - it auto-lands in a restricted area of the mining site. Retrieval requires a safety escort and delays site operations. The client is not pleased, and the incident is reported internally.',
      isEnding: true,
      endingType: 'failure',
      finalScore: 15
    },

    // Wildlife Encounter Scenario Nodes
    {
      id: 'we-start',
      scenarioId: 'wildlife-encounter',
      type: 'narrative',
      order: 1,
      content: 'You\'re 20 minutes into a forestry survey flight when your VO calls out: "Bear, 50 meters, coming this way." You look and see a black bear moving through the brush toward your launch site. The aircraft is at 80m altitude, 150m from your position. Your vehicle is 30m behind you.',
      decisions: [
        {
          id: 'we1a',
          text: 'Land immediately and retreat to the vehicle',
          nextNodeId: 'we-land-retreat',
          scoreImpact: 30,
          isOptimal: true,
          rationale: 'Safety first - secure the situation before worrying about equipment'
        },
        {
          id: 'we1b',
          text: 'Keep flying while the VO monitors the bear',
          nextNodeId: 'we-keep-flying',
          scoreImpact: -10,
          isOptimal: false,
          rationale: 'Continuing operations with wildlife approaching puts crew at risk'
        },
        {
          id: 'we1c',
          text: 'Fly the drone toward the bear to scare it away',
          nextNodeId: 'we-scare',
          scoreImpact: -30,
          isOptimal: false,
          rationale: 'Harassing wildlife is illegal and can make bears more dangerous'
        }
      ]
    },
    {
      id: 'we-land-retreat',
      scenarioId: 'wildlife-encounter',
      type: 'ending',
      content: 'You land the aircraft quickly and both of you move calmly to the vehicle. The bear passes through your launch area, sniffs the Pelican case, and moves on. After waiting 15 minutes, you retrieve your equipment and finish the survey from a different launch point. Good wildlife awareness and appropriate response.',
      isEnding: true,
      endingType: 'success',
      finalScore: 90
    },
    {
      id: 'we-keep-flying',
      scenarioId: 'wildlife-encounter',
      type: 'ending',
      content: 'The bear reaches your launch site while the aircraft is still flying. Your VO is now focused on the bear instead of the aircraft. The bear shows interest in your equipment. You need to land but now the landing zone isn\'t clear. You land 30m away and the bear investigates the aircraft. Eventually it loses interest, but you\'ve lost your visual observer coverage and the bear has learned that drones equal food containers.',
      isEnding: true,
      endingType: 'partial',
      finalScore: 40
    },
    {
      id: 'we-scare',
      scenarioId: 'wildlife-encounter',
      type: 'ending',
      content: 'You fly the drone toward the bear. It charges the aircraft, swatting at it. The drone crashes. Worse, a Conservation Officer saw the incident and cites you for wildlife harassment under the Wildlife Act. The fine is significant, and the incident is reported to Transport Canada. Your company reviews your field privileges.',
      isEnding: true,
      endingType: 'failure',
      finalScore: 10
    },

    // Client Pressure Scenario Nodes
    {
      id: 'cp-start',
      scenarioId: 'client-pressure',
      type: 'narrative',
      order: 1,
      content: 'Rain is falling lightly and winds are 20 km/h. Visibility is 5km. The client needs aerial photos for an investor presentation tomorrow and is clearly stressed. They say "The photos are critical - can\'t you just do a quick flight?" Your aircraft is rated for light rain, but your company SOP says no flights in precipitation.',
      decisions: [
        {
          id: 'cp1a',
          text: 'Explain the SOP and politely decline to fly',
          nextNodeId: 'cp-decline',
          scoreImpact: 30,
          isOptimal: true,
          rationale: 'SOPs exist for good reason - explaining professionally maintains the relationship'
        },
        {
          id: 'cp1b',
          text: 'Offer alternatives (reschedule, stock photos, ground photos)',
          nextNodeId: 'cp-alternatives',
          scoreImpact: 25,
          isOptimal: false,
          rationale: 'Good customer service, but should decline first and then offer alternatives'
        },
        {
          id: 'cp1c',
          text: 'Fly anyway - the aircraft can handle it',
          nextNodeId: 'cp-fly',
          scoreImpact: -25,
          isOptimal: false,
          rationale: 'Violating SOP for client pressure sets a dangerous precedent'
        }
      ]
    },
    {
      id: 'cp-decline',
      scenarioId: 'client-pressure',
      type: 'ending',
      content: 'You explain that your company\'s safety procedures don\'t allow flight in precipitation, and that these rules exist to protect the aircraft, the data quality, and everyone involved. The client is disappointed but respects your professionalism. You offer to return first thing tomorrow if weather permits, and they agree. The next morning is clear, and you deliver excellent imagery.',
      isEnding: true,
      endingType: 'success',
      finalScore: 90
    },
    {
      id: 'cp-alternatives',
      scenarioId: 'client-pressure',
      type: 'ending',
      content: 'You jump straight to alternatives without clearly explaining why you can\'t fly. The client pushes back: "But other drone companies fly in rain." You eventually decline, but the client feels like you\'re making excuses. The relationship is strained. You complete the job the next day, but they don\'t call again.',
      isEnding: true,
      endingType: 'partial',
      finalScore: 55
    },
    {
      id: 'cp-fly',
      scenarioId: 'client-pressure',
      type: 'ending',
      content: 'You fly in the rain. Water gets into a motor, causing a partial power loss. The aircraft descends rapidly and you barely avoid hitting a parked excavator. The aircraft is damaged and the imagery is unusable due to water droplets on the lens. The client now has no photos AND a near-miss incident report. Your supervisor wants to discuss your decision-making.',
      isEnding: true,
      endingType: 'failure',
      finalScore: 15
    },

    // Lost Link Scenario Nodes
    {
      id: 'll-start',
      scenarioId: 'lost-link',
      type: 'narrative',
      order: 1,
      content: 'You\'re flying at 100m AGL, 200m from your position. Without warning, your screen shows "Connection Lost." The aircraft should execute its failsafe, but you can\'t confirm what it\'s doing. You last saw it holding position. There are people and equipment in the area.',
      decisions: [
        {
          id: 'll1a',
          text: 'Warn everyone nearby and watch for the aircraft',
          nextNodeId: 'll-warn',
          scoreImpact: 30,
          isOptimal: true,
          rationale: 'First priority is always safety of people in the area'
        },
        {
          id: 'll1b',
          text: 'Try moving around to re-establish connection',
          nextNodeId: 'll-move',
          scoreImpact: 15,
          isOptimal: false,
          rationale: 'Acceptable, but warning others should come first'
        },
        {
          id: 'll1c',
          text: 'Run toward where the aircraft was to try to see it',
          nextNodeId: 'll-run',
          scoreImpact: -10,
          isOptimal: false,
          rationale: 'Running toward an uncontrolled aircraft is dangerous'
        }
      ]
    },
    {
      id: 'll-warn',
      scenarioId: 'lost-link',
      type: 'ending',
      content: 'You shout a warning to nearby workers and point to where the aircraft was. Everyone stops and looks up. Thirty seconds later, the aircraft executes its RTH failsafe and lands safely at the home point. You document the incident and later discover interference from a radio tower you hadn\'t identified. Good situational awareness and proper response.',
      isEnding: true,
      endingType: 'success',
      finalScore: 90
    },
    {
      id: 'll-move',
      scenarioId: 'lost-link',
      type: 'ending',
      content: 'You start moving around trying different positions. Connection briefly returns, then drops again. Meanwhile, the aircraft has started its RTH but you didn\'t notice there\'s an excavator in the return path. The aircraft clips the excavator boom and crashes. No one is hurt, but the aircraft is destroyed and the excavator needs inspection. You should have warned people first.',
      isEnding: true,
      endingType: 'partial',
      finalScore: 40
    },
    {
      id: 'll-run',
      scenarioId: 'lost-link',
      type: 'ending',
      content: 'You run toward where the aircraft was. The connection returns just as you trip on uneven ground and fall. You drop the controller. The aircraft, now reconnected, receives erratic inputs from the tumbling controller and descends rapidly. It narrowly misses a worker. You\'re shaken and bruised, and the near-miss requires a full investigation.',
      isEnding: true,
      endingType: 'failure',
      finalScore: 20
    }
  ]

  for (const node of scenarioNodes) {
    const nodeRef = doc(db, 'organizations', organizationId, 'scenarioNodes', node.id)
    batch.set(nodeRef, node)
  }

  // Commit all changes
  await batch.commit()

  console.log('Gamification content seeded successfully!')
  console.log(`- ${questTracks.length} quest tracks`)
  console.log(`- ${quests.length} quests`)
  console.log(`- ${lessons.length} lessons`)
  console.log(`- ${scenarios.length} scenarios`)
  console.log(`- ${scenarioNodes.length} scenario nodes`)

  return {
    questTracks: questTracks.length,
    quests: quests.length,
    lessons: lessons.length,
    scenarios: scenarios.length,
    scenarioNodes: scenarioNodes.length
  }
}

export default seedGamificationContent
