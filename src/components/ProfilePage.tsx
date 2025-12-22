import { useEffect, useState } from 'react';
import { User, Gem, TrendingUp, Clock, Target } from 'lucide-react';
import { supabase, Avatar } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function ProfilePage() {
  const { user, profile } = useAuth();
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [stats, setStats] = useState({
    totalCompleted: 0,
    totalAttempts: 0,
    totalTimeSpent: 0,
    averageTime: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;

    const { data: avatarData } = await supabase
      .from('avatars')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (avatarData) {
      setAvatar(avatarData as Avatar);
    }

    const { data: progressData } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id);

    if (progressData) {
      const completed = progressData.filter((p) => p.completed).length;
      const totalAttempts = progressData.reduce((sum, p) => sum + p.attempts, 0);
      const totalTime = progressData.reduce((sum, p) => sum + p.time_spent, 0);
      const avgTime = completed > 0 ? Math.floor(totalTime / completed) : 0;

      setStats({
        totalCompleted: completed,
        totalAttempts,
        totalTimeSpent: totalTime,
        averageTime: avgTime,
      });
    }

    setLoading(false);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const skinColors = ['#FFD4A3', '#F4C2A0', '#D4A574', '#8B6B47', '#6B4423'];
  const hairStyles = ['short', 'long', 'curly', 'spiky', 'bald'];
  const outfits = ['casual', 'formal', 'sporty', 'superhero', 'wizard'];

  const updateAvatar = async (field: keyof Avatar, value: string) => {
    if (!user || !avatar) return;

    await supabase
      .from('avatars')
      .update({ [field]: value })
      .eq('user_id', user.id);

    setAvatar({ ...avatar, [field]: value });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="text-center mb-6">
                <div
                  className="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: avatar?.skin_color }}
                >
                  <User className="w-20 h-20 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{profile?.username}</h2>
                <p className="text-gray-600">Grade {profile?.grade_level}</p>
              </div>

              <div className="space-y-4">
                <div className="bg-amber-50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Gem className="w-6 h-6 text-amber-600" />
                    <span className="text-gray-700 font-medium">Math Gems</span>
                  </div>
                  <span className="text-2xl font-bold text-amber-600">{profile?.total_gems}</span>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700 font-medium">Puzzles Solved</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{stats.totalCompleted}</span>
                </div>

                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700 font-medium">Time Spent</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{formatTime(stats.totalTimeSpent)}</span>
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span className="text-gray-700 font-medium">Avg Time/Puzzle</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">{formatTime(stats.averageTime)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Customize Your Avatar</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Skin Color</label>
                  <div className="flex space-x-3">
                    {skinColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => updateAvatar('skin_color', color)}
                        className={`w-12 h-12 rounded-full border-4 transition-all ${
                          avatar?.skin_color === color ? 'border-blue-500 scale-110' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Hair Style</label>
                  <div className="grid grid-cols-5 gap-3">
                    {hairStyles.map((style) => (
                      <button
                        key={style}
                        onClick={() => updateAvatar('hair_style', style)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all capitalize ${
                          avatar?.hair_style === style
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Outfit</label>
                  <div className="grid grid-cols-5 gap-3">
                    {outfits.map((outfit) => (
                      <button
                        key={outfit}
                        onClick={() => updateAvatar('outfit', outfit)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all capitalize ${
                          avatar?.outfit === outfit
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {outfit}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl">
                <h3 className="font-semibold text-gray-800 mb-2">Pro Tip</h3>
                <p className="text-gray-600">
                  Keep solving puzzles to earn more gems and unlock exclusive avatar items!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
