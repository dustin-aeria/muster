/**
 * Risk & Hazard Management Scenarios
 *
 * Interactive decision-tree scenarios for risk assessment and hazard management training.
 *
 * @version 1.0.0
 */

const riskScenarios = {
  // Scenario: Assess This Risk
  'assess-this-risk': {
    id: 'assess-this-risk',
    trackId: 'risk-hazard-management',
    questId: 'risk-assessment-methods',
    title: 'Assess This Risk',
    description: 'Apply the risk matrix to evaluate a real operational scenario and determine appropriate action.',
    difficulty: 'intermediate',
    estimatedTime: 12,
    xpReward: 75,
    context: `You're planning an RPAS operation for a client who needs aerial photography of a construction site. During your site survey, you've identified several hazards. Now you need to assess the risks and determine if the operation can proceed safely.`,

    initialNode: 'start',
    nodes: {
      start: {
        id: 'start',
        type: 'situation',
        content: `## Site Survey Findings

You've completed your site survey and identified the following hazards:

**Hazard 1: Crane Operations**
An active tower crane is operating on site. It swings through portions of your planned flight area.

**Hazard 2: Power Lines**
High-voltage power lines run along the eastern boundary, approximately 50m from your planned flight path.

**Hazard 3: Worker Activity**
Approximately 20 construction workers are active on site during your proposed operation time.

You need to assess each hazard using the 5x5 risk matrix.

Let's start with the crane. What's your initial assessment?`,
        choices: [
          {
            id: 'crane-low',
            text: 'Low risk - cranes are slow and predictable',
            nextNode: 'crane-underestimate'
          },
          {
            id: 'crane-medium',
            text: 'Medium risk - potential for conflict but manageable',
            nextNode: 'crane-medium-assessment'
          },
          {
            id: 'crane-high',
            text: 'High risk - dynamic obstacle in flight area',
            nextNode: 'crane-correct'
          }
        ]
      },

      'crane-underestimate': {
        id: 'crane-underestimate',
        type: 'situation',
        content: `Consider this more carefully.

**Crane Hazard Analysis:**

**Likelihood:** The crane IS operating in your flight area, so encounter is LIKELY (4)

**Severity:** A collision could result in:
- Aircraft destruction
- Crane damage
- Falling debris
- Potential injury to workers below

This is potentially MAJOR severity (4).

Risk = 4 × 4 = 16 (HIGH/EXTREME)

Is "low risk" still your assessment?`,
        choices: [
          {
            id: 'revise-crane',
            text: 'Revise to HIGH risk - this needs serious attention',
            nextNode: 'crane-correct'
          },
          {
            id: 'still-low',
            text: 'Stick with low - I\'ll just avoid the crane',
            nextNode: 'crane-denial'
          }
        ]
      },

      'crane-denial': {
        id: 'crane-denial',
        type: 'negative',
        content: `"I'll just avoid it" is not a risk assessment - it's wishful thinking.

**The crane presents HIGH risk because:**
- The swing arc may not be predictable
- Crane movements can be sudden
- Your attention will be divided
- GPS/compass interference may occur near metal structures

**Consequences of underestimating:**
If you proceed without proper mitigations and have a crane collision, you're facing:
- Equipment loss
- Potential injury liability
- Regulatory consequences
- Client relationship damage

Risk assessment must be honest about actual risk levels.`,
        choices: [
          {
            id: 'accept-reality',
            text: 'Accept that this is HIGH risk and needs mitigation',
            nextNode: 'crane-correct'
          }
        ]
      },

      'crane-medium-assessment': {
        id: 'crane-medium-assessment',
        type: 'situation',
        content: `Medium risk might be reasonable IF the crane weren't actively operating in your flight area.

**Let's break it down:**

**Likelihood:**
- Crane is active during operation ✓
- Swing arc overlaps flight area ✓
- Dynamic, unpredictable movements ✓
This is at least LIKELY (4), possibly ALMOST CERTAIN (5)

**Severity:**
- Collision would destroy aircraft
- Could damage crane or load
- Debris risk to workers
This is MAJOR (4) to CATASTROPHIC (5)

Risk = 4×4 = 16 minimum

This moves it into HIGH/EXTREME territory, not medium.`,
        choices: [
          {
            id: 'upgrade-assessment',
            text: 'Upgrade to HIGH risk assessment',
            nextNode: 'crane-correct'
          }
        ]
      },

      'crane-correct': {
        id: 'crane-correct',
        type: 'positive',
        content: `Correct. **Crane = HIGH RISK**

**Assessment:**
- Likelihood: 4 (Likely - crane actively operating in area)
- Severity: 4 (Major - collision, damage, debris)
- Risk Score: 16 (HIGH)

**This risk level requires:**
- Specific mitigation measures
- Cannot proceed without risk reduction
- Consider if operation is feasible at this time

Now let's assess the power lines. What's your assessment?`,
        choices: [
          {
            id: 'power-low',
            text: 'Low risk - they\'re 50m away',
            nextNode: 'power-assessment'
          },
          {
            id: 'power-medium',
            text: 'Medium risk - they\'re close but avoidable',
            nextNode: 'power-assessment'
          },
          {
            id: 'power-high',
            text: 'High risk - power lines are always dangerous',
            nextNode: 'power-assessment'
          }
        ]
      },

      'power-assessment': {
        id: 'power-assessment',
        type: 'situation',
        content: `Let's assess the power lines systematically.

**Power Line Hazard:**

**Distance:** 50m from planned flight path

**Likelihood factors:**
- Flight path doesn't cross lines ✓
- 50m provides reasonable buffer ✓
- BUT: GPS errors, wind drift, or inattention could bring aircraft closer

**Likelihood:** POSSIBLE (3) - could happen but not expected if procedures followed

**Severity:**
- Contact would destroy aircraft
- Could damage power infrastructure
- Electrocution risk if lines damaged
- Potential widespread impact

**Severity:** MAJOR (4) - serious consequences

**Risk = 3 × 4 = 12 (HIGH)**

Even at 50m, power lines warrant HIGH risk assessment due to severity.

What mitigation could reduce this risk?`,
        choices: [
          {
            id: 'buffer-mitigation',
            text: 'Plan flight path with 100m minimum buffer',
            nextNode: 'power-good-mitigation'
          },
          {
            id: 'geo-fence',
            text: 'Set geo-fence to prevent approach',
            nextNode: 'power-good-mitigation'
          },
          {
            id: 'vo-watch',
            text: 'Have VO specifically monitor power line proximity',
            nextNode: 'power-partial-mitigation'
          }
        ]
      },

      'power-good-mitigation': {
        id: 'power-good-mitigation',
        type: 'positive',
        content: `Excellent mitigation choice.

**Engineering controls** (geo-fence, flight path design) are more reliable than administrative controls.

**After mitigation:**
- Likelihood: 2 (Unlikely - physical/technical barriers prevent approach)
- Severity: 4 (unchanged - consequences still severe if contact)
- Residual Risk: 8 (MEDIUM)

**Medium residual risk is acceptable** with:
- VO awareness
- Weather monitoring
- Emergency procedures briefed

Now let's assess the worker activity.`,
        choices: [
          {
            id: 'assess-workers',
            text: 'Proceed to worker assessment',
            nextNode: 'worker-assessment'
          }
        ]
      },

      'power-partial-mitigation': {
        id: 'power-partial-mitigation',
        type: 'situation',
        content: `VO monitoring is a good **additional** control, but it's administrative - it depends on human attention.

For HIGH-risk hazards, prefer engineering controls:
- Geo-fencing
- Flight path design with buffer
- Altitude limits

**VO monitoring as primary control:**
- Likelihood: 3 (still possible if VO is distracted)
- Risk: 12 (still HIGH)

**VO monitoring with engineering controls:**
- Likelihood: 2 (reduced by technical barriers)
- Risk: 8 (MEDIUM)

Would you add an engineering control?`,
        choices: [
          {
            id: 'add-engineering',
            text: 'Add geo-fence or flight path buffer',
            nextNode: 'power-good-mitigation'
          },
          {
            id: 'vo-only',
            text: 'VO monitoring should be enough',
            nextNode: 'vo-insufficient'
          }
        ]
      },

      'vo-insufficient': {
        id: 'vo-insufficient',
        type: 'situation',
        content: `Relying solely on human vigilance for HIGH-risk hazards is not best practice.

**Why administrative controls alone are insufficient:**
- VO attention can be divided
- Fatigue reduces vigilance
- Unexpected events distract
- No physical prevention of approach

The hierarchy of controls tells us to prefer:
1. Elimination (not flying near lines)
2. Engineering (geo-fence, flight planning)
3. Administrative (VO monitoring)

For power line proximity, engineering controls should be primary.`,
        choices: [
          {
            id: 'understand-add',
            text: 'Understood - add engineering controls',
            nextNode: 'power-good-mitigation'
          }
        ]
      },

      'worker-assessment': {
        id: 'worker-assessment',
        type: 'situation',
        content: `## Worker Activity Assessment

**Hazard:** 20 construction workers active on site

**Questions to consider:**
- Will you fly over workers?
- What's the minimum distance?
- What are workers doing (looking up? focused down?)
- What's your aircraft weight?

**Scenario details:**
- Workers are spread across the site
- Your flight path avoids direct overflights
- Minimum distance will be approximately 25m horizontal
- Your aircraft is 3kg

How do you assess this risk?`,
        choices: [
          {
            id: 'workers-high',
            text: 'HIGH risk - people could be injured',
            nextNode: 'workers-high-analysis'
          },
          {
            id: 'workers-medium',
            text: 'MEDIUM risk - close but not overflying',
            nextNode: 'workers-medium-correct'
          },
          {
            id: 'workers-low',
            text: 'LOW risk - keeping 25m distance',
            nextNode: 'workers-low-analysis'
          }
        ]
      },

      'workers-high-analysis': {
        id: 'workers-high-analysis',
        type: 'situation',
        content: `HIGH might be overly conservative given the specifics.

**Analysis:**

**Likelihood of striking a worker:**
- Not flying directly over ✓
- 25m horizontal distance maintained ✓
- Workers are construction-aware (PPE, safety culture) ✓
- Likelihood: UNLIKELY (2) with proper procedures

**Severity if strike occurred:**
- 3kg aircraft at speed could cause injury
- Severity: MODERATE (3) to MAJOR (4)

**Risk: 2 × 3 = 6 (MEDIUM) or 2 × 4 = 8 (MEDIUM)**

This is MEDIUM risk, not HIGH, given the mitigations already in place (no overflights, 25m distance).`,
        choices: [
          {
            id: 'accept-medium-workers',
            text: 'Accept MEDIUM risk assessment',
            nextNode: 'workers-medium-correct'
          }
        ]
      },

      'workers-low-analysis': {
        id: 'workers-low-analysis',
        type: 'situation',
        content: `LOW risk (scores 1-4) would mean minimal concern.

**But consider:**
- 25m is relatively close
- Unexpected movements happen
- Loss of control could send aircraft toward workers
- 3kg at speed can cause significant injury

**Severity alone is at least MODERATE (3)**

Even with UNLIKELY (2), that's Risk = 6 (MEDIUM, not LOW)

For operations near people, err toward conservative assessment.`,
        choices: [
          {
            id: 'upgrade-medium-workers',
            text: 'Upgrade to MEDIUM risk',
            nextNode: 'workers-medium-correct'
          }
        ]
      },

      'workers-medium-correct': {
        id: 'workers-medium-correct',
        type: 'positive',
        content: `**MEDIUM risk is appropriate.**

**Worker Proximity Assessment:**
- Likelihood: 2 (Unlikely - 25m distance, no overflights)
- Severity: 3-4 (Moderate to Major if contact)
- Risk: 6-8 (MEDIUM)

**This is acceptable with:**
- Maintained distance protocols
- Worker awareness/briefing
- VO monitoring
- Clear abort procedures
- PPE on workers

Now let's combine all three hazards for an overall operation decision.`,
        choices: [
          {
            id: 'final-decision',
            text: 'Make overall operation decision',
            nextNode: 'combined-assessment'
          }
        ]
      },

      'combined-assessment': {
        id: 'combined-assessment',
        type: 'situation',
        content: `## Combined Risk Assessment

**Hazard Summary:**

| Hazard | Initial Risk | Mitigated Risk |
|--------|--------------|----------------|
| Crane | HIGH (16) | ??? |
| Power Lines | HIGH (12) | MEDIUM (8) |
| Workers | MEDIUM (6-8) | MEDIUM (6-8) |

**The crane remains unaddressed.**

Current assessment:
- Crane actively operating in flight area
- No mitigation identified yet
- Risk remains HIGH (16)

What's your recommendation for the operation?`,
        choices: [
          {
            id: 'proceed-anyway',
            text: 'Proceed - we\'ll work around the crane',
            nextNode: 'proceed-unmitigated'
          },
          {
            id: 'mitigate-crane',
            text: 'Identify crane mitigation before proceeding',
            nextNode: 'crane-mitigation'
          },
          {
            id: 'postpone',
            text: 'Postpone until crane operations stop',
            nextNode: 'postpone-option'
          }
        ]
      },

      'proceed-unmitigated': {
        id: 'proceed-unmitigated',
        type: 'negative',
        content: `**This would be proceeding with unacceptable risk.**

"Working around" an active crane in your flight area is not a mitigation - it's hope.

**HIGH/EXTREME risk operations should NOT proceed without:**
- Documented mitigation measures
- Verified risk reduction
- Management approval for residual risk
- Clear operational limits

Proceeding with unmitigated HIGH risk exposes you to:
- Equipment loss
- Potential injury
- Regulatory violation
- Professional liability`,
        choices: [
          {
            id: 'reconsider',
            text: 'Reconsider - identify proper mitigations',
            nextNode: 'crane-mitigation'
          }
        ]
      },

      'crane-mitigation': {
        id: 'crane-mitigation',
        type: 'situation',
        content: `Good thinking. Let's identify crane mitigations.

**Possible mitigations:**

**Elimination:**
- Schedule operation when crane isn't operating
- Use different flight area avoiding crane swing

**Engineering:**
- Geo-fence excluding crane swing arc
- Altitude restrictions to stay clear

**Administrative:**
- Coordination with crane operator (radio contact)
- Defined crane-free windows
- Immediate abort if crane moves toward area

**Which mitigation would you implement?**`,
        choices: [
          {
            id: 'schedule-around',
            text: 'Schedule operation during crane downtime',
            nextNode: 'schedule-solution'
          },
          {
            id: 'coordinate-crane',
            text: 'Coordinate with crane operator for defined windows',
            nextNode: 'coordination-solution'
          },
          {
            id: 'admin-only',
            text: 'Just monitor and abort if needed',
            nextNode: 'admin-insufficient'
          }
        ]
      },

      'schedule-solution': {
        id: 'schedule-solution',
        type: 'positive',
        content: `**Excellent - elimination is the most effective control.**

**Scheduling around crane operations:**
- Eliminates the hazard entirely
- No risk of crane conflict
- Simplifies operation planning

**New assessment:**
- Likelihood: 1 (Rare - crane not operating)
- Severity: 4 (unchanged if somehow it did)
- Residual Risk: 4 (LOW)

**Implementation:**
- Confirm crane schedule with site manager
- Document in operational plan
- Have contingency if crane starts unexpectedly`,
        choices: [
          {
            id: 'final-summary',
            text: 'Complete risk assessment',
            nextNode: 'final-assessment'
          }
        ]
      },

      'coordination-solution': {
        id: 'coordination-solution',
        type: 'positive',
        content: `**Good option - coordination as an engineering-equivalent control.**

**Coordination with crane operator:**
- Defined "crane hold" windows for your flights
- Radio communication during operations
- Clear protocol if crane needs to move

**Assessment with coordination:**
- Likelihood: 2 (Unlikely - crane held during flights)
- Severity: 4 (unchanged)
- Residual Risk: 8 (MEDIUM)

**This is acceptable with:**
- Written agreement with crane operator
- Radio confirmation before each flight
- Clear abort procedure
- VO monitoring crane status`,
        choices: [
          {
            id: 'final-summary',
            text: 'Complete risk assessment',
            nextNode: 'final-assessment'
          }
        ]
      },

      'admin-insufficient': {
        id: 'admin-insufficient',
        type: 'situation',
        content: `"Monitor and abort" is not sufficient mitigation for HIGH risk.

**Problems with reactive approach:**
- Crane can move quickly
- You may not notice in time
- Aborting mid-flight may not clear the area
- Relies entirely on attention and reaction

**For HIGH risk hazards:**
- Need proactive controls
- Engineering or elimination preferred
- Administrative controls as supplement, not primary

Would you add a more robust mitigation?`,
        choices: [
          {
            id: 'add-robust',
            text: 'Add scheduling or coordination controls',
            nextNode: 'crane-mitigation'
          }
        ]
      },

      'postpone-option': {
        id: 'postpone-option',
        type: 'positive',
        content: `**Postponement is a valid risk management decision.**

Sometimes the right answer is "not now."

**Factors supporting postponement:**
- HIGH risk that's difficult to mitigate
- Client timeline may flex
- Better conditions available later
- Safety always trumps schedule

**Before postponing, consider:**
- Can the hazard be scheduled around?
- Is coordination possible?
- What's the client impact?

If mitigation is possible and practical, it may be better than postponement.`,
        choices: [
          {
            id: 'explore-mitigation',
            text: 'Explore mitigation options first',
            nextNode: 'crane-mitigation'
          },
          {
            id: 'confirm-postpone',
            text: 'Confirm postponement is the right choice',
            nextNode: 'postpone-final'
          }
        ]
      },

      'postpone-final': {
        id: 'postpone-final',
        type: 'positive',
        content: `Postponement accepted as appropriate risk management.

**Document your decision:**
- Hazard identified: Active crane operations
- Risk level: HIGH (16)
- Mitigation options explored: Limited
- Decision: Postpone until crane operations complete
- Rationale: Risk cannot be adequately reduced

**Follow-up:**
- Inform client of delay and reason
- Monitor site for schedule opportunity
- Update risk assessment when conditions change

**This is professional risk management** - declining to proceed when risk cannot be acceptably mitigated.`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Complete scenario',
            nextNode: 'debrief'
          }
        ]
      },

      'final-assessment': {
        id: 'final-assessment',
        type: 'positive',
        content: `## Final Risk Assessment

**Hazard Summary (With Mitigations):**

| Hazard | Initial | Mitigation | Residual |
|--------|---------|------------|----------|
| Crane | HIGH (16) | Schedule/Coordinate | LOW-MED |
| Power Lines | HIGH (12) | Geo-fence + Buffer | MEDIUM (8) |
| Workers | MEDIUM (8) | Distance + Awareness | MEDIUM (6) |

**Overall Operation Risk: MEDIUM**

**Acceptable to proceed with:**
- All mitigations documented and implemented
- Crew briefed on specific hazards
- Clear abort criteria
- VO assignments for each hazard
- Emergency procedures prepared

**Documentation required:**
- Completed risk assessment form
- Mitigation measure details
- Crew briefing record
- Client site coordination confirmation`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Complete scenario',
            nextNode: 'debrief'
          }
        ]
      },

      debrief: {
        id: 'debrief',
        type: 'debrief',
        content: `## Scenario Debrief: Assess This Risk

### Risk Assessment Process

1. **Identify all hazards** during site survey
2. **Assess each hazard** using consistent methodology (5x5 matrix)
3. **Determine unmitigated risk** honestly
4. **Apply mitigations** following hierarchy of controls
5. **Assess residual risk** after mitigations
6. **Make go/no-go decision** based on acceptable risk levels

### Key Learning Points

1. **Be honest about risk levels** - underestimating doesn't reduce actual risk
2. **HIGH risk requires mitigation** before proceeding
3. **Prefer engineering controls** over administrative for serious hazards
4. **Elimination is most effective** - schedule around hazards when possible
5. **Postponement is valid** when risk cannot be adequately reduced
6. **Document everything** - assessment, mitigations, decisions

### Control Hierarchy Reminder

1. Elimination (remove the hazard)
2. Substitution (replace with less hazardous)
3. Engineering (physical/technical controls)
4. Administrative (procedures, training)
5. PPE (personal protection)

Use the highest level of control available for each hazard.`,
        isTerminal: true
      }
    }
  },

  // Scenario: Control Selection
  'control-selection': {
    id: 'control-selection',
    trackId: 'risk-hazard-management',
    questId: 'control-measures',
    title: 'Control Selection',
    description: 'Choose the most appropriate control measures for various hazards.',
    difficulty: 'intermediate',
    estimatedTime: 10,
    xpReward: 75,
    context: `You're developing a risk assessment for a recurring monthly inspection operation at an industrial facility. For each hazard identified, you need to select the most appropriate control measures.`,

    initialNode: 'start',
    nodes: {
      start: {
        id: 'start',
        type: 'situation',
        content: `## Hazard 1: GPS Interference

During site survey, you discovered intermittent GPS signal degradation near a large metal structure. Your aircraft relies on GPS for position hold and RTH functions.

**Current situation:**
- GPS drops to 4-6 satellites periodically
- Position hold becomes unreliable
- RTH might malfunction

What control would you implement?`,
        choices: [
          {
            id: 'gps-avoid',
            text: 'Plan flight path to avoid the interference zone',
            nextNode: 'gps-engineering-good'
          },
          {
            id: 'gps-training',
            text: 'Train pilots to fly in attitude mode when GPS degrades',
            nextNode: 'gps-admin-partial'
          },
          {
            id: 'gps-warning',
            text: 'Brief crew about the interference and monitor telemetry',
            nextNode: 'gps-awareness-only'
          }
        ]
      },

      'gps-engineering-good': {
        id: 'gps-engineering-good',
        type: 'positive',
        content: `Excellent choice. **Flight path design is an engineering control.**

**Why this works:**
- Eliminates exposure to the hazard
- Doesn't depend on pilot reaction
- Works regardless of conditions
- No additional training needed

**Implementation:**
- Map the interference zone
- Design flight path with adequate buffer
- Set geo-fence if available
- Document in operational procedures

This is an example of using engineering control (flight planning) to eliminate exposure.`,
        choices: [
          {
            id: 'next-hazard-1',
            text: 'Proceed to next hazard',
            nextNode: 'hazard-2'
          }
        ]
      },

      'gps-admin-partial': {
        id: 'gps-admin-partial',
        type: 'situation',
        content: `Attitude mode training is useful but is an **administrative control**.

**Limitations:**
- Requires skilled response under pressure
- Not all pilots may be proficient
- Reaction time varies
- Still exposed to the hazard

**Better approach:**
Combine with engineering control:
- Primary: Avoid the interference zone (engineering)
- Backup: Attitude mode capability (administrative)

Would you add flight path planning as the primary control?`,
        choices: [
          {
            id: 'add-engineering',
            text: 'Yes - add flight path avoidance as primary',
            nextNode: 'gps-combined'
          },
          {
            id: 'training-enough',
            text: 'No - training should be sufficient',
            nextNode: 'training-insufficient'
          }
        ]
      },

      'training-insufficient': {
        id: 'training-insufficient',
        type: 'situation',
        content: `Relying solely on training for a predictable hazard is not best practice.

**Why engineering is preferred:**
- GPS interference is predictable and avoidable
- We know exactly where it occurs
- Flight planning is straightforward
- Why expose pilots to unnecessary challenge?

Training is valuable as backup, but avoidable hazards should be avoided.

The hierarchy of controls exists for a reason - higher controls are more reliable.`,
        choices: [
          {
            id: 'accept-engineering',
            text: 'Understood - add engineering control',
            nextNode: 'gps-combined'
          }
        ]
      },

      'gps-combined': {
        id: 'gps-combined',
        type: 'positive',
        content: `**Correct combined approach:**

**Primary (Engineering):** Flight path avoids interference zone
**Backup (Administrative):** Pilots trained in attitude mode

This provides defense in depth:
- Normal operations never enter interference zone
- If something unexpected happens, pilots can respond

This is good control selection - engineering first, administrative as backup.`,
        choices: [
          {
            id: 'next-hazard-1',
            text: 'Proceed to next hazard',
            nextNode: 'hazard-2'
          }
        ]
      },

      'gps-awareness-only': {
        id: 'gps-awareness-only',
        type: 'situation',
        content: `Awareness and monitoring is the weakest form of control.

**Problems:**
- Doesn't prevent the hazard from occurring
- Requires constant vigilance
- Detection may come too late
- No planned response

For a KNOWN, PREDICTABLE hazard like this, much stronger controls are available.

The hierarchy of controls tells us to prefer elimination or engineering over awareness.`,
        choices: [
          {
            id: 'choose-better',
            text: 'Select a more effective control',
            nextNode: 'start'
          }
        ]
      },

      'hazard-2': {
        id: 'hazard-2',
        type: 'situation',
        content: `## Hazard 2: Hot Surfaces

The industrial facility has process equipment with surface temperatures exceeding 150°C. Your aircraft may pass within 10m during inspection.

**Concerns:**
- Heat damage to aircraft components
- Thermal updrafts affecting flight
- Battery temperature increase

What control would you implement?`,
        choices: [
          {
            id: 'heat-distance',
            text: 'Maintain minimum 20m distance from hot surfaces',
            nextNode: 'heat-distance-good'
          },
          {
            id: 'heat-time',
            text: 'Limit exposure time near hot areas',
            nextNode: 'heat-time-partial'
          },
          {
            id: 'heat-ppe',
            text: 'Use heat-resistant aircraft components',
            nextNode: 'heat-engineering-option'
          }
        ]
      },

      'heat-distance-good': {
        id: 'heat-distance-good',
        type: 'positive',
        content: `Good choice. **Distance is an engineering control** when enforced through flight planning.

**Implementation:**
- Map hot surface locations
- Define no-fly buffer zones (20m minimum)
- Plan inspection paths accordingly
- Set geo-fence if practical

**Considerations:**
- May limit inspection coverage
- Some areas might need alternative inspection methods
- Balance safety with operational needs

This is appropriate use of engineering control for a physical hazard.`,
        choices: [
          {
            id: 'next-hazard-2',
            text: 'Proceed to next hazard',
            nextNode: 'hazard-3'
          }
        ]
      },

      'heat-time-partial': {
        id: 'heat-time-partial',
        type: 'situation',
        content: `Time limits can reduce exposure but have drawbacks.

**Problems with time-based controls:**
- Still exposes aircraft to hazard
- Hard to enforce precisely
- Cumulative exposure may still cause damage
- Creates time pressure for pilots

**Better approach:**
Distance is more reliable than time:
- Eliminates exposure rather than limiting it
- Easier to verify compliance
- No cumulative effect to track

Would you add distance requirement as primary control?`,
        choices: [
          {
            id: 'add-distance',
            text: 'Yes - add minimum distance requirement',
            nextNode: 'heat-combined'
          },
          {
            id: 'time-enough',
            text: 'Time limits should be sufficient',
            nextNode: 'time-insufficient'
          }
        ]
      },

      'time-insufficient': {
        id: 'time-insufficient',
        type: 'negative',
        content: `Time limits alone are inadequate for this hazard.

**Why distance is better:**
- Heat damage can occur quickly
- Exact safe exposure time is unknown
- Creates unnecessary pressure
- Cumulative damage possible

When we can avoid a hazard entirely through planning, we should.

Time limits might supplement distance controls but shouldn't be primary.`,
        choices: [
          {
            id: 'reconsider-heat',
            text: 'Reconsider - add distance control',
            nextNode: 'heat-combined'
          }
        ]
      },

      'heat-combined': {
        id: 'heat-combined',
        type: 'positive',
        content: `**Good combined approach:**

**Primary:** Maintain 20m minimum distance (engineering)
**Secondary:** Limit exposure time when closer approach needed (administrative)

This provides appropriate protection while allowing operational flexibility when necessary.`,
        choices: [
          {
            id: 'next-hazard-2',
            text: 'Proceed to next hazard',
            nextNode: 'hazard-3'
          }
        ]
      },

      'heat-engineering-option': {
        id: 'heat-engineering-option',
        type: 'situation',
        content: `Heat-resistant components would be **substitution** control.

**Considerations:**
- May not be available for your aircraft
- Could be expensive
- Doesn't address thermal updrafts
- Battery heat limits remain

**More practical approach:**
For a recurring operation, flight planning to maintain distance is:
- Immediately implementable
- No additional cost
- Addresses all heat-related issues

Engineering doesn't always mean adding equipment - it can mean designing out the exposure.`,
        choices: [
          {
            id: 'use-distance',
            text: 'Use distance-based control instead',
            nextNode: 'heat-distance-good'
          }
        ]
      },

      'hazard-3': {
        id: 'hazard-3',
        type: 'situation',
        content: `## Hazard 3: Wildlife (Birds)

The facility has a cooling pond that attracts large numbers of birds. Bird strikes are a concern when flying near this area.

**Observations:**
- Most bird activity around the pond
- Birds occasionally fly across the facility
- Peak activity at dawn and dusk

What control would you implement?`,
        choices: [
          {
            id: 'avoid-pond',
            text: 'Avoid flying near the cooling pond',
            nextNode: 'bird-elimination'
          },
          {
            id: 'avoid-times',
            text: 'Schedule operations outside peak bird activity times',
            nextNode: 'bird-schedule'
          },
          {
            id: 'bird-training',
            text: 'Train pilots to watch for and avoid birds',
            nextNode: 'bird-admin'
          }
        ]
      },

      'bird-elimination': {
        id: 'bird-elimination',
        type: 'positive',
        content: `Excellent. **Avoiding the high-activity area is elimination control.**

**Implementation:**
- Map the cooling pond and surroundings
- Define no-fly zone around pond
- Plan flight paths to avoid area
- Document restriction in procedures

**Residual risk:**
- Birds occasionally fly across facility
- Cannot eliminate all bird presence
- Still need awareness as secondary control

This is the most effective control for the primary hazard area.`,
        choices: [
          {
            id: 'final-scenario',
            text: 'Complete scenario',
            nextNode: 'final-assessment-controls'
          }
        ]
      },

      'bird-schedule': {
        id: 'bird-schedule',
        type: 'positive',
        content: `Good choice. **Scheduling is an engineering-equivalent control** when it eliminates hazard exposure.

**Implementation:**
- Identify peak bird activity times
- Schedule operations during low-activity periods
- Document in operational procedures
- Monitor for seasonal changes

**Combined approach:**
- Primary: Avoid pond area (elimination)
- Secondary: Schedule outside peak times (reduces residual)
- Tertiary: Pilot awareness for remaining risk

This shows good understanding of layered controls.`,
        choices: [
          {
            id: 'final-scenario',
            text: 'Complete scenario',
            nextNode: 'final-assessment-controls'
          }
        ]
      },

      'bird-admin': {
        id: 'bird-admin',
        type: 'situation',
        content: `Pilot training and awareness is administrative - the least effective level.

**Limitations:**
- Birds move fast
- Pilot attention is divided
- Reaction time may be insufficient
- Doesn't reduce bird presence

**When administrative controls alone are insufficient:**
- The hazard is predictable and avoidable
- More effective controls are available
- Consequences of failure are significant

Would you add avoidance of the high-activity area?`,
        choices: [
          {
            id: 'add-avoidance',
            text: 'Yes - avoid the cooling pond area',
            nextNode: 'bird-combined'
          },
          {
            id: 'awareness-enough',
            text: 'Awareness should be sufficient',
            nextNode: 'awareness-insufficient-birds'
          }
        ]
      },

      'awareness-insufficient-birds': {
        id: 'awareness-insufficient-birds',
        type: 'negative',
        content: `Awareness alone is not sufficient for a predictable, avoidable hazard.

**The hierarchy of controls exists because:**
- Higher controls work even when humans fail
- Administrative controls require constant attention
- Birds are faster than human reaction

If we know where bird activity is concentrated, avoiding that area is the obvious primary control.

Awareness becomes valuable for the residual risk after higher controls are applied.`,
        choices: [
          {
            id: 'add-better',
            text: 'Add pond avoidance as primary control',
            nextNode: 'bird-combined'
          }
        ]
      },

      'bird-combined': {
        id: 'bird-combined',
        type: 'positive',
        content: `**Correct combined approach:**

**Primary (Elimination):** Avoid cooling pond area
**Secondary (Scheduling):** Operate outside peak times when practical
**Tertiary (Administrative):** Pilot awareness for remaining risk

This demonstrates proper application of the hierarchy of controls.`,
        choices: [
          {
            id: 'final-scenario',
            text: 'Complete scenario',
            nextNode: 'final-assessment-controls'
          }
        ]
      },

      'final-assessment-controls': {
        id: 'final-assessment-controls',
        type: 'positive',
        content: `## Control Selection Summary

**Hazard 1: GPS Interference**
- Primary: Flight path avoidance (Engineering)
- Backup: Attitude mode capability (Administrative)

**Hazard 2: Hot Surfaces**
- Primary: 20m minimum distance (Engineering)
- Secondary: Time limits when closer (Administrative)

**Hazard 3: Wildlife**
- Primary: Avoid pond area (Elimination)
- Secondary: Schedule outside peak times
- Tertiary: Pilot awareness

**Common themes:**
- Engineering/elimination controls as primary
- Administrative controls as backup/supplement
- Defense in depth with multiple layers`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Complete scenario',
            nextNode: 'debrief'
          }
        ]
      },

      debrief: {
        id: 'debrief',
        type: 'debrief',
        content: `## Scenario Debrief: Control Selection

### Hierarchy of Controls Applied

1. **Elimination** - Avoid the hazard entirely
   - Best when hazard location is known
   - Most reliable (works regardless of human factors)

2. **Engineering** - Physical/technical barriers
   - Flight planning and geo-fencing
   - Equipment modifications

3. **Administrative** - Procedures and training
   - Valuable as backup and for residual risk
   - Least reliable due to human factors

### Key Learning Points

1. **Use highest practical control level** for each hazard
2. **Layer controls** for defense in depth
3. **Predictable hazards should be avoided**, not just managed
4. **Administrative controls supplement**, not replace, higher controls
5. **Document all controls** in operational procedures

### Control Selection Questions

When selecting controls, ask:
- Can this hazard be eliminated or avoided?
- What engineering/technical controls exist?
- What administrative controls support the above?
- What residual risk remains after controls?`,
        isTerminal: true
      }
    }
  },

  // Scenario: Conditions Change
  'conditions-change': {
    id: 'conditions-change',
    trackId: 'risk-hazard-management',
    questId: 'dynamic-risk-management',
    title: 'Conditions Change',
    description: 'Apply dynamic risk management when conditions change during operations.',
    difficulty: 'intermediate',
    estimatedTime: 12,
    xpReward: 100,
    context: `You're conducting a scheduled survey operation. Your pre-operation risk assessment was completed, all hazards were at acceptable levels, and operations began normally. Now conditions are starting to change.`,

    initialNode: 'start',
    nodes: {
      start: {
        id: 'start',
        type: 'situation',
        content: `## Mission Status

You're 45 minutes into a planned 90-minute survey operation. Data collection is approximately 50% complete.

**Current situation:**
- Operations proceeding normally
- Aircraft performing well
- Crew focused and alert
- Weather was good at start

**Your VO radios:** "Wind seems to be picking up. I'm also noticing some clouds building to the west."

What's your initial response?`,
        choices: [
          {
            id: 'check-data',
            text: 'Check telemetry and weather data immediately',
            nextNode: 'gather-information'
          },
          {
            id: 'keep-flying',
            text: 'Continue operations while keeping an eye on it',
            nextNode: 'passive-monitoring'
          },
          {
            id: 'immediate-abort',
            text: 'Abort immediately - don\'t take chances',
            nextNode: 'premature-abort'
          }
        ]
      },

      'gather-information': {
        id: 'gather-information',
        type: 'positive',
        content: `Good response. **Gather information before deciding.**

You check:
**Telemetry:**
- Wind: 15 km/h, gusting 22 km/h (was 8-12 at start)
- Battery: 45% remaining
- All systems normal

**Weather radar:**
- Developing cumulus 25km west
- Moving east at ~20 km/h
- ETA to your location: ~75 minutes

**Current limits:**
- Wind limit: 30 km/h sustained, 40 km/h gusts
- You're within limits but trending upward

What do you decide?`,
        choices: [
          {
            id: 'continue-monitoring',
            text: 'Continue with enhanced monitoring - conditions within limits',
            nextNode: 'enhanced-monitoring'
          },
          {
            id: 'accelerate',
            text: 'Accelerate data collection to finish before conditions worsen',
            nextNode: 'accelerate-risk'
          },
          {
            id: 'shorten-mission',
            text: 'Shorten mission - prioritize critical areas and land early',
            nextNode: 'conservative-approach'
          }
        ]
      },

      'passive-monitoring': {
        id: 'passive-monitoring',
        type: 'situation',
        content: `You continue operations. Ten minutes later:

**VO:** "Wind is definitely stronger now. Aircraft is drifting more than before."

You check telemetry:
- Wind: 20 km/h, gusting 28 km/h
- Aircraft using more battery to maintain position
- You're at 38% battery

The trend is clearly deteriorating. You now have less margin than before and the situation is developing.

What do you do now?`,
        choices: [
          {
            id: 'delayed-action',
            text: 'Now take action - shorten mission and land',
            nextNode: 'delayed-but-safe'
          },
          {
            id: 'still-continue',
            text: 'Still within limits - continue operations',
            nextNode: 'pushing-limits'
          }
        ]
      },

      'delayed-but-safe': {
        id: 'delayed-but-safe',
        type: 'neutral',
        content: `You decide to land. The aircraft returns safely, but:

- You're at 30% battery (lower margin than ideal)
- Wind is now gusting to 32 km/h
- Total data collection: 60%

**Lesson learned:**
Earlier action would have allowed more data collection with better safety margins. You completed the landing safely, but the delay cost both data and margin.

Dynamic risk management is about acting on trends, not just limits.`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Continue to debrief',
            nextNode: 'debrief'
          }
        ]
      },

      'pushing-limits': {
        id: 'pushing-limits',
        type: 'negative',
        content: `You continue. Within 5 minutes:

- Wind: 25 km/h sustained, gusting 35 km/h
- Aircraft struggling to maintain position
- Battery: 32%
- Weather clearly deteriorating

You're now very close to limits with reduced options. You must abort immediately.

The return flight is challenging:
- Wind pushing aircraft
- Higher battery consumption
- Gusty conditions making landing difficult

You land safely but with only 15% battery - well below safe margins.

**Critical lesson:** Waiting until limits are reached leaves no margin for safety. Act on trends, not limits.`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Continue to debrief',
            nextNode: 'debrief'
          }
        ]
      },

      'enhanced-monitoring': {
        id: 'enhanced-monitoring',
        type: 'situation',
        content: `You continue with enhanced monitoring:
- Check telemetry every 2 minutes
- VO focused on wind and weather
- Defined abort criteria: 25 km/h sustained or 35 km/h gusts

**15 minutes later:**
- Wind: 18 km/h, gusting 25 km/h
- Weather still 60+ minutes out
- 55% data collection complete
- 35% battery remaining

You're tracking toward your abort criteria but not there yet. The trend continues upward.

What now?`,
        choices: [
          {
            id: 'stay-course',
            text: 'Continue - still within criteria',
            nextNode: 'continue-to-limit'
          },
          {
            id: 'act-on-trend',
            text: 'Act on trend - begin landing sequence',
            nextNode: 'trend-action'
          },
          {
            id: 'final-push',
            text: 'Make one more pass then land regardless',
            nextNode: 'final-pass'
          }
        ]
      },

      'continue-to-limit': {
        id: 'continue-to-limit',
        type: 'situation',
        content: `You continue to your defined limits. Five minutes later:

- Wind: 24 km/h sustained
- Gusts: 33 km/h (approaching your 35 km/h limit)
- Battery: 30%
- 60% data complete

You're at your criteria. Now you must land.

The return and landing are more challenging than they needed to be. You complete safely but with:
- 22% battery remaining
- 60% data collection
- A stressed crew

**Question:** Could you have achieved a better outcome by acting earlier?`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Continue to debrief',
            nextNode: 'debrief'
          }
        ]
      },

      'trend-action': {
        id: 'trend-action',
        type: 'positive',
        content: `Excellent decision. **Acting on trends provides better outcomes.**

You begin landing sequence while:
- Conditions are well within limits
- Battery provides good margin
- Crew is not yet stressed

Landing is smooth and controlled.

**Final results:**
- 55% data collection
- 28% battery remaining
- Crew relaxed
- Clear lessons for future operations

You can return tomorrow for the remaining data with better conditions forecast.`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Continue to debrief',
            nextNode: 'debrief'
          }
        ]
      },

      'final-pass': {
        id: 'final-pass',
        type: 'positive',
        content: `Reasonable compromise. One more pass with firm commitment to land.

You complete the pass:
- Data collection: 62%
- Battery: 28%
- Wind approaching limits but not exceeded

You begin landing sequence. Conditions are challenging but manageable.

**Final results:**
- 62% data collection
- 22% battery remaining
- Slightly more stress than ideal
- Operation completed safely

This worked, but the firm commitment was key - without it, "one more" becomes a dangerous pattern.`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Continue to debrief',
            nextNode: 'debrief'
          }
        ]
      },

      'accelerate-risk': {
        id: 'accelerate-risk',
        type: 'negative',
        content: `Accelerating operations when conditions are deteriorating is a trap.

**Problems with this approach:**
- Higher speeds may produce lower quality data
- Rushing increases error likelihood
- If conditions worsen, you've used more battery with less margin
- Crew becomes task-focused instead of safety-focused

**Better approaches:**
- Accept partial completion
- Prioritize critical areas
- Return when conditions are better

Racing deteriorating conditions rarely ends well.`,
        choices: [
          {
            id: 'reconsider',
            text: 'Reconsider approach',
            nextNode: 'gather-information'
          }
        ]
      },

      'conservative-approach': {
        id: 'conservative-approach',
        type: 'positive',
        content: `**Conservative approach - prioritize and shorten.**

You decide:
- Prioritize the most critical survey areas
- Complete those with full quality
- Land with good margins
- Return for remainder when conditions permit

**Execution:**
- Identify 3 highest-priority areas (10 minutes flying)
- Complete those areas thoroughly
- Land with 35% battery, wind still within limits

**Results:**
- Critical areas 100% complete
- Overall 65% complete
- Good safety margins maintained
- Can return for remainder

This is excellent dynamic risk management - adapting the plan to conditions while maintaining safety.`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Continue to debrief',
            nextNode: 'debrief'
          }
        ]
      },

      'premature-abort': {
        id: 'premature-abort',
        type: 'situation',
        content: `You abort immediately. The aircraft returns and lands.

**Assessment:**
- Wind was 15 km/h gusting 22 km/h
- Well within limits (30/40)
- Weather still 75 minutes away
- You had time and margin

While safety is always valid, this may have been premature:
- No data gathered from the second half
- Client expectations not met
- Conditions were actually manageable

**Dynamic risk management means:**
- Acting on information, not just anxiety
- Making proportionate responses
- Sometimes continuing IS the right choice

Would you have made the same decision with more information?`,
        choices: [
          {
            id: 'gather-first',
            text: 'Should have gathered information first',
            nextNode: 'gather-information'
          },
          {
            id: 'stick-with-abort',
            text: 'Safety first - my decision stands',
            nextNode: 'overly-conservative'
          }
        ]
      },

      'overly-conservative': {
        id: 'overly-conservative',
        type: 'neutral',
        content: `Your decision was safe, and safe is never wrong.

However, consider:
- Conditions were well within limits
- Gathering information would have taken seconds
- Better data enables better decisions
- Routine aborting may erode client confidence

**Balance:**
- Yes, when in doubt, err toward safety
- But also, gather available information quickly
- Make decisions proportionate to actual risk
- Complete what can be safely completed

This wasn't a bad decision - just possibly premature given the actual conditions.`,
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
        content: `## Scenario Debrief: Conditions Change

### Dynamic Risk Management Principles

1. **Monitor continuously** - not just at decision points
2. **Act on trends** - don't wait until limits are reached
3. **Gather information** - quick assessment before major decisions
4. **Adapt the plan** - priorities may need adjustment
5. **Maintain margins** - limits are boundaries, not targets

### Key Learning Points

1. **Trends matter more than snapshots** - conditions at limits leave no margin
2. **Information gathering is fast** - seconds to check telemetry/radar
3. **Proportionate response** - match response to actual risk
4. **Partial completion is acceptable** - better than exceeding margins
5. **Communication is key** - VO input starts the process

### Decision Framework

When conditions change:
1. What's the current state? (data)
2. What's the trend? (direction)
3. What's the forecast? (future)
4. What are my options? (choices)
5. When must I decide? (time available)

Act with margin remaining, not at the limits.`,
        isTerminal: true
      }
    }
  }
}

export default riskScenarios
