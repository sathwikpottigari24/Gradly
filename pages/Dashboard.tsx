
import React from 'react';
import { ViewType } from '../types';
// Import missing icons to fix compilation errors
import { BookOpen, Calendar, Target, TrendingUp, ArrowRight, BrainCircuit, GitBranch, FileText, ShieldQuestion } from 'lucide-react';

interface DashboardProps {
  setView: (view: ViewType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setView }) => {
  const stats = [
    { label: 'Topics Mastered', value: '24', icon: BookOpen, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Practice Hours', value: '128h', icon: Target, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Avg Accuracy', value: '78%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const upcomingExams = [
    { name: 'JEE Main - Session 2', date: 'April 04, 2024', status: 'Registration Open' },
    { name: 'BITS AT', date: 'May 19, 2024', status: 'Prepare Now' },
    { name: 'VITEEE', date: 'April 19, 2024', status: 'Approaching' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl font-bold mb-2">Welcome back, John! 🚀</h1>
          <p className="text-blue-100 mb-6">Your personalized exam preparation is 65% complete. Today's focus: Integration & Atomic Structure.</p>
          <button 
            onClick={() => setView(ViewType.TUTOR)}
            className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-blue-50 transition-colors"
          >
            Resume Learning
          </button>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <BrainCircuit size={160} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Upcoming Exam Alerts</h3>
            <button onClick={() => setView(ViewType.UPDATES)} className="text-blue-600 text-sm font-semibold flex items-center">
              View All <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {upcomingExams.map((exam, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="bg-white p-2 rounded-md shadow-sm">
                    <Calendar size={18} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{exam.name}</p>
                    <p className="text-xs text-gray-500">{exam.date}</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-blue-600 px-2 py-1 bg-white rounded border border-blue-100">
                  {exam.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Quick Tools</h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setView(ViewType.QUIZ)} className="p-4 rounded-xl border border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-left">
              <BrainCircuit className="text-blue-500 mb-2" size={24} />
              <p className="font-semibold text-sm">Practice Quiz</p>
              <p className="text-xs text-gray-500">Revise with MCQs</p>
            </button>
            <button onClick={() => setView(ViewType.MINDMAP)} className="p-4 rounded-xl border border-dashed border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-left">
              <GitBranch className="text-purple-500 mb-2" size={24} />
              <p className="font-semibold text-sm">Mind Maps</p>
              <p className="text-xs text-gray-500">Visualize concepts</p>
            </button>
            <button onClick={() => setView(ViewType.NOTES)} className="p-4 rounded-xl border border-dashed border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all text-left">
              <FileText className="text-orange-500 mb-2" size={24} />
              <p className="font-semibold text-sm">Short Notes</p>
              <p className="text-xs text-gray-500">Fast revision</p>
            </button>
            <button onClick={() => setView(ViewType.DOUBT)} className="p-4 rounded-xl border border-dashed border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all text-left">
              <ShieldQuestion className="text-green-500 mb-2" size={24} />
              <p className="font-semibold text-sm">Doubt Solver</p>
              <p className="text-xs text-gray-500">Numerical solutions</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
