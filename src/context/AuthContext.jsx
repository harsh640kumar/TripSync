import { createContext, useContext, useEffect, useState } from "react";
import { activeAuth } from "../services/firebase";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from "firebase/auth";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If we're using mock auth, just set loading false
    if (!import.meta.env.VITE_FIREBASE_API_KEY) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(activeAuth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password) => {
    return createUserWithEmailAndPassword(activeAuth, email, password);
  };

  const login = async (email, password) => {
    return signInWithEmailAndPassword(activeAuth, email, password);
  };

  const logout = async () => {
    return firebaseSignOut(activeAuth);
  };

  const value = {
    currentUser,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
