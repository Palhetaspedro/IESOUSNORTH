import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("sigma_user") || "null"); }
    catch { return null; }
  });

  const login = (email, password) => {
    // Mock: aceita qualquer email/senha por enquanto
    const userData = { email, name: email.split("@")[0], role: "user" };
    setUser(userData);
    localStorage.setItem("sigma_user", JSON.stringify(userData));
    return true;
  };

  const register = (data) => {
    const userData = { ...data, role: "user" };
    setUser(userData);
    localStorage.setItem("sigma_user", JSON.stringify(userData));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sigma_user");
  };

  const updateProfile = (data) => {
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem("sigma_user", JSON.stringify(updated));
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
