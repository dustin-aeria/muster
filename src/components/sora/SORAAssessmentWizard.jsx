/**
 * SORAAssessmentWizard.jsx
 * Main wizard component for SORA assessment
 *
 * Contains all 7 steps:
 * 1. ConOps - Concept of Operations
 * 2. Ground Risk - GRC calculation
 * 3. Air Risk - ARC calculation
 * 4. SAIL - SAIL determination
 * 5. Containment - Containment strategy
 * 6. OSO - OSO compliance matrix
 * 7. Review - Final review and submission
 *
 * @location src/components/sora/SORAAssessmentWizard.jsx
 */

import { useState } from 'react'
import ConOpsStep from './steps/ConOpsStep'
import GroundRiskStep from './steps/GroundRiskStep'
import AirRiskStep from './steps/AirRiskStep'
import SAILStep from './steps/SAILStep'
import ContainmentStep from './steps/ContainmentStep'
import OSOComplianceStep from './steps/OSOComplianceStep'
import ReviewStep from './steps/ReviewStep'

export default function SORAAssessmentWizard({ assessment, osoStatuses, currentStep }) {
  const [activeTab, setActiveTab] = useState(currentStep)

  // Render the appropriate step component
  const renderStep = () => {
    switch (activeTab) {
      case 'conops':
        return <ConOpsStep assessment={assessment} />
      case 'ground_risk':
        return <GroundRiskStep assessment={assessment} />
      case 'air_risk':
        return <AirRiskStep assessment={assessment} />
      case 'sail':
        return <SAILStep assessment={assessment} />
      case 'containment':
        return <ContainmentStep assessment={assessment} />
      case 'oso':
        return <OSOComplianceStep assessment={assessment} osoStatuses={osoStatuses} />
      case 'review':
        return <ReviewStep assessment={assessment} osoStatuses={osoStatuses} />
      default:
        return <ConOpsStep assessment={assessment} />
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {renderStep()}
    </div>
  )
}
