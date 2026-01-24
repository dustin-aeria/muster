/**
 * Proposal Generator
 * Generate professional client proposals from project data
 *
 * @location src/lib/proposalGenerator.js
 */

// ============================================
// PROPOSAL TEMPLATES
// ============================================

export const PROPOSAL_TEMPLATES = {
  standard: {
    label: 'Standard Proposal',
    description: 'Professional proposal with scope, methodology, and pricing',
    sections: ['executive_summary', 'scope', 'methodology', 'deliverables', 'timeline', 'pricing', 'terms']
  },
  detailed: {
    label: 'Detailed Technical Proposal',
    description: 'In-depth technical proposal with safety and compliance details',
    sections: ['executive_summary', 'company_overview', 'scope', 'methodology', 'safety', 'equipment', 'personnel', 'deliverables', 'timeline', 'pricing', 'terms']
  },
  quote: {
    label: 'Quick Quote',
    description: 'Simple quote with scope and pricing',
    sections: ['scope', 'deliverables', 'pricing', 'terms']
  }
}

export const PROPOSAL_SECTIONS = {
  executive_summary: { label: 'Executive Summary', icon: 'FileText' },
  company_overview: { label: 'Company Overview', icon: 'Building2' },
  scope: { label: 'Scope of Work', icon: 'Target' },
  methodology: { label: 'Methodology', icon: 'Settings' },
  safety: { label: 'Safety & Compliance', icon: 'Shield' },
  equipment: { label: 'Equipment', icon: 'Package' },
  personnel: { label: 'Personnel', icon: 'Users' },
  deliverables: { label: 'Deliverables', icon: 'CheckSquare' },
  timeline: { label: 'Timeline', icon: 'Calendar' },
  pricing: { label: 'Pricing', icon: 'DollarSign' },
  terms: { label: 'Terms & Conditions', icon: 'FileCheck' }
}

// ============================================
// CONTENT GENERATORS
// ============================================

function generateExecutiveSummary(project, options = {}) {
  const { companyName = 'Aeria Operations' } = options

  return `
## Executive Summary

${companyName} is pleased to present this proposal for ${project.name}${project.clientName ? ` for ${project.clientName}` : ''}.

**Project Overview:**
${project.description || 'This project involves professional drone services tailored to meet your specific requirements.'}

${project.needsAnalysis?.missionProfile ? `**Mission Type:** ${project.needsAnalysis.missionProfile}` : ''}
${project.location ? `**Location:** ${project.location}` : ''}
${project.startDate ? `**Proposed Start Date:** ${new Date(project.startDate).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}` : ''}

Our team is committed to delivering exceptional results while maintaining the highest standards of safety and regulatory compliance.
`
}

function generateCompanyOverview(options = {}) {
  const {
    companyName = 'Aeria Operations',
    companyDescription = 'A leading provider of professional drone services',
    certifications = [],
    experience = ''
  } = options

  return `
## Company Overview

**${companyName}**

${companyDescription}

${certifications.length > 0 ? `
**Certifications & Credentials:**
${certifications.map(c => `- ${c}`).join('\n')}
` : ''}

${experience ? `**Experience:**\n${experience}` : ''}
`
}

function generateScopeOfWork(project) {
  let scope = `
## Scope of Work

`

  if (project.needsAnalysis?.requirements) {
    scope += `**Project Requirements:**\n${project.needsAnalysis.requirements}\n\n`
  }

  if (project.needsAnalysis?.objectives && project.needsAnalysis.objectives.length > 0) {
    scope += `**Objectives:**\n`
    project.needsAnalysis.objectives.forEach(obj => {
      scope += `- ${obj}\n`
    })
    scope += '\n'
  }

  if (project.sites && project.sites.length > 0) {
    scope += `**Site(s):**\n`
    project.sites.forEach(site => {
      scope += `- ${site.name}${site.description ? `: ${site.description}` : ''}\n`
    })
    scope += '\n'
  }

  if (project.needsAnalysis?.exclusions) {
    scope += `**Exclusions:**\n${project.needsAnalysis.exclusions}\n`
  }

  return scope
}

function generateMethodology(project) {
  let methodology = `
## Methodology

`

  if (project.flightPlan) {
    methodology += `**Flight Operations:**\n`
    if (project.flightPlan.operationType) {
      methodology += `- Operation Type: ${project.flightPlan.operationType}\n`
    }
    if (project.flightPlan.maxAltitude) {
      methodology += `- Maximum Altitude: ${project.flightPlan.maxAltitude}m AGL\n`
    }
    if (project.flightPlan.flightPattern) {
      methodology += `- Flight Pattern: ${project.flightPlan.flightPattern}\n`
    }
    methodology += '\n'
  }

  methodology += `**Process:**
1. Pre-flight planning and site assessment
2. Risk assessment and mitigation planning
3. Flight operations execution
4. Data processing and quality control
5. Deliverable preparation and delivery
`

  return methodology
}

function generateSafetySection(project) {
  let safety = `
## Safety & Compliance

Our operations adhere to all Transport Canada regulations and industry best practices.

**Safety Protocols:**
- Comprehensive pre-flight safety briefings
- Real-time weather monitoring
- Emergency response procedures in place
- All pilots hold valid RPAS certificates

`

  if (project.hseRisks && project.hseRisks.length > 0) {
    safety += `**Risk Mitigations:**\n`
    project.hseRisks.slice(0, 5).forEach(risk => {
      safety += `- ${risk.hazard}: ${risk.mitigation || 'Mitigation measures in place'}\n`
    })
    safety += '\n'
  }

  if (project.emergency) {
    if (project.emergency.nearestHospital) {
      safety += `**Emergency Preparedness:**\n`
      safety += `- Nearest Hospital: ${project.emergency.nearestHospital}\n`
    }
  }

  return safety
}

function generateEquipmentSection(project, equipment = []) {
  let section = `
## Equipment

Our fleet of professional-grade equipment ensures high-quality results.

`

  if (project.equipment && project.equipment.length > 0) {
    section += `**Equipment for this Project:**\n`
    project.equipment.forEach(eq => {
      const item = equipment.find(e => e.id === eq.equipmentId)
      if (item) {
        section += `- ${item.name}${item.category ? ` (${item.category})` : ''}\n`
      }
    })
    section += '\n'
  }

  if (project.aircraft && project.aircraft.length > 0) {
    section += `**Aircraft:**\n`
    project.aircraft.forEach(ac => {
      section += `- ${ac.name || ac.model || 'Aircraft'}${ac.registration ? ` - ${ac.registration}` : ''}\n`
    })
  }

  return section
}

function generatePersonnelSection(project, crew = []) {
  let section = `
## Personnel

Our experienced team will be assigned to this project.

`

  if (project.crew && project.crew.length > 0) {
    section += `**Project Team:**\n`
    project.crew.forEach(assignment => {
      const member = crew.find(c => c.id === assignment.crewMemberId)
      if (member) {
        section += `- ${member.name}${member.role ? ` - ${member.role}` : ''}\n`
      } else if (assignment.name) {
        section += `- ${assignment.name}${assignment.role ? ` - ${assignment.role}` : ''}\n`
      }
    })
    section += '\n'
  }

  return section
}

function generateDeliverablesSection(project) {
  let section = `
## Deliverables

Upon completion, the following deliverables will be provided:

`

  if (project.needsAnalysis?.deliverables && project.needsAnalysis.deliverables.length > 0) {
    project.needsAnalysis.deliverables.forEach(d => {
      section += `- ${d}\n`
    })
  } else {
    section += `- Final processed data/imagery
- Project documentation
- Flight logs and reports
`
  }

  if (project.needsAnalysis?.deliveryFormat) {
    section += `\n**Delivery Format:** ${project.needsAnalysis.deliveryFormat}`
  }

  return section
}

function generateTimeline(project) {
  let section = `
## Timeline

`

  if (project.startDate || project.endDate) {
    section += `**Project Schedule:**\n`
    if (project.startDate) {
      section += `- Start Date: ${new Date(project.startDate).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}\n`
    }
    if (project.endDate) {
      section += `- End Date: ${new Date(project.endDate).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}\n`
    }
    section += '\n'
  }

  section += `**Milestone Schedule:**
1. Project kickoff and planning
2. Site preparation and safety briefing
3. Flight operations
4. Data processing
5. Quality review
6. Final delivery
`

  return section
}

function generatePricingSection(project, costBreakdown = null, options = {}) {
  const { showBreakdown = true, currency = 'CAD' } = options

  let section = `
## Pricing

`

  if (costBreakdown && showBreakdown) {
    const formatter = new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    })

    if (costBreakdown.subtotals?.equipment > 0) {
      section += `**Equipment:** ${formatter.format(costBreakdown.subtotals.equipment)}\n`
    }
    if (costBreakdown.subtotals?.personnel > 0) {
      section += `**Personnel:** ${formatter.format(costBreakdown.subtotals.personnel)}\n`
    }
    if (costBreakdown.subtotals?.custom > 0) {
      section += `**Other Costs:** ${formatter.format(costBreakdown.subtotals.custom)}\n`
    }
    if (costBreakdown.overhead > 0) {
      section += `**Overhead:** ${formatter.format(costBreakdown.overhead)}\n`
    }
    if (costBreakdown.tax > 0) {
      section += `**Tax:** ${formatter.format(costBreakdown.tax)}\n`
    }
    section += `\n**Total:** ${formatter.format(costBreakdown.total)}\n`
  } else if (project.estimatedCost) {
    const formatter = new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    })
    section += `**Project Total:** ${formatter.format(project.estimatedCost)}\n`
  } else {
    section += `*Pricing to be confirmed based on final project requirements.*\n`
  }

  section += `
**Payment Terms:**
- 50% deposit upon acceptance
- 50% balance upon completion

*Quote valid for 30 days from date of issue.*
`

  return section
}

function generateTermsSection(options = {}) {
  const { companyName = 'Aeria Operations' } = options

  return `
## Terms & Conditions

1. **Acceptance:** This proposal is valid for 30 days from the date of issue. Acceptance must be confirmed in writing.

2. **Payment:** Payment terms are 50% deposit upon acceptance, balance upon completion. Late payments may incur interest charges.

3. **Weather:** Operations are subject to suitable weather conditions. Delays due to weather will not result in additional charges.

4. **Access:** Client must provide necessary site access and permissions.

5. **Regulatory Compliance:** All operations will be conducted in compliance with Transport Canada regulations.

6. **Liability:** ${companyName} maintains appropriate insurance coverage for all operations.

7. **Confidentiality:** All project information and deliverables are treated as confidential.

8. **Changes:** Any changes to scope must be agreed in writing and may affect pricing and timeline.

9. **Cancellation:** Cancellation within 48 hours of scheduled operations may incur a cancellation fee.

---

*Thank you for considering ${companyName} for your drone services needs. We look forward to working with you.*
`
}

// ============================================
// MAIN GENERATOR
// ============================================

/**
 * Generate a complete proposal
 */
export function generateProposal(project, options = {}) {
  const {
    template = 'standard',
    companyName = 'Aeria Operations',
    companyDescription,
    certifications = [],
    experience,
    equipment = [],
    crew = [],
    costBreakdown = null,
    showPricingBreakdown = true,
    customSections = {}
  } = options

  const templateConfig = PROPOSAL_TEMPLATES[template] || PROPOSAL_TEMPLATES.standard
  const sections = templateConfig.sections

  let proposal = `# Project Proposal

**${project.name}**
${project.clientName ? `\n**Prepared for:** ${project.clientName}` : ''}
**Date:** ${new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
**Proposal #:** ${project.id?.slice(0, 8).toUpperCase() || 'DRAFT'}

---
`

  sections.forEach(sectionId => {
    // Check for custom section content
    if (customSections[sectionId]) {
      proposal += customSections[sectionId]
      return
    }

    switch (sectionId) {
      case 'executive_summary':
        proposal += generateExecutiveSummary(project, { companyName })
        break
      case 'company_overview':
        proposal += generateCompanyOverview({ companyName, companyDescription, certifications, experience })
        break
      case 'scope':
        proposal += generateScopeOfWork(project)
        break
      case 'methodology':
        proposal += generateMethodology(project)
        break
      case 'safety':
        proposal += generateSafetySection(project)
        break
      case 'equipment':
        proposal += generateEquipmentSection(project, equipment)
        break
      case 'personnel':
        proposal += generatePersonnelSection(project, crew)
        break
      case 'deliverables':
        proposal += generateDeliverablesSection(project)
        break
      case 'timeline':
        proposal += generateTimeline(project)
        break
      case 'pricing':
        proposal += generatePricingSection(project, costBreakdown, { showBreakdown: showPricingBreakdown })
        break
      case 'terms':
        proposal += generateTermsSection({ companyName })
        break
    }
  })

  return proposal
}

/**
 * Export proposal to PDF using jsPDF
 */
export async function exportProposalToPdf(proposal, filename = 'proposal.pdf') {
  // Load jsPDF from CDN
  if (!window.jspdf) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  const { jsPDF } = window.jspdf
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let y = margin

  // Parse markdown-like content
  const lines = proposal.split('\n')

  for (const line of lines) {
    // Check if we need a new page
    if (y > pageHeight - margin) {
      doc.addPage()
      y = margin
    }

    if (line.startsWith('# ')) {
      // Main title
      doc.setFontSize(20)
      doc.setFont(undefined, 'bold')
      doc.text(line.replace('# ', ''), margin, y)
      y += 10
    } else if (line.startsWith('## ')) {
      // Section header
      y += 5
      doc.setFontSize(14)
      doc.setFont(undefined, 'bold')
      doc.text(line.replace('## ', ''), margin, y)
      y += 8
    } else if (line.startsWith('**') && line.endsWith('**')) {
      // Bold line
      doc.setFontSize(10)
      doc.setFont(undefined, 'bold')
      const text = line.replace(/\*\*/g, '')
      const splitText = doc.splitTextToSize(text, contentWidth)
      doc.text(splitText, margin, y)
      y += splitText.length * 5
    } else if (line.startsWith('- ')) {
      // Bullet point
      doc.setFontSize(10)
      doc.setFont(undefined, 'normal')
      const text = '• ' + line.replace('- ', '')
      const splitText = doc.splitTextToSize(text, contentWidth - 5)
      doc.text(splitText, margin + 5, y)
      y += splitText.length * 5
    } else if (line.match(/^\d+\. /)) {
      // Numbered list
      doc.setFontSize(10)
      doc.setFont(undefined, 'normal')
      const splitText = doc.splitTextToSize(line, contentWidth - 5)
      doc.text(splitText, margin + 5, y)
      y += splitText.length * 5
    } else if (line.startsWith('---')) {
      // Horizontal rule
      y += 3
      doc.setDrawColor(200, 200, 200)
      doc.line(margin, y, pageWidth - margin, y)
      y += 5
    } else if (line.trim()) {
      // Regular text
      doc.setFontSize(10)
      doc.setFont(undefined, 'normal')
      // Handle inline bold
      const cleanLine = line.replace(/\*\*/g, '')
      const splitText = doc.splitTextToSize(cleanLine, contentWidth)
      doc.text(splitText, margin, y)
      y += splitText.length * 5
    } else {
      // Empty line
      y += 3
    }
  }

  // Save the PDF
  doc.save(filename)
}

export default {
  PROPOSAL_TEMPLATES,
  PROPOSAL_SECTIONS,
  generateProposal,
  exportProposalToPdf
}
