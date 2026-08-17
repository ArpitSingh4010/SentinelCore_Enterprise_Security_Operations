import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  AlertTriangle, ArrowLeft, ArrowRight, Clock, RefreshCw, Search, X,
  ChevronDown, ChevronRight, Filter, Shield, User, Globe, Calendar,
  Eye, Code2, CheckCircle2, XCircle, LogIn, LogOut, Trash2, Edit3,
  UserPlus, UserX, Key, Settings, FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ─── Action config ────────────────────────────────────────────────────────────
const ACTION_CONFIG = {
  LOGIN_SUCCESS:  { cls: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300', icon: LogIn,     cat: 'AUTH'  },
  LOGIN_FAILED:   { cls: 'border-red-500/20 bg-red-500/10 text-red-300',            icon: XCircle,   cat: 'AUTH'  },
  LOGOUT:         { cls: 'border-slate-500/20 bg-slate-500/10 text-slate-300',      icon: LogOut,    cat: 'AUTH'  },
  USER_CREATED:   { cls: 'border-sky-500/20 bg-sky-500/10 text-sky-300',            icon: UserPlus,  cat: 'USER'  },
  USER_UPDATED:   { cls: 'border-blue-500/20 bg-blue-500/10 text-blue-300',         icon: Edit3,     cat: 'USER'  },
  USER_DELETED:   { cls: 'border-red-500/20 bg-red-500/10 text-red-300',            icon: UserX,     cat: 'USER'  },
  ROLE_ASSIGNED:  { cls: 'border-amber-500/20 bg-amber-500/10 text-amber-300',      icon: Key,       cat: 'USER'  },
  TEAM_CREATED:   { cls: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300',         icon: CheckCircle2,cat:'TEAM' },
  TEAM_UPDATED:   { cls: 'border-blue-500/20 bg-blue-500/10 text-blue-300',         icon: Edit3,     cat: 'TEAM'  },
  TEAM_DELETED:   { cls: 'border-red-500/20 bg-red-500/10 text-red-300',            icon: Trash2,    cat: 'TEAM'  },
  ASSET_CREATED:  { cls: 'border-purple-500/20 bg-purple-500/10 text-purple-300',   icon: Shield,    cat: 'ASSET' },
  ASSET_DELETED:  { cls: 'border-red-500/20 bg-red-500/10 text-red-300',            icon: Trash2,    cat: 'ASSET' },
  CONFIG_CHANGED: { cls: 'border-orange-500/20 bg-orange-500/10 text-orange-300',   icon: Settings,  cat: 'CONFIG'},
};

const ACTION_CATEGORIES = ['ALL', 'AUTH', 'USER', 'TEAM', 'ASSET', 'CONFIG'];
const MODULE_LIST        = ['ALL', 'AUTH', 'USER', 'TEAM', 'ASSET', 'INCIDENT', 'ALERT', 'LOG', 'THREAT_INTEL', 'REPORT'];

function formatDate(v) {
  if (!v) return 'N/A';
  return new Date(v).toLocaleString();
}

function relativeTime(v) {
  if (!v) return '';
  const diff = Date.now() - new Date(v).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── ActionBadge ──────────────────────────────────────────────────────────────
function ActionBadge({ action }) {
  const cfg  = ACTION_CONFIG[action];
  const Icon = cfg?.icon ?? FileText;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.12em] ${cfg?.cls ?? 'border-white/10 bg-white/5 text-slate-300'}`}>
      <Icon className="h-3 w-3" />
      {action || 'UNKNOWN'}
    </span>
  );
}

// ─── Diff viewer ──────────────────────────────────────────────────────────────
function DiffViewer({ before, after }) {
  if (!before && !after) return null;

  let beforeObj, afterObj;
  try { beforeObj = typeof before === 'string' ? JSON.parse(before) : before; } catch { beforeObj = { raw: before }; }
  try { afterObj  = typeof after  === 'string' ? JSON.parse(after)  : after;  } catch { afterObj  = { raw: after };  }

  const allKeys = Array.from(new Set([
    ...Object.keys(beforeObj || {}),
    ...Object.keys(afterObj  || {}),
  ]));

  const changed = allKeys.filter((k) => JSON.stringify(beforeObj?.[k]) !== JSON.stringify(afterObj?.[k]));
  const same    = allKeys.filter((k) => !changed.includes(k));

  return (
    <div className="mt-3 rounded-2xl border border-white/8 bg-[#060c18] p-4">
      <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
        <Code2 className="h-3 w-3" /> Before / After Diff
      </p>
      {changed.length === 0 && <p className="text-xs font-mono text-slate-500">No field changes detected.</p>}
      <div className="space-y-2">
        {changed.map((k) => (
          <div key={k} className="rounded-xl border border-white/6 bg-white/3 p-2.5">
            <p className="mb-1.5 font-mono text-[10px] font-bold text-slate-500 uppercase">{k}</p>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              <div className="rounded-lg border border-red-500/15 bg-red-500/8 px-2.5 py-1.5">
                <span className="mr-1.5 text-[9px] font-bold text-red-400">BEFORE</span>
                <span className="font-mono text-[10px] text-red-300 break-all">
                  {beforeObj?.[k] != null ? JSON.stringify(beforeObj[k]) : <em className="text-slate-600">undefined</em>}
                </span>
              </div>
              <div className="rounded-lg border border-emerald-500/15 bg-emerald-500/8 px-2.5 py-1.5">
                <span className="mr-1.5 text-[9px] font-bold text-emerald-400">AFTER</span>
                <span className="font-mono text-[10px] text-emerald-300 break-all">
                  {afterObj?.[k] != null ? JSON.stringify(afterObj[k]) : <em className="text-slate-600">undefined</em>}
                </span>
              </div>
            </div>
          </div>
        ))}
        {same.length > 0 && (
          <p className="text-[10px] font-mono text-slate-600">{same.length} unchanged field{same.length !== 1 ? 's' : ''} hidden</p>
        )}
      </div>
    </div>
  );
}

// ─── Log Table Row ─────────────────────────────────────────────────────────────
function LogRow({ log }) {
  const [expanded, setExpanded] = useState(false);
  const hasDiff = log.beforeState || log.afterState;

  return (
    <>
      <tr
        className="cursor-pointer transition hover:bg-white/4"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="whitespace-nowrap px-4 py-3 font-mono text-[10px] text-slate-500">
          <div>{relativeTime(log.timestamp)}</div>
          <div className="text-slate-600">{formatDate(log.timestamp)}</div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-300">
              <User className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{log.userEmail || 'System'}</p>
              <p className="font-mono text-[10px] text-slate-600">{log.userId?.slice(0, 8) || '—'}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3"><ActionBadge action={log.action} /></td>
        <td className="px-4 py-3 font-mono text-xs text-slate-400">{log.module || 'SYSTEM'}</td>
        <td className="max-w-[220px] px-4 py-3 text-xs text-slate-300">
          <p className="line-clamp-2">{log.description || 'No description.'}</p>
        </td>
        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {log.ipAddress || 'N/A'}
          </div>
        </td>
        <td className="px-4 py-3 text-slate-500">
          <div className="flex items-center gap-1.5">
            {hasDiff && <span className="h-1.5 w-1.5 rounded-full bg-amber-400" title="Has diff" />}
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-[#050a12]">
          <td colSpan={7} className="px-6 pb-5 pt-2">
            <div className="space-y-3">
              {/* Full description */}
              <div className="rounded-xl border border-white/6 bg-white/3 px-4 py-3">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Full Description</p>
                <p className="text-xs text-slate-300">{log.description || 'No description supplied.'}</p>
              </div>
              {/* Metadata row */}
              <div className="grid grid-cols-2 gap-3 text-[10px] font-mono sm:grid-cols-4">
                <div className="rounded-xl border border-white/6 bg-white/3 px-3 py-2">
                  <p className="text-slate-500 uppercase tracking-wider mb-1">User ID</p>
                  <p className="text-white break-all">{log.userId || '—'}</p>
                </div>
                <div className="rounded-xl border border-white/6 bg-white/3 px-3 py-2">
                  <p className="text-slate-500 uppercase tracking-wider mb-1">IP Address</p>
                  <p className="text-white">{log.ipAddress || '—'}</p>
                </div>
                <div className="rounded-xl border border-white/6 bg-white/3 px-3 py-2">
                  <p className="text-slate-500 uppercase tracking-wider mb-1">Module</p>
                  <p className="text-white">{log.module || '—'}</p>
                </div>
                <div className="rounded-xl border border-white/6 bg-white/3 px-3 py-2">
                  <p className="text-slate-500 uppercase tracking-wider mb-1">Timestamp</p>
                  <p className="text-white">{formatDate(log.timestamp)}</p>
                </div>
              </div>
              {/* Diff viewer */}
              {hasDiff && <DiffViewer before={log.beforeState} after={log.afterState} />}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AuditLogs() {
  const { user } = useAuth();
  const canReadAuditLogs = user?.role === 'ADMIN' || user?.role === 'ANALYST';

  const [logs,          setLogs]          = useState([]);
  const [page,          setPage]          = useState(0);
  const [totalPages,    setTotalPages]    = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const pageSize = 15;

  // Filters
  const [search,      setSearch]      = useState('');
  const [actionCat,   setActionCat]   = useState('ALL');
  const [moduleFilter,setModFilter]   = useState('ALL');
  const [dateFrom,    setDateFrom]    = useState('');
  const [dateTo,      setDateTo]      = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const activeFilterCount = [search, actionCat !== 'ALL' && actionCat, moduleFilter !== 'ALL' && moduleFilter, dateFrom, dateTo].filter(Boolean).length;

  const fetchLogs = async () => {
    if (!canReadAuditLogs) { setLoading(false); setError('Audit logs are available to admins and analysts only.'); return; }
    setLoading(true);
    setError('');
    try {
      const params = { page, size: pageSize, sortBy: 'timestamp', direction: 'desc' };
      if (search)              params.search    = search;
      if (moduleFilter !== 'ALL') params.module = moduleFilter;
      if (dateFrom)            params.startDate = new Date(dateFrom).toISOString();
      if (dateTo)              params.endDate   = new Date(dateTo + 'T23:59:59').toISOString();
      const res = await axios.get('/api/audit-logs', { params });
      setLogs(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      setError(err.response?.status === 403 ? 'You do not have access to audit logs.' : 'Failed to retrieve audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [page, canReadAuditLogs]);

  // Client-side action category filter
  const displayedLogs = useMemo(() => {
    if (actionCat === 'ALL') return logs;
    return logs.filter((l) => ACTION_CONFIG[l.action]?.cat === actionCat);
  }, [logs, actionCat]);

  const resetFilters = () => {
    setSearch(''); setActionCat('ALL'); setModFilter('ALL'); setDateFrom(''); setDateTo('');
  };

  return (
    <div className="space-y-6 sc-fade-in">
      {/* Page header */}
      <div className="sc-panel flex flex-col gap-4 p-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="sc-badge border-sky-500/20 bg-sky-500/10 text-sky-300">Audit Trail</span>
            <span className="sc-badge border-white/10 bg-white/5 text-slate-300">{user?.role} scope</span>
            <span className="sc-badge border-white/10 bg-white/5 text-slate-400">{totalElements} events</span>
          </div>
          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white">Audit Trails</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Immutable record of all authentication, user, team, and system actions. Expand any row to see before/after field diff.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`sc-button-secondary px-4 py-2.5 text-sm font-semibold ${showFilters ? 'border-sky-500/30 text-sky-300' : ''}`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-sky-500 text-[9px] font-bold text-black">{activeFilterCount}</span>
            )}
          </button>
          <button onClick={fetchLogs} className="sc-button-secondary px-4 py-2.5 text-sm font-semibold">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="sc-panel p-5">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user, description, action…"
                className="w-full rounded-xl border border-white/8 bg-white/5 py-2 pl-8 pr-3 text-xs text-white placeholder-slate-600 focus:border-sky-500/40 focus:outline-none"
              />
            </div>

            {/* Date range */}
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-xs text-white focus:outline-none" />
            <span className="text-slate-600 text-xs">to</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-xs text-white focus:outline-none" />

            {/* Module filter */}
            <select
              value={moduleFilter}
              onChange={(e) => setModFilter(e.target.value)}
              className="rounded-xl border border-white/8 bg-[#0b1220] px-3 py-2 text-xs text-slate-300 focus:outline-none"
            >
              {MODULE_LIST.map((m) => <option key={m} value={m}>{m === 'ALL' ? 'All Modules' : m}</option>)}
            </select>

            {activeFilterCount > 0 && (
              <button onClick={resetFilters} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}

            <button onClick={fetchLogs} className="sc-button-primary px-4 py-2 text-xs font-semibold">Apply</button>
          </div>

          {/* Action category chips */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600 mr-1">Category:</span>
            {ACTION_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActionCat(cat)}
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold font-mono uppercase tracking-wider transition ${
                  actionCat === cat
                    ? 'border-sky-500/40 bg-sky-500/15 text-sky-300'
                    : 'border-white/8 bg-white/3 text-slate-500 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="sc-table-shell overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
            <p className="text-xs font-mono text-slate-400">Loading audit trail…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertTriangle className="mb-3 h-8 w-8 text-red-300" />
            <p className="text-sm font-mono text-red-200">{error}</p>
          </div>
        ) : displayedLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Clock className="mb-3 h-8 w-8 text-slate-500" />
            <p className="text-sm font-mono text-slate-400">No audit events match current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/8 text-[10px] uppercase tracking-[0.24em] text-slate-500">
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3">Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6 text-xs">
                {displayedLogs.map((log) => <LogRow key={log.id} log={log} />)}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 0 && (
          <div className="flex flex-col gap-3 border-t border-white/8 bg-[#0b1220]/70 p-4 text-xs font-mono text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>Total Events: {totalElements} · Page {page + 1} of {totalPages}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage((v) => Math.max(v - 1, 0))}
                disabled={page === 0}
                className="sc-button-secondary p-2 disabled:pointer-events-none disabled:opacity-30"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = Math.max(0, Math.min(page - 2 + i, totalPages - 5 + i));
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className={`rounded-lg px-3 py-1.5 text-xs transition ${pg === page ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-slate-500 hover:text-white'}`}
                  >
                    {pg + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((v) => Math.min(v + 1, totalPages - 1))}
                disabled={page === totalPages - 1}
                className="sc-button-secondary p-2 disabled:pointer-events-none disabled:opacity-30"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
