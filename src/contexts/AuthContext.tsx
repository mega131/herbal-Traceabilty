// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

interface User {
	name: string;
	email: string;
	role: string;
	contactNumber?: string;
	farmLocation?: string;
	crops?: string[];
	// optional id for backend linkage
	id?: string;
	_id?: string;
}

interface AuthContextType {
	user: User | null;
	login: (email: string, password: string) => Promise<boolean>;
	signup: (data: Partial<User> & { password?: string }) => Promise<boolean>;
	logout: () => void;
	isLoading?: boolean;
	lastError?: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [lastError, setLastError] = useState<string | null>(null);
	const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    // Clear any previous errors
    setLastError(null);
    
    // Fixed user credentials
    const FIXED_USERS = {
      'farmer123': { email: 'farmer123', password: 'farmer123', role: 'farmer', name: 'Rajesh Kumar', id: 'FARMER_001' },
      'agent123': { email: 'agent123', password: 'agent123', role: 'agent', name: 'Priya Sharma', id: 'AGENT_001' },
      'lab123': { email: 'lab123', password: 'lab123', role: 'lab', name: 'Dr. Suresh Patel', id: 'LAB_001' },
      'manufacturer123': { email: 'manufacturer123', password: 'manufacturer123', role: 'manufacturer', name: 'Ayurveda Industries Ltd', id: 'MFG_001' },
      'admin123': { email: 'admin123', password: 'admin123', role: 'admin', name: 'System Administrator', id: 'ADMIN_001' }
    };

    const user = FIXED_USERS[email as keyof typeof FIXED_USERS];
    if (!user || user.password !== password) {
      setLastError('Invalid username or password');
      return false;
    }

    const authUser: User = {
      name: user.name,
      email: user.email,
      role: user.role as any,
      id: user.id
    };

    // For farmers, ensure they exist in database
    if (user.role === 'farmer') {
      try {
        const res = await api.getFarmerByEmail(user.email);
        authUser.id = res.farmer._id;
      } catch (error) {
        try {
          const newFarmer = await api.registerFarmer({
            name: user.name,
            email: user.email,
            password: user.password,
            location: "Karnataka, India",
            contact: "9876543210"
          });
          authUser.id = newFarmer.farmer._id;
        } catch (regError) {
          console.error('Failed to register farmer:', regError);
        }
      }
    }

    localStorage.setItem('authUser', JSON.stringify(authUser));
    setUser(authUser);
    return true;
  };

	const signup = async (data: Partial<User> & { password?: string }) => {
		try {
			setIsLoading(true);
			setLastError(null);
			const payload = {
				name: data.name || "",
				email: data.email || "",
				password: data.password || "",
				location: data.farmLocation || "",
				contact: data.contactNumber || "",
			} as any;
			const res = await api.registerFarmer(payload);
			const created = (res as any)?.farmer;
			if (created) {
				// Do not auto-login after signup; let user go to Login page
				return true;
			}
			setLastError("Signup failed");
			return false;
		} catch (e: any) {
			setLastError(typeof e?.message === 'string' ? e.message : 'Signup failed');
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	const logout = () => {
		setUser(null);
		navigate("/login");
	};

  // Load persisted user
  useEffect(() => {
    const saved = localStorage.getItem('authUser');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
  }, []);

	return (
		<AuthContext.Provider value={{ user, login, signup, logout, isLoading, lastError }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) throw new Error("useAuth must be used within AuthProvider");
	return context;
};
