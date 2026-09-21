import { apiClient } from './client';
import {
  AtsDashboardMetrics,
  Job,
  Candidate,
  Application,
  Interview,
  PipelineStage,
  CreateJobInput,
  CreateCandidateInput,
  ScheduleInterviewInput,
} from '../types/ats.types';

export const atsApi = {
  // Dashboard
  getDashboardMetrics: async (): Promise<AtsDashboardMetrics> => {
    const { data } = await apiClient.get<AtsDashboardMetrics>('/ats/dashboard');
    return data;
  },

  // Jobs
  getJobs: async (params?: { search?: string; status?: string; department?: string; limit?: number }): Promise<Job[]> => {
    const { data } = await apiClient.get('/ats/jobs', {
      params: { limit: 50, ...params },
    });
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.jobs)) return data.jobs;
    return [];
  },

  getJobById: async (jobId: string): Promise<Job> => {
    const { data } = await apiClient.get(`/ats/jobs/${jobId}`);
    return data?.job || data;
  },

  createJob: async (payload: CreateJobInput): Promise<Job> => {
    const { data } = await apiClient.post('/ats/jobs', payload);
    return data?.job || data;
  },

  updateJobStatus: async (jobId: string, status: string): Promise<Job> => {
    const { data } = await apiClient.patch(`/ats/jobs/${jobId}/status`, { status });
    return data?.job || data;
  },

  deleteJob: async (jobId: string): Promise<void> => {
    await apiClient.delete(`/ats/jobs/${jobId}`);
  },

  getJobStages: async (jobId: string): Promise<PipelineStage[]> => {
    const { data } = await apiClient.get(`/ats/jobs/${jobId}/stages`);
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.stages)) return data.stages;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  },

  // Candidates
  getCandidates: async (params?: { search?: string; skill?: string; page?: number; limit?: number }): Promise<Candidate[]> => {
    const { data } = await apiClient.get('/ats/candidates', {
      params: { limit: 50, ...params },
    });
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.candidates)) return data.candidates;
    return [];
  },

  getCandidateById: async (candidateId: string): Promise<Candidate> => {
    const { data } = await apiClient.get(`/ats/candidates/${candidateId}`);
    return data?.candidate || data;
  },

  createCandidate: async (payload: CreateCandidateInput): Promise<Candidate> => {
    const { data } = await apiClient.post('/ats/candidates', payload);
    return data?.candidate || data;
  },

  // Applications
  getApplications: async (params?: { jobId?: string; stageId?: string; status?: string; search?: string; limit?: number }): Promise<Application[]> => {
    const { data } = await apiClient.get('/ats/applications', {
      params: { limit: 50, ...params },
    });
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.applications)) return data.applications;
    return [];
  },

  getApplicationById: async (applicationId: string): Promise<Application> => {
    const { data } = await apiClient.get(`/ats/applications/${applicationId}`);
    return data?.application || data;
  },

  createApplication: async (payload: { jobId: string; candidateId: string; stageId?: string; notes?: string }): Promise<Application> => {
    const { data } = await apiClient.post('/ats/applications', payload);
    return data?.application || data;
  },

  updateApplicationStage: async (
    applicationId: string,
    payload: {
      stageId: string;
      toStageId?: string;
      notes?: string;
      customNotes?: string;
      rejectionReason?: string;
      sendEmail?: boolean;
      joiningDate?: string;
    },
  ): Promise<Application> => {
    const { data } = await apiClient.patch(`/ats/applications/${applicationId}/stage`, {
      stageId: payload.stageId,
      toStageId: payload.toStageId || payload.stageId,
      notes: payload.notes,
      customNotes: payload.customNotes || payload.notes,
      rejectionReason: payload.rejectionReason,
      sendEmail: payload.sendEmail,
      joiningDate: payload.joiningDate,
    });
    return data?.application || data;
  },

  deleteApplication: async (applicationId: string): Promise<void> => {
    await apiClient.delete(`/ats/applications/${applicationId}`);
  },

  // Interviews
  getInterviews: async (params?: { status?: string; candidateId?: string; jobId?: string; limit?: number }): Promise<Interview[]> => {
    const { data } = await apiClient.get('/ats/interviews', {
      params: { limit: 50, ...params },
    });
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.interviews)) return data.interviews;
    return [];
  },

  getInterviewById: async (interviewId: string): Promise<Interview> => {
    const { data } = await apiClient.get(`/ats/interviews/${interviewId}`);
    return data?.interview || data;
  },

  scheduleInterview: async (payload: ScheduleInterviewInput): Promise<Interview> => {
    const { data } = await apiClient.post('/ats/interviews', payload);
    return data?.interview || data;
  },

  submitInterviewFeedback: async (
    interviewId: string,
    payload: { feedbackRating: number; feedbackNotes: string },
  ): Promise<Interview> => {
    const { data } = await apiClient.post(`/ats/interviews/${interviewId}/feedback`, payload);
    return data?.interview || data;
  },

  // Resumes
  uploadResume: async (formData: FormData): Promise<{ resumeUrl?: string; url?: string; key?: string }> => {
    const { data } = await apiClient.post('/ats/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },
};
