import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import {
  login as loginAction,
  logout as logoutAction,
} from '../modules/auth/store';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, username } = useSelector(
    (state: RootState) => state.auth,
  );

  const login = (name: string) => {
    dispatch(loginAction(name));
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  return {
    isAuthenticated,
    login,
    logout,
    username,
  };
};
