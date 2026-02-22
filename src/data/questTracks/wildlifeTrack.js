/**
 * Wildlife & Environmental Safety Quest Track
 *
 * Training on wildlife regulations, disturbance minimization,
 * habitat sensitivity, and environmental best practices.
 *
 * @version 1.0.0
 */

const wildlifeTrack = {
  id: 'wildlife-environmental-safety',
  slug: 'wildlife',
  title: 'Wildlife & Environmental Safety',
  description: 'Learn to conduct RPAS operations with minimal impact on wildlife and the environment while meeting regulatory requirements.',
  category: 'specialized',
  icon: 'Bird',
  color: 'green',
  difficulty: 'intermediate',
  estimatedHours: 4,
  totalXp: 700,
  prerequisites: [],
  badge: {
    id: 'wildlife-guardian',
    name: 'Wildlife Guardian',
    description: 'Demonstrated commitment to wildlife protection and environmental stewardship',
    rarity: 'rare',
    xpBonus: 150,
    icon: 'Leaf'
  },
  quests: [
    // Quest 1: Environmental Regulations
    {
      id: 'environmental-regulations',
      trackId: 'wildlife-environmental-safety',
      title: 'Environmental Regulations',
      description: 'Understand the regulatory framework protecting wildlife and the environment.',
      order: 1,
      xpReward: 100,
      estimatedMinutes: 45,
      lessons: [
        {
          id: 'bc-wildlife-act',
          questId: 'environmental-regulations',
          title: 'BC Wildlife Act Overview',
          order: 1,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `The BC Wildlife Act is the primary provincial legislation governing wildlife protection in British Columbia. RPAS operators must understand how this Act applies to their operations.`
              },
              {
                type: 'heading',
                content: 'Key Provisions'
              },
              {
                type: 'text',
                content: `**Harassment Prohibition:**
Section 9 prohibits harassing wildlife without authorization. "Harass" includes:
- Worrying, tiring, or annoying wildlife
- Repeatedly disturbing wildlife
- Causing wildlife to flee
- Interfering with normal behavior

**RPAS-Specific Considerations:**
- Noise from aircraft may constitute harassment
- Visual disturbance from close approach
- Repeated flights over wildlife areas
- Disrupting feeding, nesting, or migration`
              },
              {
                type: 'heading',
                content: 'Protected Species'
              },
              {
                type: 'list',
                items: [
                  'All wildlife species native to BC',
                  'Birds, mammals, reptiles, amphibians',
                  'Nests and eggs (particularly important)',
                  'Dens and other habitats',
                  'Wildlife in wildlife management areas'
                ]
              },
              {
                type: 'heading',
                content: 'Penalties'
              },
              {
                type: 'text',
                content: `Violations can result in:
- Fines up to $100,000
- Imprisonment up to 2 years
- Equipment seizure
- Loss of hunting/fishing licenses
- Civil liability for damages`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Claiming ignorance of wildlife presence is not a defense. Operators have a duty to assess wildlife risk before operations.'
              }
            ],
            keyPoints: [
              'BC Wildlife Act prohibits harassing wildlife',
              'RPAS operations can constitute harassment through disturbance',
              'All native wildlife species are protected',
              'Penalties are significant including fines and imprisonment'
            ]
          }
        },
        {
          id: 'species-at-risk',
          questId: 'environmental-regulations',
          title: 'Species at Risk Act (SARA)',
          order: 2,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `The federal Species at Risk Act (SARA) provides additional protection for species listed as endangered, threatened, or of special concern. These protections layer on top of provincial regulations.`
              },
              {
                type: 'heading',
                content: 'SARA Prohibitions'
              },
              {
                type: 'text',
                content: `For listed species, SARA prohibits:
- Killing or harming individuals
- Harassing individuals
- Possessing, collecting, or taking individuals
- Damaging or destroying residences
- Destroying critical habitat

**"Residence" includes:**
- Nests
- Dens
- Burrows
- Other dwelling places`
              },
              {
                type: 'heading',
                content: 'BC Species of Concern'
              },
              {
                type: 'text',
                content: `Species you may encounter that have special protections:

**Birds:**
- Marbled Murrelet (Endangered)
- Western Screech-Owl (Special Concern)
- Great Blue Heron (Special Concern)
- Barn Owl (Threatened)

**Mammals:**
- Southern Resident Killer Whale (Endangered)
- Woodland Caribou (Endangered)
- Vancouver Island Marmot (Endangered)

**Others:**
- Northern Leopard Frog (Endangered)
- Various bat species (many listed)`
              },
              {
                type: 'heading',
                content: 'Operator Responsibilities'
              },
              {
                type: 'list',
                items: [
                  'Research listed species in your operating area',
                  'Identify critical habitat before operations',
                  'Implement appropriate setback distances',
                  'Cease operations if listed species observed',
                  'Report observations to appropriate authorities'
                ]
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'SARA applies on federal lands and to aquatic species and migratory birds everywhere. Check the Species at Risk Registry for current listings.'
              }
            ],
            keyPoints: [
              'SARA provides additional protection for listed species',
              'Protections include residences and critical habitat',
              'Several BC species are endangered or threatened',
              'Operators must research species in their operating areas'
            ]
          }
        },
        {
          id: 'environmental-management-act',
          questId: 'environmental-regulations',
          title: 'Environmental Management Act',
          order: 3,
          xpReward: 25,
          estimatedMinutes: 10,
          content: {
            sections: [
              {
                type: 'text',
                content: `The Environmental Management Act (EMA) governs pollution and waste management in BC. While not directly regulating RPAS, it has implications for operational practices.`
              },
              {
                type: 'heading',
                content: 'Relevance to RPAS Operations'
              },
              {
                type: 'text',
                content: `**Spill Prevention:**
- Fuel (gas-powered aircraft)
- Battery chemicals
- Lubricants and fluids

**Waste Management:**
- Damaged batteries
- Broken components
- Packaging waste

**Contaminated Sites:**
- Operations on contaminated sites require care
- May disturb contaminated soils
- Documentation requirements may apply`
              },
              {
                type: 'heading',
                content: 'Best Practices'
              },
              {
                type: 'list',
                items: [
                  'Use drip trays when refueling',
                  'Carry spill response materials',
                  'Properly dispose of damaged batteries',
                  'Remove all waste from operation sites',
                  'Report any spills as required',
                  'Document environmental incidents'
                ]
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Leave no trace principles apply to professional operations. The site should be as clean when you leave as when you arrived - or cleaner.'
              }
            ],
            keyPoints: [
              'EMA governs pollution and waste management',
              'Prevent spills of fuel, batteries, and fluids',
              'Properly dispose of waste including damaged batteries',
              'Leave no trace at operation sites'
            ]
          }
        },
        {
          id: 'permit-requirements',
          questId: 'environmental-regulations',
          title: 'Permit Requirements',
          order: 4,
          xpReward: 20,
          estimatedMinutes: 10,
          content: {
            sections: [
              {
                type: 'text',
                content: `Some RPAS operations near wildlife or in sensitive areas require permits. Understanding when permits are needed prevents violations.`
              },
              {
                type: 'heading',
                content: 'When Permits May Be Required'
              },
              {
                type: 'text',
                content: `**Wildlife Areas:**
- Wildlife Management Areas
- Provincial parks and protected areas
- Ecological reserves
- Migratory bird sanctuaries

**Specific Activities:**
- Research involving wildlife
- Operations targeting specific species
- Activities in critical habitat
- Seasonal closures`
              },
              {
                type: 'heading',
                content: 'Common Permit Types'
              },
              {
                type: 'list',
                items: [
                  'Park Use Permit (BC Parks)',
                  'Wildlife Permit (FLNRORD)',
                  'Migratory Bird Permit (Environment Canada)',
                  'SARA Permit for critical habitat work',
                  'Research permits from universities/institutions'
                ]
              },
              {
                type: 'heading',
                content: 'Permit Application Process'
              },
              {
                type: 'text',
                content: `**General steps:**
1. Identify what permits are needed
2. Contact appropriate authority
3. Submit application with operation details
4. Address any conditions or requirements
5. Receive permit before operations
6. Comply with permit conditions
7. Report as required by permit

**Lead times vary:** Apply well in advance - some permits take weeks.`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Operating without required permits can result in penalties and invalidate your other authorizations. Always verify permit requirements.'
              }
            ],
            keyPoints: [
              'Protected areas often require permits for RPAS operations',
              'Research and wildlife-focused work may need special permits',
              'Multiple agencies may have jurisdiction',
              'Apply well in advance - processing takes time'
            ]
          }
        }
      ],
      quiz: {
        id: 'environmental-regulations-quiz',
        questId: 'environmental-regulations',
        passingScore: 80,
        questions: [
          {
            id: 'erq-1',
            type: 'multiple-choice',
            question: 'Under the BC Wildlife Act, "harass" includes:',
            options: [
              'Only physical contact with wildlife',
              'Worrying, tiring, or annoying wildlife',
              'Only activities that cause injury',
              'Feeding wildlife'
            ],
            correctAnswer: 1,
            explanation: 'Harass includes worrying, tiring, annoying, or repeatedly disturbing wildlife - even without physical contact.'
          },
          {
            id: 'erq-2',
            type: 'multiple-choice',
            question: 'What does SARA protect in addition to listed species themselves?',
            options: [
              'Only the animals, not their habitat',
              'Residences and critical habitat',
              'Only migratory species',
              'Only mammals'
            ],
            correctAnswer: 1,
            explanation: 'SARA protects listed species plus their residences (nests, dens) and critical habitat.'
          },
          {
            id: 'erq-3',
            type: 'multiple-choice',
            question: 'Which species is listed as Endangered in BC?',
            options: [
              'Great Blue Heron',
              'Western Screech-Owl',
              'Southern Resident Killer Whale',
              'Common Raven'
            ],
            correctAnswer: 2,
            explanation: 'Southern Resident Killer Whales are listed as Endangered. Great Blue Heron and Western Screech-Owl are Special Concern.'
          },
          {
            id: 'erq-4',
            type: 'multiple-choice',
            question: 'What should you do with damaged LiPo batteries?',
            options: [
              'Leave them at the site',
              'Throw them in regular garbage',
              'Properly dispose of them as hazardous waste',
              'Bury them'
            ],
            correctAnswer: 2,
            explanation: 'Damaged batteries contain hazardous materials and must be properly disposed of, not put in regular garbage.'
          },
          {
            id: 'erq-5',
            type: 'multiple-choice',
            question: 'When should you apply for wildlife area permits?',
            options: [
              'The day before operations',
              'Well in advance - processing takes time',
              'After operations are complete',
              'Permits are never required'
            ],
            correctAnswer: 1,
            explanation: 'Permits should be applied for well in advance as processing can take weeks.'
          }
        ]
      }
    },

    // Quest 2: Wildlife Disturbance
    {
      id: 'wildlife-disturbance',
      trackId: 'wildlife-environmental-safety',
      title: 'Wildlife Disturbance',
      description: 'Understand disturbance thresholds and minimize impact on wildlife.',
      order: 2,
      xpReward: 125,
      estimatedMinutes: 55,
      scenarioId: 'wildlife-encounter-scenario',
      lessons: [
        {
          id: 'disturbance-thresholds',
          questId: 'wildlife-disturbance',
          title: 'Disturbance Thresholds by Species',
          order: 1,
          xpReward: 30,
          estimatedMinutes: 15,
          content: {
            sections: [
              {
                type: 'text',
                content: `Different species have different sensitivities to RPAS disturbance. Understanding these thresholds enables appropriate operating distances and procedures.`
              },
              {
                type: 'heading',
                content: 'Factors Affecting Sensitivity'
              },
              {
                type: 'text',
                content: `**Species characteristics:**
- Size and mobility
- Predator avoidance behavior
- Habituation to humans
- Sensory capabilities (hearing, vision)

**Life stage:**
- Nesting/breeding (most sensitive)
- Rearing young
- Feeding
- Migration

**Environmental context:**
- Escape routes available
- Shelter proximity
- Group size
- Prior exposure to aircraft`
              },
              {
                type: 'heading',
                content: 'General Distance Guidelines'
              },
              {
                type: 'text',
                content: `**Marine Mammals:** Minimum 100-200m
- Killer whales: 200m+
- Seals, sea lions: 100m
- Greater distances during breeding

**Raptors:** Minimum 100-500m
- Eagles: 200-500m depending on species
- Increased during nesting
- Avoid nest approaches

**Waterfowl:** Minimum 100m
- Greater during nesting
- Avoid causing flush (flying away)

**Large mammals:** Minimum 100m
- Bears: 100m+ (more if with cubs)
- Caribou: 300m+ (very sensitive)
- Moose, deer: 100m`
              },
              {
                type: 'heading',
                content: 'Disturbance Indicators'
              },
              {
                type: 'list',
                items: [
                  'Alert posture (head up, ears forward)',
                  'Movement away from aircraft',
                  'Alarm calls',
                  'Flushing (taking flight)',
                  'Defensive behavior',
                  'Abandonment of activity (feeding, nesting)'
                ]
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'If you observe disturbance indicators, you\'re already too close. Immediately increase distance.'
              }
            ],
            keyPoints: [
              'Disturbance thresholds vary by species and life stage',
              'Nesting and breeding periods are most sensitive',
              'Marine mammals: 100-200m, raptors: 100-500m',
              'Watch for disturbance indicators and respond immediately'
            ]
          }
        },
        {
          id: 'nesting-season-protocols',
          questId: 'wildlife-disturbance',
          title: 'Nesting Season Protocols',
          order: 2,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Nesting season is the most sensitive period for bird species. Special protocols are essential to prevent nest abandonment and reproductive failure.`
              },
              {
                type: 'heading',
                content: 'Nesting Season Timing'
              },
              {
                type: 'text',
                content: `**General nesting periods (BC):**
- Early nesters (eagles, owls): February-July
- Songbirds: April-August
- Waterfowl: March-August
- Shorebirds: May-July

**Note:** Timing varies by region and elevation. Coastal areas may nest earlier than interior.`
              },
              {
                type: 'heading',
                content: 'Nesting Area Procedures'
              },
              {
                type: 'list',
                items: [
                  'Research known nesting sites before operations',
                  'Survey area for nesting activity before flights',
                  'Establish buffers around active nests (200m+ for raptors)',
                  'Avoid repeated passes over nesting areas',
                  'Do not approach nests directly',
                  'Minimize time in nesting areas',
                  'Cease operations if disturbance observed'
                ]
              },
              {
                type: 'heading',
                content: 'Nest Response Behavior'
              },
              {
                type: 'text',
                content: `**If you discover an active nest:**
1. Do not approach closer
2. Note location and species if possible
3. Route away from the nest
4. Document in flight records
5. Report significant nesting sites

**If parent bird leaves nest due to your presence:**
- You've caused disturbance
- Move away immediately
- Monitor from distance to ensure return
- Document the incident`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Nest abandonment can mean reproductive failure for that year. A few minutes of disturbance can have season-long consequences.'
              }
            ],
            keyPoints: [
              'Nesting season varies by species but generally spring-summer',
              'Research known nesting sites before operations',
              'Establish 200m+ buffers around raptor nests',
              'Cease operations immediately if disturbance observed'
            ]
          }
        },
        {
          id: 'marine-mammal-approaches',
          questId: 'wildlife-disturbance',
          title: 'Marine Mammal Approach Distances',
          order: 3,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Marine mammals are protected under both federal and provincial regulations. RPAS approaches are subject to strict distance requirements.`
              },
              {
                type: 'heading',
                content: 'Regulated Approach Distances'
              },
              {
                type: 'text',
                content: `**Killer Whales (Orca):**
- Southern Residents: 400m minimum
- Other orcas: 200m minimum
- Special restrictions in critical habitat

**Other Cetaceans (whales, dolphins):**
- General: 100m minimum
- During feeding: 200m+
- With calves: 200m+

**Pinnipeds (seals, sea lions):**
- At sea: 100m minimum
- Haul-outs: 100m minimum
- Pupping areas: 200m+`
              },
              {
                type: 'heading',
                content: 'Marine Operations Best Practices'
              },
              {
                type: 'list',
                items: [
                  'Approach areas parallel, not directly toward animals',
                  'Maintain altitude to reduce noise impact',
                  'Avoid hovering over marine mammals',
                  'Do not follow or pursue animals',
                  'Watch for surfacing in your flight path',
                  'Cease operations if animals approach you'
                ]
              },
              {
                type: 'heading',
                content: 'Special Considerations'
              },
              {
                type: 'text',
                content: `**Southern Resident Killer Whales:**
- Critically endangered population
- Special protection zones
- Enhanced monitoring requirements
- Report all sightings

**Haul-outs and breeding areas:**
- Particularly sensitive
- May have seasonal closures
- Consult with wildlife agencies`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Marine mammal harassment is a federal offense. Fines can reach $500,000 and include imprisonment.'
              }
            ],
            keyPoints: [
              'Southern Resident Orcas: 400m minimum',
              'Other cetaceans: 100-200m depending on activity',
              'Pinnipeds: 100-200m depending on location',
              'Marine mammal harassment is a serious federal offense'
            ]
          }
        },
        {
          id: 'bird-strike-prevention',
          questId: 'wildlife-disturbance',
          title: 'Bird Strike Prevention',
          order: 4,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Bird strikes pose risks to both the aircraft and the birds. Prevention strategies protect wildlife while maintaining aircraft safety.`
              },
              {
                type: 'heading',
                content: 'Bird Strike Risk Factors'
              },
              {
                type: 'text',
                content: `**High-risk conditions:**
- Near water bodies (waterfowl concentration)
- Agricultural areas (feeding flocks)
- Dawn and dusk (active periods)
- Migration seasons
- Nesting areas (territorial birds)
- Near food sources (garbage, fishing areas)

**High-risk species:**
- Large birds (eagles, herons, geese)
- Flocking birds (starlings, blackbirds)
- Territorial raptors
- Corvids (crows, ravens - curious)`
              },
              {
                type: 'heading',
                content: 'Prevention Strategies'
              },
              {
                type: 'list',
                items: [
                  'Survey area for bird activity before flight',
                  'Avoid areas of concentrated bird activity',
                  'Maintain altitude separation when possible',
                  'Monitor bird behavior during flight',
                  'Descend or reposition if birds approach',
                  'Consider timing operations to avoid peak activity',
                  'VO assigned to watch for bird approaches'
                ]
              },
              {
                type: 'heading',
                content: 'Response to Bird Approach'
              },
              {
                type: 'text',
                content: `**If birds approach your aircraft:**
1. Assess trajectory - will they intersect?
2. Change altitude (usually climb)
3. Change direction if needed
4. Hover/stop forward progress if safe
5. Land if attacks continue

**Territorial birds:**
- May repeatedly attack perceived threat
- Usually stop at boundary of territory
- Leave the area if attacks persist`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Birds often perceive RPAS as predators. Understanding this explains territorial attacks and avoidance behavior.'
              }
            ],
            keyPoints: [
              'Identify high-risk areas and conditions before flight',
              'Survey for bird activity and avoid concentrations',
              'VO should monitor for bird approaches',
              'Change altitude or direction if birds approach'
            ]
          }
        },
        {
          id: 'documentation-requirements',
          questId: 'wildlife-disturbance',
          title: 'Documentation Requirements',
          order: 5,
          xpReward: 20,
          estimatedMinutes: 10,
          content: {
            sections: [
              {
                type: 'text',
                content: `Proper documentation of wildlife observations and interactions demonstrates responsible operations and supports regulatory compliance.`
              },
              {
                type: 'heading',
                content: 'What to Document'
              },
              {
                type: 'text',
                content: `**Wildlife observations:**
- Species identified
- Number of individuals
- Location (GPS if possible)
- Behavior observed
- Response to aircraft (if any)

**Disturbance incidents:**
- Species involved
- Distance when disturbance occurred
- Type of response
- Actions taken
- Outcome

**Significant species:**
- Any listed species observations
- Active nests discovered
- Haul-outs or congregation areas`
              },
              {
                type: 'heading',
                content: 'Documentation Best Practices'
              },
              {
                type: 'list',
                items: [
                  'Record observations in flight log',
                  'Use standardized wildlife observation form',
                  'Include photos if possible (without causing additional disturbance)',
                  'Note time, location, and conditions',
                  'Report significant observations to wildlife agencies',
                  'Maintain records for regulatory review'
                ]
              },
              {
                type: 'heading',
                content: 'Reporting'
              },
              {
                type: 'text',
                content: `**Report to authorities:**
- Listed species observations
- Wildlife harassment incidents
- Dead or injured wildlife found
- Unusual wildlife behavior

**Agencies:**
- BC Conservation Officer Service
- Environment Canada (migratory birds)
- DFO (marine species)
- Local wildlife management offices`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Documentation protects you by demonstrating responsible practices. It also contributes to wildlife monitoring and conservation.'
              }
            ],
            keyPoints: [
              'Document species, numbers, behavior, and any disturbance',
              'Include observations in flight logs',
              'Report listed species and incidents to authorities',
              'Maintain records for regulatory review'
            ]
          }
        }
      ],
      quiz: {
        id: 'wildlife-disturbance-quiz',
        questId: 'wildlife-disturbance',
        passingScore: 80,
        questions: [
          {
            id: 'wdq-1',
            type: 'multiple-choice',
            question: 'What is the minimum approach distance for Southern Resident Killer Whales?',
            options: ['100 meters', '200 meters', '400 meters', '50 meters'],
            correctAnswer: 2,
            explanation: 'Southern Resident Killer Whales require a 400-meter minimum approach distance due to their endangered status.'
          },
          {
            id: 'wdq-2',
            type: 'multiple-choice',
            question: 'When is the most sensitive period for birds?',
            options: ['Feeding', 'Migration', 'Nesting/breeding', 'Winter'],
            correctAnswer: 2,
            explanation: 'Nesting and breeding periods are the most sensitive - disturbance can cause nest abandonment.'
          },
          {
            id: 'wdq-3',
            type: 'multiple-choice',
            question: 'What should you do if you observe disturbance indicators in wildlife?',
            options: [
              'Continue monitoring',
              'Get closer for better observation',
              'Immediately increase distance',
              'Take photos for documentation'
            ],
            correctAnswer: 2,
            explanation: 'If disturbance indicators are observed, you\'re already too close. Immediately increase distance.'
          },
          {
            id: 'wdq-4',
            type: 'multiple-choice',
            question: 'What should you do if territorial birds repeatedly attack your aircraft?',
            options: [
              'Continue operations',
              'Chase them away',
              'Leave the area',
              'Fly higher only'
            ],
            correctAnswer: 2,
            explanation: 'If territorial birds persistently attack, leave the area. They\'re defending their territory and won\'t stop.'
          },
          {
            id: 'wdq-5',
            type: 'multiple-choice',
            question: 'What should be reported to wildlife authorities?',
            options: [
              'Only dead animals',
              'Listed species observations and harassment incidents',
              'Nothing unless damage occurred',
              'Only animals larger than the aircraft'
            ],
            correctAnswer: 1,
            explanation: 'Report listed species observations, harassment incidents, and dead/injured wildlife to appropriate authorities.'
          }
        ]
      }
    },

    // Quest 3: Habitat Sensitivity
    {
      id: 'habitat-sensitivity',
      trackId: 'wildlife-environmental-safety',
      title: 'Habitat Sensitivity',
      description: 'Understand critical habitats and implement appropriate protections.',
      order: 3,
      xpReward: 100,
      estimatedMinutes: 45,
      lessons: [
        {
          id: 'critical-habitat-identification',
          questId: 'habitat-sensitivity',
          title: 'Critical Habitat Identification',
          order: 1,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Critical habitat is defined by SARA as habitat necessary for the survival or recovery of a listed species. Operating in or near critical habitat requires special consideration.`
              },
              {
                type: 'heading',
                content: 'Types of Critical Habitat'
              },
              {
                type: 'text',
                content: `**Breeding/nesting habitat:**
- Nesting sites (raptor nests, seabird colonies)
- Spawning areas
- Denning sites
- Pupping areas

**Foraging habitat:**
- Key feeding areas
- Salmon streams (bears, eagles)
- Eelgrass beds (marine species)

**Migration corridors:**
- Flyways
- River corridors
- Coastal routes`
              },
              {
                type: 'heading',
                content: 'Identifying Critical Habitat'
              },
              {
                type: 'list',
                items: [
                  'Check Species at Risk Registry for designated critical habitat',
                  'Consult wildlife management area maps',
                  'Review recovery strategies for listed species',
                  'Contact local wildlife agencies',
                  'Engage wildlife professionals for sensitive projects'
                ]
              },
              {
                type: 'heading',
                content: 'Indicators in the Field'
              },
              {
                type: 'text',
                content: `**Signs of important habitat:**
- Wildlife concentrations
- Nests, dens, or other structures
- Tracks and trails showing regular use
- Feeding signs
- Territorial behavior
- Unique habitat features (wetlands, old growth)`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Not all critical habitat is officially designated. Use ecological knowledge to identify functionally important areas.'
              }
            ],
            keyPoints: [
              'Critical habitat includes breeding, foraging, and migration areas',
              'Check Species at Risk Registry for designated critical habitat',
              'Look for field indicators of important habitat',
              'Contact wildlife agencies for sensitive areas'
            ]
          }
        },
        {
          id: 'buffer-zone-requirements',
          questId: 'habitat-sensitivity',
          title: 'Buffer Zone Requirements',
          order: 2,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Buffer zones create protective distance between operations and sensitive habitats. Appropriate buffer widths depend on the species and activity being protected.`
              },
              {
                type: 'heading',
                content: 'Standard Buffer Recommendations'
              },
              {
                type: 'text',
                content: `**Raptor nests:**
- Bald Eagle: 200-400m (larger during nesting)
- Osprey: 200m
- Great Blue Heron colony: 300m
- Other raptors: 100-200m

**Waterbird colonies:**
- Seabird nesting colonies: 200-500m
- Waterfowl nesting areas: 100-200m
- Shorebird nesting areas: 100-200m

**Marine mammal haul-outs:**
- Seal/sea lion haul-outs: 100-200m
- Breeding areas: 200m+`
              },
              {
                type: 'heading',
                content: 'Implementing Buffers'
              },
              {
                type: 'list',
                items: [
                  'Mark buffer zones on operational maps',
                  'Set geo-fences where available',
                  'Brief all crew on buffer requirements',
                  'Plan flight paths to maintain buffers',
                  'Have contingency if wildlife found in planned area'
                ]
              },
              {
                type: 'heading',
                content: 'Buffer Considerations'
              },
              {
                type: 'text',
                content: `**Factors that may increase buffer needs:**
- Nesting or breeding activity
- Young or injured animals present
- No escape route available
- Species particularly sensitive
- Weather conditions reducing escape options

**These are minimums:** Always err on the side of larger buffers when possible.`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Buffers are measured horizontally. Aircraft altitude doesn\'t reduce the need for horizontal separation from nests or colonies.'
              }
            ],
            keyPoints: [
              'Raptor nests: 200-400m buffers',
              'Waterbird colonies: 200-500m buffers',
              'Marine haul-outs: 100-200m buffers',
              'These are minimums - larger buffers when possible'
            ]
          }
        },
        {
          id: 'seasonal-restrictions',
          questId: 'habitat-sensitivity',
          title: 'Seasonal Restrictions',
          order: 3,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Wildlife sensitivity varies by season. Understanding seasonal patterns enables planning that minimizes impact on critical life stages.`
              },
              {
                type: 'heading',
                content: 'Seasonal Sensitivity Calendar (BC)'
              },
              {
                type: 'text',
                content: `**Winter (Dec-Feb):**
- Wintering eagles near food sources
- Hibernating species in dens
- Ungulates in limited winter range
- Waterfowl concentrations

**Spring (Mar-May):**
- Early nesting begins
- Migration arrivals
- Marine mammal pupping
- Amphibian breeding

**Summer (Jun-Aug):**
- Peak nesting activity
- Young being raised
- Salmon runs (attracts bears, eagles)
- Peak disturbance sensitivity

**Fall (Sep-Nov):**
- Migration
- Salmon spawning
- Ungulate rutting
- Pre-denning activity`
              },
              {
                type: 'heading',
                content: 'Restricted Areas by Season'
              },
              {
                type: 'list',
                items: [
                  'Raptor nest areas: February-July',
                  'Seabird colonies: April-August',
                  'Ungulate winter range: December-April',
                  'Salmon spawning areas: August-November',
                  'Marine mammal pupping areas: May-July'
                ]
              },
              {
                type: 'heading',
                content: 'Planning Around Restrictions'
              },
              {
                type: 'text',
                content: `**Before accepting work:**
- Check seasonal restrictions for area
- Identify timing flexibility
- Plan for restricted area avoidance
- Discuss constraints with client

**If restricted season unavoidable:**
- Implement maximum buffers
- Reduce frequency of operations
- Consider wildlife monitoring
- Obtain necessary permits`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Scheduling operations outside sensitive seasons is often the most effective wildlife protection measure.'
              }
            ],
            keyPoints: [
              'Wildlife sensitivity varies by season',
              'Summer is generally peak sensitivity for nesting',
              'Check seasonal restrictions before planning operations',
              'Scheduling around sensitive periods is most effective'
            ]
          }
        },
        {
          id: 'impact-assessment',
          questId: 'habitat-sensitivity',
          title: 'Impact Assessment',
          order: 4,
          xpReward: 20,
          estimatedMinutes: 10,
          content: {
            sections: [
              {
                type: 'text',
                content: `For operations in or near sensitive habitats, conducting an impact assessment helps identify risks and mitigation measures.`
              },
              {
                type: 'heading',
                content: 'Pre-Operation Assessment'
              },
              {
                type: 'text',
                content: `**Research:**
- Species known in the area
- Habitats present
- Seasonal considerations
- Previous wildlife issues
- Regulatory requirements

**Site assessment:**
- Current wildlife presence
- Habitat features observed
- Sensitive areas identified
- Buffer zones needed
- Timing implications`
              },
              {
                type: 'heading',
                content: 'Impact Factors'
              },
              {
                type: 'list',
                items: [
                  'Noise disturbance from aircraft',
                  'Visual disturbance (approach, hovering)',
                  'Repeated disturbance (multiple flights)',
                  'Duration of exposure',
                  'Proximity to sensitive features',
                  'Cumulative effects with other activities'
                ]
              },
              {
                type: 'heading',
                content: 'Mitigation Planning'
              },
              {
                type: 'text',
                content: `For each impact, identify mitigation:

**Noise:** Fly higher, use quieter aircraft, limit duration
**Visual:** Maintain buffers, approach obliquely, avoid hovering
**Repeated disturbance:** Limit number of flights, consolidate activities
**Duration:** Minimize time in sensitive areas
**Cumulative:** Coordinate with other operators/activities`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Document your impact assessment. This demonstrates due diligence and supports adaptive management.'
              }
            ],
            keyPoints: [
              'Assess species, habitats, and seasonal factors before operations',
              'Consider noise, visual disturbance, repetition, and duration',
              'Develop mitigation for each identified impact',
              'Document assessment and mitigation measures'
            ]
          }
        }
      ],
      quiz: {
        id: 'habitat-sensitivity-quiz',
        questId: 'habitat-sensitivity',
        passingScore: 80,
        questions: [
          {
            id: 'hsq-1',
            type: 'multiple-choice',
            question: 'What is the recommended buffer for Bald Eagle nests?',
            options: ['50-100m', '100-150m', '200-400m', '500-1000m'],
            correctAnswer: 2,
            explanation: 'Bald Eagle nests should have 200-400m buffers, larger during active nesting.'
          },
          {
            id: 'hsq-2',
            type: 'multiple-choice',
            question: 'When is peak nesting sensitivity in BC?',
            options: ['Winter', 'Spring', 'Summer', 'Fall'],
            correctAnswer: 2,
            explanation: 'Summer (June-August) is peak nesting activity when most species are raising young.'
          },
          {
            id: 'hsq-3',
            type: 'multiple-choice',
            question: 'Does aircraft altitude eliminate the need for horizontal buffers from nests?',
            options: [
              'Yes, flying high is sufficient',
              'No, horizontal separation is still required',
              'Only for large aircraft',
              'Yes, if above 200m'
            ],
            correctAnswer: 1,
            explanation: 'Buffers are measured horizontally. Aircraft altitude doesn\'t eliminate the need for horizontal separation.'
          },
          {
            id: 'hsq-4',
            type: 'multiple-choice',
            question: 'What is the most effective wildlife protection measure?',
            options: [
              'Flying at high altitude',
              'Using quiet aircraft',
              'Scheduling outside sensitive seasons',
              'Quick flights'
            ],
            correctAnswer: 2,
            explanation: 'Scheduling operations outside sensitive seasons is often the most effective protection.'
          },
          {
            id: 'hsq-5',
            type: 'multiple-choice',
            question: 'Which is NOT typically considered critical habitat?',
            options: [
              'Nesting sites',
              'Foraging areas',
              'Migration corridors',
              'Urban parks'
            ],
            correctAnswer: 3,
            explanation: 'Critical habitat includes breeding, foraging, and migration areas - not typically urban parks.'
          }
        ]
      }
    },

    // Quest 4: Environmental Best Practices
    {
      id: 'environmental-best-practices',
      trackId: 'wildlife-environmental-safety',
      title: 'Environmental Best Practices',
      description: 'Implement practices that minimize environmental impact of operations.',
      order: 4,
      xpReward: 100,
      estimatedMinutes: 45,
      lessons: [
        {
          id: 'noise-mitigation',
          questId: 'environmental-best-practices',
          title: 'Noise Mitigation',
          order: 1,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `RPAS noise can disturb wildlife and local communities. Implementing noise mitigation strategies reduces impact and improves operational acceptance.`
              },
              {
                type: 'heading',
                content: 'Noise Sources'
              },
              {
                type: 'text',
                content: `**Primary noise sources:**
- Propeller noise (dominant on most RPAS)
- Motor noise
- Airframe vibration
- Payload operation

**Factors affecting noise:**
- Propeller size and pitch
- Rotation speed (higher = louder)
- Number of props
- Aircraft speed
- Altitude (distance from observer)`
              },
              {
                type: 'heading',
                content: 'Mitigation Strategies'
              },
              {
                type: 'list',
                items: [
                  'Fly higher when possible (noise decreases with distance)',
                  'Use lower prop speeds when conditions allow',
                  'Consider quieter aircraft for sensitive operations',
                  'Avoid hovering (sustained noise source)',
                  'Minimize operation duration',
                  'Plan efficient flight paths (less time = less noise)',
                  'Schedule operations during less sensitive times'
                ]
              },
              {
                type: 'heading',
                content: 'Technology Solutions'
              },
              {
                type: 'text',
                content: `**Quieter options:**
- Larger, slow-turning propellers
- Low-noise propeller designs
- Enclosed motor housings
- Vibration dampening

**Trade-offs:**
Quieter propellers often mean less thrust or efficiency. Balance noise reduction with operational requirements.`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Wildlife may hear frequencies humans cannot. Even "quiet" aircraft may disturb sensitive species.'
              }
            ],
            keyPoints: [
              'Propeller noise is the dominant source',
              'Fly higher when possible to reduce noise impact',
              'Minimize hovering and operation duration',
              'Consider quieter aircraft for sensitive operations'
            ]
          }
        },
        {
          id: 'visual-disturbance-reduction',
          questId: 'environmental-best-practices',
          title: 'Visual Disturbance Reduction',
          order: 2,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Visual disturbance occurs when wildlife perceive the aircraft as a threat. Reducing visual impact helps minimize disturbance responses.`
              },
              {
                type: 'heading',
                content: 'Visual Threat Factors'
              },
              {
                type: 'text',
                content: `**What triggers responses:**
- Direct approach (predator-like behavior)
- Hovering overhead (raptor-like)
- Rapid movements
- Low altitude flight
- Silhouette against sky

**Species perceptions:**
Birds may perceive RPAS as aerial predators. Ground mammals may see them as any novel threat.`
              },
              {
                type: 'heading',
                content: 'Approach Strategies'
              },
              {
                type: 'list',
                items: [
                  'Approach at oblique angles, not directly',
                  'Avoid direct overflights',
                  'Maintain consistent speed (no sudden changes)',
                  'Use terrain to screen approach when possible',
                  'Approach from downhill (less threatening silhouette)',
                  'Avoid circling over animals'
                ]
              },
              {
                type: 'heading',
                content: 'Operational Considerations'
              },
              {
                type: 'text',
                content: `**Reduce visual presence:**
- Higher altitude reduces apparent size
- Parallel passes less threatening than approaches
- Brief transits better than sustained presence
- Multiple distant passes better than one close pass

**Aircraft appearance:**
Some research suggests neutral colors less threatening than bright colors or patterns resembling predators.`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'If animals are watching your aircraft, you\'re close enough to cause stress. Increase distance proactively.'
              }
            ],
            keyPoints: [
              'Direct approaches and hovering are most threatening',
              'Use oblique angles and parallel passes',
              'Higher altitude reduces apparent threat',
              'Maintain consistent, predictable movements'
            ]
          }
        },
        {
          id: 'leave-no-trace',
          questId: 'environmental-best-practices',
          title: 'Leave No Trace Principles',
          order: 3,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Leave No Trace principles guide minimal impact practices for outdoor activities. Applying these to RPAS operations demonstrates environmental stewardship.`
              },
              {
                type: 'heading',
                content: 'Core Principles Applied'
              },
              {
                type: 'text',
                content: `**Plan Ahead and Prepare:**
- Research environmental sensitivities
- Bring all needed supplies (no improvising on site)
- Know regulations and requirements

**Travel and Camp on Durable Surfaces:**
- Use established staging areas
- Avoid sensitive vegetation
- Minimize ground disturbance

**Dispose of Waste Properly:**
- Pack out all waste
- Properly dispose of batteries
- No dumping of any kind

**Leave What You Find:**
- Don't disturb wildlife
- Don't collect natural objects
- Leave sites as found (or better)`
              },
              {
                type: 'heading',
                content: 'Operational Applications'
              },
              {
                type: 'list',
                items: [
                  'Select staging areas that minimize impact',
                  'Stay on trails and roads when accessing sites',
                  'Pack out everything you bring in',
                  'Don\'t discard broken parts or packaging',
                  'Clean up any debris from incidents',
                  'Document and report any site impacts'
                ]
              },
              {
                type: 'heading',
                content: 'Departing the Site'
              },
              {
                type: 'text',
                content: `**Before leaving:**
- Visual sweep for any dropped items
- Verify all equipment packed
- Check for any site impacts
- Remove temporary markers or signage
- Consider: "Is this site as clean as when I arrived?"`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Leave No Trace isn\'t just ethical - it\'s professional. Clean operations build trust with landowners and regulators.'
              }
            ],
            keyPoints: [
              'Plan ahead to minimize site impact',
              'Use durable surfaces for staging',
              'Pack out all waste including broken parts',
              'Leave sites as clean as or cleaner than found'
            ]
          }
        },
        {
          id: 'spill-prevention-response',
          questId: 'environmental-best-practices',
          title: 'Spill Prevention & Response',
          order: 4,
          xpReward: 20,
          estimatedMinutes: 10,
          content: {
            sections: [
              {
                type: 'text',
                content: `While RPAS operations typically involve small quantities of fluids, proper spill prevention and response protects the environment and demonstrates professional practices.`
              },
              {
                type: 'heading',
                content: 'Potential Spill Sources'
              },
              {
                type: 'text',
                content: `**Fuels (gas/hybrid aircraft):**
- Refueling operations
- Fuel line leaks
- Tank damage

**Battery chemicals:**
- Damaged battery cells
- Overheated batteries
- Battery fires

**Other fluids:**
- Lubricants
- Hydraulic fluids (larger aircraft)
- Cleaning chemicals`
              },
              {
                type: 'heading',
                content: 'Prevention Measures'
              },
              {
                type: 'list',
                items: [
                  'Use drip trays during refueling',
                  'Inspect batteries for damage before use',
                  'Store fuel in approved containers',
                  'Secure containers during transport',
                  'Refuel away from water and sensitive areas',
                  'Use funnels and spouts for controlled pour'
                ]
              },
              {
                type: 'heading',
                content: 'Spill Response'
              },
              {
                type: 'text',
                content: `**If spill occurs:**
1. Stop the source
2. Protect yourself (gloves, ventilation)
3. Contain the spill (absorbents, barriers)
4. Clean up material
5. Properly dispose of contaminated material
6. Report as required

**Spill kit contents:**
- Absorbent pads
- Containment bags
- Gloves
- Small shovel or scoop`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Report spills to environment authorities as required. Even small spills may need reporting in sensitive areas.'
              }
            ],
            keyPoints: [
              'Use drip trays and proper containers for fuel',
              'Inspect batteries and store fuel properly',
              'Carry basic spill response materials',
              'Report spills as required by regulations'
            ]
          }
        }
      ],
      quiz: {
        id: 'environmental-practices-quiz',
        questId: 'environmental-best-practices',
        passingScore: 80,
        questions: [
          {
            id: 'epq-1',
            type: 'multiple-choice',
            question: 'What is the dominant noise source on most RPAS?',
            options: ['Motor noise', 'Propeller noise', 'Wind noise', 'Payload operation'],
            correctAnswer: 1,
            explanation: 'Propeller noise is the dominant noise source on most multi-rotor and fixed-wing RPAS.'
          },
          {
            id: 'epq-2',
            type: 'multiple-choice',
            question: 'What approach angle is LEAST threatening to wildlife?',
            options: ['Direct approach', 'Overhead', 'Oblique angle', 'From behind'],
            correctAnswer: 2,
            explanation: 'Oblique angles are less threatening than direct approaches or overhead presence.'
          },
          {
            id: 'epq-3',
            type: 'multiple-choice',
            question: 'What should you do with broken RPAS parts in the field?',
            options: [
              'Leave them if biodegradable',
              'Pack them out',
              'Bury them',
              'Leave them for later collection'
            ],
            correctAnswer: 1,
            explanation: 'Pack out everything you bring in, including broken parts - Leave No Trace.'
          },
          {
            id: 'epq-4',
            type: 'multiple-choice',
            question: 'What should you use when refueling in the field?',
            options: ['Nothing special needed', 'Drip trays', 'Gloves only', 'Open containers'],
            correctAnswer: 1,
            explanation: 'Use drip trays during refueling to prevent and contain spills.'
          },
          {
            id: 'epq-5',
            type: 'multiple-choice',
            question: 'If animals are watching your aircraft, what does this indicate?',
            options: [
              'They are curious and not bothered',
              'You are close enough to cause stress',
              'The aircraft color is attractive',
              'Nothing significant'
            ],
            correctAnswer: 1,
            explanation: 'If animals are watching, you\'re close enough to cause stress. Increase distance proactively.'
          }
        ]
      }
    },

    // Quest 5: Working with Wildlife Biologists
    {
      id: 'working-with-biologists',
      trackId: 'wildlife-environmental-safety',
      title: 'Working with Wildlife Biologists',
      description: 'Collaborate effectively with wildlife professionals.',
      order: 5,
      xpReward: 100,
      estimatedMinutes: 40,
      scenarioId: 'biologist-on-site-scenario',
      lessons: [
        {
          id: 'collaboration-protocols',
          questId: 'working-with-biologists',
          title: 'Collaboration Protocols',
          order: 1,
          xpReward: 30,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Many RPAS operations involve wildlife professionals as clients, consultants, or site monitors. Effective collaboration enhances operations and outcomes.`
              },
              {
                type: 'heading',
                content: 'When Biologists Are Involved'
              },
              {
                type: 'text',
                content: `**Biologists as clients:**
- Wildlife surveys and monitoring
- Research data collection
- Environmental assessments
- Species inventories

**Biologists as consultants:**
- Pre-operation wildlife assessment
- Species identification support
- Protocol development
- Impact evaluation

**Biologists as monitors:**
- Oversight during sensitive operations
- Real-time wildlife assessment
- Disturbance monitoring
- Stop-work authority`
              },
              {
                type: 'heading',
                content: 'Establishing Working Relationship'
              },
              {
                type: 'list',
                items: [
                  'Pre-operation meetings to align objectives',
                  'Discuss wildlife concerns and thresholds',
                  'Agree on communication protocols',
                  'Define decision authority (who calls stop)',
                  'Share relevant experience and capabilities',
                  'Establish contingency procedures'
                ]
              },
              {
                type: 'heading',
                content: 'Communication During Operations'
              },
              {
                type: 'text',
                content: `**Real-time communication:**
- Biologist alerts to wildlife observations
- Pilot confirms receipt and action
- Clear terminology for directions
- Established signals for stop/go

**Decision protocol:**
- Biologist advises on wildlife response
- Pilot has final aircraft safety decisions
- Joint agreement on operation continuation`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Wildlife expertise and flight expertise are different. Successful operations blend both through clear communication.'
              }
            ],
            keyPoints: [
              'Biologists may be clients, consultants, or monitors',
              'Pre-operation meetings align objectives and protocols',
              'Define clear communication and decision authority',
              'Blend wildlife expertise with flight expertise'
            ]
          }
        },
        {
          id: 'data-collection-requirements',
          questId: 'working-with-biologists',
          title: 'Data Collection Requirements',
          order: 2,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Wildlife surveys and research have specific data requirements. Understanding these helps optimize flight operations for scientific needs.`
              },
              {
                type: 'heading',
                content: 'Common Data Requirements'
              },
              {
                type: 'text',
                content: `**Presence/absence surveys:**
- Complete coverage of survey area
- Systematic flight patterns
- Consistent altitude and speed
- Repeatable for comparison

**Population counts:**
- High-resolution imagery
- Complete coverage without gaps
- Known scale for size estimation
- Multiple passes for verification

**Behavior observation:**
- Extended observation periods
- Minimal disturbance
- Good lighting conditions
- Appropriate angles for activity`
              },
              {
                type: 'heading',
                content: 'Flight Planning for Research'
              },
              {
                type: 'list',
                items: [
                  'Understand the research question',
                  'Discuss data quality requirements',
                  'Plan systematic coverage patterns',
                  'Account for photo overlap needs',
                  'Build in flexibility for conditions',
                  'Plan for repeat surveys (consistency)'
                ]
              },
              {
                type: 'heading',
                content: 'Data Quality Considerations'
              },
              {
                type: 'text',
                content: `**Image quality factors:**
- Resolution sufficient for species ID
- Lighting appropriate for detection
- Angle enables identification features
- Weather doesn't obscure subjects

**Metadata requirements:**
- GPS coordinates
- Time stamps
- Altitude records
- Camera settings
- Environmental conditions`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Bad data is worse than no data for research. Understand requirements and don\'t collect unless quality can be maintained.'
              }
            ],
            keyPoints: [
              'Understand specific research requirements',
              'Plan systematic, repeatable coverage',
              'Maintain data quality standards',
              'Capture required metadata'
            ]
          }
        },
        {
          id: 'adaptive-management',
          questId: 'working-with-biologists',
          title: 'Adaptive Management',
          order: 3,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Adaptive management applies lessons learned to improve practices. Wildlife operations benefit from systematic feedback and adjustment.`
              },
              {
                type: 'heading',
                content: 'Adaptive Management Cycle'
              },
              {
                type: 'text',
                content: `**1. Plan:** Design operations with wildlife considerations

**2. Execute:** Conduct operations per plan

**3. Monitor:** Observe wildlife responses

**4. Evaluate:** Assess what worked and what didn't

**5. Adjust:** Modify approach for next operation

**6. Document:** Record lessons for future use`
              },
              {
                type: 'heading',
                content: 'Learning from Operations'
              },
              {
                type: 'list',
                items: [
                  'Debrief with biologist after operations',
                  'Document wildlife observations and responses',
                  'Identify what triggered disturbance',
                  'Note successful avoidance strategies',
                  'Record conditions affecting outcomes',
                  'Update protocols based on learning'
                ]
              },
              {
                type: 'heading',
                content: 'Continuous Improvement'
              },
              {
                type: 'text',
                content: `**Between projects:**
- Review cumulative experience
- Update standard procedures
- Share learning with team
- Incorporate new research findings
- Adjust buffers and thresholds as needed

**Building expertise:**
- Develop species-specific knowledge
- Build relationships with wildlife professionals
- Stay current on wildlife research
- Contribute to industry best practices`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Every wildlife operation is a learning opportunity. Document and share what works.'
              }
            ],
            keyPoints: [
              'Apply plan-execute-monitor-evaluate-adjust cycle',
              'Debrief with wildlife professionals after operations',
              'Document what triggered disturbance and what worked',
              'Update protocols based on accumulated learning'
            ]
          }
        }
      ],
      quiz: {
        id: 'biologist-collaboration-quiz',
        questId: 'working-with-biologists',
        passingScore: 80,
        questions: [
          {
            id: 'bcq-1',
            type: 'multiple-choice',
            question: 'Who typically has stop-work authority for wildlife concerns during operations?',
            options: [
              'Only the pilot',
              'Only the biologist',
              'Should be agreed upon in advance',
              'No one - operations always continue'
            ],
            correctAnswer: 2,
            explanation: 'Decision authority should be clearly established during pre-operation planning.'
          },
          {
            id: 'bcq-2',
            type: 'multiple-choice',
            question: 'What is the purpose of systematic flight patterns in wildlife surveys?',
            options: [
              'Save battery',
              'Look professional',
              'Complete coverage and repeatability',
              'Reduce noise'
            ],
            correctAnswer: 2,
            explanation: 'Systematic patterns ensure complete coverage and enable repeatable surveys for comparison.'
          },
          {
            id: 'bcq-3',
            type: 'multiple-choice',
            question: 'What is the first step in the adaptive management cycle?',
            options: ['Execute', 'Monitor', 'Plan', 'Evaluate'],
            correctAnswer: 2,
            explanation: 'The cycle begins with planning operations with wildlife considerations.'
          },
          {
            id: 'bcq-4',
            type: 'multiple-choice',
            question: 'When should you debrief with the wildlife biologist?',
            options: [
              'Only if something went wrong',
              'After operations conclude',
              'Only for research projects',
              'Never - separate roles'
            ],
            correctAnswer: 1,
            explanation: 'Debrief after operations to capture lessons learned and improve future practices.'
          },
          {
            id: 'bcq-5',
            type: 'multiple-choice',
            question: 'What makes wildlife expertise and flight expertise different but complementary?',
            options: [
              'They are not complementary',
              'One knows animals, one knows aircraft operations',
              'They are the same thing',
              'Only academics have wildlife expertise'
            ],
            correctAnswer: 1,
            explanation: 'Wildlife expertise focuses on animal behavior and requirements; flight expertise focuses on aircraft operations. Successful operations blend both.'
          }
        ]
      }
    },

    // Quest 6: Environmental Documentation
    {
      id: 'environmental-documentation',
      trackId: 'wildlife-environmental-safety',
      title: 'Environmental Documentation',
      description: 'Document environmental compliance and support auditing.',
      order: 6,
      xpReward: 100,
      estimatedMinutes: 40,
      lessons: [
        {
          id: 'environmental-impact-records',
          questId: 'environmental-documentation',
          title: 'Environmental Impact Records',
          order: 1,
          xpReward: 30,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Maintaining environmental impact records demonstrates responsible practices and supports regulatory compliance. Good records protect you and your organization.`
              },
              {
                type: 'heading',
                content: 'What to Record'
              },
              {
                type: 'text',
                content: `**Pre-operation:**
- Environmental assessment results
- Species considerations identified
- Permits obtained
- Buffers established
- Seasonal factors considered

**During operations:**
- Wildlife observed
- Responses noted
- Deviations from plan
- Disturbance incidents
- Actions taken

**Post-operation:**
- Summary of environmental outcomes
- Lessons learned
- Recommendations for future`
              },
              {
                type: 'heading',
                content: 'Record Formats'
              },
              {
                type: 'list',
                items: [
                  'Standardized environmental assessment forms',
                  'Flight log environmental sections',
                  'Wildlife observation logs',
                  'Incident/disturbance reports',
                  'Photos and video as supporting documentation',
                  'GPS tracks showing actual flight paths'
                ]
              },
              {
                type: 'heading',
                content: 'Retention Requirements'
              },
              {
                type: 'text',
                content: `**Minimum retention:**
- General environmental records: 2 years
- Permit-related records: Life of permit + 2 years
- Incident records: 5 years
- Records involving listed species: 5+ years

**Best practice:**
Retain indefinitely in electronic format - storage is cheap and records may be valuable years later.`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'Good records demonstrate professionalism to clients and due diligence to regulators.'
              }
            ],
            keyPoints: [
              'Record environmental factors before, during, and after operations',
              'Use standardized forms for consistency',
              'Retain records minimum 2-5 years depending on type',
              'Good records protect you and demonstrate professionalism'
            ]
          }
        },
        {
          id: 'incident-reporting',
          questId: 'environmental-documentation',
          title: 'Environmental Incident Reporting',
          order: 2,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Environmental incidents, including wildlife disturbance, should be documented and reported as required. Prompt reporting demonstrates responsibility.`
              },
              {
                type: 'heading',
                content: 'Reportable Environmental Incidents'
              },
              {
                type: 'list',
                items: [
                  'Wildlife harassment or disturbance',
                  'Observation of listed species',
                  'Contact with wildlife',
                  'Nest disturbance',
                  'Spills or releases',
                  'Damage to sensitive habitat',
                  'Permit condition violations'
                ]
              },
              {
                type: 'heading',
                content: 'Reporting Procedures'
              },
              {
                type: 'text',
                content: `**Internal reporting:**
1. Document incident immediately
2. Notify supervisor/management
3. Complete incident report form
4. Submit supporting documentation

**External reporting:**
1. Determine reporting requirements
2. Identify appropriate agencies
3. Prepare required information
4. Submit within required timeframes
5. Maintain records of submissions`
              },
              {
                type: 'heading',
                content: 'Agency Contacts'
              },
              {
                type: 'text',
                content: `**BC Conservation Officer Service:** Wildlife incidents
**Environment Canada:** Migratory birds
**DFO:** Marine species
**BC Parks:** Incidents in parks
**Emergency Environmental Response:** Spills

Keep contact information readily available in the field.`
              },
              {
                type: 'callout',
                variant: 'warning',
                content: 'Failure to report when required is itself a violation. When in doubt, report.'
              }
            ],
            keyPoints: [
              'Document incidents immediately',
              'Report to appropriate agencies within required timeframes',
              'Maintain records of all reports',
              'When in doubt, report'
            ]
          }
        },
        {
          id: 'compliance-auditing',
          questId: 'environmental-documentation',
          title: 'Compliance Auditing',
          order: 3,
          xpReward: 25,
          estimatedMinutes: 12,
          content: {
            sections: [
              {
                type: 'text',
                content: `Environmental compliance may be audited by regulators, clients, or internal quality systems. Being audit-ready demonstrates professional operations.`
              },
              {
                type: 'heading',
                content: 'What Auditors Look For'
              },
              {
                type: 'text',
                content: `**Documentation:**
- Evidence of pre-operation assessment
- Permit compliance records
- Wildlife observation records
- Incident reports and follow-up
- Training records

**Practices:**
- Consistent application of procedures
- Appropriate decision-making
- Effective communication
- Continuous improvement`
              },
              {
                type: 'heading',
                content: 'Audit Preparation'
              },
              {
                type: 'list',
                items: [
                  'Organize records for easy retrieval',
                  'Review procedures against actual practices',
                  'Identify and address gaps proactively',
                  'Ensure training records are current',
                  'Verify permit status and compliance',
                  'Prepare summary of environmental performance'
                ]
              },
              {
                type: 'heading',
                content: 'Responding to Findings'
              },
              {
                type: 'text',
                content: `**If deficiencies identified:**
1. Acknowledge findings
2. Understand root causes
3. Develop corrective actions
4. Implement improvements
5. Document responses
6. Verify effectiveness

**Positive approach:**
Treat audits as opportunities to improve, not threats to defend against.`
              },
              {
                type: 'callout',
                variant: 'info',
                content: 'The best audit is one where you have nothing to hide because you\'ve been doing things right all along.'
              }
            ],
            keyPoints: [
              'Auditors look for documentation and consistent practices',
              'Organize records for easy retrieval',
              'Address gaps proactively before audits',
              'Treat findings as improvement opportunities'
            ]
          }
        }
      ],
      quiz: {
        id: 'environmental-documentation-quiz',
        questId: 'environmental-documentation',
        passingScore: 80,
        questions: [
          {
            id: 'edq-1',
            type: 'multiple-choice',
            question: 'How long should general environmental records be retained?',
            options: ['6 months', '1 year', 'Minimum 2 years', '30 days'],
            correctAnswer: 2,
            explanation: 'General environmental records should be retained for a minimum of 2 years.'
          },
          {
            id: 'edq-2',
            type: 'multiple-choice',
            question: 'What should you do if unsure whether to report an incident?',
            options: [
              'Wait and see if anyone asks',
              'Report to be safe',
              'Only report if damage occurred',
              'Never report unless required'
            ],
            correctAnswer: 1,
            explanation: 'When in doubt, report. Failure to report when required is itself a violation.'
          },
          {
            id: 'edq-3',
            type: 'multiple-choice',
            question: 'Who should you contact for migratory bird incidents?',
            options: [
              'BC Parks',
              'Environment Canada',
              'DFO',
              'Local police'
            ],
            correctAnswer: 1,
            explanation: 'Environment Canada handles migratory bird matters under the Migratory Birds Convention Act.'
          },
          {
            id: 'edq-4',
            type: 'multiple-choice',
            question: 'What is the best approach to audit findings?',
            options: [
              'Dispute them',
              'Ignore minor findings',
              'Treat as opportunities to improve',
              'Blame others'
            ],
            correctAnswer: 2,
            explanation: 'Treat audit findings as opportunities to improve practices and systems.'
          },
          {
            id: 'edq-5',
            type: 'multiple-choice',
            question: 'What records should be maintained for operations involving listed species?',
            options: ['1 year', '2 years', '5+ years', 'No specific requirement'],
            correctAnswer: 2,
            explanation: 'Records involving listed species should be retained for 5+ years given the regulatory sensitivity.'
          }
        ]
      }
    }
  ]
}

export default wildlifeTrack
