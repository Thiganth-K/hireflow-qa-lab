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
  phone: string;
  resumeUrl: string;
  coverLetter: string;
  createdAt: string;
  ipAddress?: string;
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
