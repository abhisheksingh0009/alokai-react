import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SfButton, SfInput, SfIconPerson, SfIconLock, SfIconEmail } from '@storefront-ui/react';
import { useAuth } from '../../context/AuthContext';

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupForm() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = 'Full name is required.';
    if (!form.email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Enter a valid email address.';
    }
    if (!form.password) {
      errs.password = 'Password is required.';
    } else if (form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters.';
    }
    if (!form.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password.';
    } else if (form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    return errs;
  }

  function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    signup(form.name.trim(), form.email.trim(), form.password);
    navigate('/account');
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full sm:w-1/2 bg-white rounded-2xl shadow-lg border border-neutral-100 p-8">

        {/* Header */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
            <SfIconPerson size="lg" className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900">Create account</h1>
          
        </div>

        {/* Form */}
        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>

          {/* Full name */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label htmlFor="name" className="w-full sm:w-40 sm:shrink-0 text-sm font-medium text-neutral-700 text-left">Full name</label>
            <div className="flex flex-col gap-1 flex-1">
              <SfInput
                id="name"
                type="text"
                placeholder="Jane Doe"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                invalid={!!errors.name}
                slotPrefix={<SfIconPerson size="sm" className="text-neutral-400" />}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label htmlFor="email" className="w-full sm:w-40 sm:shrink-0 text-sm font-medium text-neutral-700 text-left">Email address</label>
            <div className="flex flex-col gap-1 flex-1">
              <SfInput
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                invalid={!!errors.email}
                slotPrefix={<SfIconEmail size="sm" className="text-neutral-400" />}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label htmlFor="password" className="w-full sm:w-40 sm:shrink-0 text-sm font-medium text-neutral-700 text-left">Password</label>
            <div className="flex flex-col gap-1 flex-1">
              <SfInput
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                invalid={!!errors.password}
                slotPrefix={<SfIconLock size="sm" className="text-neutral-400" />}
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>
          </div>

          {/* Confirm password */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label htmlFor="confirmPassword" className="w-full sm:w-40 sm:shrink-0 text-sm font-medium text-neutral-700 text-left">Confirm password</label>
            <div className="flex flex-col gap-1 flex-1">
              <SfInput
                id="confirmPassword"
                type="password"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                invalid={!!errors.confirmPassword}
                slotPrefix={<SfIconLock size="sm" className="text-neutral-400" />}
              />
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Actions — offset to align with inputs */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="hidden sm:block sm:w-40 sm:shrink-0" />
            <div className="flex gap-3 flex-1">
              <SfButton type="submit" className="flex-1" variant="primary">
                Create account
              </SfButton>
              <SfButton
                type="reset"
                variant="secondary"
                className="flex-1"
                onClick={() => { setForm({ name: '', email: '', password: '', confirmPassword: '' }); setErrors({}); }}
              >
                Reset
              </SfButton>
            </div>
          </div>
        </form>

        {/* Footer link */}
        <p className="text-center text-sm text-neutral-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-700 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
