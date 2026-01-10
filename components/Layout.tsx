
import React from 'react';
import { ViewType } from '../types';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Bell, 
  GitBranch, 
  FileText, 
  BrainCircuit, 
  ShieldQuestion, 
  UserCircle,
  Scan
} from 'lucide-react';

interface LayoutProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, children }) => {
  const navItems = [
    { id: ViewType.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewType.TUTOR, label: 'AI Tutor', icon: MessageSquare },
    { id: ViewType.IMAGE_ANALYSIS, label: 'Visual Scanner', icon: Scan },
    { id: ViewType.UPDATES, label: 'Exam Updates', icon: Bell },
    { id: ViewType.MINDMAP, label: 'Mind Maps', icon: GitBranch },
    { id: ViewType.NOTES, label: 'Short Notes', icon: FileText },
    { id: ViewType.QUIZ, label: 'Quiz Zone', icon: BrainCircuit },
    { id: ViewType.DOUBT, label: 'Doubt Solver', icon: ShieldQuestion },
    { id: ViewType.PROFILE, label: 'Profile', icon: UserCircle },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6 flex items-center space-x-2">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">G</div>
          <span className="text-xl font-bold font-poppins text-blue-600">Gradly</span>
        </div>
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all ${
                currentView === item.id 
                  ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon size={18} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">JD</div>
            <div>
              <p className="text-xs font-semibold">John Doe</p>
              <p className="text-[10px] text-gray-500">Premium Scholar</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-gray-200 bg-white/80 backdrop-blur flex items-center justify-between px-6 z-10">
          <h2 className="text-lg font-bold text-gray-800">{navItems.find(n => n.id === currentView)?.label}</h2>
          <div className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">AI Engine: Flash</div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
