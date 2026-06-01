import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, type SignupPayload } from '../../context/AuthContext';
import { SfIconVisibility, SfIconVisibilityOff } from '@storefront-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupFormData } from '../../utils/validation';

const TITLES = ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Prof'];

const COUNTRY_CODES = [
  { flag: '🇺🇸', code: '+1',  label: 'US' },
  { flag: '🇬🇧', code: '+44', label: 'GB' },
  { flag: '🇮🇳', code: '+91', label: 'IN' },
  { flag: '🇦🇺', code: '+61', label: 'AU' },
  { flag: '🇨🇦', code: '+1',  label: 'CA' },
  { flag: '🇩🇪', code: '+49', label: 'DE' },
  { flag: '🇫🇷', code: '+33', label: 'FR' },
  { flag: '🇸🇬', code: '+65', label: 'SG' },
  { flag: '🇦🇪', code: '+971',label: 'AE' },
];

export default function SignupForm() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      countryCode: '+1',
    },
  });

  const [serverError, setServerError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function onSubmit(data: SignupFormData) {
    setServerError('');

    const payload: SignupPayload = {
      title: data.title || undefined,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      phone: data.phone ? `${data.countryCode} ${data.phone.trim()}` : undefined,
      dateOfBirth: data.dateOfBirth || undefined,
    };

    try {
      await signup(payload);
      navigate('/account');
    } catch (err: unknown) {
      setServerError((err as Error).message ?? 'Signup failed');
    }
  }

  const inputBase = 'w-full px-4 py-2.5 rounded-lg text-sm outline-none border transition-colors focus:border-slate-700';
  const errStyle  = 'border-red-400 bg-red-50';
  const okStyle   = 'border-gray-300 bg-white';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 p-8">

        {/* Header */}
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in the details below to register</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              className={`${inputBase} ${errors.email ? errStyle : okStyle}`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone number <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="flex gap-2">
              <select
                {...register('countryCode')}
                className="border border-gray-300 rounded-lg px-2 py-2.5 text-sm bg-white outline-none focus:border-slate-700 shrink-0"
              >
                {COUNTRY_CODES.map(c => (
                  <option key={`${c.flag}${c.code}`} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                placeholder="Phone number"
                {...register('phone')}
                className={`${inputBase} ${errors.phone ? errStyle : okStyle}`}
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>

          <hr className="border-gray-100" />

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <select
              {...register('title')}
              className={`${inputBase} ${errors.title ? errStyle : okStyle}`}
            >
              <option value="">Select title</option>
              {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          {/* First name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="First name"
              {...register('firstName')}
              className={`${inputBase} ${errors.firstName ? errStyle : okStyle}`}
            />
            {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName.message}</p>}
          </div>

          {/* Last name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Last name"
              {...register('lastName')}
              className={`${inputBase} ${errors.lastName ? errStyle : okStyle}`}
            />
            {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName.message}</p>}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="date"
              {...register('dateOfBirth')}
              max={new Date().toISOString().split('T')[0]}
              className={`${inputBase} ${okStyle}`}
            />
          </div>

          <hr className="border-gray-100" />

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                {...register('password')}
                className={`${inputBase} pr-10 ${errors.password ? errStyle : okStyle}`}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <SfIconVisibilityOff /> : <SfIconVisibility />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Repeat the password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter your password"
                {...register('confirmPassword')}
                className={`${inputBase} pr-10 ${errors.confirmPassword ? errStyle : okStyle}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <SfIconVisibilityOff /> : <SfIconVisibility />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>}
          </div>

          {serverError && (
            <p className="text-xs text-red-500 text-center bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: '#1B3A6B' }}
          >
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold hover:underline" style={{ color: '#1B3A6B' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
