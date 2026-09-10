import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await signup(form);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Create your account</h1>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <input
          required
          placeholder="Full name"
          className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="email"
          required
          placeholder="Email"
          className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password (min 6 chars)"
          className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <div className="flex gap-3">
          {['student', 'instructor'].map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => setForm({ ...form, role: r })}
              className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium capitalize ${
                form.role === r
                  ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-500/10'
                  : 'border-gray-300 dark:border-gray-700'
              }`}
            >
              I'm a {r}
            </button>
          ))}
        </div>

        <button
          disabled={busy}
          className="rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-gray-400">
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
        OR
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={async (cred) => {
            try {
              await googleLogin(cred.credential);
              navigate('/');
            } catch {
              toast.error('Google signup failed');
            }
          }}
          onError={() => toast.error('Google signup failed')}
        />
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-600">
          Log in
        </Link>
      </p>
    </div>
  );
};

export default Signup;
