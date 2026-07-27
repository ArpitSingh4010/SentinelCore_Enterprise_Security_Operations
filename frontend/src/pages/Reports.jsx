import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  FileText, Download, Play, Sparkles, CheckCircle2, AlertTriangle,
  Calendar, Filter, Clock, RefreshCw, X, ChevronDown, BarChart2,
  Shield, Bug, Siren, Globe, Users, FileBarChart, ToggleLeft, ToggleRight,
} from 'lucide-react';
import { useToast } from '../components/Toast';

// ─── Report type catalogue ────────────────────────────────────────────────────
const REPORT_TYPES = [
  {
    id: 'INCIDENT_SUMMARY',
    label: 'Incident Summary',
    icon: Siren,
    color: 'border-red-500/30 bg-red-500/10 text-red-300',
    desc: 'All incidents grouped by priority, status, and team.',
  },
  {
    id: 'VULNERABILITY_REPORT',
    label: 'Vulnerability Report',
    icon: Bug,
    color: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
    desc: 'CVE findings with severity breakdown, asset mapping, and patch status.',
  },
  {
    id: 'COMPLIANCE_AUDIT',
    label: 'Compliance Audit',
    icon: Shield,
    color: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
    desc: 'Framework control attestation status, open gaps, and evidence log.',
  },
  {
    id: 'THREAT_INTEL',
    label: 'Threat Intelligence',
    icon: Globe,
    color: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
    desc: 'IOC list, enrichment data, feed activity, and analyst notes.',
  },
  {
    id: 'EXECUTIVE_SUMMARY',
    label: 'Executive Summary',
    icon: BarChart2,
    color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    desc: 'High-level KPI dashboard — MTTR, risk score, open incidents, compliance posture.',
  },
  {
    id: 'USER_ACTIVITY',
    label: 'User Activity',
    icon: Users,
    color: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    desc: 'Audit trail of logins, role changes, and administrative actions.',
  },
];

const SEVERITIES  = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const FORMATS     = ['PDF', 'CSV', 'JSON'];
const FREQUENCIES = ['Daily', 'Weekly', 'Monthly', 'Quarterly'];

// ─── Mock report history ──────────────────────────────────────────────────────
const MOCK_HISTORY = [
  { id: '1', type: 'INCIDENT_SUMMARY',   title: 'Incident Summary — Week 29 2026', generatedBy: 'admin@sentinelcore.io', createdAt: '2026-07-21T09:00:00Z', format: 'PDF',  size: '1.2 MB' },
  { id: '2', type: 'VULNERABILITY_REPORT',title: 'Vulnerability Report — Q2 2026',  generatedBy: 'arpit@sentinelcore.io', createdAt: '2026-07-15T14:30:00Z', format: 'CSV',  size: '540 KB' },
  { id: '3', type: 'COMPLIANCE_AUDIT',   title: 'SOC 2 Compliance Audit — Jul 2026',generatedBy: 'admin@sentinelcore.io', createdAt: '2026-07-10T11:00:00Z', format: 'PDF',  size: '3.1 MB' },
  { id: '4', type: 'EXECUTIVE_SUMMARY',  title: 'Executive Summary — Jun 2026',     generatedBy: 'admin@sentinelcore.io', createdAt: '2026-07-01T08:00:00Z', format: 'PDF',  size: '890 KB' },
  { id: '5', type: 'THREAT_INTEL',       title: 'Threat Intel Briefing — Jul W1',   generatedBy: 'arpit@sentinelcore.io', createdAt: '2026-07-07T16:00:00Z', format: 'JSON', size: '210 KB' },
];

// ─── Type badge ───────────────────────────────────────────────────────────────
function TypeBadge({ typeId }) {
  const t = REPORT_TYPES.find((r) => r.id === typeId);
  if (!t) return <span className="sc-badge">{typeId}</span>;
  return <span className={`sc-badge ${t.color}`}>{t.label}</span>;
}

// ─── Schedule Toggle ──────────────────────────────────────────────────────────
function ToggleSwitch({ value, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
    >
      {value
        ? <ToggleRight className="h-5 w-5 text-sky-400" />
        : <ToggleLeft  className="h-5 w-5 text-slate-600" />}
      {label}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Reports() {
  const { showToast } = useToast();

  // Form state
  const [reportType,     setReportType]     = useState('INCIDENT_SUMMARY');
  const [dateFrom,       setDateFrom]       = useState('');
  const [dateTo,         setDateTo]         = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [teamFilter,     setTeamFilter]     = useState('');
  const [assetFilter,    setAssetFilter]    = useState('');
  const [format,         setFormat]         = useState('PDF');
  const [scheduleEnabled,setSchedule]       = useState(false);
  const [frequency,      setFrequency]      = useState('Weekly');
  const [generating,     setGenerating]     = useState(false);

  // History
  const [history, setHistory]   = useState(MOCK_HISTORY);
  const [histSearch, setHSearch] = useState('');
  const [typeFilter,  setTypeFilter] = useState('ALL');
  const [isMock,      setIsMock]     = useState(true);

  // Teams for dropdown
  const [teams, setTeams] = useState([]);
  useEffect(() => {
    axios.get('/api/teams').then((r) => setTeams(r.data || [])).catch(() => {});
    axios.get('/api/reports')
      .then((r) => { setHistory(r.data); setIsMock(false); })
      .catch(() => setIsMock(true));
  }, []);

  const selectedType = REPORT_TYPES.find((t) => t.id === reportType);

  const filteredHistory = useMemo(() => {
    return history.filter((h) => {
      const matchType  = typeFilter === 'ALL' || h.type === typeFilter;
      const matchSearch = !histSearch || h.title.toLowerCase().includes(histSearch.toLowerCase());
      return matchType && matchSearch;
    });
  }, [history, typeFilter, histSearch]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const payload = { type: reportType, dateFrom, dateTo, severityFilter, teamFilter, assetFilter, format, scheduled: scheduleEnabled, frequency };
      const res = await axios.post('/api/reports/generate', payload);
      showToast({ type: 'success', message: `Report "${res.data?.title || reportType}" generated` });
      setHistory((prev) => [{ id: Date.now(), ...payload, title: res.data?.title || `${selectedType?.label} Report`, generatedBy: 'You', createdAt: new Date().toISOString(), size: '—' }, ...prev]);
    } catch {
      // Optimistic stub for demo
      const stub = { id: Date.now(), type: reportType, title: `${selectedType?.label} — ${new Date().toLocaleDateString()}`, generatedBy: 'You', createdAt: new Date().toISOString(), format, size: '—' };
      setHistory((prev) => [stub, ...prev]);
      showToast({ type: 'success', message: `${selectedType?.label} report queued for generation` });
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (item, fmt) => {
    showToast({ type: 'info', message: `Downloading ${item.title} as ${fmt}` });
    if (item.csvPath) window.open(`http://localhost:8080${item.csvPath}`, '_blank');
  };

  return (
    <div className="space-y-6 sc-fade-in">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="sc-panel p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="sc-badge border-emerald-500/20 bg-emerald-500/10 text-emerald-300">Reports</span>
          <span className="sc-badge border-white/10 bg-white/5 text-slate-400">Module 13</span>
          {isMock && <span className="sc-badge border-amber-500/20 bg-amber-500/10 text-amber-300">Preview — Backend Pending</span>}
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white">Report Builder</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Generate compliance, incident, vulnerability, and executive reports with custom filters. Schedule recurring exports or download on demand.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* ── Builder panel ──────────────────────────────────────────────── */}
        <div className="space-y-4 xl:col-span-1">
          {/* Report type cards */}
          <div className="sc-panel p-5">
            <p className="sc-text-kicker mb-3">Report Type</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-1">
              {REPORT_TYPES.map((rt) => {
                const Icon = rt.icon;
                return (
                  <button
                    key={rt.id}
                    onClick={() => setReportType(rt.id)}
                    className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition ${
                      reportType === rt.id
                        ? `${rt.color} ring-1 ring-white/15`
                        : 'border-white/8 bg-white/3 text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${reportType === rt.id ? rt.color : 'border-white/10 bg-white/5'}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white">{rt.label}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500 leading-relaxed">{rt.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right: Filters + Actions + History ─────────────────────────── */}
        <div className="space-y-4 xl:col-span-2">
          {/* Filter panel */}
          <div className="sc-panel p-5">
            <p className="sc-text-kicker mb-4">Filters & Parameters</p>
            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Date range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    <Calendar className="mr-1 inline h-3 w-3" /> From Date
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-xs text-white focus:border-sky-500/40 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    <Calendar className="mr-1 inline h-3 w-3" /> To Date
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-xs text-white focus:border-sky-500/40 focus:outline-none"
                  />
                </div>
              </div>

              {/* Severity filter chips */}
              <div>
                <label className="mb-2 block text-[10px] font-mono uppercase tracking-wider text-slate-500">Severity</label>
                <div className="flex flex-wrap gap-1.5">
                  {SEVERITIES.map((s) => (
                    <button
                      key={s} type="button"
                      onClick={() => setSeverityFilter(s)}
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-bold font-mono uppercase transition ${
                        severityFilter === s
                          ? 'border-sky-500/40 bg-sky-500/15 text-sky-300'
                          : 'border-white/8 bg-white/3 text-slate-500 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Team + Asset filters */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-slate-500">Team</label>
                  <select
                    value={teamFilter}
                    onChange={(e) => setTeamFilter(e.target.value)}
                    className="w-full rounded-xl border border-white/8 bg-[#0b1220] px-3 py-2 text-xs text-white focus:border-sky-500/40 focus:outline-none"
                  >
                    <option value="">All Teams</option>
                    {teams.map((t) => <option key={t.id} value={t.id}>{t.teamName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-mono uppercase tracking-wider text-slate-500">Asset Filter</label>
                  <input
                    type="text"
                    value={assetFilter}
                    onChange={(e) => setAssetFilter(e.target.value)}
                    placeholder="e.g. PROD-DB-01"
                    className="w-full rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-sky-500/40 focus:outline-none"
                  />
                </div>
              </div>

              {/* Format + Schedule row */}
              <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/8 bg-white/3 p-4">
                {/* Format chips */}
                <div>
                  <p className="mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">Output Format</p>
                  <div className="flex gap-1.5">
                    {FORMATS.map((f) => (
                      <button
                        key={f} type="button"
                        onClick={() => setFormat(f)}
                        className={`rounded-lg border px-3 py-1.5 text-[10px] font-bold font-mono transition ${
                          format === f
                            ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                            : 'border-white/8 bg-white/3 text-slate-500 hover:text-white'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Schedule toggle */}
                <div className="flex-1">
                  <p className="mb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">Schedule</p>
                  <div className="flex items-center gap-4">
                    <ToggleSwitch value={scheduleEnabled} onChange={setSchedule} label={scheduleEnabled ? 'Scheduled' : 'On Demand'} />
                    {scheduleEnabled && (
                      <select
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs text-sky-300 focus:outline-none"
                      >
                        {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={generating}
                  className="sc-button-primary flex-1 py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {generating
                    ? <><div className="h-4 w-4 animate-spin rounded-full border-2 border-black/25 border-t-black" /><span>Generating…</span></>
                    : <><Play className="h-4 w-4" /><span>{scheduleEnabled ? `Schedule ${frequency}` : 'Generate Report'}</span></>}
                </button>
                {scheduleEnabled && (
                  <button
                    type="button"
                    onClick={() => showToast({ type: 'info', message: `${frequency} schedule saved for ${selectedType?.label}` })}
                    className="sc-button-secondary px-4 py-3 text-sm font-semibold"
                  >
                    <Clock className="h-4 w-4" />
                    Save Schedule
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* History table */}
          <div className="sc-panel overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 p-4">
              <div>
                <p className="sc-text-kicker">Generated Report History</p>
                <p className="mt-0.5 text-xs text-slate-500">{filteredHistory.length} report{filteredHistory.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Type filter */}
                <div className="relative">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="appearance-none rounded-xl border border-white/8 bg-white/5 py-2 pl-3 pr-7 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="ALL">All Types</option>
                    {REPORT_TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-500" />
                </div>
                {/* Search */}
                <input
                  value={histSearch}
                  onChange={(e) => setHSearch(e.target.value)}
                  placeholder="Search reports…"
                  className="rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-sky-500/40 focus:outline-none"
                />
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <FileBarChart className="mb-2 h-8 w-8 text-slate-600" />
                <p className="text-xs font-mono text-slate-500">No reports match current filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/6">
                {filteredHistory.map((item) => (
                  <div key={item.id} className="flex flex-col gap-3 p-4 transition hover:bg-white/3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <TypeBadge typeId={item.type} />
                        <span className="font-mono text-[10px] text-slate-500">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                        {item.format && (
                          <span className="sc-badge border-white/10 bg-white/5 text-slate-400">{item.format}</span>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-white">{item.title}</p>
                      <p className="font-mono text-[10px] text-slate-500">
                        By: {item.generatedBy} {item.size && item.size !== '—' ? `· ${item.size}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownload(item, 'CSV')}
                        className="sc-button-secondary px-3 py-2 text-xs font-semibold"
                      >
                        <Download className="h-3.5 w-3.5" /> CSV
                      </button>
                      <button
                        onClick={() => handleDownload(item, 'PDF')}
                        className="flex items-center gap-1.5 rounded-xl border border-sky-500/25 bg-sky-500/10 px-3 py-2 text-xs font-semibold text-sky-300 transition hover:bg-sky-500/20"
                      >
                        <Download className="h-3.5 w-3.5" /> PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
