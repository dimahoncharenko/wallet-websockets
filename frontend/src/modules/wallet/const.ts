import { CardColor, ColorOption } from 'types';

export interface CardTheme {
  a: string;
  b: string;
  c: string;
  glow: string;
  dot: string;
}

export const CARD_THEMES: Record<CardColor, CardTheme> = {
  violet:   { a: '#c084fc', b: '#7c3aed', c: '#3b0764', glow: 'rgba(167,139,250,0.45)', dot: '#a78bfa' },
  emerald:  { a: '#00d4aa', b: '#0099cc', c: '#005fa3', glow: 'rgba(0,212,160,0.5)',    dot: '#00d4aa' },
  rose:     { a: '#fb7185', b: '#e11d48', c: '#4c0519', glow: 'rgba(251,113,133,0.45)', dot: '#fb7185' },
  midnight: { a: '#94a3b8', b: '#475569', c: '#1e293b', glow: 'rgba(148,163,184,0.35)', dot: '#94a3b8' },
};

export const COLOR_OPTIONS: ColorOption[] = [
  { color: 'violet',   bg: 'bg-violet-500',  ring: 'ring-violet-400' },
  { color: 'emerald',  bg: 'bg-teal-400',    ring: 'ring-teal-400'   },
  { color: 'rose',     bg: 'bg-rose-500',    ring: 'ring-rose-400'   },
  { color: 'midnight', bg: 'bg-slate-500',   ring: 'ring-slate-400'  },
];
