import { useEffect, useState } from 'react';
import { BarChart, TrendingUp, Target, Clock, Zap, Award, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getReviewStats } from '../lib/spacedRepetition';

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPuzzles: 0,
    completedPuzzles: 0,
    totalAttempts: 0,
    totalTime: 0,
    weakAreas: [] as { concept: string; accuracy: number }[],
    recentActivity: [] as { puzzle_title: string; completed: boolean; completed_at: string }[],
  });
  const [reviewStats, setReviewStats] = useState({
    due_count: 0,
    total_tracked: 0,
    reviews_today: 0,
    avg_quality: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    const { data: progressData } = await supabase
      .from('user_progress')
      .select(`
        *,
        puzzle:puzzles(title, math_concept)
      `)
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(10);

    if (progressData) {
      const completed = progressData.filter((p) => p.completed).length;
      const totalAttempts = progressData.reduce((sum, p) => sum + p.attempts, 0);
      const totalTime = progressData.reduce((sum, p) => sum + p.time_spent, 0);

      const conceptMap = new Map<string, { total: number; completed: number }>();
      progressData.forEach((p: any) => {
        const concept = p.puzzle?.math_concept || 'Unknown';
        const current = conceptMap.get(concept) || { total: 0, completed: 0 };
        conceptMap.set(concept, {
          total: current.total + 1,
          completed: current.completed + (p.completed ? 1 : 0),
        });
      });

      const weakAreas = Array.from(conceptMap.entries())
        .map(([concept, data]) => ({
          concept,
          accuracy: data.total > 0 ? (data.completed / data.total) * 100 : 0,
        }))
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 5);

      const recentActivity = progressData
        .filter((p: any) => p.completed_at)
        .map((p: any) => ({
          puzzle_title: p.puzzle?.title || 'Unknown Puzzle',
          completed: p.completed,
          completed_at: p.completed_at,
        }));

      setStats({
        totalPuzzles: progressData.length,
        completedPuzzles: completed,
        totalAttempts,
        totalTime,
        weakAreas,
        recentActivity,
      });
    }

    const srStats = await getReviewStats(user.id);
    setReviewStats(srStats);

    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const completionRate = stats.totalPuzzles > 0 ? (stats.completedPuzzles / stats.totalPuzzles) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Learning Dashboard</h1>
          <p className="text-gray-600">Track your progress and identify areas for improvement</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-800">{completionRate.toFixed(0)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-green-100 p-3 rounded-xl">
                <Award className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Puzzles Solved</p>
                <p className="text-2xl font-bold text-gray-800">{stats.completedPuzzles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-amber-100 p-3 rounded-xl">
                <Zap className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Attempts</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalAttempts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Time Spent</p>
                <p className="text-2xl font-bold text-gray-800">{formatTime(stats.totalTime)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-red-100 p-3 rounded-xl">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Reviews Due</p>
                <p className="text-2xl font-bold text-gray-800">{reviewStats.due_count}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-cyan-100 p-3 rounded-xl">
                <RefreshCw className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Being Tracked</p>
                <p className="text-2xl font-bold text-gray-800">{reviewStats.total_tracked}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Areas to Improve</h2>
            </div>

            {stats.weakAreas.length > 0 ? (
              <div className="space-y-4">
                {stats.weakAreas.map((area) => (
                  <div key={area.concept}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 font-medium capitalize">{area.concept}</span>
                      <span className="text-sm text-gray-600">{area.accuracy.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          area.accuracy < 50
                            ? 'bg-red-500'
                            : area.accuracy < 75
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${area.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                Complete more puzzles to see your weak areas
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-6">
              <BarChart className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
            </div>

            {stats.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {stats.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{activity.puzzle_title}</p>
                      <p className="text-xs text-gray-500">{formatDate(activity.completed_at)}</p>
                    </div>
                    {activity.completed && (
                      <Award className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No recent activity yet. Start solving puzzles!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
