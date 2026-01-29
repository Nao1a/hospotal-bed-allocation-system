import React, { useEffect, useState } from 'react';
import api from '../api';
import { UserCheck, Check, X } from 'lucide-react';

const AdminDashboard = () => {
    const [pendingNurses, setPendingNurses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPending = async () => {
        try {
            const { data } = await api.get('/auth/pending-nurses');
            setPendingNurses(data);
        } catch (error) {
            console.error("Failed to fetch pending nurses", error);
        } finally {
            setLoading(false);
        }
    };

    const approveNurse = async (id) => {
        try {
            await api.patch(`/auth/approve/${id}`);
            // Remove from list
            setPendingNurses(prev => prev.filter(n => n._id !== id));
        } catch (error) {
            alert("Failed to approve nurse");
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading requests...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nurse Approvals</h1>
                    <p className="text-gray-500">Manage account access requests</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                    {pendingNurses.length} Pending
                </div>
            </div>

            {pendingNurses.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">All Caught Up</h3>
                    <p className="text-gray-500">No pending nurse approval requests.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {pendingNurses.map(nurse => (
                        <div key={nurse._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                    <UserCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{nurse.username}</h3>
                                    <p className="text-sm text-gray-500 font-mono">Nurse ID: {nurse.nurseId}</p>
                                    <p className="text-xs text-gray-400 mt-1">Requested: {new Date(nurse.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex space-x-3">
                                <button 
                                    onClick={() => approveNurse(nurse._id)}
                                    className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 flex items-center space-x-2 transition shadow-sm hover:shadow"
                                >
                                    <Check size={18} />
                                    <span>Approve Access</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
