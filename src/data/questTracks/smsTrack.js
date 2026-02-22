/**
 * Safety Management Systems (SMS) Quest Track
 *
 * Foundation training for all operators covering SMS principles,
 * safety culture, risk assessment, and hazard identification.
 *
 * Source: SMS_Training_Program_ENHANCED_V2.docx
 *
 * @version 1.0.0
 */

const smsTrack = {
  id: 'track_sms_foundation',
  slug: 'safety-management-systems',
  name: 'Safety Management Systems',
  description: 'Master the fundamentals of Safety Management Systems (SMS) including safety culture, risk assessment, hazard identification, and continuous improvement. This foundational track is essential for all RPAS operators.',
  category: 'safety',
  icon: 'Shield',
  color: 'emerald',
  totalQuests: 8,
  totalLessons: 27,
  totalXp: 800,
  estimatedHours: 5,
  difficulty: 'intermediate',
  prerequisites: [],
  requiredForRoles: ['operator', 'pilot', 'management'],
  badge: {
    id: 'badge_sms_foundation',
    name: 'SMS Foundation',
    description: 'Completed the Safety Management Systems training track',
    rarity: 'epic',
    icon: 'Shield',
    color: 'emerald',
    xpBonus: 200
  },
  isActive: true,
  version: '1.0.0',
  quests: [
    // Quest 1: Introduction to SMS
    {
      id: 'quest_sms_intro',
      trackId: 'track_sms_foundation',
      slug: 'introduction-to-sms',
      title: 'Introduction to SMS',
      description: 'Understand the evolution of safety thinking and why SMS is critical for modern aviation operations.',
      sequence: 1,
      estimatedDuration: 25,
      difficulty: 'beginner',
      objectives: [
        'Explain the evolution of safety thinking in aviation',
        'Describe the three ages of safety',
        'Articulate why SMS matters for RPAS operations'
      ],
      keyPoints: [
        'SMS is a systematic approach to managing safety',
        'Safety has evolved from reactive to proactive',
        'SMS integrates safety into daily operations'
      ],
      totalLessons: 3,
      xpReward: 75,
      hasQuiz: true,
      hasScenario: false,
      isActive: true,
      lessons: [
        {
          id: 'lesson_sms_evolution',
          questId: 'quest_sms_intro',
          slug: 'evolution-of-safety-thinking',
          title: 'Evolution of Safety Thinking',
          content: `
            <h2>The Journey to Modern Safety Management</h2>
            <p>Safety management in aviation has undergone a remarkable transformation over the past century. Understanding this evolution helps us appreciate why SMS represents the most effective approach to managing safety in modern RPAS operations.</p>

            <div class="key-concept">
              <h3>Key Concept</h3>
              <p><strong>Safety Management System (SMS)</strong> is a systematic, proactive, and integrated approach to managing safety risks in an organization.</p>
            </div>

            <h3>The Evolution Timeline</h3>
            <ul>
              <li><strong>1900s-1960s:</strong> Technical Era - Focus on equipment reliability</li>
              <li><strong>1970s-1990s:</strong> Human Factors Era - Focus on human error</li>
              <li><strong>2000s-Present:</strong> Organizational Era - Focus on systems and culture</li>
            </ul>

            <h3>Why This Matters for RPAS</h3>
            <p>As RPAS operations become more complex and integrated into the national airspace, we need a robust system to identify, assess, and mitigate risks before they become incidents.</p>

            <div class="think-about-it">
              <h4>Think About It</h4>
              <p>Consider a near-miss event you've experienced or heard about. How would each era's approach have addressed it differently?</p>
            </div>
          `,
          sequence: 1,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'SMS evolved from reactive to proactive safety management',
            'Three distinct eras shaped modern safety thinking',
            'RPAS operations require systematic safety approaches'
          ],
          regulatoryRefs: [
            { type: 'CAR', reference: 'CAR 107', section: 'SMS Requirements' }
          ],
          xpReward: 20,
          isActive: true
        },
        {
          id: 'lesson_sms_three_ages',
          questId: 'quest_sms_intro',
          slug: 'the-three-ages-of-safety',
          title: 'The Three Ages of Safety',
          content: `
            <h2>Understanding the Three Ages of Safety</h2>
            <p>The International Civil Aviation Organization (ICAO) identifies three distinct ages in the evolution of aviation safety. Each age represents a shift in how we think about and manage safety.</p>

            <h3>Age 1: The Technical Age (1900s-1960s)</h3>
            <p>During this era, accidents were primarily attributed to technical failures and equipment malfunctions.</p>
            <ul>
              <li>Focus on improving aircraft design and reliability</li>
              <li>Development of maintenance standards</li>
              <li>Introduction of airworthiness requirements</li>
            </ul>
            <p><strong>Limitation:</strong> As technology improved, accidents still occurred due to other factors.</p>

            <h3>Age 2: The Human Factors Age (1970s-1990s)</h3>
            <p>Recognition that human error was a major contributor to accidents led to a focus on the human element.</p>
            <ul>
              <li>Development of Crew Resource Management (CRM)</li>
              <li>Human factors training programs</li>
              <li>Cockpit automation and design improvements</li>
            </ul>
            <p><strong>Limitation:</strong> Blaming individuals for "human error" didn't address systemic issues.</p>

            <h3>Age 3: The Organizational Age (2000s-Present)</h3>
            <p>Modern safety thinking recognizes that safety is an emergent property of complex organizational systems.</p>
            <ul>
              <li>Focus on organizational culture and systems</li>
              <li>Proactive hazard identification</li>
              <li>Just Culture principles</li>
              <li>Safety Management Systems (SMS)</li>
            </ul>

            <div class="key-takeaway">
              <h4>Key Takeaway</h4>
              <p>Each age built upon the lessons of the previous one. Modern SMS incorporates technical excellence, human factors awareness, AND organizational systems thinking.</p>
            </div>
          `,
          sequence: 2,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'Technical Age focused on equipment reliability',
            'Human Factors Age addressed human error',
            'Organizational Age takes a systems approach'
          ],
          regulatoryRefs: [
            { type: 'ICAO', reference: 'Doc 9859', section: 'Safety Management Manual' }
          ],
          xpReward: 25,
          isActive: true
        },
        {
          id: 'lesson_sms_why_matters',
          questId: 'quest_sms_intro',
          slug: 'why-sms-matters',
          title: 'Why SMS Matters',
          content: `
            <h2>The Importance of SMS for RPAS Operations</h2>
            <p>Safety Management Systems aren't just a regulatory requirement—they're a competitive advantage and an ethical imperative for RPAS operators.</p>

            <h3>Regulatory Requirements</h3>
            <p>Transport Canada and ICAO require SMS implementation for aviation operators. For RPAS, this includes:</p>
            <ul>
              <li>Documented safety policies and procedures</li>
              <li>Systematic hazard identification processes</li>
              <li>Risk assessment and mitigation</li>
              <li>Safety assurance and continuous improvement</li>
            </ul>

            <h3>Business Benefits</h3>
            <ul>
              <li><strong>Reduced Incidents:</strong> Proactive identification prevents accidents</li>
              <li><strong>Lower Insurance Costs:</strong> Demonstrated safety culture</li>
              <li><strong>Client Confidence:</strong> Professional safety management</li>
              <li><strong>Operational Efficiency:</strong> Standardized procedures</li>
            </ul>

            <h3>The RPAS Context</h3>
            <p>RPAS operations present unique safety challenges that SMS is designed to address:</p>
            <ul>
              <li>Remote operation removes pilot from immediate hazard observation</li>
              <li>Operations in diverse and dynamic environments</li>
              <li>Integration with manned aircraft and public spaces</li>
              <li>Rapidly evolving technology and regulations</li>
            </ul>

            <div class="real-world">
              <h4>Real-World Application</h4>
              <p>A robust SMS helped one RPAS operator identify that 40% of their incidents occurred during battery changes. Simple procedural changes reduced these incidents by 85%.</p>
            </div>
          `,
          sequence: 3,
          type: 'content',
          estimatedDuration: 7,
          keyPoints: [
            'SMS is required by Transport Canada for aviation operators',
            'SMS provides business and operational benefits',
            'RPAS operations have unique safety challenges addressed by SMS'
          ],
          regulatoryRefs: [
            { type: 'CAR', reference: 'CAR 107', section: 'SMS Implementation' }
          ],
          xpReward: 20,
          isActive: true
        }
      ]
    },

    // Quest 2: SMS Framework & Components
    {
      id: 'quest_sms_framework',
      trackId: 'track_sms_foundation',
      slug: 'sms-framework-components',
      title: 'SMS Framework & Components',
      description: 'Learn the four pillars of SMS and how they work together to create a comprehensive safety management system.',
      sequence: 2,
      estimatedDuration: 35,
      difficulty: 'intermediate',
      objectives: [
        'Identify the four pillars of SMS',
        'Explain safety policy and objectives',
        'Describe safety risk management processes',
        'Understand safety assurance requirements'
      ],
      totalLessons: 4,
      xpReward: 100,
      hasQuiz: true,
      hasScenario: false,
      isActive: true,
      lessons: [
        {
          id: 'lesson_sms_four_pillars',
          questId: 'quest_sms_framework',
          slug: 'four-pillars-of-sms',
          title: 'Four Pillars of SMS',
          content: `
            <h2>The Four Pillars of Safety Management</h2>
            <p>A complete SMS is built on four interconnected pillars. Each pillar supports the others, creating a robust safety management framework.</p>

            <div class="pillars-overview">
              <div class="pillar">
                <h3>1. Safety Policy & Objectives</h3>
                <p>Management commitment and organizational safety goals</p>
              </div>
              <div class="pillar">
                <h3>2. Safety Risk Management</h3>
                <p>Hazard identification, risk assessment, and mitigation</p>
              </div>
              <div class="pillar">
                <h3>3. Safety Assurance</h3>
                <p>Monitoring, measurement, and continuous improvement</p>
              </div>
              <div class="pillar">
                <h3>4. Safety Promotion</h3>
                <p>Training, communication, and safety culture</p>
              </div>
            </div>

            <h3>How the Pillars Interact</h3>
            <p>The four pillars don't operate in isolation—they form an integrated system:</p>
            <ul>
              <li><strong>Policy</strong> sets the direction and commitment</li>
              <li><strong>Risk Management</strong> identifies and addresses hazards</li>
              <li><strong>Assurance</strong> verifies the system is working</li>
              <li><strong>Promotion</strong> builds the culture that sustains it all</li>
            </ul>

            <div class="key-concept">
              <h4>Remember: PRSP</h4>
              <p><strong>P</strong>olicy - <strong>R</strong>isk Management - <strong>S</strong>afety Assurance - <strong>P</strong>romotion</p>
            </div>
          `,
          sequence: 1,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'SMS has four interconnected pillars',
            'Each pillar supports and enhances the others',
            'All four pillars are required for effective SMS'
          ],
          xpReward: 25,
          isActive: true
        },
        {
          id: 'lesson_sms_policy_objectives',
          questId: 'quest_sms_framework',
          slug: 'safety-policy-objectives',
          title: 'Safety Policy & Objectives',
          content: `
            <h2>Pillar 1: Safety Policy & Objectives</h2>
            <p>The first pillar establishes the organizational commitment to safety and sets clear, measurable safety objectives.</p>

            <h3>Components of Safety Policy</h3>
            <ul>
              <li><strong>Management Commitment:</strong> Signed commitment from senior management</li>
              <li><strong>Safety Accountabilities:</strong> Clear roles and responsibilities</li>
              <li><strong>Safety Reporting:</strong> Non-punitive reporting systems</li>
              <li><strong>Key Safety Personnel:</strong> Designated safety roles</li>
              <li><strong>Emergency Response:</strong> Planning and procedures</li>
              <li><strong>Documentation:</strong> SMS manual and records</li>
            </ul>

            <h3>Setting Safety Objectives</h3>
            <p>Effective safety objectives are <strong>SMART</strong>:</p>
            <ul>
              <li><strong>S</strong>pecific - Clear and well-defined</li>
              <li><strong>M</strong>easurable - Can be tracked and quantified</li>
              <li><strong>A</strong>chievable - Realistic given resources</li>
              <li><strong>R</strong>elevant - Aligned with operations</li>
              <li><strong>T</strong>ime-bound - Have target dates</li>
            </ul>

            <div class="example">
              <h4>Example Safety Objective</h4>
              <p>"Reduce battery-related incidents by 50% within 12 months through enhanced pre-flight inspection procedures and operator training."</p>
            </div>
          `,
          sequence: 2,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'Management commitment is essential for SMS success',
            'Clear accountabilities define who is responsible for what',
            'Safety objectives should be SMART'
          ],
          xpReward: 25,
          isActive: true
        },
        {
          id: 'lesson_sms_risk_management',
          questId: 'quest_sms_framework',
          slug: 'safety-risk-management',
          title: 'Safety Risk Management',
          content: `
            <h2>Pillar 2: Safety Risk Management</h2>
            <p>Safety Risk Management (SRM) is the core operational component of SMS. It's where hazards are identified, risks are assessed, and controls are implemented.</p>

            <h3>The SRM Process</h3>
            <ol>
              <li><strong>Hazard Identification:</strong> Systematically identify hazards</li>
              <li><strong>Risk Analysis:</strong> Assess probability and severity</li>
              <li><strong>Risk Assessment:</strong> Determine risk acceptability</li>
              <li><strong>Risk Control:</strong> Implement mitigation measures</li>
              <li><strong>Risk Monitoring:</strong> Track effectiveness</li>
            </ol>

            <h3>Hazard Identification Methods</h3>
            <ul>
              <li>Voluntary reporting systems</li>
              <li>Safety surveys and audits</li>
              <li>Incident/accident investigation</li>
              <li>Operational data analysis</li>
              <li>Industry intelligence</li>
            </ul>

            <h3>Risk Assessment Matrix</h3>
            <p>Risks are typically assessed using a matrix that considers:</p>
            <ul>
              <li><strong>Probability:</strong> How likely is the event?</li>
              <li><strong>Severity:</strong> How bad would the consequences be?</li>
            </ul>

            <div class="key-takeaway">
              <h4>Key Takeaway</h4>
              <p>Risk management is not about eliminating all risks—it's about understanding them and managing them to an acceptable level.</p>
            </div>
          `,
          sequence: 3,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'SRM is a five-step process',
            'Multiple methods exist for hazard identification',
            'Risk assessment considers probability and severity'
          ],
          regulatoryRefs: [
            { type: 'SORA', reference: 'SORA 2.5', section: 'Risk Assessment' }
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_sms_assurance',
          questId: 'quest_sms_framework',
          slug: 'safety-assurance',
          title: 'Safety Assurance',
          content: `
            <h2>Pillar 3: Safety Assurance</h2>
            <p>Safety Assurance ensures that the SMS is working as intended and continuously improving. It's the feedback loop that validates the system.</p>

            <h3>Components of Safety Assurance</h3>
            <ul>
              <li><strong>Safety Performance Monitoring:</strong> Track safety indicators</li>
              <li><strong>Management of Change:</strong> Assess impacts of changes</li>
              <li><strong>Continuous Improvement:</strong> Use data to enhance safety</li>
              <li><strong>Internal Safety Audits:</strong> Regular system reviews</li>
            </ul>

            <h3>Safety Performance Indicators (SPIs)</h3>
            <p>SPIs are measurable values that help track safety performance:</p>
            <ul>
              <li><strong>Lagging Indicators:</strong> Measure past events (incidents, accidents)</li>
              <li><strong>Leading Indicators:</strong> Predict future performance (training completion, audit findings)</li>
            </ul>

            <h3>Management of Change</h3>
            <p>Any change to operations, equipment, or procedures requires safety assessment:</p>
            <ul>
              <li>New aircraft or equipment</li>
              <li>New operating environments</li>
              <li>Changes to procedures</li>
              <li>Organizational changes</li>
            </ul>

            <div class="think-about-it">
              <h4>Think About It</h4>
              <p>What leading indicators could you track in your operations to predict safety performance before incidents occur?</p>
            </div>
          `,
          sequence: 4,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Safety assurance validates the SMS is working',
            'Both leading and lagging indicators should be tracked',
            'All changes require safety assessment'
          ],
          xpReward: 25,
          isActive: true
        }
      ]
    },

    // Quest 3: Safety Culture & Just Culture
    {
      id: 'quest_sms_culture',
      trackId: 'track_sms_foundation',
      slug: 'safety-culture-just-culture',
      title: 'Safety Culture & Just Culture',
      description: 'Explore the human and organizational elements that make SMS effective, including safety culture and just culture principles.',
      sequence: 3,
      estimatedDuration: 30,
      difficulty: 'intermediate',
      objectives: [
        'Define safety culture and its components',
        'Explain Just Culture principles',
        'Balance accountability with learning'
      ],
      totalLessons: 3,
      xpReward: 100,
      hasQuiz: true,
      hasScenario: true,
      scenarioId: 'scenario_sms_near_miss',
      isActive: true,
      lessons: [
        {
          id: 'lesson_sms_safety_culture',
          questId: 'quest_sms_culture',
          slug: 'what-is-safety-culture',
          title: 'What is Safety Culture?',
          content: `
            <h2>Understanding Safety Culture</h2>
            <p>Safety culture is the set of shared values, attitudes, and behaviors that shape how safety is perceived and practiced within an organization.</p>

            <h3>Components of a Positive Safety Culture</h3>
            <ul>
              <li><strong>Informed Culture:</strong> People understand hazards and risks</li>
              <li><strong>Reporting Culture:</strong> People feel safe reporting issues</li>
              <li><strong>Learning Culture:</strong> Organization learns from events</li>
              <li><strong>Just Culture:</strong> Fair treatment of those involved in incidents</li>
              <li><strong>Flexible Culture:</strong> Adapts to changing conditions</li>
            </ul>

            <h3>Signs of a Strong Safety Culture</h3>
            <ul>
              <li>Leadership visibly prioritizes safety</li>
              <li>Open communication about safety concerns</li>
              <li>Willingness to report near-misses</li>
              <li>Learning from incidents, not just blame</li>
              <li>Safety considerations in all decisions</li>
            </ul>

            <h3>Signs of a Weak Safety Culture</h3>
            <ul>
              <li>Production pressure overrides safety</li>
              <li>Fear of reporting errors</li>
              <li>Blame-focused incident response</li>
              <li>Safety seen as "someone else's job"</li>
              <li>Normalization of deviance</li>
            </ul>

            <div class="warning">
              <h4>Warning: Normalization of Deviance</h4>
              <p>When unsafe practices become "normal" because nothing bad has happened yet, the organization is at serious risk. Past success is not a safety case.</p>
            </div>
          `,
          sequence: 1,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'Safety culture is built from five sub-cultures',
            'Culture is demonstrated through daily behaviors',
            'Normalization of deviance is a critical risk'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_sms_just_culture',
          questId: 'quest_sms_culture',
          slug: 'just-culture-principles',
          title: 'Just Culture Principles',
          content: `
            <h2>Just Culture: Balancing Accountability and Learning</h2>
            <p>Just Culture is an approach that acknowledges human fallibility while maintaining appropriate accountability. It's essential for encouraging honest reporting.</p>

            <h3>The Core Principle</h3>
            <p>Just Culture recognizes that not all errors are equal. It distinguishes between:</p>
            <ul>
              <li><strong>Honest Mistakes:</strong> Unintentional errors despite best efforts</li>
              <li><strong>At-Risk Behavior:</strong> Taking shortcuts or bending rules</li>
              <li><strong>Reckless Behavior:</strong> Conscious disregard for substantial risk</li>
            </ul>

            <h3>The Just Culture Algorithm</h3>
            <p>When evaluating behavior, ask:</p>
            <ol>
              <li>Was there intent to cause harm?</li>
              <li>Were drugs or alcohol involved?</li>
              <li>Did the person knowingly violate procedures?</li>
              <li>Would a similarly trained person act the same way?</li>
              <li>Does the person have a history of similar issues?</li>
            </ol>

            <h3>Why Just Culture Matters</h3>
            <ul>
              <li><strong>Encourages Reporting:</strong> People report when they feel safe</li>
              <li><strong>Enables Learning:</strong> We learn from honest reporting</li>
              <li><strong>Maintains Accountability:</strong> Reckless behavior is addressed</li>
              <li><strong>Builds Trust:</strong> Consistent, fair treatment</li>
            </ul>

            <div class="key-concept">
              <h4>The Key Question</h4>
              <p>When evaluating behavior, ask: "Would another competent person, in the same situation, likely make the same error?"</p>
            </div>
          `,
          sequence: 2,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'Just Culture distinguishes between error types',
            'Not all errors warrant the same response',
            'Fair treatment encourages honest reporting'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_sms_balancing',
          questId: 'quest_sms_culture',
          slug: 'balancing-accountability',
          title: 'Balancing Accountability',
          content: `
            <h2>Finding the Balance</h2>
            <p>One of the greatest challenges in safety management is balancing the need for accountability with the need for open reporting and learning.</p>

            <h3>The Accountability Spectrum</h3>
            <p>Responses to safety events should be proportional to the behavior:</p>

            <table class="response-table">
              <tr>
                <th>Behavior Type</th>
                <th>Appropriate Response</th>
              </tr>
              <tr>
                <td>Honest Mistake</td>
                <td>Console, support, system improvement</td>
              </tr>
              <tr>
                <td>At-Risk Behavior</td>
                <td>Coach, correct, address system factors</td>
              </tr>
              <tr>
                <td>Reckless Behavior</td>
                <td>Disciplinary action, possible removal</td>
              </tr>
            </table>

            <h3>System vs. Individual Focus</h3>
            <p>Most errors have both individual and system components:</p>
            <ul>
              <li>What did the individual do or fail to do?</li>
              <li>What system conditions enabled or encouraged the error?</li>
              <li>How can both be addressed to prevent recurrence?</li>
            </ul>

            <h3>Building Trust Through Consistency</h3>
            <ul>
              <li>Apply principles consistently to all levels</li>
              <li>Be transparent about decision-making process</li>
              <li>Follow through on system improvements</li>
              <li>Recognize and reward reporting</li>
            </ul>

            <div class="real-world">
              <h4>Real-World Application</h4>
              <p>When a pilot reports a checklist deviation that could have caused a battery fire, the focus should be on: Why did the checklist not prevent this? What can we change to make the right thing easier?</p>
            </div>
          `,
          sequence: 3,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Response should match the behavior type',
            'Address both individual and system factors',
            'Consistent application builds trust'
          ],
          xpReward: 25,
          isActive: true
        }
      ]
    },

    // Quest 4: High Reliability Organizations
    {
      id: 'quest_sms_hro',
      trackId: 'track_sms_foundation',
      slug: 'high-reliability-organizations',
      title: 'High Reliability Organizations',
      description: 'Learn from organizations that achieve exceptional safety performance despite operating in high-risk environments.',
      sequence: 4,
      estimatedDuration: 25,
      difficulty: 'intermediate',
      objectives: [
        'Identify HRO characteristics',
        'Explain preoccupation with failure',
        'Describe deference to expertise'
      ],
      totalLessons: 3,
      xpReward: 90,
      hasQuiz: true,
      hasScenario: false,
      isActive: true,
      lessons: [
        {
          id: 'lesson_sms_hro_principles',
          questId: 'quest_sms_hro',
          slug: 'hro-principles',
          title: 'HRO Principles',
          content: `
            <h2>What Makes an Organization Highly Reliable?</h2>
            <p>High Reliability Organizations (HROs) are organizations that operate in high-risk environments but achieve remarkably low rates of adverse events. Examples include nuclear power plants, aircraft carriers, and air traffic control.</p>

            <h3>The Five HRO Principles</h3>
            <ol>
              <li><strong>Preoccupation with Failure:</strong> Treat near-misses as warnings, not successes</li>
              <li><strong>Reluctance to Simplify:</strong> Seek to understand complexity</li>
              <li><strong>Sensitivity to Operations:</strong> Maintain situational awareness</li>
              <li><strong>Commitment to Resilience:</strong> Develop capacity to recover</li>
              <li><strong>Deference to Expertise:</strong> Let knowledge guide decisions</li>
            </ol>

            <h3>HROs vs. Normal Organizations</h3>
            <ul>
              <li>HROs actively look for what could go wrong</li>
              <li>HROs value bad news and reward its delivery</li>
              <li>HROs empower front-line workers to act on safety</li>
              <li>HROs practice and prepare for emergencies</li>
            </ul>

            <div class="key-concept">
              <h4>The HRO Mindset</h4>
              <p>"It's not a matter of IF something will go wrong, but WHEN. Our job is to detect it early and respond effectively."</p>
            </div>
          `,
          sequence: 1,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'HROs achieve exceptional safety in high-risk environments',
            'Five key principles define HRO behavior',
            'HRO mindset assumes failures will occur'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_sms_preoccupation',
          questId: 'quest_sms_hro',
          slug: 'preoccupation-with-failure',
          title: 'Preoccupation with Failure',
          content: `
            <h2>Preoccupation with Failure</h2>
            <p>The first and perhaps most important HRO principle is a constant awareness that things can go wrong at any time.</p>

            <h3>What This Looks Like</h3>
            <ul>
              <li>Near-misses are investigated as seriously as accidents</li>
              <li>Small problems are seen as symptoms of larger issues</li>
              <li>Success doesn't breed complacency</li>
              <li>People are encouraged to voice concerns</li>
            </ul>

            <h3>The "Good Catch" Culture</h3>
            <p>HROs celebrate when potential problems are identified before they cause harm:</p>
            <ul>
              <li>Reward reporting of near-misses</li>
              <li>Share lessons learned widely</li>
              <li>Acknowledge those who speak up</li>
              <li>Act on reported concerns</li>
            </ul>

            <h3>Avoiding Complacency Traps</h3>
            <ul>
              <li>"We've never had a problem before" = We've been lucky</li>
              <li>"That could never happen here" = We're not looking</li>
              <li>"We've done it this way for years" = We've normalized deviance</li>
            </ul>

            <div class="think-about-it">
              <h4>Think About It</h4>
              <p>When was the last time you reported a near-miss? What made you report it (or not)?</p>
            </div>
          `,
          sequence: 2,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Near-misses are warning signs, not successes',
            'Good catches should be celebrated',
            'Complacency is the enemy of reliability'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_sms_deference',
          questId: 'quest_sms_hro',
          slug: 'deference-to-expertise',
          title: 'Deference to Expertise',
          content: `
            <h2>Deference to Expertise</h2>
            <p>In critical situations, HROs allow decision-making authority to migrate to whoever has the most expertise, regardless of rank or position.</p>

            <h3>Why Hierarchy Can Be Dangerous</h3>
            <ul>
              <li>Senior leaders may not have current operational knowledge</li>
              <li>Front-line workers see problems first</li>
              <li>Expertise isn't always correlated with position</li>
              <li>Emergency situations require rapid, informed decisions</li>
            </ul>

            <h3>Implementing Deference to Expertise</h3>
            <ul>
              <li><strong>Empower Stop Work Authority:</strong> Anyone can halt unsafe operations</li>
              <li><strong>Value Input:</strong> Actively seek opinions from all levels</li>
              <li><strong>Delegate Authority:</strong> Let experts make expert decisions</li>
              <li><strong>Train for Judgment:</strong> Develop expertise at all levels</li>
            </ul>

            <h3>In RPAS Operations</h3>
            <p>The pilot-in-command always has final authority for safe operation, even if others outrank them. Examples:</p>
            <ul>
              <li>PIC can abort a mission if safety is compromised</li>
              <li>Visual observers can call "land now" if they see danger</li>
              <li>Any crew member can report safety concerns without reprisal</li>
            </ul>

            <div class="key-takeaway">
              <h4>Key Takeaway</h4>
              <p>The person closest to the problem often has the best information to solve it. Effective safety systems create channels for that expertise to be heard and acted upon.</p>
            </div>
          `,
          sequence: 3,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Expertise should guide decisions, not hierarchy alone',
            'Stop work authority must be real and respected',
            'PIC authority is paramount in RPAS operations'
          ],
          xpReward: 25,
          isActive: true
        }
      ]
    },

    // Quest 5: Swiss Cheese Model
    {
      id: 'quest_sms_swiss_cheese',
      trackId: 'track_sms_foundation',
      slug: 'swiss-cheese-model',
      title: 'Swiss Cheese Model',
      description: 'Understand how accidents occur through multiple layers of defense and learn to identify latent failures.',
      sequence: 5,
      estimatedDuration: 30,
      difficulty: 'intermediate',
      objectives: [
        'Explain the Swiss Cheese Model',
        'Distinguish active and latent failures',
        'Identify methods to break the error chain'
      ],
      totalLessons: 3,
      xpReward: 100,
      hasQuiz: true,
      hasScenario: true,
      scenarioId: 'scenario_sms_chain_events',
      isActive: true,
      lessons: [
        {
          id: 'lesson_sms_latent_failures',
          questId: 'quest_sms_swiss_cheese',
          slug: 'understanding-latent-failures',
          title: 'Understanding Latent Failures',
          content: `
            <h2>The Swiss Cheese Model of Accident Causation</h2>
            <p>Developed by James Reason, the Swiss Cheese Model illustrates how accidents occur when multiple barriers fail simultaneously.</p>

            <h3>The Concept</h3>
            <p>Imagine slices of Swiss cheese stacked together:</p>
            <ul>
              <li>Each slice represents a layer of defense (procedures, training, equipment)</li>
              <li>Each hole represents a weakness or failure</li>
              <li>Accidents occur when holes align across multiple layers</li>
            </ul>

            <h3>Types of Failures</h3>
            <ul>
              <li><strong>Active Failures:</strong> Immediate, obvious errors by front-line operators</li>
              <li><strong>Latent Failures:</strong> Hidden weaknesses in the system (organizational factors, poor design, inadequate training)</li>
            </ul>

            <h3>The Danger of Latent Failures</h3>
            <p>Latent failures are particularly dangerous because:</p>
            <ul>
              <li>They exist before an accident occurs</li>
              <li>They're often created by people removed from operations</li>
              <li>They may persist undetected for years</li>
              <li>They create conditions for active failures</li>
            </ul>

            <div class="key-concept">
              <h4>Key Insight</h4>
              <p>Most accidents require both latent conditions AND active failures. Address the latent conditions, and you prevent multiple potential accidents.</p>
            </div>
          `,
          sequence: 1,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'The Swiss Cheese Model shows how defenses fail',
            'Active failures are immediate; latent failures are hidden',
            'Latent failures create conditions for active failures'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_sms_active_latent',
          questId: 'quest_sms_swiss_cheese',
          slug: 'active-vs-latent-errors',
          title: 'Active vs Latent Errors',
          content: `
            <h2>Distinguishing Active and Latent Errors</h2>
            <p>Understanding the difference between active and latent errors is crucial for effective safety management.</p>

            <h3>Active Errors</h3>
            <p>Actions (or inactions) by front-line operators that directly cause harm:</p>
            <ul>
              <li>Skipping a checklist item</li>
              <li>Misreading an instrument</li>
              <li>Incorrect control input</li>
              <li>Poor judgment in the moment</li>
            </ul>
            <p><strong>Characteristics:</strong> Immediate effect, easy to identify after the fact</p>

            <h3>Latent Errors</h3>
            <p>Organizational conditions that enable active errors or defeat defenses:</p>
            <ul>
              <li>Confusing procedures or checklists</li>
              <li>Inadequate training programs</li>
              <li>Poor equipment design</li>
              <li>Insufficient staffing</li>
              <li>Excessive production pressure</li>
              <li>Weak safety culture</li>
            </ul>
            <p><strong>Characteristics:</strong> Delayed effect, harder to identify, often systemic</p>

            <h3>The Investigation Focus</h3>
            <p>Traditional investigations often stop at active errors. Effective investigations dig deeper:</p>
            <ul>
              <li>Why did the person make that error?</li>
              <li>What conditions made the error possible?</li>
              <li>What defenses should have prevented harm?</li>
              <li>Why did those defenses fail?</li>
            </ul>

            <div class="example">
              <h4>Example Analysis</h4>
              <p><strong>Event:</strong> Pilot skipped battery voltage check (active error)</p>
              <p><strong>Latent factors:</strong></p>
              <ul>
                <li>Checklist was 3 pages long (design)</li>
                <li>Client was pressuring for quick takeoff (production pressure)</li>
                <li>Voltage gauge was hard to read in sunlight (equipment design)</li>
              </ul>
            </div>
          `,
          sequence: 2,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'Active errors have immediate, visible effects',
            'Latent errors are systemic and hidden',
            'Effective investigations look beyond active errors'
          ],
          xpReward: 35,
          isActive: true
        },
        {
          id: 'lesson_sms_breaking_chain',
          questId: 'quest_sms_swiss_cheese',
          slug: 'breaking-the-error-chain',
          title: 'Breaking the Error Chain',
          content: `
            <h2>Breaking the Error Chain</h2>
            <p>Once you understand how accidents develop through aligned failures, you can implement strategies to break the chain before harm occurs.</p>

            <h3>Defense Strategies</h3>
            <ol>
              <li><strong>Eliminate Hazards:</strong> Remove the source of risk entirely</li>
              <li><strong>Build Barriers:</strong> Add layers of protection</li>
              <li><strong>Improve Detection:</strong> Identify errors before they propagate</li>
              <li><strong>Enable Recovery:</strong> Allow correction after error detection</li>
              <li><strong>Mitigate Consequences:</strong> Reduce harm if error reaches outcome</li>
            </ol>

            <h3>Practical Error Chain Breakers</h3>
            <ul>
              <li><strong>Checklists:</strong> Catch errors before they matter</li>
              <li><strong>Cross-checks:</strong> Second person verification</li>
              <li><strong>Automation:</strong> Remove human error potential</li>
              <li><strong>Warning Systems:</strong> Alert before problems escalate</li>
              <li><strong>Training:</strong> Build skills to recognize and respond</li>
              <li><strong>Culture:</strong> Encourage speaking up</li>
            </ul>

            <h3>The "Last Defense" Mindset</h3>
            <p>In aviation, we often operate as the last line of defense:</p>
            <ul>
              <li>Assume other defenses may have failed</li>
              <li>Stay vigilant even when "everything is fine"</li>
              <li>Don't rely solely on technology or procedures</li>
              <li>Always have a plan B (and plan C)</li>
            </ul>

            <div class="real-world">
              <h4>Real-World Application</h4>
              <p>Before each flight, mentally ask: "What could go wrong today, and what will I do about it?" This preoccupation with potential failure is your personal error chain breaker.</p>
            </div>
          `,
          sequence: 3,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'Multiple strategies exist to break error chains',
            'Defenses should be layered and redundant',
            'Operate with a "last defense" mindset'
          ],
          xpReward: 30,
          isActive: true
        }
      ]
    },

    // Quest 6: Hazard Identification
    {
      id: 'quest_sms_hazard_id',
      trackId: 'track_sms_foundation',
      slug: 'hazard-identification',
      title: 'Hazard Identification',
      description: 'Learn systematic methods for identifying hazards before they become incidents.',
      sequence: 6,
      estimatedDuration: 35,
      difficulty: 'intermediate',
      objectives: [
        'Classify types of hazards',
        'Implement hazard reporting systems',
        'Apply proactive hazard identification methods'
      ],
      totalLessons: 4,
      xpReward: 110,
      hasQuiz: true,
      hasScenario: false,
      isActive: true,
      lessons: [
        {
          id: 'lesson_sms_hazard_types',
          questId: 'quest_sms_hazard_id',
          slug: 'types-of-hazards',
          title: 'Types of Hazards',
          content: `
            <h2>Understanding Hazard Types</h2>
            <p>A hazard is any condition, object, or activity that has the potential to cause harm. In RPAS operations, hazards fall into several categories.</p>

            <h3>Hazard Categories</h3>
            <ul>
              <li><strong>Environmental Hazards:</strong> Weather, terrain, wildlife, electromagnetic interference</li>
              <li><strong>Technical Hazards:</strong> Equipment failures, software issues, battery problems</li>
              <li><strong>Human Hazards:</strong> Fatigue, distraction, training gaps, complacency</li>
              <li><strong>Organizational Hazards:</strong> Inadequate procedures, production pressure, poor communication</li>
              <li><strong>External Hazards:</strong> Other aircraft, ground traffic, public interference</li>
            </ul>

            <h3>RPAS-Specific Hazards</h3>
            <ul>
              <li>Lost link scenarios</li>
              <li>Flyaway events</li>
              <li>GPS spoofing or jamming</li>
              <li>Obstacle collision (wires, towers)</li>
              <li>Prop strikes to people or animals</li>
              <li>Battery fires or failures</li>
              <li>Airspace conflicts</li>
            </ul>

            <h3>Hazard vs. Risk</h3>
            <p>It's important to distinguish:</p>
            <ul>
              <li><strong>Hazard:</strong> Something that CAN cause harm</li>
              <li><strong>Risk:</strong> The likelihood and severity of harm from that hazard</li>
            </ul>

            <div class="example">
              <h4>Example</h4>
              <p><strong>Hazard:</strong> Power lines near the operating area</p>
              <p><strong>Risk:</strong> Medium probability of collision if operating within 50m, with severe consequences</p>
            </div>
          `,
          sequence: 1,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Hazards fall into environmental, technical, human, organizational, and external categories',
            'RPAS operations have unique hazard profiles',
            'Hazard is potential for harm; risk includes probability and severity'
          ],
          xpReward: 25,
          isActive: true
        },
        {
          id: 'lesson_sms_reporting_systems',
          questId: 'quest_sms_hazard_id',
          slug: 'hazard-reporting-systems',
          title: 'Hazard Reporting Systems',
          content: `
            <h2>Building Effective Hazard Reporting Systems</h2>
            <p>A hazard reporting system is only effective if people actually use it. The key is creating a system that is easy, safe, and beneficial to use.</p>

            <h3>Characteristics of Effective Systems</h3>
            <ul>
              <li><strong>Easy to Use:</strong> Simple, accessible, quick to complete</li>
              <li><strong>Non-Punitive:</strong> No fear of negative consequences for honest reports</li>
              <li><strong>Confidential:</strong> Reporter identity protected when requested</li>
              <li><strong>Responsive:</strong> Reports are acknowledged and acted upon</li>
              <li><strong>Feedback Loop:</strong> Reporters see results of their reports</li>
            </ul>

            <h3>What Should Be Reported?</h3>
            <ul>
              <li>Near-misses and close calls</li>
              <li>Equipment malfunctions or anomalies</li>
              <li>Environmental hazards observed</li>
              <li>Procedural concerns or ambiguities</li>
              <li>Training or competency gaps</li>
              <li>Any safety concerns, however minor</li>
            </ul>

            <h3>Overcoming Reporting Barriers</h3>
            <ul>
              <li><strong>"Nothing happened"</strong> → Near-misses are valuable data</li>
              <li><strong>"It's not my job"</strong> → Everyone is responsible for safety</li>
              <li><strong>"I'll get in trouble"</strong> → Just Culture protects honest reporters</li>
              <li><strong>"It takes too long"</strong> → Simplify the process</li>
              <li><strong>"Nothing will change"</strong> → Demonstrate that reports lead to action</li>
            </ul>

            <div class="key-takeaway">
              <h4>Key Takeaway</h4>
              <p>The goal is to have more reports, not fewer. A spike in reports often indicates a healthy safety culture, not a dangerous operation.</p>
            </div>
          `,
          sequence: 2,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'Effective systems are easy, non-punitive, and responsive',
            'Near-misses are especially valuable reports',
            'More reports often indicate better safety culture'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_sms_proactive_id',
          questId: 'quest_sms_hazard_id',
          slug: 'proactive-hazard-identification',
          title: 'Proactive Hazard Identification',
          content: `
            <h2>Proactive Hazard Identification Methods</h2>
            <p>Rather than waiting for hazards to reveal themselves through incidents, proactive methods seek to identify them before harm occurs.</p>

            <h3>Proactive Methods</h3>
            <ul>
              <li><strong>Safety Surveys:</strong> Systematic observation of operations</li>
              <li><strong>Safety Audits:</strong> Formal review of compliance and effectiveness</li>
              <li><strong>Walk-arounds:</strong> Regular inspection of work areas and equipment</li>
              <li><strong>Job Safety Analysis:</strong> Breaking down tasks to identify hazards</li>
              <li><strong>What-If Analysis:</strong> Brainstorming potential failure modes</li>
              <li><strong>Data Analysis:</strong> Trend monitoring of operational data</li>
            </ul>

            <h3>Reactive vs. Proactive</h3>
            <p>A balanced approach uses both:</p>
            <ul>
              <li><strong>Reactive:</strong> Learning from incidents that have occurred</li>
              <li><strong>Proactive:</strong> Identifying hazards before incidents</li>
              <li><strong>Predictive:</strong> Using data to anticipate future risks</li>
            </ul>

            <h3>Pre-Flight Hazard ID</h3>
            <p>Every operation should include systematic hazard identification:</p>
            <ul>
              <li>Site survey and risk assessment</li>
              <li>Weather hazard evaluation</li>
              <li>Airspace hazard review</li>
              <li>Equipment condition check</li>
              <li>Crew fitness assessment</li>
            </ul>

            <div class="think-about-it">
              <h4>Think About It</h4>
              <p>What hazards might exist at your next operation that you haven't thought about before?</p>
            </div>
          `,
          sequence: 3,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'Proactive methods identify hazards before incidents',
            'Balance reactive, proactive, and predictive approaches',
            'Every operation requires systematic hazard identification'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_sms_hazard_analysis',
          questId: 'quest_sms_hazard_id',
          slug: 'hazard-analysis-tools',
          title: 'Hazard Analysis Tools',
          content: `
            <h2>Hazard Analysis Tools</h2>
            <p>Several structured tools help systematically analyze hazards and their potential consequences.</p>

            <h3>HAZOP (Hazard and Operability Study)</h3>
            <p>Structured brainstorming using guide words:</p>
            <ul>
              <li>What if there's MORE of something?</li>
              <li>What if there's LESS of something?</li>
              <li>What if there's NONE of something?</li>
              <li>What if there's the OPPOSITE?</li>
              <li>What if it happens SOONER or LATER?</li>
            </ul>

            <h3>Bow-Tie Analysis</h3>
            <p>Visual representation linking:</p>
            <ul>
              <li><strong>Threats:</strong> What could cause the hazard to become an incident</li>
              <li><strong>Top Event:</strong> The hazard being released</li>
              <li><strong>Consequences:</strong> What harm could result</li>
              <li><strong>Prevention barriers:</strong> Controls to prevent the event</li>
              <li><strong>Mitigation barriers:</strong> Controls to reduce consequences</li>
            </ul>

            <h3>FMEA (Failure Mode and Effects Analysis)</h3>
            <p>Systematic evaluation of:</p>
            <ul>
              <li>How could each component fail?</li>
              <li>What would be the effect of that failure?</li>
              <li>How severe would the consequences be?</li>
              <li>How likely is the failure mode?</li>
              <li>How detectable is the failure before harm?</li>
            </ul>

            <div class="key-concept">
              <h4>Choosing the Right Tool</h4>
              <p>Simple operations may only need basic checklists. Complex or novel operations benefit from more structured analysis methods.</p>
            </div>
          `,
          sequence: 4,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'HAZOP uses guide words to explore deviations',
            'Bow-Tie analysis visualizes threats and barriers',
            'FMEA systematically evaluates failure modes'
          ],
          xpReward: 25,
          isActive: true
        }
      ]
    },

    // Quest 7: Risk Assessment & Mitigation
    {
      id: 'quest_sms_risk_assessment',
      trackId: 'track_sms_foundation',
      slug: 'risk-assessment-mitigation',
      title: 'Risk Assessment & Mitigation',
      description: 'Master the process of assessing and mitigating risks using industry-standard methods.',
      sequence: 7,
      estimatedDuration: 40,
      difficulty: 'advanced',
      objectives: [
        'Apply risk matrices effectively',
        'Assess severity and probability',
        'Develop mitigation strategies',
        'Evaluate residual risk'
      ],
      totalLessons: 4,
      xpReward: 125,
      hasQuiz: true,
      hasScenario: true,
      scenarioId: 'scenario_sms_risky_mission',
      isActive: true,
      lessons: [
        {
          id: 'lesson_sms_risk_matrices',
          questId: 'quest_sms_risk_assessment',
          slug: 'risk-matrices',
          title: 'Risk Matrices',
          content: `
            <h2>Using Risk Matrices</h2>
            <p>A risk matrix is a visual tool that helps assess and communicate risk levels by combining probability and severity.</p>

            <h3>The 5x5 Risk Matrix</h3>
            <p>Most aviation organizations use a 5x5 matrix:</p>

            <h4>Severity Scale</h4>
            <ol>
              <li><strong>Negligible:</strong> No safety effect</li>
              <li><strong>Minor:</strong> Slight reduction in safety margins</li>
              <li><strong>Major:</strong> Significant reduction in safety margins</li>
              <li><strong>Hazardous:</strong> Large reduction in safety margins, serious injury</li>
              <li><strong>Catastrophic:</strong> Equipment destroyed, multiple deaths</li>
            </ol>

            <h4>Probability Scale</h4>
            <ol>
              <li><strong>Extremely Improbable:</strong> Almost inconceivable</li>
              <li><strong>Improbable:</strong> Very unlikely to occur</li>
              <li><strong>Remote:</strong> Unlikely but possible</li>
              <li><strong>Occasional:</strong> Likely to occur sometimes</li>
              <li><strong>Frequent:</strong> Likely to occur often</li>
            </ol>

            <h3>Risk Tolerance Zones</h3>
            <ul>
              <li><strong class="green">Acceptable:</strong> Risk is acceptable with monitoring</li>
              <li><strong class="yellow">Tolerable:</strong> Risk acceptable with mitigation</li>
              <li><strong class="red">Unacceptable:</strong> Risk must be reduced before proceeding</li>
            </ul>

            <div class="warning">
              <h4>Important</h4>
              <p>Risk matrices are tools to support decision-making, not replace it. Professional judgment is always required.</p>
            </div>
          `,
          sequence: 1,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            '5x5 matrix combines probability and severity',
            'Three zones: acceptable, tolerable, unacceptable',
            'Matrices support but don\'t replace judgment'
          ],
          regulatoryRefs: [
            { type: 'SORA', reference: 'SORA 2.5', section: 'GRC/ARC Assessment' }
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_sms_severity_probability',
          questId: 'quest_sms_risk_assessment',
          slug: 'severity-and-probability',
          title: 'Severity & Probability',
          content: `
            <h2>Assessing Severity and Probability</h2>
            <p>Accurate risk assessment requires careful evaluation of both how bad something could be and how likely it is to occur.</p>

            <h3>Assessing Severity</h3>
            <p>Consider the <strong>worst credible outcome</strong>:</p>
            <ul>
              <li>What harm could result to people?</li>
              <li>What damage could occur to property?</li>
              <li>What environmental impact could result?</li>
              <li>What operational/reputational impact could occur?</li>
            </ul>

            <h3>Assessing Probability</h3>
            <p>Consider all relevant factors:</p>
            <ul>
              <li>Historical data and incident rates</li>
              <li>Industry experience with similar operations</li>
              <li>Current conditions and context</li>
              <li>Effectiveness of existing controls</li>
              <li>Human reliability data</li>
            </ul>

            <h3>Common Assessment Errors</h3>
            <ul>
              <li><strong>Optimism bias:</strong> "It won't happen to me"</li>
              <li><strong>Recency bias:</strong> Overweighting recent events</li>
              <li><strong>Availability bias:</strong> Memorable events seem more likely</li>
              <li><strong>Wishful thinking:</strong> Rating based on desired outcome</li>
              <li><strong>Group think:</strong> Conforming to team consensus</li>
            </ul>

            <div class="key-concept">
              <h4>Best Practice</h4>
              <p>When uncertain, assess conservatively. It's better to over-mitigate a lower risk than under-mitigate a higher one.</p>
            </div>
          `,
          sequence: 2,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'Assess worst credible outcome for severity',
            'Consider multiple factors for probability',
            'Be aware of common cognitive biases'
          ],
          xpReward: 35,
          isActive: true
        },
        {
          id: 'lesson_sms_mitigation_strategies',
          questId: 'quest_sms_risk_assessment',
          slug: 'mitigation-strategies',
          title: 'Mitigation Strategies',
          content: `
            <h2>Developing Effective Mitigation Strategies</h2>
            <p>Once risks are identified and assessed, appropriate mitigation strategies must be developed and implemented.</p>

            <h3>Hierarchy of Controls</h3>
            <p>Mitigation strategies are prioritized (most to least effective):</p>
            <ol>
              <li><strong>Elimination:</strong> Remove the hazard entirely</li>
              <li><strong>Substitution:</strong> Replace with something less hazardous</li>
              <li><strong>Engineering Controls:</strong> Physical barriers or design changes</li>
              <li><strong>Administrative Controls:</strong> Procedures, training, warnings</li>
              <li><strong>PPE:</strong> Personal protective equipment (last resort)</li>
            </ol>

            <h3>Mitigation Characteristics</h3>
            <p>Effective mitigations are:</p>
            <ul>
              <li><strong>Specific:</strong> Clear what needs to be done</li>
              <li><strong>Measurable:</strong> Can verify implementation</li>
              <li><strong>Achievable:</strong> Realistic given resources</li>
              <li><strong>Relevant:</strong> Actually addresses the risk</li>
              <li><strong>Time-bound:</strong> Implemented before exposure</li>
            </ul>

            <h3>Defense in Depth</h3>
            <p>Rely on multiple, independent mitigation layers:</p>
            <ul>
              <li>No single control should be the only defense</li>
              <li>Diversity of control types (not all administrative)</li>
              <li>Redundancy for critical risks</li>
              <li>Independent failure modes</li>
            </ul>

            <div class="example">
              <h4>Example: Flyaway Risk</h4>
              <p><strong>Controls implemented:</strong></p>
              <ul>
                <li>Return-to-home function (engineering)</li>
                <li>Geofencing (engineering)</li>
                <li>Pre-flight GPS check (administrative)</li>
                <li>Pilot training on manual recovery (administrative)</li>
                <li>Parachute system (mitigation)</li>
              </ul>
            </div>
          `,
          sequence: 3,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'Use hierarchy of controls to prioritize mitigations',
            'Effective mitigations are SMART',
            'Defense in depth uses multiple independent layers'
          ],
          regulatoryRefs: [
            { type: 'SORA', reference: 'SORA 2.5', section: 'Mitigations' }
          ],
          xpReward: 35,
          isActive: true
        },
        {
          id: 'lesson_sms_residual_risk',
          questId: 'quest_sms_risk_assessment',
          slug: 'residual-risk',
          title: 'Residual Risk',
          content: `
            <h2>Evaluating Residual Risk</h2>
            <p>After implementing mitigations, some risk remains. This residual risk must be evaluated to ensure it's acceptable.</p>

            <h3>The Residual Risk Process</h3>
            <ol>
              <li>Identify the initial (inherent) risk</li>
              <li>Implement mitigation measures</li>
              <li>Re-assess risk with mitigations in place</li>
              <li>Determine if residual risk is acceptable</li>
              <li>If not, add more mitigations or reject the operation</li>
            </ol>

            <h3>Factors in Residual Risk Assessment</h3>
            <ul>
              <li>Effectiveness of implemented controls</li>
              <li>Reliability of mitigation measures</li>
              <li>Human factors in control implementation</li>
              <li>Monitoring and verification capability</li>
            </ul>

            <h3>Accepting Residual Risk</h3>
            <p>Residual risk acceptance requires:</p>
            <ul>
              <li><strong>Informed acceptance:</strong> Decision-maker understands the risk</li>
              <li><strong>Appropriate authority:</strong> Decision-maker has authority to accept</li>
              <li><strong>Documentation:</strong> Acceptance is recorded</li>
              <li><strong>Review:</strong> Periodic reassessment of accepted risks</li>
            </ul>

            <h3>ALARP Principle</h3>
            <p><strong>As Low As Reasonably Practicable</strong></p>
            <p>Risk should be reduced until the cost of further reduction is grossly disproportionate to the benefit gained.</p>

            <div class="key-takeaway">
              <h4>Key Takeaway</h4>
              <p>Zero risk is impossible. The goal is to reduce risk to an acceptable level where further reduction would be impractical or provide minimal benefit.</p>
            </div>
          `,
          sequence: 4,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'Residual risk is what remains after mitigation',
            'Risk acceptance requires proper authority and documentation',
            'ALARP means reducing risk to a practicable level'
          ],
          xpReward: 30,
          isActive: true
        }
      ]
    },

    // Quest 8: SMS Implementation
    {
      id: 'quest_sms_implementation',
      trackId: 'track_sms_foundation',
      slug: 'sms-implementation',
      title: 'SMS Implementation',
      description: 'Learn how to build, document, and continuously improve an SMS for your organization.',
      sequence: 8,
      estimatedDuration: 30,
      difficulty: 'advanced',
      objectives: [
        'Build an SMS from scratch',
        'Document SMS requirements',
        'Implement continuous improvement'
      ],
      totalLessons: 3,
      xpReward: 100,
      hasQuiz: true,
      hasFinalAssessment: true,
      finalAssessmentQuestions: 20,
      isActive: true,
      lessons: [
        {
          id: 'lesson_sms_building',
          questId: 'quest_sms_implementation',
          slug: 'building-your-sms',
          title: 'Building Your SMS',
          content: `
            <h2>Building Your SMS</h2>
            <p>Implementing an SMS is a phased process that should be tailored to your organization's size, complexity, and risk profile.</p>

            <h3>Implementation Phases</h3>
            <ol>
              <li><strong>Phase 1 - Planning:</strong>
                <ul>
                  <li>Commitment from management</li>
                  <li>Gap analysis of current safety practices</li>
                  <li>Implementation plan development</li>
                  <li>Resource allocation</li>
                </ul>
              </li>
              <li><strong>Phase 2 - Reactive Processes:</strong>
                <ul>
                  <li>Hazard reporting system</li>
                  <li>Incident investigation processes</li>
                  <li>Basic safety data collection</li>
                </ul>
              </li>
              <li><strong>Phase 3 - Proactive Processes:</strong>
                <ul>
                  <li>Systematic hazard identification</li>
                  <li>Safety risk management procedures</li>
                  <li>Safety performance monitoring</li>
                </ul>
              </li>
              <li><strong>Phase 4 - Continuous Improvement:</strong>
                <ul>
                  <li>Safety culture development</li>
                  <li>Predictive risk management</li>
                  <li>SMS effectiveness evaluation</li>
                </ul>
              </li>
            </ol>

            <h3>Scaling SMS to Organization Size</h3>
            <ul>
              <li><strong>Small operations:</strong> Simpler documentation, combined roles</li>
              <li><strong>Medium operations:</strong> Formal procedures, dedicated safety role</li>
              <li><strong>Large operations:</strong> Full SMS department, comprehensive systems</li>
            </ul>

            <div class="key-concept">
              <h4>Start Where You Are</h4>
              <p>Most organizations already have safety practices in place. SMS formalizes and integrates these into a coherent system.</p>
            </div>
          `,
          sequence: 1,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'SMS implementation is a phased process',
            'Scale the system to organization size',
            'Build on existing safety practices'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_sms_documentation',
          questId: 'quest_sms_implementation',
          slug: 'documentation-requirements',
          title: 'Documentation Requirements',
          content: `
            <h2>SMS Documentation Requirements</h2>
            <p>Proper documentation is essential for demonstrating compliance and ensuring consistency in safety management.</p>

            <h3>Core Documentation</h3>
            <ul>
              <li><strong>SMS Manual:</strong> Primary reference document describing the SMS</li>
              <li><strong>Safety Policy:</strong> Management commitment statement</li>
              <li><strong>Safety Objectives:</strong> Measurable safety goals</li>
              <li><strong>Organizational Chart:</strong> Safety responsibilities</li>
              <li><strong>Procedures:</strong> How safety activities are performed</li>
              <li><strong>Forms:</strong> Standardized data collection tools</li>
            </ul>

            <h3>Records to Maintain</h3>
            <ul>
              <li>Hazard reports and investigation records</li>
              <li>Risk assessments</li>
              <li>Training records</li>
              <li>Audit reports</li>
              <li>Meeting minutes</li>
              <li>Safety performance data</li>
              <li>Management reviews</li>
            </ul>

            <h3>Record Retention</h3>
            <p>Follow regulatory requirements and organizational policy for:</p>
            <ul>
              <li>How long to keep records</li>
              <li>How to store records securely</li>
              <li>How to make records accessible for audits</li>
              <li>How to protect confidential information</li>
            </ul>

            <div class="warning">
              <h4>Document What You Do, Do What You Document</h4>
              <p>Documentation should reflect actual practice. A gap between documented procedures and real operations is both a compliance and safety issue.</p>
            </div>
          `,
          sequence: 2,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'SMS Manual is the primary reference document',
            'Maintain records of all safety activities',
            'Documentation must match actual practice'
          ],
          regulatoryRefs: [
            { type: 'CAR', reference: 'CAR 107', section: 'Documentation Requirements' }
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_sms_continuous_improvement',
          questId: 'quest_sms_implementation',
          slug: 'continuous-improvement',
          title: 'Continuous Improvement',
          content: `
            <h2>Continuous Improvement</h2>
            <p>An effective SMS is never "finished." Continuous improvement is built into the system to ensure it evolves and improves over time.</p>

            <h3>The PDCA Cycle</h3>
            <p><strong>Plan-Do-Check-Act</strong> drives continuous improvement:</p>
            <ol>
              <li><strong>Plan:</strong> Identify opportunity, plan the change</li>
              <li><strong>Do:</strong> Implement on small scale first</li>
              <li><strong>Check:</strong> Measure results against expectations</li>
              <li><strong>Act:</strong> Standardize if successful, or try again</li>
            </ol>

            <h3>Sources of Improvement</h3>
            <ul>
              <li>Incident investigations and lessons learned</li>
              <li>Internal audits and self-assessments</li>
              <li>External audits and regulatory feedback</li>
              <li>Safety performance trend analysis</li>
              <li>Industry best practices and benchmarking</li>
              <li>Employee suggestions and feedback</li>
              <li>Technological advances</li>
            </ul>

            <h3>Management Review</h3>
            <p>Regular management review ensures SMS effectiveness:</p>
            <ul>
              <li>Review safety performance against objectives</li>
              <li>Assess resource adequacy</li>
              <li>Evaluate effectiveness of risk controls</li>
              <li>Review audit findings and corrective actions</li>
              <li>Make decisions on SMS improvements</li>
            </ul>

            <div class="key-takeaway">
              <h4>Congratulations!</h4>
              <p>You've completed the SMS Foundation track! Remember: SMS is not a destination but a journey of continuous improvement. Apply what you've learned in your daily operations.</p>
            </div>
          `,
          sequence: 3,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'PDCA cycle drives continuous improvement',
            'Multiple sources provide improvement opportunities',
            'Regular management review ensures effectiveness'
          ],
          xpReward: 35,
          isActive: true
        }
      ]
    }
  ]
}

export default smsTrack
