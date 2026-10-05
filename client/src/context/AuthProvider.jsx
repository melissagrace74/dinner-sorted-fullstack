import { useEffect, useState } from "react";

import AuthContext from "./AuthContext";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  signup as signupRequest,
} from "../services/backendApi";


function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkCurrentUser() {
      try {
        const data = await getCurrentUser();
        setUser(data.user);
      } catch (error) {
        console.error("Unable to check current user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkCurrentUser();
  }, []);

  async function signup(username, password) {
    const data = await signupRequest(username, password);
    setUser(data.user);
    return data.user;
  }

  async function login(username, password) {
    const data = await loginRequest(username, password);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await logoutRequest();
    setUser(null);
  }

  const value = {
    user,
    isLoading,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


export default AuthProvider;