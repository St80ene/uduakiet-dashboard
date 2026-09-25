import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'No AuthContext found. Make sure to wrap your component with AuthProvider.',
    );
  }

  return context;
}
