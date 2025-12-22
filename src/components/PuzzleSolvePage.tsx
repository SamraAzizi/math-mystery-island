import { useEffect, useState } from 'react';
import { ArrowLeft, Lightbulb, Clock, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { supabase, Puzzle } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PuzzleSolvePageProps {
  puzzleId: string;
  onBack: () => void;
  onComplete: () => void;
}

export function PuzzleSolvePage({ puzzleId, onBack, onComplete }: PuzzleSolvePageProps) {
  const { user, refreshProfile } = useAuth();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [answer, setAnswer] = useState('');
  const [showHints, setShowHints] = useState(false);
  const [currentHintLevel, setCurrentHintLevel] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPuzzle();
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [puzzleId, user]);

  const loadPuzzle = async () => {
    const { data: puzzleData } = await supabase
      .from('puzzles')
      .select('*')
      .eq('id', puzzleId)
      .maybeSingle();

    if (puzzleData) {
      setPuzzle(puzzleData as Puzzle);

      if (user) {
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('attempts, hints_used')
          .eq('user_id', user.id)
          .eq('puzzle_id', puzzleId)
          .maybeSingle();

        if (progressData) {
          setAttempts(progressData.attempts || 0);
          setHintsUsed(progressData.hints_used || 0);
        }
      }
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puzzle || !user || submitting) return;

    setSubmitting(true);
    setFeedback(null);

    const isCorrect = answer.trim().toLowerCase() === String(puzzle.problem_data.answer).toLowerCase();
    const newAttempts = attempts + 1;

    if (isCorrect) {
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('puzzle_id', puzzleId)
        .maybeSingle();

      if (existingProgress) {
        await supabase
          .from('user_progress')
          .update({
            completed: true,
            attempts: newAttempts,
            hints_used: hintsUsed,
            time_spent: timeSpent,
            completed_at: new Date().toISOString(),
          })
          .eq('id', existingProgress.id);
      } else {
        await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            puzzle_id: puzzleId,
            completed: true,
            attempts: newAttempts,
            hints_used: hintsUsed,
            time_spent: timeSpent,
            completed_at: new Date().toISOString(),
          });
      }

      await supabase.rpc('increment', { row_id: user.id, x: puzzle.gems_reward });

      const { data: profile } = await supabase
        .from('profiles')
        .select('total_gems')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        await supabase
          .from('profiles')
          .update({ total_gems: profile.total_gems + puzzle.gems_reward })
          .eq('id', user.id);
      }

      const { data: allZones } = await supabase.from('zones').select('*').order('order_index');
      if (allZones) {
        for (const zone of allZones) {
          const { data: unlockedZone } = await supabase
            .from('unlocked_zones')
            .select('id')
            .eq('user_id', user.id)
            .eq('zone_id', zone.id)
            .maybeSingle();

          if (!unlockedZone) {
            const { count } = await supabase
              .from('user_progress')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('completed', true);

            if (count && count >= zone.unlock_requirement) {
              await supabase
                .from('unlocked_zones')
                .insert({ user_id: user.id, zone_id: zone.id });
            }
          }
        }
      }

      await refreshProfile();

      setFeedback({
        type: 'success',
        message: `Correct! You earned ${puzzle.gems_reward} gems!`,
      });

      setTimeout(() => {
        onComplete();
      }, 2000);
    } else {
      setAttempts(newAttempts);

      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('puzzle_id', puzzleId)
        .maybeSingle();

      if (existingProgress) {
        await supabase
          .from('user_progress')
          .update({ attempts: newAttempts })
          .eq('id', existingProgress.id);
      } else {
        await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            puzzle_id: puzzleId,
            completed: false,
            attempts: newAttempts,
          });
      }

      setFeedback({
        type: 'error',
        message: 'Not quite right. Try again or use a hint!',
      });
    }

    setSubmitting(false);
  };

  const handleShowHint = async () => {
    if (!puzzle || !user) return;

    if (!showHints) {
      setShowHints(true);
      setCurrentHintLevel(0);
    } else if (currentHintLevel < puzzle.hints.length - 1) {
      setCurrentHintLevel(currentHintLevel + 1);
    }

    const newHintsUsed = hintsUsed + 1;
    setHintsUsed(newHintsUsed);

    const { data: existingProgress } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('puzzle_id', puzzleId)
      .maybeSingle();

    if (existingProgress) {
      await supabase
        .from('user_progress')
        .update({ hints_used: newHintsUsed })
        .eq('id', existingProgress.id);
    } else {
      await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          puzzle_id: puzzleId,
          hints_used: newHintsUsed,
        });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading puzzle...</p>
        </div>
      </div>
    );
  }

  if (!puzzle) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Zone</span>
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">{puzzle.title}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">{formatTime(timeSpent)}</span>
              </div>
              <div className="flex items-center space-x-2 text-amber-600">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">{puzzle.gems_reward} gems</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 mb-6">
            <p className="text-lg text-gray-700 mb-4">{puzzle.problem_data.question}</p>
            {puzzle.problem_data.options && (
              <div className="space-y-2">
                {puzzle.problem_data.options.map((option, index) => (
                  <div key={index} className="text-gray-700">
                    {String.fromCharCode(65 + index)}. {option}
                  </div>
                ))}
              </div>
            )}
          </div>

          {showHints && puzzle.hints.length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-6">
              <div className="flex items-start space-x-3">
                <Lightbulb className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 mb-2">
                    Hint {currentHintLevel + 1} of {puzzle.hints.length}
                  </h3>
                  <p className="text-yellow-800">{puzzle.hints[currentHintLevel]}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer
              </label>
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="Enter your answer"
                disabled={submitting}
              />
            </div>

            {feedback && (
              <div
                className={`flex items-center space-x-3 p-4 rounded-lg ${
                  feedback.type === 'success'
                    ? 'bg-green-50 border-2 border-green-200'
                    : 'bg-red-50 border-2 border-red-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
                <p
                  className={`font-semibold ${
                    feedback.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {feedback.message}
                </p>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Checking...' : 'Submit Answer'}
              </button>

              {puzzle.hints.length > 0 && currentHintLevel < puzzle.hints.length && (
                <button
                  type="button"
                  onClick={handleShowHint}
                  className="px-6 py-3 border-2 border-yellow-500 text-yellow-700 font-semibold rounded-lg hover:bg-yellow-50 transition-colors flex items-center space-x-2"
                >
                  <Lightbulb className="w-5 h-5" />
                  <span>{showHints ? 'Next Hint' : 'Get Hint'}</span>
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
            <span>Attempts: {attempts}</span>
            <span>Hints Used: {hintsUsed}</span>
            <span className="text-blue-600 font-semibold">{puzzle.math_concept}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
