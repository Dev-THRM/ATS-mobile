export type JobStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'ON_HOLD';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
export type ApplicationStatus = 'ACTIVE' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELED' | 'RESCHEDULED' | 'NO_SHOW';
export type InterviewType = 'SCREENING' | 'TECHNICAL' | 'BEHAVIORAL' | 'SYSTEM_DESIGN' | 'MANAGERIAL' | 'HR_FINAL';

export interface PipelineStage {
  id: string;
  jobId: string;
  name: string;
  order: number;
  _count?: {
    applications: number;
  };
}

export interface Job {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  department?: string;
  location?: string;
  employmentType: EmploymentType;
  status: JobStatus;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  experienceMin?: number;
  experienceMax?: number;
  experienceLevel?: string;
  pipelineStages?: PipelineStage[];
  _count?: {
    applications: number;
    interviews: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  currentCompany?: string;
  currentTitle?: string;
  location?: string;
  skills: string[];
  resumeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  source?: string;
  tags: string[];
  applications?: Application[];
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  organizationId: string;
  candidateId: string;
  candidate: Candidate;
  jobId: string;
  job: Job;
  currentStageId: string;
  currentStage: PipelineStage;
  status: ApplicationStatus;
  atsScore?: number;
  source?: string;
  coverLetter?: string;
  rejectionReason?: string;
  appliedAt: string;
  createdAt: string;
}

export interface Interview {
  id: string;
  organizationId: string;
  applicationId: string;
  candidateId: string;
  jobId: string;
  title: string;
  type: InterviewType;
  status: InterviewStatus;
  scheduledAt: string;
  durationMinutes: number;
  timezone?: string;
  meetingLink?: string;
  googleCalendarHtmlLink?: string;
  locationNotes?: string;
  feedbackRating?: number;
  feedbackNotes?: string;
  candidate: Candidate;
  job: Job;
  interviewer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

export interface AtsDashboardMetrics {
  kpis: {
    openJobs: number;
    totalCandidates: number;
    totalApplications: number;
    scheduledInterviews: number;
    avgAtsScore: number;
  };
  funnel: Array<{ stageName: string; count: number }>;
  sourcing: Array<{ channel: string; count: number }>;
  recentApplications: Application[];
  upcomingInterviews: Interview[];
}
