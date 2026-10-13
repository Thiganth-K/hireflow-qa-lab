'use client';

import React, { useState } from 'react';
import { validateApplicationInput, BOUNDARIES } from '@/lib/applications/validation';
import { ApiResponse, FieldValidationError } from '@/lib/applications/types';

interface ApplicationFormProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
}

interface SubmittedData {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  candidateEmail: string;
  createdAt: string;
}

export default function ApplicationForm({
  jobId,
  jobTitle,
  companyName
}: ApplicationFormProps) {
  // Form input states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    resumeUrl: '',
    coverLetter: ''
  });

  // UI state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<SubmittedData | null>(null);

  // Idiomatic React 19 hydration detection via useSyncExternalStore
  const isHydrated = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Optional QA failure simulation settings for manual evaluation
  const [showQAPanel, setShowQAPanel] = useState(false);
  const [simulateError, setSimulateError] = useState<string>('none');
  const [simulateDelay, setSimulateDelay] = useState<string>('0');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear individual field error on typing to improve UX
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent repeated submissions while inflight
    if (isSubmitting) {
      return;
    }

    setServerError(null);

    // 1. Client-Side Validation
    const validation = validateApplicationInput({
      ...formData,
      jobId
    });

    if (!validation.isValid) {
      const errorMap: Record<string, string> = {};
      validation.errors.forEach((err) => {
        errorMap[err.field] = err.message;
      });
      setFieldErrors(errorMap);

      // Focus first erroneous field for accessibility
      const firstField = validation.errors[0]?.field;
      if (firstField && firstField !== 'general') {
        const el = document.getElementById(firstField);
        if (el) {
          el.focus();
        }
      }
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Attach test simulation headers if active
      if (simulateError === '500') {
        headers['x-test-simulate-error'] = '500';
      } else if (simulateError === '400') {
        headers['x-test-force-reject'] = '400';
      }

      if (simulateDelay !== '0') {
        headers['x-test-simulate-delay'] = simulateDelay;
      }

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          jobId,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          resumeUrl: formData.resumeUrl,
          coverLetter: formData.coverLetter
        })
      });

      const data: ApiResponse<SubmittedData> = await response.json().catch(() => ({
        success: false,
        error: 'Invalid response from server'
      }));

      if (!response.ok || !data.success) {
        if (response.status === 400 && data.errors && data.errors.length > 0) {
          // Server validation errors mapped to fields
          const errorMap: Record<string, string> = {};
          data.errors.forEach((err: FieldValidationError) => {
            errorMap[err.field] = err.message;
          });
          setFieldErrors(errorMap);
        } else {
          setServerError(
            data.error ||
              `Application submission failed (HTTP ${response.status}). Please verify your details.`
          );
        }
        return;
      }

      if (data.data) {
        setSubmittedData(data.data);
      }
    } catch {
      setServerError('A network error occurred. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      resumeUrl: '',
      coverLetter: ''
    });
    setFieldErrors({});
    setServerError(null);
    setSubmittedData(null);
  };

  // Render Confirmation Banner on Successful Submission (Quiet Precision Teal)
  if (submittedData) {
    return (
      <section
        id="application-confirmation"
        aria-live="polite"
        className="rounded-xl border border-[var(--success-border)] bg-[var(--success-subtle)] p-6 sm:p-8 text-[var(--ink)] animate-fade-in-up"
        data-testid="application-success-banner"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[var(--success)] text-white flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-sm">
            ✓
          </div>
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--success)] tracking-tight">
              Application Submitted Successfully!
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[var(--ink-secondary)] leading-relaxed">
              Thank you, <span className="font-semibold text-[var(--ink)]">{submittedData.candidateName}</span>. Your application for{' '}
              <span className="font-semibold text-[var(--ink)]">{jobTitle}</span> at {companyName} has been recorded in HireFlow QA Lab.
            </p>

            <div className="mt-5 bg-[var(--surface)] rounded-lg border border-[var(--border)] p-4 divide-y divide-[var(--border-subtle)] text-xs sm:text-sm">
              <div className="py-2 flex justify-between">
                <span className="text-[var(--muted)] font-medium">Application ID</span>
                <span className="font-mono font-semibold text-[var(--ink)]" data-testid="confirmation-app-id">
                  {submittedData.applicationId}
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-[var(--muted)] font-medium">Position Target</span>
                <span className="font-medium text-[var(--ink)]">{jobTitle}</span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-[var(--muted)] font-medium">Candidate Email</span>
                <span className="font-medium text-[var(--ink)]" data-testid="confirmation-email">
                  {submittedData.candidateEmail}
                </span>
              </div>
              <div className="py-2 flex justify-between">
                <span className="text-[var(--muted)] font-medium">Submission Timestamp</span>
                <span className="text-[var(--ink-secondary)]">{new Date(submittedData.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold text-[var(--success)] bg-[var(--surface)] border border-[var(--success-border)] hover:bg-[var(--success-subtle)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--success)] transition-colors shadow-sm"
                data-testid="submit-another-btn"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="apply-section"
      aria-labelledby="apply-heading"
      className="card-quiet p-6 sm:p-8 animate-fade-in-up"
      data-testid="application-form-section"
    >
      <div className="border-b border-[var(--border-subtle)] pb-5">
        <h2 id="apply-heading" className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight">
          Apply for this Job
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[var(--muted)]">
          Tell us about yourself and why you&apos;re a great fit for{' '}
          <span className="font-semibold text-[var(--ink)]">{jobTitle}</span> at{' '}
          <span className="font-semibold text-[var(--ink)]">{companyName}</span>.
        </p>
      </div>

      {/* Global Server Error Banner (Quiet Precision Muted Red) */}
      {serverError && (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-6 p-4 rounded-lg bg-[var(--error-subtle)] border border-[var(--error-border)] text-[var(--error)] text-xs sm:text-sm flex items-start gap-3 animate-fade-in"
          data-testid="form-server-error-banner"
        >
          <span className="font-bold text-base leading-none">⚠</span>
          <div className="flex-1">
            <p className="font-semibold text-[var(--ink)]">Submission Issue</p>
            <p className="mt-0.5 text-[var(--error)] leading-relaxed">{serverError}</p>
          </div>
        </div>
      )}

      {/* Optional QA Test Simulation Helper */}
      <div className="mt-5 border border-dashed border-[var(--border)] rounded-lg p-3 bg-[var(--canvas)] text-xs text-[var(--ink-secondary)]">
        <button
          type="button"
          disabled={!isHydrated}
          onClick={() => setShowQAPanel(!showQAPanel)}
          className="flex items-center justify-between w-full font-semibold text-[var(--ink)] hover:text-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded p-1 disabled:opacity-50"
          aria-expanded={showQAPanel}
          data-testid="toggle-qa-controls"
        >
          <span>🧪 QA Test Simulation Controls {showQAPanel ? '▲' : '▼'}</span>
          <span className="text-[11px] text-[var(--muted)] font-normal">
            {simulateError !== 'none' || simulateDelay !== '0' ? 'Active Simulations' : 'Default behavior'}
          </span>
        </button>

        {showQAPanel && (
          <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="qa-controls-body">
            <div>
              <label htmlFor="qa-simulate-error" className="block font-medium text-[var(--ink-secondary)] mb-1">
                Simulate Server Response:
              </label>
              <select
                id="qa-simulate-error"
                value={simulateError}
                onChange={(e) => setSimulateError(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                data-testid="qa-simulate-error-select"
              >
                <option value="none">Normal (Standard Behavior)</option>
                <option value="500">500 Internal Server Error</option>
                <option value="400">400 Bad Request Forced</option>
              </select>
            </div>
            <div>
              <label htmlFor="qa-simulate-delay" className="block font-medium text-[var(--ink-secondary)] mb-1">
                Simulate Latency:
              </label>
              <select
                id="qa-simulate-delay"
                value={simulateDelay}
                onChange={(e) => setSimulateDelay(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                data-testid="qa-simulate-delay-select"
              >
                <option value="0">0ms (Immediate)</option>
                <option value="1500">1,500ms Delay</option>
                <option value="3000">3,000ms Delay</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        data-hydrated={isHydrated ? 'true' : 'false'}
        className="mt-6 space-y-5"
        data-testid="application-form"
      >
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-secondary)] mb-1.5">
            Full Name <span className="text-[var(--error)]" aria-hidden="true">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            maxLength={BOUNDARIES.fullName.max}
            aria-required="true"
            aria-invalid={!!fieldErrors.fullName}
            aria-describedby={fieldErrors.fullName ? 'fullName-error' : 'fullName-hint'}
            placeholder="e.g. Alex Morgan"
            disabled={isSubmitting}
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-[var(--ink)] bg-[var(--surface)] placeholder-[var(--muted-light)] focus:outline-none focus:ring-2 transition-colors ${
              fieldErrors.fullName
                ? 'border-[var(--error)] focus:ring-[var(--error)] bg-[var(--error-subtle)]/30'
                : 'border-[var(--border)] focus:ring-[var(--accent)] hover:border-[var(--border-hover)]'
            }`}
            data-testid="input-fullName"
          />
          <div className="flex justify-between items-center mt-1 text-xs">
            {fieldErrors.fullName ? (
              <p id="fullName-error" role="alert" className="text-[var(--error)] font-medium" data-testid="error-fullName">
                {fieldErrors.fullName}
              </p>
            ) : (
              <p id="fullName-hint" className="text-[var(--muted)]">
                Minimum {BOUNDARIES.fullName.min} characters
              </p>
            )}
            <span className="text-[var(--muted-light)]">
              {formData.fullName.length}/{BOUNDARIES.fullName.max}
            </span>
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-secondary)] mb-1.5">
            Email Address <span className="text-[var(--error)]" aria-hidden="true">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            maxLength={BOUNDARIES.email.max}
            aria-required="true"
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? 'email-error' : 'email-hint'}
            placeholder="e.g. alex.morgan@example.com"
            disabled={isSubmitting}
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-[var(--ink)] bg-[var(--surface)] placeholder-[var(--muted-light)] focus:outline-none focus:ring-2 transition-colors ${
              fieldErrors.email
                ? 'border-[var(--error)] focus:ring-[var(--error)] bg-[var(--error-subtle)]/30'
                : 'border-[var(--border)] focus:ring-[var(--accent)] hover:border-[var(--border-hover)]'
            }`}
            data-testid="input-email"
          />
          <div className="flex justify-between items-center mt-1 text-xs">
            {fieldErrors.email ? (
              <p id="email-error" role="alert" className="text-[var(--error)] font-medium" data-testid="error-email">
                {fieldErrors.email}
              </p>
            ) : (
              <p id="email-hint" className="text-[var(--muted)]">
                Used for candidate deduplication and tracking
              </p>
            )}
            <span className="text-[var(--muted-light)]">
              {formData.email.length}/{BOUNDARIES.email.max}
            </span>
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-secondary)] mb-1.5">
            Phone Number <span className="text-[var(--error)]" aria-hidden="true">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            maxLength={BOUNDARIES.phone.max}
            aria-required="true"
            aria-invalid={!!fieldErrors.phone}
            aria-describedby={fieldErrors.phone ? 'phone-error' : 'phone-hint'}
            placeholder="e.g. +1 555-234-5678"
            disabled={isSubmitting}
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-[var(--ink)] bg-[var(--surface)] placeholder-[var(--muted-light)] focus:outline-none focus:ring-2 transition-colors ${
              fieldErrors.phone
                ? 'border-[var(--error)] focus:ring-[var(--error)] bg-[var(--error-subtle)]/30'
                : 'border-[var(--border)] focus:ring-[var(--accent)] hover:border-[var(--border-hover)]'
            }`}
            data-testid="input-phone"
          />
          <div className="flex justify-between items-center mt-1 text-xs">
            {fieldErrors.phone ? (
              <p id="phone-error" role="alert" className="text-[var(--error)] font-medium" data-testid="error-phone">
                {fieldErrors.phone}
              </p>
            ) : (
              <p id="phone-hint" className="text-[var(--muted)]">
                Minimum 7 digits ({BOUNDARIES.phone.min}–{BOUNDARIES.phone.max} characters)
              </p>
            )}
            <span className="text-[var(--muted-light)]">
              {formData.phone.length}/{BOUNDARIES.phone.max}
            </span>
          </div>
        </div>

        {/* Resume URL */}
        <div>
          <label htmlFor="resumeUrl" className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-secondary)] mb-1.5">
            Resume URL or Reference <span className="text-[var(--error)]" aria-hidden="true">*</span>
          </label>
          <input
            type="url"
            id="resumeUrl"
            name="resumeUrl"
            value={formData.resumeUrl}
            onChange={handleChange}
            maxLength={BOUNDARIES.resumeUrl.max}
            aria-required="true"
            aria-invalid={!!fieldErrors.resumeUrl}
            aria-describedby={fieldErrors.resumeUrl ? 'resumeUrl-error' : 'resumeUrl-hint'}
            placeholder="https://example.com/resumes/alex-morgan.pdf"
            disabled={isSubmitting}
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-[var(--ink)] bg-[var(--surface)] placeholder-[var(--muted-light)] focus:outline-none focus:ring-2 transition-colors ${
              fieldErrors.resumeUrl
                ? 'border-[var(--error)] focus:ring-[var(--error)] bg-[var(--error-subtle)]/30'
                : 'border-[var(--border)] focus:ring-[var(--accent)] hover:border-[var(--border-hover)]'
            }`}
            data-testid="input-resumeUrl"
          />
          <div className="flex justify-between items-center mt-1 text-xs">
            {fieldErrors.resumeUrl ? (
              <p id="resumeUrl-error" role="alert" className="text-[var(--error)] font-medium" data-testid="error-resumeUrl">
                {fieldErrors.resumeUrl}
              </p>
            ) : (
              <p id="resumeUrl-hint" className="text-[var(--muted)]">
                Must begin with http:// or https://
              </p>
            )}
            <span className="text-[var(--muted-light)]">
              {formData.resumeUrl.length}/{BOUNDARIES.resumeUrl.max}
            </span>
          </div>
        </div>

        {/* Cover Letter (Optional) */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="coverLetter" className="block text-xs font-semibold uppercase tracking-wider text-[var(--ink-secondary)]">
              Cover Letter <span className="text-[var(--muted-light)] font-normal normal-case">(Optional)</span>
            </label>
            <span className="text-xs text-[var(--muted-light)]">
              {formData.coverLetter.length}/{BOUNDARIES.coverLetter.max}
            </span>
          </div>
          <textarea
            id="coverLetter"
            name="coverLetter"
            rows={4}
            value={formData.coverLetter}
            onChange={handleChange}
            maxLength={BOUNDARIES.coverLetter.max}
            aria-invalid={!!fieldErrors.coverLetter}
            aria-describedby={fieldErrors.coverLetter ? 'coverLetter-error' : 'coverLetter-hint'}
            placeholder="Tell us why you are interested in this position and relevant accomplishments..."
            disabled={isSubmitting}
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-[var(--ink)] bg-[var(--surface)] placeholder-[var(--muted-light)] focus:outline-none focus:ring-2 transition-colors ${
              fieldErrors.coverLetter
                ? 'border-[var(--error)] focus:ring-[var(--error)] bg-[var(--error-subtle)]/30'
                : 'border-[var(--border)] focus:ring-[var(--accent)] hover:border-[var(--border-hover)]'
            }`}
            data-testid="input-coverLetter"
          />
          {fieldErrors.coverLetter ? (
            <p id="coverLetter-error" role="alert" className="mt-1 text-xs text-[var(--error)] font-medium" data-testid="error-coverLetter">
              {fieldErrors.coverLetter}
            </p>
          ) : (
            <p id="coverLetter-hint" className="mt-1 text-xs text-[var(--muted)]">
              Up to 2,000 characters
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            id="submit-application-btn"
            disabled={!isHydrated || isSubmitting}
            className={`w-full py-3 px-6 rounded-xl text-sm font-bold text-white shadow-sm flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--accent)] transition-all ${
              !isHydrated || isSubmitting
                ? 'bg-[var(--accent)]/50 cursor-not-allowed opacity-60'
                : 'bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:bg-[var(--accent-active)] shadow-md hover:shadow-indigo-500/20'
            }`}
            data-testid="submit-button"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span>Submitting Application...</span>
              </>
            ) : (
              <span>Submit Application</span>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
