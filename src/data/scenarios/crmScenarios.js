/**
 * CRM Training Scenarios
 *
 * Interactive decision-tree scenarios for Crew Resource Management training.
 * Each scenario tests communication, decision-making, and teamwork skills.
 *
 * @version 1.0.0
 */

const crmScenarios = {
  // Scenario for Quest 2: Threat & Error Management
  scenario_crm_mounting_threats: {
    id: 'scenario_crm_mounting_threats',
    trackId: 'track_crm_expert',
    questId: 'quest_crm_tem',
    slug: 'mounting-threats',
    title: 'Mounting Threats',
    description: 'Multiple threats begin accumulating during a routine mission. Apply TEM principles to manage the evolving situation.',
    type: 'decision_tree',
    difficulty: 'intermediate',
    estimatedTime: 10,
    xpReward: 50,
    learningObjectives: [
      'Identify and categorize threats as they emerge',
      'Apply threat management strategies proactively',
      'Recognize when accumulated threats require mission modification'
    ],
    startNodeId: 'node_1',
    nodes: [
      {
        id: 'node_1',
        type: 'situation',
        content: `You're conducting a pipeline inspection—a routine mission you've done dozens of times. Everything starts normally.

**Current Status:**
- Weather: Clear, 15°C, winds 10 kph
- Equipment: All systems nominal
- Crew: You (PIC) and experienced VO

Thirty minutes in, your VO reports: "I'm seeing what looks like a small private aircraft to the northwest, maybe 3-4 km out, heading this way."

**How do you respond?**`,
        choices: [
          {
            id: 'choice_1a',
            text: 'Continue the mission—3-4 km is plenty of distance',
            nextNodeId: 'node_2a',
            isOptimal: false,
            feedback: 'Proximity of manned aircraft is always a threat requiring active management.'
          },
          {
            id: 'choice_1b',
            text: 'Acknowledge the threat, reduce altitude, and continue monitoring',
            nextNodeId: 'node_2b',
            isOptimal: true,
            feedback: 'Active threat management while maintaining mission progress.'
          },
          {
            id: 'choice_1c',
            text: 'Immediately land and wait for the aircraft to clear the area',
            nextNodeId: 'node_2c',
            isOptimal: false,
            feedback: 'May be overly cautious for a distant aircraft, but safety-focused.'
          }
        ]
      },
      {
        id: 'node_2a',
        type: 'situation',
        content: `You continue without adjustment. Two minutes later, your VO says: "That aircraft is definitely closer now, maybe 2 km. And I'm noticing the wind has picked up—the vegetation is really moving."

You check your anemometer: winds are now 18 kph and gusty.

You now have two active threats:
1. Aircraft potentially converging
2. Increasing wind

**What do you do?**`,
        choices: [
          {
            id: 'choice_2a1',
            text: '"Let me know if the aircraft gets closer. The wind is within limits."',
            nextNodeId: 'node_3a1',
            isOptimal: false,
            feedback: 'Passive monitoring when threats are multiplying is insufficient.'
          },
          {
            id: 'choice_2a2',
            text: 'Lower altitude immediately and prepare to land if either threat escalates',
            nextNodeId: 'node_3a2',
            isOptimal: true,
            feedback: 'Now actively managing after delayed response.'
          }
        ]
      },
      {
        id: 'node_2b',
        type: 'situation',
        content: `Good call. You reduce altitude to 50m AGL and have your VO maintain continuous watch on the aircraft.

"Aircraft is maintaining course to our northwest. Looks like it will pass about 1.5 km north of us."

**Threat 1:** Managed through altitude reduction and monitoring.

But now your VO adds: "Wind is picking up. I'm seeing significant movement in the trees now."

You check: winds are 18 kph, gusting to 22.

**A second threat has emerged. How do you handle this?**`,
        choices: [
          {
            id: 'choice_2b1',
            text: 'Adjust flight pattern to minimize crosswind exposure, set abort threshold at 25 kph sustained',
            nextNodeId: 'node_3b1',
            isOptimal: true,
            feedback: 'Proactive threat management with predetermined decision criteria.'
          },
          {
            id: 'choice_2b2',
            text: 'Continue as planned—18 kph is within limits',
            nextNodeId: 'node_3b2',
            isOptimal: false,
            feedback: 'Trending threats should trigger response before limits are reached.'
          }
        ]
      },
      {
        id: 'node_2c',
        type: 'situation',
        content: `You land immediately. While waiting, the aircraft passes about 2 km to your north without incident.

Your VO says: "Good to go. That was probably overly cautious, but better safe."

You launch again, but now notice the wind has increased significantly during your ground time.

**Was the immediate landing the right call?**`,
        choices: [
          {
            id: 'choice_2c1',
            text: 'Yes—any potential conflict warrants landing',
            nextNodeId: 'node_3c1',
            isOptimal: false,
            feedback: 'This level of caution would make many operations impossible.'
          },
          {
            id: 'choice_2c2',
            text: 'Probably excessive—altitude reduction and monitoring would have sufficed',
            nextNodeId: 'node_3c2',
            isOptimal: true,
            feedback: 'Proportionate response to threats enables safe mission completion.'
          }
        ]
      },
      {
        id: 'node_3a1',
        type: 'situation',
        content: `Your passive approach continues. The aircraft passes about 1 km to your north—closer than comfortable.

Meanwhile, a gust catches your aircraft. You recover, but the GPS shows you've drifted 15 meters off course.

Your VO, sounding stressed: "That gust was strong. And I think I see another aircraft now, south of us."

**Three threats are now active. What do you do?**`,
        choices: [
          {
            id: 'choice_3a1a',
            text: 'Land immediately—this situation is getting out of control',
            nextNodeId: 'node_end_late_save',
            isOptimal: true,
            feedback: 'Better late than never on recognizing accumulated risk.'
          },
          {
            id: 'choice_3a1b',
            text: 'Continue—you can handle this',
            nextNodeId: 'node_end_bad',
            isOptimal: false,
            feedback: 'Overconfidence with multiple active threats is dangerous.'
          }
        ]
      },
      {
        id: 'node_3a2',
        type: 'outcome',
        content: `You lower altitude to 30m AGL and prepare to land. The first aircraft passes to your north.

But the wind continues to increase. A gust catches the aircraft at low altitude—you're dangerously close to the pipeline infrastructure.

You recover and land safely, but it was too close.

**Delayed threat recognition put you in a difficult position. The aircraft is safe, but margins were eroded.**`,
        isSuccess: true,
        xpReward: 30,
        lessonLearned: 'Early threat recognition and response maintains margins. Delayed response means managing threats with reduced options.'
      },
      {
        id: 'node_3b1',
        type: 'situation',
        content: `You adjust your pattern to minimize crosswind and set clear criteria: abort at 25 kph sustained.

The first aircraft passes safely to the north. You're monitoring the wind closely.

Your VO reports: "I'm seeing what might be smoke or dust to the west. Hard to tell."

**A third potential threat. How do you respond?**`,
        choices: [
          {
            id: 'choice_3b1a',
            text: 'Investigate the smoke/dust—could affect visibility',
            nextNodeId: 'node_4a',
            isOptimal: false,
            feedback: 'Adding investigation task increases workload when already managing threats.'
          },
          {
            id: 'choice_3b1b',
            text: 'Note it, maintain current priorities, accelerate mission completion',
            nextNodeId: 'node_4b',
            isOptimal: true,
            feedback: 'Good prioritization—don\'t let potential threats distract from active ones.'
          },
          {
            id: 'choice_3b1c',
            text: 'Abort mission immediately—too many variables',
            nextNodeId: 'node_4c',
            isOptimal: false,
            feedback: 'Current threats are managed—additional caution is good but aborting may be premature.'
          }
        ]
      },
      {
        id: 'node_3b2',
        type: 'situation',
        content: `You continue as planned. Five minutes later, winds hit 25 kph sustained.

You decide to continue: "We're almost done with this section."

A gust catches the aircraft. Control is momentarily lost, and when you recover, your VO says:

"Another aircraft, coming from the south this time. And that gust pushed us toward the pipeline—we were maybe 10 meters away."

**Multiple threats have now combined into a near-miss. What do you do?**`,
        choices: [
          {
            id: 'choice_3b2a',
            text: 'Land immediately and abort the mission',
            nextNodeId: 'node_end_close_call',
            isOptimal: true,
            feedback: 'Correct—the situation has exceeded acceptable risk.'
          }
        ]
      },
      {
        id: 'node_3c1',
        type: 'outcome',
        content: `While cautious, treating every distant aircraft as requiring immediate landing would severely limit operations.

The aircraft was 3-4 km away and not directly converging. Altitude reduction and monitoring would have been proportionate responses.

**Good threat awareness, but the response was not proportionate to the actual threat level.**`,
        isSuccess: true,
        xpReward: 25,
        lessonLearned: 'Threat response should be proportionate. Overreaction consumes resources and can create fatigue, while underreaction creates risk.'
      },
      {
        id: 'node_3c2',
        type: 'situation',
        content: `You recognize the response was excessive. The wind has now increased while you were on the ground.

"Let's reassess before launching again," you decide. Good thinking.

You check conditions: winds are now 20 kph and increasing. The earlier caution has cost you the weather window.

**What do you decide?**`,
        choices: [
          {
            id: 'choice_3c2a',
            text: 'Abort for today—conditions have deteriorated',
            nextNodeId: 'node_end_learning',
            isOptimal: true,
            feedback: 'Correct—conditions have changed during the delay.'
          },
          {
            id: 'choice_3c2b',
            text: 'Launch quickly to complete before it gets worse',
            nextNodeId: 'node_end_pressure',
            isOptimal: false,
            feedback: 'Rushing to make up lost time creates new risks.'
          }
        ]
      },
      {
        id: 'node_4a',
        type: 'outcome',
        content: `You divert attention to investigate the smoke/dust. This takes your focus away from the wind monitoring.

While investigating, you miss that winds have now exceeded 25 kph. A gust catches the aircraft and you struggle to recover.

**Adding a new task while managing existing threats led to attention diverted from active threats.**`,
        isSuccess: false,
        xpReward: 20,
        lessonLearned: 'When managing active threats, don\'t let potential threats distract you. Maintain priorities and workload management.'
      },
      {
        id: 'node_4b',
        type: 'situation',
        content: `You note the potential visibility issue but maintain focus on completing the current section with your existing threat management.

Two minutes later, you complete the planned survey area. Winds are now at 23 kph.

"That's our section complete. Winds are trending up. What do you think?"

Your VO responds: "I'd say we got what we need. That dust to the west seems to be getting closer too."

**Decision time: Push for additional coverage or secure?**`,
        choices: [
          {
            id: 'choice_4ba',
            text: 'We got what we came for. RTH and secure.',
            nextNodeId: 'node_end_success',
            isOptimal: true,
            feedback: 'Mission complete with margins intact.'
          },
          {
            id: 'choice_4bb',
            text: 'Let\'s grab one more section while we\'re here.',
            nextNodeId: 'node_end_push',
            isOptimal: false,
            feedback: 'Extending when threats are active erodes margins.'
          }
        ]
      },
      {
        id: 'node_4c',
        type: 'outcome',
        content: `You abort the mission. The threats were being managed effectively, but your risk tolerance was exceeded.

This is a valid choice—you're never wrong to prioritize safety. However, the current threats were identified and being managed with predetermined criteria.

**Conservative approach, but mission incomplete despite manageable conditions.**`,
        isSuccess: true,
        xpReward: 30,
        lessonLearned: 'Aborting is always acceptable when risk tolerance is exceeded. However, effective threat management can enable safe mission completion.'
      },
      {
        id: 'node_end_bad',
        type: 'outcome',
        content: `You continue despite three active threats. Seconds later, a gust hits while you're watching the southern aircraft.

The drone impacts the pipeline infrastructure. Damage to both the drone and the pipeline.

**Multiple unmanaged threats combined into an incident.**

The TEM chain completed:
- Threats: Aircraft traffic, wind, distraction
- Errors: Insufficient monitoring, delayed response
- Undesired State: Loss of control near infrastructure
- Outcome: Collision and damage`,
        isSuccess: false,
        xpReward: 10,
        lessonLearned: 'Multiple threats compound risk exponentially. Each threat requires active management; ignoring any increases likelihood of error chain completion.'
      },
      {
        id: 'node_end_late_save',
        type: 'outcome',
        content: `You land immediately. As you secure the aircraft, the second aircraft passes overhead at what looks like 500 feet AGL—directly over your position.

The wind gusts to 28 kph moments later.

**You broke the threat chain, but only after it had nearly completed.**

The situation was recoverable, but your delayed response left minimal margin for error.`,
        isSuccess: true,
        xpReward: 35,
        lessonLearned: 'Late threat recognition is better than none, but early recognition and response maintains margins throughout the operation.'
      },
      {
        id: 'node_end_close_call',
        type: 'outcome',
        content: `You land immediately after the near-miss with the pipeline.

On the ground, you review what happened:
- Wind threat was identified but not actively managed
- Predetermined abort criteria would have prevented the near-miss
- Multiple threats combined while attention was divided

**A near-miss is a valuable learning opportunity—but it shouldn't have gotten that close.**`,
        isSuccess: true,
        xpReward: 25,
        lessonLearned: 'Predetermined abort criteria enable confident decisions before situations become critical. Without them, escalating threats can accumulate faster than responses.'
      },
      {
        id: 'node_end_learning',
        type: 'outcome',
        content: `You abort for the day. While frustrating, the decision is sound—conditions have deteriorated beyond acceptable.

**Key learning:** Your initial overreaction to the first aircraft cost you the weather window. A more proportionate response (altitude reduction and monitoring) would have allowed mission completion.

However, your decision to abort now rather than push into worsening conditions shows good judgment.

**The mission is incomplete, but safety was maintained.**`,
        isSuccess: true,
        xpReward: 35,
        lessonLearned: 'Threat responses should be proportionate. Overreaction has costs (delays, missed windows) just as underreaction has risks (safety margins).'
      },
      {
        id: 'node_end_pressure',
        type: 'outcome',
        content: `You launch quickly to make up time. The pressure to complete leads you to skip your normal thorough pre-launch checks.

Forty-five seconds into flight, you lose GPS lock. Without the stabilization, the aircraft in gusty conditions becomes difficult to control.

You recover and land, but the rushed launch created a new error on top of existing threats.

**Time pressure after a delay led to a compounding error.**`,
        isSuccess: false,
        xpReward: 15,
        lessonLearned: 'Rushing to make up lost time creates new risks. Accept delays rather than compromising procedures or launching into deteriorating conditions.'
      },
      {
        id: 'node_end_success',
        type: 'outcome',
        content: `You initiate RTH. The aircraft returns safely.

As you pack up, the dust cloud reaches your position—it would have significantly reduced visibility. And winds are now gusting over 30 kph.

**Mission complete, safety margins maintained:**

✓ Aircraft traffic: Managed through altitude reduction and monitoring
✓ Wind: Managed through pattern adjustment and abort criteria
✓ Potential visibility issue: Noted, prioritized correctly, avoided through timely completion

**This is effective Threat and Error Management.**`,
        isSuccess: true,
        xpReward: 50,
        lessonLearned: 'Active threat management enables mission completion. Identify threats early, develop mitigation strategies, set predetermined criteria, and act decisively when thresholds are reached.'
      },
      {
        id: 'node_end_push',
        type: 'outcome',
        content: `You decide to push for one more section. Winds hit 27 kph within minutes.

A strong gust requires aggressive control input. The aircraft stabilizes but your VO reports: "The dust is really close now—I can barely see the aircraft."

You initiate emergency RTH, but visibility continues to drop. The aircraft returns, but you lose visual contact for 15 seconds during approach.

**Pushing when threats are active eroded your margins to near-zero.**`,
        isSuccess: true,
        xpReward: 25,
        lessonLearned: 'When mission objectives are met and threats are active, secure the win. Pushing for additional gains risks losing what you\'ve achieved.'
      }
    ],
    regulatoryRefs: [
      { type: 'CAR', reference: 'CAR 901.23', section: 'Visual Line of Sight' }
    ]
  },

  // Scenario for Quest 4: Situational Awareness
  scenario_crm_lost_loop: {
    id: 'scenario_crm_lost_loop',
    trackId: 'track_crm_expert',
    questId: 'quest_crm_sa',
    slug: 'lost-in-the-loop',
    title: 'Lost in the Loop',
    description: 'Experience how situational awareness degrades and practice recovery techniques.',
    type: 'decision_tree',
    difficulty: 'intermediate',
    estimatedTime: 8,
    xpReward: 50,
    learningObjectives: [
      'Recognize the warning signs of SA degradation',
      'Apply SA recovery techniques',
      'Understand how task fixation leads to SA loss'
    ],
    startNodeId: 'node_1',
    nodes: [
      {
        id: 'node_1',
        type: 'situation',
        content: `You're conducting an inspection of a communication tower. The client is watching and asks you to capture a specific component on the tower.

You zoom in on the component and begin orbiting to get good coverage. The client is providing detailed instructions: "A little higher... no, back down... can you get closer to that junction?"

You're focused on getting the shot. Your VO has been quiet for a while.

**What should you do?**`,
        choices: [
          {
            id: 'choice_1a',
            text: 'Continue focusing on the shot—the client is paying for this',
            nextNodeId: 'node_2a',
            isOptimal: false,
            feedback: 'Client focus can lead to fixation and SA loss.'
          },
          {
            id: 'choice_1b',
            text: 'Pause and ask your VO for a position and status update',
            nextNodeId: 'node_2b',
            isOptimal: true,
            feedback: 'Regular SA checks prevent degradation.'
          },
          {
            id: 'choice_1c',
            text: 'Tell the client you need a moment to check aircraft status',
            nextNodeId: 'node_2c',
            isOptimal: true,
            feedback: 'Prioritizing aircraft awareness over client requests is correct.'
          }
        ]
      },
      {
        id: 'node_2a',
        type: 'situation',
        content: `You continue focusing on the shot. The client is satisfied with the footage.

When you finally look at your telemetry, you notice:
- Battery is at 28%
- You're 180 meters from launch point
- Winds have increased
- Your VO is waving at you

**How long have you been fixated on the camera?**`,
        choices: [
          {
            id: 'choice_2a1',
            text: 'Immediately check in with VO and assess situation',
            nextNodeId: 'node_3a1',
            isOptimal: true,
            feedback: 'SA recovery needs to happen now.'
          },
          {
            id: 'choice_2a2',
            text: 'Just need to finish this last shot, then I\'ll check',
            nextNodeId: 'node_3a2',
            isOptimal: false,
            feedback: 'Continuing fixation when warning signs are present.'
          }
        ]
      },
      {
        id: 'node_2b',
        type: 'situation',
        content: `You pause the client interaction. "Hold on—let me do a quick check."

Your VO reports: "You've been orbiting for about 4 minutes. Battery at 35%. I had you blocked by the tower for the last 30 seconds but you're clear now. Wind seems a bit stronger."

**The SA check reveals:**
- Time awareness: You lost track (thought it was 2 minutes)
- Battery awareness: Lower than expected
- Position awareness: VO lost visual briefly

**How do you proceed?**`,
        choices: [
          {
            id: 'choice_2b1',
            text: 'Get one more quick shot then RTH',
            nextNodeId: 'node_3b1',
            isOptimal: false,
            feedback: 'SA degradation is a warning—pushing further increases risk.'
          },
          {
            id: 'choice_2b2',
            text: 'Begin RTH now, inform client we have good coverage',
            nextNodeId: 'node_3b2',
            isOptimal: true,
            feedback: 'Responding to SA warnings with action.'
          }
        ]
      },
      {
        id: 'node_2c',
        type: 'situation',
        content: `"Give me just a moment," you tell the client. You conduct a systematic check:

**Position:** 150m out, 80m AGL, clear of obstacles
**Status:** Battery 38%, all systems normal
**Environment:** Wind 15kph, no traffic
**Plan:** 5 minutes of filming remaining

Your VO confirms: "Looking good from here. No traffic, visual maintained."

**This is what maintaining SA looks like. How do you continue?**`,
        choices: [
          {
            id: 'choice_2c1',
            text: 'Good check. Continue filming with periodic rechecks',
            nextNodeId: 'node_end_good_sa',
            isOptimal: true,
            feedback: 'Regular SA maintenance while conducting mission.'
          }
        ]
      },
      {
        id: 'node_3a1',
        type: 'situation',
        content: `You call out to your VO. They shout: "Battery warning on my monitor! And we've got someone walking toward the tower base!"

You now realize:
- Battery is critical (28%)
- A pedestrian is entering your area
- You've been fixated for unknown duration
- VO was trying to get your attention

**SA is severely degraded. What's your priority?**`,
        choices: [
          {
            id: 'choice_3a1a',
            text: 'Aviate first—initiate RTH immediately',
            nextNodeId: 'node_end_recovery',
            isOptimal: true,
            feedback: 'Correct prioritization.'
          },
          {
            id: 'choice_3a1b',
            text: 'Warn the pedestrian first—they\'re in danger',
            nextNodeId: 'node_end_wrong_priority',
            isOptimal: false,
            feedback: 'Aircraft control comes before communication.'
          }
        ]
      },
      {
        id: 'node_3a2',
        type: 'outcome',
        content: `You continue for "one more shot." The battery hits critical. The aircraft begins auto-RTH.

But you're disoriented—which way is home? The RTH is heading toward the tower, not away from it.

You realize your home point updated incorrectly. You take manual control but the battery dies moments later.

**Complete SA loss led to a situation you couldn't recover from.**`,
        isSuccess: false,
        xpReward: 10,
        lessonLearned: 'Fixation prevents seeing the big picture. When warning signs appear, responding immediately is crucial—there may not be another chance.'
      },
      {
        id: 'node_3b1',
        type: 'outcome',
        content: `You push for one more shot. During the approach, your VO shouts: "Wire! Wire on your left!"

You pull away, but the surprise maneuver pushes you toward the tower. You recover, but your heart is racing.

You RTH immediately afterward. The shot you tried to get is blurry from the evasive maneuver anyway.

**The SA degradation warning should have been your cue to stop, not continue.**`,
        isSuccess: true,
        xpReward: 25,
        lessonLearned: 'SA degradation is a warning sign, not a problem solved by one check. When SA is compromised, reduce task load and return to basics.'
      },
      {
        id: 'node_3b2',
        type: 'outcome',
        content: `"We've got excellent coverage," you tell the client. "Let's bring it back."

You initiate RTH. Your VO provides guidance: "Clear path back, nothing in the way."

On the ground, you review the footage—you actually got the component the client wanted in the first two minutes of orbiting. The additional time was redundant.

**SA recovery enabled safe completion. The footage review shows the extra time wasn't needed anyway.**`,
        isSuccess: true,
        xpReward: 45,
        lessonLearned: 'Responding to SA warnings with action maintains margins. Often, mission objectives are met before we realize it—fixation prevents seeing this.'
      },
      {
        id: 'node_end_good_sa',
        type: 'outcome',
        content: `You complete the filming with regular SA checks every 2 minutes.

Battery at 30%, you RTH with good margin. The client is satisfied with the footage, and at no point did you lose awareness of position, status, or environment.

**This is what SA maintenance looks like:**
- Periodic systematic checks
- VO engagement throughout
- Client interaction without losing aircraft awareness
- Recognition of natural completion point

**Good SA doesn't happen by accident—it requires deliberate attention.**`,
        isSuccess: true,
        xpReward: 50,
        lessonLearned: 'SA maintenance requires deliberate effort. Regular checks, team engagement, and resisting fixation preserve awareness throughout operations.'
      },
      {
        id: 'node_end_recovery',
        type: 'outcome',
        content: `You immediately initiate RTH. The aircraft heads home while you have the VO warn the pedestrian.

The aircraft lands with 22% battery—cutting it closer than comfortable.

You debrief the event:
- Fixation on camera work led to SA loss
- VO engagement broke down during fixation
- Client interaction contributed to distraction
- Recovery happened, but margins were eroded

**SA was recovered, but the loss should never have occurred.**`,
        isSuccess: true,
        xpReward: 35,
        lessonLearned: 'SA recovery is possible but costly. Prevention through regular checks is better than recovery after degradation.'
      },
      {
        id: 'node_end_wrong_priority',
        type: 'outcome',
        content: `You focus on warning the pedestrian while the aircraft continues on its path.

Without your attention, the aircraft drifts toward the tower structure. Your VO shouts but you're distracted.

The aircraft clips a guy-wire and crashes.

**When SA is degraded, Aviate-Navigate-Communicate prioritization is critical. The aircraft must be secured before anything else.**`,
        isSuccess: false,
        xpReward: 15,
        lessonLearned: 'Aviate, Navigate, Communicate is not just a slogan—it\'s a survival priority. Aircraft control always comes first, especially when SA is degraded.'
      }
    ],
    regulatoryRefs: [
      { type: 'Standard', reference: 'Standard 921.19', section: 'Visual Observer Requirements' }
    ]
  },

  // Scenario for Quest 7: Workload Management
  scenario_crm_task_saturation: {
    id: 'scenario_crm_task_saturation',
    trackId: 'track_crm_expert',
    questId: 'quest_crm_workload',
    slug: 'task-saturation',
    title: 'Task Saturation',
    description: 'Manage competing demands during a high-workload situation.',
    type: 'decision_tree',
    difficulty: 'advanced',
    estimatedTime: 10,
    xpReward: 50,
    learningObjectives: [
      'Recognize signs of task saturation',
      'Apply workload management techniques',
      'Make appropriate shedding decisions'
    ],
    startNodeId: 'node_1',
    nodes: [
      {
        id: 'node_1',
        type: 'situation',
        content: `You're conducting a real estate mapping mission when everything starts happening at once:

1. Your VO reports: "Vehicle approaching the landing zone"
2. Your phone rings—it's the client
3. You notice battery is at 35%
4. A notification pops up on your tablet about changing weather

**All four things need attention. How do you prioritize?**`,
        choices: [
          {
            id: 'choice_1a',
            text: 'Handle them in order: vehicle, phone, battery, weather',
            nextNodeId: 'node_2a',
            isOptimal: false,
            feedback: 'Sequential processing without prioritization.'
          },
          {
            id: 'choice_1b',
            text: 'Ignore the phone, focus on aircraft control and safety items',
            nextNodeId: 'node_2b',
            isOptimal: true,
            feedback: 'Correct—shed low-priority tasks, focus on safety.'
          },
          {
            id: 'choice_1c',
            text: 'Tell VO to handle the vehicle while you take the client call',
            nextNodeId: 'node_2c',
            isOptimal: false,
            feedback: 'Delegating safety while taking non-urgent communication.'
          }
        ]
      },
      {
        id: 'node_2a',
        type: 'situation',
        content: `You try to handle everything in sequence.

"VO, what's the vehicle doing?"—takes 30 seconds
You answer the phone—"Can I call you right back?"—takes 20 seconds
You check battery—now at 32%
The weather notification has cleared from your screen

You're now 50 seconds behind and not sure what the weather update said.

**Your workload management approach created information gaps. What now?**`,
        choices: [
          {
            id: 'choice_2a1',
            text: 'Keep going—you can catch up',
            nextNodeId: 'node_3a1',
            isOptimal: false,
            feedback: 'Behind and trying to catch up increases errors.'
          },
          {
            id: 'choice_2a2',
            text: 'Pause, assess priorities, reset your SA',
            nextNodeId: 'node_3a2',
            isOptimal: true,
            feedback: 'Better to pause and reset than push through confusion.'
          }
        ]
      },
      {
        id: 'node_2b',
        type: 'situation',
        content: `Phone goes to voicemail. You focus on the priorities:

**Aviate:** Aircraft stable, 35% battery—adequate
**Safety:** "VO, vehicle status?"

"Vehicle stopped at the edge, driver is watching. Not entering the zone."

**Navigate/Monitor:** You check the weather notification—winds increasing to 25 kph in 20 minutes.

**With the situation assessed, what's your next action?**`,
        choices: [
          {
            id: 'choice_2b1',
            text: 'Complete the current mapping run, then RTH before weather arrives',
            nextNodeId: 'node_3b1',
            isOptimal: true,
            feedback: 'Good prioritization and time management.'
          },
          {
            id: 'choice_2b2',
            text: 'Call the client back now that things are stable',
            nextNodeId: 'node_3b2',
            isOptimal: false,
            feedback: 'Don\'t add tasks when workload is already elevated.'
          }
        ]
      },
      {
        id: 'node_2c',
        type: 'situation',
        content: `You take the client call while your VO handles the vehicle.

The client is asking about the footage so far. You're trying to answer while monitoring the aircraft and listening to your VO's updates about the vehicle.

You miss something the client said. You also miss something your VO said. The aircraft is now in a hover but you've lost track of the mission progress.

**Divided attention has degraded everything. What do you do?**`,
        choices: [
          {
            id: 'choice_2c1',
            text: '"Client, I need to call you back in 10 minutes." Then reset.',
            nextNodeId: 'node_3c1',
            isOptimal: true,
            feedback: 'Recognizing overload and correcting.'
          },
          {
            id: 'choice_2c2',
            text: 'Finish the call quickly, then figure out where you are',
            nextNodeId: 'node_3c2',
            isOptimal: false,
            feedback: 'Finishing a non-critical task while confused is risky.'
          }
        ]
      },
      {
        id: 'node_3a1',
        type: 'outcome',
        content: `You try to keep going despite being behind and confused.

Without knowing the weather update, you continue the mission. Fifteen minutes later, winds hit 28 kph unexpectedly. You struggle to control the aircraft for RTH.

You land safely, but the mission is incomplete and you're rattled.

**Trying to "catch up" when saturated usually makes things worse.**`,
        isSuccess: true,
        xpReward: 20,
        lessonLearned: 'When task-saturated, don\'t try to catch up—pause, prioritize, and reset. Pushing through confusion compounds errors.'
      },
      {
        id: 'node_3a2',
        type: 'outcome',
        content: `You take 20 seconds to pause and reset:
- Aircraft is stable
- VO reports vehicle is not a threat
- You check weather forecast manually—winds increasing soon

With SA restored, you make a clean decision: complete current run, then RTH.

**The pause cost 20 seconds but prevented compounding errors.**`,
        isSuccess: true,
        xpReward: 40,
        lessonLearned: 'A brief pause to reset SA is almost always worth the time. Deliberate prioritization is faster than confusion.'
      },
      {
        id: 'node_3b1',
        type: 'outcome',
        content: `You complete the mapping run and initiate RTH at 28% battery.

The aircraft returns with 22% battery. The weather arrives 15 minutes later—right on schedule.

You call the client back: "Mission complete, footage looks good. Happy to review with you."

**Effective workload management:**
- Shed non-critical tasks (phone call)
- Focus on safety priorities
- Use available information (weather forecast)
- Complete mission within margins

**This is professional task management.**`,
        isSuccess: true,
        xpReward: 50,
        lessonLearned: 'When workload is high, shed what can wait. Focus on the critical path. Deferred tasks can be addressed when workload normalizes.'
      },
      {
        id: 'node_3b2',
        type: 'situation',
        content: `You call the client back. They have multiple questions about the footage and what you've captured so far.

While on the call, the weather arrives earlier than expected. Wind gusts catch the aircraft.

Your VO shouts a warning while you're mid-sentence with the client.

**What do you do?**`,
        choices: [
          {
            id: 'choice_3b2a',
            text: '"Client, emergency—call you back!" Drop phone, focus on aircraft.',
            nextNodeId: 'node_end_recover',
            isOptimal: true,
            feedback: 'Correct—shed everything for the emergency.'
          }
        ]
      },
      {
        id: 'node_3c1',
        type: 'outcome',
        content: `"Client, I need to focus on the aircraft. I'll call you back in 10 minutes."

You hang up and reset:
- "VO, vehicle status?"—"All clear, they drove away."
- Battery at 33%
- Position: Middle of mapping grid

You've recovered from the overload and can continue clearly.

**Recognizing overload and correcting is a skill. It takes discipline to cut off a client, but safety requires it.**`,
        isSuccess: true,
        xpReward: 40,
        lessonLearned: 'Recognizing task saturation and taking action to reduce it is a critical skill. Clients will understand—professionals prioritize safety.'
      },
      {
        id: 'node_3c2',
        type: 'outcome',
        content: `You finish the call while confused about aircraft status.

When you hang up, you realize you've lost 2 minutes of awareness. The aircraft has been hovering, burning battery. You're now at 30%.

You can probably complete the mission, but your margins are reduced and you're flustered.

**The call could have waited. The aircraft couldn't.**`,
        isSuccess: true,
        xpReward: 25,
        lessonLearned: 'Non-critical tasks seem urgent but rarely are. Aircraft safety can\'t be paused—everything else can.'
      },
      {
        id: 'node_end_recover',
        type: 'outcome',
        content: `You drop the call and focus entirely on the aircraft.

The wind gust was significant, but you recover control and initiate RTH. The return is bumpy but successful.

You land with 25% battery. The mission is 80% complete—you'll need to return for the rest.

**Shedding everything non-essential in an emergency is correct. The client will understand; they'd much rather you have an aircraft to finish the job with.**`,
        isSuccess: true,
        xpReward: 35,
        lessonLearned: 'In emergencies, shed everything. Aviate is always priority one. Everything else—clients, communication, mission completion—is secondary.'
      }
    ],
    regulatoryRefs: [
      { type: 'CAR', reference: 'CAR 901.71', section: 'Pilot-in-Command Responsibility' }
    ]
  },

  // Scenario for Quest 8: Decision Making
  scenario_crm_split_second: {
    id: 'scenario_crm_split_second',
    trackId: 'track_crm_expert',
    questId: 'quest_crm_decision',
    slug: 'split-second',
    title: 'Split Second',
    description: 'Make time-critical decisions when there\'s no time for analysis.',
    type: 'decision_tree',
    difficulty: 'advanced',
    estimatedTime: 8,
    xpReward: 50,
    learningObjectives: [
      'Apply time-critical decision-making principles',
      'Trust trained responses under pressure',
      'Recover and reassess after emergency response'
    ],
    startNodeId: 'node_1',
    nodes: [
      {
        id: 'node_1',
        type: 'situation',
        content: `You're conducting a bridge inspection, flying a pattern around the structure. Everything is normal.

Suddenly, your VO yells: "BIRD STRIKE! Something hit the aircraft!"

You see the aircraft wobble, then stabilize. Telemetry shows all systems normal, but you heard something.

**You have seconds to decide. What do you do?**`,
        choices: [
          {
            id: 'choice_1a',
            text: 'Immediately initiate RTH',
            nextNodeId: 'node_2a',
            isOptimal: true,
            feedback: 'Default to safety when uncertain about aircraft status.'
          },
          {
            id: 'choice_1b',
            text: 'Hover and assess—telemetry looks okay',
            nextNodeId: 'node_2b',
            isOptimal: false,
            feedback: 'Assessment is valuable, but hovering near obstacle after potential damage is risky.'
          },
          {
            id: 'choice_1c',
            text: 'Continue the mission—if telemetry is good, aircraft is good',
            nextNodeId: 'node_2c',
            isOptimal: false,
            feedback: 'Telemetry may not show all damage.'
          }
        ]
      },
      {
        id: 'node_2a',
        type: 'situation',
        content: `You immediately call "RTH!" and initiate the return.

The aircraft begins heading home. About 30 seconds into the return, the aircraft starts pulling to one side. A propeller is damaged.

Your quick decision to RTH is now paying off—you're heading away from obstacles toward a safe landing area.

**But the aircraft is handling poorly. What do you do?**`,
        choices: [
          {
            id: 'choice_2a1',
            text: 'Continue RTH—almost home',
            nextNodeId: 'node_3a1',
            isOptimal: false,
            feedback: 'Degraded aircraft may not make it—closer landing site may be safer.'
          },
          {
            id: 'choice_2a2',
            text: 'Take manual control, land at nearest safe location',
            nextNodeId: 'node_3a2',
            isOptimal: true,
            feedback: 'Adapt to deteriorating situation.'
          }
        ]
      },
      {
        id: 'node_2b',
        type: 'situation',
        content: `You bring the aircraft to a hover to assess. It's holding position, but you're 20 meters from the bridge structure.

Your VO reports: "I see something hanging off one of the motors. Maybe a prop piece."

The aircraft wobbles. You're close to the bridge.

**Hover assessment has revealed damage, but you're in a dangerous position. What now?**`,
        choices: [
          {
            id: 'choice_2b1',
            text: 'Immediately move away from the bridge, then land at nearest safe spot',
            nextNodeId: 'node_3b1',
            isOptimal: true,
            feedback: 'Correct—get clear of obstacles first.'
          },
          {
            id: 'choice_2b2',
            text: 'Try to land on the bridge deck—it\'s flat and close',
            nextNodeId: 'node_3b2',
            isOptimal: false,
            feedback: 'Landing on active infrastructure with damaged aircraft is extremely risky.'
          }
        ]
      },
      {
        id: 'node_2c',
        type: 'outcome',
        content: `You continue the mission. For 45 seconds, everything seems fine.

Then the vibration from the damaged prop causes a motor failure. The aircraft spirals into the water below the bridge.

**You lost the aircraft because you didn't respond to a clear warning sign.**

Time-critical decisions favor action over analysis when safety is uncertain.`,
        isSuccess: false,
        xpReward: 10,
        lessonLearned: 'When something abnormal happens, default to safety. Telemetry doesn\'t show everything—physical damage may not be apparent until failure.'
      },
      {
        id: 'node_3a1',
        type: 'outcome',
        content: `You continue the RTH despite the handling problems.

Fifty meters from home, the damaged prop fails completely. The aircraft autorotates to the ground, crashing on concrete.

Aircraft is destroyed. If you had landed at the grass area you passed 30 seconds earlier, the aircraft might have survived.

**Adapting to a deteriorating situation is critical. Original plans become invalid when conditions change.**`,
        isSuccess: false,
        xpReward: 20,
        lessonLearned: 'Don\'t continue to a destination that was planned before the emergency. Reassess constantly and adapt to the current situation.'
      },
      {
        id: 'node_3a2',
        type: 'outcome',
        content: `You take manual control and scan for landing options. A grassy area is 40 meters to your right.

Fighting the pull, you guide the aircraft toward the grass. It's not pretty, but you land safely.

On inspection, two propeller blades are damaged. The aircraft would not have made it another 100 meters.

**Your adaptive decision saved the aircraft.**`,
        isSuccess: true,
        xpReward: 50,
        lessonLearned: 'Time-critical decisions require constant reassessment. When conditions change, adapt the plan. A safe landing nearby beats a crash en route to home.'
      },
      {
        id: 'node_3b1',
        type: 'outcome',
        content: `You command "Move away from bridge!" and climb while moving laterally.

The aircraft clears the structure. Your VO spots an open area 60 meters away.

With the aircraft clear of obstacles, you make a controlled descent to the open area. The landing is rough but the aircraft is saved.

**Getting clear of obstacles first, then landing, was the correct priority.**`,
        isSuccess: true,
        xpReward: 45,
        lessonLearned: 'In emergencies near obstacles, gaining separation is priority one. Land second. Obstacles turn minor emergencies into disasters.'
      },
      {
        id: 'node_3b2',
        type: 'outcome',
        content: `You attempt to land on the bridge deck. The damaged aircraft wobbles unpredictably.

During the descent, a gust catches the damaged side. The aircraft rolls and impacts the bridge railing, then falls into the water.

**Attempting a precision landing with a damaged aircraft near hard obstacles was too risky.**`,
        isSuccess: false,
        xpReward: 15,
        lessonLearned: 'Damaged aircraft have reduced controllability. Landing on infrastructure (bridges, roads, buildings) should be avoided—find soft, open areas when possible.'
      }
    ],
    regulatoryRefs: [
      { type: 'CAR', reference: 'CAR 901.71', section: 'Emergency Authority' }
    ]
  }
}

export default crmScenarios
