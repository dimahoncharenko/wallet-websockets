import { useSelector, useDispatch } from 'react-redux';
import { setActiveNav as setActiveNavAction } from '@modules/app/store';
import type { RootState, AppDispatch } from '../modules/main/store';

export const useNavigation = () => {
  const activeNav = useSelector((state: RootState) => state.app.activeNav);
  const dispatch = useDispatch<AppDispatch>();

  return {
    activeNav,
    setActiveNav: (value: string) => dispatch(setActiveNavAction(value)),
  };
};
