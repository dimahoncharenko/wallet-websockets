import { useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export const LoginForm = () => {
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
      login(username.trim());
      navigate('/', { replace: true });
    }, 600);
  };

  return (
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
  );
};
