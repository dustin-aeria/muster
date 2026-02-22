/**
 * Regulatory Compliance Scenarios
 *
 * Interactive decision-tree scenarios for regulatory compliance training.
 *
 * @version 1.0.0
 */

const regulatoryScenarios = {
  // Scenario: SORA Assessment
  'sora-assessment-scenario': {
    id: 'sora-assessment-scenario',
    trackId: 'regulatory-compliance',
    questId: 'sora-framework',
    title: 'SORA Assessment',
    description: 'Apply the SORA methodology to classify an operation and determine requirements.',
    difficulty: 'intermediate',
    estimatedTime: 15,
    xpReward: 100,
    context: `You've been asked to assess a proposed RPAS operation for a client. They want to conduct powerline inspections in a rural area. Your job is to work through the SORA methodology to determine the appropriate risk class and requirements.

The client has a commercial quadcopter (7kg MTOW) with standard safety features.`,

    initialNode: 'start',
    nodes: {
      start: {
        id: 'start',
        type: 'situation',
        content: `## Operation Overview

**Client Request:** Powerline inspection
**Location:** Rural corridor, mix of farmland and forest
**Aircraft:** Commercial quadcopter, 7kg MTOW
**Flight Profile:** 50-100m AGL, following powerline corridor
**Duration:** Multiple flights over 3 days

Your first step in SORA is to fully describe the Concept of Operations (ConOps).

What information do you need to gather first?`,
        choices: [
          {
            id: 'gather-ground-info',
            text: 'Population density and ground environment details',
            nextNode: 'ground-info'
          },
          {
            id: 'gather-air-info',
            text: 'Airspace classification and traffic information',
            nextNode: 'air-info'
          },
          {
            id: 'gather-both',
            text: 'Both ground and air risk information are needed',
            nextNode: 'comprehensive-conops'
          }
        ]
      },

      'ground-info': {
        id: 'ground-info',
        type: 'situation',
        content: `Good start, but SORA requires both ground and air risk assessment.

**Ground Information Gathered:**
- Corridor passes through sparsely populated farmland
- Two small communities (pop. 500 and 300) within 2km of corridor
- Active farm buildings and access roads along route
- No large gatherings expected
- Some public roads cross the corridor

You still need airspace information to complete your assessment.`,
        choices: [
          {
            id: 'get-air-too',
            text: 'Now gather airspace information',
            nextNode: 'comprehensive-conops'
          }
        ]
      },

      'air-info': {
        id: 'air-info',
        type: 'situation',
        content: `Good thinking about air risk, but SORA starts with ground risk assessment.

**Airspace Information Gathered:**
- Uncontrolled airspace (Class G)
- No restricted areas affecting the corridor
- Small grass airstrip 5km from corridor (recreational traffic)
- Agricultural aviation activity possible in season
- Helicopter pipeline patrols also use the corridor occasionally

You need ground risk information first per SORA methodology.`,
        choices: [
          {
            id: 'get-ground-too',
            text: 'Now gather ground environment information',
            nextNode: 'comprehensive-conops'
          }
        ]
      },

      'comprehensive-conops': {
        id: 'comprehensive-conops',
        type: 'positive',
        content: `Excellent. You gather complete ConOps information:

**Ground Environment:**
- Sparsely populated rural corridor
- Two small communities nearby (pop. 500 and 300)
- Active farms and occasional road traffic
- No large gatherings

**Air Environment:**
- Class G uncontrolled airspace
- Recreational airstrip 5km away
- Agricultural aviation and helicopter traffic possible

**Aircraft Characteristics:**
- 7kg MTOW
- Maximum speed 70 km/h
- Kinetic energy ~2,200 J at max speed
- Standard safety features (RTH, geofencing, auto-land)

**Operational Parameters:**
- VLOS operations
- 50-100m AGL
- Multiple flights over 3 days
- Trained, certified crew

Now you're ready to determine Ground Risk Class (GRC).`,
        choices: [
          {
            id: 'determine-grc',
            text: 'Proceed to GRC determination',
            nextNode: 'grc-assessment'
          }
        ]
      },

      'grc-assessment': {
        id: 'grc-assessment',
        type: 'situation',
        content: `## Ground Risk Class Determination

Using the SORA GRC table, you assess intrinsic ground risk based on:
- Aircraft characteristic dimension/energy
- Operational environment

**Your 7kg aircraft falls into the "medium" category for kinetic energy.**

**The operational environment is "sparsely populated" with some population nearby but not directly overflown.**

Looking at the GRC table, what is the intrinsic (unmitigated) GRC for this operation?`,
        choices: [
          {
            id: 'grc-2',
            text: 'GRC 2 - Low ground risk',
            nextNode: 'grc-too-low'
          },
          {
            id: 'grc-3',
            text: 'GRC 3 - Moderate ground risk',
            nextNode: 'grc-correct'
          },
          {
            id: 'grc-5',
            text: 'GRC 5 - Higher ground risk',
            nextNode: 'grc-too-high'
          }
        ]
      },

      'grc-too-low': {
        id: 'grc-too-low',
        type: 'situation',
        content: `GRC 2 would typically apply to smaller aircraft (<4kg) in sparsely populated areas, or controlled ground areas.

With a 7kg aircraft in sparsely populated (but not controlled) areas, the intrinsic GRC is higher.

Review your assessment - what's the correct GRC?`,
        choices: [
          {
            id: 'revise-to-3',
            text: 'Revise to GRC 3',
            nextNode: 'grc-correct'
          },
          {
            id: 'revise-to-5',
            text: 'Revise to GRC 5',
            nextNode: 'grc-too-high'
          }
        ]
      },

      'grc-too-high': {
        id: 'grc-too-high',
        type: 'situation',
        content: `GRC 5 would apply to operations over populated areas, not sparsely populated rural corridors.

The powerline corridor passes through farmland with only occasional population exposure, not sustained operations over populated zones.

Review your assessment - what's the correct GRC?`,
        choices: [
          {
            id: 'revise-to-3',
            text: 'Revise to GRC 3',
            nextNode: 'grc-correct'
          },
          {
            id: 'revise-to-2',
            text: 'Revise to GRC 2',
            nextNode: 'grc-too-low'
          }
        ]
      },

      'grc-correct': {
        id: 'grc-correct',
        type: 'positive',
        content: `Correct! **Intrinsic GRC = 3**

This is appropriate for:
- Medium-sized aircraft (4-8kg category)
- Sparsely populated operational environment
- VLOS operations

Now consider if any mitigations can reduce the GRC:

**M1 - Strategic Mitigations:**
- Can you establish ground buffers or restricted zones?

**M2 - Effects of Ground Impact:**
- Does the aircraft have energy reduction features (parachute)?

**M3 - Emergency Response Plan:**
- What's your emergency response capability?

For this operation, which mitigations might apply?`,
        choices: [
          {
            id: 'no-mitigations',
            text: 'Standard operation - no significant mitigations available',
            nextNode: 'grc-final-3'
          },
          {
            id: 'm1-available',
            text: 'M1 applies - we can establish ground buffers near communities',
            nextNode: 'grc-with-m1'
          },
          {
            id: 'all-mitigations',
            text: 'Apply all mitigations to minimize GRC',
            nextNode: 'over-mitigation'
          }
        ]
      },

      'grc-final-3': {
        id: 'grc-final-3',
        type: 'situation',
        content: `You determine the final GRC remains at 3.

This is a reasonable assessment - the operation doesn't have specific enhancements that would justify GRC reduction claims.

**Final GRC: 3**

Now proceed to Air Risk Class (ARC) determination.`,
        choices: [
          {
            id: 'to-arc',
            text: 'Determine ARC',
            nextNode: 'arc-assessment'
          }
        ]
      },

      'grc-with-m1': {
        id: 'grc-with-m1',
        type: 'positive',
        content: `Good application of M1 strategic mitigations.

By establishing:
- Minimum 150m buffer from community boundaries
- No-fly zones over the two towns
- Avoiding overflying public roads during operations

You can claim M1 mitigation credit, potentially reducing GRC by 1 level.

However, this must be:
- Documented in your ConOps
- Verifiable during operations
- Consistently applied

**Final GRC: 2** (reduced from 3 with M1 mitigation)

Now proceed to Air Risk Class.`,
        choices: [
          {
            id: 'to-arc',
            text: 'Determine ARC',
            nextNode: 'arc-assessment'
          }
        ]
      },

      'over-mitigation': {
        id: 'over-mitigation',
        type: 'situation',
        content: `Be careful with claiming multiple mitigations.

Each mitigation must be:
- Genuinely applicable to your operation
- Documented and verifiable
- Consistently implementable

For this operation:
- **M1:** Possible if you establish ground buffers
- **M2:** Does your aircraft have a parachute or frangible design? Standard quadcopters typically don't qualify
- **M3:** Emergency response for a rural corridor may be limited

Claiming mitigations you can't demonstrate will be challenged during approval review. Be realistic about what's applicable.`,
        choices: [
          {
            id: 'realistic-assessment',
            text: 'Be more conservative - claim only genuinely applicable mitigations',
            nextNode: 'grc-final-3'
          },
          {
            id: 'claim-m1-only',
            text: 'Claim M1 (ground buffers) which we can genuinely implement',
            nextNode: 'grc-with-m1'
          }
        ]
      },

      'arc-assessment': {
        id: 'arc-assessment',
        type: 'situation',
        content: `## Air Risk Class Determination

Recall your airspace information:
- Class G uncontrolled airspace
- Recreational airstrip 5km away
- Possible agricultural aviation activity
- Helicopter patrols use the corridor occasionally

For VLOS operations in uncontrolled airspace with some traffic presence, what is the initial ARC?`,
        choices: [
          {
            id: 'arc-a',
            text: 'ARC-a (Atypical airspace - minimal traffic)',
            nextNode: 'arc-a-assessment'
          },
          {
            id: 'arc-b',
            text: 'ARC-b (Low traffic uncontrolled airspace)',
            nextNode: 'arc-b-correct'
          },
          {
            id: 'arc-c',
            text: 'ARC-c (Moderate traffic)',
            nextNode: 'arc-c-assessment'
          }
        ]
      },

      'arc-a-assessment': {
        id: 'arc-a-assessment',
        type: 'situation',
        content: `ARC-a (atypical airspace) typically applies to:
- Segregated airspace (e.g., restricted areas)
- Areas with procedural separation
- Very low level operations where manned aircraft are unlikely

Your corridor has known helicopter traffic and possible agricultural aviation. It's not truly atypical.

What's the more appropriate ARC?`,
        choices: [
          {
            id: 'revise-to-b',
            text: 'ARC-b is more appropriate',
            nextNode: 'arc-b-correct'
          },
          {
            id: 'revise-to-c',
            text: 'ARC-c is more appropriate',
            nextNode: 'arc-c-assessment'
          }
        ]
      },

      'arc-b-correct': {
        id: 'arc-b-correct',
        type: 'positive',
        content: `Correct! **Initial ARC: ARC-b**

Class G uncontrolled airspace with occasional traffic but no dense air traffic patterns is typically ARC-b.

Now consider tactical mitigations:

**VLOS operations** provide inherent "see and avoid" capability. The pilot can visually detect approaching aircraft and take evasion action.

For VLOS in ARC-b airspace, tactical mitigation through see-and-avoid is typically sufficient.

**Final ARC: ARC-b** (no reduction claimed, but VLOS provides adequate tactical mitigation)`,
        choices: [
          {
            id: 'to-sail',
            text: 'Proceed to SAIL determination',
            nextNode: 'sail-determination'
          }
        ]
      },

      'arc-c-assessment': {
        id: 'arc-c-assessment',
        type: 'situation',
        content: `ARC-c typically applies to:
- Controlled airspace
- Areas with moderate to high traffic density
- Airport environments

Your operation is in Class G (uncontrolled) with occasional traffic, not moderate traffic density.

ARC-c would be overly conservative for this operation.`,
        choices: [
          {
            id: 'revise-arc-b',
            text: 'ARC-b is more appropriate',
            nextNode: 'arc-b-correct'
          }
        ]
      },

      'sail-determination': {
        id: 'sail-determination',
        type: 'situation',
        content: `## SAIL Determination

You now have:
- **Final GRC:** 2 or 3 (depending on M1 mitigation)
- **Final ARC:** ARC-b

Using the SAIL matrix:

| | ARC-a | ARC-b | ARC-c | ARC-d |
|---|---|---|---|---|
| GRC ≤2 | I | II | IV | VI |
| GRC 3-4 | II | II | IV | VI |

What is your SAIL level?`,
        choices: [
          {
            id: 'sail-1',
            text: 'SAIL I',
            nextNode: 'sail-1-check'
          },
          {
            id: 'sail-2',
            text: 'SAIL II',
            nextNode: 'sail-2-correct'
          },
          {
            id: 'sail-3',
            text: 'SAIL III',
            nextNode: 'sail-3-check'
          }
        ]
      },

      'sail-1-check': {
        id: 'sail-1-check',
        type: 'situation',
        content: `SAIL I requires:
- GRC ≤ 2 AND
- ARC-a (atypical airspace)

Your operation has ARC-b, so SAIL I doesn't apply even if you achieved GRC 2.

Check the matrix again.`,
        choices: [
          {
            id: 'correct-sail-2',
            text: 'SAIL II is correct',
            nextNode: 'sail-2-correct'
          }
        ]
      },

      'sail-3-check': {
        id: 'sail-3-check',
        type: 'situation',
        content: `SAIL III requires:
- GRC 5-6 with ARC-a or ARC-b

Your GRC is 2 or 3, which is lower than the SAIL III threshold.

Check the matrix again.`,
        choices: [
          {
            id: 'correct-sail-2',
            text: 'SAIL II is correct',
            nextNode: 'sail-2-correct'
          }
        ]
      },

      'sail-2-correct': {
        id: 'sail-2-correct',
        type: 'positive',
        content: `Correct! **SAIL II**

Whether your GRC is 2 or 3, combined with ARC-b, the result is SAIL II.

SAIL II indicates:
- Low to medium overall risk
- Declaration-based approval may be possible
- Moderate OSO robustness requirements
- Self-certification acceptable for some elements

Now you need to identify applicable Operational Safety Objectives (OSOs).`,
        choices: [
          {
            id: 'to-osos',
            text: 'Review applicable OSOs',
            nextNode: 'oso-overview'
          }
        ]
      },

      'oso-overview': {
        id: 'oso-overview',
        type: 'situation',
        content: `## Operational Safety Objectives

For SAIL II, key OSOs require LOW to MEDIUM robustness:

**Technical OSOs:**
- OSO#01: UAS designed for controllability - LOW
- OSO#05: UAS behavior under abnormal conditions - LOW
- OSO#08: Procedures for safe recovery - LOW

**Operational OSOs:**
- OSO#11: Procedures defined and followed - LOW
- OSO#14: Abnormal situation planning - LOW
- OSO#16: Multi-crew coordination - LOW

**Training OSOs:**
- OSO#17: Crew competency - LOW to MEDIUM
- OSO#18: UAS maintained by competent personnel - LOW

For your client's operation, which OSO might need special attention?`,
        choices: [
          {
            id: 'oso-crew',
            text: 'OSO#17 - Crew competency verification',
            nextNode: 'crew-competency'
          },
          {
            id: 'oso-procedures',
            text: 'OSO#11 - Documented procedures',
            nextNode: 'procedures-focus'
          },
          {
            id: 'oso-all-easy',
            text: 'All OSOs are low robustness, should be straightforward',
            nextNode: 'all-osos'
          }
        ]
      },

      'crew-competency': {
        id: 'crew-competency',
        type: 'positive',
        content: `Good focus. OSO#17 (Crew competency) often requires attention even at low robustness.

For this operation, crew competency evidence should include:
- Valid pilot certificates (Advanced for powerline proximity)
- Type-specific training on the aircraft
- Emergency procedure proficiency
- Understanding of powerline-specific hazards

**Documentation needed:**
- Training records
- Certificate copies
- Proficiency check records

This should be documented even for SAIL II operations.`,
        choices: [
          {
            id: 'complete-assessment',
            text: 'Complete the SORA assessment',
            nextNode: 'assessment-complete'
          }
        ]
      },

      'procedures-focus': {
        id: 'procedures-focus',
        type: 'positive',
        content: `Good focus. OSO#11 (Procedures defined and followed) is fundamental.

For powerline inspection, procedures should cover:
- Mission planning specific to corridor operations
- Proximity to powerlines and EMI considerations
- Communication protocols
- Emergency procedures for this environment
- Coordination with utility company

Even at low robustness, procedures must be:
- Documented
- Accessible to crew
- Actually followed during operations`,
        choices: [
          {
            id: 'complete-assessment',
            text: 'Complete the SORA assessment',
            nextNode: 'assessment-complete'
          }
        ]
      },

      'all-osos': {
        id: 'all-osos',
        type: 'situation',
        content: `While the OSO robustness levels are low, "low" doesn't mean "none."

Low robustness still requires:
- Self-declaration that the OSO is met
- Basic documentation or evidence
- Ability to demonstrate compliance if asked

Even simple operations need proper documentation. The advantage of SAIL II is that third-party verification isn't required - but the operator must still meet the objectives.

Which OSO would you prioritize documenting?`,
        choices: [
          {
            id: 'prioritize-crew',
            text: 'Crew competency (OSO#17)',
            nextNode: 'crew-competency'
          },
          {
            id: 'prioritize-procedures',
            text: 'Procedures (OSO#11)',
            nextNode: 'procedures-focus'
          }
        ]
      },

      'assessment-complete': {
        id: 'assessment-complete',
        type: 'positive',
        content: `## SORA Assessment Summary

**Operation:** Powerline inspection, rural corridor
**Aircraft:** 7kg commercial quadcopter

**Ground Risk:**
- Intrinsic GRC: 3
- Mitigations: M1 possible with ground buffers
- Final GRC: 2-3

**Air Risk:**
- Initial ARC: ARC-b (uncontrolled, low traffic)
- Tactical Mitigation: VLOS see-and-avoid
- Final ARC: ARC-b

**SAIL Level: II**

**Key OSOs:** Crew competency, documented procedures, abnormal situation planning

**Authorization Pathway:** This operation may qualify for Advanced Operations rules or simplified SFOC process at SAIL II.`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Continue to debrief',
            nextNode: 'debrief'
          }
        ]
      },

      debrief: {
        id: 'debrief',
        type: 'debrief',
        content: `## Scenario Debrief: SORA Assessment

### SORA Methodology Summary

1. **ConOps Description** - Complete picture of the operation
2. **Ground Risk Class** - Based on aircraft and environment
3. **GRC Mitigations** - Where genuinely applicable
4. **Air Risk Class** - Based on airspace and traffic
5. **ARC Mitigations** - Strategic and tactical
6. **SAIL Determination** - Combined risk level
7. **OSO Identification** - Requirements based on SAIL

### Key Learning Points

1. **Gather Complete Information:** Both ground and air risk factors needed
2. **Be Realistic About Mitigations:** Only claim what you can demonstrate
3. **Use the Matrix Correctly:** GRC + ARC = SAIL
4. **OSOs Apply Even at Low SAIL:** Low robustness still requires compliance
5. **Document Everything:** Evidence supports authorization

### Authorization Implications

SAIL II operations may be authorized through:
- Advanced Operations rules (if applicable)
- Simplified SFOC process
- Organizational capability recognition

The SORA assessment provides the risk basis for regulatory decision-making.`,
        isTerminal: true
      }
    }
  },

  // Scenario: SFOC or Not?
  'sfoc-or-not-scenario': {
    id: 'sfoc-or-not-scenario',
    trackId: 'regulatory-compliance',
    questId: 'sfoc-applications',
    title: 'SFOC or Not?',
    description: 'Determine the correct authorization pathway for various RPAS operations.',
    difficulty: 'intermediate',
    estimatedTime: 12,
    xpReward: 75,
    context: `You're the operations manager for a commercial RPAS service company. Various clients are requesting operations, and you need to determine the correct authorization pathway for each.

Your pilots hold Advanced pilot certificates, and your aircraft range from 1kg to 15kg.`,

    initialNode: 'start',
    nodes: {
      start: {
        id: 'start',
        type: 'situation',
        content: `## Client Request #1: Real Estate Photography

**Request:** Aerial photos of a residential property for sale
**Location:** Suburban residential neighborhood
**Details:**
- Single property, 20-minute flight
- Standard hours (mid-morning)
- 1.5kg camera drone
- Flight up to 100m AGL
- Uncontrolled airspace

What authorization pathway applies?`,
        choices: [
          {
            id: 'req1-basic',
            text: 'Basic Operations - no special authorization needed',
            nextNode: 'req1-not-basic'
          },
          {
            id: 'req1-advanced',
            text: 'Advanced Operations - pilot certification sufficient',
            nextNode: 'req1-advanced-correct'
          },
          {
            id: 'req1-sfoc',
            text: 'SFOC required',
            nextNode: 'req1-not-sfoc'
          }
        ]
      },

      'req1-not-basic': {
        id: 'req1-not-basic',
        type: 'situation',
        content: `Basic Operations won't work here because:

The flight is in a residential area where bystanders may be within 30m horizontal distance. Basic Operations require 30m minimum distance from bystanders.

What's the correct pathway?`,
        choices: [
          {
            id: 'switch-advanced',
            text: 'Advanced Operations',
            nextNode: 'req1-advanced-correct'
          },
          {
            id: 'switch-sfoc',
            text: 'SFOC required',
            nextNode: 'req1-not-sfoc'
          }
        ]
      },

      'req1-not-sfoc': {
        id: 'req1-not-sfoc',
        type: 'situation',
        content: `SFOC is not required for this operation.

The operation meets Advanced Operations criteria:
- VLOS maintained
- Daytime operation
- Within altitude limits
- Pilot can fly within 30m of bystanders (but not directly over)

SFOC is for operations that CANNOT be done under Basic or Advanced rules. This one can.`,
        choices: [
          {
            id: 'understand-advanced',
            text: 'Advanced Operations is correct',
            nextNode: 'req1-advanced-correct'
          }
        ]
      },

      'req1-advanced-correct': {
        id: 'req1-advanced-correct',
        type: 'positive',
        content: `Correct! **Advanced Operations**

This operation fits Advanced rules:
- Residential area (potential bystanders within 30m)
- VLOS maintained
- Daytime
- Uncontrolled airspace
- Standard altitude

Requirements satisfied:
- Advanced pilot certificate
- RPAS registered
- Pilot carries certificate
- Flight rules followed

No SFOC needed. Proceed to the next request.`,
        choices: [
          {
            id: 'next-request',
            text: 'Continue to Request #2',
            nextNode: 'request-2'
          }
        ]
      },

      'request-2': {
        id: 'request-2',
        type: 'situation',
        content: `## Client Request #2: Pipeline Monitoring

**Request:** Routine pipeline patrol
**Location:** Remote northern region
**Details:**
- 15km of pipeline corridor
- BVLOS operations proposed
- 8kg fixed-wing aircraft
- Flight at 100m AGL
- Beyond visual line of sight from pilot

What authorization pathway applies?`,
        choices: [
          {
            id: 'req2-basic',
            text: 'Basic Operations',
            nextNode: 'req2-must-sfoc'
          },
          {
            id: 'req2-advanced',
            text: 'Advanced Operations',
            nextNode: 'req2-must-sfoc'
          },
          {
            id: 'req2-sfoc',
            text: 'SFOC required',
            nextNode: 'req2-sfoc-correct'
          }
        ]
      },

      'req2-must-sfoc': {
        id: 'req2-must-sfoc',
        type: 'situation',
        content: `Neither Basic nor Advanced Operations allow BVLOS.

**Both categories require Visual Line of Sight (VLOS):**
- Pilot must be able to see the aircraft unaided (or with corrective lenses)
- Sufficient to maintain awareness of position and direction
- Sufficient to see and avoid other aircraft

This pipeline operation is explicitly BVLOS - the aircraft will travel 15km while the pilot remains at a fixed location.

SFOC is mandatory.`,
        choices: [
          {
            id: 'confirm-sfoc',
            text: 'SFOC is required',
            nextNode: 'req2-sfoc-correct'
          }
        ]
      },

      'req2-sfoc-correct': {
        id: 'req2-sfoc-correct',
        type: 'positive',
        content: `Correct! **SFOC Required**

BVLOS operations cannot be conducted under Basic or Advanced rules.

SFOC application for this operation would need to address:
- Command and control link reliability
- Detect and avoid capability
- Lost link procedures
- Emergency procedures for remote area
- Population density along corridor
- Air risk in the operating area

BVLOS SFOCs typically require more extensive documentation and may take longer to process.`,
        choices: [
          {
            id: 'next-request-3',
            text: 'Continue to Request #3',
            nextNode: 'request-3'
          }
        ]
      },

      'request-3': {
        id: 'request-3',
        type: 'situation',
        content: `## Client Request #3: Night Event Coverage

**Request:** Aerial coverage of outdoor concert
**Location:** City park amphitheater
**Details:**
- Evening event, operations after sunset
- Large crowd (5,000+ attendees)
- 2kg camera drone
- Flight up to 60m AGL
- Controlled airspace (with authorization obtained)

What authorization pathway applies?`,
        choices: [
          {
            id: 'req3-advanced',
            text: 'Advanced Operations with airspace authorization',
            nextNode: 'req3-issues'
          },
          {
            id: 'req3-sfoc-night',
            text: 'SFOC required due to night operations',
            nextNode: 'req3-both-issues'
          },
          {
            id: 'req3-sfoc-crowd',
            text: 'SFOC required due to operations over crowd',
            nextNode: 'req3-both-issues'
          }
        ]
      },

      'req3-issues': {
        id: 'req3-issues',
        type: 'situation',
        content: `Advanced Operations won't work here. There are multiple issues:

1. **Night Operations:** Operations after civil twilight require SFOC
2. **Gathering of People:** Flight over large crowds has specific requirements

Even with airspace authorization, these factors require SFOC.

What's the correct assessment?`,
        choices: [
          {
            id: 'both-factors',
            text: 'SFOC required for multiple factors',
            nextNode: 'req3-full-assessment'
          }
        ]
      },

      'req3-both-issues': {
        id: 'req3-both-issues',
        type: 'positive',
        content: `Good identification, but this operation actually has TWO factors requiring SFOC:

1. **Night Operations:** Flight after end of civil twilight
2. **Gatherings:** Flight over organized crowd of 5,000+

Either factor alone would require SFOC. Together, this is a complex operation requiring thorough risk assessment.`,
        choices: [
          {
            id: 'see-full',
            text: 'See full assessment',
            nextNode: 'req3-full-assessment'
          }
        ]
      },

      'req3-full-assessment': {
        id: 'req3-full-assessment',
        type: 'positive',
        content: `**SFOC Required - Multiple Factors**

This operation requires SFOC because:

1. **Night operations:** After civil twilight
   - Requires lighting for aircraft visibility
   - Enhanced situational awareness measures
   - Pilot night proficiency

2. **Gatherings of people:**
   - Special risk assessment for crowd safety
   - Higher consequence potential
   - Enhanced reliability requirements

SFOC application would need:
- Night operations procedures
- Crowd safety mitigations
- Emergency response for crowd environment
- Enhanced aircraft reliability demonstration

This would be a significant SFOC application requiring substantial documentation.`,
        choices: [
          {
            id: 'next-request-4',
            text: 'Continue to Request #4',
            nextNode: 'request-4'
          }
        ]
      },

      'request-4': {
        id: 'request-4',
        type: 'situation',
        content: `## Client Request #4: Agricultural Survey

**Request:** Crop health assessment
**Location:** Large farm property
**Details:**
- Flight over owner's farmland
- Daylight hours
- 5kg multispectral drone
- 120m AGL maximum
- Uncontrolled airspace
- No public access to property during operations

What authorization pathway applies?`,
        choices: [
          {
            id: 'req4-basic',
            text: 'Basic Operations',
            nextNode: 'req4-basic-possible'
          },
          {
            id: 'req4-advanced',
            text: 'Advanced Operations',
            nextNode: 'req4-advanced-fine'
          },
          {
            id: 'req4-sfoc',
            text: 'SFOC required',
            nextNode: 'req4-no-sfoc'
          }
        ]
      },

      'req4-basic-possible': {
        id: 'req4-basic-possible',
        type: 'situation',
        content: `Basic Operations could work IF:
- No bystanders within 30m
- Property is secured from public access
- All persons present are participants

The scenario mentions no public access during operations. However, consider:
- Farm workers may be present
- 120m AGL approaches the 400ft limit
- Commercial operation typically warrants Advanced certificate

What's your assessment?`,
        choices: [
          {
            id: 'stick-basic',
            text: 'Basic is fine - it\'s controlled private property',
            nextNode: 'req4-basic-caution'
          },
          {
            id: 'choose-advanced',
            text: 'Advanced is more appropriate for commercial operations',
            nextNode: 'req4-advanced-fine'
          }
        ]
      },

      'req4-basic-caution': {
        id: 'req4-basic-caution',
        type: 'neutral',
        content: `Basic Operations is technically possible, but consider:

**Reasons to use Advanced anyway:**
- Commercial operations warrant higher standards
- Advanced certificate demonstrates professionalism
- Farm workers may be present (bystander considerations)
- 120m AGL is near limits - better margin with Advanced

**Business perspective:**
- Clients expect professional qualifications
- Insurance may require Advanced for commercial work
- Consistent approach across operations

Most commercial operators maintain Advanced certification regardless of whether specific flights could be Basic.`,
        choices: [
          {
            id: 'final-assessment-4',
            text: 'Understood - Advanced is the professional choice',
            nextNode: 'req4-advanced-fine'
          }
        ]
      },

      'req4-advanced-fine': {
        id: 'req4-advanced-fine',
        type: 'positive',
        content: `**Advanced Operations** is appropriate here.

This is a straightforward commercial operation:
- VLOS maintained
- Daytime
- Uncontrolled airspace
- Within altitude limits
- Professional service

No SFOC factors:
- Not BVLOS
- Not night
- Not over gatherings
- Not in restricted airspace
- Within standard parameters

Advanced certificate and standard procedures are sufficient.`,
        choices: [
          {
            id: 'next-request-5',
            text: 'Continue to final request',
            nextNode: 'request-5'
          }
        ]
      },

      'req4-no-sfoc': {
        id: 'req4-no-sfoc',
        type: 'situation',
        content: `This operation doesn't have any SFOC-requiring factors:
- VLOS maintained
- Daytime operations
- Uncontrolled airspace
- Standard altitudes
- No special circumstances

SFOC is for operations OUTSIDE normal rules. This one fits within standard parameters.`,
        choices: [
          {
            id: 'revise-to-advanced',
            text: 'Advanced Operations is sufficient',
            nextNode: 'req4-advanced-fine'
          }
        ]
      },

      'request-5': {
        id: 'request-5',
        type: 'situation',
        content: `## Client Request #5: Bridge Inspection

**Request:** Structural inspection of highway bridge
**Location:** Over major highway
**Details:**
- Daylight hours
- 3kg inspection drone
- Need to fly under the bridge deck
- Traffic will NOT be stopped
- Uncontrolled airspace

What authorization pathway applies?`,
        choices: [
          {
            id: 'req5-advanced',
            text: 'Advanced Operations - standard inspection work',
            nextNode: 'req5-consider-factors'
          },
          {
            id: 'req5-sfoc-traffic',
            text: 'SFOC required - flying over moving traffic',
            nextNode: 'req5-sfoc-analysis'
          },
          {
            id: 'req5-refuse',
            text: 'This operation should not be conducted as described',
            nextNode: 'req5-good-catch'
          }
        ]
      },

      'req5-consider-factors': {
        id: 'req5-consider-factors',
        type: 'situation',
        content: `Consider the risk factors:

- Flying over an active highway with traffic
- Vehicles are moving at high speed
- In case of aircraft failure, impact with vehicles is possible
- This goes beyond normal "bystander" considerations

Is Advanced Operations really sufficient for this risk profile?`,
        choices: [
          {
            id: 'need-sfoc-5',
            text: 'SFOC would be more appropriate',
            nextNode: 'req5-sfoc-analysis'
          },
          {
            id: 'operation-issues',
            text: 'The operation concept has fundamental issues',
            nextNode: 'req5-good-catch'
          }
        ]
      },

      'req5-sfoc-analysis': {
        id: 'req5-sfoc-analysis',
        type: 'situation',
        content: `SFOC might address regulatory requirements, but consider:

**Risk factors:**
- High-speed traffic below
- Limited emergency landing options
- Potential for catastrophic outcome
- Under-bridge flight has obstacle hazards

**Risk mitigation options:**
- Stop traffic during critical phases?
- Fly only during low-traffic periods?
- Use tethered system?

Would Transport Canada likely approve this operation as described?`,
        choices: [
          {
            id: 'reconceptualize',
            text: 'The operation needs reconceptualization',
            nextNode: 'req5-good-catch'
          },
          {
            id: 'try-anyway',
            text: 'Apply for SFOC and see what happens',
            nextNode: 'req5-poor-approach'
          }
        ]
      },

      'req5-good-catch': {
        id: 'req5-good-catch',
        type: 'positive',
        content: `**Excellent risk assessment.**

This operation as described has fundamental safety issues:
- Unacceptable risk to highway traffic
- Limited mitigation possible with traffic flowing
- Emergency landing options severely constrained

**Better approach:**
The operation should be reconceptualized:
1. Coordinate with highway authority
2. Stop traffic during critical flight phases
3. OR fly during planned road closures
4. OR use tethered system where appropriate
5. Apply for SFOC with proper mitigations

Sometimes the right answer is "not as described." Professional operators identify unacceptable risk and propose alternatives.`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Complete scenario',
            nextNode: 'debrief'
          }
        ]
      },

      'req5-poor-approach': {
        id: 'req5-poor-approach',
        type: 'negative',
        content: `"Apply and see" is not a professional approach.

**Problems:**
- Wastes Transport Canada resources
- Damages your organization's credibility
- Shows lack of risk assessment capability
- Application will likely be rejected or require major changes

**Professional approach:**
- Identify risk issues upfront
- Propose mitigated operation concept
- Discuss with Transport Canada before formal application
- Submit well-developed applications

Your role includes advising clients when their requested operation needs modification for safety and regulatory compliance.`,
        choices: [
          {
            id: 'understand-approach',
            text: 'Better to reconceptualize first',
            nextNode: 'req5-good-catch'
          }
        ]
      },

      debrief: {
        id: 'debrief',
        type: 'debrief',
        content: `## Scenario Debrief: SFOC or Not?

### Authorization Pathway Decision Tree

**Does the operation require VLOS?**
- Yes, and VLOS will be maintained → Continue
- No, BVLOS required → SFOC

**Is it during daylight/civil twilight?**
- Yes → Continue
- No, night operations → SFOC

**Is it in standard airspace at standard altitudes?**
- Yes → Continue
- No → May need SFOC

**Are there gatherings or special population considerations?**
- No special factors → Basic or Advanced may apply
- Yes, gatherings/special situations → SFOC likely needed

### Key Learning Points

1. **Know the boundaries:** Basic, Advanced, and SFOC have clear distinctions
2. **SFOC factors:** BVLOS, night, gatherings, special airspace, exceeding limits
3. **Commercial standards:** Advanced is typically appropriate for professional work
4. **Risk assessment:** Some operations need reconceptualization, not just authorization
5. **Professional judgment:** Know when to advise clients on operation modifications

### Practical Application

Before accepting any operation:
1. Map it against Basic/Advanced criteria
2. Identify any SFOC-requiring factors
3. Assess if operation concept is sound
4. Propose modifications if needed
5. Apply for appropriate authorization`,
        isTerminal: true
      }
    }
  }
}

export default regulatoryScenarios
