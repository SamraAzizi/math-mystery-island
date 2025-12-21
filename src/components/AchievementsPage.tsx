import { useEffect, useState } from 'react';
import { Trophy, Lock, Star, Zap, Award, Users, Lightbulb, Brain, Map } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  earned: boolean;
  earned_at?: string;
}

export function AchievementsPage() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, [user]);

  const loadAchievements = async () => {
    if (!user) return;

    const { data: allAchievements } = await supabase
      .from('achievements')
      .select('*')
      .order('category');

    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id, earned_at')
      .eq('user_id', user.id);

    if (allAchievements && userAchievements) {
      const earnedMap = new Map(userAchievements.map((ua) => [ua.achievement_id, ua.earned_at]));

      const achievementsWithStatus = allAchievements.map((a) => ({
        ...a,
        earned: earnedMap.has(a.id),
        earned_at: earnedMap.get(a.id),
      }));

      setAchievements(achievementsWithStatus as Achievement[]);
    }

    setLoading(false);
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Star,
      Zap,
      Award,
      Users,
      Lightbulb,
      Brain,
      Map,
      Trophy,
    };
    return icons[iconName] || Trophy;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      exploration: 'from-blue-400 to-cyan-500',
      speed: 'from-green-400 to-emerald-500',
      accuracy: 'from-amber-400 to-orange-500',
      social: 'from-pink-400 to-rose-500',
    };
    return colors[category] || 'from-gray-400 to-gray-500';
  };

  const categories = ['all', 'exploration', 'speed', 'accuracy', 'social'];

  const filteredAchievements = filter === 'all'
    ? achievements
    : achievements.filter((a) => a.category === filter);

  const earnedCount = achievements.filter((a) => a.earned).length;
  const totalCount = achievements.length;
  const completionPercent = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Achievements</h1>
              <p className="text-gray-600">
                {earnedCount} of {totalCount} achievements unlocked
              </p>
            </div>
            <div className="text-center">
              <div className="relative w-24 h-24">
                <svg className="transform -rotate-90 w-24 h-24">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#3B82F6"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercent / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-800">{completionPercent.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                  filter === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => {
            const Icon = getIconComponent(achievement.icon);
            const colorClass = getCategoryColor(achievement.category);

            return (
              <div
                key={achievement.id}
                className={`bg-white rounded-2xl shadow-lg p-6 transition-all ${
                  achievement.earned
                    ? 'hover:shadow-xl hover:scale-105'
                    : 'opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      achievement.earned
                        ? `bg-gradient-to-br ${colorClass}`
                        : 'bg-gray-200'
                    }`}
                  >
                    {achievement.earned ? (
                      <Icon className="w-8 h-8 text-white" />
                    ) : (
                      <Lock className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  {achievement.earned && (
                    <div className="bg-green-100 rounded-full p-1">
                      <Trophy className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">{achievement.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{achievement.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    {achievement.category}
                  </span>
                  {achievement.earned && achievement.earned_at && (
                    <span className="text-xs text-gray-500">
                      {new Date(achievement.earned_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No achievements in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
