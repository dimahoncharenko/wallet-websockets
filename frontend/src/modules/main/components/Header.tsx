import { useMemo, useEffect, useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useWebsocket } from '@hooks/useWebsocket';
import { CardData } from 'types';
import toast from 'react-hot-toast';

export const Header = ({ card }: { card: CardData | null }) => {
  const { logout, username } = useAuth();
  const { socket } = useWebsocket();
  const [unawareTransfers, setUnawareTransfers] = useState(0);

  useEffect(() => {
    if (!socket || !card?.pan) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.event === 'change-balance') {
        const msg = data.message || 'Balance changed.';
        if (msg.toLowerCase().includes('fail')) {
          toast.error(msg);
        } else {
          toast.success(msg);
        }
        setUnawareTransfers((prev) => prev + 1);
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, card?.pan]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 18) return 'Good afternoon';
    if (hour >= 18 && hour < 23) return 'Good evening';
    return 'Good night';
  }, []);

  return (
    <div className="w-full max-w-sm flex justify-between items-center">
      <div>
        <p className="text-xs text-white/40 uppercase tracking-widest font-medium">
          {greeting}
        </p>
        <h1 className="text-xl font-bold tracking-wide mt-0.5">
          {username || 'Guest'} ✦
        </h1>
      </div>
      <div className="flex gap-2">
        <button
          className="w-10 h-10 relative rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg hover:bg-white/10 transition-colors"
          aria-label="Notifications"
          onClick={() => setUnawareTransfers(0)}
        >
          <span role="img" aria-label="Notifications">
            🔔
          </span>
          {unawareTransfers > 0 && (
            <span className="absolute -top-1 text-[10px] -right-2 size-5 flex items-center justify-center rounded-full bg-rose-500">
              {unawareTransfers > 99 ? '99+' : unawareTransfers}
            </span>
          )}
        </button>
        <button
          onClick={logout}
          className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-lg hover:bg-rose-500/20 text-rose-400 transition-colors"
          aria-label="Logout"
          title="Logout"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  );
};
