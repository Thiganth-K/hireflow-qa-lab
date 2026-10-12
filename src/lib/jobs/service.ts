import { SEED_JOBS } from './jobs-data';
import { Job } from './types';

export function getAllJobs(options?: {
  searchQuery?: string;
  jobType?: string;
  status?: string;
}): Job[] {
  let jobs = [...SEED_JOBS];

  if (options?.status) {
    jobs = jobs.filter((job) => job.status.toLowerCase() === options.status?.toLowerCase());
  }

  if (options?.jobType && options.jobType !== 'All') {
    jobs = jobs.filter((job) => job.jobType.toLowerCase() === options.jobType?.toLowerCase());
  }

  if (options?.searchQuery && options.searchQuery.trim().length > 0) {
    const query = options.searchQuery.trim().toLowerCase();
    jobs = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query) ||
        job.requiredSkills.some((skill) => skill.toLowerCase().includes(query))
    );
  }

  return jobs;
}

export function getJobById(id: string): Job | null {
  if (!id || typeof id !== 'string') {
    return null;
  }
  const job = SEED_JOBS.find((j) => j.id.toLowerCase() === id.trim().toLowerCase());
  return job || null;
}
