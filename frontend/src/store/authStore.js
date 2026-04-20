import { create } from "zustand";

const initialUser = (() => {
  try {
    const raw = localStorage.getItem("auth_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

export const useAuthStore = create((set) => ({
  user: initialUser,
  token: null,
  isAuthenticated: Boolean(initialUser),
  setAuth: (user) => {
    localStorage.setItem("auth_user", JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },
  clearAuth: () => {
    localStorage.removeItem("auth_user");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
