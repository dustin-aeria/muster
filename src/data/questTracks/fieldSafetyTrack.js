/**
 * Field Safety Procedures Quest Track
 *
 * Comprehensive training on site safety, PPE, crew briefings,
 * environmental hazards, ground personnel safety, and incident response.
 *
 * @version 1.0.0
 */

const fieldSafetyTrack = {
  id: 'fieldSafety',
  slug: 'field-safety-procedures',
  title: 'Field Safety Procedures',
  description: 'Master field safety practices for RPAS operations including site assessment, crew safety, environmental hazards, and incident response.',
  category: 'safety',
  icon: 'HardHat',
  color: 'yellow',
  difficulty: 'beginner',
  estimatedHours: 5,
  totalXp: 900,
  prerequisites: [],
  badge: {
    id: 'field-safety-expert',
    name: 'Field Safety Expert',
    description: 'Demonstrated expertise in field safety procedures and practices',
    rarity: 'epic',
    xpBonus: 200,
    icon: 'Shield'
  },
  quests: [
    // Quest 1: Site Safety Fundamentals
    {
      id: 'site-safety-fundamentals',
      trackId: 'field-safety-procedures',
      title: 'Site Safety Fundamentals',
      description: 'Learn to assess and prepare operational sites for safe RPAS operations.',
      order: 1,
      xpReward: 125,
      estimatedMinutes: 50,
      lessons: [
        {
          id: 'site-assessment-checklist',
          questId: 'site-safety-fundamentals',
          title: 'Site Assessment Checklist',
          order: 1,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `A thorough site assessment is the foundation of safe field operations. Using a systematic checklist ensures no critical elements are missed.`
              },
              {
                type: 'heading',
                content: 'Pre-Arrival Assessment'
              },
              {
                type: 'text',
                content: `Before arriving on site, review:

**Airspace:**
- Airspace classification
- NOTAMs and TFRs
- Controlled airspace proximity
- Required authorizations

**Geography:**
- Satellite imagery review
- Elevation and terrain
- Obstacles visible in imagery
- Access routes

**Local Information:**
- Weather patterns
- Known hazards in area
- Emergency services locations
- Contact information for site owner`
              },
              {
                type: 'heading',
                content: 'On-Site Assessment'
              },
              {
                type: 'list',
                items: [
                  'Ground surface condition (level, stable, suitable for operations)',
                  'Obstacles not visible in imagery (wires, new construction)',
                  'Takeoff and landing area suitability',
                  'Visual observer positions with clear sight lines',
                  'Emergency landing areas within range',
                  'Public access points and potential for bystanders',
                  'Vehicle and equipment staging areas',
                  'Communications coverage (cellular, radio)',
                  'Utilities (power lines, buried services)',
                  'Wildlife presence or indicators'
                ]
              },
              {
                type: 'heading',
                content: 'Documentation'
              },
              {
                type: 'text',
                content: `Record your assessment:
- Photographs of key features and hazards
- GPS coordinates of important locations
- Sketch of operational area
- Notes on conditions and decisions
- Date and assessor signature`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Site conditions change. Even familiar sites should be reassessed before each operation, especially after significant time gaps or known changes.'
              }
            ],
            keyPoints: [
              'Conduct pre-arrival and on-site assessments',
              'Check airspace, obstacles, ground conditions, and access',
              'Identify emergency landing areas and public access points',
              'Document findings with photos and notes'
            ]
          }
        },
        {
          id: 'safe-perimeters',
          questId: 'site-safety-fundamentals',
          title: 'Establishing Safe Perimeters',
          order: 2,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Establishing and maintaining safe perimeters protects the public and creates defined operational areas. The perimeter requirements depend on the operation type and regulatory category.`
              },
              {
                type: 'heading',
                content: 'Perimeter Types'
              },
              {
                type: 'text',
                content: `**Flight Operations Area:**
- Where the aircraft will fly
- Bounded by flight path limits
- Should include buffer for emergencies

**Launch/Recovery Area:**
- Takeoff and landing zone
- Clear of obstacles
- Size appropriate for aircraft type

**Ground Control Area:**
- Pilot and crew positions
- Equipment staging
- Protected from aircraft operations

**Public Exclusion Area:**
- Zone where public is not permitted
- Sized based on operation category and risk
- Basic: 30m horizontal from aircraft
- Advanced: As approved for specific operation`
              },
              {
                type: 'heading',
                content: 'Perimeter Methods'
              },
              {
                type: 'list',
                items: [
                  'Physical barriers (fencing, barricades)',
                  'Tape or rope lines',
                  'Signage and warnings',
                  'Personnel (spotters, security)',
                  'Natural boundaries (fences, roads)',
                  'Pre-arranged agreements (closed areas)'
                ]
              },
              {
                type: 'heading',
                content: 'Perimeter Maintenance'
              },
              {
                type: 'text',
                content: `During operations:
- Continuously monitor perimeter integrity
- Have plan for perimeter breaches
- Brief crew on perimeter responsibilities
- Adjust as conditions change
- Document any breaches and responses`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'The perimeter is only as effective as its monitoring. Physical barriers alone may not stop determined individuals.'
              }
            ],
            keyPoints: [
              'Establish flight, launch/recovery, control, and exclusion areas',
              'Use appropriate methods: barriers, tape, signage, personnel',
              'Continuously monitor perimeter during operations',
              'Have a plan for perimeter breaches'
            ]
          }
        },
        {
          id: 'public-safety-protocols',
          questId: 'site-safety-fundamentals',
          title: 'Public Safety Protocols',
          order: 3,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Protecting the public is a primary responsibility. Effective protocols prevent harm and maintain the professional image of RPAS operations.`
              },
              {
                type: 'heading',
                content: 'Public Interaction Principles'
              },
              {
                type: 'text',
                content: `**Before operations:**
- Notify affected parties when possible
- Post appropriate signage
- Coordinate with property owners
- Consider timing to minimize public exposure

**During operations:**
- Maintain situational awareness of public movement
- Be prepared to pause for public passage
- Respond professionally to inquiries
- Never fly toward or over uninvolved persons

**Professional demeanor:**
- Visible identification/credentials
- Courteous responses to questions
- Explain briefly what you're doing
- Provide contact information if requested`
              },
              {
                type: 'heading',
                content: 'Managing Curious Spectators'
              },
              {
                type: 'list',
                items: [
                  'Designate crew member to handle public inquiries',
                  'Direct them to safe viewing area if appropriate',
                  'Explain basic safety perimeter requirements',
                  'Don\'t let interactions distract from flight operations',
                  'Document any confrontational interactions'
                ]
              },
              {
                type: 'heading',
                content: 'Responding to Complaints'
              },
              {
                type: 'text',
                content: `If someone objects to operations:
- Listen respectfully
- Explain authorization and purpose briefly
- Offer contact information for follow-up
- Consider adjusting operations if reasonable
- Never argue or escalate
- Document the interaction
- Report to management if significant`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Your behavior represents the entire RPAS industry. Professional, respectful interactions build public acceptance; conflicts damage it for everyone.'
              }
            ],
            keyPoints: [
              'Notify affected parties and post signage when possible',
              'Maintain awareness of public movement during operations',
              'Respond professionally to inquiries and complaints',
              'Designate crew member to handle public interactions'
            ]
          }
        },
        {
          id: 'signage-barriers',
          questId: 'site-safety-fundamentals',
          title: 'Signage & Barriers',
          order: 4,
          xpReward: 20,
          estimatedMinutes: 10,
          content: {
            sections: [
              {
                type: 'text',
                content: `Effective signage and barriers communicate hazards and boundaries to the public. They're essential elements of site safety management.`
              },
              {
                type: 'heading',
                content: 'Signage Requirements'
              },
              {
                type: 'text',
                content: `**Essential information:**
- "Drone Operations in Progress" or similar warning
- Company/operator identification
- Contact phone number
- Do not enter instructions

**Characteristics of effective signs:**
- Large enough to read from distance
- High contrast colors
- Weather-resistant
- Placed at entry points and key locations
- Multiple languages if appropriate for area`
              },
              {
                type: 'heading',
                content: 'Barrier Options'
              },
              {
                type: 'list',
                items: [
                  'Caution tape (minimal barrier, visible warning)',
                  'Traffic cones (visible markers)',
                  'A-frame barriers (more substantial)',
                  'Temporary fencing (high security)',
                  'Rope lines with signage',
                  'Vehicles as barriers (when appropriate)'
                ]
              },
              {
                type: 'heading',
                content: 'Placement Strategy'
              },
              {
                type: 'text',
                content: `**Consider:**
- All potential approach paths
- Line of sight from approaches
- Distance needed for people to stop/turn back
- Wind effects on tape/signage
- Visibility in varying light conditions

**Placement tips:**
- Signs before barriers give advance warning
- Corner markers clearly define boundaries
- Overlap tape to prevent gaps
- Secure against wind and disturbance`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Signage and barriers are passive controls - they depend on people noticing and complying. Always combine with active monitoring.'
              }
            ],
            keyPoints: [
              'Signs should clearly identify operation and provide contact info',
              'Place signs at all approach paths and entry points',
              'Barrier type should match security needs',
              'Combine passive signage with active monitoring'
            ]
          }
        }
      ],
      quiz: {
        id: 'site-safety-quiz',
        questId: 'site-safety-fundamentals',
        passingScore: 80,
        questions: [
          {
            id: 'ssq-1',
            type: 'multiple-choice',
            question: 'What should be done BEFORE arriving at an operation site?',
            options: [
              'Wait until on-site to assess anything',
              'Review airspace, imagery, and local information',
              'Only check the weather',
              'Nothing - all assessment is done on-site'
            ],
            correctAnswer: 1,
            explanation: 'Pre-arrival assessment includes reviewing airspace, satellite imagery, local information, and weather.'
          },
          {
            id: 'ssq-2',
            type: 'multiple-choice',
            question: 'What is the minimum horizontal distance from bystanders for Basic Operations?',
            options: ['15 meters', '30 meters', '50 meters', '100 meters'],
            correctAnswer: 1,
            explanation: 'Basic Operations require a minimum 30-meter horizontal distance from bystanders.'
          },
          {
            id: 'ssq-3',
            type: 'multiple-choice',
            question: 'If a spectator approaches during operations, you should:',
            options: [
              'Ignore them and continue flying',
              'Immediately abort the flight',
              'Designate crew to handle while maintaining operations',
              'Tell them to leave immediately'
            ],
            correctAnswer: 2,
            explanation: 'Designate a crew member to handle public interactions without disrupting flight operations.'
          },
          {
            id: 'ssq-4',
            type: 'multiple-choice',
            question: 'Why should signage and barriers be combined with active monitoring?',
            options: [
              'They are too expensive to rely on alone',
              'Regulations require both',
              'Passive controls depend on people noticing and complying',
              'Signs wear out quickly'
            ],
            correctAnswer: 2,
            explanation: 'Signage and barriers are passive controls that depend on people noticing and choosing to comply.'
          },
          {
            id: 'ssq-5',
            type: 'multiple-choice',
            question: 'What should operation signage include?',
            options: [
              'Only the company logo',
              'Warning, operator ID, and contact information',
              'Just "Do Not Enter"',
              'Legal disclaimers only'
            ],
            correctAnswer: 1,
            explanation: 'Effective signage includes warning about operations, operator identification, and contact information.'
          }
        ]
      }
    },

    // Quest 2: Personal Protective Equipment
    {
      id: 'personal-protective-equipment',
      trackId: 'field-safety-procedures',
      title: 'Personal Protective Equipment',
      description: 'Understand PPE requirements and best practices for RPAS field operations.',
      order: 2,
      xpReward: 100,
      estimatedMinutes: 40,
      lessons: [
        {
          id: 'ppe-selection',
          questId: 'personal-protective-equipment',
          title: 'PPE Selection for RPAS Operations',
          order: 1,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `While RPAS operations don't typically require extensive PPE, appropriate protective equipment ensures crew safety in various field conditions.`
              },
              {
                type: 'heading',
                content: 'Standard Field PPE'
              },
              {
                type: 'text',
                content: `**High-Visibility Clothing:**
- Identifies crew members
- Visible to public and vehicles
- Required on many work sites
- Consider weather-appropriate versions

**Eye Protection:**
- Reduces glare for better aircraft visibility
- Protects from debris and dust
- UV protection for extended outdoor work

**Footwear:**
- Sturdy, closed-toe shoes minimum
- Safety boots for industrial sites
- Weather-appropriate (waterproof, insulated)
- Good traction for varied terrain

**Head Protection:**
- Hard hat when required by site
- Sun hat/cap for extended outdoor work
- Warm hat for cold conditions`
              },
              {
                type: 'heading',
                content: 'Specialized PPE'
              },
              {
                type: 'list',
                items: [
                  'Hearing protection (large multi-rotors, engine-powered)',
                  'Gloves (battery handling, cold weather)',
                  'Knee pads (low-level GCS work)',
                  'Personal flotation device (over-water operations)',
                  'Fire-resistant clothing (industrial sites)',
                  'First aid kit (personal carry)'
                ]
              },
              {
                type: 'heading',
                content: 'Site-Specific Requirements'
              },
              {
                type: 'text',
                content: `Different work sites may mandate specific PPE:
- Construction sites: Hard hat, safety boots, high-vis
- Industrial facilities: May require FRC, safety glasses
- Confined spaces: Additional respiratory/rescue equipment
- Marine environments: PFD, non-slip footwear

**Always check site requirements before arrival.**`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'PPE should be comfortable enough to wear throughout operations. Uncomfortable PPE tends to be removed.'
              }
            ],
            keyPoints: [
              'Standard PPE: high-vis, eye protection, appropriate footwear',
              'Specialized PPE depends on operation type and environment',
              'Check site-specific requirements before arrival',
              'PPE should be comfortable for extended wear'
            ]
          }
        },
        {
          id: 'ppe-inspection-maintenance',
          questId: 'personal-protective-equipment',
          title: 'PPE Inspection & Maintenance',
          order: 2,
          xpReward: 20,
          estimatedMinutes: 10,
          content: {
            sections: [
              {
                type: 'text',
                content: `PPE must be inspected regularly and maintained properly to remain effective. Damaged or deteriorated PPE may fail when needed.`
              },
              {
                type: 'heading',
                content: 'Inspection Frequency'
              },
              {
                type: 'text',
                content: `**Before each use:** Quick visual check for obvious damage
**Periodic (monthly/quarterly):** Thorough inspection per manufacturer guidelines
**After incidents:** Inspect any PPE involved in an incident
**After storage:** Check before first use after extended storage`
              },
              {
                type: 'heading',
                content: 'What to Check'
              },
              {
                type: 'list',
                items: [
                  'Physical damage (tears, cracks, holes)',
                  'Wear and deterioration',
                  'Proper fit',
                  'Functioning closures/fasteners',
                  'Cleanliness',
                  'Expiration dates (where applicable)',
                  'Certification marks/labels legible'
                ]
              },
              {
                type: 'heading',
                content: 'Maintenance and Storage'
              },
              {
                type: 'text',
                content: `**Cleaning:**
- Follow manufacturer instructions
- Regular cleaning extends life
- Don't use harsh chemicals unless approved

**Storage:**
- Store in clean, dry location
- Protect from UV exposure
- Keep away from chemicals
- Don't compress unnecessarily
- Organize for easy access

**Replacement:**
- Replace when damaged beyond repair
- Replace when expired
- Replace when no longer fits properly
- Document replacement dates`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Never use PPE that shows signs of damage or excessive wear. If in doubt, replace it.'
              }
            ],
            keyPoints: [
              'Inspect PPE before each use and periodically',
              'Check for damage, wear, fit, and function',
              'Follow manufacturer guidelines for cleaning and storage',
              'Replace damaged or expired PPE promptly'
            ]
          }
        },
        {
          id: 'environmental-ppe',
          questId: 'personal-protective-equipment',
          title: 'Environmental PPE (Sun, Cold, Rain)',
          order: 3,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `RPAS operations often involve extended periods outdoors in varying conditions. Environmental protection is crucial for crew health and performance.`
              },
              {
                type: 'heading',
                content: 'Sun Protection'
              },
              {
                type: 'text',
                content: `**UV exposure hazards:**
- Sunburn
- Heat exhaustion
- Long-term skin damage
- Eye damage (cataracts, photokeratitis)

**Protection measures:**
- Sunscreen (SPF 30+, reapply every 2 hours)
- Wide-brimmed hat or cap with neck protection
- UV-blocking sunglasses
- Long sleeves/pants when practical
- Shade structures when available
- Schedule breaks from direct sun`
              },
              {
                type: 'heading',
                content: 'Cold Weather Protection'
              },
              {
                type: 'text',
                content: `**Cold weather hazards:**
- Hypothermia
- Frostbite
- Reduced dexterity affecting control
- Shortened battery life

**Protection measures:**
- Layered clothing system
- Insulated, waterproof outer layer
- Warm hat (significant heat loss through head)
- Insulated gloves (touch-screen compatible)
- Warm footwear with insulation
- Hand/toe warmers
- Shelter/vehicle for warming breaks`
              },
              {
                type: 'heading',
                content: 'Wet Weather Protection'
              },
              {
                type: 'list',
                items: [
                  'Waterproof jacket and pants',
                  'Waterproof boots',
                  'Rain cover for equipment',
                  'Spare dry clothing',
                  'Non-slip footwear for wet surfaces',
                  'Protection for electronics (controller, tablet)'
                ]
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Crew comfort affects performance. An uncomfortable crew member is a distracted crew member. Provide appropriate environmental protection.'
              }
            ],
            keyPoints: [
              'Sun: sunscreen, hat, sunglasses, shade breaks',
              'Cold: layered clothing, insulation, warming breaks',
              'Rain: waterproof outer layers, non-slip footwear',
              'Crew comfort directly affects performance'
            ]
          }
        },
        {
          id: 'specialized-ppe',
          questId: 'personal-protective-equipment',
          title: 'Specialized PPE (Marine, Remote)',
          order: 4,
          xpReward: 20,
          estimatedMinutes: 10,
          content: {
            sections: [
              {
                type: 'text',
                content: `Some operational environments require specialized PPE beyond standard field equipment. Understanding these requirements ensures appropriate preparation.`
              },
              {
                type: 'heading',
                content: 'Marine Operations'
              },
              {
                type: 'text',
                content: `**Required/recommended:**
- Personal flotation device (PFD/life jacket)
- Non-slip deck shoes
- Waterproof clothing
- Secured equipment (tethered or contained)
- Sun and wind protection
- Sea sickness medication if needed

**Considerations:**
- Salt water corrosion protection
- Secured storage for equipment
- Communication in high-noise environment
- Recovery plan if aircraft goes in water`
              },
              {
                type: 'heading',
                content: 'Remote Area Operations'
              },
              {
                type: 'text',
                content: `**Required/recommended:**
- Personal locator beacon (PLB)
- Satellite communication device
- First aid kit (comprehensive)
- Emergency shelter
- Extra food and water
- Bear spray/wildlife deterrent (where applicable)
- Navigation equipment (GPS, maps, compass)
- Emergency signaling devices`
              },
              {
                type: 'heading',
                content: 'Industrial Site Operations'
              },
              {
                type: 'list',
                items: [
                  'Site-specific orientation/credentials',
                  'Hard hat and safety boots (typically required)',
                  'High-visibility vest (typically required)',
                  'Safety glasses',
                  'Hearing protection (if required)',
                  'Fire-resistant clothing (certain environments)',
                  'Gas detection (certain environments)'
                ]
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Some environments (confined spaces, hazardous materials) may require specialized training beyond PPE. Ensure proper qualifications before entering.'
              }
            ],
            keyPoints: [
              'Marine: PFD, non-slip footwear, waterproof gear',
              'Remote: PLB, satellite comms, comprehensive first aid, emergency supplies',
              'Industrial: Site-specific requirements (hard hat, safety boots, high-vis)',
              'Some environments require specialized training beyond PPE'
            ]
          }
        }
      ],
      quiz: {
        id: 'ppe-quiz',
        questId: 'personal-protective-equipment',
        passingScore: 80,
        questions: [
          {
            id: 'ppeq-1',
            type: 'multiple-choice',
            question: 'What is the minimum standard PPE for most RPAS field operations?',
            options: [
              'Just comfortable clothing',
              'High-vis, eye protection, and appropriate footwear',
              'Full body protection',
              'PPE is never required'
            ],
            correctAnswer: 1,
            explanation: 'Standard field PPE typically includes high-visibility clothing, eye protection, and appropriate footwear.'
          },
          {
            id: 'ppeq-2',
            type: 'multiple-choice',
            question: 'When should PPE be inspected?',
            options: [
              'Only when new',
              'Only after incidents',
              'Before each use and periodically',
              'Once per year'
            ],
            correctAnswer: 2,
            explanation: 'PPE should be quickly inspected before each use and thoroughly inspected periodically.'
          },
          {
            id: 'ppeq-3',
            type: 'multiple-choice',
            question: 'What is essential PPE for marine RPAS operations?',
            options: [
              'Hard hat',
              'Personal flotation device',
              'Steel-toed boots',
              'Fire-resistant clothing'
            ],
            correctAnswer: 1,
            explanation: 'Personal flotation device (PFD/life jacket) is essential for operations on or near water.'
          },
          {
            id: 'ppeq-4',
            type: 'multiple-choice',
            question: 'Why is crew comfort important when selecting environmental PPE?',
            options: [
              'It\'s not important',
              'Comfortable crew perform better',
              'Regulations require comfortable PPE',
              'Comfortable PPE is always cheaper'
            ],
            correctAnswer: 1,
            explanation: 'Crew comfort directly affects performance - uncomfortable crew members are distracted crew members.'
          },
          {
            id: 'ppeq-5',
            type: 'multiple-choice',
            question: 'What should you do with PPE that shows signs of damage?',
            options: [
              'Continue using it carefully',
              'Repair it yourself',
              'Replace it',
              'Ignore minor damage'
            ],
            correctAnswer: 2,
            explanation: 'Damaged PPE should be replaced - it may fail when protection is needed.'
          }
        ]
      }
    },

    // Quest 3: Crew Safety Briefings
    {
      id: 'crew-safety-briefings',
      trackId: 'field-safety-procedures',
      title: 'Crew Safety Briefings',
      description: 'Learn to conduct effective safety briefings for RPAS operations.',
      order: 3,
      xpReward: 125,
      estimatedMinutes: 50,
      scenarioId: 'safety-briefing-scenario',
      lessons: [
        {
          id: 'briefing-structure-timing',
          questId: 'crew-safety-briefings',
          title: 'Briefing Structure & Timing',
          order: 1,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `A well-structured safety briefing ensures all crew members share a common understanding of the operation, hazards, and procedures. Briefings should be thorough but efficient.`
              },
              {
                type: 'heading',
                content: 'When to Brief'
              },
              {
                type: 'text',
                content: `**Pre-Operation Briefing:**
- Before any flight operations begin
- After site assessment complete
- When all crew members are present
- Allow time for questions

**Update Briefings:**
- When conditions change significantly
- When plan changes
- When crew rotation occurs
- Before resuming after long break

**Post-Operation Debrief:**
- After operations conclude
- Review what went well/poorly
- Capture lessons learned`
              },
              {
                type: 'heading',
                content: 'Standard Briefing Structure'
              },
              {
                type: 'text',
                content: `**IMFAST Framework:**
- **I**dentification: Mission overview, objectives
- **M**ission: Flight plan, sequence of operations
- **F**requencies/Communications: Radio channels, signals
- **A**irspace: Classification, restrictions, traffic
- **S**afety: Hazards, emergency procedures, muster points
- **T**iming: Schedule, time-critical elements`
              },
              {
                type: 'heading',
                content: 'Effective Briefing Practices'
              },
              {
                type: 'list',
                items: [
                  'Ensure everyone can hear and see any materials',
                  'Make eye contact to gauge understanding',
                  'Use visual aids when helpful (maps, diagrams)',
                  'Encourage questions throughout',
                  'Confirm understanding before proceeding',
                  'Keep appropriate length (thorough but not excessive)'
                ]
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'A good briefing creates a shared mental model. Everyone should leave knowing what will happen, what could go wrong, and what to do about it.'
              }
            ],
            keyPoints: [
              'Brief before operations, after changes, and debrief after',
              'Use structured format (IMFAST: ID, Mission, Freq, Airspace, Safety, Timing)',
              'Encourage questions and confirm understanding',
              'Create shared mental model among all crew'
            ]
          }
        },
        {
          id: 'role-assignments',
          questId: 'crew-safety-briefings',
          title: 'Role Assignments',
          order: 2,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Clear role assignments ensure everyone knows their responsibilities. Ambiguity about roles leads to tasks being missed or duplicated.`
              },
              {
                type: 'heading',
                content: 'Key RPAS Crew Roles'
              },
              {
                type: 'text',
                content: `**Pilot in Command (PIC):**
- Overall responsibility for flight safety
- Final authority on go/no-go decisions
- Aircraft control (or delegates to operator)
- Regulatory compliance

**Visual Observer (VO):**
- Maintains visual contact with aircraft
- Scans for traffic and hazards
- Communicates observations to PIC
- May also watch for ground hazards

**Ground Control Station Operator:**
- Monitors telemetry and systems
- Manages payload operations
- Alerts PIC to system issues

**Safety Officer (if designated):**
- Perimeter monitoring
- Public interaction
- Emergency response coordination
- Documentation`
              },
              {
                type: 'heading',
                content: 'Role Assignment Best Practices'
              },
              {
                type: 'list',
                items: [
                  'Assign roles during briefing, not assumed',
                  'Confirm each person\'s understanding of their role',
                  'Define handover procedures if roles shift',
                  'Ensure backup for critical roles',
                  'Match roles to individual capabilities/certifications',
                  'Document role assignments in flight log'
                ]
              },
              {
                type: 'heading',
                content: 'Role Overlap and Gaps'
              },
              {
                type: 'text',
                content: `**Avoid gaps:** Every necessary task must be someone\'s responsibility.

**Manage overlap:** When multiple people share responsibility, define who leads.

**Single-person operations:** When operating alone, acknowledge limitations and adjust operations accordingly.`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Never assume role assignments are understood from previous operations. Explicitly assign and confirm roles each time.'
              }
            ],
            keyPoints: [
              'Assign roles explicitly during briefing',
              'Key roles: PIC, VO, GCS Operator, Safety Officer',
              'Confirm understanding and document assignments',
              'Avoid gaps and manage overlapping responsibilities'
            ]
          }
        },
        {
          id: 'emergency-muster-points',
          questId: 'crew-safety-briefings',
          title: 'Emergency Muster Points',
          order: 3,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Establishing clear muster points and emergency procedures ensures crew can respond effectively if something goes wrong. These must be communicated in every briefing.`
              },
              {
                type: 'heading',
                content: 'Muster Point Selection'
              },
              {
                type: 'text',
                content: `**Characteristics of good muster points:**
- Clear of flight operations area
- Safe from aircraft emergencies
- Easily identifiable/findable
- Accessible to all crew members
- Has communication capability
- Vehicle access for evacuation if needed

**Common muster point locations:**
- At vehicles
- At defined landmark
- At site entrance
- At designated safe zone`
              },
              {
                type: 'heading',
                content: 'Emergency Procedures to Brief'
              },
              {
                type: 'list',
                items: [
                  'Signal to abort/stop operations',
                  'Muster point location(s)',
                  'Head count procedure',
                  'First aid location and responsible person',
                  'Emergency contact numbers',
                  'Vehicle key location and drivers',
                  'Communication plan if separated'
                ]
              },
              {
                type: 'heading',
                content: 'Briefing Emergency Procedures'
              },
              {
                type: 'text',
                content: `When briefing:
- Physically point to muster point
- Walk through the sequence
- Confirm everyone knows their role
- Identify first aid responder
- Verify emergency contacts are programmed
- Practice emergency communications`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'In an actual emergency, people default to training. Brief emergency procedures so thoroughly that the response is automatic.'
              }
            ],
            keyPoints: [
              'Select muster points that are safe, accessible, and identifiable',
              'Brief abort signal, muster location, head count, and first aid',
              'Physically point to locations during briefing',
              'Verify emergency contacts are accessible'
            ]
          }
        },
        {
          id: 'communication-protocols',
          questId: 'crew-safety-briefings',
          title: 'Communication Protocols',
          order: 4,
          xpReward: 20,
          estimatedMinutes: 10,
          content: {
            sections: [
              {
                type: 'text',
                content: `Clear communication protocols prevent misunderstandings and ensure critical information is received. Establish protocols during briefing and follow them consistently.`
              },
              {
                type: 'heading',
                content: 'Communication Methods'
              },
              {
                type: 'text',
                content: `**Radio:**
- Primary method for distance
- Establish channel/frequency
- Test before operations begin
- Have backup batteries

**Hand Signals:**
- Useful in noisy environments
- Establish standard signals
- Visible to pilot and VO
- Practice before operations

**Verbal (Direct):**
- When close enough
- No equipment required
- May be drowned by noise

**Phone:**
- Backup method
- Requires cellular coverage
- Pre-program key numbers`
              },
              {
                type: 'heading',
                content: 'Standard Communications'
              },
              {
                type: 'list',
                items: [
                  'Pre-takeoff announcement: "Taking off"',
                  'Airborne confirmation: "Airborne, altitude [X]"',
                  'Traffic calls: "[Direction] traffic, [details]"',
                  'Hazard calls: "Stop/Hold - [reason]"',
                  'Landing announcement: "Landing"',
                  'All clear: "Aircraft secure"'
                ]
              },
              {
                type: 'heading',
                content: 'Communication Discipline'
              },
              {
                type: 'text',
                content: `**Best practices:**
- Keep transmissions brief and clear
- Use closed-loop communication
- Don't transmit during critical phases unless necessary
- Acknowledge all received transmissions
- Speak calmly and clearly
- Avoid jargon or unclear references`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Communication failures contribute to many incidents. Test equipment and verify understanding before relying on it.'
              }
            ],
            keyPoints: [
              'Establish primary method and backup (radio, hand signals, verbal)',
              'Use standard phrases for key events',
              'Practice closed-loop communication',
              'Test equipment before operations'
            ]
          }
        }
      ],
      quiz: {
        id: 'crew-briefing-quiz',
        questId: 'crew-safety-briefings',
        passingScore: 80,
        questions: [
          {
            id: 'cbq-1',
            type: 'multiple-choice',
            question: 'What does the "S" in the IMFAST briefing framework stand for?',
            options: ['Speed', 'Schedule', 'Safety', 'Signal'],
            correctAnswer: 2,
            explanation: 'S stands for Safety - covering hazards, emergency procedures, and muster points.'
          },
          {
            id: 'cbq-2',
            type: 'multiple-choice',
            question: 'When should role assignments be made?',
            options: [
              'Assumed from previous operations',
              'Explicitly during each briefing',
              'Only for new crew members',
              'After operations begin'
            ],
            correctAnswer: 1,
            explanation: 'Role assignments should be explicitly made during each briefing, never assumed.'
          },
          {
            id: 'cbq-3',
            type: 'multiple-choice',
            question: 'What should you do when pointing out the muster point during briefing?',
            options: [
              'Just mention it verbally',
              'Physically point to the location',
              'Rely on crew to find it themselves',
              'Only mark it on a map'
            ],
            correctAnswer: 1,
            explanation: 'Physically point to the muster point to ensure everyone knows exactly where it is.'
          },
          {
            id: 'cbq-4',
            type: 'multiple-choice',
            question: 'What is closed-loop communication?',
            options: [
              'Private radio channel',
              'Sender-receiver-sender confirmation cycle',
              'Face-to-face only',
              'Written communication only'
            ],
            correctAnswer: 1,
            explanation: 'Closed-loop involves sender message, receiver confirmation, and sender acknowledgment.'
          },
          {
            id: 'cbq-5',
            type: 'multiple-choice',
            question: 'When should update briefings be conducted?',
            options: [
              'Only at scheduled intervals',
              'When conditions or plans change significantly',
              'Only when problems occur',
              'Never during operations'
            ],
            correctAnswer: 1,
            explanation: 'Update briefings should occur when conditions change, plans change, or crew rotates.'
          }
        ]
      }
    },

    // Quest 4: Environmental Hazards
    {
      id: 'environmental-hazards',
      trackId: 'field-safety-procedures',
      title: 'Environmental Hazards',
      description: 'Identify and manage environmental hazards affecting RPAS operations.',
      order: 4,
      xpReward: 150,
      estimatedMinutes: 60,
      scenarioId: 'hostile-environment',
      lessons: [
        {
          id: 'weather-related-hazards',
          questId: 'environmental-hazards',
          title: 'Weather-Related Hazards',
          order: 1,
          xpReward: 30,
          estimatedMinutes: 15,
          content: {
            sections: [
              {
                type: 'text',
                content: `Weather is the most common environmental hazard affecting RPAS operations. Understanding weather hazards and their impacts enables safe go/no-go decisions.`
              },
              {
                type: 'heading',
                content: 'Wind'
              },
              {
                type: 'text',
                content: `**Hazards:**
- Reduced aircraft control
- Increased battery consumption
- Drift during hover
- Turbulence and gusts
- Difficulty landing

**Considerations:**
- Know your aircraft\'s wind limits
- Gusts more dangerous than sustained
- Wind increases with altitude
- Terrain causes turbulence
- Wind can change rapidly`
              },
              {
                type: 'heading',
                content: 'Precipitation'
              },
              {
                type: 'text',
                content: `**Rain:**
- Most RPAS not waterproof
- Obscures camera
- Affects electronics
- Reduces visibility

**Snow:**
- Affects propulsion
- Accumulates on aircraft
- Obscures visibility
- Cold affects batteries

**Ice:**
- Builds on rotors/surfaces
- Affects aerodynamics
- Adds weight
- Often invisible until severe`
              },
              {
                type: 'heading',
                content: 'Other Weather Hazards'
              },
              {
                type: 'list',
                items: [
                  'Temperature extremes (battery performance, crew safety)',
                  'Fog and low visibility',
                  'Lightning and thunderstorms',
                  'Dust and sand storms',
                  'Smoke from fires'
                ]
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Weather can change rapidly. Monitor conditions continuously, not just at the start of operations.'
              }
            ],
            keyPoints: [
              'Wind: know limits, gusts more dangerous than sustained',
              'Precipitation: most RPAS not weatherproof',
              'Temperature: affects batteries and crew',
              'Monitor continuously - weather changes rapidly'
            ]
          }
        },
        {
          id: 'terrain-obstacles',
          questId: 'environmental-hazards',
          title: 'Terrain & Obstacles',
          order: 2,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Physical features in the operating environment create collision hazards and affect flight planning. Thorough identification and management is essential.`
              },
              {
                type: 'heading',
                content: 'Common Obstacles'
              },
              {
                type: 'text',
                content: `**Vertical obstacles:**
- Power lines (often hard to see)
- Communication towers
- Trees
- Buildings
- Construction cranes
- Flagpoles and signs

**Less obvious hazards:**
- Guy wires (nearly invisible)
- Electric fences
- Temporary structures
- Thin cables and lines`
              },
              {
                type: 'heading',
                content: 'Terrain Considerations'
              },
              {
                type: 'list',
                items: [
                  'Elevation changes affecting relative altitude',
                  'Valleys and ridges creating turbulence',
                  'Slope operations (uneven takeoff/landing)',
                  'Water bodies (limited emergency landing)',
                  'Dense vegetation (recovery difficulty)',
                  'Rocky terrain (unstable footing for crew)'
                ]
              },
              {
                type: 'heading',
                content: 'Management Strategies'
              },
              {
                type: 'text',
                content: `**Before flight:**
- Study satellite imagery
- Conduct thorough site survey
- Document obstacle heights and locations
- Plan flight paths avoiding obstacles

**During flight:**
- Maintain obstacle clearance margins
- VO watches for obstacles
- Use obstacle avoidance features appropriately
- Be especially careful during approach/departure`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Power lines and guy wires are leading collision hazards. Assume they\'re present in any area with power poles or towers.'
              }
            ],
            keyPoints: [
              'Identify all vertical obstacles before flight',
              'Power lines and guy wires are often invisible',
              'Terrain affects relative altitude and creates turbulence',
              'Maintain clearance margins and use VO for monitoring'
            ]
          }
        },
        {
          id: 'electromagnetic-interference',
          questId: 'environmental-hazards',
          title: 'Electromagnetic Interference',
          order: 3,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Electromagnetic interference (EMI) can disrupt GPS, compass, and communication systems. Understanding sources and effects enables avoidance and response.`
              },
              {
                type: 'heading',
                content: 'Common EMI Sources'
              },
              {
                type: 'text',
                content: `**High-power transmitters:**
- Radio/TV broadcast towers
- Cellular towers
- Radar installations
- Microwave links

**Power infrastructure:**
- High-voltage power lines
- Substations
- Transformers

**Industrial equipment:**
- Large electric motors
- Welding operations
- Certain manufacturing processes

**Other:**
- Metal structures (compass interference)
- Underground utilities
- Solar panel arrays`
              },
              {
                type: 'heading',
                content: 'Effects on RPAS'
              },
              {
                type: 'list',
                items: [
                  'GPS degradation or loss',
                  'Compass errors',
                  'Control link degradation',
                  'Video link interference',
                  'Telemetry dropouts',
                  'Erratic flight behavior'
                ]
              },
              {
                type: 'heading',
                content: 'Management Strategies'
              },
              {
                type: 'text',
                content: `**Prevention:**
- Identify EMI sources during site survey
- Maintain distance from known sources
- Note areas to avoid on flight plan
- Start with quick hover test to detect issues

**Response:**
- Switch to attitude mode if GPS affected
- Fly away from interference source
- Land in clear area
- Do not rely on RTH if GPS compromised`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'GPS interference may not be obvious until you\'re in it. Always be prepared to fly manually if GPS fails.'
              }
            ],
            keyPoints: [
              'Common sources: transmitters, power lines, industrial equipment',
              'Can affect GPS, compass, and communication links',
              'Identify sources during site survey',
              'Be prepared to fly manually if interference occurs'
            ]
          }
        },
        {
          id: 'wildlife-encounters',
          questId: 'environmental-hazards',
          title: 'Wildlife Encounters',
          order: 4,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Wildlife interactions create hazards for both the aircraft (bird strikes) and for animals (disturbance, harassment). Responsible operations minimize negative interactions.`
              },
              {
                type: 'heading',
                content: 'Aircraft Hazards'
              },
              {
                type: 'text',
                content: `**Bird strikes:**
- Can damage propellers and aircraft
- More likely near feeding/nesting areas
- Some birds are territorial and attack
- Smaller aircraft more vulnerable

**Response to bird activity:**
- Monitor bird activity before/during flight
- Avoid areas with concentrated activity
- Reduce altitude if birds appear
- Land if aggressive birds approach`
              },
              {
                type: 'heading',
                content: 'Wildlife Disturbance'
              },
              {
                type: 'text',
                content: `**Disturbance effects:**
- Fleeing wastes energy (harmful to animals)
- Nest abandonment
- Stampeding (livestock and wildlife)
- Separation of young from parents
- Disruption of feeding/breeding

**Regulations apply:**
- BC Wildlife Act
- Species at Risk Act
- Migratory Birds Convention Act
- Marine Mammal Regulations
- Know and follow applicable rules`
              },
              {
                type: 'heading',
                content: 'Best Practices'
              },
              {
                type: 'list',
                items: [
                  'Maintain appropriate distances from wildlife',
                  'Avoid nesting sites during breeding season',
                  'Monitor for wildlife response during operations',
                  'Stop if significant disturbance observed',
                  'Report significant wildlife encounters',
                  'Know seasonal restrictions in your area'
                ]
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Wildlife disturbance can result in regulatory violations and damage to operator reputation. When in doubt, increase distance or stop operations.'
              }
            ],
            keyPoints: [
              'Bird strikes can damage aircraft',
              'Wildlife disturbance has regulatory implications',
              'Maintain appropriate distances and monitor responses',
              'Stop operations if significant disturbance observed'
            ]
          }
        },
        {
          id: 'remote-area-operations',
          questId: 'environmental-hazards',
          title: 'Remote Area Operations',
          order: 5,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Operating in remote areas presents unique challenges including limited emergency services, communication difficulties, and self-reliance requirements.`
              },
              {
                type: 'heading',
                content: 'Remote Area Challenges'
              },
              {
                type: 'text',
                content: `**Emergency response:**
- Delayed or unavailable emergency services
- Limited medical facilities
- Difficult evacuation
- Self-reliance essential

**Communication:**
- No cellular coverage
- Limited radio range
- May need satellite communication
- Check-in protocols critical

**Logistics:**
- Limited resupply
- Extended travel times
- Weather delays
- Equipment self-sufficiency`
              },
              {
                type: 'heading',
                content: 'Remote Operations Requirements'
              },
              {
                type: 'list',
                items: [
                  'Personal locator beacon (PLB)',
                  'Satellite communication device',
                  'Enhanced first aid capability',
                  'Emergency shelter and supplies',
                  'Navigation equipment (GPS, maps, compass)',
                  'Extended fuel/power capacity',
                  'Recovery equipment',
                  'Wildlife deterrents if appropriate'
                ]
              },
              {
                type: 'heading',
                content: 'Planning Considerations'
              },
              {
                type: 'text',
                content: `**Before departure:**
- File flight/trip plan with contacts
- Establish check-in schedule
- Define overdue response procedures
- Ensure equipment redundancy
- Consider weather windows for access/egress

**During operations:**
- Maintain check-in schedule
- Monitor weather closely
- Conservative go/no-go decisions
- Preserve margin for return`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'In remote areas, you are your own emergency service. Plan and equip accordingly.'
              }
            ],
            keyPoints: [
              'Emergency services may be unavailable or delayed',
              'Satellite communication may be required',
              'Enhanced equipment and supplies essential',
              'Conservative decisions - margin for self-rescue'
            ]
          }
        }
      ],
      quiz: {
        id: 'environmental-hazards-quiz',
        questId: 'environmental-hazards',
        passingScore: 80,
        questions: [
          {
            id: 'ehq-1',
            type: 'multiple-choice',
            question: 'Which wind characteristic is more dangerous for RPAS operations?',
            options: [
              'Sustained wind',
              'Gusts',
              'Headwind',
              'Tailwind'
            ],
            correctAnswer: 1,
            explanation: 'Gusts are more dangerous because they\'re sudden and can exceed aircraft limits momentarily.'
          },
          {
            id: 'ehq-2',
            type: 'multiple-choice',
            question: 'What is a common source of compass interference?',
            options: [
              'Trees',
              'Metal structures',
              'Open water',
              'Grass fields'
            ],
            correctAnswer: 1,
            explanation: 'Metal structures create magnetic anomalies that interfere with compass sensors.'
          },
          {
            id: 'ehq-3',
            type: 'multiple-choice',
            question: 'What should you do if a bird approaches your aircraft aggressively?',
            options: [
              'Continue the mission',
              'Fly toward the bird',
              'Land the aircraft',
              'Increase altitude significantly'
            ],
            correctAnswer: 2,
            explanation: 'Landing the aircraft removes it from the conflict and prevents damage from a strike.'
          },
          {
            id: 'ehq-4',
            type: 'multiple-choice',
            question: 'What is essential equipment for remote area operations?',
            options: [
              'Extra batteries only',
              'Personal locator beacon and satellite communication',
              'Larger aircraft',
              'Additional cameras'
            ],
            correctAnswer: 1,
            explanation: 'PLB and satellite communication are essential when cellular coverage is unavailable and emergency response is limited.'
          },
          {
            id: 'ehq-5',
            type: 'multiple-choice',
            question: 'Power lines and guy wires are hazardous because:',
            options: [
              'They emit EMI',
              'They are often nearly invisible',
              'They attract birds',
              'They cause weather changes'
            ],
            correctAnswer: 1,
            explanation: 'Power lines and especially guy wires can be nearly invisible, making them common collision hazards.'
          }
        ]
      }
    },

    // Quest 5: Ground Personnel Safety
    {
      id: 'ground-personnel-safety',
      trackId: 'field-safety-procedures',
      title: 'Ground Personnel Safety',
      description: 'Protect ground crew and others during RPAS operations.',
      order: 5,
      xpReward: 125,
      estimatedMinutes: 50,
      lessons: [
        {
          id: 'visual-observer-protocols',
          questId: 'ground-personnel-safety',
          title: 'Visual Observer Protocols',
          order: 1,
          xpReward: 30,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Visual observers (VOs) are essential safety team members. Their primary role is to maintain visual contact with the aircraft and scan for hazards.`
              },
              {
                type: 'heading',
                content: 'VO Responsibilities'
              },
              {
                type: 'text',
                content: `**Primary duties:**
- Maintain continuous visual contact with aircraft
- Scan for air traffic and hazards
- Communicate observations to PIC
- Alert to manned aircraft or hazards

**Secondary duties may include:**
- Public interface
- Perimeter monitoring
- Ground hazard awareness
- Emergency response support`
              },
              {
                type: 'heading',
                content: 'VO Positioning'
              },
              {
                type: 'text',
                content: `**Good VO position:**
- Clear sightlines to operating area
- Communication with PIC (radio or direct)
- Safe from aircraft operations
- Appropriate for traffic direction
- Minimal sun glare issues

**Multiple VOs:**
- Position for overlapping coverage
- Define sectors of responsibility
- Establish handoff procedures
- Coordinate communication`
              },
              {
                type: 'heading',
                content: 'VO Communication Protocol'
              },
              {
                type: 'list',
                items: [
                  'Traffic calls: direction, type, altitude if known',
                  'Aircraft position: relative to landmarks or compass',
                  'Hazard calls: clear, immediate, actionable',
                  'Condition changes: weather, activity, perimeter',
                  'Request confirmation of critical information'
                ]
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'VOs should be trained and briefed for each operation. Their role is active scanning, not passive observation.'
              }
            ],
            keyPoints: [
              'VOs maintain visual contact and scan for hazards',
              'Position for clear sightlines and communication',
              'Multiple VOs need defined sectors and handoffs',
              'Communication should be clear and actionable'
            ]
          }
        },
        {
          id: 'prop-strike-prevention',
          questId: 'ground-personnel-safety',
          title: 'Prop Strike Prevention',
          order: 2,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Propeller strikes are among the most common RPAS injuries. Even small aircraft propellers can cause serious cuts and injuries. Prevention requires constant vigilance.`
              },
              {
                type: 'heading',
                content: 'Risk Factors'
              },
              {
                type: 'text',
                content: `**High-risk moments:**
- Pre-flight checks with props attached
- Manual launch
- Manual catch/landing
- Working on powered aircraft
- Approaching running aircraft
- Loss of control on ground

**Contributing factors:**
- Unfamiliar controls
- Unexpected startup
- Reaching near rotating props
- Clothing or straps catching props
- Trip/fall near aircraft`
              },
              {
                type: 'heading',
                content: 'Prevention Measures'
              },
              {
                type: 'list',
                items: [
                  'Never approach from prop plane',
                  'Props off for ground work when possible',
                  'Disarm before approaching',
                  'Verify disarmed before touching',
                  'Keep clear during startup sequence',
                  'Secure loose clothing and straps',
                  'Use prop guards where appropriate',
                  'Training on emergency disarm'
                ]
              },
              {
                type: 'heading',
                content: 'Safe Handling Practices'
              },
              {
                type: 'text',
                content: `**Pre-flight:**
- Arms during check only when needed
- Clear area before arming
- Announce arming to crew

**Manual operations:**
- Trained personnel only
- Defined approach paths
- Clear communication
- Positive grip before release`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Treat all propellers as if they could spin at any moment. Never assume disarmed status - verify it.'
              }
            ],
            keyPoints: [
              'Propellers can cause serious injuries even on small aircraft',
              'High-risk moments: pre-flight checks, manual launch/catch',
              'Never approach from prop plane, always verify disarmed',
              'Announce arming and clear area before powering up'
            ]
          }
        },
        {
          id: 'battery-handling-safety',
          questId: 'ground-personnel-safety',
          title: 'Battery Handling Safety',
          order: 3,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Lithium polymer (LiPo) batteries power most RPAS. They store significant energy and can cause fires or explosions if mishandled. Safe handling is essential.`
              },
              {
                type: 'heading',
                content: 'Battery Hazards'
              },
              {
                type: 'text',
                content: `**Fire/explosion risks:**
- Physical damage (puncture, crush)
- Overcharging
- Short circuit
- Manufacturing defects
- Extreme temperatures

**Warning signs:**
- Puffing/swelling
- Unusual heat
- Smoke or odor
- Visible damage`
              },
              {
                type: 'heading',
                content: 'Safe Handling Practices'
              },
              {
                type: 'list',
                items: [
                  'Inspect batteries before each use',
                  'Don\'t use damaged or swollen batteries',
                  'Store at appropriate charge level (40-60%)',
                  'Use fireproof storage bags/containers',
                  'Never leave charging unattended',
                  'Charge on non-flammable surface',
                  'Transport properly secured',
                  'Keep away from extreme temperatures'
                ]
              },
              {
                type: 'heading',
                content: 'Battery Fire Response'
              },
              {
                type: 'text',
                content: `**If fire occurs:**
1. Move battery to non-flammable area if safe
2. Evacuate area
3. Let battery burn out (safest if possible)
4. Use water or sand to control spread
5. Do NOT use CO2 extinguisher (ineffective)
6. Ventilate area (toxic fumes)
7. Do not approach until fully cooled`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'LiPo battery fires produce toxic fumes. Evacuate the area and don\'t breathe smoke. Let the fire burn out if it can be safely contained.'
              }
            ],
            keyPoints: [
              'LiPo batteries can fire or explode if damaged',
              'Inspect before use, don\'t use swollen batteries',
              'Store at 40-60% charge in fireproof containers',
              'Battery fires: evacuate, let burn out, ventilate'
            ]
          }
        },
        {
          id: 'vehicle-equipment-safety',
          questId: 'ground-personnel-safety',
          title: 'Vehicle & Equipment Safety',
          order: 4,
          xpReward: 20,
          estimatedMinutes: 10,
          content: {
            sections: [
              {
                type: 'text',
                content: `Vehicles and equipment at operation sites create additional hazards. Managing these hazards protects crew and ensures equipment availability.`
              },
              {
                type: 'heading',
                content: 'Vehicle Safety'
              },
              {
                type: 'text',
                content: `**Positioning:**
- Clear of flight operations
- Ready for emergency evacuation
- Keys accessible but secured
- Don\'t block access routes

**Operations:**
- No vehicle movement during flight operations
- Spotter for reversing
- Clear communication before moving
- Park on stable ground`
              },
              {
                type: 'heading',
                content: 'Equipment Staging'
              },
              {
                type: 'list',
                items: [
                  'Organize for workflow efficiency',
                  'Keep walkways clear',
                  'Secure items from wind',
                  'Shade electronics from direct sun',
                  'Keep batteries away from heat sources',
                  'Ground control station stable and accessible'
                ]
              },
              {
                type: 'heading',
                content: 'Load Security'
              },
              {
                type: 'text',
                content: `**Transport:**
- Secure all equipment for transit
- Protect fragile items
- Secure loose items (can become projectiles)
- Verify loads before departure

**On site:**
- Don\'t leave equipment where vehicles might move
- Keep clear of aircraft landing area
- Account for wind effects on light items`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Good staging organization improves efficiency and reduces accidents from clutter, trips, and lost items.'
              }
            ],
            keyPoints: [
              'Position vehicles clear of operations with keys accessible',
              'No vehicle movement during flight operations',
              'Organize equipment staging for safety and efficiency',
              'Secure all items from wind and potential movement'
            ]
          }
        }
      ],
      quiz: {
        id: 'ground-safety-quiz',
        questId: 'ground-personnel-safety',
        passingScore: 80,
        questions: [
          {
            id: 'gsq-1',
            type: 'multiple-choice',
            question: 'What is the primary duty of a Visual Observer?',
            options: [
              'Operating the camera',
              'Maintaining visual contact and scanning for hazards',
              'Managing public relations',
              'Repairing equipment'
            ],
            correctAnswer: 1,
            explanation: 'The VO\'s primary duty is maintaining visual contact with the aircraft and scanning for air traffic and hazards.'
          },
          {
            id: 'gsq-2',
            type: 'multiple-choice',
            question: 'What should you do before approaching an RPAS on the ground?',
            options: [
              'Just walk up carefully',
              'Verify it is disarmed',
              'Wait 5 minutes',
              'Approach from the front'
            ],
            correctAnswer: 1,
            explanation: 'Always verify the aircraft is disarmed before approaching. Never assume - verify.'
          },
          {
            id: 'gsq-3',
            type: 'multiple-choice',
            question: 'How should you respond to a LiPo battery fire?',
            options: [
              'Use a CO2 extinguisher immediately',
              'Evacuate, let it burn out if safely contained, ventilate',
              'Throw water on it immediately',
              'Cover it with a blanket'
            ],
            correctAnswer: 1,
            explanation: 'LiPo fires should be allowed to burn out if safely contained. CO2 is ineffective, and the fumes are toxic.'
          },
          {
            id: 'gsq-4',
            type: 'multiple-choice',
            question: 'At what charge level should LiPo batteries be stored?',
            options: ['100%', '0%', '40-60%', '80-90%'],
            correctAnswer: 2,
            explanation: 'LiPo batteries should be stored at 40-60% charge for safety and longevity.'
          },
          {
            id: 'gsq-5',
            type: 'multiple-choice',
            question: 'When should vehicle movement occur at an operation site?',
            options: [
              'Any time necessary',
              'Only when flight operations are paused',
              'Only with PIC approval',
              'Only in emergencies'
            ],
            correctAnswer: 1,
            explanation: 'Vehicle movement should not occur during flight operations to prevent accidents and distractions.'
          }
        ]
      }
    },

    // Quest 6: Incident Response
    {
      id: 'incident-response',
      trackId: 'field-safety-procedures',
      title: 'Incident Response',
      description: 'Learn to respond effectively to incidents and emergencies in the field.',
      order: 6,
      xpReward: 150,
      estimatedMinutes: 55,
      scenarioId: 'incident-occurs',
      lessons: [
        {
          id: 'incident-classification',
          questId: 'incident-response',
          title: 'Incident Classification',
          order: 1,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Understanding incident classification enables appropriate response and reporting. Different incident types have different implications and requirements.`
              },
              {
                type: 'heading',
                content: 'Incident vs Accident'
              },
              {
                type: 'text',
                content: `**Accident:**
- Results in injury requiring medical treatment
- Results in death
- Results in significant damage to aircraft or property

**Incident (Serious):**
- Near-miss with potential for serious harm
- Loss of control
- System failures affecting safety
- Airspace violations

**Incident (Minor):**
- Minor equipment issues
- Procedural deviations
- Events with low consequence potential`
              },
              {
                type: 'heading',
                content: 'Reportable Occurrences'
              },
              {
                type: 'list',
                items: [
                  'Collision with person or property',
                  'Injury to any person',
                  'Damage to aircraft affecting airworthiness',
                  'Loss of control resulting in flyaway',
                  'Near collision with manned aircraft',
                  'Airspace violation',
                  'Operation causing public safety concern'
                ]
              },
              {
                type: 'heading',
                content: 'Classification Factors'
              },
              {
                type: 'text',
                content: `**Consider:**
- Actual outcome (injury, damage)
- Potential outcome (what could have happened)
- Regulatory implications
- Insurance/liability factors
- Organizational learning value

When in doubt, classify conservatively (higher).`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Reporting thresholds vary by jurisdiction. Know your organization\'s reporting requirements and Transport Canada requirements.'
              }
            ],
            keyPoints: [
              'Accidents involve injury or significant damage',
              'Incidents range from serious to minor',
              'Know reportable occurrence criteria',
              'When in doubt, classify conservatively'
            ]
          }
        },
        {
          id: 'immediate-response-actions',
          questId: 'incident-response',
          title: 'Immediate Response Actions',
          order: 2,
          xpReward: 30,
          estimatedMinutes: 15,
          content: {
            sections: [
              {
                type: 'text',
                content: `The immediate response to an incident focuses on safety and stabilization. Actions in the first minutes can prevent additional harm and preserve important information.`
              },
              {
                type: 'heading',
                content: 'Priority Sequence'
              },
              {
                type: 'text',
                content: `**1. Protect People**
- Check for injuries
- Move people from hazards
- Provide first aid if trained
- Call emergency services if needed

**2. Secure the Scene**
- Power down aircraft
- Eliminate ongoing hazards (fire, electrical)
- Establish safety perimeter
- Prevent further damage

**3. Account for Personnel**
- Head count
- Confirm no one missing
- Check on any bystanders involved`
              },
              {
                type: 'heading',
                content: 'Immediate Actions Checklist'
              },
              {
                type: 'list',
                items: [
                  'Stop all flight operations',
                  'Assess and treat injuries',
                  'Call emergency services (if needed)',
                  'Power down aircraft',
                  'Establish perimeter',
                  'Account for all personnel',
                  'Notify operations manager/company',
                  'Begin documentation'
                ]
              },
              {
                type: 'heading',
                content: 'Communication'
              },
              {
                type: 'text',
                content: `**Emergency services:** Be clear about location, nature of incident, injuries

**Company notification:** Initial brief information, more detail to follow

**Witnesses/public:** Limited information, offer contact details for follow-up

**Avoid:** Speculation, blame assignment, detailed technical discussion`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'In the immediate aftermath, focus on safety and stabilization. Investigation and detailed documentation come after the situation is secure.'
              }
            ],
            keyPoints: [
              'Priority: protect people, secure scene, account for personnel',
              'Call emergency services immediately if serious injuries',
              'Power down aircraft and establish perimeter',
              'Begin documentation but focus on safety first'
            ]
          }
        },
        {
          id: 'scene-preservation',
          questId: 'incident-response',
          title: 'Scene Preservation',
          order: 3,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Preserving the incident scene provides crucial evidence for investigation. Good scene preservation can determine the cause and prevent recurrence.`
              },
              {
                type: 'heading',
                content: 'What to Preserve'
              },
              {
                type: 'text',
                content: `**Aircraft and components:**
- Don\'t move unless necessary for safety
- Note position before any movement
- Preserve all pieces including debris

**Electronic data:**
- Flight logs (do not erase or overwrite)
- Memory cards
- Telemetry data
- Controller settings/state

**Environmental evidence:**
- Weather conditions
- Lighting conditions
- Ground markings
- Witness statements`
              },
              {
                type: 'heading',
                content: 'Documentation Methods'
              },
              {
                type: 'list',
                items: [
                  'Photographs from multiple angles',
                  'Wide shots showing context',
                  'Close-ups of damage',
                  'Scale reference in photos',
                  'GPS coordinates of key locations',
                  'Time-stamped notes',
                  'Voice recordings of observations'
                ]
              },
              {
                type: 'heading',
                content: 'Scene Security'
              },
              {
                type: 'text',
                content: `**Establish perimeter:**
- Keep uninvolved persons out
- Designate who can enter
- Document who entered and when

**Chain of custody:**
- Note who handles evidence
- Secure removable items
- Document any changes to scene

**Duration:**
- Maintain until investigation complete
- May need authorization to release scene`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Photograph and document BEFORE moving anything. Even small movements can lose important evidence.'
              }
            ],
            keyPoints: [
              'Don\'t move anything unless necessary for safety',
              'Preserve electronic data - don\'t erase or overwrite',
              'Photograph from multiple angles with context',
              'Establish perimeter and document access'
            ]
          }
        },
        {
          id: 'reporting-requirements',
          questId: 'incident-response',
          title: 'Reporting Requirements',
          order: 4,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Incident reporting fulfills regulatory requirements and enables organizational learning. Understanding requirements ensures compliance and maximizes learning value.`
              },
              {
                type: 'heading',
                content: 'Regulatory Reporting'
              },
              {
                type: 'text',
                content: `**Transport Canada (TSB):**
Reportable RPAS occurrences include:
- Collision causing injury or significant damage
- Loss of control/fly away
- Near collision with manned aircraft
- Airspace violation with safety impact

**Reporting timeline:**
- Immediate notification for serious accidents
- Written report within specified timeframe
- Preserve evidence pending investigation`
              },
              {
                type: 'heading',
                content: 'Organizational Reporting'
              },
              {
                type: 'list',
                items: [
                  'Immediate notification to management',
                  'Incident report form completion',
                  'Investigation participation',
                  'Corrective action tracking',
                  'Insurance notification if applicable'
                ]
              },
              {
                type: 'heading',
                content: 'Report Content'
              },
              {
                type: 'text',
                content: `**Essential information:**
- Date, time, location
- Personnel involved
- Equipment involved
- Sequence of events (factual)
- Immediate actions taken
- Injuries and damage
- Witness information
- Supporting documentation

**Avoid in initial reports:**
- Speculation about cause
- Blame assignment
- Conclusions before investigation`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Report factually. Speculation and blame assignment in reports can create problems. Investigation determines cause.'
              }
            ],
            keyPoints: [
              'Know regulatory reporting thresholds and timelines',
              'Notify organization immediately after safety is secured',
              'Report factually - avoid speculation and blame',
              'Include all essential information and documentation'
            ]
          }
        }
      ],
      quiz: {
        id: 'incident-response-quiz',
        questId: 'incident-response',
        passingScore: 80,
        questions: [
          {
            id: 'irq-1',
            type: 'multiple-choice',
            question: 'What distinguishes an accident from an incident?',
            options: [
              'Accidents are reported, incidents are not',
              'Accidents involve injury or significant damage',
              'Incidents are more serious',
              'There is no difference'
            ],
            correctAnswer: 1,
            explanation: 'Accidents involve injury requiring medical treatment, death, or significant damage. Incidents are events without this level of consequence.'
          },
          {
            id: 'irq-2',
            type: 'multiple-choice',
            question: 'What is the FIRST priority after an incident?',
            options: [
              'Document everything',
              'Call company management',
              'Protect people (check injuries, move from hazards)',
              'Secure the aircraft'
            ],
            correctAnswer: 2,
            explanation: 'Protecting people is always the first priority - check for injuries and move people from ongoing hazards.'
          },
          {
            id: 'irq-3',
            type: 'multiple-choice',
            question: 'When should you photograph the scene?',
            options: [
              'After moving damaged items',
              'Before moving anything if possible',
              'Only if injuries occurred',
              'After investigation is complete'
            ],
            correctAnswer: 1,
            explanation: 'Photograph and document before moving anything - even small movements can lose important evidence.'
          },
          {
            id: 'irq-4',
            type: 'multiple-choice',
            question: 'What should be avoided in incident reports?',
            options: [
              'Factual description of events',
              'Time and location',
              'Speculation about cause',
              'Names of personnel involved'
            ],
            correctAnswer: 2,
            explanation: 'Reports should be factual. Speculation about cause should be avoided - investigation determines cause.'
          },
          {
            id: 'irq-5',
            type: 'multiple-choice',
            question: 'What electronic evidence should be preserved?',
            options: [
              'Only video footage',
              'Flight logs, memory cards, telemetry data',
              'Only the controller',
              'Nothing - it\'s automatically saved'
            ],
            correctAnswer: 1,
            explanation: 'All electronic data should be preserved: flight logs, memory cards, telemetry data, and controller state.'
          }
        ]
      }
    },

    // Quest 7: Emergency Procedures
    {
      id: 'emergency-procedures-field',
      trackId: 'field-safety-procedures',
      title: 'Emergency Procedures',
      description: 'Prepare for and respond to emergencies during field operations.',
      order: 7,
      xpReward: 125,
      estimatedMinutes: 50,
      lessons: [
        {
          id: 'first-aid-fundamentals',
          questId: 'emergency-procedures-field',
          title: 'First Aid Fundamentals',
          order: 1,
          xpReward: 30,
          estimatedMinutes: 15,
          content: {
            sections: [
              {
                type: 'text',
                content: `Basic first aid capability is essential for field operations. Understanding when and how to provide initial care can prevent minor injuries from becoming serious.`
              },
              {
                type: 'heading',
                content: 'First Aid Priorities'
              },
              {
                type: 'text',
                content: `**Scene Safety:**
Before providing care:
- Ensure scene is safe
- Don\'t become another casualty
- Remove hazards or remove victim from hazards

**Assessment:**
- Check responsiveness
- Check breathing
- Look for obvious injuries
- Determine need for emergency services`
              },
              {
                type: 'heading',
                content: 'Common RPAS-Related Injuries'
              },
              {
                type: 'list',
                items: [
                  'Lacerations from propellers (control bleeding, clean wound)',
                  'Burns from batteries or motors (cool with water, cover)',
                  'Eye injuries (do not rub, flush if chemical, cover)',
                  'Heat-related illness (move to shade, hydrate, cool)',
                  'Cold injuries (warm gradually, protect from further cold)',
                  'Trips and falls (assess for fractures, spine injury)'
                ]
              },
              {
                type: 'heading',
                content: 'First Aid Kit Requirements'
              },
              {
                type: 'text',
                content: `**Minimum kit should include:**
- Bandages and dressings (various sizes)
- Adhesive tape
- Antiseptic wipes
- Gloves
- Scissors
- Tweezers
- Cold pack
- Eye wash
- Emergency blanket

**Consider adding:**
- Burn dressings
- Splinting materials
- CPR mask
- First aid manual`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'First aid training should be current. Consider WorkSafeBC Occupational First Aid Level 1 or equivalent certification.'
              }
            ],
            keyPoints: [
              'Ensure scene safety before providing care',
              'Common injuries: lacerations, burns, eye injuries, environmental',
              'Maintain properly stocked first aid kit',
              'Consider formal first aid certification'
            ]
          }
        },
        {
          id: 'emergency-evacuation',
          questId: 'emergency-procedures-field',
          title: 'Emergency Evacuation',
          order: 2,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Emergency evacuation may be needed for medical emergencies, fire, severe weather, or other threatening conditions. Planning and briefing evacuation procedures ensures rapid, safe response.`
              },
              {
                type: 'heading',
                content: 'Evacuation Planning'
              },
              {
                type: 'text',
                content: `**Before operations, identify:**
- Primary evacuation route
- Alternate evacuation route
- Muster point location
- Transport capability (vehicles)
- Special needs of crew members
- Equipment to secure/abandon

**Brief during safety briefing:**
- Signal to evacuate
- Direction of evacuation
- Muster point
- Head count procedure`
              },
              {
                type: 'heading',
                content: 'Evacuation Triggers'
              },
              {
                type: 'list',
                items: [
                  'Medical emergency requiring transport',
                  'Fire (approaching or on-site)',
                  'Severe weather (lightning, storm)',
                  'Security threat',
                  'Hazardous material release',
                  'Structural collapse threat'
                ]
              },
              {
                type: 'heading',
                content: 'Evacuation Process'
              },
              {
                type: 'text',
                content: `**1. Decision and Signal**
- Clear signal recognized by all
- Verbal and/or horn/whistle

**2. Immediate Actions**
- Cease flight operations
- Secure aircraft if time permits
- Leave equipment if necessary

**3. Movement**
- Move to muster point via designated route
- Assist others as able
- Don\'t re-enter hazard area

**4. Accountability**
- Head count at muster
- Report missing persons
- Coordinate with emergency services`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Equipment can be replaced; people cannot. Never delay evacuation for equipment.'
              }
            ],
            keyPoints: [
              'Plan evacuation routes and muster points before operations',
              'Brief evacuation procedures during safety briefing',
              'Clear signal and immediate response',
              'Head count at muster - don\'t re-enter hazard area'
            ]
          }
        },
        {
          id: 'emergency-services-communication',
          questId: 'emergency-procedures-field',
          title: 'Emergency Services Communication',
          order: 3,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Effective communication with emergency services ensures rapid, appropriate response. Clear, complete information saves critical time.`
              },
              {
                type: 'heading',
                content: 'Information to Provide'
              },
              {
                type: 'text',
                content: `**Essential information:**
- Location (address, GPS coordinates, landmarks)
- Nature of emergency
- Number of people involved/injured
- Type of injuries
- Hazards present (fire, chemicals, etc.)
- Access information

**Be prepared to:**
- Stay on line
- Answer questions
- Send someone to guide responders`
              },
              {
                type: 'heading',
                content: 'Location Communication'
              },
              {
                type: 'list',
                items: [
                  'GPS coordinates (most precise)',
                  'Physical address if available',
                  'Nearest intersection',
                  'Landmark description',
                  'Distance and direction from known point',
                  'Access route description'
                ]
              },
              {
                type: 'heading',
                content: 'Coordination with Responders'
              },
              {
                type: 'text',
                content: `**Before arrival:**
- Ensure route is clear
- Position guide at access point
- Keep line clear for callback

**On arrival:**
- Designate point of contact
- Provide update on situation
- Identify all casualties
- Share any hazard information
- Follow responder instructions`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Practice giving location information. In an emergency, stress can make it difficult to communicate clearly.'
              }
            ],
            keyPoints: [
              'Provide clear location (GPS coordinates preferred)',
              'Describe nature of emergency and number injured',
              'Send guide to access point',
              'Follow responder instructions on arrival'
            ]
          }
        },
        {
          id: 'post-emergency-actions',
          questId: 'emergency-procedures-field',
          title: 'Post-Emergency Actions',
          order: 4,
          xpReward: 20,
          estimatedMinutes: 10,
          content: {
            sections: [
              {
                type: 'text',
                content: `After an emergency is resolved, several actions ensure proper documentation, support for those affected, and organizational learning.`
              },
              {
                type: 'heading',
                content: 'Immediate Post-Emergency'
              },
              {
                type: 'text',
                content: `**Personnel support:**
- Check on welfare of all crew
- Provide information about support resources
- Allow rest/recovery time
- Debrief when appropriate

**Documentation:**
- Record events while fresh
- Gather witness statements
- Photograph scene (if not done)
- Preserve equipment and data`
              },
              {
                type: 'heading',
                content: 'Organizational Notification'
              },
              {
                type: 'list',
                items: [
                  'Immediate notification to management',
                  'Insurance notification if applicable',
                  'Regulatory reporting as required',
                  'Client notification if appropriate',
                  'Worker\'s compensation if injuries'
                ]
              },
              {
                type: 'heading',
                content: 'Recovery and Learning'
              },
              {
                type: 'text',
                content: `**Investigation:**
- Determine root cause
- Identify contributing factors
- Develop corrective actions
- Implement improvements

**Team support:**
- Critical incident stress may affect crew
- Offer support resources
- Allow processing time
- Follow up on wellbeing`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Post-emergency is not the time to assign blame. Focus on support, documentation, and learning.'
              }
            ],
            keyPoints: [
              'Check on welfare of all personnel',
              'Document while events are fresh',
              'Complete required notifications',
              'Learn from incident to prevent recurrence'
            ]
          }
        }
      ],
      quiz: {
        id: 'emergency-procedures-quiz',
        questId: 'emergency-procedures-field',
        passingScore: 80,
        questions: [
          {
            id: 'epq-1',
            type: 'multiple-choice',
            question: 'What should you do FIRST before providing first aid?',
            options: [
              'Put on gloves',
              'Assess the injury',
              'Ensure the scene is safe',
              'Call for help'
            ],
            correctAnswer: 2,
            explanation: 'Scene safety is first - ensure you won\'t become another casualty before providing care.'
          },
          {
            id: 'epq-2',
            type: 'multiple-choice',
            question: 'During evacuation, should you delay to secure equipment?',
            options: [
              'Yes, always secure valuable equipment',
              'Only if time clearly permits',
              'Yes, insurance requires it',
              'Only for aircraft over $10,000'
            ],
            correctAnswer: 1,
            explanation: 'Equipment can be replaced; people cannot. Only secure equipment if time clearly permits without risk.'
          },
          {
            id: 'epq-3',
            type: 'multiple-choice',
            question: 'What is the most precise way to communicate location to emergency services?',
            options: [
              'Street address',
              'Nearest landmark',
              'GPS coordinates',
              'Verbal description'
            ],
            correctAnswer: 2,
            explanation: 'GPS coordinates are the most precise and work even in areas without street addresses.'
          },
          {
            id: 'epq-4',
            type: 'multiple-choice',
            question: 'What should be avoided in the immediate post-emergency period?',
            options: [
              'Documenting events',
              'Checking on personnel',
              'Assigning blame',
              'Notifying management'
            ],
            correctAnswer: 2,
            explanation: 'Post-emergency is not the time to assign blame. Focus on support, documentation, and learning.'
          },
          {
            id: 'epq-5',
            type: 'multiple-choice',
            question: 'When should witness statements be gathered?',
            options: [
              'Days later when everyone has calmed down',
              'While events are fresh',
              'Only if there are injuries',
              'Only if litigation is expected'
            ],
            correctAnswer: 1,
            explanation: 'Witness statements should be gathered while events are fresh, before memories fade or are influenced.'
          }
        ]
      }
    }
  ]
}

export default fieldSafetyTrack
