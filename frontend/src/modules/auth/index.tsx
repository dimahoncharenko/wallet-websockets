import { LoginForm } from './components/LoginForm';

export default function Auth() {
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

          <LoginForm />
        </div>

        <p className="text-center text-xs text-white/30 mt-6 tracking-widest uppercase">
          Secure Encrypted Connection
        </p>
      </div>
    </main>
  );
}
