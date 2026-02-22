/**
 * Crew Resource Management (CRM) Quest Track
 *
 * Comprehensive training covering human factors, communication,
 * decision-making, and team coordination for RPAS operations.
 *
 * Source: CRM_Training_Program_Comprehensive.docx + CRM_Training_Enhanced_Sections6-13.docx
 *
 * @version 1.0.0
 */

const crmTrack = {
  id: 'track_crm_expert',
  slug: 'crew-resource-management',
  name: 'Crew Resource Management',
  description: 'Master the human factors that make or break safe operations. Learn communication, decision-making, situational awareness, stress management, and team coordination skills essential for RPAS operations.',
  category: 'human-factors',
  icon: 'Users',
  color: 'blue',
  totalQuests: 9,
  totalLessons: 32,
  totalXp: 1000,
  estimatedHours: 6,
  difficulty: 'intermediate',
  prerequisites: [],
  requiredForRoles: ['operator', 'pilot', 'management'],
  badge: {
    id: 'badge_crm_expert',
    name: 'CRM Expert',
    description: 'Completed the Crew Resource Management training track',
    rarity: 'epic',
    icon: 'Users',
    color: 'blue',
    xpBonus: 250
  },
  isActive: true,
  version: '1.0.0',
  quests: [
    // Quest 1: Introduction to CRM
    {
      id: 'quest_crm_intro',
      trackId: 'track_crm_expert',
      slug: 'introduction-to-crm',
      title: 'Introduction to CRM',
      description: 'Understand the origins of CRM, human factors in aviation, and the core principles that guide effective crew coordination.',
      sequence: 1,
      estimatedDuration: 25,
      difficulty: 'beginner',
      objectives: [
        'Explain the origins and evolution of CRM',
        'Identify key human factors in aviation',
        'Describe CRM core principles'
      ],
      totalLessons: 3,
      xpReward: 80,
      hasQuiz: true,
      hasScenario: false,
      isActive: true,
      lessons: [
        {
          id: 'lesson_crm_origins',
          questId: 'quest_crm_intro',
          slug: 'crm-origins-evolution',
          title: 'CRM Origins & Evolution',
          content: `
            <h2>The Birth of Crew Resource Management</h2>
            <p>CRM emerged from the aviation industry's recognition that most accidents weren't caused by mechanical failures or lack of flying skill—they were caused by failures in communication, leadership, and decision-making.</p>

            <h3>The Catalyst: The 1970s</h3>
            <p>Several high-profile accidents revealed a disturbing pattern:</p>
            <ul>
              <li><strong>Tenerife Disaster (1977):</strong> 583 deaths from communication failures and authority gradients</li>
              <li><strong>United 173 (1978):</strong> Fuel exhaustion while crew focused on landing gear light</li>
              <li><strong>Eastern 401 (1972):</strong> Crash while entire crew investigated a burned-out bulb</li>
            </ul>
            <p>In each case, technically competent crews made errors that proper crew coordination could have prevented.</p>

            <h3>CRM Generations</h3>
            <ol>
              <li><strong>1st Gen (1980s):</strong> Cockpit Resource Management - focus on assertiveness</li>
              <li><strong>2nd Gen:</strong> Crew Resource Management - teamwork concepts</li>
              <li><strong>3rd Gen:</strong> Added decision-making and situational awareness</li>
              <li><strong>4th Gen:</strong> Integrated with technical training</li>
              <li><strong>5th Gen:</strong> Error management and threat awareness</li>
              <li><strong>6th Gen (Current):</strong> Threat and Error Management (TEM)</li>
            </ol>

            <div class="key-concept">
              <h4>Key Insight</h4>
              <p>CRM isn't about being nice or avoiding conflict—it's about using all available resources (human, hardware, information) to achieve safe operations.</p>
            </div>
          `,
          sequence: 1,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'CRM emerged from analysis of human factors accidents',
            'Technical skill alone doesn\'t prevent accidents',
            'CRM has evolved through six generations'
          ],
          xpReward: 25,
          isActive: true
        },
        {
          id: 'lesson_crm_human_factors',
          questId: 'quest_crm_intro',
          slug: 'human-factors-in-aviation',
          title: 'Human Factors in Aviation',
          content: `
            <h2>Understanding Human Factors</h2>
            <p>Human factors is the study of how humans interact with systems, machines, and environments. In aviation, it's about designing systems and procedures that work WITH human capabilities and limitations.</p>

            <h3>The SHELL Model</h3>
            <p>A framework for understanding human factors interfaces:</p>
            <ul>
              <li><strong>S</strong>oftware: Procedures, checklists, manuals</li>
              <li><strong>H</strong>ardware: Aircraft, equipment, controls</li>
              <li><strong>E</strong>nvironment: Weather, terrain, workspace</li>
              <li><strong>L</strong>iveware: The human (center of the model)</li>
              <li><strong>L</strong>iveware: Other humans (crew, ATC, clients)</li>
            </ul>

            <h3>Human Limitations</h3>
            <p>We all have inherent limitations that affect performance:</p>
            <ul>
              <li><strong>Attention:</strong> Limited capacity, selective focus</li>
              <li><strong>Memory:</strong> Short-term limits, forgetting curves</li>
              <li><strong>Perception:</strong> Illusions, expectations affecting reality</li>
              <li><strong>Decision-making:</strong> Biases, time pressure effects</li>
              <li><strong>Physical:</strong> Fatigue, illness, circadian rhythms</li>
            </ul>

            <h3>The "Dirty Dozen"</h3>
            <p>Transport Canada identifies 12 common human factors hazards:</p>
            <ol>
              <li>Lack of Communication</li>
              <li>Complacency</li>
              <li>Lack of Knowledge</li>
              <li>Distraction</li>
              <li>Lack of Teamwork</li>
              <li>Fatigue</li>
              <li>Lack of Resources</li>
              <li>Pressure</li>
              <li>Lack of Assertiveness</li>
              <li>Stress</li>
              <li>Lack of Awareness</li>
              <li>Norms (negative workplace norms)</li>
            </ol>

            <div class="think-about-it">
              <h4>Think About It</h4>
              <p>Which of the Dirty Dozen have you experienced in your operations? What countermeasures could you apply?</p>
            </div>
          `,
          sequence: 2,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'SHELL model shows human-system interfaces',
            'All humans have inherent limitations',
            'The Dirty Dozen are common human factors hazards'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_crm_core_principles',
          questId: 'quest_crm_intro',
          slug: 'crm-core-principles',
          title: 'CRM Core Principles',
          content: `
            <h2>Core Principles of Effective CRM</h2>
            <p>CRM is built on foundational principles that, when consistently applied, dramatically improve operational safety.</p>

            <h3>The Core Principles</h3>
            <ol>
              <li><strong>Communication:</strong> Clear, timely, two-way exchange of information</li>
              <li><strong>Situational Awareness:</strong> Knowing what's happening now and what's coming</li>
              <li><strong>Decision Making:</strong> Structured approaches to making sound choices</li>
              <li><strong>Teamwork:</strong> Coordinated effort toward shared goals</li>
              <li><strong>Workload Management:</strong> Distributing and prioritizing tasks effectively</li>
              <li><strong>Leadership:</strong> Guiding the team while remaining open to input</li>
            </ol>

            <h3>CRM in RPAS Operations</h3>
            <p>RPAS operations present unique CRM challenges:</p>
            <ul>
              <li>Crew may be distributed (PIC, VO, support personnel)</li>
              <li>Communication over radio/headset adds complexity</li>
              <li>Visual observer has information PIC doesn't have</li>
              <li>Mission demands can create authority gradients with clients</li>
            </ul>

            <h3>The CRM Mindset</h3>
            <ul>
              <li>Safety is everyone's responsibility</li>
              <li>Speaking up is expected and valued</li>
              <li>Errors are inevitable—catching them is the goal</li>
              <li>Continuous learning and improvement</li>
            </ul>

            <div class="key-takeaway">
              <h4>Key Takeaway</h4>
              <p>CRM isn't a checklist to complete—it's a way of thinking and operating that becomes part of every operation.</p>
            </div>
          `,
          sequence: 3,
          type: 'content',
          estimatedDuration: 7,
          keyPoints: [
            'Six core principles guide CRM practice',
            'RPAS operations have unique CRM challenges',
            'CRM is a mindset, not just a procedure'
          ],
          xpReward: 25,
          isActive: true
        }
      ]
    },

    // Quest 2: Threat & Error Management
    {
      id: 'quest_crm_tem',
      trackId: 'track_crm_expert',
      slug: 'threat-error-management',
      title: 'Threat & Error Management',
      description: 'Learn the TEM framework for identifying threats, managing errors, and preventing undesired states.',
      sequence: 2,
      estimatedDuration: 35,
      difficulty: 'intermediate',
      objectives: [
        'Explain the TEM framework',
        'Identify threat types',
        'Describe error types and management',
        'Recognize undesired aircraft states'
      ],
      totalLessons: 4,
      xpReward: 120,
      hasQuiz: true,
      hasScenario: true,
      scenarioId: 'scenario_crm_mounting_threats',
      isActive: true,
      lessons: [
        {
          id: 'lesson_crm_tem_overview',
          questId: 'quest_crm_tem',
          slug: 'understanding-tem',
          title: 'Understanding TEM',
          content: `
            <h2>The Threat and Error Management Framework</h2>
            <p>TEM is the current-generation approach to CRM that recognizes threats and errors are normal parts of operations, and the key is managing them effectively.</p>

            <h3>The TEM Model</h3>
            <p>TEM has three components:</p>
            <ol>
              <li><strong>Threats:</strong> External factors that increase complexity or risk</li>
              <li><strong>Errors:</strong> Crew actions that deviate from intentions or expectations</li>
              <li><strong>Undesired States:</strong> Positions or situations that reduce safety margins</li>
            </ol>

            <h3>The TEM Chain</h3>
            <p>Threats and errors can lead to undesired states:</p>
            <ul>
              <li>Threats → create conditions for errors</li>
              <li>Errors → can lead to undesired states</li>
              <li>Undesired states → can lead to incidents/accidents</li>
            </ul>
            <p>The goal is to break this chain at each link.</p>

            <h3>Key TEM Principles</h3>
            <ul>
              <li><strong>Anticipation:</strong> Expect threats and prepare countermeasures</li>
              <li><strong>Recognition:</strong> Detect threats and errors quickly</li>
              <li><strong>Recovery:</strong> Effective response to manage them</li>
            </ul>

            <div class="key-concept">
              <h4>The TEM Philosophy</h4>
              <p>Errors are not failures—they're inevitable. What matters is whether we trap them before they cause harm.</p>
            </div>
          `,
          sequence: 1,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'TEM has three components: threats, errors, undesired states',
            'Goal is to break the chain leading to incidents',
            'Anticipation, recognition, and recovery are key'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_crm_threat_types',
          questId: 'quest_crm_tem',
          slug: 'threat-types',
          title: 'Threat Types',
          content: `
            <h2>Identifying and Managing Threats</h2>
            <p>Threats are conditions or events beyond crew control that increase operational complexity. Recognizing them early enables effective countermeasures.</p>

            <h3>Environmental Threats</h3>
            <ul>
              <li>Weather: Wind, precipitation, visibility, temperature</li>
              <li>Terrain: Obstacles, elevation changes, confined areas</li>
              <li>Airspace: Traffic, restricted areas, proximity to airports</li>
              <li>Wildlife: Birds, animals in operating area</li>
            </ul>

            <h3>Organizational Threats</h3>
            <ul>
              <li>Time pressure from clients or schedule</li>
              <li>Inadequate planning time</li>
              <li>Equipment shortages or substitutions</li>
              <li>Communication gaps between team members</li>
              <li>Procedural ambiguities</li>
            </ul>

            <h3>Technical Threats</h3>
            <ul>
              <li>Equipment malfunctions or degradation</li>
              <li>Software/firmware issues</li>
              <li>GPS/signal interference</li>
              <li>Battery limitations</li>
            </ul>

            <h3>Threat Management Strategies</h3>
            <ol>
              <li><strong>Anticipate:</strong> Brief known threats before operations</li>
              <li><strong>Monitor:</strong> Continuously scan for emerging threats</li>
              <li><strong>Share:</strong> Communicate threats to all team members</li>
              <li><strong>Mitigate:</strong> Implement countermeasures proactively</li>
            </ol>

            <div class="example">
              <h4>Example Threat Briefing</h4>
              <p>"Today we have gusty winds forecast for 1400. We'll plan to complete operations before 1300 and have a hard stop at 1330 regardless of mission progress."</p>
            </div>
          `,
          sequence: 2,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'Threats are external conditions beyond crew control',
            'Categories: environmental, organizational, technical',
            'Brief, monitor, share, and mitigate threats'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_crm_error_types',
          questId: 'quest_crm_tem',
          slug: 'error-types-management',
          title: 'Error Types & Management',
          content: `
            <h2>Understanding and Managing Errors</h2>
            <p>Errors are crew actions (or inactions) that lead to deviations from intentions or expectations. They're inevitable—the goal is to catch and correct them.</p>

            <h3>Error Types</h3>
            <ul>
              <li><strong>Handling Errors:</strong> Aircraft control or automation errors</li>
              <li><strong>Procedural Errors:</strong> Deviations from SOPs, checklists</li>
              <li><strong>Communication Errors:</strong> Misunderstandings, omissions</li>
              <li><strong>Decision Errors:</strong> Poor choices, inadequate planning</li>
            </ul>

            <h3>Error Outcomes</h3>
            <p>Errors can have different outcomes:</p>
            <ul>
              <li><strong>Trapped:</strong> Detected and corrected with no harm</li>
              <li><strong>Exacerbated:</strong> Response makes things worse</li>
              <li><strong>Consequential:</strong> Leads to undesired state or incident</li>
            </ul>

            <h3>Error Management Strategies</h3>
            <ol>
              <li><strong>Avoid:</strong> Reduce error likelihood through training, procedures, design</li>
              <li><strong>Trap:</strong> Catch errors before they cause harm (checklists, cross-checks)</li>
              <li><strong>Mitigate:</strong> Reduce consequences if error reaches outcome</li>
            </ol>

            <h3>Creating an Error-Trapping Culture</h3>
            <ul>
              <li>Expect errors—stay vigilant</li>
              <li>Use standard phraseology and callouts</li>
              <li>Cross-check critical actions</li>
              <li>Speak up immediately when something seems wrong</li>
              <li>Celebrate caught errors, not just error-free operations</li>
            </ul>

            <div class="think-about-it">
              <h4>Think About It</h4>
              <p>Recall a recent operation. What errors occurred? Were they trapped, and if so, how?</p>
            </div>
          `,
          sequence: 3,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'Four error types: handling, procedural, communication, decision',
            'Errors can be trapped, exacerbated, or consequential',
            'Create culture that catches errors early'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_crm_undesired_states',
          questId: 'quest_crm_tem',
          slug: 'undesired-aircraft-states',
          title: 'Undesired Aircraft States',
          content: `
            <h2>Recognizing and Recovering from Undesired States</h2>
            <p>An Undesired Aircraft State (UAS) is a position, speed, attitude, or configuration that reduces safety margins. Recognizing UAS quickly is critical for recovery.</p>

            <h3>Types of Undesired States</h3>
            <ul>
              <li><strong>Aircraft Handling:</strong> Unusual attitudes, excessive speeds, unstable approaches</li>
              <li><strong>Ground Navigation:</strong> Wrong position, unauthorized area penetration</li>
              <li><strong>Systems Status:</strong> Incorrect configuration, degraded systems</li>
            </ul>

            <h3>RPAS-Specific Undesired States</h3>
            <ul>
              <li>Loss of visual contact with aircraft</li>
              <li>Degraded link status</li>
              <li>GPS/navigation anomalies</li>
              <li>Battery below safe reserves</li>
              <li>Proximity to obstacles or restricted airspace</li>
              <li>Exceeded operational boundaries</li>
            </ul>

            <h3>UAS Recovery</h3>
            <ol>
              <li><strong>Recognize:</strong> Identify the undesired state</li>
              <li><strong>Announce:</strong> Call it out to the team</li>
              <li><strong>Prioritize:</strong> Aviate, Navigate, Communicate</li>
              <li><strong>Recover:</strong> Take corrective action</li>
              <li><strong>Reassess:</strong> Confirm recovery and evaluate for mission continuation</li>
            </ol>

            <div class="warning">
              <h4>Critical Reminder</h4>
              <p>When in an undesired state, prioritize aircraft control first. Many accidents occur when crews focus on diagnosing a problem while the aircraft situation worsens.</p>
            </div>
          `,
          sequence: 4,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'UAS reduces safety margins',
            'RPAS has unique undesired states',
            'Recovery follows: recognize, announce, prioritize, recover, reassess'
          ],
          xpReward: 30,
          isActive: true
        }
      ]
    },

    // Quest 3: Communication
    {
      id: 'quest_crm_communication',
      trackId: 'track_crm_expert',
      slug: 'communication',
      title: 'Communication',
      description: 'Develop effective communication skills including assertiveness, active listening, and closed-loop techniques.',
      sequence: 3,
      estimatedDuration: 30,
      difficulty: 'intermediate',
      objectives: [
        'Apply effective communication models',
        'Practice assertive communication',
        'Demonstrate active listening',
        'Use closed-loop communication'
      ],
      totalLessons: 4,
      xpReward: 110,
      hasQuiz: true,
      hasScenario: false,
      isActive: true,
      lessons: [
        {
          id: 'lesson_crm_comm_models',
          questId: 'quest_crm_communication',
          slug: 'effective-communication-models',
          title: 'Effective Communication Models',
          content: `
            <h2>Models for Effective Communication</h2>
            <p>Communication is more than just talking—it's ensuring your message is received and understood as intended.</p>

            <h3>The Communication Process</h3>
            <ol>
              <li><strong>Sender:</strong> Formulates and transmits message</li>
              <li><strong>Message:</strong> Information being conveyed</li>
              <li><strong>Channel:</strong> Medium of transmission (voice, radio, gesture)</li>
              <li><strong>Receiver:</strong> Receives and interprets message</li>
              <li><strong>Feedback:</strong> Confirms understanding</li>
            </ol>

            <h3>Communication Barriers</h3>
            <ul>
              <li><strong>Physical:</strong> Noise, distance, equipment issues</li>
              <li><strong>Psychological:</strong> Stress, fatigue, preoccupation</li>
              <li><strong>Semantic:</strong> Different interpretations of words</li>
              <li><strong>Cultural:</strong> Different communication norms</li>
              <li><strong>Hierarchical:</strong> Authority gradients inhibiting speech</li>
            </ul>

            <h3>Best Practices</h3>
            <ul>
              <li>Use standard phraseology when available</li>
              <li>Keep messages clear and concise</li>
              <li>Verify understanding through readback</li>
              <li>Address individuals by name/role when possible</li>
              <li>Make eye contact when feasible</li>
              <li>Match communication urgency to situation</li>
            </ul>

            <div class="example">
              <h4>Clear vs. Unclear Communication</h4>
              <p><strong>Unclear:</strong> "Let's bring it back soon"</p>
              <p><strong>Clear:</strong> "PIC, VO here. Begin RTH now, battery at 25%"</p>
            </div>
          `,
          sequence: 1,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Communication requires sender, message, channel, receiver, and feedback',
            'Multiple barriers can disrupt communication',
            'Clear, concise, standard phraseology prevents errors'
          ],
          xpReward: 25,
          isActive: true
        },
        {
          id: 'lesson_crm_assertive',
          questId: 'quest_crm_communication',
          slug: 'assertive-communication',
          title: 'Assertive Communication',
          content: `
            <h2>Assertive Communication</h2>
            <p>Assertiveness is the ability to express your views and concerns directly and respectfully, especially when safety is at stake.</p>

            <h3>The Assertiveness Scale</h3>
            <ul>
              <li><strong>Passive:</strong> Doesn't express concerns, defers to authority</li>
              <li><strong>Assertive:</strong> Expresses concerns clearly and respectfully</li>
              <li><strong>Aggressive:</strong> Expresses concerns in hostile or dominating way</li>
            </ul>

            <h3>The Two-Challenge Rule</h3>
            <p>If you see a safety concern:</p>
            <ol>
              <li><strong>First challenge:</strong> State your concern clearly</li>
              <li><strong>Second challenge:</strong> If not acknowledged, state it again more firmly</li>
              <li><strong>Take action:</strong> If still unresolved, take necessary safety action</li>
            </ol>

            <h3>Assertive Phrases</h3>
            <ul>
              <li>"I'm concerned about..."</li>
              <li>"I need clarification on..."</li>
              <li>"I don't think that's safe because..."</li>
              <li>"I recommend we..."</li>
              <li>"I'm uncomfortable with..."</li>
              <li>"Stop! [safety issue]"</li>
            </ul>

            <h3>Overcoming Barriers to Assertiveness</h3>
            <ul>
              <li>Fear of being wrong → Safety is more important than ego</li>
              <li>Rank/experience difference → Safety has no rank</li>
              <li>Fear of conflict → Managed conflict is better than accidents</li>
              <li>Cultural norms → Professional safety culture overrides</li>
            </ul>

            <div class="key-concept">
              <h4>Remember</h4>
              <p>The time you hesitate to speak up could be the time it matters most. In safety, it's always better to voice a concern that turns out to be unfounded than to stay silent about one that was valid.</p>
            </div>
          `,
          sequence: 2,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Assertiveness is between passive and aggressive',
            'Two-challenge rule ensures concerns are heard',
            'Safety concerns must be voiced regardless of hierarchy'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_crm_listening',
          questId: 'quest_crm_communication',
          slug: 'active-listening',
          title: 'Active Listening',
          content: `
            <h2>Active Listening</h2>
            <p>Effective communication requires not just clear speaking but also attentive listening. Active listening ensures you fully receive and understand messages.</p>

            <h3>Active Listening Techniques</h3>
            <ul>
              <li><strong>Pay attention:</strong> Focus fully on the speaker</li>
              <li><strong>Show engagement:</strong> Nod, make eye contact, use verbal cues</li>
              <li><strong>Defer judgment:</strong> Listen fully before evaluating</li>
              <li><strong>Reflect:</strong> Paraphrase to confirm understanding</li>
              <li><strong>Clarify:</strong> Ask questions if uncertain</li>
              <li><strong>Summarize:</strong> Recap key points</li>
            </ul>

            <h3>Listening Barriers</h3>
            <ul>
              <li>Preparing your response while others speak</li>
              <li>Distractions (internal and external)</li>
              <li>Assumptions about what will be said</li>
              <li>Emotional reactions to content</li>
              <li>Fatigue or stress</li>
            </ul>

            <h3>In RPAS Operations</h3>
            <p>Active listening is critical when:</p>
            <ul>
              <li>Receiving VO reports on aircraft position/traffic</li>
              <li>Coordinating with ATC or flight services</li>
              <li>During crew briefings and debriefings</li>
              <li>When team members express concerns</li>
            </ul>

            <div class="think-about-it">
              <h4>Think About It</h4>
              <p>When someone speaks to you during operations, are you fully listening or already formulating your response?</p>
            </div>
          `,
          sequence: 3,
          type: 'content',
          estimatedDuration: 7,
          keyPoints: [
            'Active listening requires full attention and engagement',
            'Reflect and clarify to confirm understanding',
            'Critical during crew coordination and briefings'
          ],
          xpReward: 25,
          isActive: true
        },
        {
          id: 'lesson_crm_closed_loop',
          questId: 'quest_crm_communication',
          slug: 'closed-loop-communication',
          title: 'Closed-Loop Communication',
          content: `
            <h2>Closed-Loop Communication</h2>
            <p>Closed-loop communication ensures that messages are not only sent but also received and understood correctly. It's a cornerstone of professional aviation communication.</p>

            <h3>The Three Steps</h3>
            <ol>
              <li><strong>Send:</strong> Transmit clear, specific message</li>
              <li><strong>Acknowledge:</strong> Receiver confirms receipt</li>
              <li><strong>Verify:</strong> Sender confirms acknowledgment is correct</li>
            </ol>

            <h3>Example: Closed-Loop in Action</h3>
            <p><strong>PIC:</strong> "VO, climb to 200 feet AGL"</p>
            <p><strong>VO:</strong> "Climbing to 200 feet AGL"</p>
            <p><strong>PIC:</strong> "Correct"</p>

            <h3>When to Use Closed-Loop</h3>
            <ul>
              <li>All control inputs or altitude changes</li>
              <li>Mission-critical instructions</li>
              <li>Emergency commands</li>
              <li>When there's any ambiguity</li>
              <li>Communicating numbers, altitudes, headings</li>
            </ul>

            <h3>Common Failures</h3>
            <ul>
              <li><strong>"I assumed they heard me"</strong> → Always get acknowledgment</li>
              <li><strong>"They said okay"</strong> → Require specific readback</li>
              <li><strong>"I was busy"</strong> → Never too busy for safety-critical communication</li>
            </ul>

            <div class="key-takeaway">
              <h4>Key Takeaway</h4>
              <p>If you don't get a readback, the message wasn't received. If the readback is wrong, the message wasn't understood. Either way, communication isn't complete.</p>
            </div>
          `,
          sequence: 4,
          type: 'content',
          estimatedDuration: 7,
          keyPoints: [
            'Three steps: send, acknowledge, verify',
            'Use for all critical instructions',
            'No readback = no communication'
          ],
          xpReward: 25,
          isActive: true
        }
      ]
    },

    // Quest 4: Situational Awareness
    {
      id: 'quest_crm_sa',
      trackId: 'track_crm_expert',
      slug: 'situational-awareness',
      title: 'Situational Awareness',
      description: 'Develop the ability to perceive, comprehend, and project situational factors critical to safe operations.',
      sequence: 4,
      estimatedDuration: 35,
      difficulty: 'intermediate',
      objectives: [
        'Apply Endsley\'s SA model',
        'Recognize SA demons',
        'Maintain SA under pressure',
        'Build shared mental models'
      ],
      totalLessons: 4,
      xpReward: 120,
      hasQuiz: true,
      hasScenario: true,
      scenarioId: 'scenario_crm_lost_loop',
      isActive: true,
      lessons: [
        {
          id: 'lesson_crm_sa_levels',
          questId: 'quest_crm_sa',
          slug: 'sa-levels-endsley',
          title: 'SA Levels (Endsley Model)',
          content: `
            <h2>Understanding Situational Awareness</h2>
            <p>Situational Awareness (SA) is knowing what's going on around you. Dr. Mica Endsley's model breaks SA into three levels.</p>

            <h3>Level 1: Perception</h3>
            <p><strong>What is happening?</strong></p>
            <ul>
              <li>Perceiving relevant elements in the environment</li>
              <li>Current aircraft state (altitude, speed, position)</li>
              <li>Current weather conditions</li>
              <li>Status of equipment and systems</li>
              <li>Location of obstacles, traffic, personnel</li>
            </ul>

            <h3>Level 2: Comprehension</h3>
            <p><strong>What does it mean?</strong></p>
            <ul>
              <li>Understanding the significance of perceived elements</li>
              <li>Is this normal or abnormal?</li>
              <li>Is this a threat?</li>
              <li>How do these elements relate to each other?</li>
              <li>What's the impact on the mission?</li>
            </ul>

            <h3>Level 3: Projection</h3>
            <p><strong>What will happen next?</strong></p>
            <ul>
              <li>Predicting future states based on current understanding</li>
              <li>Where will the aircraft be in 30 seconds?</li>
              <li>Will this weather affect us before mission complete?</li>
              <li>If this trend continues, what happens?</li>
            </ul>

            <div class="key-concept">
              <h4>SA is Hierarchical</h4>
              <p>You can't comprehend what you don't perceive, and you can't project what you don't comprehend. Each level builds on the previous one.</p>
            </div>
          `,
          sequence: 1,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'Level 1: Perception - What is happening?',
            'Level 2: Comprehension - What does it mean?',
            'Level 3: Projection - What will happen next?'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_crm_sa_demons',
          questId: 'quest_crm_sa',
          slug: 'sa-demons',
          title: 'SA Demons',
          content: `
            <h2>The SA Demons</h2>
            <p>Several factors can degrade or destroy situational awareness. These "SA demons" must be recognized and countered.</p>

            <h3>The Primary SA Demons</h3>
            <ul>
              <li><strong>Fixation:</strong> Focusing on one thing to exclusion of others</li>
              <li><strong>Ambiguity:</strong> Unclear or conflicting information</li>
              <li><strong>Distraction:</strong> Attention diverted to non-critical matters</li>
              <li><strong>Complacency:</strong> Reduced vigilance due to routine/boredom</li>
              <li><strong>Overload:</strong> Too much information to process effectively</li>
              <li><strong>Fatigue:</strong> Reduced cognitive capacity from tiredness</li>
            </ul>

            <h3>Warning Signs of SA Loss</h3>
            <ul>
              <li>Confusion about current state</li>
              <li>Unable to answer questions about situation</li>
              <li>Fixating on single problem</li>
              <li>Nobody flying/monitoring the aircraft</li>
              <li>Departure from SOPs without awareness</li>
              <li>Failure to meet targets (altitude, position)</li>
              <li>"Something doesn't feel right"</li>
            </ul>

            <h3>Countering SA Demons</h3>
            <ul>
              <li><strong>For Fixation:</strong> Force yourself to scan broadly</li>
              <li><strong>For Ambiguity:</strong> Seek clarification, use multiple sources</li>
              <li><strong>For Distraction:</strong> Prioritize, delay non-critical tasks</li>
              <li><strong>For Complacency:</strong> Active monitoring, expect the unexpected</li>
              <li><strong>For Overload:</strong> Shed tasks, delegate, simplify</li>
              <li><strong>For Fatigue:</strong> Recognize limits, share monitoring</li>
            </ul>

            <div class="warning">
              <h4>The Most Dangerous State</h4>
              <p>Losing SA without knowing you've lost it. If something doesn't feel right, trust that feeling and reassess.</p>
            </div>
          `,
          sequence: 2,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'Six SA demons: fixation, ambiguity, distraction, complacency, overload, fatigue',
            'Know the warning signs of SA loss',
            'Specific countermeasures for each demon'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_crm_sa_pressure',
          questId: 'quest_crm_sa',
          slug: 'maintaining-sa-pressure',
          title: 'Maintaining SA Under Pressure',
          content: `
            <h2>Maintaining SA Under Pressure</h2>
            <p>High-pressure situations are exactly when SA is most critical—and most vulnerable. Strategies help maintain SA when it matters most.</p>

            <h3>Why Pressure Degrades SA</h3>
            <ul>
              <li>Stress narrows attention (tunnel vision)</li>
              <li>Working memory capacity decreases</li>
              <li>Time seems to accelerate</li>
              <li>We revert to well-trained behaviors (good or bad)</li>
              <li>Communication often deteriorates</li>
            </ul>

            <h3>SA Maintenance Strategies</h3>
            <ul>
              <li><strong>Prioritize:</strong> Aviate, Navigate, Communicate</li>
              <li><strong>Verbalize:</strong> Say what you're doing and seeing</li>
              <li><strong>Share:</strong> Use the team for monitoring and checks</li>
              <li><strong>Simplify:</strong> Reduce task load when possible</li>
              <li><strong>Take time:</strong> Slow down if you can afford to</li>
              <li><strong>Update:</strong> Regularly check your mental model</li>
            </ul>

            <h3>The SA Check</h3>
            <p>Periodically ask yourself:</p>
            <ul>
              <li>Where is my aircraft right now?</li>
              <li>What is its status (battery, link, mode)?</li>
              <li>What's happening in the environment?</li>
              <li>What's my next action going to be?</li>
              <li>What could go wrong?</li>
            </ul>

            <div class="think-about-it">
              <h4>Think About It</h4>
              <p>When was the last time you felt you lost SA during an operation? What caused it, and what brought it back?</p>
            </div>
          `,
          sequence: 3,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Pressure narrows attention and degrades memory',
            'Verbalize and share to maintain SA',
            'Regular SA checks prevent degradation'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_crm_shared_mental',
          questId: 'quest_crm_sa',
          slug: 'shared-mental-models',
          title: 'Shared Mental Models',
          content: `
            <h2>Building Shared Mental Models</h2>
            <p>A shared mental model ensures all team members have the same understanding of the situation, plan, and expectations.</p>

            <h3>What is a Shared Mental Model?</h3>
            <p>It's a common understanding among team members of:</p>
            <ul>
              <li>The current situation</li>
              <li>The plan and objectives</li>
              <li>Each person's roles and responsibilities</li>
              <li>How the team will respond to contingencies</li>
              <li>What success looks like</li>
            </ul>

            <h3>Building Shared Models</h3>
            <ul>
              <li><strong>Pre-flight Briefing:</strong> Establish the common picture</li>
              <li><strong>Standard Procedures:</strong> Everyone knows the playbook</li>
              <li><strong>Position Reports:</strong> Keep everyone updated</li>
              <li><strong>Thinking Aloud:</strong> Share your mental process</li>
              <li><strong>Cross-checks:</strong> Verify others' understanding</li>
            </ul>

            <h3>Signs of Model Divergence</h3>
            <ul>
              <li>Crew members making different assumptions</li>
              <li>Surprise at others' actions</li>
              <li>"I thought you were going to..."</li>
              <li>Duplicated or missed tasks</li>
              <li>Disagreement about priorities</li>
            </ul>

            <h3>In RPAS Operations</h3>
            <p>Shared models are especially important when:</p>
            <ul>
              <li>PIC and VO have different views of the operation</li>
              <li>Team is distributed across locations</li>
              <li>Mission plan changes in-flight</li>
              <li>Handoffs between crew members occur</li>
            </ul>

            <div class="key-takeaway">
              <h4>Key Takeaway</h4>
              <p>"If you haven't briefed it, you can't expect others to know it." Shared mental models don't form automatically—they must be deliberately built and maintained.</p>
            </div>
          `,
          sequence: 4,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Shared mental models ensure common understanding',
            'Built through briefings, procedures, and communication',
            'Watch for signs of model divergence'
          ],
          xpReward: 30,
          isActive: true
        }
      ]
    },

    // Quest 5: Stress & Pressure Management
    {
      id: 'quest_crm_stress',
      trackId: 'track_crm_expert',
      slug: 'stress-pressure-management',
      title: 'Stress & Pressure Management',
      description: 'Understand the effects of stress on performance and develop strategies for managing pressure.',
      sequence: 5,
      estimatedDuration: 25,
      difficulty: 'intermediate',
      objectives: [
        'Explain the Yerkes-Dodson Law',
        'Recognize stress symptoms',
        'Apply coping strategies'
      ],
      totalLessons: 3,
      xpReward: 90,
      hasQuiz: true,
      hasScenario: false,
      isActive: true,
      lessons: [
        {
          id: 'lesson_crm_yerkes_dodson',
          questId: 'quest_crm_stress',
          slug: 'yerkes-dodson-law',
          title: 'Yerkes-Dodson Law',
          content: `
            <h2>The Stress-Performance Relationship</h2>
            <p>The Yerkes-Dodson Law describes the relationship between arousal (stress) and performance—it's not as simple as "less stress = better."</p>

            <h3>The Inverted-U Curve</h3>
            <ul>
              <li><strong>Too Little Arousal:</strong> Boredom, inattention, slow reactions</li>
              <li><strong>Optimal Arousal:</strong> Alert, focused, peak performance</li>
              <li><strong>Too Much Arousal:</strong> Anxiety, errors, degraded thinking</li>
            </ul>

            <h3>Factors Affecting the Curve</h3>
            <ul>
              <li><strong>Task Complexity:</strong> Complex tasks require lower arousal</li>
              <li><strong>Skill Level:</strong> Experts can handle higher arousal</li>
              <li><strong>Individual Differences:</strong> People have different optimal points</li>
            </ul>

            <h3>Implications for Operations</h3>
            <ul>
              <li>Routine operations may need added vigilance (increase arousal)</li>
              <li>High-stress situations may need calming techniques (decrease arousal)</li>
              <li>Know your personal optimal zone</li>
              <li>Monitor team members for signs of over/under-arousal</li>
            </ul>

            <div class="key-concept">
              <h4>The Goal</h4>
              <p>Manage your arousal level to stay in the optimal zone—not too relaxed, not too stressed.</p>
            </div>
          `,
          sequence: 1,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Performance follows an inverted-U with stress',
            'Both too little and too much arousal hurt performance',
            'Optimal arousal depends on task and individual'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_crm_stress_recognition',
          questId: 'quest_crm_stress',
          slug: 'stress-recognition',
          title: 'Stress Recognition',
          content: `
            <h2>Recognizing Stress</h2>
            <p>You can't manage stress you don't recognize. Learning to identify stress symptoms in yourself and others is essential.</p>

            <h3>Physical Symptoms</h3>
            <ul>
              <li>Increased heart rate</li>
              <li>Sweating, trembling</li>
              <li>Muscle tension</li>
              <li>Rapid breathing</li>
              <li>Stomach discomfort</li>
              <li>Fatigue despite rest</li>
            </ul>

            <h3>Cognitive Symptoms</h3>
            <ul>
              <li>Narrowed attention</li>
              <li>Difficulty concentrating</li>
              <li>Poor decision-making</li>
              <li>Memory problems</li>
              <li>Racing thoughts</li>
              <li>Negative thinking</li>
            </ul>

            <h3>Behavioral Symptoms</h3>
            <ul>
              <li>Irritability</li>
              <li>Withdrawal</li>
              <li>Task rushing</li>
              <li>Skipping procedures</li>
              <li>Uncharacteristic errors</li>
              <li>Changes in communication</li>
            </ul>

            <h3>Stressors in RPAS Operations</h3>
            <ul>
              <li>Time pressure from clients or weather</li>
              <li>Equipment malfunctions</li>
              <li>Unexpected situations</li>
              <li>High-stakes missions</li>
              <li>Personal life issues</li>
              <li>Cumulative fatigue</li>
            </ul>

            <div class="think-about-it">
              <h4>Think About It</h4>
              <p>What are your personal stress symptoms? What situations tend to trigger them?</p>
            </div>
          `,
          sequence: 2,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Stress has physical, cognitive, and behavioral symptoms',
            'Know your personal stress indicators',
            'Multiple stressors are common in RPAS operations'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_crm_coping',
          questId: 'quest_crm_stress',
          slug: 'coping-strategies',
          title: 'Coping Strategies',
          content: `
            <h2>Stress Coping Strategies</h2>
            <p>Effective coping strategies can be applied before, during, and after stressful situations.</p>

            <h3>Before (Prevention)</h3>
            <ul>
              <li>Adequate rest and nutrition</li>
              <li>Thorough preparation and planning</li>
              <li>Mental rehearsal of contingencies</li>
              <li>Set realistic expectations</li>
              <li>Build competence through training</li>
            </ul>

            <h3>During (Management)</h3>
            <ul>
              <li><strong>Breathing:</strong> Slow, deep breaths to reduce arousal</li>
              <li><strong>Focus:</strong> One task at a time, prioritize</li>
              <li><strong>Talk:</strong> Verbalize what you're doing</li>
              <li><strong>Delegate:</strong> Share the load with team</li>
              <li><strong>Ground:</strong> Focus on immediate concrete tasks</li>
              <li><strong>Perspective:</strong> "I've trained for this"</li>
            </ul>

            <h3>After (Recovery)</h3>
            <ul>
              <li>Debrief the event</li>
              <li>Acknowledge stress response as normal</li>
              <li>Rest and recover</li>
              <li>Learn from the experience</li>
              <li>Seek support if needed</li>
            </ul>

            <h3>The Power of "Stand By"</h3>
            <p>When feeling overwhelmed:</p>
            <ul>
              <li>Say "Stand by" - buys you time</li>
              <li>Take a breath</li>
              <li>Prioritize: What's the most important thing right now?</li>
              <li>Act on that one thing</li>
              <li>Then address the next thing</li>
            </ul>

            <div class="key-takeaway">
              <h4>Key Takeaway</h4>
              <p>You don't have to eliminate stress—you just need to manage it. The ability to function under pressure is a skill that improves with practice.</p>
            </div>
          `,
          sequence: 3,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Prevention, management, and recovery strategies',
            'Breathing and focus are immediate tools',
            '"Stand by" buys time to think'
          ],
          xpReward: 25,
          isActive: true
        }
      ]
    },

    // Quest 6: Fatigue Management
    {
      id: 'quest_crm_fatigue',
      trackId: 'track_crm_expert',
      slug: 'fatigue-management',
      title: 'Fatigue Management',
      description: 'Understand the science of fatigue and learn to recognize and mitigate its effects on performance.',
      sequence: 6,
      estimatedDuration: 30,
      difficulty: 'intermediate',
      objectives: [
        'Understand circadian rhythms',
        'Recognize sleep debt effects',
        'Identify fatigue risk indicators',
        'Apply personal fatigue countermeasures'
      ],
      totalLessons: 4,
      xpReward: 110,
      hasQuiz: true,
      hasScenario: false,
      isActive: true,
      lessons: [
        {
          id: 'lesson_crm_circadian',
          questId: 'quest_crm_fatigue',
          slug: 'circadian-rhythms',
          title: 'Circadian Rhythms',
          content: `
            <h2>Understanding Circadian Rhythms</h2>
            <p>Your body operates on a roughly 24-hour cycle that affects alertness, performance, and sleep. Understanding this cycle helps manage fatigue.</p>

            <h3>The Circadian Cycle</h3>
            <ul>
              <li><strong>Window of Circadian Low (WOCL):</strong> 2:00-6:00 AM - lowest alertness</li>
              <li><strong>Secondary Dip:</strong> Early afternoon (post-lunch)</li>
              <li><strong>Peak Alertness:</strong> Late morning and early evening</li>
            </ul>

            <h3>Factors Affecting Circadian Rhythm</h3>
            <ul>
              <li><strong>Light:</strong> Primary synchronizer; suppresses melatonin</li>
              <li><strong>Sleep Schedule:</strong> Regular times reinforce rhythm</li>
              <li><strong>Social Cues:</strong> Meals, activities, interactions</li>
              <li><strong>Time Zone Changes:</strong> Jet lag disrupts alignment</li>
            </ul>

            <h3>Operational Implications</h3>
            <ul>
              <li>Schedule critical tasks during peak alertness when possible</li>
              <li>Extra vigilance during circadian low periods</li>
              <li>Account for early starts affecting alertness</li>
              <li>Team monitoring is crucial during WOCL operations</li>
            </ul>

            <div class="key-concept">
              <h4>Know Your Pattern</h4>
              <p>Are you a "morning person" or "evening person"? Understanding your personal circadian tendency helps plan work effectively.</p>
            </div>
          `,
          sequence: 1,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            '24-hour cycle affects alertness throughout day',
            'WOCL is 2-6 AM with secondary dip in afternoon',
            'Light is the primary circadian synchronizer'
          ],
          xpReward: 25,
          isActive: true
        },
        {
          id: 'lesson_crm_sleep_debt',
          questId: 'quest_crm_fatigue',
          slug: 'sleep-debt-recovery',
          title: 'Sleep Debt & Recovery',
          content: `
            <h2>Sleep Debt and Recovery</h2>
            <p>Most adults need 7-9 hours of sleep. Getting less creates a "sleep debt" that accumulates and impairs performance.</p>

            <h3>Effects of Sleep Debt</h3>
            <ul>
              <li>Decreased reaction time</li>
              <li>Impaired decision-making</li>
              <li>Reduced memory and learning</li>
              <li>Mood changes and irritability</li>
              <li>Microsleeps (brief involuntary sleep episodes)</li>
              <li>Reduced immune function</li>
            </ul>

            <h3>Sleep Debt Accumulation</h3>
            <p>Missing 2 hours of sleep per night for a week creates a 14-hour deficit—equivalent to two full nights without sleep.</p>

            <h3>Recovery</h3>
            <ul>
              <li>Sleep debt must be repaid—you can't adapt to insufficient sleep</li>
              <li>Recovery sleep is less efficient than regular sleep</li>
              <li>It takes multiple nights to fully recover from significant debt</li>
              <li>Prevention is more effective than recovery</li>
            </ul>

            <h3>Napping</h3>
            <p>Strategic naps can help manage fatigue:</p>
            <ul>
              <li><strong>Power nap:</strong> 10-20 minutes - quick refresh</li>
              <li><strong>Full cycle:</strong> 90 minutes - includes deep sleep</li>
              <li>Avoid 30-60 minute naps (wake during deep sleep = grogginess)</li>
              <li>Allow 20 minutes after waking before operating</li>
            </ul>

            <div class="warning">
              <h4>Warning</h4>
              <p>You cannot accurately assess your own impairment when fatigued. The more tired you are, the worse you are at recognizing it.</p>
            </div>
          `,
          sequence: 2,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Sleep debt accumulates and impairs performance',
            'Recovery requires multiple nights of adequate sleep',
            'Strategic napping can help but isn\'t a substitute'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_crm_fatigue_indicators',
          questId: 'quest_crm_fatigue',
          slug: 'fatigue-risk-indicators',
          title: 'Fatigue Risk Indicators',
          content: `
            <h2>Recognizing Fatigue</h2>
            <p>Fatigue often develops gradually, making it hard to recognize in yourself. Knowing the indicators helps catch it early.</p>

            <h3>Physical Indicators</h3>
            <ul>
              <li>Yawning frequently</li>
              <li>Heavy eyelids, blurred vision</li>
              <li>Rubbing eyes</li>
              <li>Head nodding</li>
              <li>Restlessness, fidgeting</li>
            </ul>

            <h3>Cognitive Indicators</h3>
            <ul>
              <li>Difficulty concentrating</li>
              <li>Slower reaction times</li>
              <li>Forgetting actions just performed</li>
              <li>Missing radio calls or callouts</li>
              <li>Tunnel vision</li>
              <li>Difficulty tracking multiple tasks</li>
            </ul>

            <h3>Behavioral Indicators</h3>
            <ul>
              <li>Irritability or mood changes</li>
              <li>Reduced motivation</li>
              <li>Taking shortcuts</li>
              <li>Increased errors</li>
              <li>Withdrawal from interaction</li>
            </ul>

            <h3>High-Risk Situations</h3>
            <ul>
              <li>Early morning operations (before 0600)</li>
              <li>Extended duty periods</li>
              <li>Multiple consecutive days without rest</li>
              <li>Sleep disruption (travel, stress, illness)</li>
              <li>Monotonous tasks or environments</li>
            </ul>

            <div class="think-about-it">
              <h4>Think About It</h4>
              <p>What are your personal early warning signs of fatigue? How do others notice when you're fatigued?</p>
            </div>
          `,
          sequence: 3,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Physical, cognitive, and behavioral indicators',
            'Early detection is key',
            'High-risk situations require extra vigilance'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_crm_fatigue_countermeasures',
          questId: 'quest_crm_fatigue',
          slug: 'personal-fatigue-countermeasures',
          title: 'Personal Fatigue Countermeasures',
          content: `
            <h2>Managing Fatigue</h2>
            <p>While adequate sleep is the only true solution to fatigue, several countermeasures can help manage fatigue risk.</p>

            <h3>Prevention (Before Work)</h3>
            <ul>
              <li>Prioritize 7-9 hours of sleep opportunity</li>
              <li>Maintain consistent sleep schedule</li>
              <li>Create good sleep environment (dark, cool, quiet)</li>
              <li>Limit caffeine in afternoon/evening</li>
              <li>Avoid alcohol before sleep</li>
              <li>Regular exercise (not too close to bedtime)</li>
            </ul>

            <h3>Mitigation (During Work)</h3>
            <ul>
              <li><strong>Caffeine:</strong> Strategic use, allow 20 min to take effect</li>
              <li><strong>Physical activity:</strong> Move around, stretch</li>
              <li><strong>Light:</strong> Bright light increases alertness</li>
              <li><strong>Temperature:</strong> Cooler environment helps</li>
              <li><strong>Social interaction:</strong> Engage with others</li>
              <li><strong>Task variation:</strong> Change tasks to maintain engagement</li>
            </ul>

            <h3>Team Strategies</h3>
            <ul>
              <li>Monitor each other for fatigue signs</li>
              <li>Speak up about fatigue concerns</li>
              <li>Share critical tasks</li>
              <li>Build in breaks and rotation</li>
              <li>Support go/no-go decisions based on fatigue</li>
            </ul>

            <h3>When to Stop</h3>
            <p>Recognize when countermeasures aren't enough:</p>
            <ul>
              <li>Microsleeps occurring</li>
              <li>Unable to maintain focus</li>
              <li>Multiple errors in short period</li>
              <li>Feeling unsafe</li>
            </ul>

            <div class="key-takeaway">
              <h4>Key Takeaway</h4>
              <p>Fatigue countermeasures buy time—they don't eliminate fatigue. Know your limits and don't let mission pressure override safety.</p>
            </div>
          `,
          sequence: 4,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Prevention through good sleep habits is most effective',
            'Countermeasures buy time but don\'t eliminate fatigue',
            'Team monitoring and support is crucial'
          ],
          xpReward: 25,
          isActive: true
        }
      ]
    },

    // Quest 7: Workload Management
    {
      id: 'quest_crm_workload',
      trackId: 'track_crm_expert',
      slug: 'workload-management',
      title: 'Workload Management',
      description: 'Learn to prioritize tasks, distribute workload, and manage high-demand situations effectively.',
      sequence: 7,
      estimatedDuration: 25,
      difficulty: 'intermediate',
      objectives: [
        'Apply task prioritization techniques',
        'Distribute workload effectively',
        'Know when to say no'
      ],
      totalLessons: 3,
      xpReward: 100,
      hasQuiz: true,
      hasScenario: true,
      scenarioId: 'scenario_crm_task_saturation',
      isActive: true,
      lessons: [
        {
          id: 'lesson_crm_prioritization',
          questId: 'quest_crm_workload',
          slug: 'task-prioritization',
          title: 'Task Prioritization',
          content: `
            <h2>Prioritizing Tasks</h2>
            <p>When workload is high, you can't do everything. Effective prioritization ensures critical tasks are completed.</p>

            <h3>The Aviation Priority Hierarchy</h3>
            <ol>
              <li><strong>Aviate:</strong> Control the aircraft</li>
              <li><strong>Navigate:</strong> Know where you are and where you're going</li>
              <li><strong>Communicate:</strong> Talk to who needs to know</li>
              <li><strong>Operate:</strong> Mission tasks and systems management</li>
            </ol>

            <h3>Priority Matrix</h3>
            <ul>
              <li><strong>Urgent + Important:</strong> Do first (emergencies, critical errors)</li>
              <li><strong>Important + Not Urgent:</strong> Schedule (flight planning, maintenance)</li>
              <li><strong>Urgent + Not Important:</strong> Delegate or delay (non-critical requests)</li>
              <li><strong>Not Urgent + Not Important:</strong> Eliminate (nice-to-haves)</li>
            </ul>

            <h3>The "3 Things" Rule</h3>
            <p>In high-workload situations, ask: "What are the three most important things right now?"</p>
            <ul>
              <li>Identify the three critical tasks</li>
              <li>Focus on completing those</li>
              <li>Then identify the next three</li>
              <li>Everything else waits</li>
            </ul>

            <div class="example">
              <h4>Example: Lost Link Event</h4>
              <ol>
                <li><strong>Aviate:</strong> Confirm autopilot/RTH engaging</li>
                <li><strong>Navigate:</strong> Track aircraft position and altitude</li>
                <li><strong>Communicate:</strong> Alert VO, prepare ATC if needed</li>
              </ol>
              <p>Mission data collection? That can wait.</p>
            </div>
          `,
          sequence: 1,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Aviate, Navigate, Communicate hierarchy',
            'Use priority matrix for decisions',
            'Focus on three critical tasks at a time'
          ],
          xpReward: 35,
          isActive: true
        },
        {
          id: 'lesson_crm_distribution',
          questId: 'quest_crm_workload',
          slug: 'workload-distribution',
          title: 'Workload Distribution',
          content: `
            <h2>Distributing Workload</h2>
            <p>Effective teams share workload based on capacity and capability. No one person should be overwhelmed while others are idle.</p>

            <h3>Workload Distribution Principles</h3>
            <ul>
              <li><strong>Anticipate:</strong> Identify high-workload periods in advance</li>
              <li><strong>Assign:</strong> Clearly delegate specific tasks</li>
              <li><strong>Balance:</strong> Distribute based on current capacity</li>
              <li><strong>Monitor:</strong> Watch for overload signs in team members</li>
              <li><strong>Adjust:</strong> Reallocate as situation changes</li>
            </ul>

            <h3>Signs of Overload</h3>
            <ul>
              <li>Tasks being missed or delayed</li>
              <li>Errors increasing</li>
              <li>Communication becoming terse</li>
              <li>Tunnel vision on one task</li>
              <li>Person becoming unresponsive to calls</li>
            </ul>

            <h3>Effective Delegation</h3>
            <ul>
              <li>Be specific about what you need</li>
              <li>Confirm the person has capacity</li>
              <li>Set clear expectations and timeframe</li>
              <li>Verify understanding</li>
              <li>Follow up to confirm completion</li>
            </ul>

            <h3>In RPAS Crew</h3>
            <ul>
              <li>PIC can delegate monitoring tasks to VO</li>
              <li>VO can take over certain communications</li>
              <li>Support crew can handle admin and logistics</li>
              <li>Redistribute if situation changes capacity</li>
            </ul>

            <div class="key-concept">
              <h4>Ask for Help</h4>
              <p>Asking for help isn't weakness—it's good crew resource management. The goal is mission success and safety, not proving you can do it alone.</p>
            </div>
          `,
          sequence: 2,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Anticipate and proactively distribute',
            'Watch for overload signs in team',
            'Clear delegation prevents confusion'
          ],
          xpReward: 35,
          isActive: true
        },
        {
          id: 'lesson_crm_saying_no',
          questId: 'quest_crm_workload',
          slug: 'when-to-say-no',
          title: 'When to Say No',
          content: `
            <h2>Knowing Your Limits</h2>
            <p>Sometimes the safest decision is to not take on additional tasks, or to abort the current mission. Knowing when and how to say no is crucial.</p>

            <h3>Situations Requiring "No"</h3>
            <ul>
              <li>Additional tasks would compromise primary duties</li>
              <li>Conditions have deteriorated beyond acceptable limits</li>
              <li>Resources are insufficient for safe completion</li>
              <li>Crew is impaired by fatigue, stress, or other factors</li>
              <li>Something doesn't feel right</li>
            </ul>

            <h3>Pressure to Say Yes</h3>
            <p>You may feel pressure from:</p>
            <ul>
              <li>Clients wanting more or faster</li>
              <li>Colleagues expecting you to keep up</li>
              <li>Management pushing schedules</li>
              <li>Self-imposed standards of capability</li>
            </ul>

            <h3>How to Say No</h3>
            <ul>
              <li>Be direct and clear</li>
              <li>Explain the safety rationale</li>
              <li>Offer alternatives if possible</li>
              <li>Don't apologize for prioritizing safety</li>
            </ul>

            <h3>Sample Phrases</h3>
            <ul>
              <li>"I can't take that on safely right now"</li>
              <li>"We need to abort this mission"</li>
              <li>"I'm not comfortable proceeding"</li>
              <li>"Let's reassess before continuing"</li>
              <li>"That's beyond our current capacity"</li>
            </ul>

            <div class="key-takeaway">
              <h4>Key Takeaway</h4>
              <p>A professional can always explain why they said no. No one can explain why they didn't say no after an incident.</p>
            </div>
          `,
          sequence: 3,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Know situations requiring refusal',
            'Pressure to continue is common—resist it',
            'Be direct about safety concerns'
          ],
          xpReward: 30,
          isActive: true
        }
      ]
    },

    // Quest 8: Decision Making
    {
      id: 'quest_crm_decision',
      trackId: 'track_crm_expert',
      slug: 'decision-making',
      title: 'Decision Making',
      description: 'Learn structured decision-making approaches for both time-critical and deliberate situations.',
      sequence: 8,
      estimatedDuration: 35,
      difficulty: 'advanced',
      objectives: [
        'Apply naturalistic decision making',
        'Use the FORDEC model',
        'Recognize decision traps',
        'Make time-critical decisions'
      ],
      totalLessons: 4,
      xpReward: 130,
      hasQuiz: true,
      hasScenario: true,
      scenarioId: 'scenario_crm_split_second',
      isActive: true,
      lessons: [
        {
          id: 'lesson_crm_ndm',
          questId: 'quest_crm_decision',
          slug: 'naturalistic-decision-making',
          title: 'Naturalistic Decision Making',
          content: `
            <h2>How Experts Actually Decide</h2>
            <p>Research shows that experts in high-pressure environments don't carefully compare all options. They use a process called Naturalistic Decision Making (NDM).</p>

            <h3>Recognition-Primed Decision (RPD) Model</h3>
            <p>Experts make decisions by:</p>
            <ol>
              <li><strong>Recognize:</strong> Match situation to known patterns</li>
              <li><strong>Identify:</strong> Recognize typical action for this pattern</li>
              <li><strong>Mental Simulation:</strong> Quick mental test of action</li>
              <li><strong>Act:</strong> If simulation works, execute; if not, adapt</li>
            </ol>

            <h3>How Experience Enables NDM</h3>
            <ul>
              <li>Pattern recognition develops through exposure</li>
              <li>Mental simulation improves with practice</li>
              <li>Intuition is really rapid pattern matching</li>
              <li>Training builds the pattern library</li>
            </ul>

            <h3>When NDM Works Best</h3>
            <ul>
              <li>Time pressure limits deliberation</li>
              <li>Situation matches known patterns</li>
              <li>Decision maker has relevant experience</li>
              <li>Clear goals exist</li>
            </ul>

            <h3>When NDM Can Fail</h3>
            <ul>
              <li>Truly novel situations (no matching pattern)</li>
              <li>Misrecognition (wrong pattern matched)</li>
              <li>Insufficient experience</li>
              <li>Stress/fatigue degrading pattern matching</li>
            </ul>

            <div class="key-concept">
              <h4>Building Your Pattern Library</h4>
              <p>Every training scenario, simulated emergency, and real-world event adds to your pattern library. This is why recurrent training matters.</p>
            </div>
          `,
          sequence: 1,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'Experts recognize patterns, not compare options',
            'Experience builds pattern library',
            'NDM can fail in novel situations'
          ],
          xpReward: 35,
          isActive: true
        },
        {
          id: 'lesson_crm_fordec',
          questId: 'quest_crm_decision',
          slug: 'fordec-model',
          title: 'FORDEC Model',
          content: `
            <h2>The FORDEC Decision Model</h2>
            <p>When you have time for structured decision-making, FORDEC provides a systematic approach used in aviation.</p>

            <h3>F - Facts</h3>
            <p>Gather all relevant information:</p>
            <ul>
              <li>What is the situation?</li>
              <li>What are the conditions?</li>
              <li>What resources do we have?</li>
              <li>What constraints exist?</li>
            </ul>

            <h3>O - Options</h3>
            <p>Identify possible courses of action:</p>
            <ul>
              <li>What can we do?</li>
              <li>What are the alternatives?</li>
              <li>Including option to do nothing/wait</li>
            </ul>

            <h3>R - Risks & Benefits</h3>
            <p>Evaluate each option:</p>
            <ul>
              <li>What are the risks of each option?</li>
              <li>What are the benefits?</li>
              <li>What could go wrong?</li>
            </ul>

            <h3>D - Decide</h3>
            <p>Make the decision:</p>
            <ul>
              <li>Select the best option</li>
              <li>Commit to it</li>
              <li>Don't second-guess without new information</li>
            </ul>

            <h3>E - Execute</h3>
            <p>Implement the decision:</p>
            <ul>
              <li>Brief the team</li>
              <li>Assign tasks</li>
              <li>Take action</li>
            </ul>

            <h3>C - Check</h3>
            <p>Monitor the outcome:</p>
            <ul>
              <li>Is the decision working?</li>
              <li>Are expected results occurring?</li>
              <li>Do we need to adjust?</li>
            </ul>

            <div class="example">
              <h4>Example: Battery Warning</h4>
              <p><strong>F:</strong> 30% battery, 8 min flight to complete area</p>
              <p><strong>O:</strong> Continue, RTH now, partial coverage</p>
              <p><strong>R:</strong> Continue risks forced landing; RTH is safe but incomplete; partial may suffice</p>
              <p><strong>D:</strong> RTH now, battery margin is primary</p>
              <p><strong>E:</strong> Initiating RTH, informing VO</p>
              <p><strong>C:</strong> Monitoring battery, confirming RTH progress</p>
            </div>
          `,
          sequence: 2,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'FORDEC: Facts, Options, Risks, Decide, Execute, Check',
            'Systematic approach when time allows',
            'Include the Check step to monitor outcomes'
          ],
          xpReward: 35,
          isActive: true
        },
        {
          id: 'lesson_crm_decision_traps',
          questId: 'quest_crm_decision',
          slug: 'decision-traps',
          title: 'Decision Traps',
          content: `
            <h2>Decision Traps</h2>
            <p>Several cognitive biases and traps can lead to poor decisions. Recognizing them is the first step to avoiding them.</p>

            <h3>Common Decision Traps</h3>
            <ul>
              <li><strong>Confirmation Bias:</strong> Seeking information that confirms existing belief</li>
              <li><strong>Plan Continuation:</strong> Sticking with plan despite changing conditions</li>
              <li><strong>Get-There-Itis:</strong> Pressure to complete mission overrides caution</li>
              <li><strong>Sunk Cost:</strong> "We've come this far..." continuing based on past investment</li>
              <li><strong>Group Think:</strong> Conforming to team consensus without evaluation</li>
              <li><strong>Anchoring:</strong> Over-relying on first piece of information</li>
            </ul>

            <h3>The "Hazardous Attitudes"</h3>
            <p>Classic attitudes that lead to poor decisions:</p>
            <ul>
              <li><strong>Anti-Authority:</strong> "Don't tell me what to do"</li>
              <li><strong>Impulsivity:</strong> "Do something quickly"</li>
              <li><strong>Invulnerability:</strong> "It won't happen to me"</li>
              <li><strong>Macho:</strong> "I can do it"</li>
              <li><strong>Resignation:</strong> "What's the point?"</li>
            </ul>

            <h3>Countermeasures</h3>
            <ul>
              <li>Actively seek disconfirming information</li>
              <li>Set decision gates in advance ("If X happens, we abort")</li>
              <li>Designate a devil's advocate</li>
              <li>Use checklists and procedures</li>
              <li>Encourage team challenge</li>
              <li>Take time if available</li>
            </ul>

            <div class="warning">
              <h4>The Most Dangerous Trap</h4>
              <p>Plan continuation bias has caused numerous accidents where crews continued into worsening conditions because "we've made it before" or "we're almost there."</p>
            </div>
          `,
          sequence: 3,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Multiple biases affect decisions',
            'Hazardous attitudes are predictable',
            'Use countermeasures actively'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_crm_time_critical',
          questId: 'quest_crm_decision',
          slug: 'time-critical-decisions',
          title: 'Time-Critical Decisions',
          content: `
            <h2>Making Decisions Under Time Pressure</h2>
            <p>Some situations don't allow for lengthy analysis. Time-critical decisions require a different approach.</p>

            <h3>When Time is Critical</h3>
            <ul>
              <li>Emergencies (fire, flyaway, collision risk)</li>
              <li>Rapidly changing conditions</li>
              <li>Immediate safety threats</li>
              <li>Seconds or minutes available, not hours</li>
            </ul>

            <h3>Time-Critical Decision Principles</h3>
            <ol>
              <li><strong>Act now, perfect later:</strong> Good-enough decision now beats perfect decision too late</li>
              <li><strong>Default to safety:</strong> When uncertain, choose the safer option</li>
              <li><strong>Use trained responses:</strong> This is why we drill emergencies</li>
              <li><strong>Trust your gut:</strong> Intuition is rapid pattern matching</li>
              <li><strong>Announce and act:</strong> Say what you're doing as you do it</li>
            </ol>

            <h3>The 80% Solution</h3>
            <p>If a decision is 80% right, execute it. Waiting for 100% may mean waiting too long.</p>

            <h3>After Time-Critical Decisions</h3>
            <ul>
              <li>Reassess once immediate threat is managed</li>
              <li>Can you improve the decision now?</li>
              <li>Inform team of what was decided and why</li>
              <li>Debrief later to learn from the experience</li>
            </ul>

            <div class="key-takeaway">
              <h4>Key Takeaway</h4>
              <p>In emergencies, take action. The worst outcome is often no decision at all. Trust your training, make a call, and be ready to adapt.</p>
            </div>
          `,
          sequence: 4,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Good-enough now beats perfect too late',
            'Default to safer option when uncertain',
            'Trust training and intuition'
          ],
          xpReward: 30,
          isActive: true
        }
      ]
    },

    // Quest 9: Leadership & Team Building
    {
      id: 'quest_crm_leadership',
      trackId: 'track_crm_expert',
      slug: 'leadership-team-building',
      title: 'Leadership & Team Building',
      description: 'Develop leadership skills and understand team dynamics for effective crew coordination.',
      sequence: 9,
      estimatedDuration: 25,
      difficulty: 'advanced',
      objectives: [
        'Apply appropriate leadership styles',
        'Understand team dynamics',
        'Resolve conflicts constructively'
      ],
      totalLessons: 3,
      xpReward: 100,
      hasQuiz: true,
      hasFinalAssessment: true,
      finalAssessmentQuestions: 25,
      isActive: true,
      lessons: [
        {
          id: 'lesson_crm_leadership_styles',
          questId: 'quest_crm_leadership',
          slug: 'leadership-styles',
          title: 'Leadership Styles',
          content: `
            <h2>Adaptive Leadership</h2>
            <p>Effective leaders adapt their style to the situation, team capability, and time available.</p>

            <h3>Leadership Styles Spectrum</h3>
            <ul>
              <li><strong>Authoritative:</strong> Leader decides, directs team
                <br/>Best for: Emergencies, time-critical, inexperienced team</li>
              <li><strong>Consultative:</strong> Leader decides after seeking input
                <br/>Best for: Complex decisions, experienced team, moderate time</li>
              <li><strong>Participative:</strong> Team decides together
                <br/>Best for: Planning, building commitment, ample time</li>
              <li><strong>Delegative:</strong> Team member decides
                <br/>Best for: Expert team members, routine tasks</li>
            </ul>

            <h3>Leadership Functions</h3>
            <ul>
              <li><strong>Task Functions:</strong> Planning, organizing, directing, monitoring</li>
              <li><strong>Team Functions:</strong> Supporting, motivating, communicating, developing</li>
            </ul>
            <p>Both are necessary; balance depends on situation.</p>

            <h3>PIC Leadership</h3>
            <p>The Pilot-in-Command is always responsible for the flight, but good PIC leadership:</p>
            <ul>
              <li>Sets clear expectations and standards</li>
              <li>Creates climate where speaking up is expected</li>
              <li>Actively seeks input and feedback</li>
              <li>Makes decisions when required</li>
              <li>Supports team members</li>
              <li>Debriefs and promotes learning</li>
            </ul>

            <div class="key-concept">
              <h4>Authority vs. Leadership</h4>
              <p>Authority comes from position. Leadership is earned through competence, communication, and care for the team.</p>
            </div>
          `,
          sequence: 1,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Adapt leadership style to situation',
            'Balance task and team functions',
            'PIC responsibility includes leadership duties'
          ],
          xpReward: 35,
          isActive: true
        },
        {
          id: 'lesson_crm_team_dynamics',
          questId: 'quest_crm_leadership',
          slug: 'team-dynamics',
          title: 'Team Dynamics',
          content: `
            <h2>Understanding Team Dynamics</h2>
            <p>Teams are more than collections of individuals. Understanding team dynamics helps create high-performing crews.</p>

            <h3>Stages of Team Development</h3>
            <ol>
              <li><strong>Forming:</strong> Team comes together, polite, tentative</li>
              <li><strong>Storming:</strong> Conflict emerges, roles negotiated</li>
              <li><strong>Norming:</strong> Standards established, cohesion develops</li>
              <li><strong>Performing:</strong> Effective, focused, productive</li>
            </ol>
            <p>Note: RPAS crews often work together briefly, so rapid team formation is key.</p>

            <h3>Building Effective Teams</h3>
            <ul>
              <li><strong>Clear Roles:</strong> Everyone knows their responsibilities</li>
              <li><strong>Shared Goals:</strong> Common understanding of success</li>
              <li><strong>Open Communication:</strong> Information flows freely</li>
              <li><strong>Mutual Trust:</strong> Confidence in each other's competence</li>
              <li><strong>Accountability:</strong> Each person owns their contribution</li>
            </ul>

            <h3>Team Briefings</h3>
            <p>Effective briefings establish the team quickly:</p>
            <ul>
              <li>State mission objectives</li>
              <li>Assign roles clearly</li>
              <li>Identify known threats</li>
              <li>Review contingencies</li>
              <li>Invite questions and concerns</li>
              <li>Set communication expectations</li>
            </ul>

            <div class="think-about-it">
              <h4>Think About It</h4>
              <p>What makes your best crew experiences different from your worst? Usually it comes down to team dynamics, not technical skill.</p>
            </div>
          `,
          sequence: 2,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Teams develop through stages',
            'Clear roles, goals, and communication are essential',
            'Briefings establish team rapidly'
          ],
          xpReward: 35,
          isActive: true
        },
        {
          id: 'lesson_crm_conflict',
          questId: 'quest_crm_leadership',
          slug: 'conflict-resolution',
          title: 'Conflict Resolution',
          content: `
            <h2>Managing Conflict</h2>
            <p>Conflict is natural in teams—it's not always bad. How conflict is managed determines whether it helps or harms the team.</p>

            <h3>Types of Conflict</h3>
            <ul>
              <li><strong>Task Conflict:</strong> Disagreement about what to do
                <br/>Can be healthy—leads to better decisions</li>
              <li><strong>Process Conflict:</strong> Disagreement about how to do it
                <br/>Moderate levels can improve efficiency</li>
              <li><strong>Relationship Conflict:</strong> Personal friction
                <br/>Usually harmful—should be minimized</li>
            </ul>

            <h3>Conflict Resolution Approaches</h3>
            <ul>
              <li><strong>Collaborating:</strong> Work together to find win-win (best when time allows)</li>
              <li><strong>Compromising:</strong> Each side gives something (quick resolution)</li>
              <li><strong>Accommodating:</strong> Give in to maintain relationship (when issue is minor)</li>
              <li><strong>Competing:</strong> Assert your position (when safety is at stake)</li>
              <li><strong>Avoiding:</strong> Postpone the conflict (when emotions are high)</li>
            </ul>

            <h3>During Operations</h3>
            <ul>
              <li>Safety concerns override all else</li>
              <li>Focus on the task, not the person</li>
              <li>Defer complex discussions to debrief</li>
              <li>PIC decides if impasse reached</li>
            </ul>

            <h3>After Operations</h3>
            <ul>
              <li>Address issues in debrief</li>
              <li>Focus on behavior, not personality</li>
              <li>Seek to understand before being understood</li>
              <li>Find common ground</li>
              <li>Agree on path forward</li>
            </ul>

            <div class="key-takeaway">
              <h4>Congratulations!</h4>
              <p>You've completed the Crew Resource Management track! These skills are not separate from flying—they ARE flying. Apply them in every operation.</p>
            </div>
          `,
          sequence: 3,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Task conflict can be healthy; relationship conflict is harmful',
            'Match resolution approach to situation',
            'During operations, safety overrides all'
          ],
          xpReward: 30,
          isActive: true
        }
      ]
    }
  ]
}

export default crmTrack
