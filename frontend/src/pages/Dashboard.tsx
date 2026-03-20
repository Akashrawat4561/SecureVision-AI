import { ShieldAlert, AlertTriangle, Eye, Activity, MailWarning, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWebSocket } from '../context/WebSocketContext';
import { useMemo } from 'react';
import ThreatMap from '../components/ThreatMap';

export default function Dashboard() {
    const { data, alerts, connected } = useWebSocket();

    // Dynamic threat counters based on history/alerts
    const stats = useMemo(() => {
        let emailThreats = 0;
        let anomalyCount = 0;

        // In a real app we'd aggregate over time, here we just count alerts in state
        alerts.forEach(a => {
            if (a.type?.includes('PHISHING')) emailThreats++;
            if (a.type?.includes('ANOMALY')) anomalyCount++;
        });

        return [
            { name: 'Email Threats', value: emailThreats.toString(), alert: emailThreats > 0, icon: MailWarning, color: 'text-brand-red' },
            { name: 'Network Anomalies', value: anomalyCount.toString(), alert: anomalyCount > 0, icon: Activity, color: 'text-brand-orange' },
            { name: 'Edge Node Sync', value: data?.nodes?.length || 0, alert: false, icon: Eye, color: 'text-brand-cyan' },
            { name: 'Global Threat Level', value: `${data?.global_threat_level || 15}%`, alert: (data?.global_threat_level || 0) > 50, icon: ShieldAlert, color: 'text-brand-red' },
        ];
    }, [alerts, data]);

    const mapMarkers = useMemo(() => {
        // Map alert sources to random real-world coordinates for the demo
        const locations: [number, number][] = [
            [-74.006, 40.7128], // New York
            [0.1278, 51.5074],   // London
            [139.6503, 35.6762], // Tokyo
            [151.2093, -33.8688], // Sydney
            [-43.1729, -22.9068], // Rio
            [18.4241, -33.9249],  // Cape Town
            [77.1025, 28.7041],   // Delhi
            [-118.2437, 34.0522]  // LA
        ];

        return alerts.slice(0, 10).map((a, i) => ({
            id: a.id || i,
            coordinates: locations[(a.id || i) % locations.length] as [number, number],
            severity: a.severity || 'low',
            label: a.title || 'Unknown Threat'
        }));
    }, [alerts]);

    const recentAlerts = alerts.slice(0, 5); // display up to 5

    const handleGenerateReport = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/report/generate');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Forensic_Intelligence_Report_${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Report generation failed:", error);
            alert("Error connecting to neural core for report generation.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-white uppercase italic">The Central Hub <span className="text-brand-cyan not-italic">(The Pulse)</span></h1>
                <div className="flex items-center space-x-6">
                    {/* DEFCON Indicator */}
                    <div className="hidden md:flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">THREAT_LEVEL</span>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((level) => {
                                const active = (data?.global_threat_level || 0) / 20 >= (6 - level);
                                return (
                                    <div 
                                        key={level}
                                        className={`w-4 h-6 border ${active ? 'bg-brand-red border-brand-red shadow-[0_0_10px_#ff2a2a50]' : 'border-slate-800 bg-slate-900'} transition-all`}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    <div className={`flex items-center space-x-2 bg-slate-800/50 py-1.5 px-3 rounded-full border ${connected ? 'border-green-500/50' : 'border-red-500/50'}`}>
                        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <span className={`text-xs font-medium ${connected ? 'text-green-400' : 'text-red-400'}`}>
                            {connected ? 'Live Feed Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(stats || []).map((stat) => (
                    <motion.div
                        key={stat.name}
                        whileHover={{ scale: 1.02, translateY: -4 }}
                        className={`glass-panel p-6 relative group overflow-hidden`}
                    >
                        {/* Status Accent Line */}
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
                            stat.alert ? 'from-brand-red to-brand-orange shadow-[0_4px_12px_rgba(255,42,42,0.4)]' : 'from-brand-cyan to-blue-500'
                        }`} />

                        <div className="absolute -right-4 -bottom-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <stat.icon className={`w-32 h-32 ${stat.color}`} />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center space-x-2 mb-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-slate-950 border border-white/5 ${stat.color}`}>
                                    <stat.icon className="w-4 h-4" />
                                </div>
                                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">{stat.name}</h3>
                            </div>

                            <div className="flex items-end justify-between">
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={stat.value}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className={`text-4xl font-black tracking-tighter ${stat.alert ? 'text-white' : 'text-slate-100'}`}
                                    >
                                        {stat.value}
                                    </motion.span>
                                </AnimatePresence>
                                <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center border ${
                                    stat.alert ? 'bg-brand-red/10 border-brand-red/30 text-brand-red' : 'bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan'
                                }`}>
                                    {stat.alert ? <AlertTriangle className="w-2.5 h-2.5 mr-1" /> : <ShieldCheck className="w-2.5 h-2.5 mr-1" />}
                                    {stat.alert ? 'ALERT' : 'STABLE'}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map & Edge Status Main Area */}
                <div className="lg:col-span-2 space-y-6">

                    <div className="glass-panel p-6 h-96 flex flex-col relative overflow-hidden">
                        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4 flex justify-between">
                            Real-Time Global Threat Map
                            <span className="text-xs bg-slate-900 px-2 py-1 rounded border border-slate-700 text-brand-cyan">Live Socket</span>
                        </h3>

                        <div className="flex-1 bg-slate-900/50 rounded-lg border border-slate-800 relative">
                            <ThreatMap markers={mapMarkers} />
                        </div>
                    </div>

                    <div className="glass-panel p-6">
                        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Edge Node Status (Live)</h3>
                        <div className="flex flex-col space-y-4">
                            {data?.nodes?.map((node, i) => (
                                <div key={node.id} className="flex items-center">
                                    <div className="w-32 text-sm text-slate-300 font-medium">
                                        {i === 0 ? 'Raspberry Pi' : i === 1 ? 'NVIDIA Jetson' : 'Edge Server'}
                                    </div>
                                    <div className="flex-1 ml-4 relative">
                                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={false}
                                                animate={{ width: `${node.cpu}%` }}
                                                transition={{ duration: 0.5 }}
                                                className={`h-full ${node.cpu > 80 ? 'bg-brand-red' : node.cpu > 60 ? 'bg-brand-orange' : 'bg-green-500'}`}
                                            />
                                        </div>
                                    </div>
                                    <div className={`ml-4 text-xs font-mono w-16 text-right ${node.cpu > 80 ? 'text-brand-red' : 'text-green-400'}`}>
                                        {node.latency}ms
                                    </div>
                                </div>
                            )) || <div className="text-xs text-slate-500">Waiting for node metrics...</div>}
                        </div>
                    </div>

                </div>

                {/* Alerts Feed */}
                <div className="glass-panel p-6 flex flex-col h-[calc(100vh-12rem)] sticky top-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Alerts Feed</h3>
                        {alerts.length > 0 && <span className="bg-brand-red/10 text-brand-red text-xs px-2 py-0.5 rounded-full border border-brand-red/20">{alerts.length} New</span>}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
                        <AnimatePresence>
                            {recentAlerts.map((alert) => (
                                <motion.div
                                    key={alert.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="p-3 bg-slate-900/50 border border-slate-700/50 rounded-lg shadow-md"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center">
                                            {alert.severity === 'high' && <ShieldAlert className="w-4 h-4 text-brand-red mr-2" />}
                                            {alert.severity === 'medium' && <AlertTriangle className="w-4 h-4 text-brand-orange mr-2" />}
                                            {alert.severity === 'low' && <Activity className="w-4 h-4 text-brand-cyan mr-2" />}
                                            <span className={`text-[10px] font-bold uppercase tracking-wider ${alert.severity === 'high' ? 'text-brand-red' :
                                                alert.severity === 'medium' ? 'text-brand-orange' : 'text-brand-cyan'
                                                }`}>{alert.type}</span>
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-mono">{alert.time}</span>
                                    </div>
                                    <p className="mt-2 text-sm text-slate-200">{alert.title}</p>
                                    <p className="mt-1 text-xs text-slate-500">{alert.source}</p>
                                </motion.div>
                            ))}
                            {recentAlerts.length === 0 && (
                                <div className="text-center py-10 text-slate-500 text-sm italic">
                                    Awaiting cryptographically signed threat sequences...
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Threat Impact Gauge */}
                    <div className="mt-6 pt-6 border-t border-slate-800">
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Deployment Readiness</span>
                            <span className="text-xl font-black text-brand-cyan">98.4<span className="text-xs font-normal text-slate-500 ml-1">%</span></span>
                        </div>
                        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '98.4%' }}
                                className="h-full bg-gradient-to-r from-brand-cyan to-blue-500 shadow-[0_0_10px_#00f0ff50]"
                            />
                        </div>
                        <p className="mt-3 text-[10px] text-slate-500 font-mono leading-tight">
                            SYSTEM IDENTIFIER: SECURE-VISION-SENTINEL-X-01<br/>
                            VULNERABILITY PATCH: 2026.03.13-A
                        </p>
                    </div>

                    <div className="mt-4">
                        <button 
                            onClick={handleGenerateReport}
                            className="w-full py-2.5 bg-slate-100 text-slate-950 hover:bg-white transition-all text-xs font-black uppercase tracking-widest rounded-lg shadow-xl"
                        >
                            Generate Forensic Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
