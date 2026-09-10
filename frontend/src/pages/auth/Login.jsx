import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">Log in to LearnHub</h1>

      <form onSubmit={submit} className="flex flex-col gap-4">
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
          placeholder="Password"
          className="rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button
          disabled={busy}
          className="rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? 'Logging in…' : 'Log in'}
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
              toast.error('Google login failed');
            }
          }}
          onError={() => toast.error('Google login failed')}
        />
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        No account?{' '}
        <Link to="/signup" className="font-medium text-brand-600">
          Sign up
        </Link>
      </p>
    </div>
  );
};

export default Login;
