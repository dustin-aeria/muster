/**
 * Regulatory Compliance Quest Track
 *
 * Comprehensive training on Canadian RPAS regulations, SORA methodology,
 * operational risk assessments, and compliance documentation.
 *
 * @version 1.0.0
 */

const regulatoryTrack = {
  id: 'regulatory',
  slug: 'regulatory-compliance',
  title: 'Regulatory Compliance',
  description: 'Master Canadian RPAS regulations, SORA 2.5 methodology, and operational compliance requirements for professional drone operations.',
  category: 'regulatory',
  icon: 'FileCheck',
  color: 'purple',
  difficulty: 'intermediate',
  estimatedHours: 5,
  totalXp: 750,
  prerequisites: ['sms-foundation'],
  badge: {
    id: 'compliance-champion',
    name: 'Compliance Champion',
    description: 'Demonstrated mastery of Canadian RPAS regulations and compliance requirements',
    rarity: 'rare',
    xpBonus: 150,
    icon: 'Award'
  },
  quests: [
    // Quest 1: CARs Part IX Overview
    {
      id: 'cars-part-ix-overview',
      trackId: 'regulatory-compliance',
      title: 'CARs Part IX Overview',
      description: 'Understand the Canadian Aviation Regulations governing RPAS operations.',
      order: 1,
      xpReward: 100,
      estimatedMinutes: 45,
      lessons: [
        {
          id: 'regulatory-framework',
          questId: 'cars-part-ix-overview',
          title: 'Canadian Regulatory Framework',
          order: 1,
          xpReward: 20,
          estimatedMinutes: 10,
          content: {
            sections: [
              {
                type: 'text',
                content: `Canada's RPAS regulatory framework is established under the Canadian Aviation Regulations (CARs), specifically Part IX - Remotely Piloted Aircraft Systems. This regulation represents one of the most comprehensive drone regulatory frameworks globally.`
              },
              {
                type: 'heading',
                content: 'Regulatory Hierarchy'
              },
              {
                type: 'text',
                content: `The framework operates within a clear hierarchy:

**Aeronautics Act** - Federal legislation providing Transport Canada authority
**Canadian Aviation Regulations (CARs)** - Detailed operational requirements
**Standards** - Technical specifications referenced by CARs
**Advisory Circulars (ACs)** - Guidance material for compliance`
              },
              {
                type: 'heading',
                content: 'Key Regulatory Bodies'
              },
              {
                type: 'list',
                items: [
                  'Transport Canada Civil Aviation (TCCA) - Primary regulatory authority',
                  'NAV CANADA - Airspace and air traffic services',
                  'NAVCAN drone zones - Controlled airspace authorization'
                ]
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Part IX applies to all RPAS operations in Canadian airspace, whether for recreational or commercial purposes. Registration and pilot certification are mandatory.'
              }
            ],
            keyPoints: [
              'CARs Part IX governs all RPAS operations in Canada',
              'Transport Canada is the primary regulatory authority',
              'Regulations apply equally to recreational and commercial operations',
              'Advisory Circulars provide guidance but are not legally binding'
            ]
          }
        },
        {
          id: 'operation-categories',
          questId: 'cars-part-ix-overview',
          title: 'Operation Categories',
          order: 2,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Canadian regulations categorize RPAS operations based on risk level and operational complexity. Understanding these categories is essential for determining compliance requirements.`
              },
              {
                type: 'heading',
                content: 'Basic Operations (901.27-901.40)'
              },
              {
                type: 'text',
                content: `Basic operations allow flight in uncontrolled airspace under specific conditions:

- Maximum altitude: 400 feet AGL
- Minimum distance from bystanders: 30m horizontal
- Visual line-of-sight required
- Daylight or civil twilight only
- No flight over people
- Uncontrolled airspace only`
              },
              {
                type: 'heading',
                content: 'Advanced Operations (901.41-901.66)'
              },
              {
                type: 'text',
                content: `Advanced operations permit higher-risk activities with additional requirements:

- Flight in controlled airspace (with authorization)
- Flight within 30m of bystanders
- Flight over bystanders (with compliant RPAS)
- Flight at airports/heliports
- Requires Advanced pilot certificate
- RPAS must meet safety assurance requirements`
              },
              {
                type: 'heading',
                content: 'Special Flight Operations Certificate (SFOC)'
              },
              {
                type: 'text',
                content: `Operations outside Basic/Advanced categories require an SFOC:

- BVLOS operations
- Night operations (beyond civil twilight)
- Operations exceeding 400 feet AGL
- Swarm operations
- Operations in restricted/prohibited airspace`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Operations that cannot be conducted under Basic or Advanced rules require an SFOC application 30+ working days before the planned operation.'
              }
            ],
            keyPoints: [
              'Basic operations are limited to uncontrolled airspace',
              'Advanced operations require additional pilot certification',
              'SFOC is required for BVLOS, night, and other non-standard operations',
              'Each category has specific distance and altitude restrictions'
            ]
          }
        },
        {
          id: 'pilot-certification-requirements',
          questId: 'cars-part-ix-overview',
          title: 'Pilot Certification Requirements',
          order: 3,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `All RPAS pilots in Canada must hold appropriate certification. The type of certificate required depends on the intended operation category.`
              },
              {
                type: 'heading',
                content: 'Pilot Certificate - Basic Operations'
              },
              {
                type: 'text',
                content: `Requirements for Basic Operations Certificate:

1. Minimum age: 14 years
2. Pass Transport Canada Small Basic Exam
3. 35 multiple choice questions
4. 65% passing grade
5. Valid for 24 months (recurrency required)`
              },
              {
                type: 'heading',
                content: 'Pilot Certificate - Advanced Operations'
              },
              {
                type: 'text',
                content: `Requirements for Advanced Operations Certificate:

1. Minimum age: 16 years
2. Pass Transport Canada Small Advanced Exam
3. 50 multiple choice questions
4. 80% passing grade
5. Complete flight review with Transport Canada-approved reviewer
6. Valid for 24 months (recurrency required)`
              },
              {
                type: 'heading',
                content: 'Flight Reviewer Requirements'
              },
              {
                type: 'text',
                content: `Advanced certificate flight reviews must assess:

- Pre-flight procedures
- In-flight procedures and maneuvers
- Emergency procedures
- Post-flight procedures
- Ground station operations`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Pilots must carry their certificate (or access it electronically) during all flight operations. Certificate numbers must be recorded in flight logs.'
              }
            ],
            keyPoints: [
              'Basic certificate requires passing a 35-question exam',
              'Advanced certificate requires exam plus flight review',
              'Certificates must be renewed every 24 months',
              'Minimum age is 14 for Basic, 16 for Advanced'
            ]
          }
        },
        {
          id: 'operator-certification',
          questId: 'cars-part-ix-overview',
          title: 'Operator Certification & Registration',
          order: 4,
          xpReward: 20,
          estimatedMinutes: 10,
          content: {
            sections: [
              {
                type: 'text',
                content: `Beyond pilot certification, RPAS operators must register their aircraft and may require operator certificates depending on the nature of their operations.`
              },
              {
                type: 'heading',
                content: 'RPAS Registration'
              },
              {
                type: 'text',
                content: `All RPAS between 250g and 25kg must be registered:

- Registration through Transport Canada Drone Management Portal
- Unique registration number issued
- Registration mark must be displayed on RPAS
- Registration transfers with aircraft ownership
- No expiration (unless ownership changes)`
              },
              {
                type: 'heading',
                content: 'Operator Certificate Requirements'
              },
              {
                type: 'text',
                content: `Commercial operators conducting complex operations should consider:

**Compliant Operations:**
- Safety management practices
- Documented procedures
- Maintenance programs
- Training programs

**SFOC-based Operations:**
- Required for all SFOC operations
- Demonstrates organizational capability
- May be granted per-operation or for ongoing operations`
              },
              {
                type: 'heading',
                content: 'Marking Requirements'
              },
              {
                type: 'list',
                items: [
                  'Registration mark in contrasting color',
                  'Legible and permanently affixed',
                  'Owner contact information accessible',
                  'Additional marking for SFOC operations as specified'
                ]
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Operating an unregistered RPAS or without proper pilot certification can result in fines up to $5,000 for individuals and $25,000 for corporations.'
              }
            ],
            keyPoints: [
              'All RPAS 250g-25kg must be registered with Transport Canada',
              'Registration marks must be visible on the aircraft',
              'Commercial operators should implement safety management practices',
              'SFOC operations require demonstrated organizational capability'
            ]
          }
        }
      ],
      quiz: {
        id: 'cars-part-ix-quiz',
        questId: 'cars-part-ix-overview',
        passingScore: 80,
        questions: [
          {
            id: 'cpq-1',
            type: 'multiple-choice',
            question: 'What is the minimum passing score for the Advanced pilot certificate exam?',
            options: ['65%', '70%', '75%', '80%'],
            correctAnswer: 3,
            explanation: 'The Advanced Operations exam requires an 80% passing score, compared to 65% for Basic Operations.'
          },
          {
            id: 'cpq-2',
            type: 'multiple-choice',
            question: 'Which type of operation requires a Special Flight Operations Certificate (SFOC)?',
            options: [
              'Flying in uncontrolled airspace at 300 feet',
              'Flying 25 meters from bystanders with Advanced certificate',
              'Beyond Visual Line of Sight operations',
              'Flying a 1kg drone for photography'
            ],
            correctAnswer: 2,
            explanation: 'BVLOS operations cannot be conducted under Basic or Advanced rules and require an SFOC.'
          },
          {
            id: 'cpq-3',
            type: 'multiple-choice',
            question: 'What is the maximum weight for an RPAS that does NOT require registration?',
            options: ['100 grams', '250 grams', '500 grams', '1 kilogram'],
            correctAnswer: 1,
            explanation: 'RPAS under 250 grams are exempt from registration requirements.'
          },
          {
            id: 'cpq-4',
            type: 'multiple-choice',
            question: 'How long is a pilot certificate valid before recurrency is required?',
            options: ['12 months', '18 months', '24 months', '36 months'],
            correctAnswer: 2,
            explanation: 'Both Basic and Advanced pilot certificates are valid for 24 months.'
          },
          {
            id: 'cpq-5',
            type: 'multiple-choice',
            question: 'What is the minimum age requirement for an Advanced Operations pilot certificate?',
            options: ['14 years', '16 years', '18 years', '21 years'],
            correctAnswer: 1,
            explanation: 'Advanced Operations certificate requires a minimum age of 16, while Basic requires 14.'
          }
        ]
      }
    },

    // Quest 2: SORA 2.5 Framework
    {
      id: 'sora-framework',
      trackId: 'regulatory-compliance',
      title: 'SORA 2.5 Framework',
      description: 'Learn the Specific Operations Risk Assessment methodology for complex RPAS operations.',
      order: 2,
      xpReward: 150,
      estimatedMinutes: 60,
      scenarioId: 'sora-assessment-scenario',
      lessons: [
        {
          id: 'sora-methodology-overview',
          questId: 'sora-framework',
          title: 'SORA Methodology Overview',
          order: 1,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `The Specific Operations Risk Assessment (SORA) is a methodology developed by JARUS (Joint Authorities for Rulemaking on Unmanned Systems) to provide a systematic approach for assessing risk in UAS operations. Canada has adopted SORA 2.5 as a framework for evaluating complex operations.`
              },
              {
                type: 'heading',
                content: 'SORA Purpose'
              },
              {
                type: 'text',
                content: `SORA provides:

- A structured risk assessment methodology
- Common terminology across jurisdictions
- Proportionate requirements based on actual risk
- A pathway for innovative operations
- Regulatory predictability for operators`
              },
              {
                type: 'heading',
                content: 'SORA Process Overview'
              },
              {
                type: 'text',
                content: `The SORA methodology follows a 10-step process:

1. ConOps Description
2. Ground Risk Class (GRC) Determination
3. GRC Mitigation (if required)
4. Air Risk Class (ARC) Determination
5. ARC Mitigation (Strategic & Tactical)
6. SAIL Determination
7. Operational Safety Objectives (OSOs) Identification
8. Adjacent Area Considerations
9. Comprehensive Safety Portfolio
10. Submission for Authorization`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'SORA is designed to be proportionate - lower risk operations require less mitigation, while higher risk operations require more robust safety measures.'
              }
            ],
            keyPoints: [
              'SORA provides systematic risk assessment for UAS operations',
              'Developed by JARUS and adopted internationally',
              'Based on determining Ground Risk and Air Risk classes',
              'Results in specific operational safety objectives'
            ]
          }
        },
        {
          id: 'ground-risk-class',
          questId: 'sora-framework',
          title: 'Ground Risk Class (GRC)',
          order: 2,
          xpReward: 30,
          estimatedMinutes: 15,
          content: {
            sections: [
              {
                type: 'text',
                content: `Ground Risk Class (GRC) represents the intrinsic risk to people on the ground from a UAS operation, before any mitigations are applied. GRC is determined by considering what could happen if the aircraft were to crash.`
              },
              {
                type: 'heading',
                content: 'GRC Determination Factors'
              },
              {
                type: 'text',
                content: `Two primary factors determine intrinsic GRC:

**1. RPAS Characteristics**
- Maximum characteristic dimension
- Kinetic energy upon impact
- Specific features (parachutes, frangibility)

**2. Operational Environment**
- Population density in operating area
- Indoor vs outdoor
- Sheltered vs unsheltered populations`
              },
              {
                type: 'heading',
                content: 'GRC Scale'
              },
              {
                type: 'text',
                content: `GRC ranges from 1 to 10+:

| GRC | Typical Scenario |
|-----|------------------|
| 1 | Small UAS over controlled ground area |
| 2-3 | Small UAS over sparsely populated area |
| 4-5 | Operations over populated areas |
| 6-7 | Operations over gatherings |
| 8+ | High-risk urban/crowd operations |`
              },
              {
                type: 'heading',
                content: 'GRC Mitigations'
              },
              {
                type: 'list',
                items: [
                  'M1 - Strategic Mitigations for Ground Risk (ground buffer, restricted areas)',
                  'M2 - Effects of Ground Impact Reduced (parachute, frangibility)',
                  'M3 - Emergency Response Plan Robustness'
                ]
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Final (mitigated) GRC cannot be reduced below 1 and should not be reduced by more than 3 levels from intrinsic GRC through mitigations.'
              }
            ],
            keyPoints: [
              'GRC assesses risk to people on the ground',
              'Determined by aircraft characteristics and operational environment',
              'Scale ranges from 1 (lowest) to 10+ (highest)',
              'Can be reduced through specific mitigations (M1, M2, M3)'
            ]
          }
        },
        {
          id: 'air-risk-class',
          questId: 'sora-framework',
          title: 'Air Risk Class (ARC)',
          order: 3,
          xpReward: 30,
          estimatedMinutes: 15,
          content: {
            sections: [
              {
                type: 'text',
                content: `Air Risk Class (ARC) addresses the risk of collision with manned aircraft. It considers the airspace environment and the probability of encountering other aircraft during the operation.`
              },
              {
                type: 'heading',
                content: 'Initial ARC Assignment'
              },
              {
                type: 'text',
                content: `ARC is initially assigned based on airspace type:

**ARC-a (Lowest):** Atypical airspace
- Segregated airspace
- Operations below common altitudes
- Areas with procedural separation

**ARC-b:** Low air traffic density
- Low-level uncontrolled airspace
- Limited manned aircraft operations

**ARC-c:** Moderate air traffic
- Controlled airspace
- Known traffic patterns

**ARC-d (Highest):** High air traffic
- Airport environments
- Busy controlled airspace`
              },
              {
                type: 'heading',
                content: 'Air Risk Mitigations'
              },
              {
                type: 'text',
                content: `ARC can be reduced through:

**Strategic Mitigations:**
- Operational restrictions (time, altitude)
- Airspace structure (restricted areas, segregation)
- Common flight rules compliance

**Tactical Mitigations:**
- Detect and Avoid (DAA) systems
- Visual observers
- ATC coordination
- Electronic conspicuity`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'For VLOS operations in uncontrolled airspace with the pilot as "see and avoid" capability, ARC-b with basic tactical mitigations is typically appropriate.'
              }
            ],
            keyPoints: [
              'ARC assesses mid-air collision risk with manned aircraft',
              'Four levels: ARC-a (lowest) to ARC-d (highest)',
              'Based on airspace type and traffic density',
              'Mitigated through strategic and tactical measures'
            ]
          }
        },
        {
          id: 'sail-determination',
          questId: 'sora-framework',
          title: 'SAIL Determination',
          order: 4,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `The Specific Assurance and Integrity Level (SAIL) is determined by combining the final GRC and ARC. SAIL represents the overall risk level and dictates the rigor of evidence required to demonstrate safety.`
              },
              {
                type: 'heading',
                content: 'SAIL Matrix'
              },
              {
                type: 'text',
                content: `SAIL is determined using the GRC/ARC matrix:

|          | ARC-a | ARC-b | ARC-c | ARC-d |
|----------|-------|-------|-------|-------|
| GRC ≤2   | I     | II    | IV    | VI    |
| GRC 3-4  | II    | II    | IV    | VI    |
| GRC 5-6  | III   | III   | IV    | VI    |
| GRC 7    | IV    | IV    | IV    | VI    |
| GRC >7   | V     | V     | V     | VI    |`
              },
              {
                type: 'heading',
                content: 'SAIL Implications'
              },
              {
                type: 'text',
                content: `Each SAIL level determines:

**SAIL I-II:** Low robustness requirements
- Declaration-based approval possible
- Self-certification of some OSOs

**SAIL III-IV:** Medium robustness
- Evidence-based demonstration required
- Third-party verification may be needed

**SAIL V-VI:** High robustness
- Rigorous certification requirements
- Independent verification required
- Type certification may be necessary`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Higher SAIL levels require significantly more documentation and may require equipment certification. Consider operational modifications to achieve a lower SAIL if practical.'
              }
            ],
            keyPoints: [
              'SAIL combines GRC and ARC into overall risk level',
              'Six levels from I (lowest) to VI (highest)',
              'Determines rigor of safety evidence required',
              'Higher SAIL = more stringent requirements'
            ]
          }
        },
        {
          id: 'operational-safety-objectives',
          questId: 'sora-framework',
          title: 'Operational Safety Objectives (OSOs)',
          order: 5,
          xpReward: 30,
          estimatedMinutes: 15,
          content: {
            sections: [
              {
                type: 'text',
                content: `Operational Safety Objectives (OSOs) are specific requirements that must be met based on the SAIL level. Each OSO has an associated robustness level (Low, Medium, High) depending on the SAIL.`
              },
              {
                type: 'heading',
                content: 'OSO Categories'
              },
              {
                type: 'text',
                content: `OSOs are organized into categories addressing different risk factors:

**Technical (OSO#01-08):** UAS design and performance
**Operational (OSO#09-16):** Procedures and conduct
**Training (OSO#17-19):** Crew competency
**External Services (OSO#20-24):** Supporting systems and services`
              },
              {
                type: 'heading',
                content: 'Key OSOs for Typical Operations'
              },
              {
                type: 'list',
                items: [
                  'OSO#01 - Ensure UAS is designed for controllability',
                  'OSO#05 - UAS designed for predictable behavior under abnormal conditions',
                  'OSO#11 - Procedures are defined, validated, and followed',
                  'OSO#14 - Operational plan addresses abnormal situations',
                  'OSO#17 - Crew trained and competent',
                  'OSO#23 - Environmental conditions do not exceed limits'
                ]
              },
              {
                type: 'heading',
                content: 'Robustness Levels'
              },
              {
                type: 'text',
                content: `Each OSO must be demonstrated to a specific robustness:

**Low:** Self-declaration, basic documentation
**Medium:** Evidence-based, may require validation
**High:** Independent verification, rigorous testing`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Not all OSOs apply to every operation. The SORA methodology identifies which OSOs are relevant based on the operational concept and risk analysis.'
              }
            ],
            keyPoints: [
              '24 Operational Safety Objectives cover technical, operational, training, and external aspects',
              'Each OSO has robustness requirements based on SAIL',
              'Operators must demonstrate compliance with applicable OSOs',
              'Documentation requirements increase with robustness level'
            ]
          }
        }
      ],
      quiz: {
        id: 'sora-framework-quiz',
        questId: 'sora-framework',
        passingScore: 80,
        questions: [
          {
            id: 'sfq-1',
            type: 'multiple-choice',
            question: 'What does SORA stand for?',
            options: [
              'Systematic Operational Risk Analysis',
              'Specific Operations Risk Assessment',
              'Standard Operating Risk Assessment',
              'Safety Operations Review and Assessment'
            ],
            correctAnswer: 1,
            explanation: 'SORA stands for Specific Operations Risk Assessment, developed by JARUS.'
          },
          {
            id: 'sfq-2',
            type: 'multiple-choice',
            question: 'Ground Risk Class (GRC) is primarily determined by:',
            options: [
              'Air traffic density and airspace type',
              'Pilot experience and certification',
              'Aircraft characteristics and population density',
              'Weather conditions and visibility'
            ],
            correctAnswer: 2,
            explanation: 'GRC considers the intrinsic risk to people on the ground, based on what could happen if the aircraft crashed.'
          },
          {
            id: 'sfq-3',
            type: 'multiple-choice',
            question: 'Which Air Risk Class represents the lowest air collision risk?',
            options: ['ARC-a', 'ARC-b', 'ARC-c', 'ARC-d'],
            correctAnswer: 0,
            explanation: 'ARC-a represents atypical airspace with the lowest collision risk (e.g., segregated airspace).'
          },
          {
            id: 'sfq-4',
            type: 'multiple-choice',
            question: 'How many SAIL levels are there in the SORA framework?',
            options: ['Four (I-IV)', 'Five (I-V)', 'Six (I-VI)', 'Ten (1-10)'],
            correctAnswer: 2,
            explanation: 'SAIL has six levels (I through VI), with VI representing the highest risk requiring most rigorous requirements.'
          },
          {
            id: 'sfq-5',
            type: 'multiple-choice',
            question: 'What is the maximum GRC reduction that can be achieved through mitigations?',
            options: ['1 level', '2 levels', '3 levels', '5 levels'],
            correctAnswer: 2,
            explanation: 'SORA guidance states that GRC should not be reduced by more than 3 levels through mitigations.'
          }
        ]
      }
    },

    // Quest 3: Operational Risk Assessment
    {
      id: 'operational-risk-assessment',
      trackId: 'regulatory-compliance',
      title: 'Operational Risk Assessment',
      description: 'Master the ORA methodology for site-specific risk evaluation.',
      order: 3,
      xpReward: 125,
      estimatedMinutes: 50,
      lessons: [
        {
          id: 'ora-methodology',
          questId: 'operational-risk-assessment',
          title: 'ORA Methodology (AC 903-001)',
          order: 1,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Transport Canada Advisory Circular 903-001 provides guidance on conducting Operational Risk Assessments. While SORA addresses overall operation type risk, ORA focuses on site-specific hazards and conditions for individual missions.`
              },
              {
                type: 'heading',
                content: 'ORA Purpose'
              },
              {
                type: 'text',
                content: `The Operational Risk Assessment:

- Identifies site-specific hazards
- Evaluates risks for planned operations
- Documents mitigation measures
- Supports go/no-go decisions
- Provides audit trail for compliance`
              },
              {
                type: 'heading',
                content: 'ORA Process Steps'
              },
              {
                type: 'text',
                content: `**Step 1: Define the Operation**
- Mission objectives
- Equipment to be used
- Crew roles and responsibilities
- Timeline and duration

**Step 2: Identify Hazards**
- Airspace hazards
- Ground hazards
- Weather hazards
- Equipment hazards
- Human factors

**Step 3: Assess Risks**
- Likelihood of occurrence
- Severity of consequences
- Risk level determination

**Step 4: Apply Mitigations**
- Eliminate, reduce, or control hazards
- Document control measures
- Assign responsibilities

**Step 5: Accept Residual Risk**
- Review residual risk levels
- Authorize or modify operation`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'ORA should be conducted for each unique operation site. Templates can be developed for recurring operations at established sites.'
              }
            ],
            keyPoints: [
              'ORA is site-specific risk assessment for individual operations',
              'AC 903-001 provides Transport Canada guidance',
              'Systematic five-step process for risk management',
              'Documents hazards, risks, mitigations, and residual risk'
            ]
          }
        },
        {
          id: 'site-survey-requirements',
          questId: 'operational-risk-assessment',
          title: 'Site Survey Requirements',
          order: 2,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `A comprehensive site survey is essential for accurate risk assessment. The survey should identify all relevant hazards and confirm the feasibility of safe operations.`
              },
              {
                type: 'heading',
                content: 'Pre-Visit Preparation'
              },
              {
                type: 'list',
                items: [
                  'Review satellite/aerial imagery of the area',
                  'Check airspace classifications and restrictions',
                  'Identify NOTAMs and TFRs affecting the area',
                  'Research known hazards (power lines, towers, obstacles)',
                  'Check land ownership and access requirements'
                ]
              },
              {
                type: 'heading',
                content: 'On-Site Survey Elements'
              },
              {
                type: 'text',
                content: `**Ground Assessment:**
- Surface conditions and terrain
- Ground personnel access routes
- Emergency vehicle access
- Staging area suitability
- Bystander/public access points

**Obstacle Assessment:**
- Vertical obstacles (trees, structures, towers)
- Power lines and guy wires
- Temporary obstacles (cranes, equipment)
- Obstacle heights and GPS coordinates

**Operational Area:**
- Takeoff and landing zones
- Emergency landing areas
- Flight path clearances
- Line of sight considerations`
              },
              {
                type: 'heading',
                content: 'Documentation Requirements'
              },
              {
                type: 'list',
                items: [
                  'Photographs of key features and hazards',
                  'GPS coordinates of significant locations',
                  'Measurements of critical distances',
                  'Contact information for site representatives',
                  'Signed site survey form'
                ]
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Site conditions can change. Even familiar sites should be resurveyed if significant time has passed or if construction/changes are known to have occurred.'
              }
            ],
            keyPoints: [
              'Site surveys combine desktop research and physical inspection',
              'Document obstacles, terrain, and access points',
              'Identify emergency landing areas and evacuation routes',
              'Surveys should be updated for changing conditions'
            ]
          }
        },
        {
          id: 'population-density-assessment',
          questId: 'operational-risk-assessment',
          title: 'Population Density Assessment',
          order: 3,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Population density significantly affects both regulatory requirements and risk levels. Accurate assessment is critical for compliance and appropriate risk mitigation.`
              },
              {
                type: 'heading',
                content: 'Density Categories'
              },
              {
                type: 'text',
                content: `**Controlled Ground Area:**
- Area secured against unauthorized entry
- No uninvolved persons present
- Operator has authority over the area

**Sparsely Populated:**
- Few or no buildings/structures
- Limited transient population
- Open countryside, rural areas

**Populated Areas:**
- Residential neighborhoods
- Commercial/industrial zones
- Moderate pedestrian traffic

**Gatherings of Persons:**
- Events, festivals, markets
- Sporting venues
- Any organized congregation`
              },
              {
                type: 'heading',
                content: 'Assessment Methods'
              },
              {
                type: 'list',
                items: [
                  'Visual observation during site survey',
                  'Census data for residential areas',
                  'Traffic counts for thoroughfares',
                  'Event schedules and attendance records',
                  'Consultation with local authorities'
                ]
              },
              {
                type: 'heading',
                content: 'Time-Based Variations'
              },
              {
                type: 'text',
                content: `Population density varies by:

- Time of day (rush hour vs. overnight)
- Day of week (weekday vs. weekend)
- Season (summer activities, winter indoor)
- Special events or circumstances

Operations may be restricted to low-density time windows to reduce risk.`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Consider potential population changes during the operation. A seemingly empty area at setup may become populated by operation time.'
              }
            ],
            keyPoints: [
              'Four density categories from controlled to gatherings',
              'Higher density = higher risk and stricter requirements',
              'Population varies by time, day, and season',
              'Document assessment methodology and findings'
            ]
          }
        },
        {
          id: 'risk-documentation',
          questId: 'operational-risk-assessment',
          title: 'Risk Documentation',
          order: 4,
          xpReward: 20,
          estimatedMinutes: 10,
          content: {
            sections: [
              {
                type: 'text',
                content: `Proper documentation of risk assessments is essential for regulatory compliance, operational consistency, and organizational learning. Documentation should be thorough yet practical.`
              },
              {
                type: 'heading',
                content: 'Required Documentation Elements'
              },
              {
                type: 'text',
                content: `**Operation Details:**
- Date, time, location
- Mission objectives
- Equipment identifiers
- Crew names and roles

**Risk Assessment:**
- Hazard identification records
- Risk matrix evaluations
- Mitigation measures
- Residual risk acceptance

**Supporting Materials:**
- Site survey reports
- Weather briefings
- NOTAM reviews
- Airspace authorizations`
              },
              {
                type: 'heading',
                content: 'Documentation Best Practices'
              },
              {
                type: 'list',
                items: [
                  'Use standardized forms and templates',
                  'Complete assessments before operations, not after',
                  'Sign and date all documents',
                  'Store securely with flight logs',
                  'Maintain for minimum 2 years',
                  'Make accessible for regulatory inspection'
                ]
              },
              {
                type: 'heading',
                content: 'Version Control'
              },
              {
                type: 'text',
                content: `For recurring operations or updated procedures:

- Document version numbers clearly
- Track revision history
- Archive superseded versions
- Communicate updates to all crew`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Incomplete or missing documentation is a common audit finding. Establish document control procedures before operations begin.'
              }
            ],
            keyPoints: [
              'Document operation details, risks, and mitigations',
              'Complete documentation before operations, not after',
              'Maintain records for minimum 2 years',
              'Use standardized forms for consistency'
            ]
          }
        }
      ],
      quiz: {
        id: 'ora-quiz',
        questId: 'operational-risk-assessment',
        passingScore: 80,
        questions: [
          {
            id: 'oraq-1',
            type: 'multiple-choice',
            question: 'What Transport Canada Advisory Circular provides guidance on Operational Risk Assessment?',
            options: ['AC 901-001', 'AC 902-001', 'AC 903-001', 'AC 904-001'],
            correctAnswer: 2,
            explanation: 'AC 903-001 provides Transport Canada guidance on conducting Operational Risk Assessments.'
          },
          {
            id: 'oraq-2',
            type: 'multiple-choice',
            question: 'Which population density category requires operator control over the area?',
            options: [
              'Sparsely Populated',
              'Controlled Ground Area',
              'Populated Areas',
              'Gatherings'
            ],
            correctAnswer: 1,
            explanation: 'Controlled Ground Area means the operator has authority over the area and it is secured against unauthorized entry.'
          },
          {
            id: 'oraq-3',
            type: 'multiple-choice',
            question: 'How long must risk assessment documentation be maintained?',
            options: ['6 months', '1 year', '2 years', '5 years'],
            correctAnswer: 2,
            explanation: 'Risk assessment documentation should be maintained for a minimum of 2 years.'
          },
          {
            id: 'oraq-4',
            type: 'multiple-choice',
            question: 'What is the FIRST step in the ORA process?',
            options: [
              'Identify hazards',
              'Define the operation',
              'Assess risks',
              'Apply mitigations'
            ],
            correctAnswer: 1,
            explanation: 'The first step is to clearly define the operation including objectives, equipment, and crew.'
          },
          {
            id: 'oraq-5',
            type: 'multiple-choice',
            question: 'Why should even familiar sites be resurveyed periodically?',
            options: [
              'Regulatory requirement every 30 days',
              'Conditions and obstacles can change',
              'To train new crew members',
              'Insurance requirements'
            ],
            correctAnswer: 1,
            explanation: 'Site conditions can change due to construction, seasonal changes, or other factors. Regular resurveys ensure accurate assessments.'
          }
        ]
      }
    },

    // Quest 4: SFOC Applications
    {
      id: 'sfoc-applications',
      trackId: 'regulatory-compliance',
      title: 'SFOC Applications',
      description: 'Learn when and how to apply for Special Flight Operations Certificates.',
      order: 4,
      xpReward: 125,
      estimatedMinutes: 50,
      scenarioId: 'sfoc-or-not-scenario',
      lessons: [
        {
          id: 'when-sfoc-required',
          questId: 'sfoc-applications',
          title: 'When SFOC is Required',
          order: 1,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `A Special Flight Operations Certificate (SFOC) is required for any RPAS operation that cannot be conducted under the Basic or Advanced operating rules in CARs Part IX. Understanding when an SFOC is required prevents unauthorized operations.`
              },
              {
                type: 'heading',
                content: 'Operations Requiring SFOC'
              },
              {
                type: 'list',
                items: [
                  'Beyond Visual Line of Sight (BVLOS) operations',
                  'Night operations beyond civil twilight',
                  'Operations above 400 feet AGL in controlled airspace',
                  'Operations in restricted/prohibited airspace',
                  'Operations over 25kg MTOW',
                  'Swarm operations (multiple RPAS by one pilot)',
                  'Operations from moving vehicles',
                  'Operations not meeting manufacturer safety standards'
                ]
              },
              {
                type: 'heading',
                content: 'Decision Framework'
              },
              {
                type: 'text',
                content: `To determine if SFOC is required, ask:

1. Can the operation be done in uncontrolled airspace?
2. Will the RPAS remain in VLOS?
3. Is the operation during day/civil twilight?
4. Does the RPAS meet weight limits (250g-25kg)?
5. Can distance/altitude limits be maintained?
6. Are there only uninvolved persons within 30m?

If ANY answer is "no" and Advanced rules don't cover it, SFOC is required.`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Operating without required SFOC is a serious regulatory violation. When in doubt, consult Transport Canada or apply for SFOC.'
              }
            ],
            keyPoints: [
              'SFOC required for operations outside Basic/Advanced rules',
              'BVLOS, night, and high-altitude operations need SFOC',
              'Use decision framework to determine requirement',
              'Unauthorized operations carry significant penalties'
            ]
          }
        },
        {
          id: 'sfoc-application-components',
          questId: 'sfoc-applications',
          title: 'Application Components',
          order: 2,
          xpReward: 30,
          estimatedMinutes: 15,
          content: {
            sections: [
              {
                type: 'text',
                content: `A complete SFOC application demonstrates the operator's capability to safely conduct the proposed operation. Applications are submitted through the Transport Canada Drone Management Portal.`
              },
              {
                type: 'heading',
                content: 'Required Application Elements'
              },
              {
                type: 'text',
                content: `**Concept of Operations (ConOps):**
- Detailed description of intended operations
- Specific locations and airspace
- Operational environment description
- Duration and frequency of operations

**Applicant Information:**
- Legal entity details
- Key personnel and qualifications
- Organizational structure
- Previous aviation experience`
              },
              {
                type: 'heading',
                content: 'Technical Documentation'
              },
              {
                type: 'list',
                items: [
                  'RPAS specifications and capabilities',
                  'Flight control system details',
                  'Communication and navigation systems',
                  'Emergency systems (parachutes, RTH, etc.)',
                  'Maintenance program documentation',
                  'Airworthiness statement or certification'
                ]
              },
              {
                type: 'heading',
                content: 'Operational Documentation'
              },
              {
                type: 'list',
                items: [
                  'Standard Operating Procedures (SOPs)',
                  'Emergency Response Plan',
                  'Training program and crew qualifications',
                  'Risk assessment methodology',
                  'Safety management documentation'
                ]
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Higher-risk operations (BVLOS, night, over people) require more extensive documentation. Start with lower-risk SFOCs to build organizational capability and regulatory confidence.'
              }
            ],
            keyPoints: [
              'Applications require ConOps, technical, and operational documentation',
              'Must demonstrate organizational capability',
              'Higher-risk operations require more documentation',
              'Submit through Drone Management Portal'
            ]
          }
        },
        {
          id: 'sfoc-supporting-documentation',
          questId: 'sfoc-applications',
          title: 'Supporting Documentation',
          order: 3,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Beyond the core application, various supporting documents strengthen the SFOC request and demonstrate thorough preparation.`
              },
              {
                type: 'heading',
                content: 'Risk Assessment Package'
              },
              {
                type: 'text',
                content: `**SORA Assessment:**
- Complete SORA worksheet
- GRC and ARC determinations
- SAIL level and applicable OSOs
- Mitigation measures

**Site-Specific Assessments:**
- ORA for each proposed location
- Site survey reports
- Airspace analysis
- Stakeholder coordination records`
              },
              {
                type: 'heading',
                content: 'Safety Management Evidence'
              },
              {
                type: 'list',
                items: [
                  'Safety policy documentation',
                  'Hazard reporting procedures',
                  'Incident response procedures',
                  'Audit and inspection records',
                  'Corrective action processes'
                ]
              },
              {
                type: 'heading',
                content: 'Crew Competency Records'
              },
              {
                type: 'text',
                content: `- Pilot certificates and recurrency records
- Type-specific training documentation
- Emergency procedure proficiency records
- CRM/human factors training evidence
- Medical fitness declarations (if applicable)`
              },
              {
                type: 'heading',
                content: 'Third-Party Coordination'
              },
              {
                type: 'list',
                items: [
                  'Letters of agreement with airspace users',
                  'Land access permissions',
                  'Local authority notifications',
                  'Insurance certificates'
                ]
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Incomplete applications are the leading cause of SFOC delays. Review all requirements before submission and use checklists.'
              }
            ],
            keyPoints: [
              'Supporting documentation demonstrates operational readiness',
              'Include SORA assessment and site-specific risk analyses',
              'Document crew qualifications and training records',
              'Obtain third-party coordination letters in advance'
            ]
          }
        },
        {
          id: 'sfoc-review-process',
          questId: 'sfoc-applications',
          title: 'Review Process & Timelines',
          order: 4,
          xpReward: 20,
          estimatedMinutes: 10,
          content: {
            sections: [
              {
                type: 'text',
                content: `Understanding the SFOC review process helps operators plan appropriately and respond effectively to Transport Canada queries.`
              },
              {
                type: 'heading',
                content: 'Review Timeline'
              },
              {
                type: 'text',
                content: `**Standard Processing:**
- Submit minimum 30 working days before operation
- Complex operations may require 60+ working days
- Peak periods (summer) may extend timelines
- Incomplete applications restart the clock

**Expedited Review:**
- Emergency/public safety operations
- Requires justification
- Not guaranteed`
              },
              {
                type: 'heading',
                content: 'Review Stages'
              },
              {
                type: 'text',
                content: `1. **Initial Screening:** Completeness check
2. **Technical Review:** Equipment and capabilities
3. **Operational Review:** Procedures and training
4. **Risk Review:** Assessment methodology and mitigations
5. **Decision:** Approve, approve with conditions, or deny`
              },
              {
                type: 'heading',
                content: 'Common Issues'
              },
              {
                type: 'list',
                items: [
                  'Insufficient risk mitigation details',
                  'Incomplete emergency procedures',
                  'Unclear operational boundaries',
                  'Missing crew qualification evidence',
                  'Inadequate coordination with airspace users'
                ]
              },
              {
                type: 'heading',
                content: 'Post-Approval'
              },
              {
                type: 'text',
                content: `Approved SFOCs:
- Have specific validity periods
- Include conditions and limitations
- Require compliance reporting
- May be amended for scope changes
- Can be renewed before expiry`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Maintain good communication with Transport Canada throughout the process. Respond to queries promptly and provide complete information.'
              }
            ],
            keyPoints: [
              'Submit at least 30 working days before operation',
              'Complex operations require longer lead times',
              'Applications go through multi-stage review',
              'Maintain communication with Transport Canada'
            ]
          }
        }
      ],
      quiz: {
        id: 'sfoc-quiz',
        questId: 'sfoc-applications',
        passingScore: 80,
        questions: [
          {
            id: 'sfocq-1',
            type: 'multiple-choice',
            question: 'What is the minimum recommended submission time for an SFOC application?',
            options: [
              '10 working days',
              '20 working days',
              '30 working days',
              '60 working days'
            ],
            correctAnswer: 2,
            explanation: 'SFOC applications should be submitted at least 30 working days before the planned operation.'
          },
          {
            id: 'sfocq-2',
            type: 'multiple-choice',
            question: 'Which operation would NOT require an SFOC?',
            options: [
              'BVLOS flight in rural area',
              'Flight at 350 feet in uncontrolled airspace',
              'Night flight over industrial site',
              'Operating swarm of 5 drones'
            ],
            correctAnswer: 1,
            explanation: 'Flight at 350 feet in uncontrolled airspace can be conducted under Basic or Advanced rules without SFOC.'
          },
          {
            id: 'sfocq-3',
            type: 'multiple-choice',
            question: 'What is the primary cause of SFOC application delays?',
            options: [
              'Transport Canada understaffing',
              'Incomplete applications',
              'Weather restrictions',
              'Airspace conflicts'
            ],
            correctAnswer: 1,
            explanation: 'Incomplete applications are the leading cause of SFOC delays. Complete all requirements before submission.'
          },
          {
            id: 'sfocq-4',
            type: 'multiple-choice',
            question: 'Where are SFOC applications submitted?',
            options: [
              'By mail to Transport Canada Ottawa',
              'Through NAV CANADA website',
              'Transport Canada Drone Management Portal',
              'At local Transport Canada office'
            ],
            correctAnswer: 2,
            explanation: 'SFOC applications are submitted through the Transport Canada Drone Management Portal.'
          },
          {
            id: 'sfocq-5',
            type: 'multiple-choice',
            question: 'What happens if an approved SFOC\'s conditions are violated?',
            options: [
              'Automatic fine',
              'Warning only for first offense',
              'SFOC may be suspended or revoked',
              'No consequences during validity period'
            ],
            correctAnswer: 2,
            explanation: 'Violating SFOC conditions is a serious matter - the certificate may be suspended or revoked, and enforcement action may follow.'
          }
        ]
      }
    },

    // Quest 5: SOP Development
    {
      id: 'sop-development',
      trackId: 'regulatory-compliance',
      title: 'SOP Development',
      description: 'Learn to create and maintain effective Standard Operating Procedures.',
      order: 5,
      xpReward: 125,
      estimatedMinutes: 50,
      lessons: [
        {
          id: 'sop-structure-format',
          questId: 'sop-development',
          title: 'SOP Structure & Format',
          order: 1,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Standard Operating Procedures (SOPs) document how your organization conducts RPAS operations safely and consistently. Well-structured SOPs are essential for regulatory compliance and operational excellence.`
              },
              {
                type: 'heading',
                content: 'SOP Document Structure'
              },
              {
                type: 'text',
                content: `**Front Matter:**
- Title page with document ID and version
- Revision history
- Table of contents
- Document control information
- Approval signatures

**Body:**
- Purpose and scope
- Definitions and acronyms
- Roles and responsibilities
- Procedures (main content)
- References

**Appendices:**
- Checklists
- Forms
- Reference tables
- Emergency contacts`
              },
              {
                type: 'heading',
                content: 'Writing Style Guidelines'
              },
              {
                type: 'list',
                items: [
                  'Use clear, direct language',
                  'Write in present tense, active voice',
                  'Use numbered steps for sequential procedures',
                  'Use bullet points for non-sequential items',
                  'Include warnings and cautions prominently',
                  'Avoid ambiguous terms (should → shall/must)'
                ]
              },
              {
                type: 'heading',
                content: 'Formatting Best Practices'
              },
              {
                type: 'text',
                content: `- Consistent heading hierarchy
- Standard fonts and sizes
- Page numbers and headers
- Section numbering system
- Cross-references between sections
- Visual elements (diagrams, tables) where helpful`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'SOPs should be written so that a qualified person unfamiliar with your specific operation could understand and follow the procedures.'
              }
            ],
            keyPoints: [
              'SOPs have standard structure: front matter, body, appendices',
              'Use clear, direct language in present tense',
              'Include revision history and approval signatures',
              'Format consistently throughout document'
            ]
          }
        },
        {
          id: 'required-procedures',
          questId: 'sop-development',
          title: 'Required Procedures',
          order: 2,
          xpReward: 30,
          estimatedMinutes: 15,
          content: {
            sections: [
              {
                type: 'text',
                content: `Certain procedures are required for compliant RPAS operations. Your SOPs must address these areas comprehensively.`
              },
              {
                type: 'heading',
                content: 'Pre-Flight Procedures'
              },
              {
                type: 'list',
                items: [
                  'Mission planning requirements',
                  'Airspace assessment and authorization',
                  'Weather evaluation criteria',
                  'NOTAM review process',
                  'Equipment inspection checklists',
                  'Crew briefing requirements',
                  'Site assessment procedures',
                  'Go/No-Go decision criteria'
                ]
              },
              {
                type: 'heading',
                content: 'Flight Operations Procedures'
              },
              {
                type: 'list',
                items: [
                  'Takeoff and landing procedures',
                  'Normal flight operations',
                  'Crew coordination protocols',
                  'Communication procedures',
                  'Altitude and distance management',
                  'Visual observer duties',
                  'Airspace monitoring',
                  'Mission documentation'
                ]
              },
              {
                type: 'heading',
                content: 'Post-Flight Procedures'
              },
              {
                type: 'list',
                items: [
                  'Aircraft inspection',
                  'Battery handling and storage',
                  'Data management',
                  'Flight log completion',
                  'Discrepancy reporting',
                  'Equipment securing'
                ]
              },
              {
                type: 'heading',
                content: 'Administrative Procedures'
              },
              {
                type: 'list',
                items: [
                  'Pilot qualification maintenance',
                  'Training requirements',
                  'Maintenance program',
                  'Document control',
                  'Record keeping',
                  'Occurrence reporting'
                ]
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Missing required procedures is a common audit finding. Use regulatory checklists to ensure completeness.'
              }
            ],
            keyPoints: [
              'SOPs must cover pre-flight, flight, and post-flight operations',
              'Administrative procedures are equally important',
              'All required areas must be addressed comprehensively',
              'Use regulatory checklists to verify completeness'
            ]
          }
        },
        {
          id: 'emergency-procedures-sop',
          questId: 'sop-development',
          title: 'Emergency Procedures',
          order: 3,
          xpReward: 30,
          estimatedMinutes: 15,
          content: {
            sections: [
              {
                type: 'text',
                content: `Emergency procedures must be clearly documented and readily accessible during operations. These procedures should cover all reasonably foreseeable emergency scenarios.`
              },
              {
                type: 'heading',
                content: 'Equipment Emergencies'
              },
              {
                type: 'text',
                content: `**Loss of Control Link:**
- Immediate actions
- RTH activation/verification
- Search and recovery procedures
- Notification requirements

**Motor/Propulsion Failure:**
- Immediate response
- Controlled descent procedures
- Area clearing
- Emergency landing site selection

**Battery Emergency:**
- Low battery response
- Battery fire procedures
- Emergency landing priorities
- Post-incident handling`
              },
              {
                type: 'heading',
                content: 'Airspace Emergencies'
              },
              {
                type: 'text',
                content: `**Manned Aircraft Encounter:**
- Immediate avoidance maneuver
- Right-of-way compliance
- ATC notification
- Operation suspension

**Airspace Intrusion:**
- Immediate exit procedures
- ATC communication
- Incident documentation
- Authority notification`
              },
              {
                type: 'heading',
                content: 'Personnel Emergencies'
              },
              {
                type: 'list',
                items: [
                  'Pilot incapacitation procedures',
                  'Medical emergency response',
                  'Bystander injury protocols',
                  'First aid requirements',
                  'Emergency services contact'
                ]
              },
              {
                type: 'heading',
                content: 'Emergency Communication'
              },
              {
                type: 'text',
                content: `- Emergency contact list
- Communication priority sequence
- ATC emergency frequencies
- Reporting requirements and timelines`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Emergency procedures should be practiced regularly. Crew members must be able to execute them without referencing documentation.'
              }
            ],
            keyPoints: [
              'Cover equipment, airspace, and personnel emergencies',
              'Include immediate actions and follow-up procedures',
              'Maintain current emergency contact information',
              'Practice emergency procedures regularly'
            ]
          }
        },
        {
          id: 'sop-version-control',
          questId: 'sop-development',
          title: 'Version Control & Updates',
          order: 4,
          xpReward: 20,
          estimatedMinutes: 10,
          content: {
            sections: [
              {
                type: 'text',
                content: `SOPs must be maintained as living documents. Effective version control ensures crews always have access to current, accurate procedures.`
              },
              {
                type: 'heading',
                content: 'Version Control System'
              },
              {
                type: 'text',
                content: `**Version Numbering:**
- Major.Minor.Patch (e.g., 2.1.3)
- Major: Significant procedural changes
- Minor: Section updates or additions
- Patch: Corrections and clarifications

**Revision History:**
- Date of each revision
- Description of changes
- Author/approver
- Affected sections`
              },
              {
                type: 'heading',
                content: 'Change Management Process'
              },
              {
                type: 'list',
                items: [
                  'Identify need for change (incident, regulation, improvement)',
                  'Draft proposed changes',
                  'Review for accuracy and compliance',
                  'Approve through appropriate authority',
                  'Publish updated version',
                  'Communicate changes to all personnel',
                  'Archive superseded version',
                  'Verify crew acknowledgment'
                ]
              },
              {
                type: 'heading',
                content: 'Triggers for SOP Updates'
              },
              {
                type: 'list',
                items: [
                  'Regulatory changes',
                  'Incident/accident learnings',
                  'New equipment introduction',
                  'Operational experience improvements',
                  'Audit findings',
                  'Periodic scheduled reviews'
                ]
              },
              {
                type: 'heading',
                content: 'Distribution Control'
              },
              {
                type: 'text',
                content: `- Maintain distribution list
- Track all controlled copies
- Ensure obsolete versions removed
- Verify electronic access controls
- Consider mobile/field access needs`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Operating from outdated SOPs is a compliance violation. Implement distribution controls to prevent use of superseded procedures.'
              }
            ],
            keyPoints: [
              'Use systematic version numbering',
              'Document all changes in revision history',
              'Follow formal change management process',
              'Control distribution to prevent outdated use'
            ]
          }
        }
      ],
      quiz: {
        id: 'sop-quiz',
        questId: 'sop-development',
        passingScore: 80,
        questions: [
          {
            id: 'sopq-1',
            type: 'multiple-choice',
            question: 'What writing style is recommended for SOPs?',
            options: [
              'Passive voice, past tense',
              'Active voice, present tense',
              'Formal academic style',
              'Conversational tone'
            ],
            correctAnswer: 1,
            explanation: 'SOPs should be written in active voice, present tense for clarity and directness.'
          },
          {
            id: 'sopq-2',
            type: 'multiple-choice',
            question: 'Which section is NOT typically part of SOP front matter?',
            options: [
              'Table of contents',
              'Revision history',
              'Emergency procedures',
              'Document control information'
            ],
            correctAnswer: 2,
            explanation: 'Emergency procedures are part of the main body, not front matter. Front matter includes administrative elements like TOC and revision history.'
          },
          {
            id: 'sopq-3',
            type: 'multiple-choice',
            question: 'What does a "Major" version number change typically indicate?',
            options: [
              'Minor corrections',
              'Significant procedural changes',
              'Formatting updates',
              'Contact information changes'
            ],
            correctAnswer: 1,
            explanation: 'Major version changes indicate significant procedural changes that affect how operations are conducted.'
          },
          {
            id: 'sopq-4',
            type: 'multiple-choice',
            question: 'Who should be able to understand and follow your SOPs?',
            options: [
              'Only current employees',
              'Only the original author',
              'Any qualified person unfamiliar with your specific operation',
              'Only Transport Canada inspectors'
            ],
            correctAnswer: 2,
            explanation: 'SOPs should be clear enough that any qualified person could understand and follow them, not just those familiar with your operation.'
          },
          {
            id: 'sopq-5',
            type: 'multiple-choice',
            question: 'What is the FIRST step in the change management process?',
            options: [
              'Draft proposed changes',
              'Identify need for change',
              'Communicate to personnel',
              'Get approval'
            ],
            correctAnswer: 1,
            explanation: 'The process begins by identifying the need for change - whether from incidents, regulations, or improvements.'
          }
        ]
      }
    },

    // Quest 6: Compliance Documentation
    {
      id: 'compliance-documentation',
      trackId: 'regulatory-compliance',
      title: 'Compliance Documentation',
      description: 'Master record keeping, audit preparation, and staying current with regulatory changes.',
      order: 6,
      xpReward: 125,
      estimatedMinutes: 45,
      lessons: [
        {
          id: 'record-keeping-requirements',
          questId: 'compliance-documentation',
          title: 'Record Keeping Requirements',
          order: 1,
          xpReward: 30,
          estimatedMinutes: 15,
          content: {
            sections: [
              {
                type: 'text',
                content: `Comprehensive record keeping is a regulatory requirement and an operational necessity. Well-maintained records demonstrate compliance and support continuous improvement.`
              },
              {
                type: 'heading',
                content: 'Flight Records'
              },
              {
                type: 'text',
                content: `Required for each flight:
- Date, time, location
- RPAS identification (registration)
- Pilot certificate number
- Type of operation
- Duration
- Any incidents or anomalies

**Retention Period:** Minimum 12 months from date of flight`
              },
              {
                type: 'heading',
                content: 'Maintenance Records'
              },
              {
                type: 'text',
                content: `For each maintenance event:
- Date and description of work
- Parts replaced
- Person performing maintenance
- Inspection results
- Next inspection due

**Retention Period:** Life of the aircraft plus 12 months`
              },
              {
                type: 'heading',
                content: 'Training Records'
              },
              {
                type: 'list',
                items: [
                  'Initial training completion dates',
                  'Recurrent training records',
                  'Proficiency check results',
                  'Certificate copies and validity dates',
                  'Specialized training (emergency procedures, etc.)'
                ]
              },
              {
                type: 'heading',
                content: 'Incident Records'
              },
              {
                type: 'text',
                content: `All occurrences requiring documentation:
- Incident date, time, location
- Personnel involved
- Equipment involved
- Description of event
- Immediate actions taken
- Root cause analysis
- Corrective actions
- Follow-up status`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Records must be accessible within a reasonable time. Electronic records are acceptable but must be backed up and secured.'
              }
            ],
            keyPoints: [
              'Flight records retained minimum 12 months',
              'Maintenance records retained for aircraft life plus 12 months',
              'Training records must be current and accessible',
              'Incident records require comprehensive documentation'
            ]
          }
        },
        {
          id: 'audit-preparation',
          questId: 'compliance-documentation',
          title: 'Audit Preparation',
          order: 2,
          xpReward: 30,
          estimatedMinutes: 15,
          content: {
            sections: [
              {
                type: 'text',
                content: `Regulatory audits verify compliance with applicable requirements. Being prepared for audits reduces stress and demonstrates organizational competence.`
              },
              {
                type: 'heading',
                content: 'Types of Audits'
              },
              {
                type: 'text',
                content: `**Scheduled Audits:**
- Advance notice provided
- Time to prepare
- Formal agenda

**Unannounced Inspections:**
- No advance notice
- Spot-check nature
- Tests routine compliance

**For-Cause Audits:**
- Triggered by incident or complaint
- Focused on specific issues
- May have enforcement implications`
              },
              {
                type: 'heading',
                content: 'Audit Preparation Steps'
              },
              {
                type: 'list',
                items: [
                  'Conduct internal self-audits regularly',
                  'Ensure all records are current and accessible',
                  'Review previous audit findings and corrective actions',
                  'Verify all personnel certifications are current',
                  'Prepare document index for quick retrieval',
                  'Brief personnel on audit process and expectations',
                  'Designate audit point of contact'
                ]
              },
              {
                type: 'heading',
                content: 'During the Audit'
              },
              {
                type: 'text',
                content: `- Be cooperative and professional
- Answer questions directly and honestly
- Provide requested documentation promptly
- Don't volunteer unnecessary information
- Take notes on auditor feedback
- Ask for clarification if questions are unclear
- Don't argue findings during the audit`
              },
              {
                type: 'heading',
                content: 'Post-Audit Actions'
              },
              {
                type: 'list',
                items: [
                  'Review audit report carefully',
                  'Develop corrective action plan promptly',
                  'Address findings by stated deadlines',
                  'Document corrective actions taken',
                  'Verify effectiveness of corrections',
                  'Update procedures as needed'
                ]
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Regular internal audits identify issues before regulatory audits do. Schedule quarterly self-assessments as a best practice.'
              }
            ],
            keyPoints: [
              'Audits may be scheduled, unannounced, or for-cause',
              'Conduct regular internal self-audits',
              'Be cooperative and professional during audits',
              'Address findings promptly and document corrections'
            ]
          }
        },
        {
          id: 'regulatory-updates',
          questId: 'compliance-documentation',
          title: 'Regulatory Updates & Changes',
          order: 3,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Aviation regulations evolve continuously. Staying current with regulatory changes is essential for maintaining compliance and safe operations.`
              },
              {
                type: 'heading',
                content: 'Information Sources'
              },
              {
                type: 'list',
                items: [
                  'Transport Canada Civil Aviation Communications (CACOMs)',
                  'Canada Gazette (regulatory amendments)',
                  'Transport Canada website updates',
                  'Industry association bulletins',
                  'NAV CANADA communications',
                  'Professional development courses'
                ]
              },
              {
                type: 'heading',
                content: 'Change Monitoring Process'
              },
              {
                type: 'text',
                content: `**Assign Responsibility:**
- Designate regulatory monitoring role
- Include in job description
- Schedule regular review time

**Track Changes:**
- Subscribe to official notifications
- Review at set intervals (weekly recommended)
- Maintain log of changes reviewed

**Assess Impact:**
- Determine if change affects operations
- Identify required SOP updates
- Calculate transition timeline`
              },
              {
                type: 'heading',
                content: 'Implementation Process'
              },
              {
                type: 'text',
                content: `When regulatory changes affect your operation:

1. Analyze the change requirements
2. Identify affected procedures and personnel
3. Develop transition plan
4. Update documentation
5. Train affected personnel
6. Implement changes by effective date
7. Verify compliance
8. Document transition completion`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Some regulatory changes have immediate effect while others have transition periods. Always note the effective date and plan accordingly.'
              }
            ],
            keyPoints: [
              'Subscribe to official Transport Canada communications',
              'Assign responsibility for regulatory monitoring',
              'Assess impact of changes on your operations',
              'Implement changes by effective dates'
            ]
          }
        }
      ],
      quiz: {
        id: 'compliance-documentation-quiz',
        questId: 'compliance-documentation',
        passingScore: 80,
        questions: [
          {
            id: 'cdq-1',
            type: 'multiple-choice',
            question: 'What is the minimum retention period for flight records?',
            options: ['6 months', '12 months', '24 months', '36 months'],
            correctAnswer: 1,
            explanation: 'Flight records must be retained for a minimum of 12 months from the date of flight.'
          },
          {
            id: 'cdq-2',
            type: 'multiple-choice',
            question: 'How long must maintenance records be retained?',
            options: [
              '12 months',
              '24 months',
              'Life of aircraft plus 12 months',
              'Indefinitely'
            ],
            correctAnswer: 2,
            explanation: 'Maintenance records must be retained for the life of the aircraft plus 12 months.'
          },
          {
            id: 'cdq-3',
            type: 'multiple-choice',
            question: 'What is the recommended frequency for internal self-audits?',
            options: ['Monthly', 'Quarterly', 'Annually', 'Every two years'],
            correctAnswer: 1,
            explanation: 'Quarterly self-audits are recommended as a best practice to identify issues before regulatory audits.'
          },
          {
            id: 'cdq-4',
            type: 'multiple-choice',
            question: 'Which is NOT a recommended behavior during a regulatory audit?',
            options: [
              'Be cooperative and professional',
              'Answer questions directly',
              'Argue findings with the auditor',
              'Provide requested documentation promptly'
            ],
            correctAnswer: 2,
            explanation: 'Don\'t argue findings during the audit. Address concerns through the formal response process after receiving the audit report.'
          },
          {
            id: 'cdq-5',
            type: 'multiple-choice',
            question: 'What is the primary source for official regulatory changes in Canada?',
            options: [
              'Industry blogs',
              'Social media',
              'Canada Gazette and Transport Canada communications',
              'Equipment manufacturers'
            ],
            correctAnswer: 2,
            explanation: 'The Canada Gazette (for regulatory amendments) and Transport Canada Civil Aviation Communications are official sources for regulatory changes.'
          }
        ]
      }
    }
  ]
}

export default regulatoryTrack
