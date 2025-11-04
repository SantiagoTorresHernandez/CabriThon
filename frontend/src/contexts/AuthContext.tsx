import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Mock user type for local testing
interface MockUser {
  uid: string;
  email: string;
  displayName: string;
}

interface AuthContextType {
  currentUser: MockUser | null;
  userRole: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Test user credentials
const TEST_USERS = [
  {
    email: 'test@gmail.com',
    password: 'DigitalNest2025',
    role: 'Customer',
    displayName: 'Test User',
  },
  {
    email: 'admin@gmail.com',
    password: 'DigitalNest2025',
    role: 'Admin',
    displayName: 'Admin User',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    const user = TEST_USERS.find(u => u.email === email && u.password === password);
    
    if (user) {
      const mockUser: MockUser = {
        uid: `${user.role.toLowerCase()}-user-123`,
        email: user.email,
        displayName: user.displayName,
      };
      setCurrentUser(mockUser);
      setUserRole(user.role);
      // Store in localStorage for persistence
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      localStorage.setItem('mockUserRole', user.role);
    } else {
      throw new Error('Invalid email or password');
    }
  };


  const logout = async () => {
    setCurrentUser(null);
    setUserRole(null);
    localStorage.removeItem('mockUser');
    localStorage.removeItem('mockUserRole');
  };

  useEffect(() => {
    // Check for persisted user on app load
    const storedUser = localStorage.getItem('mockUser');
    const storedRole = localStorage.getItem('mockUserRole');
    if (storedUser) {
      try {
        const mockUser = JSON.parse(storedUser);
        setCurrentUser(mockUser);
        setUserRole(storedRole || 'Customer');
      } catch (error) {
        localStorage.removeItem('mockUser');
        localStorage.removeItem('mockUserRole');
      }
    }
    setLoading(false);
  }, []);

  const value: AuthContextType = {
    currentUser,
    userRole,
    loading,
    signIn,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

