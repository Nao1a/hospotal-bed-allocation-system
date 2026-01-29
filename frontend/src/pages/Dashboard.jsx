import React, { useEffect, useState } from 'react';
import { 
  Bed, 
  Activity, 
  AlertCircle, 
  Calendar, 
  Search, 
  Bell, 
  HelpCircle 
} from 'lucide-react';
import { bedAPI, patientAPI, activityAPI } from '../api';

const StatCard = ({ title, value, subtext, icon: Icon, color, subtextColor }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-40">
    <div className="flex justify-between items-start">
      <h3 className="text-gray-500 font-medium text-sm">{title}</h3>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={20} className={subtextColor ? subtextColor.replace('text-', '') : 'text-gray-600'} />
      </div>
    </div>
    <div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <p className={`text-xs mt-2 font-medium ${
          subtext.includes('Required') ? 'text-red-500' : 
          subtext.includes('cleaning') ? 'text-blue-500' : 
          'text-green-500'
        }`}>
        {subtext}
      </p>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCapacity: 0,
    occupancyRate: 0,
    queueLength: 0,
    availableBeds: 0
  });
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bedsRes, queueRes, activityRes] = await Promise.all([
          bedAPI.getAll(),
          patientAPI.getQueue(),
          activityAPI.getLogs(5)
        ]);

        const beds = bedsRes.data;
        const queue = queueRes.data;
        setActivities(activityRes.data);

        const totalCapacity = beds.length;
        const occupied = beds.filter(b => b.status === 'OCCUPIED').length;
        const available = beds.filter(b => b.status === 'FREE').length;
        const occupancyRate = totalCapacity > 0 ? Math.round((occupied / totalCapacity) * 100) : 0;

        setStats({
          totalCapacity,
          occupancyRate,
          queueLength: queue.length,
          availableBeds: available
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Hospital Overview</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search patients or beds..." 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 bg-gray-50"
            />
          </div>
          <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            <Bell size={20} className="text-gray-600" />
          </button>
          <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
            <HelpCircle size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Capacity" 
          value={`${stats.totalCapacity} Beds`}
          subtext="Full ward operational" 
          icon={Bed} 
          color="bg-blue-50"
          subtextColor="text-blue-600"
        />
        <StatCard 
          title="Occupancy Rate" 
          value={`${stats.occupancyRate}%`}
          subtext="+5% from yesterday" 
          icon={Activity} 
          color="bg-indigo-50"
          subtextColor="text-indigo-600"
        />
        <StatCard 
          title="Queue Length" 
          value={`${stats.queueLength} Patients`}
          subtext="Urgent Attention Required" 
          icon={AlertCircle} 
          color="bg-red-50"
          subtextColor="text-red-500"
        />
         <StatCard 
          title="Available Beds" 
          value={`${stats.availableBeds} Beds`}
          subtext="Ready for admission" 
          icon={Calendar} 
          color="bg-green-50"
          subtextColor="text-green-600"
        />
      </div>

      {/* Activity Log Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">Recent Activity Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {activities.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No activity recorded yet</td>
                  </tr>
               ) : (
                 activities.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                                log.action.includes('ADMIT') ? 'bg-green-100 text-green-700' :
                                log.action.includes('DISCHARGE') ? 'bg-red-100 text-red-700' :
                                log.action.includes('ADD') ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                                {log.action.replace('_', ' ')}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{log.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">{log.performedBy}</td>
                    </tr>
                 ))
               )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
