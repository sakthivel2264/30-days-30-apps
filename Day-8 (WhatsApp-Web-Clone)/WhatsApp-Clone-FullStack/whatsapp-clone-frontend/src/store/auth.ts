// store/authStore.ts
import { create } from "zustand";
import { setCookie, getCookie } from "cookies-next";

interface AuthState {
  token: string | null;
  userId: string | null;
  username: string | null;
  setAuth: (data: { token: string; userId: string; username: string }) => void;
  loadAuthFromCookies: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  username: null,

  setAuth: ({ token, userId, username }) => {
    // Set values to Zustand store
    set({ token, userId, username });

    // Store in cookies
    setCookie("token", token);
    setCookie("userId", userId);
    setCookie("username", username);
  },

  loadAuthFromCookies: () => {
    const token = getCookie("token") as string | null;
    const userId = getCookie("userId") as string | null;
    const username = getCookie("username") as string | null;

    if (token && userId && username) {
      set({ token, userId, username });
    }
  },

  clearAuth: () => {
    set({ token: null, userId: null, username: null });

    // Optionally clear cookies
    setCookie("token", "", { maxAge: -1 });
    setCookie("userId", "", { maxAge: -1 });
    setCookie("username", "", { maxAge: -1 });
  },
}));
