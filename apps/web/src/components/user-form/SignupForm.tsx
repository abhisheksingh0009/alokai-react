import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, type SignupPayload } from '../../context/AuthContext';
import { SfIconVisibility, SfIconVisibilityOff } from '@storefront-ui/react';

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

interface FormState {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  title?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupForm() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    title: '', firstName: '', lastName: '', email: '',
    countryCode: '+1', phone: '', dateOfBirth: '',
    password: '', confirmPassword: '',
  });
  const [errors, setErrors]         = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function set(field: keyof FormState, value: string | boolean) {
    setForm(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: undefined }));
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.title)          e.title     = 'Please select a title.';
    if (!form.firstName.trim()) e.firstName = 'First name is required.';
    if (!form.lastName.trim())  e.lastName  = 'Last name is required.';
    if (!form.email.trim()) {
      e.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(form.email)) {
      e.email = 'Enter a valid email address.';
    }
    if (!form.password) {
      e.password = 'Password is required.';
    } else if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters.';
    }
    if (!form.confirmPassword) {
      e.confirmPassword = 'Please confirm your password.';
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = 'Passwords do not match.';
    }
    if (form.phone) {
      const digits = form.phone.replace(/[\s\-().]/g, '');
      if (!/^\d+$/.test(digits) || digits.length < 7 || digits.length > 15) {
        e.phone = 'Enter a valid phone number (7–15 digits).';
      }
    }
    return e;
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const payload: SignupPayload = {
      title:           form.title || undefined,
      firstName:       form.firstName.trim(),
      lastName:        form.lastName.trim(),
      email:           form.email.trim(),
      password:        form.password,
      phone:           form.phone ? `${form.countryCode} ${form.phone.trim()}` : undefined,
      dateOfBirth:     form.dateOfBirth || undefined,
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

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              className={`${inputBase} ${errors.email ? errStyle : okStyle}`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone number <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="flex gap-2">
              <select
                value={form.countryCode}
                onChange={e => set('countryCode', e.target.value)}
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
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                className={`${inputBase} ${errors.phone ? errStyle : okStyle}`}
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          <hr className="border-gray-100" />

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <select
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className={`${inputBase} ${errors.title ? errStyle : okStyle}`}
            >
              <option value="">Select title</option>
              {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* First name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="First name"
              value={form.firstName}
              onChange={e => set('firstName', e.target.value)}
              className={`${inputBase} ${errors.firstName ? errStyle : okStyle}`}
            />
            {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
          </div>

          {/* Last name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Last name"
              value={form.lastName}
              onChange={e => set('lastName', e.target.value)}
              className={`${inputBase} ${errors.lastName ? errStyle : okStyle}`}
            />
            {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={e => set('dateOfBirth', e.target.value)}
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
                value={form.password}
                onChange={e => set('password', e.target.value)}
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
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
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
                value={form.confirmPassword}
                onChange={e => set('confirmPassword', e.target.value)}
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
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
          </div>

          {serverError && (
            <p className="text-xs text-red-500 text-center bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
            style={{ background: '#1B3A6B' }}
          >
            Create Account
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
