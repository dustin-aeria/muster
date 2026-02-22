/**
 * Wildlife & Environmental Safety Scenarios
 *
 * Interactive decision-tree scenarios for wildlife and environmental
 * protection training.
 *
 * @version 1.0.0
 */

const wildlifeScenarios = {
  // ========================================
  // SCENARIO: Wildlife Encounter
  // ========================================
  'wildlife-encounter': {
    id: 'wildlife-encounter',
    questId: 'wildlife-disturbance',
    trackId: 'wildlife-environmental',
    title: 'Wildlife Encounter',
    description: 'You encounter protected wildlife during a survey mission. Navigate the situation to minimize disturbance while completing your objectives.',
    difficulty: 'intermediate',
    estimatedTime: 15,
    xpReward: 75,
    tags: ['wildlife', 'disturbance', 'decision-making', 'regulations'],

    context: {
      mission: 'Coastal erosion survey along a remote beach section',
      aircraft: 'DJI Matrice 300 RTK with P1 camera',
      location: 'Isolated beach, BC north coast',
      time: 'Late morning, clear skies',
      pilot: 'You are the pilot conducting the survey',
      conditions: 'Light winds, good visibility'
    },

    startNodeId: 'start',

    nodes: {
      start: {
        id: 'start',
        type: 'narrative',
        content: 'You\'re conducting a coastal erosion survey along a remote beach section. The mission has been proceeding well with half the survey area completed. As you transition to the next flight line, your Visual Observer radios in with an urgent message.',
        nextNodeId: 'vo-report'
      },

      'vo-report': {
        id: 'vo-report',
        type: 'narrative',
        content: '"Pilot, I\'ve spotted what looks like a group of sea lions on the beach about 300 meters ahead of your current flight path. Looks like a haul-out site. Also seeing some seabirds nesting on the cliff face above them."',
        nextNodeId: 'initial-decision'
      },

      'initial-decision': {
        id: 'initial-decision',
        type: 'decision',
        content: 'You\'re currently at 80m AGL on an automated grid pattern that will take you within 50 meters of the haul-out site. What is your immediate action?',
        choices: [
          {
            id: 'continue-mission',
            text: 'Continue the automated flight - the mission is approved',
            consequence: 'regulatory-violation',
            feedback: 'Mission approval does not override wildlife protection regulations. Continuing without adjustment risks disturbing protected species and violating the Marine Mammal Regulations.'
          },
          {
            id: 'pause-assess',
            text: 'Pause the mission and assess the situation',
            consequence: 'good-assessment',
            feedback: 'Good decision. Pausing allows you to gather information and plan an appropriate response without risking disturbance.'
          },
          {
            id: 'immediate-abort',
            text: 'Immediately abort mission and return to home',
            consequence: 'overcautious',
            feedback: 'While safety-conscious, immediately aborting may be premature. You may be able to complete the mission with appropriate modifications.'
          }
        ]
      },

      'regulatory-violation': {
        id: 'regulatory-violation',
        type: 'narrative',
        content: 'You continue the automated flight pattern. As the aircraft approaches within 80 meters of the haul-out, the sea lions begin showing alert behavior - heads raised, some moving toward the water. Several seabirds flush from the cliff face. Your VO reports the animals are clearly disturbed.',
        nextNodeId: 'violation-outcome'
      },

      'violation-outcome': {
        id: 'violation-outcome',
        type: 'outcome',
        outcomeType: 'failure',
        content: 'You have likely violated the Marine Mammal Regulations which require maintaining at least 100m distance from pinnipeds. The disturbance to nesting seabirds may also constitute a violation of the BC Wildlife Act. This incident must be documented and reported.',
        xpModifier: 0,
        keyLessons: [
          'Marine mammals require minimum 100m horizontal distance',
          'Disturbance to nesting birds is a regulatory violation',
          'Mission approval does not override wildlife protection requirements',
          'Proactive avoidance is required when wildlife is detected'
        ]
      },

      'good-assessment': {
        id: 'good-assessment',
        type: 'narrative',
        content: 'You pause the automated mission and bring the aircraft to a hover at your current position, approximately 250 meters from the haul-out. Your VO confirms the animals appear relaxed and undisturbed. You can see the nesting birds on the cliff are also settled.',
        nextNodeId: 'species-id'
      },

      'overcautious': {
        id: 'overcautious',
        type: 'narrative',
        content: 'You immediately initiate return-to-home. While this ensures no disturbance, you\'ve left half the survey incomplete. Your client will need to reschedule and additional costs will be incurred.',
        nextNodeId: 'overcautious-reflection'
      },

      'overcautious-reflection': {
        id: 'overcautious-reflection',
        type: 'decision',
        content: 'On reflection, was there perhaps a better approach that could have protected wildlife while still completing the mission?',
        choices: [
          {
            id: 'realize-options',
            text: 'Yes - I should have paused and assessed options first',
            consequence: 'lesson-learned',
            feedback: 'Correct. Pausing to assess would have allowed you to identify safe alternatives while still protecting wildlife.'
          },
          {
            id: 'defend-abort',
            text: 'No - wildlife protection always means full abort',
            consequence: 'partial-understanding',
            feedback: 'Wildlife protection is paramount, but often missions can continue with appropriate modifications. Full abort should be the last resort, not the first response.'
          }
        ]
      },

      'lesson-learned': {
        id: 'lesson-learned',
        type: 'outcome',
        outcomeType: 'partial',
        content: 'You understand that while the abort protected wildlife, better situational assessment could have enabled mission completion with appropriate modifications. Wildlife protection and mission success are often compatible with proper planning.',
        xpModifier: 0.5,
        keyLessons: [
          'Pause and assess before making major decisions',
          'Wildlife protection and mission completion are often compatible',
          'Modified flight paths can maintain safe distances',
          'Immediate abort should be a last resort, not first response'
        ]
      },

      'partial-understanding': {
        id: 'partial-understanding',
        type: 'outcome',
        outcomeType: 'partial',
        content: 'While your commitment to wildlife protection is commendable, a rigid "abort on any wildlife sighting" approach is neither practical nor necessary. With proper assessment and modified procedures, most missions can be completed safely.',
        xpModifier: 0.4,
        keyLessons: [
          'Wildlife encounters require assessment, not automatic abort',
          'Regulatory distances allow operations outside buffer zones',
          'Modified flight paths often enable mission completion',
          'Balance wildlife protection with operational objectives'
        ]
      },

      'species-id': {
        id: 'species-id',
        type: 'decision',
        content: 'Now you need to identify the species to determine appropriate approach distances. Through binoculars, your VO observes they appear to be Steller sea lions - large animals with lighter coloring. What minimum distance applies?',
        choices: [
          {
            id: 'distance-50',
            text: '50 meters - standard drone distance',
            consequence: 'wrong-distance-50',
            feedback: 'Incorrect. There is no standard "drone distance" for wildlife. Steller sea lions require at least 100m under the Marine Mammal Regulations.'
          },
          {
            id: 'distance-100',
            text: '100 meters - standard marine mammal distance',
            consequence: 'correct-distance',
            feedback: 'Correct. Steller sea lions, like most pinnipeds, require a minimum 100m horizontal approach distance under the Marine Mammal Regulations.'
          },
          {
            id: 'distance-400',
            text: '400 meters - maximum protection distance',
            consequence: 'overly-cautious-distance',
            feedback: 'While extra caution isn\'t wrong, 400m is the SRKW (Southern Resident Killer Whale) distance. Steller sea lions require 100m minimum, though more distance is always acceptable.'
          }
        ]
      },

      'wrong-distance-50': {
        id: 'wrong-distance-50',
        type: 'narrative',
        content: 'Attempting to operate at 50m would violate the Marine Mammal Regulations. Your VO corrects you: "Pilot, I think sea lions need at least 100 meters. We should check the regs before proceeding."',
        nextNodeId: 'vo-correction'
      },

      'vo-correction': {
        id: 'vo-correction',
        type: 'decision',
        content: 'Your VO has flagged a potential regulatory issue. How do you respond?',
        choices: [
          {
            id: 'accept-correction',
            text: 'Good catch - verify the requirement and adjust plan',
            consequence: 'correct-distance',
            feedback: 'Good crew resource management. Accepting input from team members helps prevent errors and ensures regulatory compliance.'
          },
          {
            id: 'override-vo',
            text: 'I\'m the pilot - we\'ll do it my way',
            consequence: 'poor-crm',
            feedback: 'Dismissing valid safety input from crew members demonstrates poor CRM and increases risk of regulatory violations and safety incidents.'
          }
        ]
      },

      'poor-crm': {
        id: 'poor-crm',
        type: 'outcome',
        outcomeType: 'failure',
        content: 'Your dismissal of the VO\'s input demonstrates poor crew resource management. The VO was correct - 100m minimum is required. By overriding valid safety input, you\'ve undermined crew trust and risked a regulatory violation.',
        xpModifier: 0.2,
        keyLessons: [
          'Crew input should be welcomed, not dismissed',
          'VOs are critical safety team members',
          'When uncertain, verify regulations before proceeding',
          'Authority doesn\'t equal being right'
        ]
      },

      'correct-distance': {
        id: 'correct-distance',
        type: 'narrative',
        content: 'With 100m as your minimum distance, you assess your options. The haul-out site extends about 80m along the beach, and the nesting birds are on a 40m cliff section directly above. Your current survey lines would take you within 50m.',
        nextNodeId: 'planning-options'
      },

      'overly-cautious-distance': {
        id: 'overly-cautious-distance',
        type: 'narrative',
        content: 'While 400m provides an extra safety margin, you may be able to safely complete more of your survey at the regulatory minimum of 100m. However, extra caution with wildlife is never wrong.',
        nextNodeId: 'planning-options'
      },

      'planning-options': {
        id: 'planning-options',
        type: 'decision',
        content: 'What approach will you take to complete the survey while maintaining regulatory compliance?',
        choices: [
          {
            id: 'modify-altitude',
            text: 'Increase altitude to 120m and fly directly over',
            consequence: 'altitude-not-enough',
            feedback: 'Altitude increase doesn\'t satisfy the horizontal distance requirement. The regulations specify horizontal distance, and aircraft directly overhead can still cause disturbance.'
          },
          {
            id: 'modify-path',
            text: 'Modify flight path to maintain 150m buffer around wildlife',
            consequence: 'good-modification',
            feedback: 'Good solution. A 150m buffer exceeds the minimum requirement and allows survey completion in adjacent areas. The affected zone can potentially be surveyed from a different angle or on another day.'
          },
          {
            id: 'wait-wildlife',
            text: 'Wait for the animals to leave before resuming',
            consequence: 'impractical-wait',
            feedback: 'Sea lion haul-outs can persist for hours or days. Waiting is impractical and doesn\'t address the nesting birds which are more permanently established.'
          }
        ]
      },

      'altitude-not-enough': {
        id: 'altitude-not-enough',
        type: 'narrative',
        content: 'Your VO questions the plan: "Pilot, I don\'t think flying higher helps - the regulations are about horizontal distance. And won\'t being directly over them still be disturbing even at 120m?"',
        nextNodeId: 'reconsider-altitude'
      },

      'reconsider-altitude': {
        id: 'reconsider-altitude',
        type: 'decision',
        content: 'Your VO raises valid points. How do you proceed?',
        choices: [
          {
            id: 'accept-vo-altitude',
            text: 'Good point - let\'s modify the horizontal path instead',
            consequence: 'good-modification',
            feedback: 'Correct response. Horizontal distance is what matters for regulatory compliance and minimizing disturbance.'
          },
          {
            id: 'insist-altitude',
            text: 'Altitude should be enough - we\'ll try it',
            consequence: 'disturbance-altitude',
            feedback: 'Flying directly over wildlife at any altitude is likely to cause disturbance. The regulations exist because horizontal separation is what effectively reduces disturbance.'
          }
        ]
      },

      'disturbance-altitude': {
        id: 'disturbance-altitude',
        type: 'outcome',
        outcomeType: 'failure',
        content: 'As the aircraft passes over at 120m, several sea lions spook and rush to the water. The nesting birds flush from the cliff. While you achieved altitude, you\'ve still caused significant disturbance and likely violated the intent of the regulations.',
        xpModifier: 0.3,
        keyLessons: [
          'Horizontal distance is the key requirement',
          'Direct overflight disturbs wildlife regardless of altitude',
          'The spirit of regulations is to prevent disturbance',
          'Listen to crew members who raise valid concerns'
        ]
      },

      'good-modification': {
        id: 'good-modification',
        type: 'narrative',
        content: 'You modify the flight path to route around the wildlife area with a 150m buffer. The survey will have a gap in coverage for approximately 200m of beach section, but 85% of the original survey area can still be covered.',
        nextNodeId: 'complete-modified'
      },

      'impractical-wait': {
        id: 'impractical-wait',
        type: 'narrative',
        content: 'After 45 minutes of waiting, the sea lions show no sign of moving. Your batteries are draining, daylight is limited, and the nesting birds are clearly permanent residents. This approach isn\'t practical.',
        nextNodeId: 'realize-modification'
      },

      'realize-modification': {
        id: 'realize-modification',
        type: 'decision',
        content: 'The waiting approach isn\'t working. What now?',
        choices: [
          {
            id: 'finally-modify',
            text: 'Modify the flight path to work around the wildlife',
            consequence: 'late-modification',
            feedback: 'Better late than never. Modifying the path will still allow mission completion while protecting wildlife.'
          },
          {
            id: 'full-abort',
            text: 'Abort the mission entirely',
            consequence: 'unnecessary-abort',
            feedback: 'While understandable frustration, aborting when a modified path is possible wastes resources unnecessarily.'
          }
        ]
      },

      'late-modification': {
        id: 'late-modification',
        type: 'outcome',
        outcomeType: 'partial',
        content: 'You eventually complete 75% of the survey by working around the wildlife. The waiting time cost you battery reserves and limited your coverage. Earlier path modification would have been more efficient.',
        xpModifier: 0.6,
        keyLessons: [
          'Path modification should be first response, not last',
          'Waiting for wildlife to move is rarely practical',
          'Time spent waiting reduces mission capability',
          'Plan efficiently from the start'
        ]
      },

      'unnecessary-abort': {
        id: 'unnecessary-abort',
        type: 'outcome',
        outcomeType: 'failure',
        content: 'You abort the mission with only 50% complete. The client is disappointed as the remaining area could have been surveyed with simple path modifications. Resources have been wasted unnecessarily.',
        xpModifier: 0.3,
        keyLessons: [
          'Mission modification is usually possible',
          'Full abort should be a last resort',
          'Consider all options before abandoning objectives',
          'Client expectations include problem-solving ability'
        ]
      },

      'complete-modified': {
        id: 'complete-modified',
        type: 'decision',
        content: 'You complete the modified survey successfully. How will you handle the gap in coverage where wildlife was present?',
        choices: [
          {
            id: 'document-plan',
            text: 'Document the gap and propose options to client',
            consequence: 'professional-handling',
            feedback: 'Excellent approach. Professional handling includes documenting the situation and providing options for completing the survey.'
          },
          {
            id: 'ignore-gap',
            text: 'Deliver the data without mentioning the gap',
            consequence: 'unprofessional',
            feedback: 'Failing to disclose the coverage gap is unprofessional and could damage client trust when discovered.'
          },
          {
            id: 'return-later',
            text: 'Return later the same day to complete the gap',
            consequence: 'return-attempt',
            feedback: 'Returning is worth considering, but wildlife may still be present. Document the situation either way.'
          }
        ]
      },

      'professional-handling': {
        id: 'professional-handling',
        type: 'outcome',
        outcomeType: 'success',
        content: 'You deliver the survey data with full documentation of the wildlife encounter, the regulatory basis for your decisions, and options for completing the remaining section. The client appreciates your professionalism and regulatory awareness.',
        xpModifier: 1.0,
        keyLessons: [
          'Document wildlife encounters thoroughly',
          'Explain regulatory basis for operational decisions',
          'Provide clients with options rather than just problems',
          'Professional handling builds client trust',
          'Wildlife protection and mission success can coexist'
        ]
      },

      'unprofessional': {
        id: 'unprofessional',
        type: 'outcome',
        outcomeType: 'failure',
        content: 'You deliver incomplete data without explanation. When the client discovers the gap, they question your professionalism and the validity of other data. Your reputation suffers.',
        xpModifier: 0.4,
        keyLessons: [
          'Always disclose data gaps and their causes',
          'Transparency builds trust',
          'Hiding problems damages professional reputation',
          'Clients deserve complete information'
        ]
      },

      'return-attempt': {
        id: 'return-attempt',
        type: 'narrative',
        content: 'You return to the site three hours later. The sea lions are still present, but the tide has changed and they\'ve shifted position slightly. There may be an opportunity to capture some of the gap area.',
        nextNodeId: 'return-decision'
      },

      'return-decision': {
        id: 'return-decision',
        type: 'decision',
        content: 'The wildlife has shifted but is still in the area. What\'s your approach?',
        choices: [
          {
            id: 'careful-fill',
            text: 'Carefully capture what you can while maintaining buffers',
            consequence: 'successful-fill',
            feedback: 'Good approach. You can safely capture additional coverage while respecting wildlife buffers.'
          },
          {
            id: 'push-closer',
            text: 'Try to get closer to capture more - they seemed relaxed',
            consequence: 'disturbance-push',
            feedback: 'The animals\' apparent relaxation doesn\'t change the regulatory requirements. Approaching closer risks disturbance.'
          }
        ]
      },

      'successful-fill': {
        id: 'successful-fill',
        type: 'outcome',
        outcomeType: 'success',
        content: 'By maintaining proper buffers, you capture an additional 60% of the gap area. Combined with the morning\'s work, you\'ve achieved 95% survey coverage. The client is satisfied and commends your wildlife-aware approach.',
        xpModifier: 1.0,
        keyLessons: [
          'Returning for additional coverage can be effective',
          'Wildlife position may change, creating opportunities',
          'Maintain regulatory distances regardless of animal behavior',
          'Persistence with proper procedures achieves results',
          'Document all wildlife interactions'
        ]
      },

      'disturbance-push': {
        id: 'disturbance-push',
        type: 'outcome',
        outcomeType: 'failure',
        content: 'As you approach within 60m, several sea lions raise their heads and begin moving toward the water. You\'ve caused disturbance, exactly what the regulations are designed to prevent. The remaining animals are now alert and you cannot continue.',
        xpModifier: 0.3,
        keyLessons: [
          'Relaxed behavior doesn\'t permit closer approach',
          'Regulatory distances apply regardless of animal demeanor',
          'Causing disturbance defeats the purpose of wildlife protection',
          'One disturbance incident can spoil further opportunities'
        ]
      }
    }
  },

  // ========================================
  // SCENARIO: Biologist On Site
  // ========================================
  'biologist-coordination': {
    id: 'biologist-coordination',
    questId: 'working-with-biologists',
    trackId: 'wildlife-environmental',
    title: 'Biologist On Site',
    description: 'Coordinate with a wildlife biologist during a sensitive habitat survey. Navigate professional collaboration and adaptive management.',
    difficulty: 'intermediate',
    estimatedTime: 12,
    xpReward: 65,
    tags: ['collaboration', 'biologist', 'adaptive-management', 'professional'],

    context: {
      mission: 'Raptor nesting survey for environmental assessment',
      aircraft: 'DJI Mavic 3 Enterprise',
      location: 'Forested hillside with cliff bands',
      time: 'Early morning during nesting season',
      pilot: 'You are the RPAS pilot working with a consulting biologist',
      conditions: 'Calm winds, partly cloudy'
    },

    startNodeId: 'start',

    nodes: {
      start: {
        id: 'start',
        type: 'narrative',
        content: 'You\'ve been contracted to support a raptor nesting survey for an environmental assessment. Dr. Sarah Chen, the lead biologist, is on site to direct the survey and assess wildlife response. This is your first time working with this biologist.',
        nextNodeId: 'pre-brief'
      },

      'pre-brief': {
        id: 'pre-brief',
        type: 'narrative',
        content: 'Dr. Chen approaches you before operations begin. "Good morning. I\'d like to go over the survey protocol and discuss how we\'ll work together today. Have you done raptor surveys before?"',
        nextNodeId: 'experience-response'
      },

      'experience-response': {
        id: 'experience-response',
        type: 'decision',
        content: 'How do you respond to Dr. Chen\'s question about your experience?',
        choices: [
          {
            id: 'honest-limited',
            text: 'Honestly - I\'ve done wildlife surveys but not specifically raptors',
            consequence: 'honest-response',
            feedback: 'Honesty about experience level enables the biologist to provide appropriate guidance and ensures safe, effective collaboration.'
          },
          {
            id: 'overconfident',
            text: 'I\'ve done lots of wildlife work - I know what I\'m doing',
            consequence: 'overconfident-response',
            feedback: 'Overconfidence may prevent you from receiving important species-specific guidance that could improve the survey.'
          },
          {
            id: 'dismissive',
            text: 'Just tell me where to fly - I handle the aircraft',
            consequence: 'dismissive-response',
            feedback: 'Dismissing the biologist\'s expertise creates a poor working relationship and ignores valuable knowledge about wildlife behavior.'
          }
        ]
      },

      'honest-response': {
        id: 'honest-response',
        type: 'narrative',
        content: 'Dr. Chen nods appreciatively. "Good to know. Raptors can be particularly sensitive during nesting season. I\'ll guide you on approach distances and signs of disturbance. The key is watching for behavioral changes - I\'ll be on the radio to call out concerns."',
        nextNodeId: 'briefing-details'
      },

      'overconfident-response': {
        id: 'overconfident-response',
        type: 'narrative',
        content: 'Dr. Chen pauses. "I see. Well, each species is different. Raptors during nesting can be quite sensitive, and we need to watch for specific behavioral cues. I hope you\'ll be receptive to my guidance during the survey."',
        nextNodeId: 'briefing-details'
      },

      'dismissive-response': {
        id: 'dismissive-response',
        type: 'narrative',
        content: 'Dr. Chen\'s expression tightens. "Actually, this is a collaborative effort. I need you to understand raptor behavior so we can work together to avoid disturbance. Let me explain what we\'re looking for."',
        nextNodeId: 'briefing-details'
      },

      'briefing-details': {
        id: 'briefing-details',
        type: 'narrative',
        content: 'Dr. Chen explains: "We\'re looking for active nests on the cliff faces. Initial approach should be from 300m. If we identify a nest, I\'ll direct closer approaches. Key disturbance signs are: bird leaving nest, alarm calling, or defensive postures. If I call \'hold\', freeze position immediately."',
        nextNodeId: 'acknowledge-protocol'
      },

      'acknowledge-protocol': {
        id: 'acknowledge-protocol',
        type: 'decision',
        content: 'How do you confirm understanding of the protocol?',
        choices: [
          {
            id: 'readback-protocol',
            text: 'Read back key points: 300m initial, watch behavior, freeze on hold',
            consequence: 'good-readback',
            feedback: 'Reading back key points confirms understanding and demonstrates professional communication.'
          },
          {
            id: 'simple-ok',
            text: 'Just nod and say "Got it"',
            consequence: 'simple-acknowledgment',
            feedback: 'While acceptable, active readback would better confirm understanding of critical protocol elements.'
          }
        ]
      },

      'good-readback': {
        id: 'good-readback',
        type: 'narrative',
        content: '"Perfect. I can see you\'re used to working in crews. Let\'s get started." Dr. Chen positions herself where she can observe both the aircraft and the cliff face through spotting scope. You launch and begin the initial approach.',
        nextNodeId: 'first-approach'
      },

      'simple-acknowledgment': {
        id: 'simple-acknowledgment',
        type: 'narrative',
        content: 'Dr. Chen seems to want more confirmation but moves on. "Alright, let\'s get started. Remember - if anything seems off, just hold position." You launch and begin the initial approach.',
        nextNodeId: 'first-approach'
      },

      'first-approach': {
        id: 'first-approach',
        type: 'narrative',
        content: 'At 300m from the cliff, Dr. Chen radios: "I\'m seeing something at 2 o\'clock on the lower cliff band. Can you position for a better angle?" You adjust. "Good, hold there. I\'m seeing... yes, that looks like a nest structure. Adult bird present."',
        nextNodeId: 'nest-detected'
      },

      'nest-detected': {
        id: 'nest-detected',
        type: 'narrative',
        content: '"Based on size and location, likely a Red-tailed Hawk," Dr. Chen continues. "I need you to move to about 150m for positive species ID, but watch the bird\'s behavior. Approach slowly - no more than 2 m/s. Ready when you are."',
        nextNodeId: 'approach-speed'
      },

      'approach-speed': {
        id: 'approach-speed',
        type: 'decision',
        content: 'How do you conduct the approach to 150m?',
        choices: [
          {
            id: 'slow-careful',
            text: 'Slow, deliberate approach at 2 m/s with frequent pauses',
            consequence: 'proper-approach',
            feedback: 'Slow approach with pauses allows the bird time to habituate and gives the biologist time to assess behavior.'
          },
          {
            id: 'moderate-direct',
            text: 'Direct approach at moderate speed - faster means less time near nest',
            consequence: 'too-fast',
            feedback: 'While the logic seems reasonable, rapid approaches are more likely to startle wildlife. Slow and steady is the correct approach.'
          },
          {
            id: 'spiral-approach',
            text: 'Spiral in from the side to avoid direct approach',
            consequence: 'spiral-good',
            feedback: 'Good thinking. Oblique approaches are often less threatening to wildlife than direct approaches.'
          }
        ]
      },

      'proper-approach': {
        id: 'proper-approach',
        type: 'narrative',
        content: 'You approach slowly with several pauses. Dr. Chen monitors continuously. "Good pace. The bird is watching but hasn\'t changed posture. Continue." At 150m, "Hold position. I can see it\'s definitely a Red-tail, adult female on nest. Good behavior, I think we can continue."',
        nextNodeId: 'closer-request'
      },

      'too-fast': {
        id: 'too-fast',
        type: 'narrative',
        content: 'As you approach at moderate speed, Dr. Chen calls urgently: "Hold! The bird is mantling - wings spread defensively. Too fast. Back off to 200m slowly." You comply and the bird settles after a tense minute.',
        nextNodeId: 'recovery-from-fast'
      },

      'recovery-from-fast': {
        id: 'recovery-from-fast',
        type: 'decision',
        content: 'After backing off, Dr. Chen says the bird has settled. What\'s your next action?',
        choices: [
          {
            id: 'wait-try-again',
            text: 'Wait 5 minutes then try slower approach',
            consequence: 'patient-retry',
            feedback: 'Good recovery. Waiting allows the bird to return to baseline behavior before attempting another approach.'
          },
          {
            id: 'abandon-nest',
            text: 'This nest is too sensitive - move to search for others',
            consequence: 'premature-abandon',
            feedback: 'One defensive response doesn\'t mean the nest can\'t be surveyed. With patience and proper technique, most nests can be assessed.'
          }
        ]
      },

      'patient-retry': {
        id: 'patient-retry',
        type: 'narrative',
        content: 'After waiting, Dr. Chen gives the go-ahead. This time you approach very slowly with frequent pauses. The bird watches but stays calm. You reach 150m successfully. "Much better. Species confirmed. Now let\'s talk about getting closer for nest contents."',
        nextNodeId: 'closer-request'
      },

      'premature-abandon': {
        id: 'premature-abandon',
        type: 'narrative',
        content: 'Dr. Chen responds: "Let\'s not give up that easily. Most nests can be surveyed with patience. Let\'s wait a few minutes and try a much slower approach. We need species confirmation at minimum."',
        nextNodeId: 'patient-retry'
      },

      'spiral-good': {
        id: 'spiral-good',
        type: 'narrative',
        content: '"Good thinking on the oblique approach," Dr. Chen notes. "The bird seems comfortable with that angle." You spiral in smoothly, and at 150m she confirms: "Red-tailed Hawk, adult female. Good behavior. Let\'s talk about nest contents verification."',
        nextNodeId: 'closer-request'
      },

      'closer-request': {
        id: 'closer-request',
        type: 'narrative',
        content: '"I need to determine nest contents - eggs, chicks, or neither," Dr. Chen explains. "This requires a brief view into the nest, ideally from above at about 50m. This is more intrusive. How do you feel about the approach?"',
        nextNodeId: 'risk-discussion'
      },

      'risk-discussion': {
        id: 'risk-discussion',
        type: 'decision',
        content: 'How do you participate in this risk discussion?',
        choices: [
          {
            id: 'defer-biologist',
            text: 'You\'re the biologist - I\'ll fly where you direct',
            consequence: 'pure-deference',
            feedback: 'While the biologist is the wildlife expert, you should contribute your operational perspective. Collaboration works both ways.'
          },
          {
            id: 'discuss-options',
            text: 'Let\'s discuss approach options and my aircraft capabilities',
            consequence: 'collaborative-discussion',
            feedback: 'Excellent. You bring technical knowledge; she brings wildlife knowledge. Collaboration produces the best outcomes.'
          },
          {
            id: 'express-concern',
            text: 'I\'m concerned about getting that close - what if it flushes?',
            consequence: 'valid-concern',
            feedback: 'Raising legitimate concerns is appropriate. The biologist should address how to mitigate disturbance risk.'
          }
        ]
      },

      'pure-deference': {
        id: 'pure-deference',
        type: 'narrative',
        content: 'Dr. Chen appreciates the cooperation but asks: "What\'s your aircraft\'s camera capability? Can we get a view from farther if needed? I value your technical input - we should plan this together."',
        nextNodeId: 'technical-input'
      },

      'collaborative-discussion': {
        id: 'collaborative-discussion',
        type: 'narrative',
        content: '"Great, let\'s plan it together. What camera capability do you have?" You discuss the 56x hybrid zoom. "Perfect! We might be able to get what I need from farther out. Let\'s try 80m first with full zoom."',
        nextNodeId: 'zoom-attempt'
      },

      'valid-concern': {
        id: 'valid-concern',
        type: 'narrative',
        content: '"Valid concern. If she flushes, we abort immediately - eggs can chill and chicks are vulnerable. What\'s your camera zoom capability? Maybe we can stay farther and still see nest contents."',
        nextNodeId: 'technical-input'
      },

      'technical-input': {
        id: 'technical-input',
        type: 'decision',
        content: 'Dr. Chen wants to know about your camera capability. Your aircraft has 56x hybrid zoom. What do you suggest?',
        choices: [
          {
            id: 'suggest-zoom',
            text: 'With 56x zoom, we might see nest contents from 80m',
            consequence: 'zoom-attempt',
            feedback: 'Good technical contribution. Using zoom capability can reduce disturbance risk while achieving survey objectives.'
          },
          {
            id: 'go-close',
            text: 'The camera works better close up - let\'s just go to 50m',
            consequence: 'unnecessary-risk',
            feedback: 'While technically true that closer is better, utilizing zoom capability first is lower risk and may be sufficient.'
          }
        ]
      },

      'zoom-attempt': {
        id: 'zoom-attempt',
        type: 'narrative',
        content: 'You position at 80m and apply full zoom. Dr. Chen watches the live feed. "I can see... yes, I can see at least two eggs in the nest. The female is staying calm. This is exactly what we needed. Let\'s not push any closer."',
        nextNodeId: 'survey-success'
      },

      'unnecessary-risk': {
        id: 'unnecessary-risk',
        type: 'narrative',
        content: 'Dr. Chen pauses. "Let\'s try the zoom from farther first. If that doesn\'t work, we can reassess. There\'s no point in extra risk if it\'s not needed." You position at 80m and try full zoom.',
        nextNodeId: 'zoom-success'
      },

      'zoom-success': {
        id: 'zoom-success',
        type: 'narrative',
        content: '"I can see what I need - eggs in the nest. Good thing we tried zoom first - we didn\'t need to risk getting closer. Thanks for the capability input."',
        nextNodeId: 'survey-success'
      },

      'survey-success': {
        id: 'survey-success',
        type: 'narrative',
        content: 'The survey continues successfully, documenting three additional nest sites with similar techniques. At the debrief, Dr. Chen notes: "Good collaboration today. We got all our data without causing any disturbance."',
        nextNodeId: 'debrief-choice'
      },

      'debrief-choice': {
        id: 'debrief-choice',
        type: 'decision',
        content: 'During the debrief, Dr. Chen asks for your feedback on the collaboration. What do you share?',
        choices: [
          {
            id: 'positive-constructive',
            text: 'Share what worked well and ask about future improvements',
            consequence: 'professional-debrief',
            feedback: 'Professional debriefing strengthens working relationships and improves future collaborations.'
          },
          {
            id: 'just-positive',
            text: 'It all went well, nothing to add',
            consequence: 'missed-opportunity',
            feedback: 'Missing the opportunity for substantive feedback limits professional growth and relationship development.'
          }
        ]
      },

      'professional-debrief': {
        id: 'professional-debrief',
        type: 'outcome',
        outcomeType: 'success',
        content: 'You discuss what worked: the briefing, real-time communication, and technical collaboration. Dr. Chen shares tips for future raptor surveys and provides her card for referrals. This professional relationship will lead to future work.',
        xpModifier: 1.0,
        keyLessons: [
          'Honest communication about experience enables effective collaboration',
          'Biologists and pilots each bring essential expertise',
          'Technical capabilities can reduce wildlife disturbance',
          'Professional debriefing builds lasting relationships',
          'Collaborative approach produces best results'
        ]
      },

      'missed-opportunity': {
        id: 'missed-opportunity',
        type: 'outcome',
        outcomeType: 'partial',
        content: 'Dr. Chen seems slightly disappointed by the brief debrief but thanks you for the good work. The collaboration was successful, but you\'ve missed an opportunity to build a stronger professional relationship.',
        xpModifier: 0.75,
        keyLessons: [
          'Debriefs are opportunities for relationship building',
          'Feedback improves future collaborations',
          'Professional engagement extends beyond the immediate task',
          'Ask questions to learn from expert collaborators'
        ]
      }
    }
  }
}

export default wildlifeScenarios
