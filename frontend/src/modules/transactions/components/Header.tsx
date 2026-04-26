export const Header = () => {
  return (
    <div className="flex justify-between items-center mb-3 lg:mb-5">
      <h2 className="text-sm font-semibold tracking-wide lg:text-base lg:font-bold">
        Recent Transactions
      </h2>
      <button className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors lg:text-sm">
        See all →
      </button>
    </div>
  );
};
