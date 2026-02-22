/**
 * Field Safety Procedures Scenarios
 *
 * Interactive decision-tree scenarios for field safety training.
 *
 * @version 1.0.0
 */

const fieldSafetyScenarios = {
  // Scenario: The Safety Briefing
  'safety-briefing-scenario': {
    id: 'safety-briefing-scenario',
    trackId: 'field-safety-procedures',
    questId: 'crew-safety-briefings',
    title: 'The Safety Briefing',
    description: 'Conduct an effective pre-operation safety briefing for your crew.',
    difficulty: 'beginner',
    estimatedTime: 10,
    xpReward: 75,
    context: `You're the PIC arriving at an operation site with a two-person crew (yourself and a Visual Observer). This is a routine commercial operation at a familiar site, but you need to conduct a proper safety briefing before operations begin.`,

    initialNode: 'start',
    nodes: {
      start: {
        id: 'start',
        type: 'situation',
        content: `## Pre-Briefing Setup

You've completed your site assessment. The site is a municipal park where you'll be capturing promotional footage.

**Conditions:**
- Weather: Clear, light winds (10 km/h)
- Area: Public park with walking paths
- Airspace: Uncontrolled, no restrictions
- Crew: You (PIC) and one VO (Alex)

Alex has worked with you many times before. It would be easy to skip the briefing since you're both familiar with the routine.

How do you proceed?`,
        choices: [
          {
            id: 'full-briefing',
            text: 'Conduct full safety briefing as always',
            nextNode: 'briefing-start'
          },
          {
            id: 'abbreviated',
            text: 'Abbreviated briefing - we know the drill',
            nextNode: 'abbreviated-risk'
          },
          {
            id: 'skip-briefing',
            text: 'Skip briefing - we\'ve done this before',
            nextNode: 'skip-consequence'
          }
        ]
      },

      'abbreviated-risk': {
        id: 'abbreviated-risk',
        type: 'situation',
        content: `You say: "Alex, same drill as always. You know what to do, right?"

Alex nods. You start setting up equipment.

**Potential problems with this approach:**
- No discussion of today's specific conditions
- Assumptions about shared understanding
- Emergency procedures not confirmed
- Roles not explicitly assigned

Later, if something goes wrong, will you both respond the same way?

Would you reconsider and do a proper briefing?`,
        choices: [
          {
            id: 'reconsider-brief',
            text: 'Yes - let\'s do a proper briefing',
            nextNode: 'briefing-start'
          },
          {
            id: 'stick-abbreviated',
            text: 'It\'s fine - we know what we\'re doing',
            nextNode: 'complacency-example'
          }
        ]
      },

      'skip-consequence': {
        id: 'skip-consequence',
        type: 'negative',
        content: `You skip the briefing entirely.

During operations, a jogger runs toward your operating area just as you're landing. You call out "Alex, get them to stop!" but Alex is watching the aircraft, not monitoring the perimeter.

There's a near-collision with the jogger.

**Post-incident reflection:**
- Who was responsible for perimeter?
- What was the signal to pause operations?
- Where was the muster point?

None of this was discussed. A 3-minute briefing would have prevented this.`,
        choices: [
          {
            id: 'learn-lesson',
            text: 'Understand the lesson - briefings matter',
            nextNode: 'briefing-start'
          }
        ]
      },

      'complacency-example': {
        id: 'complacency-example',
        type: 'situation',
        content: `Operations proceed. Partway through, a park maintenance vehicle approaches your area unexpectedly.

You want to pause operations, but realize:
- You never defined a "pause" signal
- Alex doesn't know if they should handle the vehicle or stay watching the aircraft
- You're unsure if Alex will understand your hand gestures

You manage the situation, but it's messier than it needed to be.

**This is complacency in action** - assuming past experience substitutes for current briefing.`,
        choices: [
          {
            id: 'acknowledge-issue',
            text: 'See the value of proper briefings',
            nextNode: 'briefing-start'
          }
        ]
      },

      'briefing-start': {
        id: 'briefing-start',
        type: 'positive',
        content: `Good decision. Even familiar crews benefit from explicit briefings.

You gather Alex: "Let's do our pre-op briefing."

**IMFAST Structure:**
- **I**dentification: Mission overview
- **M**ission: Flight plan details
- **F**requencies: Communications
- **A**irspace: Classification and restrictions
- **S**afety: Hazards and emergencies
- **T**iming: Schedule

What do you cover first?`,
        choices: [
          {
            id: 'start-mission',
            text: 'Start with mission overview',
            nextNode: 'mission-brief'
          },
          {
            id: 'start-safety',
            text: 'Start with safety items',
            nextNode: 'safety-first-brief'
          }
        ]
      },

      'mission-brief': {
        id: 'mission-brief',
        type: 'positive',
        content: `**Identification & Mission:**

"Today we're capturing promotional footage for the city parks department. We'll be shooting the fountain area, the walking paths, and the playground - three distinct areas.

Our client contact is Jennifer, she's meeting us at 10:30 to confirm the shots she wants.

Flight time will be approximately 45 minutes total, broken into three segments."

Alex nods in understanding.

What's next?`,
        choices: [
          {
            id: 'comms-brief',
            text: 'Cover communications',
            nextNode: 'communications-brief'
          },
          {
            id: 'jump-safety',
            text: 'Jump to safety items',
            nextNode: 'safety-brief'
          }
        ]
      },

      'safety-first-brief': {
        id: 'safety-first-brief',
        type: 'situation',
        content: `Starting with safety is valid, but typically mission context comes first so safety items make sense.

**Recommended order:**
1. What are we doing? (Mission)
2. How will we communicate?
3. What's the airspace?
4. What are the hazards?
5. What's the timeline?

This way, when you discuss hazards, Alex understands the context.

Let's go back to mission overview first.`,
        choices: [
          {
            id: 'go-mission',
            text: 'Start with mission overview',
            nextNode: 'mission-brief'
          }
        ]
      },

      'communications-brief': {
        id: 'communications-brief',
        type: 'situation',
        content: `**Frequencies/Communications:**

"We'll use direct verbal communication today since we'll be close together. If we separate for the playground area, we'll use the radios on channel 5.

Standard calls:
- 'Launching' before takeoff
- 'Traffic' if you see anything
- 'Stop' means immediate hold
- 'Clear' when you confirm aircraft is secured

Any questions on comms?"

Alex confirms understanding.

Now what?`,
        choices: [
          {
            id: 'airspace-brief',
            text: 'Cover airspace',
            nextNode: 'airspace-brief'
          },
          {
            id: 'safety-now',
            text: 'Move to safety items',
            nextNode: 'safety-brief'
          }
        ]
      },

      'airspace-brief': {
        id: 'airspace-brief',
        type: 'positive',
        content: `**Airspace:**

"We're in Class G uncontrolled airspace. Nearest controlled airspace is the airport, 8 kilometers north - not a factor today.

No NOTAMs affecting this area. I checked the drone zone app and we're clear.

Maximum altitude today is 120 meters AGL, though we'll mostly be at 30-50 meters for the footage.

No authorization needed for this operation."

Alex confirms.

What's next?`,
        choices: [
          {
            id: 'safety-brief',
            text: 'Safety items',
            nextNode: 'safety-brief'
          }
        ]
      },

      'safety-brief': {
        id: 'safety-brief',
        type: 'situation',
        content: `**Safety:**

You need to cover:
- Site-specific hazards
- Emergency procedures
- Roles and responsibilities
- Muster point

**Hazards you identified:**
- Public walking through the park
- Trees and power lines on the east side
- Possible wildlife (ducks near the pond)

How do you present the hazards?`,
        choices: [
          {
            id: 'hazards-detail',
            text: 'Walk through each hazard with mitigation',
            nextNode: 'hazards-complete'
          },
          {
            id: 'hazards-quick',
            text: 'Mention them quickly - we see them',
            nextNode: 'hazards-incomplete'
          }
        ]
      },

      'hazards-complete': {
        id: 'hazards-complete',
        type: 'positive',
        content: `**Hazards with mitigations:**

"Three main hazards today:

1. **Public in the area** - Alex, you'll monitor the perimeter during flight. If anyone approaches within 30 meters, call 'Stop' and I'll hold position. We'll pause until they pass.

2. **Trees and power lines on the east side** - I'll maintain 50 meters minimum from that boundary. Flight path stays west of the fountain.

3. **Ducks by the pond** - We're not filming the pond, so we'll stay clear. If birds approach the aircraft, I'll climb or reposition.

Any concerns with those?"

Alex asks a clarifying question about where exactly the 30m line is. You point it out.

What's next?`,
        choices: [
          {
            id: 'emergency-brief',
            text: 'Cover emergency procedures',
            nextNode: 'emergency-brief'
          }
        ]
      },

      'hazards-incomplete': {
        id: 'hazards-incomplete',
        type: 'situation',
        content: `You point at the hazards but don't discuss mitigations or responsibilities.

Alex knows the hazards exist but doesn't know:
- When to call a stop
- What their specific responsibility is
- What the response is if a hazard materializes

**This is a briefing gap.** Naming hazards isn't enough - you need to specify:
- Who monitors each one
- What action is taken
- How it's communicated

Would you add that detail?`,
        choices: [
          {
            id: 'add-detail',
            text: 'Yes - add roles and mitigations',
            nextNode: 'hazards-complete'
          }
        ]
      },

      'emergency-brief': {
        id: 'emergency-brief',
        type: 'situation',
        content: `**Emergency Procedures:**

"If we have an emergency:

**Aircraft emergency:** I'll manage the aircraft. Alex, clear the area and prepare to assist. Don't approach until I confirm aircraft is safe.

**Person injured:** Whoever is closest provides aid, the other calls 911. First aid kit is in my vehicle - red bag.

**Muster point:** If we need to evacuate, we meet at my vehicle in the parking lot. [Points] That's our primary muster.

**Medical:** My vehicle, we leave through the north exit."

How do you confirm understanding?`,
        choices: [
          {
            id: 'ask-questions',
            text: 'Ask if Alex has any questions',
            nextNode: 'confirm-understanding'
          },
          {
            id: 'assume-clear',
            text: 'Move on - seems clear',
            nextNode: 'no-confirmation'
          }
        ]
      },

      'confirm-understanding': {
        id: 'confirm-understanding',
        type: 'positive',
        content: `"Any questions on emergency procedures? Alex, can you point to the muster point?"

Alex points to your vehicle. Correct.

"And where's the first aid kit?"

"Red bag in your vehicle."

"Perfect. One last thing - our abort signal is 'ABORT ABORT ABORT' - three times. That means immediate landing, no questions."

**Confirmation is essential.** Don't assume understanding - verify it.

Now complete the briefing.`,
        choices: [
          {
            id: 'complete-brief',
            text: 'Complete with timing and final confirmation',
            nextNode: 'timing-brief'
          }
        ]
      },

      'no-confirmation': {
        id: 'no-confirmation',
        type: 'situation',
        content: `You don't confirm understanding.

During operations, an issue arises and you call "Emergency! Muster point!"

Alex looks confused - where was the muster point? You said it, but did Alex hear it? Understand it?

**Confirmation matters because:**
- Briefings can be one-sided
- People hear but don't absorb
- Pointing and confirming locks in the information
- Questions reveal gaps

Always confirm critical information.`,
        choices: [
          {
            id: 'confirm-now',
            text: 'Go back and confirm understanding',
            nextNode: 'confirm-understanding'
          }
        ]
      },

      'timing-brief': {
        id: 'timing-brief',
        type: 'positive',
        content: `**Timing:**

"Timeline for today:
- First flight: 10:00 (20 minutes)
- Break and battery change: 10:25
- Second flight with client review: 10:35
- Wrap-up and pack: 11:00
- Depart by 11:30

Any scheduling conflicts or concerns?"

Alex confirms they're good for the full time.

**Role Assignment:**

"To confirm roles:
- I'm PIC, managing aircraft and camera
- You're VO, monitoring airspace and perimeter
- For client interface, I'll handle Jennifer but you can answer basic questions

Clear?"

Alex confirms.`,
        choices: [
          {
            id: 'final-brief',
            text: 'Complete the briefing',
            nextNode: 'briefing-complete'
          }
        ]
      },

      'briefing-complete': {
        id: 'briefing-complete',
        type: 'positive',
        content: `**Final Check:**

"Last chance for questions or concerns. Anything not clear?"

Alex: "All good. Ready to go."

"Great. Let's get set up. First launch at 10:00."

**Briefing Duration:** Approximately 4 minutes

**What you achieved:**
- Shared mental model of the mission
- Clear role assignments
- Confirmed emergency procedures
- Specific hazard mitigations assigned
- Communication protocols established

Operations proceed smoothly because everyone knows their role and the plan.`,
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
        content: `## Scenario Debrief: The Safety Briefing

### IMFAST Briefing Framework

- **I**dentification: What are we doing, for whom?
- **M**ission: Flight plan, areas, sequence
- **F**requencies: Communication methods and calls
- **A**irspace: Classification, restrictions, limits
- **S**afety: Hazards, mitigations, emergencies, muster
- **T**iming: Schedule, milestones, time limits

### Key Learning Points

1. **Brief every time** - familiarity breeds complacency
2. **Context first** - mission overview makes safety items meaningful
3. **Specific assignments** - "you watch for X" not "we need to watch for X"
4. **Confirm understanding** - don't assume, verify
5. **Point physically** - show locations, don't just describe
6. **Allow questions** - gaps in understanding surface here

### Briefing Best Practices

- Keep it focused (3-5 minutes typical)
- Use visual aids if helpful
- Make eye contact
- Cover site-specific items, not just generic
- End with opportunity for questions
- Document that briefing occurred`,
        isTerminal: true
      }
    }
  },

  // Scenario: Hostile Environment
  'hostile-environment': {
    id: 'hostile-environment',
    trackId: 'field-safety-procedures',
    questId: 'environmental-hazards',
    title: 'Hostile Environment',
    description: 'Navigate multiple environmental hazards during field operations.',
    difficulty: 'intermediate',
    estimatedTime: 12,
    xpReward: 100,
    context: `You're conducting a survey operation in a challenging environment. Multiple environmental hazards are present and conditions are dynamic. Your decision-making will determine the outcome.`,

    initialNode: 'start',
    nodes: {
      start: {
        id: 'start',
        type: 'situation',
        content: `## Remote Industrial Survey

You're surveying a remote industrial site for a pipeline company. The site is 45 minutes from the nearest town.

**Environment:**
- Semi-arid terrain with sparse vegetation
- Active wildlife (noted bird activity, possible large animals)
- Power lines crossing the survey corridor
- Cellular coverage spotty
- Weather forecast: clear but warming to 32°C

**Crew:** You (PIC), one VO, and a site escort from the company

You've completed site assessment. It's 9:00 AM and already 24°C.

What's your first priority?`,
        choices: [
          {
            id: 'start-quickly',
            text: 'Start operations quickly before it gets too hot',
            nextNode: 'rushing'
          },
          {
            id: 'thorough-prep',
            text: 'Thorough preparation addressing all hazards',
            nextNode: 'preparation'
          },
          {
            id: 'check-power-lines',
            text: 'Focus on mapping the power line locations',
            nextNode: 'power-focus'
          }
        ]
      },

      'rushing': {
        id: 'rushing',
        type: 'situation',
        content: `You rush to start. By 9:15 AM you're airborne.

But you realize:
- You haven't mapped the exact power line locations
- You didn't brief the crew on heat protocols
- Your satellite communicator isn't activated
- You don't know where emergency water supplies are

You're operating, but with significant gaps in preparation.

At 9:45, the temperature is already 28°C and climbing. Your VO is showing signs of heat stress.

What do you do?`,
        choices: [
          {
            id: 'continue-rushing',
            text: 'Continue - we\'re already started',
            nextNode: 'heat-problem'
          },
          {
            id: 'pause-address',
            text: 'Pause and address the gaps',
            nextNode: 'late-preparation'
          }
        ]
      },

      'heat-problem': {
        id: 'heat-problem',
        type: 'negative',
        content: `You continue. By 10:30:

- Temperature: 31°C
- Your VO is dizzy and needs to rest
- You haven't been monitoring your own hydration
- The aircraft battery performance is degraded in the heat
- You're 45% complete with the survey

Your VO needs shade and water immediately. There's no shade at your position.

You must abort operations to care for your crew member.

**Lesson:** Environmental hazards include effects on crew, not just equipment. Heat safety protocols should have been part of preparation.`,
        choices: [
          {
            id: 'learn-heat',
            text: 'Understand the lesson',
            nextNode: 'debrief'
          }
        ]
      },

      'late-preparation': {
        id: 'late-preparation',
        type: 'situation',
        content: `You pause operations to address gaps.

By the time you've:
- Mapped power lines
- Set up heat protocols
- Activated satellite communicator
- Briefed crew properly

It's 10:15 and 29°C. You've lost an hour and conditions are less favorable.

You could have been 50% done by now if you'd prepared first and started at 9:15 with a proper plan.

This is workable, but not ideal.`,
        choices: [
          {
            id: 'continue-late',
            text: 'Continue with adjusted timeline',
            nextNode: 'adjusted-operations'
          }
        ]
      },

      'preparation': {
        id: 'preparation',
        type: 'positive',
        content: `You take 30 minutes for thorough preparation.

**Actions:**
- Map power line locations using provided site plans
- Establish heat safety protocols (hydration breaks every 30 min)
- Activate satellite communicator and verify function
- Set up shade structure at control station
- Brief crew on wildlife awareness
- Identify emergency vehicle access

By 9:30 AM (26°C), you're ready with:
- All hazards identified and mitigated
- Crew briefed and equipped
- Emergency plans in place

You launch with confidence.`,
        choices: [
          {
            id: 'first-flight',
            text: 'Begin first flight segment',
            nextNode: 'first-segment'
          }
        ]
      },

      'power-focus': {
        id: 'power-focus',
        type: 'situation',
        content: `Good instinct - power lines are a critical hazard. But focusing solely on one hazard may leave others unaddressed.

**Multi-hazard environments require:**
- Systematic assessment of ALL hazards
- Prioritized but comprehensive mitigation
- Integrated approach to safety

Would you expand your preparation to address all hazards?`,
        choices: [
          {
            id: 'expand-prep',
            text: 'Yes - address all hazards systematically',
            nextNode: 'preparation'
          },
          {
            id: 'power-only',
            text: 'Power lines are the main concern',
            nextNode: 'incomplete-prep'
          }
        ]
      },

      'incomplete-prep': {
        id: 'incomplete-prep',
        type: 'situation',
        content: `You focus on power lines but underestimate other hazards.

During operations:
- Heat affects crew performance
- Wildlife encounter causes unexpected abort
- Satellite comms needed but not set up

**Multi-hazard environments require multi-hazard preparation.** One hazard successfully managed means nothing if another one gets you.`,
        choices: [
          {
            id: 'understand-multi',
            text: 'Understand the need for comprehensive preparation',
            nextNode: 'preparation'
          }
        ]
      },

      'first-segment': {
        id: 'first-segment',
        type: 'situation',
        content: `First segment proceeds well. At 10:00:
- 25% of survey complete
- Temperature: 29°C
- All systems normal
- Crew comfortable under shade

During your scheduled break, your site escort reports:
"We sometimes see bears in this area, especially in the gully to the north. Haven't seen any today though."

This is new information. How do you respond?`,
        choices: [
          {
            id: 'ignore-bears',
            text: 'Probably fine - we\'re making noise and have people around',
            nextNode: 'wildlife-risk'
          },
          {
            id: 'modify-plan',
            text: 'Modify our plan to account for wildlife risk',
            nextNode: 'wildlife-adjustment'
          },
          {
            id: 'abort-bears',
            text: 'Abort operations - bear risk is too high',
            nextNode: 'overreaction'
          }
        ]
      },

      'wildlife-risk': {
        id: 'wildlife-risk',
        type: 'situation',
        content: `You continue without modification.

During the second segment, your VO suddenly calls: "Stop! Bear in the gully, about 200 meters out!"

The bear seems to be watching your drone. It starts moving toward your position.

You now need to:
- Land the aircraft
- Prepare to evacuate
- Manage a situation you didn't plan for

The bear approaches to 100m before losing interest and moving off. Operations are paused for 30 minutes while you ensure it's safe.

**Had you planned for this:**
- You'd have had bear spray ready
- Evacuation plan would be clear
- Less stress during the encounter`,
        choices: [
          {
            id: 'learn-wildlife',
            text: 'Learn from this experience',
            nextNode: 'wildlife-lesson'
          }
        ]
      },

      'wildlife-lesson': {
        id: 'wildlife-lesson',
        type: 'situation',
        content: `After the bear moves off, you take time to:
- Brief crew on wildlife response
- Locate bear spray
- Identify vehicle as escape route
- Assign roles if wildlife approaches

**Lesson:** Local knowledge is valuable. When site personnel mention hazards, take them seriously and adjust plans accordingly.

You resume operations with modified approach - staying away from the gully area.`,
        choices: [
          {
            id: 'continue-modified',
            text: 'Continue with modified plan',
            nextNode: 'power-line-challenge'
          }
        ]
      },

      'wildlife-adjustment': {
        id: 'wildlife-adjustment',
        type: 'positive',
        content: `Good response to new information.

**Adjustments:**
- Avoid flying toward the gully
- Ensure bear spray is accessible
- Brief crew on wildlife response
- Vehicle ready for quick departure if needed
- VO assigned to watch north/gully area

You resume operations with modified flight plan that keeps activity away from the reported bear area.

At 10:45, you're ready for segment two.`,
        choices: [
          {
            id: 'segment-two',
            text: 'Continue to segment two',
            nextNode: 'power-line-challenge'
          }
        ]
      },

      'overreaction': {
        id: 'overreaction',
        type: 'situation',
        content: `Aborting for a reported but not present bear may be overly conservative.

**Consider:**
- Bears are common in rural areas
- Noise and activity often keep them away
- Complete abort means zero data
- You can modify operations to reduce risk

**Balance:**
Yes, wildlife is a hazard. But the appropriate response is modified operations with safety measures, not automatic abort.

Would you reconsider with adjustments?`,
        choices: [
          {
            id: 'reconsider-wildlife',
            text: 'Yes - modify plans instead of aborting',
            nextNode: 'wildlife-adjustment'
          }
        ]
      },

      'adjusted-operations': {
        id: 'adjusted-operations',
        type: 'situation',
        content: `You continue with your adjusted timeline.

By 11:30:
- 50% complete
- Temperature: 32°C
- Crew showing heat fatigue despite precautions
- Aircraft batteries performing at 85% due to heat

You have a decision to make about the afternoon.`,
        choices: [
          {
            id: 'push-through',
            text: 'Push through to complete today',
            nextNode: 'heat-consequences'
          },
          {
            id: 'split-days',
            text: 'Break for the hot afternoon, return tomorrow or early evening',
            nextNode: 'smart-split'
          }
        ]
      },

      'heat-consequences': {
        id: 'heat-consequences',
        type: 'negative',
        content: `You push through the afternoon heat.

By 2:00 PM (peak heat at 34°C):
- VO is clearly suffering from heat
- Your own performance is degraded
- Aircraft battery efficiency down to 70%
- Decision-making is impaired

You complete 75% but:
- Quality of some data is questionable (shaky video from tired hands)
- You push close to battery limits due to inefficiency
- Risk exposure was higher than necessary

Was completing 75% in one day worth the risks?`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Learn from this outcome',
            nextNode: 'debrief'
          }
        ]
      },

      'smart-split': {
        id: 'smart-split',
        type: 'positive',
        content: `You decide to work with the environment, not against it.

**Plan:**
- Complete until 12:00 (get to 60%)
- Break during afternoon heat
- Return at 5:00 PM for evening session
- Or return early tomorrow morning

**Results:**
- 60% completed in cool conditions
- High quality data
- Crew in good condition
- Equipment performing normally

You return the next morning at 6:00 AM:
- Complete remaining 40% by 9:00 AM
- Total data: 100%, all high quality
- No heat-related incidents
- Professional operation throughout`,
        choices: [
          {
            id: 'power-encounter',
            text: 'Continue scenario',
            nextNode: 'power-line-challenge'
          }
        ]
      },

      'power-line-challenge': {
        id: 'power-line-challenge',
        type: 'situation',
        content: `During one of your segments, you need to survey an area that requires flying parallel to the power lines, approximately 75 meters away.

Your pre-planned path keeps you 100m clear, but the client's escort asks: "Can you get closer? We really need good imagery of that section."

**Considerations:**
- 75m is still outside your 50m minimum buffer
- Power lines create EMI risk
- Guy wires may not be visible
- Client is requesting it

What do you decide?`,
        choices: [
          {
            id: 'maintain-plan',
            text: 'Maintain planned 100m buffer',
            nextNode: 'professional-boundary'
          },
          {
            id: 'compromise-75',
            text: 'Compromise at 75m with extra caution',
            nextNode: 'measured-compromise'
          },
          {
            id: 'get-close',
            text: 'Get as close as they want',
            nextNode: 'dangerous-compliance'
          }
        ]
      },

      'professional-boundary': {
        id: 'professional-boundary',
        type: 'positive',
        content: `"I appreciate the request, but our safety protocols require the 100-meter buffer from power infrastructure. I can get you good imagery from that distance - the camera resolution is excellent."

You demonstrate by capturing test footage. The client reviews it.

"Actually, this is quite good. I can see the detail we need."

**Professional boundary maintained:**
- Safety standards upheld
- Client needs still met
- No compromise of your protocols
- Respectful but firm communication`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Complete scenario',
            nextNode: 'debrief'
          }
        ]
      },

      'measured-compromise': {
        id: 'measured-compromise',
        type: 'situation',
        content: `You decide 75m is acceptable if you take extra precautions:
- Slower flight speed
- VO watching power lines specifically
- Monitoring telemetry for EMI
- Ready to abort immediately

You make the pass. At 75 meters:
- GPS shows minor fluctuation
- Imagery captured
- No incident occurs

**Assessment:**
This worked, but you operated with reduced margin. Your 50m minimum exists for a reason. Was the slight improvement in imagery worth the reduced safety margin?

Professional operators maintain consistent standards, not adjustable ones.`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Consider this outcome',
            nextNode: 'debrief'
          }
        ]
      },

      'dangerous-compliance': {
        id: 'dangerous-compliance',
        type: 'negative',
        content: `You fly closer to the power lines than your safety margins allow.

At 40 meters:
- GPS becomes unreliable
- Compass shows errors
- Aircraft position drifts toward the lines

You manage to recover control and fly away, but it was close.

**Critical lesson:**
Safety standards exist for reasons. Client pressure doesn't change the physics of EMI or the danger of power lines.

Never compromise safety standards for client requests. If you can't meet their needs safely, explain why and offer alternatives.`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Learn from this mistake',
            nextNode: 'debrief'
          }
        ]
      },

      debrief: {
        id: 'debrief',
        type: 'debrief',
        content: `## Scenario Debrief: Hostile Environment

### Multi-Hazard Management

In challenging environments, you face multiple simultaneous hazards:
- **Environmental:** Heat, terrain, weather
- **Infrastructure:** Power lines, EMI sources
- **Wildlife:** Animals that may interact with operations
- **Human factors:** Crew fatigue, heat stress

### Key Learning Points

1. **Comprehensive preparation** addresses ALL hazards, not just the obvious one
2. **Local knowledge is valuable** - site personnel know their environment
3. **Work with the environment** - schedule around extreme conditions
4. **Maintain standards** - client pressure doesn't change safety physics
5. **Heat affects everyone** - crew and equipment performance degrades

### Environmental Hazard Checklist

Before remote/challenging operations:
- [ ] All hazards identified and mitigated
- [ ] Environmental conditions assessed
- [ ] Heat/cold protocols established
- [ ] Wildlife awareness and response planned
- [ ] Communication backup available
- [ ] Emergency access/evacuation planned
- [ ] Crew properly equipped and briefed`,
        isTerminal: true
      }
    }
  },

  // Scenario: Incident Occurs
  'incident-occurs': {
    id: 'incident-occurs',
    trackId: 'field-safety-procedures',
    questId: 'incident-response',
    title: 'Incident Occurs',
    description: 'Respond appropriately when something goes wrong during operations.',
    difficulty: 'intermediate',
    estimatedTime: 12,
    xpReward: 100,
    context: `You're conducting routine operations when an incident occurs. Your response will determine the outcome and lessons learned.`,

    initialNode: 'start',
    nodes: {
      start: {
        id: 'start',
        type: 'situation',
        content: `## The Incident

You're mid-flight when your aircraft experiences a sudden loss of power to one motor. The aircraft begins descending despite your attempts to maintain altitude.

**Current situation:**
- Altitude: 50 meters
- Location: Over a parking lot with several vehicles
- Descent rate: 2 meters/second
- Time to impact: approximately 25 seconds
- One pedestrian visible in the area

What's your immediate action?`,
        choices: [
          {
            id: 'steer-clear',
            text: 'Steer toward the clearest area away from people and vehicles',
            nextNode: 'controlled-descent'
          },
          {
            id: 'cut-power',
            text: 'Cut all power to prevent further damage',
            nextNode: 'uncontrolled-crash'
          },
          {
            id: 'call-out',
            text: 'Shout warning to the pedestrian first',
            nextNode: 'warning-priority'
          }
        ]
      },

      'controlled-descent': {
        id: 'controlled-descent',
        type: 'positive',
        content: `Good instinct. You have partial control - use it.

You vector the aircraft toward an open area of the parking lot, away from the pedestrian and vehicles.

The aircraft descends:
- 40m... maintaining direction
- 30m... VO runs to clear the area
- 20m... pedestrian notices and moves away
- 10m... impact area clear

The aircraft hits the ground hard in the open area. It's damaged, but no people or vehicles were struck.

What's your next action?`,
        choices: [
          {
            id: 'run-to-aircraft',
            text: 'Run to the aircraft immediately',
            nextNode: 'immediate-approach'
          },
          {
            id: 'secure-first',
            text: 'Ensure scene safety, then approach',
            nextNode: 'safe-approach'
          },
          {
            id: 'check-people',
            text: 'Check if the pedestrian is okay first',
            nextNode: 'people-first'
          }
        ]
      },

      'uncontrolled-crash': {
        id: 'uncontrolled-crash',
        type: 'negative',
        content: `Cutting all power removes any remaining control.

Without the functioning motors providing any lift, the aircraft drops rapidly and lands on a vehicle, causing damage to:
- The aircraft (destroyed)
- The vehicle's windshield (cracked)
- The vehicle's hood (dented)

**Better approach:** Use whatever control remains to steer to the safest impact point. Partial control is better than no control.`,
        choices: [
          {
            id: 'learn-control',
            text: 'Understand the lesson',
            nextNode: 'aftermath-vehicle'
          }
        ]
      },

      'warning-priority': {
        id: 'warning-priority',
        type: 'situation',
        content: `Shouting is good, but you only have 25 seconds.

While you shout:
- The aircraft continues descending
- Precious seconds pass
- The pedestrian may or may not hear you

**Better approach:** Control the aircraft while your VO handles warnings. Multi-tasking during emergencies often means doing neither task well.

You manage to shout and the pedestrian does move, but the aircraft crashes into a vehicle because you weren't steering.`,
        choices: [
          {
            id: 'learn-delegation',
            text: 'Understand - prioritize aircraft control, delegate warnings',
            nextNode: 'aftermath-vehicle'
          }
        ]
      },

      'immediate-approach': {
        id: 'immediate-approach',
        type: 'situation',
        content: `You run toward the aircraft.

**STOP. Consider:**
- Battery may be damaged (fire risk)
- Props may spin if power returns
- Structural damage may create sharp edges

Running to a crashed aircraft without assessment is how secondary injuries happen.

Fortunately, nothing happens this time. But the proper procedure is to assess before approaching.`,
        choices: [
          {
            id: 'reassess',
            text: 'Stop and assess properly',
            nextNode: 'safe-approach'
          }
        ]
      },

      'safe-approach': {
        id: 'safe-approach',
        type: 'positive',
        content: `**Proper scene safety:**

You assess from a distance:
- No fire or smoke visible
- Battery not obviously damaged
- Props have stopped

You approach cautiously:
- Confirm battery is not swelling
- Verify no electrical arcing
- Power off the controller (disconnects any residual power)

Now you can safely examine the aircraft.

What's next?`,
        choices: [
          {
            id: 'document-scene',
            text: 'Document the scene before touching anything',
            nextNode: 'scene-documentation'
          },
          {
            id: 'pick-up-aircraft',
            text: 'Pick up the aircraft and assess damage',
            nextNode: 'premature-handling'
          }
        ]
      },

      'people-first': {
        id: 'people-first',
        type: 'positive',
        content: `People first is correct thinking.

Your VO has already approached the pedestrian:
"Are you okay? Did anything hit you?"

Pedestrian: "I'm fine, just startled. What happened?"

Your VO explains briefly while you secure the scene.

With people confirmed safe, proceed to scene management.`,
        choices: [
          {
            id: 'to-scene',
            text: 'Proceed to scene management',
            nextNode: 'safe-approach'
          }
        ]
      },

      'aftermath-vehicle': {
        id: 'aftermath-vehicle',
        type: 'situation',
        content: `The aircraft has struck a vehicle. You now have:
- Property damage (third party vehicle)
- Potential insurance claim
- Incident reporting requirements
- Need to locate vehicle owner

**Immediate priorities:**
1. Ensure no one was in/near the vehicle
2. Document the scene
3. Locate the vehicle owner
4. Report to your organization

This is a reportable incident.`,
        choices: [
          {
            id: 'handle-properly',
            text: 'Handle properly',
            nextNode: 'vehicle-damage-response'
          }
        ]
      },

      'scene-documentation': {
        id: 'scene-documentation',
        type: 'positive',
        content: `**Document before disturbing:**

You take photos:
- Wide shot showing aircraft and surroundings
- Close-ups of aircraft position
- Damage visible from multiple angles
- Any marks on the ground

You note:
- Time of incident
- Weather conditions
- Witnesses present

**Then:**
- Carefully move aircraft to safe location
- Secure battery (place in fireproof bag)
- Preserve flight logs

Scene documentation complete.`,
        choices: [
          {
            id: 'next-steps',
            text: 'Proceed to reporting',
            nextNode: 'reporting-phase'
          }
        ]
      },

      'premature-handling': {
        id: 'premature-handling',
        type: 'situation',
        content: `Picking up the aircraft before documentation may compromise:
- Evidence of what happened
- Insurance claim support
- Regulatory investigation if needed
- Your organization's incident review

**Best practice:** Document position and damage before moving anything.

Also, you should check the battery carefully before handling - impact can damage cells internally.`,
        choices: [
          {
            id: 'document-first',
            text: 'Document first, then handle',
            nextNode: 'scene-documentation'
          }
        ]
      },

      'vehicle-damage-response': {
        id: 'vehicle-damage-response',
        type: 'situation',
        content: `**Vehicle Damage Protocol:**

1. **Document everything:**
   - Photos of damage
   - Aircraft position
   - Vehicle license plate
   - Your contact information ready

2. **Locate owner:**
   - Check nearby businesses
   - Ask bystanders
   - Wait reasonable time
   - Leave contact info if not found

3. **Exchange information:**
   - Your name and company
   - Insurance information
   - What happened (factual)
   - Don't admit fault or speculate on cause

4. **Report:**
   - Your company immediately
   - Police if required by local law
   - Insurance company`,
        choices: [
          {
            id: 'reporting-next',
            text: 'Continue to reporting',
            nextNode: 'reporting-phase'
          }
        ]
      },

      'reporting-phase': {
        id: 'reporting-phase',
        type: 'situation',
        content: `## Reporting Requirements

**What needs to be reported:**
- Aircraft emergency resulting in uncontrolled descent
- Property damage (if vehicle was struck)
- Near-miss with pedestrian

**Who to notify:**

1. **Your organization** - immediately
2. **Transport Canada** - if reportable occurrence
3. **Insurance** - if property damage
4. **TSB** - if serious incident criteria met

**What to document:**
- Time, date, location
- Weather conditions
- Flight parameters before incident
- Sequence of events
- Actions taken
- Outcome (damage, injuries)
- Witness information

How do you describe the incident?`,
        choices: [
          {
            id: 'factual-report',
            text: 'Stick to facts without speculation',
            nextNode: 'proper-reporting'
          },
          {
            id: 'explain-cause',
            text: 'Explain what you think caused it',
            nextNode: 'speculative-reporting'
          }
        ]
      },

      'proper-reporting': {
        id: 'proper-reporting',
        type: 'positive',
        content: `**Correct approach - factual reporting:**

"At approximately 10:45 AM, during routine flight operations, the aircraft experienced partial loss of power resulting in uncontrolled descent from approximately 50 meters. I attempted to steer toward a clear area. The aircraft impacted the parking lot surface, sustaining damage. No injuries occurred. [Property damage details if applicable.]"

**What you DON'T say yet:**
- "The motor failed because..."
- "This was caused by..."
- "It was [someone's] fault..."

Investigation determines cause. Initial reports stick to observable facts.`,
        choices: [
          {
            id: 'investigation',
            text: 'Continue to investigation',
            nextNode: 'investigation-phase'
          }
        ]
      },

      'speculative-reporting': {
        id: 'speculative-reporting',
        type: 'situation',
        content: `**Problem with speculation:**

You say: "The motor burned out, probably a manufacturing defect."

But you don't actually know this yet. Problems with this:
- You may be wrong
- Creates documentation of unverified claim
- Could complicate insurance/liability
- May influence investigation

**Better approach:**
Report what happened (motor stopped), not why (unknown). Investigation determines cause.

"The aircraft experienced partial loss of power" - factual.
"The motor burned out due to defect" - speculation.`,
        choices: [
          {
            id: 'revise-report',
            text: 'Revise to factual reporting',
            nextNode: 'proper-reporting'
          }
        ]
      },

      'investigation-phase': {
        id: 'investigation-phase',
        type: 'situation',
        content: `## Post-Incident Investigation

You've preserved the aircraft and flight logs. Your organization begins investigation.

**Investigation reveals:**
- Motor ESC (electronic speed controller) failed
- Signs of heat damage on the ESC
- Flight logs show motor #3 temperature trending high before failure
- You didn't notice the warning in telemetry (it was displayed but not alarmed)

**Root causes identified:**
1. ESC was failing (hardware issue)
2. Telemetry showed early warning (not noticed)
3. No pre-flight procedure to check motor temps

**Lessons learned:**`,
        choices: [
          {
            id: 'lessons',
            text: 'Review lessons learned',
            nextNode: 'lessons-learned'
          }
        ]
      },

      'lessons-learned': {
        id: 'lessons-learned',
        type: 'positive',
        content: `## Lessons Learned & Improvements

**Hardware:**
- ESC replaced with higher-rated version
- Regular ESC inspection added to maintenance schedule

**Procedures:**
- Motor temperature check added to pre-flight
- Telemetry alarm thresholds configured
- Abnormal temperature = immediate land protocol

**Training:**
- Crew trained on telemetry monitoring priorities
- Emergency descent practice added to currency

**Documentation:**
- Incident report completed
- Hazard register updated
- SOP revised

**This incident improved the operation** - proper investigation turned a failure into organizational learning.`,
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
        content: `## Scenario Debrief: Incident Occurs

### Incident Response Sequence

1. **Immediate:** Protect people (control aircraft away from harm)
2. **Secure:** Ensure scene safety before approaching
3. **Account:** Confirm all people are okay
4. **Document:** Photos and notes before disturbing scene
5. **Report:** Notify required parties, factual reporting
6. **Investigate:** Determine root causes
7. **Improve:** Implement corrective actions

### Key Learning Points

1. **Use remaining control** - partial control is better than none
2. **Scene safety first** - don't create secondary incidents
3. **Document before disturbing** - evidence matters
4. **Report factually** - no speculation until investigation
5. **Learn from incidents** - every incident improves the operation

### Incident Response Priorities

**People > Property > Data**

Protect people first. Then protect property. Then preserve data for learning.

### Investigation Focus

Root causes, not blame. System improvements, not punishment. Every incident is an opportunity to prevent the next one.`,
        isTerminal: true
      }
    }
  }
}

export default fieldSafetyScenarios
