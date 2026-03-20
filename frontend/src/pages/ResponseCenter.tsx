import {
    ShieldAlert,
    AlertTriangle,
    ArrowRight,
    Share2,
    CheckSquare,
    Activity,
    Zap,
    FileText,
    Ban,
    Loader2,
    CheckCircle2,
    XCircle,
    ShieldCheck,
    Bell,
    Filter,
    TrendingUp,
    Eye,
    Flag,
    SkipForward,
} from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';
import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ActionFeedback = {
    tone: 'success' | 'error' | 'info';
    message: string;
};

type SeverityFilter = 'all' | 'high' | 'medium' | 'low';

const env = (import.meta as ImportMeta & { env?: Record<string, string> }).env;
const API_BASE = env?.VITE_API_BACKEND?.replace(/\/$/, '') || 'http://localhost:8000/api';

export default function ResponseCenter() {
    const { alerts } = useWebSocket();
    const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
    const [pendingAction, setPendingAction] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<ActionFeedback | null>(null);
    const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');

    const selectedAlert = useMemo(
        () => alerts.find((alert) => alert.id === selectedAlertId) || alerts[0],
        [alerts, selectedAlertId]
    );

    const stats = useMemo(() => {
        const high = alerts.filter(a => a.severity === 'high').length;
        const medium = alerts.filter(a => a.severity === 'medium').length;
        const low = alerts.filter(a => a.severity === 'low').length;
        return [
            { label: 'Total Alerts', value: alerts.length, color: 'text-white', bg: 'bg-white/5', border: 'border-white/10' },
            { label: 'Critical', value: high, color: 'text-brand-red', bg: 'bg-brand-red/10', border: 'border-brand-red/20' },
            { label: 'Medium', value: medium, color: 'text-brand-orange', bg: 'bg-brand-orange/10', border: 'border-brand-orange/20' },
            { label: 'Low', value: low, color: 'text-brand-cyan', bg: 'bg-brand-cyan/10', border: 'border-brand-cyan/20' },
        ];
    }, [alerts]);

    const filteredAlerts = useMemo(() => {
        if (severityFilter === 'all') return alerts;
        return alerts.filter(a => a.severity === severityFilter);
    }, [alerts, severityFilter]);

    const showFeedback = (tone: ActionFeedback['tone'], message: string) => {
        setFeedback({ tone, message });
        window.setTimeout(() => setFeedback(null), 3500);
    };

    const postJson = async (endpoint: string, payload: Record<string, unknown>) => {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error((data as { detail?: string }).detail || 'Request failed.');
        }

        return data;
    };

    const handleAlertAction = async (action: string, label: string) => {
        if (!selectedAlert) {
            showFeedback('error', 'Select an alert first to run an action.');
            return;
        }

        setPendingAction(action);
        try {
            await postJson('/alerts/action', { alert_id: selectedAlert.id, action });
            showFeedback('success', `${label} completed for alert #${selectedAlert.id}.`);
        } catch (error) {
            showFeedback('error', error instanceof Error ? error.message : 'Action failed.');
            console.error('Action failed:', error);
        } finally {
            setPendingAction(null);
        }
    };

    const handleIntelShare = async () => {
        setPendingAction('share');
        try {
            await postJson('/intel/share', {
                hash: `SEC-${Math.random().toString(16).slice(2, 8)}`,
                type: 'DISTRIBUTED_VECTOR',
                source: 'RESPONSE_CENTER',
            });
            showFeedback('success', 'Signatures distributed to intelligence mesh.');
        } catch (error) {
            showFeedback('error', error instanceof Error ? error.message : 'Intel share failed.');
            console.error('Intel share failed:', error);
        } finally {
            setPendingAction(null);
        }
    };

    const handleReportGenerate = async () => {
        setPendingAction('report');
        try {
            const response = await fetch(`${API_BASE}/report/generate`);
            if (!response.ok) {
                throw new Error('Report generation failed.');
            }

            const reportBlob = await response.blob();
            const fileUrl = URL.createObjectURL(reportBlob);
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = `forensic_report_${Date.now()}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(fileUrl);

            showFeedback('success', 'Forensic report generated and downloaded.');
        } catch (error) {
            showFeedback('error', error instanceof Error ? error.message : 'Report generation failed.');
            console.error('Report generation failed:', error);
        } finally {
            setPendingAction(null);
        }
    };

    const severityFilters: { id: SeverityFilter; label: string; color: string; activeClass: string }[] = [
        { id: 'all', label: 'All', color: 'text-slate-400', activeClass: 'bg-white/10 text-white border-white/20' },
        { id: 'high', label: 'Critical', color: 'text-brand-red', activeClass: 'bg-brand-red/20 text-brand-red border-brand-red/30' },
        { id: 'medium', label: 'Medium', color: 'text-brand-orange', activeClass: 'bg-brand-orange/20 text-brand-orange border-brand-orange/30' },
        { id: 'low', label: 'Low', color: 'text-brand-cyan', activeClass: 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/30' },
    ];

    const playbookActions = [
        { id: 'quarantine', label: 'Quarantine Node', desc: 'Isolate source VLAN', color: 'text-brand-cyan', bg: 'bg-brand-cyan/10', hoverBorder: 'hover:border-brand-cyan/40', iconColor: 'brand-cyan' },
        { id: 'rotate', label: 'Rotate Gateway', desc: 'Flush active credentials', color: 'text-brand-orange', bg: 'bg-brand-orange/10', hoverBorder: 'hover:border-brand-orange/40', iconColor: 'brand-orange' },
        { id: 'blacklist', label: 'Blacklist Entity', desc: 'Global firewall update', color: 'text-brand-red', bg: 'bg-brand-red/10', hoverBorder: 'hover:border-brand-red/40', iconColor: 'brand-red' },
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* ── Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 bg-brand-cyan/10 rounded-xl flex items-center justify-center border border-brand-cyan/30 shadow-[0_0_20px_rgba(0,240,250,0.15)]">
                            <ShieldAlert className="w-6 h-6 text-brand-cyan" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none">
                                Response Center <span className="text-brand-cyan not-italic">(Level_4)</span>
                            </h1>
                            <p className="text-slate-500 text-xs font-medium tracking-wide mt-1">
                                Autonomous mitigation protocols · Real-time alert chronology management
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    <button
                        disabled={pendingAction === 'share'}
                        onClick={handleIntelShare}
                        className="bg-slate-900/70 hover:bg-slate-800 text-[10px] font-black uppercase tracking-[0.15em] text-white py-2.5 px-5 rounded-xl border border-white/10 flex items-center gap-2.5 transition-all hover:border-brand-cyan/40 backdrop-blur-md group disabled:opacity-40 shadow-lg"
                    >
                        {pendingAction === 'share' ? (
                            <Loader2 className="w-3.5 h-3.5 text-brand-cyan animate-spin" />
                        ) : (
                            <Share2 className="w-3.5 h-3.5 text-brand-cyan group-hover:rotate-12 transition-transform" />
                        )}
                        Distribute Signatures
                    </button>
                    <button
                        disabled={pendingAction === 'report'}
                        onClick={handleReportGenerate}
                        className="bg-brand-cyan/10 hover:bg-brand-cyan/20 text-[10px] font-black uppercase tracking-[0.15em] text-brand-cyan py-2.5 px-5 rounded-xl border border-brand-cyan/30 flex items-center gap-2.5 transition-all disabled:opacity-40 shadow-lg"
                    >
                        {pendingAction === 'report' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <FileText className="w-3.5 h-3.5" />
                        )}
                        Generate Report
                    </button>
                </div>
            </motion.div>

            {/* ── Stats Bar ── */}
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
                {stats.map((s, i) => (
                    <div key={i} className={`glass-panel p-4 flex items-center gap-4 border ${s.border} group hover:scale-[1.02] transition-transform`}>
                        <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0 border ${s.border}`}>
                            {i === 0 ? <Bell className={`w-4 h-4 ${s.color}`} /> :
                             i === 1 ? <ShieldAlert className={`w-4 h-4 ${s.color}`} /> :
                             i === 2 ? <AlertTriangle className={`w-4 h-4 ${s.color}`} /> :
                             <Activity className={`w-4 h-4 ${s.color}`} />}
                        </div>
                        <div>
                            <div className={`text-2xl font-black font-mono ${s.color} leading-none`}>{s.value}</div>
                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">{s.label}</div>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* ── Global feedback toast ── */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        key="global-feedback"
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        className={`rounded-xl border px-4 py-3 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl ${
                            feedback.tone === 'success'
                                ? 'border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan'
                                : feedback.tone === 'error'
                                ? 'border-brand-red/30 bg-brand-red/10 text-brand-red'
                                : 'border-brand-orange/30 bg-brand-orange/10 text-brand-orange'
                        }`}
                    >
                        {feedback.tone === 'success' ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                        ) : feedback.tone === 'error' ? (
                            <XCircle className="w-4 h-4 shrink-0" />
                        ) : (
                            <ShieldAlert className="w-4 h-4 shrink-0" />
                        )}
                        {feedback.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Main 3-col grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Left: Alert Timeline ── */}
                <div className="lg:col-span-2 glass-panel flex flex-col relative overflow-hidden group" style={{ minHeight: '700px' }}>
                    <div className="absolute inset-0 cyber-grid opacity-[0.07] pointer-events-none" />

                    {/* Timeline header + filters */}
                    <div className="p-6 pb-4 border-b border-white/5 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                <span className="w-8 h-px bg-brand-cyan/40"></span>
                                Alert Chronology
                            </h2>
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 border border-white/5 rounded-full">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
                                <span className="text-[9px] font-black text-brand-cyan uppercase tracking-widest">Live_Ingestion</span>
                            </div>
                        </div>

                        {/* Filter tabs */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <Filter className="w-3 h-3 text-slate-600" />
                            {severityFilters.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setSeverityFilter(f.id)}
                                    className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                                        severityFilter === f.id
                                            ? f.activeClass
                                            : `border-white/5 text-slate-500 hover:${f.color} hover:border-white/10`
                                    }`}
                                >
                                    {f.label}
                                    {f.id !== 'all' && (
                                        <span className="ml-1.5 opacity-70">
                                            ({alerts.filter(a => a.severity === f.id).length})
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Timeline list */}
                    <div className="flex-1 overflow-y-auto p-6 relative z-10 space-y-4 custom-scrollbar">
                        <div className="absolute left-10 top-0 bottom-0 w-px bg-white/5 z-0" />

                        {filteredAlerts.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center mb-4 opacity-30">
                                    <TrendingUp className="w-8 h-8 text-slate-600" />
                                </div>
                                <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest">Perimeter Clear_</p>
                            </div>
                        )}

                        <AnimatePresence initial={false}>
                            {filteredAlerts.map((item) => {
                                const isSelected = item.id === selectedAlert?.id;
                                const isHigh = item.severity === 'high';
                                const isMed = item.severity === 'medium';

                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 16 }}
                                        transition={{ duration: 0.25 }}
                                        onClick={() => setSelectedAlertId(item.id || null)}
                                        className="relative flex items-start gap-4 cursor-pointer group/row"
                                    >
                                        {/* Icon dot */}
                                        <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-xl border shrink-0 transition-all duration-300 ${
                                            isSelected
                                                ? 'border-brand-cyan bg-brand-cyan/15 scale-110 shadow-[0_0_18px_rgba(0,240,250,0.3)]'
                                                : isHigh
                                                ? 'bg-brand-red/10 border-brand-red/25 text-brand-red'
                                                : isMed
                                                ? 'bg-brand-orange/10 border-brand-orange/25 text-brand-orange'
                                                : 'bg-brand-cyan/10 border-brand-cyan/25 text-brand-cyan'
                                        }`}>
                                            {isHigh
                                                ? <ShieldAlert className="w-4 h-4" />
                                                : isMed
                                                ? <AlertTriangle className="w-4 h-4" />
                                                : <Activity className="w-4 h-4" />}
                                        </div>

                                        {/* Card */}
                                        <div className={`flex-1 glass-panel p-5 border transition-all duration-300 group-hover/row:shadow-xl ${
                                            isSelected
                                                ? 'border-brand-cyan/40 bg-slate-900/80 shadow-[0_4px_24px_rgba(0,240,250,0.1)]'
                                                : isHigh
                                                ? 'border-brand-red/15 hover:border-brand-red/30'
                                                : isMed
                                                ? 'border-brand-orange/15 hover:border-brand-orange/30'
                                                : 'border-white/5 hover:border-white/15'
                                        }`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${
                                                    isHigh
                                                        ? 'bg-brand-red/10 text-brand-red border-brand-red/20'
                                                        : isMed
                                                        ? 'bg-brand-orange/10 text-brand-orange border-brand-orange/20'
                                                        : 'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20'
                                                }`}>{item.type}</span>
                                                <time className="text-[10px] font-black font-mono text-slate-600 uppercase tracking-widest">{item.time}</time>
                                            </div>
                                            <h3 className="text-base font-black text-white mb-1.5 uppercase italic leading-tight">{item.title}</h3>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                                Source: <span className="text-slate-400">{item.source}</span>
                                            </p>

                                            {/* Inline quick actions - always visible */}
                                            <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 flex-wrap">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedAlertId(item.id || null); void handleAlertAction('forensics', 'Forensics task'); }}
                                                    className="text-[9px] font-black text-brand-cyan uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 italic px-2 py-1 rounded-lg hover:bg-brand-cyan/10"
                                                >
                                                    <Eye className="w-3 h-3" /> Forensics
                                                    <ArrowRight className="w-2.5 h-2.5" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedAlertId(item.id || null); void handleAlertAction('flag', 'Flag alert'); }}
                                                    disabled={pendingAction === 'flag'}
                                                    className="text-[9px] font-black text-brand-orange uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 italic px-2 py-1 rounded-lg hover:bg-brand-orange/10 disabled:opacity-40"
                                                >
                                                    {pendingAction === 'flag'
                                                        ? <Loader2 className="w-3 h-3 animate-spin" />
                                                        : <Flag className="w-3 h-3" />}
                                                    Flag
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setSelectedAlertId(item.id || null); void handleAlertAction('ignore', 'Ignore alert'); }}
                                                    disabled={pendingAction === 'ignore'}
                                                    className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1 italic px-2 py-1 rounded-lg hover:bg-white/5 disabled:opacity-40"
                                                >
                                                    {pendingAction === 'ignore'
                                                        ? <Loader2 className="w-3 h-3 animate-spin" />
                                                        : <SkipForward className="w-3 h-3" />}
                                                    Ignore
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── Right: Decision Panel ── */}
                <div className="glass-panel p-6 flex flex-col sticky top-6 overflow-hidden" style={{ maxHeight: '780px' }}>
                    <div className="absolute top-0 right-0 p-6 opacity-[0.04] pointer-events-none">
                        <CheckSquare className="w-36 h-36" />
                    </div>

                    <div className="mb-6 flex items-center gap-3 relative z-10">
                        <span className="w-8 h-px bg-brand-orange/40"></span>
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Decision Protocol</h2>
                    </div>

                    {selectedAlert ? (
                        <div className="flex flex-col flex-1 relative z-10 overflow-y-auto custom-scrollbar space-y-5 pr-1">
                            {/* Alert summary card */}
                            <div className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                                selectedAlert.severity === 'high'
                                    ? 'bg-gradient-to-br from-brand-red/10 to-slate-900/60 border-brand-red/25'
                                    : selectedAlert.severity === 'medium'
                                    ? 'bg-gradient-to-br from-brand-orange/10 to-slate-900/60 border-brand-orange/25'
                                    : 'bg-gradient-to-br from-brand-cyan/10 to-slate-900/60 border-brand-cyan/25'
                            }`}>
                                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                    <ShieldAlert className="w-14 h-14" />
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.15em] block mb-2 italic ${
                                    selectedAlert.severity === 'high' ? 'text-brand-red'
                                    : selectedAlert.severity === 'medium' ? 'text-brand-orange'
                                    : 'text-brand-cyan'
                                }`}>
                                    EVENT_ID_#{selectedAlert.id}
                                </span>
                                <h3 className="text-xl font-black text-white mb-2 uppercase italic leading-tight tracking-tight">{selectedAlert.title}</h3>
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-wider">
                                    From <span className="text-white">{selectedAlert.source}</span>. Mitigation pending authorization.
                                </p>
                                <div className="space-y-1.5 mt-4 text-[10px] font-black font-mono bg-slate-950/60 p-3 rounded-xl border border-white/5 uppercase tracking-widest">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600">SEVERITY:</span>
                                        <span className={selectedAlert.severity === 'high' ? 'text-brand-red' : selectedAlert.severity === 'medium' ? 'text-brand-orange' : 'text-brand-cyan'}>
                                            {selectedAlert.severity?.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-600">STATE:</span>
                                        <span className="text-brand-cyan italic">UNRESOLVED_</span>
                                    </div>
                                </div>
                            </div>

                            {/* Playbook section */}
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] pl-1 italic">
                                    Neuro-Adaptive Playbooks
                                </h4>
                                {playbookActions.map((action) => (
                                    <button
                                        key={action.id}
                                        disabled={!!pendingAction}
                                        onClick={() => void handleAlertAction(action.id, action.label)}
                                        className={`w-full p-4 bg-slate-950/50 border border-white/5 rounded-2xl flex items-center gap-4 ${action.hoverBorder} transition-all duration-200 backdrop-blur-sm disabled:opacity-40 group`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
                                            {pendingAction === action.id ? (
                                                <Loader2 className={`w-4 h-4 ${action.color} animate-spin`} />
                                            ) : (
                                                <Zap className={`w-4 h-4 ${action.color}`} />
                                            )}
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className={`text-[11px] font-black text-white uppercase tracking-widest`}>{action.label}</div>
                                            <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{action.desc}</div>
                                        </div>
                                        <ArrowRight className={`w-3.5 h-3.5 ${action.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                                    </button>
                                ))}
                            </div>

                            {/* Rapid Actions */}
                            <div className="space-y-2">
                                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] pl-1 italic">Rapid Actions</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        disabled={!!pendingAction}
                                        onClick={() => void handleAlertAction('report', 'Report incident')}
                                        className="bg-brand-orange/10 border border-brand-orange/25 text-brand-orange hover:bg-brand-orange/20 hover:border-brand-orange/40 transition-all text-[9px] font-black uppercase tracking-widest py-3 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2"
                                    >
                                        {pendingAction === 'report' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Flag className="w-3.5 h-3.5" />}
                                        Report
                                    </button>
                                    <button
                                        disabled={!!pendingAction}
                                        onClick={() => void handleAlertAction('ignore', 'Ignore alert')}
                                        className="bg-slate-950 border border-white/8 text-slate-300 hover:text-white hover:border-slate-400/30 transition-all text-[9px] font-black uppercase tracking-widest py-3 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2"
                                    >
                                        {pendingAction === 'ignore' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                                        Ignore
                                    </button>
                                    <button
                                        disabled={!!pendingAction}
                                        onClick={() => void handleAlertAction('resolve', 'Resolve incident')}
                                        className="bg-brand-cyan/10 border border-brand-cyan/25 text-brand-cyan hover:bg-brand-cyan/20 hover:border-brand-cyan/40 transition-all text-[9px] font-black uppercase tracking-widest py-3 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2"
                                    >
                                        {pendingAction === 'resolve' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                        Resolve
                                    </button>
                                    <button
                                        disabled={!!pendingAction}
                                        onClick={() => void handleAlertAction('escalate', 'Escalation')}
                                        className="bg-brand-red/10 border border-brand-red/25 text-brand-red hover:bg-brand-red/20 hover:border-brand-red/40 transition-all text-[9px] font-black uppercase tracking-widest py-3 rounded-xl disabled:opacity-40 flex items-center justify-center gap-2"
                                    >
                                        {pendingAction === 'escalate' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                                        Escalate
                                    </button>
                                </div>
                            </div>

                            {/* Primary commit buttons */}
                            <div className="space-y-2 pt-2">
                                <button
                                    disabled={!!pendingAction}
                                    onClick={() => void handleAlertAction('resolve', 'Resolution commit')}
                                    className="w-full bg-gradient-to-r from-slate-100 to-white text-slate-950 hover:from-white hover:to-slate-100 transition-all text-[10px] font-black uppercase tracking-[0.15em] py-4 rounded-xl shadow-xl disabled:opacity-20"
                                >
                                    Commit Resolution
                                </button>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        disabled={!!pendingAction}
                                        onClick={() => void handleAlertAction('benign', 'Mark benign')}
                                        className="bg-slate-950 border border-white/8 text-slate-400 hover:text-white hover:border-white/20 transition-all text-[9px] font-black uppercase tracking-widest py-3 rounded-xl disabled:opacity-20"
                                    >
                                        Mark Benign
                                    </button>
                                    <button
                                        disabled={!!pendingAction}
                                        onClick={() => void handleAlertAction('escalate', 'Escalation')}
                                        className="bg-brand-red/10 border border-brand-red/20 text-brand-red hover:bg-brand-red/20 transition-all text-[9px] font-black uppercase tracking-widest py-3 rounded-xl disabled:opacity-20 flex items-center justify-center gap-1"
                                    >
                                        <ShieldAlert className="w-3.5 h-3.5" />
                                        Escalate SIEM
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center flex-1 py-16 opacity-25 text-center relative z-10">
                            <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mb-6 border border-white/5">
                                <ShieldAlert className="w-10 h-10 text-slate-700" />
                            </div>
                            <p className="text-xs font-black text-slate-600 uppercase tracking-[0.2em] max-w-[180px] leading-relaxed italic">
                                Awaiting incident selection protocol...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
