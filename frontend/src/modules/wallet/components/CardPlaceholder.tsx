export const CardPlaceholder = () => {
  return (
    <div
      className="w-full rounded-2xl bg-white/5 border border-white/10 animate-pulse relative overflow-hidden shadow-2xl"
      style={{ aspectRatio: '1.586' }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

      <div className="absolute top-6 left-6 w-20 h-3 bg-white/10 rounded-full" />
      <div className="absolute top-6 right-6 w-10 h-7 bg-white/10 rounded-md" />

      <div className="absolute flex flex-col gap-2 top-1/2 -translate-y-1/2 left-6">
        <div className="w-16 h-2.5 bg-white/10 rounded-full" />
        <div className="w-40 h-6 bg-white/10 rounded-full mt-1" />
      </div>
      <div className="absolute bottom-12 left-6 flex gap-4">
        <div className="w-12 h-3 bg-white/10 rounded-full" />
        <div className="w-12 h-3 bg-white/10 rounded-full" />
        <div className="w-12 h-3 bg-white/10 rounded-full" />
        <div className="w-12 h-3 bg-white/10 rounded-full" />
      </div>
      <div className="absolute bottom-6 left-6 w-24 h-3 bg-white/10 rounded-full" />
      <div className="absolute bottom-6 right-6 w-16 h-3 bg-white/10 rounded-full" />
    </div>
  );
};
