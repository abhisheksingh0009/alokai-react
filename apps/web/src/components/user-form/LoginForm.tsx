import { useNavigate } from 'react-router-dom';
import { SfButton } from '@storefront-ui/react';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    login('user@alokai.com', '');
    navigate('/account');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-neutral-100 p-8 flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="10" r="5" fill="#1B3A6B"/>
            <path d="M4 26c0-5.523 5.373-10 12-10s12 4.477 12 10" stroke="#1B3A6B" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">Welcome</h1>
          <p className="text-sm text-neutral-500 mt-1">Sign in to your ALOKAI-MART account</p>
        </div>
        <SfButton size="lg" className="w-full" onClick={handleLogin}>
          Login
        </SfButton>
      </div>
    </div>
  );
}
