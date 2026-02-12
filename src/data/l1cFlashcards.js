/**
 * L1C Flashcards Data
 * RPAS Level 1 Complex Operations - Comprehensive Study Flash Cards
 * Canadian Aviation Regulations (SOR/96-433), SORA, Declarations & Technical Standards
 *
 * Source: RPAS_L1C_Comprehensive_Study_Guide.md
 * Total: 241 cards across 28 categories (Q1-Q240, comprehensive)
 * Last Updated: 2026-02-12
 */

export const FLASHCARD_CATEGORIES = {
  definitions: { id: 'definitions', name: 'Core Definitions', color: 'bg-blue-100 text-blue-700' },
  l1c_scope: { id: 'l1c_scope', name: 'L1C Operations Scope', color: 'bg-purple-100 text-purple-700' },
  pilot_certificate: { id: 'pilot_certificate', name: 'Pilot Certificate Requirements', color: 'bg-green-100 text-green-700' },
  recency: { id: 'recency', name: 'Recency Requirements', color: 'bg-amber-100 text-amber-700' },
  operator_certificate: { id: 'operator_certificate', name: 'RPAS Operator Certificate', color: 'bg-indigo-100 text-indigo-700' },
  operating_rules: { id: 'operating_rules', name: 'General Operating Rules', color: 'bg-emerald-100 text-emerald-700' },
  declaration_fundamentals: { id: 'declaration_fundamentals', name: 'Declaration Fundamentals', color: 'bg-pink-100 text-pink-700' },
  standard_922: { id: 'standard_922', name: 'Standard 922 Compliance', color: 'bg-cyan-100 text-cyan-700' },
  position_accuracy: { id: 'position_accuracy', name: 'Position & Altitude Accuracy', color: 'bg-orange-100 text-orange-700' },
  near_over_people: { id: 'near_over_people', name: 'Operations Near/Over People', color: 'bg-red-100 text-red-700' },
  safety_reliability: { id: 'safety_reliability', name: 'Safety & Reliability', color: 'bg-teal-100 text-teal-700' },
  containment: { id: 'containment', name: 'Containment', color: 'bg-lime-100 text-lime-700' },
  c2_link: { id: 'c2_link', name: 'C2 Link & Lost Link', color: 'bg-violet-100 text-violet-700' },
  daa: { id: 'daa', name: 'Detect, Alert & Avoid', color: 'bg-rose-100 text-rose-700' },
  control_station: { id: 'control_station', name: 'Control Station Design', color: 'bg-sky-100 text-sky-700' },
  declarant_obligations: { id: 'declarant_obligations', name: 'Declarant Obligations', color: 'bg-fuchsia-100 text-fuchsia-700' },
  pvd_requirements: { id: 'pvd_requirements', name: 'PVD Requirements', color: 'bg-stone-100 text-stone-700' },
  sora_fundamentals: { id: 'sora_fundamentals', name: 'SORA Fundamentals', color: 'bg-slate-100 text-slate-700' },
  grc: { id: 'grc', name: 'Ground Risk Class (GRC)', color: 'bg-zinc-100 text-zinc-700' },
  grc_mitigations: { id: 'grc_mitigations', name: 'GRC Mitigations', color: 'bg-neutral-100 text-neutral-700' },
  arc: { id: 'arc', name: 'Air Risk Class (ARC)', color: 'bg-amber-100 text-amber-700' },
  sail: { id: 'sail', name: 'SAIL Determination', color: 'bg-blue-100 text-blue-700' },
  oso: { id: 'oso', name: 'Operational Safety Objectives', color: 'bg-green-100 text-green-700' },
  sora_calculations: { id: 'sora_calculations', name: 'SORA Calculations', color: 'bg-purple-100 text-purple-700' },
  injury_testing: { id: 'injury_testing', name: 'Injury Assessment & Testing', color: 'bg-red-100 text-red-700' },
  visual_observer: { id: 'visual_observer', name: 'Visual Observer', color: 'bg-indigo-100 text-indigo-700' },
  preflight_emergency: { id: 'preflight_emergency', name: 'Pre-Flight & Emergency', color: 'bg-orange-100 text-orange-700' },
  quick_reference: { id: 'quick_reference', name: 'Quick Reference', color: 'bg-gray-100 text-gray-700' }
}

export const L1C_FLASHCARDS = [
  // PART 1: SECTION 1.1 - CORE DEFINITIONS (Q1-Q22)
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
    question: 'What is Extended VLOS (EVLOS)?',
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
    answer: 'The area within which a remotely piloted aircraft is intended to fly for a specific operation during normal operations.'
  },
  {
    id: 'q6',
    category: 'definitions',
    question: 'What is Contingency Volume?',
    answer: 'The area immediately surrounding the flight geography within which contingency procedures are intended to be used to:\n• Return the aircraft to flight geography, OR\n• Safely terminate the flight\n\nEntry into contingency volume = abnormal situation'
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
    question: 'What is a Small Remotely Piloted Aircraft (sRPA/sRPAS)?',
    answer: 'Operating weight of at least 250g but not more than 25 kg (55 lbs).'
  },
  {
    id: 'q10',
    category: 'definitions',
    question: 'What is a Medium Remotely Piloted Aircraft (mRPA/mRPAS)?',
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
  {
    id: 'q18',
    category: 'definitions',
    question: 'What is a Service Difficulty?',
    answer: 'A failure or malfunction of, or defect in, an aeronautical product (Ref CAR 101).'
  },
  {
    id: 'q19',
    category: 'definitions',
    question: 'What is a Reportable Service Difficulty?',
    answer: 'A service difficulty that affects or, if not corrected, is likely to affect the safety of an aircraft, its occupants or any other person.'
  },
  {
    id: 'q20',
    category: 'definitions',
    question: 'What is a Mandatory Action?',
    answer: 'The inspection, repair, or modification of a remotely piloted aircraft system that the manufacturer considers necessary to prevent an unsafe or potentially unsafe condition.'
  },
  {
    id: 'q21',
    category: 'definitions',
    question: 'What is Airworthy/Airworthiness for RPAS?',
    answer: 'For RPAS without a formal type design, airworthy means the RPAS conforms with the intended design of the manufacturer or Declarant.'
  },
  {
    id: 'q22',
    category: 'definitions',
    question: 'What is the Accountable Executive?',
    answer: 'The individual appointed by the RPAS Operating Certificate holder to be:\n• Responsible for operations authorized under the certificate\n• Accountable for meeting regulatory requirements'
  },

  // SECTION 1.2: L1C SCOPE (Q23-Q27)
  {
    id: 'q23',
    category: 'l1c_scope',
    question: 'What two categories of BVLOS operations does Level 1 Complex (Division VI) cover?',
    answer: 'Category (a) - Small OR Medium RPAS:\n• BVLOS in uncontrolled airspace\n• At least 1 km from a populated area (MANDATORY)\n\nCategory (b) - Small RPAS ONLY:\n• BVLOS in uncontrolled airspace\n• Over a sparsely populated area, OR\n• Less than 1 km from a populated area'
  },
  {
    id: 'q24',
    category: 'l1c_scope',
    question: 'Can MEDIUM RPAS conduct BVLOS operations closer than 1 km from a populated area under L1C?',
    answer: 'NO - Medium RPAS can ONLY conduct BVLOS under Category (a), which requires a minimum distance of 1 km from populated areas. Category (b) is restricted to small RPAS only.'
  },
  {
    id: 'q25',
    category: 'l1c_scope',
    question: 'Can SMALL RPAS conduct BVLOS operations closer than 1 km from a populated area under L1C?',
    answer: 'YES - Small RPAS can operate under Category (b), which permits BVLOS:\n• Over sparsely populated areas, OR\n• At distances less than 1 km from populated areas'
  },
  {
    id: 'q26',
    category: 'l1c_scope',
    question: 'What is the KEY difference between small and medium RPAS for L1C BVLOS operations?',
    answer: 'Medium RPAS: Must ALWAYS maintain at least 1 km from populated areas (Category a ONLY)\n\nSmall RPAS: Can operate at 1+ km (Category a) OR closer than 1 km/over sparsely populated areas (Category b)\n\nKEY POINT: Medium RPAS have NO flexibility. Small RPAS can operate closer.'
  },
  {
    id: 'q27',
    category: 'l1c_scope',
    question: 'What airspace type is Level 1 Complex Operations restricted to?',
    answer: 'Uncontrolled airspace ONLY - controlled airspace operations require additional certifications and ATC coordination.'
  },

  // SECTION 1.3: PILOT CERTIFICATE (Q28-Q34)
  {
    id: 'q28',
    category: 'pilot_certificate',
    question: 'What is the minimum age for a Level 1 Complex Operations pilot certificate?',
    answer: '18 years old'
  },
  {
    id: 'q29',
    category: 'pilot_certificate',
    question: 'What are the requirements for a Level 1 Complex pilot certificate?',
    answer: '1. Be at least 18 years old\n2. Successfully complete the Advanced Operations examination (TP 15263)\n3. Complete 20 hours of RPAS ground school instruction from a training provider covering L1C operations (TP 15530)\n4. Pass the Level 1 Complex Operations examination (TP 15530)\n5. Complete flight review within 12 months prior to application (Standard 921)'
  },
  {
    id: 'q30',
    category: 'pilot_certificate',
    question: 'What is the minimum age for a Basic Operations certificate?',
    answer: '14 years old'
  },
  {
    id: 'q31',
    category: 'pilot_certificate',
    question: 'What is the minimum age for an Advanced Operations certificate?',
    answer: '16 years old'
  },
  {
    id: 'q32',
    category: 'pilot_certificate',
    question: 'What ground school hours are required for Level 1 Complex?',
    answer: '20 hours of RPAS ground school instruction delivered by an approved training provider, covering subjects in TP 15530.'
  },
  {
    id: 'q33',
    category: 'pilot_certificate',
    question: 'What examination must be passed BEFORE the L1C exam?',
    answer: 'The Remotely Piloted Aircraft Systems - Advanced Operations examination (TP 15263).'
  },
  {
    id: 'q34',
    category: 'pilot_certificate',
    question: 'What Transport Canada documents define L1C knowledge requirements?',
    answer: '• TP 15263: Basic and Advanced Operations knowledge requirements\n• TP 15530: Level 1 Complex Operations knowledge requirements'
  },

  // SECTION 1.4: RECENCY (Q35-Q37)
  {
    id: 'q35',
    category: 'recency',
    question: 'What is the recency period for Level 1 Complex Operations?',
    answer: '24 months - must have completed qualifying requirements within 24 months before operating.'
  },
  {
    id: 'q36',
    category: 'recency',
    question: 'What qualifies for recency under Level 1 Complex Operations?',
    answer: 'Within 24 months, must have completed ONE of:\n• Issuance of the certificate, OR\n• Basic, Advanced, or L1C examinations, OR\n• Flight reviews per Standard 921, OR\n• Recurrent training activities per section 921.04 of Standard 921'
  },
  {
    id: 'q37',
    category: 'recency',
    question: 'How long must pilots retain recency activity records?',
    answer: 'At least 24 months after the day on which they were completed.'
  },

  // SECTION 1.5: OPERATOR CERTIFICATE (Q38-Q40)
  {
    id: 'q38',
    category: 'operator_certificate',
    question: 'Is an RPAS Operator Certificate required for Level 1 Complex Operations?',
    answer: 'YES - mandatory for conducting Level 1 Complex Operations.'
  },
  {
    id: 'q39',
    category: 'operator_certificate',
    question: 'Who can conduct Level 1 Complex Operations?',
    answer: 'A person who:\n• IS an RPAS operator, OR\n• Is an employee, agent, mandatary, or representative of an RPAS operator\n\nAND complies with the conditions in the RPAS operator certificate.'
  },
  {
    id: 'q40',
    category: 'operator_certificate',
    question: 'Who is eligible for an RPAS Operator Certificate?',
    answer: '• Canadian citizens or permanent residents\n• Government entities in Canada (or their agents/representatives)\n• Corporations incorporated under Canadian federal or provincial law'
  },

  // SECTION 1.6: GENERAL OPERATING RULES (Q41-Q51)
  {
    id: 'q41',
    category: 'operating_rules',
    question: 'What is the standard maximum altitude for RPAS operations?',
    answer: '400 feet (122 m) AGL'
  },
  {
    id: 'q42',
    category: 'operating_rules',
    question: 'What altitude restriction applies when within 200 feet horizontally of a structure?',
    answer: 'Must maintain altitude no greater than 100 feet (30 m) above any building or structure.'
  },
  {
    id: 'q43',
    category: 'operating_rules',
    question: 'What is the minimum horizontal distance from uninvolved persons for SMALL RPAS (VLOS)?',
    answer: '100 feet (30 m) measured horizontally at any altitude.'
  },
  {
    id: 'q44',
    category: 'operating_rules',
    question: 'What is the minimum horizontal distance from uninvolved persons for MEDIUM RPAS (VLOS)?',
    answer: '500 feet (152.4 m) measured horizontally at any altitude.'
  },
  {
    id: 'q45',
    category: 'operating_rules',
    question: 'What must pilots yield to?',
    answer: 'Must give way to:\n• Power-driven heavier-than-air aircraft\n• Airships\n• Gliders\n• Balloons\n\nAT ALL TIMES'
  },
  {
    id: 'q46',
    category: 'operating_rules',
    question: 'What is the alcohol restriction for RPAS crew members?',
    answer: 'Cannot serve:\n• Within 12 hours after consuming alcohol\n• While under alcohol\'s influence\n• While using impairing drugs'
  },
  {
    id: 'q47',
    category: 'operating_rules',
    question: 'When must operations immediately cease?',
    answer: 'If aviation safety or the safety of any person is endangered or likely to be endangered.'
  },
  {
    id: 'q48',
    category: 'operating_rules',
    question: 'What must happen if an aircraft loses pilot control and enters/threatens controlled airspace?',
    answer: 'Immediately notify the appropriate ATS unit or agency.'
  },
  {
    id: 'q49',
    category: 'operating_rules',
    question: 'Can RPAS carry passengers?',
    answer: 'NO - except with a special flight operations certificate issued under section 903.03.'
  },
  {
    id: 'q50',
    category: 'operating_rules',
    question: 'Can RPAS leave Canadian Domestic Airspace?',
    answer: 'NO - except with a special flight operations certificate.'
  },
  {
    id: 'q51',
    category: 'operating_rules',
    question: 'Can operations be conducted in known icing conditions?',
    answer: 'NO - CAR 901.35 prohibits operation in icing conditions without detection or protection equipment.'
  },

  // PART 2: DECLARATIONS - FUNDAMENTALS (Q52-Q60)
  {
    id: 'q52',
    category: 'declaration_fundamentals',
    question: 'What is a Safety Assurance Declaration?',
    answer: 'A formal declaration made to Transport Canada by manufacturers, builders, or modifiers of RPAS that:\n• Identifies the capabilities of the system\n• Confirms it can perform advanced or complex operations safely\n• Certifies compliance with CAR 901.194 and Standard 922'
  },
  {
    id: 'q53',
    category: 'declaration_fundamentals',
    question: 'Why was the Declaration system adopted instead of type certification?',
    answer: '1. Low risk to aircraft and people on ground for small RPAS operations\n2. Novel technology combined with low cost means designs iterate faster than traditional aviation\n3. Type certification time exceeds iterative design cycles and often exceeds design service life\n4. High volume of small RPAS manufacturers makes traditional certification impractical'
  },
  {
    id: 'q54',
    category: 'declaration_fundamentals',
    question: 'What are the two types of Safety Assurance processes?',
    answer: '1. Declaration (Lower Risk):\n• No direct Transport Canada involvement\n• Applicant declares RPAS meets Standard 922 requirements\n• Must retain all compliance evidence\n• TC may review data on request\n\n2. Pre-Validated Declaration (PVD) (Higher Risk):\n• Requires TC involvement early in process\n• Proposed Means of Compliance must be accepted BEFORE declaration\n• TC issues Letter of Acceptance\n• 2-year time limit between acceptance letter and declaration'
  },
  {
    id: 'q55',
    category: 'declaration_fundamentals',
    question: 'Who can submit a Safety Assurance Declaration?',
    answer: '• Designer and/or manufacturer of a drone or configurable element\n• Third-party drone modifiers\n• Individuals who design and build "home-built" drones\n• Foreign RPAS manufacturers (being Canadian is NOT required)'
  },
  {
    id: 'q56',
    category: 'declaration_fundamentals',
    question: 'When is a Safety Assurance Declaration required?',
    answer: '• Operating drones for Advanced Operations\n• Operating drones for Level 1 Complex Operations\n• Applying for a Special Flight Operations Certificate (SFOC)\n\nWithout a declaration, pilots cannot use that drone for Advanced or L1C operations.'
  },
  {
    id: 'q57',
    category: 'declaration_fundamentals',
    question: 'What is the fee and timeline for a standard Declaration?',
    answer: '• Fee: FREE\n• Service Standard: 5 working days to be listed'
  },
  {
    id: 'q58',
    category: 'declaration_fundamentals',
    question: 'What is the fee and timeline for a Pre-Validated Declaration (PVD)?',
    answer: '• Fee: $1,200\n• Service Standard: 60 working days for processing'
  },
  {
    id: 'q59',
    category: 'declaration_fundamentals',
    question: 'When is a Pre-Validated Declaration (PVD) required?',
    answer: '• Medium RPAS (25-150 kg) VLOS near people: Less than 152.5m (500ft) but not less than 30m (100ft)\n• Medium RPAS (25-150 kg) VLOS over people: Less than 30m (100ft)\n• Small RPAS (250g-25kg) BVLOS: In uncontrolled airspace over sparsely populated area or less than 1 km from populated area'
  },
  {
    id: 'q60',
    category: 'declaration_fundamentals',
    question: 'What is the time limit between Letter of Acceptance and making a declaration?',
    answer: '2 years - If more than 2 years pass, a new Letter of Acceptance is required.'
  },

  // STANDARD 922 COMPLIANCE (Q61-Q62)
  {
    id: 'q61',
    category: 'standard_922',
    question: 'What sections of Standard 922 can Declarants declare compliance with?',
    answer: '• 922.04: Operations in Controlled Airspace\n• 922.05: Operations Near People\n• 922.06: Operations Over People\n• 922.07: Safety and Reliability\n• 922.08: Containment\n• 922.09: Command and Control Link Reliability and Lost Link Behaviour\n• 922.10: Detect, Alert and Avoid (DAA) Systems\n• 922.11: Control Station Design\n• 922.12: Demonstrated Environmental Envelope'
  },
  {
    id: 'q62',
    category: 'standard_922',
    question: 'What are configurable elements that can be declared?',
    answer: 'Additional equipment that can help non-compliant drones meet safety requirements:\n• A deployable parachute\n• A more robust C2 (Command and Control) link\n• A Detect and Avoid (DAA) system'
  },

  // POSITION AND ALTITUDE ACCURACY (Q63-Q65)
  {
    id: 'q63',
    category: 'position_accuracy',
    question: 'What is the minimum position accuracy required for controlled airspace operations?',
    answer: '+/- 10 meters - Modern GNSS technologies can achieve this nearly 100% of the time.'
  },
  {
    id: 'q64',
    category: 'position_accuracy',
    question: 'What is the minimum altitude accuracy required for controlled airspace operations?',
    answer: '+/- 16 meters based on WGS-84 geodetic datum.'
  },
  {
    id: 'q65',
    category: 'position_accuracy',
    question: 'What error sources affect GNSS position accuracy?',
    answer: '• Terrain Errors: Signal masking by buildings/mountains, multipath reflections\n• Atmospheric Errors: Ionospheric (40-60m day, 6-12m night), Tropospheric (up to 6m from moisture)\n• Satellite Errors: Gravitational effects, solar radiation EMI\n• Geometric Dilution of Precision (DOP): Occurs when satellites are too closely located'
  },

  // OPERATIONS NEAR/OVER PEOPLE (Q66-Q71)
  {
    id: 'q66',
    category: 'near_over_people',
    question: 'What does 922.05 "Operations Near People" allow?',
    answer: 'Operations at 30m (100ft) but not less than 5m (15ft) from non-participating persons.'
  },
  {
    id: 'q67',
    category: 'near_over_people',
    question: 'What is the safety assurance requirement for operations near people (922.05)?',
    answer: 'Probability of any single failure resulting in severe injury (AIS 4-6) must be REMOTE. Must protect persons within 30m of operating RPA.'
  },
  {
    id: 'q68',
    category: 'near_over_people',
    question: 'What does 922.06 "Operations Over People" allow?',
    answer: 'Operations at less than 5m (16.4ft) from persons.'
  },
  {
    id: 'q69',
    category: 'near_over_people',
    question: 'What is the safety assurance requirement for operations over people (922.06)?',
    answer: 'MORE STRINGENT than near people:\n• Single failures: Design must PRECLUDE any single failure causing severe injury\n• Failure combinations: Any combination causing severe injury must be REMOTE'
  },
  {
    id: 'q70',
    category: 'near_over_people',
    question: 'What are examples of single failures that could cause injury?',
    answer: '1. Flight control failure leading to stall\n2. Antenna failure leading to flyaway\n3. Motor winding failure leading to engine failure\n4. Electrical short leading to fire'
  },
  {
    id: 'q71',
    category: 'near_over_people',
    question: 'What safety features can mitigate injury risk?',
    answer: '1. Stall warning\n2. Parachute\n3. Frangible design\n4. Soft materials\n5. Rotor shrouds\n6. Flight envelope protection system\n7. Battery/fuel gauge with low warning\n8. Auto-land on low battery/fuel\n9. Return to home function\n10. Fast-acting rotor/propeller braking'
  },

  // SAFETY AND RELIABILITY (Q72-Q75)
  {
    id: 'q72',
    category: 'safety_reliability',
    question: 'When does 922.07 Safety and Reliability apply?',
    answer: '• VLOS operations with medium RPAS (>25kg) near/over people\n• BVLOS operations over sparsely populated areas (5-25 people/km²)'
  },
  {
    id: 'q73',
    category: 'safety_reliability',
    question: 'What are the kinetic energy categories for reliability targets?',
    answer: '• Low: <700 J\n• Medium: <34 kJ\n• High: <1084 kJ'
  },
  {
    id: 'q74',
    category: 'safety_reliability',
    question: 'What are the criticality classifications and their definitions?',
    answer: '• Catastrophic: Could result in one or more fatalities\n• Hazardous: Loss of RPA with severe injuries expected but not fatalities\n• Major: Significant reduction in safety margins, no severe injuries\n• Minor: Slight reduction in safety margins, crew actions within capabilities\n• No Safety Effect: No effect on safety or operational capability'
  },
  {
    id: 'q75',
    category: 'safety_reliability',
    question: 'What is the reliability objective for a Catastrophic failure at <34 kJ?',
    answer: '10^-5 (Extremely Improbable - 1 in 100,000)'
  },

  // CONTAINMENT (Q76-Q79)
  {
    id: 'q76',
    category: 'containment',
    question: 'When does the Containment requirement (922.08) apply?',
    answer: '• All operations where risk mitigation relies on distance from people\n• VLOS with mRPAS >500ft from people\n• BVLOS Isolated Operations (>1km from populated areas)'
  },
  {
    id: 'q77',
    category: 'containment',
    question: 'What is Low Robustness Containment?',
    answer: 'No single failure can result in flyaway. Applied to:\n• Basic VLOS\n• Isolated BVLOS\n• VLOS in controlled airspace (25-150kg)'
  },
  {
    id: 'q78',
    category: 'containment',
    question: 'What is High Robustness Containment?',
    answer: '• No single failure can cause flyaway\n• Any failure combination leading to flyaway must be REMOTE\n• Requires design assurance on hardware/software (DO-178/254 or ASTM F3201-16)'
  },
  {
    id: 'q79',
    category: 'containment',
    question: 'What are compliance approaches for containment?',
    answer: '• Limit fuel/electrical energy so endurance prevents leaving operational volume\n• Independent flight termination systems\n• Redesign autopilot with independent redundancy'
  },

  // C2 LINK AND LOST LINK (Q80-Q84)
  {
    id: 'q80',
    category: 'c2_link',
    question: 'When is C2 link reliability required?',
    answer: 'Required for all BVLOS operations - NOT required for VLOS.'
  },
  {
    id: 'q81',
    category: 'c2_link',
    question: 'What two major risks does C2 link reliability address?',
    answer: '1. Loss of C2 Link = Loss of Pilot Situational Awareness\n2. Loss of RPA control (flyaway, crash)'
  },
  {
    id: 'q82',
    category: 'c2_link',
    question: 'What are the C2 Link characterization parameters?',
    answer: '• Continuity\n• Availability\n• Integrity\n• Transaction Expiration Time\n• Geographic Coverage'
  },
  {
    id: 'q83',
    category: 'c2_link',
    question: 'What are the Lost Link Behaviour requirements?',
    answer: '• Behaviour must be consistent and predictable\n• Operator must know exactly what RPA will do\n• Options: Return-to-home, land-at-designated-location, increase altitude to regain link'
  },
  {
    id: 'q84',
    category: 'c2_link',
    question: 'What are common C2 radio frequencies and their characteristics?',
    answer: '• 2.4 GHz: Unlicensed, crowded (Wi-Fi, Bluetooth, microwaves)\n• 5.8 GHz: Unlicensed, more bandwidth, less interference\n• 5040-5050 MHz (C-Band): Licensed, high reliability (TSO-C213)\n• L-Band/Satellite/Cellular: Licensed frequencies'
  },

  // DETECT, ALERT AND AVOID (Q85-Q87)
  {
    id: 'q85',
    category: 'daa',
    question: 'When are DAA systems required?',
    answer: 'Required for all BVLOS operations. Exception: Visual Observer DAA (Standard 923).'
  },
  {
    id: 'q86',
    category: 'daa',
    question: 'What technologies can be used for DAA?',
    answer: '• Radar\n• ADS-B\n• Electro-Optical/Infra-Red (EO/IR) sensors\n• Combinations of technologies'
  },
  {
    id: 'q87',
    category: 'daa',
    question: 'What are the three Means of Compliance (MoC) for DAA?',
    answer: '• MoC 1: Analysis with Flight Test Validation (most permissive)\n• MoC 2: Large Dataset Sensor Validation (ground-based systems)\n• MoC 3: Operationally Specific Testing (fixed operational areas)'
  },

  // CONTROL STATION DESIGN (Q88-Q91)
  {
    id: 'q88',
    category: 'control_station',
    question: 'When is Control Station Design (922.11) required?',
    answer: 'Required for all BVLOS operations.'
  },
  {
    id: 'q89',
    category: 'control_station',
    question: 'What primary risks does Control Station Design mitigate?',
    answer: '• Human error (simple errors, interface confusion)\n• Misunderstanding automated system behavior'
  },
  {
    id: 'q90',
    category: 'control_station',
    question: 'What is the alert prioritization hierarchy?',
    answer: '1. Warning Alert: Immediate awareness AND immediate response required\n2. Caution Alert: Immediate awareness, subsequent response required\n3. Advisory Alert: Awareness required, may require subsequent response'
  },
  {
    id: 'q91',
    category: 'control_station',
    question: 'What Cooper-Harper ratings are acceptable for piloting tasks?',
    answer: 'All piloting tasks must fall within 1 to 6 on Cooper-Harper scale. Tasks rated 4-6 require operational limitations/guidance in manual.'
  },

  // DECLARANT OBLIGATIONS (Q92-Q95)
  {
    id: 'q92',
    category: 'declarant_obligations',
    question: 'What are the key Declarant obligations?',
    answer: '1. Notify Minister if RPAS no longer meets declared CAR 922 standards\n2. Provide documentation to operators (maintenance programs, mandatory actions, operating manuals)\n3. Retain all compliance documentation for Minister review on request\n4. Report to Transport Canada any discovered deficiencies'
  },
  {
    id: 'q93',
    category: 'declarant_obligations',
    question: 'What must the operating manual contain?',
    answer: 'All information needed to:\n• Ensure safe operation of the RPAS\n• Understand operating limitations (speed, altitude)\n• Understand environmental limitations (wind, precipitation)\n• Understand operator behaviors that may affect safety'
  },
  {
    id: 'q94',
    category: 'declarant_obligations',
    question: 'What makes a Declaration invalid?',
    answer: 'Three conditions:\n1. The model fails to meet specified technical requirements\n2. The declarant notifies the Minister of invalidity\n3. Annual reporting requirements are not met (for PVD)'
  },
  {
    id: 'q95',
    category: 'declarant_obligations',
    question: 'What are the penalties for a false declaration?',
    answer: '• Individual: $3,000 per registered system\n• Corporation: $15,000 per registered system'
  },

  // PVD REQUIREMENTS (Q96-Q101)
  {
    id: 'q96',
    category: 'pvd_requirements',
    question: 'What documents are required for a PVD application?',
    answer: '1. Applicant Name and Contact Information\n2. Concept of Operations (CONOPS) - Technical description, intended operations, limitations\n3. Declaration Plan - Standards to comply with, proposed means of compliance\n4. Referenced Standards - Copies of standards used\n5. Description of Technical Capability - Expertise, experience, competencies\n6. Plan for Manufacturing - Processes, quality control, configuration management\n7. Plan for Service Support - If service-based (DAA, C2 as a service)\n8. Plan for Product Support - Contact with operators, service standards, mandatory action distribution'
  },
  {
    id: 'q97',
    category: 'pvd_requirements',
    question: 'What must be in the Concept of Operations (CONOPS)?',
    answer: '• Technical description of RPAS\n• List of operations RPAS is intended to perform\n• List of operational rules or limitations affecting operational risk'
  },
  {
    id: 'q98',
    category: 'pvd_requirements',
    question: 'Who must submit annual reports?',
    answer: 'Any declaring entity with an active Pre-Validated Declaration (PVD).'
  },
  {
    id: 'q99',
    category: 'pvd_requirements',
    question: 'When are annual reports due?',
    answer: '• Anniversary of the day the declaration was submitted\n• Can be submitted 30 calendar days before anniversary\n• For leap year declarations (Feb 29), due Feb 28 in following years'
  },
  {
    id: 'q100',
    category: 'pvd_requirements',
    question: 'What must be included in annual reports?',
    answer: '1. What system does this PVD apply to?\n2. How many aircraft/systems are currently operating in Canada?\n3. Approximately how many flight hours accumulated in past year?\n4. How many Reportable Service Difficulties reported this calendar year?\n5. Did any result in mandatory actions? (describe difficulty and resolution)'
  },
  {
    id: 'q101',
    category: 'pvd_requirements',
    question: 'What happens if an annual report is missed?',
    answer: '• PVD becomes a regular Declaration\n• May result in loss of operational privileges\n• PVD reinstated upon receipt of late report\n• Anniversary date remains unchanged'
  },

  // PART 3: SORA FUNDAMENTALS (Q102-Q108)
  {
    id: 'q102',
    category: 'sora_fundamentals',
    question: 'What is SORA?',
    answer: 'Specific Operations Risk Assessment - A risk assessment methodology developed by JARUS to establish a sufficient level of confidence that a specific UAS operation can be conducted safely within the "Specific" category of UAS operations.'
  },
  {
    id: 'q103',
    category: 'sora_fundamentals',
    question: 'What is JARUS?',
    answer: 'Joint Authorities for Rulemaking on Unmanned Systems - An international group of aviation authorities developing harmonized UAS regulations.'
  },
  {
    id: 'q104',
    category: 'sora_fundamentals',
    question: 'What is the purpose of SORA?',
    answer: '1. Provides a risk-proportionate method to determine required evidence and assurances\n2. Provides structure and guidance to both competent authorities and applicants\n3. Enables proportionate allocation of resources based on operation risk\n4. Uses a holistic safety risk management process'
  },
  {
    id: 'q105',
    category: 'sora_fundamentals',
    question: 'What is the Target Level of Safety (TLOS) for ground risk?',
    answer: 'Less than 1 fatality per million flight hours (1E-6 fatalities/hour)'
  },
  {
    id: 'q106',
    category: 'sora_fundamentals',
    question: 'What is the TLOS for air risk in uncontrolled airspace?',
    answer: 'Less than 1 mid-air collision per 10 million flight hours (1E-7 MAC/hour)'
  },
  {
    id: 'q107',
    category: 'sora_fundamentals',
    question: 'What is the TLOS for air risk in controlled airspace?',
    answer: 'Less than 1 mid-air collision per billion flight hours (1E-9 MAC/hour)'
  },
  {
    id: 'q108',
    category: 'sora_fundamentals',
    question: 'What does SORA NOT apply to?',
    answer: '• Carriage of people\n• Dangerous goods (weapons, munitions, explosives)\n• Privacy, environmental, financial aspects\n• Operations in "open" or "certified" categories\n• Final GRC > 7 (requires certified category)'
  },

  // SORA STEPS (Q109-Q110)
  {
    id: 'q109',
    category: 'sora_fundamentals',
    question: 'What are the two phases of SORA?',
    answer: 'Phase 1 - Requirements Derivation (Steps 1-9):\n• Derives all relevant safety requirements\n• Results in document suite describing proposed operations\n\nPhase 2 - Compliance with Requirements (Step 10):\n• Compiles Comprehensive Safety Portfolio (CSP)\n• Demonstrates compliance with all derived requirements'
  },
  {
    id: 'q110',
    category: 'sora_fundamentals',
    question: 'What are all 10 SORA Steps?',
    answer: '1. Documentation of Proposed Operation(s)\n2. Determination of Intrinsic GRC (iGRC)\n3. Final GRC Determination (Optional mitigations)\n4. Determination of Initial ARC\n5. Application of Strategic Mitigations (Optional)\n6. TMPR and Robustness Levels\n7. SAIL Determination\n8. Containment Requirements\n9. Identification of OSOs\n10. Comprehensive Safety Portfolio'
  },

  // GRC (Q111-Q119)
  {
    id: 'q111',
    category: 'grc',
    question: 'What three factors determine the intrinsic GRC (iGRC)?',
    answer: '1. Maximum characteristic dimension of the UA\n2. Maximum speed of the UA\n3. Population density in the operational volume and ground risk buffer'
  },
  {
    id: 'q112',
    category: 'grc',
    question: 'What is the characteristic dimension (CD)?',
    answer: '• Fixed-wing: Wing-span or fuselage length (whichever is larger)\n• Multirotor: Diagonal distance from rotor tip to rotor tip'
  },
  {
    id: 'q113',
    category: 'grc',
    question: 'What are the UA size categories and their max speeds in the iGRC table?',
    answer: '• 1 m: 25 m/s\n• 3 m: 35 m/s\n• 8 m: 75 m/s\n• 20 m: 120 m/s\n• 40 m: 200 m/s'
  },
  {
    id: 'q114',
    category: 'grc',
    question: 'What are the population density categories in SORA?',
    answer: '• Controlled: Controlled ground/Extremely remote\n• < 5: Remote\n• < 50: Lightly populated\n• < 500: Sparsely populated\n• < 5,000: Suburban/Low density metro\n• < 50,000: High density metropolitan\n• > 50,000: Assemblies of people'
  },
  {
    id: 'q115',
    category: 'grc',
    question: 'What qualifies as a "Controlled Ground Area"?',
    answer: 'Areas where unauthorized people are not allowed; hard to reach areas. Examples: fenced compounds, restricted industrial sites.'
  },
  {
    id: 'q116',
    category: 'grc',
    question: 'What is "Remote" population density described as?',
    answer: 'Forests, deserts, large farms; approximately 1 small building per km². Less than 5 people/km².'
  },
  {
    id: 'q117',
    category: 'grc',
    question: 'What does "Sparsely Populated" mean in SORA terms?',
    answer: 'Homes/small businesses with large lots (~1 acre). < 500 people/km².'
  },
  {
    id: 'q118',
    category: 'grc',
    question: 'What iGRC do small UAs (≤250g, ≤25 m/s) receive regardless of population?',
    answer: 'iGRC of 1 - These are considered very low risk due to their small size and low energy.'
  },
  {
    id: 'q119',
    category: 'grc',
    question: 'What is the maximum Final GRC for operations within SORA scope?',
    answer: 'GRC 7 - Final GRC > 7 is out of scope and requires certified category.'
  },

  // GRC MITIGATIONS (Q120-Q125)
  {
    id: 'q120',
    category: 'grc_mitigations',
    question: 'What are the four ground risk mitigations?',
    answer: '• M1(A): Strategic: Sheltering\n• M1(B): Strategic: Operational restrictions\n• M1(C): Tactical: Ground observation\n• M2: Effects of UA impact dynamics reduced'
  },
  {
    id: 'q121',
    category: 'grc_mitigations',
    question: 'How much does M1(A) Sheltering reduce GRC?',
    answer: '• Low robustness: -1 GRC\n• Medium robustness: -2 GRC\n• High robustness: N/A (not defined)'
  },
  {
    id: 'q122',
    category: 'grc_mitigations',
    question: 'How much does M1(B) Operational Restrictions reduce GRC?',
    answer: '• Medium robustness: -1 GRC\n• High robustness: -2 GRC\n• Low robustness: N/A'
  },
  {
    id: 'q123',
    category: 'grc_mitigations',
    question: 'How much does M1(C) Ground Observation reduce GRC?',
    answer: '• Low robustness: -1 GRC only\n• No medium or high levels defined'
  },
  {
    id: 'q124',
    category: 'grc_mitigations',
    question: 'How much does M2 Impact Dynamics Reduction reduce GRC?',
    answer: '• Medium robustness: -1 GRC\n• High robustness: -2 GRC\n• Examples: parachutes, frangible designs'
  },
  {
    id: 'q125',
    category: 'grc_mitigations',
    question: 'What is the rule for applying ground risk mitigations?',
    answer: 'Mitigations must be applied in numerical sequence (M1A before M1B before M1C before M2). Final GRC cannot go below lowest value in applicable column.'
  },

  // ARC (Q126-Q132)
  {
    id: 'q126',
    category: 'arc',
    question: 'What is ARC?',
    answer: 'Air Risk Class - A qualitative classification of the rate at which a UAS would encounter manned aircraft in a given airspace.'
  },
  {
    id: 'q127',
    category: 'arc',
    question: 'What are the four ARC categories?',
    answer: '• ARC-a: Atypical airspace - Extremely low (no tactical mitigation needed)\n• ARC-b: Low encounter rate - Low but not negligible\n• ARC-c: Moderate encounter rate - Moderate likelihood\n• ARC-d: High encounter rate - High likelihood; integrated airspace'
  },
  {
    id: 'q128',
    category: 'arc',
    question: 'What type of airspace results in ARC-a?',
    answer: 'Atypical airspace - segregated, reserved, or restricted airspace where manned aircraft encounters are extremely unlikely.'
  },
  {
    id: 'q129',
    category: 'arc',
    question: 'What type of operations result in ARC-d?',
    answer: '• Class B, C, or D controlled airspace\n• Mode-C Veil or TMZ at any altitude\n• Airport/heliport environment in controlled airspace'
  },
  {
    id: 'q130',
    category: 'arc',
    question: 'How much can VLOS reduce ARC?',
    answer: 'Initial ARC can be reduced by one class (e.g., ARC-c to ARC-b). Cannot reduce to ARC-a.'
  },
  {
    id: 'q131',
    category: 'arc',
    question: 'What operations below 500 ft AGL in uncontrolled rural airspace receive?',
    answer: 'ARC-b - Low but not negligible encounter rate.'
  },
  {
    id: 'q132',
    category: 'arc',
    question: 'What operations below 500 ft AGL in uncontrolled urban airspace receive?',
    answer: 'ARC-c - Moderate encounter rate.'
  },

  // SAIL (Q133-Q139)
  {
    id: 'q133',
    category: 'sail',
    question: 'What is SAIL?',
    answer: 'Specific Assurance and Integrity Level - Represents the level of confidence that the UAS operation will stay under control.'
  },
  {
    id: 'q134',
    category: 'sail',
    question: 'What are the six SAIL levels?',
    answer: '• SAIL I - Lowest requirements (lowest risk)\n• SAIL II\n• SAIL III\n• SAIL IV\n• SAIL V\n• SAIL VI - Highest requirements (highest risk)'
  },
  {
    id: 'q135',
    category: 'sail',
    question: 'How is SAIL determined?',
    answer: 'By combining Final GRC and Residual ARC using the SAIL matrix.'
  },
  {
    id: 'q136',
    category: 'sail',
    question: 'What SAIL results from GRC ≤2 and ARC-a?',
    answer: 'SAIL I'
  },
  {
    id: 'q137',
    category: 'sail',
    question: 'What SAIL results from GRC 7 and any ARC?',
    answer: 'SAIL VI'
  },
  {
    id: 'q138',
    category: 'sail',
    question: 'What SAIL results from any GRC with ARC-d?',
    answer: 'SAIL VI (except if elevated to Certified Category)'
  },
  {
    id: 'q139',
    category: 'sail',
    question: 'What does SAIL correspond to?',
    answer: '1. Level of OSO robustness required\n2. Description of compliance activities\n3. Evidence that objectives have been satisfied'
  },

  // OSOs (Q140-Q144)
  {
    id: 'q140',
    category: 'oso',
    question: 'How many OSOs are there in SORA?',
    answer: '17 OSOs (numbered 1-24 with gaps)'
  },
  {
    id: 'q141',
    category: 'oso',
    question: 'What are the key OSOs and their numbers?',
    answer: '• #01: Operator is competent and/or proven\n• #02: UAS manufactured by competent entity\n• #03: UAS maintained by competent entity\n• #04: Essential components designed to ADS\n• #05: UAS designed for system safety and reliability\n• #06: C3 link characteristics appropriate\n• #07: Conformity check of UAS configuration\n• #08: Operational procedures defined and validated\n• #09: Remote crew trained and current\n• #13: External services adequate\n• #16: Multi-crew coordination\n• #17: Remote crew fit to operate\n• #18: Automatic protection from human errors\n• #19: Safe recovery from human error\n• #20: HMI evaluation performed\n• #23: Environmental conditions defined\n• #24: UAS designed for adverse conditions'
  },
  {
    id: 'q142',
    category: 'oso',
    question: 'What are the OSO robustness levels?',
    answer: '• NR = Not Required (but encouraged at low integrity)\n• L = Low robustness\n• M = Medium robustness\n• H = High robustness'
  },
  {
    id: 'q143',
    category: 'oso',
    question: 'What OSO is always required even at SAIL I?',
    answer: 'OSO #08 - Operational procedures defined, validated, and adhered to (at Low robustness for SAIL I-II).'
  },
  {
    id: 'q144',
    category: 'oso',
    question: 'Which OSOs require High robustness at SAIL VI?',
    answer: 'Most OSOs require High robustness at SAIL VI, including:\nOSO #01, #02, #03, #04, #05, #06, #07, #08, #09, #13, #16, #17, #18, #23, #24'
  },

  // TMPR (Q145-Q147)
  {
    id: 'q145',
    category: 'sail',
    question: 'What is TMPR?',
    answer: 'Tactical Mitigation Performance Requirements - Requirements for tactical mitigations to address residual air risk after strategic mitigations.'
  },
  {
    id: 'q146',
    category: 'sail',
    question: 'What TMPR level is required for each residual ARC?',
    answer: '• ARC-d: High\n• ARC-c: Medium\n• ARC-b: Low\n• ARC-a: No requirement'
  },
  {
    id: 'q147',
    category: 'sail',
    question: 'What are the five TMPR functions?',
    answer: '1. Detect - Identify conflicting traffic\n2. Decide - Determine appropriate response\n3. Command - Issue control inputs\n4. Execute - Perform avoidance maneuver\n5. Feedback Loop - Verify effectiveness'
  },

  // CONTAINMENT IN SORA (Q148-Q151)
  {
    id: 'q148',
    category: 'containment',
    question: 'What is the purpose of containment in SORA Step 8?',
    answer: 'Ensure TLOS is met for ground and air risk in the adjacent area - the area beyond the operational volume where the UA may crash during a flyaway.'
  },
  {
    id: 'q149',
    category: 'containment',
    question: 'What are the three containment robustness levels?',
    answer: '1. Low - Basic requirements\n2. Medium - Intermediate requirements\n3. High - Stringent requirements'
  },
  {
    id: 'q150',
    category: 'containment',
    question: 'How is the adjacent area lateral outer limit calculated?',
    answer: 'Distance flown in 3 minutes at maximum UA speed, measured from operational volume:\n• Minimum: 5 km\n• Maximum: 35 km'
  },
  {
    id: 'q151',
    category: 'containment',
    question: 'What containment level do UAs <250g receive?',
    answer: 'Low containment with no operational limits for adjacent area.'
  },

  // SORA SEMANTIC MODEL (Q152-Q159)
  {
    id: 'q152',
    category: 'sora_fundamentals',
    question: 'What is "Operation in Control"?',
    answer: 'Remote crew can manage flight situation; no persons on ground or in manned aircraft in immediate danger.'
  },
  {
    id: 'q153',
    category: 'sora_fundamentals',
    question: 'What is "Normal Operation"?',
    answer: 'Uses standard operating procedures within expected parameters.'
  },
  {
    id: 'q154',
    category: 'sora_fundamentals',
    question: 'What is an "Abnormal Situation"?',
    answer: '• Cannot continue with standard procedures\n• Safety not in immediate danger\n• Requires contingency procedures\n• UA is still within operational volume'
  },
  {
    id: 'q155',
    category: 'sora_fundamentals',
    question: 'What is "Loss of Control"?',
    answer: '• Outcome relies on providence\n• Cannot be handled by contingency procedure\n• UA has exited operational volume\n• Requires emergency procedures'
  },
  {
    id: 'q156',
    category: 'sora_fundamentals',
    question: 'What determines robustness level in SORA?',
    answer: 'Combination of Integrity (design quality) and Assurance (evidence quality).'
  },
  {
    id: 'q157',
    category: 'sora_fundamentals',
    question: 'What are the three Assurance levels?',
    answer: '• Low: Applicant declares compliance; evidence on request\n• Medium: Applicant provides supporting evidence (testing, operational data)\n• High: Verified by competent third party'
  },
  {
    id: 'q158',
    category: 'sora_fundamentals',
    question: 'What are the three Integrity levels?',
    answer: '• Low: Basic design principles\n• Medium: Documented design and verification\n• High: Rigorous design assurance processes'
  },
  {
    id: 'q159',
    category: 'sora_fundamentals',
    question: 'How do Integrity and Assurance combine to determine robustness?',
    answer: 'Robustness Matrix:\n• Low Integrity + Any Assurance = Low Robustness\n• Medium Integrity + Low Assurance = Low Robustness\n• Medium Integrity + Medium/High Assurance = Medium Robustness\n• High Integrity + Low Assurance = Low Robustness\n• High Integrity + Medium Assurance = Medium Robustness\n• High Integrity + High Assurance = High Robustness'
  },
  {
    id: 'q160',
    category: 'sora_fundamentals',
    question: 'What is the Comprehensive Safety Portfolio (CSP)?',
    answer: 'The complete documentation package compiled in Step 10 containing all evidence needed for operational authorization.'
  },
  {
    id: 'q161',
    category: 'sora_fundamentals',
    question: 'What must the CSP include?',
    answer: '1. Finalized operational description (Step 1)\n2. All safety claims and robustness levels (Steps 2-5)\n3. All derived requirements (Final GRC, Residual ARC, TMPR, OSOs, Containment)\n4. Compliance evidence (data, facts, information)\n5. Linkages and references between documents\n6. Compliance matrix mapping claims to evidence'
  },

  // SORA CALCULATIONS (Q162-Q184)
  {
    id: 'q162',
    category: 'sora_calculations',
    question: 'What is the formula for horizontal Contingency Volume (SCV)?',
    answer: 'SCV = SGNSS + SPos + SK + SR + SCM\n\nWhere:\n• SGNSS = GNSS accuracy (default 3m)\n• SPos = Position holding error (default 3m)\n• SK = Map error (default 1m)\n• SR = Reaction distance\n• SCM = Contingency maneuver distance'
  },
  {
    id: 'q163',
    category: 'sora_calculations',
    question: 'What is the formula for Reaction Distance (SR)?',
    answer: 'SR = V₀ × tR\n\nWhere:\n• V₀ = Maximum operational speed (m/s)\n• tR = Reaction time (default 1 second)'
  },
  {
    id: 'q164',
    category: 'sora_calculations',
    question: 'What is the stopping distance formula for multirotors (SCM)?',
    answer: 'SCM = (1/2) × V₀² / (g × tan(θ))\n\nWhere:\n• V₀ = Speed (m/s)\n• g = 9.81 m/s²\n• θ = Bank angle (max 45°)\n\nRequirements: thrust ≥ 2mg'
  },
  {
    id: 'q165',
    category: 'sora_calculations',
    question: 'What is the 180° turn distance formula for fixed-wing (SCM)?',
    answer: 'SCM = V₀² / (g × tan(Φ))\n\nWhere Φmax = 30° (typical)'
  },
  {
    id: 'q166',
    category: 'sora_calculations',
    question: 'Calculate SCV for a multirotor at 10 m/s with θ=45°.',
    answer: 'SGNSS = 3m\nSPos = 3m\nSK = 1m\nSR = 10 × 1 = 10m\nSCM = (1/2 × 100)/(9.81 × 1) = 5.1m\n\nSCV = 3 + 3 + 1 + 10 + 5.1 = 22.1m'
  },
  {
    id: 'q167',
    category: 'sora_calculations',
    question: 'Calculate SCV for a fixed-wing at 30 m/s with Φ=30°.',
    answer: 'SGNSS = 3m\nSPos = 3m\nSK = 1m\nSR = 30 × 1 = 30m\nSCM = 900/(9.81 × 0.577) = 158.9m\n\nSCV = 3 + 3 + 1 + 30 + 158.9 = 195.9m'
  },
  {
    id: 'q168',
    category: 'sora_calculations',
    question: 'What is the formula for vertical Contingency Volume (HCV)?',
    answer: 'HCV = HFG + HAM + HR + HCM\n\nWhere:\n• HFG = Height of flight geography\n• HAM = Altitude measurement error\n• HR = Vertical reaction distance\n• HCM = Contingency maneuver height'
  },
  {
    id: 'q169',
    category: 'sora_calculations',
    question: 'What are the altitude measurement errors?',
    answer: '• Barometric (HBaro): 1m\n• GNSS-based (HGNSS): 4m'
  },
  {
    id: 'q170',
    category: 'sora_calculations',
    question: 'What is the vertical reaction distance formula (45° pitch)?',
    answer: 'HR = V₀ × 0.7 × tR\n\nWhere:\n• V₀ = Maximum operational speed\n• tR = Reaction time (default 1 second)'
  },
  {
    id: 'q171',
    category: 'sora_calculations',
    question: 'What is the vertical contingency maneuver distance for multirotors?',
    answer: 'HCM = (1/2) × V₀² / g\n\nWhere:\n• V₀ = Speed (m/s)\n• g = 9.81 m/s²'
  },
  {
    id: 'q172',
    category: 'sora_calculations',
    question: 'What is the vertical contingency maneuver distance for fixed-wing?',
    answer: 'HCM = (V₀² / g) × 0.3\n\nWhere:\n• V₀ = Speed (m/s)\n• g = 9.81 m/s²'
  },
  {
    id: 'q173',
    category: 'sora_calculations',
    question: 'What is the simplified 1:1 rule for Ground Risk Buffer?',
    answer: 'SGRB = HCV + (1/2) × CD\n\nWhere CD = characteristic dimension'
  },
  {
    id: 'q174',
    category: 'sora_calculations',
    question: 'What is the ballistic method for multirotors GRB?',
    answer: 'SGRB = V₀ × √(2 × HCV / g) + (1/2) × CD'
  },
  {
    id: 'q175',
    category: 'sora_calculations',
    question: 'What is the parachute termination GRB formula?',
    answer: 'SGRB = V₀ × tP + VWind × (HCV / Vz)\n\nWhere:\n• tP = Time to open parachute\n• Vz = Descent rate with parachute\n• VWind = Wind speed'
  },
  {
    id: 'q176',
    category: 'sora_calculations',
    question: 'What is the fixed-wing power-off GRB formula?',
    answer: 'SGRB = E × HCV\n\nWhere E = glide ratio (CL/CD)'
  },
  {
    id: 'q177',
    category: 'sora_calculations',
    question: 'Compare GRB calculations for a multirotor (V₀=10 m/s, CD=1.5m, HCV=113.1m).',
    answer: 'Simplified method:\nSGRB = 113.1 + 0.75 = 113.85m\n\nBallistic method:\nSGRB = 10 × √(226.2/9.81) + 0.75 = 48.77m\n\nThe ballistic method gives a smaller (more accurate) buffer.'
  },
  {
    id: 'q178',
    category: 'sora_calculations',
    question: 'What two factors limit VLOS distance?',
    answer: '• ALOS (Attitude Line of Sight): Max distance to detect UA position and orientation\n• DLOS (Detection Line of Sight): Max distance to visually detect other aircraft\n\nVLOS limit = smaller of ALOS and DLOS'
  },
  {
    id: 'q179',
    category: 'sora_calculations',
    question: 'What is the ALOS formula for rotorcraft/multirotors?',
    answer: 'ALOSmax = 327 × CD + 20m'
  },
  {
    id: 'q180',
    category: 'sora_calculations',
    question: 'What is the ALOS formula for fixed-wing?',
    answer: 'ALOSmax = 490 × CD + 30m'
  },
  {
    id: 'q181',
    category: 'sora_calculations',
    question: 'What is the DLOS formula?',
    answer: 'DLOSmax = 0.3 × GV\n\nWhere GVmax = 5 km (maximum ground visibility)\nTherefore DLOSmax = 1,500m'
  },
  {
    id: 'q182',
    category: 'sora_calculations',
    question: 'What is the maximum VLOS distance for a 1m multirotor?',
    answer: 'ALOS = 327 × 1 + 20 = 347m\nDLOS = 1,500m\nVLOS limit = min(347, 1500) = 347m'
  },
  {
    id: 'q183',
    category: 'sora_calculations',
    question: 'What is the maximum VLOS distance for a 3m fixed-wing?',
    answer: 'ALOS = 490 × 3 + 30 = 1,500m\nDLOS = 1,500m\nVLOS limit = 1,500m'
  },
  {
    id: 'q184',
    category: 'sora_calculations',
    question: 'What is the minimum realistic Flight Geography size?',
    answer: 'SFG ≥ 3 × CD (width)\nHFG ≥ 3 × CD (height)\n\nWhere CD = characteristic dimension'
  },

  // INJURY ASSESSMENT AND TESTING (Q185-Q197)
  {
    id: 'q185',
    category: 'injury_testing',
    question: 'What is the Abbreviated Injury Scale (AIS)?',
    answer: 'Industry standard injury severity classification system used since 1969 (current version: AIS 2005 Update 2008).'
  },
  {
    id: 'q186',
    category: 'injury_testing',
    question: 'What does AIS-4 (Severe Injury) represent?',
    answer: 'Probability of death up to approximately 50%.'
  },
  {
    id: 'q187',
    category: 'injury_testing',
    question: 'What is the severe injury energy threshold?',
    answer: '12 J/cm² - Maximum allowable energy transfer to avoid serious injury.'
  },
  {
    id: 'q188',
    category: 'injury_testing',
    question: 'What anthropomorphic test device (ATD) is used for injury testing?',
    answer: 'Hybrid III 50th percentile male (49 CFR Part 572, Subpart E)'
  },
  {
    id: 'q189',
    category: 'injury_testing',
    question: 'What are the six required dynamic tests?',
    answer: '1. Vertical Drop Test: RPA dropped onto ATD head at Critical Speed\n2. Frontal Head Test: Impact forehead at Operational Speed\n3. Head Critical Impact Direction: At Critical Orientation and Critical Speed\n4. Head Side Impact: Side impact at Operating Speed\n5-6. Additional worst-case vector tests'
  },
  {
    id: 'q190',
    category: 'injury_testing',
    question: 'What is the HIC-15 threshold for head injury?',
    answer: 'HIC-15 ≤ 700\n• HIC 1000 = ~15% risk of AIS 4+ head injury\n• HIC 700 = ~5% risk of AIS 4+ head injury'
  },
  {
    id: 'q191',
    category: 'injury_testing',
    question: 'What is the peak head acceleration threshold?',
    answer: '237g maximum'
  },
  {
    id: 'q192',
    category: 'injury_testing',
    question: 'What is the neck tension (Fz) threshold?',
    answer: '4170 N (tension)'
  },
  {
    id: 'q193',
    category: 'injury_testing',
    question: 'What is the chest acceleration threshold?',
    answer: '60g (cumulative >3ms)'
  },
  {
    id: 'q194',
    category: 'injury_testing',
    question: 'What is the sternum deflection threshold?',
    answer: '63 mm maximum'
  },
  {
    id: 'q195',
    category: 'injury_testing',
    question: 'What are the speed definitions for testing?',
    answer: '• Critical Speed: Maximum kinetic energy speed\n  - Fixed-wing: max cruise\n  - Rotary: terminal velocity\n• Operational Speed: Maximum normal operating speed'
  },
  {
    id: 'q196',
    category: 'injury_testing',
    question: 'What are the three required safety assessment processes?',
    answer: '1. Functional Hazard Analysis (FHA)\n2. Failure Mode Effect and Criticality Analysis (FMECA)\n3. Fault Tree Analysis (FTA)'
  },
  {
    id: 'q197',
    category: 'injury_testing',
    question: 'What is the primary standard for safety assessment?',
    answer: 'SAE ARP 4761 - Safety Assessment Process Guidelines'
  },

  // ANTI-COLLISION LIGHTS (Q198-Q203)
  {
    id: 'q198',
    category: 'operating_rules',
    question: 'What color must BVLOS anti-collision lights be?',
    answer: 'White'
  },
  {
    id: 'q199',
    category: 'operating_rules',
    question: 'What is the required flash rate for anti-collision lights?',
    answer: '40-100 flashes per minute'
  },
  {
    id: 'q200',
    category: 'operating_rules',
    question: 'What is the visibility angle requirement for anti-collision lights?',
    answer: 'Visible all directions within +/-75 degrees of horizontal'
  },
  {
    id: 'q201',
    category: 'operating_rules',
    question: 'What is the maximum obscuration allowed for anti-collision lights?',
    answer: '0.5 steradians'
  },
  {
    id: 'q202',
    category: 'operating_rules',
    question: 'What is the required visible distance for anti-collision lights?',
    answer: 'Up to 1 statute mile'
  },
  {
    id: 'q203',
    category: 'operating_rules',
    question: 'What must night position lights indicate?',
    answer: 'Must be visible to pilot and visual observers with clear orientation indication.'
  },

  // VISUAL OBSERVER (Q204-Q208)
  {
    id: 'q204',
    category: 'visual_observer',
    question: 'What communication must be maintained between pilot and visual observer?',
    answer: 'Reliable and timely communication during the operation.'
  },
  {
    id: 'q205',
    category: 'visual_observer',
    question: 'Can a visual observer monitor multiple aircraft?',
    answer: 'NO - cannot monitor multiple aircraft simultaneously (except under Division V or special certificates).'
  },
  {
    id: 'q206',
    category: 'visual_observer',
    question: 'Can visual observers perform duties while operating vehicles?',
    answer: 'NO - cannot perform duties while operating vehicles, vessels, or aircraft.'
  },
  {
    id: 'q207',
    category: 'visual_observer',
    question: 'What certificates must visual observers hold?',
    answer: 'Must hold one of:\n• Small RPAS basic certificate\n• Remotely piloted aircraft advanced certificate\n• Level 1 Complex Operations certificate'
  },
  {
    id: 'q208',
    category: 'visual_observer',
    question: 'What is the maximum distance a visual observer can be from the aircraft?',
    answer: 'Within 2 nautical miles of the aircraft.'
  },

  // PRE-FLIGHT AND EMERGENCY (Q209-Q211)
  {
    id: 'q209',
    category: 'preflight_emergency',
    question: 'What must be determined in a site survey?',
    answer: '• Airspace type and requirements\n• Altitudes and routes for approach/launch/recovery\n• Proximity of other aircraft operations\n• Distance from airports and aerodromes\n• Obstacles (wires, towers, buildings, turbines)\n• Weather and environmental conditions\n• Horizontal distance from uninvolved persons\n• Distance from populated areas (BVLOS)'
  },
  {
    id: 'q210',
    category: 'preflight_emergency',
    question: 'What emergency procedures must be established?',
    answer: '• Control station failure\n• Equipment failure\n• Aircraft failure\n• Loss of command and control link\n• Fly-away scenarios\n• Flight termination\n• Detection and avoidance of conflicting traffic'
  },
  {
    id: 'q211',
    category: 'preflight_emergency',
    question: 'What must pilots be familiar with before flight?',
    answer: '• Results of site survey\n• Declarations regarding aircraft systems\n• Crew qualifications'
  },

  // ENVIRONMENTAL (Q212-Q215)
  {
    id: 'q212',
    category: 'preflight_emergency',
    question: 'What wind factors must be evaluated?',
    answer: '• Maximum wind for safe operation\n• Maximum gust loading for structural integrity\n• Turbulence and urban canyon effects\n• Effects on flight time'
  },
  {
    id: 'q213',
    category: 'preflight_emergency',
    question: 'What temperature factors must be evaluated?',
    answer: '• Operational temperature range\n• Effects on control surfaces, motors, fuel systems, C2 link\n• Storage temperature limits'
  },
  {
    id: 'q214',
    category: 'preflight_emergency',
    question: 'What precipitation types must be evaluated?',
    answer: '1. Drizzle\n2. Rain\n3. Fog condensation\n4. Freezing drizzle\n5. Freezing rain\n6. Rain and snow mixed\n7. Snow\n8. Snow grains\n9. Ice pellets/Sleet\n10. Hail\n11. Snow pellets/graupel\n12. Ice crystals'
  },
  {
    id: 'q215',
    category: 'preflight_emergency',
    question: 'What are potential EMI sources to consider?',
    answer: '• Wi-Fi transmitters\n• Microwave radio relays\n• Cellphone towers\n• SCADA systems\n• Lightning\n• On-board devices (Bluetooth, etc.)'
  },

  // QUICK REFERENCE (Q216-Q227)
  {
    id: 'q216',
    category: 'quick_reference',
    question: 'Key VLOS distances from uninvolved persons?',
    answer: '• Small RPAS: 100 feet (30 m)\n• Medium RPAS: 500 feet (152.4 m)'
  },
  {
    id: 'q217',
    category: 'quick_reference',
    question: 'Key BVLOS (L1C) distances from populated areas?',
    answer: '• Medium RPAS: At least 1 km (MANDATORY - no exceptions under L1C)\n• Small RPAS: 1+ km (Category a) OR <1 km/sparsely populated (Category b)'
  },
  {
    id: 'q218',
    category: 'quick_reference',
    question: 'Key proximity restrictions?',
    answer: '• Airports: 3 nautical miles from center\n• Heliports: 1 nautical mile from center\n• Extended VLOS range: 2 nautical miles from pilot/observer\n• Sheltered ops - building: Less than 200 feet (61 m) horizontal'
  },
  {
    id: 'q219',
    category: 'quick_reference',
    question: 'Key altitude limits?',
    answer: '• Standard maximum: 400 feet (122 m) AGL\n• Sheltered operations: 100 feet (30 m) max\n• Near structures (within 200 ft horizontal): 100 feet above structure'
  },
  {
    id: 'q220',
    category: 'quick_reference',
    question: 'Key time periods to remember?',
    answer: '• 12 hours: Alcohol restriction before duty\n• 12 months: Flight review validity for certificate application\n• 24 hours: Wait period for exam retake\n• 24 months: Recency period\n• 2 years: Acceptance letter validity for declarations\n• 30 days: Contact change notification to Minister\n• 7 days: Aircraft status change notification\n• 5 working days: Declaration processing time\n• 60 working days: PVD processing time'
  },
  {
    id: 'q221',
    category: 'quick_reference',
    question: 'Key weight thresholds?',
    answer: '• 250g: Minimum for regulated RPAS\n• 25 kg (55 lbs): Small/Medium boundary\n• 150 kg (331 lbs): Maximum for Medium RPAS'
  },
  {
    id: 'q222',
    category: 'quick_reference',
    question: 'Key age requirements?',
    answer: '• 14: Basic Operations\n• 16: Advanced Operations\n• 18: Level 1 Complex Operations'
  },
  {
    id: 'q223',
    category: 'quick_reference',
    question: 'Key accuracy requirements?',
    answer: '• Position (controlled airspace): +/- 10 meters\n• Altitude (controlled airspace): +/- 16 meters'
  },
  {
    id: 'q224',
    category: 'quick_reference',
    question: 'Declaration fees?',
    answer: '• Standard Declaration: FREE (5 working days)\n• Pre-Validated Declaration: $1,200 (60 working days)'
  },
  {
    id: 'q225',
    category: 'quick_reference',
    question: 'Penalties for false declaration?',
    answer: '• Individual: $3,000 per registered system\n• Corporation: $15,000 per registered system'
  },
  {
    id: 'q226',
    category: 'quick_reference',
    question: 'Population density definitions (CAR vs SORA)?',
    answer: 'CAR Definitions:\n• Populated area: >5 people/km²\n• Sparsely populated: 5-25 people/km²\n\nSORA has more granular categories from Controlled ground through Assemblies of people (>50,000/km²)'
  },
  {
    id: 'q227',
    category: 'quick_reference',
    question: 'Transport Canada contact for declarations?',
    answer: '• Declarations Email: TC.RPASDeclaration-DeclarationSATP.TC@tc.gc.ca\n• General Info: TC.RPASInfo-InfoSATP.TC@tc.gc.ca'
  },

  // COMPARISON QUESTIONS (Q228-Q240)
  {
    id: 'q228',
    category: 'quick_reference',
    question: 'Compare Basic vs Advanced vs L1C requirements.',
    answer: 'Min Age: Basic=14, Advanced=16, L1C=18\nGround School: Basic=None, Advanced=None, L1C=20 hours\nExams: Basic exam, Advanced exam, Advanced + L1C exams\nFlight Review: Basic=None, Advanced=12 months, L1C=12 months\nRecency: All 24 months\nAirspace: Basic=Uncontrolled, Advanced=Controlled allowed, L1C=Uncontrolled only\nOperation: Basic=VLOS, Advanced=VLOS (advanced), L1C=BVLOS'
  },
  {
    id: 'q229',
    category: 'quick_reference',
    question: 'Compare Declaration vs PVD requirements.',
    answer: '• Fee: Declaration=Free, PVD=$1,200\n• Processing: Declaration=5 days, PVD=60 days\n• TC Review: Declaration=On request, PVD=Required upfront\n• Letter of Acceptance: Declaration=Not required, PVD=Required\n• Annual Report: Declaration=Not required, PVD=Required\n• Use Case: Declaration=Lower risk, PVD=Higher risk ops'
  },
  {
    id: 'q230',
    category: 'quick_reference',
    question: 'What declaration type is needed for sRPAS BVLOS over sparsely populated area?',
    answer: 'Pre-Validated Declaration (PVD) - Because small RPAS BVLOS less than 1km from populated area or over sparsely populated requires PVD.'
  },
  {
    id: 'q231',
    category: 'quick_reference',
    question: 'What declaration type is needed for sRPAS VLOS in controlled airspace?',
    answer: 'Standard Declaration (922.04 compliance)'
  },
  {
    id: 'q232',
    category: 'quick_reference',
    question: 'What declaration type is needed for mRPAS VLOS near people (<500ft)?',
    answer: 'Pre-Validated Declaration (PVD) - Medium RPAS near people requires 922.07 compliance.'
  },
  {
    id: 'q233',
    category: 'sora_calculations',
    question: 'A 2m multirotor operates at 15 m/s over suburban area (3,000 ppl/km²). What is the iGRC?',
    answer: 'Using the iGRC table:\n• Dimension: 1-3m category\n• Speed: <35 m/s\n• Population: <5,000 ppl/km² (suburban)\n\niGRC = 6'
  },
  {
    id: 'q234',
    category: 'sora_calculations',
    question: 'Can M1(A) Sheltering reduce GRC for outdoor assembly overflights?',
    answer: 'NO - M1(A) Sheltering is not applicable when overflying large open assemblies.'
  },
  {
    id: 'q235',
    category: 'sora_calculations',
    question: 'What is the Final GRC if iGRC=6 with M2 High robustness applied?',
    answer: 'Final GRC = 4 (iGRC 6 - 2 for M2 High = 4)'
  },
  {
    id: 'q236',
    category: 'sail',
    question: 'What SAIL results from Final GRC 4 and ARC-b?',
    answer: 'SAIL III'
  },
  {
    id: 'q237',
    category: 'oso',
    question: 'For SAIL III, what robustness is required for OSO #08 (Operational Procedures)?',
    answer: 'High robustness - OSO #08 requires High at SAIL III and above.'
  },
  {
    id: 'q238',
    category: 'sora_calculations',
    question: 'Calculate the adjacent area outer limit for a UA with max speed 30 m/s.',
    answer: 'Distance = Speed × 3 minutes\nDistance = 30 m/s × 180 s = 5,400 m = 5.4 km\n\nSince this is between 5km (min) and 35km (max), use 5.4 km.'
  },
  {
    id: 'q239',
    category: 'sora_calculations',
    question: 'What grid size should be used for population density mapping at 1,000 ft AGL operations?',
    answer: '>400 × 400 m (per SORA Table 4)'
  },
  {
    id: 'q240',
    category: 'sora_calculations',
    question: 'What is the maximum VLOS distance for a 2m rotorcraft?',
    answer: 'ALOS = 327 × 2 + 20 = 674m\nDLOS = 1,500m (with 5km visibility)\nVLOS limit = 674m'
  }
]

export default L1C_FLASHCARDS
