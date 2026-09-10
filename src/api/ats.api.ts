import { apiClient } from './client';
import {
  AtsDashboardMetrics,
  Job,
  Candidate,
  Application,
  Interview,
  PipelineStage,
} from '../types/ats.types';

export const atsApi = {
  // Dashboard
  getDashboardMetrics: async (): Promise<AtsDashboardMetrics> => {
    const { data } = await apiClient.get<AtsDashboardMetrics>('/ats/dashboard');
    return data;
  },

  // Jobs
  getJobs: async (params?: { search?: string; status?: string }): Promise<Job[]> => {
    const { data } = await apiClient.get<Job[]>('/ats/jobs', { params });
    return data;
  },

  getJobById: async (jobId: string): Promise<Job> => {
    const { data } = await apiClient.get<Job>(`/ats/jobs/${jobId}`);
    return data;
  },

  getJobStages: async (jobId: string): Promise<PipelineStage[]> => {
    const { data } = await apiClient.get<PipelineStage[]>(`/ats/jobs/${jobId}/stages`);
    return data;
  },

  // Candidates
  getCandidates: async (params?: { search?: string; skill?: string; page?: number }): Promise<Candidate[]> => {
    const { data } = await apiClient.get<Candidate[]>('/ats/candidates', { params });
    return data;
  },

  getCandidateById: async (candidateId: string): Promise<Candidate> => {
    const { data } = await apiClient.get<Candidate>(`/ats/candidates/${candidateId}`);
    return data;
  },

  // Applications
  getApplications: async (params?: { jobId?: string; stageId?: string; status?: string }): Promise<Application[]> => {
    const { data } = await apiClient.get<Application[]>('/ats/applications', { params });
    return data;
  },

  getApplicationById: async (applicationId: string): Promise<Application> => {
    const { data } = await apiClient.get<Application>(`/ats/applications/${applicationId}`);
    return data;
  },

  updateApplicationStage: async (
    applicationId: string,
    payload: { stageId: string; notes?: string; rejectionReason?: string },
  ): Promise<Application> => {
    const { data } = await apiClient.patch<Application>(`/ats/applications/${applicationId}/stage`, payload);
    return data;
  },

  // Interviews
  getInterviews: async (params?: { status?: string; candidateId?: string; jobId?: string }): Promise<Interview[]> => {
    const { data } = await apiClient.get<Interview[]>('/ats/interviews', { params });
    return data;
  },

  getInterviewById: async (interviewId: string): Promise<Interview> => {
    const { data } = await apiClient.get<Interview>(`/ats/interviews/${interviewId}`);
    return data;
  },

  submitInterviewFeedback: async (
    interviewId: string,
    payload: { feedbackRating: number; feedbackNotes: string },
  ): Promise<Interview> => {
    const { data } = await apiClient.post<Interview>(`/ats/interviews/${interviewId}/feedback`, payload);
    return data;
  },
};
