/**
 * Specialized Operations Quest Track
 *
 * Training for operation-specific scenarios including infrastructure inspection,
 * survey/mapping, agricultural operations, marine/coastal, night/BVLOS, and emergency response.
 *
 * @version 1.0.0
 */

const specializedOpsTrack = {
  id: 'specializedOps',
  slug: 'specialized-operations',
  title: 'Specialized Operations',
  description: 'Master operation-specific procedures for infrastructure inspection, survey/mapping, agricultural, marine/coastal, night/BVLOS, and emergency response support operations.',
  category: 'specialized',
  icon: 'Briefcase',
  color: 'orange',
  difficulty: 'advanced',
  estimatedHours: 6,
  totalXp: 800,
  prerequisites: ['rpas-ops', 'regulatory'],
  badge: {
    id: 'operations-specialist',
    name: 'Operations Specialist',
    description: 'Demonstrated expertise in specialized RPAS operation types',
    icon: 'Briefcase',
    rarity: 'epic',
    xpBonus: 200
  },
  quests: [
    // ========================================
    // QUEST 1: Infrastructure Inspection
    // ========================================
    {
      id: 'infrastructure-inspection',
      trackId: 'specialized-ops',
      title: 'Infrastructure Inspection',
      description: 'Learn specialized procedures for inspecting powerlines, towers, pipelines, and other critical infrastructure using RPAS.',
      order: 1,
      xpReward: 150,
      estimatedTime: 50,
      scenarioId: 'infrastructure-mission',
      lessons: [
        {
          id: 'powerline-utility-operations',
          questId: 'infrastructure-inspection',
          title: 'Powerline & Utility Operations',
          order: 1,
          xpReward: 25,
          content: {
            sections: [
              {
                type: 'intro',
                title: 'High-Voltage Environment Operations',
                content: 'Powerline and utility inspection represents one of the most common and valuable RPAS applications, but it comes with unique electromagnetic and physical hazards that require specialized procedures and equipment considerations.'
              },
              {
                type: 'concept',
                title: 'Understanding EMI in Utility Environments',
                content: 'High-voltage transmission lines create strong electromagnetic fields that can interfere with RPAS navigation and control systems. Understanding these effects is critical for safe operations.',
                keyPoints: [
                  'Corona discharge from high-voltage lines creates RF interference',
                  'GPS accuracy may be degraded near transmission infrastructure',
                  'Compass/magnetometer readings can be affected by power lines',
                  'Effects vary with voltage level and conductor configuration'
                ]
              },
              {
                type: 'procedure',
                title: 'Pre-Flight EMI Assessment',
                steps: [
                  'Research transmission line voltage and type',
                  'Identify safe standoff distances for equipment',
                  'Test GPS signal quality at planned operating altitudes',
                  'Verify compass calibration away from infrastructure',
                  'Establish manual override readiness procedures'
                ]
              },
              {
                type: 'table',
                title: 'Minimum Standoff Distances',
                headers: ['Voltage Class', 'Minimum Horizontal', 'Minimum Vertical', 'Notes'],
                rows: [
                  ['< 69 kV', '5 m', '5 m', 'Distribution lines'],
                  ['69-230 kV', '10 m', '10 m', 'Sub-transmission'],
                  ['230-500 kV', '15 m', '15 m', 'High-voltage transmission'],
                  ['> 500 kV', '20 m', '20 m', 'Extra high voltage']
                ]
              },
              {
                type: 'warning',
                title: 'Critical Safety',
                content: 'Always coordinate with utility owners before conducting inspections. They may need to de-energize lines or provide safety escorts. Never assume a line is de-energized based on visual appearance.'
              },
              {
                type: 'checklist',
                title: 'Utility Inspection Equipment',
                items: [
                  'Aircraft with EMI shielding or tolerance',
                  'Thermal imaging camera for hot spot detection',
                  'High-resolution visual camera (≥ 20 MP)',
                  'Zoom lens capability (30x optical minimum)',
                  'Redundant GPS/GNSS systems',
                  'Manual flight mode capability'
                ]
              }
            ]
          }
        },
        {
          id: 'tower-structure-inspection',
          questId: 'infrastructure-inspection',
          title: 'Tower & Structure Inspection',
          order: 2,
          xpReward: 25,
          content: {
            sections: [
              {
                type: 'intro',
                title: 'Vertical Structure Operations',
                content: 'Inspecting towers, monopoles, lattice structures, and buildings requires careful flight planning to capture all surfaces while managing GPS challenges near large metal structures.'
              },
              {
                type: 'concept',
                title: 'Orbital Flight Patterns',
                content: 'Orbital flight patterns allow systematic capture of cylindrical and lattice structures from multiple angles and elevations.',
                keyPoints: [
                  'Plan concentric orbits at multiple elevations',
                  'Typical orbit spacing: 5-10 meters vertical',
                  'Maintain consistent standoff distance throughout orbit',
                  'Account for wind effects on orbital stability',
                  'Use POI (Point of Interest) mode when available'
                ]
              },
              {
                type: 'diagram',
                title: 'Tower Inspection Pattern',
                description: 'Start at base, conduct ascending spiral orbits, capture apex detail, then descending spiral on opposite face. Typical inspection requires 3-4 complete orbits at different heights.'
              },
              {
                type: 'procedure',
                title: 'Cell Tower Inspection Workflow',
                steps: [
                  'Capture wide establishing shots from 4 cardinal directions',
                  'Begin low orbit capturing mount points and cable routing',
                  'Ascend in 5-10m increments, orbiting each level',
                  'Document all antennas, equipment, and attachments',
                  'Capture apex and lightning protection in detail',
                  'Perform final high orbit for overview documentation'
                ]
              },
              {
                type: 'tip',
                title: 'GPS Multipath Mitigation',
                content: 'Large metal structures cause GPS multipath errors. Maintain minimum 15m standoff when possible. Use visual positioning systems or manual flight mode near structure surfaces.'
              },
              {
                type: 'list',
                title: 'Common Inspection Points',
                items: [
                  'Structural connections and fasteners',
                  'Corrosion or rust patterns',
                  'Guy wire attachment points and tension',
                  'Antenna alignment and mounting hardware',
                  'Lightning protection system continuity',
                  'Cable routing and weather sealing',
                  'Obstruction lighting condition',
                  'Bird/wildlife nesting or damage'
                ]
              }
            ]
          }
        },
        {
          id: 'pipeline-monitoring',
          questId: 'infrastructure-inspection',
          title: 'Pipeline Monitoring',
          order: 3,
          xpReward: 25,
          content: {
            sections: [
              {
                type: 'intro',
                title: 'Linear Infrastructure Inspection',
                content: 'Pipeline right-of-way monitoring presents unique challenges with long linear distances, multiple detection requirements, and the need to identify subtle environmental changes indicating potential issues.'
              },
              {
                type: 'concept',
                title: 'Pipeline Inspection Objectives',
                content: 'RPAS pipeline inspection serves multiple purposes requiring different sensor configurations and flight profiles.',
                keyPoints: [
                  'Right-of-way encroachment detection',
                  'Vegetation management assessment',
                  'Third-party activity monitoring',
                  'Leak detection (thermal, multispectral)',
                  'Ground movement or subsidence identification',
                  'Marker and signage verification'
                ]
              },
              {
                type: 'procedure',
                title: 'Pipeline Survey Flight Planning',
                steps: [
                  'Obtain accurate pipeline centerline coordinates',
                  'Plan flight path offset from centerline (typically 20-50m)',
                  'Configure terrain following for consistent AGL',
                  'Plan turnaround points at segment boundaries',
                  'Identify landing zones every 10-15 km for battery changes',
                  'Document all road crossings and access points'
                ]
              },
              {
                type: 'table',
                title: 'Detection Requirements by Objective',
                headers: ['Objective', 'Altitude (AGL)', 'Sensor', 'GSD Target'],
                rows: [
                  ['ROW Overview', '120 m', 'RGB Visual', '3 cm/px'],
                  ['Encroachment Detail', '60 m', 'RGB Visual', '1.5 cm/px'],
                  ['Vegetation Health', '100 m', 'NDVI/Multispectral', '5 cm/px'],
                  ['Leak Detection', '30-60 m', 'Thermal IR', '10 cm/px'],
                  ['Ground Movement', '80 m', 'LiDAR', 'Point density 25/m²']
                ]
              },
              {
                type: 'warning',
                title: 'Cathodic Protection Interference',
                content: 'Buried pipelines use cathodic protection systems that can interfere with magnetometers. Maintain minimum 30m horizontal separation when flying compass-dependent missions.'
              },
              {
                type: 'checklist',
                title: 'Pipeline Mission Kit',
                items: [
                  'Long-endurance aircraft (45+ min flight time)',
                  'Terrain following capability',
                  'Appropriate sensor payload (RGB, thermal, multi-spectral)',
                  'RTK/PPK GPS for accurate georeferencing',
                  'GCS with pipeline centerline overlay',
                  'Multiple battery sets for continuous operations',
                  'Vehicle-based mobile GCS for crew leap-frogging'
                ]
              }
            ]
          }
        },
        {
          id: 'electromagnetic-considerations',
          questId: 'infrastructure-inspection',
          title: 'Electromagnetic Considerations',
          order: 4,
          xpReward: 25,
          content: {
            sections: [
              {
                type: 'intro',
                title: 'Managing EMI in Infrastructure Operations',
                content: 'Electromagnetic interference (EMI) is a constant consideration when operating near power infrastructure, communications towers, and industrial facilities. Understanding sources and mitigation strategies is essential for safe operations.'
              },
              {
                type: 'concept',
                title: 'EMI Sources and Effects',
                content: 'Different infrastructure types create different electromagnetic environments affecting various aircraft systems.',
                keyPoints: [
                  'High-voltage lines: Compass deviation, GPS multipath',
                  'Cell towers: RF interference with video links',
                  'Radar installations: Control link disruption',
                  'Industrial facilities: Broadband RF noise',
                  'Substations: Intense localized EMI fields'
                ]
              },
              {
                type: 'table',
                title: 'System Vulnerability to EMI',
                headers: ['System', 'Vulnerability Level', 'Failure Mode', 'Mitigation'],
                rows: [
                  ['Magnetometer', 'High', 'Incorrect heading', 'Manual mode, visual navigation'],
                  ['GPS', 'Medium', 'Position drift', 'RTK, visual positioning'],
                  ['Control Link', 'Medium', 'Range reduction', 'Frequency diversity, higher power'],
                  ['Video Link', 'Medium-High', 'Signal loss', 'Digital links, shielding'],
                  ['Flight Controller', 'Low', 'Processor errors', 'Shielded enclosures']
                ]
              },
              {
                type: 'procedure',
                title: 'EMI Assessment Protocol',
                steps: [
                  'Research known EMI sources at site',
                  'Conduct pre-flight hover test at safe distance',
                  'Monitor telemetry for anomalies during approach',
                  'Establish minimum operating distances',
                  'Define abort criteria for EMI-related anomalies',
                  'Prepare manual takeover procedures'
                ]
              },
              {
                type: 'warning',
                title: 'Control Link Priority',
                content: 'If control link shows degradation near infrastructure, immediately increase distance. Loss of control link in proximity to structures significantly increases collision risk.'
              },
              {
                type: 'list',
                title: 'EMI Mitigation Strategies',
                items: [
                  'Use EMI-hardened aircraft for infrastructure work',
                  'Enable redundant navigation systems',
                  'Fly in ATTI/manual modes near strong fields',
                  'Maintain situational awareness for compass deviation',
                  'Configure geofencing as backup safety layer',
                  'Use visual line of sight as primary reference',
                  'Brief crew on EMI-related emergency procedures'
                ]
              },
              {
                type: 'tip',
                title: 'Compass Calibration',
                content: 'Always calibrate compass at launch site but away from infrastructure. If launched from a vehicle, move aircraft at least 50m away for calibration.'
              }
            ]
          }
        }
      ],
      quiz: {
        id: 'infrastructure-inspection-quiz',
        questId: 'infrastructure-inspection',
        title: 'Infrastructure Inspection Assessment',
        passingScore: 80,
        questions: [
          {
            id: 'ii-q1',
            type: 'multiple-choice',
            question: 'What minimum standoff distance is recommended for 230-500 kV transmission lines?',
            options: ['5 meters', '10 meters', '15 meters', '20 meters'],
            correctAnswer: 2,
            explanation: '15 meters is the minimum standoff distance for high-voltage transmission lines (230-500 kV) to ensure both physical safety and reduced EMI effects on aircraft systems.'
          },
          {
            id: 'ii-q2',
            type: 'multiple-choice',
            question: 'When inspecting a tower, what flight pattern is typically most effective?',
            options: ['Linear passes', 'Grid pattern', 'Orbital/spiral pattern', 'Random approach'],
            correctAnswer: 2,
            explanation: 'Orbital or spiral patterns allow systematic capture of all surfaces of cylindrical and lattice structures from consistent distances while ascending or descending.'
          },
          {
            id: 'ii-q3',
            type: 'multiple-choice',
            question: 'Which aircraft system is MOST vulnerable to EMI from high-voltage power lines?',
            options: ['Flight controller processor', 'GPS receiver', 'Magnetometer/compass', 'Motor controllers'],
            correctAnswer: 2,
            explanation: 'The magnetometer/compass is most vulnerable to EMI from power lines because it directly measures magnetic fields, which are distorted by the electromagnetic fields around power infrastructure.'
          },
          {
            id: 'ii-q4',
            type: 'multiple-choice',
            question: 'For pipeline thermal leak detection, what altitude range is typically used?',
            options: ['10-20 m AGL', '30-60 m AGL', '100-120 m AGL', '150+ m AGL'],
            correctAnswer: 1,
            explanation: '30-60 m AGL provides optimal thermal resolution for detecting temperature anomalies associated with pipeline leaks while maintaining efficient coverage.'
          },
          {
            id: 'ii-q5',
            type: 'multiple-choice',
            question: 'What should be the FIRST action when telemetry shows anomalies during approach to infrastructure?',
            options: ['Land immediately', 'Continue approach cautiously', 'Increase distance from infrastructure', 'Switch to manual mode'],
            correctAnswer: 2,
            explanation: 'Increasing distance is the appropriate first response to EMI-related anomalies. This allows assessment of the issue from a safer position before deciding on further action.'
          }
        ]
      }
    },

    // ========================================
    // QUEST 2: Survey & Mapping
    // ========================================
    {
      id: 'survey-mapping',
      trackId: 'specialized-ops',
      title: 'Survey & Mapping',
      description: 'Master aerial survey and photogrammetry techniques for accurate mapping, volumetric analysis, and geospatial data collection.',
      order: 2,
      xpReward: 130,
      estimatedTime: 45,
      lessons: [
        {
          id: 'photogrammetry-fundamentals',
          questId: 'survey-mapping',
          title: 'Photogrammetry Fundamentals',
          order: 1,
          xpReward: 25,
          content: {
            sections: [
              {
                type: 'intro',
                title: 'The Science of Aerial Mapping',
                content: 'Photogrammetry extracts three-dimensional measurements from photographs. Understanding its principles is essential for planning flights that produce accurate, complete datasets.'
              },
              {
                type: 'concept',
                title: 'How Photogrammetry Works',
                content: 'Photogrammetry software identifies common points across overlapping images and uses triangulation to calculate 3D positions.',
                keyPoints: [
                  'Each ground point must appear in multiple images',
                  'Overlap between images enables point matching',
                  'Camera position and orientation are solved simultaneously',
                  'Output includes point clouds, meshes, and orthomosaics',
                  'Accuracy depends on image quality and ground control'
                ]
              },
              {
                type: 'table',
                title: 'Key Photogrammetry Terms',
                headers: ['Term', 'Definition', 'Typical Value'],
                rows: [
                  ['GSD', 'Ground Sample Distance - size of one pixel on ground', '1-5 cm'],
                  ['Forward Overlap', 'Image overlap in flight direction', '75-85%'],
                  ['Side Overlap', 'Overlap between flight lines', '65-75%'],
                  ['Orthomosaic', 'Geometrically corrected, scaled image', 'N/A'],
                  ['DSM', 'Digital Surface Model - top of objects', '2x GSD accuracy'],
                  ['DTM', 'Digital Terrain Model - ground surface', 'Requires filtering']
                ]
              },
              {
                type: 'formula',
                title: 'GSD Calculation',
                content: 'GSD = (Flight Height × Sensor Width) / (Focal Length × Image Width)',
                example: 'Example: At 100m AGL with 6.3mm sensor width, 8.8mm focal length, 4000px image width: GSD = (100 × 6.3) / (8.8 × 4000) = 1.79 cm/pixel'
              },
              {
                type: 'tip',
                title: 'Overlap Guidelines',
                content: 'Higher overlap improves accuracy but increases flight time and processing. For flat terrain, 75/65 (forward/side) is sufficient. For complex terrain or vertical surfaces, increase to 85/75 or higher.'
              }
            ]
          }
        },
        {
          id: 'ground-control-points',
          questId: 'survey-mapping',
          title: 'Ground Control Points',
          order: 2,
          xpReward: 25,
          content: {
            sections: [
              {
                type: 'intro',
                title: 'Establishing Absolute Accuracy',
                content: 'Ground Control Points (GCPs) are surveyed reference points visible in aerial imagery that tie photogrammetric outputs to real-world coordinates with centimeter-level accuracy.'
              },
              {
                type: 'concept',
                title: 'Why GCPs Matter',
                content: 'Without GCPs, photogrammetry outputs are only relatively accurate. GCPs provide absolute accuracy required for engineering, construction, and regulatory compliance.',
                keyPoints: [
                  'Aircraft GPS alone provides 2-5m accuracy',
                  'GCPs can achieve 1-3 cm horizontal accuracy',
                  'Minimum 5 GCPs recommended (4 corners + center)',
                  'More GCPs improve accuracy and error detection',
                  'GCP accuracy should exceed target survey accuracy'
                ]
              },
              {
                type: 'procedure',
                title: 'GCP Placement Protocol',
                steps: [
                  'Plan GCP locations to cover survey extent evenly',
                  'Place GCPs in flat, open areas visible from air',
                  'Avoid placing near edges of planned flight area',
                  'Ensure GCPs contrast with surrounding surface',
                  'Survey each GCP with RTK GPS or total station',
                  'Record coordinates in project coordinate system',
                  'Document each GCP with ground-level photos'
                ]
              },
              {
                type: 'table',
                title: 'GCP Target Specifications',
                headers: ['Survey Accuracy', 'Target Size', 'Minimum GCPs', 'Recommended GCPs'],
                rows: [
                  ['Engineering (1-2 cm)', '60 cm+', '5', '8-12'],
                  ['Construction (3-5 cm)', '45 cm+', '5', '6-8'],
                  ['General mapping (10 cm)', '30 cm+', '4', '5-6'],
                  ['Overview (<30 cm)', '20 cm+', '3', '4-5']
                ]
              },
              {
                type: 'warning',
                title: 'GCP Visibility',
                content: 'GCPs must be clearly visible in imagery. Ensure target size produces at least 10 pixels in images at planned GSD. For 2 cm GSD, targets should be at least 20 cm.'
              },
              {
                type: 'tip',
                title: 'Check Points',
                content: 'Place additional surveyed points not used in processing to serve as check points. These validate final accuracy without influencing the solution.'
              }
            ]
          }
        },
        {
          id: 'flight-planning-accuracy',
          questId: 'survey-mapping',
          title: 'Flight Planning for Accuracy',
          order: 3,
          xpReward: 25,
          content: {
            sections: [
              {
                type: 'intro',
                title: 'Systematic Survey Flight Design',
                content: 'Accurate photogrammetric outputs begin with proper flight planning. Understanding the relationships between flight parameters and accuracy ensures efficient data collection.'
              },
              {
                type: 'concept',
                title: 'Flight Parameters That Affect Accuracy',
                content: 'Multiple interrelated parameters determine final survey accuracy and completeness.',
                keyPoints: [
                  'Lower altitude = smaller GSD = higher detail',
                  'Higher overlap = better point matching = more accuracy',
                  'Consistent altitude = uniform GSD across project',
                  'Perpendicular flight lines improve geometry',
                  'Cross-hatch patterns essential for 3D reconstruction'
                ]
              },
              {
                type: 'procedure',
                title: 'Survey Mission Planning Steps',
                steps: [
                  'Define survey boundaries and accuracy requirements',
                  'Calculate required GSD from accuracy specifications',
                  'Determine flight altitude from GSD calculation',
                  'Set overlap percentages based on terrain complexity',
                  'Generate flight lines covering entire area plus buffer',
                  'Add cross-hatch pattern for 3D accuracy',
                  'Verify battery requirements and plan segments',
                  'Identify GCP placement locations'
                ]
              },
              {
                type: 'table',
                title: 'Overlap Recommendations by Terrain',
                headers: ['Terrain Type', 'Forward Overlap', 'Side Overlap', 'Notes'],
                rows: [
                  ['Flat (parking lot)', '75%', '65%', 'Standard coverage'],
                  ['Gentle slopes', '80%', '70%', 'Account for perspective'],
                  ['Steep terrain', '85%', '75%', 'Variable height above ground'],
                  ['Vertical surfaces', '85%+', '75%+', 'Add oblique passes'],
                  ['Dense vegetation', '85%', '80%', 'Penetration varies']
                ]
              },
              {
                type: 'tip',
                title: 'Terrain Following',
                content: 'Enable terrain following to maintain consistent AGL over variable terrain. This ensures uniform GSD and overlap across the survey area.'
              },
              {
                type: 'checklist',
                title: 'Pre-Survey Verification',
                items: [
                  'Flight plan reviewed for complete coverage',
                  'GSD meets accuracy requirements',
                  'Overlap settings appropriate for terrain',
                  'Battery capacity covers planned flight time',
                  'GCP locations accessible and visible',
                  'Weather suitable (no harsh shadows, moderate wind)',
                  'Sun angle acceptable (>30° elevation)',
                  'Camera settings optimized for conditions'
                ]
              }
            ]
          }
        },
        {
          id: 'data-quality-assurance',
          questId: 'survey-mapping',
          title: 'Data Quality Assurance',
          order: 4,
          xpReward: 25,
          content: {
            sections: [
              {
                type: 'intro',
                title: 'Ensuring Deliverable Quality',
                content: 'Quality assurance must occur at every stage - from field data collection through final deliverable generation. Catching issues early prevents costly reflights and reprocessing.'
              },
              {
                type: 'concept',
                title: 'Quality Control Checkpoints',
                content: 'Effective QA/QC involves systematic checks at multiple stages of the survey workflow.',
                keyPoints: [
                  'Pre-flight: Equipment calibration and settings',
                  'In-flight: Coverage monitoring and image preview',
                  'Post-flight: Image quality and completeness review',
                  'Processing: Error reports and accuracy assessment',
                  'Deliverable: Accuracy verification against check points'
                ]
              },
              {
                type: 'procedure',
                title: 'Field Quality Checks',
                steps: [
                  'Review sample images for focus and exposure',
                  'Verify GPS lock quality and PDOP values',
                  'Check image count against flight plan estimate',
                  'Confirm coverage by reviewing flight log',
                  'Inspect GCPs for visibility in imagery',
                  'Note any gaps requiring reflying'
                ]
              },
              {
                type: 'table',
                title: 'Image Quality Criteria',
                headers: ['Parameter', 'Acceptable', 'Ideal', 'Action if Failed'],
                rows: [
                  ['Focus', 'Sharp across 80%', 'Sharp edge-to-edge', 'Adjust focus, reflight'],
                  ['Exposure', 'Histogram not clipped', 'Centered histogram', 'Adjust settings'],
                  ['Motion blur', 'None visible at 100%', 'Tack sharp at 200%', 'Reduce speed'],
                  ['Coverage gaps', '<5% area', '0%', 'Fill flight required'],
                  ['Overlap achieved', 'Within 5% of planned', 'Meets plan', 'Partial reflight']
                ]
              },
              {
                type: 'list',
                title: 'Processing Quality Metrics',
                items: [
                  'RMS error on GCPs (should be < 2x target accuracy)',
                  'Check point residuals (independent accuracy validation)',
                  'Point cloud density (points per m²)',
                  'Number of images aligned (100% expected)',
                  'Reprojection error (< 1 pixel typical)',
                  'Orthomosaic seamlines (no visible artifacts)'
                ]
              },
              {
                type: 'warning',
                title: 'Document Everything',
                content: 'Maintain complete documentation including flight logs, GCP surveys, processing reports, and accuracy assessments. This documentation may be required for regulatory or legal purposes.'
              }
            ]
          }
        }
      ],
      quiz: {
        id: 'survey-mapping-quiz',
        questId: 'survey-mapping',
        title: 'Survey & Mapping Assessment',
        passingScore: 80,
        questions: [
          {
            id: 'sm-q1',
            type: 'multiple-choice',
            question: 'What is Ground Sample Distance (GSD)?',
            options: ['Height above ground level', 'Distance between flight lines', 'Size of one pixel on the ground', 'Number of images per survey'],
            correctAnswer: 2,
            explanation: 'GSD (Ground Sample Distance) is the size that one pixel in an image represents on the ground. A 2 cm GSD means each pixel covers a 2cm × 2cm area on the ground.'
          },
          {
            id: 'sm-q2',
            type: 'multiple-choice',
            question: 'What is the MINIMUM recommended number of GCPs for engineering-grade surveys?',
            options: ['3', '5', '10', '15'],
            correctAnswer: 1,
            explanation: 'A minimum of 5 GCPs is recommended for engineering-grade surveys, though 8-12 GCPs are recommended for best results and error detection.'
          },
          {
            id: 'sm-q3',
            type: 'multiple-choice',
            question: 'What forward overlap is recommended for steep terrain?',
            options: ['65%', '75%', '85%', '95%'],
            correctAnswer: 2,
            explanation: '85% forward overlap is recommended for steep terrain to account for the variable height above ground and changing perspective angles.'
          },
          {
            id: 'sm-q4',
            type: 'multiple-choice',
            question: 'What sun angle elevation is the minimum for quality survey imagery?',
            options: ['15°', '30°', '45°', '60°'],
            correctAnswer: 1,
            explanation: 'Sun angles below 30° create harsh shadows that interfere with photogrammetric processing. Survey flights should be planned when sun elevation exceeds 30°.'
          },
          {
            id: 'sm-q5',
            type: 'multiple-choice',
            question: 'What is the purpose of "check points" in a survey project?',
            options: ['To mark flight path', 'To verify accuracy without influencing the solution', 'To indicate battery change locations', 'To mark hazardous areas'],
            correctAnswer: 1,
            explanation: 'Check points are surveyed points not used in processing that serve to independently validate the accuracy of the final photogrammetric solution.'
          }
        ]
      }
    },

    // ========================================
    // QUEST 3: Agricultural Operations
    // ========================================
    {
      id: 'agricultural-operations',
      trackId: 'specialized-ops',
      title: 'Agricultural Operations',
      description: 'Learn RPAS applications in agriculture including crop monitoring, precision spraying, livestock management, and agricultural airspace considerations.',
      order: 3,
      xpReward: 130,
      estimatedTime: 40,
      lessons: [
        {
          id: 'crop-monitoring',
          questId: 'agricultural-operations',
          title: 'Crop Monitoring Applications',
          order: 1,
          xpReward: 25,
          content: {
            sections: [
              {
                type: 'intro',
                title: 'Precision Agriculture from Above',
                content: 'RPAS-based crop monitoring enables farmers and agronomists to assess crop health, detect problems early, and make data-driven management decisions across large areas efficiently.'
              },
              {
                type: 'concept',
                title: 'Key Monitoring Applications',
                content: 'Different sensors and analysis methods address various agricultural monitoring needs.',
                keyPoints: [
                  'Plant health assessment using vegetation indices',
                  'Irrigation management and water stress detection',
                  'Disease and pest detection',
                  'Weed mapping for targeted treatment',
                  'Emergence counting and stand assessment',
                  'Yield estimation and harvest planning'
                ]
              },
              {
                type: 'table',
                title: 'Common Vegetation Indices',
                headers: ['Index', 'Application', 'Spectral Bands', 'Interpretation'],
                rows: [
                  ['NDVI', 'Overall plant health', 'Red + NIR', 'Higher = healthier'],
                  ['NDRE', 'Chlorophyll content', 'Red Edge + NIR', 'More sensitive mid-season'],
                  ['GNDVI', 'Chlorophyll in dense canopy', 'Green + NIR', 'Less saturated than NDVI'],
                  ['SAVI', 'Sparse vegetation', 'Red + NIR + L factor', 'Soil background correction'],
                  ['CWSI', 'Water stress', 'Thermal', 'Higher = more stress']
                ]
              },
              {
                type: 'procedure',
                title: 'Crop Monitoring Flight Protocol',
                steps: [
                  'Define field boundaries and monitoring objectives',
                  'Select appropriate sensor (RGB, multispectral, thermal)',
                  'Plan flight for consistent sun angle (within 2 hours of solar noon)',
                  'Capture calibration panel images before and after flight',
                  'Fly systematic grid pattern at consistent altitude',
                  'Process with radiometric calibration applied',
                  'Generate index maps and zones of concern'
                ]
              },
              {
                type: 'tip',
                title: 'Timing Considerations',
                content: 'Schedule monitoring flights at consistent times and conditions throughout the growing season to enable accurate comparison between dates. Avoid flights immediately after rain or irrigation.'
              }
            ]
          }
        },
        {
          id: 'spray-operations-safety',
          questId: 'agricultural-operations',
          title: 'Spray Operations Safety',
          order: 2,
          xpReward: 25,
          content: {
            sections: [
              {
                type: 'intro',
                title: 'Safe Agricultural Application',
                content: 'RPAS spray operations require specialized equipment, training, and procedures. Understanding regulations, drift management, and safety protocols is essential for legal and effective operations.'
              },
              {
                type: 'warning',
                title: 'Regulatory Requirements',
                content: 'Agricultural spray operations may require additional certification and permits beyond standard RPAS licensing. Check Transport Canada and provincial agricultural authority requirements.'
              },
              {
                type: 'concept',
                title: 'Spray System Components',
                content: 'Agricultural RPAS spray systems include specialized components requiring proper setup and maintenance.',
                keyPoints: [
                  'Tank capacity and weight distribution',
                  'Pump type and flow rate control',
                  'Nozzle selection for droplet size',
                  'Boom configuration and spray width',
                  'Rate controller and flow sensors',
                  'Agitation system for suspensions'
                ]
              },
              {
                type: 'table',
                title: 'Drift Mitigation Factors',
                headers: ['Factor', 'Lower Drift', 'Higher Drift', 'Control Method'],
                rows: [
                  ['Droplet size', 'Large (coarse)', 'Small (fine)', 'Nozzle selection'],
                  ['Flight height', 'Lower AGL', 'Higher AGL', 'Flight planning'],
                  ['Wind speed', 'Calm', 'Strong', 'Weather monitoring'],
                  ['Temperature', 'Cooler', 'Hot/inversion', 'Time of day'],
                  ['Humidity', 'Higher', 'Lower', 'Weather monitoring']
                ]
              },
              {
                type: 'procedure',
                title: 'Pre-Spray Safety Checklist',
                steps: [
                  'Verify product label allows aerial application',
                  'Check buffer zone requirements for water and sensitive areas',
                  'Confirm weather conditions within acceptable limits',
                  'Verify wind direction relative to sensitive areas',
                  'Ensure PPE available and properly fitted',
                  'Calibrate spray system for target rate',
                  'Plan flight for target swath and coverage',
                  'Establish emergency procedures for spills'
                ]
              },
              {
                type: 'list',
                title: 'Required PPE for Spray Operations',
                items: [
                  'Chemical-resistant gloves (appropriate for product)',
                  'Safety glasses or face shield',
                  'Chemical-resistant apron or coveralls',
                  'Respiratory protection if required by label',
                  'Rubber boots',
                  'Emergency wash water accessible'
                ]
              }
            ]
          }
        },
        {
          id: 'livestock-considerations',
          questId: 'agricultural-operations',
          title: 'Livestock Considerations',
          order: 3,
          xpReward: 25,
          content: {
            sections: [
              {
                type: 'intro',
                title: 'Working Around Animals',
                content: 'RPAS operations near livestock require consideration of animal behavior, stress responses, and coordination with farm operators to minimize disturbance while achieving operational objectives.'
              },
              {
                type: 'concept',
                title: 'Animal Response to RPAS',
                content: 'Different species and individuals respond differently to RPAS presence. Understanding typical reactions helps plan operations that minimize stress.',
                keyPoints: [
                  'Initial response is often startle/flight reaction',
                  'Animals may habituate with repeated exposure',
                  'Visual stimulus (movement) triggers strongest response',
                  'Sound contributes but is often secondary',
                  'Herding instinct can cause stampede behavior',
                  'Individual animals may react differently'
                ]
              },
              {
                type: 'table',
                title: 'Species-Specific Considerations',
                headers: ['Species', 'Sensitivity', 'Response Pattern', 'Recommended Approach'],
                rows: [
                  ['Cattle', 'Moderate', 'May stampede, especially calves', 'Approach from downwind, gradual altitude'],
                  ['Horses', 'High', 'Flight/panic, may injure self', 'Maintain >100m, avoid sudden movements'],
                  ['Sheep', 'Moderate', 'Flock together, may scatter', 'Avoid separating groups'],
                  ['Poultry', 'High', 'Panic, pile-up risk', 'Maintain safe distance from buildings'],
                  ['Pigs', 'Low-Moderate', 'Generally less reactive', 'Standard precautions apply']
                ]
              },
              {
                type: 'procedure',
                title: 'Livestock-Safe Operation Protocol',
                steps: [
                  'Coordinate with livestock manager before operations',
                  'Identify locations and current status of animals',
                  'Plan flight paths to minimize direct overflights',
                  'Launch and land away from livestock areas',
                  'Approach gradually and monitor animal behavior',
                  'Increase distance if stress behavior observed',
                  'Avoid operations during calving/lambing/birthing',
                  'Report any incidents to livestock manager'
                ]
              },
              {
                type: 'warning',
                title: 'Stress Indicators',
                content: 'If animals show stress indicators (running, bunching, vocalization, attempting to escape), immediately increase distance. Continued operation may cause injury, loss, or reduced production.'
              }
            ]
          }
        },
        {
          id: 'agricultural-airspace',
          questId: 'agricultural-operations',
          title: 'Agricultural Airspace',
          order: 4,
          xpReward: 25,
          content: {
            sections: [
              {
                type: 'intro',
                title: 'Navigating Rural Airspace',
                content: 'Agricultural operations often occur in rural areas with unique airspace considerations including manned agricultural aircraft, aerodromes, and seasonal activity patterns.'
              },
              {
                type: 'concept',
                title: 'Rural Airspace Hazards',
                content: 'While rural airspace is often uncontrolled, unique hazards exist that require awareness and planning.',
                keyPoints: [
                  'Manned crop dusters operate low and fast',
                  'Agricultural aircraft may not use radio',
                  'Rural aerodromes may not appear on charts',
                  'Seasonal peak activity (planting, harvest)',
                  'Helicopter operations for mustering/spraying',
                  'Emergency services (fire, medical) fly low'
                ]
              },
              {
                type: 'procedure',
                title: 'Agricultural Airspace Deconfliction',
                steps: [
                  'Research area for registered and unregistered aerodromes',
                  'Contact neighboring farm operators about aerial activity',
                  'Monitor UNICOM frequency for area (126.7 MHz typical)',
                  'Make position broadcasts on appropriate frequency',
                  'Maintain vigilant visual scanning for manned aircraft',
                  'Have immediate landing plan ready',
                  'Avoid operations during known spray or aerial work times'
                ]
              },
              {
                type: 'table',
                title: 'Seasonal Airspace Activity',
                headers: ['Season', 'Activity Type', 'Timing', 'Risk Level'],
                rows: [
                  ['Spring', 'Seeding, early spray', 'Dawn-dusk', 'High'],
                  ['Early Summer', 'Crop monitoring, spraying', 'Early morning preferred', 'High'],
                  ['Mid Summer', 'Spraying, fertilizing', 'Dawn/dusk (cooler)', 'High'],
                  ['Fall', 'Harvest support, seeding', 'Daylight hours', 'Moderate'],
                  ['Winter', 'Minimal activity', 'N/A', 'Low']
                ]
              },
              {
                type: 'warning',
                title: 'See-and-Avoid Limitations',
                content: 'Agricultural aircraft may approach at speeds exceeding 200 km/h and altitudes below 50 m AGL. Visual detection may provide only seconds of warning. Know their likely approach paths and maintain situational awareness.'
              },
              {
                type: 'tip',
                title: 'Local Knowledge',
                content: 'Farm operators often know local aerial activity patterns. Ask about regular spray contractors, nearby airstrips, and typical activity times before planning operations.'
              }
            ]
          }
        }
      ],
      quiz: {
        id: 'agricultural-operations-quiz',
        questId: 'agricultural-operations',
        title: 'Agricultural Operations Assessment',
        passingScore: 80,
        questions: [
          {
            id: 'ao-q1',
            type: 'multiple-choice',
            question: 'Which vegetation index is most appropriate for assessing mid-season chlorophyll content?',
            options: ['NDVI', 'NDRE', 'CWSI', 'SAVI'],
            correctAnswer: 1,
            explanation: 'NDRE (Normalized Difference Red Edge) is more sensitive than NDVI for mid-season chlorophyll assessment because it uses the red edge band which is less prone to saturation in dense canopy.'
          },
          {
            id: 'ao-q2',
            type: 'multiple-choice',
            question: 'What is the PRIMARY factor for reducing spray drift?',
            options: ['Flying faster', 'Using larger droplets', 'Flying higher', 'Using smaller droplets'],
            correctAnswer: 1,
            explanation: 'Larger (coarse) droplets are heavier and fall faster, significantly reducing drift potential compared to fine droplets which can remain airborne and travel off-target.'
          },
          {
            id: 'ao-q3',
            type: 'multiple-choice',
            question: 'Which livestock species is generally considered MOST sensitive to RPAS?',
            options: ['Cattle', 'Pigs', 'Horses', 'Sheep'],
            correctAnswer: 2,
            explanation: 'Horses are generally most sensitive to RPAS, with strong flight/panic responses that can result in self-injury. They require the greatest standoff distances and careful approach.'
          },
          {
            id: 'ao-q4',
            type: 'multiple-choice',
            question: 'What is the best time for multispectral crop monitoring flights?',
            options: ['Early morning', 'Within 2 hours of solar noon', 'Late afternoon', 'After sunset'],
            correctAnswer: 1,
            explanation: 'Flying within 2 hours of solar noon provides consistent sun angle, reducing shadows and enabling accurate comparison between different monitoring dates.'
          },
          {
            id: 'ao-q5',
            type: 'multiple-choice',
            question: 'What frequency is typically used for UNICOM broadcasts in rural Canadian airspace?',
            options: ['118.0 MHz', '121.5 MHz', '126.7 MHz', '132.0 MHz'],
            correctAnswer: 2,
            explanation: '126.7 MHz is the standard UNICOM frequency for uncontrolled aerodromes and rural areas in Canada for self-announce traffic broadcasts.'
          }
        ]
      }
    },

    // ========================================
    // QUEST 4: Marine & Coastal Operations
    // ========================================
    {
      id: 'marine-coastal-operations',
      trackId: 'specialized-ops',
      title: 'Marine & Coastal Operations',
      description: 'Master specialized procedures for vessel-based operations, coastal weather dynamics, marine wildlife protocols, and water recovery considerations.',
      order: 4,
      xpReward: 150,
      estimatedTime: 50,
      scenarioId: 'marine-survey',
      lessons: [
        {
          id: 'vessel-based-operations',
          questId: 'marine-coastal-operations',
          title: 'Vessel-Based Operations',
          order: 1,
          xpReward: 30,
          content: {
            sections: [
              {
                type: 'intro',
                title: 'Operating from Marine Platforms',
                content: 'Launching and recovering RPAS from vessels introduces unique challenges including platform motion, limited space, compass interference, and saltwater exposure requiring specialized procedures and equipment.'
              },
              {
                type: 'concept',
                title: 'Vessel Motion Considerations',
                content: 'Ship motion affects all phases of RPAS operation from calibration through recovery.',
                keyPoints: [
                  'Deck roll/pitch affects launch and landing stability',
                  'Vessel heading changes affect mission planning',
                  'Metal hulls cause compass interference',
                  'Engine vibration can affect calibration',
                  'Relative wind differs from true wind',
                  'Propeller wash creates unpredictable turbulence'
                ]
              },
              {
                type: 'procedure',
                title: 'Vessel Launch Protocol',
                steps: [
                  'Select launch position clear of superstructure',
                  'Verify no compass interference sources nearby',
                  'Coordinate with bridge for steady heading during launch',
                  'Calculate relative wind from vessel speed and true wind',
                  'Position for launch into relative wind',
                  'Time launch for minimum deck motion',
                  'Clear vessel immediately after takeoff',
                  'Establish safe holding altitude before proceeding'
                ]
              },
              {
                type: 'table',
                title: 'Sea State Limitations',
                headers: ['Sea State', 'Wave Height', 'Deck Motion', 'Launch/Recovery'],
                rows: [
                  ['0-2', '0-0.5 m', 'Minimal', 'Normal operations'],
                  ['3', '0.5-1.25 m', 'Moderate roll', 'Experienced crews'],
                  ['4', '1.25-2.5 m', 'Significant motion', 'Skilled crews only'],
                  ['5+', '>2.5 m', 'Severe', 'Not recommended']
                ]
              },
              {
                type: 'checklist',
                title: 'Vessel Operations Equipment',
                items: [
                  'Non-skid launch pad',
                  'Corrosion-resistant aircraft or protective coating',
                  'Fresh water rinse kit',
                  'Secure tie-downs for equipment',
                  'High-visibility safety equipment',
                  'Vessel-grade radio communication',
                  'Floating recovery aids'
                ]
              },
              {
                type: 'warning',
                title: 'Compass Calibration',
                content: 'Never calibrate compass on vessel deck. Large metal masses cause permanent deviation. Calibrate on land before embarking, and use GPS-based heading when available.'
              }
            ]
          }
        },
        {
          id: 'coastal-weather-dynamics',
          questId: 'marine-coastal-operations',
          title: 'Coastal Weather Dynamics',
          order: 2,
          xpReward: 30,
          content: {
            sections: [
              {
                type: 'intro',
                title: 'Understanding Marine Weather',
                content: 'Coastal and marine environments exhibit unique weather patterns driven by land-sea temperature differences, creating rapidly changing conditions that require continuous monitoring and conservative planning.'
              },
              {
                type: 'concept',
                title: 'Sea Breeze Circulation',
                content: 'Differential heating of land and water creates predictable but powerful wind patterns along coastlines.',
                keyPoints: [
                  'Morning: calm or light offshore (land breeze)',
                  'Mid-morning: transition period, variable',
                  'Afternoon: onshore sea breeze develops (10-25 kt typical)',
                  'Evening: sea breeze diminishes',
                  'Effect strongest on warm, sunny days',
                  'Can penetrate 20-50 km inland'
                ]
              },
              {
                type: 'table',
                title: 'Marine Weather Hazards',
                headers: ['Hazard', 'Indicators', 'Effect on Operations', 'Action'],
                rows: [
                  ['Sea fog', 'Temperature/dewpoint convergence', 'Rapid visibility loss', 'Return immediately'],
                  ['Squall lines', 'Dark clouds, wind shift', 'Severe turbulence, rain', 'Avoid by wide margin'],
                  ['Sea breeze front', 'Cumulus line, wind shift', 'Gusty, directional change', 'Plan for wind shift'],
                  ['Waterspouts', 'Funnel under cumulus', 'Severe localized hazard', 'Maintain >5 km distance'],
                  ['Salt spray', 'High wind + waves', 'Equipment corrosion', 'Minimize exposure, rinse after']
                ]
              },
              {
                type: 'procedure',
                title: 'Marine Weather Monitoring',
                steps: [
                  'Obtain marine forecast before operations',
                  'Monitor continuous marine weather broadcasts',
                  'Observe cloud development along coast',
                  'Track wind speed and direction changes',
                  'Note temperature/humidity trends',
                  'Watch for visibility reduction offshore',
                  'Set conservative return weather minimums'
                ]
              },
              {
                type: 'tip',
                title: 'Plan for Sea Breeze',
                content: 'If possible, schedule coastal operations for early morning before sea breeze development. If afternoon operations are necessary, plan for onshore winds of 15-25 knots and consider how this affects station-keeping and battery consumption.'
              }
            ]
          }
        },
        {
          id: 'marine-wildlife-protocols',
          questId: 'marine-coastal-operations',
          title: 'Marine Wildlife Protocols',
          order: 3,
          xpReward: 30,
          content: {
            sections: [
              {
                type: 'intro',
                title: 'Protecting Marine Species',
                content: 'Marine environments host sensitive wildlife including marine mammals, seabirds, and sea turtles. RPAS operations must comply with federal regulations and minimize disturbance to these protected species.'
              },
              {
                type: 'concept',
                title: 'Marine Mammal Approach Distances',
                content: 'Canada\'s Marine Mammal Regulations establish minimum approach distances that RPAS must respect.',
                keyPoints: [
                  'General marine mammals: 100 m horizontal minimum',
                  'Whales (most species): 100-200 m depending on species',
                  'Killer whales (SRKW): 400 m minimum',
                  'Seals on haul-outs: 100 m',
                  'Sea otters: 100 m',
                  'Approach from side, never head-on or from behind'
                ]
              },
              {
                type: 'table',
                title: 'BC Coastal Species Considerations',
                headers: ['Species', 'Min. Distance', 'Season', 'Special Considerations'],
                rows: [
                  ['Southern Resident Killer Whales', '400 m', 'Year-round', 'Critical habitat, SARA listed'],
                  ['Humpback Whales', '200 m', 'Apr-Oct peak', 'May breach, wide area'],
                  ['Grey Whales', '100 m', 'Mar-May peak', 'Near shore feeding'],
                  ['Harbour Seals', '100 m', 'Year-round', 'Haul-out disturbance sensitive'],
                  ['Sea Lions', '100 m', 'Year-round', 'Stampede risk at rookeries'],
                  ['Sea Otters', '100 m', 'Year-round', 'Float in kelp beds']
                ]
              },
              {
                type: 'procedure',
                title: 'Marine Wildlife Encounter Protocol',
                steps: [
                  'Scan area for wildlife before beginning operations',
                  'Identify species and determine appropriate distances',
                  'If wildlife enters operational area, cease operations',
                  'Maintain minimum distance, do not pursue or follow',
                  'Never fly directly over marine mammals',
                  'Document all encounters (species, location, behavior)',
                  'Report unusual behavior or stranded animals'
                ]
              },
              {
                type: 'warning',
                title: 'Disturbance Indicators',
                content: 'Signs of disturbance include: changes in swimming direction or speed, diving in response to approach, alert postures on haul-outs, group dispersal, or vocalization changes. If observed, immediately increase distance.'
              }
            ]
          }
        },
        {
          id: 'recovery-considerations',
          questId: 'marine-coastal-operations',
          title: 'Recovery Considerations',
          order: 4,
          xpReward: 30,
          content: {
            sections: [
              {
                type: 'intro',
                title: 'Planning for Water Operations',
                content: 'Operating over water requires planning for the possibility of water landing or ditching. Understanding recovery options and equipment limitations helps minimize loss and maximize safety.'
              },
              {
                type: 'concept',
                title: 'Water Recovery Challenges',
                content: 'Water landings present unique challenges compared to land emergencies.',
                keyPoints: [
                  'Most RPAS sink immediately upon water contact',
                  'Salt water causes rapid corrosion damage',
                  'Batteries may react violently with water',
                  'Currents and waves move downed aircraft',
                  'Depth may preclude recovery',
                  'Time-critical recovery window'
                ]
              },
              {
                type: 'table',
                title: 'Recovery Equipment Options',
                headers: ['Equipment', 'Function', 'Limitations', 'Best For'],
                rows: [
                  ['Flotation kit', 'Keeps aircraft on surface', 'Adds weight, drag', 'Critical missions'],
                  ['GPS tracker', 'Location after ditching', 'May sink before fix', 'Shallow water ops'],
                  ['Tethered float', 'Visual recovery aid', 'Drag, limited range', 'Close-in ops'],
                  ['Recovery boat', 'Active retrieval', 'Requires coordination', 'All marine ops'],
                  ['Underwater locator', 'Deep water recovery', 'Expensive, specialized', 'High-value aircraft']
                ]
              },
              {
                type: 'procedure',
                title: 'Emergency Water Ditching',
                steps: [
                  'Declare emergency, mark GPS position',
                  'Deploy flotation if equipped',
                  'Aim for slowest, most level descent possible',
                  'Notify recovery team of position and heading',
                  'If possible, maintain visual contact until recovery',
                  'Do not attempt swimming recovery unless safe',
                  'Document event for incident report'
                ]
              },
              {
                type: 'checklist',
                title: 'Post-Water Exposure Protocol',
                items: [
                  'Do not attempt to power on immediately',
                  'Remove battery immediately if safe to do so',
                  'Rinse thoroughly with fresh water',
                  'Disassemble and dry all components',
                  'Professional inspection before return to service',
                  'Replace suspect components (connectors, bearings)',
                  'Document exposure for maintenance records'
                ]
              },
              {
                type: 'tip',
                title: 'Mission Planning',
                content: 'When planning marine missions, calculate maximum range that keeps aircraft within glide distance of shore or vessel. This provides emergency landing options if power is lost over water.'
              }
            ]
          }
        }
      ],
      quiz: {
        id: 'marine-coastal-quiz',
        questId: 'marine-coastal-operations',
        title: 'Marine & Coastal Operations Assessment',
        passingScore: 80,
        questions: [
          {
            id: 'mc-q1',
            type: 'multiple-choice',
            question: 'What Sea State is the maximum generally recommended for RPAS launch/recovery?',
            options: ['Sea State 2', 'Sea State 3', 'Sea State 4', 'Sea State 5'],
            correctAnswer: 2,
            explanation: 'Sea State 4 (1.25-2.5m waves) is generally the maximum for RPAS operations, and only by skilled crews. Higher sea states create too much deck motion for safe operations.'
          },
          {
            id: 'mc-q2',
            type: 'multiple-choice',
            question: 'When does sea breeze typically reach its maximum strength?',
            options: ['Early morning', 'Mid-morning', 'Afternoon', 'Evening'],
            correctAnswer: 2,
            explanation: 'Sea breeze reaches maximum strength in the afternoon when land-sea temperature differential is greatest, typically producing 10-25 knot onshore winds.'
          },
          {
            id: 'mc-q3',
            type: 'multiple-choice',
            question: 'What is the minimum approach distance for Southern Resident Killer Whales?',
            options: ['100 m', '200 m', '400 m', '500 m'],
            correctAnswer: 2,
            explanation: 'Southern Resident Killer Whales (SRKW) are SARA-listed and require a minimum 400m approach distance - the largest exclusion zone for any marine mammal species in BC.'
          },
          {
            id: 'mc-q4',
            type: 'multiple-choice',
            question: 'Why should compass calibration NEVER be performed on a vessel deck?',
            options: ['The vessel moves too much', 'Salt spray interferes', 'Large metal masses cause permanent deviation', 'It takes too long'],
            correctAnswer: 2,
            explanation: 'The large metal mass of a vessel hull causes permanent compass deviation errors. Calibration should be done on land before embarking, and GPS-based heading should be used when available.'
          },
          {
            id: 'mc-q5',
            type: 'multiple-choice',
            question: 'What is the FIRST action after an RPAS is recovered from water?',
            options: ['Power it on to test', 'Remove the battery', 'Rinse with fresh water', 'Dry with compressed air'],
            correctAnswer: 1,
            explanation: 'The battery should be removed immediately if safe to do so. Powering on wet electronics can cause short circuits and permanent damage. Only after the battery is removed should fresh water rinsing begin.'
          }
        ]
      }
    },

    // ========================================
    // QUEST 5: Night & BVLOS Operations
    // ========================================
    {
      id: 'night-bvlos-operations',
      trackId: 'specialized-ops',
      title: 'Night & BVLOS Operations',
      description: 'Understand regulatory requirements and operational procedures for night operations and Beyond Visual Line of Sight (BVLOS) missions.',
      order: 5,
      xpReward: 130,
      estimatedTime: 45,
      lessons: [
        {
          id: 'night-operations-requirements',
          questId: 'night-bvlos-operations',
          title: 'Night Operations Requirements',
          order: 1,
          xpReward: 25,
          content: {
            sections: [
              {
                type: 'intro',
                title: 'Operating After Dark',
                content: 'Night RPAS operations present unique challenges and regulatory requirements. Understanding lighting requirements, visual limitations, and enhanced safety measures is essential for safe nocturnal operations.'
              },
              {
                type: 'concept',
                title: 'Regulatory Framework for Night Ops',
                content: 'Transport Canada defines night as 30 minutes after sunset to 30 minutes before sunrise. Night operations require specific authorizations and equipment.',
                keyPoints: [
                  'SFOC typically required for night operations',
                  'Aircraft lighting must be visible for 3 statute miles',
                  'Anti-collision lighting required (strobe)',
                  'Pilot must maintain VLOS unless BVLOS authorized',
                  'Enhanced crew communication protocols',
                  'Site-specific hazard assessment required'
                ]
              },
              {
                type: 'table',
                title: 'Aircraft Lighting Requirements',
                headers: ['Light Type', 'Color', 'Visibility', 'Purpose'],
                rows: [
                  ['Anti-collision', 'White strobe', '3 statute miles', 'Visibility to other aircraft'],
                  ['Position (optional)', 'Red/Green/White', '1 statute mile', 'Orientation reference'],
                  ['Payload lighting', 'Variable', 'Task dependent', 'Illumination for sensors'],
                  ['Return-to-home', 'Variable', 'Pilot visibility', 'Locate aircraft']
                ]
              },
              {
                type: 'procedure',
                title: 'Night Operations Pre-Flight',
                steps: [
                  'Verify SFOC includes night operations authorization',
                  'Inspect and test all aircraft lighting',
                  'Survey site during daylight hours',
                  'Identify obstacles and mark with temporary lighting',
                  'Test FPV/camera in low light conditions',
                  'Verify telemetry visibility (screen brightness)',
                  'Brief crew on night-specific procedures',
                  'Test emergency lighting equipment'
                ]
              },
              {
                type: 'warning',
                title: 'Visual Limitations',
                content: 'Human night vision takes 20-30 minutes to fully develop and is immediately lost with exposure to bright light. Plan crew lighting carefully to maintain dark adaptation.'
              },
              {
                type: 'list',
                title: 'Night Operations Equipment',
                items: [
                  'High-visibility aircraft lighting system',
                  'Illuminated launch/landing zone',
                  'Red/dim lighting for ground crew',
                  'Night vision compatible displays',
                  'Backup handheld lighting',
                  'Reflective markers for obstacles',
                  'Enhanced first aid kit with lights'
                ]
              }
            ]
          }
        },
        {
          id: 'bvlos-regulatory-framework',
          questId: 'night-bvlos-operations',
          title: 'BVLOS Regulatory Framework',
          order: 2,
          xpReward: 25,
          content: {
            sections: [
              {
                type: 'intro',
                title: 'Beyond Visual Line of Sight',
                content: 'BVLOS operations extend RPAS capability beyond the pilot\'s direct visual contact, enabling applications like linear infrastructure inspection and large area survey. These operations require additional authorization and safety measures.'
              },
              {
                type: 'concept',
                title: 'BVLOS Authorization Pathways',
                content: 'BVLOS operations in Canada typically require SFOC with demonstrated safety measures meeting SORA requirements.',
                keyPoints: [
                  'No blanket BVLOS authorization exists for Canada',
                  'SFOC required with detailed operational procedures',
                  'SORA methodology typically required for authorization',
                  'Detect and Avoid (DAA) capability expected',
                  'Airspace risk mitigation measures required',
                  'Ground risk controls must be documented'
                ]
              },
              {
                type: 'table',
                title: 'BVLOS SAIL Requirements',
                headers: ['SAIL', 'Air Risk', 'Ground Risk', 'Typical Authorization'],
                rows: [
                  ['II', 'Low (ARC-a/b)', 'Controlled', 'Standard SFOC'],
                  ['III', 'Low-Medium', 'Sparse populated', 'Enhanced SFOC'],
                  ['IV', 'Medium (ARC-c)', 'Moderate populated', 'Detailed safety case'],
                  ['V-VI', 'High', 'Various', 'Full safety assessment required']
                ]
              },
              {
                type: 'procedure',
                title: 'SFOC Application for BVLOS',
                steps: [
                  'Conduct thorough airspace analysis (ARC determination)',
                  'Complete ground risk assessment (GRC determination)',
                  'Calculate final SAIL level',
                  'Develop Operational Safety Objectives (OSOs)',
                  'Document mitigations for each applicable OSO',
                  'Prepare detailed flight operations manual',
                  'Submit SFOC application with SORA documentation',
                  'Address Transport Canada feedback',
                  'Receive authorization with conditions'
                ]
              },
              {
                type: 'tip',
                title: 'Start Simple',
                content: 'Build BVLOS authorization incrementally. Start with lower SAIL operations in controlled airspace over sparsely populated areas before progressing to more complex scenarios.'
              }
            ]
          }
        },
        {
          id: 'visual-observer-networks',
          questId: 'night-bvlos-operations',
          title: 'Visual Observer Networks',
          order: 3,
          xpReward: 25,
          content: {
            sections: [
              {
                type: 'intro',
                title: 'Extended Visual Line of Sight (EVLOS)',
                content: 'Visual Observer (VO) networks enable extended operations while maintaining the safety benefits of human observation. This approach is often the most practical path to extended range operations.'
              },
              {
                type: 'concept',
                title: 'VO Network Architecture',
                content: 'VO networks require careful planning of observer positions, communication, and handoff procedures.',
                keyPoints: [
                  'Each VO must maintain visual contact with aircraft',
                  'VO coverage zones must overlap',
                  'Reliable communication with pilot required',
                  'Standard phraseology improves clarity',
                  'VOs must be briefed on emergency procedures',
                  'VO positions must be accessible and safe'
                ]
              },
              {
                type: 'table',
                title: 'VO Station Planning',
                headers: ['Factor', 'Consideration', 'Typical Requirement'],
                rows: [
                  ['Spacing', 'Maximum visual range', '400-800m depending on aircraft'],
                  ['Elevation', 'Clear sightlines', 'Elevated positions preferred'],
                  ['Communication', 'Reliable contact', 'Radio with pilot, redundant link'],
                  ['Documentation', 'Training records', 'Signed acknowledgment'],
                  ['Handoff procedure', 'Clear transfer points', 'Defined geographic markers']
                ]
              },
              {
                type: 'procedure',
                title: 'VO Handoff Protocol',
                steps: [
                  'Departing VO announces aircraft position approaching handoff zone',
                  'Receiving VO confirms visual contact acquired',
                  'Departing VO announces release of responsibility',
                  'Receiving VO confirms acceptance of responsibility',
                  'Pilot acknowledges transfer complete',
                  'Receiving VO continues tracking and reporting'
                ]
              },
              {
                type: 'tip',
                title: 'VO Communication',
                content: 'VOs should report proactively - approaching traffic, changing conditions, or any concerns. A silent VO network provides no safety benefit; active communication is essential.'
              },
              {
                type: 'checklist',
                title: 'VO Station Equipment',
                items: [
                  'Primary communication radio',
                  'Backup communication device',
                  'Binoculars for distant observation',
                  'Written emergency procedures',
                  'High-visibility vest or clothing',
                  'Shelter from elements if needed',
                  'Site diagram with handoff zones marked'
                ]
              }
            ]
          }
        },
        {
          id: 'enhanced-safety-measures',
          questId: 'night-bvlos-operations',
          title: 'Enhanced Safety Measures',
          order: 4,
          xpReward: 25,
          content: {
            sections: [
              {
                type: 'intro',
                title: 'Beyond Standard Safety Protocols',
                content: 'Night and BVLOS operations require safety measures beyond standard VLOS operations. These enhanced measures address the unique risks of reduced situational awareness and extended operations.'
              },
              {
                type: 'concept',
                title: 'Detect and Avoid (DAA)',
                content: 'DAA systems provide some capability to detect conflicting traffic when direct visual observation is limited.',
                keyPoints: [
                  'ADS-B receivers detect equipped aircraft',
                  'Radar systems provide non-cooperative detection',
                  'Acoustic sensors detect nearby aircraft',
                  'No single system provides complete coverage',
                  'DAA should supplement, not replace, procedures',
                  'System limitations must be understood'
                ]
              },
              {
                type: 'table',
                title: 'DAA Technology Options',
                headers: ['Technology', 'Detection Range', 'Limitations', 'Integration'],
                rows: [
                  ['ADS-B In', '10+ km', 'Only ADS-B equipped traffic', 'Common, affordable'],
                  ['FLARM', '3-6 km', 'Mainly glider/GA equipped', 'Regional availability'],
                  ['Acoustic', '100-500m', 'Short range, noise affected', 'Specialized'],
                  ['Radar', '1-5 km', 'Weight, power, cost', 'Larger platforms'],
                  ['Optical/IR', '1-3 km', 'Weather, processing', 'Emerging technology']
                ]
              },
              {
                type: 'procedure',
                title: 'Enhanced Emergency Procedures',
                steps: [
                  'Define expanded contingency landing zones',
                  'Pre-program emergency routes to safe areas',
                  'Establish position reporting intervals',
                  'Configure automatic return-to-home triggers',
                  'Brief all crew on loss-of-communication procedures',
                  'Coordinate with ATC if in controlled airspace',
                  'Document all emergency landing options along route'
                ]
              },
              {
                type: 'list',
                title: 'Command and Control Redundancy',
                items: [
                  'Primary and backup control links',
                  'Automatic link switching capability',
                  'Independent telemetry reception',
                  'Ground-based navigation backup',
                  'Autonomous mission continuation capability',
                  'Multiple return-to-home coordinates'
                ]
              },
              {
                type: 'warning',
                title: 'Lost Link Planning',
                content: 'Lost link scenarios are more likely in BVLOS operations. Pre-program safe lost-link behavior - loiter, return-to-home, or continue to waypoint - appropriate for the operational environment.'
              }
            ]
          }
        }
      ],
      quiz: {
        id: 'night-bvlos-quiz',
        questId: 'night-bvlos-operations',
        title: 'Night & BVLOS Operations Assessment',
        passingScore: 80,
        questions: [
          {
            id: 'nb-q1',
            type: 'multiple-choice',
            question: 'How long after sunset do night regulations apply for RPAS?',
            options: ['Immediately at sunset', '30 minutes', '60 minutes', 'When it is dark'],
            correctAnswer: 1,
            explanation: 'Transport Canada defines night as beginning 30 minutes after sunset and ending 30 minutes before sunrise, consistent with the aviation definition of official night.'
          },
          {
            id: 'nb-q2',
            type: 'multiple-choice',
            question: 'What visibility requirement applies to anti-collision lights for night RPAS operations?',
            options: ['1 statute mile', '2 statute miles', '3 statute miles', '5 statute miles'],
            correctAnswer: 2,
            explanation: 'Anti-collision lighting must be visible for 3 statute miles to ensure other aircraft can detect the RPAS from a safe distance for collision avoidance.'
          },
          {
            id: 'nb-q3',
            type: 'multiple-choice',
            question: 'What methodology is typically required for BVLOS SFOC applications in Canada?',
            options: ['NOTAM filing', 'Basic risk assessment', 'SORA methodology', 'Visual observer declaration'],
            correctAnswer: 2,
            explanation: 'SORA (Specific Operations Risk Assessment) methodology is typically required for BVLOS SFOC applications, providing a standardized framework for assessing and mitigating ground and air risk.'
          },
          {
            id: 'nb-q4',
            type: 'multiple-choice',
            question: 'What is the typical maximum spacing between Visual Observer stations?',
            options: ['100-200 m', '400-800 m', '1-2 km', '5 km'],
            correctAnswer: 1,
            explanation: 'Visual Observer stations are typically spaced 400-800 m apart depending on aircraft size and visibility, ensuring overlapping visual coverage with no gaps.'
          },
          {
            id: 'nb-q5',
            type: 'multiple-choice',
            question: 'What is the PRIMARY limitation of ADS-B In for detect and avoid?',
            options: ['Short range', 'Only detects ADS-B equipped traffic', 'High power consumption', 'Requires ATC coordination'],
            correctAnswer: 1,
            explanation: 'ADS-B In only detects aircraft that are transmitting ADS-B Out. Many small aircraft, ultralights, and other airspace users may not be equipped, creating detection gaps.'
          }
        ]
      }
    },

    // ========================================
    // QUEST 6: Emergency Response Support (Final)
    // ========================================
    {
      id: 'emergency-response-support',
      trackId: 'specialized-ops',
      title: 'Emergency Response Support',
      description: 'Learn to support SAR operations, fire response, disaster assessment, and multi-agency coordination as an RPAS operator.',
      order: 6,
      xpReward: 160,
      estimatedTime: 45,
      lessons: [
        {
          id: 'sar-support-operations',
          questId: 'emergency-response-support',
          title: 'SAR Support Operations',
          order: 1,
          xpReward: 35,
          content: {
            sections: [
              {
                type: 'intro',
                title: 'Supporting Search and Rescue',
                content: 'RPAS can significantly enhance Search and Rescue operations by providing aerial perspective, thermal imaging, and rapid coverage of search areas. Understanding SAR structure and integration is essential for effective support.'
              },
              {
                type: 'concept',
                title: 'SAR Organization in Canada',
                content: 'SAR operations involve multiple agencies with defined roles and incident command structures.',
                keyPoints: [
                  'RCMP typically leads ground SAR in BC',
                  'SAR groups are volunteer-based organizations',
                  'Incident Command System (ICS) used for coordination',
                  'RPAS falls under Operations section',
                  'Integration requires prior coordination/MOU',
                  'Standalone operations may interfere with SAR'
                ]
              },
              {
                type: 'table',
                title: 'SAR RPAS Applications',
                headers: ['Application', 'Sensor', 'Best Conditions', 'Limitations'],
                rows: [
                  ['Wide area search', 'RGB + thermal', 'Clear weather', 'Coverage rate limited'],
                  ['Cliff/ravine search', 'RGB zoom', 'Good light', 'Terrain challenges'],
                  ['Night search', 'Thermal', 'Temperature differential', 'Resolution limits'],
                  ['Water search', 'RGB + thermal', 'Calm water', 'Glare, reflection'],
                  ['Communication relay', 'Radio payload', 'Clear sightlines', 'Endurance limited']
                ]
              },
              {
                type: 'procedure',
                title: 'SAR Mission Integration',
                steps: [
                  'Check in with SAR Manager/Incident Commander',
                  'Receive briefing on search area and subject information',
                  'Coordinate with other air assets (helicopters, fixed-wing)',
                  'Establish communication protocols with ground teams',
                  'Define search pattern and reporting procedures',
                  'Conduct systematic search coverage',
                  'Report all findings immediately',
                  'Document flight coverage for search record'
                ]
              },
              {
                type: 'warning',
                title: 'Airspace Deconfliction',
                content: 'SAR incidents often involve multiple aircraft including helicopters. Airspace management is critical. Always operate under direction of the Air Operations Branch or SAR Manager.'
              },
              {
                type: 'tip',
                title: 'Subject Appearance',
                content: 'Request description of subject and clothing colors. Brief camera operator on what to look for. Human detection from altitude is challenging - thermal imaging significantly improves detection rates.'
              }
            ]
          }
        },
        {
          id: 'fire-disaster-response',
          questId: 'emergency-response-support',
          title: 'Fire & Disaster Response',
          order: 2,
          xpReward: 35,
          content: {
            sections: [
              {
                type: 'intro',
                title: 'Supporting Emergency Response',
                content: 'RPAS provide valuable support for wildfire, structural fire, and disaster response operations through aerial reconnaissance, thermal detection, and damage assessment. Operating in these environments requires special authorization and safety awareness.'
              },
              {
                type: 'concept',
                title: 'Fire Response Applications',
                content: 'RPAS support fire operations in multiple ways throughout the incident lifecycle.',
                keyPoints: [
                  'Initial size-up and fire behavior assessment',
                  'Hot spot detection with thermal imaging',
                  'Perimeter mapping and progression tracking',
                  'Crew safety monitoring',
                  'Post-fire damage assessment',
                  'Rehabilitation monitoring'
                ]
              },
              {
                type: 'warning',
                title: 'TFR and NOTAMs',
                content: 'Wildfires typically have Temporary Flight Restrictions (TFRs) or NOTAMs prohibiting RPAS operations. "If you fly, we can\'t" - unauthorized RPAS ground air tankers and helicopters. Only operate with explicit authorization from fire management.'
              },
              {
                type: 'table',
                title: 'Disaster Response Applications',
                headers: ['Disaster Type', 'Primary Application', 'Sensor Requirements', 'Hazards'],
                rows: [
                  ['Wildfire', 'Hot spot detection, perimeter mapping', 'Thermal + RGB', 'Smoke, TFR, aircraft'],
                  ['Flood', 'Damage assessment, victim detection', 'RGB + thermal', 'Weather, debris'],
                  ['Earthquake', 'Structural damage assessment', 'RGB', 'Aftershocks, unstable structures'],
                  ['Landslide', 'Mapping, victim search', 'RGB + LiDAR', 'Continued movement'],
                  ['Hazmat', 'Plume tracking, perimeter', 'RGB + gas sensors', 'Exposure, contamination']
                ]
              },
              {
                type: 'procedure',
                title: 'Fire Response RPAS Deployment',
                steps: [
                  'Confirm authorization from Incident Commander',
                  'Verify TFR/NOTAM status and any exemptions',
                  'Coordinate with Air Attack if aerial operations ongoing',
                  'Establish safe launch point clear of operations',
                  'Brief on fire behavior and escape routes',
                  'Maintain communication with ground forces',
                  'Conduct flight avoiding smoke columns',
                  'Provide real-time intelligence to command'
                ]
              },
              {
                type: 'list',
                title: 'Disaster Response Safety',
                items: [
                  'Never self-deploy to incidents without authorization',
                  'Maintain safe distance from active hazards',
                  'Plan escape routes from deployment location',
                  'Monitor changing conditions continuously',
                  'Understand incident command chain',
                  'Document all observations for after-action'
                ]
              }
            ]
          }
        },
        {
          id: 'multi-agency-coordination',
          questId: 'emergency-response-support',
          title: 'Multi-Agency Coordination',
          order: 3,
          xpReward: 30,
          content: {
            sections: [
              {
                type: 'intro',
                title: 'Working Within Incident Command',
                content: 'Effective emergency response requires seamless integration with Incident Command System (ICS) structures and coordination with multiple agencies. Understanding these frameworks enables RPAS operators to provide valuable support without interfering with response operations.'
              },
              {
                type: 'concept',
                title: 'Incident Command System Basics',
                content: 'ICS provides standardized command structure used across emergency response agencies in North America.',
                keyPoints: [
                  'Incident Commander has overall authority',
                  'Operations Section manages tactical operations',
                  'Planning Section manages information and resources',
                  'Logistics Section provides support',
                  'RPAS typically reports through Operations',
                  'Unity of command - one supervisor per person'
                ]
              },
              {
                type: 'table',
                title: 'Agency Coordination',
                headers: ['Agency Type', 'Typical Interest', 'Coordination Need', 'Documentation'],
                rows: [
                  ['Fire Services', 'Situational awareness, hot spots', 'Real-time imagery feed', 'Thermal captures'],
                  ['Police/RCMP', 'Scene documentation, search', 'Evidence quality imagery', 'Chain of custody'],
                  ['SAR', 'Search coverage, subject location', 'Systematic search records', 'Coverage maps'],
                  ['Emergency Management', 'Damage assessment', 'GIS-ready data', 'Orthomosaics'],
                  ['Transportation', 'Infrastructure assessment', 'Engineering quality', 'Survey reports']
                ]
              },
              {
                type: 'procedure',
                title: 'ICS Check-In Protocol',
                steps: [
                  'Report to Incident Command Post',
                  'Check in with Planning Section (Resources Unit)',
                  'Receive briefing on incident status and objectives',
                  'Get assigned to Operations Section',
                  'Receive tactical assignment from Operations',
                  'Coordinate airspace with Air Operations Branch if active',
                  'Conduct operations per assignment',
                  'Report findings to assigned supervisor'
                ]
              },
              {
                type: 'tip',
                title: 'Radio Communication',
                content: 'Emergency response uses standardized radio procedures. Practice clear, concise communications. Identify yourself and your role. Report essential information only. Avoid casual conversation on incident channels.'
              },
              {
                type: 'list',
                title: 'Professional Integration Behaviors',
                items: [
                  'Check in formally at ICP before operations',
                  'Follow ICS protocols and chain of command',
                  'Wear appropriate identification/credentials',
                  'Maintain professional appearance and demeanor',
                  'Document all activities in incident logs',
                  'Check out when completing assignment'
                ]
              }
            ]
          }
        }
      ],
      quiz: {
        id: 'emergency-response-quiz',
        questId: 'emergency-response-support',
        title: 'Emergency Response Support Final Assessment',
        passingScore: 80,
        questions: [
          {
            id: 'er-q1',
            type: 'multiple-choice',
            question: 'Who typically leads ground SAR operations in British Columbia?',
            options: ['BC Ambulance Service', 'RCMP', 'Municipal Fire Department', 'Coast Guard'],
            correctAnswer: 1,
            explanation: 'The RCMP typically leads ground SAR operations in BC, coordinating with volunteer SAR groups who provide the operational capability.'
          },
          {
            id: 'er-q2',
            type: 'multiple-choice',
            question: 'What is the PRIMARY concern with unauthorized RPAS at wildfire scenes?',
            options: ['Interference with thermal imaging', 'Grounding of firefighting aircraft', 'Scaring wildlife', 'Creating additional work for crews'],
            correctAnswer: 1,
            explanation: '"If you fly, we can\'t" - unauthorized RPAS force the grounding of firefighting aircraft (air tankers, helicopters) which can fight fires from the air. This directly impacts firefighting effectiveness and safety.'
          },
          {
            id: 'er-q3',
            type: 'multiple-choice',
            question: 'Under ICS, which section would an RPAS operator typically report to during operations?',
            options: ['Finance/Administration', 'Logistics', 'Operations', 'Planning'],
            correctAnswer: 2,
            explanation: 'RPAS operators conducting tactical assignments typically report through the Operations Section, which manages all tactical operations at an incident.'
          },
          {
            id: 'er-q4',
            type: 'multiple-choice',
            question: 'What is the FIRST step when arriving to support an emergency incident?',
            options: ['Launch aircraft immediately', 'Report to Incident Command Post', 'Begin searching the area', 'Set up equipment'],
            correctAnswer: 1,
            explanation: 'Always report to the Incident Command Post first to check in formally, receive a briefing, and get properly assigned. Self-deploying without coordination can interfere with response operations.'
          },
          {
            id: 'er-q5',
            type: 'multiple-choice',
            question: 'For SAR operations, what significantly improves detection rates compared to visual cameras?',
            options: ['Higher megapixel count', 'Thermal imaging', 'Faster frame rate', 'Wider field of view'],
            correctAnswer: 1,
            explanation: 'Thermal imaging significantly improves detection rates in SAR because it detects body heat rather than relying on visual identification. This is especially valuable at night, in vegetation, or when subjects are injured/immobile.'
          }
        ]
      }
    }
  ]
}

export default specializedOpsTrack
