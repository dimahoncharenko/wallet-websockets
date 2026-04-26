import { CardColor, ColorOption } from 'types';

export const GRADIENTS: Record<CardColor, string> = {
  violet: 'from-violet-600 via-purple-600 to-indigo-700',
  emerald: 'from-emerald-500 via-teal-500 to-cyan-600',
  rose: 'from-rose-500 via-pink-500 to-fuchsia-600',
  midnight: 'from-slate-600 via-slate-800 to-slate-950',
};

export const COLOR_OPTIONS: ColorOption[] = [
  { color: 'violet', bg: 'bg-violet-500', ring: 'ring-violet-400' },
  { color: 'emerald', bg: 'bg-emerald-500', ring: 'ring-emerald-400' },
  { color: 'rose', bg: 'bg-rose-500', ring: 'ring-rose-400' },
  { color: 'midnight', bg: 'bg-slate-600', ring: 'ring-slate-400' },
];
