type Props = {
  unreadCount: number;
  markAllRead: () => void;
};

export const Header = ({ unreadCount, markAllRead }: Props) => {
  return (
    <>
      <div className="flex justify-between items-center px-5 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-emerald-500 text-white font-semibold leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>
      <div className="border-t border-white/[0.06]" />
    </>
  );
};
