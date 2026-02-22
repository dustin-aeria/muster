/**
 * Specialized Operations Scenarios
 *
 * Interactive decision-tree scenarios for specialized RPAS operations
 * including infrastructure inspection and marine operations.
 *
 * @version 1.0.0
 */

const specializedScenarios = {
  // ========================================
  // SCENARIO: Infrastructure Mission
  // ========================================
  'infrastructure-mission': {
    id: 'infrastructure-mission',
    questId: 'infrastructure-inspection',
    trackId: 'specialized-ops',
    title: 'Infrastructure Mission',
    description: 'Plan and execute a transmission tower inspection while managing EMI hazards and maintaining safe separation from high-voltage lines.',
    difficulty: 'advanced',
    estimatedTime: 18,
    xpReward: 90,
    tags: ['infrastructure', 'EMI', 'transmission', 'planning'],

    context: {
      mission: 'Inspect a 138kV transmission tower for structural damage after storm',
      aircraft: 'DJI Matrice 300 RTK with H20T payload',
      location: 'Rural transmission corridor, rolling terrain',
      time: 'Mid-morning, post-storm inspection',
      pilot: 'You are the lead pilot conducting the inspection',
      conditions: 'Winds 15 km/h, clearing skies after storm'
    },

    startNodeId: 'start',

    nodes: {
      start: {
        id: 'start',
        type: 'narrative',
        content: 'You\'ve been called out for a post-storm inspection of transmission tower #47 on a 138kV line. The utility reports the tower may have sustained damage from fallen tree limbs. You\'ve arrived at the site and are conducting your initial assessment.',
        nextNodeId: 'site-assessment'
      },

      'site-assessment': {
        id: 'site-assessment',
        type: 'narrative',
        content: 'The tower is a lattice structure approximately 40m tall. Three conductor bundles are suspended on each side, sagging between this tower and the adjacent structures about 300m away. You can see some debris caught in the tower structure.',
        nextNodeId: 'first-priority'
      },

      'first-priority': {
        id: 'first-priority',
        type: 'decision',
        content: 'Before flying, what is your FIRST priority?',
        choices: [
          {
            id: 'check-energized',
            text: 'Confirm with utility whether lines are energized',
            consequence: 'verify-status',
            feedback: 'Critical first step. Never assume lines are de-energized based on visual inspection. Confirmation from the utility is essential.'
          },
          {
            id: 'launch-immediately',
            text: 'Launch immediately - time is critical for utility',
            consequence: 'dangerous-assumption',
            feedback: 'Never rush into high-voltage environment operations. Confirmation of line status is a safety-critical requirement.'
          },
          {
            id: 'calibrate-compass',
            text: 'Calibrate compass near the tower',
            consequence: 'calibration-error',
            feedback: 'Calibrating near the tower will cause deviation errors. But more critically, line status should be confirmed before any preparation.'
          }
        ]
      },

      'verify-status': {
        id: 'verify-status',
        type: 'narrative',
        content: 'You contact the utility control center. They confirm: "Tower 47 section is HOT - we cannot de-energize for this inspection. 138kV on all three phases." This changes your planning.',
        nextNodeId: 'energized-planning'
      },

      'dangerous-assumption': {
        id: 'dangerous-assumption',
        type: 'narrative',
        content: 'You launch and begin approaching the tower. As you near the structure, you notice your compass heading becoming erratic. Your VO calls out: "Did you confirm line status? Those lines look energized to me!"',
        nextNodeId: 'emergency-realize'
      },

      'emergency-realize': {
        id: 'emergency-realize',
        type: 'decision',
        content: 'You realize you didn\'t confirm line status. What do you do immediately?',
        choices: [
          {
            id: 'back-off-contact',
            text: 'Back off to safe distance and contact utility',
            consequence: 'recover-from-error',
            feedback: 'Correct recovery action. Increase distance immediately and get confirmation before proceeding.'
          },
          {
            id: 'continue-careful',
            text: 'Continue carefully - you\'re already here',
            consequence: 'continued-danger',
            feedback: 'Continuing without confirmation compounds the original error. Line status must be confirmed.'
          }
        ]
      },

      'recover-from-error': {
        id: 'recover-from-error',
        type: 'narrative',
        content: 'You back off to 200m and contact the utility. They confirm the lines are energized at 138kV. You\'ve dodged a potentially serious situation, but the lesson is clear.',
        nextNodeId: 'energized-planning-late'
      },

      'continued-danger': {
        id: 'continued-danger',
        type: 'outcome',
        outcomeType: 'failure',
        content: 'You continue approaching. At 30m from the conductors, your GPS shows position jumps and the compass is unreliable. The aircraft enters an uncommanded yaw. You fight for control and manage to RTH, but this was extremely dangerous. The lines were energized at 138kV.',
        xpModifier: 0.2,
        keyLessons: [
          'ALWAYS confirm line status before operations',
          'Energized lines create EMI that affects aircraft systems',
          'Never assume de-energized status',
          'GPS and compass degradation indicate EMI exposure',
          'Recovery requires immediate distance increase'
        ]
      },

      'calibration-error': {
        id: 'calibration-error',
        type: 'narrative',
        content: 'Your VO stops you: "Wait - if you calibrate here near the tower, you\'ll get deviation from the metal structure. Plus, shouldn\'t we confirm if those lines are hot first?"',
        nextNodeId: 'vo-saves'
      },

      'vo-saves': {
        id: 'vo-saves',
        type: 'decision',
        content: 'Your VO has raised important points. How do you respond?',
        choices: [
          {
            id: 'thank-vo',
            text: 'Good catch - let\'s confirm line status and calibrate away from tower',
            consequence: 'verify-status',
            feedback: 'Excellent response. Accepting crew input prevents errors. Calibration should occur at least 50m from metal structures.'
          },
          {
            id: 'dismiss-vo',
            text: 'I know what I\'m doing - I\'ve done this before',
            consequence: 'overconfidence-error',
            feedback: 'Dismissing valid safety input from crew members increases risk. Your VO raised legitimate concerns.'
          }
        ]
      },

      'overconfidence-error': {
        id: 'overconfidence-error',
        type: 'outcome',
        outcomeType: 'failure',
        content: 'You calibrate near the tower, causing 15° compass deviation. On approach, the aircraft tracks off-course toward the conductors. Combined with EMI from the energized lines, you nearly lose the aircraft. Poor CRM and inadequate preparation created a dangerous situation.',
        xpModifier: 0.2,
        keyLessons: [
          'Crew input should be welcomed, not dismissed',
          'Calibration near metal structures causes deviation',
          'Line status must be confirmed before operations',
          'Multiple errors compound risk exponentially'
        ]
      },

      'energized-planning': {
        id: 'energized-planning',
        type: 'narrative',
        content: 'With the lines confirmed hot at 138kV, you need to plan your approach carefully. The 138kV classification requires minimum 10m separation from conductors, but EMI effects can occur at greater distances.',
        nextNodeId: 'standoff-decision'
      },

      'energized-planning-late': {
        id: 'energized-planning-late',
        type: 'narrative',
        content: 'Now properly informed, you need to plan your approach for energized line inspection. You\'ve learned the importance of the pre-operation confirmation.',
        nextNodeId: 'standoff-decision'
      },

      'standoff-decision': {
        id: 'standoff-decision',
        type: 'decision',
        content: 'What minimum standoff distance will you maintain from the conductors?',
        choices: [
          {
            id: 'standoff-10m',
            text: '10 meters - the regulatory minimum for 138kV',
            consequence: 'minimum-standoff',
            feedback: 'While technically meeting minimum requirements, operating at minimums provides no safety margin for navigation errors or EMI effects.'
          },
          {
            id: 'standoff-15m',
            text: '15 meters - regulatory minimum plus safety buffer',
            consequence: 'good-standoff',
            feedback: 'Good choice. A 50% buffer beyond minimum provides margin for GPS drift and allows orbit paths with safety margin.'
          },
          {
            id: 'standoff-30m',
            text: '30 meters - conservative for all EMI effects',
            consequence: 'conservative-standoff',
            feedback: 'Very conservative. This will reduce EMI effects significantly, though it may limit inspection detail. Not wrong, just cautious.'
          }
        ]
      },

      'minimum-standoff': {
        id: 'minimum-standoff',
        type: 'narrative',
        content: 'You plan for 10m separation. During the inspection, GPS drift of 3m occurs due to EMI. Your actual separation becomes 7m - below the safety minimum. You notice increased interference on telemetry.',
        nextNodeId: 'recover-standoff'
      },

      'recover-standoff': {
        id: 'recover-standoff',
        type: 'decision',
        content: 'You\'re experiencing tighter separation than planned. What action do you take?',
        choices: [
          {
            id: 'increase-distance',
            text: 'Immediately increase distance to 20m',
            consequence: 'good-recovery',
            feedback: 'Correct response. When separation is compromised, immediately increase distance.'
          },
          {
            id: 'hold-position',
            text: 'Hold position - you\'re still in a safe range',
            consequence: 'poor-recovery',
            feedback: 'Below-minimum separation is not "safe range." EMI-induced drift can continue, potentially causing contact.'
          }
        ]
      },

      'good-recovery': {
        id: 'good-recovery',
        type: 'narrative',
        content: 'You increase to 20m and recalibrate your approach. The telemetry stabilizes. Lesson learned about planning buffers in EMI environments.',
        nextNodeId: 'inspection-approach'
      },

      'poor-recovery': {
        id: 'poor-recovery',
        type: 'outcome',
        outcomeType: 'failure',
        content: 'The drift continues and your aircraft passes within 5m of an energized conductor. You hear electrical arcing and your video feed freezes momentarily. The aircraft survives, but you\'ve come dangerously close to a fatal incident.',
        xpModifier: 0.3,
        keyLessons: [
          'Buffer distances exist because conditions change',
          'EMI-induced drift must be anticipated and managed',
          'When separation decreases unexpectedly, increase immediately',
          'Minimum distances are minimums, not targets'
        ]
      },

      'good-standoff': {
        id: 'good-standoff',
        type: 'narrative',
        content: 'With a 15m standoff planned, you have margin for GPS drift and navigation adjustments. Your VO notes occasional compass deviation but GPS positioning remains stable.',
        nextNodeId: 'inspection-approach'
      },

      'conservative-standoff': {
        id: 'conservative-standoff',
        type: 'narrative',
        content: 'At 30m standoff, you experience minimal EMI effects. The trade-off is that some fine detail may be harder to capture, but your optical zoom compensates effectively.',
        nextNodeId: 'inspection-approach'
      },

      'inspection-approach': {
        id: 'inspection-approach',
        type: 'decision',
        content: 'You\'re ready to begin the tower inspection. What flight pattern will you use?',
        choices: [
          {
            id: 'orbital-pattern',
            text: 'Ascending orbital pattern around the tower',
            consequence: 'orbital-inspection',
            feedback: 'Good choice. Orbital patterns provide systematic coverage of all tower faces while maintaining safe conductor distances.'
          },
          {
            id: 'direct-approach',
            text: 'Direct approach to areas of interest',
            consequence: 'direct-inspection',
            feedback: 'Direct approaches may miss damage not visible from limited angles. Systematic coverage is more thorough.'
          },
          {
            id: 'top-down',
            text: 'Top-down spiral descent',
            consequence: 'risky-topdown',
            feedback: 'Top-down approaches are challenging near conductors - you must track the conductor positions which are harder to see from above.'
          }
        ]
      },

      'orbital-inspection': {
        id: 'orbital-inspection',
        type: 'narrative',
        content: 'You establish an orbital pattern at the tower base, ascending in 5m increments. The thermal camera shows the storm damage clearly - several bolts appear to have heat signatures indicating possible loose connections.',
        nextNodeId: 'damage-found'
      },

      'direct-inspection': {
        id: 'direct-inspection',
        type: 'narrative',
        content: 'You approach the visible debris directly. While you capture good detail of that area, you realize you\'ve only documented one face of the tower. You\'ll need to reposition multiple times.',
        nextNodeId: 'reposition-needed'
      },

      'reposition-needed': {
        id: 'reposition-needed',
        type: 'narrative',
        content: 'After multiple repositioning maneuvers, you achieve reasonable coverage. The thermal camera reveals hot spots at several bolt connections. However, the non-systematic approach has cost time and battery.',
        nextNodeId: 'damage-found'
      },

      'risky-topdown': {
        id: 'risky-topdown',
        type: 'narrative',
        content: 'From above, the conductor sag makes distance management challenging. Your VO calls out: "Watch the middle phase - it\'s closer than it looks from up there." You adjust quickly, narrowly maintaining safe separation.',
        nextNodeId: 'adjust-pattern'
      },

      'adjust-pattern': {
        id: 'adjust-pattern',
        type: 'decision',
        content: 'The top-down approach is proving difficult. What adjustment do you make?',
        choices: [
          {
            id: 'switch-orbital',
            text: 'Switch to orbital pattern from the side',
            consequence: 'orbital-inspection',
            feedback: 'Good adaptation. Recognizing when an approach isn\'t working and switching to a better method shows good judgment.'
          },
          {
            id: 'persist-topdown',
            text: 'Continue with extra caution',
            consequence: 'persistent-risk',
            feedback: 'Persisting with a problematic approach when alternatives exist increases risk unnecessarily.'
          }
        ]
      },

      'persistent-risk': {
        id: 'persistent-risk',
        type: 'narrative',
        content: 'You continue the top-down approach. It takes significantly longer and requires constant conductor awareness. Eventually you complete the inspection, but battery reserves are low and stress was elevated throughout.',
        nextNodeId: 'damage-found'
      },

      'damage-found': {
        id: 'damage-found',
        type: 'narrative',
        content: 'Your inspection reveals: debris lodged in the tower structure, thermal hotspots at two bolt connections suggesting loosening, and visible deformation of one horizontal brace. The utility needs this information.',
        nextNodeId: 'reporting-decision'
      },

      'reporting-decision': {
        id: 'reporting-decision',
        type: 'decision',
        content: 'How do you communicate findings to the utility?',
        choices: [
          {
            id: 'immediate-critical',
            text: 'Call control center immediately with critical findings',
            consequence: 'proper-reporting',
            feedback: 'Correct approach. Potential structural damage and loose connections are safety-critical findings requiring immediate notification.'
          },
          {
            id: 'document-report',
            text: 'Complete documentation first, then send formal report',
            consequence: 'delayed-reporting',
            feedback: 'While thorough documentation is important, safety-critical findings should be communicated immediately, with formal report to follow.'
          }
        ]
      },

      'proper-reporting': {
        id: 'proper-reporting',
        type: 'narrative',
        content: 'You call the utility control center immediately: "Control, this is RPAS inspector at Tower 47. We have structural deformation on horizontal brace, thermal anomalies at two bolt connections, and debris lodged in structure. Recommend engineering assessment."',
        nextNodeId: 'utility-response'
      },

      'delayed-reporting': {
        id: 'delayed-reporting',
        type: 'narrative',
        content: 'You spend 20 minutes preparing detailed documentation before contacting the utility. While they appreciate the thoroughness, they note: "For structural findings like this, we need immediate notification - we may need to reduce load or take other protective action."',
        nextNodeId: 'reporting-lesson'
      },

      'reporting-lesson': {
        id: 'reporting-lesson',
        type: 'narrative',
        content: 'You learn that utilities have protocols for critical findings that require immediate response. Your delay, while well-intentioned, could have had safety implications.',
        nextNodeId: 'utility-response'
      },

      'utility-response': {
        id: 'utility-response',
        type: 'narrative',
        content: 'The utility dispatcher thanks you and confirms they\'re alerting the line crew for emergency assessment. "Good work getting us this information. The thermal findings on those bolts could prevent a failure."',
        nextNodeId: 'final-summary'
      },

      'final-summary': {
        id: 'final-summary',
        type: 'outcome',
        outcomeType: 'success',
        content: 'You complete the inspection safely and provide critical information to the utility. Your systematic approach, appropriate standoff distances, and proper reporting protocol exemplify professional infrastructure inspection.',
        xpModifier: 1.0,
        keyLessons: [
          'Always confirm line energization status before operations',
          'Build safety buffers into standoff distances',
          'Orbital patterns provide systematic coverage',
          'Thermal imaging reveals problems invisible to RGB',
          'Safety-critical findings require immediate notification',
          'Calibrate compass away from metal structures'
        ]
      }
    }
  },

  // ========================================
  // SCENARIO: Marine Survey
  // ========================================
  'marine-survey': {
    id: 'marine-survey',
    questId: 'marine-coastal-operations',
    trackId: 'specialized-ops',
    title: 'Marine Survey',
    description: 'Conduct an offshore survey operation from a vessel while managing sea conditions, wildlife encounters, and marine-specific challenges.',
    difficulty: 'advanced',
    estimatedTime: 20,
    xpReward: 95,
    tags: ['marine', 'vessel', 'offshore', 'wildlife'],

    context: {
      mission: 'Kelp bed mapping survey from research vessel',
      aircraft: 'DJI Matrice 30T',
      location: '3 nm offshore, BC coast',
      time: 'Mid-morning, building sea breeze',
      pilot: 'You are the RPAS pilot operating from the vessel deck',
      conditions: 'Sea State 2, winds building, clear skies'
    },

    startNodeId: 'start',

    nodes: {
      start: {
        id: 'start',
        type: 'narrative',
        content: 'You\'re aboard the research vessel M/V Pacific Survey conducting a kelp bed mapping survey. The vessel is holding position about 3 nautical miles offshore. Current conditions are Sea State 2 with light morning winds, but the forecast calls for building sea breeze through the afternoon.',
        nextNodeId: 'captain-brief'
      },

      'captain-brief': {
        id: 'captain-brief',
        type: 'narrative',
        content: 'The vessel captain approaches: "We\'ve got about a 3-hour weather window before the sea breeze kicks up. After that, we\'ll be in Sea State 3-4. What\'s your plan for launch and recovery?"',
        nextNodeId: 'weather-planning'
      },

      'weather-planning': {
        id: 'weather-planning',
        type: 'decision',
        content: 'How do you plan your operations given the weather window?',
        choices: [
          {
            id: 'conservative-plan',
            text: 'Plan to complete all flights within 2.5 hours, keeping 30-min buffer',
            consequence: 'smart-planning',
            feedback: 'Excellent planning. Buffers account for unexpected delays and ensure recovery before conditions deteriorate.'
          },
          {
            id: 'max-window',
            text: 'Use the full 3 hours to maximize coverage',
            consequence: 'tight-planning',
            feedback: 'Using the entire window leaves no margin for delays. Sea conditions can change faster than forecast.'
          },
          {
            id: 'extend-hope',
            text: 'The forecast might be conservative - plan for 4 hours',
            consequence: 'risky-planning',
            feedback: 'Planning beyond forecast windows is unwise. Marine weather can deteriorate rapidly with little warning.'
          }
        ]
      },

      'smart-planning': {
        id: 'smart-planning',
        type: 'narrative',
        content: '"Good thinking on the buffer," the captain notes. "I\'ve seen conditions turn faster than forecast out here. We\'ll keep a close eye on the wind build." You set up your equipment on the aft deck.',
        nextNodeId: 'launch-prep'
      },

      'tight-planning': {
        id: 'tight-planning',
        type: 'narrative',
        content: 'The captain looks skeptical. "I\'d recommend some buffer time, but it\'s your call. Just know that recovery in Sea State 3+ is going to be challenging." You set up on the aft deck.',
        nextNodeId: 'launch-prep'
      },

      'risky-planning': {
        id: 'risky-planning',
        type: 'narrative',
        content: 'The captain shakes his head. "I strongly advise against extending beyond the forecast window. Conditions out here can turn quickly." You reluctantly agree to stay within 3 hours but push the boundary.',
        nextNodeId: 'launch-prep'
      },

      'launch-prep': {
        id: 'launch-prep',
        type: 'decision',
        content: 'Where do you set up your launch area on the vessel?',
        choices: [
          {
            id: 'aft-deck',
            text: 'Aft deck, clear of superstructure and rigging',
            consequence: 'good-location',
            feedback: 'Good choice. The aft deck typically offers the best launch area with clear sky overhead and minimal interference from vessel structure.'
          },
          {
            id: 'bow',
            text: 'Bow for clear forward view',
            consequence: 'bow-issues',
            feedback: 'The bow experiences more motion and spray. Additionally, recovering to the bow can be challenging with vessel motion.'
          },
          {
            id: 'cabin-top',
            text: 'Cabin top for elevation',
            consequence: 'cabin-issues',
            feedback: 'While elevated, the cabin top creates compass interference from the superstructure and antennas. Limited space for landing is also a concern.'
          }
        ]
      },

      'good-location': {
        id: 'good-location',
        type: 'narrative',
        content: 'You set up on the aft deck with non-skid pads deployed. The area is clear of rigging and provides good GPS reception. The vessel\'s crew clears the area for your operation.',
        nextNodeId: 'calibration-decision'
      },

      'bow-issues': {
        id: 'bow-issues',
        type: 'narrative',
        content: 'As you set up on the bow, you notice more spray and motion. A crew member suggests the aft deck might be more stable. Do you relocate?',
        nextNodeId: 'relocate-choice'
      },

      'relocate-choice': {
        id: 'relocate-choice',
        type: 'decision',
        content: 'The crew suggests relocating to the aft deck. What do you do?',
        choices: [
          {
            id: 'relocate-yes',
            text: 'Take their advice and relocate aft',
            consequence: 'good-location',
            feedback: 'Good decision. Local crew knowledge about vessel dynamics is valuable.'
          },
          {
            id: 'relocate-no',
            text: 'Stay on the bow - you\'re already set up',
            consequence: 'bow-complications',
            feedback: 'Ignoring local expertise creates complications. The bow motion will make operations more difficult.'
          }
        ]
      },

      'bow-complications': {
        id: 'bow-complications',
        type: 'narrative',
        content: 'Operating from the bow proves challenging. Increased motion makes hand launches difficult, and you need to wait for calm periods between waves. Operations are slower than planned.',
        nextNodeId: 'calibration-decision'
      },

      'cabin-issues': {
        id: 'cabin-issues',
        type: 'narrative',
        content: 'On the cabin top, you find compass calibration is unreliable due to interference from radar and communication antennas. The captain recommends relocating to the aft deck.',
        nextNodeId: 'relocate-forced'
      },

      'relocate-forced': {
        id: 'relocate-forced',
        type: 'narrative',
        content: 'You relocate to the aft deck, having lost 15 minutes. The captain notes: "The deck structure is what I\'d recommend - better all around."',
        nextNodeId: 'calibration-decision'
      },

      'calibration-decision': {
        id: 'calibration-decision',
        type: 'decision',
        content: 'You\'re ready to calibrate the aircraft. What\'s your approach to compass calibration?',
        choices: [
          {
            id: 'skip-calibrate',
            text: 'Use existing calibration from pre-departure',
            consequence: 'calibration-ok',
            feedback: 'Correct approach. Calibration on a vessel deck causes errors due to the large metal hull. Pre-departure land calibration is recommended.'
          },
          {
            id: 'deck-calibrate',
            text: 'Perform calibration on the vessel deck',
            consequence: 'calibration-error',
            feedback: 'Vessel deck calibration causes magnetic deviation from the metal hull. Pre-departure land calibration is recommended.'
          }
        ]
      },

      'calibration-ok': {
        id: 'calibration-ok',
        type: 'narrative',
        content: 'Good thinking. Your pre-departure calibration will work fine. You verify GPS signal is stable and prepare for launch. The captain brings the vessel into the wind for your launch.',
        nextNodeId: 'first-flight'
      },

      'calibration-error': {
        id: 'calibration-error',
        type: 'narrative',
        content: 'The calibration completes but seems suspect - the heading reads 12 degrees different from the vessel\'s bridge compass. The captain notices: "That calibration won\'t be accurate on deck - too much metal."',
        nextNodeId: 'calibration-recovery'
      },

      'calibration-recovery': {
        id: 'calibration-recovery',
        type: 'decision',
        content: 'The captain has flagged that your calibration is suspect. How do you proceed?',
        choices: [
          {
            id: 'use-gps-heading',
            text: 'Use GPS-derived heading instead of compass',
            consequence: 'gps-solution',
            feedback: 'Good workaround. GPS-derived heading is unaffected by magnetic interference and reliable for flight direction.'
          },
          {
            id: 'trust-calibration',
            text: 'The calibration completed successfully - proceed',
            consequence: 'heading-issues',
            feedback: 'A calibration completed in a magnetic interference environment is unreliable regardless of completion status.'
          }
        ]
      },

      'gps-solution': {
        id: 'gps-solution',
        type: 'narrative',
        content: 'You configure the aircraft to use GPS-derived heading. This works well since you\'ll be flying moving patterns, not hovering. The captain brings the vessel into the wind for launch.',
        nextNodeId: 'first-flight'
      },

      'heading-issues': {
        id: 'heading-issues',
        type: 'narrative',
        content: 'On launch, you notice the aircraft drifts 15 degrees off intended heading. The compass deviation from deck calibration is causing navigation errors. You switch to GPS heading mode to compensate.',
        nextNodeId: 'first-flight'
      },

      'first-flight': {
        id: 'first-flight',
        type: 'narrative',
        content: 'The first survey flight proceeds well. You\'re capturing excellent imagery of the kelp beds. Halfway through the second flight, your VO calls out: "Possible marine mammal activity at your 2 o\'clock, about 150 meters."',
        nextNodeId: 'wildlife-response'
      },

      'wildlife-response': {
        id: 'wildlife-response',
        type: 'decision',
        content: 'Your VO has spotted marine mammals near your survey area. What is your immediate response?',
        choices: [
          {
            id: 'pause-assess',
            text: 'Pause survey and assess the situation',
            consequence: 'proper-wildlife-response',
            feedback: 'Correct response. Pausing allows you to identify the species and determine appropriate action.'
          },
          {
            id: 'continue-survey',
            text: 'Continue survey - they\'re 150m away',
            consequence: 'wildlife-risk',
            feedback: 'While 150m exceeds minimum distance for most species, wildlife can move unpredictably. Assessment before continuing is prudent.'
          },
          {
            id: 'avoid-area',
            text: 'Immediately route away from the animals',
            consequence: 'cautious-avoid',
            feedback: 'While cautious, sudden routing away may not be necessary if the animals are at safe distance. Assessment first is better.'
          }
        ]
      },

      'proper-wildlife-response': {
        id: 'proper-wildlife-response',
        type: 'narrative',
        content: 'You pause the survey and your VO observes through binoculars. "Looks like a small group of sea otters - about 4 individuals, floating in a kelp patch." Sea otters require 100m minimum approach distance.',
        nextNodeId: 'otter-decision'
      },

      'wildlife-risk': {
        id: 'wildlife-risk',
        type: 'narrative',
        content: 'As you continue, the marine mammals surface more frequently - they appear to be moving toward your survey area. Your VO now identifies them as sea otters. You\'ll need to adjust.',
        nextNodeId: 'otter-decision'
      },

      'cautious-avoid': {
        id: 'cautious-avoid',
        type: 'narrative',
        content: 'You route away, adding distance. Your VO identifies the animals as sea otters at 150m - you actually had adequate separation. However, caution with wildlife is never wrong.',
        nextNodeId: 'resume-planning'
      },

      'otter-decision': {
        id: 'otter-decision',
        type: 'decision',
        content: 'Sea otters require 100m minimum distance. How do you adjust your survey?',
        choices: [
          {
            id: 'modify-pattern',
            text: 'Modify survey pattern to maintain 150m from otters',
            consequence: 'good-modification',
            feedback: 'Good approach. A 150m buffer exceeds requirements and allows for animal movement.'
          },
          {
            id: 'minimum-distance',
            text: 'Work around them at exactly 100m',
            consequence: 'tight-buffer',
            feedback: 'Operating at exact minimums leaves no margin. If the otters move, you may need to abort portion of survey anyway.'
          }
        ]
      },

      'good-modification': {
        id: 'good-modification',
        type: 'narrative',
        content: 'You adjust your survey lines to maintain 150m from the otter group. The otters remain undisturbed, and you capture 90% of your planned coverage. Professional wildlife management.',
        nextNodeId: 'weather-check'
      },

      'tight-buffer': {
        id: 'tight-buffer',
        type: 'narrative',
        content: 'Working at 100m, you manage to maintain distance, but when two otters swim toward your survey area, you need to pause repeatedly. The stop-start pattern adds time to your operations.',
        nextNodeId: 'weather-check'
      },

      'resume-planning': {
        id: 'resume-planning',
        type: 'narrative',
        content: 'You reassess your survey plan accounting for the wildlife location. The remaining coverage will route you away from the otters.',
        nextNodeId: 'weather-check'
      },

      'weather-check': {
        id: 'weather-check',
        type: 'narrative',
        content: 'You\'re into your third survey flight when you notice the wind building. The captain radios: "I\'m seeing 18 knots now, forecast was for 15. We might hit Sea State 3 sooner than expected. How much longer do you need?"',
        nextNodeId: 'time-pressure'
      },

      'time-pressure': {
        id: 'time-pressure',
        type: 'decision',
        content: 'Weather is building faster than forecast. You have about 30% of survey area remaining. What do you do?',
        choices: [
          {
            id: 'wrap-now',
            text: 'Complete current flight and recover while conditions allow',
            consequence: 'smart-termination',
            feedback: 'Wise decision. Completing recovery in manageable conditions is more important than marginal additional coverage.'
          },
          {
            id: 'one-more',
            text: 'One more quick flight to maximize coverage',
            consequence: 'push-weather',
            feedback: 'Pushing into deteriorating conditions increases recovery risk. The marginal coverage isn\'t worth the risk.'
          },
          {
            id: 'full-complete',
            text: 'Need to complete 100% - push through',
            consequence: 'dangerous-push',
            feedback: 'Attempting to complete 100% in deteriorating conditions is unsafe. Data value doesn\'t justify recovery risk.'
          }
        ]
      },

      'smart-termination': {
        id: 'smart-termination',
        type: 'narrative',
        content: 'You complete the current line and bring the aircraft back. Recovery is smooth in Sea State 2 conditions. Twenty minutes later, the sea breeze kicks up to 22 knots and conditions deteriorate to Sea State 3.',
        nextNodeId: 'good-outcome'
      },

      'push-weather': {
        id: 'push-weather',
        type: 'narrative',
        content: 'You launch one more flight. The wind continues building. On return, recovery is challenging - the deck is moving more significantly and you need to time your landing carefully. You succeed, but it was riskier than necessary.',
        nextNodeId: 'marginal-outcome'
      },

      'dangerous-push': {
        id: 'dangerous-push',
        type: 'narrative',
        content: 'You attempt to complete all remaining coverage. By the time you finish, conditions have reached Sea State 3. On recovery approach, a wave rolls the vessel as you attempt to land. The aircraft touches down hard, damaging landing gear.',
        nextNodeId: 'damaged-outcome'
      },

      'good-outcome': {
        id: 'good-outcome',
        type: 'outcome',
        outcomeType: 'success',
        content: 'You achieved 70% survey coverage with excellent data quality. The principal investigator is satisfied: "Good data is better than damaged equipment. We can return for the remaining section." Your conservative decisions protected assets and personnel.',
        xpModifier: 1.0,
        keyLessons: [
          'Build weather buffers into marine operation plans',
          'Recovery before conditions deteriorate is critical',
          'Partial data with equipment intact is better than 100% with damage',
          'Listen to vessel crew about local conditions',
          'Wildlife encounters require immediate assessment',
          'Don\'t calibrate compass on vessel deck'
        ]
      },

      'marginal-outcome': {
        id: 'marginal-outcome',
        type: 'outcome',
        outcomeType: 'partial',
        content: 'You achieved 80% coverage but the final recovery was stressful and risky. The additional 10% wasn\'t worth the elevated risk. The captain debriefs: "We got lucky on that last recovery. Next time, build more margin."',
        xpModifier: 0.7,
        keyLessons: [
          'Marginal coverage gains aren\'t worth elevated risk',
          'Marine conditions can deteriorate rapidly',
          'Vessel recovery becomes difficult in Sea State 3+',
          'Weather buffers should be respected, not consumed',
          'Time pressure shouldn\'t override safety judgment'
        ]
      },

      'damaged-outcome': {
        id: 'damaged-outcome',
        type: 'outcome',
        outcomeType: 'failure',
        content: 'The hard landing damaged the aircraft\'s landing gear and gimbal. While you completed coverage, the equipment needs repair before the next operation. The cost of pushing weather exceeded any value from the additional data.',
        xpModifier: 0.3,
        keyLessons: [
          'Weather limits exist because conditions affect operations',
          'Damaged equipment delays future operations',
          'Sea State 3 is maximum for most vessel RPAS operations',
          '100% coverage isn\'t possible if equipment is damaged',
          'Conservative decisions protect long-term capability'
        ]
      }
    }
  }
}

export default specializedScenarios
