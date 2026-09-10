import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ReactPlayer from 'react-player';
import { ChevronDown, ChevronUp, PlayCircle, Lock } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [openSection, setOpenSection] = useState(0);
  const [busy, setBusy] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  const load = () => api.get(`/courses/${id}`).then((res) => setData(res.data));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!data) return <p className="mx-auto max-w-5xl px-4 py-16 text-gray-500">Loading…</p>;

  const { course, syllabus, reviews, isEnrolled } = data;
  const previewLecture = syllabus.flatMap((s) => s.lectures).find((l) => l.isPreview && l.videoUrl);

  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    setBusy(true);
    try {
      if (course.price > 0) {
        const { data: checkout } = await api.post(`/payments/checkout/${course._id}`);
        window.location.href = checkout.url; // redirect to Stripe Checkout
      } else {
        await api.post(`/enrollments/${course._id}`);
        toast.success('Enrolled! Head to My Learning to start.');
        load();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not enroll');
    } finally {
      setBusy(false);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/courses/${course._id}/reviews`, reviewForm);
      toast.success('Review submitted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-2 text-sm text-brand-600">{course.category?.name}</div>
      <h1 className="text-3xl font-bold">{course.title}</h1>
      <p className="mt-3 text-gray-600 dark:text-gray-400">{course.description}</p>
      <div className="mt-3 flex items-center gap-4 text-sm">
        <StarRating rating={course.rating} />
        <span className="text-gray-500">{course.numReviews} reviews</span>
        <span className="text-gray-500">{course.studentsCount} students</span>
        <span className="capitalize text-gray-500">{course.level}</span>
      </div>
      <p className="mt-2 text-sm text-gray-500">
        Instructor: <span className="font-medium text-gray-800 dark:text-gray-200">{course.instructor?.name}</span>
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Preview video */}
          <div className="mb-8 aspect-video overflow-hidden rounded-xl bg-black">
            {previewLecture ? (
              <ReactPlayer url={previewLecture.videoUrl} width="100%" height="100%" controls />
            ) : course.thumbnail ? (
              <img src={course.thumbnail} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">No preview available</div>
            )}
          </div>

          {/* Syllabus */}
          <h2 className="mb-3 text-xl font-bold">Syllabus</h2>
          <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
            {syllabus.map((section, i) => (
              <div key={section._id}>
                <button
                  onClick={() => setOpenSection(openSection === i ? -1 : i)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left font-medium"
                >
                  <span>
                    {i + 1}. {section.title} <span className="text-sm font-normal text-gray-500">({section.lectures.length} lectures)</span>
                  </span>
                  {openSection === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {openSection === i && (
                  <div className="space-y-1 px-4 pb-4">
                    {section.lectures.map((l) => (
                      <div key={l._id} className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900">
                        <span className="flex items-center gap-2">
                          {l.videoUrl ? <PlayCircle size={16} className="text-brand-600" /> : <Lock size={16} className="text-gray-400" />}
                          {l.title}
                          {l.isPreview && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-500/10">Preview</span>}
                        </span>
                        <span className="text-gray-400">{Math.round(l.duration / 60)}m</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Reviews */}
          <h2 className="mb-3 mt-10 text-xl font-bold">Reviews</h2>
          {isEnrolled && (
            <form onSubmit={submitReview} className="mb-6 rounded-xl border border-gray-200 p-4 dark:border-gray-800">
              <div className="mb-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} onClick={() => setReviewForm({ ...reviewForm, rating: n })}>
                    <StarRating rating={n <= reviewForm.rating ? n : 0} showNumber={false} size={20} />
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Share your thoughts on this course…"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                rows={3}
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              />
              <button className="mt-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
                Submit review
              </button>
            </form>
          )}
          <div className="space-y-4">
            {reviews.length === 0 && <p className="text-sm text-gray-500">No reviews yet.</p>}
            {reviews.map((r) => (
              <div key={r._id} className="border-b border-gray-100 pb-3 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{r.student?.name}</span>
                  <StarRating rating={r.rating} showNumber={false} size={13} />
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{r.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Purchase card */}
        <div className="h-fit rounded-xl border border-gray-200 p-5 dark:border-gray-800">
          <div className="mb-4 text-3xl font-bold">{course.price > 0 ? `$${course.price.toFixed(2)}` : 'Free'}</div>
          {isEnrolled ? (
            <button
              onClick={() => navigate(`/learn/${course._id}`)}
              className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700"
            >
              Go to course
            </button>
          ) : (
            <button
              disabled={busy}
              onClick={handleEnroll}
              className="w-full rounded-lg bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {busy ? 'Processing…' : course.price > 0 ? 'Buy now' : 'Enroll for free'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
