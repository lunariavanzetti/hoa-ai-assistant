// OpenAI API integration for HOA AI Assistant
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  console.warn('OpenAI API key not found. AI features will not work.')
}

interface ViolationData {
  hoaName: string
  propertyAddress: string
  residentName: string
  violationType: string
  violationDescription: string
  violationDate: string
  previousViolationsCount?: number
  ccrSection?: string
  managerName: string
  managerTitle?: string
  photoAttached?: boolean
  severityLevel?: 'low' | 'medium' | 'high' | 'urgent'
  state?: string
}

interface ComplaintData {
  hoaName: string
  residentName: string
  complaintCategory: string
  complaintText: string
  priorityLevel: string
  previousComplaints?: number
  managerName: string
  dateReceived: string
  relatedPolicies?: string
  resolutionTimeline?: string
}

interface OpenAIResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

class OpenAIService {
  private apiKey: string

  constructor() {
    this.apiKey = OPENAI_API_KEY || ''
  }

  private async makeRequest(messages: Array<{ role: string; content: string }>, temperature = 0.7): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages,
          temperature,
          max_tokens: 2000,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const data: OpenAIResponse = await response.json()
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response generated from OpenAI')
      }

      return data.choices[0].message.content
    } catch (error) {
      console.error('OpenAI API request failed:', error)
      throw error
    }
  }

  async generateViolationLetter(violationData: ViolationData): Promise<string> {
    const prompt = `
ROLE: You are an expert HOA legal compliance officer and professional communication specialist with 15+ years of experience in property management and community association law. You have extensive knowledge of HOA bylaws, state regulations, fair housing laws, and professional correspondence standards.

CONTEXT: You are generating formal violation notices for homeowners associations. These letters must be legally compliant, professionally written, respectful yet firm, and follow established legal protocols to ensure enforceability.

VIOLATION DATA:
- HOA Name: ${violationData.hoaName}
- Property Address: ${violationData.propertyAddress}
- Resident Name: ${violationData.residentName}
- Violation Type: ${violationData.violationType}
- Violation Description: ${violationData.violationDescription}
- Date Observed: ${violationData.violationDate}
- Previous Violations: ${violationData.previousViolationsCount || 0}
- CC&R Section: ${violationData.ccrSection || 'General Community Guidelines'}
- Manager Name: ${violationData.managerName}
- Manager Title: ${violationData.managerTitle || 'Community Manager'}
- Photo Evidence: ${violationData.photoAttached ? 'Yes' : 'No'}
- Severity Level: ${violationData.severityLevel || 'medium'}
- State: ${violationData.state || 'N/A'}

REQUIREMENTS:
1. **Legal Compliance**: Ensure all language complies with fair housing laws and state regulations
2. **Professional Tone**: Maintain respectful, diplomatic, but authoritative language
3. **Clear Structure**: Follow proper business letter format with clear sections
4. **Actionable Steps**: Provide specific, measurable correction requirements
5. **Timeline**: Include reasonable but firm deadlines for compliance
6. **Escalation Path**: Clearly outline consequences of non-compliance
7. **Documentation**: Reference relevant HOA documents and governing rules

OUTPUT FORMAT:
Generate a complete, professionally formatted violation letter that includes:
- Proper letterhead format
- Date and addressee information
- Subject line with violation reference number
- Body paragraphs with violation details, requirements, and timeline
- Professional closing with manager signature block
- Attachments list if applicable

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

Generate the complete letter now with all required elements and professional formatting.
`

    const messages = [
      {
        role: 'system',
        content: 'You are a professional HOA legal compliance officer generating formal violation notices. Always maintain legal compliance and professional standards.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]

    return await this.makeRequest(messages, 0.3) // Lower temperature for more consistent legal documents
  }

  async generateComplaintResponse(complaintData: ComplaintData): Promise<string> {
    const prompt = `
ROLE: You are a master community relations specialist and customer service expert with extensive experience in conflict resolution, community management, and diplomatic communication. You excel at de-escalating tensions while maintaining professional boundaries and HOA authority.

CONTEXT: You are crafting responses to resident complaints, concerns, or inquiries submitted to the HOA management. Your responses must balance empathy with policy enforcement, maintain community harmony, and provide constructive solutions.

COMPLAINT DATA:
- HOA Name: ${complaintData.hoaName}
- Resident Name: ${complaintData.residentName}
- Complaint Category: ${complaintData.complaintCategory}
- Complaint Text: ${complaintData.complaintText}
- Priority Level: ${complaintData.priorityLevel}
- Previous Complaints: ${complaintData.previousComplaints || 0}
- Manager Name: ${complaintData.managerName}
- Date Received: ${complaintData.dateReceived}
- Related Policies: ${complaintData.relatedPolicies || 'General Community Guidelines'}
- Resolution Timeline: ${complaintData.resolutionTimeline || '5-7 business days'}

RESPONSE OBJECTIVES:
1. **Acknowledge and Validate**: Show understanding of resident's concerns
2. **Provide Clear Information**: Explain relevant policies, procedures, or next steps
3. **Offer Solutions**: Present actionable resolution paths when possible
4. **Maintain Authority**: Uphold HOA policies while being helpful
5. **Build Relationships**: Strengthen community bonds through positive communication
6. **Document Follow-up**: Establish clear next steps and accountability

Generate a professional, empathetic response that addresses the resident's concerns while maintaining HOA policies and community standards.
`

    const messages = [
      {
        role: 'system',
        content: 'You are a professional community relations specialist crafting diplomatic responses to resident complaints.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]

    return await this.makeRequest(messages, 0.5)
  }

  async generateMeetingSummary(transcript: string, meetingType: string, meetingDate: string, hoaName: string): Promise<string> {
    const prompt = `
ROLE: You are an expert corporate secretary and professional meeting transcriptionist with specialized expertise in HOA governance, Roberts Rules of Order, and community association management.

CONTEXT: You are creating official meeting minutes from the provided transcript. These minutes will serve as legal documents and permanent records of board decisions, discussions, and actions taken.

MEETING DATA:
- HOA Name: ${hoaName}
- Meeting Type: ${meetingType}
- Meeting Date: ${meetingDate}
- Transcript: ${transcript}

Create comprehensive, legally compliant meeting minutes that include:
1. Header information with meeting details
2. Attendance and quorum status
3. Approval of previous minutes
4. Reports from officers and committees
5. Old business items
6. New business items
7. Motions, votes, and decisions
8. Action items with responsible parties
9. Executive session notes (if applicable)
10. Adjournment details

Follow proper parliamentary procedure documentation and maintain professional tone throughout.
`

    const messages = [
      {
        role: 'system',
        content: 'You are a professional corporate secretary creating official HOA meeting minutes.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]

    return await this.makeRequest(messages, 0.2)
  }

  async generateMonthlyReport(_reportData: any): Promise<string> {
    const prompt = `
ROLE: You are a senior data analytics specialist and executive reporting expert with extensive experience in HOA management, financial analysis, and community performance metrics.

CONTEXT: You are creating comprehensive monthly performance reports that synthesize all HOA activities, financials, and operational metrics into executive-level summaries for board review, homeowner communication, and strategic planning.

Generate a comprehensive monthly report with executive summary, operational metrics, financial analysis, compliance status, and strategic recommendations.
`

    const messages = [
      {
        role: 'system',
        content: 'You are a senior analytics specialist creating executive-level HOA performance reports.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]

    return await this.makeRequest(messages, 0.4)
  }
}

export const openAIService = new OpenAIService()
export type { ViolationData, ComplaintData }