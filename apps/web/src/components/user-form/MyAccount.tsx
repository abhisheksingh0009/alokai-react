import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const TITLES = ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Prof'];

interface FormState {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface FormErrors {
  title?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

function ReadField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-left" style={{ color: '#6B7280' }}>
        {label}
      </label>
      <div
        className="px-4 py-2.5 rounded-xl text-sm font-medium text-left"
        style={{ background: '#F8F9FB', color: value ? '#111827' : '#9CA3AF', border: '1px solid #E2E8F0' }}
      >
        {value || '—'}
      </div>
    </div>
  );
}

export default function MyAccount() {
  const { user, updateProfile } = useAuth();

  const [showModal, setShowModal]     = useState(false);
  const [serverError, setServerError] = useState('');
  const [draft, setDraft]             = useState<FormState>({
    title:     user?.title     ?? '',
    firstName: user?.firstName ?? '',
    lastName:  user?.lastName  ?? '',
    email:     user?.email     ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  if (!user) return null;

  function openModal() {
    setDraft({ title: user!.title ?? '', firstName: user!.firstName ?? '', lastName: user!.lastName ?? '', email: user!.email ?? '' });
    setErrors({});
    setServerError('');
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setErrors({});
  }

  function setField(field: keyof FormState, value: string) {
    setDraft(p => ({ ...p, [field]: value }));
    setErrors(p => ({ ...p, [field]: undefined }));
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!draft.title)            e.title     = 'Please select a title.';
    if (!draft.firstName.trim()) e.firstName = 'First name is required.';
    if (!draft.lastName.trim())  e.lastName  = 'Last name is required.';
    if (!draft.email.trim()) {
      e.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) {
      e.email = 'Enter a valid email address.';
    }
    return e;
  }

  async function handleSave(e: { preventDefault(): void }) {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    try {
      await updateProfile({
        title:     draft.title     || undefined,
        firstName: draft.firstName.trim(),
        lastName:  draft.lastName.trim(),
        email:     draft.email.trim(),
      });
      setShowModal(false);
    } catch (err: unknown) {
      setServerError((err as Error).message ?? 'Update failed');
    }
  }

  const inputBase = 'w-full px-4 py-2.5 rounded-xl text-sm text-left outline-none border transition-colors focus:border-slate-700';
  const errStyle  = 'border-red-400 bg-red-50';
  const okStyle   = 'border-gray-200 bg-white';

  return (
    <>
      <div className="flex flex-col gap-6">

        {/* Personal info */}
        <div>
          <div className="flex items-center justify-between mb-4 relative">
            <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1B3A6B' }}>
              Personal Information
            </h3>
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 absolute -top-[72px] sm:-top-[88px]"
              style={{ background: 'linear-gradient(135deg, #0E4CF3 0%, #5C2EE6 100%)', right: 0 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32l8.4-8.4z" />
                <path d="M5.25 5.25a3 3 0 00-3 3v10.5a3 3 0 003 3h10.5a3 3 0 003-3V13.5a.75.75 0 00-1.5 0v5.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5V8.25a1.5 1.5 0 011.5-1.5h5.25a.75.75 0 000-1.5H5.25z" />
              </svg>
              Edit Profile
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ReadField label="Title"      value={user.title} />
            <ReadField label="First Name" value={user.firstName} />
            <ReadField label="Last Name"  value={user.lastName} />
          </div>
        </div>

        <div style={{ borderTop: '1px solid #E2E8F0' }} />

        {/* Contact info */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#1B3A6B' }}>
            Contact Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ReadField label="Email Address" value={user.email} />
          </div>
        </div>

        <div style={{ borderTop: '1px solid #E2E8F0' }} />

        {/* Account info — always read-only */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#1B3A6B' }}>
            Account
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ReadField label="Account ID" value={`#${user.id}`} />
          </div>
        </div>

      </div>

      {/* Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="w-full max-w-md h-full bg-white shadow-xl flex flex-col overflow-y-auto p-8">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold" style={{ color: '#1B3A6B' }}>Edit Personal Information</h2>
              {/* <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button> */}
            </div>

            <form onSubmit={handleSave} noValidate className="flex flex-col gap-4">

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-left" style={{ color: '#6B7280' }}>
                  Title <span className="text-red-500">*</span>
                </label>
                <select
                  value={draft.title}
                  onChange={e => setField('title', e.target.value)}
                  className={`${inputBase} ${errors.title ? errStyle : okStyle}`}
                >
                  <option value="">Select title</option>
                  {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-left" style={{ color: '#6B7280' }}>
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="First name"
                  value={draft.firstName}
                  onChange={e => setField('firstName', e.target.value)}
                  className={`${inputBase} ${errors.firstName ? errStyle : okStyle}`}
                />
                {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-left" style={{ color: '#6B7280' }}>
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Last name"
                  value={draft.lastName}
                  onChange={e => setField('lastName', e.target.value)}
                  className={`${inputBase} ${errors.lastName ? errStyle : okStyle}`}
                />
                {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1 text-left" style={{ color: '#6B7280' }}>
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={draft.email}
                  onChange={e => setField('email', e.target.value)}
                  className={`${inputBase} ${errors.email ? errStyle : okStyle}`}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              {serverError && (
                <p className="text-xs text-red-500 text-center bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {serverError}
                </p>
              )}

              <div className="flex gap-3 justify-start pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-colors"
                  style={{ background: '#1B3A6B' }}
                >
                  Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
}
