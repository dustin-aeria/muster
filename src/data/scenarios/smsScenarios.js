/**
 * SMS Training Scenarios
 *
 * Interactive decision-tree scenarios for Safety Management Systems training.
 * Each scenario presents realistic situations requiring safety management decisions.
 *
 * @version 1.0.0
 */

const smsScenarios = {
  // Scenario for Quest 3: Safety Culture & Just Culture
  scenario_sms_near_miss: {
    id: 'scenario_sms_near_miss',
    trackId: 'track_sms_foundation',
    questId: 'quest_sms_culture',
    slug: 'the-near-miss-report',
    title: 'The Near Miss Report',
    description: 'You witness a near-miss incident. Your decisions will demonstrate understanding of Just Culture and safety reporting principles.',
    type: 'decision_tree',
    difficulty: 'intermediate',
    estimatedTime: 8,
    xpReward: 50,
    learningObjectives: [
      'Apply Just Culture principles in incident reporting',
      'Understand the importance of near-miss reporting',
      'Navigate organizational pressure while maintaining safety focus'
    ],
    startNodeId: 'node_1',
    nodes: [
      {
        id: 'node_1',
        type: 'situation',
        content: `You're the Visual Observer on a mapping mission. During a battery change, you notice the PIC skipped the pre-flight checklist—they were rushing because the client is getting impatient.

The flight proceeds, but you notice the aircraft wobbling slightly during climb-out. The PIC quickly lands and discovers a loose propeller that wasn't caught during the skipped inspection.

No damage occurred, no one was hurt, and the client didn't notice anything unusual. The PIC looks at you nervously.

**"Let's just tighten it up and keep going. No harm done, right?"**`,
        choices: [
          {
            id: 'choice_1a',
            text: 'Agree to continue without reporting—no harm was done',
            nextNodeId: 'node_2a',
            isOptimal: false,
            feedback: 'This choice prioritizes short-term convenience over safety learning.'
          },
          {
            id: 'choice_1b',
            text: 'Suggest fixing the prop but filing an internal safety report later',
            nextNodeId: 'node_2b',
            isOptimal: true,
            feedback: 'This balances immediate safety with organizational learning.'
          },
          {
            id: 'choice_1c',
            text: 'Refuse to continue the mission until a formal report is filed',
            nextNodeId: 'node_2c',
            isOptimal: false,
            feedback: 'While safety-focused, this may not be the most practical approach.'
          }
        ]
      },
      {
        id: 'node_2a',
        type: 'situation',
        content: `You agree to continue. The rest of the mission goes smoothly and the client is satisfied.

A week later, another crew has a prop separation in flight, causing a flyaway. The subsequent investigation reveals this has happened before—but no one reported it.

Your operations manager asks if you've ever seen anything similar.

**What do you say?**`,
        choices: [
          {
            id: 'choice_2a1',
            text: '"No, nothing like that."',
            nextNodeId: 'node_end_bad',
            isOptimal: false,
            feedback: 'This compounds the original error with dishonesty.'
          },
          {
            id: 'choice_2a2',
            text: 'Admit that you witnessed a similar incident last week',
            nextNodeId: 'node_3a',
            isOptimal: true,
            feedback: 'Honesty now, while late, is still the right choice.'
          }
        ]
      },
      {
        id: 'node_2b',
        type: 'situation',
        content: `You fix the prop and complete the mission safely. That evening, you sit down to file the safety report.

As you write, you realize this report will identify the PIC's checklist deviation. The PIC is a senior operator who's well-respected. You know they were trying to keep the client happy.

**How do you write the report?**`,
        choices: [
          {
            id: 'choice_2b1',
            text: 'Focus only on the loose prop, omitting the checklist skip',
            nextNodeId: 'node_3b1',
            isOptimal: false,
            feedback: 'This omission prevents addressing the root cause.'
          },
          {
            id: 'choice_2b2',
            text: 'Document both the loose prop AND the checklist deviation factually',
            nextNodeId: 'node_3b2',
            isOptimal: true,
            feedback: 'Factual, complete reporting enables systemic improvement.'
          },
          {
            id: 'choice_2b3',
            text: 'Document everything but blame the client pressure',
            nextNodeId: 'node_3b3',
            isOptimal: false,
            feedback: 'While client pressure was a factor, framing as blame isn\'t constructive.'
          }
        ]
      },
      {
        id: 'node_2c',
        type: 'situation',
        content: `You refuse to continue until a formal report is filed. The PIC gets frustrated and says you're overreacting.

The client becomes visibly annoyed at the delay. They ask what's going on.

**How do you handle this?**`,
        choices: [
          {
            id: 'choice_2c1',
            text: 'Tell the client there was a safety issue that needs to be documented',
            nextNodeId: 'node_3c1',
            isOptimal: true,
            feedback: 'Transparency with clients about safety practices builds trust.'
          },
          {
            id: 'choice_2c2',
            text: 'Make up an excuse about equipment calibration',
            nextNodeId: 'node_3c2',
            isOptimal: false,
            feedback: 'Dishonesty undermines professional credibility.'
          }
        ]
      },
      {
        id: 'node_3a',
        type: 'situation',
        content: `You admit to witnessing the previous incident. Your manager is disappointed it wasn't reported, but thanks you for being honest now.

The investigation reveals a pattern: client pressure has been causing shortcuts across multiple crews.

**Your manager asks: "Why didn't you report it originally?"**`,
        choices: [
          {
            id: 'choice_3a1',
            text: '"I didn\'t want to get the PIC in trouble."',
            nextNodeId: 'node_end_learning',
            isOptimal: false,
            feedback: 'Understandable but reflects misunderstanding of Just Culture.'
          },
          {
            id: 'choice_3a2',
            text: '"I made a mistake. I should have reported it regardless of outcome."',
            nextNodeId: 'node_end_growth',
            isOptimal: true,
            feedback: 'Taking accountability while recognizing the learning opportunity.'
          }
        ]
      },
      {
        id: 'node_3b1',
        type: 'outcome',
        content: `Your report is filed but doesn't capture the full picture. The loose prop is treated as an isolated maintenance issue.

Three weeks later, another crew has the same problem—this time resulting in a crash. The investigation eventually reveals the pattern of checklist shortcuts.

**Your incomplete report delayed a fix that could have prevented the accident.**`,
        isSuccess: false,
        xpReward: 10,
        lessonLearned: 'Complete, honest reporting enables systemic fixes. Partial reports protect no one in the long run.'
      },
      {
        id: 'node_3b2',
        type: 'situation',
        content: `Your report documents both issues factually, without blame. The Safety Manager reviews it and schedules a meeting with you and the PIC.

At the meeting, the focus is on understanding what happened, not punishment. The PIC admits they felt pressure to keep the client happy.

**The Safety Manager asks you both: "What could we do differently to prevent this?"**`,
        choices: [
          {
            id: 'choice_3b2a',
            text: 'Suggest clearer communication to clients about safety requirements',
            nextNodeId: 'node_end_success',
            isOptimal: true,
            feedback: 'Addressing the systemic factor—client pressure—prevents future incidents.'
          },
          {
            id: 'choice_3b2b',
            text: 'Recommend disciplinary action for the PIC',
            nextNodeId: 'node_end_punitive',
            isOptimal: false,
            feedback: 'This was an honest mistake in a pressured situation—discipline would harm reporting culture.'
          }
        ]
      },
      {
        id: 'node_3b3',
        type: 'outcome',
        content: `Your report shifts blame to the client. While technically accurate that pressure existed, the framing creates defensiveness.

The operations manager is reluctant to address client management practices, and the PIC feels thrown under the bus.

**The core issue—how the organization handles client pressure—remains unaddressed.**`,
        isSuccess: false,
        xpReward: 20,
        lessonLearned: 'Effective safety reports focus on facts and systems, not blame. How you frame issues affects what gets fixed.'
      },
      {
        id: 'node_3c1',
        type: 'outcome',
        content: `You explain to the client that a pre-flight issue was identified and needs to be documented per safety protocols before continuing.

Surprisingly, the client is impressed. "That's exactly the kind of attention to safety we want from our operators."

The mission is delayed 30 minutes, but the client's confidence in your organization increases.

**Being transparent about safety practices built trust rather than eroding it.**`,
        isSuccess: true,
        xpReward: 45,
        lessonLearned: 'Professional clients respect safety-focused operations. Transparency about safety practices builds long-term trust.'
      },
      {
        id: 'node_3c2',
        type: 'outcome',
        content: `You make up an excuse about calibration. The client accepts it, and you eventually complete the mission.

But you've now established a pattern of dishonesty with the client. And the safety report still needs to be filed.

**The delay happened anyway, but now you've also compromised your integrity.**`,
        isSuccess: false,
        xpReward: 15,
        lessonLearned: 'Dishonesty provides short-term comfort but creates long-term problems. Integrity is essential for safety culture.'
      },
      {
        id: 'node_end_bad',
        type: 'outcome',
        content: `By denying knowledge of the previous incident, you've compounded the original mistake with dishonesty.

If the truth comes out later—and it often does—your credibility will be severely damaged.

**Both safety reporting AND personal integrity have been compromised.**`,
        isSuccess: false,
        xpReward: 5,
        lessonLearned: 'Covering up safety information makes everything worse. Honesty, even when difficult, is always the right choice.'
      },
      {
        id: 'node_end_learning',
        type: 'outcome',
        content: `Your manager understands your concern about the PIC, but explains Just Culture:

"In a Just Culture, honest mistakes aren't punished—they're opportunities to improve the system. The PIC won't face discipline for skipping the checklist under pressure. But if we don't know about it, we can't fix the conditions that caused it."

**You've learned an important lesson about why reporting matters.**`,
        isSuccess: true,
        xpReward: 35,
        lessonLearned: 'Just Culture protects honest reporters. The goal is fixing systems, not punishing individuals for understandable mistakes.'
      },
      {
        id: 'node_end_growth',
        type: 'outcome',
        content: `Your manager appreciates your honesty and self-reflection.

"That's exactly right. We all make mistakes in judgment. What matters is that you recognize it and do differently next time. And by coming forward now, you've helped us identify a pattern we can fix."

The organization implements new client communication protocols about safety requirements. The PIC is coached, not punished.

**Your honest reflection contributed to meaningful improvement.**`,
        isSuccess: true,
        xpReward: 45,
        lessonLearned: 'Taking accountability for mistakes—even late—demonstrates safety leadership. Honest reflection enables growth and system improvement.'
      },
      {
        id: 'node_end_success',
        type: 'outcome',
        content: `Your suggestion leads to a new procedure: project managers now set clear expectations with clients about safety requirements at project kickoff.

The PIC receives coaching on managing client pressure and is grateful for the supportive response.

The organization's Just Culture approach has worked as intended:
- A near-miss was reported honestly
- Root causes were identified
- System improvements were made
- No one was punished for an honest mistake

**This is safety management in action.**`,
        isSuccess: true,
        xpReward: 50,
        lessonLearned: 'Effective safety reporting leads to systemic improvement. Just Culture enables honest reporting by focusing on systems rather than blame.'
      },
      {
        id: 'node_end_punitive',
        type: 'outcome',
        content: `Recommending discipline for the PIC undermines Just Culture principles. The PIC made an honest mistake under pressure—exactly the situation Just Culture is designed to handle without punishment.

If discipline becomes the response, future near-misses will go unreported.

**The quick fix of punishment prevents the long-term fix of systemic improvement.**`,
        isSuccess: false,
        xpReward: 20,
        lessonLearned: 'Punishing honest mistakes destroys reporting culture. Just Culture reserves discipline for reckless disregard, not human error.'
      }
    ],
    regulatoryRefs: [
      { type: 'CAR', reference: 'CAR 107.02', section: 'Safety Management Systems' }
    ]
  },

  // Scenario for Quest 5: Swiss Cheese Model
  scenario_sms_chain_events: {
    id: 'scenario_sms_chain_events',
    trackId: 'track_sms_foundation',
    questId: 'quest_sms_swiss_cheese',
    slug: 'chain-of-events',
    title: 'Chain of Events',
    description: 'Analyze a developing situation and identify the failure points in the defensive layers. Your goal is to break the error chain before it leads to an incident.',
    type: 'decision_tree',
    difficulty: 'intermediate',
    estimatedTime: 10,
    xpReward: 50,
    learningObjectives: [
      'Identify latent and active failures in real-time',
      'Recognize when multiple defenses are failing',
      'Take action to break the error chain'
    ],
    startNodeId: 'node_1',
    nodes: [
      {
        id: 'node_1',
        type: 'situation',
        content: `You're the PIC preparing for an infrastructure inspection mission. As you review the pre-flight brief, you notice several concerning factors:

**Latent Conditions Present:**
- The aircraft was serviced yesterday by a new maintenance technician
- Your usual VO called in sick; you have a substitute who's qualified but unfamiliar with this site
- Weather forecast shows winds increasing through the afternoon

**You're scheduled to start at 10:00 AM.**

As you begin pre-flight, what's your priority?`,
        choices: [
          {
            id: 'choice_1a',
            text: 'Rush through pre-flight to beat the weather window',
            nextNodeId: 'node_2a',
            isOptimal: false,
            feedback: 'Time pressure is a classic contributor to error chains.'
          },
          {
            id: 'choice_1b',
            text: 'Conduct a thorough pre-flight, briefing the substitute VO on site-specific hazards',
            nextNodeId: 'node_2b',
            isOptimal: true,
            feedback: 'Extra vigilance when defenses are weakened is exactly right.'
          },
          {
            id: 'choice_1c',
            text: 'Request a mission delay until your regular VO is available',
            nextNodeId: 'node_2c',
            isOptimal: false,
            feedback: 'While cautious, this may not be necessary if other defenses are strengthened.'
          }
        ]
      },
      {
        id: 'node_2a',
        type: 'situation',
        content: `You rush through pre-flight to maximize your weather window. During a quick battery check, you don't notice that one battery is showing slightly lower voltage than normal—a detail in the maintenance log you didn't review.

Ten minutes into the flight, the substitute VO says: "I think I saw something move on the aircraft, but I'm not sure."

**What do you do?**`,
        choices: [
          {
            id: 'choice_2a1',
            text: '"You\'re probably just not used to this aircraft. Keep watching."',
            nextNodeId: 'node_3a1',
            isOptimal: false,
            feedback: 'Dismissing team input is a critical error.'
          },
          {
            id: 'choice_2a2',
            text: 'Immediately bring the aircraft closer for a visual inspection',
            nextNodeId: 'node_3a2',
            isOptimal: true,
            feedback: 'Good—taking any concern seriously, especially from a fresh perspective.'
          }
        ]
      },
      {
        id: 'node_2b',
        type: 'situation',
        content: `Your thorough pre-flight identifies a concern: the maintenance log shows a battery was replaced, but the voltage reading seems low for a new battery. You also spend 15 minutes briefing the substitute VO on site hazards, power line locations, and communication protocols.

This delays your start, but you feel prepared.

During flight, the VO reports: "Winds seem to be picking up faster than forecast."

**How do you respond?**`,
        choices: [
          {
            id: 'choice_2b1',
            text: 'Check wind speed, adjust flight plan, set a hard weather abort threshold',
            nextNodeId: 'node_3b1',
            isOptimal: true,
            feedback: 'Proactive adjustment to changing conditions.'
          },
          {
            id: 'choice_2b2',
            text: 'Continue the mission—the aircraft can handle more wind than forecast',
            nextNodeId: 'node_3b2',
            isOptimal: false,
            feedback: 'Overconfidence when conditions are changing is risky.'
          }
        ]
      },
      {
        id: 'node_2c',
        type: 'situation',
        content: `You request a mission delay. The project manager is frustrated—the client has a deadline, and this is the third delay this month.

"We're running out of excuses. The substitute VO is qualified. What's the actual problem?"

**How do you respond?**`,
        choices: [
          {
            id: 'choice_2c1',
            text: 'Explain the specific combination of risk factors present today',
            nextNodeId: 'node_3c1',
            isOptimal: true,
            feedback: 'Professional explanation of risk assessment.'
          },
          {
            id: 'choice_2c2',
            text: 'Back down and agree to proceed as scheduled',
            nextNodeId: 'node_2b',
            isOptimal: false,
            feedback: 'Caving to pressure after identifying concerns isn\'t ideal, but proceeding carefully can still work.'
          }
        ]
      },
      {
        id: 'node_3a1',
        type: 'outcome',
        content: `You dismiss the VO's observation. Two minutes later, a propeller blade separates from the aircraft.

The rushed pre-flight missed that the prop wasn't properly torqued after maintenance. The substitute VO—with fresh eyes—saw what you missed.

**The error chain completed:**
- Latent: New technician, insufficient torque
- Active: Rushed pre-flight, dismissed VO concern
- Outcome: Prop separation, aircraft loss

**Multiple defenses failed. The chain could have been broken at several points.**`,
        isSuccess: false,
        xpReward: 15,
        lessonLearned: 'Fresh perspectives from team members can catch what familiarity misses. Never dismiss safety observations.'
      },
      {
        id: 'node_3a2',
        type: 'situation',
        content: `You bring the aircraft closer. The VO confirms: "There! One of the props looks loose—it's wobbling."

You immediately land the aircraft. Inspection reveals the prop was not properly torqued after yesterday's maintenance.

**The error chain was broken:**
- Latent failure existed (maintenance error)
- Active failure occurred (rushed pre-flight)
- But VO observation and your response STOPPED the chain

**What do you do next?**`,
        choices: [
          {
            id: 'choice_3a2a',
            text: 'Fix the prop and continue the mission after documenting the issue',
            nextNodeId: 'node_end_partial',
            isOptimal: false,
            feedback: 'Continuing without full investigation may miss other issues.'
          },
          {
            id: 'choice_3a2b',
            text: 'Abort mission, conduct full inspection, file safety report',
            nextNodeId: 'node_end_good',
            isOptimal: true,
            feedback: 'Full investigation ensures all issues are caught.'
          }
        ]
      },
      {
        id: 'node_3b1',
        type: 'outcome',
        content: `You check the anemometer: winds are gusting to 25 kph, above your normal operating threshold but within limits. You adjust the flight plan to reduce exposure time and set a hard abort threshold at 30 kph.

Twenty minutes later, winds reach 28 kph. You make the call: "Initiating RTH. We'll complete the remaining area when conditions improve."

The VO confirms visual on the aircraft throughout return. Mission is 80% complete.

**Defenses worked:**
- Thorough pre-flight caught battery concern
- VO briefing enabled effective teamwork
- Dynamic monitoring caught wind increase
- Predetermined threshold triggered timely abort

**The error chain never formed because defenses remained intact.**`,
        isSuccess: true,
        xpReward: 50,
        lessonLearned: 'When latent conditions weaken defenses, strengthen other layers. Predetermined thresholds enable confident decisions under pressure.'
      },
      {
        id: 'node_3b2',
        type: 'situation',
        content: `You continue despite increasing winds. "These aircraft are rated for much more than this," you think.

At 15 minutes into the flight, a strong gust catches the aircraft. It recovers, but you notice the battery indicator has dropped faster than expected.

The winds are now gusty and unpredictable. You're 800m from launch point.

**What do you do?**`,
        choices: [
          {
            id: 'choice_3b2a',
            text: 'Continue to complete the mission—you\'re almost done',
            nextNodeId: 'node_end_bad',
            isOptimal: false,
            feedback: 'Plan continuation bias is extremely dangerous.'
          },
          {
            id: 'choice_3b2b',
            text: 'Initiate RTH immediately',
            nextNodeId: 'node_end_recovery',
            isOptimal: true,
            feedback: 'Better late than never on recognizing the accumulating risk.'
          }
        ]
      },
      {
        id: 'node_3c1',
        type: 'outcome',
        content: `You explain: "We have three risk factors aligning today: new maintenance technician, substitute VO unfamiliar with the site, and deteriorating weather. Each is manageable alone, but combined they significantly reduce our safety margins."

The project manager considers this. "Okay, I understand. What would make you comfortable proceeding?"

You suggest starting the mission but with clear abort criteria. The manager agrees and communicates the potential for partial completion to the client.

**Professional risk communication enabled a thoughtful decision rather than a reactive one.**`,
        isSuccess: true,
        xpReward: 40,
        lessonLearned: 'Articulating specific risk factors helps others understand decisions. Good risk communication enables collaborative safety decisions.'
      },
      {
        id: 'node_end_partial',
        type: 'outcome',
        content: `You fix the prop and continue. The mission completes successfully.

But you later learn that another aircraft from yesterday's maintenance batch had a similar issue—this time resulting in a prop separation during flight.

Because you fixed the issue and continued rather than reporting immediately, the pattern wasn't identified until after the second incident.

**You broke YOUR chain but didn't help prevent the next one.**`,
        isSuccess: true,
        xpReward: 30,
        lessonLearned: 'Breaking your own error chain is necessary but not sufficient. Reporting enables breaking future chains for others.'
      },
      {
        id: 'node_end_good',
        type: 'outcome',
        content: `You abort the mission and conduct a full inspection. You file a safety report documenting the loose prop and the fact it wasn't caught during your rushed pre-flight.

The investigation reveals the maintenance technician missed a step in the procedure. All aircraft serviced that day are inspected—two others have similar issues.

**Your decision to stop and report prevented multiple potential incidents.**

The error chain was broken AND the latent condition was fixed at its source.`,
        isSuccess: true,
        xpReward: 50,
        lessonLearned: 'Breaking the chain at one point is good. Fixing the latent condition prevents all future chains from that source.'
      },
      {
        id: 'node_end_bad',
        type: 'outcome',
        content: `You push to complete the mission. The battery, already suspect, depletes faster than normal due to fighting the winds.

At 600m from launch, you get a critical battery warning. You initiate RTH but the aircraft can't make it against the headwind.

The aircraft goes down 200m from launch in an inaccessible area.

**The error chain completed:**
- Latent: Suspect battery from maintenance
- Active: Ignored weather change, continued despite warnings
- Outcome: Aircraft loss due to battery depletion

**Multiple opportunities to break the chain were missed.**`,
        isSuccess: false,
        xpReward: 10,
        lessonLearned: 'Error chains often complete not from one big mistake, but from several small decisions to continue despite warning signs.'
      },
      {
        id: 'node_end_recovery',
        type: 'outcome',
        content: `You initiate RTH immediately. It's a tense return—the battery reaches 15% as the aircraft lands.

You secure the aircraft and review what happened. The combination of wind, battery consumption, and distance created a situation that nearly resulted in a loss.

**The error chain was broken late, but it was broken.**

You file a safety report documenting the decision to continue despite changing conditions and the near-miss outcome.`,
        isSuccess: true,
        xpReward: 35,
        lessonLearned: 'It\'s never too late to break the chain until it\'s too late. Recognizing accumulating risk and acting on it—even late—is better than not acting at all.'
      }
    ],
    regulatoryRefs: [
      { type: 'Standard', reference: 'Standard 922.01', section: 'Safety Risk Management' }
    ]
  },

  // Scenario for Quest 7: Risk Assessment & Mitigation
  scenario_sms_risky_mission: {
    id: 'scenario_sms_risky_mission',
    trackId: 'track_sms_foundation',
    questId: 'quest_sms_risk_assessment',
    slug: 'the-risky-mission',
    title: 'The Risky Mission',
    description: 'A client requests a challenging mission with multiple risk factors. Walk through a risk assessment and make go/no-go decisions.',
    type: 'decision_tree',
    difficulty: 'advanced',
    estimatedTime: 12,
    xpReward: 60,
    learningObjectives: [
      'Apply risk assessment matrices to real scenarios',
      'Evaluate multiple concurrent risk factors',
      'Make defensible go/no-go decisions'
    ],
    startNodeId: 'node_1',
    nodes: [
      {
        id: 'node_1',
        type: 'situation',
        content: `A mining company contacts you for an urgent survey. They need aerial data of a remote site where they suspect illegal dumping. The site is:

- 45 km from the nearest road (helicopter access only)
- In mountainous terrain with limited emergency landing options
- Near critical habitat for a species at risk
- Weather forecast shows marginal VFR conditions

The client is willing to pay premium rates and emphasizes this is time-sensitive—they need evidence before potential contamination spreads.

**How do you begin your assessment?**`,
        choices: [
          {
            id: 'choice_1a',
            text: 'Accept the mission—the premium pay justifies the extra effort',
            nextNodeId: 'node_bad_start',
            isOptimal: false,
            feedback: 'Financial considerations shouldn\'t drive risk acceptance.'
          },
          {
            id: 'choice_1b',
            text: 'Decline immediately—too many risk factors',
            nextNodeId: 'node_quick_decline',
            isOptimal: false,
            feedback: 'While cautious, this doesn\'t demonstrate risk assessment skills.'
          },
          {
            id: 'choice_1c',
            text: 'Conduct a systematic risk assessment before deciding',
            nextNodeId: 'node_2',
            isOptimal: true,
            feedback: 'Professional approach—assess before deciding.'
          }
        ]
      },
      {
        id: 'node_bad_start',
        type: 'outcome',
        content: `You accept based on financial considerations. During the operation, multiple issues compound:

- Weather deteriorates faster than forecast
- Remote location means no support if problems occur
- Battery performance is reduced by altitude and cold

You're forced to abort with incomplete data, equipment damaged during emergency landing.

**Financial pressure led to a poor decision. The assessment should have come first.**`,
        isSuccess: false,
        xpReward: 10,
        lessonLearned: 'Financial pressure is one of the most common contributors to poor safety decisions. Never let payment terms drive risk acceptance.'
      },
      {
        id: 'node_quick_decline',
        type: 'outcome',
        content: `You decline without conducting an assessment.

The client finds another operator who completes the mission safely by addressing the risks systematically—they used a larger aircraft with better range, scheduled for optimal weather, and coordinated with wildlife authorities.

**While your caution was understandable, a thorough assessment might have found a path to safe completion.**`,
        isSuccess: false,
        xpReward: 20,
        lessonLearned: 'Risk assessment isn\'t about finding reasons to say no—it\'s about understanding risk well enough to make informed decisions and find safe approaches.'
      },
      {
        id: 'node_2',
        type: 'situation',
        content: `You begin your risk assessment. First, identify the hazards:

**Environmental Hazards:**
- Remote location (limited emergency support)
- Mountainous terrain (turbulence, limited landing options)
- Marginal weather (visibility, ceiling concerns)
- Wildlife sensitivity

**Operational Hazards:**
- Extended flight time (battery, pilot fatigue)
- Helicopter coordination required
- Pressure to complete (time-sensitive)

**Rate the overall INITIAL risk level:**`,
        choices: [
          {
            id: 'choice_2a',
            text: 'LOW risk—these are manageable factors',
            nextNodeId: 'node_3a',
            isOptimal: false,
            feedback: 'Multiple compounding factors suggest higher initial risk.'
          },
          {
            id: 'choice_2b',
            text: 'MEDIUM risk—several factors require attention',
            nextNodeId: 'node_3b',
            isOptimal: false,
            feedback: 'This understates the combination of remote location plus weather plus terrain.'
          },
          {
            id: 'choice_2c',
            text: 'HIGH risk—multiple serious factors combine',
            nextNodeId: 'node_3c',
            isOptimal: true,
            feedback: 'Correct—remote + weather + terrain + time pressure = high initial risk.'
          }
        ]
      },
      {
        id: 'node_3a',
        type: 'situation',
        content: `You've rated this as LOW risk. Your operations manager reviews your assessment and points out:

"We have four independent factors that are each elevated, and they compound each other. Remote location means weather problems are more serious. Time pressure means we might push through deteriorating conditions. This needs a more careful look."

**Reassess the situation.**`,
        choices: [
          {
            id: 'choice_3a1',
            text: 'Revise to HIGH risk and develop mitigation plan',
            nextNodeId: 'node_3c',
            isOptimal: true,
            feedback: 'Good—recognizing when initial assessment needs revision.'
          }
        ]
      },
      {
        id: 'node_3b',
        type: 'situation',
        content: `You've rated this as MEDIUM risk. But consider the combinations:

- Remote + weather issue = potential stranded crew
- Time pressure + marginal conditions = pressure to continue when should abort
- Terrain + emergency = limited options if something goes wrong

**Do these combinations change your assessment?**`,
        choices: [
          {
            id: 'choice_3b1',
            text: 'Yes, revise to HIGH risk',
            nextNodeId: 'node_3c',
            isOptimal: true,
            feedback: 'Correct—compounding factors elevate risk significantly.'
          },
          {
            id: 'choice_3b2',
            text: 'No, MEDIUM with mitigations is appropriate',
            nextNodeId: 'node_med_path',
            isOptimal: false,
            feedback: 'You may underestimate the compound effect of multiple risks.'
          }
        ]
      },
      {
        id: 'node_3c',
        type: 'situation',
        content: `You've correctly identified this as HIGH initial risk. Now, what mitigations could reduce risk to an acceptable level?

**Select the most comprehensive mitigation package:**`,
        choices: [
          {
            id: 'choice_3c1',
            text: 'Wait for better weather only',
            nextNodeId: 'node_partial_mit',
            isOptimal: false,
            feedback: 'Weather is only one factor—other risks remain.'
          },
          {
            id: 'choice_3c2',
            text: 'Comprehensive package: weather window, helicopter standby, wildlife permit, extra crew/batteries, predetermined abort criteria',
            nextNodeId: 'node_full_mit',
            isOptimal: true,
            feedback: 'Address all identified risks with specific mitigations.'
          },
          {
            id: 'choice_3c3',
            text: 'Use a larger, longer-range aircraft',
            nextNodeId: 'node_partial_mit',
            isOptimal: false,
            feedback: 'Addresses range but not weather, wildlife, or pressure factors.'
          }
        ]
      },
      {
        id: 'node_med_path',
        type: 'outcome',
        content: `You proceed with MEDIUM risk rating. The mission is scheduled but weather proves worse than forecast.

At the remote site, conditions deteriorate. Your helicopter pilot is uncomfortable, your battery performance is poor in the cold, and you're rushing to get data before visibility drops further.

You complete partial coverage but with safety margins eroded throughout.

**The MEDIUM rating didn't adequately capture the compound risks.**`,
        isSuccess: false,
        xpReward: 25,
        lessonLearned: 'When multiple independent risks are present, the compound risk is often greater than any single factor suggests. Err on the side of higher assessment.'
      },
      {
        id: 'node_partial_mit',
        type: 'situation',
        content: `Your mitigation addresses one factor but leaves others elevated. The operations manager notes:

"Waiting for weather helps, but we still have:
- Remote location with limited support
- Wildlife sensitivity requiring coordination
- Time pressure encouraging shortcuts
- Terrain challenges if problems occur"

**How do you proceed?**`,
        choices: [
          {
            id: 'choice_partial1',
            text: 'Add mitigations for remaining risks',
            nextNodeId: 'node_full_mit',
            isOptimal: true,
            feedback: 'Good—comprehensive mitigation is needed for high-risk operations.'
          },
          {
            id: 'choice_partial2',
            text: 'Accept remaining risks as they are',
            nextNodeId: 'node_end_accept_risk',
            isOptimal: false,
            feedback: 'Accepting elevated residual risk requires explicit justification.'
          }
        ]
      },
      {
        id: 'node_full_mit',
        type: 'situation',
        content: `Your comprehensive mitigation package:

✓ **Weather:** Only proceed with VFR conditions, 2000m ceiling minimum, winds below 20 kph
✓ **Location:** Helicopter standby at site for duration, satellite communication
✓ **Wildlife:** Coordination with biologist, pre-approval for sensitive area access
✓ **Equipment:** Extra batteries, backup aircraft components, extended crew
✓ **Pressure:** Clear client communication about potential abort; deadline flexibility confirmed
✓ **Abort criteria:** Predetermined conditions requiring mission termination

**With these mitigations, what is the residual risk?**`,
        choices: [
          {
            id: 'choice_full1',
            text: 'Residual risk is now LOW—acceptable to proceed',
            nextNodeId: 'node_end_success',
            isOptimal: true,
            feedback: 'With comprehensive mitigations properly implemented, residual risk can be acceptable.'
          },
          {
            id: 'choice_full2',
            text: 'Residual risk is still HIGH—decline the mission',
            nextNodeId: 'node_end_conservative',
            isOptimal: false,
            feedback: 'If proper mitigations don\'t reduce risk, something may be missing in the analysis.'
          }
        ]
      },
      {
        id: 'node_end_accept_risk',
        type: 'outcome',
        content: `You proceed with partial mitigations, accepting elevated residual risk.

The mission encounters problems you didn't mitigate: wildlife disturbance leads to a complaint, helicopter support wasn't coordinated properly, and time pressure led to incomplete data collection.

**Accepting elevated residual risk without proper justification or authority led to multiple issues.**`,
        isSuccess: false,
        xpReward: 15,
        lessonLearned: 'Residual risk acceptance requires explicit acknowledgment and appropriate authority. High residual risk requires additional mitigations or mission modification.'
      },
      {
        id: 'node_end_success',
        type: 'outcome',
        content: `The mission proceeds with all mitigations in place.

Weather cooperates, the helicopter provides excellent support, wildlife authorities are satisfied with your protocols, and the client gets the data they need.

**Your risk assessment process enabled a complex mission to proceed safely:**

1. Initial risk correctly identified as HIGH
2. Comprehensive mitigations developed
3. Residual risk reduced to acceptable level
4. Proper approvals and coordination completed
5. Predetermined abort criteria provided decision framework

**This is professional risk management.**`,
        isSuccess: true,
        xpReward: 60,
        lessonLearned: 'High-risk operations can be conducted safely when risks are properly identified, mitigated, and residual risk is acceptable. The assessment process is what enables safe completion.'
      },
      {
        id: 'node_end_conservative',
        type: 'outcome',
        content: `You decline despite comprehensive mitigations.

While this is certainly the safest choice, it may reflect risk aversion rather than risk management. The mitigations you developed would have reduced risk to acceptable levels.

**Professional risk management enables safe completion of challenging operations—not just avoidance of all risk.**`,
        isSuccess: true,
        xpReward: 30,
        lessonLearned: 'There\'s a difference between prudent caution and excessive risk aversion. If comprehensive mitigations truly reduce residual risk to acceptable levels, proceeding may be appropriate.'
      }
    ],
    regulatoryRefs: [
      { type: 'SORA', reference: 'SORA 2.5', section: 'Risk Assessment Process' },
      { type: 'AC', reference: 'AC 903-001', section: 'Operational Risk Assessment' }
    ]
  }
}

export default smsScenarios
