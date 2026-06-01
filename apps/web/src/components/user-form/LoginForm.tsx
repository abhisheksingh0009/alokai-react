import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import { SfButton } from '@storefront-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, resetPasswordSchema, type LoginFormData, type ResetPasswordFormData } from '../../utils/validation';
import { middlewareUrl } from '../../middleware/api/config';

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { from?: string; openReviewModal?: boolean } | null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors, isSubmitting: isResetting },
    reset: resetFormReset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const [view, setView] = useState<'login' | 'forgot'>('login');
  const [loginError, setLoginError] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  async function onLoginSubmit(data: LoginFormData) {
    setLoginError('');
    try {
      await login(data.email, data.password);
      const destination = locationState?.from ?? '/account';
      navigate(destination, {
        replace: true,
        state: locationState?.openReviewModal ? { openReviewModal: true } : undefined,
      });
    } catch {
      setLoginError('Invalid credentials. Please try again.');
    }
  }

  async function onResetSubmit(data: ResetPasswordFormData) {
    setResetError('');
    setResetSuccess('');
    try {
      const res = await fetch(`${middlewareUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, newPassword: data.newPassword }),
      });
      const resData = await res.json();
      if (!res.ok) {
        setResetError(resData.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setResetSuccess('Password changed successfully! Redirecting to login…');
      setTimeout(() => {
        setView('login');
        resetFormReset();
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
          <form className="w-full flex flex-col gap-4" onSubmit={handleResetSubmit(onResetSubmit)}>
            <div className="flex flex-col gap-1">
              <label htmlFor="reset-email" className="text-sm font-medium text-neutral-700">Email address</label>
              <input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                {...registerReset('email')}
                className={`border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${resetErrors.email ? 'border-red-400' : 'border-neutral-300'}`}
              />
              {resetErrors.email && <p className="text-xs text-red-500 mt-1">{resetErrors.email.message}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="new-password" className="text-sm font-medium text-neutral-700">Choose password</label>
              <input
                id="new-password"
                type="password"
                placeholder="••••••••"
                {...registerReset('newPassword')}
                className={`border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${resetErrors.newPassword ? 'border-red-400' : 'border-neutral-300'}`}
              />
              {resetErrors.newPassword && <p className="text-xs text-red-500 mt-1">{resetErrors.newPassword.message}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="confirm-password" className="text-sm font-medium text-neutral-700">Confirm password</label>
              <input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                {...registerReset('confirmPassword')}
                className={`border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${resetErrors.confirmPassword ? 'border-red-400' : 'border-neutral-300'}`}
              />
              {resetErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">{resetErrors.confirmPassword.message}</p>}
            </div>
            {resetError && <p className="text-xs text-red-500 text-center">{resetError}</p>}
            {resetSuccess && <p className="text-xs text-green-600 text-center">{resetSuccess}</p>}
            <div className="flex gap-3 mt-2">
              <SfButton
                type="submit"
                disabled={isResetting}
                className="flex-1 bg-primary-700 text-white font-semibold rounded-lg py-2 text-sm hover:bg-primary-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isResetting ? 'Changing…' : 'Change Password'}
              </SfButton>
              <button
                type="button"
                onClick={() => { setView('login'); resetFormReset(); setResetSuccess(''); setResetError(''); setLoginError(''); }}
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
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit(onLoginSubmit)}>
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-neutral-700">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              className={`border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.email ? 'border-red-400' : 'border-neutral-300'}`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-neutral-700">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={`border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${errors.password ? 'border-red-400' : 'border-neutral-300'}`}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>
          {loginError && <p className="text-xs text-red-500 text-center">{loginError}</p>}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => { setView('forgot'); setLoginError(''); setResetError(''); }}
              className="text-xs text-primary-700 hover:underline font-medium"
            >
              Forgot password?
            </button>
          </div>
          <div className="flex gap-3">
            <SfButton
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary-700 text-white font-semibold rounded-lg py-2 text-sm hover:bg-primary-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Signing in…' : 'Login'}
            </SfButton>
            <button
              type="button"
              onClick={() => reset()}
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