import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  getReviewQueue,
  recordReview,
  getReviewStats,
} from '../lib/spacedRepetition';
import { RefreshCw, CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react';

interface ReviewItem {
  id: string;
  puzzle_id: string;
  easiness_factor: number;
  interval: number;
  repetitions: number;
  next_review_date: string;
  puzzles: any;
}

interface ReviewStats {
  due_count: number;
  total_tracked: number;
  reviews_today: number;
  avg_quality: number;
}

export default function ReviewPage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    due_count: 0,
    total_tracked: 0,
    reviews_today: 0,
    avg_quality: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [selectedQuality, setSelectedQuality] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    if (!user) return;
    loadReviewData();
  }, [user]);

  const loadReviewData = async () => {
    if (!user) return;
    try {
      const reviewQueue = await getReviewQueue(user.id);
      const reviewStats = await getReviewStats(user.id);
      setQueue(reviewQueue);
      setStats(reviewStats);
    } catch (error) {
      console.error('Error loading review data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startReview = () => {
    setShowReview(true);
    setStartTime(Date.now());
    setSelectedQuality(null);
  };

  const submitQuality = async () => {
    if (selectedQuality === null || !user) return;

    setSubmitting(true);
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const currentItem = queue[currentIndex];

      const success = await recordReview(
        user.id,
        currentItem.puzzle_id,
        selectedQuality,
        timeSpent
      );

      if (success) {
        setCompleted(completed + 1);
        if (currentIndex < queue.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setShowReview(false);
          setSelectedQuality(null);
        } else {
          setShowReview(false);
          await new Promise((resolve) => setTimeout(resolve, 500));
          await loadReviewData();
          setCurrentIndex(0);
          setCompleted(0);
        }
      }
    } catch (error) {
      console.error('Error submitting quality:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading review queue...</p>
        </div>
      </div>
    );
  }

  const currentItem = queue[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Spaced Repetition Review</h1>
          <p className="mt-2 text-gray-600">
            Master concepts through strategic review at optimal intervals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm font-medium text-gray-600">Due Today</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.due_count}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5 text-blue-500" />
              <p className="text-sm font-medium text-gray-600">Being Tracked</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total_tracked}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-sm font-medium text-gray-600">Today's Reviews</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.reviews_today}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <p className="text-sm font-medium text-gray-600">Avg Quality</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.avg_quality}</p>
          </div>
        </div>

        {queue.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h2>
            <p className="text-gray-600 mb-4">
              You have no puzzles due for review right now. Solve more puzzles to build your review queue!
            </p>
            <button
              onClick={loadReviewData}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        ) : !showReview ? (
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Puzzle {currentIndex + 1} of {queue.length}
                </h2>
                <div className="w-full max-w-xs mx-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${((currentIndex + completed) / queue.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentItem?.puzzles?.title}
                </h3>
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                    <span>{currentItem?.puzzles?.zones?.name}</span>
                  </div>
                  <div className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                    <span>Difficulty: {currentItem?.puzzles?.difficulty}/5</span>
                  </div>
                  <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                    <span>Concept: {currentItem?.puzzles?.math_concept}</span>
                  </div>
                  <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    <RefreshCw className="w-4 h-4" />
                    <span>Review #{currentItem?.repetitions || 1}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">Interval</p>
                  <p className="text-lg font-bold text-gray-900">
                    {currentItem?.interval} days
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Easiness</p>
                  <p className="text-lg font-bold text-gray-900">
                    {currentItem?.easiness_factor.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Next Review</p>
                  <p className="text-lg font-bold text-gray-900">
                    {Math.ceil(
                      (new Date(currentItem?.next_review_date).getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    days
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> This puzzle was last reviewed{' '}
                {Math.ceil(
                  (new Date().getTime() -
                    new Date(currentItem?.next_review_date).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{' '}
                days ago. Try to solve it correctly to extend your review interval.
              </p>
            </div>

            <button
              onClick={startReview}
              className="w-full bg-indigo-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 transition-colors"
            >
              <Clock className="w-5 h-5 inline mr-2" />
              Start Review
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              How well did you remember this?
            </h2>

            <div className="mb-8">
              <p className="text-gray-700 mb-4">
                Rate your recall quality from 0 (forgot completely) to 5 (remembered perfectly):
              </p>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
                {[0, 1, 2, 3, 4, 5].map((quality) => (
                  <button
                    key={quality}
                    onClick={() => setSelectedQuality(quality)}
                    className={`p-4 rounded-lg font-bold text-lg transition-all ${
                      selectedQuality === quality
                        ? 'bg-indigo-600 text-white scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {quality}
                  </button>
                ))}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">0-2</p>
                    <p className="font-semibold text-red-600">Forgot</p>
                  </div>
                  <div>
                    <p className="text-gray-600">3</p>
                    <p className="font-semibold text-yellow-600">Difficult</p>
                  </div>
                  <div>
                    <p className="text-gray-600">4-5</p>
                    <p className="font-semibold text-green-600">Easy</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReview(false)}
                disabled={submitting}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={submitQuality}
                disabled={selectedQuality === null || submitting}
                className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Submit & Next'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}