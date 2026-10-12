export interface ApplicationInput {
  jobId: string;
  fullName: string;
  email: string;
  phone: string;
  resumeUrl: string;
  coverLetter?: string;
}

export interface ApplicationRecord {
  id: string;
  jobId: string;
  fullName: string;
  email: string;
  normalizedEmail: string;
  phone: string;
  resumeUrl: string;
  coverLetter: string;
  createdAt: string;
  ipAddress?: string;
}

export class DuplicateApplicationError extends Error {
  constructor(public readonly jobId: string, public readonly email: string) {
    super(`Candidate '${email}' has already applied for job '${jobId}'`);
    this.name = 'DuplicateApplicationError';
  }
}

export class DatabaseUnavailableError extends Error {
  constructor(message: string = 'Database service is currently unavailable. Please retry later.') {
    super(message);
    this.name = 'DatabaseUnavailableError';
  }
}

export interface FieldValidationError {
  field: 'jobId' | 'fullName' | 'email' | 'phone' | 'resumeUrl' | 'coverLetter' | 'general';
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FieldValidationError[];
  sanitized?: ApplicationInput;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: FieldValidationError[];
}
