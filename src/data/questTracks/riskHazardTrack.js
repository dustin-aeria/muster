/**
 * Risk & Hazard Management Quest Track
 *
 * Comprehensive training on hazard identification, risk assessment methods,
 * formal hazard assessment, control measures, and dynamic risk management.
 *
 * @version 1.0.0
 */

const riskHazardTrack = {
  id: 'riskHazard',
  slug: 'risk-hazard-management',
  title: 'Risk & Hazard Management',
  description: 'Master the principles and practices of hazard identification, risk assessment, and control measure implementation for RPAS operations.',
  category: 'safety',
  icon: 'AlertTriangle',
  color: 'orange',
  difficulty: 'intermediate',
  estimatedHours: 5,
  totalXp: 850,
  prerequisites: ['sms-foundation'],
  badge: {
    id: 'risk-master',
    name: 'Risk Master',
    description: 'Demonstrated expertise in risk assessment and hazard management',
    rarity: 'epic',
    xpBonus: 200,
    icon: 'Target'
  },
  quests: [
    // Quest 1: Hazard Fundamentals
    {
      id: 'hazard-fundamentals',
      trackId: 'risk-hazard-management',
      title: 'Hazard Fundamentals',
      description: 'Understand the core concepts of hazards and risks in RPAS operations.',
      order: 1,
      xpReward: 100,
      estimatedMinutes: 45,
      lessons: [
        {
          id: 'hazard-vs-risk',
          questId: 'hazard-fundamentals',
          title: 'Hazard vs Risk Definitions',
          order: 1,
          xpReward: 20,
          estimatedMinutes: 10,
          content: {
            sections: [
              {
                type: 'text',
                content: `Understanding the distinction between hazards and risks is fundamental to effective safety management. These terms are often confused, but they represent different concepts in the safety framework.`
              },
              {
                type: 'heading',
                content: 'What is a Hazard?'
              },
              {
                type: 'text',
                content: `A **hazard** is a condition, object, or activity with the potential to cause:
- Injury or illness to personnel
- Damage to equipment or property
- Environmental harm
- Negative impact on operations

Hazards exist independently of whether harm actually occurs. They represent potential sources of harm.

**Examples of RPAS hazards:**
- High voltage power lines near operating area
- Gusty wind conditions
- Bird activity in the area
- Low battery state
- Untrained personnel on site`
              },
              {
                type: 'heading',
                content: 'What is Risk?'
              },
              {
                type: 'text',
                content: `**Risk** is the combination of:
- The **likelihood** (probability) of a hazard causing harm
- The **severity** (consequence) of that harm

Risk = Likelihood × Severity

Risk quantifies the actual threat posed by a hazard in a specific context.

**The same hazard can have different risk levels:**
- Power lines 2km away = low risk (unlikely to be a factor)
- Power lines crossing the flight path = high risk (very likely to be a factor)`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Hazards are identified; risks are assessed. First, we find what could cause harm (hazard identification). Then, we evaluate how likely and severe that harm could be (risk assessment).'
              }
            ],
            keyPoints: [
              'A hazard is a condition with potential to cause harm',
              'Risk combines likelihood and severity of harm',
              'The same hazard can present different risk levels in different contexts',
              'Hazard identification precedes risk assessment'
            ]
          }
        },
        {
          id: 'hazard-categories',
          questId: 'hazard-fundamentals',
          title: 'Hazard Categories',
          order: 2,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Categorizing hazards helps ensure comprehensive identification and allows for systematic management approaches. RPAS operations face hazards from multiple categories.`
              },
              {
                type: 'heading',
                content: 'Environmental Hazards'
              },
              {
                type: 'text',
                content: `Hazards arising from the natural and built environment:

**Weather:**
- Wind (sustained and gusts)
- Precipitation (rain, snow, ice)
- Temperature extremes
- Visibility reduction (fog, haze, smoke)
- Lightning and thunderstorms

**Terrain:**
- Elevation changes
- Obstacles (natural and man-made)
- Water bodies
- Remote/inaccessible areas

**Electromagnetic:**
- RF interference sources
- Magnetic anomalies
- Power line EMI`
              },
              {
                type: 'heading',
                content: 'Operational Hazards'
              },
              {
                type: 'text',
                content: `Hazards arising from how operations are conducted:

- Airspace conflicts
- Inadequate planning
- Communication failures
- Coordination breakdowns
- Time pressure
- Inadequate procedures
- Unfamiliar operating environment`
              },
              {
                type: 'heading',
                content: 'Technical Hazards'
              },
              {
                type: 'text',
                content: `Hazards related to equipment and systems:

- Aircraft malfunctions
- Battery failures
- Software/firmware issues
- Ground station failures
- Payload problems
- Maintenance deficiencies`
              },
              {
                type: 'heading',
                content: 'Human Factors Hazards'
              },
              {
                type: 'list',
                items: [
                  'Fatigue and stress',
                  'Distraction and complacency',
                  'Inadequate training',
                  'Poor decision-making',
                  'Communication errors',
                  'Procedural deviations'
                ]
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Most incidents involve multiple hazard categories. A comprehensive hazard identification process addresses all categories systematically.'
              }
            ],
            keyPoints: [
              'Environmental hazards include weather, terrain, and EMI',
              'Operational hazards arise from how we conduct operations',
              'Technical hazards relate to equipment and systems',
              'Human factors hazards involve crew performance and decisions'
            ]
          }
        },
        {
          id: 'hazard-recognition',
          questId: 'hazard-fundamentals',
          title: 'Hazard Recognition Techniques',
          order: 3,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Effective hazard recognition requires both proactive systematic approaches and reactive learning from events. Multiple techniques should be used to ensure comprehensive coverage.`
              },
              {
                type: 'heading',
                content: 'Proactive Methods'
              },
              {
                type: 'text',
                content: `**Checklists and Surveys:**
- Pre-operation site surveys
- Equipment inspection checklists
- Weather assessment protocols
- Airspace review procedures

**Structured Analysis:**
- What-If analysis
- Process hazard analysis
- HAZOP (Hazard and Operability Study)
- Task analysis

**Experience and Expertise:**
- Consultation with experienced operators
- Review of similar operations
- Industry best practices
- Regulatory guidance review`
              },
              {
                type: 'heading',
                content: 'Reactive Methods'
              },
              {
                type: 'text',
                content: `**Internal Learning:**
- Incident and accident investigation
- Near-miss reporting
- Occurrence trend analysis
- Post-operation debriefs

**External Learning:**
- Industry incident reports
- Regulatory safety bulletins
- Manufacturer service bulletins
- Professional network sharing`
              },
              {
                type: 'heading',
                content: 'Continuous Monitoring'
              },
              {
                type: 'list',
                items: [
                  'Real-time condition monitoring during operations',
                  'Weather tracking and updates',
                  'NOTAM monitoring',
                  'Crew fitness monitoring',
                  'Equipment performance tracking'
                ]
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'The best hazard identification combines all methods. Proactive methods find known hazards, reactive methods reveal hidden ones, and monitoring catches emerging hazards.'
              }
            ],
            keyPoints: [
              'Use proactive methods to identify hazards before operations',
              'Learn from incidents and near-misses (reactive)',
              'Monitor continuously during operations',
              'Combine multiple methods for comprehensive coverage'
            ]
          }
        },
        {
          id: 'hazard-documentation',
          questId: 'hazard-fundamentals',
          title: 'Hazard Documentation',
          order: 4,
          xpReward: 20,
          estimatedMinutes: 10,
          content: {
            sections: [
              {
                type: 'text',
                content: `Proper documentation of identified hazards is essential for effective risk management and regulatory compliance. Documentation creates an organizational memory and supports consistent decision-making.`
              },
              {
                type: 'heading',
                content: 'Hazard Registers'
              },
              {
                type: 'text',
                content: `A hazard register is a centralized record of identified hazards:

**Required Information:**
- Hazard ID and description
- Category (environmental, operational, technical, human)
- Source/origin of hazard
- Potential consequences
- Associated operations/locations
- Status (active, controlled, eliminated)

**Optional but Useful:**
- Date identified
- Who identified it
- Related incidents
- Control measures in place
- Review schedule`
              },
              {
                type: 'heading',
                content: 'Site-Specific Documentation'
              },
              {
                type: 'text',
                content: `For recurring locations:
- Site hazard maps
- Photographs of key hazards
- GPS coordinates of obstacles
- Historical weather patterns
- Known interference sources
- Access and evacuation routes`
              },
              {
                type: 'heading',
                content: 'Documentation Best Practices'
              },
              {
                type: 'list',
                items: [
                  'Use standardized formats and terminology',
                  'Make documentation accessible to all crew',
                  'Review and update regularly',
                  'Link hazards to control measures',
                  'Track changes and revisions',
                  'Integrate with operational planning'
                ]
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Undocumented hazards are easily forgotten. If a hazard is worth identifying, it\'s worth documenting.'
              }
            ],
            keyPoints: [
              'Hazard registers provide centralized hazard tracking',
              'Document site-specific hazards for recurring locations',
              'Use standardized formats for consistency',
              'Keep documentation current and accessible'
            ]
          }
        }
      ],
      quiz: {
        id: 'hazard-fundamentals-quiz',
        questId: 'hazard-fundamentals',
        passingScore: 80,
        questions: [
          {
            id: 'hfq-1',
            type: 'multiple-choice',
            question: 'What is the relationship between hazard and risk?',
            options: [
              'They are the same thing',
              'Risk is the likelihood and severity of harm from a hazard',
              'Hazard is a type of risk',
              'Risk must occur before a hazard exists'
            ],
            correctAnswer: 1,
            explanation: 'Risk combines the likelihood (probability) and severity (consequence) of harm resulting from a hazard.'
          },
          {
            id: 'hfq-2',
            type: 'multiple-choice',
            question: 'Which category would "pilot fatigue" fall under?',
            options: [
              'Environmental hazard',
              'Technical hazard',
              'Operational hazard',
              'Human factors hazard'
            ],
            correctAnswer: 3,
            explanation: 'Pilot fatigue is a human factors hazard, relating to crew performance and condition.'
          },
          {
            id: 'hfq-3',
            type: 'multiple-choice',
            question: 'What is a proactive hazard identification method?',
            options: [
              'Incident investigation',
              'Near-miss reporting',
              'Site survey before operations',
              'Post-operation debrief'
            ],
            correctAnswer: 2,
            explanation: 'Site surveys before operations are proactive - they identify hazards before anything happens. The others are reactive methods.'
          },
          {
            id: 'hfq-4',
            type: 'multiple-choice',
            question: 'What is the purpose of a hazard register?',
            options: [
              'To replace risk assessments',
              'To provide centralized tracking of identified hazards',
              'To satisfy insurance requirements only',
              'To document incidents after they occur'
            ],
            correctAnswer: 1,
            explanation: 'A hazard register provides centralized tracking of identified hazards, supporting systematic risk management.'
          },
          {
            id: 'hfq-5',
            type: 'multiple-choice',
            question: 'The same hazard can have different risk levels because:',
            options: [
              'Hazards change randomly',
              'Risk depends on context, likelihood, and severity',
              'Documentation is inconsistent',
              'Regulations vary by location'
            ],
            correctAnswer: 1,
            explanation: 'Risk depends on the specific context - the same hazard may be more or less likely to cause harm depending on circumstances.'
          }
        ]
      }
    },

    // Quest 2: Risk Assessment Methods
    {
      id: 'risk-assessment-methods',
      trackId: 'risk-hazard-management',
      title: 'Risk Assessment Methods',
      description: 'Learn and apply various risk assessment methodologies.',
      order: 2,
      xpReward: 150,
      estimatedMinutes: 60,
      scenarioId: 'assess-this-risk',
      lessons: [
        {
          id: 'qualitative-quantitative',
          questId: 'risk-assessment-methods',
          title: 'Qualitative vs Quantitative Assessment',
          order: 1,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Risk assessment approaches range from qualitative (descriptive) to quantitative (numerical). Understanding when to use each is essential for proportionate risk management.`
              },
              {
                type: 'heading',
                content: 'Qualitative Assessment'
              },
              {
                type: 'text',
                content: `**Characteristics:**
- Uses descriptive categories (low, medium, high)
- Based on judgment and experience
- Faster and simpler to apply
- Appropriate for routine assessments

**Advantages:**
- Quick to perform
- Doesn't require detailed data
- Easy to communicate
- Suitable for most operational decisions

**Limitations:**
- Subject to bias
- Less precise
- Difficult to compare across assessments
- May miss subtle risk differences`
              },
              {
                type: 'heading',
                content: 'Quantitative Assessment'
              },
              {
                type: 'text',
                content: `**Characteristics:**
- Uses numerical values and probabilities
- Based on data and statistical analysis
- More precise and objective
- Required for complex or high-consequence operations

**Advantages:**
- More precise
- Enables cost-benefit analysis
- Better for comparison
- Supports detailed decision-making

**Limitations:**
- Requires good data
- Time and resource intensive
- May create false sense of precision
- Numbers can obscure uncertainty`
              },
              {
                type: 'heading',
                content: 'When to Use Each'
              },
              {
                type: 'text',
                content: `**Use Qualitative for:**
- Routine operations
- Initial screening
- Field assessments
- Operations with established risk profiles

**Use Quantitative for:**
- Novel operations
- High-consequence activities
- Regulatory submissions (SFOC, SORA)
- When precise comparison is needed`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Most practical risk assessments blend both approaches - qualitative categories informed by quantitative thinking and available data.'
              }
            ],
            keyPoints: [
              'Qualitative uses descriptive categories (low/medium/high)',
              'Quantitative uses numerical probabilities and data',
              'Qualitative is faster, quantitative is more precise',
              'Choose based on operation complexity and consequences'
            ]
          }
        },
        {
          id: 'risk-matrix-application',
          questId: 'risk-assessment-methods',
          title: 'Risk Matrix (5x5) Application',
          order: 2,
          xpReward: 30,
          estimatedMinutes: 15,
          content: {
            sections: [
              {
                type: 'text',
                content: `The 5x5 risk matrix is the most common tool for operational risk assessment. It provides a structured way to evaluate and communicate risk levels.`
              },
              {
                type: 'heading',
                content: 'Matrix Structure'
              },
              {
                type: 'text',
                content: `**Likelihood Scale (1-5):**
1. Rare - May occur only in exceptional circumstances
2. Unlikely - Could occur but not expected
3. Possible - Might occur at some time
4. Likely - Will probably occur
5. Almost Certain - Expected to occur

**Severity Scale (1-5):**
1. Negligible - Minor inconvenience, no injury
2. Minor - First aid injury, minor damage
3. Moderate - Medical treatment, significant damage
4. Major - Serious injury, major damage
5. Catastrophic - Fatality, total loss`
              },
              {
                type: 'heading',
                content: 'Risk Levels'
              },
              {
                type: 'text',
                content: `Risk Score = Likelihood × Severity

**Low Risk (1-4):** Acceptable with routine management
**Medium Risk (5-9):** Requires attention and specific controls
**High Risk (10-15):** Requires significant mitigation before proceeding
**Extreme Risk (16-25):** Unacceptable - do not proceed without major changes`
              },
              {
                type: 'heading',
                content: 'Using the Matrix'
              },
              {
                type: 'text',
                content: `1. Identify the hazard
2. Consider the worst credible consequence (severity)
3. Evaluate how likely that consequence is (likelihood)
4. Plot on the matrix to determine risk level
5. Apply controls if risk is unacceptable
6. Re-assess residual risk after controls`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Assess the UNMITIGATED risk first, then evaluate how controls reduce it. This shows the true value of your mitigations.'
              }
            ],
            keyPoints: [
              '5x5 matrix combines likelihood (1-5) and severity (1-5)',
              'Risk score = likelihood × severity (range 1-25)',
              'Risk levels: Low, Medium, High, Extreme',
              'Assess unmitigated risk first, then with controls'
            ]
          }
        },
        {
          id: 'bow-tie-analysis',
          questId: 'risk-assessment-methods',
          title: 'Bow-Tie Analysis',
          order: 3,
          xpReward: 30,
          estimatedMinutes: 15,
          content: {
            sections: [
              {
                type: 'text',
                content: `Bow-tie analysis is a visual risk assessment method that shows the relationship between hazards, controls, and consequences. It's named for its distinctive shape when diagrammed.`
              },
              {
                type: 'heading',
                content: 'Bow-Tie Structure'
              },
              {
                type: 'text',
                content: `**Left Side (Threats):**
- Factors that could release the hazard
- What could go wrong?
- Multiple threats may exist for one hazard

**Center (Hazard/Top Event):**
- The hazard being analyzed
- The unwanted event that releases the hazard

**Right Side (Consequences):**
- Potential outcomes if the hazard is released
- Multiple consequences possible
- Varying severity levels

**Barriers:**
- Prevention barriers (left) stop threats from causing the event
- Mitigation barriers (right) reduce consequences after the event`
              },
              {
                type: 'heading',
                content: 'Example: Loss of Control Bow-Tie'
              },
              {
                type: 'text',
                content: `**Threats (Left):**
- GPS failure
- Motor malfunction
- Pilot error
- Weather exceedance

**Top Event (Center):**
- Loss of aircraft control

**Consequences (Right):**
- Collision with obstacle
- Third-party injury
- Aircraft damage
- Mission failure

**Prevention Barriers:**
- Pre-flight checks
- Weather monitoring
- Training

**Mitigation Barriers:**
- RTH automation
- Parachute system
- Emergency procedures`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Bow-tie analysis is excellent for communicating complex risks to non-specialists. The visual format makes the relationships clear.'
              }
            ],
            keyPoints: [
              'Bow-tie shows threats, hazard, and consequences visually',
              'Prevention barriers block threats from causing events',
              'Mitigation barriers reduce consequences after events',
              'Effective for communication and barrier identification'
            ]
          }
        },
        {
          id: 'fmea-methodology',
          questId: 'risk-assessment-methods',
          title: 'FMEA Methodology',
          order: 4,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Failure Mode and Effects Analysis (FMEA) is a systematic technique for identifying potential failure modes in a system and evaluating their effects. Originally from reliability engineering, it's valuable for RPAS technical risk assessment.`
              },
              {
                type: 'heading',
                content: 'FMEA Process'
              },
              {
                type: 'text',
                content: `**Step 1: Identify Components**
- List all system components
- Include hardware, software, human elements
- Consider interactions

**Step 2: Identify Failure Modes**
- For each component, how could it fail?
- Consider all possible failure types
- Include partial failures

**Step 3: Evaluate Effects**
- What happens if this failure occurs?
- Local effect (on component)
- System effect (on operation)
- End effect (on mission/safety)

**Step 4: Calculate Risk Priority Number (RPN)**
RPN = Severity × Occurrence × Detection
- Severity: How bad is the effect? (1-10)
- Occurrence: How likely is the failure? (1-10)
- Detection: How likely to detect before harm? (1-10)`
              },
              {
                type: 'heading',
                content: 'FMEA for RPAS Example'
              },
              {
                type: 'text',
                content: `**Component:** GPS Module
**Failure Mode:** Loss of satellite lock
**Effect:** Position hold failure, potential fly-away
**Severity:** 8 (could cause third-party damage)
**Occurrence:** 3 (uncommon but possible)
**Detection:** 6 (warning displayed but may be missed)
**RPN:** 8 × 3 × 6 = 144

Higher RPN = higher priority for mitigation`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'FMEA is most valuable for technical systems. For operational risks, other methods like bow-tie or simple matrices may be more practical.'
              }
            ],
            keyPoints: [
              'FMEA systematically analyzes component failure modes',
              'RPN = Severity × Occurrence × Detection',
              'Higher RPN indicates higher priority for action',
              'Most useful for technical/equipment risk assessment'
            ]
          }
        },
        {
          id: 'what-if-analysis',
          questId: 'risk-assessment-methods',
          title: 'What-If Analysis',
          order: 5,
          xpReward: 20,
          estimatedMinutes: 10,
          content: {
            sections: [
              {
                type: 'text',
                content: `What-If Analysis is an intuitive, brainstorming-based technique for identifying hazards and risks. It's particularly useful for operational scenarios and identifying unexpected hazards.`
              },
              {
                type: 'heading',
                content: 'What-If Process'
              },
              {
                type: 'text',
                content: `**Setup:**
- Define the operation or scenario
- Assemble knowledgeable participants
- Establish scope and boundaries

**Brainstorming:**
- Ask "What if...?" questions
- Consider all phases of operation
- Include normal and abnormal conditions
- Don't filter ideas initially

**Analysis:**
- Evaluate each "what if" for consequences
- Identify existing safeguards
- Recommend additional safeguards
- Prioritize based on risk`
              },
              {
                type: 'heading',
                content: 'Example What-If Questions'
              },
              {
                type: 'list',
                items: [
                  'What if the wind exceeds our limits mid-flight?',
                  'What if we lose communication with the aircraft?',
                  'What if an unauthorized person enters the operating area?',
                  'What if the battery capacity was degraded without knowing?',
                  'What if a manned aircraft appears unexpectedly?',
                  'What if the pilot becomes incapacitated?',
                  'What if the client requests an unplanned change?'
                ]
              },
              {
                type: 'heading',
                content: 'Benefits of What-If'
              },
              {
                type: 'list',
                items: [
                  'Simple and intuitive - no special training needed',
                  'Good for brainstorming and team engagement',
                  'Flexible - applies to any operation type',
                  'Identifies scenarios that formal methods might miss',
                  'Builds team awareness and buy-in'
                ]
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'What-If analysis works best with diverse perspectives. Include crew members with different roles and experience levels.'
              }
            ],
            keyPoints: [
              'What-If uses brainstorming to identify hazards',
              'Intuitive method requiring no special training',
              'Best conducted with diverse team perspectives',
              'Complements more structured methods'
            ]
          }
        }
      ],
      quiz: {
        id: 'risk-assessment-quiz',
        questId: 'risk-assessment-methods',
        passingScore: 80,
        questions: [
          {
            id: 'raq-1',
            type: 'multiple-choice',
            question: 'When should quantitative risk assessment be preferred over qualitative?',
            options: [
              'For all routine operations',
              'When time is limited',
              'For high-consequence or novel operations',
              'Only when required by regulation'
            ],
            correctAnswer: 2,
            explanation: 'Quantitative assessment is preferred for high-consequence or novel operations where greater precision is valuable.'
          },
          {
            id: 'raq-2',
            type: 'multiple-choice',
            question: 'In a 5x5 risk matrix, a risk score of 12 (Likely × Moderate) would typically be classified as:',
            options: ['Low risk', 'Medium risk', 'High risk', 'Extreme risk'],
            correctAnswer: 2,
            explanation: 'Risk scores of 10-15 typically fall into the High Risk category requiring significant mitigation.'
          },
          {
            id: 'raq-3',
            type: 'multiple-choice',
            question: 'In bow-tie analysis, what do prevention barriers do?',
            options: [
              'Reduce consequences after an event occurs',
              'Stop threats from causing the top event',
              'Eliminate hazards completely',
              'Monitor for hazard occurrence'
            ],
            correctAnswer: 1,
            explanation: 'Prevention barriers are on the left side of the bow-tie and work to stop threats from causing the top event.'
          },
          {
            id: 'raq-4',
            type: 'multiple-choice',
            question: 'In FMEA, what does RPN stand for?',
            options: [
              'Risk Priority Number',
              'Reliability Performance Number',
              'Risk Probability Notation',
              'Relative Priority Notation'
            ],
            correctAnswer: 0,
            explanation: 'RPN stands for Risk Priority Number, calculated as Severity × Occurrence × Detection.'
          },
          {
            id: 'raq-5',
            type: 'multiple-choice',
            question: 'What is a key advantage of What-If analysis?',
            options: [
              'It provides precise numerical results',
              'It requires minimal training and is intuitive',
              'It replaces all other risk methods',
              'It only needs one person to conduct'
            ],
            correctAnswer: 1,
            explanation: 'What-If analysis is intuitive and requires minimal special training, making it accessible to all team members.'
          }
        ]
      }
    },

    // Quest 3: Formal Hazard Assessment
    {
      id: 'formal-hazard-assessment',
      trackId: 'risk-hazard-management',
      title: 'Formal Hazard Assessment',
      description: 'Learn to conduct and document formal hazard assessments (FHA).',
      order: 3,
      xpReward: 125,
      estimatedMinutes: 50,
      lessons: [
        {
          id: 'fha-structure-purpose',
          questId: 'formal-hazard-assessment',
          title: 'FHA Structure & Purpose',
          order: 1,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `A Formal Hazard Assessment (FHA) is a structured, documented risk assessment that provides an auditable record of hazard identification, risk evaluation, and control measures. FHAs are required for SFOC applications and complex operations.`
              },
              {
                type: 'heading',
                content: 'Purpose of FHA'
              },
              {
                type: 'text',
                content: `The FHA serves multiple purposes:

**Regulatory Compliance:**
- Required for SFOC applications
- Demonstrates due diligence
- Provides audit trail

**Operational Excellence:**
- Systematic hazard identification
- Documented risk decisions
- Basis for operational procedures

**Organizational Learning:**
- Captures knowledge
- Enables review and improvement
- Transfers experience to new personnel`
              },
              {
                type: 'heading',
                content: 'FHA Components'
              },
              {
                type: 'text',
                content: `**Header Section:**
- Operation description
- Date and version
- Assessor(s) and approver(s)
- Scope and assumptions

**Hazard Identification:**
- Systematic listing of hazards
- Categorization
- Description of potential consequences

**Risk Assessment:**
- Unmitigated risk levels
- Assessment methodology used
- Justification for ratings

**Control Measures:**
- Existing controls
- Additional controls proposed
- Responsibility assignments

**Residual Risk:**
- Risk level after controls
- Acceptance or further action needed

**Conclusions:**
- Overall risk acceptability
- Recommendations
- Review schedule`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'An FHA should tell a complete story: what could go wrong, how bad it could be, what we\'re doing about it, and what risk remains.'
              }
            ],
            keyPoints: [
              'FHA provides formal, documented risk assessment',
              'Required for SFOC and complex operations',
              'Includes hazard ID, risk assessment, controls, and residual risk',
              'Creates audit trail and organizational learning'
            ]
          }
        },
        {
          id: 'identifying-controls',
          questId: 'formal-hazard-assessment',
          title: 'Identifying Control Measures',
          order: 2,
          xpReward: 30,
          estimatedMinutes: 15,
          content: {
            sections: [
              {
                type: 'text',
                content: `Control measures are the actions, devices, or procedures that reduce risk. Effective risk management requires identifying appropriate controls for each significant hazard.`
              },
              {
                type: 'heading',
                content: 'Types of Control Measures'
              },
              {
                type: 'text',
                content: `**Elimination:**
- Remove the hazard entirely
- Most effective but often not possible
- Example: Don't fly near the power lines (different route)

**Substitution:**
- Replace with something less hazardous
- Example: Use a smaller, lighter aircraft

**Engineering Controls:**
- Physical changes to equipment or environment
- Example: Parachute system, geo-fencing

**Administrative Controls:**
- Procedures, training, scheduling
- Example: SOPs, crew briefings, weather limits

**PPE/Last Resort:**
- Personal protection
- Example: Safety gear for ground crew`
              },
              {
                type: 'heading',
                content: 'Hierarchy of Controls'
              },
              {
                type: 'text',
                content: `Controls should be selected following the hierarchy:

1. **Elimination** (most effective)
2. **Substitution**
3. **Engineering controls**
4. **Administrative controls**
5. **PPE** (least effective)

Higher-level controls are more reliable because they don't depend on human behavior.`
              },
              {
                type: 'heading',
                content: 'Control Effectiveness'
              },
              {
                type: 'list',
                items: [
                  'Does the control address the root cause?',
                  'Is it reliable under actual conditions?',
                  'Can it fail without warning?',
                  'Does it introduce new hazards?',
                  'Is it practical to implement?'
                ]
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Procedures (administrative controls) are the most common but least reliable controls. They depend entirely on human compliance. Always prefer engineering controls where possible.'
              }
            ],
            keyPoints: [
              'Hierarchy: Elimination > Substitution > Engineering > Administrative > PPE',
              'Higher-level controls are more reliable',
              'Administrative controls depend on human compliance',
              'Evaluate control effectiveness before relying on it'
            ]
          }
        },
        {
          id: 'residual-risk-evaluation',
          questId: 'formal-hazard-assessment',
          title: 'Residual Risk Evaluation',
          order: 3,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `After applying control measures, some risk typically remains. This is called residual risk. Evaluating and accepting residual risk is a critical part of the FHA process.`
              },
              {
                type: 'heading',
                content: 'Evaluating Residual Risk'
              },
              {
                type: 'text',
                content: `**Re-assess with Controls:**
- How do controls affect likelihood?
- How do controls affect severity?
- Are controls reliable?
- What if controls fail?

**Calculate New Risk Level:**
- Apply same methodology used for initial assessment
- Document the reduction achieved
- Be realistic about control effectiveness`
              },
              {
                type: 'heading',
                content: 'Risk Acceptance Criteria'
              },
              {
                type: 'text',
                content: `**Acceptable (Low) Risk:**
- Proceed with routine management
- Monitor for changes

**Tolerable (Medium) Risk:**
- Proceed with additional monitoring
- Document acceptance rationale
- Review regularly

**Unacceptable (High/Extreme) Risk:**
- Do not proceed without further mitigation
- Consider operation modifications
- May require senior management decision`
              },
              {
                type: 'heading',
                content: 'Documenting Risk Acceptance'
              },
              {
                type: 'list',
                items: [
                  'State the residual risk level clearly',
                  'Explain why this level is acceptable',
                  'Identify who has authority to accept',
                  'Specify any conditions for acceptance',
                  'Set review triggers and schedule'
                ]
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'ALARP (As Low As Reasonably Practicable) is the principle that risk should be reduced until further reduction is impractical or disproportionate to the benefit.'
              }
            ],
            keyPoints: [
              'Residual risk is risk remaining after controls',
              'Re-assess using the same methodology',
              'Document acceptance criteria and rationale',
              'ALARP principle guides reduction decisions'
            ]
          }
        },
        {
          id: 'fha-review-approval',
          questId: 'formal-hazard-assessment',
          title: 'FHA Review & Approval',
          order: 4,
          xpReward: 20,
          estimatedMinutes: 10,
          content: {
            sections: [
              {
                type: 'text',
                content: `FHAs must be reviewed and approved before operations proceed. The review process ensures quality and assigns accountability for risk acceptance.`
              },
              {
                type: 'heading',
                content: 'Review Process'
              },
              {
                type: 'text',
                content: `**Technical Review:**
- Are all hazards identified?
- Are risk assessments reasonable?
- Are controls adequate?
- Is residual risk acceptable?

**Quality Review:**
- Is documentation complete?
- Is methodology applied correctly?
- Are conclusions supported?

**Management Review:**
- Does risk align with organizational appetite?
- Are resources available for controls?
- Is accountability clear?`
              },
              {
                type: 'heading',
                content: 'Approval Authority'
              },
              {
                type: 'text',
                content: `Risk acceptance should be at appropriate organizational level:

**Low Residual Risk:** Operations manager or equivalent
**Medium Residual Risk:** Senior operations management
**High Residual Risk:** Executive level, may require external review
**Extreme Residual Risk:** Should not proceed - requires fundamental changes`
              },
              {
                type: 'heading',
                content: 'Ongoing Review Requirements'
              },
              {
                type: 'list',
                items: [
                  'Review after significant incidents or near-misses',
                  'Review when conditions change',
                  'Scheduled periodic review (annually minimum)',
                  'Review when operations change',
                  'Review when regulations change'
                ]
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'FHAs are living documents. An outdated FHA that doesn\'t reflect current conditions provides false assurance.'
              }
            ],
            keyPoints: [
              'Technical, quality, and management reviews required',
              'Approval authority matches risk level',
              'FHAs must be reviewed and updated regularly',
              'Outdated FHAs create false assurance'
            ]
          }
        }
      ],
      quiz: {
        id: 'fha-quiz',
        questId: 'formal-hazard-assessment',
        passingScore: 80,
        questions: [
          {
            id: 'fhaq-1',
            type: 'multiple-choice',
            question: 'What is the primary purpose of a Formal Hazard Assessment?',
            options: [
              'To satisfy insurance requirements',
              'To provide documented, systematic risk evaluation',
              'To replace operational procedures',
              'To eliminate all hazards'
            ],
            correctAnswer: 1,
            explanation: 'An FHA provides documented, systematic risk evaluation with an audit trail for hazard identification, assessment, and control.'
          },
          {
            id: 'fhaq-2',
            type: 'multiple-choice',
            question: 'According to the hierarchy of controls, which is MOST effective?',
            options: ['PPE', 'Administrative controls', 'Engineering controls', 'Elimination'],
            correctAnswer: 3,
            explanation: 'Elimination is the most effective control because it removes the hazard entirely.'
          },
          {
            id: 'fhaq-3',
            type: 'multiple-choice',
            question: 'Why are administrative controls considered less reliable than engineering controls?',
            options: [
              'They are more expensive',
              'They depend on human compliance',
              'They take longer to implement',
              'They are not regulatory compliant'
            ],
            correctAnswer: 1,
            explanation: 'Administrative controls depend on human behavior and compliance, making them less reliable than physical controls.'
          },
          {
            id: 'fhaq-4',
            type: 'multiple-choice',
            question: 'What does ALARP stand for?',
            options: [
              'As Limited As Reasonably Possible',
              'As Low As Reasonably Practicable',
              'Always Limit And Reduce Probability',
              'Assess Likelihood And Risk Potential'
            ],
            correctAnswer: 1,
            explanation: 'ALARP stands for As Low As Reasonably Practicable, meaning risk should be reduced until further reduction is impractical.'
          },
          {
            id: 'fhaq-5',
            type: 'multiple-choice',
            question: 'When should an FHA be reviewed?',
            options: [
              'Only when first created',
              'Only after accidents',
              'Regularly and when conditions change',
              'Every five years'
            ],
            correctAnswer: 2,
            explanation: 'FHAs should be reviewed regularly (annually minimum) and whenever conditions, operations, or regulations change.'
          }
        ]
      }
    },

    // Quest 4: Control Measures
    {
      id: 'control-measures',
      trackId: 'risk-hazard-management',
      title: 'Control Measures',
      description: 'Understand and apply the hierarchy of controls to manage RPAS operational risks.',
      order: 4,
      xpReward: 125,
      estimatedMinutes: 50,
      scenarioId: 'control-selection',
      lessons: [
        {
          id: 'hierarchy-of-controls',
          questId: 'control-measures',
          title: 'Hierarchy of Controls',
          order: 1,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `The hierarchy of controls is a fundamental safety concept that ranks control measures by effectiveness. Understanding this hierarchy ensures you select the most effective controls available.`
              },
              {
                type: 'heading',
                content: 'The Five Levels'
              },
              {
                type: 'text',
                content: `**1. Elimination (Most Effective)**
Remove the hazard completely.
- Don't fly in that area
- Remove the activity causing the hazard
- Eliminate the need for the operation

**2. Substitution**
Replace with something less hazardous.
- Use a smaller/lighter aircraft
- Fly at different time (lower traffic)
- Use different equipment

**3. Engineering Controls**
Physically change equipment or environment.
- Install parachute systems
- Use geo-fencing
- Add redundant systems
- Physical barriers

**4. Administrative Controls**
Change how people work.
- Procedures and SOPs
- Training programs
- Warning signs
- Supervision

**5. PPE (Least Effective)**
Personal protective equipment.
- Safety glasses
- High-visibility clothing
- Hearing protection`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'The higher the control in the hierarchy, the less it depends on human behavior. Elimination and engineering controls work even when people make mistakes.'
              }
            ],
            keyPoints: [
              'Elimination is the most effective control',
              'Higher controls are less dependent on human behavior',
              'PPE should be the last resort, not the first choice',
              'Consider controls at multiple levels for defense in depth'
            ]
          }
        },
        {
          id: 'engineering-controls',
          questId: 'control-measures',
          title: 'Engineering Controls',
          order: 2,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Engineering controls involve physical changes to equipment or systems. They work independently of human behavior, making them highly reliable.`
              },
              {
                type: 'heading',
                content: 'Types of Engineering Controls'
              },
              {
                type: 'text',
                content: `**Redundancy:**
- Dual GPS systems
- Redundant motors/ESCs
- Backup communication links
- Dual flight controllers

**Automatic Safety Systems:**
- Return-to-home functions
- Automatic low-battery landing
- Geo-fencing/no-fly zones
- Collision avoidance

**Protective Systems:**
- Parachute recovery
- Prop guards
- Frangible components
- Emergency cutoff switches

**Environmental Controls:**
- Ground barriers around operations
- Warning lights on aircraft
- Physical boundaries
- Shielding from EMI`
              },
              {
                type: 'heading',
                content: 'Engineering Control Considerations'
              },
              {
                type: 'list',
                items: [
                  'Initial cost vs. long-term benefit',
                  'Weight and performance impact',
                  'Maintenance requirements',
                  'Reliability of the control itself',
                  'Regulatory acceptance/certification'
                ]
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Engineering controls can fail. Consider failure modes of the controls themselves and don\'t rely solely on automated systems.'
              }
            ],
            keyPoints: [
              'Engineering controls work independently of human behavior',
              'Include redundancy, automatic systems, and protective systems',
              'Consider cost, weight, maintenance, and reliability',
              'Engineering controls can also fail - plan for this'
            ]
          }
        },
        {
          id: 'administrative-controls',
          questId: 'control-measures',
          title: 'Administrative Controls',
          order: 3,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Administrative controls change how work is organized and performed. They're the most common type of control in RPAS operations but depend entirely on human compliance.`
              },
              {
                type: 'heading',
                content: 'Types of Administrative Controls'
              },
              {
                type: 'text',
                content: `**Procedures:**
- Standard Operating Procedures
- Emergency procedures
- Checklists
- Decision criteria

**Training:**
- Initial qualification training
- Recurrent training
- Emergency procedure drills
- Hazard awareness training

**Supervision:**
- Flight crew coordination
- Visual observer oversight
- Management oversight
- Quality assurance

**Scheduling:**
- Work hour limits
- Rest requirements
- Optimal timing for operations
- Resource allocation`
              },
              {
                type: 'heading',
                content: 'Strengthening Administrative Controls'
              },
              {
                type: 'list',
                items: [
                  'Make procedures simple and practical',
                  'Verify compliance through audits',
                  'Train until procedures are automatic',
                  'Design for human error (error-tolerant)',
                  'Use checklists for critical sequences',
                  'Regular review and update'
                ]
              },
              {
                type: 'heading',
                content: 'Limitations'
              },
              {
                type: 'text',
                content: `Administrative controls fail when:
- People forget or skip steps
- Procedures are impractical
- Time pressure overrides caution
- Training is inadequate
- Complacency develops
- Supervision is lacking`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Never rely solely on administrative controls for high-consequence risks. Combine with engineering controls where possible.'
              }
            ],
            keyPoints: [
              'Administrative controls depend on human compliance',
              'Include procedures, training, supervision, and scheduling',
              'Can be strengthened but not made as reliable as engineering controls',
              'Combine with other control types for critical risks'
            ]
          }
        },
        {
          id: 'ppe-last-resort',
          questId: 'control-measures',
          title: 'PPE & Last Resort',
          order: 4,
          xpReward: 20,
          estimatedMinutes: 10,
          content: {
            sections: [
              {
                type: 'text',
                content: `Personal Protective Equipment (PPE) is the final line of defense. It doesn't prevent incidents but reduces their severity. For RPAS operations, PPE primarily protects ground personnel.`
              },
              {
                type: 'heading',
                content: 'PPE for RPAS Operations'
              },
              {
                type: 'text',
                content: `**Eye Protection:**
- Safety glasses for close-proximity operations
- UV protection for outdoor operations
- Screen protection for sun glare

**High-Visibility Clothing:**
- Vests for crew identification
- Helps public identify authorized personnel
- Visibility to other aircraft

**Hearing Protection:**
- For operations with loud equipment
- Large multi-rotor operations

**Environmental Protection:**
- Sun protection (hats, sunscreen)
- Cold weather gear
- Rain gear
- Appropriate footwear`
              },
              {
                type: 'heading',
                content: 'When PPE Is Appropriate'
              },
              {
                type: 'list',
                items: [
                  'As final layer after other controls implemented',
                  'For residual risks that cannot be further reduced',
                  'For environmental protection',
                  'For emergency/recovery operations',
                  'For crew identification purposes'
                ]
              },
              {
                type: 'heading',
                content: 'PPE Limitations'
              },
              {
                type: 'text',
                content: `PPE should not be the primary control because:
- It only reduces severity, not likelihood
- It depends on correct usage
- It can be uncomfortable and be removed
- It doesn't protect the public
- It may create false confidence`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Think of PPE as your "last chance" protection. It\'s there if everything else fails, but you shouldn\'t plan on needing it.'
              }
            ],
            keyPoints: [
              'PPE is the least effective control level',
              'Reduces severity but not likelihood',
              'Depends on correct and consistent usage',
              'Should be final layer after other controls, not primary'
            ]
          }
        }
      ],
      quiz: {
        id: 'control-measures-quiz',
        questId: 'control-measures',
        passingScore: 80,
        questions: [
          {
            id: 'cmq-1',
            type: 'multiple-choice',
            question: 'A geo-fencing system that prevents the aircraft from entering restricted areas is an example of:',
            options: [
              'Elimination',
              'Engineering control',
              'Administrative control',
              'PPE'
            ],
            correctAnswer: 1,
            explanation: 'Geo-fencing is an engineering control - a physical/technical system that works independently of human behavior.'
          },
          {
            id: 'cmq-2',
            type: 'multiple-choice',
            question: 'Why are administrative controls considered less effective than engineering controls?',
            options: [
              'They are more expensive',
              'They take longer to implement',
              'They depend on human compliance',
              'They are not accepted by regulators'
            ],
            correctAnswer: 2,
            explanation: 'Administrative controls depend entirely on human compliance, which can fail due to error, complacency, or time pressure.'
          },
          {
            id: 'cmq-3',
            type: 'multiple-choice',
            question: 'Using a smaller, lighter aircraft to reduce the consequences of a collision is an example of:',
            options: ['Elimination', 'Substitution', 'Engineering control', 'Administrative control'],
            correctAnswer: 1,
            explanation: 'Substitution involves replacing something hazardous with something less hazardous - in this case, a lighter aircraft.'
          },
          {
            id: 'cmq-4',
            type: 'multiple-choice',
            question: 'What is the main limitation of PPE as a control measure?',
            options: [
              'It is too expensive',
              'It only reduces severity, not likelihood',
              'It is not available for RPAS operations',
              'Regulators don\'t recognize it'
            ],
            correctAnswer: 1,
            explanation: 'PPE only reduces the severity of harm if an incident occurs - it does nothing to prevent the incident from happening.'
          },
          {
            id: 'cmq-5',
            type: 'multiple-choice',
            question: 'When should you rely primarily on administrative controls?',
            options: [
              'For all routine operations',
              'When higher-level controls are not feasible',
              'To avoid the cost of engineering controls',
              'Administrative controls should always be primary'
            ],
            correctAnswer: 1,
            explanation: 'Administrative controls should be used when higher-level controls (elimination, substitution, engineering) are not feasible or as a supplement to those controls.'
          }
        ]
      }
    },

    // Quest 5: Dynamic Risk Management
    {
      id: 'dynamic-risk-management',
      trackId: 'risk-hazard-management',
      title: 'Dynamic Risk Management',
      description: 'Apply real-time risk assessment during operations.',
      order: 5,
      xpReward: 150,
      estimatedMinutes: 55,
      scenarioId: 'conditions-change',
      lessons: [
        {
          id: 'pre-operation-assessment',
          questId: 'dynamic-risk-management',
          title: 'Pre-Operation Risk Assessment',
          order: 1,
          xpReward: 30,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Pre-operation risk assessment is conducted just before operations begin, confirming that planned risk management remains valid given current conditions.`
              },
              {
                type: 'heading',
                content: 'Purpose of Pre-Op Assessment'
              },
              {
                type: 'text',
                content: `Pre-operation assessment:
- Validates that planned conditions match actual conditions
- Identifies any new hazards since planning
- Confirms all controls are in place
- Sets the baseline for dynamic monitoring
- Documents go/no-go decision basis`
              },
              {
                type: 'heading',
                content: 'Key Assessment Areas'
              },
              {
                type: 'text',
                content: `**Weather Check:**
- Current vs. forecast conditions
- Trend direction
- Margins to limits

**Equipment Status:**
- Pre-flight inspection results
- Battery condition
- System functionality

**Airspace Status:**
- Active NOTAMs
- Traffic situation
- Authorization validity

**Site Conditions:**
- Changes since survey
- Population/activity levels
- Access and egress

**Crew Status:**
- Fitness for duty
- Recent experience
- Role assignments clear`
              },
              {
                type: 'heading',
                content: 'Go/No-Go Decision'
              },
              {
                type: 'list',
                items: [
                  'All pre-conditions met → GO',
                  'Minor issues that can be mitigated → CONDITIONAL GO',
                  'Significant issues or missing requirements → NO-GO',
                  'Document the decision and rationale'
                ]
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'The pre-op assessment is your last systematic check before entering dynamic operations. Take it seriously even when you\'re eager to begin.'
              }
            ],
            keyPoints: [
              'Pre-op validates that planned risk management remains valid',
              'Check weather, equipment, airspace, site, and crew',
              'Make explicit go/no-go decision',
              'Document decision and rationale'
            ]
          }
        },
        {
          id: 'realtime-monitoring',
          questId: 'dynamic-risk-management',
          title: 'Real-Time Risk Monitoring',
          order: 2,
          xpReward: 30,
          estimatedMinutes: 15,
          content: {
            sections: [
              {
                type: 'text',
                content: `During operations, conditions change continuously. Real-time monitoring ensures emerging hazards are identified and addressed before they cause harm.`
              },
              {
                type: 'heading',
                content: 'Continuous Monitoring Elements'
              },
              {
                type: 'text',
                content: `**Weather:**
- Wind changes
- Visibility changes
- Approaching weather
- Temperature trends

**Aircraft Systems:**
- Battery status
- Telemetry warnings
- Control response
- GPS/positioning

**Environment:**
- Traffic (air and ground)
- Pedestrian/vehicle activity
- New obstacles
- Wildlife

**Team:**
- Fatigue levels
- Communication quality
- Workload
- Situational awareness`
              },
              {
                type: 'heading',
                content: 'Monitoring Techniques'
              },
              {
                type: 'list',
                items: [
                  'Periodic systematic scans (not just reactive)',
                  'Defined trigger points for reassessment',
                  'Crew communication about observations',
                  'Technology assistance (weather apps, ADS-B)',
                  'Documented decision points'
                ]
              },
              {
                type: 'heading',
                content: 'Warning Signs'
              },
              {
                type: 'text',
                content: `Watch for indicators that risk is increasing:
- Conditions approaching limits
- Multiple small issues accumulating
- Crew stress or task saturation
- Deviations from plan
- Reduced margins`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Don\'t wait until you\'re at a limit to react. Trends toward limits should trigger action while you still have options.'
              }
            ],
            keyPoints: [
              'Monitor weather, systems, environment, and team continuously',
              'Use systematic scans, not just reactive observation',
              'Identify trends before reaching limits',
              'Multiple small issues may indicate larger problems'
            ]
          }
        },
        {
          id: 'stop-work-authority',
          questId: 'dynamic-risk-management',
          title: 'Stop Work Authority',
          order: 3,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Stop Work Authority (SWA) empowers any team member to halt operations when they identify an unacceptable risk. Effective SWA is essential for dynamic risk management.`
              },
              {
                type: 'heading',
                content: 'Principles of Stop Work Authority'
              },
              {
                type: 'text',
                content: `**Everyone has authority:** Any crew member can call a stop, regardless of role or seniority.

**No retaliation:** Stopping work for safety is always supported, even if the concern turns out to be unfounded.

**No justification required initially:** Stop first, discuss second. The moment of doubt is not the time for debate.

**Resumes only after resolution:** Operations restart only when the concern is resolved and risk is acceptable.`
              },
              {
                type: 'heading',
                content: 'When to Use Stop Work'
              },
              {
                type: 'list',
                items: [
                  'Condition approaches or exceeds a safety limit',
                  'New hazard identified that wasn\'t assessed',
                  'Control measure has failed or is unavailable',
                  'Uncertainty about whether to proceed',
                  'Feeling of unease without specific cause',
                  'Anyone observes an unsafe condition'
                ]
              },
              {
                type: 'heading',
                content: 'Stop Work Process'
              },
              {
                type: 'text',
                content: `1. **Call Stop:** Clear, unambiguous communication
2. **Safe State:** Bring operation to safe condition
3. **Communicate:** Explain the concern
4. **Assess:** Evaluate the situation as a team
5. **Resolve:** Address the issue or decide not to continue
6. **Resume:** Only when risk is acceptable`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'The crew member who calls a stop is never wrong, even if the threat turns out to be manageable. The cost of stopping is always less than the cost of an incident.'
              }
            ],
            keyPoints: [
              'Anyone can call stop work, regardless of role',
              'No retaliation for safety concerns',
              'Stop first, discuss second',
              'Resume only after resolution'
            ]
          }
        },
        {
          id: 'risk-communication',
          questId: 'dynamic-risk-management',
          title: 'Risk Communication',
          order: 4,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Effective communication about risk is essential for dynamic risk management. All team members must share a common understanding of current risk status and changes.`
              },
              {
                type: 'heading',
                content: 'Communication Elements'
              },
              {
                type: 'text',
                content: `**What to communicate:**
- Hazard observations
- Condition changes
- Limit approaches
- Concerns or uncertainties
- Plan changes
- Decision points

**When to communicate:**
- When conditions change
- At scheduled check-ins
- When approaching limits
- When you observe something unexpected
- When you feel uncertain`
              },
              {
                type: 'heading',
                content: 'Communication Methods'
              },
              {
                type: 'text',
                content: `**Closed Loop:**
"Sender sends message → Receiver confirms understanding → Sender confirms receipt"

Example:
VO: "Wind picking up, now gusting 25."
PIC: "Copy, gusting 25."
VO: "Confirmed."

**Standard Phraseology:**
- Use consistent terms for conditions
- Establish clear abort calls
- Define "stop" and "pause" distinctly`
              },
              {
                type: 'heading',
                content: 'Barriers to Communication'
              },
              {
                type: 'list',
                items: [
                  'Hierarchy/authority gradient',
                  'Fear of looking foolish',
                  'Assumption others already know',
                  'Task saturation',
                  'Radio/communication problems',
                  'Vague or unclear language'
                ]
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'When in doubt, communicate. Over-communication about safety is better than assumption and silence.'
              }
            ],
            keyPoints: [
              'Communicate hazards, changes, concerns, and decisions',
              'Use closed-loop communication',
              'Establish standard phraseology',
              'When in doubt, communicate - over-communicate about safety'
            ]
          }
        }
      ],
      quiz: {
        id: 'dynamic-risk-quiz',
        questId: 'dynamic-risk-management',
        passingScore: 80,
        questions: [
          {
            id: 'drq-1',
            type: 'multiple-choice',
            question: 'What is the primary purpose of pre-operation risk assessment?',
            options: [
              'To replace formal hazard assessment',
              'To validate that planned risk management remains valid',
              'To satisfy regulatory requirements only',
              'To train new crew members'
            ],
            correctAnswer: 1,
            explanation: 'Pre-operation assessment validates that planned risk management remains valid given current conditions.'
          },
          {
            id: 'drq-2',
            type: 'multiple-choice',
            question: 'Who has Stop Work Authority?',
            options: [
              'Only the PIC',
              'Only management',
              'Any crew member',
              'Only designated safety officers'
            ],
            correctAnswer: 2,
            explanation: 'Any crew member has Stop Work Authority - anyone can call a stop when they identify unacceptable risk.'
          },
          {
            id: 'drq-3',
            type: 'multiple-choice',
            question: 'When should you call stop work?',
            options: [
              'Only when a limit is exceeded',
              'Only when instructed by management',
              'When uncertain whether to proceed',
              'Only after consulting with the team'
            ],
            correctAnswer: 2,
            explanation: 'Stop work should be called when you\'re uncertain - stop first, discuss second.'
          },
          {
            id: 'drq-4',
            type: 'multiple-choice',
            question: 'What is closed-loop communication?',
            options: [
              'Communication that stays within the team',
              'Sender-receiver-sender confirmation cycle',
              'Communication using only hand signals',
              'Communication that doesn\'t require response'
            ],
            correctAnswer: 1,
            explanation: 'Closed-loop communication involves sender message → receiver confirmation → sender acknowledgment.'
          },
          {
            id: 'drq-5',
            type: 'multiple-choice',
            question: 'What should you do when you notice a trend toward a limit, before reaching it?',
            options: [
              'Wait to see if it actually reaches the limit',
              'Take action while you still have options',
              'Assume others have noticed',
              'Continue as long as you\'re within limits'
            ],
            correctAnswer: 1,
            explanation: 'Take action while you still have options. Waiting until limits are reached leaves fewer choices.'
          }
        ]
      }
    },

    // Quest 6: Continuous Improvement
    {
      id: 'continuous-improvement',
      trackId: 'risk-hazard-management',
      title: 'Continuous Improvement',
      description: 'Learn from incidents and improve risk management over time.',
      order: 6,
      xpReward: 100,
      estimatedMinutes: 40,
      lessons: [
        {
          id: 'learning-from-incidents',
          questId: 'continuous-improvement',
          title: 'Learning from Incidents',
          order: 1,
          xpReward: 30,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Every incident and near-miss is a learning opportunity. A systematic approach to capturing and applying these lessons strengthens overall risk management.`
              },
              {
                type: 'heading',
                content: 'Incident Investigation Principles'
              },
              {
                type: 'text',
                content: `**Focus on learning, not blame:**
- Understand what happened and why
- Identify systemic factors
- Find improvements, not scapegoats

**Preserve information:**
- Document while fresh
- Preserve flight logs and data
- Photograph the scene
- Interview witnesses promptly

**Dig deeper:**
- Look beyond immediate cause
- Identify contributing factors
- Understand the context
- Find root causes`
              },
              {
                type: 'heading',
                content: 'Investigation Questions'
              },
              {
                type: 'list',
                items: [
                  'What happened? (sequence of events)',
                  'What was supposed to happen?',
                  'What conditions contributed?',
                  'What controls failed or were absent?',
                  'Why did those controls fail?',
                  'What would have prevented this?',
                  'Where else could this happen?'
                ]
              },
              {
                type: 'heading',
                content: 'Near-Miss Value'
              },
              {
                type: 'text',
                content: `Near-misses are particularly valuable:
- Same root causes as incidents
- No harm to investigate
- May be more frequent
- Easier to report
- Provide early warning

**Encourage reporting** of near-misses to build organizational learning.`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'The goal of investigation is prevention. If you know exactly who to blame but haven\'t identified how to prevent recurrence, you haven\'t finished investigating.'
              }
            ],
            keyPoints: [
              'Focus on learning and prevention, not blame',
              'Preserve information and investigate promptly',
              'Look for root causes, not just immediate causes',
              'Near-misses are valuable learning opportunities'
            ]
          }
        },
        {
          id: 'risk-trend-analysis',
          questId: 'continuous-improvement',
          title: 'Risk Trend Analysis',
          order: 2,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Analyzing trends in risk data reveals patterns that individual events may not show. Trend analysis supports proactive risk management.`
              },
              {
                type: 'heading',
                content: 'Types of Trend Data'
              },
              {
                type: 'text',
                content: `**Occurrence Data:**
- Incident rates over time
- Near-miss frequency
- Types of occurrences
- Locations and conditions

**Operational Data:**
- Flight hours
- Weather cancellations
- Equipment failures
- Procedure deviations

**Hazard Data:**
- New hazards identified
- Hazard categories trending
- Control effectiveness
- Residual risk changes`
              },
              {
                type: 'heading',
                content: 'Analysis Methods'
              },
              {
                type: 'list',
                items: [
                  'Track rates per flight hour or operation',
                  'Compare periods (monthly, quarterly, annually)',
                  'Identify seasonal patterns',
                  'Look for clusters by location, crew, equipment',
                  'Monitor leading indicators (near-misses)',
                  'Benchmark against industry data if available'
                ]
              },
              {
                type: 'heading',
                content: 'Using Trend Information'
              },
              {
                type: 'text',
                content: `Trends should trigger action:
- Increasing trends → investigate and intervene
- Stable trends → verify controls remain effective
- Decreasing trends → identify what's working and reinforce
- Anomalies → investigate for special causes`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Don\'t wait for statistically significant trends. Safety action can be proactive even with limited data.'
              }
            ],
            keyPoints: [
              'Track occurrence, operational, and hazard data over time',
              'Calculate rates per flight hour for comparison',
              'Look for patterns by location, crew, equipment, or season',
              'Use trends to trigger proactive action'
            ]
          }
        },
        {
          id: 'updating-risk-registers',
          questId: 'continuous-improvement',
          title: 'Updating Risk Registers',
          order: 3,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Risk registers must be living documents that evolve with organizational learning. Regular updates ensure risk management remains current and effective.`
              },
              {
                type: 'heading',
                content: 'Triggers for Updates'
              },
              {
                type: 'text',
                content: `**Add new hazards when:**
- Incidents reveal previously unknown hazards
- New operations or locations introduce hazards
- Equipment changes bring new failure modes
- Regulatory changes identify new requirements
- External events highlight hazards

**Modify existing entries when:**
- Risk assessments prove inaccurate
- Controls prove less effective than expected
- Conditions change affecting likelihood/severity
- Better controls become available
- Near-misses indicate reassessment needed`
              },
              {
                type: 'heading',
                content: 'Update Process'
              },
              {
                type: 'list',
                items: [
                  'Establish regular review schedule (quarterly minimum)',
                  'Assign ownership for each hazard/risk',
                  'Document changes with rationale',
                  'Communicate changes to affected personnel',
                  'Update linked documents (SOPs, FHAs)',
                  'Track revision history'
                ]
              },
              {
                type: 'heading',
                content: 'Closing Risks'
              },
              {
                type: 'text',
                content: `Hazards can be closed when:
- The hazard no longer exists (operation discontinued)
- Risk has been eliminated completely
- The risk is transferred to another party

**Never close based on:**
- Time passing without incident
- "We haven't had problems"
- Administrative convenience`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'A risk register that never changes isn\'t being used. Regular updates show active risk management.'
              }
            ],
            keyPoints: [
              'Update when incidents, changes, or reviews reveal new information',
              'Establish regular review schedule',
              'Document changes with rationale',
              'Only close hazards when they truly no longer exist'
            ]
          }
        }
      ],
      quiz: {
        id: 'continuous-improvement-quiz',
        questId: 'continuous-improvement',
        passingScore: 80,
        questions: [
          {
            id: 'ciq-1',
            type: 'multiple-choice',
            question: 'What should be the primary focus of incident investigation?',
            options: [
              'Finding who to blame',
              'Satisfying insurance requirements',
              'Learning and prevention',
              'Documenting for regulators'
            ],
            correctAnswer: 2,
            explanation: 'Incident investigation should focus on learning and prevention, not blame assignment.'
          },
          {
            id: 'ciq-2',
            type: 'multiple-choice',
            question: 'Why are near-misses valuable for risk management?',
            options: [
              'They don\'t require investigation',
              'They have the same root causes as incidents without harm',
              'They are required by regulation',
              'They only happen to new operators'
            ],
            correctAnswer: 1,
            explanation: 'Near-misses share root causes with incidents but don\'t involve harm, making them valuable learning opportunities.'
          },
          {
            id: 'ciq-3',
            type: 'multiple-choice',
            question: 'How should occurrence data be analyzed for meaningful trends?',
            options: [
              'Count total numbers regardless of activity',
              'Calculate rates per flight hour or operation',
              'Only analyze annual data',
              'Compare raw numbers month to month'
            ],
            correctAnswer: 1,
            explanation: 'Rates per flight hour or operation allow meaningful comparison even when activity levels change.'
          },
          {
            id: 'ciq-4',
            type: 'multiple-choice',
            question: 'When should a hazard be closed in the risk register?',
            options: [
              'When no incidents have occurred for a year',
              'When the hazard no longer exists',
              'When resources are limited',
              'When the risk is well-controlled'
            ],
            correctAnswer: 1,
            explanation: 'Close hazards only when they truly no longer exist, not based on time without incident.'
          },
          {
            id: 'ciq-5',
            type: 'multiple-choice',
            question: 'What does a risk register that never changes indicate?',
            options: [
              'Perfect risk management',
              'Stable operations',
              'The register isn\'t being actively used',
              'No new hazards exist'
            ],
            correctAnswer: 2,
            explanation: 'A risk register that never changes likely isn\'t being actively used. Conditions change, and registers should reflect this.'
          }
        ]
      }
    }
  ]
}

export default riskHazardTrack
