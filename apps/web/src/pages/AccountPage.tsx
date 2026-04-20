import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { SfIconPerson, SfIconLocationOn, SfIconLogout } from '@storefront-ui/react';
import { useAuth } from '../context/AuthContext';
import MyAccount from '../components/user-form/MyAccount';
import MyAddress from '../components/user-form/MyAddress';

const TABS = [
  { id: 'My Account', icon: <SfIconPerson /> },
  { id: 'My Address', icon: <SfIconLocationOn /> },
] as const;
type TabId = typeof TABS[number]['id'];

export default function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('My Account');

  if (!user) {
    navigate('/login');
    return null;
  }

  const avatarLetter = (user.firstName || user.name || user.email)[0].toUpperCase();

  return (
    <div className="min-h-[70vh] py-8 px-4" style={{ background: '#F4F6F9' }}>
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Profile banner */}
        <div
          className="relative rounded-2xl overflow-hidden shadow-lg"
          style={{ background: 'linear-gradient(120deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)' }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-indigo-500/10 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-indigo-400/10 pointer-events-none" />

          <div className="relative px-5 sm:px-8 py-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              {/* Avatar */}
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-black uppercase shadow-lg"
                style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}
              >
                {avatarLetter}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300 mb-0.5">My Account</p>
                <h1 className="text-lg sm:text-2xl font-extrabold text-white leading-tight truncate">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.name ?? user.email}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5 truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={() => { logout(); navigate('/'); }}
              className="shrink-0 flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white transition-all hover:bg-white/15"
              style={{ border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <SfIconLogout size="sm" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col sm:flex-row gap-5 items-start">

          {/* Sidebar — horizontal on mobile, vertical on sm+ */}
          <div className="w-full sm:w-52 sm:shrink-0 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden flex sm:flex-col flex-row">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={classNames(
                    'flex-1 sm:flex-none flex items-center justify-center sm:justify-start gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 text-sm font-semibold transition-all relative',
                    active
                      ? 'text-indigo-700 bg-indigo-50'
                      : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
                  )}
                >
                  {/* Active indicator — bottom on mobile, left on desktop */}
                  {active && (
                    <>
                      <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-t-full bg-indigo-600 sm:hidden" />
                      <span className="hidden sm:block absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-indigo-600" />
                    </>
                  )}
                  <span className={classNames('transition-colors', active ? 'text-indigo-600' : 'text-neutral-400')}>
                    {tab.icon}
                  </span>
                  <span className="hidden sm:inline">{tab.id}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 w-full bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="px-5 sm:px-8 py-4 sm:py-5 border-b border-neutral-100 flex items-center gap-3">
              <span className="text-indigo-600">
                {TABS.find(t => t.id === activeTab)?.icon}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-neutral-900">{activeTab}</h2>
            </div>
            <div className="px-5 sm:px-8 py-5 sm:py-6">
              {activeTab === 'My Account' && <MyAccount />}
              {activeTab === 'My Address' && <MyAddress />}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
