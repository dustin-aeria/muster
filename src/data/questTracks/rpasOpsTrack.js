/**
 * RPAS Flight Operations Quest Track
 *
 * Comprehensive training for RPAS flight operations including
 * pre-flight, in-flight, post-flight, emergency procedures, and maintenance.
 *
 * Source: Aeria_RPAS_Training_Program_Complete.docx + RPAS_Advanced_License_Training_Guide.docx
 *
 * @version 1.0.0
 */

const rpasOpsTrack = {
  id: 'track_rpas_operations',
  slug: 'rpas-flight-operations',
  name: 'RPAS Flight Operations',
  description: 'Master the complete flight operations lifecycle from pre-flight planning through post-flight documentation. Learn proper procedures, emergency response, and maintenance fundamentals for safe RPAS operations.',
  category: 'operations',
  icon: 'Plane',
  color: 'indigo',
  totalQuests: 7,
  totalLessons: 28,
  totalXp: 900,
  estimatedHours: 5.5,
  difficulty: 'intermediate',
  prerequisites: ['track_sms_foundation'],
  requiredForRoles: ['operator', 'pilot'],
  badge: {
    id: 'badge_rpas_operator',
    name: 'RPAS Operator',
    description: 'Completed the RPAS Flight Operations training track',
    rarity: 'rare',
    icon: 'Plane',
    color: 'indigo',
    xpBonus: 150
  },
  isActive: true,
  version: '1.0.0',
  quests: [
    // Quest 1: RPAS Fundamentals
    {
      id: 'quest_rpas_fundamentals',
      trackId: 'track_rpas_operations',
      slug: 'rpas-fundamentals',
      title: 'RPAS Fundamentals',
      description: 'Understand RPAS components, systems, payloads, and communication links.',
      sequence: 1,
      estimatedDuration: 30,
      difficulty: 'beginner',
      objectives: [
        'Identify RPAS components and systems',
        'Understand flight control systems',
        'Describe payload and sensor options',
        'Explain C2 link requirements'
      ],
      totalLessons: 4,
      xpReward: 100,
      hasQuiz: true,
      hasScenario: false,
      isActive: true,
      lessons: [
        {
          id: 'lesson_rpas_components',
          questId: 'quest_rpas_fundamentals',
          slug: 'rpas-components-systems',
          title: 'RPAS Components & Systems',
          content: `
            <h2>Understanding Your RPAS</h2>
            <p>A Remotely Piloted Aircraft System (RPAS) consists of multiple integrated components that work together for safe flight operations.</p>

            <h3>The RPAS Components</h3>
            <ul>
              <li><strong>Remotely Piloted Aircraft (RPA):</strong> The aircraft itself</li>
              <li><strong>Remote Pilot Station (RPS):</strong> Control interface</li>
              <li><strong>Command & Control (C2) Link:</strong> Communication system</li>
              <li><strong>Payloads:</strong> Cameras, sensors, equipment</li>
              <li><strong>Support Equipment:</strong> Batteries, chargers, tools</li>
            </ul>

            <h3>Aircraft Components</h3>
            <ul>
              <li><strong>Airframe:</strong> Physical structure of the aircraft</li>
              <li><strong>Propulsion:</strong> Motors and propellers/rotors</li>
              <li><strong>Flight Controller:</strong> Brain of the aircraft</li>
              <li><strong>GPS/GNSS:</strong> Positioning system</li>
              <li><strong>IMU:</strong> Inertial Measurement Unit for orientation</li>
              <li><strong>ESCs:</strong> Electronic Speed Controllers</li>
              <li><strong>Battery:</strong> Power source</li>
            </ul>

            <h3>Aircraft Types</h3>
            <ul>
              <li><strong>Multi-rotor:</strong> Multiple propellers, VTOL capable, limited endurance</li>
              <li><strong>Fixed-wing:</strong> Airplane configuration, longer range, requires runway</li>
              <li><strong>VTOL:</strong> Vertical takeoff, transitions to forward flight</li>
              <li><strong>Hybrid:</strong> Combination of configurations</li>
            </ul>

            <div class="key-concept">
              <h4>Know Your Aircraft</h4>
              <p>Understanding how each component works and interacts is essential for troubleshooting, maintenance, and safe operation.</p>
            </div>
          `,
          sequence: 1,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'RPAS includes aircraft, control station, and C2 link',
            'Multiple components must work together',
            'Different aircraft types suit different missions'
          ],
          xpReward: 25,
          isActive: true
        },
        {
          id: 'lesson_rpas_flight_control',
          questId: 'quest_rpas_fundamentals',
          slug: 'flight-control-systems',
          title: 'Flight Control Systems',
          content: `
            <h2>Flight Control Systems</h2>
            <p>Modern RPAS use sophisticated flight control systems that handle stability, navigation, and automation.</p>

            <h3>Flight Controller Functions</h3>
            <ul>
              <li><strong>Stabilization:</strong> Maintains attitude and prevents uncontrolled flight</li>
              <li><strong>Navigation:</strong> Follows waypoints and flight plans</li>
              <li><strong>Automation:</strong> Auto-takeoff, landing, and RTH</li>
              <li><strong>Failsafe:</strong> Emergency responses to failures</li>
            </ul>

            <h3>Flight Modes</h3>
            <ul>
              <li><strong>Manual/Attitude:</strong> Direct control, FC maintains attitude</li>
              <li><strong>GPS/Position:</strong> Position hold, most stable</li>
              <li><strong>Sport:</strong> Higher responsiveness, less assist</li>
              <li><strong>Mission/Auto:</strong> Following pre-planned route</li>
              <li><strong>RTH:</strong> Automatic return to home</li>
            </ul>

            <h3>Sensors Used</h3>
            <ul>
              <li><strong>Accelerometer:</strong> Measures acceleration forces</li>
              <li><strong>Gyroscope:</strong> Measures rotation rates</li>
              <li><strong>Barometer:</strong> Measures air pressure for altitude</li>
              <li><strong>Magnetometer:</strong> Compass heading</li>
              <li><strong>GPS:</strong> Position and ground speed</li>
            </ul>

            <div class="warning">
              <h4>Sensor Dependencies</h4>
              <p>If sensors provide incorrect data, the flight controller will make incorrect decisions. Always verify sensor calibration and check for interference before flight.</p>
            </div>
          `,
          sequence: 2,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Flight controller handles stabilization, navigation, automation',
            'Different flight modes offer different levels of assistance',
            'Multiple sensors provide data for flight control'
          ],
          xpReward: 25,
          isActive: true
        },
        {
          id: 'lesson_rpas_payloads',
          questId: 'quest_rpas_fundamentals',
          slug: 'payloads-sensors',
          title: 'Payloads & Sensors',
          content: `
            <h2>Payloads and Sensors</h2>
            <p>The payload is what makes RPAS operations productive. Different missions require different sensor configurations.</p>

            <h3>Common Payload Types</h3>
            <ul>
              <li><strong>RGB Camera:</strong> Standard visual imaging</li>
              <li><strong>Thermal/IR:</strong> Heat detection, night operations</li>
              <li><strong>Multispectral:</strong> Agriculture, vegetation analysis</li>
              <li><strong>LiDAR:</strong> 3D mapping, terrain modeling</li>
              <li><strong>Hyperspectral:</strong> Detailed material analysis</li>
            </ul>

            <h3>Gimbal Systems</h3>
            <p>Gimbals provide stabilization and control for payloads:</p>
            <ul>
              <li>2-axis: Pitch and roll stabilization</li>
              <li>3-axis: Adds yaw control</li>
              <li>Active stabilization during flight</li>
              <li>Remote tilt/pan control</li>
            </ul>

            <h3>Payload Considerations</h3>
            <ul>
              <li><strong>Weight:</strong> Affects flight time and performance</li>
              <li><strong>Power:</strong> May require dedicated power supply</li>
              <li><strong>Mounting:</strong> Proper balance and vibration isolation</li>
              <li><strong>Interference:</strong> Some payloads affect GPS or compass</li>
            </ul>

            <div class="key-concept">
              <h4>Match Payload to Mission</h4>
              <p>Selecting the right payload for the mission is as important as selecting the right aircraft. Over-equipping adds weight; under-equipping means poor results.</p>
            </div>
          `,
          sequence: 3,
          type: 'content',
          estimatedDuration: 7,
          keyPoints: [
            'Different missions require different sensors',
            'Gimbals provide stabilization and control',
            'Payload affects aircraft performance'
          ],
          xpReward: 25,
          isActive: true
        },
        {
          id: 'lesson_rpas_c2_link',
          questId: 'quest_rpas_fundamentals',
          slug: 'communication-links',
          title: 'Communication Links (C2)',
          content: `
            <h2>Command & Control Links</h2>
            <p>The C2 link is the communication system between the pilot and aircraft. Its reliability is critical for safe operations.</p>

            <h3>C2 Link Components</h3>
            <ul>
              <li><strong>Transmitter:</strong> In the controller/ground station</li>
              <li><strong>Receiver:</strong> On the aircraft</li>
              <li><strong>Antennas:</strong> Both ends of the link</li>
              <li><strong>Protocol:</strong> Communication method (digital/analog)</li>
            </ul>

            <h3>Link Types</h3>
            <ul>
              <li><strong>Radio Control (RC):</strong> Direct radio link</li>
              <li><strong>Cellular:</strong> Uses mobile network (4G/5G)</li>
              <li><strong>Satellite:</strong> For BVLOS/long range</li>
              <li><strong>Mesh Networks:</strong> Multiple relay points</li>
            </ul>

            <h3>Link Performance Factors</h3>
            <ul>
              <li><strong>Range:</strong> Maximum communication distance</li>
              <li><strong>Latency:</strong> Delay in command/response</li>
              <li><strong>Bandwidth:</strong> Data capacity (video, telemetry)</li>
              <li><strong>Interference:</strong> Other signals affecting link</li>
              <li><strong>Obstacles:</strong> Physical blockage</li>
            </ul>

            <h3>Lost Link Considerations</h3>
            <p>Every operation must have a lost link plan:</p>
            <ul>
              <li>What happens when link is lost?</li>
              <li>How long before failsafe activates?</li>
              <li>What is the failsafe action (RTH, land, loiter)?</li>
              <li>How to regain link?</li>
            </ul>

            <div class="warning">
              <h4>Critical Requirement</h4>
              <p>Under CAR 901, you must be able to maintain operational control of the RPAS. Lost link procedures must be established before every flight.</p>
            </div>
          `,
          sequence: 4,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'C2 link connects pilot to aircraft',
            'Multiple link technologies available',
            'Lost link procedures are mandatory'
          ],
          regulatoryRefs: [
            { type: 'CAR', reference: 'CAR 901.26', section: 'C2 Link Requirements' }
          ],
          xpReward: 25,
          isActive: true
        }
      ]
    },

    // Quest 2: Pre-Flight Operations
    {
      id: 'quest_rpas_preflight',
      trackId: 'track_rpas_operations',
      slug: 'pre-flight-operations',
      title: 'Pre-Flight Operations',
      description: 'Master the pre-flight process from inspection through briefing.',
      sequence: 2,
      estimatedDuration: 35,
      difficulty: 'intermediate',
      objectives: [
        'Conduct thorough aircraft inspection',
        'Implement battery management best practices',
        'Set up ground station properly',
        'Deliver effective pre-flight briefing'
      ],
      totalLessons: 4,
      xpReward: 120,
      hasQuiz: true,
      hasScenario: true,
      scenarioId: 'scenario_rpas_preflight_discovery',
      isActive: true,
      lessons: [
        {
          id: 'lesson_rpas_inspection',
          questId: 'quest_rpas_preflight',
          slug: 'aircraft-inspection-checklist',
          title: 'Aircraft Inspection Checklist',
          content: `
            <h2>Pre-Flight Aircraft Inspection</h2>
            <p>A thorough pre-flight inspection catches problems before they become in-flight emergencies.</p>

            <h3>Airframe Inspection</h3>
            <ul>
              <li><strong>Structure:</strong> Check for cracks, damage, loose parts</li>
              <li><strong>Arms/Booms:</strong> Verify secure mounting and alignment</li>
              <li><strong>Landing Gear:</strong> Check condition and attachment</li>
              <li><strong>Covers/Hatches:</strong> Secure and undamaged</li>
            </ul>

            <h3>Propulsion Inspection</h3>
            <ul>
              <li><strong>Propellers:</strong> No chips, cracks, or balance issues</li>
              <li><strong>Motors:</strong> Spin freely, no debris, proper attachment</li>
              <li><strong>Prop Bolts:</strong> Properly torqued</li>
              <li><strong>Motor Mounts:</strong> Secure, no play</li>
            </ul>

            <h3>Electronics Inspection</h3>
            <ul>
              <li><strong>Wiring:</strong> No exposed wires, secure connections</li>
              <li><strong>Antennas:</strong> Proper orientation, undamaged</li>
              <li><strong>GPS Module:</strong> Clear sky view, secure mount</li>
              <li><strong>Sensors:</strong> Clean, unobstructed</li>
            </ul>

            <h3>Payload Inspection</h3>
            <ul>
              <li><strong>Camera/Sensor:</strong> Clean lens, proper mounting</li>
              <li><strong>Gimbal:</strong> Full range of motion, no binding</li>
              <li><strong>SD Card:</strong> Formatted, sufficient space</li>
              <li><strong>Cables:</strong> Secure, not interfering with gimbal</li>
            </ul>

            <div class="key-concept">
              <h4>Use the Checklist</h4>
              <p>Even experienced pilots miss things when relying on memory. Use a written checklist every time—it's not a sign of inexperience, it's a sign of professionalism.</p>
            </div>
          `,
          sequence: 1,
          type: 'procedure',
          estimatedDuration: 10,
          keyPoints: [
            'Inspect airframe, propulsion, electronics, and payload',
            'Use a written checklist every time',
            'Catch problems before they become emergencies'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_rpas_battery_mgmt',
          questId: 'quest_rpas_preflight',
          slug: 'battery-management',
          title: 'Battery Management',
          content: `
            <h2>Battery Management</h2>
            <p>Batteries are the most critical consumable in RPAS operations. Proper management extends life and ensures safe operations.</p>

            <h3>Pre-Flight Battery Checks</h3>
            <ul>
              <li><strong>Charge Level:</strong> Fully charged for mission requirements</li>
              <li><strong>Cell Balance:</strong> Check individual cell voltages</li>
              <li><strong>Physical Condition:</strong> No swelling, damage, or corrosion</li>
              <li><strong>Cycle Count:</strong> Within manufacturer recommendations</li>
              <li><strong>Temperature:</strong> Within operating range</li>
            </ul>

            <h3>Voltage Guidelines</h3>
            <p>For typical LiPo batteries (per cell):</p>
            <ul>
              <li><strong>Fully Charged:</strong> 4.2V</li>
              <li><strong>Nominal:</strong> 3.7V</li>
              <li><strong>Low Warning:</strong> 3.5V</li>
              <li><strong>Critical:</strong> 3.3V</li>
              <li><strong>Damage Threshold:</strong> Below 3.0V</li>
            </ul>

            <h3>Battery Safety</h3>
            <ul>
              <li>Never charge unattended</li>
              <li>Use fireproof charging bags</li>
              <li>Store at proper charge level (3.8V/cell for storage)</li>
              <li>Keep away from heat and direct sunlight</li>
              <li>Inspect before and after each flight</li>
              <li>Retire batteries showing any swelling</li>
            </ul>

            <div class="warning">
              <h4>Critical Safety</h4>
              <p>A swollen or damaged LiPo battery is a fire hazard. Never fly with a damaged battery, and dispose of properly if damage is observed.</p>
            </div>
          `,
          sequence: 2,
          type: 'procedure',
          estimatedDuration: 8,
          keyPoints: [
            'Check charge level, cell balance, and physical condition',
            'Know voltage thresholds for warnings and critical levels',
            'Follow safety protocols for charging and storage'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_rpas_ground_station',
          questId: 'quest_rpas_preflight',
          slug: 'ground-station-setup',
          title: 'Ground Station Setup',
          content: `
            <h2>Ground Station Setup</h2>
            <p>Proper ground station setup ensures reliable control and monitoring throughout the flight.</p>

            <h3>Controller Setup</h3>
            <ul>
              <li><strong>Power On:</strong> Verify battery level adequate</li>
              <li><strong>Firmware:</strong> Compatible with aircraft</li>
              <li><strong>Calibration:</strong> Sticks centered, switches confirmed</li>
              <li><strong>Screen:</strong> Visible in lighting conditions</li>
              <li><strong>Antennas:</strong> Properly oriented toward aircraft</li>
            </ul>

            <h3>App/Software Setup</h3>
            <ul>
              <li><strong>Connection:</strong> Link to aircraft confirmed</li>
              <li><strong>GPS:</strong> Home point set, sufficient satellites</li>
              <li><strong>Flight Mode:</strong> Appropriate mode selected</li>
              <li><strong>Limits:</strong> Altitude, distance, geofence configured</li>
              <li><strong>Failsafes:</strong> RTH altitude, lost link behavior set</li>
            </ul>

            <h3>Environment Setup</h3>
            <ul>
              <li><strong>Location:</strong> Clear view of operating area</li>
              <li><strong>Shade:</strong> Screen visibility if needed</li>
              <li><strong>Stability:</strong> Secure surface or tripod for tablet</li>
              <li><strong>Communication:</strong> Radio/intercom with VO tested</li>
            </ul>

            <div class="key-concept">
              <h4>Power On Sequence</h4>
              <p>Standard sequence: Controller first, then aircraft. This ensures the controller is ready to receive telemetry when the aircraft powers up.</p>
            </div>
          `,
          sequence: 3,
          type: 'procedure',
          estimatedDuration: 8,
          keyPoints: [
            'Power controller before aircraft',
            'Verify GPS, failsafes, and limits',
            'Ensure clear view and communication'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_rpas_briefing',
          questId: 'quest_rpas_preflight',
          slug: 'pre-flight-briefing',
          title: 'Pre-Flight Briefing',
          content: `
            <h2>Pre-Flight Briefing</h2>
            <p>An effective briefing ensures all crew members understand the mission, their roles, and how to respond to contingencies.</p>

            <h3>Briefing Elements</h3>
            <ol>
              <li><strong>Mission Objective:</strong> What are we trying to accomplish?</li>
              <li><strong>Roles:</strong> Who is PIC, VO, support?</li>
              <li><strong>Flight Plan:</strong> Area, altitude, duration, pattern</li>
              <li><strong>Airspace:</strong> Any restrictions, clearances obtained</li>
              <li><strong>Weather:</strong> Current and forecast conditions</li>
              <li><strong>Hazards:</strong> Obstacles, traffic, people, wildlife</li>
              <li><strong>Emergency Procedures:</strong> What to do if...</li>
              <li><strong>Communication:</strong> Callouts, signals, frequencies</li>
              <li><strong>Questions:</strong> Anything unclear?</li>
            </ol>

            <h3>Emergency Procedures to Cover</h3>
            <ul>
              <li>Lost link procedure</li>
              <li>Flyaway response</li>
              <li>Emergency landing areas</li>
              <li>Personnel injury response</li>
              <li>Abort criteria</li>
            </ul>

            <h3>Briefing Best Practices</h3>
            <ul>
              <li>Keep it concise but complete</li>
              <li>Encourage questions</li>
              <li>Confirm understanding from all crew</li>
              <li>Adjust if conditions change</li>
              <li>Document the briefing</li>
            </ul>

            <div class="real-world">
              <h4>Sample Briefing Start</h4>
              <p>"Today we're surveying the north field for drainage assessment. I'm PIC, Sarah is VO. Flight plan is a grid pattern at 80m AGL for approximately 15 minutes. Winds are 12kph from the west, forecast to decrease. Power lines are 200m to the east—we'll maintain 50m minimum clearance. Any questions so far?"</p>
            </div>
          `,
          sequence: 4,
          type: 'procedure',
          estimatedDuration: 8,
          keyPoints: [
            'Cover mission, roles, plan, hazards, emergencies',
            'Confirm understanding from all crew',
            'Document the briefing'
          ],
          xpReward: 30,
          isActive: true
        }
      ]
    },

    // Quest 3: Flight Planning
    {
      id: 'quest_rpas_flight_planning',
      trackId: 'track_rpas_operations',
      slug: 'flight-planning',
      title: 'Flight Planning',
      description: 'Learn systematic flight planning including airspace, weather, and mission design.',
      sequence: 3,
      estimatedDuration: 30,
      difficulty: 'intermediate',
      objectives: [
        'Plan missions systematically',
        'Conduct airspace analysis',
        'Assess weather conditions',
        'Review NOTAMs and TFRs'
      ],
      totalLessons: 4,
      xpReward: 110,
      hasQuiz: true,
      hasScenario: false,
      isActive: true,
      lessons: [
        {
          id: 'lesson_rpas_mission_planning',
          questId: 'quest_rpas_flight_planning',
          slug: 'mission-planning-workflow',
          title: 'Mission Planning Workflow',
          content: `
            <h2>Systematic Mission Planning</h2>
            <p>Good mission planning follows a systematic process that ensures nothing is overlooked.</p>

            <h3>Planning Workflow</h3>
            <ol>
              <li><strong>Define Objective:</strong> What data/outcome is needed?</li>
              <li><strong>Site Survey:</strong> Assess location and hazards</li>
              <li><strong>Airspace Check:</strong> Restrictions and requirements</li>
              <li><strong>Weather Analysis:</strong> Forecast and conditions</li>
              <li><strong>Equipment Selection:</strong> Aircraft, payload, batteries</li>
              <li><strong>Flight Design:</strong> Pattern, altitude, timing</li>
              <li><strong>Risk Assessment:</strong> Identify and mitigate risks</li>
              <li><strong>Contingency Planning:</strong> What if things go wrong?</li>
              <li><strong>Logistics:</strong> Access, permits, communication</li>
              <li><strong>Documentation:</strong> Flight plan, authorizations</li>
            </ol>

            <h3>Information Sources</h3>
            <ul>
              <li><strong>Maps:</strong> Google Earth, sectional charts</li>
              <li><strong>Airspace:</strong> NAV CANADA, Airmap, drone apps</li>
              <li><strong>Weather:</strong> METAR, TAF, aviation weather</li>
              <li><strong>NOTAMs:</strong> CFPS, NAV CANADA</li>
              <li><strong>Site Data:</strong> Client info, site visit, photos</li>
            </ul>

            <div class="key-concept">
              <h4>Time Investment</h4>
              <p>Good planning takes time but prevents problems. Plan for 2-3x the flight time for planning on new or complex sites.</p>
            </div>
          `,
          sequence: 1,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Follow a systematic planning workflow',
            'Use multiple information sources',
            'Invest adequate time in planning'
          ],
          xpReward: 25,
          isActive: true
        },
        {
          id: 'lesson_rpas_airspace',
          questId: 'quest_rpas_flight_planning',
          slug: 'airspace-analysis',
          title: 'Airspace Analysis',
          content: `
            <h2>Airspace Analysis</h2>
            <p>Understanding airspace is critical for legal and safe operations. Canadian airspace has specific rules for RPAS.</p>

            <h3>Airspace Classes</h3>
            <ul>
              <li><strong>Class A:</strong> 18,000' and above - No RPAS ops</li>
              <li><strong>Class B:</strong> Major airports - Requires authorization</li>
              <li><strong>Class C:</strong> Medium airports - Requires authorization</li>
              <li><strong>Class D:</strong> Smaller controlled - Requires authorization</li>
              <li><strong>Class E:</strong> Controlled above certain altitudes</li>
              <li><strong>Class F:</strong> Special use (restricted, military, etc.)</li>
              <li><strong>Class G:</strong> Uncontrolled - May operate with restrictions</li>
            </ul>

            <h3>Controlled Airspace Rules</h3>
            <p>In controlled airspace, RPAS must have:</p>
            <ul>
              <li>NAV CANADA authorization (RPAS Zone approval)</li>
              <li>Two-way communication capability where required</li>
              <li>Compliance with any conditions imposed</li>
            </ul>

            <h3>Checking Airspace</h3>
            <ul>
              <li>Use NAV Drone app for automatic zone checking</li>
              <li>Check VFR Navigation Charts (VNC) for airspace</li>
              <li>Identify airports, heliports, seaplane bases</li>
              <li>Check for temporary restrictions</li>
            </ul>

            <div class="warning">
              <h4>5.6km Rule</h4>
              <p>Basic operations must remain outside 5.6km (3NM) of airports unless authorized. This includes heliports and seaplane bases.</p>
            </div>
          `,
          sequence: 2,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Know airspace classes and requirements',
            'Authorization required in controlled airspace',
            '5.6km minimum distance from airports'
          ],
          regulatoryRefs: [
            { type: 'CAR', reference: 'CAR 901.64', section: 'Controlled Airspace' }
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_rpas_weather',
          questId: 'quest_rpas_flight_planning',
          slug: 'weather-assessment',
          title: 'Weather Assessment',
          content: `
            <h2>Weather Assessment</h2>
            <p>Weather affects RPAS operations more than manned aircraft. Proper assessment prevents weather-related incidents.</p>

            <h3>Key Weather Factors</h3>
            <ul>
              <li><strong>Wind:</strong> Speed and gusts, direction, surface vs. altitude</li>
              <li><strong>Visibility:</strong> Required to maintain VLOS</li>
              <li><strong>Cloud Ceiling:</strong> Must stay clear of clouds</li>
              <li><strong>Precipitation:</strong> Most RPAS not rated for rain</li>
              <li><strong>Temperature:</strong> Affects battery performance</li>
            </ul>

            <h3>Weather Limits</h3>
            <p>Typical operational limits (vary by aircraft):</p>
            <ul>
              <li>Wind: &lt;25 kph sustained, &lt;35 kph gusts</li>
              <li>Visibility: 3SM minimum for VLOS</li>
              <li>Temperature: 0°C to 40°C</li>
              <li>Precipitation: None unless IP-rated</li>
            </ul>

            <h3>Weather Resources</h3>
            <ul>
              <li><strong>METAR:</strong> Current conditions at airports</li>
              <li><strong>TAF:</strong> Forecasts at airports</li>
              <li><strong>GFA:</strong> Graphic Area Forecast</li>
              <li><strong>PIREP:</strong> Pilot reports (for area conditions)</li>
              <li><strong>Weather apps:</strong> Local forecasts</li>
            </ul>

            <div class="key-concept">
              <h4>Forecast vs. Reality</h4>
              <p>Always have a plan for weather that's different from forecast. If forecast shows marginal conditions, have abort criteria predetermined.</p>
            </div>
          `,
          sequence: 3,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Assess wind, visibility, ceiling, precipitation, temperature',
            'Know your aircraft\'s weather limits',
            'Use multiple weather sources'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_rpas_notams',
          questId: 'quest_rpas_flight_planning',
          slug: 'notams-tfrs',
          title: 'NOTAMs & TFRs',
          content: `
            <h2>NOTAMs and Temporary Restrictions</h2>
            <p>NOTAMs (Notices to Airmen) and TFRs (Temporary Flight Restrictions) can affect your operation with little notice.</p>

            <h3>Types of NOTAMs</h3>
            <ul>
              <li><strong>Aerodrome NOTAMs:</strong> Airport-specific information</li>
              <li><strong>En-route NOTAMs:</strong> Airspace changes, hazards</li>
              <li><strong>Special Activity:</strong> Airshows, military exercises, VIP</li>
              <li><strong>Navigation Warnings:</strong> GPS interference, etc.</li>
            </ul>

            <h3>Common Restrictions</h3>
            <ul>
              <li>Forest fire zones</li>
              <li>Emergency response areas</li>
              <li>Sporting events</li>
              <li>VIP movements</li>
              <li>Military exercises</li>
              <li>Construction cranes</li>
            </ul>

            <h3>Checking NOTAMs</h3>
            <ul>
              <li>NAV CANADA CFPS (Canadian Flight Planning Site)</li>
              <li>NAV Drone app</li>
              <li>FIC (Flight Information Centre)</li>
              <li>Check day-of and immediately before flight</li>
            </ul>

            <div class="warning">
              <h4>No Excuses</h4>
              <p>It is the pilot's responsibility to check NOTAMs. "I didn't know" is not a valid defense for operating in a restricted area.</p>
            </div>
          `,
          sequence: 4,
          type: 'content',
          estimatedDuration: 6,
          keyPoints: [
            'Check NOTAMs before every flight',
            'Understand types of temporary restrictions',
            'No excuses for missing active NOTAMs'
          ],
          regulatoryRefs: [
            { type: 'CAR', reference: 'CAR 601.14', section: 'NOTAM Requirements' }
          ],
          xpReward: 25,
          isActive: true
        }
      ]
    },

    // Quest 4: In-Flight Operations
    {
      id: 'quest_rpas_inflight',
      trackId: 'track_rpas_operations',
      slug: 'in-flight-operations',
      title: 'In-Flight Operations',
      description: 'Master active flight procedures including takeoff, navigation, crew coordination, and decision making.',
      sequence: 4,
      estimatedDuration: 35,
      difficulty: 'intermediate',
      objectives: [
        'Execute safe takeoff and landing procedures',
        'Navigate effectively during missions',
        'Coordinate with crew members',
        'Make sound go/no-go decisions'
      ],
      totalLessons: 4,
      xpReward: 120,
      hasQuiz: true,
      hasScenario: true,
      scenarioId: 'scenario_rpas_weather_moving',
      isActive: true,
      lessons: [
        {
          id: 'lesson_rpas_takeoff_landing',
          questId: 'quest_rpas_inflight',
          slug: 'takeoff-landing-procedures',
          title: 'Takeoff & Landing Procedures',
          content: `
            <h2>Takeoff and Landing</h2>
            <p>The takeoff and landing phases have the highest workload and risk. Proper procedures ensure consistent, safe operations.</p>

            <h3>Pre-Takeoff Checks</h3>
            <ul>
              <li>GPS lock confirmed (minimum satellites)</li>
              <li>Home point set correctly</li>
              <li>Compass calibrated if needed</li>
              <li>Battery sufficient for mission + reserve</li>
              <li>Takeoff area clear</li>
              <li>VO confirms clear airspace</li>
            </ul>

            <h3>Takeoff Procedure</h3>
            <ol>
              <li>Announce "Starting motors"</li>
              <li>Start motors, verify normal operation</li>
              <li>Announce "Taking off"</li>
              <li>Climb vertically to safe hover height (2-3m)</li>
              <li>Verify stable hover and control response</li>
              <li>Announce "Proceeding with mission"</li>
            </ol>

            <h3>Landing Procedure</h3>
            <ol>
              <li>Announce "Returning for landing"</li>
              <li>Approach landing zone, confirm clear</li>
              <li>Establish stable hover over landing point</li>
              <li>Announce "Landing"</li>
              <li>Descend vertically, maintain position</li>
              <li>Land gently, disarm motors</li>
              <li>Announce "Landed, motors off"</li>
            </ol>

            <div class="key-concept">
              <h4>The Hover Check</h4>
              <p>Always pause in a hover after takeoff. This verifies the aircraft is responding properly before committing to the mission. If something's wrong, you're close to the ground.</p>
            </div>
          `,
          sequence: 1,
          type: 'procedure',
          estimatedDuration: 10,
          keyPoints: [
            'Complete pre-takeoff checks before every flight',
            'Hover check after takeoff verifies normal operation',
            'Announce all actions for crew awareness'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_rpas_navigation',
          questId: 'quest_rpas_inflight',
          slug: 'navigation-waypoints',
          title: 'Navigation & Waypoints',
          content: `
            <h2>Navigation During Flight</h2>
            <p>Effective navigation keeps the aircraft where intended while maintaining situational awareness.</p>

            <h3>Navigation Methods</h3>
            <ul>
              <li><strong>Manual:</strong> Direct stick control, visual reference</li>
              <li><strong>Waypoint:</strong> Pre-planned route, auto-follow</li>
              <li><strong>Follow Me:</strong> Aircraft follows pilot/subject</li>
              <li><strong>Orbit:</strong> Circle around point of interest</li>
            </ul>

            <h3>Maintaining Position Awareness</h3>
            <ul>
              <li>Monitor map/telemetry display</li>
              <li>Maintain visual reference with VO</li>
              <li>Track altitude and distance from home</li>
              <li>Note landmarks and boundaries</li>
              <li>Be aware of no-fly zones</li>
            </ul>

            <h3>Common Navigation Errors</h3>
            <ul>
              <li>Orientation confusion (which way is nose pointing)</li>
              <li>Altitude unawareness</li>
              <li>Drifting outside operating area</li>
              <li>Flying into obstacles not visible from GCS</li>
            </ul>

            <h3>Navigation Best Practices</h3>
            <ul>
              <li>Use headless mode cautiously if at all</li>
              <li>Verify orientation before maneuvering</li>
              <li>Announce position periodically</li>
              <li>Use terrain features as references</li>
            </ul>

            <div class="warning">
              <h4>Trust But Verify</h4>
              <p>GPS and automated navigation are reliable but not perfect. Always maintain visual awareness and be ready to take manual control.</p>
            </div>
          `,
          sequence: 2,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Multiple navigation methods for different missions',
            'Maintain constant position and altitude awareness',
            'Be ready for manual control if automation fails'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_rpas_crew_coordination',
          questId: 'quest_rpas_inflight',
          slug: 'crew-coordination',
          title: 'Crew Coordination',
          content: `
            <h2>In-Flight Crew Coordination</h2>
            <p>Effective crew coordination keeps everyone informed and the operation safe.</p>

            <h3>Communication Standards</h3>
            <ul>
              <li>Use clear, concise language</li>
              <li>Identify speaker and recipient ("VO, PIC...")</li>
              <li>Use closed-loop communication for critical items</li>
              <li>Acknowledge all safety callouts immediately</li>
            </ul>

            <h3>Standard Callouts</h3>
            <ul>
              <li><strong>Position:</strong> "Aircraft is 50m north, 80m altitude"</li>
              <li><strong>Traffic:</strong> "Aircraft spotted, 2 o'clock, 500m, heading south"</li>
              <li><strong>Battery:</strong> "Battery at 50 percent"</li>
              <li><strong>Hazard:</strong> "Power lines, 3 o'clock, 100m"</li>
              <li><strong>Emergency:</strong> "Lost visual!" "Land now!"</li>
            </ul>

            <h3>VO Responsibilities</h3>
            <ul>
              <li>Maintain visual contact with aircraft</li>
              <li>Scan for traffic and hazards</li>
              <li>Provide position updates to PIC</li>
              <li>Call out anything unusual</li>
              <li>Maintain awareness of people in area</li>
            </ul>

            <h3>Crew Communication Challenges</h3>
            <ul>
              <li>Noise (wind, equipment)</li>
              <li>Distance (distributed crew)</li>
              <li>Stress (high workload situations)</li>
              <li>Complacency (routine operations)</li>
            </ul>

            <div class="key-concept">
              <h4>No News is Not Good News</h4>
              <p>If your VO is quiet, check in. Regular updates confirm awareness. Silence might mean everything is fine, or it might mean attention has lapsed.</p>
            </div>
          `,
          sequence: 3,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Use standard callouts for consistency',
            'Closed-loop communication for critical items',
            'Regular updates confirm awareness'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_rpas_go_no_go',
          questId: 'quest_rpas_inflight',
          slug: 'go-no-go-decisions',
          title: 'Go/No-Go Decisions',
          content: `
            <h2>In-Flight Decision Making</h2>
            <p>Go/no-go decisions happen continuously during flight. Having predetermined criteria makes them easier.</p>

            <h3>Continuous Assessment</h3>
            <p>Throughout the flight, monitor:</p>
            <ul>
              <li>Weather changes (wind, visibility)</li>
              <li>Aircraft performance (battery, telemetry)</li>
              <li>Crew status (fatigue, focus)</li>
              <li>Environmental changes (people, traffic)</li>
              <li>Mission progress vs. time/battery</li>
            </ul>

            <h3>Abort Criteria</h3>
            <p>Establish firm criteria before flight:</p>
            <ul>
              <li>Battery reaches X% → Return</li>
              <li>Wind exceeds X kph → Land</li>
              <li>Lost visual for X seconds → Land</li>
              <li>Telemetry warning → Assess, likely land</li>
              <li>Crew member says "land" → Land</li>
            </ul>

            <h3>Decision Framework</h3>
            <ol>
              <li>Recognize the situation requiring decision</li>
              <li>Assess against predetermined criteria</li>
              <li>Decide: Continue, modify, or abort</li>
              <li>Execute the decision</li>
              <li>Monitor the outcome</li>
            </ol>

            <div class="key-takeaway">
              <h4>Err Toward Safety</h4>
              <p>If you're unsure whether to abort, abort. The mission can be continued; a crashed aircraft or injured person cannot be undone. "When in doubt, there is no doubt."</p>
            </div>
          `,
          sequence: 4,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Continuous assessment throughout flight',
            'Predetermined abort criteria simplify decisions',
            'When in doubt, abort'
          ],
          xpReward: 30,
          isActive: true
        }
      ]
    },

    // Quest 5: Emergency Procedures
    {
      id: 'quest_rpas_emergency',
      trackId: 'track_rpas_operations',
      slug: 'emergency-procedures',
      title: 'Emergency Procedures',
      description: 'Learn to respond effectively to emergencies including system failures, lost link, and fly-away events.',
      sequence: 5,
      estimatedDuration: 40,
      difficulty: 'advanced',
      objectives: [
        'Apply the 6-step emergency sequence',
        'Respond to control station failure',
        'Handle equipment and aircraft failures',
        'Execute lost link and fly-away procedures'
      ],
      totalLessons: 5,
      xpReward: 150,
      hasQuiz: true,
      hasScenario: true,
      scenarioId: 'scenario_rpas_system_failure',
      isActive: true,
      lessons: [
        {
          id: 'lesson_rpas_emergency_sequence',
          questId: 'quest_rpas_emergency',
          slug: 'six-step-emergency-sequence',
          title: '6-Step Emergency Sequence',
          content: `
            <h2>The 6-Step Emergency Response</h2>
            <p>A structured approach to emergencies prevents panic and ensures effective response.</p>

            <h3>The 6 Steps</h3>
            <ol>
              <li><strong>MAINTAIN CONTROL</strong>
                <p>Keep flying the aircraft. Don't let the emergency cause a loss of control.</p>
              </li>
              <li><strong>ANALYZE</strong>
                <p>What is happening? What caused it? What does it affect?</p>
              </li>
              <li><strong>TAKE ACTION</strong>
                <p>Execute appropriate emergency procedure or checklist.</p>
              </li>
              <li><strong>LAND</strong>
                <p>Get the aircraft on the ground as safely as possible.</p>
              </li>
              <li><strong>NOTIFY</strong>
                <p>Alert appropriate parties (crew, management, authorities if required).</p>
              </li>
              <li><strong>DOCUMENT</strong>
                <p>Record details while fresh for investigation and learning.</p>
              </li>
            </ol>

            <h3>Priority During Emergency</h3>
            <p>The priority hierarchy still applies:</p>
            <ol>
              <li><strong>Aviate:</strong> Control the aircraft first</li>
              <li><strong>Navigate:</strong> Know where you are, find safe landing area</li>
              <li><strong>Communicate:</strong> Alert crew, then others</li>
            </ol>

            <div class="key-concept">
              <h4>Stay Calm</h4>
              <p>In an emergency, take a breath. Your training is there for a reason. Follow the steps systematically rather than reacting randomly.</p>
            </div>
          `,
          sequence: 1,
          type: 'procedure',
          estimatedDuration: 8,
          keyPoints: [
            '6 steps: Maintain, Analyze, Act, Land, Notify, Document',
            'Aviate-Navigate-Communicate hierarchy still applies',
            'Stay calm and follow procedures'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_rpas_station_failure',
          questId: 'quest_rpas_emergency',
          slug: 'control-station-failure',
          title: 'Control Station Failure',
          content: `
            <h2>Control Station Failure</h2>
            <p>Failures in the ground control station can range from minor inconveniences to complete loss of control.</p>

            <h3>Types of Station Failures</h3>
            <ul>
              <li><strong>Display failure:</strong> Loss of video or telemetry display</li>
              <li><strong>Controller battery:</strong> Low power or dead controller</li>
              <li><strong>App crash:</strong> Software stops responding</li>
              <li><strong>Device failure:</strong> Tablet/phone crashes or overheats</li>
              <li><strong>Complete failure:</strong> No control capability</li>
            </ul>

            <h3>Response Procedures</h3>
            <p><strong>Display Failure:</strong></p>
            <ul>
              <li>Maintain visual with aircraft</li>
              <li>Control inputs may still work</li>
              <li>Initiate RTH if available</li>
              <li>Use VO for position information</li>
            </ul>

            <p><strong>Controller Low Battery:</strong></p>
            <ul>
              <li>Initiate RTH immediately</li>
              <li>Hot-swap to backup controller if available</li>
              <li>Monitor aircraft return</li>
            </ul>

            <p><strong>App Crash:</strong></p>
            <ul>
              <li>Physical sticks may still work</li>
              <li>RTH button likely still functional</li>
              <li>Restart app while maintaining control</li>
            </ul>

            <div class="warning">
              <h4>Backup Planning</h4>
              <p>Always have a plan for station failure. Know if your RTH button works independently of the app. Consider backup controller for critical missions.</p>
            </div>
          `,
          sequence: 2,
          type: 'procedure',
          estimatedDuration: 8,
          keyPoints: [
            'Multiple failure modes possible',
            'Physical controls often work when displays fail',
            'RTH may function independently of app'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_rpas_equipment_failure',
          questId: 'quest_rpas_emergency',
          slug: 'equipment-aircraft-failure',
          title: 'Equipment & Aircraft Failure',
          content: `
            <h2>In-Flight Equipment Failures</h2>
            <p>Equipment failures on the aircraft require rapid assessment and response.</p>

            <h3>Motor/Propeller Failure</h3>
            <ul>
              <li>Aircraft may still fly with reduced capability</li>
              <li>Reduce altitude immediately</li>
              <li>Head toward safe landing area</li>
              <li>Land as soon as safely possible</li>
            </ul>

            <h3>GPS Failure</h3>
            <ul>
              <li>Aircraft switches to ATTI mode (no position hold)</li>
              <li>Maintain visual reference</li>
              <li>Use manual control to return</li>
              <li>Be aware of drift</li>
            </ul>

            <h3>Battery Failure</h3>
            <ul>
              <li>If voltage drops rapidly—land immediately</li>
              <li>If one cell fails—aircraft may auto-land</li>
              <li>Don't fight emergency landing if battery critical</li>
            </ul>

            <h3>Sensor Failure</h3>
            <ul>
              <li>Compass: May fly erratically, switch to ATTI</li>
              <li>IMU: May be unable to stabilize—land immediately</li>
              <li>Barometer: Altitude may be incorrect</li>
            </ul>

            <div class="key-concept">
              <h4>Partial Capability</h4>
              <p>Modern RPAS can often continue flying with partial failures. The key is recognizing degraded capability and adjusting your actions accordingly.</p>
            </div>
          `,
          sequence: 3,
          type: 'procedure',
          estimatedDuration: 8,
          keyPoints: [
            'Aircraft may fly with partial capability',
            'Reduce altitude and head for safe landing',
            'Know how your aircraft responds to failures'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_rpas_lost_link',
          questId: 'quest_rpas_emergency',
          slug: 'lost-link-procedures',
          title: 'Lost Link Procedures',
          content: `
            <h2>Lost Link Response</h2>
            <p>Lost link—losing communication between ground station and aircraft—is a common concern. Proper planning and response prevent incidents.</p>

            <h3>Lost Link Causes</h3>
            <ul>
              <li>Range exceeded</li>
              <li>Obstacle blocking signal</li>
              <li>Interference from other RF sources</li>
              <li>Equipment malfunction</li>
              <li>Antenna orientation</li>
            </ul>

            <h3>Failsafe Options</h3>
            <ul>
              <li><strong>RTH:</strong> Return to home point</li>
              <li><strong>Land:</strong> Land in current position</li>
              <li><strong>Hover:</strong> Hold position until link restored</li>
              <li><strong>Continue Mission:</strong> Complete waypoint mission</li>
            </ul>

            <h3>Lost Link Response</h3>
            <ol>
              <li>Don't panic—failsafe should activate</li>
              <li>Move to clear area with good signal</li>
              <li>Orient antennas toward aircraft</li>
              <li>Move closer to aircraft if possible</li>
              <li>Monitor for aircraft return</li>
              <li>Have VO track aircraft visually</li>
            </ol>

            <h3>Planning for Lost Link</h3>
            <ul>
              <li>Set appropriate failsafe before flight</li>
              <li>RTH altitude above all obstacles</li>
              <li>Know failsafe delay/timeout</li>
              <li>Brief crew on response</li>
            </ul>

            <div class="warning">
              <h4>RTH Altitude</h4>
              <p>Ensure your RTH altitude is set above all obstacles between the aircraft and home point. A low RTH altitude can result in collision.</p>
            </div>
          `,
          sequence: 4,
          type: 'procedure',
          estimatedDuration: 8,
          keyPoints: [
            'Multiple failsafe options available',
            'Don\'t panic—failsafe should handle it',
            'RTH altitude must clear all obstacles'
          ],
          regulatoryRefs: [
            { type: 'CAR', reference: 'CAR 901.26', section: 'Lost Link Requirements' }
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_rpas_flyaway',
          questId: 'quest_rpas_emergency',
          slug: 'fly-away-response',
          title: 'Fly-Away Response',
          content: `
            <h2>Fly-Away Response</h2>
            <p>A fly-away is an uncontrolled departure of the aircraft. It's a serious emergency requiring immediate action.</p>

            <h3>Fly-Away Causes</h3>
            <ul>
              <li>GPS glitches or spoofing</li>
              <li>Compass interference</li>
              <li>Software/firmware bugs</li>
              <li>Home point error</li>
              <li>RTH triggered incorrectly</li>
            </ul>

            <h3>Immediate Actions</h3>
            <ol>
              <li>Attempt to regain control (switch modes)</li>
              <li>Try manual override</li>
              <li>Trigger emergency stop if available</li>
              <li>Track aircraft position if possible</li>
              <li>Note last known position</li>
              <li>Notify crew and observers</li>
            </ol>

            <h3>If Control Cannot Be Regained</h3>
            <ul>
              <li>Track aircraft as long as possible</li>
              <li>Note direction of travel</li>
              <li>Contact ATC if entering controlled airspace</li>
              <li>Report to Transport Canada as required</li>
              <li>Attempt to locate and recover aircraft</li>
            </ul>

            <h3>Reporting Requirements</h3>
            <p>Fly-aways may require reporting if:</p>
            <ul>
              <li>Aircraft enters controlled airspace</li>
              <li>Aircraft poses risk to persons or property</li>
              <li>Aircraft cannot be recovered</li>
              <li>Required by your operations manual</li>
            </ul>

            <div class="key-concept">
              <h4>Prevention</h4>
              <p>Most fly-aways are preventable: verify home point, calibrate compass away from interference, update firmware, and respect operating limits.</p>
            </div>
          `,
          sequence: 5,
          type: 'procedure',
          estimatedDuration: 8,
          keyPoints: [
            'Attempt manual override immediately',
            'Track aircraft as long as possible',
            'Report as required by regulations'
          ],
          xpReward: 30,
          isActive: true
        }
      ]
    },

    // Quest 6: Post-Flight Operations
    {
      id: 'quest_rpas_postflight',
      trackId: 'track_rpas_operations',
      slug: 'post-flight-operations',
      title: 'Post-Flight Operations',
      description: 'Complete the flight cycle with proper inspection, documentation, and data management.',
      sequence: 6,
      estimatedDuration: 25,
      difficulty: 'beginner',
      objectives: [
        'Conduct thorough post-flight inspection',
        'Complete flight log documentation',
        'Manage data properly'
      ],
      totalLessons: 3,
      xpReward: 90,
      hasQuiz: true,
      hasScenario: false,
      isActive: true,
      lessons: [
        {
          id: 'lesson_rpas_postflight_inspection',
          questId: 'quest_rpas_postflight',
          slug: 'post-flight-inspection',
          title: 'Post-Flight Inspection',
          content: `
            <h2>Post-Flight Inspection</h2>
            <p>Post-flight inspection catches damage and wear before the next flight, maintaining airworthiness.</p>

            <h3>Inspection Areas</h3>
            <ul>
              <li><strong>Airframe:</strong> New damage, cracks, loose parts</li>
              <li><strong>Propellers:</strong> Chips, cracks, debris</li>
              <li><strong>Motors:</strong> Debris, unusual sounds, heat</li>
              <li><strong>Battery:</strong> Swelling, damage, heat, remaining charge</li>
              <li><strong>Payload:</strong> Secure, undamaged, lens clean</li>
              <li><strong>Landing gear:</strong> Damage, alignment</li>
            </ul>

            <h3>Cleaning</h3>
            <ul>
              <li>Remove debris from airframe and motors</li>
              <li>Clean camera lens</li>
              <li>Clear cooling vents</li>
              <li>Wipe off moisture or dust</li>
            </ul>

            <h3>Storage Preparation</h3>
            <ul>
              <li>Remove battery for storage charging</li>
              <li>Secure propellers or remove</li>
              <li>Store in protective case</li>
              <li>Store in appropriate temperature</li>
            </ul>

            <div class="key-concept">
              <h4>Trend Monitoring</h4>
              <p>Note any changes from flight to flight. Gradual wear is normal; sudden changes may indicate developing problems.</p>
            </div>
          `,
          sequence: 1,
          type: 'procedure',
          estimatedDuration: 8,
          keyPoints: [
            'Inspect for damage after every flight',
            'Clean and prepare for storage',
            'Monitor trends over time'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_rpas_flight_log',
          questId: 'quest_rpas_postflight',
          slug: 'flight-log-documentation',
          title: 'Flight Log Documentation',
          content: `
            <h2>Flight Log Documentation</h2>
            <p>Accurate flight logs are required by regulation and valuable for operations management.</p>

            <h3>Required Information</h3>
            <ul>
              <li>Date and time of flight</li>
              <li>Location (coordinates or description)</li>
              <li>PIC name</li>
              <li>Aircraft identification</li>
              <li>Flight duration</li>
              <li>Purpose of flight</li>
              <li>Weather conditions</li>
              <li>Any incidents or observations</li>
            </ul>

            <h3>Additional Useful Information</h3>
            <ul>
              <li>Battery serial numbers and cycles</li>
              <li>Number of takeoffs/landings</li>
              <li>Payload configuration</li>
              <li>Crew members</li>
              <li>Client/project reference</li>
              <li>Altitude and distance maximums</li>
            </ul>

            <h3>Log Format</h3>
            <p>Use consistent format—electronic or paper:</p>
            <ul>
              <li>Digital apps can capture automatically</li>
              <li>Paper logs must be legible and complete</li>
              <li>Back up electronic logs regularly</li>
              <li>Retain logs per regulatory requirements</li>
            </ul>

            <div class="warning">
              <h4>Retention Requirements</h4>
              <p>Flight logs must be retained for a minimum period as specified by Transport Canada. Know your retention requirements and maintain compliance.</p>
            </div>
          `,
          sequence: 2,
          type: 'procedure',
          estimatedDuration: 8,
          keyPoints: [
            'Log all required information',
            'Use consistent format',
            'Retain logs per requirements'
          ],
          regulatoryRefs: [
            { type: 'CAR', reference: 'CAR 901.58', section: 'Record Keeping' }
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_rpas_data_management',
          questId: 'quest_rpas_postflight',
          slug: 'data-management',
          title: 'Data Management',
          content: `
            <h2>Data Management</h2>
            <p>Proper data management ensures mission data is preserved and can be delivered to clients.</p>

            <h3>Data Transfer</h3>
            <ul>
              <li>Download data from SD cards</li>
              <li>Verify transfer complete and files intact</li>
              <li>Organize by project/date</li>
              <li>Create backup copies</li>
            </ul>

            <h3>Data Organization</h3>
            <p>Consistent folder structure:</p>
            <ul>
              <li>Project/Client</li>
              <li>Date</li>
              <li>Flight number</li>
              <li>Raw data</li>
              <li>Processed data</li>
            </ul>

            <h3>Quality Check</h3>
            <ul>
              <li>Review sample images/video</li>
              <li>Check for missing coverage</li>
              <li>Verify image quality (blur, exposure)</li>
              <li>Confirm metadata (GPS tags, timestamps)</li>
            </ul>

            <h3>Data Security</h3>
            <ul>
              <li>Format SD cards after confirmed backup</li>
              <li>Secure storage of client data</li>
              <li>Encrypt sensitive data</li>
              <li>Clear data per client agreement</li>
            </ul>

            <div class="key-concept">
              <h4>3-2-1 Backup Rule</h4>
              <p>3 copies of data, on 2 different media types, with 1 copy offsite. This protects against most data loss scenarios.</p>
            </div>
          `,
          sequence: 3,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Transfer and verify all data',
            'Organize consistently',
            'Maintain backups (3-2-1 rule)'
          ],
          xpReward: 30,
          isActive: true
        }
      ]
    },

    // Quest 7: Maintenance & Airworthiness
    {
      id: 'quest_rpas_maintenance',
      trackId: 'track_rpas_operations',
      slug: 'maintenance-airworthiness',
      title: 'Maintenance & Airworthiness',
      description: 'Understand maintenance requirements and airworthiness documentation for RPAS.',
      sequence: 7,
      estimatedDuration: 35,
      difficulty: 'intermediate',
      objectives: [
        'Follow scheduled maintenance procedures',
        'Troubleshoot common issues',
        'Manage firmware and software updates',
        'Maintain airworthiness documentation'
      ],
      totalLessons: 4,
      xpReward: 120,
      hasQuiz: true,
      hasFinalAssessment: true,
      finalAssessmentQuestions: 30,
      isActive: true,
      lessons: [
        {
          id: 'lesson_rpas_scheduled_maint',
          questId: 'quest_rpas_maintenance',
          slug: 'scheduled-maintenance',
          title: 'Scheduled Maintenance',
          content: `
            <h2>Scheduled Maintenance</h2>
            <p>Regular maintenance prevents failures and extends aircraft life. Follow manufacturer recommendations.</p>

            <h3>Maintenance Intervals</h3>
            <ul>
              <li><strong>Pre-flight:</strong> Every flight</li>
              <li><strong>Post-flight:</strong> Every flight</li>
              <li><strong>Periodic:</strong> Every X hours or cycles</li>
              <li><strong>Calendar:</strong> Monthly, quarterly, annually</li>
            </ul>

            <h3>Common Maintenance Items</h3>
            <ul>
              <li>Propeller inspection and replacement</li>
              <li>Motor cleaning and inspection</li>
              <li>Landing gear inspection</li>
              <li>Battery cycle tracking</li>
              <li>Gimbal calibration</li>
              <li>Compass calibration</li>
              <li>Firmware updates</li>
            </ul>

            <h3>Replacement Schedules</h3>
            <p>Typical replacement intervals (vary by manufacturer):</p>
            <ul>
              <li>Propellers: 50-200 hours or any damage</li>
              <li>Batteries: 200-400 cycles or degraded capacity</li>
              <li>Motors: 500+ hours or bearing noise</li>
            </ul>

            <div class="key-concept">
              <h4>Follow the Manual</h4>
              <p>Manufacturer maintenance schedules are based on engineering data. Following them keeps the aircraft airworthy; ignoring them voids warranties and invites failures.</p>
            </div>
          `,
          sequence: 1,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'Follow manufacturer maintenance schedules',
            'Track hours, cycles, and calendar intervals',
            'Replace components per recommendations'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_rpas_troubleshooting',
          questId: 'quest_rpas_maintenance',
          slug: 'troubleshooting-common-issues',
          title: 'Troubleshooting Common Issues',
          content: `
            <h2>Troubleshooting Common Issues</h2>
            <p>Being able to diagnose and fix common issues keeps your aircraft operational.</p>

            <h3>Aircraft Won't Arm</h3>
            <ul>
              <li>Check battery connection and charge</li>
              <li>Verify GPS lock if required</li>
              <li>Check compass calibration status</li>
              <li>Look for error messages in app</li>
              <li>Verify propellers installed correctly</li>
            </ul>

            <h3>Unstable Flight</h3>
            <ul>
              <li>Compass interference—recalibrate away from metal</li>
              <li>Propeller damage or imbalance</li>
              <li>Motor issues—listen for unusual sounds</li>
              <li>IMU calibration needed</li>
              <li>Payload affecting balance</li>
            </ul>

            <h3>Poor Range/Signal</h3>
            <ul>
              <li>Check antenna orientation</li>
              <li>Remove obstacles between pilot and aircraft</li>
              <li>Check for interference sources</li>
              <li>Verify firmware compatibility</li>
            </ul>

            <h3>Drifting Position</h3>
            <ul>
              <li>Check GPS satellite count</li>
              <li>Wait for better GPS lock</li>
              <li>Compass interference</li>
              <li>Wind beyond compensation</li>
            </ul>

            <div class="warning">
              <h4>Know Your Limits</h4>
              <p>Some issues require manufacturer service. Don't attempt repairs beyond your training—you may cause more damage or create safety hazards.</p>
            </div>
          `,
          sequence: 2,
          type: 'content',
          estimatedDuration: 10,
          keyPoints: [
            'Systematic troubleshooting finds root causes',
            'Many issues have common solutions',
            'Know when to seek professional service'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_rpas_firmware',
          questId: 'quest_rpas_maintenance',
          slug: 'firmware-software-updates',
          title: 'Firmware & Software Updates',
          content: `
            <h2>Firmware and Software Management</h2>
            <p>Keeping firmware and software current is essential for safety and functionality.</p>

            <h3>Update Best Practices</h3>
            <ul>
              <li>Read release notes before updating</li>
              <li>Back up current settings</li>
              <li>Use reliable power during updates</li>
              <li>Don't interrupt update process</li>
              <li>Verify successful update</li>
              <li>Test aircraft after updates</li>
            </ul>

            <h3>When to Update</h3>
            <ul>
              <li><strong>Always:</strong> Safety-critical updates</li>
              <li><strong>Usually:</strong> Bug fixes, stability improvements</li>
              <li><strong>Consider:</strong> New features if needed</li>
              <li><strong>Caution:</strong> Major version updates—test first</li>
            </ul>

            <h3>Version Compatibility</h3>
            <ul>
              <li>Controller and aircraft must be compatible</li>
              <li>App version must match firmware</li>
              <li>Some updates are mandatory</li>
            </ul>

            <h3>After Updates</h3>
            <ul>
              <li>Verify all calibrations still valid</li>
              <li>Check settings haven't reset</li>
              <li>Conduct a test flight in safe area</li>
              <li>Document update in maintenance log</li>
            </ul>

            <div class="key-concept">
              <h4>If It Works, Be Careful</h4>
              <p>"If it ain't broke, don't fix it" has some merit with firmware. But security and safety updates should never be skipped.</p>
            </div>
          `,
          sequence: 3,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Follow update best practices',
            'Don\'t skip safety-critical updates',
            'Test after any updates'
          ],
          xpReward: 30,
          isActive: true
        },
        {
          id: 'lesson_rpas_airworthiness_docs',
          questId: 'quest_rpas_maintenance',
          slug: 'airworthiness-documentation',
          title: 'Airworthiness Documentation',
          content: `
            <h2>Airworthiness Documentation</h2>
            <p>Proper documentation demonstrates the aircraft is maintained and safe for flight.</p>

            <h3>Required Documentation</h3>
            <ul>
              <li><strong>Aircraft Record:</strong> Identity, specifications, serial numbers</li>
              <li><strong>Maintenance Log:</strong> All maintenance performed</li>
              <li><strong>Flight Log:</strong> All flights performed</li>
              <li><strong>Component Logs:</strong> Battery cycles, propeller hours</li>
            </ul>

            <h3>Maintenance Log Contents</h3>
            <ul>
              <li>Date of maintenance</li>
              <li>Description of work performed</li>
              <li>Parts replaced</li>
              <li>Person performing maintenance</li>
              <li>Aircraft hours/cycles at time of maintenance</li>
              <li>Next scheduled maintenance</li>
            </ul>

            <h3>Determining Airworthiness</h3>
            <p>Before each flight, verify:</p>
            <ul>
              <li>All required maintenance current</li>
              <li>No outstanding defects</li>
              <li>All components within life limits</li>
              <li>Pre-flight inspection satisfactory</li>
            </ul>

            <div class="key-takeaway">
              <h4>Track Completion</h4>
              <p>Congratulations on completing the RPAS Flight Operations track! You now have a solid foundation in flight operations—from pre-flight through post-flight, including emergency response. Apply this knowledge consistently in every operation.</p>
            </div>
          `,
          sequence: 4,
          type: 'content',
          estimatedDuration: 8,
          keyPoints: [
            'Maintain aircraft, maintenance, and flight logs',
            'Document all maintenance performed',
            'Verify airworthiness before each flight'
          ],
          regulatoryRefs: [
            { type: 'CAR', reference: 'CAR 571.02', section: 'Aircraft Maintenance' }
          ],
          xpReward: 30,
          isActive: true
        }
      ]
    }
  ]
}

export default rpasOpsTrack
