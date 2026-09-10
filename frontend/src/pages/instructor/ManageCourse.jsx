import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';

const ManageCourse = () => {
  const { courseId } = useParams();
  const [data, setData] = useState(null);
  const [students, setStudents] = useState([]);
  const [tab, setTab] = useState('content'); // content | students

  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [lectureForms, setLectureForms] = useState({}); // sectionId -> {title, file, isPreview}
  const [quizForms, setQuizForms] = useState({}); // sectionId -> {title, questions[]}
  const [uploading, setUploading] = useState(null);

  const load = () => api.get(`/courses/${courseId}`).then((res) => setData(res.data));

  useEffect(() => {
    load();
    api.get(`/instructor/courses/${courseId}/students`).then((res) => setStudents(res.data.enrollments)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  if (!data) return <p className="mx-auto max-w-4xl px-4 py-16 text-gray-500">Loading…</p>;
  const { course, syllabus } = data;

  const addSection = async () => {
    if (!newSectionTitle.trim()) return;
    await api.post(`/courses/${courseId}/sections`, { title: newSectionTitle });
    setNewSectionTitle('');
    load();
  };

  const updateLectureForm = (sectionId, patch) =>
    setLectureForms((prev) => ({ ...prev, [sectionId]: { ...prev[sectionId], ...patch } }));

  const uploadLecture = async (sectionId) => {
    const form = lectureForms[sectionId];
    if (!form?.title || !form?.file) {
      toast.error('Add a title and choose a video file');
      return;
    }
    setUploading(sectionId);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('video', form.file);
      formData.append('isPreview', form.isPreview ? 'true' : 'false');
      await api.post(`/sections/${sectionId}/lectures`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Lecture uploaded');
      updateLectureForm(sectionId, { title: '', file: null, isPreview: false });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const updateQuizForm = (sectionId, patch) =>
    setQuizForms((prev) => ({ ...prev, [sectionId]: { ...(prev[sectionId] || { title: 'Section Quiz', questions: [] }), ...patch } }));

  const addQuestion = (sectionId) => {
    const current = quizForms[sectionId] || { title: 'Section Quiz', questions: [] };
    updateQuizForm(sectionId, {
      questions: [...current.questions, { question: '', options: ['', ''], correctOptionIndex: 0 }],
    });
  };

  const saveQuiz = async (sectionId) => {
    const form = quizForms[sectionId];
    if (!form || form.questions.length === 0) {
      toast.error('Add at least one question');
      return;
    }
    await api.post(`/sections/${sectionId}/quiz`, form);
    toast.success('Quiz saved');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">{course.title}</h1>
      <p className="mb-6 text-sm text-gray-500">
        Status: <span className="capitalize">{course.status}</span> {course.status === 'pending' && '(awaiting admin approval)'}
      </p>

      <div className="mb-6 flex gap-4 border-b border-gray-200 dark:border-gray-800">
        {['content', 'students'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 text-sm font-medium capitalize ${tab === t ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'content' && (
        <div className="space-y-6">
          {/* Add section */}
          <div className="flex gap-2">
            <input
              placeholder="New section title (e.g. 'Getting Started')"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            />
            <button onClick={addSection} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              Add section
            </button>
          </div>

          {syllabus.map((section) => (
            <div key={section._id} className="rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <h3 className="font-semibold">{section.title}</h3>

              <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {section.lectures.map((l) => (
                  <li key={l._id}>🎬 {l.title} {l.isPreview && <span className="text-xs text-brand-600">(preview)</span>}</li>
                ))}
                {section.lectures.length === 0 && <li className="text-gray-400">No lectures yet</li>}
              </ul>

              {/* Add lecture */}
              <div className="mt-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                <p className="mb-2 text-xs font-medium text-gray-500">Add a lecture (video)</p>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    placeholder="Lecture title"
                    value={lectureForms[section._id]?.title || ''}
                    onChange={(e) => updateLectureForm(section._id, { title: e.target.value })}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
                  />
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => updateLectureForm(section._id, { file: e.target.files[0] })}
                    className="text-sm"
                  />
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={lectureForms[section._id]?.isPreview || false}
                      onChange={(e) => updateLectureForm(section._id, { isPreview: e.target.checked })}
                    />
                    Free preview
                  </label>
                  <button
                    disabled={uploading === section._id}
                    onClick={() => uploadLecture(section._id)}
                    className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm text-white disabled:opacity-60 dark:bg-gray-100 dark:text-gray-900"
                  >
                    {uploading === section._id ? 'Uploading…' : 'Upload'}
                  </button>
                </div>
              </div>

              {/* Quiz builder */}
              <div className="mt-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                <p className="mb-2 text-xs font-medium text-gray-500">Section quiz (MCQ)</p>
                {(quizForms[section._id]?.questions || []).map((q, qi) => (
                  <div key={qi} className="mb-2 rounded-lg border border-gray-200 p-2 dark:border-gray-700">
                    <input
                      placeholder="Question"
                      value={q.question}
                      onChange={(e) => {
                        const questions = [...quizForms[section._id].questions];
                        questions[qi].question = e.target.value;
                        updateQuizForm(section._id, { questions });
                      }}
                      className="mb-1 w-full rounded-lg border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
                    />
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="mb-1 flex items-center gap-2">
                        <input
                          type="radio"
                          checked={q.correctOptionIndex === oi}
                          onChange={() => {
                            const questions = [...quizForms[section._id].questions];
                            questions[qi].correctOptionIndex = oi;
                            updateQuizForm(section._id, { questions });
                          }}
                        />
                        <input
                          placeholder={`Option ${oi + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const questions = [...quizForms[section._id].questions];
                            questions[qi].options[oi] = e.target.value;
                            updateQuizForm(section._id, { questions });
                          }}
                          className="flex-1 rounded-lg border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
                        />
                      </div>
                    ))}
                    <button
                      className="text-xs text-brand-600"
                      onClick={() => {
                        const questions = [...quizForms[section._id].questions];
                        questions[qi].options.push('');
                        updateQuizForm(section._id, { questions });
                      }}
                    >
                      + Add option
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <button onClick={() => addQuestion(section._id)} className="text-xs text-brand-600">
                    + Add question
                  </button>
                  <button onClick={() => saveQuiz(section._id)} className="text-xs font-medium text-green-600">
                    Save quiz
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'students' && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left dark:bg-gray-900">
              <tr>
                <th className="px-4 py-2">Student</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Progress</th>
              </tr>
            </thead>
            <tbody>
              {students.map((e) => (
                <tr key={e._id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-4 py-2">{e.student?.name}</td>
                  <td className="px-4 py-2">{e.student?.email}</td>
                  <td className="px-4 py-2">{e.progressPercent}%</td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-400">
                    No students enrolled yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageCourse;
