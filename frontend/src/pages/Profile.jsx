import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || '');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('bio', bio);
      if (file) formData.append('avatar', file);
      const { data } = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Profile</h1>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl text-brand-700">
              {user.name[0]}
            </div>
          )}
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
        </div>
        <label className="text-sm font-medium">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-900"
        />
        <label className="text-sm font-medium">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={4}
          className="rounded-lg border border-gray-300 px-4 py-2.5 dark:border-gray-700 dark:bg-gray-900"
        />
        <p className="text-sm text-gray-500">
          Email: {user.email} &middot; Role: <span className="capitalize">{user.role}</span>
        </p>
        <button
          disabled={busy}
          className="rounded-lg bg-brand-600 py-2.5 font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
