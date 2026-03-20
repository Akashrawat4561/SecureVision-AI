import { Bug, Target, Activity, CodeSquare, Hexagon, Share2, ShieldAlert, Loader2, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../context/WebSocketContext';
import { useState, useEffect } from 'react';
import ThreatMap from '../components/ThreatMap';

type ActionFeedback = {
    tone: 'success' | 'error' | 'info';
    message: string;
};

const env = (import.meta as ImportMeta & { env?: Record<string, string> }).env;
const API_BASE = env?.VITE_API_BACKEND?.replace(/\/$/, '') || 'http://localhost:8000/api';

export default function Honeypot() {
    const { data, connected } = useWebSocket();
    const [encounters, setEncounters] = useState<any[]>([]);
    const [pendingAction, setPendingAction] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<ActionFeedback | null>(null);

    // Process real-time events from WebSockets
    useEffect(() => {
        if (!connected || !data?.honeypot_events) return;

        // Add new events to the log
        if (data.honeypot_events.length > 0) {
            setEncounters(prev => {
                const newIds = new Set(data.honeypot_events!.map(e => e.id));
                const filteredPrev = prev.filter(e => !newIds.has(e.id));
                return [...data.honeypot_events!, ...filteredPrev].slice(0, 20);
            });
        }
    }, [data?.honeypot_events, connected]);

    const activeConnCount = data?.honeypot_connections || 0;
    const metrics = data?.honeypot_metrics || {
        top_exploit: "SSH Brute Force",
        payload_count: 0,
        avg_dwell_time: "0s"
    };

    const mapMarkers = encounters.map(e => ({
        id: e.id,
        coordinates: e.geo.coords,
        severity: e.attack.severity === 'critical' || e.attack.severity === 'high' ? 'high' : 'medium',
        label: e.attack.type
    }));

    const showFeedback = (tone: ActionFeedback['tone'], message: string) => {
        setFeedback({ tone, message });
        window.setTimeout(() => setFeedback(null), 3500);
    };

    const shareIntel = async (mode: string, intelType: string, source: string, successMessage: string) => {
        setPendingAction(mode);
        try {
            const response = await fetch(`${API_BASE}/intel/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hash: `0x${Math.random().toString(16).slice(2, 10)}`,
                    type: intelType,
                    source,
                }),
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error((data as { detail?: string }).detail || 'Intel share failed.');
            }

            showFeedback('success', successMessage);
        } catch (error) {
            showFeedback('error', error instanceof Error ? error.message : 'Intel share failed.');
            console.error('Intel share failed:', error);
        } finally {
            setPendingAction(null);
        }
    };

    const generateHoneypotReport = async () => {
        setPendingAction('report');
        try {
            const response = await fetch(`${API_BASE}/report/generate`);
            if (!response.ok) {
                throw new Error('Failed to generate report.');
            }

            const reportBlob = await response.blob();
            const fileUrl = URL.createObjectURL(reportBlob);
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = `honeypot_report_${Date.now()}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(fileUrl);

            showFeedback('success', 'Honeypot report generated and downloaded.');
        } catch (error) {
            showFeedback('error', error instanceof Error ? error.message : 'Failed to generate report.');
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
                        <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center border border-brand-orange/20">
                            <Bug className="w-6 h-6 text-brand-orange" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Decoy Network <span className="text-brand-orange not-italic">(Honeypot v2)</span></h1>
                    </div>
                    <p className="text-slate-500 font-medium tracking-wide">Global threat intelligence deception nodes for high-interaction adversary profiling.</p>
                </div>

                <div className="flex items-center space-x-4 bg-slate-950/50 py-2.5 px-5 rounded-2xl border border-white/5 backdrop-blur-md">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none">Status:</span>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-brand-orange animate-pulse shadow-[0_0_10px_rgba(255,139,0,0.5)]" />
                        <span className="text-xs font-black text-brand-orange uppercase italic tracking-wider">3_DECOYS_DEPLOYED</span>
                    </div>
                </div>
            </div>

            {/* LIVE WORLD ATTACK MAP */}
            <div className="glass-panel p-4 h-[400px] relative overflow-hidden group">
                <div className="absolute top-6 left-6 z-10">
                    <div className="flex items-center space-x-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
                        <h2 className="text-xs font-bold text-white uppercase tracking-tighter">Live Threat Map</h2>
                    </div>
                </div>
                <ThreatMap markers={mapMarkers} />

                {/* Map Legend */}
                <div className="absolute bottom-6 left-6 p-3 bg-slate-900/80 border border-slate-800 rounded-lg backdrop-blur-md z-10">
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-brand-red" />
                            <span className="text-[10px] text-slate-300 uppercase">Critical/High Severity</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-brand-orange" />
                            <span className="text-[10px] text-slate-300 uppercase">Medium Severity</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Deception Environment Tracker */}
                <div className="glass-panel p-6 h-[450px] flex flex-col relative overflow-hidden lg:col-span-2">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6 flex items-center justify-between">
                        <span className="flex items-center"><Activity className="mr-2 w-4 h-4 text-brand-orange" /> Live Adversary Engagements</span>
                        <span className="text-brand-orange font-mono bg-brand-orange/10 px-2 py-0.5 rounded border border-brand-orange/20">Active Sessions: {activeConnCount}</span>
                    </h2>

                    <div className="flex-1 bg-slate-950/50 rounded border border-slate-800/50 overflow-y-auto p-4 font-mono text-xs relative scrollbar-hide">
                        <div className="space-y-2 relative z-10">
                            <AnimatePresence>
                                {encounters.length === 0 && (
                                    <div className="text-slate-600 flex flex-col items-center justify-center h-full pt-20">
                                        <Hexagon className="w-12 h-12 mb-4 opacity-20 animate-spin-slow" />
                                        <span>Watching decoy perimeter... no active engagements.</span>
                                    </div>
                                )}
                                {encounters.map(e => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        key={e.id}
                                        className="p-3 border border-slate-800/50 bg-slate-900/30 rounded flex justify-between items-center group/item hover:bg-slate-800/40 transition-colors"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <span className="text-slate-500 text-[10px]">[{e.timestamp}]</span>
                                            <div className="flex items-center space-x-2 min-w-[120px]">
                                                <span className="text-lg">{e.geo.flag}</span>
                                                <span className="text-brand-red font-bold text-sm tracking-tighter">{e.ip}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-slate-800 ${e.attack.color}`}>
                                                    {e.attack.type}
                                                </span>
                                                <span className="text-[9px] text-slate-500 uppercase mt-0.5 pl-1 italic font-sans">{e.geo.country}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <span className={`text-[10px] font-bold uppercase ${e.attack.severity === 'critical' ? 'text-brand-red' :
                                                    e.attack.severity === 'high' ? 'text-orange-500' : 'text-slate-400'
                                                }`}>
                                                {e.attack.severity}
                                            </span>
                                            {e.attack.severity === 'critical' && <ShieldAlert className="w-4 h-4 text-brand-red animate-pulse" />}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Captured Intelligence Summary */}
                <div className="glass-panel p-6 flex flex-col space-y-6 overflow-hidden">
                    <div className="relative">
                        <div className="absolute -top-10 -right-10 opacity-5">
                            <Target className="w-40 h-40" />
                        </div>
                        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 relative z-10">Threat Intelligence</h2>
                        <div className="space-y-4 relative z-10">
                            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 hover:border-brand-cyan/40 transition-colors">
                                <div className="text-[10px] text-slate-500 mb-2 flex items-center justify-between uppercase tracking-widest font-bold">Top Targeted Exploit <Target className="w-4 h-4 text-brand-cyan" /></div>
                                <div className="text-lg text-brand-cyan font-mono font-bold leading-tight">{metrics.top_exploit}</div>
                                <div className="text-[10px] text-slate-500 mt-1 uppercase">Most frequent vector</div>
                            </div>
                            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 hover:border-brand-orange/40 transition-colors">
                                <div className="text-[10px] text-slate-500 mb-2 flex items-center justify-between uppercase tracking-widest font-bold">Captured Payloads <CodeSquare className="w-4 h-4 text-brand-orange" /></div>
                                <div className="text-lg text-brand-orange font-mono font-bold leading-tight">{metrics.payload_count} Unique Hashes</div>
                                <div className="text-[10px] text-slate-500 mt-1 uppercase">Decentralized Analysis</div>
                            </div>
                            <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 hover:border-brand-red/40 transition-colors">
                                <div className="text-[10px] text-slate-500 mb-2 flex items-center justify-between uppercase tracking-widest font-bold">Attacker Dwell Time <Activity className="w-4 h-4 text-brand-red" /></div>
                                <div className="text-lg text-brand-red font-mono font-bold leading-tight">{metrics.avg_dwell_time}</div>
                                <div className="text-[10px] text-slate-500 mt-1 uppercase">Avg lifecycle in decoy</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-end space-y-3">
                        {feedback && (
                            <div className={`rounded-xl border px-3 py-2 text-[10px] uppercase font-black tracking-widest flex items-center ${feedback.tone === 'success' ? 'border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan' : feedback.tone === 'error' ? 'border-brand-red/30 bg-brand-red/10 text-brand-red' : 'border-brand-orange/30 bg-brand-orange/10 text-brand-orange'}`}>
                                {feedback.tone === 'success' ? <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> : feedback.tone === 'error' ? <XCircle className="w-3.5 h-3.5 mr-2" /> : <Share2 className="w-3.5 h-3.5 mr-2" />}
                                {feedback.message}
                            </div>
                        )}

                        <button
                            disabled={pendingAction === 'publish'}
                            onClick={() => void shareIntel('publish', 'POLISHED_SIGNATURE', 'SENTINEL_DASHBOARD', 'Intelligence package published successfully.')}
                            className="group w-full py-4 bg-gradient-to-r from-brand-orange/30 to-brand-red/30 hover:from-brand-orange/40 hover:to-brand-red/40 text-white border border-brand-orange/30 transition-all uppercase tracking-[0.2em] text-[10px] font-black rounded-xl shadow-[0_0_20px_rgba(255,139,0,0.15)] flex justify-center items-center disabled:opacity-40"
                        >
                            {pendingAction === 'publish' ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Share2 className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                            )}
                            Publish Intelligence
                        </button>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                disabled={pendingAction === 'sync'}
                                onClick={() => void shareIntel('sync', 'DECOY_FEED', 'pi-honeypot-node', 'Decoy signature feed synced.')}
                                className="py-3 bg-slate-900 border border-white/10 text-slate-200 hover:border-brand-orange/30 hover:text-white transition-all uppercase tracking-widest text-[9px] font-black rounded-xl disabled:opacity-40 flex justify-center items-center"
                            >
                                {pendingAction === 'sync' ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <ShieldAlert className="w-3.5 h-3.5 mr-2" />}
                                Sync Feed
                            </button>
                            <button
                                disabled={pendingAction === 'report'}
                                onClick={generateHoneypotReport}
                                className="py-3 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan/20 transition-all uppercase tracking-widest text-[9px] font-black rounded-xl disabled:opacity-40 flex justify-center items-center"
                            >
                                {pendingAction === 'report' ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <FileText className="w-3.5 h-3.5 mr-2" />}
                                Report
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
