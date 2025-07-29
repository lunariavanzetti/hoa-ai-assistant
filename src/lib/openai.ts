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

interface MeetingData {
  hoaName: string
  meetingType: string
  meetingDate: string
  meetingTime: string
  meetingLocation: string
  transcriptContent: string
  attendees: string
  boardMembers: string
  quorumMet: boolean
  previousMinutesApproved: boolean
  meetingDuration: string
}

interface MonthlyReportData {
  hoaName: string
  reportPeriod: string
  totalUnits: number
  occupiedUnits: number
  boardMembers: string
  managementCompany: string
  violationsData: string
  complaintsData: string
  financialData: string
  maintenanceData: string
  meetingData: string
  complianceData: string
  communityEvents: string
  vendorData: string
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

  async generateMeetingSummary(meetingData: MeetingData): Promise<string> {
    const prompt = `
ROLE: You are an expert corporate secretary and professional meeting transcriptionist with specialized expertise in HOA governance, Roberts Rules of Order, and community association management. You have 20+ years of experience creating accurate, comprehensive meeting minutes for board meetings and homeowner assemblies.

CONTEXT: You are creating official meeting minutes from audio transcripts or recordings of HOA board meetings, annual meetings, or special sessions. These minutes will serve as legal documents and permanent records of board decisions, discussions, and actions taken.

MEETING DATA:
- HOA Name: ${meetingData.hoaName}
- Meeting Type: ${meetingData.meetingType}
- Meeting Date: ${meetingData.meetingDate}
- Meeting Time: ${meetingData.meetingTime}
- Location/Platform: ${meetingData.meetingLocation}
- Transcript/Audio: ${meetingData.transcriptContent}
- Attendees List: ${meetingData.attendees}
- Board Members Present: ${meetingData.boardMembers}
- Quorum Status: ${meetingData.quorumMet ? 'Met' : 'Not Met'}
- Previous Minutes: ${meetingData.previousMinutesApproved ? 'Approved' : 'Not Approved'}
- Meeting Duration: ${meetingData.meetingDuration}

REQUIREMENTS FOR OFFICIAL MINUTES:
1. **Legal Compliance**: Follow state laws and HOA bylaws for minute requirements
2. **Accuracy**: Ensure all motions, votes, and decisions are precisely recorded
3. **Objectivity**: Maintain neutral tone, avoid editorial comments or interpretations
4. **Completeness**: Include all required elements per governing documents
5. **Clarity**: Write in clear, professional language accessible to all homeowners
6. **Action Items**: Clearly identify follow-up tasks and responsible parties
7. **Voting Records**: Document all votes with member names and positions

STANDARD MINUTE STRUCTURE:
1. **Header Information**
   - HOA name and meeting type
   - Date, time, and location
   - Type of meeting (regular, special, annual, etc.)

2. **Attendance**
   - Board members present and absent
   - Management company representatives
   - Homeowners present (count or names for small meetings)
   - Legal counsel or other professionals
   - Quorum status confirmation

3. **Call to Order**
   - Time meeting was called to order
   - Who presided over the meeting

4. **Approval of Previous Minutes**
   - Motion to approve previous meeting minutes
   - Any corrections noted
   - Vote results

5. **Reports**
   - President's report
   - Treasurer's report with financial highlights
   - Committee reports
   - Management company report
   - Any other officer reports

6. **Old Business**
   - Follow-up on previous action items
   - Ongoing projects or issues
   - Status updates on pending matters

7. **New Business**
   - New issues or proposals presented
   - Discussion summaries (key points, not verbatim)
   - Motions made, seconded, and voted upon
   - Action items assigned with responsible parties

8. **Executive Session** (if applicable)
   - Time entered and exited
   - General topics discussed (maintaining confidentiality)
   - Any actions taken

9. **Adjournment**
   - Time of adjournment
   - Next meeting date and time

MOTION RECORDING REQUIREMENTS:
For each motion, include:
- Exact wording of the motion
- Who made the motion
- Who seconded the motion
- Brief summary of discussion (major points only)
- Vote count (For/Against/Abstain)
- Individual voting positions if required by bylaws
- Whether motion passed or failed

WRITING STYLE GUIDELINES:
- Use third person, past tense throughout
- Write in complete sentences with proper grammar
- Use formal business language
- Avoid first-person references
- Keep discussions summaries concise but complete
- Use active voice when possible
- Maintain consistent formatting throughout

CONFIDENTIALITY CONSIDERATIONS:
- Exclude specific homeowner names in disciplinary matters
- Summarize legal discussions without revealing strategy
- Protect privacy while maintaining transparency
- Follow state open meeting laws and HOA bylaws

ACTION ITEM TRACKING:
For each action item, specify:
- Specific task or deliverable
- Person or committee responsible
- Target completion date
- Follow-up method or deadline

FINANCIAL INFORMATION INCLUSION:
- Budget variances and explanations
- Major expenditure approvals
- Assessment or fee changes
- Reserve fund status updates
- Audit results or financial reviews

FORMATTING REQUIREMENTS:
- Use consistent numbering and bullet points
- Include page numbers and date on each page
- Use professional fonts and spacing
- Create clear section headers
- Include signature lines for secretary approval

OUTPUT INSTRUCTIONS:
Create comprehensive, legally compliant meeting minutes that:
- Capture all essential information accurately
- Follow proper parliamentary procedure documentation
- Maintain professional tone throughout
- Include all required legal elements
- Provide clear action item tracking
- Support transparency and governance objectives

Generate complete meeting minutes now, ensuring all elements are included and properly formatted for official HOA records.
`

    const messages = [
      {
        role: 'system',
        content: 'You are an expert corporate secretary and professional meeting transcriptionist with 20+ years of experience creating accurate, comprehensive meeting minutes for HOA governance.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]

    return await this.makeRequest(messages, 0.1) // Very low temperature for precise, consistent legal documents
  }

  async generateMonthlyReport(reportData: MonthlyReportData): Promise<string> {
    const prompt = `
ROLE: You are a senior data analytics specialist and executive reporting expert with extensive experience in HOA management, financial analysis, and community performance metrics. You excel at transforming raw operational data into compelling, actionable insights for board members and stakeholders.

CONTEXT: You are creating comprehensive monthly performance reports that synthesize all HOA activities, financials, and operational metrics into executive-level summaries for board review, homeowner communication, and strategic planning.

REPORT DATA INPUTS:
- HOA Name: ${reportData.hoaName}
- Report Month/Year: ${reportData.reportPeriod}
- Total Units: ${reportData.totalUnits}
- Occupied Units: ${reportData.occupiedUnits}
- Board Members: ${reportData.boardMembers}
- Management Company: ${reportData.managementCompany}
- Violations Data: ${reportData.violationsData}
- Complaints Data: ${reportData.complaintsData}
- Financial Data: ${reportData.financialData}
- Maintenance Data: ${reportData.maintenanceData}
- Meeting Data: ${reportData.meetingData}
- Compliance Data: ${reportData.complianceData}
- Community Events: ${reportData.communityEvents}
- Vendor Performance: ${reportData.vendorData}

COMPREHENSIVE REPORT SECTIONS:

## 1. EXECUTIVE SUMMARY
**Objective**: Provide C-level overview of community health and performance
**Content Requirements**:
- Overall community satisfaction score/trends
- Key performance indicators vs. targets
- Major accomplishments and challenges
- Financial health snapshot
- Strategic priorities for next month
- Board decision items requiring attention

## 2. OPERATIONAL METRICS DASHBOARD
**Violation Management**:
- Total violations issued: [number] (vs. previous month: +/-%)
- Violation categories breakdown with percentages
- Average resolution time: [days]
- Compliance rate: [percentage]
- Repeat violations: [number and percentage]
- Outstanding violations by age: 0-30, 31-60, 60+ days

**Complaint Resolution**:
- Total complaints received: [number]
- Complaint categories (maintenance, neighbor, policy, amenity)
- Average response time: [hours/days]
- Resolution rate: [percentage]
- Satisfaction ratings (if collected)
- Escalated complaints: [number]

**Communication Effectiveness**:
- Emails sent to residents: [number]
- Website visits: [number]
- Document downloads: [number]
- Meeting attendance rates: [percentage]
- Survey response rates: [percentage]

## 3. FINANCIAL PERFORMANCE ANALYSIS
**Revenue Analysis**:
- Assessment collections: [amount] ([percentage] of budgeted)
- Collection rate: [percentage]
- Outstanding receivables: [amount] (aging analysis)
- Late fees collected: [amount]
- Special assessment status: [if applicable]

**Expense Management**:
- Total expenses: [amount] (vs. budget: +/-[amount])
- Major expense categories breakdown
- Vendor performance and cost analysis
- Emergency repairs: [amount]
- Capital improvements: [amount]

**Reserve Fund Status**:
- Beginning balance: [amount]
- Contributions: [amount]
- Expenditures: [amount]
- Ending balance: [amount]
- Reserve study compliance: [percentage funded]

## 4. MAINTENANCE & FACILITIES REPORT
**Maintenance Requests**:
- Total requests: [number]
- Emergency vs. routine breakdown
- Average completion time by category
- Resident satisfaction scores
- Preventive maintenance completion rate

**Vendor Performance**:
- Vendor scorecard (quality, timeliness, cost)
- Contract compliance rates
- Insurance and licensing status
- Cost per service type analysis

**Facility Utilization**:
- Amenity usage statistics
- Maintenance costs per amenity
- Resident feedback and suggestions
- Capital improvement needs identified

## 5. COMPLIANCE & GOVERNANCE
**Regulatory Compliance**:
- Insurance policy status and coverage
- License and permit renewals
- Legal matters status
- Audit findings and remediation
- Policy updates and implementations

**Board Governance**:
- Meeting attendance rates
- Decision implementation tracking
- Committee activity summaries
- Training and education completed
- Strategic plan progress

## 6. COMMUNITY ENGAGEMENT METRICS
**Resident Participation**:
- Event attendance numbers
- Volunteer participation rates
- Committee membership levels
- Communication engagement rates
- Feedback and suggestion tracking

**Community Health Indicators**:
- Neighbor dispute frequency
- Amenity satisfaction scores
- Architectural review requests
- Home sales and market trends
- New resident integration success

## 7. FORWARD-LOOKING ANALYSIS
**Trend Analysis**:
- Year-over-year comparison charts
- Seasonal pattern identification
- Predictive indicators for issues
- Performance trend trajectories

**Strategic Recommendations**:
- Priority action items for next month
- Resource allocation suggestions
- Policy or procedure updates needed
- Long-term planning considerations
- Risk mitigation strategies

**Next Month Outlook**:
- Scheduled major projects
- Anticipated challenges
- Budget considerations
- Board decision requirements
- Community events planned

REPORT FORMATTING REQUIREMENTS:
- Professional, clean layout with consistent branding
- Executive summary limited to 1 page
- Data visualizations (charts, graphs) for key metrics
- Color-coded performance indicators (green/yellow/red)
- Appendices for detailed supporting data
- Page numbers and date stamps
- Board approval signature lines

TONE AND STYLE:
- Professional, data-driven, and objective
- Highlight both successes and areas for improvement
- Use action-oriented language for recommendations
- Balance detail with accessibility for various stakeholder levels
- Maintain consistent terminology and definitions
- Include contextual explanations for complex metrics

DELIVERABLE FORMAT:
Generate a comprehensive monthly report that serves as both an operational dashboard and strategic planning tool, providing board members and stakeholders with clear insights into community performance and actionable recommendations for continuous improvement.
`

    const messages = [
      {
        role: 'system',
        content: 'You are a senior data analytics specialist and executive reporting expert with extensive experience in HOA management, financial analysis, and community performance metrics.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]

    return await this.makeRequest(messages, 0.3) // Balanced temperature for analytical yet readable reports
  }
}

export const openAIService = new OpenAIService()
export type { ViolationData, ComplaintData, MeetingData, MonthlyReportData }