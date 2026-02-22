/**
 * RPAS Operations Scenarios
 *
 * Interactive decision-tree scenarios for RPAS flight operations training.
 *
 * @version 1.0.0
 */

const rpasScenarios = {
  // Scenario: Pre-Flight Discovery
  'pre-flight-discovery': {
    id: 'pre-flight-discovery',
    trackId: 'rpas-flight-operations',
    questId: 'pre-flight-operations',
    title: 'Pre-Flight Discovery',
    description: 'You\'re conducting a pre-flight inspection and discover potential issues. Can you identify what\'s safe to fly and what requires action?',
    difficulty: 'intermediate',
    estimatedTime: 12,
    xpReward: 75,
    context: `You're the PIC preparing for a commercial infrastructure inspection mission. The client is expecting imagery delivery today, and weather is showing a narrow window of acceptable conditions this afternoon. During your pre-flight inspection, you notice several things that require your attention.

The RPAS is a commercial quadcopter with a 45-minute flight time and automated RTH features.`,

    initialNode: 'start',
    nodes: {
      start: {
        id: 'start',
        type: 'situation',
        content: `You begin your pre-flight inspection checklist. The aircraft was last flown 3 days ago without any noted issues.

During your visual inspection, you observe:
- Minor dirt accumulation on the camera lens
- One propeller has a small nick (approximately 2mm) on the leading edge
- Battery shows 97% charge after sitting for 3 days
- Firmware notification indicates an optional update is available

How do you proceed?`,
        choices: [
          {
            id: 'address-all',
            text: 'Address all items systematically before any flight decision',
            nextNode: 'systematic-review'
          },
          {
            id: 'quick-fix',
            text: 'Clean the lens, dismiss the firmware notification, and proceed',
            nextNode: 'quick-fix-result'
          },
          {
            id: 'propeller-focus',
            text: 'The propeller damage is the priority concern - assess it first',
            nextNode: 'propeller-assessment'
          },
          {
            id: 'all-fine',
            text: 'These are all minor issues - proceed with the flight',
            nextNode: 'hasty-departure'
          }
        ]
      },

      'systematic-review': {
        id: 'systematic-review',
        type: 'positive',
        content: `Excellent approach. You systematically address each item:

**Lens:** Quick clean with microfiber cloth - resolved.

**Battery:** 97% after 3 days is excellent retention. You check cell voltage balance - all cells within 0.02V. Battery is healthy.

**Firmware:** You review the update notes - it's a minor stability improvement, not safety-critical. You note to update after this mission.

**Propeller:** Now you examine this more closely...`,
        choices: [
          {
            id: 'detailed-prop',
            text: 'Examine the propeller damage in detail',
            nextNode: 'propeller-assessment'
          }
        ]
      },

      'propeller-assessment': {
        id: 'propeller-assessment',
        type: 'situation',
        content: `You examine the propeller closely:

- The nick is on the leading edge, approximately 2mm wide and 1mm deep
- No cracks visible extending from the damage
- The propeller is a plastic composite type
- You have spare propellers available
- The damage appears to be from contact with a small object (possibly gravel)

Your maintenance documentation states that propeller damage assessment should consider: crack propagation risk, balance effects, and flight criticality.

What's your decision?`,
        choices: [
          {
            id: 'replace-prop',
            text: 'Replace the propeller before flight - damage could worsen',
            nextNode: 'replace-decision'
          },
          {
            id: 'test-first',
            text: 'Run a brief hover test to check for vibration',
            nextNode: 'hover-test'
          },
          {
            id: 'fly-anyway',
            text: 'The damage is minor - fly the mission as planned',
            nextNode: 'damage-progresses'
          },
          {
            id: 'sand-smooth',
            text: 'Sand the nick smooth and then fly',
            nextNode: 'improvised-repair'
          }
        ]
      },

      'replace-decision': {
        id: 'replace-decision',
        type: 'positive',
        content: `You decide to replace the propeller. This takes about 5 minutes.

After installation:
- You verify the new propeller is the correct type
- You check that it's seated properly and secured
- You verify all other propellers are secure

You perform a brief motor run-up at low throttle to verify no unusual sounds or vibration.

The aircraft passes all remaining pre-flight checks.`,
        choices: [
          {
            id: 'continue-preflight',
            text: 'Continue with remaining pre-flight procedures',
            nextNode: 'weather-check'
          }
        ]
      },

      'hover-test': {
        id: 'hover-test',
        type: 'situation',
        content: `You perform a low hover test. The aircraft hovers at 3 feet for about 30 seconds.

You observe:
- Slight vibration noticeable in the video feed
- Flight controller shows "Motor 3 vibration warning"
- The aircraft maintains stable hover
- No unusual sounds

The vibration is likely from the damaged propeller affecting balance.

What do you do now?`,
        choices: [
          {
            id: 'now-replace',
            text: 'The warning confirms it - replace the propeller now',
            nextNode: 'replace-after-test'
          },
          {
            id: 'acceptable-vibration',
            text: 'Vibration is minor and hover was stable - proceed with mission',
            nextNode: 'vibration-worsens'
          }
        ]
      },

      'replace-after-test': {
        id: 'replace-after-test',
        type: 'positive',
        content: `Good decision to trust the diagnostic warning. You replace the propeller and repeat the hover test.

This time:
- Video feed is smooth
- No vibration warnings
- Hover is rock-solid

The short delay is well worth the confidence in aircraft airworthiness. You continue with pre-flight preparations.`,
        choices: [
          {
            id: 'to-weather',
            text: 'Continue to weather assessment',
            nextNode: 'weather-check'
          }
        ]
      },

      'vibration-worsens': {
        id: 'vibration-worsens',
        type: 'negative',
        content: `You launch for the mission. During the climb-out, the vibration warning persists and worsens.

At 200 feet, you notice:
- Video footage is degraded by vibration
- Flight controller logs multiple motor warnings
- The client imagery will be unusable

You're forced to abort the mission and return. When you land, closer inspection reveals the original nick has propagated into a visible crack.

**Lesson Learned:** Propeller damage can worsen rapidly under operational stress. A 5-minute propeller change would have prevented this mission failure.`,
        choices: [
          {
            id: 'retry',
            text: 'Retry the scenario',
            nextNode: 'start'
          }
        ]
      },

      'damage-progresses': {
        id: 'damage-progresses',
        type: 'negative',
        content: `You proceed with the mission. During a high-power climb maneuver, the propeller crack propagates rapidly.

The propeller sheds a blade tip at 150 feet. The sudden imbalance causes:
- Severe vibration throughout the aircraft
- Loss of altitude control
- Emergency autoland activation

The aircraft performs an emergency landing 50 meters from your position, sustaining damage to the landing gear and camera gimbal.

**Lesson Learned:** Small propeller damage can lead to catastrophic failure under load. Always replace damaged propellers - they're inexpensive compared to the potential consequences.`,
        choices: [
          {
            id: 'retry',
            text: 'Retry the scenario',
            nextNode: 'start'
          }
        ]
      },

      'improvised-repair': {
        id: 'improvised-repair',
        type: 'negative',
        content: `You sand the nick to smooth it. While this may seem logical, there are problems:

- You've removed material, further weakening the propeller
- Composite propellers aren't designed for field repair
- Balance is now definitely affected
- Your maintenance documentation doesn't authorize this repair

A hover test shows significant vibration - worse than before your "repair."

**Lesson Learned:** Improvised repairs to flight-critical components are not appropriate. Propellers are consumable items - replace, don't repair.`,
        choices: [
          {
            id: 'retry',
            text: 'Retry the scenario',
            nextNode: 'start'
          }
        ]
      },

      'quick-fix-result': {
        id: 'quick-fix-result',
        type: 'situation',
        content: `You quickly clean the lens and dismiss the firmware notification.

You haven't specifically addressed:
- The propeller nick
- Battery health verification

Your checklist shows these items as "inspected" but you haven't actually assessed the propeller damage against maintenance criteria.

During your weather briefing, you realize you've rushed the inspection. You have an uneasy feeling about the propeller.

What do you do?`,
        choices: [
          {
            id: 'go-back',
            text: 'Go back and properly assess the propeller',
            nextNode: 'propeller-assessment'
          },
          {
            id: 'push-through',
            text: 'Continue - you\'re probably overthinking it',
            nextNode: 'hasty-departure'
          }
        ]
      },

      'hasty-departure': {
        id: 'hasty-departure',
        type: 'negative',
        content: `You launch without properly addressing the pre-flight findings.

During the mission, the propeller damage worsens and causes significant vibration. Combined with the client pressure and rushed preparation, you find yourself:
- Dealing with degraded video quality
- Worrying about the vibration
- Unable to focus on the actual mission

The resulting footage is unusable, and you'll need to return another day - after proper aircraft maintenance.

**Lesson Learned:** Pre-flight inspections exist for a reason. Rushing them to meet schedule pressure often leads to worse outcomes than addressing issues properly would have.`,
        choices: [
          {
            id: 'retry',
            text: 'Retry the scenario',
            nextNode: 'start'
          }
        ]
      },

      'weather-check': {
        id: 'weather-check',
        type: 'situation',
        content: `With the aircraft now airworthy, you check the weather:

- Current conditions: 8 km visibility, scattered clouds at 3000 feet, winds 12 km/h gusting to 20 km/h
- Forecast: Frontal system approaching, expected arrival in 3 hours
- Your mission requires approximately 2 hours including setup and flight time

The conditions are currently acceptable for flight. What's your plan?`,
        choices: [
          {
            id: 'proceed-monitoring',
            text: 'Proceed with enhanced weather monitoring throughout',
            nextNode: 'successful-mission'
          },
          {
            id: 'shortened-mission',
            text: 'Shorten the mission to allow buffer before front arrives',
            nextNode: 'conservative-success'
          },
          {
            id: 'postpone',
            text: 'Postpone until tomorrow for more stable conditions',
            nextNode: 'postpone-discussion'
          }
        ]
      },

      'successful-mission': {
        id: 'successful-mission',
        type: 'positive',
        content: `You proceed with the mission while actively monitoring conditions.

Key decisions throughout the flight:
- You set up weather alerts on your phone
- Your VO is briefed to watch for weather changes
- You prioritize critical shots first
- You have a clear abort plan if conditions deteriorate

The mission is completed successfully with 45 minutes to spare before conditions deteriorate. The client receives their imagery on schedule.

**Outcome:** By properly addressing the pre-flight issues and maintaining weather awareness, you achieved a safe and successful mission.`,
        choices: [
          {
            id: 'complete',
            text: 'Complete scenario',
            nextNode: 'debrief'
          }
        ]
      },

      'conservative-success': {
        id: 'conservative-success',
        type: 'positive',
        content: `You decide to shorten the mission, prioritizing the most critical infrastructure sections.

This conservative approach:
- Ensures completion before weather deteriorates
- Reduces time pressure on the crew
- Allows proper shutdown procedures
- Maintains safety margins

You complete the essential coverage and offer the client a follow-up visit for the remaining sections. They appreciate your professionalism.

**Outcome:** Sometimes the best mission is a shorter, safer mission.`,
        choices: [
          {
            id: 'complete',
            text: 'Complete scenario',
            nextNode: 'debrief'
          }
        ]
      },

      'postpone-discussion': {
        id: 'postpone-discussion',
        type: 'situation',
        content: `You consider postponing. While this is the most conservative option, consider:

- Current conditions ARE acceptable for flight
- You have a 3-hour window
- Your mission requires 2 hours
- Professional operations require reasonable go/no-go decisions

Postponing every mission for ideal conditions isn't practical. The question is whether your current margins are acceptable.

What's your final decision?`,
        choices: [
          {
            id: 'proceed-after-all',
            text: 'On reflection, proceed with appropriate monitoring',
            nextNode: 'successful-mission'
          },
          {
            id: 'confirm-postpone',
            text: 'Still prefer to postpone for more margin',
            nextNode: 'overly-cautious'
          }
        ]
      },

      'overly-cautious': {
        id: 'overly-cautious',
        type: 'neutral',
        content: `You postpone the mission. While safety is paramount, this decision may have been overly conservative given:

- Acceptable current conditions
- Adequate time window
- Proper monitoring available

Professional pilots must balance caution with operational requirements. In this case, a well-managed mission with enhanced weather monitoring would have been appropriate.

**Learning Point:** "No-go" decisions should be based on actual risk, not general discomfort. However, if you're not confident, postponing is always acceptable.`,
        choices: [
          {
            id: 'complete',
            text: 'Complete scenario',
            nextNode: 'debrief'
          }
        ]
      },

      debrief: {
        id: 'debrief',
        type: 'debrief',
        content: `## Scenario Debrief: Pre-Flight Discovery

### Key Learning Points

1. **Systematic Inspection:** Address ALL pre-flight findings methodically. Rushing leads to missed issues.

2. **Propeller Damage:** Any propeller damage should be taken seriously. Replace rather than repair - propellers are inexpensive compared to the consequences of failure.

3. **Documentation Compliance:** Follow maintenance documentation criteria, not "gut feel" about what seems okay.

4. **Weather Margins:** Maintain awareness of changing conditions throughout the mission window.

5. **Time Pressure:** Don't let client pressure or schedule concerns compromise safety decisions.

### Applicable Regulations
- CAR 901.20 - Pre-flight actions
- CAR 901.28 - Operating condition limitations
- Manufacturer maintenance documentation requirements`,
        isTerminal: true
      }
    }
  },

  // Scenario: Weather Moving In
  'weather-moving-in': {
    id: 'weather-moving-in',
    trackId: 'rpas-flight-operations',
    questId: 'in-flight-operations',
    title: 'Weather Moving In',
    description: 'Conditions are changing mid-mission. Make the right call about continuing, adapting, or aborting.',
    difficulty: 'intermediate',
    estimatedTime: 10,
    xpReward: 75,
    context: `You're conducting a linear infrastructure inspection along a 5km pipeline corridor. You're at the 3km mark - 60% complete. The morning started clear, but conditions are now changing.

Your visual observer has radio contact with you at the ground control station.`,

    initialNode: 'start',
    nodes: {
      start: {
        id: 'start',
        type: 'situation',
        content: `Your VO radios: "PIC, I'm seeing some weather building to the west. Looks like it might be headed our way."

You check conditions:
- Current position: 3km into 5km mission
- Remaining flight time: approximately 35 minutes
- Wind has picked up from 10 km/h to 18 km/h in the last 15 minutes
- Visibility is still good but you can see darker clouds approaching
- Distance to safe landing: current position is near an access road

What's your first action?`,
        choices: [
          {
            id: 'check-radar',
            text: 'Check weather radar and forecasts immediately',
            nextNode: 'radar-check'
          },
          {
            id: 'continue-watching',
            text: 'Continue the mission while monitoring - conditions are still acceptable',
            nextNode: 'continuing-risk'
          },
          {
            id: 'immediate-rtl',
            text: 'Initiate immediate return to launch',
            nextNode: 'premature-abort'
          },
          {
            id: 'land-nearby',
            text: 'Land at the nearby access road and reassess',
            nextNode: 'precautionary-landing'
          }
        ]
      },

      'radar-check': {
        id: 'radar-check',
        type: 'situation',
        content: `You pull up weather radar on your tablet. The display shows:

- A line of showers approximately 15km to the west
- Movement: eastward at approximately 20 km/h
- Estimated time to your location: 40-50 minutes
- No severe weather warnings

Your current mission segment will take 15-20 more minutes to reach the next good landing point. Return to launch would take 10 minutes.

How do you proceed?`,
        choices: [
          {
            id: 'complete-segment',
            text: 'Complete current segment to next landing point, then reassess',
            nextNode: 'segment-completion'
          },
          {
            id: 'return-now',
            text: 'Return to launch now - better safe than sorry',
            nextNode: 'early-return'
          },
          {
            id: 'push-completion',
            text: 'Try to complete entire remaining mission before weather arrives',
            nextNode: 'pushing-luck'
          }
        ]
      },

      'continuing-risk': {
        id: 'continuing-risk',
        type: 'situation',
        content: `You continue the mission. Five minutes later:

- Wind now gusting to 25 km/h (approaching your limit)
- First raindrops visible on camera
- Visibility reducing
- VO reports the weather is moving in faster than expected

You're now at the 3.5km mark with about 25 minutes of mission remaining.

What do you do now?`,
        choices: [
          {
            id: 'abort-now',
            text: 'Abort immediately - conditions have deteriorated',
            nextNode: 'late-abort'
          },
          {
            id: 'push-more',
            text: 'Just a bit more - we\'re so close',
            nextNode: 'weather-caught'
          }
        ]
      },

      'late-abort': {
        id: 'late-abort',
        type: 'neutral',
        content: `You abort and initiate RTL. The aircraft returns safely, but:

- You had to fly through increasing winds
- Some raindrops hit the aircraft
- The last 5 minutes of flight were stressful

You complete the return safely, but the aircraft needs to be inspected for water exposure.

**Learning Point:** Earlier action when conditions started changing would have been less stressful and posed less risk to the aircraft.`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Continue to debrief',
            nextNode: 'debrief'
          }
        ]
      },

      'weather-caught': {
        id: 'weather-caught',
        type: 'negative',
        content: `You push on. Within 3 minutes, you're in trouble:

- Wind gusts exceed aircraft limits
- Rain begins in earnest
- Visibility drops significantly
- The aircraft struggles to maintain position

You abort, but the return flight is hazardous. The aircraft is buffeted by wind and rain. You manage to land safely, but:

- Aircraft requires full weather damage inspection
- Some electronics may have water damage
- Mission data quality for the last segment is compromised

**Lesson Learned:** Weather rarely waits for you to finish. When conditions are deteriorating, early action is always better than being caught.`,
        choices: [
          {
            id: 'retry',
            text: 'Retry scenario',
            nextNode: 'start'
          }
        ]
      },

      'segment-completion': {
        id: 'segment-completion',
        type: 'positive',
        content: `You make a measured decision: complete the current segment to a natural stopping point, maintaining continuous weather awareness.

You communicate the plan to your VO: "Completing to the 4km access point, then we'll reassess. Monitor conditions and call immediately if anything changes rapidly."

15 minutes later, you reach the access point. Weather radar shows:
- Weather now 8km out
- Still 30-40 minutes until arrival at your position
- Winds steady at 18 km/h

You have captured 80% of the pipeline corridor. What next?`,
        choices: [
          {
            id: 'call-it',
            text: 'Land and call it a day - 80% is a good stopping point',
            nextNode: 'smart-stop'
          },
          {
            id: 'one-more',
            text: 'Push for one more short segment',
            nextNode: 'final-segment'
          }
        ]
      },

      'smart-stop': {
        id: 'smart-stop',
        type: 'positive',
        content: `You land at the 4km access point. Your rationale:

- 80% of mission completed
- Good quality data captured
- Aircraft and crew safe
- Easy return for the remaining 20%
- Weather approaching with reasonable but not excessive margin

You pack up efficiently and depart the area with time to spare.

**Outcome:** Professional operations sometimes mean knowing when "good enough today" is the right answer. The remaining 20% can be captured on a better day.`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Continue to debrief',
            nextNode: 'debrief'
          }
        ]
      },

      'final-segment': {
        id: 'final-segment',
        type: 'situation',
        content: `You launch for one more segment. The 4km to 4.5km section takes 8 minutes.

Conditions hold, but you notice:
- Winds are gusting higher during this segment
- The weather is clearly visible now
- Your VO sounds tense

You complete the segment and land at 4.5km. Now:
- Weather is 5km out
- Winds gusting to 22 km/h
- 90% of mission complete

Do you push for the final 10%?`,
        choices: [
          {
            id: 'final-stop',
            text: 'Stop now - 90% with safety is better than 100% with risk',
            nextNode: 'good-stop-final'
          },
          {
            id: 'finish-it',
            text: 'We\'re so close - finish the last 500 meters',
            nextNode: 'photo-finish'
          }
        ]
      },

      'good-stop-final': {
        id: 'good-stop-final',
        type: 'positive',
        content: `You stop at 90% completion. As you pack up, the rain arrives - you made the right call with about 15 minutes to spare.

**Outcome:** You've captured nearly the entire corridor, maintained safety margins, and can easily complete the final segment on another day. Professional decision-making throughout.`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Continue to debrief',
            nextNode: 'debrief'
          }
        ]
      },

      'photo-finish': {
        id: 'photo-finish',
        type: 'neutral',
        content: `You launch for the final 500 meters. The segment takes 5 minutes.

You complete it, but:
- Rain begins before you land
- The final landing is in light rain
- You rush the shutdown to get the aircraft covered

You complete 100%, but:
- Aircraft needs weather inspection
- You cut it very close
- The stress wasn't worth the final 10%

**Learning Point:** Sometimes 90% safely is better than 100% with stress and risk. The cost of returning for 500m is trivial compared to weather damage.`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Continue to debrief',
            nextNode: 'debrief'
          }
        ]
      },

      'early-return': {
        id: 'early-return',
        type: 'neutral',
        content: `You return to launch immediately. The aircraft lands safely with plenty of margin.

However, the weather doesn't arrive for another 45 minutes. You had time to:
- Complete at least another segment safely
- Capture more of the client's requirements
- Make better use of the operational window

**Learning Point:** Conservative is good, but overly conservative can also be a problem. Use available information (weather radar, forecasts) to make informed decisions rather than purely reactive ones.`,
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
        content: `You initiate immediate RTL. Your VO questions: "Are you sure? Conditions seem okay here and that weather could be a while."

You're now returning to launch without having assessed the actual weather situation. The RTL will take about 10 minutes.

During the return, you realize you don't actually know:
- How far away the weather is
- How fast it's moving
- Whether it's severe or just scattered showers

What do you think about this decision?`,
        choices: [
          {
            id: 'stick-with-it',
            text: 'Stick with the decision - better safe',
            nextNode: 'early-return'
          },
          {
            id: 'reconsider',
            text: 'Should have gathered more information first',
            nextNode: 'reflection-moment'
          }
        ]
      },

      'reflection-moment': {
        id: 'reflection-moment',
        type: 'neutral',
        content: `You're right - information before action would have been better.

Good decision-making in dynamic situations requires:
1. Gathering available information quickly
2. Assessing the actual threat level
3. Making proportionate responses
4. Maintaining options when possible

A brief pause to check weather radar would have given you the information to make a better decision - whether that's continuing, staging forward, or returning.

The aircraft returns safely. You've captured 60% of the mission.`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Continue to debrief',
            nextNode: 'debrief'
          }
        ]
      },

      'precautionary-landing': {
        id: 'precautionary-landing',
        type: 'positive',
        content: `You land at the nearby access road - a smart intermediate option that:
- Removes the aircraft from potential risk
- Maintains your position in the mission corridor
- Gives you time to assess properly
- Preserves all options

With the aircraft safely on the ground, you check weather radar and current conditions. This gives you accurate information to make your next decision without time pressure.

After assessment, you determine you have about 40 minutes before weather arrives.`,
        choices: [
          {
            id: 'resume-from-here',
            text: 'Resume mission with better situational awareness',
            nextNode: 'informed-continuation'
          },
          {
            id: 'pack-up',
            text: 'Pack up and return - you\'ve gathered enough data',
            nextNode: 'safe-departure'
          }
        ]
      },

      'informed-continuation': {
        id: 'informed-continuation',
        type: 'positive',
        content: `With accurate weather information, you continue the mission with:
- Clear understanding of available time
- Defined abort criteria
- Intermediate landing points identified
- VO briefed on weather monitoring

You complete another 30% of the mission (total 90%) before landing with comfortable margin as weather approaches.

**Outcome:** The precautionary landing gave you information and options. This led to a better outcome than either continuing blind or aborting prematurely.`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Continue to debrief',
            nextNode: 'debrief'
          }
        ]
      },

      'safe-departure': {
        id: 'safe-departure',
        type: 'positive',
        content: `You decide 60% with good data quality is sufficient for today. You pack up and depart with ample margin.

This is a valid decision - sometimes discretion is the better part of valor, especially when:
- Good quality data already captured
- Weather uncertainty remains
- Return visit is feasible

**Outcome:** Safe, professional, conservative. The remaining 40% can be captured another day.`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Continue to debrief',
            nextNode: 'debrief'
          }
        ]
      },

      'pushing-luck': {
        id: 'pushing-luck',
        type: 'negative',
        content: `You decide to try to complete the entire remaining mission.

This requires 35 minutes of flying with weather 40-50 minutes away. Your margins are thin.

At the 4km mark, conditions deteriorate faster than expected:
- Wind gusts reaching limits
- Rain visible approaching
- VO urges you to abort

You're forced into a hasty retreat. The aircraft takes minor rain exposure. Final coverage: 75% - less than if you'd made measured decisions.

**Lesson Learned:** Racing weather rarely ends well. Measured progress with good stopping points beats attempting to outrun conditions.`,
        choices: [
          {
            id: 'retry',
            text: 'Retry scenario',
            nextNode: 'start'
          }
        ]
      },

      debrief: {
        id: 'debrief',
        type: 'debrief',
        content: `## Scenario Debrief: Weather Moving In

### Key Learning Points

1. **Information First:** When conditions change, gather information before making major decisions. Weather radar takes 30 seconds to check.

2. **Intermediate Options:** Precautionary landings and staging give you time and options without committing to abort or continue.

3. **Natural Stopping Points:** Plan missions with intermediate stopping points. This allows graceful partial completion.

4. **Margin Management:** Weather margins should be comfortable, not minimal. If you're racing the weather, you've already lost.

5. **Partial Completion:** 80% safely is usually better than 100% with stress and risk. Return visits are cheaper than weather damage.

### Weather Decision Framework
- What information do I have?
- What's the threat timeline?
- What are my intermediate options?
- What's the minimum acceptable outcome?
- When is my hard abort point?`,
        isTerminal: true
      }
    }
  },

  // Scenario: System Failure
  'system-failure': {
    id: 'system-failure',
    trackId: 'rpas-flight-operations',
    questId: 'emergency-procedures',
    title: 'System Failure',
    description: 'You\'re mid-mission when something goes wrong. Apply the 6-step emergency procedure and manage the situation.',
    difficulty: 'advanced',
    estimatedTime: 12,
    xpReward: 100,
    context: `You're conducting an aerial survey over a mixed-use area: agricultural land with a small residential area nearby. You're at 300 feet AGL, approximately 400 meters from your launch position. Weather is calm and visibility is excellent.

Your aircraft is equipped with RTH and auto-land functionality.`,

    initialNode: 'start',
    nodes: {
      start: {
        id: 'start',
        type: 'situation',
        content: `You're capturing survey imagery when you notice something wrong:

Your telemetry display suddenly shows:
- "GPS: DEGRADED" warning
- Position indicator becoming erratic
- Compass heading fluctuating

The aircraft is currently in GPS-assisted flight mode. It begins drifting slightly as position hold becomes unreliable.

Your 6-Step Emergency Procedure is:
1. Maintain aircraft control
2. Analyze the situation
3. Take appropriate action
4. Land as soon as safely possible
5. Secure the scene
6. Report

What's your immediate action?`,
        choices: [
          {
            id: 'maintain-control',
            text: 'Switch to attitude mode to maintain direct control',
            nextNode: 'attitude-mode'
          },
          {
            id: 'activate-rth',
            text: 'Immediately activate Return to Home',
            nextNode: 'rth-attempt'
          },
          {
            id: 'do-nothing',
            text: 'Wait to see if GPS recovers',
            nextNode: 'drift-continues'
          },
          {
            id: 'full-panic',
            text: 'Cut throttle immediately to prevent fly-away',
            nextNode: 'controlled-crash'
          }
        ]
      },

      'attitude-mode': {
        id: 'attitude-mode',
        type: 'positive',
        content: `Good instinct. You switch to attitude (ATTI) mode, taking direct control of the aircraft.

In attitude mode:
- You control pitch, roll, and yaw directly
- The aircraft will drift with wind if you don't correct
- Altitude is still managed automatically
- GPS is not required for basic flight

The aircraft stabilizes under your manual control. You're now holding position manually.

Now proceed to step 2: Analyze the situation. What's causing the GPS issue?`,
        choices: [
          {
            id: 'check-environment',
            text: 'Look for potential interference sources nearby',
            nextNode: 'interference-analysis'
          },
          {
            id: 'check-aircraft',
            text: 'Check aircraft systems for other anomalies',
            nextNode: 'systems-check'
          },
          {
            id: 'just-land',
            text: 'Don\'t waste time analyzing - just land immediately',
            nextNode: 'rushed-landing'
          }
        ]
      },

      'interference-analysis': {
        id: 'interference-analysis',
        type: 'situation',
        content: `You scan the area and notice:

About 200 meters away, there's a communications tower you hadn't fully noted during planning. Your flight path brought you within range of potential interference.

This is likely the cause - electromagnetic interference affecting GPS reception.

Your current position:
- 300 feet AGL
- 400 meters from launch
- Drifting slowly if not actively controlled
- Clear area below (agricultural field)
- Residential area 300 meters to the east

What's your action plan?`,
        choices: [
          {
            id: 'retreat-manual',
            text: 'Manually fly away from the tower toward launch point',
            nextNode: 'manual-retreat'
          },
          {
            id: 'land-here',
            text: 'Land in the clear field below current position',
            nextNode: 'field-landing'
          },
          {
            id: 'climb-and-rth',
            text: 'Climb higher to get above interference, then RTH',
            nextNode: 'climb-attempt'
          }
        ]
      },

      'manual-retreat': {
        id: 'manual-retreat',
        type: 'positive',
        content: `You manually fly the aircraft away from the tower, toward your launch position.

You maintain:
- Manual control throughout
- Visual contact with the aircraft
- Awareness of the residential area to avoid

As you move away from the tower, you observe:
- GPS signal improving (fewer warnings)
- Position hold becoming more stable
- Compass reading normalizing

At about 250 meters from your launch point, GPS is fully restored.

What do you do now?`,
        choices: [
          {
            id: 'continue-manual',
            text: 'Continue manual flight to landing - don\'t trust the GPS yet',
            nextNode: 'safe-manual-landing'
          },
          {
            id: 'switch-gps',
            text: 'Switch back to GPS mode and fly normally to landing',
            nextNode: 'gps-return'
          }
        ]
      },

      'safe-manual-landing': {
        id: 'safe-manual-landing',
        type: 'positive',
        content: `You continue in attitude mode, manually flying back to your launch point.

Landing in attitude mode requires more skill, but you:
- Maintain steady descent rate
- Correct for any drift
- Use visual references for positioning
- Land smoothly at your original location

**Excellent decision:** You didn't trust a system that just failed, even after it appeared to recover.

The aircraft is safely on the ground. Now proceed to steps 5 and 6: Secure the scene and report.`,
        choices: [
          {
            id: 'secure-report',
            text: 'Secure aircraft and complete reporting',
            nextNode: 'post-incident'
          }
        ]
      },

      'gps-return': {
        id: 'gps-return',
        type: 'neutral',
        content: `You switch back to GPS mode. The aircraft responds normally, and you fly back to land at your launch point.

The landing is uneventful.

**Consideration:** While this worked out, switching back to a recently-failed system has risks. The failure could recur. A more conservative approach would be to continue with the reliable control method (attitude mode) until safely landed.

The aircraft is on the ground. Proceed to steps 5 and 6.`,
        choices: [
          {
            id: 'secure-report',
            text: 'Secure aircraft and complete reporting',
            nextNode: 'post-incident'
          }
        ]
      },

      'field-landing': {
        id: 'field-landing',
        type: 'positive',
        content: `You decide to land in the clear agricultural field directly below.

This decision is sound because:
- Area is clear of people and obstacles
- Eliminates risk of flying over residential area
- Gets aircraft on ground quickly
- You have good visual contact

You manually descend and land in the field. The landing is successful.

**Good decision:** "Land as soon as safely possible" sometimes means the nearest safe option, not necessarily the launch point.

Now you need to retrieve the aircraft and proceed with securing and reporting.`,
        choices: [
          {
            id: 'secure-report',
            text: 'Retrieve aircraft and complete procedures',
            nextNode: 'post-incident-field'
          }
        ]
      },

      'post-incident': {
        id: 'post-incident',
        type: 'positive',
        content: `With the aircraft safely down, you complete the emergency procedure:

**Step 5 - Secure the Scene:**
- Power down aircraft
- Document aircraft state
- Note any visible damage
- Preserve flight logs

**Step 6 - Report:**
- Document the incident details
- Note GPS anomalies and suspected cause
- Record weather conditions and location
- Update hazard database with EMI source
- File occurrence report per your procedures

**Key Findings:**
- EMI from communications tower caused GPS degradation
- Site survey should have identified this hazard
- No damage to aircraft or injury to persons
- Mission can be rescheduled with adjusted flight path`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Continue to debrief',
            nextNode: 'debrief'
          }
        ]
      },

      'post-incident-field': {
        id: 'post-incident-field',
        type: 'positive',
        content: `You walk to retrieve the aircraft from the field (coordinating with the landowner if needed).

**Step 5 - Secure:**
- Power down aircraft
- Inspect for any damage from field landing
- Preserve flight logs
- Document landing location

**Step 6 - Report:**
- Document full incident sequence
- Note the EMI source identified
- Record decision to land in field
- Update planning documents with EMI hazard
- File occurrence report

**Lessons Identified:**
- Site survey missed the EMI source
- Attitude mode proficiency was essential
- Decision to land immediately was appropriate`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Continue to debrief',
            nextNode: 'debrief'
          }
        ]
      },

      'systems-check': {
        id: 'systems-check',
        type: 'situation',
        content: `You check other aircraft systems while maintaining manual control:

- Battery: Normal
- Motors: Normal
- Video link: Normal
- Control link: Normal
- Compass: Fluctuating
- GPS: Degraded

The pattern suggests external interference rather than aircraft failure - both GPS and compass affected, but nothing else.

You're using up time in your analysis. The aircraft is stable but you're manually correcting for drift.

What's your next action?`,
        choices: [
          {
            id: 'scan-area',
            text: 'Quickly scan for interference sources',
            nextNode: 'interference-analysis'
          },
          {
            id: 'land-immediate',
            text: 'Land immediately in the clear area below',
            nextNode: 'field-landing'
          }
        ]
      },

      'rth-attempt': {
        id: 'rth-attempt',
        type: 'negative',
        content: `You activate Return to Home.

Problem: RTH relies on GPS for navigation. With degraded GPS, the aircraft:
- Accepts the command but can't navigate accurately
- Begins moving but in an erratic direction
- Position errors cause it to drift toward the residential area

You now have an aircraft moving toward populated area with unreliable navigation!

You must take immediate manual control to prevent this from getting worse.`,
        choices: [
          {
            id: 'take-over',
            text: 'Cancel RTH and take manual control immediately',
            nextNode: 'late-manual'
          }
        ]
      },

      'late-manual': {
        id: 'late-manual',
        type: 'situation',
        content: `You cancel RTH and take manual control. The aircraft responds.

Current situation:
- You're now closer to the residential area
- Still have GPS issues
- In attitude mode with manual control
- Need to navigate away from populated area

You manage to fly the aircraft back over clear ground and land safely.

**Lesson Learned:** RTH should not be the first response to GPS failure, since RTH depends on GPS to work correctly. Maintain manual control first, analyze second.`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Continue to debrief',
            nextNode: 'debrief'
          }
        ]
      },

      'drift-continues': {
        id: 'drift-continues',
        type: 'negative',
        content: `You wait to see if GPS recovers. It doesn't.

The aircraft continues to drift in GPS-assist mode, which is now providing incorrect position corrections. Within 30 seconds:
- The aircraft has moved 50 meters from your intended position
- It's now over a road with occasional traffic
- GPS shows no sign of recovery

You've lost valuable time and are now in a worse position.`,
        choices: [
          {
            id: 'finally-act',
            text: 'Switch to attitude mode and take control',
            nextNode: 'late-attitude'
          }
        ]
      },

      'late-attitude': {
        id: 'late-attitude',
        type: 'situation',
        content: `You switch to attitude mode and stabilize the aircraft.

From this degraded position, you need to carefully navigate back to safe ground. You manage to do so, but:
- You flew over a road with traffic
- The delay created unnecessary risk
- You're now further from your launch point

**Lesson Learned:** "Maintain aircraft control" means taking positive action when automated systems fail. Waiting rarely improves the situation.`,
        choices: [
          {
            id: 'continue-to-land',
            text: 'Continue to land safely',
            nextNode: 'delayed-safe-landing'
          }
        ]
      },

      'delayed-safe-landing': {
        id: 'delayed-safe-landing',
        type: 'neutral',
        content: `You fly manually back to your launch point and land. The aircraft is undamaged and no one was hurt.

However, this incident could have been managed better:
- Immediate manual control would have prevented drift
- You briefly flew over traffic unnecessarily
- The delay increased overall risk exposure

Emergency procedures exist because timely, correct action matters.`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Continue to debrief',
            nextNode: 'debrief'
          }
        ]
      },

      'controlled-crash': {
        id: 'controlled-crash',
        type: 'negative',
        content: `You cut the throttle. The aircraft immediately begins falling.

GPS failure does NOT mean loss of control - the aircraft was still flyable! Cutting power converts a manageable situation into an uncontrolled descent.

The aircraft falls and impacts the ground from 300 feet, causing significant damage:
- Airframe broken
- Camera destroyed
- Props shattered

**Critical Lesson:** GPS failure affects navigation, not flight control. NEVER cut power unless the aircraft is completely uncontrollable. Switch to manual/attitude mode instead.`,
        choices: [
          {
            id: 'retry',
            text: 'Retry scenario',
            nextNode: 'start'
          }
        ]
      },

      'rushed-landing': {
        id: 'rushed-landing',
        type: 'neutral',
        content: `You skip analysis and land immediately.

While getting the aircraft down quickly is prudent, understanding what went wrong matters:
- Is it safe to fly back past whatever caused the issue?
- Could you have completed the mission by avoiding the interference?
- Will you know what to document and report?

You land safely in a field, but without understanding the cause, you can't:
- Properly update your hazard database
- Advise other operators
- Plan to avoid the issue next time

Analysis doesn't have to be lengthy - a quick scan while maintaining control is usually sufficient.`,
        choices: [
          {
            id: 'to-debrief',
            text: 'Continue to debrief',
            nextNode: 'debrief'
          }
        ]
      },

      'climb-attempt': {
        id: 'climb-attempt',
        type: 'situation',
        content: `You begin climbing, hoping to get above the interference. At 400 feet:
- GPS is still degraded
- You're now higher and the drift effect is more pronounced
- You're approaching controlled airspace limits

The interference from ground-based towers doesn't necessarily decrease with altitude at these heights.

What now?`,
        choices: [
          {
            id: 'descend-retreat',
            text: 'Descend and fly away from the interference source manually',
            nextNode: 'manual-retreat'
          },
          {
            id: 'keep-climbing',
            text: 'Continue climbing - maybe it will clear',
            nextNode: 'airspace-issue'
          }
        ]
      },

      'airspace-issue': {
        id: 'airspace-issue',
        type: 'negative',
        content: `You continue climbing and reach 500 feet. GPS is still problematic, and now you have another issue:

You're now in controlled airspace without authorization. Your emergency doesn't automatically grant airspace access, and you've made the situation worse by:
- Exceeding altitude limits
- Still having GPS issues
- Being further from a safe landing

You descend and retreat, eventually landing safely, but you'll need to report the airspace incursion along with the GPS emergency.

**Lesson Learned:** Don't compound one problem with another. Solve the immediate issue (GPS) with the most direct action (manual retreat) rather than adding variables.`,
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
        content: `## Scenario Debrief: System Failure

### The 6-Step Emergency Procedure

1. **Maintain Aircraft Control** - Switch to manual/attitude mode when automated systems fail
2. **Analyze the Situation** - Quick assessment of what's wrong and why
3. **Take Appropriate Action** - Based on analysis, take measured action
4. **Land As Soon As Safely Possible** - Not "crash immediately," but don't continue unnecessarily
5. **Secure the Scene** - Power down, preserve evidence, document
6. **Report** - File appropriate reports, update hazard databases

### Key Learning Points

1. **GPS failure ≠ Loss of control:** Aircraft remain flyable in attitude mode
2. **RTH needs GPS:** Don't use GPS-dependent features during GPS failure
3. **Quick analysis matters:** Understanding the cause enables better decisions
4. **Don't panic:** Cutting power or other extreme actions usually make things worse
5. **Site survey importance:** EMI sources should be identified during planning

### EMI Awareness
- Communications towers
- Power substations
- Industrial equipment
- Other sources can cause GPS/compass interference`,
        isTerminal: true
      }
    }
  }
}

export default rpasScenarios
