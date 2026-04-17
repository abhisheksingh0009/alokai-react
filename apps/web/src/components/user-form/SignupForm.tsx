import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SfButton, SfInput, SfIconPerson, SfIconLock, SfIconEmail } from '@storefront-ui/react';
import { useAuth } from '../../context/AuthContext';

interface FormState {
  username: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  username?: string;
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupForm() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({ username: '', name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState('');

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!form.username.trim()) errs.username = 'Username is required.';
    if (!form.name.trim()) errs.name = 'Full name is required.';
    if (!form.email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Enter a valid email address.';
    }
    if (!form.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (!/^\+?[\d\s\-]{7,15}$/.test(form.phone)) {
      errs.phone = 'Enter a valid phone number.';
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

  async function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    try {
      await signup(form.username.trim(), form.name.trim(), form.email.trim(), form.password, form.phone.trim());
      navigate('/account');
    } catch (err: any) {
      setServerError(err.message ?? 'Signup failed');
    }
  }

  const field = (id: keyof FormState, label: string, type: string, placeholder: string, icon: React.ReactNode) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <label htmlFor={id} className="w-full sm:w-40 sm:shrink-0 text-sm font-medium text-neutral-700 text-left">{label}</label>
      <div className="flex flex-col gap-1 flex-1">
        <SfInput
          id={id}
          type={type}
          placeholder={placeholder}
          value={form[id]}
          onChange={(e) => handleChange(id, e.target.value)}
          invalid={!!errors[id]}
          slotPrefix={icon}
        />
        {errors[id] && <p className="text-xs text-red-500">{errors[id]}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full sm:w-1/2 bg-white rounded-2xl shadow-lg border border-neutral-100 p-8">

        <div className="flex flex-col items-center mb-7">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
            <SfIconPerson size="lg" className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-900">Create account</h1>
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          {field('username', 'Username',    'text',     '@johndoe',         <SfIconPerson size="sm" className="text-neutral-400" />)}
          {field('name',     'Full name',   'text',     'Jane Doe',         <SfIconPerson size="sm" className="text-neutral-400" />)}
          {field('email',    'Email',       'email',    'you@example.com',  <SfIconEmail  size="sm" className="text-neutral-400" />)}
          {field('phone',    'Phone number','tel',      '+1 234 567 8900',  <SfIconPerson size="sm" className="text-neutral-400" />)}
          {field('password', 'Password',   'password', 'Min. 8 characters',<SfIconLock   size="sm" className="text-neutral-400" />)}
          {field('confirmPassword', 'Confirm password', 'password', 'Re-enter your password', <SfIconLock size="sm" className="text-neutral-400" />)}

          {serverError && <p className="text-xs text-red-500 text-center">{serverError}</p>}

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <div className="hidden sm:block sm:w-40 sm:shrink-0" />
            <div className="flex gap-3 flex-1">
              <SfButton type="submit" className="flex-1" variant="primary">Create account</SfButton>
              <SfButton type="reset" variant="secondary" className="flex-1"
                onClick={() => { setForm({ username: '', name: '', email: '', phone: '', password: '', confirmPassword: '' }); setErrors({}); setServerError(''); }}>
                Reset
              </SfButton>
            </div>
          </div>
        </form>

        <p className="text-center text-sm text-neutral-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-700 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
