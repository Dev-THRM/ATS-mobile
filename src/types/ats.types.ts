export type JobStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'ON_HOLD';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
export type ApplicationStatus = 'ACTIVE' | 'HIRED' | 'REJECTED' | 'WITHDRAWN';
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELED' | 'RESCHEDULED' | 'NO_SHOW';
export type InterviewType = 'SCREENING' | 'TECHNICAL' | 'BEHAVIORAL' | 'SYSTEM_DESIGN' | 'MANAGERIAL' | 'HR_FINAL';

export interface PipelineStage {
  id: string;
  jobId?: string;
  name: string;
  order: number;
  stageType?: string;
  isInitial?: boolean;
  isHired?: boolean;
  isRejected?: boolean;
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
    pipelineStages?: number;
    interviews?: number;
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
  tags?: string[];
  metadata?: any;
  applications?: Application[];
  _count?: {
    applications: number;
  };
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
  resumeUrl?: string;
  metadata?: any;
  source?: string;
  coverLetter?: string;
  rejectionReason?: string;
  appliedAt: string;
  createdAt: string;
  interviews?: Interview[];
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
  candidate?: Candidate;
  job?: Job;
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
    activeJobsCount: number;
    totalJobsCount: number;
    totalCandidates: number;
    activeApplications: number;
    hiredCount: number;
    rejectedCount: number;
    upcomingInterviewsCount: number;
  };
  pipelineFunnel?: Array<{ stage: string; count: number }>;
  sourcesBreakdown?: Array<{ source: string; count: number; percentage: number }>;
  recentApplications: Array<{
    id: string;
    candidateName: string;
    candidateEmail: string;
    jobTitle: string;
    department?: string;
    currentStage: string;
    status: string;
    atsScore?: number;
    appliedAt: string;
  }>;
  upcomingInterviews: Array<{
    id: string;
    title: string;
    candidateName: string;
    jobTitle: string;
    scheduledAt: string;
    durationMinutes: number;
    meetingLink?: string;
    interviewer?: string;
  }>;
}

export interface CreateJobInput {
  title: string;
  description: string;
  department?: string;
  location?: string;
  employmentType: EmploymentType;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  experienceMin?: number;
  experienceMax?: number;
  experienceLevel?: string;
  skillsRequired?: string[];
}

export interface CreateCandidateInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  currentCompany?: string;
  currentTitle?: string;
  location?: string;
  skills?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  source?: string;
}

export interface ScheduleInterviewInput {
  applicationId: string;
  candidateId?: string;
  jobId?: string;
  title: string;
  type: InterviewType;
  scheduledAt: string;
  durationMinutes?: number;
  timezone?: string;
  meetingLink?: string;
  locationNotes?: string;
}
