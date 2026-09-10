import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ReactPlayer from 'react-player';
import toast from 'react-hot-toast';
import { CheckCircle, Circle, Bookmark, StickyNote } from 'lucide-react';
import api from '../../api/axios';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const [data, setData] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeLecture, setActiveLecture] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [tab, setTab] = useState('notes'); // notes | bookmarks | quiz
  const [noteText, setNoteText] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const playerRef = useRef(null);

  const loadCourse = async () => {
    const { data: res } = await api.get(`/courses/${courseId}`);
    setData(res);
    if (!activeLecture) {
      const firstLecture = res.syllabus.flatMap((s) => s.lectures)[0];
      setActiveLecture(firstLecture);
      setActiveSection(res.syllabus[0]);
    }
  };

  const loadEnrollment = async () => {
    const { data: res } = await api.get('/enrollments/my-learning');
    setEnrollment(res.enrollments.find((e) => e.course._id === courseId));
  };

  useEffect(() => {
    loadCourse();
    loadEnrollment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  useEffect(() => {
    setQuiz(null);
    setQuizResult(null);
    setQuizAnswers({});
    if (activeSection) {
      api
        .get(`/sections/${activeSection._id}/quiz`)
        .then((res) => setQuiz(res.data.quiz))
        .catch(() => setQuiz(null));
    }
  }, [activeSection]);

  if (!data) return <p className="px-4 py-16 text-center text-gray-500">Loading…</p>;
  const { course, syllabus } = data;

  const isCompleted = (lectureId) => enrollment?.completedLectures?.includes(lectureId);

  const markComplete = async () => {
    if (!activeLecture) return;
    const { data: res } = await api.put(`/enrollments/${courseId}/complete/${activeLecture._id}`);
    setEnrollment(res.enrollment);
    if (res.enrollment.progressPercent >= 100) toast.success('🎉 Course complete! Certificate generated.');
    else toast.success('Marked as complete');
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    const timestamp = playerRef.current ? Math.floor(playerRef.current.getCurrentTime()) : 0;
    const { data: res } = await api.post(`/enrollments/${courseId}/notes`, {
      lectureId: activeLecture._id,
      timestamp,
      text: noteText,
    });
    setEnrollment((prev) => ({ ...prev, notes: res.notes }));
    setNoteText('');
  };

  const addBookmark = async () => {
    const timestamp = playerRef.current ? Math.floor(playerRef.current.getCurrentTime()) : 0;
    const { data: res } = await api.post(`/enrollments/${courseId}/bookmarks`, {
      lectureId: activeLecture._id,
      timestamp,
      label: `Bookmark @ ${timestamp}s`,
    });
    setEnrollment((prev) => ({ ...prev, bookmarks: res.bookmarks }));
    toast.success('Bookmarked');
  };

  const submitQuiz = async () => {
    const answers = Object.entries(quizAnswers).map(([questionId, selectedIndex]) => ({ questionId, selectedIndex }));
    const { data: res } = await api.post(`/sections/${activeSection._id}/quiz/submit`, { answers });
    setQuizResult(res);
  };

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="aspect-video overflow-hidden rounded-xl bg-black">
          {activeLecture?.videoUrl ? (
            <ReactPlayer ref={playerRef} url={activeLecture.videoUrl} width="100%" height="100%" controls />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">Select a lecture</div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">{activeLecture?.title}</h1>
          <button
            onClick={markComplete}
            className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            {isCompleted(activeLecture?._id) ? <CheckCircle size={16} /> : <Circle size={16} />}
            {isCompleted(activeLecture?._id) ? 'Completed' : 'Mark as complete'}
          </button>
        </div>

        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div className="h-full bg-brand-600" style={{ width: `${enrollment?.progressPercent || 0}%` }} />
        </div>
        <p className="mt-1 text-xs text-gray-500">{enrollment?.progressPercent || 0}% complete</p>

        {enrollment?.certificateIssued && (
          <a
            href={`/api${enrollment.certificateUrl.replace('/api', '')}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            🎓 Download your certificate
          </a>
        )}

        {/* Tabs: notes / bookmarks / quiz */}
        <div className="mt-8">
          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800">
            {['notes', 'bookmarks', 'quiz'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-2 text-sm font-medium capitalize ${tab === t ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-500'}`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'notes' && (
            <div className="mt-4">
              <div className="flex gap-2">
                <input
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Take a note at the current timestamp…"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                />
                <button onClick={addNote} className="rounded-lg bg-gray-900 px-3 py-2 text-sm text-white dark:bg-gray-100 dark:text-gray-900">
                  <StickyNote size={16} />
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {enrollment?.notes?.filter((n) => n.lecture === activeLecture?._id).map((n, i) => (
                  <div key={i} className="rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-900">
                    <span className="mr-2 font-mono text-xs text-brand-600">{n.timestamp}s</span>
                    {n.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'bookmarks' && (
            <div className="mt-4">
              <button onClick={addBookmark} className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-sm text-white dark:bg-gray-100 dark:text-gray-900">
                <Bookmark size={16} /> Bookmark this moment
              </button>
              <div className="mt-3 space-y-2">
                {enrollment?.bookmarks?.filter((b) => b.lecture === activeLecture?._id).map((b, i) => (
                  <div key={i} className="rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-900">{b.label}</div>
                ))}
              </div>
            </div>
          )}

          {tab === 'quiz' && (
            <div className="mt-4">
              {!quiz ? (
                <p className="text-sm text-gray-500">No quiz for this section.</p>
              ) : quizResult ? (
                <p className="font-medium">
                  You scored {quizResult.score} / {quizResult.total}
                </p>
              ) : (
                <div className="space-y-4">
                  {quiz.questions.map((q) => (
                    <div key={q._id}>
                      <p className="font-medium">{q.question}</p>
                      <div className="mt-1 space-y-1">
                        {q.options.map((opt, i) => (
                          <label key={i} className="flex items-center gap-2 text-sm">
                            <input
                              type="radio"
                              name={q._id}
                              onChange={() => setQuizAnswers({ ...quizAnswers, [q._id]: i })}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={submitQuiz} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                    Submit quiz
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Syllabus sidebar */}
      <div className="h-fit rounded-xl border border-gray-200 dark:border-gray-800">
        <h2 className="border-b border-gray-200 px-4 py-3 font-semibold dark:border-gray-800">{course.title}</h2>
        <div className="max-h-[70vh] overflow-y-auto">
          {syllabus.map((section) => (
            <div key={section._id}>
              <div className="bg-gray-50 px-4 py-2 text-sm font-semibold dark:bg-gray-900">{section.title}</div>
              {section.lectures.map((l) => (
                <button
                  key={l._id}
                  onClick={() => {
                    setActiveLecture(l);
                    setActiveSection(section);
                  }}
                  className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-900 ${
                    activeLecture?._id === l._id ? 'bg-brand-50 dark:bg-brand-500/10' : ''
                  }`}
                >
                  {isCompleted(l._id) ? (
                    <CheckCircle size={15} className="text-green-600" />
                  ) : (
                    <Circle size={15} className="text-gray-300" />
                  )}
                  <span className="line-clamp-1">{l.title}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
