import { BookOpen, Map, User, BarChart, Trophy, LogOut, Gem } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { profile, signOut } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: BookOpen },
    { id: 'island', label: 'Island', icon: Map },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center space-x-2 font-bold text-lg text-blue-600"
            >
              <BookOpen className="w-6 h-6" />
              <span className="hidden sm:inline">Math Mystery Island</span>
            </button>

            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      currentPage === item.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {profile && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-amber-100 px-3 py-1 rounded-full">
                  <Gem className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-amber-900">{profile.total_gems}</span>
                </div>
                <div className="hidden sm:block text-sm">
                  <div className="font-semibold text-gray-800">{profile.username}</div>
                  <div className="text-gray-500 text-xs">Grade {profile.grade_level}</div>
                </div>
              </div>
            )}
            <button
              onClick={() => signOut()}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="md:hidden flex space-x-1 pb-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center space-x-1 px-3 py-1 rounded-lg whitespace-nowrap transition-colors ${
                  currentPage === item.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
