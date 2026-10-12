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

  // Render Confirmation Banner on Successful Submission
  if (submittedData) {
    return (
      <section
        id="application-confirmation"
        aria-live="polite"
        className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-8 shadow-sm text-slate-900"
        data-testid="application-success-banner"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl flex-shrink-0 shadow">
            ✓
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-emerald-950">
              Application Submitted Successfully!
            </h3>
            <p className="mt-2 text-sm text-emerald-900">
              Thank you, <span className="font-semibold">{submittedData.candidateName}</span>. Your application for{' '}
              <span className="font-semibold">{jobTitle}</span> at {companyName} has been recorded in HireFlow QA Lab.
            </p>

            <div className="mt-6 bg-white rounded-lg border border-emerald-200 p-4 divide-y divide-emerald-100 text-xs sm:text-sm">
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-500 font-medium">Application ID</span>
                <span className="font-mono font-semibold text-slate-900" data-testid="confirmation-app-id">
                  {submittedData.applicationId}
                </span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-500 font-medium">Position Target</span>
                <span className="font-medium text-slate-900">{jobTitle}</span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-500 font-medium">Candidate Email</span>
                <span className="font-medium text-slate-900" data-testid="confirmation-email">
                  {submittedData.candidateEmail}
                </span>
              </div>
              <div className="py-1.5 flex justify-between">
                <span className="text-slate-500 font-medium">Submission Timestamp</span>
                <span className="text-slate-700">{new Date(submittedData.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 transition-colors"
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
      className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm"
      data-testid="application-form-section"
    >
      <div className="border-b border-slate-200 pb-5">
        <h2 id="apply-heading" className="text-2xl font-bold text-slate-900 tracking-tight">
          Apply for this Position
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Submitting for <span className="font-semibold text-slate-900">{jobTitle}</span> at{' '}
          <span className="font-semibold text-slate-900">{companyName}</span>
        </p>
      </div>

      {/* Global Server Error Banner */}
      {serverError && (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-start gap-3"
          data-testid="form-server-error-banner"
        >
          <span className="text-rose-600 font-bold text-lg leading-none">⚠</span>
          <div className="flex-1">
            <p className="font-semibold">Submission Issue</p>
            <p className="mt-0.5 text-rose-800">{serverError}</p>
          </div>
        </div>
      )}

      {/* Optional QA Test Simulation Helper */}
      <div className="mt-4 border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50 text-xs text-slate-700">
        <button
          type="button"
          disabled={!isHydrated}
          onClick={() => setShowQAPanel(!showQAPanel)}
          className="flex items-center justify-between w-full font-semibold text-slate-800 hover:text-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded disabled:opacity-50"
          aria-expanded={showQAPanel}
          data-testid="toggle-qa-controls"
        >
          <span>🧪 QA Test Simulation Controls {showQAPanel ? '▲' : '▼'}</span>
          <span className="text-[11px] text-slate-500 font-normal">
            {simulateError !== 'none' || simulateDelay !== '0' ? 'Active Simulations' : 'Default behavior'}
          </span>
        </button>

        {showQAPanel && (
          <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="qa-controls-body">
            <div>
              <label htmlFor="qa-simulate-error" className="block font-medium text-slate-700 mb-1">
                Simulate Server Response:
              </label>
              <select
                id="qa-simulate-error"
                value={simulateError}
                onChange={(e) => setSimulateError(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                data-testid="qa-simulate-error-select"
              >
                <option value="none">Normal (Standard Behavior)</option>
                <option value="500">500 Internal Server Error</option>
                <option value="400">400 Bad Request Forced</option>
              </select>
            </div>
            <div>
              <label htmlFor="qa-simulate-delay" className="block font-medium text-slate-700 mb-1">
                Simulate Latency:
              </label>
              <select
                id="qa-simulate-delay"
                value={simulateDelay}
                onChange={(e) => setSimulateDelay(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
        className="mt-6 space-y-6"
        data-testid="application-form"
      >
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-semibold text-slate-900 mb-1">
            Full Name <span className="text-rose-600" aria-hidden="true">*</span>
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
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
              fieldErrors.fullName
                ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                : 'border-slate-300 focus:ring-blue-600 hover:border-slate-400'
            }`}
            data-testid="input-fullName"
          />
          <div className="flex justify-between items-center mt-1 text-xs">
            {fieldErrors.fullName ? (
              <p id="fullName-error" role="alert" className="text-rose-600 font-medium" data-testid="error-fullName">
                {fieldErrors.fullName}
              </p>
            ) : (
              <p id="fullName-hint" className="text-slate-500">
                Minimum {BOUNDARIES.fullName.min} characters
              </p>
            )}
            <span className="text-slate-400">
              {formData.fullName.length}/{BOUNDARIES.fullName.max}
            </span>
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-1">
            Email Address <span className="text-rose-600" aria-hidden="true">*</span>
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
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
              fieldErrors.email
                ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                : 'border-slate-300 focus:ring-blue-600 hover:border-slate-400'
            }`}
            data-testid="input-email"
          />
          <div className="flex justify-between items-center mt-1 text-xs">
            {fieldErrors.email ? (
              <p id="email-error" role="alert" className="text-rose-600 font-medium" data-testid="error-email">
                {fieldErrors.email}
              </p>
            ) : (
              <p id="email-hint" className="text-slate-500">
                Used for application tracking and deduplication
              </p>
            )}
            <span className="text-slate-400">
              {formData.email.length}/{BOUNDARIES.email.max}
            </span>
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-slate-900 mb-1">
            Phone Number <span className="text-rose-600" aria-hidden="true">*</span>
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
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
              fieldErrors.phone
                ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                : 'border-slate-300 focus:ring-blue-600 hover:border-slate-400'
            }`}
            data-testid="input-phone"
          />
          <div className="flex justify-between items-center mt-1 text-xs">
            {fieldErrors.phone ? (
              <p id="phone-error" role="alert" className="text-rose-600 font-medium" data-testid="error-phone">
                {fieldErrors.phone}
              </p>
            ) : (
              <p id="phone-hint" className="text-slate-500">
                Minimum 7 digits ({BOUNDARIES.phone.min}-{BOUNDARIES.phone.max} characters)
              </p>
            )}
            <span className="text-slate-400">
              {formData.phone.length}/{BOUNDARIES.phone.max}
            </span>
          </div>
        </div>

        {/* Resume URL */}
        <div>
          <label htmlFor="resumeUrl" className="block text-sm font-semibold text-slate-900 mb-1">
            Resume URL or Reference <span className="text-rose-600" aria-hidden="true">*</span>
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
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
              fieldErrors.resumeUrl
                ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                : 'border-slate-300 focus:ring-blue-600 hover:border-slate-400'
            }`}
            data-testid="input-resumeUrl"
          />
          <div className="flex justify-between items-center mt-1 text-xs">
            {fieldErrors.resumeUrl ? (
              <p id="resumeUrl-error" role="alert" className="text-rose-600 font-medium" data-testid="error-resumeUrl">
                {fieldErrors.resumeUrl}
              </p>
            ) : (
              <p id="resumeUrl-hint" className="text-slate-500">
                Must begin with http:// or https://
              </p>
            )}
            <span className="text-slate-400">
              {formData.resumeUrl.length}/{BOUNDARIES.resumeUrl.max}
            </span>
          </div>
        </div>

        {/* Cover Letter (Optional) */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="coverLetter" className="block text-sm font-semibold text-slate-900">
              Cover Letter <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <span className="text-xs text-slate-400">
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
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
              fieldErrors.coverLetter
                ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                : 'border-slate-300 focus:ring-blue-600 hover:border-slate-400'
            }`}
            data-testid="input-coverLetter"
          />
          {fieldErrors.coverLetter ? (
            <p id="coverLetter-error" role="alert" className="mt-1 text-xs text-rose-600 font-medium" data-testid="error-coverLetter">
              {fieldErrors.coverLetter}
            </p>
          ) : (
            <p id="coverLetter-hint" className="mt-1 text-xs text-slate-500">
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
            className={`w-full sm:w-auto px-8 py-3 rounded-lg text-sm font-semibold text-white shadow-sm flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 transition-all ${
              !isHydrated || isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
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
