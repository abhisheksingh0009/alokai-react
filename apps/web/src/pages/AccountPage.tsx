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

  return (
    <div className="min-h-[70vh] bg-neutral-100 py-10 px-4">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Profile banner */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl" style={{ background: 'linear-gradient(120deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)' }}>
          {/* decorative circles */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-indigo-500/10"/>
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-indigo-400/10"/>

          <div className="relative px-8 py-7 flex items-center justify-between">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black uppercase shadow-lg"
                style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
                {user.name[0]}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300 mb-1">My Account</p>
                <h1 className="text-2xl font-extrabold text-white leading-tight">{user.name}</h1>
                <p className="text-sm text-slate-400 mt-0.5">{user.email}</p>
              </div>
            </div>

            <button
              onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:bg-white/15"
              style={{ border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <SfIconLogout size="sm" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Body: sidebar + content */}
        <div className="flex gap-5 items-start">

          {/* Sidebar */}
          <div className="w-52 shrink-0 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            {/* <p className="px-4 pt-4 pb-2 text-xs font-bold uppercase tracking-widest text-neutral-400">Navigation</p> */}
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={classNames(
                    'w-full flex items-center gap-3 px-4 py-4 text-sm font-semibold text-left transition-all relative',
                    active
                      ? 'text-indigo-700 bg-indigo-50'
                      : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
                  )}
                >
                  {/* Active indicator bar */}
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-indigo-600"/>
                  )}
                  <span className={classNames('transition-colors', active ? 'text-indigo-600' : 'text-neutral-400')}>
                    {tab.icon}
                  </span>
                  {tab.id}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
            {/* Content header */}
            <div className="px-8 py-5 border-b border-neutral-100 flex items-center gap-3">
              <span className="text-indigo-600">
                {TABS.find(t => t.id === activeTab)?.icon}
              </span>
              <h2 className="text-lg font-bold text-neutral-900">{activeTab}</h2>
            </div>
            <div className="px-8 py-6">
              {activeTab === 'My Account' && <MyAccount />}
              {activeTab === 'My Address' && <MyAddress />}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
