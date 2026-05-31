import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    User,
    Mail,
    CheckCircle2,
    Shield
} from 'lucide-react';
import { cn } from '../lib/utils';

const SettingsItem = ({ icon: Icon, title, description, color }) => (
    <motion.div
        whileHover={{ x: 5 }}
        className="flex items-center justify-between p-5 hover:bg-gray-50 rounded-2xl cursor-pointer transition-all border border-transparent hover:border-gray-100"
    >
        <div className="flex items-center gap-4">
            <div className={cn("p-3 rounded-2xl", color)}>
                <Icon size={24} />
            </div>
            <div>
                <h4 className="text-base font-black text-gray-900">{title}</h4>
                <p className="text-sm text-gray-500 font-bold">{description}</p>
            </div>
        </div>
    </motion.div>
);

const Settings = () => {
    const [username, setUsername] = useState('Administrator');
    const [role, setRole] = useState('System Admin');

    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                const decoded = JSON.parse(jsonPayload);
                const sub = decoded.sub;
                
                setUsername(sub || 'Administrator');
                // Set role based on username or general defaults
                if (sub === 'admin') {
                    setRole('Central Administrator');
                } else {
                    setRole('Citizen User');
                }
            }
        } catch (e) {
            console.error("Failed to decode token", e);
        }
    }, []);

    return (
        <div className="max-w-2xl mx-auto space-y-10 pb-20">
            <header>
                <div className="flex items-center gap-2 mb-2">
                    <div className="px-2 py-0.5 bg-indigo-600 text-[10px] font-black text-white rounded uppercase tracking-widest">
                        Identity Settings
                    </div>
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">System Configuration</h1>
                <p className="text-gray-500 font-medium mt-1">Manage your active identity credentials and status.</p>
            </header>

            <main className="space-y-8">
                <section className="bg-white rounded-[2.5rem] border border-gray-100 p-4 shadow-xl shadow-gray-100/30">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Active Profile</h3>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-widest shadow-sm">
                            <CheckCircle2 size={12} />
                            Verified Identity
                        </span>
                    </div>
                    <div className="divide-y divide-gray-50">
                        <SettingsItem
                            icon={User}
                            title="Profile Username"
                            description={username}
                            color="bg-blue-50 text-blue-600"
                        />
                        <SettingsItem
                            icon={Shield}
                            title="System Role"
                            description={role}
                            color="bg-indigo-50 text-indigo-600"
                        />
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Settings;
