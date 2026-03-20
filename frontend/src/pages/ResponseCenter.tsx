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
} from 'lucide-react';
import { useWebSocket } from '../context/WebSocketContext';
import { useMemo, useState } from 'react';

type ActionFeedback = {
    tone: 'success' | 'error' | 'info';
    message: string;
};

const env = (import.meta as ImportMeta & { env?: Record<string, string> }).env;
const API_BASE = env?.VITE_API_BACKEND?.replace(/\/$/, '') || 'http://localhost:8000/api';

export default function ResponseCenter() {
    const { alerts } = useWebSocket();
    const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
    const [pendingAction, setPendingAction] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<ActionFeedback | null>(null);

    const selectedAlert = useMemo(
        () => alerts.find((alert) => alert.id === selectedAlertId) || alerts[0],
        [alerts, selectedAlertId]
    );

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

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-brand-cyan/10 rounded-xl flex items-center justify-center border border-brand-cyan/20">
                            <ShieldAlert className="w-6 h-6 text-brand-cyan" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Response Center <span className="text-brand-cyan not-italic">(Level_4)</span></h1>
                    </div>
                    <p className="text-slate-500 font-medium tracking-wide">Autonomous mitigation protocols and real-time alert chronology management.</p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        disabled={pendingAction === 'share'}
                        onClick={handleIntelShare}
                        className="bg-slate-950/50 hover:bg-slate-900 text-[10px] font-black uppercase tracking-[0.2em] text-white py-3 px-6 rounded-xl border border-white/5 flex items-center transition-all hover:border-brand-cyan/30 backdrop-blur-md group disabled:opacity-40"
                    >
                        {pendingAction === 'share' ? (
                            <Loader2 className="w-4 h-4 mr-3 text-brand-cyan animate-spin" />
                        ) : (
                            <Share2 className="w-4 h-4 mr-3 text-brand-cyan group-hover:rotate-12 transition-transform" />
                        )}
                        Distribute_Signatures
                    </button>
                    <button
                        disabled={pendingAction === 'report'}
                        onClick={handleReportGenerate}
                        className="bg-brand-cyan/10 hover:bg-brand-cyan/15 text-[10px] font-black uppercase tracking-[0.2em] text-brand-cyan py-3 px-6 rounded-xl border border-brand-cyan/30 flex items-center transition-all disabled:opacity-40"
                    >
                        {pendingAction === 'report' ? (
                            <Loader2 className="w-4 h-4 mr-3 animate-spin" />
                        ) : (
                            <FileText className="w-4 h-4 mr-3" />
                        )}
                        Generate_Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timeline */}
                <div className="lg:col-span-2 glass-panel p-8 h-[800px] flex flex-col relative overflow-hidden group">
                    <div className="absolute inset-0 cyber-grid opacity-10" />
                    <div className="flex justify-between items-center mb-10 relative z-10">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center">
                            <span className="w-8 h-px bg-brand-cyan/30 mr-3"></span>
                            Alert Chronology
                        </h2>
                        <div className="flex items-center space-x-2 px-3 py-1 bg-slate-950 border border-white/5 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
                            <span className="text-[9px] font-black text-brand-cyan uppercase tracking-widest">Live_Ingestion</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-4 space-y-8 relative z-10 custom-scrollbar pb-10">
                        <div className="absolute left-5 top-0 bottom-0 w-px bg-white/5" />

                        {alerts.length === 0 && <div className="text-center text-slate-600 py-10 font-black uppercase tracking-widest text-[10px]">Perimeter Clear_</div>}

                        {alerts.map((item) => (
                            <div key={item.id} onClick={() => setSelectedAlertId(item.id || null)} className="relative flex items-center group cursor-pointer">
                                {/* Timeline Icon */}
                                <div className={`flex items-center justify-center w-10 h-10 rounded-xl border border-white/5 bg-slate-950 shrink-0 z-10 transition-all duration-500
                                  ${item.id === selectedAlert?.id ? 'border-brand-cyan bg-brand-cyan/10 scale-110 shadow-[0_0_20px_rgba(0,240,250,0.3)]' :
                                        item.severity === 'high' ? 'text-brand-red border-brand-red/20' :
                                            item.severity === 'medium' ? 'text-brand-orange border-brand-orange/20' : 'text-brand-cyan border-brand-cyan/20'}`}>
                                    {item.severity === 'high' ? <ShieldAlert className="w-4 h-4" /> : item.severity === 'medium' ? <AlertTriangle className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                </div>

                                {/* Timeline Card */}
                                <div className={`ml-6 flex-1 glass-panel p-6 border-white/5 transition-all duration-500 group-hover:bg-slate-900/60
                                  ${item.id === selectedAlert?.id ? 'border-brand-cyan shadow-[0_4px_30px_rgba(0,0,0,0.2)] bg-slate-900/80' : 'hover:border-white/10'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border ${item.severity === 'high' ? 'bg-brand-red/10 text-brand-red border-brand-red/20 text-glow-red' :
                                            item.severity === 'medium' ? 'bg-brand-orange/10 text-brand-orange border-brand-orange/20 text-glow-orange' :
                                                'bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20 text-glow-cyan'
                                            }`}>{item.type}</span>
                                        <time className="text-[10px] font-black font-mono text-slate-600 uppercase tracking-widest">{item.time}</time>
                                    </div>
                                    <h3 className="text-lg font-black text-white mb-2 uppercase italic leading-none">{item.title}</h3>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Origin_Source: <span className="text-slate-400">{item.source}</span></p>

                                    <div className="mt-5 pt-5 border-t border-white/5 hidden group-hover:flex items-center">
                                        <button
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                void handleAlertAction('forensics', 'Forensics task');
                                            }}
                                            className="text-[9px] font-black text-brand-cyan uppercase tracking-widest hover:text-white transition-colors flex items-center italic"
                                        >
                                            Execute_Forensics <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selected Alert Action Panel */}
                <div className="glass-panel p-8 flex flex-col h-[700px] sticky top-6 overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <CheckSquare className="w-32 h-32" />
                    </div>

                    <div className="mb-8 flex items-center relative z-10">
                        <div className="w-8 h-px bg-brand-orange/30 mr-3"></div>
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Decision_Protocol</h2>
                    </div>

                    {selectedAlert ? (
                        <div className="flex flex-col flex-1 relative z-10">
                            {feedback && (
                                <div className={`mb-4 rounded-xl border px-4 py-3 text-[10px] font-black uppercase tracking-widest flex items-center ${feedback.tone === 'success' ? 'border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan' : feedback.tone === 'error' ? 'border-brand-red/30 bg-brand-red/10 text-brand-red' : 'border-brand-orange/30 bg-brand-orange/10 text-brand-orange'}`}>
                                    {feedback.tone === 'success' ? <CheckCircle2 className="w-4 h-4 mr-2" /> : feedback.tone === 'error' ? <XCircle className="w-4 h-4 mr-2" /> : <ShieldAlert className="w-4 h-4 mr-2" />}
                                    {feedback.message}
                                </div>
                            )}

                            <div className={`p-6 rounded-[2rem] border mb-8 transition-all duration-500 overflow-hidden relative
                                ${selectedAlert.severity === 'high' ? 'bg-brand-red/5 border-brand-red/20' :
                                    selectedAlert.severity === 'medium' ? 'bg-brand-orange/5 border-brand-orange/20' : 'bg-brand-cyan/5 border-brand-cyan/20'
                                }`}>
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <ShieldAlert className="w-12 h-12" />
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] block mb-3 italic ${selectedAlert.severity === 'high' ? 'text-brand-red' : selectedAlert.severity === 'medium' ? 'text-brand-orange' : 'text-brand-cyan'}`}>
                                    EVENT_ID_#{selectedAlert.id}
                                </span>
                                <h3 className="text-2xl font-black text-white mb-3 uppercase italic leading-tight tracking-tighter">{selectedAlert.title}</h3>
                                <p className="text-xs text-slate-400 font-medium leading-relaxed uppercase tracking-wider">Intercepted from <span className="text-white">{selectedAlert.source}</span>. Mitigation sequences pending authorization.</p>

                                <div className="space-y-2 mt-8 text-[10px] font-black font-mono bg-slate-950 p-4 rounded-2xl border border-white/5 uppercase tracking-widest">
                                    <div className="flex justify-between items-center"><span className="text-slate-600">SEVERITY:</span> <span className={selectedAlert.severity === 'high' ? 'text-brand-red' : 'text-brand-orange'}>{selectedAlert.severity?.toUpperCase()}</span></div>
                                    <div className="flex justify-between items-center"><span className="text-slate-600">STATE:</span> <span className="text-brand-cyan italic">UNRESOLVED_</span></div>
                                </div>
                            </div>

                            {/* Playbook Section */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] pl-1 italic">Neuro-Adaptive Playbooks</h4>
                                <div className="space-y-3">
                                    {[
                                        { id: 'quarantine', label: 'Quarantine Node', desc: 'Isolate source VLAN', color: 'text-brand-cyan', bg: 'bg-brand-cyan/10', hoverBorder: 'hover:border-brand-cyan/30', action: 'quarantine' },
                                        { id: 'rotate', label: 'Rotate Gateway', desc: 'Flush active credentials', color: 'text-brand-orange', bg: 'bg-brand-orange/10', hoverBorder: 'hover:border-brand-orange/30', action: 'rotate' },
                                        { id: 'blacklist', label: 'Blacklist Entity', desc: 'Global firewall update', color: 'text-brand-red', bg: 'bg-brand-red/10', hoverBorder: 'hover:border-brand-red/30', action: 'blacklist' }
                                    ].map((action, i) => (
                                        <button
                                            key={i}
                                            disabled={pendingAction === action.action}
                                            onClick={() => void handleAlertAction(action.action, action.label)}
                                            className={`w-full p-4 bg-slate-950/50 border border-white/5 rounded-2xl flex items-center group cursor-pointer ${action.hoverBorder} transition-all duration-300 backdrop-blur-sm disabled:opacity-40`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center mr-4 transition-transform group-hover:scale-110`}>
                                                {pendingAction === action.action ? (
                                                    <Loader2 className={`w-4 h-4 ${action.color} animate-spin`} />
                                                ) : (
                                                    <Zap className={`w-4 h-4 ${action.color}`} />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-[11px] font-black text-white uppercase tracking-widest">{action.label}</div>
                                                <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{action.desc}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] pl-1 italic">Rapid Actions</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        disabled={pendingAction === 'ignore'}
                                        onClick={() => void handleAlertAction('ignore', 'Ignore alert')}
                                        className="bg-slate-950 border border-white/5 text-slate-300 hover:text-white hover:border-slate-300/30 transition-all text-[9px] font-black uppercase tracking-widest py-3 rounded-xl disabled:opacity-40 flex items-center justify-center"
                                    >
                                        {pendingAction === 'ignore' ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Ban className="w-3.5 h-3.5 mr-2" />}
                                        Ignore
                                    </button>
                                    <button
                                        disabled={pendingAction === 'resolve'}
                                        onClick={() => void handleAlertAction('resolve', 'Resolve incident')}
                                        className="bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan/20 transition-all text-[9px] font-black uppercase tracking-widest py-3 rounded-xl disabled:opacity-40 flex items-center justify-center"
                                    >
                                        {pendingAction === 'resolve' ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 mr-2" />}
                                        Resolve
                                    </button>
                                    <button
                                        disabled={pendingAction === 'escalate'}
                                        onClick={() => void handleAlertAction('escalate', 'Escalation')}
                                        className="bg-brand-red/10 border border-brand-red/20 text-brand-red hover:bg-brand-red/20 transition-all text-[9px] font-black uppercase tracking-widest py-3 rounded-xl disabled:opacity-40 flex items-center justify-center"
                                    >
                                        {pendingAction === 'escalate' ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5 mr-2" />}
                                        Escalate
                                    </button>
                                    <button
                                        disabled={pendingAction === 'report'}
                                        onClick={handleReportGenerate}
                                        className="bg-slate-900 border border-brand-orange/20 text-brand-orange hover:bg-brand-orange/10 transition-all text-[9px] font-black uppercase tracking-widest py-3 rounded-xl disabled:opacity-40 flex items-center justify-center"
                                    >
                                        {pendingAction === 'report' ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <FileText className="w-3.5 h-3.5 mr-2" />}
                                        Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
                            <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mb-8 border border-white/5">
                                <ShieldAlert className="w-12 h-12 text-slate-700" />
                            </div>
                            <p className="text-xs font-black text-slate-600 uppercase tracking-[0.2em] max-w-[200px] leading-relaxed italic">Awaiting incident selection protocol...</p>
                        </div>
                    )}

                    <div className="flex-1"></div>

                    <div className="space-y-3 mt-8 relative z-10">
                        <button
                            disabled={!selectedAlert}
                            onClick={() => void handleAlertAction('resolve', 'Resolution commit')}
                            className="w-full bg-slate-100 text-slate-950 hover:bg-white transition-all text-[10px] font-black uppercase tracking-[0.2em] py-4 rounded-xl shadow-xl disabled:opacity-20"
                        >
                            Commit_Resolution
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                disabled={!selectedAlert}
                                onClick={() => void handleAlertAction('benign', 'Mark benign')}
                                className="bg-slate-950 border border-white/5 text-slate-400 hover:text-white hover:border-white/20 transition-all text-[9px] font-black uppercase tracking-widest py-3 rounded-xl disabled:opacity-20"
                            >
                                Mark_Benign
                            </button>
                            <button
                                disabled={!selectedAlert}
                                onClick={() => void handleAlertAction('escalate', 'Escalation')}
                                className="bg-brand-red/10 border border-brand-red/20 text-brand-red hover:bg-brand-red/20 transition-all text-[9px] font-black uppercase tracking-widest py-3 rounded-xl disabled:opacity-20 flex items-center justify-center"
                            >
                                <ShieldAlert className="w-3.5 h-3.5 mr-2" />
                                Escalate_SIEM
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
