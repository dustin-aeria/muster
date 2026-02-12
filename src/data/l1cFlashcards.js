/**
 * L1C Flashcards Data
 * RPAS Level 1 Complex Operations - Comprehensive Study Flash Cards
 * Canadian Aviation Regulations (SOR/96-433)
 *
 * Source: RPAS_Level1_Complex_Operations_Flash_Cards.md
 * Total: 103 cards across 21 categories
 */

export const FLASHCARD_CATEGORIES = {
  definitions: { id: 'definitions', name: 'Definitions', color: 'bg-blue-100 text-blue-700' },
  l1c_scope: { id: 'l1c_scope', name: 'L1C Operations Scope', color: 'bg-purple-100 text-purple-700' },
  pilot_certificate: { id: 'pilot_certificate', name: 'Pilot Certificate Requirements', color: 'bg-green-100 text-green-700' },
  recency: { id: 'recency', name: 'Recency Requirements', color: 'bg-amber-100 text-amber-700' },
  flight_review: { id: 'flight_review', name: 'Flight Review & Exams', color: 'bg-red-100 text-red-700' },
  operator_certificate: { id: 'operator_certificate', name: 'RPAS Operator Certificate', color: 'bg-indigo-100 text-indigo-700' },
  declaration: { id: 'declaration', name: 'RPAS Declaration', color: 'bg-pink-100 text-pink-700' },
  operations_manual: { id: 'operations_manual', name: 'Operations Manual', color: 'bg-cyan-100 text-cyan-700' },
  safety: { id: 'safety', name: 'Safety Processes', color: 'bg-orange-100 text-orange-700' },
  training_program: { id: 'training_program', name: 'Training Program', color: 'bg-teal-100 text-teal-700' },
  maintenance: { id: 'maintenance', name: 'Maintenance & Records', color: 'bg-lime-100 text-lime-700' },
  operating_rules: { id: 'operating_rules', name: 'General Operating Rules', color: 'bg-emerald-100 text-emerald-700' },
  visual_observer: { id: 'visual_observer', name: 'Visual Observer', color: 'bg-violet-100 text-violet-700' },
  preflight: { id: 'preflight', name: 'Pre-Flight Requirements', color: 'bg-rose-100 text-rose-700' },
  controlled_airspace: { id: 'controlled_airspace', name: 'Controlled Airspace', color: 'bg-sky-100 text-sky-700' },
  evlos_sheltered: { id: 'evlos_sheltered', name: 'EVLOS & Sheltered Ops', color: 'bg-fuchsia-100 text-fuchsia-700' },
  registration: { id: 'registration', name: 'Registration & Notification', color: 'bg-stone-100 text-stone-700' },
  service_difficulty: { id: 'service_difficulty', name: 'Service Difficulty Reporting', color: 'bg-slate-100 text-slate-700' },
  advanced_ops: { id: 'advanced_ops', name: 'Advanced Operations', color: 'bg-zinc-100 text-zinc-700' },
  comparison: { id: 'comparison', name: 'Comparison Questions', color: 'bg-neutral-100 text-neutral-700' },
  quick_reference: { id: 'quick_reference', name: 'Quick Reference', color: 'bg-gray-100 text-gray-700' }
}

export const L1C_FLASHCARDS = [
  // SECTION 1: DEFINITIONS (Q1-Q17)
  {
    id: 'q1',
    category: 'definitions',
    question: 'What is BVLOS?',
    answer: 'Beyond Visual Line-of-Sight - operating a remotely piloted aircraft outside the pilot\'s unaided visual range.'
  },
  {
    id: 'q2',
    category: 'definitions',
    question: 'What is VLOS?',
    answer: 'Visual Line-of-Sight - unaided visual contact maintained with a remotely piloted aircraft sufficient to:\n• Maintain control\n• Know location\n• Detect conflicting traffic and hazards'
  },
  {
    id: 'q3',
    category: 'definitions',
    question: 'What is Extended VLOS?',
    answer: 'An operation where the aircraft is NOT in visual line-of-sight, but unaided visual contact IS maintained with the airspace to detect conflicts and take avoidance action.'
  },
  {
    id: 'q4',
    category: 'definitions',
    question: 'What is a Sheltered Operation?',
    answer: 'An operation where the aircraft:\n• Remains less than 200 feet (61 m) horizontally from a building/structure\n• At an altitude no greater than 100 feet (30 m)'
  },
  {
    id: 'q5',
    category: 'definitions',
    question: 'What is Flight Geography?',
    answer: 'The area within which a remotely piloted aircraft is intended to fly for a specific operation.'
  },
  {
    id: 'q6',
    category: 'definitions',
    question: 'What is Contingency Volume?',
    answer: 'The area immediately surrounding the flight geography within which contingency procedures are intended to be used to:\n• Return the aircraft to flight geography, OR\n• Safely terminate the flight'
  },
  {
    id: 'q7',
    category: 'definitions',
    question: 'What is Ground Risk Buffer?',
    answer: 'The area immediately surrounding the contingency volume that, when measured horizontally from the perimeter of the contingency volume, is at least equal to the planned maximum altitude.'
  },
  {
    id: 'q8',
    category: 'definitions',
    question: 'What is Operational Volume?',
    answer: 'The combined area composed of:\n1. Flight Geography\n2. Contingency Volume\n3. Ground Risk Buffer'
  },
  {
    id: 'q9',
    category: 'definitions',
    question: 'What is a Small Remotely Piloted Aircraft?',
    answer: 'Operating weight of at least 250g but not more than 25 kg (55 lbs).'
  },
  {
    id: 'q10',
    category: 'definitions',
    question: 'What is a Medium Remotely Piloted Aircraft?',
    answer: 'Operating weight of more than 25 kg (55 lbs) but not more than 150 kg (331 lbs).'
  },
  {
    id: 'q11',
    category: 'definitions',
    question: 'What is Operating Weight?',
    answer: 'The weight of the aircraft at any point during flight, including:\n• Any payload\n• Any safety equipment aboard or connected'
  },
  {
    id: 'q12',
    category: 'definitions',
    question: 'What is a Populated Area?',
    answer: 'An area with more than 5 people per square kilometre.'
  },
  {
    id: 'q13',
    category: 'definitions',
    question: 'What is a Sparsely Populated Area?',
    answer: 'An area with more than 5 but not more than 25 people per square kilometre.'
  },
  {
    id: 'q14',
    category: 'definitions',
    question: 'What is a Payload?',
    answer: 'A system, object, or collection of objects (including slung loads) that is on board or connected to the aircraft but is NOT required for flight.'
  },
  {
    id: 'q15',
    category: 'definitions',
    question: 'What is a Visual Observer?',
    answer: 'A crew member who is trained to assist the pilot in ensuring the safe conduct of a flight.'
  },
  {
    id: 'q16',
    category: 'definitions',
    question: 'What is a Fly-away?',
    answer: 'When there is an interruption or loss of the command and control link such that the pilot is no longer able to control the aircraft.'
  },
  {
    id: 'q17',
    category: 'definitions',
    question: 'What are Contingency Procedures?',
    answer: 'Procedures to be followed to address conditions that could lead to an unsafe situation.'
  },

  // SECTION 2: LEVEL 1 COMPLEX OPERATIONS - SCOPE (Q18-Q24)
  {
    id: 'q18',
    category: 'l1c_scope',
    question: 'What two categories of BVLOS operations does Level 1 Complex (Division VI) cover?',
    answer: 'Category (a) - Small OR Medium RPAS:\n• BVLOS in uncontrolled airspace\n• At least 1 km from a populated area (MANDATORY)\n\nCategory (b) - Small RPAS ONLY:\n• BVLOS in uncontrolled airspace\n• Over a sparsely populated area, OR\n• Less than 1 km from a populated area'
  },
  {
    id: 'q19',
    category: 'l1c_scope',
    question: 'Can MEDIUM RPAS conduct BVLOS operations closer than 1 km from a populated area?',
    answer: 'NO - Medium RPAS can ONLY conduct BVLOS under Category (a), which requires a minimum distance of 1 km from populated areas. Category (b) allowing closer operations is restricted to small RPAS only.'
  },
  {
    id: 'q20',
    category: 'l1c_scope',
    question: 'Can SMALL RPAS conduct BVLOS operations closer than 1 km from a populated area?',
    answer: 'YES - Small RPAS can operate under Category (b), which permits BVLOS:\n• Over sparsely populated areas, OR\n• At distances less than 1 km from populated areas'
  },
  {
    id: 'q21',
    category: 'l1c_scope',
    question: 'What is the key difference between small and medium RPAS for L1C BVLOS operations?',
    answer: '• Medium RPAS: Must ALWAYS maintain at least 1 km from populated areas (Category a only)\n• Small RPAS: Can operate at 1+ km (Category a) OR closer than 1 km/over sparsely populated areas (Category b)'
  },
  {
    id: 'q22',
    category: 'l1c_scope',
    question: 'What airspace type is Level 1 Complex Operations restricted to?',
    answer: 'Uncontrolled airspace ONLY - controlled airspace operations require additional certifications and ATC coordination.'
  },
  {
    id: 'q23',
    category: 'l1c_scope',
    question: 'Can you conduct Level 1 Complex Operations in controlled airspace?',
    answer: 'NO - Level 1 Complex is restricted to uncontrolled airspace. Controlled airspace requires additional authorization.'
  },
  {
    id: 'q24',
    category: 'l1c_scope',
    question: 'Where can small RPAS conduct BVLOS under Category (b)?',
    answer: 'In uncontrolled airspace:\n• Over sparsely populated areas (5-25 people/km²), OR\n• At a distance of less than 1 km from a populated area'
  },

  // SECTION 3: PILOT CERTIFICATE REQUIREMENTS (Q25-Q31)
  {
    id: 'q25',
    category: 'pilot_certificate',
    question: 'What is the minimum age for a Level 1 Complex Operations pilot certificate?',
    answer: '18 years old'
  },
  {
    id: 'q26',
    category: 'pilot_certificate',
    question: 'What are the requirements for a Level 1 Complex pilot certificate?',
    answer: '1. Be at least 18 years old\n2. Successfully complete the Advanced Operations examination (TP 15263)\n3. Complete 20 hours of RPAS ground school instruction from a training provider covering L1C operations (TP 15530)\n4. Pass the Level 1 Complex Operations examination (TP 15530)\n5. Complete flight review within 12 months prior to application (Standard 921)'
  },
  {
    id: 'q27',
    category: 'pilot_certificate',
    question: 'What is the minimum age for a Basic Operations certificate?',
    answer: '14 years old'
  },
  {
    id: 'q28',
    category: 'pilot_certificate',
    question: 'What is the minimum age for an Advanced Operations certificate?',
    answer: '16 years old'
  },
  {
    id: 'q29',
    category: 'pilot_certificate',
    question: 'What ground school hours are required for Level 1 Complex?',
    answer: '20 hours of RPAS ground school instruction delivered by an approved training provider, covering subjects in TP 15530.'
  },
  {
    id: 'q30',
    category: 'pilot_certificate',
    question: 'What examination must be passed BEFORE the L1C exam?',
    answer: 'The Remotely Piloted Aircraft Systems - Advanced Operations examination (TP 15263).'
  },
  {
    id: 'q31',
    category: 'pilot_certificate',
    question: 'What Transport Canada documents define L1C knowledge requirements?',
    answer: '• TP 15263: Basic and Advanced Operations knowledge requirements\n• TP 15530: Level 1 Complex Operations knowledge requirements'
  },

  // SECTION 4: RECENCY REQUIREMENTS (Q32-Q35)
  {
    id: 'q32',
    category: 'recency',
    question: 'What is the recency period for Level 1 Complex Operations?',
    answer: '24 months - must have completed qualifying requirements within 24 months before operating.'
  },
  {
    id: 'q33',
    category: 'recency',
    question: 'What qualifies for recency under Level 1 Complex Operations?',
    answer: 'Within 24 months, must have completed ONE of:\n• Issuance of the certificate, OR\n• Basic, Advanced, or L1C examinations, OR\n• Flight reviews per Standard 921, OR\n• Recurrent training activities per section 921.04 of Standard 921'
  },
  {
    id: 'q34',
    category: 'recency',
    question: 'How long must pilots retain recency activity records?',
    answer: 'At least 24 months after the day on which they were completed.'
  },
  {
    id: 'q35',
    category: 'recency',
    question: 'What must be easily accessible during flight operations?',
    answer: '• Pilot certificate\n• Proof of recency compliance\n• Authorization documents (if applicable)\n• Flight review completion records'
  },

  // SECTION 5: FLIGHT REVIEW & EXAMINATION RULES (Q36-Q39)
  {
    id: 'q36',
    category: 'flight_review',
    question: 'How long before application must the flight review be completed?',
    answer: 'Within 12 months prior to certificate application.'
  },
  {
    id: 'q37',
    category: 'flight_review',
    question: 'What is the waiting period to retake a failed examination?',
    answer: '24 hours before retaking failed examinations or flight reviews.'
  },
  {
    id: 'q38',
    category: 'flight_review',
    question: 'What is prohibited during examinations?',
    answer: '• Cheating\n• Unauthorized assistance\n• Possession of unauthorized materials'
  },
  {
    id: 'q39',
    category: 'flight_review',
    question: 'What standard governs flight reviews for RPAS pilots?',
    answer: 'Standard 921 - Remotely Piloted Aircraft, specifically section 921.02.'
  },

  // SECTION 6: RPAS OPERATOR CERTIFICATE (Q40-Q44)
  {
    id: 'q40',
    category: 'operator_certificate',
    question: 'Is an RPAS Operator Certificate required for Level 1 Complex Operations?',
    answer: 'YES - mandatory for conducting Level 1 Complex Operations.'
  },
  {
    id: 'q41',
    category: 'operator_certificate',
    question: 'Who can conduct Level 1 Complex Operations?',
    answer: 'A person who:\n• IS an RPAS operator, OR\n• Is an employee, agent, mandatary, or representative of an RPAS operator\n\nAND complies with the conditions in the RPAS operator certificate.'
  },
  {
    id: 'q42',
    category: 'operator_certificate',
    question: 'Who is eligible for an RPAS Operator Certificate (commercial)?',
    answer: 'Must be Canadian (Canadian citizen, permanent resident, or Canadian-incorporated entity).'
  },
  {
    id: 'q43',
    category: 'operator_certificate',
    question: 'Who is eligible for an RPAS Operator Certificate (non-commercial)?',
    answer: '• Canadian citizens or permanent residents\n• Government entities in Canada (or their agents/representatives)\n• Corporations incorporated under Canadian federal or provincial law'
  },
  {
    id: 'q44',
    category: 'operator_certificate',
    question: 'What information is required for Operator Certificate application?',
    answer: '• Legal name and contact information\n• Accountable executive identification\n• Declaration of operations manual compliance\n• Training program compliance\n• Operational intent statement'
  },

  // SECTION 7: RPAS DECLARATION REQUIREMENTS (Q45-Q50)
  {
    id: 'q45',
    category: 'declaration',
    question: 'What must be submitted in an RPAS Declaration?',
    answer: '1. Legal name, trade name, address, contact details\n2. Model name of the RPAS\n3. Configurable elements of the system\n4. Intended operations to be conducted\n5. Technical requirements from Standard 922 subject to declaration'
  },
  {
    id: 'q46',
    category: 'declaration',
    question: 'What makes an RPAS Declaration invalid?',
    answer: 'Three conditions:\n1. The model fails to meet specified technical requirements\n2. The declarant notifies the Minister of invalidity\n3. Annual reporting requirements are not met'
  },
  {
    id: 'q47',
    category: 'declaration',
    question: 'What document is required before making a declaration for certain advanced BVLOS operations?',
    answer: 'An acceptance letter must have been issued within 2 years prior to making the declaration.'
  },
  {
    id: 'q48',
    category: 'declaration',
    question: 'Within what timeframe must declarants notify the Minister of contact changes?',
    answer: 'Within 30 days of any changes to names, addresses, or contact information.'
  },
  {
    id: 'q49',
    category: 'declaration',
    question: 'What must be included in annual reports?',
    answer: '• Operator name\n• Aircraft model name\n• Operational hours in Canada\n• Count of service difficulty reports with summaries of mandatory actions'
  },
  {
    id: 'q50',
    category: 'declaration',
    question: 'Is a declaration required before conducting L1C operations?',
    answer: 'YES - Per section 901.95, no pilot shall operate under Division VI (L1C) unless a declaration has been made in accordance with section 901.194.'
  },

  // SECTION 8: OPERATIONS MANUAL REQUIREMENTS (Q51-Q52)
  {
    id: 'q51',
    category: 'operations_manual',
    question: 'What must the Operations Manual describe?',
    answer: '• Crew roles and responsibilities\n• Personnel hierarchy\n• Established processes and procedures\n• Detailed training syllabus components'
  },
  {
    id: 'q52',
    category: 'operations_manual',
    question: 'What documentation must operators provide to users?',
    answer: '• Maintenance programs with servicing instructions and inspection procedures\n• Mandatory actions\n• Operating manuals covering:\n  - System descriptions\n  - Weight/center-of-gravity limits\n  - Flight envelope parameters\n  - Environmental effects\n  - Safety features\n  - Warning systems\n  - Emergency procedures\n  - Integration instructions'
  },

  // SECTION 9: SAFETY PROCESSES (Q53)
  {
    id: 'q53',
    category: 'safety',
    question: 'What safety processes must RPAS operators establish?',
    answer: '• Setting aviation safety goals\n• Identifying hazards\n• Evaluating mitigation effectiveness\n• Reporting incidents\n• Ensuring maintenance compliance'
  },

  // SECTION 10: TRAINING PROGRAM REQUIREMENTS (Q54-Q55)
  {
    id: 'q54',
    category: 'training_program',
    question: 'What must RPAS operator training programs include?',
    answer: '• Indoctrination training\n• Initial training covering:\n  - Aircraft models\n  - Servicing/ground handling\n  - Operational procedures\n• Annual recurrent training'
  },
  {
    id: 'q55',
    category: 'training_program',
    question: 'What qualifications must training instructors have?',
    answer: '• Demonstrate operations manual knowledge\n• Hold required pilot certificates'
  },

  // SECTION 11: MAINTENANCE & RECORD KEEPING (Q56-Q58)
  {
    id: 'q56',
    category: 'maintenance',
    question: 'What maintenance responsibilities do operators have?',
    answer: '• Appoint persons responsible for maintenance planning and oversight\n• Establish Maintenance Control Manuals\n• List authorized maintenance personnel\n• Maintain records\n• Establish procedures consistent with manufacturer instructions'
  },
  {
    id: 'q57',
    category: 'maintenance',
    question: 'What records must operators maintain?',
    answer: '• Crew involvement records\n• Employee names\n• Training received\n• Aircraft registrations\n• Maintenance actions'
  },
  {
    id: 'q58',
    category: 'maintenance',
    question: 'How long must operator records be maintained?',
    answer: '12-24 months depending on record type.'
  },

  // SECTION 12: GENERAL OPERATING RULES (Q59-Q68)
  {
    id: 'q59',
    category: 'operating_rules',
    question: 'What is the standard maximum altitude for RPAS operations?',
    answer: '400 feet (122 m) AGL'
  },
  {
    id: 'q60',
    category: 'operating_rules',
    question: 'What altitude restriction applies when within 200 feet horizontally of a structure?',
    answer: 'Must maintain altitude no greater than 100 feet (30 m) above any building or structure.'
  },
  {
    id: 'q61',
    category: 'operating_rules',
    question: 'What is the minimum horizontal distance from uninvolved persons for SMALL RPAS (VLOS)?',
    answer: '100 feet (30 m) measured horizontally at any altitude.'
  },
  {
    id: 'q62',
    category: 'operating_rules',
    question: 'What is the minimum horizontal distance from uninvolved persons for MEDIUM RPAS (VLOS)?',
    answer: '500 feet (152.4 m) measured horizontally at any altitude.'
  },
  {
    id: 'q63',
    category: 'operating_rules',
    question: 'What must pilots yield to?',
    answer: 'Must give way to:\n• Power-driven heavier-than-air aircraft\n• Airships\n• Gliders\n• Balloons\n\nAT ALL TIMES'
  },
  {
    id: 'q64',
    category: 'operating_rules',
    question: 'What is the alcohol restriction for RPAS crew members?',
    answer: 'Cannot serve:\n• Within 12 hours after consuming alcohol\n• While under alcohol\'s influence\n• While using impairing drugs'
  },
  {
    id: 'q65',
    category: 'operating_rules',
    question: 'When must operations immediately cease?',
    answer: 'If aviation safety or the safety of any person is endangered or likely to be endangered.'
  },
  {
    id: 'q66',
    category: 'operating_rules',
    question: 'What must happen if an aircraft loses pilot control and enters/threatens controlled airspace?',
    answer: 'Immediately notify the appropriate ATS unit or agency.'
  },
  {
    id: 'q67',
    category: 'operating_rules',
    question: 'Can RPAS carry passengers?',
    answer: 'NO - except with a special flight operations certificate issued under section 903.03.'
  },
  {
    id: 'q68',
    category: 'operating_rules',
    question: 'Can RPAS leave Canadian Domestic Airspace?',
    answer: 'NO - except with a special flight operations certificate.'
  },

  // SECTION 13: VISUAL OBSERVER REQUIREMENTS (Q69-Q74)
  {
    id: 'q69',
    category: 'visual_observer',
    question: 'What communication must be maintained between pilot and visual observer?',
    answer: 'Reliable and timely communication during the operation.'
  },
  {
    id: 'q70',
    category: 'visual_observer',
    question: 'Can a visual observer monitor multiple aircraft?',
    answer: 'NO - cannot monitor multiple aircraft simultaneously (except under Division V conditions or special certificates).'
  },
  {
    id: 'q71',
    category: 'visual_observer',
    question: 'Can visual observers perform duties while operating vehicles?',
    answer: 'NO - cannot perform duties while operating vehicles, vessels, or aircraft.'
  },
  {
    id: 'q72',
    category: 'visual_observer',
    question: 'What is the visual observer\'s reporting obligation?',
    answer: 'Must promptly communicate detection of conflicting traffic or hazards to the pilot.'
  },
  {
    id: 'q73',
    category: 'visual_observer',
    question: 'What certificates must visual observers hold?',
    answer: 'Must hold one of:\n• Small RPAS basic certificate\n• Remotely piloted aircraft advanced certificate\n• Level 1 Complex Operations certificate'
  },
  {
    id: 'q74',
    category: 'visual_observer',
    question: 'What is the maximum distance a visual observer can be from the aircraft?',
    answer: 'Must maintain visual contact within 2 nautical miles of the aircraft.'
  },

  // SECTION 14: PRE-FLIGHT REQUIREMENTS (Q75-Q77)
  {
    id: 'q75',
    category: 'preflight',
    question: 'What must be determined in a site survey?',
    answer: '• Airspace type and requirements\n• Altitudes and routes for approach/launch/recovery\n• Proximity of other aircraft operations\n• Distance from airports and aerodromes\n• Obstacles (wires, towers, buildings, turbines)\n• Weather and environmental conditions\n• Horizontal distance from uninvolved persons\n• Distance from populated areas (BVLOS)'
  },
  {
    id: 'q76',
    category: 'preflight',
    question: 'What must pilots be familiar with before flight?',
    answer: '• Results of site survey\n• Declarations regarding aircraft systems\n• Crew qualifications'
  },
  {
    id: 'q77',
    category: 'preflight',
    question: 'What emergency procedures must be established?',
    answer: '• Control station failure\n• Equipment failure\n• Aircraft failure\n• Loss of command and control link\n• Fly-away scenarios\n• Flight termination\n• Detection and avoidance of conflicting traffic'
  },

  // SECTION 15: CONTROLLED AIRSPACE & AIRPORT PROXIMITY (Q78-Q81)
  {
    id: 'q78',
    category: 'controlled_airspace',
    question: 'What is required for controlled airspace operations?',
    answer: 'Authorization from air traffic services provider.'
  },
  {
    id: 'q79',
    category: 'controlled_airspace',
    question: 'What information must be provided for controlled airspace authorization?',
    answer: '• Operation date, time, duration\n• Aircraft category, registration, characteristics\n• Operational boundaries and altitude limits\n• Pilot contact information and certificate number\n• Emergency procedures\n• Lost command/control link procedures'
  },
  {
    id: 'q80',
    category: 'controlled_airspace',
    question: 'What distance restriction applies near airports?',
    answer: 'Cannot operate within 3 nautical miles of airport centers without established safe-use procedures.'
  },
  {
    id: 'q81',
    category: 'controlled_airspace',
    question: 'What distance restriction applies near heliports?',
    answer: 'Cannot operate within 1 nautical mile of heliport centers without established safe-use procedures.'
  },

  // SECTION 16: EXTENDED VLOS & SHELTERED OPERATIONS (Q82)
  {
    id: 'q82',
    category: 'evlos_sheltered',
    question: 'What are the requirements for Extended VLOS operations?',
    answer: '• Pilot and control station at take-off/landing site during those activities\n• Aircraft within 2 nautical miles of pilot/observer\n• Minimum 100 feet horizontal from uninvolved persons\n• Visual observer must maintain unaided visual contact to detect hazards'
  },

  // SECTION 17: REGISTRATION & NOTIFICATION (Q83-Q84)
  {
    id: 'q83',
    category: 'registration',
    question: 'What must be easily accessible during operations regarding registration?',
    answer: 'The certificate of registration issued for the remotely piloted aircraft.'
  },
  {
    id: 'q84',
    category: 'registration',
    question: 'Within what timeframe must owners notify the Minister of aircraft changes?',
    answer: 'Within 7 days of:\n• Aircraft destruction\n• Permanent withdrawal from use\n• Aircraft missing with terminated search\n• Aircraft missing 60+ days\n• Transfer of custody and control'
  },

  // SECTION 18: SERVICE DIFFICULTY REPORTING (Q85-Q86)
  {
    id: 'q85',
    category: 'service_difficulty',
    question: 'What must operators establish for service difficulties?',
    answer: 'Systems to receive, record, analyze, and investigate reports concerning reportable service difficulties.'
  },
  {
    id: 'q86',
    category: 'service_difficulty',
    question: 'What action must be taken when deficiencies are discovered?',
    answer: 'Must develop a mandatory action to rectify the deficiency.'
  },

  // SECTION 19: ADVANCED OPERATIONS (Q87-Q89)
  {
    id: 'q87',
    category: 'advanced_ops',
    question: 'What SMALL RPAS operations fall under Advanced Operations (Division V)?',
    answer: '• VLOS in controlled airspace\n• VLOS 16.4-100 feet from uninvolved persons (any altitude)\n• VLOS less than 16.4 feet from uninvolved persons (any altitude)\n• VLOS within 3 NM of airport or 1 NM of heliport\n• Extended VLOS in uncontrolled airspace\n• Sheltered operations'
  },
  {
    id: 'q88',
    category: 'advanced_ops',
    question: 'What MEDIUM RPAS operations fall under Advanced Operations (Division V)?',
    answer: '• VLOS in uncontrolled airspace at 500+ feet from uninvolved persons\n• VLOS in uncontrolled airspace at 100-500 feet from uninvolved persons\n• VLOS at less than 100 feet from uninvolved persons\n• VLOS in controlled airspace'
  },
  {
    id: 'q89',
    category: 'advanced_ops',
    question: 'What distinguishes Advanced Operations from Level 1 Complex Operations?',
    answer: '• Advanced Operations (Division V): VLOS operations in various scenarios (controlled airspace, near people, near airports, extended VLOS, sheltered)\n• Level 1 Complex (Division VI): Specifically covers BVLOS operations in uncontrolled airspace'
  },

  // SECTION 20: COMPARISON QUESTIONS (Q90-Q94)
  {
    id: 'q90',
    category: 'comparison',
    question: 'Age requirements comparison - Basic vs Advanced vs L1C?',
    answer: '• Basic: 14 years old\n• Advanced: 16 years old\n• Level 1 Complex: 18 years old'
  },
  {
    id: 'q91',
    category: 'comparison',
    question: 'What additional training is required for L1C beyond Advanced?',
    answer: '• 20 hours of ground school instruction specifically covering Level 1 Complex Operations (TP 15530)\n• Pass the L1C examination (in addition to already having passed Advanced)'
  },
  {
    id: 'q92',
    category: 'comparison',
    question: 'Small vs Medium RPAS - weight ranges?',
    answer: '• Small: 250g to 25 kg (55 lbs)\n• Medium: >25 kg to 150 kg (331 lbs)'
  },
  {
    id: 'q93',
    category: 'comparison',
    question: 'Small vs Medium RPAS - minimum VLOS distance from uninvolved persons?',
    answer: '• Small: 100 feet (30 m)\n• Medium: 500 feet (152.4 m)'
  },
  {
    id: 'q94',
    category: 'comparison',
    question: 'Small vs Medium RPAS - L1C BVLOS populated area rules?',
    answer: '• Medium: MUST be at least 1 km from populated areas (Category a ONLY)\n• Small: Can be 1+ km from populated areas (Category a) OR less than 1 km/over sparsely populated (Category b)\n\nKEY POINT: Medium RPAS have NO flexibility - they must always maintain 1 km. Small RPAS can operate closer.'
  },

  // SECTION 21: QUICK REFERENCE - KEY NUMBERS (Q95-Q103)
  {
    id: 'q95',
    category: 'quick_reference',
    question: 'Key VLOS distances from uninvolved persons?',
    answer: '• Small RPAS: 100 feet (30 m)\n• Medium RPAS: 500 feet (152.4 m)'
  },
  {
    id: 'q96',
    category: 'quick_reference',
    question: 'Key BVLOS (L1C) distances from populated areas?',
    answer: '• Medium RPAS: At least 1 km (MANDATORY - no exceptions under L1C)\n• Small RPAS: 1+ km (Category a) OR <1 km/sparsely populated (Category b)'
  },
  {
    id: 'q97',
    category: 'quick_reference',
    question: 'Key proximity restrictions?',
    answer: '• Airports: 3 nautical miles from center\n• Heliports: 1 nautical mile from center\n• Extended VLOS range: 2 nautical miles from pilot/observer\n• Sheltered ops - building: Less than 200 feet (61 m) horizontal'
  },
  {
    id: 'q98',
    category: 'quick_reference',
    question: 'Key altitudes?',
    answer: '• Standard maximum: 400 feet (122 m) AGL\n• Sheltered operations: 100 feet (30 m) max\n• Near structures (within 200 ft horizontal): 100 feet above structure'
  },
  {
    id: 'q99',
    category: 'quick_reference',
    question: 'Key time periods?',
    answer: '• 12 hours: Alcohol restriction before duty\n• 12 months: Flight review validity for certificate application\n• 24 hours: Wait period for exam retake\n• 24 months: Recency period\n• 2 years: Acceptance letter validity for declarations\n• 30 days: Contact change notification to Minister\n• 7 days: Aircraft status change notification'
  },
  {
    id: 'q100',
    category: 'quick_reference',
    question: 'Key weight thresholds?',
    answer: '• 250g: Minimum for regulated RPAS\n• 25 kg (55 lbs): Small/Medium boundary\n• 150 kg (331 lbs): Maximum for Medium RPAS'
  },
  {
    id: 'q101',
    category: 'quick_reference',
    question: 'Key age requirements?',
    answer: '• 14: Basic Operations\n• 16: Advanced Operations\n• 18: Level 1 Complex Operations'
  },
  {
    id: 'q102',
    category: 'quick_reference',
    question: 'Key training requirements?',
    answer: '• Basic: No ground school required, Basic exam (TP 15263), No flight review\n• Advanced: None specified, Advanced exam (TP 15263), Flight review within 12 months\n• L1C: 20 hours ground school (TP 15530), Advanced + L1C exams, Flight review within 12 months'
  },
  {
    id: 'q103',
    category: 'quick_reference',
    question: 'Population density definitions?',
    answer: '• Populated area: >5 people/km²\n• Sparsely populated: >5 to 25 people/km²'
  }
]

export default L1C_FLASHCARDS
