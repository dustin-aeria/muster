/**
 * Form26_0882E.jsx
 * Auto-populated Transport Canada Form 26-0882E for RPAS Safety Assurance Declaration
 *
 * This form is the official application form for making a safety declaration
 * per CAR 901.194 and Standard 922.
 *
 * @location src/components/safetyDeclaration/Form26_0882E.jsx
 */

import { useState, useRef } from 'react'
import {
  Printer,
  Download,
  CheckSquare,
  Square,
  AlertCircle,
  Info,
  ExternalLink
} from 'lucide-react'
import {
  DECLARATION_TYPES,
  OPERATION_TYPES,
  REQUIREMENT_SECTIONS,
  RPAS_CATEGORIES,
  KINETIC_ENERGY_CATEGORIES
} from '../../lib/firestoreSafetyDeclaration'

export default function Form26_0882E({
  declaration,
  requirements = [],
  evidence = [],
  sessions = []
}) {
  const [showInstructions, setShowInstructions] = useState(false)
  const formRef = useRef(null)

  const handlePrint = () => {
    window.print()
  }

  if (!declaration) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No declaration data available</p>
      </div>
    )
  }

  const rpas = declaration.rpasDetails || {}
  const declarant = declaration.declarantInfo || {}
  const typeInfo = DECLARATION_TYPES[declaration.declarationType] || DECLARATION_TYPES.declaration
  const categoryInfo = RPAS_CATEGORIES[rpas.category] || {}
  const keInfo = KINETIC_ENERGY_CATEGORIES[rpas.kineticEnergyCategory] || {}

  // Calculate statistics
  const completedReqs = requirements.filter(r => r.status === 'complete').length
  const applicableReqs = requirements.filter(r => r.status !== 'not_applicable').length
  const completedTests = sessions.filter(s => s.status === 'complete').length

  // Current date formatted
  const currentDate = new Date().toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="space-y-6">
      {/* Print/Download Controls */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg print:hidden">
        <div>
          <h2 className="font-medium text-gray-900">Form 26-0882E - RPAS Safety Assurance Declaration</h2>
          <p className="text-sm text-gray-500">Transport Canada official application form</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          >
            <Info className="w-4 h-4" />
            Instructions
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Printer className="w-4 h-4" />
            Print Form
          </button>
        </div>
      </div>

      {/* Instructions Panel */}
      {showInstructions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 print:hidden">
          <h3 className="font-medium text-blue-800 mb-2">Form Instructions</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>1. Review all auto-populated fields for accuracy</li>
            <li>2. Complete any blank fields manually if needed</li>
            <li>3. Print the form and sign in the designated area</li>
            <li>4. Submit with supporting documentation to Transport Canada</li>
            <li>5. Keep a copy for your records</li>
          </ul>
          <a
            href="https://tc.canada.ca/en/aviation/drone-safety/getting-permission-fly-your-drone/safety-assurance-declaration"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-3"
          >
            <ExternalLink className="w-3 h-3" />
            Official TC Declaration Information
          </a>
        </div>
      )}

      {/* Form Content */}
      <div
        ref={formRef}
        className="bg-white border border-gray-300 rounded-lg p-8 shadow-sm print:shadow-none print:border-2 print:border-black"
      >
        {/* Form Header */}
        <div className="border-b-2 border-black pb-4 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Transport Canada / Transports Canada</p>
              <h1 className="text-xl font-bold mt-1">RPAS Safety Assurance Declaration</h1>
              <p className="text-sm text-gray-600">Déclaration d'assurance de sécurité des SATP</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Form / Formulaire</p>
              <p className="text-lg font-bold">26-0882E</p>
            </div>
          </div>
        </div>

        {/* Section 1: Declaration Type */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700 border-b border-gray-300 pb-1 mb-3">
            Section 1: Type of Declaration / Type de déclaration
          </h2>
          <div className="flex gap-8">
            <label className="flex items-center gap-2">
              {declaration.declarationType === 'declaration' ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm">Safety Assurance Declaration (CAR 901.194)</span>
            </label>
            <label className="flex items-center gap-2">
              {declaration.declarationType === 'pre_validated' ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm">Pre-Validated Declaration (PVD)</span>
            </label>
          </div>
        </div>

        {/* Section 2: Applicant Information */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700 border-b border-gray-300 pb-1 mb-3">
            Section 2: Applicant Information / Renseignements sur le demandeur
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Name / Nom</label>
              <div className="border-b border-gray-400 py-1 min-h-[28px]">
                {declarant.name || <span className="text-gray-300 italic">_________________</span>}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Organization / Organisation</label>
              <div className="border-b border-gray-400 py-1 min-h-[28px]">
                {declarant.organization || <span className="text-gray-300 italic">_________________</span>}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Email / Courriel</label>
              <div className="border-b border-gray-400 py-1 min-h-[28px]">
                {declarant.email || <span className="text-gray-300 italic">_________________</span>}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Phone / Téléphone</label>
              <div className="border-b border-gray-400 py-1 min-h-[28px]">
                {declarant.phone || <span className="text-gray-300 italic">_________________</span>}
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500 block mb-1">Address / Adresse</label>
              <div className="border-b border-gray-400 py-1 min-h-[28px]">
                {declarant.address || <span className="text-gray-300 italic">_________________</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: RPAS Information */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700 border-b border-gray-300 pb-1 mb-3">
            Section 3: RPAS Information / Renseignements sur le SATP
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Manufacturer / Fabricant</label>
              <div className="border-b border-gray-400 py-1 min-h-[28px]">
                {rpas.manufacturer || <span className="text-gray-300 italic">_______</span>}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Model / Modèle</label>
              <div className="border-b border-gray-400 py-1 min-h-[28px]">
                {rpas.model || <span className="text-gray-300 italic">_______</span>}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Serial Number / Numéro de série</label>
              <div className="border-b border-gray-400 py-1 min-h-[28px]">
                {rpas.serialNumber || <span className="text-gray-300 italic">_______</span>}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Maximum Takeoff Weight (kg)</label>
              <div className="border-b border-gray-400 py-1 min-h-[28px]">
                {rpas.weightKg || <span className="text-gray-300 italic">____</span>}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Maximum Velocity (m/s)</label>
              <div className="border-b border-gray-400 py-1 min-h-[28px]">
                {rpas.maxVelocityMs || <span className="text-gray-300 italic">____</span>}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Maximum Kinetic Energy (J)</label>
              <div className="border-b border-gray-400 py-1 min-h-[28px]">
                {rpas.maxKineticEnergy || <span className="text-gray-300 italic">____</span>}
              </div>
            </div>
          </div>

          {/* Weight Category */}
          <div className="mt-4">
            <label className="text-xs text-gray-500 block mb-2">RPAS Weight Category / Catégorie de poids</label>
            <div className="flex gap-6">
              {Object.entries(RPAS_CATEGORIES).map(([key, cat]) => (
                <label key={key} className="flex items-center gap-2">
                  {rpas.category === key ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-xs">{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* KE Category */}
          <div className="mt-4">
            <label className="text-xs text-gray-500 block mb-2">Kinetic Energy Category / Catégorie d'énergie cinétique</label>
            <div className="flex gap-6">
              {Object.entries(KINETIC_ENERGY_CATEGORIES).map(([key, cat]) => (
                <label key={key} className="flex items-center gap-2">
                  {rpas.kineticEnergyCategory === key ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-xs">{cat.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Operations */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700 border-b border-gray-300 pb-1 mb-3">
            Section 4: Intended Operations / Opérations prévues
          </h2>
          <p className="text-xs text-gray-500 mb-2">Select all applicable operation types:</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(OPERATION_TYPES).map(([key, op]) => (
              <label key={key} className="flex items-start gap-2">
                {declaration.operationTypes?.includes(key) ? (
                  <CheckSquare className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-xs font-medium">{op.label}</span>
                  <p className="text-xs text-gray-500">{op.car_reference}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Section 5: Applicable Standards */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700 border-b border-gray-300 pb-1 mb-3">
            Section 5: Applicable Standard 922 Sections / Sections applicables de la norme 922
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(REQUIREMENT_SECTIONS).map(([key, section]) => (
              <label key={key} className="flex items-start gap-2">
                {declaration.applicableStandards?.includes(key) ? (
                  <CheckSquare className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-xs font-medium">{key}</span>
                  <p className="text-xs text-gray-500">{section.title}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Section 6: Compliance Summary */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700 border-b border-gray-300 pb-1 mb-3">
            Section 6: Compliance Summary / Résumé de conformité
          </h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <p className="text-2xl font-bold text-gray-900">{applicableReqs}</p>
              <p className="text-xs text-gray-500">Applicable Requirements</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <p className="text-2xl font-bold text-green-600">{completedReqs}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded">
              <p className="text-2xl font-bold text-blue-600">{completedTests}</p>
              <p className="text-xs text-gray-500">Tests Completed</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <p className="text-2xl font-bold text-purple-600">{evidence.length}</p>
              <p className="text-xs text-gray-500">Evidence Items</p>
            </div>
          </div>
        </div>

        {/* Section 7: Containment */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700 border-b border-gray-300 pb-1 mb-3">
            Section 7: Containment Robustness Level / Niveau de robustesse du confinement
          </h2>
          <div className="flex gap-8">
            <label className="flex items-center gap-2">
              {declaration.robustnessLevel === 'low' ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm">Low Robustness (Standard 922.08 basic)</span>
            </label>
            <label className="flex items-center gap-2">
              {declaration.robustnessLevel === 'high' ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
              <span className="text-sm">High Robustness (Standard 922.08 enhanced)</span>
            </label>
          </div>
        </div>

        {/* Section 8: Declaration Statement */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700 border-b border-gray-300 pb-1 mb-3">
            Section 8: Declaration Statement / Déclaration
          </h2>
          <div className="text-sm text-gray-700 space-y-3 bg-gray-50 p-4 rounded">
            <p>
              I hereby declare that the RPAS described above complies with all applicable requirements
              of Transport Canada Standard 922 for the intended operations specified in Section 4.
            </p>
            <p>
              Je déclare par la présente que le SATP décrit ci-dessus est conforme à toutes les
              exigences applicables de la norme 922 de Transports Canada pour les opérations prévues
              indiquées à la section 4.
            </p>
            <p className="font-medium">
              This declaration is made in accordance with Canadian Aviation Regulations (CARs)
              Part IX, Division V - Operations Requiring RPAS Safety Assurance.
            </p>
          </div>
        </div>

        {/* Section 9: Signature */}
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700 border-b border-gray-300 pb-1 mb-3">
            Section 9: Signature / Signature
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Signature of Declarant</label>
              <div className="border-b-2 border-gray-400 py-4 min-h-[60px]">
                {/* Signature area */}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Date</label>
              <div className="border-b border-gray-400 py-1 min-h-[28px]">
                {currentDate}
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-8">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Print Name / Nom en lettres moulées</label>
              <div className="border-b border-gray-400 py-1 min-h-[28px]">
                {declarant.name || <span className="text-gray-300 italic">_________________</span>}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Title / Titre</label>
              <div className="border-b border-gray-400 py-1 min-h-[28px]">
                <span className="text-gray-300 italic">_________________</span>
              </div>
            </div>
          </div>
        </div>

        {/* TC Use Only */}
        <div className="border-2 border-gray-300 rounded p-4 bg-gray-50">
          <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-3">
            For Transport Canada Use Only / Réservé à Transports Canada
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Reference Number</label>
              <div className="border-b border-gray-400 py-1 min-h-[28px] bg-white">
                {declaration.tcReferenceNumber || ''}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Received Date</label>
              <div className="border-b border-gray-400 py-1 min-h-[28px] bg-white"></div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Reviewed By</label>
              <div className="border-b border-gray-400 py-1 min-h-[28px] bg-white"></div>
            </div>
          </div>
        </div>

        {/* Form Footer */}
        <div className="mt-6 pt-4 border-t border-gray-300 text-xs text-gray-500 flex justify-between">
          <span>Form 26-0882E (2024-01)</span>
          <span>Transport Canada / Transports Canada</span>
          <span>Page 1 of 1</span>
        </div>
      </div>

      {/* Print-only styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print\\:hidden {
              display: none !important;
            }
            #form-content, #form-content * {
              visibility: visible;
            }
            #form-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}
      </style>
    </div>
  )
}
