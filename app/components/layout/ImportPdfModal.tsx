'use client';

import { useEffect, useRef, useState } from 'react';
import type { ResumeData } from '../../types/resume';
import type { PdfImportResult } from '../../lib/pdfImport';

interface Props {
  open: boolean;
  onCancel: () => void;
  onImport: (data: ResumeData) => void;
}

export default function ImportPdfModal({ open, onCancel, onImport }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const requestRef = useRef(0);
  const [status, setStatus] = useState<'idle' | 'reading' | 'ready' | 'error'>('idle');
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<PdfImportResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setStatus('idle');
    setFileName('');
    setResult(null);
    setError('');
    requestRef.current += 1;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && status !== 'reading') onCancel();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel, status]);

  if (!open) return null;

  const readFile = async (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setStatus('error');
      setError('Please choose a PDF file.');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setStatus('error');
      setError('The PDF is larger than 15 MB. Please choose a smaller CV file.');
      return;
    }

    const requestId = ++requestRef.current;
    setFileName(file.name);
    setResult(null);
    setError('');
    setStatus('reading');

    try {
      const { importResumePdf } = await import('../../lib/pdfImport');
      const parsed = await importResumePdf(file);
      if (requestRef.current !== requestId) return;
      setResult(parsed);
      setStatus('ready');
    } catch (cause) {
      if (requestRef.current !== requestId) return;
      setError(cause instanceof Error ? cause.message : 'The PDF could not be read.');
      setStatus('error');
    }
  };

  return (
    <div className="import-modal-backdrop" onMouseDown={status === 'reading' ? undefined : onCancel}>
      <div
        className="import-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-modal-title"
        aria-describedby="import-modal-description"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="import-modal-head">
          <div>
            <div id="import-modal-title" className="import-modal-title">Import your CV</div>
            <div id="import-modal-description" className="import-modal-subtitle">
              Upload a text-based PDF and we will detect its editable fields.
            </div>
          </div>
          <button
            className="icon-btn"
            type="button"
            onClick={onCancel}
            disabled={status === 'reading'}
            aria-label="Close PDF import"
            title="Close"
          >
            ×
          </button>
        </div>

        <div className="import-modal-body">
          <input
            ref={inputRef}
            className="sr-only"
            type="file"
            accept=".pdf,application/pdf"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void readFile(file);
              event.target.value = '';
            }}
          />

          <button
            type="button"
            className={`import-dropzone${status === 'reading' ? ' reading' : ''}`}
            onClick={() => inputRef.current?.click()}
            disabled={status === 'reading'}
          >
            <span className="import-dropzone-icon" aria-hidden>↑</span>
            <span className="import-dropzone-title">
              {status === 'reading' ? 'Reading your CV…' : fileName || 'Choose a PDF CV'}
            </span>
            <span className="import-dropzone-note">
              {status === 'reading' ? 'Detecting sections and fields' : 'PDF only · up to 15 MB'}
            </span>
          </button>

          {status === 'ready' && result && (
            <div className="import-result" role="status">
              <div className="import-result-title">CV detected and ready to edit</div>
              <div className="import-stats">
                <span><strong>{result.detected.contactFields}</strong> contact fields</span>
                <span><strong>{result.detected.educationEntries}</strong> education</span>
                <span><strong>{result.detected.skillEntries}</strong> skills</span>
                <span><strong>{result.detected.experienceEntries}</strong> experience</span>
                <span><strong>{result.detected.certifications}</strong> certificates</span>
              </div>
              {result.warnings.length > 0 && (
                <div className="import-warnings">
                  {result.warnings.map((warning) => <div key={warning}>{warning}</div>)}
                </div>
              )}
              <p className="import-review-note">
                Detection is an estimate. Review each section after importing and correct anything that was placed incorrectly.
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="import-error" role="alert">{error}</div>
          )}
        </div>

        <div className="import-modal-actions">
          <button className="btn-ghost" type="button" onClick={onCancel} disabled={status === 'reading'}>
            Cancel
          </button>
          {status === 'ready' && result && (
            <button className="btn-primary" type="button" onClick={() => onImport(result.data)}>
              Import and Edit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
