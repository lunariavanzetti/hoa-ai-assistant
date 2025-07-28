// AI Agents Service for HOA AI Assistant
// Comprehensive agent prompts and utilities for generating professional HOA communications

export interface ViolationData {
  hoa_name: string
  property_address: string
  resident_name: string
  violation_type: string
  violation_description: string
  violation_date: string
  previous_violations_count: number
  ccr_section: string
  manager_name: string
  manager_title: string
  photo_attached: boolean
  severity_level: 'low' | 'medium' | 'high' | 'urgent'
  state: string
}

export interface ComplaintData {
  hoa_name: string
  resident_name: string
  complaint_category: string
  complaint_text: string
  priority_level: 'low' | 'medium' | 'high' | 'urgent'
  previous_complaints: number
  manager_name: string
  date_received: string
  related_policies: string[]
  community_guidelines: string[]
  expected_resolution_time: string
}

export class ViolationLetterAgent {
  private static readonly ULTRA_DETAILED_PROMPT = `
ROLE: You are an expert HOA legal compliance officer and professional communication specialist with 15+ years of experience in property management and community association law. You have extensive knowledge of HOA bylaws, state regulations, fair housing laws, and professional correspondence standards.

CONTEXT: You are generating formal violation notices for homeowners associations. These letters must be legally compliant, professionally written, respectful yet firm, and follow established legal protocols to ensure enforceability.

REQUIREMENTS:
1. **Legal Compliance**: Ensure all language complies with fair housing laws and state regulations
2. **Professional Tone**: Maintain respectful, diplomatic, but authoritative language
3. **Clear Structure**: Follow proper business letter format with clear sections
4. **Actionable Steps**: Provide specific, measurable correction requirements
5. **Timeline**: Include reasonable but firm deadlines for compliance
6. **Escalation Path**: Clearly outline consequences of non-compliance
7. **Documentation**: Reference relevant HOA documents and governing rules

TONE GUIDELINES:
- Professional and respectful, never condescending
- Firm but not threatening
- Educational rather than punitive
- Solution-focused approach
- Maintain community harmony while enforcing rules

SPECIFIC INSTRUCTIONS:
- Use formal business letter language
- Include specific CC&R or bylaw references
- Provide clear deadline (typically 14-30 days depending on violation)
- Offer assistance or clarification contact information
- Include appeal process information
- Mention photo evidence if available
- For repeat violations, reference previous notices
- Ensure ADA and fair housing compliance
- Include proper legal disclaimers
`

  static generateCaseNumber(): string {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `HOA-${year}${month}${day}-${random}`
  }

  static getDeadlineDays(violationType: string, severityLevel: string): number {
    const deadlineMatrix: Record<string, Record<string, number>> = {
      'Landscaping/Lawn Care': { low: 30, medium: 21, high: 14, urgent: 7 },
      'Parking Violations': { low: 14, medium: 10, high: 7, urgent: 3 },
      'Architectural Changes': { low: 30, medium: 21, high: 14, urgent: 7 },
      'Noise Complaints': { low: 14, medium: 10, high: 7, urgent: 3 },
      'Pet Violations': { low: 21, medium: 14, high: 10, urgent: 7 },
      'Trash/Recycling': { low: 14, medium: 10, high: 7, urgent: 3 },
      'Safety Hazards': { low: 14, medium: 7, high: 3, urgent: 1 },
      'Other': { low: 21, medium: 14, high: 10, urgent: 7 }
    }
    
    return deadlineMatrix[violationType]?.[severityLevel] || 14
  }

  static async generateViolationLetter(data: ViolationData): Promise<string> {
    const caseNumber = this.generateCaseNumber()
    const deadlineDays = this.getDeadlineDays(data.violation_type, data.severity_level)
    const deadlineDate = new Date()
    deadlineDate.setDate(deadlineDate.getDate() + deadlineDays)
    
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Determine appropriate CC&R section based on violation type
    const ccrSections: Record<string, string> = {
      'Landscaping/Lawn Care': 'Section 4.2 - Landscape Maintenance Standards',
      'Parking Violations': 'Section 6.1 - Vehicle Parking and Storage',
      'Architectural Changes': 'Section 5.3 - Architectural Review Committee Approval',
      'Noise Complaints': 'Section 7.4 - Noise and Nuisance Restrictions',
      'Pet Violations': 'Section 8.1 - Pet Ownership and Control',
      'Trash/Recycling': 'Section 9.2 - Waste Management Requirements',
      'Safety Hazards': 'Section 3.1 - Safety and Maintenance Standards',
      'Other': data.ccr_section || 'General Community Guidelines'
    }

    const relevantSection = ccrSections[data.violation_type] || data.ccr_section

    // Generate appropriate consequences based on violation history
    let consequences = ''
    if (data.previous_violations_count === 0) {
      consequences = 'Continued non-compliance may result in additional notices, fines as outlined in our governing documents, and potential legal action to ensure compliance.'
    } else if (data.previous_violations_count === 1) {
      consequences = 'As this is a repeat violation, failure to comply within the specified timeframe may result in monetary fines starting at $50 per day until resolved, and potential legal action.'
    } else {
      consequences = 'Due to the history of violations at this property, immediate compliance is required. Failure to remedy this violation may result in accelerated enforcement actions, including daily fines, legal proceedings, and potential liens against the property.'
    }

    // Generate the professional violation letter
    const letter = `${data.hoa_name}
${data.manager_name}, ${data.manager_title}
[HOA Address]
[City, State ZIP]
[Phone] | [Email]

${currentDate}

${data.resident_name}
${data.property_address}

RE: Notice of Violation - ${data.violation_type} - Case #${caseNumber}

Dear ${data.resident_name.split(' ')[0] ? `Mr./Ms. ${data.resident_name.split(' ').slice(-1)[0]}` : data.resident_name},

This letter serves as formal notice that your property located at ${data.property_address} is currently in violation of our community's Covenants, Conditions, and Restrictions (CC&Rs) and/or established community guidelines.

**VIOLATION DETAILS:**
• Violation Type: ${data.violation_type}
• Date Observed: ${data.violation_date}
• Specific Description: ${data.violation_description}
• Governing Document Reference: ${relevantSection}
${data.photo_attached ? '• Photographic documentation has been attached for your reference' : ''}
${data.previous_violations_count > 0 ? `• Previous Violations: ${data.previous_violations_count} similar violation(s) on record` : ''}

**REQUIRED CORRECTIVE ACTION:**
You are hereby required to remedy this violation and bring your property into full compliance with community standards. The specific corrective measures needed are clearly outlined in the violation description above. All work must be completed to the satisfaction of the HOA management and in accordance with our established guidelines.

**COMPLIANCE DEADLINE:**
You have ${deadlineDays} (${deadlineDays}) calendar days from the date of this notice, until ${formattedDeadline}, to complete the necessary corrective actions. This timeline has been established based on the nature of the violation and allows reasonable time for resolution.

**CONSEQUENCES OF NON-COMPLIANCE:**
${consequences}

**ASSISTANCE AND COMMUNICATION:**
We understand that circumstances may arise that could affect your ability to address this matter within the specified timeframe. If you require clarification regarding the violation, need assistance understanding the requirements, or wish to discuss a reasonable extension due to extenuating circumstances, please contact our office immediately at [phone number] or [email address].

**APPEAL PROCESS:**
If you believe this violation notice has been issued in error or wish to contest the determination, you have the right to request a hearing before the HOA Board. Written requests for appeal must be submitted within 10 days of receiving this notice and should include supporting documentation for your position.

**COMMUNITY COMMITMENT:**
Our community's property values and quality of life depend on all residents' cooperation in maintaining our established standards. We appreciate your prompt attention to this matter and your continued commitment to our community guidelines.

Please retain this notice for your records and contact our office once the corrective actions have been completed so that we may schedule a compliance inspection.

Thank you for your immediate attention to this matter.

Sincerely,

${data.manager_name}
${data.manager_title}
${data.hoa_name}

---
**LEGAL NOTICE:** This notice is issued in accordance with the authority granted to the HOA under the recorded CC&Rs, Bylaws, and applicable state law. Failure to comply may result in enforcement actions as permitted by law and the governing documents.

**ATTACHMENTS:**
${data.photo_attached ? '• Photographic Evidence of Violation' : '• None'}
• Copy of Relevant CC&R Section
• Community Guidelines Reference

**CASE REFERENCE:** ${caseNumber}
**PRIORITY LEVEL:** ${data.severity_level.toUpperCase()}
**STATE COMPLIANCE:** This notice complies with ${data.state} HOA regulations and fair housing requirements.`

    return letter
  }
}

export class ComplaintReplyAgent {
  private static readonly ULTRA_DETAILED_PROMPT = `
ROLE: You are a master community relations specialist and customer service expert with extensive experience in conflict resolution, community management, and diplomatic communication. You excel at de-escalating tensions while maintaining professional boundaries and HOA authority.

CONTEXT: You are crafting responses to resident complaints, concerns, or inquiries submitted to the HOA management. Your responses must balance empathy with policy enforcement, maintain community harmony, and provide constructive solutions.

TONE GUIDELINES:
- Empathetic and understanding while maintaining professionalism
- Acknowledge concerns without admitting fault or liability
- Solution-focused and action-oriented
- Diplomatic but clear about policies and limitations
- Maintain authority while being approachable
`

  static async generateComplaintReply(data: ComplaintData): Promise<string> {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    // Generate case number for tracking
    const caseNumber = ViolationLetterAgent.generateCaseNumber()

    const reply = `${data.hoa_name}
${data.manager_name}, Community Manager
[HOA Address]
[City, State ZIP]
[Phone] | [Email]

${currentDate}

Dear ${data.resident_name},

Thank you for taking the time to bring your concerns to our attention regarding ${data.complaint_category}. We value all resident feedback as it helps us maintain and improve our community standards and services.

**YOUR CONCERN:**
We have carefully reviewed your inquiry submitted on ${data.date_received}, and we understand your concerns about: ${data.complaint_text}

**OUR RESPONSE:**
[This section would be customized based on the specific complaint category and content]

**NEXT STEPS:**
Expected Resolution Timeline: ${data.expected_resolution_time}
Case Reference Number: ${caseNumber}

We will keep you informed of our progress and contact you with updates as we work toward a resolution. If you have any additional questions or concerns, please don't hesitate to reach out to our office.

Thank you for your patience and for being a valued member of our community.

Best regards,

${data.manager_name}
Community Manager
${data.hoa_name}

**CASE REFERENCE:** ${caseNumber}
**PRIORITY LEVEL:** ${data.priority_level.toUpperCase()}`

    return reply
  }
}

// Utility functions for AI agent integration
export const aiAgentUtils = {
  validateViolationData: (data: Partial<ViolationData>): string[] => {
    const errors: string[] = []
    const required = ['hoa_name', 'property_address', 'resident_name', 'violation_type', 'violation_description']
    
    required.forEach(field => {
      if (!data[field as keyof ViolationData]) {
        errors.push(`${field} is required`)
      }
    })
    
    return errors
  },

  formatViolationForDB: (data: ViolationData, generatedLetter: string) => ({
    resident_name: data.resident_name,
    resident_address: data.property_address,
    violation_type: data.violation_type,
    violation_description: data.violation_description,
    gpt_letter: generatedLetter,
    status: 'draft' as const,
    notes: `Generated via AI Agent - Case: ${ViolationLetterAgent.generateCaseNumber()}`
  }),

  estimateTokenCount: (text: string): number => {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4)
  }
}