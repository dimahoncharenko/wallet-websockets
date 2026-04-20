import { useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setLocalUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    username: '',
    password: '',
  });

  const handleChangeError = (name: keyof typeof errors, value: string) => {
    setErrors((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (username.trim().length < 3) {
      handleChangeError('username', 'Username must be at least 3 characters');
      return;
    }

    if (password.length < 8) {
      handleChangeError('password', 'Password must be at least 8 characters');
      return;
    }

    setTimeout(() => {
      console.log('Login attempt');
      login(username.trim());
      navigate('/', { replace: true });
    }, 600);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-sm">
        <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
              <span className="text-white text-xl font-bold">✦</span>
            </div>
            <h1 className="text-2xl font-bold tracking-wide">Welcome Back</h1>
            <p className="text-sm text-white/40 mt-1">
              Enter your standard username
            </p>
          </div>

          <form className="flex flex-col gap-4">
            <div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={username}
                onChange={(e) => {
                  setLocalUsername(e.target.value);
                  handleChangeError(e.target.name as keyof typeof errors, '');
                }}
                className={`w-full bg-white/[0.05] border ${
                  errors.username ? 'border-rose-500/50' : 'border-white/10'
                } rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all`}
              />
              {errors.username && (
                <p className="text-rose-400 text-xs mt-2 ml-1 animate-pulse">
                  {errors.username}
                </p>
              )}
            </div>

            <div className="relative">
              <input
                type="password"
                name="password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  handleChangeError(e.target.name as keyof typeof errors, '');
                }}
                placeholder="Password (optional for demo)"
                className={`w-full bg-white/[0.05] border ${
                  errors.password ? 'border-rose-500/50' : 'border-white/10'
                } rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all`}
              />
              {errors.password && (
                <p className="text-rose-400 absolute text-xs mt-2 ml-1 animate-pulse">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="mt-4 w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative">Access Wallet</span>
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/30 mt-6 tracking-widest uppercase">
          Secure Encrypted Connection
        </p>
      </div>
    </main>
  );
}
