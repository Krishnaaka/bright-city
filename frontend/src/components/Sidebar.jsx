import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { isAdmin } from '../utils/auth';
import {
    Home,
    LayoutDashboard,
    PlusCircle,
    Settings,
    LogOut,
    ShieldCheck,
    Menu,
    X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
    const [isOpen, setIsOpen] = React.useState(true);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: PlusCircle, label: 'New Report', path: '/dashboard?new=true' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const adminItems = [
        { icon: ShieldCheck, label: 'Admin Panel', path: '/admin' },
    ];

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed bottom-4 right-4 z-50 p-3 bg-indigo-600 text-white rounded-full shadow-lg"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <motion.aside
                initial={false}
                animate={{ width: isOpen ? 260 : 80 }}
                className={cn(
                    "fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-40 flex flex-col transition-all duration-300",
                    !isOpen && "items-center"
                )}
            >
                {/* Brand */}
                <div className="h-16 flex items-center px-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">B</span>
                        </div>
                        {isOpen && <span className="text-xl font-bold tracking-tight text-gray-900">Bright City</span>}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => cn(
                                "sidebar-link",
                                isActive ? "sidebar-link-active" : "sidebar-link-inactive"
                            )}
                        >
                            <item.icon size={20} className={cn(isOpen ? "mr-1" : "m-0")} />
                            {isOpen && <span>{item.label}</span>}
                        </NavLink>
                    ))}

                    {/* Admin Section */}
                    {isAdmin() && (
                        <div className="pt-8 pb-2">
                            {isOpen && <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Administration</p>}
                            <div className="mt-2 space-y-1">
                                {adminItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) => cn(
                                            "sidebar-link",
                                            isActive ? "sidebar-link-active" : "sidebar-link-inactive"
                                        )}
                                    >
                                        <item.icon size={20} className={cn(isOpen ? "mr-1" : "m-0")} />
                                        {isOpen && <span>{item.label}</span>}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    )}
                </nav>

                {/* User Footer */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors",
                            !isOpen && "justify-center"
                        )}
                    >
                        <LogOut size={20} />
                        {isOpen && <span>Log out</span>}
                    </button>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
