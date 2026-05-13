
import React, { createContext, useContext } from 'react';

interface UserProfile {
  uid: string;
  email: string;
  role: 'user' | 'admin';
  isAdmin?: boolean;
}

interface AuthContextType {
  user: any; // Mocked user object
  profile: UserProfile | null;
  loading: boolean;
}

const mockUser = {
  uid: 'mock-bineesh-uid',
  email: 'bineesh.m@gmail.com',
  displayName: 'Bineesh M',
  photoURL: '',
};

const mockProfile: UserProfile = {
  uid: 'mock-bineesh-uid',
  email: 'bineesh.m@gmail.com',
  role: 'admin',
  isAdmin: true,
};

const AuthContext = createContext<AuthContextType>({ user: mockUser, profile: mockProfile, loading: false });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthContext.Provider value={{ user: mockUser, profile: mockProfile, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
