import { useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Mode } from '../types';

interface Props {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export const AuthenticationForm = ({ mode, onModeChange }: Props) => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error: err } = await login(email, password);
        if (err) {
          setError(err.message);
          return;
        }
      } else {
        const { error: err } = await signup(
          email,
          password,
          displayName.trim(),
        );
        if (err) {
          setError(err.message);
          return;
        }
      }
      navigate('/', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  let heading = mode === 'login' ? 'Access Wallet' : 'Create Account';
  if (loading) heading = '...';

  const renderHeader = () => {
    return (['login', 'signup'] as Mode[]).map((m) => (
      <button
        key={m}
        type="button"
        onClick={() => {
          onModeChange(m);
          setError('');
        }}
        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
          mode === m
            ? 'bg-white/10 text-white'
            : 'text-white/40 hover:text-white/60'
        }`}
      >
        {m === 'login' ? 'Sign In' : 'Sign Up'}
      </button>
    ));
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex bg-white/[0.05] border border-white/10 rounded-xl p-1 gap-1">
        {renderHeader()}
      </div>

      <div className="flex flex-col gap-3">
        {mode === 'signup' && (
          <input
            type="text"
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={inputClass(false)}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          className={inputClass(!!error)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          className={inputClass(!!error)}
        />
      </div>

      {error && <p className="text-rose-400 text-xs ml-1 -mt-2">{error}</p>}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:scale-100 transition-all relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        <span className="relative">{heading}</span>
      </button>
    </div>
  );
};

const inputClass = (hasError: boolean) =>
  `w-full bg-white/[0.05] border ${
    hasError ? 'border-rose-500/50' : 'border-white/10'
  } rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all`;
