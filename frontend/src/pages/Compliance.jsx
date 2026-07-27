import React, { useState, useMemo } from 'react';
import {
  ShieldCheck, ShieldAlert, Upload, ChevronDown, ChevronUp, CheckCircle2,
  XCircle, FileText, AlertTriangle, BarChart2, Layers, Lock,
  Server, Globe, Users, RefreshCw,
} from 'lucide-react';
import { useToast } from '../components/Toast';

// ─── Framework definitions ────────────────────────────────────────────────────
const FRAMEWORKS = [
  {
    id: 'SOC2', label: 'SOC 2 Type II',
    badge: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
    description: 'AICPA trust service criteria for security, availability, processing integrity, confidentiality, and privacy.',
    domains: [
      { id: 'CC1', name: 'Control Environment',     icon: Layers,      controls: 8,  compliant: 6, inReview: 1, open: 1 },
      { id: 'CC2', name: 'Communication & Info',     icon: Globe,       controls: 6,  compliant: 5, inReview: 1, open: 0 },
      { id: 'CC3', name: 'Risk Assessment',          icon: AlertTriangle, controls: 7, compliant: 4, inReview: 2, open: 1 },
      { id: 'CC4', name: 'Monitoring Activities',   icon: BarChart2,   controls: 5,  compliant: 4, inReview: 0, open: 1 },
      { id: 'CC5', name: 'Logical Access Controls', icon: Lock,        controls: 10, compliant: 8, inReview: 1, open: 1 },
      { id: 'CC6', name: 'System Operations',       icon: Server,      controls: 9,  compliant: 7, inReview: 1, open: 1 },
      { id: 'CC7', name: 'Change Management',       icon: RefreshCw,   controls: 6,  compliant: 5, inReview: 0, open: 1 },
      { id: 'CC8', name: 'Risk Mitigation',         icon: ShieldCheck, controls: 5,  compliant: 3, inReview: 1, open: 1 },
    ],
  },
  {
    id: 'ISO27001', label: 'ISO/IEC 27001:2022',
    badge: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
    description: 'International standard for information security management systems (ISMS).',
    domains: [
      { id: 'A5', name: 'Organizational Controls', icon: Layers,   controls: 37, compliant: 28, inReview: 5, open: 4 },
      { id: 'A6', name: 'People Controls',         icon: Users,    controls: 8,  compliant: 6,  inReview: 1, open: 1 },
      { id: 'A7', name: 'Physical Controls',       icon: Lock,     controls: 14, compliant: 11, inReview: 2, open: 1 },
      { id: 'A8', name: 'Technological Controls',  icon: Server,   controls: 34, compliant: 22, inReview: 7, open: 5 },
    ],
  },
  {
    id: 'NIST', label: 'NIST CSF 2.0',
    badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    description: 'NIST Cybersecurity Framework — Govern, Identify, Protect, Detect, Respond, Recover.',
    domains: [
      { id: 'GV', name: 'Govern',   icon: ShieldCheck,   controls: 6, compliant: 4, inReview: 1, open: 1 },
      { id: 'ID', name: 'Identify', icon: AlertTriangle, controls: 5, compliant: 3, inReview: 1, open: 1 },
      { id: 'PR', name: 'Protect',  icon: Lock,          controls: 6, compliant: 5, inReview: 0, open: 1 },
      { id: 'DE', name: 'Detect',   icon: BarChart2,     controls: 3, compliant: 2, inReview: 1, open: 0 },
      { id: 'RS', name: 'Respond',  icon: RefreshCw,     controls: 5, compliant: 3, inReview: 1, open: 1 },
      { id: 'RC', name: 'Recover',  icon: ShieldCheck,   controls: 3, compliant: 2, inReview: 0, open: 1 },
    ],
  },
  {
    id: 'GDPR', label: 'GDPR',
    badge: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    description: 'EU General Data Protection Regulation — data subject rights, processing lawfulness, DPO requirements.',
    domains: [
      { id: 'G1', name: 'Lawful Basis & Transparency', icon: FileText,     controls: 6, compliant: 5, inReview: 1, open: 0 },
      { id: 'G2', name: 'Data Subject Rights',         icon: Users,        controls: 8, compliant: 5, inReview: 2, open: 1 },
      { id: 'G3', name: 'Data Protection by Design',   icon: Lock,         controls: 5, compliant: 3, inReview: 1, open: 1 },
      { id: 'G4', name: 'Security of Processing',      icon: ShieldCheck,  controls: 7, compliant: 5, inReview: 1, open: 1 },
      { id: 'G5', name: 'Breach Notification',         icon: AlertTriangle, controls: 4, compliant: 3, inReview: 0, open: 1 },
    ],
  },
  {
    id: 'PCI', label: 'PCI-DSS v4.0',
    badge: 'border-red-500/30 bg-red-500/10 text-red-300',
    description: 'Payment Card Industry Data Security Standard for protecting cardholder data.',
    domains: [
      { id: 'P1', name: 'Network Security Controls',  icon: Server,        controls: 12, compliant: 9, inReview: 2, open: 1 },
      { id: 'P2', name: 'Secure Configurations',      icon: Layers,        controls: 8,  compliant: 6, inReview: 1, open: 1 },
      { id: 'P3', name: 'Cardholder Data Protection', icon: Lock,          controls: 7,  compliant: 5, inReview: 1, open: 1 },
      { id: 'P4', name: 'Encryption in Transit',      icon: Globe,         controls: 5,  compliant: 4, inReview: 0, open: 1 },
      { id: 'P5', name: 'Vulnerability Management',   icon: AlertTriangle, controls: 9,  compliant: 6, inReview: 2, open: 1 },
      { id: 'P6', name: 'Access Control Measures',    icon: Users,         controls: 10, compliant: 7, inReview: 2, open: 1 },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pctColor(p) {
  return p >= 90 ? '#22c55e' : p >= 70 ? '#f59e0b' : p >= 40 ? '#f97316' : '#ef4444';
}

function StatusBadge({ pct }) {
  const label = pct >= 90 ? 'COMPLIANT' : pct >= 70 ? 'IN REVIEW' : pct >= 40 ? 'PARTIAL' : 'NON-COMPLIANT';
  const cls   = pct >= 90
    ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
    : pct >= 70 ? 'border-amber-500/25 bg-amber-500/10 text-amber-300'
    : pct >= 40 ? 'border-orange-500/25 bg-orange-500/10 text-orange-300'
    : 'border-red-500/25 bg-red-500/10 text-red-300';
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[9px] font-bold tracking-[0.14em] ${cls}`}>{label}</span>;
}

function ProgressBar({ pct, thin = false }) {
  const color = pctColor(pct);
  return (
    <div className={`w-full rounded-full bg-white/6 ${thin ? 'h-1.5' : 'h-2.5'}`}>
      <div
        className="rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: color, boxShadow: `0 0 8px ${color}50` }}
      />
    </div>
  );
}

// ─── Evidence Upload ──────────────────────────────────────────────────────────
function EvidenceUpload({ domainId, onUpload }) {
  const [file, setFile]       = useState(null);
  const [note, setNote]       = useState('');
  const [busy, setBusy]       = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 800));
    onUpload({ domainId, fileName: file.name, note });
    setFile(null); setNote(''); setBusy(false);
  };

  return (
    <form onSubmit={submit} className="mt-4 rounded-2xl border border-white/8 bg-white/3 p-4">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Attach Evidence / Document</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-[10px] font-mono text-slate-500">File (.pdf, .png, .docx, .csv…)</label>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.docx,.xlsx,.csv,.txt"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full cursor-pointer text-xs text-slate-400 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-white/8 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-300 hover:file:bg-white/12"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-[10px] font-mono text-slate-500">Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Penetration test report Q3-2026"
            className="w-full rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-sky-500/40 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={!file || busy}
          className="flex items-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy
            ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-sky-300/30 border-t-sky-300" />
            : <Upload className="h-3.5 w-3.5" />}
          {busy ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </form>
  );
}

// ─── Domain Row ───────────────────────────────────────────────────────────────
function DomainRow({ domain, evidence, onUpload }) {
  const [open, setOpen] = useState(false);
  const pct     = Math.round((domain.compliant / domain.controls) * 100);
  const Icon    = domain.icon;
  const uploads = evidence[domain.id] || [];

  return (
    <div className="rounded-2xl border border-white/8 bg-[#0b1220]/60 transition hover:border-white/12">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full items-center gap-4 p-4 text-left">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/8 bg-white/5 text-slate-400">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-white">{domain.name}</span>
            <div className="flex shrink-0 items-center gap-2">
              <span className="font-mono text-xs text-slate-400">{domain.compliant}/{domain.controls}</span>
              <StatusBadge pct={pct} />
            </div>
          </div>
          <div className="mt-2"><ProgressBar pct={pct} /></div>
        </div>
        <div className="ml-2 shrink-0 text-slate-500">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-white/8 px-4 pb-4 pt-4">
          {/* Control breakdown */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 p-3 text-center">
              <p className="text-xl font-bold text-emerald-400">{domain.compliant}</p>
              <p className="mt-0.5 text-[10px] font-mono text-emerald-600">Compliant</p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/8 p-3 text-center">
              <p className="text-xl font-bold text-amber-400">{domain.inReview}</p>
              <p className="mt-0.5 text-[10px] font-mono text-amber-600">In Review</p>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/8 p-3 text-center">
              <p className="text-xl font-bold text-red-400">{domain.open}</p>
              <p className="mt-0.5 text-[10px] font-mono text-red-600">Open Gaps</p>
            </div>
          </div>

          {/* Uploaded evidence list */}
          {uploads.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Attached Evidence ({uploads.length})</p>
              {uploads.map((u, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/3 px-3 py-2">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                  <span className="flex-1 truncate font-mono text-xs text-slate-300">{u.fileName}</span>
                  {u.note && <span className="truncate text-[10px] italic text-slate-500">{u.note}</span>}
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                </div>
              ))}
            </div>
          )}

          <EvidenceUpload domainId={domain.id} onUpload={onUpload} />
        </div>
      )}
    </div>
  );
}

// ─── Compliance Score Gauge ───────────────────────────────────────────────────
function ComplianceGauge({ pct }) {
  const r     = 46;
  const circ  = 2 * Math.PI * r;
  const fill  = (pct / 100) * circ;
  const color = pctColor(pct);
  return (
    <div className="relative">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dasharray 1s ease, stroke 0.4s ease', filter: `drop-shadow(0 0 8px ${color}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold" style={{ color }}>{pct}%</span>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
          {pct >= 90 ? 'Compliant' : pct >= 70 ? 'In Review' : 'Partial'}
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Compliance() {
  const { showToast }         = useToast();
  const [frameworkId, setFid] = useState('SOC2');
  const [evidence, setEvidence] = useState({});
  const [domainFilter, setDomainFilter] = useState('ALL');

  const framework = FRAMEWORKS.find((f) => f.id === frameworkId);

  const overallPct = useMemo(() => {
    const tot  = framework.domains.reduce((s, d) => s + d.controls,  0);
    const comp = framework.domains.reduce((s, d) => s + d.compliant, 0);
    return Math.round((comp / tot) * 100);
  }, [framework]);

  const totalGaps = useMemo(() => framework.domains.reduce((s, d) => s + d.open, 0), [framework]);

  const filteredDomains = useMemo(() => {
    if (domainFilter === 'GAPS') return framework.domains.filter((d) => d.open > 0);
    if (domainFilter === 'FULL') return framework.domains.filter((d) => d.compliant === d.controls);
    return framework.domains;
  }, [framework, domainFilter]);

  const handleUpload = ({ domainId, fileName, note }) => {
    setEvidence((prev) => ({
      ...prev,
      [domainId]: [...(prev[domainId] || []), { fileName, note, uploadedAt: new Date().toISOString() }],
    }));
    showToast({ type: 'success', message: `Evidence "${fileName}" attached to ${domainId}` });
  };

  return (
    <div className="space-y-6 sc-fade-in">
      {/* Page header */}
      <div className="sc-panel p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="sc-badge border-sky-500/20 bg-sky-500/10 text-sky-300">Compliance</span>
          <span className="sc-badge border-white/10 bg-white/5 text-slate-400">Module 11</span>
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white">Compliance Manager</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Track regulatory framework adherence, manage control domains, and attach supporting evidence for audit readiness.
        </p>
      </div>

      {/* Framework selector */}
      <div className="sc-panel p-5">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Select Framework</p>
        <div className="flex flex-wrap gap-2">
          {FRAMEWORKS.map((fw) => (
            <button
              key={fw.id}
              onClick={() => setFid(fw.id)}
              className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${
                frameworkId === fw.id
                  ? `${fw.badge} ring-1 ring-white/20`
                  : 'border-white/8 bg-white/3 text-slate-400 hover:bg-white/6 hover:text-white'
              }`}
            >
              {fw.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">{framework.description}</p>
      </div>

      {/* Score summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="sc-card flex flex-col items-center justify-center gap-3 p-6">
          <ComplianceGauge pct={overallPct} />
          <div className="text-center">
            <p className="sc-text-kicker">Overall Score</p>
            <p className="mt-1 text-xs text-slate-500">{framework.label}</p>
          </div>
        </div>
        <div className="sc-card flex items-center justify-between p-5">
          <div>
            <p className="sc-text-kicker">Total Controls</p>
            <h3 className="mt-2 text-3xl font-extrabold text-white">
              {framework.domains.reduce((s, d) => s + d.controls, 0)}
            </h3>
            <p className="mt-1 text-xs text-slate-500">across {framework.domains.length} domains</p>
          </div>
          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-3 text-sky-300"><Layers className="h-6 w-6" /></div>
        </div>
        <div className="sc-card flex items-center justify-between p-5">
          <div>
            <p className="sc-text-kicker">Compliant Controls</p>
            <h3 className="mt-2 text-3xl font-extrabold text-emerald-400">
              {framework.domains.reduce((s, d) => s + d.compliant, 0)}
            </h3>
            <p className="mt-1 text-xs text-slate-500">passing attestation</p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300"><CheckCircle2 className="h-6 w-6" /></div>
        </div>
        <div className="sc-card flex items-center justify-between p-5">
          <div>
            <p className="sc-text-kicker">Open Gaps</p>
            <h3 className={`mt-2 text-3xl font-extrabold ${totalGaps > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{totalGaps}</h3>
            <p className="mt-1 text-xs text-slate-500">require remediation</p>
          </div>
          <div className={`rounded-2xl border p-3 ${totalGaps > 0 ? 'border-red-500/20 bg-red-500/10 text-red-300' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'}`}>
            {totalGaps > 0 ? <XCircle className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
          </div>
        </div>
      </div>

      {/* Domain breakdown */}
      <div className="sc-panel p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="sc-text-kicker">Control Domains</p>
            <h2 className="mt-1 text-base font-bold text-white">{framework.label} — Domain Breakdown</h2>
          </div>
          <div className="flex items-center gap-2">
            {[
              { val: 'ALL',  label: 'All Domains' },
              { val: 'GAPS', label: 'Has Gaps' },
              { val: 'FULL', label: 'Fully Compliant' },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setDomainFilter(val)}
                className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
                  domainFilter === val
                    ? 'border-sky-500/40 bg-sky-500/15 text-sky-300'
                    : 'border-white/8 bg-white/3 text-slate-500 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          {filteredDomains.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-center">
              <div>
                <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-slate-600" />
                <p className="text-sm font-mono text-slate-500">No domains match the selected filter.</p>
              </div>
            </div>
          ) : (
            filteredDomains.map((domain) => (
              <DomainRow key={domain.id} domain={domain} evidence={evidence} onUpload={handleUpload} />
            ))
          )}
        </div>
      </div>

      {/* All frameworks comparison table */}
      <div className="sc-panel p-5">
        <p className="sc-text-kicker mb-4">All Frameworks — Compliance Overview</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/8 text-[10px] uppercase tracking-widest text-slate-500">
                <th className="pb-3 pr-6">Framework</th>
                <th className="pb-3 pr-6">Controls</th>
                <th className="pb-3 pr-6">Compliant</th>
                <th className="pb-3 pr-6">Open Gaps</th>
                <th className="pb-3 pr-6 w-40">Score</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {FRAMEWORKS.map((fw) => {
                const tot  = fw.domains.reduce((s, d) => s + d.controls, 0);
                const comp = fw.domains.reduce((s, d) => s + d.compliant, 0);
                const gaps = fw.domains.reduce((s, d) => s + d.open, 0);
                const p    = Math.round((comp / tot) * 100);
                return (
                  <tr key={fw.id} className="cursor-pointer transition hover:bg-white/3" onClick={() => setFid(fw.id)}>
                    <td className="py-3 pr-6">
                      <span className={`sc-badge ${fw.badge}`}>{fw.label}</span>
                    </td>
                    <td className="py-3 pr-6 font-mono text-slate-300">{tot}</td>
                    <td className="py-3 pr-6 font-mono text-emerald-400">{comp}</td>
                    <td className={`py-3 pr-6 font-mono ${gaps > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{gaps}</td>
                    <td className="py-3 pr-6">
                      <div className="flex items-center gap-2">
                        <div className="w-24"><ProgressBar pct={p} thin /></div>
                        <span className="w-8 shrink-0 font-mono text-white">{p}%</span>
                      </div>
                    </td>
                    <td className="py-3"><StatusBadge pct={p} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
