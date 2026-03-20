import { ShieldAlert, LayoutDashboard, MailWarning, Activity, Image as ImageIcon, Cpu, BellRing, Network, Settings, Bug, Share2, Radar, ChevronRight, Zap } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Phishing', path: '/phishing', icon: MailWarning },
    { name: 'Anomaly', path: '/anomaly', icon: Activity },
    { name: 'Deepfake', path: '/deepfake', icon: ImageIcon },
    { name: 'Honeypot', path: '/honeypot', icon: Bug },
    { name: 'Intel Share', path: '/intel', icon: Share2 },
    { name: 'Predictive', path: '/predictive', icon: Radar },
    { name: 'Edge Nodes', path: '/edge', icon: Cpu },
    { name: 'Response', path: '/response', icon: BellRing },
    { name: 'Architecture', path: '/architecture', icon: Network },
    { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
    return (
        <div className="w-64 bg-slate-900/40 backdrop-blur-2xl border-r border-white/5 flex flex-col h-full z-10 relative overflow-hidden">
            {/* Sidebar Background Accents */}
            <div className="absolute inset-0 mesh-gradient opacity-10 pointer-events-none" />
            
            <div className="h-20 flex items-center px-6 border-b border-white/5 shrink-0 relative bg-slate-950/20">
                <div className="w-10 h-10 bg-brand-cyan/10 rounded-xl flex items-center justify-center border border-brand-cyan/20 mr-3 shadow-[0_0_20px_rgba(0,240,250,0.15)] group transition-all duration-500 hover:border-brand-cyan/50">
                    <ShieldAlert className="w-6 h-6 text-brand-cyan drop-shadow-[0_0_8px_var(--color-brand-cyan)]" />
                </div>
                <span className="text-xl font-black tracking-tighter text-white uppercase italic">SecureVision <span className="text-brand-cyan not-italic ml-0.5 drop-shadow-[0_0_8px_var(--color-brand-cyan)]">AI</span></span>
            </div>

            <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-2 custom-scrollbar relative z-10">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => clsx(
                            'flex items-center px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all group relative border border-transparent',
                            isActive
                                ? 'text-white bg-brand-cyan/10 border-brand-cyan/20 shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={clsx(
                                    'w-5 h-5 mr-3 transition-all duration-300 shrink-0',
                                    isActive ? 'text-brand-cyan drop-shadow-[0_0_8px_var(--color-brand-cyan)] scale-110' : 'text-slate-600 group-hover:text-brand-cyan/60'
                                )} />
                                {item.name}
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute left-0 top-2 bottom-2 w-1 bg-brand-cyan rounded-r-full shadow-[0_0_15px_var(--color-brand-cyan)]"
                                    />
                                )}
                                <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-3 h-3 text-slate-600" />
                                </div>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-6 border-t border-white/5 shrink-0 bg-slate-950/20">
                <div className="bg-slate-900/60 rounded-xl p-4 border border-white/5 flex flex-col space-y-3 shadow-inner">
                    <div className="flex items-center justify-between">
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Sentinel Status</span>
                        <div className="flex space-x-1">
                             {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-cyan/40 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-white font-black uppercase tracking-widest flex items-center">
                            <Zap className="w-3 h-3 text-brand-orange mr-2" />
                            Optimal
                        </span>
                        <span className="text-slate-600 font-mono text-[10px]">98% LOAD</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
