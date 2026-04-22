import { useEffect, useState } from 'react';
import { SfIconLocationOn, SfIconClose, SfIconCheck } from '@storefront-ui/react';
import {
  fetchAddresses,
  saveAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  type Address,
  type AddressPayload,
} from '../../middleware/api/client';

const EMPTY_FORM: AddressPayload = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'INDIA',
  label: '',
  isDefault: false,
};

interface MyAddressProps {
  onCountChange?: (count: number) => void;
}

export default function MyAddress({ onCountChange }: MyAddressProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState<AddressPayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAddresses().then(a => {
      setAddresses(a);
      onCountChange?.(a.length);
      setLoading(false);
    });
  }, []);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowForm(true);
  }

  function openEdit(addr: Address) {
    setEditing(addr);
    setForm({
      fullName:     addr.fullName,
      phone:        addr.phone,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2 ?? '',
      city:         addr.city,
      state:        addr.state,
      postalCode:   addr.postalCode,
      country:      addr.country,
      label:        addr.label ?? '',
      isDefault:    addr.isDefault,
    });
    setError('');
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload: AddressPayload = {
        ...form,
        addressLine2: form.addressLine2 || undefined,
        label:        form.label || undefined,
      };
      if (editing) {
        const updated = await updateAddress(editing.id, payload);
        setAddresses(prev => prev.map(a => a.id === updated.id ? updated : a));
      } else {
        const created = await saveAddress(payload);
        setAddresses(prev => {
          const rest = created.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : prev;
          const next = [created, ...rest];
          onCountChange?.(next.length);
          return next;
        });
      }
      setShowForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    await deleteAddress(id);
    setAddresses(prev => {
      const remaining = prev.filter(a => a.id !== id);
      if (prev.find(a => a.id === id)?.isDefault && remaining.length > 0) {
        remaining[0] = { ...remaining[0], isDefault: true };
      }
      onCountChange?.(remaining.length);
      return remaining;
    });
  }

  async function handleSetDefault(id: number) {
    const updated = await setDefaultAddress(id);
    setAddresses(prev =>
      prev.map(a => ({ ...a, isDefault: a.id === updated.id }))
    );
  }

  function field(key: keyof AddressPayload, label: string, opts?: { placeholder?: string; type?: string; required?: boolean }) {
    return (
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold" style={{ color: '#374151' }}>
          {label}{opts?.required !== false && <span style={{ color: '#EF4444' }}> *</span>}
        </label>
        <input
          type={opts?.type ?? 'text'}
          placeholder={opts?.placeholder ?? label}
          value={form[key] as string}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          required={opts?.required !== false}
          className="rounded-xl px-3 py-2.5 text-sm outline-none transition-all"
          style={{ border: '1.5px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A' }}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#6366F1', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div>
      {/* Address list */}
      {addresses.length > 0 && !showForm && (
        <div className="flex flex-col gap-3 mb-4">
          {addresses.map(addr => (
            <div key={addr.id} className="rounded-2xl p-4 relative"
              style={{
                border: addr.isDefault ? '2px solid #6366F1' : '1.5px solid #E2E8F0',
                background: addr.isDefault ? '#F5F3FF' : '#F8FAFC',
              }}>
              {addr.isDefault && (
                <span className="absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: 'linear-gradient(135deg,#6366F1,#3B82F6)', color: '#fff' }}>
                  DEFAULT
                </span>
              )}
              {addr.label && (
                <span className="text-[10px] font-bold uppercase tracking-wide mb-1 block" style={{ color: '#94A3B8' }}>{addr.label}</span>
              )}
              <p className="text-sm font-bold" style={{ color: '#0F172A' }}>{addr.fullName}</p>
              <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{addr.phone}</p>
              <p className="text-xs mt-1" style={{ color: '#374151' }}>
                {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
              </p>
              <p className="text-xs" style={{ color: '#374151' }}>
                {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => openEdit(addr)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: '#EEF2FF', color: '#6366F1', border: 'none' }}>
                  Edit
                </button>
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr.id)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    style={{ background: '#F0FDF4', color: '#16A34A', border: 'none' }}>
                    <SfIconCheck style={{ width: 12, height: 12 }} /> Set Default
                  </button>
                )}
                <button onClick={() => handleDelete(addr.id)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ml-auto"
                  style={{ background: '#FEF2F2', color: '#EF4444', border: 'none' }}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {addresses.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: '#EEF2FF' }}>
            <SfIconLocationOn size="lg" style={{ color: '#6366F1' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: '#111827' }}>No address saved yet</h3>
            <p className="text-xs mt-1" style={{ color: '#6B7280' }}>Add a delivery address to continue.</p>
          </div>
        </div>
      )}

      {/* Add address button */}
      {!showForm && (
        <button onClick={openAdd}
          className="w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
          style={{ background: '#EEF2FF', color: '#6366F1', border: '1.5px dashed #A5B4FC' }}>
          + Add {addresses.length > 0 ? 'Another' : 'New'} Address
        </button>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <div className="rounded-2xl p-5" style={{ border: '1.5px solid #E2E8F0', background: '#F8FAFC' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black" style={{ color: '#0F172A' }}>
              {editing ? 'Edit Address' : 'Add New Address'}
            </h3>
            <button onClick={() => setShowForm(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: '#F1F5F9', border: 'none' }}>
              <SfIconClose style={{ width: 14, height: 14, color: '#94A3B8' }} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              {field('fullName', 'Full Name', { placeholder: 'John Doe' })}
              {field('phone', 'Phone', { placeholder: '+1 555 000 0000', type: 'tel' })}
            </div>

            {field('addressLine1', 'Address Line 1', { placeholder: '123 Main Street' })}
            {field('addressLine2', 'Address Line 2', { placeholder: 'Apt, Suite, Floor (optional)', required: false })}

            <div className="grid grid-cols-2 gap-3">
              {field('city', 'City', { placeholder: 'New York' })}
              {field('state', 'State / Province', { placeholder: 'NY' })}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {field('postalCode', 'Postal Code', { placeholder: '10001' })}
              {field('country', 'Country', { placeholder: 'US' })}
            </div>

            {field('label', 'Label', { placeholder: 'Home, Work, Other…', required: false })}

            <label className="flex items-center gap-2 cursor-pointer mt-1">
              <input
                type="checkbox"
                checked={!!form.isDefault}
                onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
                className="rounded"
                style={{ accentColor: '#6366F1' }}
              />
              <span className="text-xs font-semibold" style={{ color: '#374151' }}>Set as default address</span>
            </label>

            {error && (
              <p className="text-xs font-semibold rounded-xl px-3 py-2" style={{ background: '#FEF2F2', color: '#EF4444' }}>
                {error}
              </p>
            )}

            <div className="flex gap-3 mt-1">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{ background: '#F1F5F9', color: '#64748B', border: 'none' }}>
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-black transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(90deg,#6366F1,#3B82F6)', color: '#fff', border: 'none' }}>
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
