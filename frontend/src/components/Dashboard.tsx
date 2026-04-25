import { useState, useEffect } from 'react';
import { LogOut, Activity, History, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SymptomChecker } from './SymptomChecker';
import { PredictionHistory } from './PredictionHistory';
import { DoctorConsultation } from './DoctorConsultation';

type Tab = 'checker' | 'history' | 'consultation';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('checker');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (user?.email) {
      setUserName(user.email.split('@')[0]);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src="/MediPredict-Logo.png" alt="MediPredict" className="h-10" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-600">Welcome, </span>
                <span className="font-semibold text-gray-900">{userName}</span>
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-gray-700"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex space-x-2 bg-white p-2 rounded-xl shadow-sm border border-gray-200 inline-flex">
            <button
              onClick={() => setActiveTab('checker')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'checker'
                  ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span>Symptom Checker</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <History className="w-5 h-5" />
              <span>History</span>
            </button>
            <button
              onClick={() => setActiveTab('consultation')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition ${
                activeTab === 'consultation'
                  ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-5 h-5" />
              <span>Consult Doctor</span>
            </button>
          </div>
        </div>

        <div>
          {activeTab === 'checker' && <SymptomChecker />}
          {activeTab === 'history' && <PredictionHistory />}
          {activeTab === 'consultation' && <DoctorConsultation />}
        </div>
      </div>
    </div>
  );
}
