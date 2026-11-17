import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, ArrowLeft, ExternalLink } from 'lucide-react';

interface PrivacyPolicyViewProps {
  onClose?: () => void;
  standalone?: boolean;
}

export const PRIVACY_POLICY_CANONICAL_URL = 'https://itechcanva.vercel.app/privacy';

export const PrivacyPolicyView: React.FC<PrivacyPolicyViewProps> = ({ onClose, standalone = false }) => {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(PRIVACY_POLICY_CANONICAL_URL);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div
      className={
        standalone
          ? 'min-h-screen bg-[#f8fafc] text-slate-900 overflow-y-auto'
          : 'flex flex-col max-h-[85vh] bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200'
      }
    >
      {/* Header Bar */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00c4cc] to-[#7d2ae8] flex items-center justify-center text-white shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 truncate">iTechCanva Privacy Policy</h2>
            <p className="text-[11px] text-slate-500 truncate">
              Effective November 17, 2026 ·{' '}
              <span className="font-mono text-slate-700">{PRIVACY_POLICY_CANONICAL_URL}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyUrl}
            className="px-3 py-1.5 rounded-lg bg-[#f4f5f7] hover:bg-slate-200/70 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? 'Copied Link' : 'Copy Policy URL'}</span>
          </button>

          {standalone ? (
            <a
              href="/"
              className="px-3.5 py-1.5 rounded-lg bg-[#7d2ae8] hover:bg-[#6b21a8] text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Studio</span>
            </a>
          ) : (
            onClose && (
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg bg-[#7d2ae8] hover:bg-[#6b21a8] text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
              >
                Close
              </button>
            )
          )}
        </div>
      </header>

      {/* Body Content */}
      <div className="overflow-y-auto px-6 py-6 sm:px-8 space-y-5 text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl mx-auto w-full">
        <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <span className="font-semibold text-slate-900">Public Privacy Policy Link (for Pinterest App Settings):</span>{' '}
            <span className="font-mono text-[#7d2ae8] break-all">{PRIVACY_POLICY_CANONICAL_URL}</span>
          </div>
          <a
            href="/privacy"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-semibold text-[#7d2ae8] hover:underline flex items-center gap-1 shrink-0 whitespace-nowrap"
          >
            <span>Open Page</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <section className="space-y-1.5">
          <h3 className="text-sm font-bold text-slate-900">1. Local-First Design Data</h3>
          <p>
            iTechCanva operates primarily inside your browser without requiring user account registration. Designs,
            layers, uploaded images, and undo history stay stored locally on your device via browser{' '}
            <code className="px-1.5 py-0.5 rounded bg-slate-100 text-xs font-mono">localStorage</code>{' '}
            (<code className="px-1.5 py-0.5 rounded bg-slate-100 text-xs font-mono">canva_cleanroom_draft_v2</code> and{' '}
            <code className="px-1.5 py-0.5 rounded bg-slate-100 text-xs font-mono">canva_pinterest_pins_v1</code>).
            PNG, JPG, SVG, PDF, and JSON exports are generated directly in your browser.
          </p>
        </section>

        <section className="space-y-1.5">
          <h3 className="text-sm font-bold text-slate-900">2. Pinterest Integration &amp; OAuth 2.0 Scopes</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Read-Only Scopes:</strong> When you connect Pinterest, iTechCanva requests only read permissions (
              <code className="px-1.5 py-0.5 rounded bg-slate-100 text-xs font-mono">boards:read</code>,{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-100 text-xs font-mono">pins:read</code>,{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-100 text-xs font-mono">user_accounts:read</code>). It never
              publishes, edits, or deletes pins on your behalf.
            </li>
            <li>
              <strong>Session Storage:</strong> OAuth tokens remain in short-lived server memory tied to an{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-100 text-xs font-mono">HttpOnly</code>,{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-100 text-xs font-mono">Secure</code>,{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-100 text-xs font-mono">SameSite=None</code> cookie (
              <code className="px-1.5 py-0.5 rounded bg-slate-100 text-xs font-mono">pinterest_sid</code>) and are
              cleared immediately upon disconnecting.
            </li>
            <li>
              <strong>Pin URL Imports &amp; Image Proxy:</strong> Public Pin imports retrieve metadata via Pinterest
              oEmbed and stream allowed <code className="px-1.5 py-0.5 rounded bg-slate-100 text-xs font-mono">i.pinimg.com</code>{' '}
              artwork in transit so canvas exports stay untainted without permanent server storage.
            </li>
          </ul>
        </section>

        <section className="space-y-1.5">
          <h3 className="text-sm font-bold text-slate-900">3. Tracking, Cookies &amp; Data Sharing</h3>
          <p>
            iTechCanva uses zero behavioral advertising pixels, zero third-party ad trackers, and never sells or rents user
            data.
          </p>
        </section>

        <section className="space-y-1.5">
          <h3 className="text-sm font-bold text-slate-900">4. Data Deletion &amp; Contact</h3>
          <p>
            You can revoke Pinterest permissions anytime via the <strong>Disconnect</strong> button inside Template Library
            or in your Pinterest Account Security settings, and delete saved drafts by clearing browser site storage. For
            privacy questions, contact{' '}
            <a href="mailto:officialcryptodeals@gmail.com" className="text-[#7d2ae8] font-medium hover:underline">
              officialcryptodeals@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
};
