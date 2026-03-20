import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Terminal from './Terminal';
import { motion } from 'framer-motion';

export default function Layout() {
    return (
        <div className="flex h-screen bg-slate-950 text-slate-300 font-sans overflow-hidden relative">
            {/* Background Layer - Fixed behind all content */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 cyber-grid opacity-20" />
                <div className="absolute inset-0 mesh-gradient opacity-40" />
                
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-cyan/5 blur-[120px] rounded-full animate-pulse-slow"
                />
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-orange/5 blur-[120px] rounded-full animate-pulse-slow"
                />
            </div>

            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </main>
                <Terminal />
            </div>
        </div>
    );
}
