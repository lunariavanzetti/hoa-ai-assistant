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

interface DataMonitorData {
  hoaName: string
  monitoringPeriod: string
  usageMetrics: string
  securityIncidents: string
  financialAnomalies: string
  userBehaviorPatterns: string
  systemPerformance: string
  complianceStatus: string
  threatLevel: string
  alertsGenerated: string
  actionsTaken: string
}

interface OnboardingData {
  userName: string
  userEmail: string
  subscriptionTier: string
  hoaSize: string
  experienceLevel: string
  registrationDate: string
  initialUsage: string
  location: string
  referralSource: string
  demoPreferences: string
  onboardingPhase: string
  triggerEvent: string
  daysSinceRegistration: number
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

  async generateSecurityAnalysis(monitorData: DataMonitorData): Promise<string> {
    const prompt = `
ROLE: You are a senior cybersecurity analyst and data protection specialist with 15+ years of experience in enterprise security monitoring, fraud detection, risk assessment, and regulatory compliance. You specialize in continuous monitoring systems for SaaS platforms, with expertise in threat detection, behavioral analysis, and automated security response protocols.

CONTEXT: You are continuously monitoring the HOA AI Assistant platform for usage patterns, potential abuse, security threats, billing irregularities, and compliance violations. Your analysis helps maintain platform integrity, protect user data, prevent fraud, and ensure optimal system performance while maintaining the highest security standards.

MONITORING DATA INPUTS:
- HOA Name: ${monitorData.hoaName}
- Monitoring Period: ${monitorData.monitoringPeriod}
- Usage Metrics: ${monitorData.usageMetrics}
- Security Incidents: ${monitorData.securityIncidents}
- Financial Anomalies: ${monitorData.financialAnomalies}
- User Behavior Patterns: ${monitorData.userBehaviorPatterns}
- System Performance: ${monitorData.systemPerformance}
- Compliance Status: ${monitorData.complianceStatus}
- Current Threat Level: ${monitorData.threatLevel}
- Alerts Generated: ${monitorData.alertsGenerated}
- Actions Taken: ${monitorData.actionsTaken}

PRIMARY MONITORING CATEGORIES:

## 1. USAGE ABUSE DETECTION
**API Rate Limiting Violations**:
- Analyze API call patterns for suspicious spikes
- Identify potential bot activity or automated abuse
- Monitor for distributed attack patterns across multiple accounts
- Flag accounts exceeding reasonable usage thresholds

**Account Sharing & Multi-tenancy Violations**:
- Detect multiple simultaneous logins from different geographic locations
- Identify shared credentials across organizations
- Monitor for unusual authentication patterns
- Flag accounts with inconsistent usage profiles

**Feature Exploitation**:
- Track excessive AI letter generation beyond subscription limits
- Monitor for bulk processing that violates terms of service
- Identify attempts to reverse-engineer AI prompts or responses
- Detect systematic content extraction or scraping attempts

## 2. SECURITY THREAT DETECTION
**Authentication Security**:
- Monitor failed login attempts and brute force patterns
- Detect credential stuffing attacks across multiple accounts
- Identify suspicious OAuth integration attempts
- Track session hijacking indicators and unusual access patterns

**Data Exfiltration Monitoring**:
- Analyze download patterns for bulk data extraction
- Monitor API responses for sensitive information leakage
- Track unusual document generation and export activities
- Identify potential insider threats from user behavior changes

**Injection Attack Prevention**:
- Scan AI prompt inputs for malicious code injection attempts
- Monitor for SQL injection patterns in form submissions
- Detect XSS attempts in user-generated content
- Identify attempts to manipulate AI responses through prompt engineering

**Infrastructure Security**:
- Monitor server resource utilization for DDoS indicators
- Detect unusual database query patterns
- Track file upload attempts for malware or oversized files
- Identify potential system vulnerability exploitation attempts

## 3. FINANCIAL MONITORING
**Billing Fraud Detection**:
- Analyze subscription upgrade/downgrade patterns for abuse
- Monitor for payment method cycling or card testing
- Detect chargeback fraud patterns and subscription manipulation
- Identify unusual refund request patterns

**Resource Cost Optimization**:
- Track AI token usage against subscription tiers
- Monitor server costs for anomalous spikes
- Analyze storage usage patterns for potential abuse
- Identify inefficient resource allocation patterns

**Revenue Protection**:
- Detect subscription sharing across multiple HOAs
- Monitor for unauthorized access to premium features
- Track license compliance and usage rights violations
- Identify potential revenue leakage through system exploits

## 4. OPERATIONAL MONITORING
**System Performance Analysis**:
- Monitor response times and identify performance degradation
- Track error rates and identify system reliability issues
- Analyze user experience metrics and satisfaction indicators
- Detect capacity planning needs and scaling requirements

**Data Quality Assessment**:
- Monitor AI output quality and consistency
- Track user satisfaction with generated content
- Identify training data quality issues
- Detect potential AI model drift or performance degradation

**Compliance Monitoring**:
- Ensure GDPR, CCPA, and SOC2 compliance requirements
- Track data retention and deletion compliance
- Monitor user consent management and privacy settings
- Detect potential regulatory compliance violations

AUTOMATED ALERT THRESHOLDS:

**CRITICAL ALERTS (Immediate Response Required)**:
- Active data breach or unauthorized access detected
- System compromise or malware infection identified
- Multiple failed authentication attempts from same IP (>50/hour)
- Unusual financial transactions exceeding $10,000
- Complete system downtime or critical service failure
- Legal compliance violation with regulatory implications

**HIGH PRIORITY ALERTS (Response Within 2 Hours)**:
- Suspicious user behavior patterns indicating potential fraud
- API abuse exceeding 500% of normal usage patterns
- Security vulnerability discovered in system components
- Billing discrepancies exceeding $1,000
- Performance degradation affecting >10% of users
- Unauthorized access attempts to admin functions

**MEDIUM PRIORITY ALERTS (Response Within 24 Hours)**:
- Usage patterns suggesting subscription tier violations
- Content quality degradation in AI outputs
- User complaints about system performance or security
- Minor billing reconciliation issues
- Non-critical security patches required
- Capacity planning thresholds reached

**LOW PRIORITY ALERTS (Weekly Review)**:
- General usage trend analysis and reporting
- Performance optimization opportunities
- User experience improvement recommendations
- Cost optimization suggestions
- Compliance documentation updates needed

THREAT CLASSIFICATION SYSTEM:

**THREAT LEVEL 5 - CRITICAL**:
Active security breach, data theft, or system compromise requiring immediate incident response, law enforcement notification, and customer communication.

**THREAT LEVEL 4 - HIGH**:
Significant security threat, potential fraud, or major system vulnerability requiring urgent investigation and remediation within 4 hours.

**THREAT LEVEL 3 - ELEVATED**:
Suspicious activity patterns, minor security vulnerabilities, or operational issues requiring investigation and response within 24 hours.

**THREAT LEVEL 2 - MODERATE**:
Anomalous but non-threatening patterns requiring monitoring and potential preventive action within 48 hours.

**THREAT LEVEL 1 - LOW**:
Baseline monitoring with no immediate threats identified, routine system health and performance tracking.

RESPONSE PROTOCOLS:

**IMMEDIATE ACTIONS (0-15 minutes)**:
- Isolate affected systems or accounts
- Implement emergency access controls
- Notify security team and management
- Document incident with timestamps
- Preserve evidence for forensic analysis

**SHORT-TERM ACTIONS (15 minutes - 4 hours)**:
- Conduct detailed threat assessment
- Implement targeted security measures
- Notify affected customers if required
- Coordinate with legal and compliance teams
- Begin remediation procedures

**LONG-TERM ACTIONS (4-48 hours)**:
- Complete comprehensive security review
- Implement permanent fixes and improvements
- Update security policies and procedures
- Conduct post-incident analysis
- Update monitoring rules and thresholds

OUTPUT REQUIREMENTS:
Generate a comprehensive security analysis report that includes:

1. **Executive Summary**: Current threat level, critical findings, and immediate actions required
2. **Detailed Threat Analysis**: Specific security incidents, patterns, and risk assessments
3. **Operational Health Dashboard**: System performance, user satisfaction, and resource utilization
4. **Financial Security Review**: Billing integrity, fraud detection results, and revenue protection
5. **Compliance Status**: Regulatory adherence, policy compliance, and audit readiness
6. **Automated Response Actions**: Systems deployed, accounts flagged, and preventive measures activated
7. **Strategic Recommendations**: Long-term security improvements, policy updates, and risk mitigation strategies
8. **Forward-Looking Threat Intelligence**: Predicted risks, emerging threats, and proactive monitoring adjustments

TONE AND APPROACH:
- Professional, data-driven, and technically precise
- Balanced between technical detail and executive accessibility
- Action-oriented with clear priorities and timelines
- Objective and evidence-based in threat assessments
- Confident but appropriately cautious in recommendations
- Focus on both immediate security and long-term platform health

Generate the comprehensive security analysis now, ensuring all monitoring categories are addressed and actionable intelligence is provided for platform protection and optimization.
`

    const messages = [
      {
        role: 'system',
        content: 'You are a senior cybersecurity analyst and data protection specialist with 15+ years of experience in enterprise security monitoring, fraud detection, and regulatory compliance.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]

    return await this.makeRequest(messages, 0.2) // Lower temperature for precise, consistent security analysis
  }

  async generateOnboardingContent(onboardingData: OnboardingData): Promise<string> {
    const prompt = `
ROLE: You are a master customer success strategist and onboarding specialist with expertise in SaaS user adoption, behavior psychology, and educational content design. You excel at creating personalized user journeys that maximize feature adoption, reduce churn, and build long-term customer loyalty.

CONTEXT: You are designing and executing comprehensive onboarding experiences for new HOA AI Assistant users, focusing on rapid value realization, feature discovery, and long-term engagement. Your goal is to transform new signups into power users within their first 30 days.

USER PROFILE DATA:
- User Name: ${onboardingData.userName}
- Email: ${onboardingData.userEmail}
- Subscription Tier: ${onboardingData.subscriptionTier}
- HOA Size: ${onboardingData.hoaSize}
- Experience Level: ${onboardingData.experienceLevel}
- Registration Date: ${onboardingData.registrationDate}
- Initial Usage Patterns: ${onboardingData.initialUsage}
- Geographic Location: ${onboardingData.location}
- Referral Source: ${onboardingData.referralSource}
- Demo Preferences: ${onboardingData.demoPreferences}
- Current Onboarding Phase: ${onboardingData.onboardingPhase}
- Trigger Event: ${onboardingData.triggerEvent}
- Days Since Registration: ${onboardingData.daysSinceRegistration}

## COMPREHENSIVE ONBOARDING JOURNEY:

### PHASE 1: WELCOME & IMMEDIATE VALUE (Days 1-3)

**Day 1 - Welcome & Quick Win**
**Trigger**: Account creation confirmed
**Objective**: Deliver immediate value and build confidence

Email Subject: "Welcome to HOA AI Assistant! Your first violation letter is 3 clicks away 🏠"

Content Strategy:
- Personal welcome with user's name and HOA information
- Highlight #1 time-saving benefit specific to their subscription tier
- Provide 1-click access to most popular feature (Violation Letter Generator)
- Include 60-second video showing exact steps for first letter
- Offer live demo scheduling option
- Set expectations for onboarding series

**Day 2 - Feature Discovery**
**Trigger**: 24 hours after registration OR first feature use
**Objective**: Expand feature awareness and usage

Email Subject: "{{user_name}}, discover your time-saving toolkit"

Content Strategy:
- Personalized dashboard tour based on their HOA size
- Showcase 3 core features with specific use cases
- Include templates and examples relevant to their property type
- Provide quick-start guides with step-by-step screenshots
- Highlight subscription tier benefits they're not using yet

**Day 3 - Community & Support**
**Trigger**: 72 hours after registration
**Objective**: Build confidence and reduce anxiety

Email Subject: "You're not alone - join 500+ HOA managers saving 10+ hours/week"

Content Strategy:
- Share customer success stories from similar HOA sizes
- Introduce support resources (help docs, chat, email)
- Highlight community features or user groups
- Provide advanced tips for power users
- Include FAQ addressing common first-week questions

### PHASE 2: SKILL BUILDING & ADOPTION (Days 4-14)

**Day 7 - Weekly Progress Check**
**Trigger**: 7 days after registration
**Objective**: Celebrate progress and identify gaps

Email Subject: "Week 1 complete! Here's your time saved: {{calculated_time_saved}} minutes"

Content Strategy:
- Personal usage statistics and achievements
- Gamified progress indicators
- Recommendations for next features to try
- Success metrics comparison to peer users
- Invitation to advanced training webinar

**Day 10 - Advanced Features Unlock**
**Trigger**: Basic feature usage confirmed OR 10 days post-registration
**Objective**: Deepen platform engagement

Email Subject: "Ready for the advanced stuff? Let's automate your monthly reports"

Content Strategy:
- Introduction to premium/advanced features
- Step-by-step workflow setup guides
- ROI calculator showing advanced feature benefits
- Case study of user achieving significant time savings
- Personalized feature recommendations based on usage

**Day 14 - Two-Week Milestone**
**Trigger**: 14 days after registration
**Objective**: Reinforce value and prevent churn

Email Subject: "Two weeks in - you've already saved {{time_saved}} hours!"

Content Strategy:
- Comprehensive usage analytics and achievements
- Before/after comparison of their workflow efficiency
- Advanced tips and hidden features
- Testimonial from similar user about long-term benefits
- Soft upgrade prompt for free tier users

### PHASE 3: MASTERY & RETENTION (Days 15-30)

**Day 21 - Power User Status**
**Trigger**: 21 days after registration OR high engagement score
**Objective**: Create platform advocates and reduce churn risk

Email Subject: "Congratulations! You're officially a HOA AI power user 🚀"

Content Strategy:
- Celebrate their expertise and achievements
- Share advanced workflows and pro tips
- Introduce beta features or early access opportunities
- Invite to customer advisory board or feedback program
- Provide referral incentives and sharing tools

**Day 30 - Monthly Review & Forward Planning**
**Trigger**: 30 days after registration
**Objective**: Demonstrate ROI and plan future success

Email Subject: "Your first month results: {{achievements_summary}}"

Content Strategy:
- Comprehensive monthly performance report
- ROI analysis with time and cost savings
- Goal setting for next month
- Advanced training opportunities
- Loyalty program introduction

### BEHAVIORAL TRIGGER EMAILS:

**Feature Abandonment Recovery**
**Trigger**: Started but didn't complete key feature setup
**Timing**: 24 hours after abandonment

"Stuck on {{feature_name}}? Here's a 2-minute solution"
- Identify specific abandonment point
- Provide targeted help content
- Offer personal assistance
- Simplify the completion process

**Usage Plateau Recovery**
**Trigger**: No activity for 5+ days
**Timing**: Day 6 of inactivity

"Missing you! Here's what's new since your last visit"
- Highlight new features or improvements
- Share relevant customer success story
- Provide re-engagement incentive
- Offer refresher training

**Upgrade Opportunity**
**Trigger**: Approaching or hitting plan limits
**Timing**: 80% of quota used

"You're on fire! Time to unlock unlimited potential"
- Celebrate their success and growth
- Demonstrate upgrade benefits
- Provide limited-time upgrade incentive
- Show ROI of higher tier

### PERSONALIZATION STRATEGIES:

**By HOA Size**:
- Small (50-100 units): Focus on efficiency and cost savings
- Medium (100-300 units): Emphasize scalability and automation
- Large (300+ units): Highlight enterprise features and compliance

**By Experience Level**:
- Beginner: More hand-holding, detailed explanations, basic features
- Intermediate: Focus on workflow optimization, time-saving tips
- Expert: Advanced features, customization, integration opportunities

**By Subscription Tier**:
- Free: Demonstrate value, encourage upgrade, highlight limitations
- Pro: Maximize feature adoption, showcase advanced capabilities
- Agency: Focus on multi-property management, white-label options

### SUCCESS METRICS TRACKING:

**Engagement Metrics**:
- Email open rates and click-through rates
- Feature adoption progression
- Time to first value achievement
- Support ticket volume and resolution

**Business Metrics**:
- Trial to paid conversion rates
- Churn rate by onboarding sequence completion
- Upsell success rates
- Customer lifetime value improvement

**User Experience Metrics**:
- User satisfaction scores
- Feature completion rates
- Time spent in application
- Referral rates and viral coefficient

CONTENT GENERATION REQUIREMENTS:
Based on the user profile data and current onboarding phase, generate specific, personalized onboarding content that includes:

1. **Personalized Email Content**: Subject line, opening, main content, and call-to-action
2. **Behavioral Triggers**: Identify relevant triggers and appropriate responses
3. **Feature Recommendations**: Specific features to promote based on user profile
4. **Success Metrics**: Define success indicators for this user segment
5. **Next Steps**: Clear action items and timeline for progression
6. **Personalization Elements**: Specific customizations based on user data

TONE AND APPROACH:
- Friendly, encouraging, and supportive
- Data-driven and results-focused
- Educational without being overwhelming
- Celebratory of user achievements
- Proactive in addressing potential obstacles
- Clear and actionable in all recommendations

Generate comprehensive, personalized onboarding content that adapts to user behavior, maximizes engagement, and drives long-term success for both users and the platform.
`

    const messages = [
      {
        role: 'system',
        content: 'You are a master customer success strategist and onboarding specialist with expertise in SaaS user adoption, behavior psychology, and educational content design.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]

    return await this.makeRequest(messages, 0.4) // Balanced temperature for personalized, engaging content
  }
}

export const openAIService = new OpenAIService()
export type { ViolationData, ComplaintData, MeetingData, MonthlyReportData, DataMonitorData, OnboardingData }