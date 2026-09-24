import { createContext } from 'react';
import type { IUser } from '@/interfaces/user.interface';

export interface AuthContextValue {
  user: IUser | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<IUser>;
  logout: () => Promise<void>;
  isInitializing: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
