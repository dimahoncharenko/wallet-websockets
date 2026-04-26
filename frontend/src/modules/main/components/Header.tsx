import { useMemo } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useNotifications } from '@hooks/useNotifications';
import { useModal } from '@hooks/useModal';

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function LogoutButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center hover:bg-rose-500/20 text-rose-400 transition-colors"
      aria-label="Logout"
      title="Logout"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    </button>
  );
}

export const Header = () => {
  const { logout, username } = useAuth();
  const { unreadCount } = useNotifications();
  const { setModal } = useModal();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 18) return 'Good afternoon';
    if (hour >= 18 && hour < 23) return 'Good evening';
    return 'Good night';
  }, []);

  const bellButton = (
    <button
      className="w-10 h-10 relative rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg hover:bg-white/10 transition-colors"
      aria-label="Notifications"
      onClick={() => setModal('notificationsPanel', true)}
    >
      <span role="img" aria-label="Notifications">🔔</span>
      {unreadCount > 0 && (
        <span className="absolute -top-1 text-[10px] -right-2 size-5 flex items-center justify-center rounded-full bg-rose-500">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );

  return (
    <div className="w-full max-w-sm lg:max-w-none flex justify-between items-center">
      {/* Mobile greeting */}
      <div className="lg:hidden">
        <p className="text-xs text-white/40 uppercase tracking-widest font-medium">{greeting}</p>
        <h1 className="text-xl font-bold tracking-wide mt-0.5">{username || 'Guest'} ✦</h1>
      </div>

      {/* Desktop title */}
      <div className="hidden lg:block">
        <p className="text-xs text-white/40 uppercase tracking-widest font-medium">{greeting}</p>
        <h1 className="text-[28px] font-bold tracking-tight mt-0.5">{username || 'Guest'}'s Overview</h1>
      </div>

      {/* Mobile actions */}
      <div className="flex gap-2 lg:hidden">
        {bellButton}
        <LogoutButton onClick={logout} />
      </div>

      {/* Desktop actions */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="relative flex items-center text-white/30">
          <span className="absolute left-3.5 pointer-events-none">
            <SearchIcon />
          </span>
          <input
            placeholder="Search transactions..."
            className="bg-white/[0.05] border border-white/10 rounded-full pl-10 pr-5 py-2.5 text-sm text-white/70 placeholder-white/30 focus:outline-none focus:border-white/20 w-60 transition-colors"
          />
        </div>
        {bellButton}
        <LogoutButton onClick={logout} />
      </div>
    </div>
  );
};
