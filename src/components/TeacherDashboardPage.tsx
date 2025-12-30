import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Users, BookOpen, TrendingUp, Copy, Trash2, Eye } from 'lucide-react';

interface Classroom {
  id: string;
  name: string;
  description: string;
  grade_level: number;
  code: string;
  created_at: string;
  student_count?: number;
}

interface ClassroomStats {
  total_students: number;
  total_puzzles_solved: number;
  avg_completion_rate: number;
}

export default function TeacherDashboardPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [stats, setStats] = useState<ClassroomStats>({
    total_students: 0,
    total_puzzles_solved: 0,
    avg_completion_rate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    grade_level: 5,
  });
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    loadClassrooms();
    loadStats();
  }, []);

  const loadClassrooms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .eq('teacher_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const classroomsWithCounts = await Promise.all(
        (data || []).map(async (classroom) => {
          const { count } = await supabase
            .from('classroom_students')
            .select('*', { count: 'exact' })
            .eq('classroom_id', classroom.id);
          return { ...classroom, student_count: count || 0 };
        })
      );

      setClassrooms(classroomsWithCounts);
    } catch (error) {
      console.error('Error loading classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: allStudents } = await supabase
        .from('classroom_students')
        .select('student_id', { count: 'exact' })
        .in('classroom_id',
          (await supabase
            .from('classrooms')
            .select('id')
            .eq('teacher_id', user.id)).data?.map(c => c.id) || []
        );

      const studentIds = allStudents?.map(s => s.student_id) || [];

      if (studentIds.length > 0) {
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('user_id, completed')
          .in('user_id', studentIds);

        const totalSolved = progressData?.filter(p => p.completed).length || 0;
        const avgCompletion = studentIds.length > 0
          ? (totalSolved / (studentIds.length * 150)) * 100
          : 0;

        setStats({
          total_students: studentIds.length,
          total_puzzles_solved: totalSolved,
          avg_completion_rate: Math.round(avgCompletion),
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const createClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const code = Math.random().toString(36).substring(2, 8).toUpperCase();

      const { error } = await supabase
        .from('classrooms')
        .insert({
          teacher_id: user.id,
          name: formData.name,
          description: formData.description,
          grade_level: formData.grade_level,
          code,
        });

      if (error) throw error;

      setFormData({ name: '', description: '', grade_level: 5 });
      setShowCreateForm(false);
      loadClassrooms();
      loadStats();
    } catch (error) {
      console.error('Error creating classroom:', error);
    }
  };

  const deleteClassroom = async (id: string) => {
    if (!confirm('Delete this classroom and remove all students?')) return;

    try {
      const { error } = await supabase
        .from('classrooms')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadClassrooms();
      loadStats();
    } catch (error) {
      console.error('Error deleting classroom:', error);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading classrooms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your classrooms and monitor student progress</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total_students}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Puzzles Solved</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total_puzzles_solved}</p>
              </div>
              <BookOpen className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Completion</p>
                <p className="text-3xl font-bold text-gray-900">{stats.avg_completion_rate}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Classroom
          </button>
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Classroom</h2>
            <form onSubmit={createClassroom}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Classroom Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., 5th Grade Math"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Optional: Describe your classroom..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade Level
                  </label>
                  <select
                    value={formData.grade_level}
                    onChange={(e) => setFormData({ ...formData, grade_level: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {Array.from({ length: 8 }, (_, i) => i + 3).map((grade) => (
                      <option key={grade} value={grade}>
                        Grade {grade}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Create Classroom
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {classrooms.map((classroom) => (
            <div key={classroom.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{classroom.name}</h3>
                  {classroom.description && (
                    <p className="text-gray-600 text-sm mt-1">{classroom.description}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">{classroom.student_count || 0} Students</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <BookOpen className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Grade {classroom.grade_level}</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded p-3 mb-6">
                <p className="text-xs text-gray-600 mb-2">Join Code</p>
                <div className="flex items-center gap-2">
                  <code className="font-mono font-bold text-lg text-gray-900">{classroom.code}</code>
                  <button
                    onClick={() => copyCode(classroom.code)}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    title="Copy join code"
                  >
                    <Copy className="w-4 h-4 text-gray-600" />
                  </button>
                  {copiedCode === classroom.code && (
                    <span className="text-xs text-green-600 font-medium">Copied!</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedClassroom(classroom.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-indigo-200 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => deleteClassroom(classroom.id)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {classrooms.length === 0 && !showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Classrooms Yet</h3>
            <p className="text-gray-500 mb-6">Create your first classroom to start managing students.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Classroom
            </button>
          </div>
        )}
      </div>

      {selectedClassroom && (
        <ClassroomDetailModal
          classroomId={selectedClassroom}
          onClose={() => setSelectedClassroom(null)}
        />
      )}
    </div>
  );
}

function ClassroomDetailModal({
  classroomId,
  onClose,
}: {
  classroomId: string;
  onClose: () => void;
}) {
  const [students, setStudents] = useState<any[]>([]);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClassroomDetails();
  }, [classroomId]);

  const loadClassroomDetails = async () => {
    try {
      const { data: classData } = await supabase
        .from('classrooms')
        .select('*')
        .eq('id', classroomId)
        .maybeSingle();

      setClassroom(classData);

      const { data: studentData } = await supabase
        .from('classroom_students')
        .select('student_id, joined_at')
        .eq('classroom_id', classroomId);

      if (studentData) {
        const studentIds = studentData.map((s) => s.student_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username, total_gems')
          .in('id', studentIds);

        const studentsWithProgress = await Promise.all(
          (profiles || []).map(async (profile) => {
            const { count } = await supabase
              .from('user_progress')
              .select('*', { count: 'exact' })
              .eq('user_id', profile.id)
              .eq('completed', true);

            return {
              ...profile,
              puzzles_solved: count || 0,
              joined_at: studentData.find((s) => s.student_id === profile.id)?.joined_at,
            };
          })
        );

        setStudents(studentsWithProgress);
      }
    } catch (error) {
      console.error('Error loading classroom details:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeStudent = async (studentId: string) => {
    if (!confirm('Remove this student from the classroom?')) return;

    try {
      const { error } = await supabase
        .from('classroom_students')
        .delete()
        .eq('classroom_id', classroomId)
        .eq('student_id', studentId);

      if (error) throw error;
      setStudents(students.filter((s) => s.id !== studentId));
    } catch (error) {
      console.error('Error removing student:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading classroom details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{classroom?.name}</h2>
            <p className="text-gray-600 text-sm mt-1">{students.length} enrolled students</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {students.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No students enrolled yet</p>
              <p className="text-sm text-gray-500 mt-2">Share the join code: {classroom?.code}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{student.username}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>{student.puzzles_solved} puzzles solved</span>
                      <span>{student.total_gems} gems</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeStudent(student.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}