import { useEffect, useState } from 'react';
import { Lock, CheckCircle, Mountain, Waves, Trees, TrendingUp } from 'lucide-react';
import { supabase, Zone } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface IslandPageProps {
  onSelectZone: (zoneId: string) => void;
}

export function IslandPage({ onSelectZone }: IslandPageProps) {
  const { user } = useAuth();
  const [zones, setZones] = useState<Zone[]>([]);
  const [unlockedZones, setUnlockedZones] = useState<Set<string>>(new Set());
  const [completedCounts, setCompletedCounts] = useState<Record<string, { completed: number; total: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIslandData();
  }, [user]);

  const loadIslandData = async () => {
    if (!user) return;

    const { data: zonesData } = await supabase
      .from('zones')
      .select('*')
      .order('order_index');

    if (zonesData) {
      setZones(zonesData as Zone[]);

      const { data: unlockedData } = await supabase
        .from('unlocked_zones')
        .select('zone_id')
        .eq('user_id', user.id);

      if (unlockedData) {
        setUnlockedZones(new Set(unlockedData.map((u) => u.zone_id)));
      }

      const counts: Record<string, { completed: number; total: number }> = {};
      for (const zone of zonesData) {
        const { count: totalCount } = await supabase
          .from('puzzles')
          .select('*', { count: 'exact', head: true })
          .eq('zone_id', zone.id);

        const { count: completedCount } = await supabase
          .from('user_progress')
          .select('p:puzzles!inner(*)', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completed', true)
          .eq('puzzles.zone_id', zone.id);

        counts[zone.id] = {
          completed: completedCount || 0,
          total: totalCount || 0,
        };
      }
      setCompletedCounts(counts);
    }

    setLoading(false);
  };

  const getZoneIcon = (zoneName: string) => {
    if (zoneName.includes('Geometry')) return Mountain;
    if (zoneName.includes('Algebra')) return Waves;
    if (zoneName.includes('Statistics')) return Trees;
    if (zoneName.includes('Calculus')) return TrendingUp;
    return Mountain;
  };

  const getZoneColor = (index: number) => {
    const colors = [
      'from-blue-400 to-cyan-500',
      'from-green-400 to-emerald-500',
      'from-amber-400 to-orange-500',
      'from-red-400 to-pink-500',
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your island...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Math Mystery Island</h1>
          <p className="text-lg text-gray-600">
            Choose a zone to begin your adventure. Solve puzzles to unlock new areas!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {zones.map((zone, index) => {
            const Icon = getZoneIcon(zone.name);
            const isUnlocked = unlockedZones.has(zone.id);
            const progress = completedCounts[zone.id] || { completed: 0, total: 0 };
            const progressPercent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

            return (
              <div
                key={zone.id}
                className={`relative bg-white rounded-3xl shadow-xl overflow-hidden transition-all ${
                  isUnlocked ? 'hover:shadow-2xl hover:scale-105 cursor-pointer' : 'opacity-75'
                }`}
                onClick={() => isUnlocked && onSelectZone(zone.id)}
              >
                <div className={`h-48 bg-gradient-to-br ${getZoneColor(index)} flex items-center justify-center relative`}>
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center text-white">
                        <Lock className="w-12 h-12 mx-auto mb-2" />
                        <p className="font-semibold">Solve {zone.unlock_requirement} puzzles to unlock</p>
                      </div>
                    </div>
                  )}
                  <Icon className="w-24 h-24 text-white" />
                  {isUnlocked && progress.completed === progress.total && progress.total > 0 && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{zone.name}</h2>
                  <p className="text-gray-600 mb-4">{zone.description}</p>

                  {isUnlocked && (
                    <div>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Progress</span>
                        <span className="font-semibold">
                          {progress.completed} / {progress.total}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getZoneColor(index)} transition-all duration-500`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {isUnlocked && (
                    <button
                      className={`mt-4 w-full bg-gradient-to-r ${getZoneColor(index)} text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity`}
                    >
                      Enter Zone
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
