import { useAuth } from './contexts/AuthContext';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { Route, Routes } from 'react-router-dom';
import { DoctorConsultation } from './components/DoctorConsultation';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <img src="/MediPredict-Logo.png" alt="MediPredict" className="h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? 
    <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route
          path="/doctor-consultation"
          element={<DoctorConsultation />}
        />
    </Routes> 
  : <LandingPage />;
}

export default App;
