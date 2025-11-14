// src/types/application.ts

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  SHORTLISTED = 'shortlisted',
  INTERVIEWED = 'interviewed',
  OFFERED = 'offered',
  HIRED = 'hired',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

export enum ApplicationSource {
  LINKEDIN = 'LinkedIn',
  WEBSITE = 'Our Website',
  REFERRAL = 'Employee Referral',
  JOB_BOARD = 'Job Board',
  SOCIAL_MEDIA = 'Social Media',
  OTHER = 'Other',
}

export interface StatusHistoryEntry {
  status: ApplicationStatus;
  changedBy: string;
  changedAt: string;
  note?: string;
}

export interface Application {
  id: string;
  careerId: string;
  careerTitle: string;
  careerSlug: string;
  department: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  resumeFileName: string;
  resumeFileSize: number;
  coverLetter?: string;
  howDidYouHear: ApplicationSource;
  status: ApplicationStatus;
  statusHistory: StatusHistoryEntry[];
  reviewedBy?: string;
  reviewedAt?: string;
  adminNotes?: string;
  rating?: number;
  appliedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateApplicationStatusDto {
  status: ApplicationStatus;
  note?: string;
  adminNotes?: string;
  rating?: number;
}

export interface ApplicationFilters {
  careerId?: string;
  status?: ApplicationStatus;
  department?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: 'appliedAt' | 'status' | 'fullName';
  sortOrder?: 'asc' | 'desc';
}

export interface ApplicationStats {
  total: number;
  pending: number;
  reviewing: number;
  shortlisted: number;
  rejected: number;
  hired: number;
}
