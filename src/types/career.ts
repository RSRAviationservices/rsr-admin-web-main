// src/types/career.ts

export enum CareerDepartment {
  SALES = "Sales",
  MAINTENANCE = "Maintenance",
  LOGISTICS = "Logistics",
  QUALITY = "Quality",
  ENGINEERING = "Engineering",
  OPERATIONS = "Operations",
  HUMAN_RESOURCES = "Human Resources",
  FINANCE = "Finance",
  LEGAL = "Legal",
  IT = "IT",
  CUSTOMER_SUPPORT = "Customer Support",
  STRATEGY = "Strategy",
  SAFETY = "Safety",
  TRAINING = "Training",
  PROCUREMENT = "Procurement",
  MARKETING = "Marketing",
  DATA = "Data",
}

export enum EmploymentType {
  FULL_TIME = "Full-time",
  PART_TIME = "Part-time",
  CONTRACT = "Contract",
  INTERNSHIP = "Internship",
  TEMPORARY = "Temporary",
}

export enum CareerStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  CLOSED = "closed",
}

export interface ContentSection {
  title: string;
  content?: string;
  items?: string[];
}

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
  period: "annual" | "monthly" | "hourly";
}

export interface Career {
  id: string;
  title: string;
  slug: string;
  department: CareerDepartment;
  location: string;
  type: EmploymentType;
  intro: string;
  description: ContentSection;
  responsibilities: ContentSection;
  requirements: ContentSection;
  benefits?: ContentSection;
  qualifications?: ContentSection;
  salaryRange?: SalaryRange;
  status: CareerStatus;
  postedDate: string;
  expiryDate?: string;
  closedDate?: string;
  closedReason?: string;
  applicationsCount: number;
  newApplicationsCount: number;
  metaTitle?: string;
  metaDescription?: string;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCareerDto {
  title: string;
  slug?: string;
  department: CareerDepartment;
  location: string;
  type: EmploymentType;
  intro: string;
  description: ContentSection;
  responsibilities: ContentSection;
  requirements: ContentSection;
  benefits?: ContentSection;
  qualifications?: ContentSection;
  salaryRange?: SalaryRange;
  status: CareerStatus;
  postedDate?: string;
  expiryDate?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateCareerDto extends Partial<CreateCareerDto> {
  closedReason?: string;
}

export interface CareerFilters {
  search?: string;
  department?: CareerDepartment;
  location?: string;
  type?: EmploymentType;
  status?: CareerStatus;
  page?: number;
  limit?: number;
  sortBy?: "postedDate" | "title" | "applicationsCount" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface CareerStats {
  total: number;
  published: number;
  draft: number;
  closed: number;
}
