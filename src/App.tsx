import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { IslandPage } from './components/IslandPage';
import { ZoneDetailPage } from './components/ZoneDetailPage';
import { PuzzleSolvePage } from './components/PuzzleSolvePage';
import { ProfilePage } from './components/ProfilePage';
import { DashboardPage } from './components/DashboardPage';
import { AchievementsPage } from './components/AchievementsPage';

function AppContent() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedPuzzleId, setSelectedPuzzleId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Math Mystery Island...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (authMode === 'login') {
      return <LoginPage onSwitchToSignup={() => setAuthMode('signup')} />;
    }
    return <SignupPage onSwitchToLogin={() => setAuthMode('login')} />;
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedZoneId(null);
    setSelectedPuzzleId(null);
  };

  const handleSelectZone = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    setSelectedPuzzleId(null);
  };

  const handleSelectPuzzle = (puzzleId: string) => {
    setSelectedPuzzleId(puzzleId);
  };

  const handleBackToZone = () => {
    setSelectedPuzzleId(null);
  };

  const handleBackToIsland = () => {
    setSelectedZoneId(null);
    setSelectedPuzzleId(null);
  };

  const handlePuzzleComplete = () => {
    setSelectedPuzzleId(null);
  };

  if (selectedPuzzleId && selectedZoneId) {
    return (
      <>
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
        <PuzzleSolvePage
          puzzleId={selectedPuzzleId}
          onBack={handleBackToZone}
          onComplete={handlePuzzleComplete}
        />
      </>
    );
  }

  if (selectedZoneId) {
    return (
      <>
        <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
        <ZoneDetailPage
          zoneId={selectedZoneId}
          onBack={handleBackToIsland}
          onSelectPuzzle={handleSelectPuzzle}
        />
      </>
    );
  }

  return (
    <>
      <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
      {currentPage === 'home' && <HomePage onStartAdventure={() => handleNavigate('island')} />}
      {currentPage === 'island' && <IslandPage onSelectZone={handleSelectZone} />}
      {currentPage === 'profile' && <ProfilePage />}
      {currentPage === 'dashboard' && <DashboardPage />}
      {currentPage === 'achievements' && <AchievementsPage />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
