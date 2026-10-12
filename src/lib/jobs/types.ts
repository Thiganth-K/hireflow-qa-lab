export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
export type JobStatus = 'Open' | 'Closed' | 'Draft';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  jobType: JobType;
  experienceLevel: string;
  salaryRange: string;
  description: string;
  requiredSkills: string[];
  responsibilities: string[];
  status: JobStatus;
  postedDate: string;
}
