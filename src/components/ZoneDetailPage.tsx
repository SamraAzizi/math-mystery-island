import { useEffect, useState } from 'react';
import { ArrowLeft, Clock, Star, CheckCircle, Lock } from 'lucide-react';
import { supabase, Zone, Puzzle } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ZoneDetailPageProps {
  zoneId: string;
  onBack: () => void;
  onSelectPuzzle: (puzzleId: string) => void;
}

export function ZoneDetailPage({ zoneId, onBack, onSelectPuzzle }: ZoneDetailPageProps) {
  const { user } = useAuth();
  const [zone, setZone] = useState<Zone | null>(null);
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [userProgress, setUserProgress] = useState<Map<string, { completed: boolean; attempts: number }>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadZoneData();
  }, [zoneId, user]);

  const loadZoneData = async () => {
    if (!user) return;

    const { data: zoneData } = await supabase
      .from('zones')
      .select('*')
      .eq('id', zoneId)
      .maybeSingle();

    if (zoneData) {
      setZone(zoneData as Zone);
    }

    const { data: puzzlesData } = await supabase
      .from('puzzles')
      .select('*')
      .eq('zone_id', zoneId)
      .order('difficulty');

    if (puzzlesData) {
      setPuzzles(puzzlesData as Puzzle[]);

      const { data: progressData } = await supabase
        .from('user_progress')
        .select('puzzle_id, completed, attempts')
        .eq('user_id', user.id)
        .in('puzzle_id', puzzlesData.map(p => p.id));

      if (progressData) {
        const progressMap = new Map(
          progressData.map(p => [p.puzzle_id, { completed: p.completed, attempts: p.attempts }])
        );
        setUserProgress(progressMap);
      }
    }

    setLoading(false);
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-green-600 bg-green-100';
    if (difficulty <= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return 'Easy';
    if (difficulty <= 3) return 'Medium';
    return 'Hard';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading puzzles...</p>
        </div>
      </div>
    );
  }

  if (!zone) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Island</span>
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">{zone.name}</h1>
          <p className="text-lg text-gray-600">{zone.description}</p>
        </div>

        <div className="grid gap-6">
          {puzzles.map((puzzle) => {
            const progress = userProgress.get(puzzle.id);
            const isCompleted = progress?.completed || false;

            return (
              <div
                key={puzzle.id}
                className={`bg-white rounded-2xl shadow-lg p-6 transition-all ${
                  isCompleted ? 'border-2 border-green-300' : 'hover:shadow-xl hover:scale-102 cursor-pointer'
                }`}
                onClick={() => !isCompleted && onSelectPuzzle(puzzle.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{puzzle.title}</h3>
                      {isCompleted && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{puzzle.description}</p>

                    <div className="flex flex-wrap gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyColor(puzzle.difficulty)}`}>
                        {getDifficultyLabel(puzzle.difficulty)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold text-blue-600 bg-blue-100">
                        Grade {puzzle.grade_level}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm text-gray-600 bg-gray-100">
                        {puzzle.math_concept}
                      </span>
                      <span className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm text-gray-600 bg-gray-100">
                        <Clock className="w-4 h-4" />
                        <span>{puzzle.time_estimate} min</span>
                      </span>
                      <span className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm text-amber-600 bg-amber-100">
                        <Star className="w-4 h-4" />
                        <span>{puzzle.gems_reward} gems</span>
                      </span>
                    </div>

                    {progress && progress.attempts > 0 && !isCompleted && (
                      <div className="mt-3 text-sm text-gray-500">
                        Attempts: {progress.attempts}
                      </div>
                    )}
                  </div>

                  {!isCompleted && (
                    <button
                      className="ml-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                    >
                      Solve
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {puzzles.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No puzzles available yet in this zone.</p>
              <p className="text-gray-500 text-sm mt-2">Check back soon for new challenges!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
