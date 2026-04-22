import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { SfButton } from '@storefront-ui/react';

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { from?: string; openReviewModal?: boolean } | null;

  const [enteredValue, setEnteredValue] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [resetForm, setResetForm] = useState({ email: '', newPassword: '', confirmPassword: '' });
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  function handleInputValue(identifier: string, value: string) {
    setEnteredValue(prev => ({ ...prev, [identifier]: value }));
  }

  function handleResetInput(identifier: string, value: string) {
    setResetForm(prev => ({ ...prev, [identifier]: value }));
  }

  async function handleForm(event: any) {
    event.preventDefault();
    setError('');
    if (!enteredValue.email || !enteredValue.password) {
      setError('Email and password are required.');
      return;
    }
    try {
      await login(enteredValue.email, enteredValue.password);
      const destination = locationState?.from ?? '/account';
      navigate(destination, {
        replace: true,
        state: locationState?.openReviewModal ? { openReviewModal: true } : undefined,
      });
    } catch (err: any) {
      setError('Invalid credentials. Please try again.');
    }
  }

  async function handleResetPassword(event: any) {
    event.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!resetForm.email || !resetForm.newPassword || !resetForm.confirmPassword) {
      setResetError('All fields are required.');
      return;
    }
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }
    if (resetForm.newPassword.length < 8) {
      setResetError('Password must be at least 8 characters.');
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetForm.email, newPassword: resetForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResetError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setResetSuccess('Password changed successfully! Redirecting to login…');
      setTimeout(() => {
        setView('login');
        setResetForm({ email: '', newPassword: '', confirmPassword: '' });
        setResetSuccess('');
      }, 2000);
    } catch {
      setResetError('Network error. Please try again.');
    }
  }

  const shieldIcon = (
    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center shadow-md">
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 4L6 10v10c0 8.284 5.952 16.032 14 18 8.048-1.968 14-9.716 14-18V10L20 4z" fill="#1B3A6B" fillOpacity="0.15" stroke="#1B3A6B" strokeWidth="2" strokeLinejoin="round"/>
        <rect x="14" y="20" width="12" height="9" rx="2" fill="#1B3A6B"/>
        <path d="M15.5 20v-3a4.5 4.5 0 0 1 9 0v3" stroke="#1B3A6B" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="20" cy="24.5" r="1.5" fill="white"/>
        <rect x="19.25" y="24.5" width="1.5" height="2.5" rx="0.75" fill="white"/>
      </svg>
    </div>
  );

  if (view === 'forgot') {
    return (
      <div className="py-4 flex items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-neutral-100 p-8 flex flex-col items-center gap-6">
          {shieldIcon}
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-neutral-900">Reset Password</h1>
            <p className="text-sm text-neutral-500 mt-1">Enter your details to set a new password</p>
          </div>
          <form className="w-full flex flex-col gap-4" onSubmit={handleResetPassword}>
            <div className="flex flex-col gap-1">
              <label htmlFor="reset-email" className="text-sm font-medium text-neutral-700">Email address</label>
              <input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={resetForm.email}
                onChange={e => handleResetInput('email', e.target.value)}
                className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 border-neutral-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="new-password" className="text-sm font-medium text-neutral-700">Choose password</label>
              <input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={resetForm.newPassword}
                onChange={e => handleResetInput('newPassword', e.target.value)}
                className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 border-neutral-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="confirm-password" className="text-sm font-medium text-neutral-700">Confirm password</label>
              <input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={resetForm.confirmPassword}
                onChange={e => handleResetInput('confirmPassword', e.target.value)}
                className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 border-neutral-300"
              />
            </div>
            {resetError && <p className="text-xs text-red-500 text-center">{resetError}</p>}
            {resetSuccess && <p className="text-xs text-green-600 text-center">{resetSuccess}</p>}
            <div className="flex gap-3 mt-2">
              <SfButton
                type="submit"
                className="flex-1 bg-primary-700 text-white font-semibold rounded-lg py-2 text-sm hover:bg-primary-800 transition-colors"
              >
                Change Password
              </SfButton>
              <button
                type="button"
                onClick={() => { setView('login'); setResetError(''); setResetSuccess(''); }}
                className="flex-1 border border-neutral-300 text-neutral-700 font-semibold rounded-lg py-2 text-sm hover:bg-neutral-50 transition-colors"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-neutral-100 p-8 flex flex-col items-center gap-6">
        {shieldIcon}
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-neutral-900">Welcome</h1>
          <p className="text-sm text-neutral-500 mt-1">Sign in to your ALOKAI-MART account</p>
        </div>
        <form className="w-full flex flex-col gap-4" onSubmit={handleForm}>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-neutral-700">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={enteredValue.email}
              onChange={e => handleInputValue('email', e.target.value)}
              className={`border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${error ? 'border-red-400' : 'border-neutral-300'}`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-neutral-700">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={enteredValue.password}
              onChange={e => handleInputValue('password', e.target.value)}
              className={`border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${error ? 'border-red-400' : 'border-neutral-300'}`}
            />
          </div>
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => { setView('forgot'); setError(''); }}
              className="text-xs text-primary-700 hover:underline font-medium"
            >
              Forgot password?
            </button>
          </div>
          <div className="flex gap-3">
            <SfButton
              type="submit"
              className="flex-1 bg-primary-700 text-white font-semibold rounded-lg py-2 text-sm hover:bg-primary-800 transition-colors"
            >
              Login
            </SfButton>
            <button
              type="reset"
              className="flex-1 border border-neutral-300 text-neutral-700 font-semibold rounded-lg py-2 text-sm hover:bg-neutral-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}