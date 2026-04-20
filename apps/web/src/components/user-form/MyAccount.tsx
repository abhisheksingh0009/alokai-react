import { useAuth } from '../../context/AuthContext';

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
        {label}
      </span>
      <div
        className="px-4 py-2.5 rounded-xl text-sm font-medium"
        style={{ background: '#F8F9FB', color: value ? '#111827' : '#9CA3AF', border: '1px solid #E2E8F0' }}
      >
        {value || '—'}
      </div>
    </div>
  );
}

export default function MyAccount() {
  const { user } = useAuth();
  if (!user) return null;

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.name || '—';

  return (
    <div className="flex flex-col gap-6">
      {/* Personal info */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#1B3A6B' }}>
          Personal Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {user.title && <Field label="Title" value={user.title} />}
          <Field label="First Name" value={user.firstName} />
          <Field label="Last Name" value={user.lastName} />
          <Field label="Full Name" value={fullName} />
        </div>
      </div>

      <div style={{ borderTop: '1px solid #E2E8F0' }} />

      {/* Contact info */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#1B3A6B' }}>
          Contact Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email Address" value={user.email} />
          <Field label="Phone Number" value={user.phone} />
        </div>
      </div>

      <div style={{ borderTop: '1px solid #E2E8F0' }} />

      {/* Account info */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4" style={{ color: '#1B3A6B' }}>
          Account
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Account ID" value={`#${user.id}`} />
        </div>
      </div>
    </div>
  );
}
