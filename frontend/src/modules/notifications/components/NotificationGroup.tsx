import { AppNotification } from 'types';
import { ShieldIcon } from './ShieldIcon';
import { NOTIFICATION_CONFIG } from '../const';
import { LockIcon } from './LockIcon';
import { formatSectionDate, formatTime } from '../helpers';

type Props = {
  dismiss: (id: string) => void;
  group: {
    label: string;
    items: AppNotification[];
  };
};

export const NotificationGroup = ({ dismiss, group }: Props) => {
  return (
    <>
      {group.items.map((notification, index) => (
        <div key={notification.id}>
          <div className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors">
            <NotificationIcon type={notification.type} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold leading-snug">
                {notification.title}
              </p>
              <p className="text-[11px] text-white/45 mt-0.5 leading-snug truncate">
                {notification.description}
              </p>
            </div>
            <div className="flex flex-col items-end flex-shrink-0 gap-1.5 ml-2">
              <span className="text-[10px] text-white/30 whitespace-nowrap">
                {group.label === 'TODAY'
                  ? formatTime(notification.timestamp)
                  : formatSectionDate(notification.timestamp)}
              </span>
              <button
                onClick={() => dismiss(notification.id)}
                className="text-white/30 hover:text-white/70 transition-colors leading-none"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          </div>
          {index < group.items.length - 1 && (
            <div className="border-t border-white/[0.04] mx-4" />
          )}
        </div>
      ))}
    </>
  );
};

const NotificationIcon = ({ type }: { type: AppNotification['type'] }) => {
  const config = NOTIFICATION_CONFIG[type];

  if (type === 'signin') {
    return (
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg} ${config.color}`}
      >
        <LockIcon />
      </div>
    );
  }

  if (type === 'security') {
    return (
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg} ${config.color}`}
      >
        <ShieldIcon />
      </div>
    );
  }

  return (
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base ${config.bg} ${config.color}`}
    >
      <span
        style={{
          display: 'inline-block',
          transform: type === 'money_sent' ? 'rotate(180deg)' : undefined,
        }}
      >
        ↑
      </span>
    </div>
  );
};
