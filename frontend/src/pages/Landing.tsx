import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Brain, Cpu, Zap, Globe, Lock, Activity, ChevronRight, Fingerprint } from 'lucide-react';

const Landing: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-brand-cyan/30 overflow-x-hidden relative">
            {/* Background elements */}
            <div className="absolute inset-0 cyber-grid opacity-10 pointer-events-none"></div>
            <div className="absolute inset-0 mesh-gradient pointer-events-none opacity-40"></div>
            
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/60 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-10 h-10 bg-brand-cyan/10 rounded-xl flex items-center justify-center border border-brand-cyan/20 group-hover:border-brand-cyan group-hover:shadow-[0_0_20px_var(--color-brand-cyan)] transition-all duration-500">
                            <Shield className="w-6 h-6 text-brand-cyan" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-white uppercase italic">
                            SecureVision <span className="text-brand-cyan not-italic ml-1 drop-shadow-[0_0_8px_var(--color-brand-cyan)]">AI</span>
                        </span>
                    </div>
                    <div className="flex items-center space-x-8">
                        <button onClick={() => navigate('/login')} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Operator Login</button>
                        <button onClick={() => navigate('/register')} className="bg-brand-cyan text-slate-950 px-6 py-2.5 rounded-lg font-black uppercase tracking-widest text-xs hover:shadow-[0_0_25px_var(--color-brand-cyan)] transition-all hover:-translate-y-0.5 active:translate-y-0">Initialize System</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-24 px-6 max-w-7xl mx-auto overflow-hidden">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="space-y-8"
                    >
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center space-x-3 bg-brand-cyan/5 border border-brand-cyan/20 px-4 py-1.5 rounded-full"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-cyan"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-cyan">v2.4.0 Live Deployment: Neural Edge Framework</span>
                        </motion.div>

                        <h1 className="text-7xl font-black text-white leading-[1.0] tracking-tighter uppercase italic">
                            Redefining <br />
                            <span className="text-brand-cyan not-italic drop-shadow-[0_4px_12px_var(--color-brand-cyan)]">Autonomous</span> <br />
                            <span className="text-brand-orange not-italic">Cyber Defense</span>
                        </h1>

                        <p className="text-lg text-slate-400 max-w-xl leading-relaxed font-medium">
                            The industry's first P2P Federated threat intelligence platform. 
                            Deploy real-time Phishing detection, Network anomaly identification, 
                            and Deepfake forensics at the tactical edge.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <button onClick={() => navigate('/register')} className="group relative bg-brand-cyan text-slate-950 px-10 py-5 rounded-xl font-black uppercase tracking-widest text-sm transition-all hover:scale-105 hover:shadow-[0_10px_40px_rgba(0,240,250,0.3)] flex items-center overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                Launch Dashboard
                                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 duration-300" />
                            </button>
                            <button className="bg-slate-900/50 border border-white/10 text-white px-10 py-5 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-slate-800 transition-all backdrop-blur-sm">
                                System Spec
                            </button>
                        </div>

                        <div className="pt-10 flex items-center space-x-10 text-slate-500">
                             <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em]"><Lock className="w-4 h-4 mr-2 text-brand-cyan/60" /> Zero Trust Architecture</div>
                             <div className="flex items-center text-[10px] font-black uppercase tracking-[0.2em]"><Zap className="w-4 h-4 mr-2 text-brand-orange/60" /> Edge Computing</div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
                        whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="relative perspective-1000"
                    >
                        <div className="relative z-10 p-2 bg-gradient-to-br from-white/10 to-transparent rounded-[2.5rem] border border-white/5 backdrop-blur-xl shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
                            <div className="bg-slate-950 rounded-[2rem] overflow-hidden border border-white/10 aspect-video flex flex-col items-center justify-center p-8 group relative">
                                {/* Visualizer */}
                                <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none"></div>
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,240,250,0.05)_0%,_transparent_70%)]"></div>
                                
                                <div className="relative">
                                    <Globe className="w-56 h-56 text-brand-cyan/20 animate-[spin_40s_linear_infinite]" />
                                    <motion.div 
                                        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ repeat: Infinity, duration: 4 }}
                                        className="absolute inset-0 m-auto w-32 h-32 text-brand-cyan flex items-center justify-center"
                                    >
                                        <Fingerprint className="w-16 h-16 drop-shadow-[0_0_15px_var(--color-brand-cyan)]" />
                                    </motion.div>
                                </div>

                                <div className="absolute top-8 left-8 flex items-center space-x-2">
                                    <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
                                    <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Live Stream Active</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-32 px-6 max-w-7xl mx-auto relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-brand-cyan/0 via-brand-cyan/50 to-brand-cyan/0" />
                
                <div className="text-center space-y-4 mb-24">
                    <h2 className="text-xs font-black text-brand-cyan uppercase tracking-[0.5em] drop-shadow-[0_0_10px_var(--color-brand-cyan)]">Autonomous Modules</h2>
                    <h3 className="text-5xl font-black text-white uppercase italic leading-tight tracking-tighter">Distributed <span className="text-brand-orange not-italic">Intelligence</span></h3>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <FeatureCard icon={Brain} title="Neural Phishing" desc="Real-time NLP analysis of credential-harvesting threats with < 20ms latency." color="brand-cyan" />
                    <FeatureCard icon={Cpu} title="Visual Forensics" desc="Bit-accurate Deepfake analysis using Xception INT8 optimized neural engines." color="brand-orange" />
                    <FeatureCard icon={Activity} title="Anomaly Engine" desc="Unsupervised learning modules observing network behavior at the edge." color="brand-red" />
                    <FeatureCard icon={Globe} title="P2P Intel Mix" desc="Decentralized signature sharing using secure cryptographic consensus." color="brand-purple" />
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-white/5 text-center px-6 bg-slate-950/40 relative">
                <div className="flex items-center justify-center space-x-3 mb-8">
                    <Shield className="w-6 h-6 text-brand-cyan" />
                    <span className="text-2xl font-black tracking-tighter text-white uppercase italic">SecureVision <span className="text-brand-cyan not-italic ml-1">AI</span></span>
                </div>
                <div className="flex flex-wrap justify-center gap-8 mb-12">
                    {['Network Status', 'Compliance', 'Operator FAQ', 'API Docs'].map(item => (
                        <a key={item} href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-brand-cyan transition-colors">{item}</a>
                    ))}
                </div>
                <p className="text-[10px] text-slate-600 uppercase tracking-[0.3em] font-mono leading-relaxed max-w-2xl mx-auto">
                    &copy; 2026 SecureVision AI Sentinel protocols. <br />
                    Encrypted with AES-256-GCM. Authorized Operator access only.
                </p>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string, color?: string }) => (
    <motion.div 
        whileHover={{ y: -10 }}
        className="glass-panel p-10 group relative overflow-hidden"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-cyan/5 to-transparent -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-brand-cyan/20 transition-all duration-700`} />
        
        <div className={`w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center mb-8 border border-white/5 group-hover:scale-110 group-hover:border-brand-cyan/50 transition-all duration-500 shadow-xl shadow-black/40`}>
            <Icon className={`w-7 h-7 text-brand-cyan group-hover:drop-shadow-[0_0_8px_var(--color-brand-cyan)]`} />
        </div>
        <h4 className="text-xl font-black text-white mb-4 uppercase tracking-tight group-hover:text-brand-cyan transition-colors">{title}</h4>
        <p className="text-sm text-slate-500 leading-relaxed font-medium">{desc}</p>
    </motion.div>
);

export default Landing;
