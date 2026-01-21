/**
 * Policy Content Data
 * Full content extracted from the Companypolicy PDF documents
 *
 * Structure matches the standard the Companypolicy format:
 * 1. Document Control
 * 2. Purpose & Scope
 * 3. Definitions & References
 * 4. Policy Statement
 * 5. Procedures
 * 6. Roles & Responsibilities
 * 7. Monitoring, Compliance & Enforcement
 * 8. Sign-Off & Acknowledgment
 *
 * @location src/data/policyContent.js
 */

export const POLICY_CONTENT = {
  // ============================================
  // RPAS OPERATIONS POLICIES (1001-1012)
  // ============================================

  '1001': {
    number: '1001',
    title: 'RPAS Operations - Team Competencies Policy',
    category: 'rpas',
    description: 'Defines the minimum competencies required for all crew members engaged in RPAS operations, ensuring safe, compliant, and professional operations.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Operations Manager',
    status: 'active',
    regulatoryRefs: ['Canadian Aviation Regulations, Part IX', 'CAR 901.19'],
    keywords: ['competencies', 'certification', 'training', 'crew', 'pilot', 'recency'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To define the minimum competencies required for all crew members engaged in Remotely Piloted Aircraft Systems (RPAS) operations with the Company. This ensures safe, compliant, and professional operations in line with Canadian Aviation Regulations and internal company standards.

Scope:
This policy applies to all RPAS crew members, including Pilots in Command (PIC), Visual Observers (VO), Operations Managers, Maintenance Managers, subcontractors, and trainees operating under the Company.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• RPAS – Remotely Piloted Aircraft Systems
• PIC – Pilot in Command
• VO – Visual Observer

References:
• Canadian Aviation Regulations, Part IX`
      },
      {
        title: 'Policy Statement',
        content: `All the CompanyRPAS operations shall only be conducted by competent crew members who meet minimum training, licensing, and certification standards, and who demonstrate ongoing compliance with fitness-for-duty requirements.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Verify Crew Eligibility:
• Confirm crew member is ≥18 years of age.
• Confirm compliance with the Companypolicies and procedures.

Fitness for Duty:
• Crew must meet fatigue and fitness requirements under CAR 901.19 (minimum rest periods, alcohol/drug restrictions, mental health readiness).

Certification Verification:
• Non-pilots: Basic RPAS Operator Certificate.
• Pilots: Advanced RPAS Operator Certificates at minimum (Complex level 1 preferred and when required) and current recency requirements.
• ROC-A certification for any crew responsible for aeronautical communications.
• Emergency First Aid & CPR for all crew; Wilderness First Aid required for remote ops.

Practice Requirements:
• Minimum 25 minutes of airtime per month logged in the Company's AirData system.
• At least 5 take-offs/landings per month.
• Flight logs must be synced to the CompanyAirData for validation.

Tools, Forms, or Checklists:
• AirData platform (flight logs, maintenance, recurrency tracking)
• RPAS Operations Checklists
• HSE Forms

Safety/Compliance/Quality Requirements:
• Compliance with CARs Part IX
• First Aid certification valid and accessible at all work sites
• Adherence to fatigue management and alcohol/drug-free policies

Reporting or Escalation:
• Crew who do not meet competency requirements must be reported to the Operations Manager.
• Non-compliance escalates to the Accountable Executive for review and corrective action.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Ensure all crew meet certification and practice requirements.
• Allocate resources for training, recurrency, and health checks.

Supervisors:
• Verify compliance prior to each operation.
• Maintain certification records.
• Conduct periodic audits of AirData logs.

Staff:
• Maintain certifications and logbooks.
• Report any deficiencies or lapsed qualifications immediately.
• Participate in training, practice, and recertification.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Monthly audit of AirData flight logs.
• Quarterly review of training and certification records.
• Annual performance review, including recurrency validation.

Consequences for Non-Compliance:
• Removal from active duty until compliance is restored.
• Mandatory remedial training or recertification.
• Repeated non-compliance may result in termination of the operational role.

Reporting Obligations:
• Compliance with Transport Canada RPAS Recency reporting requirements.
• Submission of certification copies for internal audit.`
      }
    ]
  },

  '1002': {
    number: '1002',
    title: 'RPAS Operations - Roles & Responsibilities Policy',
    category: 'rpas',
    description: 'Defines the specific responsibilities of all roles involved in RPAS operations, ensuring compliance with Canadian Aviation Regulations and accountability across all mission phases.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Operations Manager',
    status: 'active',
    regulatoryRefs: ['Canadian Aviation Regulations, Part IX'],
    keywords: ['roles', 'responsibilities', 'PIC', 'VO', 'operations manager', 'accountability'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To define the specific responsibilities of all roles involved in the Company' RPAS operations, ensuring compliance with Canadian Aviation Regulations (CARs), safe operational practices, and accountability across all mission phases.

Scope:
This policy applies to all the Company RPAS personnel, including Accountable Executives, Operations Managers, Maintenance Managers, Pilots in Command (PIC), and Visual Observers (VO), as well as subcontractors working under the Company' operational control.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• RPAS – Remotely Piloted Aircraft Systems
• PIC – Pilot in Command
• VO – Visual Observer
• SFOC – Special Flight Operations Certificate

References:
• Canadian Aviation Regulations, Part IX`
      },
      {
        title: 'Policy Statement',
        content: `the Company requires that all personnel involved in RPAS operations fulfill clearly defined roles and responsibilities. These responsibilities ensure compliance with Transport Canada regulations, operational safety, and company standards.`
      },
      {
        title: 'Procedures',
        content: `Tools, Forms, or Checklists:
• Operations Planning Documents (CONOPS, Site Survey, SORA, Flight Plan)
• AirData logs (pilot recency, maintenance)
• Safety Checklists (Take-off, Landing, Emergency Procedures, etc.)

Safety/Compliance/Quality Requirements:
• Compliance with CARs Part IX
• Adherence to the Company Policies and Procedures
• All personnel must complete relevant orientation, training, and recertification

Reporting or Escalation:
• Any failure to meet responsibilities must be reported to the Operations Manager.
• Serious breaches (e.g., regulatory non-compliance, safety risks) escalate to the Accountable Executive.
• Incident/accident reporting must follow the the CompanyOperations Manual and HSE protocols.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Accountable Executive:
• Holds ultimate accountability for legal compliance of all RPAS activities.
• Confirms operational feasibility and regulatory permissions.
• Ensures personnel are properly licensed and certified.
• Oversees maintenance, storage, inventory, and tracking of equipment.
• Submits or approves flight requests for advanced and special operations.
• Maintains communication with Transport Canada and ensures insurance coverage.

Operations Manager:
• Plans and manages daily operations, logistics, and personnel deployment.
• Ensures compliance with safety regulations and the Companyprocedures.
• Liaises with clients and stakeholders.
• Briefs crew on operational planning documents.
• Validates maintenance compliance and equipment readiness.
• Conducts incident and accident investigations.

Maintenance Manager:
• Manages maintenance scheduling and ensures compliance with manufacturer and regulatory standards.
• Maintains accurate maintenance logs and equipment records.
• Locks out non-compliant or damaged equipment.
• Ensures RPAS airworthiness before field deployment.
• Coordinates with manufacturers for repairs and updates.

Pilot in Command (PIC):
• Holds Advanced RPAS Operator Certificate and ROC-A license.
• Ensures personal compliance with recency and training requirements.
• Maintains fitness for duty in accordance with CAR 901.19.
• Has sole responsibility for RPAS safety while armed or in flight.
• Monitors RPAS performance and maintains constant communication with VO.
• Adheres to all operational planning documents and SOPs.

Visual Observer (VO):
• Maintains continuous VLOS (Visual Line of Sight) with RPAS.
• Monitors airspace for hazards and communicates risks to PIC.
• Maintains a sterile cockpit environment for the PIC.
• Supports situational awareness and flight safety.
• Participates in pre-flight and post-flight briefings and debriefings.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Internal audits of flight logs, training, and maintenance records.
• Regular operational reviews and crew performance assessments.
• Annual HSE and RPAS program review (AGM)

Consequences for Non-Compliance:
• Removal from operational duty.
• Mandatory retraining or recertification.
• Progressive discipline up to contract termination for repeated or serious violations.

Reporting Obligations:
• All operations must be logged in AirData and retained for 24 months.
• Mandatory reporting to Transport Canada and/or the Transportation Safety Board as required by law.`
      }
    ]
  },

  '1003': {
    number: '1003',
    title: 'RPAS Operations - Airworthiness & Maintenance Policy',
    category: 'rpas',
    description: 'Ensures all RPAS operated by the Company remain airworthy, safe, and fully compliant with Transport Canada regulations and manufacturer specifications.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Maintenance Manager',
    status: 'active',
    regulatoryRefs: ['Canadian Aviation Regulations Part IX', 'CAR 901.02', 'CAR 901.48', 'CAR 901.76'],
    keywords: ['airworthiness', 'maintenance', 'inspection', 'AirData', 'equipment'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To ensure all Remotely Piloted Aircraft Systems (RPAS) operated by the Company remain airworthy, safe, and fully compliant with Transport Canada regulations and manufacturer specifications.

Scope:
This policy applies to all RPAS, associated payloads, ground control stations, and batteries used in the Company operations. It applies to the Accountable Executive, Maintenance Manager, Operations Manager, Pilots in Command (PIC), and all crew members performing inspections or reporting defects.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Airworthiness: Condition in which an RPAS is fit for safe operation in accordance with CAR Part IX.
• Pre-Operation Inspection: Checks are completed before an RPAS is deployed in the field.
• Scheduled Maintenance: Manufacturer-recommended or system-tracked service requirements.
• AirData: Digital tracking system used by the Company to manage flight logs, maintenance, and battery records.

References:
• Canadian Aviation Regulations Part IX.
• Manufacturer maintenance manuals.`
      },
      {
        title: 'Policy Statement',
        content: `the Company will not operate any RPAS that does not meet Transport Canada's recognition requirements or manufacturer safety declarations. All RPAS equipment must be regularly inspected, maintained, and documented in AirData to ensure operational safety, compliance, and reliability.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Registration Marking:
• All RPAS equipment is registered in compliance with CAR 901.02, ensuring regulatory adherence and traceability.
• All RPASs must carry a visible registration marking affixed to a permanent part of the RPAS's structure.
• Any faded or damaged markings must be restored to compliant standards immediately.

Pre-Operation Maintenance:
• Inspect RPAS for visible damage (nicks, dents, battery swelling).
• Verify that the firmware/software is current.
• Confirm maintenance checks logged in AirData.

Pre-Flight Inspection:
• Conduct tactile and visual inspection of airframe, motors, payloads, and batteries.
• Ensure registration markings are visible and legible (CAR 901.02).

Post-Flight Inspection:
• Re-inspect RPAS and components for damage after each flight.
• Log findings and corrective actions in AirData.

Scheduled Maintenance:
• The Maintenance Manager ensures service is completed per the manufacturer's schedule.
• Track via AirData, including battery cycles, service intervals, and alerts.

Repairs & Lockouts:
• If damage or malfunction is detected, the RPAS must be locked out until inspected and cleared by the Maintenance Manager.
• Repairs coordinated with the manufacturer or certified service providers.

Tools, Forms, or Checklists:
• AirData maintenance logs
• Pre-flight / post-flight checklists
• Manufacturer maintenance manuals

Safety/Compliance/Quality Requirements:
• Compliance with CARs (901.02, 901.48, 901.76)
• AirData records must be maintained for a minimum 24 months
• RPAS cannot be operated outside of 80% of the manufacturer's specified limits

Reporting or Escalation:
• Defects reported to the Maintenance Manager immediately
• Unsafe equipment must be grounded until cleared
• Safety issues escalated to the Accountable Executive if unresolved`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management (Accountable Executive & Operations Manager):
• Ensure resources, tools, and oversight are in place to maintain airworthiness.
• Approve policy amendments and verify compliance.

Maintenance Manager:
• Schedule and log all maintenance.
• Lock out non-compliant equipment.
• Ensure firmware/software are current.

Pilot in Command:
• Conduct pre-flight and post-flight inspections.
• Confirm equipment readiness before flight.

Crew Members:
• Follow inspection checklists.
• Report defects and anomalies immediately.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Monthly AirData audits by Maintenance Manager.
• Quarterly operational compliance checks by the Operations Manager.
• Annual policy review at AGM.

Consequences for Non-Compliance:
• Immediate grounding of non-compliant RPAS.
• Suspension of personnel from operations until retrained or recertified.
• Disciplinary action for repeated failures.

Reporting Obligations:
• All maintenance records must be retained for 24 months.
• Report significant failures or defects to Transport Canada if required under CAR 901.49.`
      }
    ]
  },

  '1004': {
    number: '1004',
    title: 'RPAS Operations - Personal Protective Equipment Policy',
    category: 'rpas',
    description: 'Ensures the safety and well-being of all personnel by mandating the provision, correct use, inspection, and maintenance of Personal Protective Equipment (PPE).',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC OHS Regulation, Part 8', 'CSA and ANSI Standards for PPE'],
    keywords: ['PPE', 'safety', 'equipment', 'protection', 'hazards'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To ensure the safety and well-being of all the Company personnel by mandating the provision, correct use, inspection, and maintenance of Personal Protective Equipment (PPE). PPE serves as the last line of defense against workplace hazards when elimination, substitution, engineering, or administrative controls cannot fully mitigate risk.

Scope:
This policy applies to all employees, contractors, subcontractors, and visitors engaged in operations at the Company worksites, including RPAS operations, fieldwork, office activities, and client sites.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• PPE: Equipment worn to minimize exposure to hazards, including eye, face, hand, head, hearing, respiratory, and body protection.
• Fit for Duty: PPE must be suitable for the task, properly fitted, and in good working condition.
• Specialized PPE: Task-specific equipment such as fall protection, chemical-resistant gear, or respiratory protection.

References:
• BC OHS Regulation, Part 8 – Personal Protective Equipment
• CSA and ANSI Standards for PPE`
      },
      {
        title: 'Policy Statement',
        content: `the Company will provide, enforce, and maintain appropriate PPE for all tasks where hazards cannot be eliminated by other means. All employees, contractors, and visitors must wear required PPE at all times in designated areas and during operations, in compliance with applicable legislation, manufacturer requirements, and company standards.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Hazard Assessment:
• Identify PPE requirements through formal and field-level hazard assessments (FHAs and FLHAs).
• Apply the hierarchy of controls; PPE is used only where other measures cannot fully eliminate hazards.

Provision of PPE:
• the Companyprovides CSA/ANSI-approved PPE at no cost to employees.
• Specialized PPE (e.g., fall protection, respirators) issued as required.

PPE Use:
• All workers must wear PPE appropriate to their task and site.
• Jewelry and loose clothing are prohibited during field operations, except stud earrings and wedding bands.

Inspection & Maintenance:
• Workers must inspect PPE before each use.
• Supervisors perform scheduled inspections; defective PPE must be removed from service immediately.

Training:
• All staff receive training on selection, use, limitations, and care of PPE.
• Refresher training is required periodically and after incidents of non-compliance.

Tools, Forms, or Checklists:
• PPE Inspection Logs
• Hazard Assessment Forms (FHAs, FLHAs)
• Site Orientation Forms

Safety/Compliance/Quality Requirements:
• Compliance with BC OHS Regulation, Part 8
• PPE must be CSA/ANSI-certified
• All workers must follow the manufacturer's instructions for use and care

Reporting or Escalation:
• Defective or missing PPE reported to supervisors immediately
• Non-compliance escalated to Operations Manager or Accountable Executive
• Repeat violations documented and subject to progressive discipline`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Provide resources for PPE purchase, training, and enforcement.
• Approve PPE standards and updates.

Supervisors:
• Ensure PPE availability and use on site.
• Enforce compliance through inspections and corrective action.

Staff/Contractors:
• Use assigned PPE correctly.
• Report damaged or missing PPE immediately.
• Participate in PPE training and refreshers.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Routine spot checks by supervisors.
• Scheduled inspections and audits by HSE Representative.
• Annual review of PPE standards and training.

Consequences for Non-Compliance:
• Verbal/written warnings for first offenses.
• Removal from worksite until compliance achieved.
• Disciplinary action up to termination for repeated violations.

Reporting Obligations:
• PPE deficiencies logged in inspection reports.
• PPE non-compliance recorded in safety meeting minutes.
• Incidents involving PPE failures reported to HSE Representative.`
      }
    ]
  },

  '1005': {
    number: '1005',
    title: 'RPAS Operations - General Procedures Policy',
    category: 'rpas',
    description: 'Establishes that all the Company operations must follow approved general procedures, ensuring consistency, safety, and compliance across all RPAS activities.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Operations Manager',
    status: 'active',
    regulatoryRefs: ['Canadian Aviation Regulations Part IX', 'the CompanyRPAS Procedures'],
    keywords: ['procedures', 'operations', 'SOP', 'compliance', 'workflow'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To establish that all the Company operations must follow approved general procedures, ensuring consistency, safety, and compliance across all RPAS activities.

Scope:
This policy applies to all the Company personnel involved in RPAS operations, including employees, contractors, subcontractors, and visitors operating under the Company' direction.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• General Procedures: Standardized operational workflows covering activities such as kit preparation, site setup, RPAS setup, checklists, communication protocols, and debrief processes.

References:
• the CompanyRPAS Procedures
• the CompanyHSE Procedures
• General Procedure PDFs (RPAS Procedures Docs)`
      },
      {
        title: 'Policy Statement',
        content: `All personnel engaged in RPAS operations with the Company must follow the official General Procedures as defined in the approved procedure documents. These procedures are mandatory and form part of the company's standard operating procedures. Deviation is not permitted except under formally approved amendments.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Access Procedures:
• Operators must review the latest procedure PDFs available in the RPAS Procedures Docs before deployment.

Adherence:
• Procedures must be followed in their entirety during operations.
• No modifications, omissions, or substitutions are permitted unless approved by the Operations Manager and documented in amendment logs.

Incident Response:
• Any deviation or failure to follow procedures must be reported immediately through incident reporting protocols.

Tools, Forms, or Checklists:
• Procedure PDFs
• Training Acknowledgment Form
• Compliance Logs

Safety/Compliance/Quality Requirements:
• Procedures are written to comply with CARs, manufacturer guidance, and the Company's internal safety standards.
• Failure to adhere may result in non-compliance with Transport Canada requirements.

Reporting or Escalation:
• Deviations or challenges following procedures must be reported through the Company's Incident and Hazard Reporting system.
• Escalations go to the Operations Manager and, if unresolved, to the Accountable Executive.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Ensure procedures are current, accessible, and formally approved.
• Allocate resources for training and compliance monitoring.

Supervisors/Operations Managers:
• Verify that crews follow procedures during operations.
• Address and correct any non-compliance immediately.

Staff/Crew Members:
• Review and follow procedures without exception.
• Report difficulties or potential improvements through formal amendment requests.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Spot checks during operations.
• Post-operation debrief reviews.
• Annual compliance audits.

Consequences for Non-Compliance:
• Removal from operational duty.
• Mandatory retraining.
• Progressive discipline up to termination for repeated or serious violations.

Reporting Obligations:
• Compliance with procedure use must be documented in operational logs.
• Non-compliance must be reported in accordance with incident reporting protocols.`
      }
    ]
  },

  '1006': {
    number: '1006',
    title: 'RPAS Operations - Emergency Procedures Policy',
    category: 'rpas',
    description: 'Ensures that all personnel engaged in the Company operations are prepared to respond effectively to emergencies by following official Emergency Procedures.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Operations Manager',
    status: 'active',
    regulatoryRefs: ['Canadian Aviation Regulations Part IX', 'the CompanyHSE ERP'],
    keywords: ['emergency', 'procedures', 'response', 'ERP', 'safety'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To ensure that all personnel engaged in the Company operations are prepared to respond effectively to emergencies by following the official Emergency Procedures.

Scope:
This policy applies to all the Company employees, contractors, and subcontractors involved in RPAS operations and field activities.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Emergency Procedures: Formal workflows for responding to RPAS failures, communication losses, environmental hazards, crashes, and other operational emergencies.
• ERP (Emergency Response Plan): Broader company HSE emergency procedures that complement RPAS-specific protocols.

References:
• the CompanyRPAS Procedures
• the CompanyHSE Procedures
• Emergency Procedure PDFs (RPAS Procedures Docs)`
      },
      {
        title: 'Policy Statement',
        content: `All personnel must follow the Company' approved Emergency Procedures during operations. These procedures are mandatory and define the standard response to RPAS-related or site-related emergencies. Deviation is not permitted except under approved amendments or adaptations by the Pilot in Command (PIC) in immediate safety-of-life circumstances.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Access Procedures:
• All personnel must be familiar with the Emergency Procedures PDFs provided in the RPAS Procedures Docs.

Adherence:
• Emergency Procedures must be followed in their entirety whenever an emergency occurs.
• If an unforeseen situation arises, the PIC must take immediate safe action and report the deviation.

Reporting:
• All emergency activations must be reported through the Incident Reporting and Investigation system.

Tools, Forms, or Checklists:
• Emergency Procedure PDFs (RPAS Procedures Docs)
• Incident Reporting Form
• ERP Training Acknowledgment

Safety/Compliance/Quality Requirements:
• Procedures are aligned with CARs Part IX requirements and the CompanyHSE ERP standards.
• Non-compliance places personnel, equipment, and the public at risk and is considered a serious breach.

Reporting or Escalation:
• Emergencies must be reported immediately to the Operations Manager.
• Significant emergencies (injuries, collisions, fly-aways) must be escalated to the Accountable Executive and Transport Canada/TSB as required.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Maintain accurate and up-to-date emergency procedures.
• Allocate resources for training and drills.

Supervisors:
• Lead emergency responses in accordance with procedures.
• Report and document all emergency incidents.

Staff:
• Follow instructions during emergencies.
• Support the PIC and maintain compliance with procedures.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Emergency drill participation.
• Incident investigation reviews.
• Annual policy and ERP review.

Consequences for Non-Compliance:
• Immediate removal from operational duty.
• Mandatory retraining before return to duty.
• Disciplinary action up to termination for repeated or deliberate violations.

Reporting Obligations:
• All emergency responses must be documented in incident reports.
• Reports retained for minimum 12–24 months as required by CARs and HSE systems.`
      }
    ]
  },

  '1007': {
    number: '1007',
    title: 'RPAS Operations - Communication Policy',
    category: 'rpas',
    description: 'Ensures safe, reliable, and standardized communication practices during all RPAS operations by mandating adherence to approved communication protocols.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Operations Manager',
    status: 'active',
    regulatoryRefs: ['Canadian Aviation Regulations Part IX', 'ROC-A Requirements'],
    keywords: ['communication', 'radio', 'protocols', 'sterile cockpit'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To ensure safe, reliable, and standardized communication practices during all RPAS operations by mandating adherence to the Company' approved communication protocols.

Scope:
This policy applies to all the Company employees, contractors, and subcontractors who participate in RPAS operations, including Pilots in Command (PIC), Visual Observers (VO), Operations Managers, and field crew.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Communication Protocols: Pre-established procedures and standards for verbal, radio, or digital communications before, during, and after RPAS operations.
• Sterile Cockpit: A communications rule requiring minimal distractions during critical phases of operation.

References:
• the CompanyRPAS Policies
• the CompanyHSE Policies
• Canadian Aviation Regulations Part IX`
      },
      {
        title: 'Policy Statement',
        content: `All RPAS operations conducted by the Company must follow the company's approved communication procedures. These procedures are mandatory and form a critical part of operational safety. Clear, accurate, and timely communication is required between all crew members, clients, and external authorities as applicable.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Access Procedures:
• Operators must review the latest communication procedure PDFs provided in the Operators Access Folder.

Adherence:
• All personnel must use the approved protocols for pre-flight, in-flight, post-flight, and emergency communications.
• Unauthorized or improvised communication practices are prohibited.

Escalation:
• Any communication failure or deviation from protocol must be reported immediately as an incident.

Tools, Forms, or Checklists:
• Communication Procedure PDFs (RPAS Procedures Docs)
• Radio/Comms Equipment Inspection Logs
• Incident Reporting Forms

Safety/Compliance/Quality Requirements:
• Compliance with CARs Part IX requirements for RPAS communications.
• Use of ROC-A-certified personnel for aeronautical radio communication.
• Communications must follow approved frequencies and avoid interference with other airspace users.

Reporting or Escalation:
• Communication failures logged as incidents.
• Escalations are directed to the Operations Manager and reported to the Accountable Executive if unresolved.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Approve, maintain, and update communications standards.
• Provide necessary tools, training, and oversight.

Supervisors:
• Ensure communications protocols are followed on-site.
• Conduct periodic audits of communication practices.

Staff:
• Follow communication procedures without deviation.
• Report failures or difficulties immediately.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Spot checks during operations.
• Post-flight debriefs.
• Annual compliance review.

Consequences for Non-Compliance:
• Removal from operational duty.
• Mandatory retraining in communication protocols.
• Disciplinary action for repeated or serious breaches.

Reporting Obligations:
• All communication-related incidents must be documented and retained in accordance with the Company's record-keeping requirements.`
      }
    ]
  },

  '1008': {
    number: '1008',
    title: 'RPAS Operations - Detection, Avoidance & Separation Policy',
    category: 'rpas',
    description: 'Establishes policy on collision detection, avoidance, and separation during RPAS operations to ensure compliance with regulatory requirements and reduce risks.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Operations Manager',
    status: 'active',
    regulatoryRefs: ['Canadian Aviation Regulations Part IX', 'CAR 901.17', 'CAR 901.18'],
    keywords: ['detection', 'avoidance', 'separation', 'collision', 'airspace'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To establish the Company' policy on collision detection, avoidance, and separation during RPAS operations. This ensures compliance with regulatory requirements, prioritizes safety, and reduces risks of airspace or ground conflicts.

Scope:
This policy applies to all RPAS operations conducted by the Company, including flights in controlled and uncontrolled airspace, BVLOS (Beyond Visual Line of Sight) missions, and operations near people, property, or other aircraft.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Detection: The process of identifying potential hazards or conflicting airspace users.
• Avoidance: Maneuvers or actions taken to prevent conflicts or collisions.
• Separation: Maintaining minimum safe distances between RPAS, manned aircraft, obstacles, and people.

References:
• the CompanyRPAS Procedures
• Canadian Aviation Regulations Part IX
• the CompanyHSE Policies
• Procedure PDFs (RPAS Procedures Docs)`
      },
      {
        title: 'Policy Statement',
        content: `the Company requires all personnel to adhere to approved detection, avoidance, and separation procedures at all times. Operators must yield to manned aircraft, maintain safe ground and airspace separation, and follow the Company' conflict avoidance standards. These requirements are mandatory and non-negotiable, forming a core element of operational safety.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Access Procedures:
• Operators must review the latest Detection, Avoidance & Separation procedure PDFs in the RPAS Procedures Docs.

Adherence:
• All RPAS crew must follow approved separation standards, conflict response protocols, and deconfliction measures.
• Unauthorized deviations are prohibited except in life-safety emergencies, which must be documented.

Reporting:
• All conflict, near-miss, or separation incidents must be reported immediately through the Company's Incident Reporting system.

Tools, Forms, or Checklists:
• Detection, Avoidance & Separation Procedure PDFs
• Pre-flight hazard and airspace assessment checklists
• Incident/Near-Miss Report Forms

Safety/Compliance/Quality Requirements:
• CAR 901.17: RPAS must give way to manned aircraft.
• CAR 901.18: RPAS must not fly near or in a manner hazardous to people or property.
• the Company' internal minimum separation standards.

Reporting or Escalation:
• Near-miss or conflict events reported immediately to Operations Manager.
• Escalated to Accountable Executive and reported to Transport Canada/TSB if required.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Ensure detection and avoidance standards align with CARs and internal safety systems.
• Provide tools, resources, and training to enforce policy.

Supervisors:
• Enforce separation protocols during all operations.
• Document and report incidents of conflict or near-miss.

Staff:
• Support monitoring of ground and air risks.
• Alert PIC to hazards and comply with avoidance protocols.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Pre-flight planning and hazard assessment reviews.
• Post-flight debriefs and incident log audits.
• Annual compliance review during AGM.

Consequences for Non-Compliance:
• Removal from active operations until retraining is complete.
• Disciplinary measures up to termination for repeated or deliberate breaches.

Reporting Obligations:
• Near-miss and separation incidents logged and retained in compliance with CAR 901.49 and the Company's record-keeping standards.`
      }
    ]
  },

  '1009': {
    number: '1009',
    title: 'RPAS Operations - Minimum Weather Requirements Policy',
    category: 'rpas',
    description: 'Defines the minimum weather requirements for RPAS operations, ensuring safety, compliance, and risk mitigation during all flight activities.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Operations Manager',
    status: 'active',
    regulatoryRefs: ['Canadian Aviation Regulations Part IX'],
    keywords: ['weather', 'minimum requirements', 'wind', 'temperature', 'precipitation'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To define the minimum weather requirements for the Company RPAS operations, ensuring safety, compliance, and risk mitigation during all flight activities.

Scope:
This policy applies to all RPAS operations conducted by the Company, including basic, advanced, and special operations. It covers all crew members, contractors, and subcontractors involved in flight activities.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Operational Limits: Manufacturer-specified environmental tolerances, including wind, precipitation, and temperature.
• Weather Monitoring Tools: Approved forecasting and real-time monitoring systems used to assess weather suitability for flight.

References:
• Canadian Aviation Regulations Part IX
• the CompanyRPAS Procedures
• the CompanyHSE policy`
      },
      {
        title: 'Policy Statement',
        content: `RPAS operations must not be conducted outside of the defined minimum weather requirements. the Company enforces an additional 20% safety buffer below the manufacturer's specified maximum weather limits (e.g., wind speed, temperature, precipitation). Operations must be postponed, adjusted, or cancelled if conditions exceed these thresholds.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Weather Assessment (Pre-Flight):
• Review weather forecasts using approved tools (e.g., Environment Canada, Windy).
• Confirm conditions fall within 80% of the manufacturer's stated limits.

Real-Time Monitoring (During Operations):
• Continuously monitor on-site conditions.
• Stop or suspend flights if weather conditions deteriorate beyond policy limits.

Postponement/Cancellation:
• Operations must be postponed or cancelled if forecasted or real-time conditions exceed thresholds.

Documentation:
• Record weather assessments and decisions in the pre-flight planning documents.

Tools, Forms, or Checklists:
• Environment Canada forecast system
• Windy application
• AirData application
• Site weather logs and pre-flight checklists

Safety/Compliance/Quality Requirements:
• All RPAS operations must comply with CARs operational weather limits.
• RPAS must not be flown if icing is present or expected.

Reporting or Escalation:
• Deviations must be reported immediately via the Incident Reporting process.
• Escalate unresolved safety concerns to the Operations Manager and Accountable Executive.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Provide access to approved weather forecasting and monitoring tools.
• Ensure annual review of weather limits based on regulatory updates and manufacturer specifications.

Supervisors:
• Confirm crews perform and document weather assessments.
• Stop operations if conditions exceed safe thresholds.

Staff:
• Conduct weather assessments and monitor conditions in real time.
• Suspend or abort operations when safety is compromised.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Review of pre-flight weather assessment logs.
• Spot checks during operations by the Operations Manager.
• Annual compliance review at AGM.

Consequences for Non-Compliance:
• Immediate grounding of operations.
• Mandatory retraining in operational safety.
• Progressive discipline for repeated violations.

Reporting Obligations:
• Weather assessments and related decisions must be documented and retained for 24 months in accordance with CAR 901.48.`
      }
    ]
  },

  '1010': {
    number: '1010',
    title: 'RPAS Operations - Incident & Accident Reporting Policy',
    category: 'rpas',
    description: 'Ensures all accidents, incidents, and near-misses are reported, documented, and escalated immediately to proper authorities and company representatives.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Operations Manager',
    status: 'active',
    regulatoryRefs: ['Canadian Aviation Regulations 901.49(1)', 'Canada Labour Code, Part II'],
    keywords: ['incident', 'accident', 'reporting', 'near-miss', 'TSB'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To ensure all accidents, incidents, and near-misses are reported, documented, and escalated immediately to the proper authorities and company representatives.

Scope:
Applies to all the Company employees, contractors, subcontractors, and visitors engaged in RPAS operations and related fieldwork.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Incident: An occurrence that could affect safety but does not result in injury or major damage.
• Accident: An event involving injury, death, or significant damage to RPAS, property, or environment.
• Near-Miss: An event with potential for harm but avoided due to chance or timely intervention.

References:
• the CompanyRPAS Operations
• the CompanyHSE Policy
• Canadian Aviation Regulations (CARs) 901.49(1)
• Canada Labour Code, Part II, Section 125(1)(c)`
      },
      {
        title: 'Policy Statement',
        content: `All accidents, incidents, and near-misses must be reported immediately. Reporting is mandatory and ensures compliance with regulatory requirements, supports corrective action, and improves operational safety.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

1. Medical Emergency (injury or fatality):
   • Call 911 immediately.
   • Then notify the CompanyAccountable Executive.

2. Serious RPAS Accident (collision with manned aircraft, >25kg RPAS crash, injury, or death):
   • Call Transportation Safety Board (TSB): Toll-Free: 1-800-387-3557
   • Notify Transport Canada RPAS Centre of Excellence.
   • Notify the CompanyAccountable Executive.

3. Other Incidents (loss of control, fly-away, property damage, near-miss):
   • Notify Transport Canada (via CADORS if applicable).
   • Notify the CompanyOperations Manager.

4. Internal Reporting:
   • Complete the CompanyIncident/Accident Report Form (SiteDocs).
   • Submit to Operations Manager and HSE Representative.

Call Order by Priority:
1. Emergency Services (if required for life safety)
2. TSB (for major aviation occurrences)
3. Transport Canada (for reportable RPAS events)
4. the CompanyAccountable Executive
5. the CompanyOperations Manager
6. the CompanyHSE Representative

Tools, Forms, or Checklists:
• the CompanyIncident/Accident Report Form (SiteDocs)
• TSB Reporting Form (if applicable)
• AirData flight logs for supporting evidence

Safety/Compliance/Quality Requirements:
• Compliance with CARs 901.49(1) for RPAS occurrences.
• Compliance with Canada Labour Code, Part II – Employer duty to investigate and report.
• All records are retained for 12–24 months, depending on regulatory requirements.

Reporting or Escalation:
• Escalate serious occurrences immediately to the Accountable Executive.
• External reporting required for RPAS accidents over 25kg, collisions with manned aircraft, any serious injury or death.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Ensure reporting systems are functional and accessible.
• Submit required reports to regulators.
• Allocate resources for investigations.

Supervisors:
• Initiate reporting immediately after an event.
• Ensure scene preservation where safe and practical.
• Lead initial incident response until management takes over.

Staff:
• Report all incidents and near-misses without delay.
• Cooperate with investigations and corrective actions.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Regular audits of incident/accident logs.
• Annual safety program review.
• Tracking trends from investigations to identify recurring hazards.

Consequences for Non-Compliance:
• Failure to report is considered a serious violation.
• May result in removal from duty, retraining, or disciplinary action up to termination.

Reporting Obligations:
• Internal reports must be filed in SiteDocs.
• Reports retained in compliance with CAR 901.48 (24 months).
• External reporting to Transport Canada and/or TSB where required.`
      }
    ]
  },

  '1011': {
    number: '1011',
    title: 'RPAS Operations - Site Survey & Flight Plan Policy',
    category: 'rpas',
    description: 'Ensures all RPAS operations are conducted safely, lawfully, and consistently by requiring completion of a site survey and flight plan prior to any mission.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Operations Manager',
    status: 'active',
    regulatoryRefs: ['Canadian Aviation Regulations Part IX', 'CAR 901.62'],
    keywords: ['site survey', 'flight plan', 'planning', 'SiteDocs', 'AirData'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To ensure all the Company RPAS operations are conducted safely, lawfully, and consistently by requiring the completion of a site survey and flight plan prior to any mission.

Scope:
This policy applies to all the Company personnel, contractors, and subcontractors involved in RPAS operations, including planning, piloting, observation, and operational management.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Site Survey: A structured assessment of the operational environment, including ground risks, airspace, wildlife, access, and emergency preparedness.
• Flight Plan: A documented plan that includes mission details, operational limits, and emergency procedures, submitted where required (e.g., NavCanada).

References:
• the CompanyRPAS Operations Manual – Site Survey & Flight Planning
• the CompanyHSE Policy – Hazard Assessment
• Canadian Aviation Regulations, Part IX (901.62 for Advanced Operations)
• SiteDocs – Hazard & Site Survey tools
• AirData – Flight planning, logging, and compliance tools`
      },
      {
        title: 'Policy Statement',
        content: `All operations conducted under the Company must include a completed site survey and flight plan. These documents are mandatory requirements to ensure operational safety, regulatory compliance, and risk mitigation. the Company utilizes SiteDocs and AirData as the primary tools for conducting, documenting, and retaining these records. No RPAS mission may be launched without these elements in place.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Pre-Operation Site Survey:
• Complete a site survey in SiteDocs covering ground, airspace, wildlife, and emergency factors.
• Record hazards and mitigation measures.

Flight Plan:
• Develop a flight plan using SiteDocs and/or AirData.
• Ensure compliance with CAR 901.62 for advanced operations.
• Submit flight plans to NavCanada if required.

Verification:
• Operations Manager confirms site survey and flight plan are complete before authorizing deployment.
• PIC reviews all planning documents prior to flight.

Tools, Forms, or Checklists:
• SiteDocs – for site surveys, hazard assessments, and planning documentation.
• AirData – for logging flights, compliance tracking, and flight record retention.

Safety/Compliance/Quality Requirements:
• Site surveys and flight plans must be retained for a minimum of 24 months.
• All operations must comply with CARs, including CAR 901.62 for advanced RPAS operations.
• Flight planning must incorporate hazard and risk assessments as required by the HSE system.

Reporting or Escalation:
• Incomplete or missing surveys/flight plans must be reported to the Operations Manager.
• Non-compliance escalates to the Accountable Executive for corrective action.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Provide and maintain access to SiteDocs and AirData.
• Approve procedural updates and allocate resources.

Supervisors:
• Confirm all surveys and flight plans are completed before operations begin.
• Maintain oversight of records and compliance.

Staff:
• Complete surveys and plans as part of pre-flight preparation.
• Follow plans during operations and report deviations.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Regular audits of SiteDocs and AirData records.
• Spot checks by Operations Manager.
• Annual compliance review at AGM.

Consequences for Non-Compliance:
• Immediate suspension of operations.
• Mandatory retraining in site survey and flight planning.
• Progressive discipline for repeated violations.

Reporting Obligations:
• All site surveys and flight plans must be logged and retained for 24 months.
• Non-compliance must be documented in incident reports.`
      }
    ]
  },

  '1012': {
    number: '1012',
    title: 'RPAS Operations - Equipment Testing Policy',
    category: 'rpas',
    description: 'Ensures every RPAS, payload, ground control station, and power system is tested, safe, and airworthy using standardized processes with clear pass/fail criteria.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Maintenance Manager',
    status: 'active',
    regulatoryRefs: ['Canadian Aviation Regulations Part IX', 'CAR 901.76'],
    keywords: ['testing', 'equipment', 'CLEAR', 'LOCKOUT', 'airworthiness'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To ensure every Remotely Piloted Aircraft System (RPAS), payload, ground control station, and associated power system is tested, safe, and airworthy before operational use, after maintenance or updates, and at defined intervals, using a standardized, documented process with clear pass/fail criteria (CLEAR vs LOCKOUT).

Scope:
Applies to all the Company aircraft, payloads/sensors (e.g., LiDAR, RGB/MS, delivery payloads), ground control stations, firmware/software, antennas, data links, and batteries used in the Companyoperations (newly acquired, in-service, repaired/updated, or annually re-certified).`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Equipment Testing: Structured verification that an RPAS system and its subsystems are ready for safe flight.
• CLEAR: The system passed all required test steps and is approved for operational use.
• LOCKOUT: The system failed one or more steps and is removed from service until corrected and re-tested.
• Test Schedules: New / Pre-Operation / Post-Maintenance / Annual recurrence.

References:
• RPAS Operations Manual – Equipment Testing
• RPAS Operations Manual – Airworthiness & Maintenance
• HSE Policy – records, incident reporting, audits
• CARs Part IX (records & operational requirements)`
      },
      {
        title: 'Policy Statement',
        content: `the Company will not deploy any RPAS equipment operationally unless it has passed the defined equipment tests and is marked CLEAR. Any malfunction, anomaly, or incomplete test results in LOCKOUT, and the equipment remains out of service until corrective actions are completed and a full re-test passes. All testing must be documented in AirData (and SiteDocs, where applicable) and retained per record-keeping requirements.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

When to Test:
• All new equipment, prior to operations, after any maintenance or updates, and annually.

Testing Standards:
• Use the Company's standardized RPAS Test Sheet covering startup, control link, payload, launch/hover, maneuvering, RTH, and battery performance.

Pass/Fail Criteria:
• CLEAR = all steps successful
• LOCKOUT = failure of any item until corrected and re-tested

Record Keeping:
• All results (including serials, anomalies, corrective actions) logged in AirData
• LOCKOUT tags applied where necessary

Corrective Action:
• Any issues must be repaired, documented, and followed by a full retest before returning to service.

Escalation:
• Safety-critical failures reported via HSE Incident Reporting Policy.

Tools, Forms, or Checklists:
• AirData (mandatory): flight/test logs, maintenance events, batteries, service intervals, reports
• the CompanyRPAS Test Sheet / Checklist
• SiteDocs (optional): forms for test session, hazard notes, incident reports
• Manufacturer manuals for aircraft/payload specifics

Safety/Compliance/Quality Requirements:
• Testing must follow manufacturer limitations and the Company's ≤80% weather margin policy.
• Comply with CARs Part IX and the CompanyHSE policies.
• Use only recognized RPAS with manufacturer safety declaration (CAR 901.76).

Reporting or Escalation:
• LOCKOUT or safety-critical issues → immediate notification to Maintenance Manager & Operations Manager
• Repeated failures trending → raise to Accountable Executive for risk review`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Accountable Executive:
• Ensures resources for testing, approves policy changes, and oversees compliance.

Maintenance Manager:
• Owns the test program; configures schedule; approves CLEAR/LOCKOUT; manages corrective actions.

Operations Manager:
• Verifies equipment under assignment is CLEAR; denies deployment if LOCKOUT.

PIC:
• Conducts/assists testing steps; verifies configuration/RTH/weather; halts on anomalies.

VO / Crew:
• Support safe environment, observation, and documentation during tests.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Monthly AirData audits by Maintenance Manager.
• Spot checks by Operations Manager before deployments.
• Annual review at AGM.

Consequences for Non-Compliance:
• Equipment LOCKOUT.
• Removal from duty and retraining for personnel involved.
• Progressive discipline for repeated violations.

Reporting Obligations:
• Test and maintenance logs retained for a minimum 24 months.
• Regulatory reporting if equipment failure leads to a reportable incident.`
      }
    ]
  },

  // ============================================
  // CRM POLICIES (1013-1021)
  // ============================================

  '1013': {
    number: '1013',
    title: 'CRM - Threat and Error Management (TEM) Policy',
    category: 'crm',
    description: 'Establishes a structured Threat and Error Management (TEM) policy that ensures RPAS operations identify, prevent, and mitigate threats and errors during missions.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['Transport Canada Advisory Circular 700-042', 'the CompanyCRM Manual'],
    keywords: ['TEM', 'threat', 'error', 'management', 'ATM', 'safety', 'CRM'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To establish a structured Threat and Error Management (TEM) policy that ensures the CompanyRPAS operations identify, prevent, and mitigate threats and errors that may arise during missions.

Scope:
Applies to all the CompanyRPAS operational crew members, including Pilots in Command (PICs), Visual Observers (VOs), Operations Managers, subcontractors, and support personnel engaged in RPAS operations.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Threat: An external factor or condition that increases operational risk (e.g., adverse weather, airspace complexity).
• Error: An action or inaction that leads to deviation from procedures, intentions, or safety standards.
• TEM: Threat and Error Management, the structured process of Avoid, Trap, Mitigate (ATM).
• Intentional Non-Compliance: Knowingly disregarding SOPs or regulations.

References:
• the CompanyCRM Manual, Section: Threat and Error Management
• the CompanyRPAS Operations Manual
• Transport Canada Advisory Circular 700-042, Appendix A`
      },
      {
        title: 'Policy Statement',
        content: `the Company mandates that all RPAS crew adopt proactive Threat and Error Management strategies to ensure safety, operational effectiveness, and compliance. Operators are required to apply structured Avoidance, Trapping, and Mitigation (ATM) strategies throughout all phases of operation. Intentional non-compliance with SOPs or TEM requirements is strictly prohibited.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Identify Threats and Errors during pre-mission planning and in-flight monitoring.
• Avoid Threats by conducting thorough risk assessments, weather checks, and pre-flight surveys.
• Trap Threats/Errors through use of checklists, structured flows, and VO monitoring.
• Mitigate Impact using emergency procedures, return-to-home (RTH) systems, and external authority communication protocols.
• Debrief post-mission to review threats and errors encountered, documenting lessons learned.

Roles & Responsibilities for Each Step:
• PIC: Ensure adherence to SOPs, oversee threat identification, and apply mitigation strategies.
• VO: Actively monitor for external threats, provide timely feedback, and assist in error trapping.
• Operations Manager: Verify planning documents incorporate TEM controls.
• Crew Members: Report threats/errors openly, comply with checklists, and escalate issues via P.A.C.E. protocol.

Tools, Forms, or Checklists:
• RPAS Pre-Flight and In-Flight Checklists
• Site Survey & Operational Risk Assessment forms
• the CompanyFly-Away Emergency Communication Script

Safety/Compliance/Quality Requirements:
• Compliance with CARs Part IX (RPAS regulations)
• Strict adherence to the CompanySOPs
• Mandatory recurrent TEM training

Reporting or Escalation:
• All identified threats/errors are logged in post-flight reports.
• Escalation through P.A.C.E. (Probe, Alert, Challenge, Emergency) when threat management requires intervention.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Ensure TEM training is embedded in CRM training program.
• Review logged TEM events during audits.

Supervisors:
• Monitor adherence to TEM procedures on site.
• Conduct post-mission debriefs to capture threat/error learnings.

Staff:
• Apply ATM strategies in all operations.
• Report and document all threats/errors honestly and without fear of reprisal.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Annual TEM refresher training
• Random audits of flight logs and debrief reports
• Observation during field operations

Consequences for Non-Compliance:
• Corrective training for unintentional lapses.
• Formal disciplinary action for intentional non-compliance, up to termination.

Reporting Obligations:
• All TEM issues to be documented in operational reports.
• Significant errors or non-compliance reported to Accountable Executive.`
      }
    ]
  },

  '1014': {
    number: '1014',
    title: 'CRM - Communication Policy',
    category: 'crm',
    description: 'Establishes structured communication protocols that enhance safety, clarity, and teamwork in RPAS operations.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['Transport Canada Advisory Circular 700-042', 'the CompanyCRM Manual'],
    keywords: ['communication', 'PACE', 'phraseology', 'feedback', 'CRM'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To establish structured communication protocols that enhance safety, clarity, and teamwork in RPAS operations. Effective communication ensures accurate information transfer, situational awareness, and timely decision-making.

Scope:
Applies to all the CompanyRPAS operational personnel, including PICs, VOs, Operations Managers, subcontractors, and supporting staff engaged in pre-flight, in-flight, and post-flight phases.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• P.A.C.E. Protocol: Structured escalation method — Probe, Alert, Challenge, Emergency.
• Standard Phraseology: Defined terms and language to reduce ambiguity.
• Feedback Loop: Confirmation by recipient that a message was received and understood.

References:
• the CompanyCRM Manual, Section: Communication
• the CompanyRPAS Operations Manual, Section: Communication Techniques
• Transport Canada Advisory Circular 700-042, Appendix A`
      },
      {
        title: 'Policy Statement',
        content: `the Companymandates clear, concise, and standardized communication across all operational phases. All team members must use structured protocols, confirmation loops, and escalation models to ensure that information is correctly exchanged and acted upon.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Pre-Flight:
• Conduct structured team briefings covering mission objectives, roles, communication standards, and contingency plans.
• Verify all communication tools are operational.

In-Flight:
• Use standardized phraseology (cardinal directions, metric values).
• Maintain continuous communication between PIC and VO.
• Confirm critical instructions using feedback loops.
• Escalate using P.A.C.E. if concerns are not resolved.

Post-Flight:
• Conduct debrief to review communication effectiveness.
• Document communication barriers, feedback, and lessons learned.

Tools, Forms, or Checklists:
• Pre-flight Communication Checklist
• Post-flight Debrief Template
• the CompanyFly-Away Communication Script

Safety/Compliance/Quality Requirements:
• Compliance with CARs Part IX and RPAS communication regulations.
• Mandatory training in standardized phraseology and communication escalation protocols.

Reporting or Escalation:
• All communication breakdowns are logged in debrief reports.
• Escalation follows P.A.C.E. (Probe → Alert → Challenge → Emergency).`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Ensure training and monitoring of CRM communication practices.
• Review logged communication challenges in audits.

Supervisors:
• Conduct and enforce structured briefings/debriefings.
• Ensure communication tools are functional and available.

Staff:
• Follow phraseology, feedback loops, and escalation protocols.
• Participate in open, assertive, and respectful communication.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Field audits of communication during live operations.
• Review of debrief documentation.
• Annual CRM communication refresher training.

Consequences for Non-Compliance:
• Retraining for unintentional lapses.
• Formal disciplinary action for persistent or intentional breaches.

Reporting Obligations:
• Significant communication failures must be documented and reported to the Accountable Executive.`
      }
    ]
  },

  '1015': {
    number: '1015',
    title: 'CRM - Situational Awareness Policy',
    category: 'crm',
    description: 'Establishes a structured policy for building, maintaining, and recovering situational awareness (SA) in RPAS operations.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['Transport Canada Advisory Circular 700-042', 'the CompanyCRM Manual'],
    keywords: ['situational awareness', 'SA', 'perception', 'comprehension', 'projection'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To establish a structured policy for building, maintaining, and recovering situational awareness (SA) in RPAS operations. Maintaining SA ensures operators perceive, comprehend, and anticipate operational conditions to minimize threats, prevent errors, and ensure mission safety.

Scope:
Applies to all the CompanyRPAS operational personnel, including Pilots in Command (PICs), Visual Observers (VOs), Operations Managers, subcontractors, and any supporting crew members involved in mission planning, execution, and debrief.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Situational Awareness (SA): The perception of environmental elements, comprehension of their meaning, and projection of their future status.
• Levels of SA: Perception (recognizing factors), Comprehension (understanding meaning), Projection (anticipating outcomes).
• SA Loss: A condition where an operator becomes disconnected from mission-critical factors, leading to degraded safety.

References:
• the CompanyCRM Manual, Section: Situational Awareness
• the CompanyRPAS Operations Manual, Section: Communication Techniques
• Transport Canada Advisory Circular 700-042, Appendix A`
      },
      {
        title: 'Policy Statement',
        content: `the Company requires all operators to actively build and sustain situational awareness throughout all phases of RPAS missions. Operators must use structured countermeasures, communication protocols, and workload distribution techniques to anticipate threats, recognize early signs of SA loss, and recover awareness immediately.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Pre-Mission (Build SA):
• Conduct thorough site surveys, environmental assessments, and risk reviews.
• Establish baseline awareness of airspace, weather, and equipment status.

During Mission (Maintain SA):
• Monitor telemetry, airspace, and environmental factors continuously.
• Apply three levels of SA (Perception → Comprehension → Projection).
• Use VO updates and communication protocols to maintain shared awareness.

SA Challenges:
• Recognize stress, distraction, or automation over-reliance as threats to SA.
• Conduct regular crew check-ins to confirm shared mental models.

Recovery from SA Loss:
• Pause non-critical tasks.
• Seek VO feedback or repeat system status checks.
• Reassess mission priorities and restore shared SA before continuing.

Post-Mission (Debrief):
• Review SA strengths and weaknesses during team debrief.
• Document lapses, recovery methods, and lessons learned for future training.

Tools, Forms, or Checklists:
• SA Pre-Mission Checklist (weather, airspace, risk review)
• VO Communication Update Log
• SA Recovery SOP

Safety/Compliance/Quality Requirements:
• Compliance with CARs Part IX regarding continuous RPAS monitoring.
• Adherence to the CompanySOPs for crew briefings and communication updates.

Reporting or Escalation:
• All instances of SA loss or recovery must be documented in debrief reports.
• Escalation via P.A.C.E. protocol when SA loss poses safety risk.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Ensure SA protocols are integrated into training and field audits.
• Review SA-related debrief findings during safety meetings.

Supervisors:
• Confirm SA planning (weather, airspace, hazards) is completed before each mission.
• Lead post-mission reviews to capture SA lessons learned.

Staff:
• Apply SA techniques at all times.
• Report barriers to maintaining SA (e.g., fatigue, distraction).`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Field audits of SA performance during operations.
• Review of mission debriefs for documented SA lapses.
• Annual SA refresher training.

Consequences for Non-Compliance:
• Corrective coaching or retraining for lapses.
• Disciplinary action for negligence resulting in safety compromise.

Reporting Obligations:
• SA-related events must be logged in mission reports.
• Critical SA losses reported to the Accountable Executive.`
      }
    ]
  },

  '1016': {
    number: '1016',
    title: 'CRM - Pressure & Stress Management Policy',
    category: 'crm',
    description: 'Establishes structured protocols for recognizing, managing, and mitigating pressure and stress during RPAS operations to ensure operators remain composed and make sound decisions.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['Transport Canada Advisory Circular 700-042', 'CRM Manual'],
    keywords: ['pressure', 'stress', 'management', 'coping', 'stressors', 'CRM'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To establish structured protocols for recognizing, managing, and mitigating pressure and stress during RPAS operations. Effective stress management ensures operators remain composed, make sound decisions, and maintain operational safety even under high-pressure conditions.

Scope:
Applies to all RPAS operational personnel, including Pilots in Command (PICs), Visual Observers (VOs), Operations Managers, subcontractors, and all supporting staff engaged in mission activities.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Pressure: External demands or expectations placed on operators (e.g., deadlines, client requirements).
• Stress: Physical, mental, or emotional strain caused when demands exceed perceived capacity.
• Stressors: Internal or external factors that may impair judgment, communication, or performance.

References:
• CRM Manual, Section: Pressure and Stress Management
• HSE Policy: Stress & Fatigue Management
• Transport Canada Advisory Circular 700-042, Appendix A`
      },
      {
        title: 'Policy Statement',
        content: `All RPAS crew must recognize and proactively manage pressure and stress to maintain mission safety and effectiveness. Operators must use structured strategies and escalation protocols to reduce stress impacts and openly communicate when stress levels compromise performance.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Pre-Mission (Anticipate Stress):
• Conduct stress self-assessment and share potential stressors during the team briefing.
• Identify external demands (client expectations, weather, deadlines) that could create pressure.

During Mission (Manage Stress):
• Apply stress-reduction techniques such as tactical breathing, visualization, and goal setting.
• Rotate tasks during long missions to avoid cognitive overload.
• Use P.A.C.E. escalation protocol if stress is compromising decision-making or safety.

Post-Mission (Debrief & Learn):
• Conduct structured debrief to review stressors encountered.
• Document effective strategies and lessons learned for continuous improvement.

Tools, Forms, or Checklists:
• Pre-Mission Stress Self-Assessment Checklist
• P.A.C.E. Communication Protocol for stress escalation
• Post-Mission Stress Review Log

Safety/Compliance/Quality Requirements:
• Compliance with CARs 901.19 (crew fitness for duty).
• Integration with HSE Fatigue and Stress Management Policy.

Reporting or Escalation:
• Stress-related issues reported during debriefs.
• Critical stress conditions escalated immediately to Operations Manager or Accountable Executive.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Provide training on stress recognition and coping strategies.
• Monitor stress-related trends from debrief reports.

Supervisors:
• Reinforce stress reduction practices during mission planning and briefings.
• Ensure adequate rest and workload distribution.

Staff:
• Apply stress management strategies.
• Report if stress impacts safe performance.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Field audits of team communication and stress handling.
• Review of post-mission debrief logs for stress-related issues.
• Annual refresher training on stress and pressure management.

Consequences for Non-Compliance:
• Corrective coaching or retraining for lapses in stress management.
• Disciplinary action if unmanaged stress leads to unsafe operation.

Reporting Obligations:
• Stress-related incidents documented in mission reports.
• Significant stress-related operational risks reported to Accountable Executive.`
      }
    ]
  },

  '1017': {
    number: '1017',
    title: 'CRM - Fatigue Management Policy',
    category: 'crm',
    description: 'Establishes structured protocols for recognizing, preventing, and mitigating fatigue during RPAS operations to ensure crew members remain alert and capable.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['Transport Canada CAR 901.19', 'CRM Manual'],
    keywords: ['fatigue', 'management', 'rest', 'alertness', 'acute fatigue', 'chronic fatigue', 'CRM'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To establish structured protocols for recognizing, preventing, and mitigating fatigue during RPAS operations. Fatigue management ensures that crew members remain alert, capable, and safe while performing duties.

Scope:
Applies to all RPAS operational personnel, including Pilots in Command (PICs), Visual Observers (VOs), Operations Managers, subcontractors, and all supporting staff involved in RPAS missions.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Fatigue: A state of physical and/or mental exhaustion that reduces an operator's ability to perform safely and effectively.
• Acute Fatigue: Short-term exhaustion due to recent activity or inadequate rest.
• Chronic Fatigue: Long-term cumulative exhaustion from sustained stress or insufficient recovery.

References:
• CRM Manual, Section: Fatigue Management
• HSE Fatigue Management Policy
• Transport Canada CAR 901.19 (Crew Fitness for Duty)`
      },
      {
        title: 'Policy Statement',
        content: `All RPAS crew must monitor and manage fatigue proactively. Operators must complete fatigue self-assessments, comply with rest and break schedules, and report fatigue concerns without fear of reprisal. Fatigue-related risks must be addressed immediately to ensure safe and effective operations.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Pre-Mission:
• All operators complete a fatigue self-assessment.
• PIC or Operations Manager reviews team readiness and identifies potential fatigue risks.

During Mission:
• For missions longer than 2 hours, all operators take a 15-minute break every 2 hours.
• VO monitors crew members, including PIC, for signs of fatigue (e.g., slower responses, irritability).
• If fatigue detected, tasks are reassigned or additional breaks are enforced.

Post-Mission:
• Crew discusses fatigue challenges during debrief.
• Fatigue incidents or near-misses are documented for trend analysis and future mitigation.

Tools, Forms, or Checklists:
• Pre-Mission Fatigue Self-Assessment Form
• Fatigue Monitoring Log (completed by VO during extended missions)
• Post-Mission Fatigue Review Template

Safety/Compliance/Quality Requirements:
• Compliance with CARs Part IX crew duty/rest regulations (CAR 901.19).
• Alignment with HSE Fatigue Management protocols.

Reporting or Escalation:
• Fatigue-related safety issues logged in mission reports.
• Severe fatigue cases escalated to the Operations Manager or Accountable Executive immediately.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Provide fatigue awareness training and enforce rest requirements.
• Monitor fatigue-related trends across operations.

Supervisors:
• Enforce work-rest cycles and breaks.
• Reallocate workload if crew fatigue is observed.

Staff:
• Arrive fit for duty, having taken adequate rest.
• Report fatigue honestly and without delay.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Fatigue assessments recorded before each mission.
• VO monitoring during flight operations.
• Post-mission reviews of fatigue-related concerns.

Consequences for Non-Compliance:
• Retraining or corrective coaching for failure to follow fatigue protocols.
• Disciplinary action if intentional disregard of fatigue policy leads to safety risk.

Reporting Obligations:
• Fatigue-related incidents documented in mission and HSE reports.
• Critical fatigue issues reported to Accountable Executive.`
      }
    ]
  },

  '1018': {
    number: '1018',
    title: 'CRM - Workload Management Policy',
    category: 'crm',
    description: 'Establishes structured practices for distributing, prioritizing, and managing workload during RPAS operations to prevent task overload and reduce error risk.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['Transport Canada Advisory Circular 700-042', 'CRM Manual'],
    keywords: ['workload', 'management', 'task prioritization', 'delegation', 'CRM'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To establish structured practices for distributing, prioritizing, and managing workload during RPAS operations. Effective workload management prevents task overload, reduces error risk, and ensures operators maintain situational awareness and mission safety.

Scope:
Applies to all RPAS operational personnel, including Pilots in Command (PICs), Visual Observers (VOs), Operations Managers, subcontractors, and any support crew involved in RPAS mission execution.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Workload Management: The process of balancing tasks among crew members to maintain safe and effective operations.
• Task Prioritization: Determining which tasks must be completed first to support mission-critical objectives.
• Delegation: Assigning responsibilities to distribute cognitive and physical workload.

References:
• CRM Manual, Section: Workload Management
• RPAS Operations Manual (General Procedures: Team Briefing Flow, Data Debrief Flow)
• Transport Canada Advisory Circular 700-042, Appendix A`
      },
      {
        title: 'Policy Statement',
        content: `All operational teams must manage workload effectively by prioritizing critical tasks, delegating responsibilities, and maintaining balance across crew members. Workload must be planned before missions, monitored during operations, and reviewed afterwards to ensure continuous improvement.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Pre-Mission (Plan Workload):
• Define objectives and allocate tasks during the team briefing.
• Confirm task assignments, risk factors, and contingency workload strategies.

During Mission (Manage Workload):
• PIC focuses on flight-critical tasks (aircraft control, safety decisions).
• VO provides support through airspace scanning, monitoring telemetry, and reporting hazards.
• Adjust task distribution dynamically if workload exceeds safe thresholds.

Post-Mission (Review Workload):
• Conduct structured debrief to review workload effectiveness.
• Capture lessons learned and update workload planning practices.

Tools, Forms, or Checklists:
• Pre-Mission Task Allocation Checklist
• Real-Time Task Monitoring Log
• Post-Mission Workload Review Form

Safety/Compliance/Quality Requirements:
• Compliance with CARs Part IX regarding PIC responsibility and operational oversight.
• Integration with SOPs (Team Briefing Flow, Task Reassignment Protocols).

Reporting or Escalation:
• Workload-related challenges logged in mission reports.
• Escalation to Operations Manager if workload distribution compromises safety.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Provide training on task prioritization, delegation, and dynamic workload adjustment.
• Review workload-related reports and audits.

Supervisors:
• Ensure adequate crew numbers for mission complexity.
• Verify contingency task reassignment procedures are in place.

Staff:
• Manage workload actively and honestly.
• Request support when individual workload exceeds safe levels.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Field audits during operations.
• Review of debrief reports and workload assessments.
• Annual training refreshers on workload management strategies.

Consequences for Non-Compliance:
• Retraining for poor workload management practices.
• Disciplinary measures for intentional disregard of workload protocols.

Reporting Obligations:
• Workload-related safety issues documented in operational logs.
• Critical incidents escalated to the Accountable Executive.`
      }
    ]
  },

  '1019': {
    number: '1019',
    title: 'CRM - Decision Making Process Policy',
    category: 'crm',
    description: 'Establishes structured decision-making protocols for RPAS operations to ensure safe, timely, and informed choices that align with mission objectives and safety standards.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['Transport Canada Advisory Circular 700-042', 'CRM Manual'],
    keywords: ['decision making', 'decision matrix', 'collaborative', 'risk assessment', 'CRM'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To establish structured decision-making protocols for RPAS operations. Effective decision-making ensures safe, timely, and informed choices that align with mission objectives, safety standards, and regulatory requirements.

Scope:
Applies to all RPAS operational personnel, including Pilots in Command (PICs), Visual Observers (VOs), Operations Managers, subcontractors, and support personnel engaged in planning, execution, and debriefing of RPAS missions.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Decision-Making: The cognitive process of evaluating information and selecting a course of action.
• Real-Time Decision Matrix: A structured framework for evaluating risk and options in dynamic scenarios.
• Collaborative Decision-Making: A process where PICs, VOs, and crew members contribute input to support effective outcomes.

References:
• CRM Manual, Section: Decision-Making Process
• RPAS Operations Manual (General & Emergency Procedures)
• Transport Canada Advisory Circular 700-042, Appendix A`
      },
      {
        title: 'Policy Statement',
        content: `All RPAS crew must apply structured decision-making processes during mission planning, execution, and post-mission review. Decisions must prioritize safety, comply with SOPs and CARs, and leverage input from all team members to ensure effective outcomes.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Pre-Mission (Planned Decisions):
• Use decision matrices and risk assessment tools during planning.
• Establish clear decision-making roles and criteria before operations.

During Mission (Real-Time Decisions):
• PIC makes final operational decisions, supported by VO and crew input.
• Apply structured tools such as decision matrices for complex or high-risk scenarios.
• Adjust mission plans as conditions evolve (weather, equipment, or airspace changes).

Post-Mission (Review Decisions):
• Review effectiveness of decisions in debrief.
• Document successes, failures, and lessons learned for training.

Tools, Forms, or Checklists:
• Decision Matrix Templates
• Risk Assessment Forms (Site Survey, CONOPS, SORA)
• Post-Mission Decision Review Log

Safety/Compliance/Quality Requirements:
• Compliance with CARs Part IX regarding PIC authority and operational risk assessments.
• Adherence to SOPs for structured planning and risk-based decision processes.

Reporting or Escalation:
• Critical mission decisions documented in flight logs and debrief reports.
• Escalation to Accountable Executive if operational decisions compromise safety.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Provide training in structured decision-making models and risk assessment tools.
• Ensure decision-making reviews are integrated into safety audits.

Supervisors:
• Validate that risk-based frameworks (CONOPS, SORA) are applied.
• Lead structured reviews of decision-making in debriefs.

Staff:
• Participate in decision-making processes by contributing accurate observations and feedback.
• Challenge unsafe decisions respectfully and escalate when required.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Field audits of decision-making practices during missions.
• Review of decision documentation in planning and debrief reports.
• Annual CRM training refreshers with scenario-based decision exercises.

Consequences for Non-Compliance:
• Coaching or retraining for failure to use structured decision-making tools.
• Disciplinary measures for reckless or non-compliant decisions.

Reporting Obligations:
• All high-risk or emergency-related decisions documented in operational records.
• Critical decision failures reported to the Accountable Executive.`
      }
    ]
  },

  '1020': {
    number: '1020',
    title: 'CRM - Leadership & Team Building Policy',
    category: 'crm',
    description: 'Establishes structured practices for developing leadership, teamwork, and professional discipline in RPAS operations to ensure safety, accountability, and mission success.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['Transport Canada Advisory Circular 700-042', 'CRM Manual'],
    keywords: ['leadership', 'team building', 'authority', 'assertiveness', 'collaboration', 'CRM'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To establish structured practices for developing leadership, teamwork, and professional discipline in RPAS operations. Effective leadership and team cohesion ensure safety, accountability, and mission success.

Scope:
Applies to all RPAS operational personnel, including Pilots in Command (PICs), Visual Observers (VOs), Operations Managers, subcontractors, and supporting staff.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Leadership: The ability to influence, guide, and support team members while maintaining accountability for safety and mission outcomes.
• Team Building: Processes that foster trust, communication, and collaboration among team members.
• Authority & Assertiveness: Exercising legitimate decision-making power while encouraging respectful challenge and input.

References:
• CRM Manual, Section: Leadership and Team Building
• RPAS Operations Manual (Team Briefing & Debrief Protocols)
• Transport Canada Advisory Circular 700-042, Appendix A`
      },
      {
        title: 'Policy Statement',
        content: `Every operator is recognized as a leader and must demonstrate professionalism, discipline, and collaboration. Leadership practices must emphasize safety, integrity, communication, and trust, while team-building efforts must strengthen cohesion, engagement, and accountability.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Pre-Mission (Build Leadership & Cohesion):
• Conduct structured team briefings, clearly defining roles and responsibilities.
• Establish trust through open communication and professional discipline.
• Encourage questions and input to promote inclusivity and engagement.

During Mission (Lead & Coordinate):
• PIC maintains clear authority and ensures decisions align with SOPs and safety.
• Crew members exercise assertiveness by raising concerns respectfully.
• Leaders distribute workload effectively, monitoring for stress or fatigue.

Post-Mission (Review & Strengthen):
• Conduct structured debriefs, including leadership effectiveness and team performance.
• Document lessons learned on leadership, communication, and group dynamics.
• Incorporate findings into ongoing training and team-building exercises.

Tools, Forms, or Checklists:
• Team Briefing Checklist
• Leadership & Team Dynamics Debrief Template
• Conflict Resolution Protocol

Safety/Compliance/Quality Requirements:
• Compliance with CARs Part IX regarding PIC authority and crew responsibilities.
• Adherence to SOPs for leadership, communication, and workload balance.

Reporting or Escalation:
• Leadership or team conflicts must be documented during debriefs.
• Escalation to Operations Manager for unresolved team issues.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Provide leadership training and mentorship opportunities.
• Review leadership effectiveness during audits and debriefs.

Supervisors:
• Monitor team dynamics and intervene to resolve conflicts.
• Reinforce standards of professionalism and ethical conduct.

Staff:
• Uphold discipline, professionalism, and accountability.
• Participate in team-building exercises and provide feedback.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Field observation of leadership practices and team interactions.
• Review of debrief documentation related to leadership and team dynamics.
• Annual leadership and teamwork refresher training.

Consequences for Non-Compliance:
• Coaching or retraining for poor leadership or teamwork practices.
• Disciplinary measures for repeated failures to adhere to leadership standards.

Reporting Obligations:
• Leadership or team-related issues must be logged in mission reports.
• Significant conflicts escalated to the Accountable Executive.`
      }
    ]
  },

  '1021': {
    number: '1021',
    title: 'CRM - Automation & Technology Management Policy',
    category: 'crm',
    description: 'Establishes structured procedures for the effective use, monitoring, and management of automation and technology in RPAS operations to reduce human error and prevent over-reliance.',
    version: '1.0',
    effectiveDate: '2025-09-16',
    reviewDate: '2026-02-01',
    owner: 'Chief Pilot',
    status: 'active',
    regulatoryRefs: ['Transport Canada Advisory Circular 700-042', 'CRM Manual'],
    keywords: ['automation', 'technology', 'mode awareness', 'automation bias', 'manual proficiency', 'CRM'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To establish structured procedures for the effective use, monitoring, and management of automation and technology in RPAS operations. Proper management of automation reduces human error, prevents over-reliance, and ensures operators remain engaged and capable of manual intervention.

Scope:
Applies to all RPAS operational personnel, including Pilots in Command (PICs), Visual Observers (VOs), Operations Managers, subcontractors, and technical support staff involved in RPAS operations and equipment management.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Automation: Technology that performs tasks with limited or no direct human input (e.g., autopilot, Return-to-Home functions).
• Automation Bias: Over-reliance on automated systems, leading to reduced operator vigilance.
• Mode Awareness: Understanding which automation mode is active and how it affects RPAS performance.

References:
• CRM Manual, Section: Automation and Technology Management
• RPAS Operations Manual (Power-Up Flow, Fail-Safe Functions)
• Transport Canada Advisory Circular 700-042, Appendix A`
      },
      {
        title: 'Policy Statement',
        content: `All RPAS crew must actively monitor and manage automation, ensuring safe operation and effective integration of technology into missions. Operators must maintain proficiency in manual operations, avoid over-reliance on automation, and apply best practices for technology management.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Pre-Mission:
• Verify all automation systems (RTH, geofencing, autopilot) are configured and tested.
• Confirm software and firmware are up to date.
• Review automation settings during the team briefing.

During Mission:
• Maintain mode awareness by announcing active modes (e.g., "Switching to autopilot").
• Continuously monitor telemetry and automation performance.
• Be prepared to assume manual control immediately if automation performance is abnormal.
• Avoid over-reliance by periodically hand-flying to confirm manual proficiency.

Post-Mission:
• Debrief automation use, including effectiveness and any anomalies.
• Document technology issues in maintenance logs and mission reports.
• Capture lessons learned for integration into training and SOP refinements.

Tools, Forms, or Checklists:
• Pre-Flight Automation Setup Checklist
• In-Flight Mode Awareness Log
• Post-Mission Automation Debrief Form

Safety/Compliance/Quality Requirements:
• Compliance with CARs Part IX crew responsibilities and fail-safe requirements.
• Strict adherence to manufacturer's guidance on automation and firmware management.

Reporting or Escalation:
• Automation anomalies documented in post-flight debrief and maintenance records.
• Critical failures escalated immediately to Maintenance Manager and Operations Manager.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Provide training in automation best practices and failure recognition.
• Ensure updates to SOPs reflect emerging technologies and lessons learned.

Supervisors:
• Monitor automation usage during operations and verify compliance with protocols.
• Lead reviews of automation-related issues during post-mission debriefs.

Staff:
• Maintain manual flying proficiency.
• Apply automation cautiously, avoiding over-reliance.
• Report technology issues immediately.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Field audits of automation usage.
• Review of telemetry data for automation activation patterns.
• Training evaluations to confirm manual proficiency.

Consequences for Non-Compliance:
• Corrective retraining for misuse or over-reliance on automation.
• Disciplinary action if failure to manage automation leads to unsafe operation.

Reporting Obligations:
• Automation-related incidents documented in mission reports and maintenance logs.
• Major technology failures escalated to the Accountable Executive.`
      }
    ]
  },

  // ============================================
  // HSE POLICIES (1022-1053)
  // ============================================

  '1022': {
    number: '1022',
    title: 'HSE Health & Safety Pledge',
    category: 'hse',
    description: 'Formalizes the Health & Safety Pledge as a top-level policy anchoring the Zero Harm culture, linking day-to-day field practice to the Safety Management System.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['Canada Labour Code Part II', 'BC OHS Regulation'],
    keywords: ['zero harm', 'safety pledge', 'SMS', 'HSMS', 'commitment', 'prevention'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
To formalize the Health & Safety Pledge as a top-level policy that anchors our Zero Harm culture, clarifies expectations, and links day-to-day field practice to our Safety Management System (SMS). This policy consolidates the company's commitment to prevention, empowerment, open communication, regulatory compliance, collaboration, and continuous improvement.

Scope:
This policy applies to all personnel (employees, managers, contractors, students/interns) and all worksites, field operations, offices, and client locations, including RPAS (drone) operations and related lab/data workflows.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Zero Harm: An organizational goal to eliminate workplace incidents, injuries, and occupational illness through prevention, design, and disciplined execution.
• SMS / HSMS: Safety (Health & Safety) Management System that integrates policy, roles, procedures, training, hazard/risk control, incident learning, and audits.
• RPAS: Remotely Piloted Aircraft System; includes the aircraft, control station, payloads, and supporting equipment.

References:
• HSE Policy (master program) — Sections on Management Commitment, Workers' Rights, SMS, and core policies.
• RPAS Operations Manual — Roles, procedures, emergency protocols, communications, and planning documents.
• Crew Resource Management (CRM) Manual — Stress, fatigue, communications, decision-making, workload, and SA protocols.
• Applicable legislation/regulation: Canada Labour Code Part II; BC OHS Regulation & Guidelines; other client/site rules as applicable.`
      },
      {
        title: 'Policy Statement',
        content: `The organization commits to a Zero Harm workplace where every person is empowered and expected to act safely, speak up, and stop or refuse unsafe work. We will:
• Prevent harm through robust hazard identification and risk controls, strong planning, and disciplined field execution.
• Empower & train people with the tools, competence, and authority to do the job safely and to intervene when conditions change.
• Maintain open communication and non-retaliation, encouraging reporting of hazards, near misses, and ideas for improvement.
• Comply with and exceed applicable OHS and environmental legislation, client requirements, and aviation rules for RPAS.
• Collaborate with clients, contractors, and partners to align standards on shared worksites.
• Continuously improve via audits, inspections, KPIs, and lessons learned from incidents and near misses.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Orientation & Acknowledgment:
• Before starting work, all personnel complete orientation covering rights, duties, major hazards, ERP, and reporting pathways, and sign acknowledgment of this policy.

Tailgate & Operational Briefs:
• Each shift or task begins with a tailgate reviewing the plan, hazards/controls, role clarity, communications, and changes on site (including RPAS-specific items when applicable).

Hazard ID & Near-Miss Reporting:
• Use FLHA/FLRA and observation/near-miss forms. Submit promptly; no retaliation. Immediate controls are applied and documented.

Refuse/Stop Unsafe Work:
• Any worker may stop the job or refuse work they reasonably believe is unsafe. Supervisor/HSE investigates at once; alternate duties provided if needed until resolved.

Competency, Training & Recency:
• Maintain required certifications (e.g., First Aid, WHMIS, RPAS Advanced/ROC-A, wildlife/bear awareness). Meet recency/practice requirements; record in training matrix.

Emergency Readiness:
• Keep site ERP current (muster points, contacts, first aid). Run drills at required intervals; update gaps.

Audits, Inspections & KPIs:
• Complete scheduled inspections, management walkthroughs, and audits. Track leading/lagging indicators; review trends quarterly.

Incident Response & Learning:
• Report incidents immediately. Conduct preliminary and full investigations; implement and verify corrective actions. Share lessons learned in meetings/tailgates.

Tools, Forms, or Checklists:
• Orientation checklist; FLHA/FLRA; Site Survey; ERP; Incident/Near-Miss forms; Training Matrix; KPI dashboard; RPAS planning docs (Flight Plan, CONOPS, SORA) where applicable.

Safety/Compliance/Quality Requirements:
• Apply the Hierarchy of Controls; adhere to RPAS limitations/airspace approvals; keep records to regulatory retention standards; meet client/site rules.

Reporting or Escalation:
• Hazards/near misses → Supervisor & HSE same day
• Stop-work/refusal → Immediate supervisor/HSE
• Incidents → per matrix (first aid, medical, hospitalization) and regulatory notifications as applicable
• Unresolved safety issues → escalate to Accountable Executive`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Demonstrate visible safety leadership; resource the HSMS; ensure legal and client compliance; approve training and equipment; review KPIs and audits; remove barriers to safe work; sign off on amendments.

Supervisors:
• Plan safe work; run briefings; verify FLHAs and controls; enforce PPE; investigate reports; coach for safe behaviors; coordinate ERP and drills; ensure contractor alignment.

Staff:
• Work to plan and controls; wear required PPE; report hazards and near misses; participate in training and drills; stop work or refuse unsafe work when required; protect the environment.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Scheduled inspections, spot checks, and audits; KPI tracking (training completion, FLHA completion, inspection closure rates, incident trends); management reviews.

Consequences for Non-Compliance:
• Coaching → retraining → removal from site → progressive discipline up to termination and/or contractor removal, proportional to risk and recurrence.

Reporting Obligations:
• Maintain records per retention schedule; complete statutory notifications (e.g., WorkSafeBC/TC where applicable); share lessons learned internally.`
      }
    ]
  },

  '1023': {
    number: '1023',
    title: 'HSE Commitment Statement',
    category: 'hse',
    description: 'Affirms the organization\'s core dedication to health, safety, and environmental protection, establishing safety as a foundational value and promoting a culture of zero harm.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC OHS Regulation', 'Health & Safety Policy'],
    keywords: ['commitment', 'zero harm', 'HSMS', 'proactive', 'leadership', 'safety culture'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This statement exists to affirm the organization's core dedication to health, safety, and environmental protection. Its objectives are to establish safety as a foundational value, promote a culture of zero harm, ensure compliance with regulations, and empower all stakeholders to contribute to a safe workplace, ultimately solving the problem of preventable incidents, injuries, and occupational illnesses.

Scope:
This statement applies to all employees, contractors, clients, visitors, and third parties involved in operations, including all departments, roles, activities, and locations where the company conducts business.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Zero Harm Philosophy: A guiding principle aiming for a workplace free from incidents, injuries, and occupational illnesses.
• Health and Safety Management System (HSMS): A proactive framework for developing, implementing, and sustaining health and safety policies and procedures.
• Proactive Risk Management: The process of identifying, assessing, and mitigating risks before they cause harm.

References:
• BC OHS Regulation (e.g., s.3.12 Refusal of Unsafe Work).
• Health & Safety Policy.
• Environmental Policy.
• Relevant federal and provincial health, safety, and environmental legislation.`
      },
      {
        title: 'Policy Statement',
        content: `The organization is committed to fostering a safe, healthy, and productive work environment for all employees, contractors, clients, and visitors. Safety is a core value that guides our decisions, strengthens operations, and ensures well-being. We adhere to a Zero Harm Philosophy, integrating safety into every aspect of our culture through leadership, compliance, continuous improvement, and employee empowerment.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Leadership Commitment: Leadership sets the tone by integrating safety into organizational culture and providing resources for the HSMS.
• Risk Assessment: Conduct regular reviews, audits, and hazard assessments to identify and mitigate risks.
• Open Communication: Engage in open communication to raise and address safety concerns without reprisal.
• Training and Empowerment: Train and empower employees to report hazards, participate in safety initiatives, and adhere to best practices.
• Stakeholder Collaboration: Collaborate with stakeholders to ensure unified safety approaches and recognize contributions to improvements.

Tools, Forms, or Checklists:
• Hazard assessment forms (e.g., FLRA/FLHA)
• Audit checklists
• Incident reporting forms
• Training records

Safety/Compliance/Quality Requirements:
All actions must comply with relevant regulations, exceed industry standards where possible, and prioritize proactive risk management to prevent harm.

Reporting or Escalation:
Report safety concerns immediately to supervisors or HSE Representatives; escalate unresolved issues to management for corrective action and documentation.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Lead by example, allocate resources, ensure compliance, and promote a culture of safety through policies and support.

Supervisors:
• Ensure teams adhere to safety procedures, conduct inspections, address hazards, and reinforce employee rights like refusing unsafe work.

Staff:
• Comply with safe practices, report hazards, participate in training, and contribute to safety improvements.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through regular audits, inspections, performance reviews, and sharing of metrics to assess adherence and effectiveness.

Consequences for Non-Compliance:
• Progressive discipline, including warnings, retraining, suspension, or termination, depending on severity.

Reporting Obligations:
• All incidents, near-misses, and concerns must be reported promptly to HSE Representatives; breaches are documented and escalated as needed.`
      }
    ]
  },

  '1024': {
    number: '1024',
    title: 'HSE Workers Rights Policy',
    category: 'hse',
    description: 'Affirms and protects the rights of workers, ensuring they are informed of their legal entitlements, empowered to exercise them, and safeguarded from retaliation.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC Workers Compensation Act', 'BC OHS Regulation'],
    keywords: ['worker rights', 'refuse unsafe work', 'retaliation', 'fair treatment', 'safety'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to affirm and protect the rights of workers, ensuring they are informed of their legal entitlements, empowered to exercise them, and safeguarded from retaliation. Its objectives include promoting a safe workplace, enhancing worker confidence, and addressing issues like unsafe conditions or unfair treatment.

Scope:
This policy applies to all employees, including full-time, part-time, and temporary staff, across all departments, roles, activities, and locations where the company operates.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Worker Rights: Legal and organizational entitlements ensuring safe working conditions, fair treatment, and the ability to refuse unsafe work.
• Refusal of Unsafe Work: The right of a worker to refuse work they believe is hazardous, as outlined in applicable regulations.
• Retaliation: Any adverse action taken against a worker for exercising their rights.

References:
• BC Workers Compensation Act (e.g., Part 3 Division 4 - Right to Refuse Unsafe Work).
• BC Occupational Health and Safety Regulation.
• Health & Safety Policy.
• Internal Refuse Unsafe Work Policy.`
      },
      {
        title: 'Policy Statement',
        content: `The organization is committed to upholding the rights of all workers, ensuring they have the right to a safe workplace, the ability to refuse unsafe work without fear of reprisal, and access to fair treatment and support. We pledge to foster an environment where these rights are respected and actively protected through policy enforcement and education.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Rights Awareness: Provide initial and ongoing training on worker rights to all employees.
• Hazard Reporting: Establish a process for workers to report unsafe conditions or concerns.
• Refusal Process: Outline and communicate the procedure for refusing unsafe work, including immediate supervisor notification.
• Investigation: Conduct prompt and impartial investigations into reported issues or refusals.
• Resolution and Feedback: Implement corrective actions and provide feedback to workers on outcomes.

Tools, Forms, or Checklists:
• Worker rights training materials
• Hazard report forms
• Refusal of unsafe work checklist
• Investigation logs

Safety/Compliance/Quality Requirements:
Compliance with Workers Compensation Act and OHS Regulation, ensuring thorough and fair handling of all reports.

Reporting or Escalation:
Workers report concerns to supervisors; escalate unresolved issues to HSE Representatives or management within 24 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Ensure worker rights are integrated into policies, provide training, and protect against retaliation.

Supervisors:
• Support workers in exercising their rights, address reported hazards, and escalate issues as needed.

Staff:
• Understand and exercise their rights, report hazards, and participate in training programs.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through quarterly reviews of training records, incident reports, and worker feedback surveys to ensure rights are upheld.

Consequences for Non-Compliance:
• Disciplinary actions including warnings, retraining, or termination for violations, with legal action possible for retaliation.

Reporting Obligations:
• All rights-related incidents or refusals must be reported to HSE Representatives within 24 hours for documentation.`
      }
    ]
  },

  '1025': {
    number: '1025',
    title: 'HSE Safety Management System Policy',
    category: 'hse',
    description: 'Establishes a comprehensive Safety Management System (SMS) to ensure a safe and healthy work environment through hazard identification, risk management, and continuous improvement.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC OHS Regulation', 'Workers Compensation Act', 'ISO 45001:2018'],
    keywords: ['SMS', 'safety management', 'hazard identification', 'risk assessment', 'continuous improvement'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to establish a comprehensive Safety Management System (SMS) to ensure a safe and healthy work environment. Its objectives include identifying hazards, managing risks, ensuring compliance with regulations, and fostering continuous improvement to prevent workplace incidents and injuries.

Scope:
This policy applies to all employees, contractors, and visitors involved in operations, covering all departments, roles, activities, and locations where the company conducts business.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Safety Management System (SMS): A structured framework for managing safety risks and ensuring compliance with health and safety regulations.
• Hazard Identification: The process of recognizing potential sources of harm in the workplace.
• Risk Assessment: Evaluating the likelihood and severity of identified hazards to implement controls.

References:
• BC Occupational Health and Safety Regulation.
• Workers Compensation Act (British Columbia).
• Health & Safety Policy.
• ISO 45001:2018 Occupational Health and Safety Management Systems.`
      },
      {
        title: 'Policy Statement',
        content: `The organization is committed to implementing and maintaining an effective Safety Management System to proactively manage health and safety risks. We aim to provide a safe working environment by identifying hazards, assessing risks, ensuring regulatory compliance, and promoting a culture of safety through continuous monitoring and improvement.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• System Development: Design and document the SMS framework, including policies and procedures.
• Hazard Identification: Conduct regular hazard assessments to identify potential risks in the workplace.
• Risk Control: Implement and monitor control measures to mitigate identified risks.
• Training Implementation: Provide ongoing safety training to all personnel to ensure competency.
• Performance Review: Conduct periodic reviews and audits to assess SMS effectiveness and compliance.

Tools, Forms, or Checklists:
• Hazard assessment forms (e.g., FLRA/FLHA)
• Risk control checklists
• Training records
• Audit templates

Safety/Compliance/Quality Requirements:
Adherence to BC OHS Regulation, ISO 45001 standards, and internal safety protocols during all procedures.

Reporting or Escalation:
Report hazards or issues to supervisors; escalate unresolved matters to HSE Representatives or management within 24 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Accountable for developing, funding, and overseeing the SMS, ensuring resources and leadership support its implementation.

Supervisors:
• Ensure team compliance with SMS procedures, conduct regular safety checks, and report hazards promptly.

Staff:
• Participate in training, report hazards, and follow SMS protocols to maintain a safe workplace.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through monthly safety audits, incident investigations, and annual SMS performance reviews to ensure adherence.

Consequences for Non-Compliance:
• Disciplinary actions including warnings, retraining, or termination, with legal action possible for serious breaches.

Reporting Obligations:
• All hazards, incidents, or non-compliance issues must be reported to HSE Representatives within 24 hours.`
      }
    ]
  },

  '1026': {
    number: '1026',
    title: 'HSE Certifications & Qualifications Policy',
    category: 'hse',
    description: 'Ensures all personnel possess the necessary certifications and qualifications to perform their roles safely and effectively, maintaining compliance with regulatory and industry standards.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC OHS Regulation', 'Workers Compensation Act', 'ISO 45001'],
    keywords: ['certification', 'qualification', 'training', 'competency', 'safety-sensitive'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to ensure all personnel possess the necessary certifications and qualifications to perform their roles safely and effectively. Its objectives include maintaining a skilled workforce, ensuring compliance with regulatory and industry standards, and reducing risks associated with inadequate training, addressing the problem of competency gaps in safety-critical tasks.

Scope:
This policy applies to all employees, contractors, and supervisors involved in operations, covering all roles, activities, and locations where safety-sensitive work is conducted.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Certification: Official recognition that an individual has completed required training and meets specific safety or technical standards.
• Qualification: Demonstrated competency or experience required for a specific job role or task.
• Safety-Sensitive Work: Tasks where performance lapses could lead to serious injury or environmental harm.

References:
• BC Occupational Health and Safety Regulation.
• Workers Compensation Act (British Columbia).
• Health & Safety Policy.
• Industry-specific certification standards (e.g., COR, ISO 45001).`
      },
      {
        title: 'Policy Statement',
        content: `The organization is committed to ensuring that all employees, contractors, and supervisors hold the appropriate certifications and qualifications for their roles. We prioritize safety by mandating ongoing training, verification of credentials, and adherence to industry standards to maintain a competent and safe workforce.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Credential Assessment: Evaluate the current certifications and qualifications of all personnel.
• Training Enrollment: Enroll individuals in required training programs based on role requirements.
• Certification Verification: Confirm and document the validity of all certifications and qualifications.
• Recertification Scheduling: Schedule and track regular recertification to maintain competency.
• Audit Compliance: Conduct periodic audits to ensure ongoing adherence to certification standards.

Tools, Forms, or Checklists:
• Certification tracking forms
• Training enrollment logs
• Audit checklists
• Qualification verification templates

Safety/Compliance/Quality Requirements:
Compliance with BC OHS Regulation, industry certification standards, and internal safety protocols during all procedures.

Reporting or Escalation:
Report certification issues to supervisors; escalate unresolved concerns to HSE Representatives or management within 24 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Oversee the development and funding of certification programs, ensuring resources are available for training and compliance.

Supervisors:
• Verify team members' certifications, enforce training participation, and report gaps to management.

Staff:
• Maintain current certifications, participate in required training, and report expired credentials promptly.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through quarterly audits of certification records, training attendance logs, and periodic skill assessments to ensure adherence.

Consequences for Non-Compliance:
• Disciplinary actions including suspension from safety-sensitive tasks, retraining, or termination for failure to maintain required credentials.

Reporting Obligations:
• All certification lapses or training needs must be reported to supervisors within 24 hours.`
      }
    ]
  },

  '1027': {
    number: '1027',
    title: 'HSE Health & Safety Policy',
    category: 'hse',
    description: 'Establishes a framework for health, safety, and environmental management at the Company, preventing workplace injuries and ensuring compliance with legal standards.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC Occupational Health and Safety Regulation', 'Workers Compensation Act', 'ISO 14001:2015'],
    keywords: ['health', 'safety', 'HSE', 'workplace', 'hazard', 'environmental'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to establish a framework for health, safety, and environmental management at the Company Its objectives include preventing workplace injuries, ensuring compliance with legal and industry standards, and fostering a culture of safety, addressing the problem of occupational hazards and environmental risks.

Scope:
This policy applies to all employees, contractors, and visitors of the Company, encompassing all departments, roles, activities, and locations where the company operates.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Health & Safety Policy: A set of guidelines and procedures to ensure a safe and healthy work environment.
• Occupational Hazard: Any condition or activity that poses a risk to employee health or safety.
• Environmental Management: Practices to minimize the company's ecological impact.

References:
• BC Occupational Health and Safety Regulation
• Workers Compensation Act (British Columbia)
• the Company Environmental Policy
• ISO 14001:2015 Environmental Management Systems`
      },
      {
        title: 'Policy Statement',
        content: `the Company is dedicated to providing a safe and healthy workplace for all employees, contractors, and visitors. We commit to complying with all applicable health, safety, and environmental regulations, integrating safety into our operations, and continuously improving our practices to prevent incidents and protect the environment.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Policy Development: Create and document the health and safety policy framework.
• Risk Assessment: Conduct regular hazard identification and risk assessments.
• Implementation: Enforce policy through training and safety protocols.
• Monitoring: Perform ongoing inspections and audits to ensure compliance.
• Review and Update: Periodically review and update the policy based on findings.

Roles & Responsibilities for Each Step:
• Policy Development: Management and HSE team
• Risk Assessment: HSE Representatives and supervisors
• Implementation: All employees and supervisors
• Monitoring: HSE team and safety officers
• Review and Update: Management and HSE Management

Tools, Forms, or Checklists:
• Hazard assessment forms (e.g., FLRA/FLHA)
• Inspection checklists
• Training logs
• Audit reports

Safety/Compliance/Quality Requirements:
Adherence to BC OHS Regulation, ISO 14001 standards, and internal safety protocols during all procedures.

Reporting or Escalation:
Report hazards or incidents to supervisors; escalate unresolved issues to HSE Representatives or management within 24 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
Accountable for developing, funding, and enforcing the health and safety policy, providing necessary resources.

Supervisors:
Ensure team compliance with safety procedures, conduct regular checks, and report hazards.

Staff:
Follow safety protocols, report hazards, and participate in training programs.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
Through monthly safety audits, incident investigations, and annual policy reviews to ensure adherence.

Consequences for Non-Compliance:
Disciplinary actions including warnings, retraining, or termination, with legal action possible for serious breaches.

Reporting Obligations:
All incidents, hazards, or non-compliance issues must be reported to HSE Representatives within 24 hours.`
      }
    ]
  },

  '1028': {
    number: '1028',
    title: 'Personal Protective Equipment Policy',
    category: 'hse',
    description: 'Mandates the use of personal protective equipment (PPE) to mitigate workplace hazards and ensure the safety of all personnel.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC Occupational Health and Safety Regulation (Part 8)', 'Workers Compensation Act', 'CSA Z94.1-15'],
    keywords: ['PPE', 'safety', 'protective equipment', 'hazard', 'helmet', 'gloves', 'safety glasses'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to ensure the safety of all personnel by mandating the use of personal protective equipment (PPE) to mitigate workplace hazards. Its objectives include reducing injury risks, ensuring compliance with safety regulations, and fostering a culture of safety, addressing the problem of exposure to physical, chemical, and biological hazards.

Scope:
This policy applies to all employees, contractors, and visitors working in or visiting company sites where PPE is required, including all operational areas, construction sites, and maintenance zones.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Personal Protective Equipment (PPE): Specialized clothing or equipment (e.g., helmets, gloves, safety glasses) worn to protect against workplace hazards.
• Hazard Assessment: The process of identifying risks requiring PPE use.
• Compliance: Adherence to legal and company safety standards regarding PPE.

References:
• BC Occupational Health and Safety Regulation (Part 8 - Personal Protective Equipment)
• Workers Compensation Act (British Columbia)
• Company Health & Safety Policy
• CSA Z94.1-15 (Industrial Protective Headwear)`
      },
      {
        title: 'Policy Statement',
        content: `The organization requires all employees, contractors, and visitors to use appropriate personal protective equipment as identified through hazard assessments. We are committed to providing, maintaining, and enforcing the use of PPE to ensure a safe working environment and comply with all relevant health and safety regulations.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Hazard Assessment: Conduct site-specific hazard assessments to determine required PPE.
• PPE Provision: Supply appropriate PPE to all personnel based on assessment results.
• Training Session: Conduct training on proper PPE selection, use, and maintenance.
• Inspection Routine: Regularly inspect PPE for wear and ensure proper fit.
• Compliance Check: Monitor and enforce PPE usage during all relevant activities.

Roles & Responsibilities for Each Step:
• Hazard Assessment: HSE Representatives and supervisors
• PPE Provision: Management and procurement team
• Training Session: Training coordinators and HSE Management
• Inspection Routine: Supervisors and safety officers
• Compliance Check: HSE team and site supervisors

Tools, Forms, or Checklists:
• Hazard assessment forms (e.g., FLRA/FLHA)
• PPE inventory logs
• Training attendance sheets
• Inspection checklists

Safety/Compliance/Quality Requirements:
Adherence to BC OHS Regulation Part 8, CSA standards, and internal safety protocols during PPE use and maintenance.

Reporting or Escalation:
Report PPE issues or non-compliance to supervisors; escalate unresolved concerns to HSE Representatives within 24 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Ensure PPE is provided, funded, and integrated into safety programs, holding accountability for compliance.

Supervisors:
• Verify PPE use by teams, conduct inspections, and address non-compliance immediately.

Staff:
• Wear and maintain assigned PPE, report defects, and follow training guidelines.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through daily site inspections, monthly PPE audits, and worker feedback to ensure consistent use and condition.

Consequences for Non-Compliance:
• Verbal warnings, mandatory retraining, or removal from site for failure to wear PPE, with potential termination for repeated violations.

Reporting Obligations:
• All PPE-related incidents or non-compliance must be reported to supervisors within 24 hours.`
      }
    ]
  },

  '1029': {
    number: '1029',
    title: 'Vehicle Safety Policy',
    category: 'hse',
    description: 'Promotes safe operation, maintenance, and use of vehicles to prevent accidents, injuries, and property damage.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC Occupational Health and Safety Regulation (Part 16)', 'Workers Compensation Act', 'CSA Z150-16'],
    keywords: ['vehicle', 'safety', 'driving', 'inspection', 'maintenance', 'spotter', 'fleet'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to promote safe operation, maintenance, and use of vehicles to prevent accidents, injuries, and property damage. Its objectives include ensuring compliance with regulatory standards, reducing vehicle-related risks, and fostering a culture of safe driving, addressing the high incidence of vehicle strikes and collisions in operational environments.

Scope:
This policy applies to all employees, contractors, and authorized drivers operating company vehicles or personal vehicles for business purposes, covering all operational sites, travel routes, and field activities.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Vehicle: Any motorized equipment used for transport, including trucks, vans, heavy machinery, and off-road vehicles.
• Pre-Shift Inspection: A daily visual and functional check of vehicle components to ensure operational safety.
• Spotter: A trained individual responsible for observing and signaling during vehicle maneuvers, such as backing up.

References:
• BC Occupational Health and Safety Regulation (Part 16 - Mobile Equipment)
• Workers Compensation Act (British Columbia), Part 3 - Rights and Responsibilities
• Company Distracted Driving Policy
• CSA Standards (e.g., Z150-16 for forklift safety)
• WorkSafeBC Guidelines on Vehicle Safety`
      },
      {
        title: 'Policy Statement',
        content: `The organization is committed to ensuring the safe operation and maintenance of all vehicles used in our operations. We require all drivers to adhere to regulatory standards, conduct pre-use inspections, and follow safe driving practices to prevent accidents and protect workers, pedestrians, and property.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Pre-Shift Inspection: Perform a daily inspection of vehicle components, including tires, brakes, lights, and safety devices.
• Driver Authorization: Verify driver qualifications, licensing, and training before assigning vehicle use.
• Site Traffic Management: Plan routes to minimize backing, use spotters for maneuvers, and segregate pedestrian and vehicle paths.
• Maintenance Scheduling: Conduct regular scheduled maintenance and immediate repairs for identified defects.
• Incident Reporting: Document and investigate all vehicle incidents or near-misses promptly.

Roles & Responsibilities for Each Step:
• Pre-Shift Inspection: Assigned drivers and operators
• Driver Authorization: Supervisors and HSE Management
• Site Traffic Management: Site supervisors and spotters
• Maintenance Scheduling: Fleet managers and maintenance team
• Incident Reporting: All involved parties, overseen by HSE Representatives

Tools, Forms, or Checklists:
• Vehicle pre-trip inspection checklists
• Driver training logs
• Incident report forms
• Maintenance schedules

Safety/Compliance/Quality Requirements:
Compliance with BC OHS Regulation Part 16, including seat belt usage, restraint systems, and visibility enhancements; adherence to WorkSafeBC guidelines for site traffic.

Reporting or Escalation:
Report defects or incidents immediately to supervisors; escalate serious issues or non-compliance to HSE Representatives or management within 24 hours for investigation.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Provide resources for vehicle maintenance, ensure driver training programs, and enforce policy compliance through audits.

Supervisors:
• Assign qualified drivers, monitor site traffic, and conduct spotter oversight during high-risk maneuvers.

Staff:
• Complete pre-shift inspections, follow safe driving protocols, wear required PPE (e.g., high-visibility vests), and report hazards.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through weekly vehicle inspections, monthly fleet audits, driver performance reviews, and site traffic observations.

Consequences for Non-Compliance:
• Progressive discipline, including warnings, suspension of driving privileges, retraining, or termination, with immediate vehicle removal for unsafe conditions.

Reporting Obligations:
• All vehicle incidents, defects, or near-misses must be reported to HSE Representatives within 24 hours; annual MVR checks required for drivers.`
      }
    ]
  },

  '1030': {
    number: '1030',
    title: 'COVID-19 Policy',
    category: 'hse',
    description: 'Protects the health and safety of all personnel by mitigating the spread of COVID-19 through compliance with public health directives.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC Occupational Health and Safety Regulation (Part 4)', 'Workers Compensation Act', 'BC Public Health Orders'],
    keywords: ['COVID-19', 'pandemic', 'health', 'safety', 'PPE', 'isolation', 'screening'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to protect the health and safety of all personnel by mitigating the spread of COVID-19. Its objectives include ensuring compliance with public health directives, reducing workplace transmission, and supporting a safe return to work, addressing the ongoing challenge of infectious disease control.

Scope:
This policy applies to all employees, contractors, and visitors at company sites, covering all operational areas, offices, and remote work environments where company activities occur.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• COVID-19: A respiratory illness caused by the SARS-CoV-2 virus, subject to ongoing public health measures.
• Self-Isolation: Voluntary or mandated separation of individuals with symptoms or exposure to prevent spread.
• Public Health Directives: Guidelines issued by provincial or federal health authorities (e.g., BC Centre for Disease Control).

References:
• BC Occupational Health and Safety Regulation (Part 4 - General Conditions)
• Workers Compensation Act (British Columbia), Part 3 - Rights and Responsibilities
• Company Health & Safety Policy
• BC Public Health Orders (as updated)`
      },
      {
        title: 'Policy Statement',
        content: `The organization is committed to protecting the health and safety of all employees, contractors, and visitors by implementing measures to prevent the spread of COVID-19. We will comply with current public health directives, provide necessary resources, and promote a safe workplace through education, screening, and response protocols.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Health Screening: Conduct daily symptom checks or temperature screenings at entry points.
• PPE Usage: Require masks and other PPE in high-risk or crowded areas as per health guidelines.
• Sanitization Routine: Ensure regular cleaning and provision of hand sanitizing stations.
• Isolation Protocol: Implement self-isolation for symptomatic or exposed individuals with paid leave.
• Communication Update: Provide ongoing updates on policy changes and health advisories.

Roles & Responsibilities for Each Step:
• Health Screening: Site supervisors and HSE Representatives
• PPE Usage: All employees, supervised by supervisors
• Sanitization Routine: Facilities team and cleaning staff
• Isolation Protocol: HR and management
• Communication Update: HSE Management and leadership team

Tools, Forms, or Checklists:
• Health screening logs
• PPE distribution records
• Cleaning schedules
• Isolation request forms

Safety/Compliance/Quality Requirements:
Adherence to BC Public Health Orders, OHS Regulation Part 4, and internal safety protocols for infectious disease control.

Reporting or Escalation:
Report symptoms or exposures to supervisors; escalate confirmed cases to HSE Representatives or management within 24 hours for contact tracing.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Provide resources for screening, PPE, and cleaning, ensuring compliance with health directives and supporting affected workers.

Supervisors:
• Monitor screening and PPE use, enforce isolation protocols, and report issues promptly.

Staff:
• Participate in screenings, wear required PPE, self-isolate when necessary, and report symptoms immediately.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through daily entry logs, weekly sanitation audits, and employee feedback to ensure adherence to protocols.

Consequences for Non-Compliance:
• Verbal warnings, mandatory retraining, or removal from site for refusal to follow health measures, with termination possible for repeated violations.

Reporting Obligations:
• All symptoms, exposures, or non-compliance must be reported to supervisors within 24 hours.`
      }
    ]
  },

  '1031': {
    number: '1031',
    title: 'Pandemic Disease Policy',
    category: 'hse',
    description: 'Safeguards the health and safety of all personnel during a pandemic disease outbreak by minimizing transmission and ensuring business continuity.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC Occupational Health and Safety Regulation (Part 4)', 'Workers Compensation Act', 'BC Public Health Emergency Guidelines'],
    keywords: ['pandemic', 'disease', 'health', 'safety', 'outbreak', 'continuity', 'contact tracing'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to safeguard the health and safety of all personnel during a pandemic disease outbreak. Its objectives include minimizing transmission, ensuring business continuity, and complying with public health measures, addressing the challenge of managing widespread infectious diseases.

Scope:
This policy applies to all employees, contractors, and visitors at company sites, encompassing all operational areas, offices, and remote work settings during a declared pandemic.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Pandemic Disease: A widespread infectious disease outbreak declared by public health authorities, requiring coordinated response measures.
• Business Continuity: Maintaining critical operations during a pandemic through remote work or adjusted schedules.
• Contact Tracing: Identifying and notifying individuals exposed to a confirmed case.

References:
• BC Occupational Health and Safety Regulation (Part 4 - General Conditions)
• Workers Compensation Act (British Columbia), Part 3 - Rights and Responsibilities
• Company Health & Safety Policy
• BC Public Health Emergency Guidelines`
      },
      {
        title: 'Policy Statement',
        content: `The organization is committed to protecting the health and safety of all employees, contractors, and visitors during a pandemic disease outbreak. We will implement preventive measures, support business continuity, and comply with public health directives to minimize transmission and ensure a safe working environment.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Outbreak Monitoring: Track public health announcements and assess pandemic risks.
• Preparedness Plan: Activate emergency protocols, including remote work and resource allocation.
• Health Measures: Enforce hygiene practices, PPE use, and social distancing as required.
• Contact Tracing: Identify and manage exposure incidents with support from health authorities.
• Policy Review: Update procedures based on evolving pandemic conditions and feedback.

Roles & Responsibilities for Each Step:
• Outbreak Monitoring: HSE Management and leadership team
• Preparedness Plan: Management and HR
• Health Measures: Supervisors and all employees
• Contact Tracing: HSE Representatives and HR
• Policy Review: HSE team and management

Tools, Forms, or Checklists:
• Pandemic response plan
• Exposure tracking forms
• PPE inventory logs
• Hygiene audit checklists

Safety/Compliance/Quality Requirements:
Compliance with BC Public Health Emergency Guidelines, OHS Regulation Part 4, and internal safety protocols during a pandemic.

Reporting or Escalation:
Report symptoms or exposures to supervisors; escalate confirmed cases or issues to HSE Representatives within 24 hours for action.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Develop and fund pandemic response plans, ensure resource availability, and communicate updates to all personnel.

Supervisors:
• Enforce health measures, monitor compliance, and support affected workers with isolation protocols.

Staff:
• Follow hygiene and distancing rules, report symptoms, and participate in contact tracing efforts.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through daily health checks, weekly compliance audits, and feedback surveys during a pandemic to ensure adherence.

Consequences for Non-Compliance:
• Warnings, mandatory retraining, or removal from site for non-adherence, with termination possible for repeated violations.

Reporting Obligations:
• All symptoms, exposures, or non-compliance must be reported to supervisors within 24 hours.`
      }
    ]
  },

  '1032': {
    number: '1032',
    title: 'Open Communication Policy',
    category: 'hse',
    description: 'Encourages transparent and effective communication to enhance safety, resolve issues, and foster a collaborative workplace.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC Occupational Health and Safety Regulation (Part 3)', 'Workers Compensation Act'],
    keywords: ['communication', 'transparency', 'safety', 'reporting', 'retaliation', 'anonymous'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to encourage transparent and effective communication to enhance safety, resolve issues, and foster a collaborative workplace. Its objectives include ensuring all personnel can raise concerns without fear, improving decision-making, and addressing the challenge of communication barriers in high-risk environments.

Scope:
This policy applies to all employees, contractors, and visitors, covering all departments, roles, activities, and locations where company operations occur.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Open Communication: A culture where all personnel can freely report safety concerns, suggestions, or issues without retaliation.
• Retaliation: Any adverse action against an individual for raising a concern or exercising their rights.
• Anonymous Reporting: A method allowing concerns to be submitted without disclosing the reporter's identity.

References:
• BC Occupational Health and Safety Regulation (Part 3 - Rights and Responsibilities)
• Workers Compensation Act (British Columbia), Part 3 - Worker Rights
• Company Harassment & Violence Policy
• Company Health & Safety Policy`
      },
      {
        title: 'Policy Statement',
        content: `The organization is committed to maintaining an open communication environment where all employees, contractors, and visitors can raise health, safety, or workplace concerns without fear of reprisal. We encourage proactive dialogue, provide accessible reporting channels, and ensure timely responses to foster a collaborative and safe workplace.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Awareness Training: Conduct initial and ongoing training on communication rights and channels.
• Concern Submission: Provide multiple reporting options, including direct supervisors and anonymous hotlines.
• Issue Investigation: Promptly investigate all reported concerns with impartiality.
• Feedback Provision: Communicate outcomes and actions taken back to the reporter where possible.
• Policy Evaluation: Regularly review the policy's effectiveness based on feedback and incident data.

Roles & Responsibilities for Each Step:
• Awareness Training: Training coordinators and HSE Management
• Concern Submission: All employees, supported by supervisors
• Issue Investigation: HSE Representatives and management
• Feedback Provision: HSE team and supervisors
• Policy Evaluation: Management and HSE Management

Tools, Forms, or Checklists:
• Training attendance logs
• Concern report forms
• Investigation checklists
• Feedback survey templates

Safety/Compliance/Quality Requirements:
Adherence to BC OHS Regulation Part 3, ensuring no retaliation and maintaining confidentiality as per legal standards.

Reporting or Escalation:
Report concerns to supervisors or via anonymous channels; escalate unresolved issues to HSE Representatives within 48 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Establish communication channels, protect against retaliation, and ensure policy enforcement.

Supervisors:
• Facilitate open dialogue, receive reports, and escalate issues as needed without prejudice.

Staff:
• Actively participate by reporting concerns, attending training, and supporting a transparent culture.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through quarterly reviews of concern reports, training completion rates, and employee surveys to assess effectiveness.

Consequences for Non-Compliance:
• Disciplinary actions including warnings or termination for retaliation, with retraining mandated for policy breaches.

Reporting Obligations:
• All concerns or incidents of retaliation must be reported to HSE Representatives within 48 hours.`
      }
    ]
  },

  '1033': {
    number: '1033',
    title: 'Drug & Alcohol Policy',
    category: 'hse',
    description: 'Ensures a safe and productive workplace by preventing the use, possession, or distribution of drugs and alcohol that could impair performance or safety.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC Occupational Health and Safety Regulation (Part 4)', 'Workers Compensation Act', 'WorkSafeBC Guidelines'],
    keywords: ['drug', 'alcohol', 'impairment', 'testing', 'safety', 'rehabilitation', 'workplace'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to ensure a safe and productive workplace by preventing the use, possession, or distribution of drugs and alcohol that could impair performance or safety. Its objectives include reducing workplace accidents, ensuring compliance with legal standards, and supporting affected individuals, addressing the risks posed by substance-related impairment.

Scope:
This policy applies to all employees, contractors, and visitors at company sites, covering all work hours, company premises, vehicles, and business-related activities.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Impairment: A state where drug or alcohol use affects an individual's ability to perform work safely.
• Random Testing: Unannounced drug and alcohol screening conducted on a periodic basis.
• Rehabilitation Program: A structured support plan for employees seeking assistance with substance issues.

References:
• BC Occupational Health and Safety Regulation (Part 4 - General Conditions)
• Workers Compensation Act (British Columbia), Part 3 - Rights and Responsibilities
• Company Health & Safety Policy
• WorkSafeBC Guidelines on Substance Use in the Workplace`
      },
      {
        title: 'Policy Statement',
        content: `The organization prohibits the use, possession, or distribution of drugs and alcohol during work hours or on company premises. We are committed to maintaining a drug- and alcohol-free workplace, providing support for rehabilitation, and enforcing testing to ensure safety and compliance with all applicable regulations.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Awareness Training: Conduct initial and annual training on policy requirements and support options.
• Testing Protocol: Implement random, post-incident, and reasonable suspicion drug and alcohol testing.
• Violation Reporting: Require immediate reporting of suspected violations by any personnel.
• Intervention Support: Offer confidential assistance and referral to rehabilitation programs for affected employees.
• Compliance Review: Regularly audit testing records and policy adherence.

Roles & Responsibilities for Each Step:
• Awareness Training: Training coordinators and HSE Management
• Testing Protocol: HSE Representatives and designated testing officers
• Violation Reporting: All employees and supervisors
• Intervention Support: HR and management
• Compliance Review: HSE team and management

Tools, Forms, or Checklists:
• Training attendance logs
• Testing consent forms
• Violation report templates
• Audit checklists

Safety/Compliance/Quality Requirements:
Adherence to BC OHS Regulation Part 4, WorkSafeBC guidelines, and privacy laws during testing and support processes.

Reporting or Escalation:
Report violations or concerns to supervisors; escalate confirmed cases to HSE Representatives or management within 24 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Develop and fund the policy, provide testing resources, and support rehabilitation efforts.

Supervisors:
• Monitor for signs of impairment, conduct initial investigations, and report violations.

Staff:
• Comply with the policy, report suspected violations, and seek help if needed without fear of reprisal.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through random testing records, incident reviews, and annual policy audits to ensure adherence.

Consequences for Non-Compliance:
• Immediate suspension pending investigation, mandatory rehabilitation, or termination for confirmed violations, with legal action possible for distribution.

Reporting Obligations:
• All suspected impairments or violations must be reported to supervisors within 24 hours.`
      }
    ]
  },

  '1034': {
    number: '1034',
    title: 'Refuse Unsafe Work Policy',
    category: 'hse',
    description: 'Empowers workers to refuse unsafe work without fear of reprisal, ensuring a safe workplace and compliance with legal rights.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC Workers Compensation Act (Part 3, Division 4)', 'BC Occupational Health and Safety Regulation (Section 3.12)', 'WorkSafeBC Guidelines'],
    keywords: ['refuse', 'unsafe work', 'safety', 'rights', 'hazard', 'retaliation', 'investigation'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to empower workers to refuse unsafe work without fear of reprisal, ensuring a safe workplace. Its objectives include protecting workers from hazards, complying with legal rights, and addressing the challenge of unrecognized or uncontrolled workplace risks.

Scope:
This policy applies to all employees, covering all work sites, tasks, and activities where safety concerns may arise.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Refusal of Unsafe Work: The legal right of a worker to refuse a task they believe poses an imminent danger to their health or safety.
• Imminent Danger: A condition or practice that could cause immediate serious injury or death.
• Retaliation: Any adverse action taken against a worker for exercising their right to refuse unsafe work.

References:
• BC Workers Compensation Act (Part 3, Division 4 - Right to Refuse Unsafe Work)
• BC Occupational Health and Safety Regulation (Section 3.12 - Refusal of Unsafe Work)
• Company Health & Safety Policy
• WorkSafeBC Guidelines on Worker Rights`
      },
      {
        title: 'Policy Statement',
        content: `The organization recognizes and supports the right of all employees to refuse unsafe work when they have reasonable cause to believe it poses an imminent danger. We are committed to investigating refusals promptly, ensuring no retaliation, and implementing corrective measures to maintain a safe working environment.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Initial Refusal: Worker notifies their supervisor of the unsafe condition and refuses the task.
• Immediate Assessment: Supervisor assesses the situation and consults with the worker.
• Investigation Process: HSE Representative investigates the reported hazard with worker input.
• Resolution Action: Implement corrective measures or confirm work can resume safely.
• Documentation Update: Record the refusal, investigation, and resolution in company records.

Roles & Responsibilities for Each Step:
• Initial Refusal: Worker
• Immediate Assessment: Supervisor
• Investigation Process: HSE Representative and supervisor
• Resolution Action: HSE team and management
• Documentation Update: HSE Representative and HR

Tools, Forms, or Checklists:
• Refusal report form
• Hazard assessment checklist (e.g., FLRA/FLHA)
• Investigation log
• Resolution record

Safety/Compliance/Quality Requirements:
Adherence to BC Workers Compensation Act Part 3 and OHS Regulation Section 3.12, ensuring thorough investigation and no retaliation.

Reporting or Escalation:
Worker reports refusal to supervisor; escalate unresolved issues to HSE Representatives or WorkSafeBC within 24 hours if necessary.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Ensure policy awareness, provide resources for investigations, and protect against retaliation.

Supervisors:
• Receive refusals, conduct initial assessments, and escalate to HSE as needed.

Staff:
• Exercise their right to refuse unsafe work, provide details to support their concern, and cooperate with investigations.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through monthly reviews of refusal reports, training records, and worker feedback to ensure policy adherence.

Consequences for Non-Compliance:
• Disciplinary action against supervisors or management for retaliation, with retraining mandated for policy breaches.

Reporting Obligations:
• All refusals and investigation outcomes must be reported to HSE Representatives within 24 hours.`
      }
    ]
  },

  '1035': {
    number: '1035',
    title: 'Harassment & Violence Policy',
    category: 'hse',
    description: 'Prevents and addresses harassment and violence in the workplace, ensuring a respectful and safe environment for all personnel.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC Workers Compensation Act (Part 3, Division 4)', 'BC Occupational Health and Safety Regulation (Section 4.27)', 'WorkSafeBC Guidelines'],
    keywords: ['harassment', 'violence', 'safety', 'workplace', 'respect', 'investigation', 'support'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to prevent and address harassment and violence in the workplace, ensuring a respectful and safe environment. Its objectives include protecting all personnel from abuse, complying with legal obligations, and fostering a supportive environment, addressing the challenge of workplace misconduct and safety risks.

Scope:
This policy applies to all employees, contractors, and visitors, covering all work sites, company events, and business-related interactions.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Harassment: Unwelcome conduct, including verbal, physical, or psychological actions, that creates a hostile work environment.
• Violence: Any physical force or threat that causes or is likely to cause harm.
• Workplace: All locations where company business is conducted, including remote work settings.

References:
• BC Workers Compensation Act (Part 3, Division 4 - Violence in the Workplace)
• BC Occupational Health and Safety Regulation (Section 4.27 - Violence in the Workplace)
• Company Health & Safety Policy
• WorkSafeBC Guidelines on Workplace Violence Prevention`
      },
      {
        title: 'Policy Statement',
        content: `The organization is committed to maintaining a workplace free from harassment and violence. We prohibit any form of misconduct, provide support for those affected, and ensure prompt investigation and resolution of incidents, while complying with all relevant health and safety regulations.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Awareness Training: Conduct initial and ongoing training on recognizing and reporting harassment and violence.
• Incident Reporting: Provide confidential channels for reporting incidents to supervisors or HR.
• Investigation Process: Conduct impartial investigations into reported incidents with documented findings.
• Support Provision: Offer resources, including counseling, to affected individuals.
• Policy Review: Evaluate and update the policy based on incident trends and feedback.

Roles & Responsibilities for Each Step:
• Awareness Training: Training coordinators and HSE Management
• Incident Reporting: All employees, supported by supervisors
• Investigation Process: HR and HSE Representatives
• Support Provision: HR and management
• Policy Review: Management and HSE team

Tools, Forms, or Checklists:
• Training attendance logs
• Incident report forms
• Investigation checklists
• Support resource lists

Safety/Compliance/Quality Requirements:
Adherence to BC Workers Compensation Act Part 3 and OHS Regulation Section 4.27, ensuring confidentiality and fairness in all proceedings.

Reporting or Escalation:
Report incidents to supervisors or HR; escalate unresolved cases to HSE Representatives within 48 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Develop and enforce the policy, provide resources, and ensure no retaliation against reporters.

Supervisors:
• Receive reports, initiate investigations, and support affected workers.

Staff:
• Report incidents, participate in training, and contribute to a respectful workplace.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through quarterly reviews of incident reports, training records, and employee surveys to ensure policy effectiveness.

Consequences for Non-Compliance:
• Disciplinary actions including warnings, suspension, or termination for perpetrators, with retraining for policy breaches.

Reporting Obligations:
• All incidents of harassment or violence must be reported to HR or HSE Representatives within 48 hours.`
      }
    ]
  },

  '1036': {
    number: '1036',
    title: 'Environmental Policy',
    category: 'hse',
    description: 'Integrates health, safety, and environmental principles to minimize environmental impact and ensure worker safety.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC Environmental Management Act', 'BC Occupational Health and Safety Regulation (Part 4)', 'ISO 14001:2015'],
    keywords: ['environmental', 'HSE', 'sustainability', 'pollution', 'compliance', 'impact', 'waste'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to integrate health, safety, and environmental (HSE) principles to minimize environmental impact and ensure worker safety. Its objectives include complying with regulations, reducing ecological harm, and fostering sustainable practices, addressing challenges like pollution and resource depletion.

Scope:
This policy applies to all employees, contractors, and visitors, covering all operational sites, projects, and activities that affect health, safety, or the environment.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• HSE: Health, Safety, and Environmental management framework to protect workers and the ecosystem.
• Environmental Impact: Any effect on air, water, soil, or biodiversity from company operations.
• Sustainable Practice: Methods that meet current needs without compromising future resources.

References:
• BC Environmental Management Act
• BC Occupational Health and Safety Regulation (Part 4 - General Conditions)
• Company Health & Safety Policy
• ISO 14001:2015 Environmental Management Systems`
      },
      {
        title: 'Policy Statement',
        content: `The organization is dedicated to integrating health, safety, and environmental stewardship into all operations. We commit to complying with applicable laws, minimizing our environmental footprint, promoting sustainable practices, and ensuring the well-being of all personnel through proactive HSE management.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Environmental Assessment: Conduct initial and periodic assessments of environmental risks at all sites.
• Safety Integration: Incorporate safety protocols with environmental controls in daily operations.
• Waste Management: Implement recycling, reduction, and proper disposal practices.
• Training Program: Provide ongoing HSE training for all personnel.
• Compliance Audit: Perform regular audits to ensure adherence to HSE standards.

Roles & Responsibilities for Each Step:
• Environmental Assessment: HSE Representatives and environmental officers
• Safety Integration: Supervisors and safety officers
• Waste Management: Facilities team and project managers
• Training Program: Training coordinators and HSE Management
• Compliance Audit: HSE team and external auditors

Tools, Forms, or Checklists:
• Environmental impact assessment forms
• Safety checklists
• Waste tracking logs
• Training records
• Audit reports

Safety/Compliance/Quality Requirements:
Adherence to BC Environmental Management Act, OHS Regulation Part 4, and ISO 14001 standards during all procedures.

Reporting or Escalation:
Report environmental or safety issues to supervisors; escalate unresolved concerns to HSE Representatives within 24 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Oversee HSE policy development, allocate resources, and ensure compliance with environmental laws.

Supervisors:
• Monitor site compliance, enforce safety and environmental practices, and report issues.

Staff:
• Follow HSE protocols, report hazards or spills, and participate in training.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through monthly environmental audits, safety inspections, and annual HSE performance reviews.

Consequences for Non-Compliance:
• Warnings, retraining, or termination for violations, with legal action possible for significant environmental breaches.

Reporting Obligations:
• All incidents, spills, or non-compliance must be reported to HSE Representatives within 24 hours.`
      }
    ]
  },

  '1037': {
    number: '1037',
    title: 'Security Policy',
    category: 'hse',
    description: 'Protects the physical and information assets from unauthorized access, theft, or damage.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC Personal Information Protection Act (PIPA)', 'BC Occupational Health and Safety Regulation (Part 4)', 'ISO/IEC 27001:2013'],
    keywords: ['security', 'access control', 'cybersecurity', 'breach', 'data', 'protection', 'assets'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to protect the physical and information assets from unauthorized access, theft, or damage. Its objectives include ensuring a secure workplace, complying with legal standards, and mitigating security risks, addressing challenges like data breaches and physical intrusions.

Scope:
This policy applies to all employees, contractors, and visitors, covering all company premises, vehicles, equipment, and digital systems used for business purposes.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Security Breach: Unauthorized access to or disclosure of sensitive information or physical assets.
• Access Control: Measures to restrict entry to authorized personnel only.
• Cybersecurity: Protection of digital systems from threats like hacking or malware.

References:
• BC Personal Information Protection Act (PIPA)
• BC Occupational Health and Safety Regulation (Part 4 - General Conditions)
• Company Health & Safety Policy
• ISO/IEC 27001:2013 Information Security Management`
      },
      {
        title: 'Policy Statement',
        content: `The organization is committed to maintaining a secure environment for all personnel, assets, and information. We prohibit unauthorized access or misuse of company resources, enforce robust security measures, and ensure compliance with applicable laws to safeguard our operations and data.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Access Management: Issue and monitor access credentials for physical and digital systems.
• Security Training: Conduct initial and periodic training on security protocols.
• Incident Reporting: Require immediate reporting of security breaches or suspicious activities.
• System Monitoring: Implement surveillance and cybersecurity monitoring tools.
• Policy Review: Regularly assess and update security measures based on incidents and audits.

Roles & Responsibilities for Each Step:
• Access Management: IT department and site supervisors
• Security Training: Training coordinators and HSE Management
• Incident Reporting: All employees and contractors
• System Monitoring: IT and security teams
• Policy Review: Management and HSE team

Tools, Forms, or Checklists:
• Access log sheets
• Training attendance records
• Incident report forms
• Monitoring dashboards
• Audit checklists

Safety/Compliance/Quality Requirements:
Adherence to BC PIPA, OHS Regulation Part 4, and ISO/IEC 27001 standards during all security processes.

Reporting or Escalation:
Report incidents to supervisors or IT; escalate serious breaches to HSE Representatives or management within 24 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Develop and fund security measures, ensure policy enforcement, and provide training resources.

Supervisors:
• Monitor access compliance, respond to initial reports, and escalate as needed.

Staff:
• Follow security protocols, report breaches, and safeguard assigned credentials.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through weekly access reviews, monthly security audits, and incident tracking to ensure adherence.

Consequences for Non-Compliance:
• Warnings, suspension, or termination for breaches, with legal action possible for intentional violations.

Reporting Obligations:
• All security incidents or non-compliance must be reported to supervisors within 24 hours.`
      }
    ]
  },

  '1038': {
    number: '1038',
    title: 'Waste Disposal Policy',
    category: 'hse',
    description: 'Manages waste disposal responsibly, minimizing environmental impact and ensuring compliance with regulations.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC Environmental Management Act', 'BC Occupational Health and Safety Regulation (Part 5)', 'Waste Discharge Regulation'],
    keywords: ['waste', 'disposal', 'recycling', 'hazardous', 'environment', 'segregation', 'compliance'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to manage waste disposal responsibly, minimizing environmental impact and ensuring compliance with regulations. Its objectives include promoting recycling, reducing landfill waste, and preventing pollution, addressing the challenge of improper waste handling in operational activities.

Scope:
This policy applies to all employees, contractors, and visitors, covering all work sites, projects, and activities generating waste.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Waste: Any material discarded from operations, including hazardous and non-hazardous substances.
• Recycling: The process of converting waste into reusable materials.
• Hazardous Waste: Materials that pose a risk to health or the environment, requiring special disposal.

References:
• BC Environmental Management Act
• BC Occupational Health and Safety Regulation (Part 5 - Chemical Agents and Biological Agents)
• Company HSE Environmental Policy
• Waste Discharge Regulation (British Columbia)`
      },
      {
        title: 'Policy Statement',
        content: `The organization is committed to managing waste responsibly to protect the environment and comply with all applicable laws. We encourage waste reduction, promote recycling, and ensure proper disposal of hazardous materials to maintain a sustainable and safe workplace.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Waste Identification: Categorize waste as hazardous or non-hazardous during operations.
• Segregation Process: Separate waste into designated bins for recycling, compost, and disposal.
• Disposal Coordination: Arrange for licensed contractors to handle hazardous waste removal.
• Training Session: Provide initial and ongoing training on waste management practices.
• Compliance Audit: Conduct regular audits to verify adherence to disposal protocols.

Roles & Responsibilities for Each Step:
• Waste Identification: Project managers and supervisors
• Segregation Process: All employees and contractors
• Disposal Coordination: Facilities team and HSE Representatives
• Training Session: Training coordinators and HSE Management
• Compliance Audit: HSE team and environmental officers

Tools, Forms, or Checklists:
• Waste classification forms
• Segregation bin labels
• Disposal manifests
• Training logs
• Audit checklists

Safety/Compliance/Quality Requirements:
Adherence to BC Environmental Management Act, OHS Regulation Part 5, and Waste Discharge Regulation during all waste handling.

Reporting or Escalation:
Report waste issues or spills to supervisors; escalate non-compliance to HSE Representatives within 24 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Oversee waste management programs, provide resources, and ensure regulatory compliance.

Supervisors:
• Monitor waste segregation, enforce procedures, and report violations.

Staff:
• Follow waste disposal protocols, segregate materials, and report hazards.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through weekly waste audits, disposal records review, and employee feedback to ensure adherence.

Consequences for Non-Compliance:
• Warnings, retraining, or termination for improper disposal, with legal action possible for hazardous waste violations.

Reporting Obligations:
• All waste incidents or non-compliance must be reported to HSE Representatives within 24 hours.`
      }
    ]
  },

  '1039': {
    number: '1039',
    title: 'Fatigue Management Policy',
    category: 'hse',
    description: 'Prevents fatigue-related incidents by managing work hours and promoting well-being for all personnel.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC Occupational Health and Safety Regulation (Section 4.43)', 'Workers Compensation Act', 'WorkSafeBC Guidelines'],
    keywords: ['fatigue', 'work hours', 'rest', 'safety', 'scheduling', 'breaks', 'well-being'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to prevent fatigue-related incidents by managing work hours and promoting well-being. Its objectives include reducing errors, ensuring safety compliance, and supporting healthy work-life balance, addressing the challenge of fatigue in high-risk operational environments.

Scope:
This policy applies to all employees, contractors, and supervisors, covering all work sites, shifts, and activities where fatigue may impact performance.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Fatigue: A state of physical or mental exhaustion that reduces a worker's ability to perform safely.
• Work Hour Limits: Maximum allowable hours per shift or week to prevent fatigue.
• Rest Break: Scheduled downtime to allow recovery from work demands.

References:
• BC Occupational Health and Safety Regulation (Section 4.43 - Fatigue Management)
• Workers Compensation Act (British Columbia), Part 3 - Rights and Responsibilities
• Company Health & Safety Policy
• WorkSafeBC Guidelines on Fatigue Management`
      },
      {
        title: 'Policy Statement',
        content: `The organization is committed to managing fatigue to ensure the safety and health of all personnel. We enforce work hour limits, provide rest breaks, and encourage reporting of fatigue symptoms, while complying with all relevant health and safety regulations.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Work Scheduling: Establish shift schedules adhering to maximum hour limits (e.g., 12 hours per shift, 60 hours per week).
• Fatigue Monitoring: Train supervisors to recognize fatigue signs and conduct regular check-ins.
• Rest Breaks: Mandate and enforce scheduled breaks (e.g., 30 minutes every 5 hours).
• Reporting Process: Allow workers to report fatigue concerns without reprisal.
• Review Adjustment: Assess and adjust schedules based on fatigue incident data.

Roles & Responsibilities for Each Step:
• Work Scheduling: Management and HR
• Fatigue Monitoring: Supervisors and HSE Representatives
• Rest Breaks: All employees, monitored by supervisors
• Reporting Process: All employees, supported by supervisors
• Review Adjustment: HSE team and management

Tools, Forms, or Checklists:
• Shift schedules
• Fatigue observation checklists
• Break log sheets
• Incident report forms
• Review records

Safety/Compliance/Quality Requirements:
Adherence to BC OHS Regulation Section 4.43 and WorkSafeBC fatigue guidelines during scheduling and monitoring.

Reporting or Escalation:
Report fatigue concerns to supervisors; escalate persistent issues to HSE Representatives within 24 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Develop schedules, provide training, and ensure compliance with fatigue limits.

Supervisors:
• Monitor worker fatigue, enforce breaks, and report concerns to management.

Staff:
• Adhere to schedules, take required breaks, and report fatigue symptoms promptly.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through weekly schedule reviews, fatigue incident logs, and employee feedback to ensure adherence.

Consequences for Non-Compliance:
• Warnings, schedule adjustments, or disciplinary action for exceeding limits, with retraining for supervisors failing to enforce.

Reporting Obligations:
• All fatigue incidents or non-compliance must be reported to supervisors within 24 hours.`
      }
    ]
  },

  // ============================================
  // HSE POLICIES (1040-1053)
  // ============================================

  '1040': {
    number: '1040',
    title: 'HSE - Company Rules',
    category: 'hse',
    description: 'Outlines the general rules at the Company to ensure a safe, productive, and respectful workplace.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC Occupational Health and Safety Regulation (Part 4)', 'Workers Compensation Act (BC) Part 3'],
    keywords: ['company rules', 'conduct', 'compliance', 'safety', 'workplace', 'misconduct'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This document outlines the general rules at the Company to ensure a safe, productive, and respectful workplace. Its objectives include maintaining order, promoting professionalism, and ensuring compliance with legal and company standards, addressing issues like misconduct and safety violations.

Scope:
These rules apply to all employees, contractors, and visitors at the Company, covering all work sites, company events, and business-related activities.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Misconduct: Behavior that violates company standards, including insubordination or harassment.
• Compliance: Adherence to company rules, policies, and applicable laws.
• Workplace: All locations where company business is conducted, including remote settings.

References:
• BC Occupational Health and Safety Regulation (Part 4 - General Conditions)
• Workers Compensation Act (British Columbia), Part 3 - Rights and Responsibilities
• the Company Health & Safety Policy
• the Company Harassment & Violence Policy`
      },
      {
        title: 'Policy Statement',
        content: `the Company expects all personnel to adhere to these company rules to maintain a safe, respectful, and efficient workplace. Violations will be addressed through appropriate disciplinary actions, with a commitment to fairness and compliance with all legal obligations.

Company Rules:
• General Conduct: Treat all personnel with respect; no harassment, bullying, or discrimination.
• Safety Compliance: Wear required PPE, follow safety procedures, and report hazards immediately.
• Work Hours: Adhere to scheduled shifts and take mandated rest breaks.
• Substance Use: No use, possession, or distribution of drugs or alcohol during work hours.
• Property Use: Use company equipment and resources only for authorized purposes.
• Confidentiality: Protect sensitive company information and client data.
• Attendance: Arrive on time and notify supervisors of absences in advance.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Rule Distribution:
• Provide all personnel with a copy of the company rules during onboarding.

Training Session:
• Conduct training to explain rules and their importance.

Violation Reporting:
• Require immediate reporting of rule breaches by any individual.

Investigation Process:
• Investigate reported violations with documented findings.

Enforcement Action:
• Apply disciplinary measures based on the severity of the breach.

Roles & Responsibilities for Each Step:
• Rule Distribution: HR and supervisors
• Training Session: Training coordinators and HSE Management
• Violation Reporting: All employees and contractors
• Investigation Process: HR and management
• Enforcement Action: Management and HR

Tools, Forms, or Checklists:
• Rule acknowledgment forms
• Training attendance logs
• Incident report templates
• Investigation checklists
• Disciplinary records

Safety/Compliance/Quality Requirements:
Adherence to BC OHS Regulation Part 4 and internal policies during rule enforcement and training.

Reporting or Escalation:
Report violations to supervisors; escalate unresolved issues to HR or management within 48 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Develop, distribute, and enforce rules, ensuring resources for training and compliance.

Supervisors:
• Monitor adherence, receive reports, and initiate investigations.

Staff:
• Follow rules, report violations, and participate in training.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through monthly rule audits, incident reviews, and employee feedback to ensure adherence.

Consequences for Non-Compliance:
• Verbal warnings, written reprimands, suspension, or termination based on violation severity.

Reporting Obligations:
• All rule breaches must be reported to supervisors within 48 hours.`
      }
    ]
  },

  '1041': {
    number: '1041',
    title: 'HSE - General Safety Rules',
    category: 'hse',
    description: 'Establishes general safety rules at the Company to prevent workplace injuries and ensure a safe environment.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC Occupational Health and Safety Regulation (Part 4)', 'Workers Compensation Act (BC) Part 3'],
    keywords: ['safety rules', 'PPE', 'hazard', 'workplace safety', 'emergency', 'compliance'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This document establishes general safety rules at the Company to prevent workplace injuries and ensure a safe environment. Its objectives include promoting awareness, ensuring compliance with safety standards, and addressing hazards across all operations.

Scope:
These rules apply to all employees, contractors, and visitors at the Company, covering all work sites, tasks, and activities.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Hazard: Any condition or activity with the potential to cause injury or illness.
• Personal Protective Equipment (PPE): Gear such as helmets, gloves, and safety glasses to protect workers.
• Safety Compliance: Adherence to established safety protocols and regulations.

References:
• BC Occupational Health and Safety Regulation (Part 4 - General Conditions)
• Workers Compensation Act (British Columbia), Part 3 - Rights and Responsibilities
• the Company Health & Safety Policy`
      },
      {
        title: 'Policy Statement',
        content: `the Company requires all personnel to follow these general safety rules to maintain a safe workplace. Compliance is mandatory, and violations will be addressed to protect the health and safety of everyone on site.

General Safety Rules:
• PPE Usage: Wear required PPE (e.g., hard hats, safety boots) at all times in designated areas.
• Hazard Awareness: Report unsafe conditions, equipment, or behaviors immediately.
• Equipment Operation: Use machinery and tools only with proper training and authorization.
• Housekeeping: Keep work areas clean, organized, and free of clutter.
• Emergency Preparedness: Know and follow evacuation and emergency procedures.
• No Horseplay: Prohibit running, fighting, or other unsafe behaviors on site.
• Substance Prohibition: Avoid working under the influence of drugs or alcohol.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Rule Orientation:
• Provide safety rule training during onboarding and refresher sessions.

Hazard Reporting:
• Require immediate reporting of unsafe conditions or behaviors.

PPE Enforcement:
• Ensure proper use and maintenance of required PPE.

Safety Inspections:
• Conduct regular site inspections to verify rule adherence.

Incident Response:
• Investigate and document all safety incidents promptly.

Roles & Responsibilities for Each Step:
• Rule Orientation: Training coordinators and HSE Management
• Hazard Reporting: All employees and contractors
• PPE Enforcement: Supervisors and safety officers
• Safety Inspections: HSE Representatives and supervisors
• Incident Response: HSE team and management

Tools, Forms, or Checklists:
• Training attendance logs
• Hazard report forms
• PPE inspection checklists
• Site inspection records
• Incident reports

Safety/Compliance/Quality Requirements:
Adherence to BC OHS Regulation Part 4 and internal safety protocols during all activities.

Reporting or Escalation:
Report hazards or incidents to supervisors; escalate unresolved issues to HSE Representatives within 24 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Develop and enforce safety rules, provide training resources, and ensure compliance.

Supervisors:
• Monitor rule adherence, conduct inspections, and respond to reports.

Staff:
• Follow safety rules, wear PPE, and report hazards or violations.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through daily safety checks, monthly audits, and incident reviews to ensure adherence.

Consequences for Non-Compliance:
• Verbal warnings, retraining, suspension, or termination based on violation severity.

Reporting Obligations:
• All safety incidents or non-compliance must be reported to supervisors within 24 hours.`
      }
    ]
  },

  '1042': {
    number: '1042',
    title: 'HSE - Grounds for Dismissal',
    category: 'hse',
    description: 'Outlines the grounds for dismissal at the Company to maintain a safe and productive workplace.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC Employment Standards Act', 'Workers Compensation Act (BC) Part 3'],
    keywords: ['dismissal', 'termination', 'misconduct', 'discipline', 'performance', 'violations'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This document outlines the grounds for dismissal at the Company to maintain a safe and productive workplace. Its objectives include ensuring fair enforcement, complying with legal standards, and addressing serious misconduct or performance issues.

Scope:
This policy applies to all employees at the Company, covering all work sites, shifts, and business-related activities.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Dismissal: The termination of employment due to serious misconduct or repeated policy violations.
• Misconduct: Intentional or negligent behavior that violates company rules or laws.
• Progressive Discipline: A process of warnings and corrective actions before dismissal.

References:
• BC Employment Standards Act
• BC Workers Compensation Act (Part 3 - Rights and Responsibilities)
• the Company Company Rules
• the Company Harassment & Violence Policy`
      },
      {
        title: 'Policy Statement',
        content: `the Company may dismiss employees for serious or repeated violations of company policies, legal obligations, or performance standards. Dismissal will follow a fair process, including investigation and documentation, while adhering to applicable employment laws.

Grounds for Dismissal:

Serious Misconduct:
• Physical violence or threats
• Theft or fraud
• Possession or distribution of illegal substances

Repeated Violations:
• Failure to follow safety rules after warnings
• Chronic absenteeism or tardiness
• Harassment or discrimination after corrective action

Performance Issues:
• Consistent failure to meet job standards despite training
• Gross negligence leading to safety incidents

Legal Violations:
• Conviction of a crime affecting workplace safety or trust
• Breach of confidentiality agreements`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Incident Identification:
• Document alleged violations or performance issues.

Investigation Process:
• Conduct a thorough and impartial investigation.

Notification Meeting:
• Inform the employee of the issue and allow a response.

Decision Review:
• Assess findings and determine appropriate action.

Termination Execution:
• Issue formal dismissal notice with required documentation.

Roles & Responsibilities for Each Step:
• Incident Identification: Supervisors and HR
• Investigation Process: HR and management
• Notification Meeting: HR and supervisor
• Decision Review: Management and HR
• Termination Execution: HR

Tools, Forms, or Checklists:
• Incident report forms
• Investigation logs
• Employee response records
• Decision documentation
• Termination letters

Safety/Compliance/Quality Requirements:
Adherence to BC Employment Standards Act and internal policies during all dismissal proceedings.

Reporting or Escalation:
Report incidents to supervisors; escalate complex cases to HR or management within 48 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Oversee dismissal processes, ensure legal compliance, and provide final approval.

Supervisors:
• Identify and report violations, participate in investigations.

HR:
• Conduct investigations, document proceedings, and execute terminations.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through review of dismissal records, employee feedback, and legal compliance audits.

Consequences for Non-Compliance:
• Corrective action for procedural errors, with potential legal review for unfair dismissals.

Reporting Obligations:
• All dismissal-related incidents must be reported to HR within 48 hours.`
      }
    ]
  },

  '1043': {
    number: '1043',
    title: 'HSE - Public & Visitors Policy',
    category: 'hse',
    description: 'Ensures the safety and security of the public and visitors at the Company sites while protecting company operations.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC Occupational Health and Safety Regulation (Part 4)', 'Workers Compensation Act (BC) Part 3'],
    keywords: ['visitors', 'public', 'access control', 'safety', 'security', 'sign-in'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to ensure the safety and security of the public and visitors at the Company sites while protecting company operations. Its objectives include managing access, ensuring compliance with safety standards, and addressing risks posed by external individuals.

Scope:
This policy applies to all members of the public and visitors at the Company work sites, covering all operational areas and company premises.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Visitor: Any individual not employed by the Company entering company premises, including clients, contractors' guests, or delivery personnel.
• Public: Individuals accessing company property for non-business purposes (e.g., community members near sites).
• Access Control: Procedures to restrict entry to authorized individuals only.

References:
• BC Occupational Health and Safety Regulation (Part 4 - General Conditions)
• Workers Compensation Act (British Columbia), Part 3 - Rights and Responsibilities
• the Company Health & Safety Policy
• the Company Security Policy`
      },
      {
        title: 'Policy Statement',
        content: `the Company requires all visitors and members of the public to adhere to safety and security protocols when on company premises. We are committed to providing a safe environment, managing access effectively, and complying with all relevant regulations.

Public & Visitors Rules:
• Sign-In Requirement: All visitors must register upon arrival and wear a visitor badge.
• Safety Compliance: Follow all safety rules, including wearing required PPE in designated areas.
• Restricted Access: Enter only authorized zones, accompanied by an employee if needed.
• No Interference: Avoid disrupting operations or handling equipment.
• Emergency Procedures: Follow site evacuation and emergency protocols if announced.
• Prohibited Items: No weapons, alcohol, or unauthorized substances allowed.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Pre-Entry Registration:
• Require all visitors to sign in and provide identification at designated points.

Safety Briefing:
• Provide a brief orientation on site safety rules and hazards.

Access Restriction:
• Limit visitors to authorized areas with an escort if necessary.

Monitoring Process:
• Supervise visitor activities and ensure compliance with rules.

Departure Check:
• Verify all visitors sign out upon leaving the premises.

Roles & Responsibilities for Each Step:
• Pre-Entry Registration: Reception staff or site supervisors
• Safety Briefing: Supervisors or designated safety officers
• Access Restriction: Security personnel and escorts
• Monitoring Process: Supervisors and security team
• Departure Check: Reception staff or supervisors

Tools, Forms, or Checklists:
• Visitor logbook
• Safety briefing checklist
• Access permits
• Monitoring logs
• Sign-out sheets

Safety/Compliance/Quality Requirements:
Adherence to BC OHS Regulation Part 4 and internal security protocols during visitor management.

Reporting or Escalation:
Report safety or security concerns to supervisors; escalate incidents to HSE Representatives within 24 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Oversee policy implementation, provide resources, and ensure compliance.

Supervisors:
• Manage visitor registration, conduct briefings, and monitor adherence.

Staff:
• Assist in escorting visitors and report violations or hazards.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through daily visitor log reviews, site inspections, and incident reports to ensure adherence.

Consequences for Non-Compliance:
• Removal from premises, temporary bans, or legal action for serious breaches.

Reporting Obligations:
• All incidents involving visitors must be reported to supervisors within 24 hours.`
      }
    ]
  },

  '1044': {
    number: '1044',
    title: 'HSE - Contractors Policy',
    category: 'hse',
    description: 'Regulates the engagement and conduct of contractors at the Company to ensure safety, compliance, and alignment with company standards.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC Occupational Health and Safety Regulation (Part 4)', 'Workers Compensation Act (BC) Part 3'],
    keywords: ['contractors', 'pre-qualification', 'safety', 'compliance', 'external workers', 'supervision'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to regulate the engagement and conduct of contractors at the Company to ensure safety, compliance, and alignment with company standards. Its objectives include minimizing risks, ensuring accountability, and addressing the challenges of integrating external workers into operations.

Scope:
This policy applies to all contractors working for or on behalf of the Company, covering all work sites, projects, and activities performed under contract.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Contractor: An individual or entity hired to perform specific tasks or services for the Company
• Pre-Qualification: The process of assessing a contractor's safety and compliance credentials.
• Incident: Any event involving injury, damage, or violation of safety protocols.

References:
• BC Occupational Health and Safety Regulation (Part 4 - General Conditions)
• Workers Compensation Act (British Columbia), Part 3 - Rights and Responsibilities
• the Company Health & Safety Policy
• the Company Public and Visitors Policy`
      },
      {
        title: 'Policy Statement',
        content: `the Company requires all contractors to adhere to company safety, security, and operational standards. We are committed to pre-qualifying contractors, monitoring their performance, and ensuring compliance with all applicable laws and policies.

Contractor Rules:
• Safety Compliance: Adhere to all safety rules and wear required PPE.
• Access Limitation: Work only in authorized areas with proper supervision.
• Equipment Use: Use company equipment only with permission and training.
• Incident Reporting: Report all accidents or hazards immediately.
• Substance Prohibition: No drugs or alcohol on site.
• Documentation: Provide required certifications and insurance upon request.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Pre-Qualification Process:
• Evaluate contractors' safety records, insurance, and qualifications before engagement.

Orientation Training:
• Conduct site-specific safety and policy training for all contractors.

Work Supervision:
• Assign the Company personnel to oversee contractor activities.

Incident Reporting:
• Require contractors to report all incidents immediately.

Performance Review:
• Assess contractor compliance and performance post-project.

Roles & Responsibilities for Each Step:
• Pre-Qualification Process: Procurement team and HSE Representatives
• Orientation Training: Training coordinators and supervisors
• Work Supervision: Supervisors and site managers
• Incident Reporting: Contractors and supervising staff
• Performance Review: HSE team and management

Tools, Forms, or Checklists:
• Contractor pre-qualification forms
• Training attendance logs
• Supervision checklists
• Incident report templates
• Performance evaluation records

Safety/Compliance/Quality Requirements:
Adherence to BC OHS Regulation Part 4 and internal policies during contractor engagement and oversight.

Reporting or Escalation:
Report incidents or concerns to supervisors; escalate unresolved issues to HSE Representatives within 24 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Approve contractor selection, ensure policy compliance, and provide oversight resources.

Supervisors:
• Monitor contractor work, enforce rules, and report issues.

Contractors:
• Follow company policies, attend training, and report incidents promptly.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through daily contractor activity logs, incident reviews, and post-project evaluations.

Consequences for Non-Compliance:
• Warnings, contract suspension, or termination for violations, with legal action for serious breaches.

Reporting Obligations:
• All contractor-related incidents must be reported to supervisors within 24 hours.`
      }
    ]
  },

  '1045': {
    number: '1045',
    title: 'HSE - Employer Duties',
    category: 'hse',
    description: 'Outlines the duties of the Company as an employer to ensure a safe, compliant, and supportive workplace.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC Workers Compensation Act (Part 3)', 'BC OHS Regulation (Part 3)'],
    keywords: ['employer duties', 'safety', 'compliance', 'hazard', 'training', 'worker support'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This document outlines the duties of the Company as an employer to ensure a safe, compliant, and supportive workplace. Its objectives include meeting legal obligations, protecting employee well-being, and addressing workplace hazards effectively.

Scope:
This policy applies to the Company management and supervisory staff, covering all work sites, employees, contractors, and operational activities.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Employer Duties: Legal and ethical responsibilities to ensure employee safety, health, and fair treatment.
• Hazard: Any condition or activity with potential to cause injury or illness.
• Compliance: Adherence to occupational health and safety regulations and company policies.

References:
• BC Workers Compensation Act (Part 3 - Rights and Responsibilities)
• BC Occupational Health and Safety Regulation (Part 3 - General Duties of Employers)
• the Company Health & Safety Policy
• WorkSafeBC Guidelines on Employer Responsibilities`
      },
      {
        title: 'Policy Statement',
        content: `the Company is committed to fulfilling its duties as an employer by providing a safe working environment, complying with all legal requirements, and supporting employee health and safety through proactive measures and resource allocation.

Employer Duties:
• Safety Provision: Ensure a workplace free from recognized hazards.
• Training and Instruction: Educate employees on safe work practices and emergency procedures.
• Equipment Supply: Provide and maintain safe tools, machinery, and PPE.
• Health Monitoring: Address workplace health risks, including fatigue and substance use.
• Incident Response: Investigate and mitigate incidents to prevent recurrence.
• Policy Compliance: Adhere to all applicable health, safety, and employment laws.
• Worker Support: Offer resources for reporting concerns and resolving issues without retaliation.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Risk Assessment:
• Conduct regular hazard identification and risk assessments.

Safety Training:
• Provide initial and ongoing safety training for all employees.

Resource Provision:
• Supply necessary PPE, equipment, and safety tools.

Policy Enforcement:
• Monitor and enforce compliance with safety and company policies.

Incident Investigation:
• Investigate all workplace incidents and implement corrective actions.

Roles & Responsibilities for Each Step:
• Risk Assessment: HSE Representatives and management
• Safety Training: Training coordinators and HSE Management
• Resource Provision: Procurement team and management
• Policy Enforcement: Supervisors and management
• Incident Investigation: HSE team and management

Tools, Forms, or Checklists:
• Hazard assessment forms (e.g., FLRA/FLHA)
• Training logs
• Equipment inventory lists
• Compliance audit checklists
• Incident report forms

Safety/Compliance/Quality Requirements:
Adherence to BC Workers Compensation Act Part 3 and OHS Regulation Part 3 during all employer duties.

Reporting or Escalation:
Report hazards or incidents to supervisors; escalate unresolved issues to HSE Representatives within 24 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Oversee policy implementation, allocate resources, and ensure legal compliance.

Supervisors:
• Monitor workplace safety, enforce rules, and report issues to management.

HSE Team:
• Conduct assessments, provide training, and investigate incidents.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through monthly safety audits, training records, and incident reviews to ensure adherence.

Consequences for Non-Compliance:
• Corrective action plans, retraining, or legal review for failure to meet duties.

Reporting Obligations:
• All safety or compliance issues must be reported to HSE Representatives within 24 hours.`
      }
    ]
  },

  '1046': {
    number: '1046',
    title: 'HSE - Part 13 Code Requirements',
    category: 'hse',
    description: 'Outlines compliance with Part 13 of the Alberta OHS Code governing joint health and safety committees (JHSCs) and health and safety representatives (HSRs).',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['Alberta OHS Act (Sections 13-15)', 'Alberta OHS Code Part 13'],
    keywords: ['JHSC', 'HSR', 'joint committee', 'safety representative', 'worker participation', 'Alberta OHS'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to outline the Company's compliance with Part 13 of the Alberta Occupational Health and Safety Code, which governs joint health and safety committees (JHSCs) and health and safety representatives (HSRs). Its objectives include ensuring worker involvement in safety decisions, addressing occupational health concerns, and preventing incidents through structured consultation, addressing gaps in workplace safety governance.

Scope:
This policy applies to all work sites required to have a JHSC under section 13 of the OHS Act or an HSR under section 14, including all employees, supervisors, and management at the Company operational locations in Alberta.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Joint Health and Safety Committee (JHSC): A group of employer and worker representatives responsible for identifying and resolving health and safety issues.
• Health and Safety Representative (HSR): A worker-designated individual to represent workers on health and safety matters in smaller workplaces.
• Occupational Health and Safety (OHS) Code: Alberta's technical rules for workplace health and safety under the OHS Act.

References:
• Alberta Occupational Health and Safety Act (OHS Act), sections 13-15 (Joint Worksites and Committees)
• Alberta Occupational Health and Safety Code, Part 13 (Joint Health and Safety Committees and Health and Safety Representatives)
• the Company Health & Safety Policy
• WorkSafeBC/Alberta OHS Guidelines on JHSC/HSR Establishment and Duties`
      },
      {
        title: 'Policy Statement',
        content: `the Company is committed to complying with Part 13 of the Alberta OHS Code by establishing and maintaining effective JHSCs or HSRs where required. We ensure balanced representation, regular consultation on health and safety matters, and proactive resolution of concerns to foster a collaborative safety culture and meet all legal obligations.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Committee Establishment:
• Determine if a JHSC or HSR is required based on site size and hazard levels, then form the group with equal employer and worker representatives.

Member Selection:
• Select worker representatives through democratic election and appoint employer representatives.

Training Provision:
• Deliver mandatory OHS Code training within 14 days of designation.

Meeting Scheduling:
• Hold JHSC meetings at least quarterly or as needed for urgent issues.

Issue Resolution:
• Identify, discuss, and resolve health and safety concerns, with minutes and recommendations documented.

Roles & Responsibilities for Each Step:
• Committee Establishment: Management and HSE team
• Member Selection: Worker group for elections; management for appointments
• Training Provision: HSE Management and external trainers
• Meeting Scheduling: JHSC co-chairs
• Issue Resolution: JHSC/HSR members and supervisors

Tools, Forms, or Checklists:
• JHSC/HSR designation forms
• Election ballots
• Training certificates
• Meeting agendas/minutes templates
• Issue tracking logs

Safety/Compliance/Quality Requirements:
Full adherence to Alberta OHS Code Part 13, including no reprisal for participation and timely response to recommendations (within 14 days where practicable).

Reporting or Escalation:
Report unresolved issues to senior management or OHS authorities; escalate imminent hazards immediately to supervisors for stop-work authority.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Establish JHSC/HSR as required, provide paid time for meetings/training, respond to recommendations, and ensure no reprisals for participation.

Supervisors:
• Cooperate with JHSC/HSR, attend meetings when requested, and implement approved safety measures.

Staff:
• Elect/select representatives, participate in consultations, and raise health/safety concerns through the committee.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through quarterly JHSC/HSR meeting reviews, annual audits of participation records, and feedback surveys to verify adherence to Part 13.

Consequences for Non-Compliance:
• Corrective action plans, retraining, or regulatory reporting for failures; progressive discipline for reprisals against participants.

Reporting Obligations:
• All JHSC/HSR recommendations and unresolved issues must be documented and reported to management within 14 days; incidents escalated to OHS authorities as required.`
      }
    ]
  },

  '1047': {
    number: '1047',
    title: 'HSE - Hazard Assessment Policy',
    category: 'hse',
    description: 'Ensures the Company identifies and controls workplace hazards to prevent injuries and illnesses through systematic assessment.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC OHS Regulation (Section 3.5)', 'Workers Compensation Act (BC) Part 3'],
    keywords: ['hazard assessment', 'risk evaluation', 'hazard identification', 'control measures', 'FLRA', 'FLHA'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to ensure the Company identifies and controls workplace hazards to prevent injuries and illnesses. Its objectives include meeting legal requirements, promoting a proactive safety culture, and addressing risks through systematic assessment, tackling challenges like unrecognized or evolving hazards.

Scope:
This policy applies to all employees, contractors, and supervisors at the Company, covering all work sites, tasks, and activities where hazards may be present.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Hazard: Any source with the potential to cause injury, illness, or property damage (e.g., physical, chemical, biological).
• Hazard Assessment: A systematic process to identify, evaluate, and control workplace risks.
• Control Measure: Actions or equipment to eliminate or mitigate identified hazards.

References:
• BC Occupational Health and Safety Regulation (Section 3.5 - General Hazard Identification and Assessment)
• Workers Compensation Act (British Columbia), Part 3 - Rights and Responsibilities
• the Company Health & Safety Policy
• WorkSafeBC Guidelines on Hazard Identification and Risk Assessment`
      },
      {
        title: 'Policy Statement',
        content: `the Company is committed to conducting regular hazard assessments to identify and control risks, ensuring a safe working environment for all personnel. We comply with all applicable regulations and encourage active participation in hazard management processes.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Initial Assessment:
• Conduct a baseline hazard assessment for all new sites or tasks.

Routine Monitoring:
• Perform regular inspections to identify new or changing hazards.

Risk Evaluation:
• Assess the likelihood and severity of identified hazards.

Control Implementation:
• Apply appropriate control measures (e.g., engineering, administrative, PPE).

Documentation Update:
• Record findings, controls, and reviews in hazard assessment logs.

Roles & Responsibilities for Each Step:
• Initial Assessment: HSE Representatives and supervisors
• Routine Monitoring: Supervisors and safety officers
• Risk Evaluation: HSE team and management
• Control Implementation: Supervisors and workers
• Documentation Update: HSE Representatives

Tools, Forms, or Checklists:
• Hazard identification forms (e.g., FLRA/FLHA)
• Inspection checklists
• Risk matrix
• Control measure logs
• Assessment records

Safety/Compliance/Quality Requirements:
Adherence to BC OHS Regulation Section 3.5 and internal safety protocols during all hazard assessments.

Reporting or Escalation:
Report hazards to supervisors; escalate uncontrolled risks to HSE Representatives within 24 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Oversee hazard assessment programs, provide resources, and ensure compliance.

Supervisors:
• Conduct assessments, enforce controls, and report issues.

Staff:
• Participate in assessments, report hazards, and follow control measures.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through monthly hazard assessment reviews, site inspection reports, and incident analysis to ensure adherence.

Consequences for Non-Compliance:
• Warnings, retraining, or disciplinary action for failing to conduct or follow assessments.

Reporting Obligations:
• All hazards or non-compliance must be reported to supervisors within 24 hours.`
      }
    ]
  },

  '1048': {
    number: '1048',
    title: 'HSE - Hazard Control Policy',
    category: 'hse',
    description: 'Establishes procedures for controlling hazards at the Company to minimize risks and ensure a safe workplace.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: ['BC OHS Regulation (Section 3.6)', 'Workers Compensation Act (BC) Part 3'],
    keywords: ['hazard control', 'hierarchy of controls', 'elimination', 'substitution', 'engineering controls', 'PPE'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to establish procedures for controlling hazards at the Company to minimize risks and ensure a safe workplace. Its objectives include implementing effective controls, complying with safety regulations, and addressing the challenge of managing identified hazards across operations.

Scope:
This policy applies to all employees, contractors, and supervisors at the Company, covering all work sites, tasks, and activities where hazard controls are required.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Hazard Control: Measures to eliminate or reduce the risk of identified hazards.
• Hierarchy of Controls: A prioritized system (elimination, substitution, engineering, administrative, PPE) for managing hazards.
• Residual Risk: The remaining risk after control measures are applied.

References:
• BC Occupational Health and Safety Regulation (Section 3.6 - Hazard Control)
• Workers Compensation Act (British Columbia), Part 3 - Rights and Responsibilities
• the Company Hazard Assessment Policy
• WorkSafeBC Guidelines on Hazard Control Measures`
      },
      {
        title: 'Policy Statement',
        content: `the Company is committed to controlling workplace hazards using the hierarchy of controls to ensure employee safety and regulatory compliance. We prioritize hazard elimination and provide resources to implement effective control measures.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:

Hazard Identification:
• Use hazard assessments to pinpoint risks.

Control Selection:
• Apply the hierarchy of controls, starting with elimination where feasible.

Implementation Process:
• Install or enforce controls (e.g., guards, training, PPE).

Monitoring Effectiveness:
• Regularly inspect and evaluate control measures.

Adjustment Review:
• Update controls based on monitoring results or new hazards.

Roles & Responsibilities for Each Step:
• Hazard Identification: HSE Representatives and supervisors
• Control Selection: HSE team and management
• Implementation Process: Supervisors and workers
• Monitoring Effectiveness: Safety officers and supervisors
• Adjustment Review: HSE Representatives and management

Tools, Forms, or Checklists:
• Hazard assessment forms
• Control implementation logs
• Inspection checklists
• Monitoring reports
• Review records

Safety/Compliance/Quality Requirements:
Adherence to BC OHS Regulation Section 3.6 and internal safety protocols during all control processes.

Reporting or Escalation:
Report control failures to supervisors; escalate persistent issues to HSE Representatives within 24 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Fund and oversee control implementation, ensure compliance, and provide training.

Supervisors:
• Enforce controls, monitor effectiveness, and report issues.

Staff:
• Follow control measures, report failures, and suggest improvements.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through weekly control inspections, monthly review of hazard logs, and incident analysis to ensure adherence.

Consequences for Non-Compliance:
• Warnings, retraining, or disciplinary action for failing to implement or follow controls.

Reporting Obligations:
• All control failures or non-compliance must be reported to supervisors within 24 hours.`
      }
    ]
  },

  '1049': {
    number: '1049',
    title: 'HSE - Inspection Policy',
    category: 'hse',
    description: 'Establishes a systematic inspection process at the Company to identify and address workplace hazards, ensuring safety and compliance.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: [
      'BC OHS Regulation Section 3.5 - General Hazard Identification and Assessment',
      'Workers Compensation Act (BC) Part 3 - Rights and Responsibilities',
      'WorkSafeBC Guidelines on Workplace Inspections'
    ],
    keywords: ['inspection', 'hazard identification', 'workplace safety', 'corrective action', 'compliance'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to establish a systematic inspection process at the Company to identify and address workplace hazards, ensuring safety and compliance. Its objectives include preventing incidents, meeting regulatory requirements, and addressing the challenge of maintaining a safe work environment through regular oversight.

Scope:
This policy applies to all employees, contractors, and supervisors at the Company, covering all work sites, equipment, and operational areas requiring inspection.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Inspection: A planned examination of the workplace, equipment, or processes to identify hazards or non-compliance.
• Corrective Action: Steps taken to address identified issues or hazards.
• Frequency: The scheduled intervals for conducting inspections (e.g., daily, weekly).

References:
• BC Occupational Health and Safety Regulation (Section 3.5 - General Hazard Identification and Assessment).
• Workers Compensation Act (British Columbia), Part 3 - Rights and Responsibilities.
• the Company Health & Safety Policy.
• WorkSafeBC Guidelines on Workplace Inspections.`
      },
      {
        title: 'Policy Statement',
        content: `the Company is committed to conducting regular inspections to maintain a safe and compliant workplace. We require all personnel to participate in inspections, report findings, and implement corrective actions to address identified hazards.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Inspection Scheduling: Plan and assign inspections based on site risk levels (e.g., daily for high-risk areas).
• Conduct Inspection: Perform thorough checks using standardized checklists.
• Hazard Reporting: Document and report all identified hazards or issues.
• Corrective Action: Implement and verify fixes for reported hazards.
• Record Keeping: Maintain inspection logs and review outcomes periodically.

Roles & Responsibilities for Each Step:
• Inspection Scheduling: HSE Representatives and supervisors.
• Conduct Inspection: Supervisors, safety officers, and workers.
• Hazard Reporting: All personnel involved in inspections.
• Corrective Action: Supervisors and management.
• Record Keeping: HSE team.

Tools, Forms, or Checklists:
• Inspection schedules
• Checklist templates (e.g., FLRA/FLHA)
• Hazard report forms
• Corrective action logs
• Inspection records

Safety/Compliance/Quality Requirements:
Adherence to BC OHS Regulation Section 3.5 and internal safety protocols during all inspection activities.

Reporting or Escalation:
Report hazards to supervisors; escalate unresolved issues to HSE Representatives within 24 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Oversee inspection programs, provide resources, and ensure compliance.

Supervisors:
• Schedule and conduct inspections, enforce corrective actions, and report issues.

Staff:
• Participate in inspections, report hazards, and follow safety protocols.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through weekly inspection log reviews, monthly audit of corrective actions, and incident analysis to ensure adherence.

Consequences for Non-Compliance:
• Warnings, retraining, or disciplinary action for failing to conduct or address inspections.

Reporting Obligations:
• All inspection findings or non-compliance must be reported to supervisors within 24 hours.`
      }
    ]
  },

  '1050': {
    number: '1050',
    title: 'HSE - Preventative Maintenance Policy',
    category: 'hse',
    description: 'Establishes a preventative maintenance program at the Company to ensure equipment reliability, safety, and operational efficiency.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: [
      'BC OHS Regulation Section 4.4 - Maintenance of Equipment',
      'Workers Compensation Act (BC) Part 3 - Rights and Responsibilities',
      'WorkSafeBC Guidelines on Equipment Maintenance'
    ],
    keywords: ['preventative maintenance', 'equipment', 'maintenance schedule', 'reliability', 'downtime'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to establish a preventative maintenance program at the Company to ensure equipment reliability, safety, and operational efficiency. Its objectives include reducing downtime, preventing hazards, and complying with safety regulations, addressing the challenge of equipment failure and wear.

Scope:
This policy applies to all employees, contractors, and supervisors at the Company, covering all machinery, tools, and equipment used across work sites.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Preventative Maintenance: Scheduled activities to maintain equipment in good working condition and prevent failures.
• Downtime: Period when equipment is unavailable due to maintenance or breakdown.
• Maintenance Log: Record of all maintenance activities, including dates and findings.

References:
• BC Occupational Health and Safety Regulation (Section 4.4 - Maintenance of Equipment).
• Workers Compensation Act (British Columbia), Part 3 - Rights and Responsibilities.
• the Company Health & Safety Policy.
• WorkSafeBC Guidelines on Equipment Maintenance.`
      },
      {
        title: 'Policy Statement',
        content: `the Company is committed to implementing a preventative maintenance program to ensure all equipment operates safely and efficiently. We require regular maintenance schedules, documentation, and employee training to prevent hazards and comply with all applicable regulations.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Maintenance Scheduling: Develop and assign a maintenance schedule based on equipment type and usage.
• Inspection Routine: Conduct regular checks to identify wear or potential issues.
• Maintenance Execution: Perform scheduled repairs, lubrication, or part replacements.
• Documentation Process: Record all maintenance activities in a log.
• Review and Adjustment: Assess maintenance effectiveness and update schedules as needed.

Roles & Responsibilities for Each Step:
• Maintenance Scheduling: Maintenance team and supervisors.
• Inspection Routine: Supervisors and maintenance staff.
• Maintenance Execution: Maintenance personnel and technicians.
• Documentation Process: Maintenance team.
• Review and Adjustment: HSE Representatives and management.

Tools, Forms, or Checklists:
• Maintenance schedules
• Inspection checklists
• Repair logs
• Equipment manuals
• Review reports

Safety/Compliance/Quality Requirements:
Adherence to BC OHS Regulation Section 4.4 and manufacturer guidelines during all maintenance activities.

Reporting or Escalation:
Report equipment issues to supervisors; escalate critical failures to HSE Representatives within 24 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Oversee maintenance programs, provide resources, and ensure compliance.

Supervisors:
• Schedule inspections, monitor maintenance, and report issues.

Staff:
• Report equipment problems, assist in maintenance where trained, and follow safety protocols.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through weekly maintenance log reviews, equipment performance checks, and incident analysis to ensure adherence.

Consequences for Non-Compliance:
• Warnings, retraining, or disciplinary action for failing to perform or document maintenance.

Reporting Obligations:
• All maintenance issues or non-compliance must be reported to supervisors within 24 hours.`
      }
    ]
  },

  '1051': {
    number: '1051',
    title: 'HSE - Emergency Response Policy',
    category: 'hse',
    description: 'Establishes an effective emergency response plan at the Company to protect personnel and property during crises.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: [
      'BC OHS Regulation Section 3.16 - Emergency Preparedness',
      'Workers Compensation Act (BC) Part 3 - Rights and Responsibilities',
      'WorkSafeBC Guidelines on Emergency Preparedness and Response'
    ],
    keywords: ['emergency response', 'evacuation', 'first aid', 'crisis management', 'emergency preparedness'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to establish an effective emergency response plan at the Company to protect personnel and property during crises. Its objectives include ensuring rapid response, complying with safety regulations, and addressing emergencies such as fires, spills, or medical incidents.

Scope:
This policy applies to all employees, contractors, and visitors at the Company, covering all work sites and operational areas during emergencies.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Emergency: A sudden event requiring immediate action to protect health, safety, or property (e.g., fire, chemical spill).
• Evacuation: Organized movement of personnel to a safe location during an emergency.
• First Aid: Immediate medical assistance provided to injured persons.

References:
• BC Occupational Health and Safety Regulation (Section 3.16 - Emergency Preparedness).
• Workers Compensation Act (British Columbia), Part 3 - Rights and Responsibilities.
• the Company Health & Safety Policy.
• WorkSafeBC Guidelines on Emergency Preparedness and Response.`
      },
      {
        title: 'Policy Statement',
        content: `the Company is committed to preparing for and responding to emergencies to safeguard all personnel and assets. We require regular training, clear procedures, and coordination with emergency services to ensure a swift and effective response to any crisis.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Emergency Planning: Develop and update an emergency response plan for each site.
• Training Sessions: Conduct regular drills and training on emergency procedures.
• Alarm Activation: Sound alarms and notify personnel of emergencies immediately.
• Evacuation Process: Direct safe evacuation to designated assembly points.
• Post-Event Review: Assess response effectiveness and update plans as needed.

Roles & Responsibilities for Each Step:
• Emergency Planning: HSE Representatives and management.
• Training Sessions: Training coordinators and supervisors.
• Alarm Activation: Designated alarm officers or supervisors.
• Evacuation Process: Evacuation wardens and supervisors.
• Post-Event Review: HSE team and management.

Tools, Forms, or Checklists:
• Emergency response plan templates
• Training attendance logs
• Evacuation maps
• Incident report forms
• Review checklists

Safety/Compliance/Quality Requirements:
Adherence to BC OHS Regulation Section 3.16 and coordination with local emergency services during all response activities.

Reporting or Escalation:
Report emergencies to supervisors; escalate critical incidents to HSE Representatives and emergency services immediately.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Develop and fund emergency plans, ensure training, and coordinate with external agencies.

Supervisors:
• Oversee evacuations, activate alarms, and report incidents.

Staff:
• Participate in drills, follow evacuation orders, and assist where trained.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through quarterly drill evaluations, emergency plan reviews, and incident debriefs to ensure adherence.

Consequences for Non-Compliance:
• Warnings, retraining, or disciplinary action for failing to follow emergency procedures.

Reporting Obligations:
• All emergencies or non-compliance must be reported to supervisors immediately.`
      }
    ]
  },

  '1052': {
    number: '1052',
    title: 'HSE - Investigations Policy',
    category: 'hse',
    description: 'Establishes a structured process for investigating workplace incidents at the Company to determine causes and prevent recurrence.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: [
      'BC OHS Regulation Section 3.4 - Investigation of Incidents',
      'Workers Compensation Act (BC) Part 3 - Rights and Responsibilities',
      'WorkSafeBC Guidelines on Incident Investigation'
    ],
    keywords: ['investigation', 'incident', 'root cause', 'corrective action', 'workplace safety'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to establish a structured process for investigating workplace incidents at the Company to determine causes and prevent recurrence. Its objectives include ensuring compliance with safety regulations, protecting personnel, and addressing the challenge of identifying root causes of incidents.

Scope:
This policy applies to all employees, contractors, and supervisors at the Company, covering all work sites and incidents requiring investigation, including injuries, near misses, and property damage.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Incident: Any event resulting in injury, illness, near miss, or property damage.
• Investigation: A systematic process to identify the cause and contributing factors of an incident.
• Corrective Action: Measures implemented to prevent future incidents based on investigation findings.

References:
• BC Occupational Health and Safety Regulation (Section 3.4 - Investigation of Incidents).
• Workers Compensation Act (British Columbia), Part 3 - Rights and Responsibilities.
• the Company Health & Safety Policy.
• WorkSafeBC Guidelines on Incident Investigation.`
      },
      {
        title: 'Policy Statement',
        content: `the Company is committed to conducting thorough and timely investigations of all workplace incidents to determine causes and implement corrective actions. We ensure compliance with legal requirements and foster a culture of safety through transparent and effective investigation processes.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Incident Notification: Report all incidents to supervisors immediately.
• Initial Response: Secure the site and preserve evidence pending investigation.
• Investigation Team: Assemble a team to analyze the incident, including witnesses and experts if needed.
• Analysis Process: Identify causes and contributing factors through interviews and evidence review.
• Report and Action: Document findings and implement corrective measures, with follow-up reviews.

Roles & Responsibilities for Each Step:
• Incident Notification: All employees and contractors.
• Initial Response: Supervisors and safety officers.
• Investigation Team: HSE Representatives, supervisors, and management.
• Analysis Process: Investigation team.
• Report and Action: HSE team and management.

Tools, Forms, or Checklists:
• Incident report forms
• Investigation checklists
• Witness statement templates
• Evidence logs
• Corrective action plans

Safety/Compliance/Quality Requirements:
Adherence to BC OHS Regulation Section 3.4 and internal safety protocols during all investigation activities.

Reporting or Escalation:
Report incidents to supervisors immediately; escalate complex cases to HSE Representatives within 24 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Oversee investigations, allocate resources, and approve corrective actions.

Supervisors:
• Report incidents, secure sites, and assist in investigations.

Staff:
• Report incidents, provide statements, and comply with investigation requests.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through monthly review of investigation reports, corrective action follow-ups, and incident trend analysis to ensure adherence.

Consequences for Non-Compliance:
• Warnings, retraining, or disciplinary action for failing to report or cooperate in investigations.

Reporting Obligations:
• All incidents must be reported to supervisors immediately, with investigation findings submitted to HSE Representatives within 7 days.`
      }
    ]
  },

  '1053': {
    number: '1053',
    title: 'HSE - Systems Overview & Audit Policy',
    category: 'hse',
    description: 'Establishes procedures for the systematic overhaul and audit of operational systems at the Company to ensure safety, efficiency, and compliance.',
    version: '1.0',
    effectiveDate: '2025-09-18',
    reviewDate: '2026-02-01',
    owner: 'HSE Manager',
    status: 'active',
    regulatoryRefs: [
      'BC OHS Regulation Section 3.5 - General Hazard Identification and Assessment',
      'Workers Compensation Act (BC) Part 3 - Rights and Responsibilities',
      'WorkSafeBC Guidelines on Workplace Audits and System Upgrades'
    ],
    keywords: ['systems audit', 'overhaul', 'compliance', 'system assessment', 'operational efficiency'],
    sections: [
      {
        title: 'Purpose & Scope',
        content: `Purpose:
This policy exists to establish procedures for the systematic overhaul and audit of operational systems at the Company to ensure safety, efficiency, and compliance. Its objectives include identifying system deficiencies, implementing upgrades, and addressing the challenge of outdated or non-compliant processes.

Scope:
This policy applies to all employees, contractors, and supervisors at the Company, covering all operational systems, equipment, and safety protocols across work sites.`
      },
      {
        title: 'Definitions & References',
        content: `Definitions:
• Systems Overhaul: A comprehensive update or replacement of equipment, processes, or safety systems.
• Audit: A formal evaluation to verify compliance with standards and identify improvement areas.
• Non-Compliance: Failure to meet regulatory or internal safety requirements.

References:
• BC Occupational Health and Safety Regulation (Section 3.5 - General Hazard Identification and Assessment).
• Workers Compensation Act (British Columbia), Part 3 - Rights and Responsibilities.
• the Company Health & Safety Policy.
• WorkSafeBC Guidelines on Workplace Audits and System Upgrades.`
      },
      {
        title: 'Policy Statement',
        content: `the Company is committed to regularly overhauling and auditing operational systems to maintain safety, efficiency, and regulatory compliance. We ensure thorough assessments, timely upgrades, and documentation to address system risks and enhance workplace performance.`
      },
      {
        title: 'Procedures',
        content: `Step-by-Step Actions:
• Audit Scheduling: Plan and assign audits based on system risk and regulatory requirements.
• System Assessment: Conduct detailed inspections to evaluate current system conditions.
• Overhaul Planning: Develop a plan for upgrading or replacing deficient systems.
• Implementation Process: Execute overhauls with safety measures in place.
• Post-Audit Review: Document findings, verify improvements, and update records.

Roles & Responsibilities for Each Step:
• Audit Scheduling: HSE Representatives and management.
• System Assessment: Supervisors, safety officers, and technicians.
• Overhaul Planning: HSE team and maintenance staff.
• Implementation Process: Maintenance team and supervisors.
• Post-Audit Review: HSE Representatives and management.

Tools, Forms, or Checklists:
• Audit schedules
• Inspection checklists
• Overhaul plans
• Implementation logs
• Post-audit reports

Safety/Compliance/Quality Requirements:
Adherence to BC OHS Regulation Section 3.5 and manufacturer guidelines during all overhaul and audit activities.

Reporting or Escalation:
Report audit findings or issues to supervisors; escalate critical deficiencies to HSE Representatives within 24 hours.`
      },
      {
        title: 'Roles & Responsibilities',
        content: `Management:
• Oversee audits and overhauls, allocate resources, and ensure compliance.

Supervisors:
• Conduct assessments, oversee implementations, and report issues.

Staff:
• Assist in audits, follow safety protocols during overhauls, and report concerns.`
      },
      {
        title: 'Monitoring, Compliance & Enforcement',
        content: `How Compliance Will Be Monitored:
• Through quarterly audit reviews, post-overhaul evaluations, and system performance checks to ensure adherence.

Consequences for Non-Compliance:
• Warnings, retraining, or disciplinary action for failing to conduct audits or implement overhauls.

Reporting Obligations:
• All audit findings or non-compliance must be reported to supervisors within 24 hours.`
      }
    ]
  }
}

// Export function to get policy content by number
export function getPolicyContent(policyNumber) {
  return POLICY_CONTENT[policyNumber] || null
}

// Export list of available policy numbers
export function getAvailablePolicyNumbers() {
  return Object.keys(POLICY_CONTENT)
}

export default POLICY_CONTENT
