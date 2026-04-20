import { STATS } from '../const';

export const Stats = () => {
  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
      {STATS.map(({ label, value, change, icon, accent, bg }) => (
        <div
          key={label}
          className="rounded-2xl bg-white/5 border border-white/[0.07] p-4 flex flex-col gap-1"
        >
          <div
            className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}
          >
            <span className={`text-sm font-bold ${accent}`}>{icon}</span>
          </div>
          <p className="text-[13px] font-bold mt-1">{value}</p>
          <p className="text-[10px] text-white/40 uppercase tracking-wider">
            {label}
          </p>
          <p className={`text-[11px] font-semibold ${accent}`}>{change}</p>
        </div>
      ))}
    </div>
  );
};
