import { Mode } from './types';

export const headings: Record<Mode, { title: string; subtitle: string }> = {
  login: { title: 'Welcome Back', subtitle: 'Sign in to your wallet' },
  signup: { title: 'Create Account', subtitle: 'Set up your new wallet' },
};
