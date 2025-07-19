import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: any; // Replace 'any' with a proper User interface later
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Updated Login Function ---
  const login = async (email: string, pass: string) => {
    setLoading(true);
    setError(null);


    try {
      // Use URLSearchParams for application/x-www-form-urlencoded
      const formData = new URLSearchParams();
      formData.append('username', email); // FastAPI's OAuth2PasswordRequestForm expects 'username'
      formData.append('password', pass);

      // Use environment variable for base URL and correct path
      // const loginUrl = `https://successful-balance-production.up.railway.app/api/v1/auth/login`;
      const loginUrl = `${import.meta.env.VITE_API_URL}/api/v1/auth/login`;

      const loginResponse = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!loginResponse.ok) {
        let errorDetail = 'Login failed. Please check credentials.';
        try {
          const errorData = await loginResponse.json();
          errorDetail = errorData.detail || errorDetail;
        } catch (e) {
          // Ignore JSON parsing error, use default detail
        }
        throw new Error(errorDetail);
      }

      const tokenData = await loginResponse.json();
      const accessToken = tokenData.access_token;
      // const refreshToken = tokenData.refresh_token; // Store securely if needed

      if (!accessToken) {
        throw new Error('Access token not received.');
      }


      localStorage.setItem('authToken', accessToken);
      setToken(accessToken);

      // Now fetch user details using the new token
      // Use environment variable for base URL
      // const meUrl = `https://successful-balance-production.up.railway.app/api/v1/auth/me`;
      const meUrl = `${import.meta.env.VITE_API_URL}/api/v1/auth/me`;

      const meResponse = await fetch(meUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!meResponse.ok) {
         // If /me fails even after successful login, something is wrong (maybe token scope?)
         // Log out the user to be safe
         console.error('[AuthProvider] Failed to fetch user details after login.');
         logout(); // Clear potentially inconsistent state
         throw new Error('Could not fetch user details after login.');
      }

      const userData = await meResponse.json();
      
      // Assuming userData includes necessary fields like id, email, branch
      // Update User Interface if needed later: interface User { id: number; email: string; branch: { id: number; slug: string } | null; /* ... */}
      setUser(userData); 
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData)); // Store user details too



    } catch (err: any) {
      console.error('[AuthProvider] Login process failed:', err);
      setError(err.message || 'Login failed. Please try again.');
      // Ensure clean state on error
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // throw err; // Optional: Re-throw if the calling component needs to know
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    // TODO: Optionally call a backend logout endpoint if needed (e.g., to invalidate refresh tokens)
  };

  // --- Tek bir useEffect içinde tüm auth kontrolü ---
  useEffect(() => {
    const checkAuth = async () => {
      // Önce senkron olarak mevcut yolun public olup olmadığını kontrol et
      const path = window.location.pathname;
      const isPublicRoute = path.startsWith('/view/');
      

      
      // Eğer public route ise, token kontrolünü tamamen atla
      if (isPublicRoute) {
        setLoading(false);
        return; // Return ile fonksiyondan çık, token kontrolü hiç yapılmayacak
      }
      
      // Buradan sonraki kod sadece korumalı rotalar için çalışacak
    const storedToken = localStorage.getItem('authToken');
    
      if (storedToken) {
        try {
          // const meUrl = `https://successful-balance-production.up.railway.app/api/v1/auth/me`;
          const meUrl = `${import.meta.env.VITE_API_URL}/api/v1/auth/me`;
          const meResponse = await fetch(meUrl, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });

          if (meResponse.ok) {
            const userData = await meResponse.json();
         setToken(storedToken);
            setUser(userData);
         setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(userData));
                      } else {
              logout();
          }
        } catch (error) {
          console.error('[AuthProvider] Error validating token:', error);
          logout();
      }
          } else {
        logout(); 
    }
      
      setLoading(false);
    };

    checkAuth();
  }, []); // Sadece ilk yüklemede bir kez çalışır

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      token, 
      login, 
      logout, 
      loading, 
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 