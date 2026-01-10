
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AITutor from './pages/AITutor';
import MindMapVisualizer from './pages/MindMapVisualizer';
import QuizZone from './pages/QuizZone';
import ImageAnalysis from './pages/ImageAnalysis';
import { ViewType, ExamUpdate } from './types';
import { getExamUpdates, generateShortNotes, solveDoubt } from './services/geminiService';
import { Loader2, FileText, ShieldQuestion, Calendar, Clock, Info, RefreshCw } from 'lucide-react';
import FormattedContent from './components/FormattedContent';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
  const [examUpdates, setExamUpdates] = useState<ExamUpdate[] | null>(null);
  const [shortNotes, setShortNotes] = useState('');
  const [doubtResponse, setDoubtResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApiError = useCallback((err: any) => {
    console.error("API Error:", err);
    setError("Connection to the AI study engine failed. Please try again in a moment.");
    // Auto-clear error after 5 seconds
    setTimeout(() => setError(null), 5000);
  }, []);

  useEffect(() => {
    if (currentView === ViewType.UPDATES && !examUpdates) {
      setLoading(true);
      getExamUpdates().then(data => {
        setExamUpdates(data);
        setLoading(false);
      }).catch(err => {
        handleApiError(err);
        setLoading(false);
      });
    }
  }, [currentView, examUpdates, handleApiError]);

  const renderContent = () => {
    switch (currentView) {
      case ViewType.DASHBOARD: return <Dashboard setView={setCurrentView} />;
      case ViewType.TUTOR: return <AITutor />;
      case ViewType.IMAGE_ANALYSIS: return <ImageAnalysis onApiError={handleApiError} />;
      case ViewType.MINDMAP: return <MindMapVisualizer onApiError={handleApiError} />;
      case ViewType.QUIZ: return <QuizZone onApiError={handleApiError} />;
      case ViewType.UPDATES:
        return (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Live Exam Tracking</h3>
                <p className="text-gray-500 text-sm">Real-time dates for National, Private, and NIAT exams.</p>
              </div>
              <button 
                onClick={() => { setExamUpdates(null); setLoading(true); }} 
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Refresh Updates"
              >
                <RefreshCw className={loading ? "animate-spin" : ""} size={20} />
              </button>
            </div>

            {loading ? (
              <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="text-gray-700 font-bold">Scanning Global Exam Database...</p>
                <p className="text-gray-400 text-sm mt-1">Fetching latest notification cycles...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {examUpdates?.map((exam, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start mb-4">
                       <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">{exam.name}</h4>
                       <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-tighter">Live</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                        <Calendar size={16} className="text-blue-500 mr-2" />
                        <span className="font-medium mr-2">Exam Date:</span>
                        <span className="text-gray-900 font-bold">{exam.date}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 bg-orange-50 p-2 rounded-lg">
                        <Clock size={16} className="text-orange-500 mr-2" />
                        <span className="font-medium mr-2">Application Deadline:</span>
                        <span className="text-orange-900 font-bold">{exam.deadline}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center p-4 bg-blue-50 rounded-xl text-xs text-blue-700 border border-blue-100">
              <Info size={16} className="mr-3 flex-shrink-0" />
              <p>Updates are sourced automatically. Cross-check with official brochures for final eligibility and fees.</p>
            </div>
          </div>
        );
      case ViewType.NOTES:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm h-fit">
              <h3 className="text-xl font-bold mb-4">Note Optimizer</h3>
              <textarea id="notes-input" className="w-full h-64 p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none mb-4" placeholder="Paste complex syllabus content..." />
              <button onClick={() => { setLoading(true); generateShortNotes((document.getElementById('notes-input') as any).value).then(setShortNotes).finally(()=>setLoading(false)); }} disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin mr-2" /> : <FileText size={18} className="mr-2" />} Optimize Notes
              </button>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm min-h-[400px]">
              {shortNotes ? (
                 <FormattedContent content={shortNotes} />
              ) : (
                 <div className="text-gray-400 italic">Optimized notes will appear here...</div>
              )}
            </div>
          </div>
        );
      case ViewType.DOUBT:
        return (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
              <ShieldQuestion className="mx-auto text-blue-600 mb-6" size={48} />
              <h2 className="text-2xl font-bold mb-2">Step-by-Step Solver</h2>
              <textarea id="doubt-input" placeholder="Enter a numerical or derivation..." className="w-full h-40 p-6 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none text-lg resize-none shadow-inner bg-gray-50/50" />
              <button onClick={() => { setLoading(true); solveDoubt((document.getElementById('doubt-input') as any).value).then(setDoubtResponse).finally(()=>setLoading(false)); }} disabled={loading} className="mt-4 w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center">
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Solve Now"}
              </button>
            </div>
            {doubtResponse && (
              <div className="bg-white p-8 rounded-2xl border border-blue-100 shadow-sm">
                <FormattedContent content={doubtResponse} />
              </div>
            )}
          </div>
        );
      case ViewType.PROFILE: return <div className="bg-white p-12 rounded-2xl text-center border">Profile Settings & Account Status</div>;
      default: return <Dashboard setView={setCurrentView} />;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {error && (
        <div className="fixed top-20 right-8 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-red-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center">
            <Info size={18} className="mr-3" />
            <span className="text-sm font-bold">{error}</span>
          </div>
        </div>
      )}
      {renderContent()}
    </Layout>
  );
};

export default App;
