import { useState } from 'react';
import { MailWarning, ShieldCheck, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Phishing() {
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<{ score: number, classification: string, flagged: string[] } | null>(null);

    const handleAnalyze = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject && !body) return;

        setAnalyzing(true);
        setResult(null);

        // Call actual backend API
        fetch('http://localhost:8000/api/phishing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subject, body })
        })
        .then(res => res.json())
        .then(data => {
            setResult(data);
            setAnalyzing(false);
        })
        .catch(err => {
            console.error(err);
            setAnalyzing(false);
        });
    };

    const getHighlightText = (text: string) => {
        if (!result || result.flagged.length === 0) return text;

        let highlightedText = text;
        result.flagged.forEach(word => {
            const regex = new RegExp(`(${word})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<span class="bg-brand-red/20 text-brand-red font-bold px-1 rounded border border-brand-red/30">$1</span>');
        });

        return <div dangerouslySetInnerHTML={{ __html: highlightedText }} />;
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-brand-cyan/10 rounded-xl flex items-center justify-center border border-brand-cyan/20">
                        <MailWarning className="w-6 h-6 text-brand-cyan" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">Phishing Verification <span className="text-brand-cyan not-italic">(BERT v2)</span></h1>
                </div>
                <p className="text-slate-500 font-medium tracking-wide">Linguistic pattern analysis for high-fidelity social engineering detection.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Input Panel */}
                <div className="space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel p-8"
                    >
                        <h2 className="text-xs font-black text-slate-400 mb-8 uppercase tracking-[0.3em] flex items-center">
                            <span className="w-8 h-px bg-brand-cyan/30 mr-3"></span>
                            Email Ingestion
                        </h2>

                        <form onSubmit={handleAnalyze} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Subject Header</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="PHISHING_TARGET_SUBJECT"
                                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-5 py-3 text-sm text-slate-200 focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/20 outline-none transition-all placeholder:text-slate-700 font-mono"
                                    disabled={analyzing}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Payload Content</label>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    rows={10}
                                    placeholder="PASTE_RAW_EMAIL_BODY_FOR_ANALYSIS"
                                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-5 py-4 text-sm text-slate-200 focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/20 outline-none transition-all placeholder:text-slate-700 font-mono resize-none"
                                    disabled={analyzing}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={analyzing || (!subject && !body)}
                                className="w-full py-4 bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 hover:border-brand-cyan font-black rounded-xl transition-all flex items-center justify-center uppercase tracking-[0.2em] text-xs relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {analyzing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin mr-3"></div>
                                        SCANNING_SEQUENCE...
                                    </>
                                ) : (
                                    'EXECUTE_THREAT_SCAN'
                                )}
                                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-brand-cyan/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                            </button>
                        </form>
                    </motion.div>
                </div>

                {/* Results Panel */}
                <div className="space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-panel p-8 min-h-[500px] flex flex-col"
                    >
                         <h2 className="text-xs font-black text-slate-400 mb-8 uppercase tracking-[0.3em] flex items-center">
                            <span className="w-8 h-px bg-brand-orange/30 mr-3"></span>
                            Risk Probability
                        </h2>

                        {result ? (
                            <div className="flex-1 flex flex-col space-y-8">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col items-center justify-center p-8 bg-slate-950 rounded-[2rem] border border-white/5 relative overflow-hidden group">
                                         <div className="absolute inset-0 cyber-grid opacity-10" />
                                         <svg className="w-32 h-32 relative z-10" viewBox="0 0 36 36">
                                            <path
                                                className="text-slate-900"
                                                strokeWidth="2"
                                                stroke="currentColor"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                strokeDasharray="100, 100"
                                            />
                                            <motion.path
                                                className={result.classification === 'UNSAFE' ? 'text-brand-red' : 'text-brand-cyan'}
                                                strokeWidth="2.5"
                                                stroke="currentColor"
                                                fill="none"
                                                initial={{ strokeDasharray: '0, 100' }}
                                                animate={{ strokeDasharray: `${result.score}, 100` }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-1">
                                            <span className="text-4xl font-black text-white italic tracking-tighter">{result.score}%</span>
                                            <span className="text-[8px] text-slate-500 font-black tracking-widest uppercase">RISK_LIMIT</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-center">
                                        <div className={`p-8 rounded-[2rem] border flex flex-col items-center justify-center h-full text-center relative overflow-hidden
                                            ${result.classification === 'UNSAFE' 
                                                ? 'bg-brand-red/5 border-brand-red/20 shadow-[0_0_30px_rgba(255,42,42,0.1)]' 
                                                : 'bg-brand-cyan/5 border-brand-cyan/20 shadow-[0_0_30px_rgba(0,240,255,0.1)]'}`}
                                        >
                                            <div className="absolute top-0 right-0 p-3 opacity-20">
                                                {result.classification === 'UNSAFE' ? <ShieldAlert className="w-8 h-8 text-brand-red" /> : <ShieldCheck className="w-8 h-8 text-brand-cyan" />}
                                            </div>
                                            <span className="text-[10px] text-slate-500 mb-2 uppercase tracking-[0.2em] font-black">Classification</span>
                                            <div className={`text-4xl font-black uppercase italic tracking-tighter ${result.classification === 'UNSAFE' ? 'text-brand-red' : 'text-brand-cyan'}`}>
                                                {result.classification}
                                            </div>
                                            <div className="mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                                {result.classification === 'UNSAFE' ? 'Threat Detected' : 'Clear Sequence'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {result.classification === 'UNSAFE' && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full border border-white/5">Marked Anomalies: {result.flagged.length}</span>
                                                <span className="text-[10px] font-mono text-brand-red animate-pulse italic font-bold">CRITICAL_VULNERABILITY</span>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest pl-1 italic">Payload_Structure</div>
                                                <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 text-sm text-slate-300 font-mono leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                                                    {getHighlightText(body)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {result.flagged.map((word, i) => (
                                                <span key={i} className="text-[9px] font-black bg-brand-red/10 text-brand-red px-3 py-1.5 rounded-lg border border-brand-red/20 uppercase tracking-widest">
                                                    {word}
                                                </span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {result.classification === 'SAFE' && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-white/5 border-dashed rounded-[2rem] bg-slate-950/20">
                                        <div className="w-20 h-20 bg-brand-cyan/10 rounded-full flex items-center justify-center mb-6 border border-brand-cyan/20">
                                            <ShieldCheck className="w-10 h-10 text-brand-cyan/60" />
                                        </div>
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest italic">No social engineering signatures detected in sequence.</p>
                                    </motion.div>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center">
                                <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center mb-8 border border-white/5">
                                    <ShieldAlert className="w-12 h-12 text-slate-700" />
                                </div>
                                <p className="text-xs font-black text-slate-600 uppercase tracking-[0.2em] max-w-[200px] leading-relaxed italic">Awaiting high-latency ingestion stream...</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
