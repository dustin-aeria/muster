# Gamified Safety Feature - Implementation Plan

**Version**: 1.0
**Date**: 2026-02-19
**Status**: Awaiting Approval

---

## Table of Contents

1. [Research Summary](#1-research-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Data Model](#3-data-model)
4. [Content Pipeline Design](#4-content-pipeline-design)
5. [Claude API Integration Plan](#5-claude-api-integration-plan)
6. [Gamification System Design](#6-gamification-system-design)
7. [UI/UX Wireframe Descriptions](#7-uiux-wireframe-descriptions)
8. [Implementation Phases](#8-implementation-phases)
9. [Risk & Considerations](#9-risk--considerations)
10. [Testing & Validation Strategy](#10-testing--validation-strategy)

---

## 1. Research Summary

### 1.1 Canadian Aviation Regulations (RPAS-Specific)

**Transport Canada CARs Part IX - Remotely Piloted Aircraft Systems**
- **CAR 901.01-901.86**: Definitions, registration, pilot certification
- **CAR 903**: Operations (VLOS, BVLOS, flight rules)
- **CAR 904**: Pilot qualifications and medical fitness
- **CAR 404.06**: Fitness for duty (applies to all pilots, including RPAS)
- **Staff Instruction (SI) 623-001**: RPAS operations guidance
- **Advisory Circular (AC) 922-001**: RPAS safety assurance

**Key Training Topics from CARs Part IX**:
- Pre-flight inspections and checklists
- Airspace classification and restrictions
- Weather limitations for RPAS operations
- Emergency procedures (fly-away, loss of link)
- Crew resource management for RPAS teams
- NOTAMs and flight planning requirements

### 1.2 WorkSafeBC OHS Regulation

**Part 4 - General Conditions**
- Workplace inspections (4.3-4.11)
- Emergency procedures (4.13-4.20)
- Violence and working alone (4.21-4.31)
- Personal protective equipment general requirements

**Part 8 - Personal Protective Equipment**
- Selection, use, and maintenance of PPE
- High-visibility apparel (relevant for field operations)
- Hearing protection (drone operations near machinery)
- Eye protection, respiratory protection

**Part 18 - Traffic Control**
- Worker safety during road work (relevant for roadside surveys)
- Traffic control person (TCP) requirements
- Signage and barrier requirements

**Part 21 - Blasting Operations**
- Clearance distances (relevant for mining/construction surveys)
- Communication protocols
- Pre-blast inspections

**Part 4.20-4.23 - Working Alone**
- Check-in procedures
- Communication requirements
- Emergency response planning

### 1.3 Additional Standards

**CSA Z462 - Workplace Electrical Safety**
- Relevant for equipment charging, power systems
- Arc flash hazards, lockout/tagout

**ICAO Annex 6 - UAS Operations**
- International standards for unmanned aircraft
- Risk assessment frameworks (SORA methodology)

**Transportation of Dangerous Goods (TDG)**
- LiPo battery transport requirements
- Fuel transport for generators
- Documentation requirements

**Canada Labour Code Part II**
- General duty to ensure health and safety
- Right to refuse dangerous work
- Reporting requirements

### 1.4 COR/SECOR Audit Requirements

**Certificate of Recognition (COR) Program**
- Documented training records with dates, topics, and verification
- Competency assessments with recorded outcomes
- Continuous improvement evidence
- Near-miss and incident learning integration

**Key Audit Elements This System Addresses**:
- Element 5: Training and Communication
- Element 6: Inspections
- Element 7: Emergency Response
- Element 9: Incident Investigation (learning from scenarios)
- Element 14: Continuous Improvement

### 1.5 Fitness-for-Duty Standards

**IMSAFE Checklist (Aviation Standard)**
- **I**llness - Any symptoms affecting performance?
- **M**edication - Any impairing medications?
- **S**tress - Psychological factors affecting judgment?
- **A**lcohol - Time since last consumption (8 hours minimum, 0.04% BAC)
- **F**atigue - Adequate rest? (14-hour duty day limits)
- **E**motion/Eating - Emotional distress? Proper nutrition?

**CARs 404.06 Fitness Requirements**
- Pilots must not operate if impaired by any factor
- Self-assessment responsibility
- Fatigue risk management

**WorkSafeBC Fitness-for-Duty**
- Due diligence to ensure workers are fit
- Impairment policies (substance, fatigue)
- Duty to report unsafe conditions (including self)

### 1.6 What Might Be Missing

Consider adding these regulatory sources:
- **NAV CANADA publications** (AIM, NOTAM procedures)
- **BC Forest Service protocols** (wildfire operations)
- **DFO regulations** (marine operations, fisheries)
- **Parks Canada requirements** (national park operations)
- **Indigenous consultation requirements** (certain areas)
- **Privacy legislation** (PIPEDA, BC FIPPA) for data collection

---

## 2. Architecture Overview

### 2.1 Integration with Existing App Structure

```
Muster App
├── Navigation
│   ├── Training (existing)
│   │   ├── Training Records (existing)
│   │   ├── Q-Cards (existing)
│   │   ├── Safety Quests (NEW)          ← Safety Quest System
│   │   └── Scenario Challenges (NEW)    ← Scenario Challenges
│   │
│   └── Operator Ready (NEW CATEGORY)
│       └── Readiness Check (NEW)        ← Operator Ready Score
│
├── Shared Services
│   ├── gamificationEngine.js (NEW)
│   ├── contentPipeline.js (NEW)
│   └── safetyAI.js (NEW)
│
└── Firebase
    ├── Firestore Collections (NEW)
    └── Cloud Functions (NEW)
```

### 2.2 Component Hierarchy

```
src/
├── components/
│   └── gamification/
│       ├── shared/
│       │   ├── XPDisplay.jsx
│       │   ├── BadgeDisplay.jsx
│       │   ├── StreakIndicator.jsx
│       │   ├── ProgressRing.jsx
│       │   ├── LeaderboardCard.jsx
│       │   └── SafetyCultureScore.jsx
│       │
│       ├── quests/
│       │   ├── QuestTrackList.jsx
│       │   ├── QuestCard.jsx
│       │   ├── LessonCard.jsx
│       │   ├── QuizQuestion.jsx
│       │   ├── QuizResults.jsx
│       │   └── StreakCalendar.jsx
│       │
│       ├── scenarios/
│       │   ├── ScenarioCard.jsx
│       │   ├── ScenarioPlayer.jsx
│       │   ├── DecisionNode.jsx
│       │   ├── ConsequenceDisplay.jsx
│       │   └── DebriefPanel.jsx
│       │
│       └── readiness/
│           ├── ReadinessCheckIn.jsx
│           ├── ReadinessGauge.jsx
│           ├── CategorySlider.jsx
│           ├── TrendChart.jsx
│           ├── NudgeCard.jsx
│           └── WeeklyInsights.jsx
│
├── pages/
│   ├── SafetyQuests.jsx
│   ├── QuestDetail.jsx
│   ├── LessonView.jsx
│   ├── ScenarioChallenges.jsx
│   ├── ScenarioPlay.jsx
│   └── OperatorReady.jsx
│
└── lib/
    ├── firestoreGamification.js
    ├── gamificationEngine.js
    ├── contentPipeline.js
    └── safetyAI.js
```

### 2.3 Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                            │
├─────────────────────────────────────────────────────────────────┤
│  SafetyQuests  │  ScenarioChallenges  │  OperatorReady          │
└───────┬────────┴──────────┬───────────┴──────────┬──────────────┘
        │                   │                      │
        ▼                   ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GAMIFICATION ENGINE                           │
│  (XP calculation, badge awarding, streak tracking, leaderboard) │
└───────┬────────────────────────────────────────────┬────────────┘
        │                                            │
        ▼                                            ▼
┌───────────────────┐                    ┌────────────────────────┐
│  CONTENT PIPELINE │                    │    FIREBASE/FIRESTORE   │
│  (Document ingest,│                    │  (User progress, scores,│
│   chunking, index)│                    │   audit logs, content)  │
└───────┬───────────┘                    └────────────────────────┘
        │                                            ▲
        ▼                                            │
┌─────────────────────────────────────────────────────────────────┐
│                     CLAUDE API (Cloud Functions)                 │
│  - Quiz generation         - Scenario generation                 │
│  - Adaptive difficulty     - Debriefs                           │
│  - Content summarization   - Readiness nudges                   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 API Interaction Patterns

**Real-Time Interactions (Sonnet)**
- Scenario debrief generation
- Adaptive quiz explanations
- Readiness nudges
- Scenario dialogue generation

**Background/Batch Processing (Haiku)**
- Quiz question generation from documents
- Scenario variation creation
- Content summarization
- Regulatory update processing

---

## 3. Data Model

### 3.1 Firestore Collections Schema

```
/organizations/{orgId}/
│
├── /gamificationConfig
│   └── {configId}
│       ├── xpPerQuizCorrect: number (default: 10)
│       ├── xpPerLessonComplete: number (default: 25)
│       ├── xpPerQuestComplete: number (default: 100)
│       ├── xpPerScenarioComplete: number (default: 150)
│       ├── xpPerReadinessCheckIn: number (default: 15)
│       ├── streakBonusMultiplier: number (default: 1.5)
│       ├── badgeDefinitions: array
│       └── leaderboardEnabled: boolean
│
├── /questTracks
│   └── {trackId}
│       ├── name: string ("RPAS Operations")
│       ├── description: string
│       ├── icon: string
│       ├── color: string
│       ├── order: number
│       ├── prerequisiteTrackIds: array
│       ├── questIds: array (ordered)
│       ├── totalXP: number
│       ├── badgeOnComplete: string (badgeId)
│       ├── isActive: boolean
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── /quests
│   └── {questId}
│       ├── trackId: string
│       ├── name: string ("Pre-Flight Inspection Basics")
│       ├── description: string
│       ├── order: number
│       ├── lessonIds: array (ordered)
│       ├── knowledgeCheckId: string (quizId)
│       ├── prerequisiteQuestIds: array
│       ├── xpReward: number
│       ├── estimatedMinutes: number
│       ├── difficultyLevel: string (beginner/intermediate/advanced)
│       ├── sourceDocumentIds: array (policy/procedure IDs)
│       ├── regulatoryReferences: array
│       ├── isActive: boolean
│       ├── reviewStatus: string (draft/pending_review/approved)
│       ├── reviewedBy: string (userId)
│       ├── reviewedAt: timestamp
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
├── /lessons
│   └── {lessonId}
│       ├── questId: string
│       ├── type: string (text/video/interactive/card)
│       ├── title: string
│       ├── content: object
│       │   ├── text: string (markdown)
│       │   ├── videoUrl: string (optional)
│       │   ├── imageUrl: string (optional)
│       │   ├── interactiveType: string (optional)
│       │   └── interactiveData: object (optional)
│       ├── order: number
│       ├── xpReward: number
│       ├── estimatedSeconds: number
│       ├── sourceChunkIds: array
│       ├── aiGenerated: boolean
│       ├── reviewStatus: string
│       └── createdAt: timestamp
│
├── /quizzes
│   └── {quizId}
│       ├── questId: string
│       ├── questionIds: array
│       ├── passingScore: number (percentage, default: 80)
│       ├── timeLimit: number (seconds, optional)
│       ├── randomizeQuestions: boolean
│       ├── randomizeAnswers: boolean
│       └── createdAt: timestamp
│
├── /quizQuestions
│   └── {questionId}
│       ├── quizId: string
│       ├── type: string (multiple_choice/matching/ordering/scenario)
│       ├── question: string
│       ├── options: array
│       │   └── { id, text, isCorrect, explanation }
│       ├── correctAnswer: string/array
│       ├── explanation: string
│       ├── regulatoryReference: string
│       ├── sourceChunkId: string
│       ├── difficultyLevel: number (1-5)
│       ├── aiGenerated: boolean
│       ├── reviewStatus: string
│       ├── timesAnswered: number
│       ├── timesCorrect: number
│       └── createdAt: timestamp
│
├── /scenarios
│   └── {scenarioId}
│       ├── title: string
│       ├── description: string
│       ├── category: string (RPAS/marine/field/emergency)
│       ├── difficultyTier: string (green/yellow/red)
│       ├── contextData: object
│       │   ├── weather: object
│       │   ├── terrain: string
│       │   ├── equipment: object
│       │   ├── crewComposition: array
│       │   ├── clientExpectations: string
│       │   └── timePressure: string
│       ├── rootNodeId: string
│       ├── nodeIds: array
│       ├── optimalPathNodeIds: array
│       ├── maxScore: number
│       ├── xpReward: number
│       ├── estimatedMinutes: number
│       ├── procedureReferences: array (policy/procedure IDs)
│       ├── regulatoryReferences: array
│       ├── aiGenerated: boolean
│       ├── reviewStatus: string
│       ├── timesPlayed: number
│       ├── averageScore: number
│       └── createdAt: timestamp
│
├── /scenarioNodes
│   └── {nodeId}
│       ├── scenarioId: string
│       ├── type: string (narrative/decision/consequence/ending)
│       ├── content: string (narrative text)
│       ├── imageUrl: string (optional)
│       ├── decisions: array
│       │   └── { id, text, nextNodeId, scoreImpact, isOptimal, rationale }
│       ├── consequences: string
│       ├── scoreValue: number
│       ├── isEnding: boolean
│       ├── endingType: string (success/partial/failure)
│       └── order: number
│
├── /readinessCategories
│   └── {categoryId}
│       ├── name: string ("Physical Readiness")
│       ├── icon: string
│       ├── order: number
│       ├── factors: array
│       │   └── { id, name, question, type, min, max, optimalMin, optimalMax, weight }
│       ├── weight: number (contribution to overall score)
│       └── educationalContent: object
│           └── { lowScoreTips, mediumScoreTips, highScoreTips }
│
├── /contentSources
│   └── {sourceId}
│       ├── type: string (policy/procedure/sop/regulation/external)
│       ├── sourceDocumentId: string (reference to policy/procedure)
│       ├── externalUrl: string (for external regulations)
│       ├── title: string
│       ├── fullText: string
│       ├── chunkIds: array
│       ├── lastSyncedAt: timestamp
│       ├── isActive: boolean
│       └── createdAt: timestamp
│
├── /contentChunks
│   └── {chunkId}
│       ├── sourceId: string
│       ├── chunkIndex: number
│       ├── text: string
│       ├── embedding: array (optional, for semantic search)
│       ├── metadata: object
│       │   ├── section: string
│       │   ├── topic: string
│       │   └── keywords: array
│       └── createdAt: timestamp
│
└── /badges
    └── {badgeId}
        ├── name: string
        ├── description: string
        ├── icon: string
        ├── rarity: string (common/uncommon/rare/epic/legendary)
        ├── category: string (quest/scenario/readiness/streak/milestone)
        ├── criteria: object
        │   ├── type: string (quest_complete/scenario_score/streak/xp_total/etc)
        │   ├── targetId: string (optional)
        │   ├── threshold: number
        │   └── conditions: array
        ├── xpBonus: number
        └── createdAt: timestamp


/users/{userId}/
│
├── /gamificationProfile
│   └── {profileId}
│       ├── totalXP: number
│       ├── level: number
│       ├── safetyCultureScore: number (0-100)
│       ├── currentStreak: number (days)
│       ├── longestStreak: number
│       ├── lastActivityDate: date
│       ├── streakProtectionsRemaining: number
│       ├── badgeIds: array
│       ├── completedQuestIds: array
│       ├── completedScenarioIds: array
│       ├── totalLessonsCompleted: number
│       ├── totalQuestionsAnswered: number
│       ├── totalCorrectAnswers: number
│       ├── averageQuizScore: number
│       ├── averageScenarioScore: number
│       ├── readinessCheckInStreak: number
│       ├── averageReadinessScore: number
│       └── updatedAt: timestamp
│
├── /questProgress
│   └── {progressId}
│       ├── questId: string
│       ├── status: string (not_started/in_progress/completed)
│       ├── completedLessonIds: array
│       ├── quizAttempts: array
│       │   └── { attemptId, score, dateTaken, answers }
│       ├── bestQuizScore: number
│       ├── xpEarned: number
│       ├── startedAt: timestamp
│       ├── completedAt: timestamp
│       └── lastAccessedAt: timestamp
│
├── /scenarioAttempts
│   └── {attemptId}
│       ├── scenarioId: string
│       ├── score: number
│       ├── maxPossibleScore: number
│       ├── scorePercentage: number
│       ├── pathTaken: array
│       │   └── { nodeId, decisionId, timestamp }
│       ├── decisionsAnalysis: array
│       │   └── { nodeId, wasOptimal, rationale }
│       ├── xpEarned: number
│       ├── debrief: object (AI-generated)
│       ├── startedAt: timestamp
│       ├── completedAt: timestamp
│       └── durationSeconds: number
│
├── /readinessCheckIns
│   └── {checkInId}
│       ├── date: date
│       ├── overallScore: number (0-100)
│       ├── categoryScores: object
│       │   └── { categoryId: score }
│       ├── factorResponses: object
│       │   └── { factorId: value }
│       ├── aiNudge: object
│       │   ├── message: string
│       │   └── tips: array
│       ├── xpEarned: number
│       ├── streakDay: number
│       ├── scheduledOperationId: string (optional)
│       ├── flaggedForSelfCare: boolean
│       └── createdAt: timestamp
│
├── /spacedRepetitionQueue
│   └── {queueItemId}
│       ├── contentType: string (lesson/quiz_question)
│       ├── contentId: string
│       ├── nextReviewDate: date
│       ├── interval: number (days)
│       ├── easeFactor: number (SM-2 algorithm)
│       ├── repetitions: number
│       └── lastReviewedAt: timestamp
│
└── /activityLog (audit trail)
    └── {logId}
        ├── type: string (lesson_complete/quiz_attempt/scenario_complete/checkin/badge_earned)
        ├── contentId: string
        ├── contentType: string
        ├── score: number (optional)
        ├── xpEarned: number
        ├── details: object
        ├── timestamp: timestamp
        └── sessionId: string
```

### 3.2 Indexes Required

```javascript
// Firestore compound indexes
{
  collection: "questProgress",
  fields: ["userId", "questId", "status"]
},
{
  collection: "scenarioAttempts",
  fields: ["userId", "scenarioId", "completedAt"]
},
{
  collection: "readinessCheckIns",
  fields: ["userId", "date"]
},
{
  collection: "activityLog",
  fields: ["userId", "type", "timestamp"]
},
{
  collection: "quests",
  fields: ["trackId", "order", "isActive"]
},
{
  collection: "scenarios",
  fields: ["category", "difficultyTier", "reviewStatus"]
},
{
  collection: "spacedRepetitionQueue",
  fields: ["userId", "nextReviewDate"]
}
```

---

## 4. Content Pipeline Design

### 4.1 Document Ingestion Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT SOURCES                               │
├─────────────────────────────────────────────────────────────────┤
│  Internal Policies  │  Procedures/SOPs  │  External Regulations │
│  (Firestore)        │  (Firestore)      │  (Manual/Scraped)     │
└──────────┬──────────┴─────────┬─────────┴──────────┬────────────┘
           │                    │                    │
           ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INGESTION SERVICE                             │
│  1. Extract text from documents                                  │
│  2. Clean and normalize formatting                               │
│  3. Split into semantic chunks (500-1000 tokens each)           │
│  4. Extract metadata (section, topic, keywords)                  │
│  5. Generate embeddings (optional, for semantic search)          │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT CHUNKS (Firestore)                    │
│  - Indexed by source, topic, keywords                           │
│  - Ready for Claude API context injection                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CONTENT GENERATION                            │
│  Claude API uses chunks to:                                      │
│  - Generate quiz questions                                       │
│  - Create lesson content                                         │
│  - Build scenario narratives                                     │
│  - Provide contextual explanations                               │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Chunking Strategy

```javascript
// Chunk configuration
const CHUNK_CONFIG = {
  targetTokens: 750,
  minTokens: 300,
  maxTokens: 1000,
  overlapTokens: 100, // For context continuity

  // Semantic boundaries (prefer splitting at these)
  splitPriority: [
    /^#{1,3}\s/m,           // Markdown headers
    /^\d+\.\s/m,            // Numbered sections
    /^[A-Z][A-Z\s]+$/m,     // ALL CAPS headings
    /\n\n/,                 // Double newlines
    /\.\s+/,                // Sentence boundaries
  ]
}
```

### 4.3 External Regulatory Content

**Automated Sources** (fetch/parse on schedule):
- Transport Canada RPAS Advisory Circulars (HTML scrape)
- WorkSafeBC OHS updates (RSS/HTML scrape)
- NAV CANADA AIM updates (PDF parsing)

**Manual Entry Sources** (admin interface):
- CSA standards (paid, can't scrape)
- New regulations not yet in automated feed
- Industry best practices and bulletins

**Update Detection**:
- Content hashing to detect changes
- Diff generation for changed sections
- Auto-flag affected quests/scenarios for review
- Notification to admins when source content changes

### 4.4 Content Pipeline API

```javascript
// Cloud Functions
exports.ingestPolicyContent = functions.firestore
  .document('organizations/{orgId}/policies/{policyId}')
  .onWrite(async (change, context) => {
    // Extract, chunk, index policy content
  })

exports.ingestProcedureContent = functions.firestore
  .document('organizations/{orgId}/procedures/{procedureId}')
  .onWrite(async (change, context) => {
    // Extract, chunk, index procedure content
  })

exports.syncExternalRegulations = functions.pubsub
  .schedule('every monday 03:00')
  .onRun(async (context) => {
    // Fetch, parse, chunk external regulatory content
  })

exports.generateQuestContent = functions.https.onCall(async (data, context) => {
  // Given source chunks, generate quest lessons and quiz questions
})
```

---

## 5. Claude API Integration Plan

### 5.1 Model Selection Strategy

| Use Case | Model | Rationale |
|----------|-------|-----------|
| Quiz question generation | Haiku | High volume, structured output |
| Lesson content creation | Haiku | Batch processing, cost efficiency |
| Scenario generation | Sonnet | Complex narrative, nuanced decisions |
| Real-time explanations | Sonnet | Quality, contextual responses |
| Scenario debriefs | Sonnet | Detailed analysis, references |
| Readiness nudges | Haiku | Short, supportive messages |
| Content summarization | Haiku | Batch processing |
| Adaptive difficulty | Haiku | Quick decisions |

### 5.2 Prompt Templates

#### Quiz Question Generation

```javascript
const QUIZ_GENERATION_PROMPT = `You are a safety training content developer for a Canadian RPAS (drone) and remote sensing operations company. Generate quiz questions based on the provided source content.

CONTEXT:
- Industry: RPAS operations, field surveys, marine operations in British Columbia, Canada
- Audience: Field operators, pilots, crew members
- Purpose: Safety training with COR/SECOR audit compliance

SOURCE CONTENT:
{sourceChunks}

REGULATORY REFERENCES:
{regulatoryContext}

Generate {questionCount} quiz questions following these rules:

1. QUESTION TYPES (vary between these):
   - Multiple choice (4 options, 1 correct)
   - Scenario-based (present situation, ask best action)
   - True/False with explanation required
   - Ordering (sequence of steps)

2. DIFFICULTY LEVEL: {difficultyLevel}
   - Beginner: Direct recall, basic concepts
   - Intermediate: Application, "what would you do"
   - Advanced: Complex scenarios, edge cases, regulation interpretation

3. REQUIREMENTS:
   - Each question must be traceable to the source content
   - Include regulatory reference where applicable
   - Explanations must cite specific procedures or regulations
   - Wrong answer explanations should be educational, not punishing
   - Use realistic BC/Canadian operational context

4. OUTPUT FORMAT (JSON):
{
  "questions": [
    {
      "type": "multiple_choice",
      "question": "...",
      "options": [
        {"id": "a", "text": "...", "isCorrect": false, "explanation": "..."},
        ...
      ],
      "regulatoryReference": "CARs 901.XX / WorkSafeBC Part X.XX",
      "sourceChunkId": "{chunkId}",
      "difficultyLevel": 1-5
    }
  ]
}

Generate questions that test understanding, not just memorization. Field operators should finish feeling more competent, not just tested.`
```

#### Scenario Generation

```javascript
const SCENARIO_GENERATION_PROMPT = `You are creating an interactive safety training scenario for RPAS/drone field operations in British Columbia, Canada.

SCENARIO PARAMETERS:
- Category: {category} (RPAS_flight / marine_survey / field_logistics / emergency)
- Difficulty: {difficultyTier} (green=routine / yellow=degraded / red=emergency)
- Focus Topics: {topicFocus}

OPERATIONAL CONTEXT:
{operationalContext}

PROCEDURE REFERENCES:
{procedureChunks}

REGULATORY CONTEXT:
{regulatoryChunks}

Create a branching scenario following this structure:

1. INITIAL SETUP:
   - Realistic operational context (weather, terrain, crew, equipment, client)
   - Time pressure or constraints that feel authentic
   - No obvious "right answer" telegraphing

2. DECISION POINTS (3-5 minimum):
   - Each decision should have 2-4 options
   - Options should include: optimal, acceptable, risky, wrong
   - Consequences should be realistic and proportional
   - Include pressure from client/time/crew where appropriate

3. BRANCH STRUCTURE:
   - Multiple paths to success (different styles can work)
   - Clear failure paths with educational outcomes
   - At least one "trap" that seems right but isn't

4. DEBRIEF CONTENT:
   - For each decision point, explain optimal choice
   - Reference specific procedures and regulations
   - Provide "in the field" practical advice

OUTPUT FORMAT (JSON):
{
  "title": "...",
  "description": "...",
  "contextData": {
    "weather": {"conditions": "...", "visibility": "...", "wind": "..."},
    "terrain": "...",
    "equipment": {"aircraft": "...", "status": "...", "batteries": "..."},
    "crewComposition": [...],
    "clientExpectations": "...",
    "timePressure": "..."
  },
  "nodes": [
    {
      "id": "node_1",
      "type": "narrative",
      "content": "...",
      "decisions": [
        {
          "id": "d1a",
          "text": "...",
          "nextNodeId": "node_2",
          "scoreImpact": 10,
          "isOptimal": true,
          "rationale": "..."
        }
      ]
    }
  ],
  "optimalPath": ["node_1", "node_3", "node_7", "node_12"],
  "maxScore": 100,
  "procedureReferences": ["PROC-001", "PROC-015"],
  "regulatoryReferences": ["CARs 901.24", "WorkSafeBC 4.20"]
}

Make it feel real. Field operators should recognize the situations from their actual work.`
```

#### Readiness Nudge Generation

```javascript
const READINESS_NUDGE_PROMPT = `You are a supportive safety companion for a field operator doing their daily readiness check-in.

USER'S CURRENT STATE:
- Overall Readiness Score: {overallScore}/100
- Physical Score: {physicalScore}/100
- Mental Score: {mentalScore}/100
- Fatigue Score: {fatigueScore}/100
- Category Details: {categoryDetails}

CONTEXT:
- Time of day: {timeOfDay}
- Day of week: {dayOfWeek}
- Upcoming operations: {scheduledOperations}
- Recent trends: {recentTrends}

TONE REQUIREMENTS:
- Supportive, not preachy
- Practical, not corporate
- Brief (2-3 sentences max for main message)
- Field-relevant (these are outdoor professionals)

Generate a personalized response:

1. ACKNOWLEDGMENT (required):
   - Recognize their state without judgment
   - Non-punitive, supportive framing

2. CONTEXTUAL TIP (if score < 80):
   - One practical, actionable tip
   - Relevant to their specific low category
   - Things they can actually do in the field

3. SCHEDULING CONSIDERATION (if score < 60 and operation scheduled):
   - Gentle suggestion to check in with supervisor
   - Frame as option, not requirement
   - Emphasize their autonomy

4. POSITIVE REINFORCEMENT (if score >= 80):
   - Acknowledge good readiness
   - Quick motivational note
   - Keep it authentic, not cheesy

OUTPUT FORMAT (JSON):
{
  "mainMessage": "...",
  "tip": "..." or null,
  "schedulingNote": "..." or null,
  "category": "encouragement" | "gentle_concern" | "check_in_suggested"
}

Remember: This is voluntary, personal data. The operator trusts us with their wellness. Respect that.`
```

#### Adaptive Difficulty

```javascript
const ADAPTIVE_DIFFICULTY_PROMPT = `Based on the user's performance data, adjust the content difficulty.

USER PERFORMANCE:
- Recent quiz accuracy: {recentAccuracy}%
- Topic proficiency: {topicProficiency}
- Time per question: {avgTimePerQuestion}s
- Streak: {currentStreak} days
- Questions answered today: {questionsToday}

CURRENT CONTENT:
- Difficulty level: {currentDifficulty}
- Topic: {currentTopic}

RULES:
1. If accuracy > 90% for 5+ questions, increase difficulty
2. If accuracy < 60% for 3+ questions, decrease difficulty
3. If time per question >> average, may indicate struggling
4. Maintain engagement - don't make it too easy or frustrating

OUTPUT:
{
  "recommendedDifficulty": 1-5,
  "rationale": "...",
  "topicAdjustment": "stay" | "review_basics" | "advance"
}`
```

### 5.3 Token Budget & Caching Strategy

**Token Estimates per Operation**:

| Operation | Input Tokens | Output Tokens | Cost (Sonnet) |
|-----------|-------------|---------------|---------------|
| Quiz generation (5 Qs) | 2,000 | 1,500 | ~$0.02 |
| Scenario generation | 3,000 | 4,000 | ~$0.05 |
| Real-time explanation | 500 | 300 | ~$0.005 |
| Scenario debrief | 1,500 | 2,000 | ~$0.025 |
| Readiness nudge | 300 | 150 | ~$0.003 |

**Caching Strategy**:

1. **Generated Content Cache** (Firestore):
   - Quiz questions stored after generation and review
   - Scenario variations stored for replay
   - Lessons cached after creation
   - Cache invalidation on source content change

2. **Context Caching**:
   - Store commonly used regulatory chunks
   - Pre-format procedure references
   - Cache user performance summaries (updated daily)

3. **Response Caching** (short-term):
   - Debrief responses for same scenario/path (24h TTL)
   - Readiness nudges for same score range (1h TTL)
   - Quiz explanations for same question (indefinite)

**Cost Projections** (per user per month):
- Active user (daily engagement): ~$2-5/month
- Moderate user (weekly): ~$0.50-1/month
- Light user (occasional): ~$0.10-0.25/month

---

## 6. Gamification System Design

### 6.1 XP System

**XP Sources**:

| Action | Base XP | Streak Bonus | Notes |
|--------|---------|--------------|-------|
| Complete lesson | 25 | +50% | Scales with lesson length |
| Quiz question correct | 10 | +50% | First try bonus: +5 |
| Complete quest | 100 | +50% | Plus quiz score bonus |
| Scenario complete | 150 | +50% | Score multiplier: 0.5-1.5x |
| Readiness check-in | 15 | +100% | Consistency valued |
| Perfect quiz (100%) | 50 bonus | - | Stacks with question XP |
| Daily login | 5 | - | Caps at 1/day |

**Level Progression**:

```javascript
// XP required for each level
const LEVEL_XP = {
  1: 0,
  2: 100,
  3: 250,
  4: 450,
  5: 700,
  6: 1000,
  7: 1400,
  8: 1900,
  9: 2500,
  10: 3200,
  // ... continues with increasing gaps
  25: 15000,
  50: 50000,
  100: 150000 // "Safety Legend"
}

// Level titles
const LEVEL_TITLES = {
  1-4: "Safety Apprentice",
  5-9: "Safety Practitioner",
  10-14: "Safety Professional",
  15-19: "Safety Expert",
  20-24: "Safety Master",
  25-49: "Safety Champion",
  50-99: "Safety Guardian",
  100+: "Safety Legend"
}
```

### 6.2 Badge Taxonomy

**Categories**:

1. **Quest Badges** (track/quest completion)
   - Track Master: RPAS Operations (complete all RPAS quests)
   - Emergency Ready (complete Emergency Response track)
   - PPE Pro (complete PPE & Equipment track)
   - Regulatory Scholar (complete all regulatory-focused quests)

2. **Scenario Badges** (scenario achievements)
   - Perfect Decision Maker (100% on any Red scenario)
   - Calm Under Pressure (complete 5 emergency scenarios)
   - Client Whisperer (navigate 3 client pressure scenarios optimally)
   - Weather Wise (complete all weather-related scenarios)

3. **Readiness Badges** (check-in achievements)
   - Consistent Operator (30-day check-in streak)
   - Self-Aware (logged 100 check-ins)
   - Peak Performer (7 days with 90+ readiness)
   - Trend Spotter (acknowledge and act on a trend insight)

4. **Streak Badges** (consistency)
   - Week Warrior (7-day streak)
   - Monthly Champion (30-day streak)
   - Quarterly Legend (90-day streak)
   - Year of Safety (365-day streak)

5. **Milestone Badges** (cumulative)
   - First Steps (complete first quest)
   - Century Club (100 questions answered)
   - Knowledge Seeker (1000 XP earned)
   - Safety Scholar (10,000 XP earned)
   - Safety Expert (50,000 XP earned)

**Rarity Distribution**:
- Common (60%): Basic completion badges
- Uncommon (25%): Multiple completions, short streaks
- Rare (10%): Long streaks, perfect scores
- Epic (4%): Exceptional achievements
- Legendary (1%): Year streak, all content complete

### 6.3 Streak Mechanics

**Streak Rules**:
- Activity required: Complete 1 lesson OR 1 quiz question OR 1 readiness check-in
- Reset time: Midnight local time
- Grace period: None (but streak protection available)

**Streak Protection**:
- Earn 1 protection per 7-day streak
- Max 3 protections stored
- Auto-used on missed day
- Cannot earn while protected

**Streak Bonuses**:
- Days 1-6: 1.0x XP
- Days 7-13: 1.25x XP
- Days 14-29: 1.5x XP
- Days 30-59: 1.75x XP
- Days 60+: 2.0x XP

### 6.4 Safety Culture Score

**Calculation**:

```javascript
const calculateSafetyCultureScore = (profile) => {
  const weights = {
    questProgress: 0.25,      // % of quests completed
    quizAccuracy: 0.20,       // Average quiz score
    scenarioPerformance: 0.20, // Average scenario score
    readinessConsistency: 0.20, // Check-in streak / 30 (capped at 1)
    engagement: 0.15          // Recent activity score
  }

  const scores = {
    questProgress: profile.completedQuests / totalQuests * 100,
    quizAccuracy: profile.averageQuizScore,
    scenarioPerformance: profile.averageScenarioScore,
    readinessConsistency: Math.min(profile.readinessStreak / 30, 1) * 100,
    engagement: calculateEngagementScore(profile.lastActivityDate, profile.weeklyActivity)
  }

  return Object.keys(weights).reduce((total, key) => {
    return total + (scores[key] * weights[key])
  }, 0)
}
```

**Score Tiers**:
- 90-100: Exemplary (green)
- 75-89: Strong (blue)
- 60-74: Developing (yellow)
- Below 60: Needs Attention (orange)

### 6.5 Leaderboard

**Scope Options**:
- Organization-wide (default)
- Team/department
- Role-based (pilots, crew, etc.)

**Privacy**:
- Opt-in only
- Can display alias instead of name
- Position shown without exact score option

**Time Periods**:
- Weekly (resets Sunday)
- Monthly (resets 1st)
- All-time

**Anti-Gaming**:
- Cap daily XP earnings (prevents grinding)
- Quality multipliers (accuracy matters)
- Streak decay for extended breaks

---

## 7. UI/UX Wireframe Descriptions

### 7.1 Safety Quests Hub

**Page: `/training/quests`**

```
┌─────────────────────────────────────────────────────────────────┐
│ SAFETY QUESTS                                    [Streak: 🔥 12] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ YOUR PROGRESS                                             │   │
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 45%                   │   │
│  │ Level 7 • 1,420 XP • 6 badges earned                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────┐  ┌─────────────────────┐               │
│  │ 📍 CONTINUE          │  │ 📚 REVIEW DUE       │               │
│  │ Pre-Flight Checks    │  │ 3 items ready for   │               │
│  │ Lesson 4 of 6        │  │ spaced repetition   │               │
│  │ [Continue →]         │  │ [Review Now]        │               │
│  └─────────────────────┘  └─────────────────────┘               │
│                                                                  │
│  QUEST TRACKS                                        [View All]  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 🛩️ RPAS OPERATIONS                              ★★☆☆☆     │ │
│  │ Master the fundamentals of drone operations                 │ │
│  │ ━━━━━━━━━━━━━━━━━━━ 60% • 4/7 quests complete              │ │
│  │ [Continue Track]                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ⚠️ FIELD HAZARDS                                 ★★★☆☆     │ │
│  │ Identify and mitigate common field hazards                  │ │
│  │ ━━━━━━━━━ 30% • 2/6 quests complete                        │ │
│  │ [Continue Track]                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 🔒 EMERGENCY RESPONSE                            ★★★★☆     │ │
│  │ Requires: RPAS Operations (3/7)                             │ │
│  │ [Locked - Complete prerequisite]                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 Quest Detail / Lesson View

**Page: `/training/quests/{questId}`**

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Back to RPAS Operations                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PRE-FLIGHT INSPECTION                                          │
│  ━━━━━━━━━━━━━━━━━━━ Lesson 4 of 6                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │                   [Lesson Content]                    │  │ │
│  │  │                                                       │  │ │
│  │  │  Battery Pre-Flight Checks                            │  │ │
│  │  │  ─────────────────────────────────                    │  │ │
│  │  │                                                       │  │ │
│  │  │  Before every flight, you must verify:                │  │ │
│  │  │                                                       │  │ │
│  │  │  1. Battery charge level (minimum 80% for            │  │ │
│  │  │     operations, per SOP-RPAS-003)                    │  │ │
│  │  │                                                       │  │ │
│  │  │  2. Physical condition - check for:                   │  │ │
│  │  │     • Swelling or puffiness                          │  │ │
│  │  │     • Damage to casing                               │  │ │
│  │  │     • Corrosion on contacts                          │  │ │
│  │  │                                                       │  │ │
│  │  │  📋 Reference: SOP-RPAS-003 Section 4.2              │  │ │
│  │  │                                                       │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ○ ○ ○ ● ○ ○                              [← Prev] [Next →] │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  +25 XP on completion                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 Quiz Interface

```
┌─────────────────────────────────────────────────────────────────┐
│ KNOWLEDGE CHECK                                   Question 3/5   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  You arrive at a job site and notice one of your LiPo           │
│  batteries feels unusually warm and appears slightly             │
│  swollen. What should you do?                                    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ○ A. Use it for the first flight only, then retire it      │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ○ B. Immediately remove it from service, place in          │ │
│  │      fireproof container, document and report               │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ○ C. Let it cool down and reassess in 30 minutes          │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ○ D. Continue with the operation using remaining batteries │ │
│  │      and address the issue after the job                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│                                           [Submit Answer]        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.4 Scenario Challenges Hub

**Page: `/training/scenarios`**

```
┌─────────────────────────────────────────────────────────────────┐
│ SCENARIO CHALLENGES                              [Best: 92/100]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 📊 YOUR STATS                                               │ │
│  │ 12 scenarios completed • Avg score: 78% • 3 perfect runs   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  DIFFICULTY: [🟢 Green] [🟡 Yellow] [🔴 Red] [All]              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 🟢 CLIENT PRESSURE AT LAUNCH                                │ │
│  │ ──────────────────────────────────────────                  │ │
│  │ Your client is pushing to launch despite marginal weather.  │ │
│  │ Navigate the conversation and make the right call.          │ │
│  │                                                              │ │
│  │ 🕐 15 min • 🎯 Best: 88/100 • ✓ Completed 2x               │ │
│  │                                              [Play Again]    │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 🟡 EQUIPMENT FAILURE MID-FLIGHT                             │ │
│  │ ──────────────────────────────────────────                  │ │
│  │ Your aircraft reports a sensor anomaly while over a        │ │
│  │ difficult-to-reach area. Decide how to proceed.            │ │
│  │                                                              │ │
│  │ 🕐 20 min • 🎯 Not attempted                                │ │
│  │                                              [Start]         │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 🔴 WILDLIFE ENCOUNTER - BEAR                                │ │
│  │ ──────────────────────────────────────────                  │ │
│  │ 🔒 Complete 3 Yellow scenarios to unlock                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.5 Scenario Player

```
┌─────────────────────────────────────────────────────────────────┐
│ CLIENT PRESSURE AT LAUNCH                           Score: 45   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ [Weather advisory image / scene illustration]               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  You're set up at a construction site for an orthomosaic       │
│  survey. The client project manager approaches as you're       │
│  completing your pre-flight checks.                            │
│                                                                  │
│  "We really need this done today. The concrete pour is         │
│  scheduled for tomorrow morning and we need these images       │
│  for the engineers tonight. What's the holdup?"                │
│                                                                  │
│  You glance at your weather app - winds are currently at       │
│  28 km/h gusting to 35 km/h. Your aircraft's limit is          │
│  38 km/h, but gusts could exceed that.                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ A. "The winds are borderline. Let me do a test hover to    │ │
│  │    see how the aircraft handles."                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ B. "I understand the timeline, but current conditions are  │ │
│  │    outside our safe operating parameters. We need to wait."│ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ C. "I can try a quick flight. If it gets too rough, I'll   │ │
│  │    bring it back immediately."                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ D. "Let me call my supervisor to discuss options."         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.6 Scenario Debrief

```
┌─────────────────────────────────────────────────────────────────┐
│ SCENARIO COMPLETE                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           YOUR SCORE: 78/100 ⭐⭐⭐☆☆                       │ │
│  │                    +117 XP earned                           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  DECISION ANALYSIS                                               │
│  ─────────────────────                                          │
│                                                                  │
│  1. Initial client pressure                                      │
│     Your choice: B - Cite safety parameters ✅ OPTIMAL          │
│     "Clear communication of operational limits is essential.    │
│      Reference: SOP-RPAS-007 Section 3.1"                       │
│                                                                  │
│  2. Client escalates, mentions contract                         │
│     Your choice: C - Offer alternatives ✅ GOOD                 │
│     "Providing options shows professionalism. The optimal       │
│      response would also document the conversation.             │
│      Reference: SOP-CLIENT-002 Section 2.4"                     │
│                                                                  │
│  3. Weather check decision                                       │
│     Your choice: A - Quick test flight ⚠️ SUBOPTIMAL           │
│     "Test flights in marginal conditions still carry risk.      │
│      Better approach: Wait for conditions to improve, or        │
│      use documented weather limits as the decision point.       │
│      Reference: CARs 901.24, Company Weather Minimums"          │
│                                                                  │
│  KEY TAKEAWAY                                                    │
│  Client pressure is one of the top factors in safety incidents. │
│  Maintaining professional boundaries while offering solutions    │
│  protects both you and the client.                              │
│                                                                  │
│  [Review Optimal Path]  [Try Again]  [Back to Scenarios]        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.7 Operator Ready Dashboard

**Page: `/operator-ready`**

```
┌─────────────────────────────────────────────────────────────────┐
│ OPERATOR READY                                    🔥 14-day streak│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                              │ │
│  │              TODAY'S READINESS                              │ │
│  │                                                              │ │
│  │                   ╭──────────╮                              │ │
│  │                  ╱            ╲                             │ │
│  │                 │      82      │                            │ │
│  │                  ╲            ╱                             │ │
│  │                   ╰──────────╯                              │ │
│  │                                                              │ │
│  │              ━━━━━━━━━━━━━━━━━━━━ GOOD                      │ │
│  │                                                              │ │
│  │  +15 XP                                 Last check: 6:45 AM │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  CATEGORY BREAKDOWN                                              │
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐│
│  │ 💪 Physical         85/100 │ │ 🧠 Mental           78/100 ││
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━  │ │ ━━━━━━━━━━━━━━━━━━━━━━━━   ││
│  └─────────────────────────────┘ └─────────────────────────────┘│
│  ┌─────────────────────────────┐ ┌─────────────────────────────┐│
│  │ 😴 Fatigue          80/100 │ │ 🌡️ Environment     88/100 ││
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━   │ │ ━━━━━━━━━━━━━━━━━━━━━━━━━  ││
│  └─────────────────────────────┘ └─────────────────────────────┘│
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 💡 TIP: Your mental readiness is slightly lower today.     │ │
│  │    Consider a 5-minute breathing exercise before heading   │ │
│  │    out. [Show me how →]                                     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  TRENDS                                             [View Full] │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ 100├                                                        │ │
│  │    │    ╭─╮ ╭─╮                                             │ │
│  │  75├  ╭─╯ ╰─╯ ╰─╮    ╭─╮                                    │ │
│  │    │──╯         ╰────╯ ╰───                                 │ │
│  │  50├                                                        │ │
│  │    └────────────────────────────────────────────────        │ │
│  │      M   T   W   T   F   S   S   M   T   W   T   F         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  📋 Upcoming: Site survey at Maple Ridge (Tomorrow, 7:00 AM)   │
│                                                                  │
│                                      [Check In Again] [History] │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 7.8 Readiness Check-In Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ DAILY CHECK-IN                                       Step 2 of 5│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  💪 PHYSICAL READINESS                                          │
│  ────────────────────────                                       │
│                                                                  │
│  How many hours of sleep did you get last night?                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  ←  ━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  →   │ │
│  │                    7.5 hours                                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  How would you rate your physical energy right now?             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                              │ │
│  │   😫        😐        🙂        😊        💪               │ │
│  │   Very      Low      Okay     Good     Great               │ │
│  │   Low                          [●]                          │ │
│  │                                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Any illness symptoms or physical concerns today?               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │   [None]  [Mild]  [Moderate - should discuss]              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ○ ● ○ ○ ○                                                     │
│                                                                  │
│                                            [← Back]  [Next →]   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Implementation Phases

### Phase 1: Foundation (Weeks 1-2)

**Deliverables**:
- Firestore schema implementation
- Gamification engine core (XP, levels, streaks)
- Badge system infrastructure
- Content pipeline foundation (document ingestion)
- Basic Claude API integration layer

**Files Created**:
```
src/lib/firestoreGamification.js
src/lib/gamificationEngine.js
src/lib/contentPipeline.js
src/lib/safetyAI.js
src/components/gamification/shared/*.jsx
functions/gamification/*.js
```

**Dependencies**: None

---

### Phase 2: Safety Quest System (Weeks 3-5)

**Deliverables**:
- Quest track and quest management
- Lesson viewer (all content types)
- Quiz system with all question types
- Spaced repetition queue
- Progress tracking and XP awards
- Admin interface for content review

**Files Created**:
```
src/pages/SafetyQuests.jsx
src/pages/QuestDetail.jsx
src/pages/LessonView.jsx
src/components/gamification/quests/*.jsx
functions/quests/*.js
```

**Dependencies**: Phase 1

---

### Phase 3: Scenario Challenges (Weeks 6-8)

**Deliverables**:
- Scenario player engine
- Branching narrative system
- Decision tracking and scoring
- Debrief generation (Claude API)
- Scenario generation tools (admin)
- Training record integration

**Files Created**:
```
src/pages/ScenarioChallenges.jsx
src/pages/ScenarioPlay.jsx
src/components/gamification/scenarios/*.jsx
functions/scenarios/*.js
```

**Dependencies**: Phase 1, Phase 2 (shared gamification)

---

### Phase 4: Operator Ready Score (Weeks 9-10)

**Deliverables**:
- Daily check-in flow
- Readiness score calculation
- Trend visualization
- AI-powered nudges
- Privacy controls
- Calendar/schedule integration

**Files Created**:
```
src/pages/OperatorReady.jsx
src/components/gamification/readiness/*.jsx
functions/readiness/*.js
```

**Dependencies**: Phase 1

---

### Phase 5: Integration & Polish (Weeks 11-12)

**Deliverables**:
- Safety Culture Score dashboard
- Leaderboard implementation
- Navigation integration
- Badge gallery
- COR/SECOR export reports
- Performance optimization
- Mobile responsiveness

**Files Created**:
```
src/pages/SafetyCultureDashboard.jsx
src/components/gamification/Leaderboard.jsx
src/components/gamification/BadgeGallery.jsx
```

**Dependencies**: All previous phases

---

### Phase 6: Content Population (Ongoing, starts Week 4)

**Deliverables**:
- Ingest existing policies/procedures
- Generate initial quest content (AI + review)
- Create scenario library (AI + review)
- Configure readiness categories
- Regulatory content integration

**Dependencies**: Phase 2 (for quests), Phase 3 (for scenarios)

---

### Milestone Summary

| Week | Milestone | Demo-able Feature |
|------|-----------|-------------------|
| 2 | Foundation complete | XP/badge system working |
| 5 | Quest MVP | Complete a quest, earn XP |
| 8 | Scenario MVP | Play a scenario, get debrief |
| 10 | Readiness MVP | Daily check-in with score |
| 12 | Full integration | Safety Culture Score live |

---

## 9. Risk & Considerations

### 9.1 Content Accuracy Risks

**Risk**: AI-generated content contains inaccurate safety information

**Mitigations**:
1. **Mandatory human review** - All AI-generated content (quizzes, scenarios, lessons) requires approval before going live
2. **Source attribution** - Every generated item links back to source chunks, enabling verification
3. **Confidence scoring** - Flag low-confidence generations for extra review
4. **Versioning** - Track all content versions, enable rollback
5. **User feedback loop** - Allow operators to flag questionable content

**Review Workflow**:
```
AI Generation → Draft Status → SME Review → Approved/Rejected
                                    ↓
                            Feedback to improve prompts
```

### 9.2 Regulatory Compliance Gaps

**Risk**: Content doesn't accurately reflect current regulations

**Mitigations**:
1. **Regulatory source tracking** - Every regulatory reference is versioned and dated
2. **Update monitoring** - Scheduled checks for Transport Canada, WorkSafeBC updates
3. **Change impact analysis** - When source content changes, flag affected quests/scenarios
4. **SME sign-off** - Regulatory content requires qualified reviewer approval
5. **Disclaimer layer** - Clear communication that this is training, not legal advice

### 9.3 User Adoption Challenges

**Risk**: Operators see this as "another thing to do" and don't engage

**Mitigations**:
1. **Mobile-first design** - Quick, easy access on phones at job sites
2. **Micro-learning** - Lessons under 3 minutes, quizzes under 5 questions
3. **Relevant content** - Scenarios based on actual operational contexts
4. **Visible progress** - Streaks, XP, badges provide dopamine hits
5. **Not punitive** - Scores are for personal growth, not performance reviews
6. **Optional depth** - Basic path is quick, advanced content for those who want it
7. **Supervisor buy-in** - Tools for supervisors to encourage without mandating

### 9.4 Data Privacy Concerns

**Risk**: Readiness data used against employees

**Mitigations**:
1. **Individual data ownership** - Users control their own readiness data
2. **No management access** - Individual scores never visible to supervisors without explicit consent
3. **Aggregate only** - Organization-level insights use anonymized, aggregated data only
4. **Clear consent** - Explicit opt-in for any data sharing
5. **Data retention limits** - Configurable retention periods
6. **Export/delete rights** - Users can export or delete their data
7. **Privacy by design** - Architecture prevents unauthorized access at database level

### 9.5 API Cost Projections

**Monthly Cost Estimates**:

| User Activity Level | Users | Monthly Cost |
|---------------------|-------|--------------|
| Pilot (10 active) | 10 | $20-50 |
| Small team | 25 | $50-125 |
| Medium org | 100 | $200-500 |
| Large org | 500 | $1,000-2,500 |

**Cost Controls**:
1. **Caching strategy** - Minimize redundant API calls
2. **Haiku for bulk** - Use cheaper model where quality permits
3. **Rate limiting** - Cap daily XP/activities to prevent gaming/abuse
4. **Pre-generation** - Generate quiz questions in batches during off-hours
5. **Progressive loading** - Generate debriefs only when user requests

### 9.6 Technical Risks

**Risk**: Performance degradation with scale

**Mitigations**:
1. **Efficient queries** - Proper indexing, paginated fetches
2. **Client-side state** - Cache user progress locally
3. **Lazy loading** - Load content as needed
4. **Background processing** - Heavy AI work in Cloud Functions
5. **CDN for static content** - Images, videos via CDN

---

## 10. Testing & Validation Strategy

### 10.1 AI Content Validation

**Automated Checks**:
1. **Factual consistency** - Cross-reference generated content against source chunks
2. **Regulatory reference validation** - Verify cited regulations exist and are current
3. **Answer key verification** - Ensure quiz questions have exactly one correct answer
4. **Tone analysis** - Check for inappropriate/unprofessional language
5. **Difficulty calibration** - Verify question difficulty matches intended level

**Human Review Process**:
1. **Subject Matter Expert (SME) Review**
   - Safety manager reviews all safety-critical content
   - Operations lead reviews operational scenarios
   - Regulatory specialist reviews compliance content

2. **Pilot Testing**
   - Small group of operators test content before wide release
   - Collect feedback on clarity, relevance, accuracy
   - Iterate based on feedback

3. **Ongoing Monitoring**
   - Track user feedback/flags on content
   - Monitor quiz performance (questions with unusual fail rates)
   - Regular content audits (quarterly)

### 10.2 Gamification Balance Testing

**Metrics to Monitor**:
1. **Engagement rate** - Daily/weekly active users
2. **Completion rate** - % who finish started quests
3. **Time to complete** - Are lessons/quizzes appropriately sized?
4. **Streak retention** - How long do users maintain streaks?
5. **Score distribution** - Are quizzes too easy/hard?
6. **XP velocity** - Are users progressing at intended rate?

**A/B Testing Candidates**:
- XP reward amounts
- Streak bonus multipliers
- Quiz passing thresholds
- Lesson length
- Notification frequency

### 10.3 Integration Testing

**Test Scenarios**:
1. **Cross-feature XP** - XP earned in quests reflects in profile
2. **Badge triggers** - Badges awarded when criteria met
3. **Streak continuity** - Streaks maintained across all activity types
4. **Progress persistence** - Progress survives app updates/crashes
5. **Offline behavior** - Graceful degradation without connectivity

### 10.4 COR/SECOR Compliance Validation

**Audit Requirements Met**:
1. **Training records** - Every completed lesson/quiz is logged with timestamp
2. **Competency verification** - Quiz scores demonstrate knowledge
3. **Continuous improvement** - Scenario debriefs show learning
4. **Documentation** - All records exportable for audits

**Export Format**:
```
Training Record Export
─────────────────────
User: [Name]
Period: [Date Range]

Completed Training:
- [Date] Quest: Pre-Flight Inspection (Score: 92%, Duration: 18 min)
- [Date] Scenario: Weather Decision Making (Score: 85/100)
- [Date] Quest: Emergency Procedures (Score: 88%, Duration: 25 min)

Competency Summary:
- RPAS Operations: 78% proficient
- Emergency Response: 85% proficient
- Field Safety: 92% proficient

Continuous Improvement Evidence:
- 14 scenario debriefs reviewed
- 3 knowledge gaps identified and addressed
- Readiness check-in consistency: 92%
```

### 10.5 User Acceptance Testing

**Feedback Collection**:
1. **In-app feedback** - "Was this helpful?" after lessons/scenarios
2. **Bug reporting** - Easy access to report issues
3. **Feature requests** - Channel for suggestions
4. **Satisfaction surveys** - Periodic NPS/satisfaction checks

**Success Criteria**:
- 70%+ of users complete at least one quest in first week
- 50%+ maintain 7-day streak
- 80%+ satisfaction rating on content relevance
- <5% content accuracy complaints
- Zero safety incidents attributed to incorrect training content

---

## Appendix A: Regulatory Quick Reference

### Transport Canada CARs Part IX (RPAS)

| Section | Topic | Training Application |
|---------|-------|---------------------|
| 901.01-901.17 | Definitions, Registration | Basic knowledge quests |
| 901.18-901.29 | Basic Operations | Core operations track |
| 901.30-901.45 | Advanced Operations | Advanced certification track |
| 901.46-901.65 | BVLOS/Complex Ops | Specialized quests |
| 903.01-903.13 | Flight Rules | Scenarios: airspace decisions |
| 904.01-904.12 | Pilot Requirements | Fitness scenarios |

### WorkSafeBC Key Sections

| Part | Topic | Training Application |
|------|-------|---------------------|
| 4.3-4.11 | Inspections | Pre-work inspection quests |
| 4.13-4.20 | Emergency Procedures | Emergency response track |
| 4.20-4.23 | Working Alone | Lone worker scenarios |
| 8.1-8.98 | PPE | PPE selection quests |
| 18.1-18.58 | Traffic Control | Roadside operations scenarios |

---

## Appendix B: Sample Content Mapping

### Policy → Quest Mapping Example

**Policy: SOP-RPAS-003 Pre-Flight Inspection**

```
Sections to extract:
├── 3.1 Visual Inspection → Lesson: Airframe Visual Check
├── 3.2 Battery Verification → Lesson: Battery Safety Protocol
├── 3.3 Propulsion System → Lesson: Motor and Prop Inspection
├── 3.4 Control System → Lesson: RC Link Verification
├── 4.1 Documentation → Lesson: Flight Log Requirements
└── 5.0 Emergency Equipment → Lesson: Safety Kit Essentials

Quiz questions generated from:
├── 3.1 → "What should you check for on the airframe?"
├── 3.2 → "When should a battery be removed from service?"
├── 4.1 → "What must be recorded before every flight?"
└── Full procedure → Scenario: "You find damage during inspection..."
```

---

## Summary

This implementation plan provides a comprehensive roadmap for building three interconnected gamified safety features:

1. **Safety Quest System** - Progressive micro-learning with quests, lessons, quizzes
2. **Scenario Challenges** - Branching-narrative decision simulations
3. **Operator Ready Score** - Personal readiness and wellness tracker

The system is designed to:
- Integrate with existing Muster architecture
- Leverage Claude AI for dynamic content generation
- Meet COR/SECOR audit requirements
- Respect operator privacy (especially readiness data)
- Scale from small teams to large organizations
- Be engaging without trivializing safety

**Estimated Timeline**: 12 weeks to full feature parity

**Estimated Monthly Cost**: $2-5 per active user

**Next Steps**: Review this plan and provide feedback. Once approved, we'll begin Phase 1: Foundation.

---

*Plan prepared for review. Awaiting approval before code implementation.*
