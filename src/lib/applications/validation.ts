import { ApplicationInput, FieldValidationError, ValidationResult } from './types';

export const BOUNDARIES = {
  fullName: { min: 2, max: 80 },
  email: { max: 100 },
  phone: { min: 7, max: 25 },
  resumeUrl: { min: 5, max: 250 },
  coverLetter: { max: 2000 }
} as const;

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const PHONE_CHARS_REGEX = /^[0-9+\-()\s.]+$/;

export function validateApplicationInput(rawInput: unknown): ValidationResult {
  const errors: FieldValidationError[] = [];

  if (!rawInput || typeof rawInput !== 'object') {
    return {
      isValid: false,
      errors: [{ field: 'general', message: 'Invalid payload: request body must be a JSON object' }]
    };
  }

  const input = rawInput as Record<string, unknown>;

  // 1. Job ID validation
  const rawJobId = typeof input.jobId === 'string' ? input.jobId.trim() : '';
  if (!rawJobId) {
    errors.push({ field: 'jobId', message: 'Job ID is required' });
  }

  // 2. Full Name validation
  const rawFullName = typeof input.fullName === 'string' ? input.fullName : '';
  const trimmedFullName = rawFullName.trim();
  if (rawFullName.length === 0 || trimmedFullName.length === 0) {
    errors.push({ field: 'fullName', message: 'Full name is required and cannot be empty or whitespace only' });
  } else if (trimmedFullName.length < BOUNDARIES.fullName.min) {
    errors.push({
      field: 'fullName',
      message: `Full name must be at least ${BOUNDARIES.fullName.min} characters`
    });
  } else if (trimmedFullName.length > BOUNDARIES.fullName.max) {
    errors.push({
      field: 'fullName',
      message: `Full name cannot exceed ${BOUNDARIES.fullName.max} characters`
    });
  }

  // 3. Email validation
  const rawEmail = typeof input.email === 'string' ? input.email : '';
  const trimmedEmail = rawEmail.trim();
  if (rawEmail.length === 0 || trimmedEmail.length === 0) {
    errors.push({ field: 'email', message: 'Email address is required and cannot be whitespace only' });
  } else if (trimmedEmail.length > BOUNDARIES.email.max) {
    errors.push({ field: 'email', message: `Email cannot exceed ${BOUNDARIES.email.max} characters` });
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.push({ field: 'email', message: 'Please provide a valid email address (e.g. name@example.com)' });
  }

  // 4. Phone validation
  const rawPhone = typeof input.phone === 'string' ? input.phone : '';
  const trimmedPhone = rawPhone.trim();
  const digitCount = (trimmedPhone.match(/\d/g) || []).length;
  if (rawPhone.length === 0 || trimmedPhone.length === 0) {
    errors.push({ field: 'phone', message: 'Phone number is required and cannot be whitespace only' });
  } else if (trimmedPhone.length < BOUNDARIES.phone.min || digitCount < 7) {
    errors.push({
      field: 'phone',
      message: `Phone number must contain at least 7 digits (min ${BOUNDARIES.phone.min} characters)`
    });
  } else if (trimmedPhone.length > BOUNDARIES.phone.max) {
    errors.push({
      field: 'phone',
      message: `Phone number cannot exceed ${BOUNDARIES.phone.max} characters`
    });
  } else if (!PHONE_CHARS_REGEX.test(trimmedPhone)) {
    errors.push({
      field: 'phone',
      message: 'Phone number contains invalid characters. Use digits, +, -, ., (), and spaces.'
    });
  }

  // 5. Resume URL validation
  const rawResumeUrl = typeof input.resumeUrl === 'string' ? input.resumeUrl : '';
  const trimmedResumeUrl = rawResumeUrl.trim();
  if (rawResumeUrl.length === 0 || trimmedResumeUrl.length === 0) {
    errors.push({ field: 'resumeUrl', message: 'Resume link or URL is required and cannot be whitespace only' });
  } else if (trimmedResumeUrl.length < BOUNDARIES.resumeUrl.min) {
    errors.push({
      field: 'resumeUrl',
      message: `Resume URL must be at least ${BOUNDARIES.resumeUrl.min} characters`
    });
  } else if (trimmedResumeUrl.length > BOUNDARIES.resumeUrl.max) {
    errors.push({
      field: 'resumeUrl',
      message: `Resume URL cannot exceed ${BOUNDARIES.resumeUrl.max} characters`
    });
  } else {
    try {
      const parsedUrl = new URL(trimmedResumeUrl);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        errors.push({ field: 'resumeUrl', message: 'Resume URL must begin with http:// or https://' });
      }
    } catch {
      errors.push({ field: 'resumeUrl', message: 'Please provide a valid URL (e.g. https://example.com/resume.pdf)' });
    }
  }

  // 6. Cover letter validation (optional)
  let sanitizedCoverLetter = '';
  if (typeof input.coverLetter === 'string') {
    sanitizedCoverLetter = input.coverLetter.trim();
    if (sanitizedCoverLetter.length > BOUNDARIES.coverLetter.max) {
      errors.push({
        field: 'coverLetter',
        message: `Cover letter cannot exceed ${BOUNDARIES.coverLetter.max} characters`
      });
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const sanitized: ApplicationInput = {
    jobId: rawJobId,
    fullName: trimmedFullName,
    email: trimmedEmail.toLowerCase(),
    phone: trimmedPhone,
    resumeUrl: trimmedResumeUrl,
    coverLetter: sanitizedCoverLetter
  };

  return {
    isValid: true,
    errors: [],
    sanitized
  };
}
