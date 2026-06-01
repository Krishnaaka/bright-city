import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Search,
    User,
    Loader2,
    X,
    Droplets,
    Zap,
    Trash2,
    Construction,
    Tag,
    ArrowRight,
    ShieldAlert,
    MessageSquare,
    Camera
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { cn } from '../lib/utils';

const CategoryIcon = ({ category, size = 18, className }) => {
    switch (category.toLowerCase()) {
        case 'road': return <Construction size={size} className={cn("text-slate-500", className)} />;
        case 'water': return <Droplets size={size} className={cn("text-blue-500", className)} />;
        case 'garbage': return <Trash2 size={size} className={cn("text-emerald-500", className)} />;
        case 'electricity': return <Zap size={size} className={cn("text-amber-500", className)} />;
        default: return <Tag size={size} className={cn("text-gray-500", className)} />;
    }
};

const AdminDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [statusUpdate, setStatusUpdate] = useState('');
    const [remark, setRemark] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/complaints', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComplaints(response.data);
        } catch (error) {
            console.error('Failed to fetch complaints');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const token = localStorage.getItem('token');
            let resolvedImageUrl = null;

            if (statusUpdate === 'resolved' && selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                
                const uploadRes = await axios.post('/api/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                });
                resolvedImageUrl = uploadRes.data.image_url;
            }

            await axios.put(`/api/complaints/${selectedComplaint.id}/status`, {
                status: statusUpdate,
                remark: remark,
                resolved_image_url: resolvedImageUrl
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchComplaints();
            setSelectedComplaint(null);
            setRemark('');
            setSelectedFile(null);
            setPreviewUrl('');
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to update status. Ensure you are logged in as an Admin.');
        } finally {
            setIsUpdating(false);
        }
    };

    const stats = [
        {
            label: 'Global Issues',
            value: complaints.length,
            icon: Tag,
            color: 'bg-indigo-50 text-indigo-600'
        },
        {
            label: 'Unresolved',
            value: complaints.filter(c => c.status === 'pending').length,
            icon: Clock,
            color: 'bg-amber-50 text-amber-600'
        },
        {
            label: 'Resolved Rate',
            value: complaints.length ? Math.round((complaints.filter(c => c.status === 'resolved').length / complaints.length) * 100) + '%' : '0%',
            icon: CheckCircle2,
            color: 'bg-emerald-50 text-emerald-600'
        },
    ];

    const filteredComplaints = complaints.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusStyles = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    return (
        <div className="space-y-10 pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="px-2 py-0.5 bg-indigo-600 text-[10px] font-black text-white rounded uppercase tracking-widest">Authorized Access</div>
                        <ShieldAlert size={16} className="text-gray-400" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">System Administration</h1>
                    <p className="text-gray-500 font-medium">Manage city infrastructure reports and dispatch service teams.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat, i) => (
                    <StatCard key={stat.label} {...stat} delay={i * 0.1} />
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/20 overflow-hidden">
                {/* Toolbar */}
                <div className="p-6 border-b border-gray-100 bg-gray-50/20 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative flex-1 max-w-lg">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search master records..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <div className="w-14 h-14 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Accessing central database...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                    <th className="px-8 py-5">Issue Identity</th>
                                    <th className="px-8 py-5">Reporter</th>
                                    <th className="px-8 py-5">Status</th>
                                    <th className="px-8 py-5">Queue Date</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredComplaints.map((complaint, i) => (
                                    <motion.tr
                                        key={complaint.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="hover:bg-indigo-50/20 transition-all group"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    {complaint.title}
                                                </span>
                                                <div className="flex items-center gap-2 mt-1.5 font-bold text-[9px] text-gray-400 uppercase tracking-widest">
                                                    <CategoryIcon category={complaint.category} size={12} className="opacity-50" />
                                                    {complaint.category}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                    <User size={14} />
                                                </div>
                                                <span className="text-xs font-bold text-gray-500">USER_{complaint.user_id}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={cn(
                                                "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest shadow-sm",
                                                getStatusStyles(complaint.status)
                                            )}>
                                                {complaint.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-xs text-gray-400 font-bold tracking-tighter">
                                            {new Date(complaint.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedComplaint(complaint);
                                                    setStatusUpdate(complaint.status);
                                                    setSelectedFile(null);
                                                    setPreviewUrl('');
                                                }}
                                                className="px-4 py-2 text-[10px] font-black text-white bg-indigo-600 hover:bg-slate-900 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-100 uppercase tracking-widest"
                                            >
                                                Review Issue
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredComplaints.length === 0 && !loading && (
                            <div className="py-32 text-center bg-gray-50/30">
                                <div className="w-20 h-20 bg-white shadow-sm rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-gray-300 border border-gray-100">
                                    <ShieldAlert size={36} />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">System Queue Clear</h3>
                                <p className="text-gray-400 max-w-xs mx-auto mt-2 text-sm font-medium italic">
                                    "{searchQuery ? `No reports matching "${searchQuery}" in current filter.` : "There are no pending reports requiring administrative attention."}"
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Status Update Modal */}
            <AnimatePresence>
                {selectedComplaint && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedComplaint(null)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-lg"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="bg-slate-900 px-10 py-10 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-3xl font-black tracking-tight mb-1">Update Status</h3>
                                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Case ID: BC-{selectedComplaint.id}</p>
                                </div>
                                <button onClick={() => setSelectedComplaint(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors">
                                    <X size={24} className="text-white" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateStatus} className="p-10 space-y-8">
                                <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 border-dashed space-y-4">
                                    <div>
                                        <h4 className="text-lg font-black text-slate-900 mb-2">{selectedComplaint.title}</h4>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed italic">"{selectedComplaint.description}"</p>
                                    </div>
                                    {selectedComplaint.image_url && (
                                        <div className="w-full h-48 rounded-2xl overflow-hidden shadow-sm border border-indigo-100 mt-2">
                                            <img src={selectedComplaint.image_url} alt="Reported issue" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Target State</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['pending', 'in_progress', 'resolved'].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setStatusUpdate(s)}
                                                className={cn(
                                                    "py-3 text-[10px] font-black rounded-xl border uppercase tracking-widest transition-all",
                                                    statusUpdate === s
                                                        ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200"
                                                        : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                                                )}
                                            >
                                                {s.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Resolution Remark</label>
                                    <div className="relative">
                                        <textarea
                                            required
                                            placeholder="Add mandatory notes for the public record..."
                                            className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all min-h-[140px] text-sm font-semibold resize-none"
                                            value={remark}
                                            onChange={(e) => setRemark(e.target.value)}
                                        ></textarea>
                                        <div className="absolute top-5 right-5 text-slate-300">
                                            <MessageSquare size={18} />
                                        </div>
                                    </div>
                                </div>

                                {statusUpdate === 'resolved' && (
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Resolution Photo (Optional)</label>
                                        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:border-indigo-300 transition-all cursor-pointer relative group">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            {previewUrl ? (
                                                <div className="relative w-full h-40 rounded-2xl overflow-hidden shadow-md">
                                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedFile(null);
                                                            setPreviewUrl('');
                                                        }}
                                                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="text-center py-2 space-y-2">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mx-auto text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 shadow-sm border border-slate-100 transition-all">
                                                        <Camera size={18} />
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-700">Attach proof of resolution</p>
                                                    <p className="text-[10px] text-slate-400">PNG, JPG or JPEG</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-6 gap-6">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedComplaint(null)}
                                        className="px-8 py-4 text-xs font-black text-slate-400 hover:text-slate-900 transition-all uppercase tracking-widest"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="flex-1 py-4 bg-indigo-600 text-white text-sm font-black rounded-2xl hover:bg-slate-900 shadow-2xl shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
                                    >
                                        {isUpdating ? <Loader2 className="animate-spin" size={20} /> : (
                                            <>
                                                Confirm Update
                                                <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
